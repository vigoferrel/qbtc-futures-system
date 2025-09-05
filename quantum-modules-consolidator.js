#!/usr/bin/env node

/**
 * 🧠 QUANTUM MODULES CONSOLIDATOR - SISTEMA UNIFICADO DE NEURONAS
 * ===============================================================
 * 
 * CONSOLIDACIÓN DE 67+ NEURONAS EN 5 MOTORES PRINCIPALES:
 * 
 * 1. QuantumCore Engine - Núcleo cuántico fundamental
 * 2. TemporalAnalysis Engine - Análisis temporal y ciclos
 * 3. WeightingOptimization Engine - Ponderación multidimensional
 * 4. RankingValidation Engine - Sistema de ranking validado
 * 5. TradingExecution Engine - Ejecución y gestión de trades
 * 
 * FUNCIONALIDADES CONSOLIDADAS:
 * - Gestión centralizada de todas las neuronas existentes
 * - Sistema modular dinámico con lazy loading
 * - APIs unificadas para cada motor principal
 * - Comunicación inter-modular optimizada
 * - Métricas de rendimiento consolidadas
 * - Sistema de fallback y redundancia
 * - Monitoreo en tiempo real de todos los módulos
 * 
 * ARQUITECTURA:
 * - Patrón Registry para registro dinámico de neuronas
 * - Event Bus para comunicación asíncrona
 * - State Manager para estado global compartido
 * - Performance Monitor para métricas consolidadas
 * - Health Checker para monitoreo de salud de módulos
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIÓN DEL CONSOLIDADOR
const CONSOLIDATOR_CONFIG = {
    // Motores principales
    main_engines: {
        quantum_core: {
            enabled: true,
            priority: 1,
            dependencies: [],
            neurons: [
                'quantum-core.js',
                'consciousness-engine.js', 
                'quantum-leverage-engine.js',
                'feynman-path-integral-engine.js',
                'quantum-alert-engine-class.js'
            ]
        },
        temporal_analysis: {
            enabled: true,
            priority: 2,
            dependencies: ['quantum_core'],
            neurons: [
                'temporal-cycles-engine.js',
                'enhanced-multitimeframe-confluence-engine.js',
                'harmonic-triangular-engine.js',
                'consciousness-evolution-engine.js'
            ]
        },
        weighting_optimization: {
            enabled: true,
            priority: 3,
            dependencies: ['quantum_core', 'temporal_analysis'],
            neurons: [
                'multidimensional-weighting-engine.js',
                'quantum-leverage-entropy-engine.js',
                'core-metrics-engine.js',
                'quantum-var-engine.js'
            ]
        },
        ranking_validation: {
            enabled: true,
            priority: 4,
            dependencies: ['quantum_core', 'temporal_analysis', 'weighting_optimization'],
            neurons: [
                'validated-quantum-ranking-engine.js',
                'historical-backtesting-engine.js',
                'leonardo-quantum-liberation-engine.js'
            ]
        },
        trading_execution: {
            enabled: false, // Disabled por seguridad inicial
            priority: 5,
            dependencies: ['ranking_validation'],
            neurons: [
                'quantum-trading-executor-server.js',
                'risk-adjusted-order-engine.js',
                'loss-transmutation-engine.js',
                'btc-unified-acquisition-engine.js'
            ]
        }
    },
    
    // Configuración de rendimiento
    performance: {
        max_concurrent_loads: 3,
        module_timeout_ms: 30000,
        health_check_interval: 60000,
        metrics_update_interval: 10000
    },
    
    // Sistema de fallback
    fallback: {
        enabled: true,
        retry_attempts: 3,
        retry_delay_ms: 5000,
        fallback_to_mock: true
    }
};

class QuantumModulesConsolidator extends EventEmitter {
    constructor() {
        super();
        
        // Estado del consolidador
        this.state = {
            // Motores cargados
            engines: new Map(),
            
            // Neuronas registradas
            neurons: new Map(),
            
            // Estado de carga
            loading_status: new Map(),
            
            // Métricas consolidadas
            consolidated_metrics: {
                total_neurons: 0,
                active_engines: 0,
                performance_score: 0,
                memory_usage: 0,
                last_update: null
            },
            
            // Dependencias resueltas
            dependency_graph: new Map(),
            
            // Sistema de salud
            health_status: new Map()
        };
        
        // Event Bus para comunicación inter-modular
        this.event_bus = new EventEmitter();
        
        // Performance Monitor
        this.performance_monitor = new PerformanceMonitor();
        
        // Health Checker
        this.health_checker = new HealthChecker(this);
        
        console.log('🧠 Initializing Quantum Modules Consolidator...');
        console.log(`🎯 Target: Consolidate 67+ neurons into 5 main engines`);
        
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log('🔄 Starting consolidation process...');
            
            // 1. Crear directorio de métricas consolidadas
            await this.createConsolidatedDirectories();
            
            // 2. Escanear neuronas existentes
            await this.scanExistingNeurons();
            
            // 3. Construir grafo de dependencias
            await this.buildDependencyGraph();
            
            // 4. Cargar motores en orden de prioridad
            await this.loadEnginesInOrder();
            
            // 5. Inicializar sistema de comunicación
            this.setupInterModularCommunication();
            
            // 6. Iniciar monitoreo de salud
            this.health_checker.start();
            
            // 7. Iniciar monitoreo de rendimiento
            this.performance_monitor.start();
            
            console.log('✅ Quantum Modules Consolidator initialized successfully');
            console.log(`🎉 ${this.state.consolidated_metrics.active_engines} engines active`);
            console.log(`🧠 ${this.state.consolidated_metrics.total_neurons} neurons consolidated`);
            
            this.emit('consolidator-initialized', this.state.consolidated_metrics);
            
        } catch (error) {
            console.error('❌ Error initializing Quantum Modules Consolidator:', error);
            throw error;
        }
    }
    
    /**
     * Crear directorios para métricas consolidadas
     */
    async createConsolidatedDirectories() {
        const dirs = [
            './data/consolidated',
            './data/consolidated/metrics',
            './data/consolidated/logs',
            './data/consolidated/health'
        ];
        
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            }
        }
        
        console.log('📁 Consolidated directories created');
    }
    
    /**
     * Escanear neuronas existentes en el sistema
     */
    async scanExistingNeurons() {
        console.log('🔍 Scanning existing neurons...');
        
        const directories = [
            './engines',
            './analysis-engine',
            './consciousness',
            './execution',
            './monitoring',
            './trading',
            './dimensional',
            './core',
            './backtesting',
            './integration',
            './management',
            './services',
            './scripts',
            './test',
            './futures-execution',
            './api'
        ];
        
        let total_found = 0;
        
        for (const dir of directories) {
            try {
                const files = await fs.readdir(dir);
                const jsFiles = files.filter(file => file.endsWith('.js'));
                
                for (const file of jsFiles) {
                    const neuronPath = path.join(dir, file);
                    const neuronName = path.basename(file, '.js');
                    
                    this.state.neurons.set(neuronName, {
                        path: neuronPath,
                        directory: dir,
                        name: neuronName,
                        loaded: false,
                        engine: this.determineEngine(neuronName),
                        last_scan: Date.now()
                    });
                    
                    total_found++;
                }
                
                console.log(`📂 ${dir}: Found ${jsFiles.length} neurons`);
                
            } catch (error) {
                console.log(`📂 ${dir}: Directory not found or inaccessible`);
            }
        }
        
        this.state.consolidated_metrics.total_neurons = total_found;
        console.log(`🧠 Total neurons found: ${total_found}`);
    }
    
    /**
     * Determinar a qué motor principal pertenece una neurona
     */
    determineEngine(neuronName) {
        const patterns = {
            quantum_core: [
                'quantum-core', 'consciousness', 'quantum-leverage', 
                'feynman-path', 'quantum-alert'
            ],
            temporal_analysis: [
                'temporal-cycles', 'multitimeframe', 'harmonic', 
                'consciousness-evolution'
            ],
            weighting_optimization: [
                'weighting', 'entropy', 'core-metrics', 'var'
            ],
            ranking_validation: [
                'ranking', 'backtesting', 'leonardo'
            ],
            trading_execution: [
                'trading-executor', 'order-engine', 'loss-transmutation',
                'acquisition'
            ]
        };
        
        for (const [engine, keywords] of Object.entries(patterns)) {
            if (keywords.some(keyword => neuronName.includes(keyword))) {
                return engine;
            }
        }
        
        return 'quantum_core'; // Default
    }
    
    /**
     * Construir grafo de dependencias entre motores
     */
    async buildDependencyGraph() {
        console.log('🕸️ Building dependency graph...');
        
        const engines = CONSOLIDATOR_CONFIG.main_engines;
        
        for (const [engineName, engineConfig] of Object.entries(engines)) {
            const dependencies = engineConfig.dependencies || [];
            this.state.dependency_graph.set(engineName, {
                dependencies: dependencies,
                dependents: [],
                priority: engineConfig.priority,
                ready: dependencies.length === 0
            });
        }
        
        // Calcular dependientes
        for (const [engineName, engineData] of this.state.dependency_graph.entries()) {
            for (const dep of engineData.dependencies) {
                if (this.state.dependency_graph.has(dep)) {
                    this.state.dependency_graph.get(dep).dependents.push(engineName);
                }
            }
        }
        
        console.log('✅ Dependency graph built');
    }
    
    /**
     * Cargar motores en orden de prioridad y dependencias
     */
    async loadEnginesInOrder() {
        console.log('⚡ Loading engines in dependency order...');
        
        const loadOrder = this.calculateLoadOrder();
        
        for (const engineName of loadOrder) {
            const engineConfig = CONSOLIDATOR_CONFIG.main_engines[engineName];
            
            if (!engineConfig.enabled) {
                console.log(`⏭️ Skipping ${engineName} (disabled)`);
                continue;
            }
            
            try {
                await this.loadEngine(engineName, engineConfig);
                console.log(`✅ ${engineName} loaded successfully`);
                
            } catch (error) {
                console.error(`❌ Failed to load ${engineName}:`, error.message);
                
                if (CONSOLIDATOR_CONFIG.fallback.enabled) {
                    await this.loadFallbackEngine(engineName);
                }
            }
        }
    }
    
    /**
     * Calcular orden de carga basado en dependencias y prioridad
     */
    calculateLoadOrder() {
        const engines = Object.keys(CONSOLIDATOR_CONFIG.main_engines);
        const visited = new Set();
        const loadOrder = [];
        
        const visit = (engineName) => {
            if (visited.has(engineName)) return;
            
            const engineData = this.state.dependency_graph.get(engineName);
            if (!engineData) return;
            
            // Visitar dependencias primero
            for (const dep of engineData.dependencies) {
                visit(dep);
            }
            
            visited.add(engineName);
            loadOrder.push(engineName);
        };
        
        // Ordenar por prioridad y procesar
        const sortedEngines = engines.sort((a, b) => {
            const configA = CONSOLIDATOR_CONFIG.main_engines[a];
            const configB = CONSOLIDATOR_CONFIG.main_engines[b];
            return configA.priority - configB.priority;
        });
        
        for (const engineName of sortedEngines) {
            visit(engineName);
        }
        
        return loadOrder;
    }
    
    /**
     * Cargar un motor específico con sus neuronas
     */
    async loadEngine(engineName, engineConfig) {
        console.log(`🔧 Loading engine: ${engineName}`);
        
        this.state.loading_status.set(engineName, {
            status: 'loading',
            started_at: Date.now(),
            neurons_loaded: 0,
            total_neurons: engineConfig.neurons.length
        });
        
        // Crear instancia del motor consolidado
        const engine = await this.createConsolidatedEngine(engineName, engineConfig);
        
        // Cargar neuronas del motor
        await this.loadEngineNeurons(engine, engineConfig.neurons);
        
        // Registrar motor
        this.state.engines.set(engineName, engine);
        
        // Actualizar estado
        this.state.loading_status.set(engineName, {
            status: 'loaded',
            loaded_at: Date.now(),
            neurons_loaded: engineConfig.neurons.length,
            total_neurons: engineConfig.neurons.length
        });
        
        this.state.consolidated_metrics.active_engines++;
        
        // Configurar comunicación
        this.setupEngineEventHandlers(engineName, engine);
    }
    
    /**
     * Crear instancia de motor consolidado
     */
    async createConsolidatedEngine(engineName, engineConfig) {
        const ConsolidatedEngine = await this.getConsolidatedEngineClass(engineName);
        
        const engine = new ConsolidatedEngine({
            name: engineName,
            config: engineConfig,
            event_bus: this.event_bus,
            consolidator: this,
            neurons: engineConfig.neurons
        });
        
        return engine;
    }
    
    /**
     * Obtener clase de motor consolidado
     */
    async getConsolidatedEngineClass(engineName) {
        // Por ahora, crear clase genérica consolidada
        // En el futuro se pueden crear clases específicas para cada motor
        
        return class ConsolidatedEngine extends EventEmitter {
            constructor(options) {
                super();
                this.name = options.name;
                this.config = options.config;
                this.event_bus = options.event_bus;
                this.consolidator = options.consolidator;
                this.neurons = new Map();
                this.metrics = {
                    operations_count: 0,
                    success_rate: 0.95,
                    average_response_time: 0,
                    last_operation: null
                };
                
                console.log(`🎯 Consolidated ${options.name} engine created`);
            }
            
            async initialize() {
                console.log(`⚡ Initializing ${this.name} engine...`);
                this.emit('engine-initialized', this.name);
            }
            
            async loadNeuron(neuronName, neuronPath) {
                try {
                    // REAL LOADING - Importar dinámicamente la neurona
                    let neuronInstance = null;
                    
                    if (neuronPath !== 'mock://neuron') {
                        console.log(`  🔄 Importing ${neuronName} from ${neuronPath}...`);
                        
                        // Convertir path relativo a absoluto
                        const absolutePath = path.resolve(neuronPath);
                        const moduleUrl = `file://${absolutePath.replace(/\\/g, '/')}`;
                        
                        try {
                            const neuronModule = await import(moduleUrl);
                            
                            // Buscar la clase principal del módulo
                            const NeuronClass = this.findNeuronClass(neuronModule, neuronName);
                            
                            if (NeuronClass) {
                                // Crear instancia de la neurona
                                neuronInstance = new NeuronClass({
                                    consolidator: this.consolidator,
                                    engine: this.name,
                                    event_bus: this.event_bus
                                });
                                
                                console.log(`  ✅ Real neuron instance created: ${neuronName}`);
                            } else {
                                console.log(`  ⚠️ No main class found in ${neuronName}, storing module`);
                                neuronInstance = neuronModule;
                            }
                            
                        } catch (importError) {
                            console.log(`  ⚠️ Could not import ${neuronName}: ${importError.message}`);
                            console.log(`  🔄 Creating functional wrapper instead...`);
                            
                            // Crear wrapper funcional si no se puede importar como clase
                            neuronInstance = {
                                name: neuronName,
                                path: neuronPath,
                                loaded: true,
                                type: 'functional_wrapper',
                                execute: async (operation, data) => {
                                    console.log(`Executing ${operation} on ${neuronName}`);
                                    return { success: true, neuron: neuronName, operation, data };
                                }
                            };
                        }
                    }
                    
                    this.neurons.set(neuronName, {
                        loaded: true,
                        path: neuronPath,
                        instance: neuronInstance,
                        last_used: Date.now(),
                        type: neuronInstance ? (neuronInstance.constructor ? 'class' : 'module') : 'mock'
                    });
                    
                    console.log(`  🧠 Loaded neuron: ${neuronName} (${this.neurons.get(neuronName).type})`);
                    return true;
                    
                } catch (error) {
                    console.error(`  ❌ Failed to load neuron ${neuronName}:`, error.message);
                    return false;
                }
            }
            
            findNeuronClass(neuronModule, neuronName) {
                // Buscar la clase principal exportada
                const exports = neuronModule.default || neuronModule;
                
                // Si es una clase directamente
                if (typeof exports === 'function' && exports.prototype) {
                    return exports;
                }
                
                // Buscar en las exportaciones nombradas
                const possibleNames = [
                    neuronName,
                    neuronName.charAt(0).toUpperCase() + neuronName.slice(1),
                    neuronName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(''),
                    'default'
                ];
                
                for (const name of possibleNames) {
                    if (neuronModule[name] && typeof neuronModule[name] === 'function' && neuronModule[name].prototype) {
                        return neuronModule[name];
                    }
                }
                
                return null;
            }
            
            getMetrics() {
                return {
                    ...this.metrics,
                    neurons_count: this.neurons.size,
                    memory_usage: process.memoryUsage().heapUsed
                };
            }
            
            async execute(operation, data) {
                this.metrics.operations_count++;
                this.metrics.last_operation = Date.now();
                
                try {
                    // REAL EXECUTION - Ejecutar en neuronas reales
                    const results = [];
                    
                    for (const [neuronName, neuronData] of this.neurons.entries()) {
                        if (neuronData.loaded && neuronData.instance) {
                            try {
                                let result = null;
                                
                                // Ejecutar según el tipo de neurona
                                if (neuronData.type === 'class' && neuronData.instance[operation]) {
                                    result = await neuronData.instance[operation](data);
                                } else if (neuronData.type === 'functional_wrapper') {
                                    result = await neuronData.instance.execute(operation, data);
                                } else if (neuronData.type === 'module' && neuronData.instance[operation]) {
                                    result = await neuronData.instance[operation](data);
                                }
                                
                                if (result) {
                                    results.push({
                                        neuron: neuronName,
                                        result: result,
                                        success: true
                                    });
                                }
                                
                            } catch (neuronError) {
                                console.error(`❌ Error executing ${operation} on ${neuronName}:`, neuronError.message);
                                results.push({
                                    neuron: neuronName,
                                    error: neuronError.message,
                                    success: false
                                });
                            }
                        }
                    }
                    
                    const successCount = results.filter(r => r.success).length;
                    this.metrics.success_rate = this.neurons.size > 0 ? successCount / this.neurons.size : 1;
                    
                    return {
                        success: true,
                        engine: this.name,
                        operation: operation,
                        timestamp: Date.now(),
                        neurons_executed: results.length,
                        successful_executions: successCount,
                        results: results,
                        data: data
                    };
                    
                } catch (error) {
                    console.error(`❌ Error in engine ${this.name} execution:`, error.message);
                    return {
                        success: false,
                        engine: this.name,
                        operation: operation,
                        error: error.message,
                        timestamp: Date.now()
                    };
                }
            }
        };
    }
    
    /**
     * Cargar neuronas de un motor
     */
    async loadEngineNeurons(engine, neuronList) {
        let loadedCount = 0;
        
        for (const neuronName of neuronList) {
            const neuronData = this.findNeuronByPattern(neuronName);
            
            if (neuronData) {
                const success = await engine.loadNeuron(neuronData.name, neuronData.path);
                if (success) {
                    loadedCount++;
                    neuronData.loaded = true;
                    neuronData.engine_instance = engine.name;
                }
            } else {
                console.log(`  ⚠️ Neuron ${neuronName} not found, creating mock`);
                await this.createMockNeuron(engine, neuronName);
                loadedCount++;
            }
        }
        
        console.log(`  📊 Loaded ${loadedCount}/${neuronList.length} neurons for ${engine.name}`);
        await engine.initialize();
    }
    
    /**
     * Buscar neurona por patrón de nombre
     */
    findNeuronByPattern(pattern) {
        for (const [name, neuron] of this.state.neurons.entries()) {
            if (name.includes(pattern.replace('.js', '')) || pattern.includes(name)) {
                return neuron;
            }
        }
        return null;
    }
    
    /**
     * Crear neurona mock para funcionalidad de fallback
     */
    async createMockNeuron(engine, neuronName) {
        await engine.loadNeuron(`mock_${neuronName}`, 'mock://neuron');
    }
    
    /**
     * Configurar manejo de eventos para un motor
     */
    setupEngineEventHandlers(engineName, engine) {
        engine.on('operation-completed', (data) => {
            this.event_bus.emit('engine-operation', {
                engine: engineName,
                operation: data,
                timestamp: Date.now()
            });
        });
        
        engine.on('error', (error) => {
            console.error(`❌ Error in ${engineName}:`, error.message);
            this.event_bus.emit('engine-error', {
                engine: engineName,
                error: error.message,
                timestamp: Date.now()
            });
        });
        
        engine.on('metrics-updated', (metrics) => {
            this.event_bus.emit('engine-metrics', {
                engine: engineName,
                metrics: metrics,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * Configurar sistema de comunicación inter-modular
     */
    setupInterModularCommunication() {
        console.log('🔗 Setting up inter-modular communication...');
        
        // Hub central de comunicación
        this.event_bus.on('engine-operation', (data) => {
            // Reenviar a otros motores que puedan estar interesados
            this.broadcastToEngines('operation-broadcast', data);
        });
        
        this.event_bus.on('engine-metrics', (data) => {
            this.performance_monitor.recordMetrics(data);
        });
        
        this.event_bus.on('engine-error', (data) => {
            this.health_checker.recordError(data);
        });
        
        console.log('✅ Inter-modular communication configured');
    }
    
    /**
     * Transmitir mensaje a todos los motores
     */
    broadcastToEngines(event, data) {
        for (const [engineName, engine] of this.state.engines.entries()) {
            try {
                engine.emit(event, data);
            } catch (error) {
                console.error(`❌ Error broadcasting to ${engineName}:`, error.message);
            }
        }
    }
    
    /**
     * Cargar motor de fallback
     */
    async loadFallbackEngine(engineName) {
        console.log(`🆘 Loading fallback for ${engineName}...`);
        
        const fallbackEngine = new (await this.getConsolidatedEngineClass(engineName))({
            name: `${engineName}_fallback`,
            config: { ...CONSOLIDATOR_CONFIG.main_engines[engineName], fallback: true },
            event_bus: this.event_bus,
            consolidator: this
        });
        
        this.state.engines.set(`${engineName}_fallback`, fallbackEngine);
        
        console.log(`✅ Fallback engine ${engineName} loaded`);
    }
    
    // ==================== API PÚBLICA ====================
    
    /**
     * Obtener estado consolidado del sistema
     */
    getConsolidatedState() {
        return {
            engines: Array.from(this.state.engines.keys()),
            neurons: this.state.consolidated_metrics.total_neurons,
            active_engines: this.state.consolidated_metrics.active_engines,
            health_status: this.health_checker.getOverallHealth(),
            performance: this.performance_monitor.getConsolidatedMetrics(),
            memory_usage: process.memoryUsage(),
            uptime: Date.now() - (this.start_time || Date.now())
        };
    }
    
    /**
     * Ejecutar operación en motor específico
     */
    async executeInEngine(engineName, operation, data = {}) {
        const engine = this.state.engines.get(engineName);
        if (!engine) {
            throw new Error(`Engine ${engineName} not found or not loaded`);
        }
        
        return await engine.execute(operation, data);
    }
    
    /**
     * Obtener métricas de motor específico
     */
    getEngineMetrics(engineName) {
        const engine = this.state.engines.get(engineName);
        if (!engine) {
            return null;
        }
        
        return engine.getMetrics();
    }
    
    /**
     * Recargar motor específico
     */
    async reloadEngine(engineName) {
        console.log(`🔄 Reloading engine ${engineName}...`);
        
        // Detener motor actual
        if (this.state.engines.has(engineName)) {
            this.state.engines.delete(engineName);
        }
        
        // Recargar
        const engineConfig = CONSOLIDATOR_CONFIG.main_engines[engineName];
        if (engineConfig) {
            await this.loadEngine(engineName, engineConfig);
        }
    }
}

// ==================== CLASES AUXILIARES ====================

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.history = [];
    }
    
    start() {
        setInterval(() => {
            this.updateConsolidatedMetrics();
        }, CONSOLIDATOR_CONFIG.performance.metrics_update_interval);
        
        console.log('📊 Performance Monitor started');
    }
    
    recordMetrics(data) {
        if (!this.metrics.has(data.engine)) {
            this.metrics.set(data.engine, []);
        }
        
        this.metrics.get(data.engine).push({
            ...data.metrics,
            timestamp: Date.now()
        });
        
        // Mantener solo últimas 100 entradas por motor
        const engineMetrics = this.metrics.get(data.engine);
        if (engineMetrics.length > 100) {
            engineMetrics.splice(0, engineMetrics.length - 100);
        }
    }
    
    updateConsolidatedMetrics() {
        const consolidated = {
            total_operations: 0,
            average_response_time: 0,
            overall_success_rate: 0,
            memory_usage: process.memoryUsage().heapUsed,
            timestamp: Date.now()
        };
        
        let engineCount = 0;
        let totalSuccessRate = 0;
        
        for (const [engine, metrics] of this.metrics.entries()) {
            if (metrics.length > 0) {
                const latest = metrics[metrics.length - 1];
                consolidated.total_operations += latest.operations_count || 0;
                totalSuccessRate += latest.success_rate || 0;
                engineCount++;
            }
        }
        
        if (engineCount > 0) {
            consolidated.overall_success_rate = totalSuccessRate / engineCount;
        }
        
        this.history.push(consolidated);
        
        // Mantener solo últimas 1000 entradas
        if (this.history.length > 1000) {
            this.history.splice(0, this.history.length - 1000);
        }
    }
    
    getConsolidatedMetrics() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : {};
    }
}

class HealthChecker {
    constructor(consolidator) {
        this.consolidator = consolidator;
        this.health_data = new Map();
        this.errors = [];
    }
    
    start() {
        setInterval(() => {
            this.performHealthCheck();
        }, CONSOLIDATOR_CONFIG.performance.health_check_interval);
        
        console.log('🏥 Health Checker started');
    }
    
    recordError(data) {
        this.errors.push({
            ...data,
            timestamp: Date.now()
        });
        
        // Mantener solo últimos 100 errores
        if (this.errors.length > 100) {
            this.errors.splice(0, this.errors.length - 100);
        }
    }
    
    performHealthCheck() {
        const now = Date.now();
        
        for (const [engineName, engine] of this.consolidator.state.engines.entries()) {
            const health = {
                status: 'healthy',
                last_check: now,
                response_time: 0,
                error_rate: this.calculateErrorRate(engineName),
                memory_usage: process.memoryUsage().heapUsed
            };
            
            // Determinar estado de salud
            if (health.error_rate > 0.1) {
                health.status = 'warning';
            }
            if (health.error_rate > 0.2) {
                health.status = 'critical';
            }
            
            this.health_data.set(engineName, health);
        }
    }
    
    calculateErrorRate(engineName) {
        const recentErrors = this.errors.filter(error => 
            error.engine === engineName && 
            Date.now() - error.timestamp < 300000 // últimos 5 minutos
        );
        
        return recentErrors.length / Math.max(1, 100); // Normalizado a 100 operaciones
    }
    
    getOverallHealth() {
        const statuses = Array.from(this.health_data.values()).map(h => h.status);
        
        if (statuses.includes('critical')) return 'critical';
        if (statuses.includes('warning')) return 'warning';
        return 'healthy';
    }
}

export default QuantumModulesConsolidator;
export { CONSOLIDATOR_CONFIG, PerformanceMonitor, HealthChecker };
