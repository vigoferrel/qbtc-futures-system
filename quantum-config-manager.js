/**
 * ⚙️ QBTC QUANTUM CONFIG MANAGER
 * =============================
 * Sistema de configuración unificado con hot-reload
 * que permite actualizar la configuración sin reiniciar el sistema.
 * 
 * CARACTERÍSTICAS:
 * - Hot-reload automático cuando cambia el archivo
 * - Validación de configuración
 * - Eventos de cambio de configuración
 * - Cache inteligente
 * - Fallbacks seguros
 * - Integración con base de datos
 */

import fs from 'fs/promises';
import { watch } from 'fs';
import EventEmitter from 'events';
import path from 'path';

class QuantumConfigManager extends EventEmitter {
    constructor(configPath = './quantum-config.json', options = {}) {
        super();
        
        this.configPath = configPath;
        this.options = {
            enableHotReload: options.enableHotReload !== false,
            validateConfig: options.validateConfig !== false,
            autoSave: options.autoSave !== false,
            debounceMs: options.debounceMs || 500,
            ...options
        };
        
        // Estado interno
        this.config = {};
        this.isLoaded = false;
        this.fileWatcher = null;
        this.lastModified = null;
        this.debounceTimer = null;
        
        // Cache para acceso rápido
        this.cache = new Map();
        this.fallbacks = new Map();
        
        console.log('⚙️ Quantum Config Manager initialized');
    }
    
    // 🚀 INICIALIZAR CONFIG MANAGER
    async initialize() {
        try {
            console.log('🚀 Initializing Quantum Configuration...');
            
            // Cargar configuración inicial
            await this.loadConfig();
            
            // Configurar hot-reload si está habilitado
            if (this.options.enableHotReload) {
                this.setupHotReload();
            }
            
            // Configurar fallbacks de seguridad
            this.setupFallbacks();
            
            this.isLoaded = true;
            console.log('✅ Quantum Configuration initialized');
            
            // Emitir evento de inicialización
            this.emit('initialized', this.config);
            
        } catch (error) {
            console.error('❌ Failed to initialize config manager:', error.message);
            await this.loadFallbackConfig();
            throw error;
        }
    }
    
    // 📖 CARGAR CONFIGURACIÓN
    async loadConfig() {
        try {
            console.log(`📖 Loading configuration from ${this.configPath}`);
            
            // Verificar si el archivo existe
            await fs.access(this.configPath);
            
            // Obtener información del archivo
            const stats = await fs.stat(this.configPath);
            
            // Solo recargar si ha cambiado
            if (this.lastModified && stats.mtime <= this.lastModified) {
                console.log('📄 Configuration unchanged, using cache');
                return this.config;
            }
            
            // Leer y parsear el archivo
            const configData = await fs.readFile(this.configPath, 'utf8');
            const newConfig = JSON.parse(configData);
            
            // Validar configuración si está habilitada
            if (this.options.validateConfig) {
                this.validateConfiguration(newConfig);
            }
            
            // Guardar configuración anterior para comparación
            const oldConfig = { ...this.config };
            
            // Actualizar configuración
            this.config = newConfig;
            this.lastModified = stats.mtime;
            
            // Limpiar cache
            this.cache.clear();
            
            // Emitir evento de cambio si la configuración cambió
            if (this.isLoaded && JSON.stringify(oldConfig) !== JSON.stringify(newConfig)) {
                console.log('🔄 Configuration changed, broadcasting update');
                this.emit('configChanged', {
                    oldConfig,
                    newConfig,
                    changedKeys: this.getChangedKeys(oldConfig, newConfig)
                });
            }
            
            console.log('✅ Configuration loaded successfully');
            return this.config;
            
        } catch (error) {
            console.error('❌ Error loading configuration:', error.message);
            
            // Si no es la carga inicial, usar configuración actual
            if (this.isLoaded) {
                console.log('⚠️ Using previous configuration due to load error');
                return this.config;
            }
            
            throw error;
        }
    }
    
    // 🔥 CONFIGURAR HOT-RELOAD
    setupHotReload() {
        console.log('🔥 Setting up configuration hot-reload...');
        
        try {
            // Vigilar cambios en el archivo de configuración
            this.fileWatcher = watch(this.configPath, (eventType) => {
                if (eventType === 'change') {
                    console.log('📁 Configuration file changed, reloading...');
                    this.debouncedReload();
                }
            });
            
            console.log('✅ Hot-reload configured');
            
        } catch (error) {
            console.error('❌ Error setting up hot-reload:', error.message);
        }
    }
    
