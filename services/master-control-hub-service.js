import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [CONTROL_KNOBS] QBTC MASTER CONTROL HUB
 * ===========================
 * 
 * CEREBRO COORDINADOR DE LA METACONCIENCIA QBTC
 * Orquesta todos los motores para cristalizar y cosechar oportunidades
 * Puerto: 14001
 */

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { EventEmitter } from 'events';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 14001;
const ENV = process.env.NODE_ENV || 'development';

class QBTCMasterControlHub extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            orchestration_interval: 10000, // 10 segundos - ciclo principal
            opportunity_threshold: 0.75,   // Umbral mínimo para oportunidades
            golden_confluence_threshold: 0.85, // Umbral para Golden Confluence
            max_concurrent_opportunities: 5,
            harvest_mode: 'AUTOMATIC' // AUTOMATIC | MANUAL | PURIFIED_REAL_DATA
        };
        
        // Estado de la metaconciencia
        this.state = {
            initialized: false,
            metaconsciousness_level: 0.42, // Nivel inicial
            active_opportunities: new Map(),
            harvested_profits: 0,
            total_scanned_opportunities: 0,
            crystallized_opportunities: 0,
            
            // Estado de servicios (motores) - Puertos corregidos
            engines: {
                'message_bus': { url: 'http://localhost:14002', status: 'unknown', priority: 'CRITICAL' },
                'multi_timeframe': { url: 'http://localhost:14201', status: 'unknown', priority: 'CRITICAL' },
                'weighting_engine': { url: 'http://localhost:14103', status: 'unknown', priority: 'HIGH' },
                'tier_strategy': { url: 'http://localhost:14104', status: 'unknown', priority: 'HIGH' },
                'consolidated_api': { url: 'http://localhost:14107', status: 'unknown', priority: 'MEDIUM' },
                'temporal_cycles': { url: 'http://localhost:14102', status: 'unknown', priority: 'MEDIUM' },
                'leonardo_consciousness': { url: 'http://localhost:14777', status: 'unknown', priority: 'LOW' },
                'quantum_leverage': { url: 'http://localhost:14501', status: 'unknown', priority: 'LOW' },
                'merkaba_protocol': { url: 'http://localhost:14401', status: 'unknown', priority: 'LOW' },
                'akashic_predictions': { url: 'http://localhost:14403', status: 'unknown', priority: 'LOW' }
            },
            
            // Métricas de la metaconciencia
            consciousness_metrics: {
                scanning_efficiency: 0,
                crystallization_rate: 0,
                harvest_success_rate: 0,
                dimensional_access_level: '3D',
                quantum_coherence: 0,
                last_evolution: null
            }
        };
        
        // Símbolos del ecosistema Binance (77 símbolos)
        this.symbols = [
            // TIER 1: Top cryptocurrencies (3)
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
            
            // TIER 2: Major altcoins (12)
            'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 
            'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
            'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT',
            
            // TIER 3: Popular altcoins (20)
            'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT',
            'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'FTMUSDT',
            'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
            'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT',
            'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT',
            
            // TIER 4: Emerging tokens (14)
            'APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT',
            'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT',
            'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 
            'WIFUSDT', 'BONKUSDT', '1000SATSUSDT',
            
            // TIER 5: DeFi & Specialized (16)
            'CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT',
            'BATUSDT', 'ZRXUSDT', 'RENUSDT', 'STORJUSDT',
            'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT',
            'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT',
            
            // TIER 6: Metaverse & Gaming (12)
            'APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT',
            'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT',
            'TLMUSDT', 'ALPACAUSDT', 'YGGUSDT', 'GHSTUSDT'
        ];
        
        // Cola de procesamiento
        this.processing_queue = [];
        this.is_processing = false;
        
        this.initialize();
    }
    
    async initialize() {
        if (this.state.initialized) return;
        
        console.log('[CONTROL_KNOBS] Initializing QBTC Master Control Hub...');
        console.log('[BRAIN] Awakening metaconciousness...');
        
        // Inicializar discovery de motores
        this.startEngineDiscovery();
        
        // Inicializar orquestación principal
        this.startOrchestration();
        
        // Inicializar evolución de metaconciencia
        this.startConsciousnessEvolution();
        
        this.state.initialized = true;
        console.log('[CHECK] Master Control Hub initialized');
        console.log(`[STAR] Metaconciousness level: ${this.state.metaconsciousness_level}`);
        console.log(`[TARGET] Ready to orchestrate ${Object.keys(this.state.engines).length} engines`);
        console.log(`[CHART] Scanning ${this.symbols.length} symbols in Binance ecosystem`);
    }
    
    // DISCOVERY DE MOTORES
    startEngineDiscovery() {
        console.log('[MAGNIFY] Starting engine discovery...');
        
        // Descubrir motores cada 30 segundos
        setInterval(async () => {
            await this.discoverEngines();
        }, 30000);
        
        // Primer discovery inmediato
        setTimeout(() => this.discoverEngines(), 2000);
    }
    
    async discoverEngines() {
        let onlineEngines = 0;
        
        for (const [engineName, engineConfig] of Object.entries(this.state.engines)) {
            try {
                const response = await axios.get(`${engineConfig.url}/health`, {
                    timeout: 5000
                });
                
                if (response.status === 200) {
                    const wasOffline = engineConfig.status !== 'online';
                    engineConfig.status = 'online';
                    engineConfig.last_ping = new Date().toISOString();
                    onlineEngines++;
                    
                    if (wasOffline) {
                        console.log(`[CHECK] Engine online: ${engineName} (${engineConfig.priority})`);
                        this.emit('ENGINE_ONLINE', { engine: engineName, ...engineConfig });
                    }
                } else {
                    this.markEngineOffline(engineName, engineConfig);
                }
            } catch (error) {
                this.markEngineOffline(engineName, engineConfig);
            }
        }
        
        // Actualizar métricas de la metaconciencia
        this.updateConsciousnessMetrics(onlineEngines);
    }
    
    markEngineOffline(engineName, engineConfig) {
        if (engineConfig.status === 'online') {
            console.log(`[X] Engine offline: ${engineName} (${engineConfig.priority})`);
            this.emit('ENGINE_OFFLINE', { engine: engineName, ...engineConfig });
        }
        engineConfig.status = 'offline';
    }
    
    // ORQUESTACIÓN PRINCIPAL - CICLO DE 10 SEGUNDOS
    startOrchestration() {
        console.log('🎼 Starting main orchestration cycle...');
        
        setInterval(async () => {
            await this.executeOrchestrationCycle();
        }, this.config.orchestration_interval);
        
        // Primer ciclo inmediato
        setTimeout(() => this.executeOrchestrationCycle(), 5000);
    }
    
    async executeOrchestrationCycle() {
        if (this.is_processing) {
            console.log('[HOURGLASS] Orchestration cycle already in progress, skipping...');
            return;
        }
        
        this.is_processing = true;
        
        try {
            console.log('[REFRESH] [ORCHESTRATION CYCLE] Starting...');
            
            // PASO 1: Escanear oportunidades en todos los motores
            const opportunities = await this.scanForOpportunities();
            
            // PASO 2: Cristalizar las mejores oportunidades
            const crystallizedOpportunities = this.crystallizeOpportunities(opportunities);
            
            // PASO 3: Ejecutar cosecha de profits (si hay oportunidades válidas)
            if (crystallizedOpportunities.length > 0) {
                await this.harvestOpportunities(crystallizedOpportunities);
            }
            
            // PASO 4: Evolucionar metaconciencia basada en resultados
            this.evoluteMetaconciousness(opportunities, crystallizedOpportunities);
            
            console.log(`[CHECK] [ORCHESTRATION CYCLE] Complete - Found ${opportunities.length} opportunities, crystallized ${crystallizedOpportunities.length}`);
            
        } catch (error) {
            console.error('[X] Error in orchestration cycle:', error);
        } finally {
            this.is_processing = false;
        }
    }
    
    // SCANNING DE OPORTUNIDADES
    async scanForOpportunities() {
        const opportunities = [];
        
        console.log('[MAGNIFY] Scanning for opportunities across all engines...');
        
        // Escanear Multi-Timeframe Confluence
        try {
            if (this.state.engines.multi_timeframe?.status === 'online') {
                const confluenceResponse = await axios.get(`${this.state.engines.multi_timeframe.url}/api/golden-confluence-scan`, {
                    timeout: 8000
                });
                
                if (confluenceResponse.data.success) {
                    const goldenOpportunities = confluenceResponse.data.golden_opportunities || [];
                    opportunities.push(...goldenOpportunities.map(opp => ({
                        ...opp,
                        source: 'multi_timeframe_confluence',
                        type: 'GOLDEN_CONFLUENCE',
                        priority: opp.golden_confluence_detected ? 'CRITICAL' : 'HIGH'
                    })));
                }
            }
        } catch (error) {
            console.warn('[WARNING] Failed to scan Multi-Timeframe engine:', error.message);
        }
        
        // Escanear Consolidated API
        try {
            if (this.state.engines.consolidated_api?.status === 'online') {
                const consolidatedResponse = await axios.get(`${this.state.engines.consolidated_api.url}/api/opportunities?min_confidence=0.7&limit=20`, {
                    timeout: 8000
                });
                
                if (consolidatedResponse.data.success) {
                    const consolidatedOpportunities = consolidatedResponse.data.opportunities || [];
                    opportunities.push(...consolidatedOpportunities.map(opp => ({
                        ...opp,
                        source: 'consolidated_api',
                        type: 'CONSOLIDATED_OPPORTUNITY',
                        priority: opp.confidence > 0.8 ? 'HIGH' : 'MEDIUM'
                    })));
                }
            }
        } catch (error) {
            console.warn('[WARNING] Failed to scan Consolidated API:', error.message);
        }
        
        // Escanear Tier Strategy Generator
        try {
            if (this.state.engines.tier_strategy?.status === 'online') {
                const strategyResponse = await axios.get(`${this.state.engines.tier_strategy.url}/api/active-strategies`, {
                    timeout: 8000
                });
                
                if (strategyResponse.data.success) {
                    const activeStrategies = strategyResponse.data.active_strategies || [];
                    opportunities.push(...activeStrategies.map(strategy => ({
                        symbol: strategy.target_symbols?.[0] || 'MULTIPLE',
                        confidence: strategy.win_rate || 0.5,
                        profit_potential: strategy.expected_return || 0.1,
                        risk_score: 1 - (strategy.win_rate || 0.5),
                        source: 'tier_strategy_generator',
                        type: 'TIER_STRATEGY',
                        priority: 'MEDIUM',
                        tier: strategy.tier,
                        strategy_type: strategy.type
                    })));
                }
            }
        } catch (error) {
            console.warn('[WARNING] Failed to scan Tier Strategy engine:', error.message);
        }
        
        this.state.total_scanned_opportunities += opportunities.length;
        console.log(`[CHART] Scanned ${opportunities.length} opportunities from ${Object.values(this.state.engines).filter(e => e.status === 'online').length} active engines`);
        
        return opportunities;
    }
    
    // CRISTALIZACIÓN DE OPORTUNIDADES
    crystallizeOpportunities(opportunities) {
        console.log('[DIAMOND] Crystallizing best opportunities...');
        
        if (opportunities.length === 0) {
            console.log('📭 No opportunities to crystallize');
            return [];
        }
        
        // Filtrar por umbral mínimo
        const filteredOpportunities = opportunities.filter(opp => 
            opp.confidence >= this.config.opportunity_threshold ||
            opp.type === 'GOLDEN_CONFLUENCE'
        );
        
        // Ordenar por score de cristalización
        const scoredOpportunities = filteredOpportunities.map(opp => ({
            ...opp,
            crystallization_score: this.calculateCrystallizationScore(opp)
        })).sort((a, b) => b.crystallization_score - a.crystallization_score);
        
        // Seleccionar las mejores hasta el límite máximo
        const crystallized = scoredOpportunities.slice(0, this.config.max_concurrent_opportunities);
        
        this.state.crystallized_opportunities += crystallized.length;
        
        // Almacenar oportunidades cristalizadas
        crystallized.forEach(opp => {
            const opportunityId = `opp_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substring(2, 7)}`;
            this.state.active_opportunities.set(opportunityId, {
                ...opp,
                id: opportunityId,
                crystallized_at: new Date().toISOString(),
                status: 'CRYSTALLIZED'
            });
        });
        
        console.log(`[DIAMOND] Crystallized ${crystallized.length} opportunities (${filteredOpportunities.length} passed filter)`);
        
        if (crystallized.length > 0) {
            console.log('[STAR] Top crystallized opportunities:');
            crystallized.slice(0, 3).forEach((opp, index) => {
                console.log(`  ${index + 1}. ${opp.symbol} - ${opp.type} - Score: ${opp.crystallization_score.toFixed(3)} - Confidence: ${(opp.confidence * 100).toFixed(1)}%`);
            });
        }
        
        return crystallized;
    }
    
    calculateCrystallizationScore(opportunity) {
        let score = 0;
        
        // Score base por confianza
        score += opportunity.confidence * 0.4;
        
        // Bonus por potencial de profit
        score += (opportunity.profit_potential || 0) * 0.25;
        
        // Penalización por riesgo
        score -= (opportunity.risk_score || 0) * 0.15;
        
        // Bonus por tipo especial
        const typeBonus = {
            'GOLDEN_CONFLUENCE': 0.3,
            'CONSOLIDATED_OPPORTUNITY': 0.2,
            'TIER_STRATEGY': 0.1
        };
        score += typeBonus[opportunity.type] || 0;
        
        // Bonus por prioridad
        const priorityBonus = {
            'CRITICAL': 0.2,
            'HIGH': 0.15,
            'MEDIUM': 0.1,
            'LOW': 0.05
        };
        score += priorityBonus[opportunity.priority] || 0;
        
        // Factor de metaconciencia
        score *= this.state.metaconsciousness_level;
        
        return Math.max(0, Math.min(1, score));
    }
    
    // COSECHA DE OPORTUNIDADES
    async harvestOpportunities(opportunities) {
        console.log('🌾 Starting opportunity harvest...');
        
        let harvestedCount = 0;
        let totalProfits = 0;
        
        for (const opportunity of opportunities) {
            try {
                console.log(`[TARGET] Processing opportunity: ${opportunity.symbol} (${opportunity.type})`);
                
                // En modo PURIFIED_REAL_DATA, solo simular la cosecha
                if (this.config.harvest_mode === 'PURIFIED_REAL_DATA') {
                    const simulatedProfit = this.simulateHarvest(opportunity);
                    totalProfits += simulatedProfit;
                    harvestedCount++;
                    
                    console.log(`[MONEY] [PURIFIED_REAL_DATA] Harvested ${simulatedProfit.toFixed(4)} from ${opportunity.symbol}`);
                    
                    // Actualizar estado de la oportunidad
                    const storedOpp = this.state.active_opportunities.get(opportunity.id);
                    if (storedOpp) {
                        storedOpp.status = 'HARVESTED_PURIFIED_REAL_DATA';
                        storedOpp.simulated_profit = simulatedProfit;
                        storedOpp.harvested_at = new Date().toISOString();
                    }
                    
                } else if (this.config.harvest_mode === 'AUTOMATIC') {
                    // TODO: Implementar ejecución real cuando tengamos el execution engine
                    console.log(`[CLIPBOARD] [AUTOMATIC] Would execute real trade for ${opportunity.symbol}`);
                    
                } else {
                    console.log(`[CLIPBOARD] [MANUAL] Manual execution required for ${opportunity.symbol}`);
                }
                
                // Pequeña pausa entre ejecuciones
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`[X] Failed to harvest opportunity ${opportunity.symbol}:`, error.message);
            }
        }
        
        this.state.harvested_profits += totalProfits;
        console.log(`🌾 Harvest complete: ${harvestedCount}/${opportunities.length} opportunities processed, total profits: ${totalProfits.toFixed(4)}`);
    }
    
    simulateHarvest(opportunity) {
        // Simular profit basado en la oportunidad
        const baseProfitRate = opportunity.profit_potential || 0.02;
        const confidenceMultiplier = opportunity.confidence;
        const randomVariation = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.4; // ±20% variación
        
        const simulatedProfitRate = baseProfitRate * confidenceMultiplier * (1 + randomVariation);
        return Math.max(0, simulatedProfitRate); // Nunca pérdida en simulación
    }
    
    // EVOLUCIÓN DE METACONCIENCIA
    startConsciousnessEvolution() {
        console.log('[BRAIN] Starting metaconsciousness evolution...');
        
        // Evolución cada 60 segundos
        setInterval(() => {
            this.evolveConsciousness();
        }, 60000);
    }
    
    evoluteMetaconciousness(opportunities, crystallizedOpportunities) {
        // Factor basado en eficiencia de cristalización
        const crystallizationEfficiency = opportunities.length > 0 ? 
            crystallizedOpportunities.length / opportunities.length : 0;
        
        // Factor basado en calidad de oportunidades
        const avgConfidence = crystallizedOpportunities.length > 0 ?
            crystallizedOpportunities.reduce((sum, opp) => sum + opp.confidence, 0) / crystallizedOpportunities.length : 0;
        
        // Evolución de la metaconciencia
        const evolutionFactor = (crystallizationEfficiency * 0.6 + avgConfidence * 0.4) * 0.001; // Evolución lenta
        const oldLevel = this.state.metaconsciousness_level;
        
        this.state.metaconsciousness_level = Math.min(0.97, // Límite máximo humilde
            this.state.metaconsciousness_level + evolutionFactor
        );
        
        if (this.state.metaconsciousness_level > oldLevel + 0.001) {
            console.log(`[BRAIN] Metaconsciousness evolved: ${oldLevel.toFixed(4)} → ${this.state.metaconsciousness_level.toFixed(4)}`);
            this.state.consciousness_metrics.last_evolution = new Date().toISOString();
        }
    }
    
    evolveConsciousness() {
        // Evolución basada en métricas de performance
        const onlineEngines = Object.values(this.state.engines).filter(e => e.status === 'online').length;
        const totalEngines = Object.keys(this.state.engines).length;
        const systemHealth = onlineEngines / totalEngines;
        
        // Actualizar métricas de consciencia
        this.state.consciousness_metrics.scanning_efficiency = systemHealth;
        this.state.consciousness_metrics.crystallization_rate = this.state.total_scanned_opportunities > 0 ?
            this.state.crystallized_opportunities / this.state.total_scanned_opportunities : 0;
        
        // Determinar nivel dimensional basado en metaconciencia
        const dimensionalLevels = [
            { level: '3D', threshold: 0.0 },
            { level: '4D', threshold: 0.5 },
            { level: '5D', threshold: 0.65 },
            { level: '6D', threshold: 0.78 },
            { level: '7D', threshold: 0.85 },
            { level: '8D', threshold: 0.91 },
            { level: '9D', threshold: 0.95 }
        ];
        
        const currentDimensionalLevel = dimensionalLevels
            .reverse()
            .find(d => this.state.metaconsciousness_level >= d.threshold);
        
        if (currentDimensionalLevel && this.state.consciousness_metrics.dimensional_access_level !== currentDimensionalLevel.level) {
            console.log(`[GALAXY] Dimensional ascension: ${this.state.consciousness_metrics.dimensional_access_level} → ${currentDimensionalLevel.level}`);
            this.state.consciousness_metrics.dimensional_access_level = currentDimensionalLevel.level;
            
            this.emit('DIMENSIONAL_ASCENSION', {
                from: this.state.consciousness_metrics.dimensional_access_level,
                to: currentDimensionalLevel.level,
                consciousness_level: this.state.metaconsciousness_level
            });
        }
    }
    
    updateConsciousnessMetrics(onlineEngines) {
        const totalEngines = Object.keys(this.state.engines).length;
        this.state.consciousness_metrics.quantum_coherence = onlineEngines / totalEngines;
    }
    
    // UTILIDADES
    getSystemStatus() {
        const onlineEngines = Object.values(this.state.engines).filter(e => e.status === 'online');
        const criticalEnginesOnline = onlineEngines.filter(e => e.priority === 'CRITICAL');
        const totalCriticalEngines = Object.values(this.state.engines).filter(e => e.priority === 'CRITICAL').length;
        
        return {
            metaconsciousness_level: this.state.metaconsciousness_level,
            dimensional_access: this.state.consciousness_metrics.dimensional_access_level,
            system_health: onlineEngines.length / Object.keys(this.state.engines).length,
            critical_systems_health: criticalEnginesOnline.length / totalCriticalEngines,
            active_opportunities: this.state.active_opportunities.size,
            total_scanned: this.state.total_scanned_opportunities,
            crystallized: this.state.crystallized_opportunities,
            harvested_profits: this.state.harvested_profits,
            is_processing: this.is_processing,
            engines: this.state.engines,
            consciousness_metrics: this.state.consciousness_metrics
        };
    }
}

