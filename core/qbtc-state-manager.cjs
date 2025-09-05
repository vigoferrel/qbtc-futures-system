/**
 * QBTC Quantum State Manager
 * Gestión centralizada de estado para 151 componentes
 * Sincronización real-time y persistencia
 */

const EventEmitter = require('events');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

class QBTCStateManager extends EventEmitter {
    constructor(messageBus, config = {}) {
        super();

        this.messageBus = messageBus;
        this.config = {
            persistencePath: config.persistencePath || './data/state',
            snapshotInterval: config.snapshotInterval || 300000, // 5 minutes
            maxHistorySize: config.maxHistorySize || 1000,
            compressionEnabled: config.compressionEnabled || false,
            ...config
        };

        // Estado central
        this.globalState = new Map();
        this.componentStates = new Map();
        this.stateHistory = new Map();

        // Locks para concurrencia
        this.stateLocks = new Map();

        // Métricas
        this.metrics = {
            stateUpdates: 0,
            conflictsResolved: 0,
            snapshotsTaken: 0,
            queriesProcessed: 0
        };

        this.initialize();
    }

    async initialize() {
        console.log('🔄 Inicializando State Manager...');

        // Crear directorio de persistencia
        await this.ensurePersistenceDirectory();

        // Cargar estado desde disco
        await this.loadPersistedState();

        // Configurar manejadores de eventos
        this.setupEventHandlers();

        // Iniciar snapshots automáticos
        this.startSnapshotInterval();

        console.log('✅ State Manager inicializado');
        this.emit('state-manager-ready');
    }

    async ensurePersistenceDirectory() {
        try {
            await fs.mkdir(this.config.persistencePath, { recursive: true });
        } catch (error) {
            console.warn('Error creando directorio de persistencia:', error);
        }
    }

    setupEventHandlers() {
        // Escuchar cambios de estado desde componentes
        this.messageBus.on('state-update', this.handleStateUpdate.bind(this));
        this.messageBus.on('component-registered', this.handleComponentRegistered.bind(this));
        this.messageBus.on('component-unregistered', this.handleComponentUnregistered.bind(this));
    }

    // ========== GESTIÓN DE ESTADO ==========

    async updateComponentState(componentId, newState, options = {}) {
        const lockKey = `state-${componentId}`;

        // Adquirir lock para evitar race conditions
        await this.acquireLock(lockKey);

        try {
            const currentState = this.componentStates.get(componentId) || {};
            const previousState = { ...currentState };

            // Merge del nuevo estado
            const mergedState = this.mergeStates(currentState, newState);

            // Validar estado
            await this.validateState(componentId, mergedState);

            // Actualizar estado
            this.componentStates.set(componentId, mergedState);

            // Actualizar estado global si es necesario
            if (options.global) {
                this.updateGlobalState(componentId, mergedState);
            }

            // Registrar en historial
            this.recordStateChange(componentId, previousState, mergedState, options);

            // Notificar cambio
            this.emit('state-changed', {
                componentId,
                previousState,
                newState: mergedState,
                timestamp: Date.now()
            });

            // Broadcast a componentes suscriptos
            await this.notifyStateSubscribers(componentId, mergedState, options);

            this.metrics.stateUpdates++;

            return { success: true, state: mergedState };

        } catch (error) {
            console.error(`Error updating state for ${componentId}:`, error);
            this.metrics.conflictsResolved++;
            throw error;
        } finally {
            this.releaseLock(lockKey);
        }
    }

    async getComponentState(componentId, options = {}) {
        const state = this.componentStates.get(componentId);

        if (!state && options.createIfNotExists) {
            const defaultState = this.getDefaultState(componentId);
            await this.updateComponentState(componentId, defaultState);
            return defaultState;
        }

        this.metrics.queriesProcessed++;
        return state;
    }

    async getGlobalState() {
        return Object.fromEntries(this.globalState);
    }

    async queryState(query) {
        const results = {};

        if (query.componentId) {
            results[query.componentId] = await this.getComponentState(query.componentId);
        } else if (query.componentType) {
            const components = this.messageBus.getAllComponents();
            for (const component of components) {
                if (component.type === query.componentType) {
                    results[component.id] = await this.getComponentState(component.id);
                }
            }
        } else if (query.all) {
            for (const [componentId, state] of this.componentStates) {
                results[componentId] = state;
            }
        }

        return results;
    }

    // ========== SINCRONIZACIÓN ==========

    async synchronizeStates(targetComponents = null) {
        const components = targetComponents || this.messageBus.getAllComponents();
        const syncResults = [];

        for (const component of components) {
            try {
                const state = await this.getComponentState(component.id);
                if (state) {
                    await this.messageBus.sendMessage(component.id, {
                        type: 'state-sync',
                        state: state,
                        timestamp: Date.now()
                    });
                    syncResults.push({ componentId: component.id, status: 'synced' });
                }
            } catch (error) {
                syncResults.push({ componentId: component.id, status: 'error', error: error.message });
            }
        }

        return syncResults;
    }

    async broadcastStateUpdate(componentId, state, options = {}) {
        const message = {
            type: 'state-broadcast',
            componentId,
            state,
            timestamp: Date.now(),
            source: 'state-manager'
        };

        return await this.messageBus.broadcastMessage(message, options.filter);
    }

    // ========== PERSISTENCIA ==========

