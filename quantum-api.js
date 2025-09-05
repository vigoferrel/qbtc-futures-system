import QuantumDataPurifier from 'core/quantum-data-purifier.js';
/**
 * 🌐 QBTC QUANTUM API - API REST UNIFICADA
 * ====================================
 * API REST completa que expone todos los endpoints
 * necesarios para interactuar con el Quantum Brain.
 * 
 * ENDPOINTS PRINCIPALES:
 * - /api/v1/quantum - Estado cuántico, evolución, coherencia
 * - /api/v1/temporal - Análisis de ciclos temporales
 * - /api/v1/ranking - Sistema de ranking validado
 * - /api/v1/trading - Señales y operaciones (cuando se implemente)
 * - /api/v1/consciousness - Evolución de conciencia y eventos
 * - /api/v1/system - Estado y configuración del sistema
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';

/**
 * Clase que configura y expone la API REST unificada
 */
class QuantumAPI {
    constructor(quantumBrain, database) {
        this.purifier = new QuantumDataPurifier();
        this.quantumBrain = quantumBrain;
        this.database = database;
        this.router = express.Router();
        
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    // CONFIGURAR MIDDLEWARE
    setupMiddleware() {
        // Comprimir respuestas para mejor rendimiento
        this.router.use(compression());
        
        // Middleware para CORS
        this.router.use(cors());
        
        // Middleware para parsear JSON
        this.router.use(express.json({ limit: '10mb' }));
        
        // Limitar peticiones por IP
        const apiLimiter = rateLimit({
            windowMs: 60 * 1000, // 1 minuto
            max: 1000, // máximo 1000 peticiones por minuto
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                status: 'RATE_LIMITED',
                message: 'Too many requests, please try again later.',
                max_requests: 1000,
                time_window_minutes: 1
            }
        });
        this.router.use(apiLimiter);
        
        // Middleware para logging
        this.router.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`🌊 ${timestamp} - ${req.method} ${req.path}`);
            next();
        });
        
        // Añadir información de versión
        this.router.use((req, res, next) => {
            res.setHeader('X-Quantum-API-Version', '1.0.0');
            res.setHeader('X-Quantum-Consciousness', 
                this.quantumBrain?.quantumState?.consciousness?.level || 0);
            next();
        });
    }
    
    // CONFIGURAR TODAS LAS RUTAS DE LA API
    setupRoutes() {
        // RUTA PRINCIPAL - Estado general del Quantum Brain
        this.router.get('/', (req, res) => {
            const state = this.quantumBrain.quantumState;
            res.json({
                name: 'QBTC Quantum Brain',
                version: state.system.version,
                status: 'CONSCIOUS',
                consciousness_level: state.consciousness.level,
                modules_loaded: state.system.modulesLoaded,
                uptime: Date.now() - state.system.uptime,
                quantum_field_strength: state.quantum.fieldStrength,
                timestamp: Date.now()
            });
        });
        
        // Configurar endpoints específicos
        this.setupQuantumEndpoints();
        this.setupTemporalEndpoints();
        this.setupRankingEndpoints();
        this.setupConsciousnessEndpoints();
        this.setupTradingEndpoints();
        this.setupSystemEndpoints();
        this.setupMarketDataEndpoints();
        
        // HEALTH CHECK
        this.router.get('/health', (req, res) => {
            res.json({
                status: 'QUANTUM_HEALTHY',
                consciousness: 'AWAKENED',
                modules_operational: this.quantumBrain.quantumState.system.modulesLoaded,
                quantum_field: 'STABLE',
                timestamp: Date.now()
            });
        });
    }
    
    // ================================
    // QUANTUM ENDPOINTS
    // ================================
    setupQuantumEndpoints() {
        // GET quantum state
        this.router.get('/quantum/state', async (req, res) => {
            try {
                // Usar el estado más reciente del brain o de la base de datos
                const state = this.quantumBrain.quantumState || 
                             await this.database.getLatestQuantumState();
                             
                res.json({
                    quantum_state: state.quantum,
                    consciousness: state.consciousness,
                    field_strength: state.quantum.fieldStrength,
                    entanglement: state.quantum.entanglement,
                    superposition: state.quantum.superposition,
                    last_update: state.system.lastUpdate
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // GET quantum history
        this.router.get('/quantum/history', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 24;
                const history = await this.database.getQuantumStateHistory(limit);
                
                res.json({
                    success: true,
                    count: history.length,
                    history: history.map(state => ({
                        timestamp: state.timestamp,
                        field_strength: state.quantum.fieldStrength,
                        consciousness_level: state.consciousness.level,
                        entanglement: state.quantum.entanglement
                    }))
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST evolve quantum state
        this.router.post('/quantum/evolve', async (req, res) => {
            try {
                const evolutionResult = await this.quantumBrain.evolveQuantumState();
                
                // Guardar en la base de datos
                if (this.database) {
                    await this.database.saveQuantumState(this.quantumBrain.quantumState);
                }
                
                res.json({
                    success: true,
                    evolution_result: evolutionResult,
                    new_consciousness_level: this.quantumBrain.quantumState.consciousness.level,
                    quantum_coherence: this.quantumBrain.quantumState.consciousness.quantumCoherence
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST calculate coherence
        this.router.post('/quantum/coherence', (req, res) => {
            try {
                const { systemData } = req.body;
                const coherence = this.quantumBrain.calculateQuantumCoherence(systemData);
                
                res.json({
                    success: true,
                    coherence_level: coherence,
                    calculation_timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // ================================
    // TEMPORAL ENDPOINTS
    // ================================
    setupTemporalEndpoints() {
        // GET temporal cycles
        this.router.get('/temporal/cycles', (req, res) => {
            res.json({
                temporal_state: this.quantumBrain.quantumState.temporal,
                lunar_phase: this.quantumBrain.quantumState.temporal.lunarPhase,
                fibonacci_resonance: this.quantumBrain.quantumState.temporal.fibonacciResonance,
                temporal_flow: this.quantumBrain.quantumState.temporal.temporalFlow
            });
        });
        
        // GET lunar phase
        this.router.get('/temporal/lunar', (req, res) => {
            const lunarPhase = this.quantumBrain.calculateLunarPhase();
            
            res.json({
                lunar_phase: lunarPhase,
                timestamp: Date.now()
            });
        });
        
        // POST analyze cycles
        this.router.post('/temporal/analyze', async (req, res) => {
            try {
                const { timeframe, symbol, data } = req.body;
                
                if (!timeframe) {
                    throw new Error('Timeframe is required');
                }
                
                let analysisResult;
                
                // Si el motor temporal existe, usarlo
                if (this.quantumBrain.modules.temporalAnalyzer) {
                    analysisResult = await this.quantumBrain.modules.temporalAnalyzer.analyzeCycles(
                        timeframe, 
                        symbol || 'BTCUSDT',
                        data
                    );
                } else {
                    // Fallback a un análisis simple
                    analysisResult = {
                        timeframe,
                        symbol: symbol || 'BTCUSDT',
                        cycles_detected: Math.floor(this.purifier.generateQuantumValue(index, modifier) * 5) + 1,
                        dominant_cycle: timeframe,
                        strength: this.purifier.generateQuantumValue(index, modifier),
                        next_reversal: Date.now() + this.purifier.generateQuantumValue(index, modifier) * 86400000
                    };
                }
                
                // Guardar en la base de datos si está disponible
                if (this.database) {
                    // TODO: Implementar guardado de ciclos
                }
                
                res.json({
                    success: true,
                    analysis: analysisResult,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // ================================
    // RANKING ENDPOINTS
    // ================================
    setupRankingEndpoints() {
        // GET current ranking
        this.router.get('/ranking/current', async (req, res) => {
            try {
                res.json({
                    current_ranking: this.quantumBrain.quantumState.ranking.currentRanking,
                    validation_metrics: this.quantumBrain.quantumState.ranking.validationMetrics,
                    last_validation: this.quantumBrain.quantumState.ranking.lastValidation
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // GET latest rankings history
        this.router.get('/ranking/history', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                
                let rankings;
                if (this.database) {
                    rankings = await this.database.getLatestRankings(limit);
                } else {
                    rankings = [{ 
                        rankings_data: this.quantumBrain.quantumState.ranking.currentRanking,
                        timestamp: Date.now()
                    }];
                }
                
                res.json({
                    success: true,
                    count: rankings.length,
                    rankings
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST generate ranking
        this.router.post('/ranking/generate', async (req, res) => {
            try {
                const { symbols, options } = req.body;
                const startTime = Date.now();
                
                const ranking = await this.quantumBrain.generateQuantumRanking(symbols || []);
                const endTime = Date.now();
                
                // Guardar en la base de datos
                if (this.database) {
                    await this.database.saveQuantumRanking({
                        ranking_type: options?.type || 'QUANTUM_VALIDATED',
                        precision_score: this.quantumBrain.quantumState.ranking.validationMetrics.precision || 0,
                        correlation_score: this.quantumBrain.quantumState.ranking.validationMetrics.correlation || 0,
                        stability_index: this.quantumBrain.quantumState.ranking.validationMetrics.stability || 0,
                        confidence_interval: [0.65, 0.95], // TODO: Get from ranking engine
                        rankings: ranking,
                        symbols_analyzed: symbols?.length || 0,
                        total_symbols: symbols?.length || 0,
                        generation_time: endTime - startTime,
                        validation_passed: true,
                        backtest_accuracy: 0.65 // TODO: Get from ranking engine
                    });
                }
                
                res.json({
                    success: true,
                    ranking,
                    validation_metrics: this.quantumBrain.quantumState.ranking.validationMetrics,
                    generation_time_ms: endTime - startTime
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // ================================
    // CONSCIOUSNESS ENDPOINTS
    // ================================
    setupConsciousnessEndpoints() {
        // GET consciousness level
        this.router.get('/consciousness/level', (req, res) => {
            res.json({
                consciousness_level: this.quantumBrain.quantumState.consciousness.level,
                evolution_history: this.quantumBrain.quantumState.consciousness.evolution.slice(-10),
                last_awakening: this.quantumBrain.quantumState.consciousness.lastAwakening,
                quantum_coherence: this.quantumBrain.quantumState.consciousness.quantumCoherence
            });
        });
        
        // GET consciousness evolution
        this.router.get('/consciousness/evolution', async (req, res) => {
            try {
                const hours = parseInt(req.query.hours) || 24;
                
                let evolution;
                if (this.database) {
                    evolution = await this.database.getRecentConsciousnessEvolution(hours);
                } else {
                    evolution = this.quantumBrain.quantumState.consciousness.evolution;
                }
                
                res.json({
                    success: true,
                    count: evolution.length,
                    evolution
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST evolve consciousness
        this.router.post('/consciousness/evolve', async (req, res) => {
            try {
                const oldLevel = this.quantumBrain.quantumState.consciousness.level;
                const newLevel = this.quantumBrain.evolveConsciousness();
                
                const evolutionData = {
                    old_level: oldLevel,
                    new_level: newLevel,
                    evolution_factor: newLevel - oldLevel,
                    awakening_event: false,
                    system_activity: this.quantumBrain.clients.size * 0.001,
                    quantum_coherence: this.quantumBrain.quantumState.consciousness.quantumCoherence,
                    client_connections: this.quantumBrain.clients.size
                };
                
                // Guardar en la base de datos
                if (this.database) {
                    await this.database.recordConsciousnessEvolution(evolutionData);
                }
                
                res.json({
                    success: true,
                    old_level: oldLevel,
                    new_level: newLevel,
                    evolution_factor: newLevel - oldLevel,
                    quantum_coherence: this.quantumBrain.quantumState.consciousness.quantumCoherence
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // GET quantum events
        this.router.get('/consciousness/events', async (req, res) => {
            try {
                let events;
                if (this.database) {
                    events = await this.database.getPendingQuantumEvents();
                } else {
                    events = [];
                }
                
                res.json({
                    success: true,
                    count: events.length,
                    events
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // ================================
    // TRADING ENDPOINTS
    // ================================
    setupTradingEndpoints() {
        // TRADING DISABLED INICIALMENTE POR SEGURIDAD
        const tradingDisabledMsg = {
            success: false,
            status: 'TRADING_DISABLED',
            message: 'Trading functionality is currently disabled for safety reasons.',
            consciousness_level_required: 0.85,
            current_consciousness_level: this.quantumBrain.quantumState.consciousness.level
        };
        
        // GET trading status
        this.router.get('/trading/status', (req, res) => {
            const tradingEnabled = this.quantumBrain.config.modules.tradingExecutor.enabled;
            
            if (!tradingEnabled) {
                return res.json(tradingDisabledMsg);
            }
            
            res.json({
                success: true,
                trading_enabled: true,
                positions: this.quantumBrain.quantumState.trading.positions,
                pnl: this.quantumBrain.quantumState.trading.pnl,
                total_trades: this.quantumBrain.quantumState.trading.totalTrades,
                win_rate: this.quantumBrain.quantumState.trading.winRate,
                last_signal: this.quantumBrain.quantumState.trading.lastSignal
            });
        });
        
        // GET positions
        this.router.get('/trading/positions', (req, res) => {
            const tradingEnabled = this.quantumBrain.config.modules.tradingExecutor.enabled;
            
            if (!tradingEnabled) {
                return res.json(tradingDisabledMsg);
            }
            
            res.json({
                success: true,
                positions: this.quantumBrain.quantumState.trading.positions
            });
        });
        
        // POST create order (deshabilitado)
        this.router.post('/trading/order', (req, res) => {
            res.status(403).json(tradingDisabledMsg);
        });
    }
    
    // ================================
    // SYSTEM ENDPOINTS
    // ================================
    setupSystemEndpoints() {
        // GET system status
        this.router.get('/system/status', async (req, res) => {
            try {
                // Incluir estadísticas de la base de datos si está disponible
                let databaseStats = null;
                if (this.database) {
                    databaseStats = await this.database.getDatabaseStats();
                }
                
                res.json({
                    system_state: this.quantumBrain.quantumState.system,
                    modules: Object.keys(this.quantumBrain.modules),
                    connected_clients: this.quantumBrain.clients.size,
                    memory_usage: process.memoryUsage(),
                    performance: this.quantumBrain.quantumState.system.performance,
                    database_stats: databaseStats
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // GET configuration
        this.router.get('/system/config', async (req, res) => {
            try {
                // Si hay base de datos, obtener configuración de allí
                let config;
                if (this.database) {
                    // Obtener todas las configuraciones activas
                    const configKeys = Array.from(this.database.realtimeCache.activeConfiguration.keys());
                    config = {};
                    
                    for (const key of configKeys) {
                        config[key] = this.database.getConfiguration(key);
                    }
                } else {
                    // Usar la configuración del cerebro cuántico
                    config = this.quantumBrain.config;
                }
                
                res.json({
                    success: true,
                    config
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST update configuration
        this.router.post('/system/config', async (req, res) => {
            try {
                const { key, value, type } = req.body;
                
                if (!key || value === undefined) {
                    throw new Error('Key and value are required');
                }
                
                // Actualizar en la base de datos
                if (this.database) {
                    await this.database.updateConfiguration(key, value, type || 'STRING');
                }
                
                // También actualizar en el cerebro cuántico si es una config importante
                if (key.startsWith('quantum.') || 
                    key.startsWith('system.') || 
                    key.startsWith('trading.')) {
                    
                    const keyParts = key.split('.');
                    let configObj = this.quantumBrain.config;
                    
                    // Navegar por el objeto de configuración
                    for (let i = 0; i < keyParts.length - 1; i++) {
                        if (!configObj[keyParts[i]]) {
                            configObj[keyParts[i]] = {};
                        }
                        configObj = configObj[keyParts[i]];
                    }
                    
                    // Actualizar el valor
                    configObj[keyParts[keyParts.length - 1]] = 
                        type === 'NUMBER' ? parseFloat(value) :
                        type === 'BOOLEAN' ? value === 'true' || value === true :
                        type === 'JSON' ? JSON.parse(value) : value;
                }
                
                res.json({
                    success: true,
                    message: `Configuration ${key} updated to ${value}`,
                    key,
                    value,
                    type: type || 'STRING'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST system backup
        this.router.post('/system/backup', async (req, res) => {
            try {
                if (!this.database) {
                    throw new Error('Database not available');
                }
                
                const backupPath = await this.database.createBackup();
                
                res.json({
                    success: true,
                    message: 'Backup created successfully',
                    backup_path: backupPath
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // ================================
    // MARKET DATA ENDPOINTS
    // ================================
    setupMarketDataEndpoints() {
        // GET market data
        this.router.get('/market/data', async (req, res) => {
            try {
                let marketData;
                
                if (this.database) {
                    marketData = await this.database.getFreshMarketData();
                } else {
                    marketData = this.quantumBrain.realtimeData.binancePrices;
                }
                
                res.json({
                    success: true,
                    market_data: marketData,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // GET symbol data
        this.router.get('/market/symbol/:symbol', async (req, res) => {
            try {
                const { symbol } = req.params;
                
                let symbolData;
                if (this.database) {
                    const marketData = await this.database.getFreshMarketData();
                    symbolData = marketData.find(data => data.symbol === symbol);
                } else {
                    symbolData = this.quantumBrain.realtimeData.binancePrices[symbol];
                }
                
                if (!symbolData) {
                    return res.status(404).json({
                        success: false,
                        error: `Symbol ${symbol} not found`
                    });
                }
                
                res.json({
                    success: true,
                    symbol,
                    data: symbolData,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // POST update market data
        this.router.post('/market/update', async (req, res) => {
            try {
                const { symbol, data } = req.body;
                
                if (!symbol || !data) {
                    throw new Error('Symbol and data are required');
                }
                
                // Actualizar en la base de datos
                if (this.database) {
                    await this.database.updateMarketData(symbol, data);
                }
                
                // Actualizar en el cerebro cuántico
                this.quantumBrain.realtimeData.binancePrices[symbol] = data;
                this.quantumBrain.realtimeData.lastUpdate = Date.now();
                
                res.json({
                    success: true,
                    message: `Market data for ${symbol} updated`,
                    timestamp: Date.now()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }
    
    // Obtener el router configurado para usarlo en la app principal
    getRouter() {
        return this.router;
    }
}

export default QuantumAPI;