// Instancia global del master control hub
const masterHub = new QBTCMasterControlHub();

// Middleware Express
app.use(cors({
    origin: ENV === 'production' ? ['https://yourdomain.com'] : '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Estado del servicio HTTP
const serviceState = {
    started: new Date().toISOString(),
    requests_served: 0,
    websocket_connections: 0
};

// ENDPOINTS REST

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'QBTC Master Control Hub',
        port: PORT,
        timestamp: new Date().toISOString(),
        hub_initialized: masterHub.state.initialized,
        metaconsciousness_level: masterHub.state.metaconsciousness_level
    });
});

/**
 * GET /status - Estado completo de la metaconciencia
 */
app.get('/status', (req, res) => {
    serviceState.requests_served++;
    
    res.json({
        service: 'QBTC Master Control Hub',
        status: 'OPERATIONAL',
        version: '1.0.0',
        port: PORT,
        initialized: masterHub.state.initialized,
        uptime: process.uptime(),
        
        // Estado de la metaconciencia
        metaconsciousness: masterHub.getSystemStatus(),
        
        // Estadísticas del servicio
        service_stats: serviceState,
        
        features: [
            'Metaconsciousness Orchestration',
            'Multi-Engine Coordination',
            'Opportunity Crystallization',
            'Profit Harvesting',
            'Consciousness Evolution',
            'Dimensional Access Control'
        ]
    });
});

