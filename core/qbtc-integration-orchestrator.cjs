/**
 * QBTC Quantum Integration Orchestrator
 * Orquestador principal que coordina Message Bus, API Gateway, State Manager
 * Punto de entrada unificado para la integración de 151 componentes
 */

const EventEmitter = require('events');
const QBTCMessageBus = require('./qbtc-message-bus.cjs');
const QBTCAPIGateway = require('./qbtc-api-gateway.cjs');
const QBTCStateManager = require('./qbtc-state-manager.cjs');
const QBTCCommunicationContracts = require('./qbtc-communication-contracts.cjs');

class QBTCIntegrationOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();

        this.config = {
            messageBus: { port: 14000 },
            apiGateway: { port: 14001 },
            stateManager: { persistencePath: './data/state' },
            ...config
        };

        // Componentes principales
        this.messageBus = null;
        this.apiGateway = null;
        this.stateManager = null;
        this.contracts = new QBTCCommunicationContracts();

        // Estado del orquestador
        this.status = 'initializing';
        this.components = new Map();
        this.metrics = {
            startTime: Date.now(),
            componentsIntegrated: 0,
            messagesProcessed: 0,
            errors: 0
        };

        this.initialize();
    }

    async initialize() {
        try {
            console.log('🚀 Inicializando QBTC Integration Orchestrator...');
            console.log('📊 Integrando 151 componentes enterprise');

            // 1. Inicializar Message Bus
            console.log('📡 Inicializando Message Bus...');
            this.messageBus = new QBTCMessageBus(this.config.messageBus);
            await this.waitForComponentReady(this.messageBus, 'bus-ready');

            // 2. Inicializar State Manager
            console.log('💾 Inicializando State Manager...');
            this.stateManager = new QBTCStateManager(this.messageBus, this.config.stateManager);
            await this.waitForComponentReady(this.stateManager, 'state-manager-ready');

            // 3. Inicializar API Gateway
            console.log('🌐 Inicializando API Gateway...');
            this.apiGateway = new QBTCAPIGateway(this.messageBus, this.config.apiGateway);
            await this.waitForComponentReady(this.apiGateway, 'listening');

            // 4. Configurar manejadores de eventos
            this.setupEventHandlers();

            // 5. Estado listo
            this.status = 'ready';
            console.log('✅ Integration Orchestrator listo');
            console.log(`🔗 Message Bus: puerto ${this.config.messageBus.port}`);
            console.log(`🌐 API Gateway: puerto ${this.config.apiGateway.port}`);

            this.emitStatus();

        } catch (error) {
            console.error('❌ Error inicializando orchestrator:', error);
            this.status = 'error';
            this.metrics.errors++;
            throw error;
        }
    }

    async waitForComponentReady(component, eventName) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for ${eventName}`));
            }, 30000); // 30 segundos timeout

            // Check if component has the event method
            if (typeof component.once === 'function') {
                component.once(eventName, () => {
                    clearTimeout(timeout);
                    resolve();
                });

                component.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            } else {
                // For components without event system, just wait a bit
                setTimeout(() => {
                    clearTimeout(timeout);
                    resolve();
                }, 1000);
            }
        });
    }

    setupEventHandlers() {
        // Monitoreo del Message Bus
        this.messageBus.on('component-registered', (component) => {
            this.handleComponentRegistered(component);
        });

        this.messageBus.on('component-unregistered', (component) => {
            this.handleComponentUnregistered(component);
        });

        this.messageBus.on('message-received', (data) => {
            this.metrics.messagesProcessed++;
        });

        // Monitoreo del State Manager
        this.stateManager.on('state-changed', (data) => {
            this.handleStateChanged(data);
        });

        // Monitoreo del API Gateway
        this.apiGateway.app.on('request', (req, res) => {
            // Logging de requests
        });
    }

    // ========== GESTIÓN DE COMPONENTES ==========

    async registerComponent(componentInfo) {
        try {
            // Validar información del componente
            this.validateComponentInfo(componentInfo);

            // Registrar en Message Bus
            const componentId = await this.messageBus.registerComponent(componentInfo);

            // Inicializar estado
            await this.stateManager.updateComponentState(componentId, {
                status: 'registered',
                info: componentInfo,
                registeredAt: Date.now()
            });

            // Registrar localmente
            this.components.set(componentId, {
                ...componentInfo,
                id: componentId,
                registeredAt: Date.now()
            });

            this.metrics.componentsIntegrated++;

            console.log(`📝 Componente integrado: ${componentInfo.name} (${componentId})`);

            return {
                success: true,
                componentId,
                endpoints: this.getComponentEndpoints(componentId)
            };

        } catch (error) {
            console.error(`Error registrando componente ${componentInfo.name}:`, error);
            this.metrics.errors++;
            throw error;
        }
    }

    async unregisterComponent(componentId) {
        try {
            const component = this.components.get(componentId);
            if (component) {
                // Remover de Message Bus
                this.messageBus.unregisterComponent(componentId);

                // Limpiar estado
                await this.stateManager.updateComponentState(componentId, {
                    status: 'unregistered',
                    unregisteredAt: Date.now()
                });

                // Remover localmente
                this.components.delete(componentId);

                console.log(`📤 Componente removido: ${component.name} (${componentId})`);
            }
        } catch (error) {
            console.error(`Error removiendo componente ${componentId}:`, error);
        }
    }

    validateComponentInfo(componentInfo) {
        const required = ['name', 'type'];
        for (const field of required) {
            if (!componentInfo[field]) {
                throw new Error(`Campo requerido faltante: ${field}`);
            }
        }

        // Validación básica - contratos se validarán durante el uso
        console.log(`✅ Validando componente: ${componentInfo.name} (${componentInfo.type})`);
    }

    // ========== COMUNICACIÓN ==========

    async sendMessage(to, message, options = {}) {
        // Validar mensaje
        this.contracts.validateMessage(message);

        return await this.messageBus.sendMessage(to, message, options);
    }

    async broadcastMessage(message, filter = null) {
        // Validar mensaje
        this.contracts.validateMessage(message, 'event');

        return await this.messageBus.broadcastMessage(message, filter);
    }

    async callAPI(service, endpoint, data = {}, method = 'GET') {
        const endpointInfo = this.contracts.getAPIEndpoint(service, endpoint);
        if (!endpointInfo) {
            throw new Error(`Endpoint no encontrado: ${service}/${endpoint}`);
        }

        // Enviar a través del API Gateway
        return await this.apiGateway.routeToService(service, {
            method,
            path: endpoint,
            body: data
        });
    }

    // ========== ESTADO ==========

    async getComponentState(componentId) {
        return await this.stateManager.getComponentState(componentId);
    }

    async updateComponentState(componentId, state, options = {}) {
        return await this.stateManager.updateComponentState(componentId, state, options);
    }

    async getGlobalState() {
        return await this.stateManager.getGlobalState();
    }

    // ========== UTILIDADES ==========

    getComponentEndpoints(componentId) {
        const component = this.components.get(componentId);
        if (!component) return {};

        return {
            messageBus: `ws://localhost:${this.config.messageBus.port}`,
            apiGateway: `http://localhost:${this.config.apiGateway.port}`,
            direct: component.endpoints || {}
        };
    }

    getMetrics() {
        return {
            orchestrator: {
                status: this.status,
                uptime: Date.now() - this.metrics.startTime,
                componentsIntegrated: this.metrics.componentsIntegrated,
                messagesProcessed: this.metrics.messagesProcessed,
                errors: this.metrics.errors
            },
            messageBus: this.messageBus.getMetrics(),
            stateManager: this.stateManager.getMetrics(),
            contracts: {
                messageFormats: Object.keys(this.contracts.contracts.messageFormats).length,
                apiEndpoints: Object.keys(this.contracts.contracts.apiEndpoints).length,
                eventTypes: Object.keys(this.contracts.contracts.eventTypes).length
            }
        };
    }

    getHealthStatus() {
        return {
            status: this.status,
            components: {
                messageBus: this.messageBus ? 'operational' : 'down',
                apiGateway: this.apiGateway ? 'operational' : 'down',
                stateManager: this.stateManager ? 'operational' : 'down'
            },
            metrics: this.getMetrics(),
            timestamp: Date.now()
        };
    }

    // ========== EVENT HANDLERS ==========

    handleComponentRegistered(component) {
        console.log(`🔗 Componente conectado: ${component.name}`);
        this.emit('component-registered', component);
    }

    handleComponentUnregistered(component) {
        console.log(`🔌 Componente desconectado: ${component.name}`);
        this.emit('component-unregistered', component);
    }

    handleStateChanged(data) {
        // Broadcast state changes a componentes suscriptos
        this.broadcastMessage({
            type: 'state-changed',
            componentId: data.componentId,
            state: data.newState,
            timestamp: data.timestamp
        }, (component) => {
            // Filtrar componentes interesados en este estado
            return component.capabilities?.includes('state-subscriber');
        });
    }

    emitStatus() {
        const status = this.getHealthStatus();
        this.broadcastMessage({
            type: 'orchestrator-status',
            status: status,
            timestamp: Date.now()
        });
    }

    // ========== LIFECYCLE ==========

    async shutdown() {
        console.log('🛑 Apagando Integration Orchestrator...');

        this.status = 'shutting-down';

        // Apagar componentes en orden inverso
        if (this.apiGateway) {
            await this.apiGateway.shutdown();
        }

        if (this.stateManager) {
            await this.stateManager.shutdown();
        }

        if (this.messageBus) {
            await this.messageBus.shutdown();
        }

        this.status = 'shutdown';
        console.log('✅ Integration Orchestrator apagado');
    }

    // ========== API PÚBLICA DE ALTO NIVEL ==========

    // Método para integrar un componente con configuración mínima
    async integrateComponent(name, type, config = {}) {
        const componentInfo = {
            name,
            type,
            version: config.version || '1.0.0',
            endpoints: config.endpoints || {},
            capabilities: config.capabilities || [],
            dependencies: config.dependencies || [],
            metadata: config.metadata || {}
        };

        return await this.registerComponent(componentInfo);
    }

    // Método para ejecutar comando en componente específico
    async executeCommand(componentName, command, parameters = {}) {
        const component = Array.from(this.components.values())
            .find(comp => comp.name === componentName);

        if (!component) {
            throw new Error(`Componente no encontrado: ${componentName}`);
        }

        const message = this.contracts.createMessage(
            'orchestrator',
            component.id,
            'command',
            { command, parameters }
        );

        return await this.sendMessage(component.id, message);
    }

    // Método para consultar estado de múltiples componentes
    async queryComponents(query = {}) {
        let components = Array.from(this.components.values());

        if (query.type) {
            components = components.filter(comp => comp.type === query.type);
        }

        if (query.capability) {
            components = components.filter(comp =>
                comp.capabilities?.includes(query.capability)
            );
        }

        const results = {};
        for (const component of components) {
            try {
                results[component.id] = await this.getComponentState(component.id);
            } catch (error) {
                results[component.id] = { error: error.message };
            }
        }

        return results;
    }
}

module.exports = QBTCIntegrationOrchestrator;