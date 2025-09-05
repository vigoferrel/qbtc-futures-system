#!/usr/bin/env node

/**
 * 🌑 HERMETIC AUTO-TRADER SERVER - Portal de Acceso Dimensional
 * ============================================================
 * Servidor HTTP para controlar el sistema de auto-trading hermético
 * - Endpoints REST para control y monitoreo
 * - Dashboard de métricas herméticas
 * - Control de estados dimensionales
 */

import express from 'express';
import cors from 'cors';
import HermeticAutoTrader from './hermetic-auto-trader.js';

const app = express();
const PORT = process.env.HERMETIC_PORT || 4004;

// Middleware
app.use(cors());
app.use(express.json());

// Instancia global del trader hermético
const hermeticTrader = new HermeticAutoTrader();

// Event listeners para logging
hermeticTrader.on('hermetic-trading-started', () => {
    console.log('[GALAXY] Event: Hermetic trading system activated');
});

hermeticTrader.on('hermetic-trade-executed', (trade) => {
    console.log(`[STAR] Event: Hermetic trade executed - ${trade.symbol} ${trade.direction}`);
});

hermeticTrader.on('hermetic-position-closed', (data) => {
    console.log(`🏁 Event: Position closed - PnL: ${(data.pnl * 100).toFixed(2)}%`);
});

hermeticTrader.on('merkaba-activated', () => {
    console.log('[STAR] Event: MERKABA ACTIVATED - Dimensional access granted');
});

hermeticTrader.on('dimensional-ascension', (data) => {
    console.log(`[GALAXY] Event: DIMENSIONAL ASCENSION to ${data.new_dimension}`);
});

hermeticTrader.on('merkaba-hermetic-trade-executed', (trade) => {
    console.log(`[STAR] Event: Merkaba-Hermetic integrated trade - ${trade.symbol} ${trade.direction} (${trade.dimensional_level}D)`);
});

// Event listeners del protocolo Merkaba integrado
hermeticTrader.merkabaProtocol.on('activation-phase-complete', (data) => {
    console.log(`[SPARKLES] Merkaba phase completed: ${data.phase}`);
});

hermeticTrader.merkabaProtocol.on('merkaba-trade-executed', (trade) => {
    console.log(`🔺 Pure Merkaba trade executed: ${trade.symbol} ${trade.direction}`);
});

// Event listeners del sistema Akáshico integrado
hermeticTrader.on('akashic-system-initialized', () => {
    console.log('[CRYSTAL_BALL] Event: Akashic Prediction System initialized and connected');
});

// Event listeners adicionales para el adaptador Akáshico (si están disponibles)
if (hermeticTrader.akashicAdapter && hermeticTrader.akashicAdapter.akashicSystem) {
    hermeticTrader.akashicAdapter.akashicSystem.on('akashic-connected', (data) => {
        console.log(`[GALAXY] Event: Connected to Akashic Records (${(data.connection_quality * 100).toFixed(1)}% quality)`);
    });
    
    hermeticTrader.akashicAdapter.akashicSystem.on('high-confidence-predictions', (predictions) => {
        console.log(`[CRYSTAL_BALL] Event: ${predictions.length} high-confidence Akashic predictions received`);
    });
    
    hermeticTrader.akashicAdapter.akashicSystem.on('prediction-validated', (data) => {
        console.log(`[TARGET] Event: Akashic prediction validation - ${data.was_correct ? 'CORRECT' : 'INCORRECT'}`);
    });
}

// ENDPOINTS DE CONTROL

/**
 * @route GET /api/health
 * @desc Health check del servidor hermético
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'active',
        service: 'hermetic-auto-trader',
        timestamp: Date.now(),
        consciousness_level: hermeticTrader.hermeticState.consciousness_level,
        dimensional_access: hermeticTrader.hermeticState.dimensional_access,
        merkaba_active: hermeticTrader.hermeticState.merkaba_active
    });
});

/**
 * @route POST /api/start
 * @desc Inicia el sistema de trading hermético
 */