    // ⏱️ RECARGA CON DEBOUNCE
    debouncedReload() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(async () => {
            try {
                await this.loadConfig();
            } catch (error) {
                console.error('❌ Error during hot-reload:', error.message);
                this.emit('configError', error);
            }
        }, this.options.debounceMs);
    }
    
    // 🛡️ CONFIGURAR FALLBACKS DE SEGURIDAD
    setupFallbacks() {
        // Configuraciones críticas mínimas para el funcionamiento
        this.fallbacks.set('system.server.port', 14001);
        this.fallbacks.set('system.server.host', 'localhost');
        this.fallbacks.set('system.realtime.update_interval', 1000);
        this.fallbacks.set('quantum.consciousness.evolution_rate', 0.001);
        this.fallbacks.set('quantum.consciousness.awakening_threshold', 0.618);
        this.fallbacks.set('quantum.field.base_strength', 0.5);
        this.fallbacks.set('modules.quantum_core.enabled', true);
        this.fallbacks.set('modules.ranking_engine.enabled', true);
        this.fallbacks.set('trading.enabled', false);
        this.fallbacks.set('trading.safety_mode', true);
        
        console.log('🛡️ Security fallbacks configured');
    }
    
    // 📦 CARGAR CONFIGURACIÓN DE FALLBACK
    async loadFallbackConfig() {
        console.log('📦 Loading fallback configuration...');
        
        // Configuración mínima de emergencia
        this.config = {
            quantum: {
                consciousness: {
                    evolution_rate: 0.001,
                    awakening_threshold: 0.618,
                    max_level: 0.99,
                    min_level: 0.01
                },
                field: {
                    base_strength: 0.5,
                    phi_influence: true,
                    lambda_7919_influence: true
                },
                constants: {
                    phi: 1.618033988749895,
                    lambda_7919: 8.977279923499
                }
            },
            system: {
                server: {
                    port: 14001,
                    host: 'localhost',
                    cors_enabled: true
                },
                realtime: {
                    update_interval: 1000,
                    max_clients: 100
                }
            },
            modules: {
                quantum_core: { enabled: true },
                ranking_engine: { enabled: true },
                trading_executor: { enabled: false }
            },
            trading: {
                enabled: false,
                safety_mode: true
            }
        };
        
        console.log('✅ Fallback configuration loaded');
    }
    
    // ✅ VALIDAR CONFIGURACIÓN
    validateConfiguration(config) {
        const errors = [];
        
        // Validaciones básicas
        if (!config.system?.server?.port) {
            errors.push('Missing system.server.port');
        }
        
        if (!config.quantum?.consciousness?.evolution_rate) {
            errors.push('Missing quantum.consciousness.evolution_rate');
        }
        
        if (config.trading?.enabled && !config.trading?.safety_mode) {
            errors.push('Trading enabled without safety_mode - this is dangerous!');
        }
        
        // Validar que los valores numéricos estén en rangos válidos
        const consciousness = config.quantum?.consciousness;
        if (consciousness) {
            if (consciousness.evolution_rate < 0 || consciousness.evolution_rate > 0.1) {
                errors.push('quantum.consciousness.evolution_rate must be between 0 and 0.1');
            }
            
            if (consciousness.awakening_threshold < 0 || consciousness.awakening_threshold > 1) {
                errors.push('quantum.consciousness.awakening_threshold must be between 0 and 1');
            }
        }
        
        // Validar puerto del servidor
        const port = config.system?.server?.port;
        if (port && (port < 1000 || port > 65535)) {
            errors.push('system.server.port must be between 1000 and 65535');
        }
        
        if (errors.length > 0) {
            const errorMsg = `Configuration validation failed:\n${errors.join('\n')}`;
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
        }
        
        console.log('✅ Configuration validation passed');
    }
    
    // 🔍 OBTENER CONFIGURACIÓN
    get(key, defaultValue = null) {
        // Intentar obtener del cache primero
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        try {
            // Navegar por la configuración usando el key
            const keys = key.split('.');
            let value = this.config;
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    value = undefined;
                    break;
                }
            }
            
            // Si no se encontró, usar fallback
            if (value === undefined) {
                value = this.fallbacks.get(key) ?? defaultValue;
            }
            
            // Guardar en cache
            this.cache.set(key, value);
            
            return value;
            
        } catch (error) {
            console.error(`❌ Error getting config ${key}:`, error.message);
            return this.fallbacks.get(key) ?? defaultValue;
        }
    }
    
    // 📝 ESTABLECER CONFIGURACIÓN
    async set(key, value, saveToFile = true) {
        try {
            // Actualizar en la configuración en memoria
            const keys = key.split('.');
            let current = this.config;
            
            // Navegar hasta el penúltimo nivel
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            // Establecer el valor
            const oldValue = current[keys[keys.length - 1]];
            current[keys[keys.length - 1]] = value;
            
            // Limpiar cache para esta key
            this.cache.delete(key);
            
            // Guardar en archivo si está habilitado
            if (saveToFile && this.options.autoSave) {
                await this.saveConfig();
            }
            
            // Emitir evento de cambio
            this.emit('configValueChanged', {
                key,
                oldValue,
                newValue: value
            });
            
            console.log(`⚙️ Configuration updated: ${key} = ${JSON.stringify(value)}`);
            
        } catch (error) {
            console.error(`❌ Error setting config ${key}:`, error.message);
            throw error;
        }
    }
    
    // 💾 GUARDAR CONFIGURACIÓN
    async saveConfig() {
        try {
            console.log('💾 Saving configuration to file...');
            
            // Actualizar metadatos
            if (this.config.metadata) {
                this.config.metadata.last_modified = new Date().toISOString();
            }
            
            // Convertir a JSON con formato legible
            const configJson = JSON.stringify(this.config, null, 4);
            
            // Guardar archivo
            await fs.writeFile(this.configPath, configJson, 'utf8');
            
            console.log('✅ Configuration saved successfully');
            
            this.emit('configSaved', this.config);
            
        } catch (error) {
            console.error('❌ Error saving configuration:', error.message);
            throw error;
        }
    }
    
    // 🔄 RECARGAR CONFIGURACIÓN MANUALMENTE
    async reload() {
        console.log('🔄 Manual configuration reload requested');
        
        try {
            await this.loadConfig();
            this.emit('configReloaded', this.config);
            return true;
        } catch (error) {
            console.error('❌ Error during manual reload:', error.message);
            this.emit('configError', error);
            return false;
        }
    }
    
    // 📊 OBTENER TODA LA CONFIGURACIÓN
    getAll() {
        return { ...this.config };
    }
    
    // 🔍 OBTENER KEYS CAMBIADAS
    getChangedKeys(oldConfig, newConfig, prefix = '') {
        const changes = [];
        const allKeys = new Set([
            ...Object.keys(oldConfig || {}),
            ...Object.keys(newConfig || {})
        ]);
        
        for (const key of allKeys) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const oldValue = oldConfig?.[key];
            const newValue = newConfig?.[key];
            
            if (typeof oldValue === 'object' && typeof newValue === 'object' && 
                oldValue !== null && newValue !== null && 
                !Array.isArray(oldValue) && !Array.isArray(newValue)) {
                // Recursivamente comprobar objetos anidados
                changes.push(...this.getChangedKeys(oldValue, newValue, fullKey));
            } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    key: fullKey,
                    oldValue,
                    newValue
                });
            }
        }
        
        return changes;
    }
    
    // 📈 OBTENER ESTADÍSTICAS
    getStats() {
        return {
            isLoaded: this.isLoaded,
            configPath: this.configPath,
            lastModified: this.lastModified,
            cacheSize: this.cache.size,
            fallbacksCount: this.fallbacks.size,
            hotReloadEnabled: this.options.enableHotReload,
            totalConfigKeys: this.countConfigKeys(this.config)
        };
    }
    
    // 🔢 CONTAR KEYS DE CONFIGURACIÓN
    countConfigKeys(obj, count = 0) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                count = this.countConfigKeys(obj[key], count);
            } else {
                count++;
            }
        }
        return count;
    }
    
    // 🧪 VALIDAR KEY EXISTE
    has(key) {
        const keys = key.split('.');
        let current = this.config;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return false;
            }
        }
        
        return true;
    }
    
    // 🚫 ELIMINAR KEY
    async delete(key, saveToFile = true) {
        try {
            const keys = key.split('.');
            let current = this.config;
            
            // Navegar hasta el penúltimo nivel
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    return false; // Key no existe
                }
                current = current[keys[i]];
            }
            
            // Eliminar la key
            const deleted = delete current[keys[keys.length - 1]];
            
            if (deleted) {
                // Limpiar cache
                this.cache.delete(key);
                
                // Guardar si está habilitado
                if (saveToFile && this.options.autoSave) {
                    await this.saveConfig();
                }
                
                this.emit('configValueDeleted', { key });
                console.log(`⚙️ Configuration key deleted: ${key}`);
            }
            
            return deleted;
            
        } catch (error) {
            console.error(`❌ Error deleting config ${key}:`, error.message);
            throw error;
        }
    }
    
    // 🔒 CERRAR CONFIG MANAGER
    async close() {
        console.log('🔒 Closing Quantum Config Manager...');
        
        try {
            // Detener file watcher
            if (this.fileWatcher) {
                this.fileWatcher.close();
                this.fileWatcher = null;
            }
            
            // Limpiar timers
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = null;
            }
            
            // Guardar configuración si hay cambios pendientes
            if (this.options.autoSave) {
                await this.saveConfig();
            }
            
            // Limpiar cache
            this.cache.clear();
            
            this.emit('closed');
            console.log('✅ Config Manager closed');
            
        } catch (error) {
            console.error('❌ Error closing config manager:', error.message);
            throw error;
        }
    }
}

export default QuantumConfigManager;