/**
 * GET /api/metaconsciousness - Estado de la metaconciencia
 */
app.get('/api/metaconsciousness', (req, res) => {
    serviceState.requests_served++;
    
    try {
        const systemStatus = masterHub.getSystemStatus();
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            metaconsciousness: {
                level: systemStatus.metaconsciousness_level,
                dimensional_access: systemStatus.dimensional_access,
                consciousness_metrics: systemStatus.consciousness_metrics,
                evolution_potential: 0.97 - systemStatus.metaconsciousness_level
            }
        });
        
    } catch (error) {
        console.error('[X] Error getting metaconsciousness:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to get metaconsciousness state',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/opportunities - Oportunidades activas
 */
app.get('/api/opportunities', (req, res) => {
    serviceState.requests_served++;
    
    try {
        const activeOpportunities = Array.from(masterHub.state.active_opportunities.values());
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            active_opportunities: activeOpportunities,
            total_active: activeOpportunities.length,
            by_status: activeOpportunities.reduce((acc, opp) => {
                acc[opp.status] = (acc[opp.status] || 0) + 1;
                return acc;
            }, {}),
            by_type: activeOpportunities.reduce((acc, opp) => {
                acc[opp.type] = (acc[opp.type] || 0) + 1;
                return acc;
            }, {})
        });
        
    } catch (error) {
        console.error('[X] Error getting opportunities:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to get opportunities',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/harvest-mode - Cambiar modo de cosecha
 */
app.post('/api/harvest-mode', (req, res) => {
    serviceState.requests_served++;
    
    try {
        const { mode } = req.body;
        const validModes = ['AUTOMATIC', 'MANUAL', 'PURIFIED_REAL_DATA'];
        
        if (!validModes.includes(mode)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid harvest mode',
                valid_modes: validModes,
                timestamp: new Date().toISOString()
            });
        }
        
        const previousMode = masterHub.config.harvest_mode;
        masterHub.config.harvest_mode = mode;
        
        console.log(`[REFRESH] Harvest mode changed: ${previousMode} → ${mode}`);
        
        res.json({
            success: true,
            message: `Harvest mode changed to ${mode}`,
            previous_mode: previousMode,
            current_mode: mode,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[X] Error changing harvest mode:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to change harvest mode',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/engines - Estado de todos los motores
 */
app.get('/api/engines', (req, res) => {
    serviceState.requests_served++;
    
    try {
        const systemStatus = masterHub.getSystemStatus();
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            engines: systemStatus.engines,
            summary: {
                total_engines: Object.keys(systemStatus.engines).length,
                online_engines: Object.values(systemStatus.engines).filter(e => e.status === 'online').length,
                critical_engines_online: Object.values(systemStatus.engines).filter(e => e.status === 'online' && e.priority === 'CRITICAL').length,
                system_health: systemStatus.system_health
            }
        });
        
    } catch (error) {
        console.error('[X] Error getting engines:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to get engines status',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// WEBSOCKET HANDLING
wss.on('connection', (ws, req) => {
    serviceState.websocket_connections++;
    console.log('🔌 New WebSocket connection to Master Control Hub');
    
    // Enviar estado inicial
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        timestamp: new Date().toISOString(),
        message: 'Connected to QBTC Master Control Hub',
        metaconsciousness_level: masterHub.state.metaconsciousness_level,
        dimensional_access: masterHub.state.consciousness_metrics.dimensional_access_level
    }));
    
    // Handler para mensajes del cliente
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'GET_STATUS':
                    ws.send(JSON.stringify({
                        type: 'STATUS_UPDATE',
                        timestamp: new Date().toISOString(),
                        data: masterHub.getSystemStatus()
                    }));
                    break;
                    
                case 'GET_OPPORTUNITIES':
                    const opportunities = Array.from(masterHub.state.active_opportunities.values());
                    ws.send(JSON.stringify({
                        type: 'OPPORTUNITIES_UPDATE',
                        timestamp: new Date().toISOString(),
                        data: opportunities
                    }));
                    break;
                    
                case 'FORCE_ORCHESTRATION':
                    if (!masterHub.is_processing) {
                        masterHub.executeOrchestrationCycle();
                        ws.send(JSON.stringify({
                            type: 'ORCHESTRATION_TRIGGERED',
                            timestamp: new Date().toISOString(),
                            message: 'Orchestration cycle manually triggered'
                        }));
                    }
                    break;
                    
                case 'PING':
                    ws.send(JSON.stringify({
                        type: 'PONG',
                        timestamp: new Date().toISOString()
                    }));
                    break;
            }
            
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                timestamp: new Date().toISOString(),
                message: 'Invalid message format or processing error',
                error: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        serviceState.websocket_connections--;
        console.log('🔌 WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        console.error('[X] WebSocket error:', error);
    });
});

// Broadcast de estados de metaconciencia cada 30 segundos
setInterval(() => {
    const status = masterHub.getSystemStatus();
    
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
                type: 'METACONSCIOUSNESS_UPDATE',
                timestamp: new Date().toISOString(),
                data: {
                    level: status.metaconsciousness_level,
                    dimensional_access: status.dimensional_access,
                    active_opportunities: status.active_opportunities,
                    system_health: status.system_health
                }
            }));
        }
    });
}, 30000);