app.post('/api/start', async (req, res) => {
    try {
        await hermeticTrader.startHermeticTrading();
        res.json({
            success: true,
            message: 'Hermetic trading system activated',
            status: 'trading_active',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/stop
 * @desc Detiene el sistema de trading hermético
 */
app.post('/api/stop', (req, res) => {
    try {
        hermeticTrader.stopHermeticTrading();
        res.json({
            success: true,
            message: 'Hermetic trading system stopped',
            status: 'trading_stopped',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/status
 * @desc Estado completo del sistema hermético
 */
app.get('/api/status', (req, res) => {
    const performance = hermeticTrader.getHermeticPerformance();
    
    res.json({
        success: true,
        data: {
            trading_active: hermeticTrader.isTrading,
            hermetic_state: hermeticTrader.hermeticState,
            performance: performance,
            signals: hermeticTrader.hermeticSignals,
            timestamp: Date.now()
        }
    });
});

/**
 * @route GET /api/performance
 * @desc Métricas de performance hermética
 */
app.get('/api/performance', (req, res) => {
    const performance = hermeticTrader.getHermeticPerformance();
    
    res.json({
        success: true,
        data: performance,
        timestamp: Date.now()
    });
});

/**
 * @route GET /api/positions
 * @desc Posiciones activas del trader hermético
 */
app.get('/api/positions', (req, res) => {
    const positions = Array.from(hermeticTrader.hermeticState.current_positions.entries())
        .map(([id, position]) => ({
            id,
            ...position,
            current_price: hermeticTrader.getSimulatedPrice(position.symbol),
            unrealized_pnl: hermeticTrader.calculateUnrealizedPnL(
                position, 
                hermeticTrader.getSimulatedPrice(position.symbol)
            )
        }));

    res.json({
        success: true,
        data: {
            total_positions: positions.length,
            max_positions: hermeticTrader.config.max_positions,
            positions: positions
        },
        timestamp: Date.now()
    });
});

/**
 * @route GET /api/signals
 * @desc Señales herméticas actuales
 */
app.get('/api/signals', (req, res) => {
    const alignment = hermeticTrader.calculateMultidimensionalAlignment();
    
    res.json({
        success: true,
        data: {
            signals: hermeticTrader.hermeticSignals,
            alignment: alignment,
            dimensional_access: hermeticTrader.hermeticState.dimensional_access
        },
        timestamp: Date.now()
    });
});

// ENDPOINTS DE CONTROL DIMENSIONAL

/**
 * @route POST /api/merkaba/activate
 * @desc Activa manualmente el Merkaba
 */
app.post('/api/merkaba/activate', (req, res) => {
    try {
        hermeticTrader.activateMerkaba();
        res.json({
            success: true,
            message: 'Merkaba activated',
            consciousness_level: hermeticTrader.hermeticState.consciousness_level,
            dimensional_access: hermeticTrader.hermeticState.dimensional_access,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/consciousness/evolve
 * @desc Evoluciona artificialmente el nivel de consciencia
 */
app.post('/api/consciousness/evolve', (req, res) => {
    const { increment = 0.05 } = req.body;
    
    const oldLevel = hermeticTrader.hermeticState.consciousness_level;
    hermeticTrader.hermeticState.consciousness_level = Math.min(0.97, 
        hermeticTrader.hermeticState.consciousness_level + increment);
    
    res.json({
        success: true,
        message: 'Consciousness evolved',
        old_level: oldLevel,
        new_level: hermeticTrader.hermeticState.consciousness_level,
        increment: increment,
        timestamp: Date.now()
    });
});

/**
 * @route POST /api/alchemy/advance
 * @desc Avanza la fase alquímica manualmente
 */
app.post('/api/alchemy/advance', (req, res) => {
    const oldPhase = hermeticTrader.hermeticState.alchemical_phase;
    hermeticTrader.progressAlchemicalPhase();
    
    res.json({
        success: true,
        message: 'Alchemical phase advanced',
        old_phase: oldPhase,
        new_phase: hermeticTrader.hermeticState.alchemical_phase,
        timestamp: Date.now()
    });
});

/**
 * @route POST /api/positions/:id/close
 * @desc Cierra manualmente una posición específica
 */
app.post('/api/positions/:id/close', async (req, res) => {
    const { id } = req.params;
    const { reason = 'manual_close' } = req.body;
    
    const position = hermeticTrader.hermeticState.current_positions.get(id);
    if (!position) {
        return res.status(404).json({
            success: false,
            error: 'Position not found',
            timestamp: Date.now()
        });
    }
    
    try {
        const closePrice = hermeticTrader.getSimulatedPrice(position.symbol);
        const pnl = await hermeticTrader.closeHermeticPosition(id, reason, closePrice);
        
        res.json({
            success: true,
            message: 'Position closed',
            position_id: id,
            pnl: pnl,
            close_price: closePrice,
            reason: reason,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// ENDPOINTS DE ANÁLISIS

/**
 * @route GET /api/analysis/dimensional
 * @desc Análisis dimensional profundo
 */
app.get('/api/analysis/dimensional', async (req, res) => {
    try {
        const alignment = await hermeticTrader.performHermeticAnalysis();
        
        res.json({
            success: true,
            data: {
                multidimensional_alignment: alignment,
                dimensional_access: hermeticTrader.hermeticState.dimensional_access,
                consciousness_level: hermeticTrader.hermeticState.consciousness_level,
                alchemical_phase: hermeticTrader.hermeticState.alchemical_phase,
                merkaba_active: hermeticTrader.hermeticState.merkaba_active,
                signals_analysis: hermeticTrader.hermeticSignals
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/opportunities
 * @desc Oportunidades de trading herméticas
 */
app.get('/api/opportunities', (req, res) => {
    try {
        const alignment = hermeticTrader.calculateMultidimensionalAlignment();
        const opportunities = hermeticTrader.identifyHermeticOpportunities(alignment);
        
        res.json({
            success: true,
            data: {
                alignment_score: alignment.score,
                total_opportunities: opportunities.length,
                opportunities: opportunities,
                can_trade: opportunities.length > 0 && alignment.score >= 0.65,
                available_positions: hermeticTrader.config.max_positions - hermeticTrader.hermeticState.current_positions.size
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// ENDPOINTS DEL SISTEMA AKÁSHICO

/**
 * @route GET /api/akashic/status
 * @desc Estado del sistema de predicción Akáshica
 */
app.get('/api/akashic/status', (req, res) => {
    try {
        if (!hermeticTrader.akashicAdapter) {
            return res.status(404).json({
                success: false,
                error: 'Akashic system not initialized',
                timestamp: Date.now()
            });
        }
        
        const integrationState = hermeticTrader.akashicAdapter.getIntegrationState();
        
        res.json({
            success: true,
            data: integrationState,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/akashic/predictions
 * @desc Predicciones Akáshicas activas
 */
app.get('/api/akashic/predictions', (req, res) => {
    try {
        if (!hermeticTrader.akashicAdapter || !hermeticTrader.akashicAdapter.integrationState.akashicConnectionActive) {
            return res.status(503).json({
                success: false,
                error: 'Akashic system not connected',
                timestamp: Date.now()
            });
        }
        
        const activePredictions = hermeticTrader.akashicAdapter.getActivePredictions();
        const highConfidencePredictions = activePredictions.filter(p => p.confidence > 0.75);
        
        res.json({
            success: true,
            data: {
                total_predictions: activePredictions.length,
                high_confidence_predictions: highConfidencePredictions.length,
                predictions: activePredictions,
                symbols_covered: [...new Set(activePredictions.map(p => p.symbol))],
                average_confidence: activePredictions.length > 0 ?
                    activePredictions.reduce((sum, p) => sum + p.confidence, 0) / activePredictions.length : 0
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/akashic/predictions/:symbol
 * @desc Predicciones Akáshicas para un símbolo específico
 */
app.get('/api/akashic/predictions/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        
        if (!hermeticTrader.akashicAdapter || !hermeticTrader.akashicAdapter.integrationState.akashicConnectionActive) {
            return res.status(503).json({
                success: false,
                error: 'Akashic system not connected',
                timestamp: Date.now()
            });
        }
        
        const symbolPredictions = hermeticTrader.akashicAdapter.getSymbolPredictions(symbol.toUpperCase());
        
        res.json({
            success: true,
            data: {
                symbol: symbol.toUpperCase(),
                total_predictions: symbolPredictions.length,
                predictions: symbolPredictions
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/akashic/initialize
 * @desc Inicializar manualmente el sistema Akáshico
 */
app.post('/api/akashic/initialize', async (req, res) => {
    try {
        if (!hermeticTrader.akashicAdapter) {
            return res.status(404).json({
                success: false,
                error: 'Akashic adapter not available',
                timestamp: Date.now()
            });
        }
        
        const initialized = await hermeticTrader.akashicAdapter.initialize();
        
        res.json({
            success: initialized,
            message: initialized ? 'Akashic system initialized successfully' : 'Failed to initialize Akashic system',
            integration_state: hermeticTrader.akashicAdapter.getIntegrationState(),
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/akashic/disconnect
 * @desc Desconectar del sistema Akáshico
 */
app.post('/api/akashic/disconnect', (req, res) => {
    try {
        if (!hermeticTrader.akashicAdapter) {
            return res.status(404).json({
                success: false,
                error: 'Akashic adapter not available',
                timestamp: Date.now()
            });
        }
        
        hermeticTrader.akashicAdapter.disconnect();
        
        res.json({
            success: true,
            message: 'Disconnected from Akashic system',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/akashic/settings
 * @desc Configurar ajustes del sistema Akáshico
 */
app.post('/api/akashic/settings', (req, res) => {
    try {
        const { 
            auto_trading, 
            active_symbols, 
            prediction_threshold,
            dimensional_weight 
        } = req.body;
        
        if (!hermeticTrader.akashicAdapter) {
            return res.status(404).json({
                success: false,
                error: 'Akashic adapter not available',
                timestamp: Date.now()
            });
        }
        
        const results = {};
        
        if (typeof auto_trading === 'boolean') {
            results.auto_trading = hermeticTrader.akashicAdapter.setAutoTrading(auto_trading);
        }
        
        if (Array.isArray(active_symbols)) {
            results.active_symbols = hermeticTrader.akashicAdapter.setActiveSymbols(active_symbols);
        }
        
        if (typeof prediction_threshold === 'number' && prediction_threshold >= 0.5 && prediction_threshold <= 0.95) {
            hermeticTrader.akashicAdapter.integrationState.predictionThreshold = prediction_threshold;
            results.prediction_threshold = prediction_threshold;
        }
        
        if (typeof dimensional_weight === 'number' && dimensional_weight >= 0.1 && dimensional_weight <= 0.8) {
            hermeticTrader.akashicAdapter.integrationState.dimensionalWeight = dimensional_weight;
            results.dimensional_weight = dimensional_weight;
        }
        
        res.json({
            success: true,
            message: 'Akashic settings updated',
            updated_settings: results,
            current_state: hermeticTrader.akashicAdapter.getIntegrationState(),
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/akashic/metrics
 * @desc Métricas del sistema Akáshico
 */
app.get('/api/akashic/metrics', (req, res) => {
    try {
        if (!hermeticTrader.akashicAdapter || !hermeticTrader.akashicAdapter.akashicSystem) {
            return res.status(404).json({
                success: false,
                error: 'Akashic system not available',
                timestamp: Date.now()
            });
        }
        
        const akashicMetrics = hermeticTrader.akashicAdapter.akashicSystem.getAkashicMetrics();
        const integrationMetrics = hermeticTrader.akashicAdapter.metrics;
        
        res.json({
            success: true,
            data: {
                akashic_system: akashicMetrics,
                integration: integrationMetrics,
                combined_metrics: {
                    total_akashic_predictions: akashicMetrics.total_predictions,
                    predictions_used_in_trades: integrationMetrics.totalPredictionsUsed,
                    successful_akashic_trades: integrationMetrics.successfulPredictionTrades,
                    akashic_trade_success_rate: integrationMetrics.totalPredictionsUsed > 0 ?
                        integrationMetrics.successfulPredictionTrades / integrationMetrics.totalPredictionsUsed : 0,
                    dimensional_syncs: integrationMetrics.dimensionalSyncs
                }
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// ENDPOINTS DEL PROTOCOLO MERKABA

/**
 * @route GET /api/merkaba/status
 * @desc Estado completo del protocolo Merkaba
 */
app.get('/api/merkaba/status', (req, res) => {
    try {
        const merkabaMetrics = hermeticTrader.merkabaProtocol.getMerkabaMetrics();
        const merkabaState = hermeticTrader.merkabaProtocol.getMerkabaState();
        
        res.json({
            success: true,
            data: {
                metrics: merkabaMetrics,
                full_state: merkabaState,
                integration_status: {
                    hermetic_merkaba_active: hermeticTrader.hermeticState.merkaba_active,
                    protocol_merkaba_active: hermeticTrader.merkabaProtocol.merkabaState.activated,
                    consciousness_sync: hermeticTrader.hermeticState.consciousness_level,
                    dimensional_sync: hermeticTrader.hermeticState.dimensional_access
                }
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/merkaba/deactivate
 * @desc Desactiva el protocolo Merkaba
 */
app.post('/api/merkaba/deactivate', (req, res) => {
    try {
        hermeticTrader.merkabaProtocol.deactivateMerkaba();
        hermeticTrader.hermeticState.merkaba_active = false;
        
        res.json({
            success: true,
            message: 'Merkaba protocol deactivated',
            consciousness_level: hermeticTrader.hermeticState.consciousness_level,
            dimensional_access: hermeticTrader.hermeticState.dimensional_access,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/merkaba/geometries
 * @desc Geometrías sagradas activas
 */
app.get('/api/merkaba/geometries', (req, res) => {
    try {
        const activeGeometries = hermeticTrader.merkabaProtocol.getActiveGeometries();
        const totalMultiplier = hermeticTrader.merkabaProtocol.calculateTotalGeometryMultiplier();
        
        res.json({
            success: true,
            data: {
                active_geometries: activeGeometries,
                total_multiplier: totalMultiplier,
                all_geometries: hermeticTrader.merkabaProtocol.sacredGeometries
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /api/merkaba/dimensions
 * @desc Información sobre dimensiones accesibles
 */
app.get('/api/merkaba/dimensions', (req, res) => {
    try {
        const merkabaMetrics = hermeticTrader.merkabaProtocol.getMerkabaMetrics();
        
        res.json({
            success: true,
            data: {
                current_dimension: merkabaMetrics.dimensional_access,
                available_dimensions: merkabaMetrics.available_dimensions,
                next_dimension: merkabaMetrics.next_dimension,
                dimensional_config: hermeticTrader.merkabaProtocol.dimensionalConfig.dimensions
            },
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * @route POST /api/merkaba/consciousness/set
 * @desc Establece manualmente el nivel de consciencia del Merkaba
 */
app.post('/api/merkaba/consciousness/set', (req, res) => {
    try {
        const { consciousness_level } = req.body;
        
        if (!consciousness_level || consciousness_level < 0 || consciousness_level > 0.97) {
            return res.status(400).json({
                success: false,
                error: 'Invalid consciousness level (must be between 0 and 0.97)',
                timestamp: Date.now()
            });
        }
        
        const oldLevel = hermeticTrader.merkabaProtocol.merkabaState.consciousness_elevation;
        hermeticTrader.merkabaProtocol.merkabaState.consciousness_elevation = consciousness_level;
        hermeticTrader.hermeticState.consciousness_level = consciousness_level;
        
        // Actualizar acceso dimensional basado en nueva consciencia
        hermeticTrader.merkabaProtocol.updateDimensionalAccess();
        
        res.json({
            success: true,
            message: 'Merkaba consciousness level updated',
            old_level: oldLevel,
            new_level: consciousness_level,
            dimensional_access: hermeticTrader.merkabaProtocol.merkabaState.dimensional_access_level,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// DASHBOARD ENDPOINT

/**
 * @route GET /api/dashboard
 * @desc Dashboard completo para frontend
 */
app.get('/api/dashboard', (req, res) => {
    try {
        const performance = hermeticTrader.getHermeticPerformance();
        const alignment = hermeticTrader.calculateMultidimensionalAlignment();
        const opportunities = hermeticTrader.identifyHermeticOpportunities(alignment);
        
        const positions = Array.from(hermeticTrader.hermeticState.current_positions.entries())
            .map(([id, position]) => ({
                id,
                symbol: position.symbol,
                direction: position.direction,
                size: position.size,
                entry_price: position.entry_price,
                current_price: hermeticTrader.getSimulatedPrice(position.symbol),
                unrealized_pnl: hermeticTrader.calculateUnrealizedPnL(
                    position, 
                    hermeticTrader.getSimulatedPrice(position.symbol)
                ),
                type: position.type,
                dimensional_level: position.dimensional_level,
                duration_minutes: (Date.now() - position.entry_time) / 60000
            }));
        
        res.json({
            success: true,
            data: {
                // Estado general
                trading_active: hermeticTrader.isTrading,
                timestamp: Date.now(),
                
                // Estado hermético
                hermetic_state: {
                    consciousness_level: hermeticTrader.hermeticState.consciousness_level,
                    merkaba_active: hermeticTrader.hermeticState.merkaba_active,
                    dimensional_access: hermeticTrader.hermeticState.dimensional_access,
                    alchemical_phase: hermeticTrader.hermeticState.alchemical_phase,
                    quantum_coherence: hermeticTrader.hermeticState.quantum_coherence
                },
                
                // Performance
                performance: {
                    total_profit: performance.total_profit,
                    total_trades: performance.total_trades,
                    profitable_trades: performance.profitable_trades,
                    profitability_rate: performance.profitability_rate,
                    transmutations: performance.transmutations,
                    merkaba_activations: performance.merkaba_activations
                },
                
                // Alineación dimensional
                alignment: {
                    score: alignment.score,
                    aligned_dimensions: alignment.aligned_dimensions,
                    dominant_dimension: alignment.dominant_dimension,
                    harmony_level: alignment.harmony_level
                },
                
                // Señales
                signals: hermeticTrader.hermeticSignals,
                
                // Posiciones
                positions: {
                    total: positions.length,
                    max_allowed: hermeticTrader.config.max_positions,
                    details: positions
                },
                
                // Oportunidades
                opportunities: {
                    total: opportunities.length,
                    can_trade: opportunities.length > 0 && alignment.score >= 0.65,
                    details: opportunities
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// ERROR HANDLER
app.use((error, req, res, next) => {
    console.error('[X] Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: Date.now()
    });
});

// 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        timestamp: Date.now()
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log('🌑 ========================================');
    console.log('🌑   HERMETIC AUTO-TRADER SERVER ACTIVE');
    console.log('🌑 ========================================');
    console.log(`[STAR] Server running on port: ${PORT}`);
    console.log('[CRYSTAL_BALL] Dimensional trading portal opened');
    console.log('⚗️ Alchemical transmutation enabled');
    console.log('[GALAXY] Ready for consciousness evolution');
    console.log('🌑 ========================================');
    console.log('');
    console.log('[SATELLITE] Available endpoints:');
    console.log('   === CORE SYSTEM ===');
    console.log('   GET  /api/health          - Health check');
    console.log('   POST /api/start           - Start trading');
    console.log('   POST /api/stop            - Stop trading');
    console.log('   GET  /api/status          - Full status');
    console.log('   GET  /api/performance     - Performance metrics');
    console.log('   GET  /api/positions       - Active positions');
    console.log('   GET  /api/signals         - Hermetic signals');
    console.log('   GET  /api/dashboard       - Complete dashboard');
    console.log('   GET  /api/opportunities   - Trading opportunities');
    console.log('');
    console.log('   === MERKABA PROTOCOL ===');
    console.log('   POST /api/merkaba/activate - Activate Merkaba');
    console.log('   GET  /api/merkaba/status   - Merkaba status');
    console.log('   GET  /api/merkaba/geometries - Sacred geometries');
    console.log('   GET  /api/merkaba/dimensions - Dimensional info');
    console.log('');
    console.log('   === AKASHIC SYSTEM ===');
    console.log('   GET  /api/akashic/status      - Akashic status');
    console.log('   GET  /api/akashic/predictions - Active predictions');
    console.log('   POST /api/akashic/initialize  - Initialize system');
    console.log('   POST /api/akashic/settings    - Update settings');
    console.log('   GET  /api/akashic/metrics     - Akashic metrics');
    console.log('');
    console.log('[CRYSTAL_BALL] Akashic Prediction System integrated!');
    console.log('[STAR] May the profits flow through dimensional alignment! [STAR]');
});

export default app;