    async saveStateSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            globalState: Object.fromEntries(this.globalState),
            componentStates: Object.fromEntries(this.componentStates),
            metrics: this.metrics
        };

        const filename = `state-snapshot-${snapshot.timestamp}.json`;
        const filepath = path.join(this.config.persistencePath, filename);

        try {
            await fs.writeFile(filepath, JSON.stringify(snapshot, null, 2));
            this.metrics.snapshotsTaken++;

            // Limpiar snapshots antiguos
            await this.cleanupOldSnapshots();

            console.log(`💾 State snapshot saved: ${filename}`);
        } catch (error) {
            console.error('Error saving state snapshot:', error);
        }
    }

    async loadPersistedState() {
        try {
            const files = await fs.readdir(this.config.persistencePath);
            const snapshots = files
                .filter(file => file.startsWith('state-snapshot-'))
                .sort()
                .reverse();

            if (snapshots.length > 0) {
                const latestSnapshot = snapshots[0];
                const filepath = path.join(this.config.persistencePath, latestSnapshot);

                const data = await fs.readFile(filepath, 'utf8');
                const snapshot = JSON.parse(data);

                // Restaurar estado
                this.globalState = new Map(Object.entries(snapshot.globalState || {}));
                this.componentStates = new Map(Object.entries(snapshot.componentStates || {}));

                console.log(`📂 State loaded from snapshot: ${latestSnapshot}`);
            }
        } catch (error) {
            console.warn('Error loading persisted state:', error);
        }
    }

    async cleanupOldSnapshots() {
        try {
            const files = await fs.readdir(this.config.persistencePath);
            const snapshots = files
                .filter(file => file.startsWith('state-snapshot-'))
                .sort()
                .reverse();

            if (snapshots.length > 10) { // Mantener solo los últimos 10
                const toDelete = snapshots.slice(10);
                for (const file of toDelete) {
                    await fs.unlink(path.join(this.config.persistencePath, file));
                }
            }
        } catch (error) {
            console.warn('Error cleaning up old snapshots:', error);
        }
    }

    // ========== UTILIDADES ==========

    mergeStates(currentState, newState) {
        // Deep merge strategy
        return this.deepMerge(currentState, newState);
    }

    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    async validateState(componentId, state) {
        // Validaciones básicas
        if (typeof state !== 'object') {
            throw new Error('State must be an object');
        }

        // Validaciones específicas por componente
        const component = this.messageBus.getComponent(componentId);
        if (component && component.metadata?.stateSchema) {
            await this.validateAgainstSchema(state, component.metadata.stateSchema);
        }
    }

    async validateAgainstSchema(state, schema) {
        // Implementar validación de esquema básica
        for (const [key, rules] of Object.entries(schema)) {
            if (rules.required && !(key in state)) {
                throw new Error(`Required state property missing: ${key}`);
            }

            if (key in state && rules.type && typeof state[key] !== rules.type) {
                throw new Error(`Invalid type for ${key}: expected ${rules.type}, got ${typeof state[key]}`);
            }
        }
    }

    getDefaultState(componentId) {
        const component = this.messageBus.getComponent(componentId);
        return {
            id: componentId,
            status: 'initialized',
            timestamp: Date.now(),
            data: {},
            metadata: component?.metadata || {}
        };
    }

    recordStateChange(componentId, previousState, newState, options) {
        if (!this.stateHistory.has(componentId)) {
            this.stateHistory.set(componentId, []);
        }

        const history = this.stateHistory.get(componentId);
        history.push({
            timestamp: Date.now(),
            previousState,
            newState,
            options
        });

        // Mantener límite de historial
        if (history.length > this.config.maxHistorySize) {
            history.shift();
        }
    }

    async acquireLock(lockKey) {
        const lockId = crypto.randomUUID();

        while (this.stateLocks.has(lockKey)) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.stateLocks.set(lockKey, lockId);
        return lockId;
    }

    releaseLock(lockKey) {
        this.stateLocks.delete(lockKey);
    }

    updateGlobalState(componentId, componentState) {
        // Actualizar estado global con información relevante
        this.globalState.set(componentId, {
            status: componentState.status,
            lastUpdate: Date.now(),
            keyMetrics: componentState.keyMetrics || {}
        });
    }

    async notifyStateSubscribers(componentId, state, options) {
        if (options.notify !== false) {
            await this.broadcastStateUpdate(componentId, state, options);
        }
    }

    // ========== EVENT HANDLERS ==========

    async handleStateUpdate(data) {
        const { componentId, state, options } = data;
        await this.updateComponentState(componentId, state, options);
    }

    async handleComponentRegistered(component) {
        // Inicializar estado para nuevo componente
        const defaultState = this.getDefaultState(component.id);
        await this.updateComponentState(component.id, defaultState);
    }

    handleComponentUnregistered(component) {
        // Cleanup state
        this.componentStates.delete(component.id);
        this.stateHistory.delete(component.id);
        this.globalState.delete(component.id);
    }

    // ========== LIFECYCLE ==========

    startSnapshotInterval() {
        setInterval(() => {
            this.saveStateSnapshot();
        }, this.config.snapshotInterval);
    }

    getMetrics() {
        return {
            ...this.metrics,
            componentsWithState: this.componentStates.size,
            globalStateKeys: this.globalState.size,
            totalHistoryEntries: Array.from(this.stateHistory.values())
                .reduce((sum, history) => sum + history.length, 0)
        };
    }

    async shutdown() {
        console.log('🛑 Apagando State Manager...');

        // Último snapshot antes de apagar
        await this.saveStateSnapshot();

        this.emit('state-manager-shutdown');
    }
}

module.exports = QBTCStateManager;