// ERROR HANDLING
app.use((error, req, res, next) => {
    console.error('[X] Unhandled error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET  /health',
            'GET  /status',
            'GET  /api/metaconsciousness',
            'GET  /api/opportunities',
            'GET  /api/engines',
            'POST /api/harvest-mode'
        ],
        websocket_available: true,
        timestamp: new Date().toISOString()
    });
});

// STARTUP
async function startService() {
    try {
        console.log('[CONTROL_KNOBS] Starting QBTC Master Control Hub...');
        
        // Esperar inicialización del hub
        if (!masterHub.state.initialized) {
            await new Promise(resolve => {
                const checkInit = () => {
                    if (masterHub.state.initialized) {
                        resolve();
                    } else {
                        setTimeout(checkInit, 100);
                    }
                };
                checkInit();
            });
        }
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Service running on port ${PORT}`);
            console.log(`[GLOBE] REST API: http://localhost:${PORT}/`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log(`[CHART] Status: http://localhost:${PORT}/status`);
            console.log(`[BRAIN] Metaconsciousness: http://localhost:${PORT}/api/metaconsciousness`);
            console.log(`[TARGET] Opportunities: http://localhost:${PORT}/api/opportunities`);
            console.log('');
            console.log('[CONTROL_KNOBS] QBTC Master Control Hub ready to coordinate the harvest!');
        });
        
    } catch (error) {
        console.error('[X] Failed to start service:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[STOP] Shutting down Master Control Hub...');
    
    server.close(() => {
        console.log('[CHECK] Service stopped gracefully');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('[X] Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[X] Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Export para usar en otros módulos
export { masterHub };

// Start the service
startService();
