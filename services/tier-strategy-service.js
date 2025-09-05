#!/usr/bin/env node

/**
 * [TARGET] SERVICIO HTTP PARA TIER STRATEGY GENERATOR ENGINE
 * ===================================================
 * 
 * Servidor HTTP que expone la funcionalidad del Motor Generador de Estrategias por Tiers
 * a través de endpoints REST y WebSocket
 * 
 * Puerto: 14104
 * Endpoints:
 * - GET /health - Health check
 * - GET /status - Estado completo del motor
 * - GET /api/strategies - Todas las estrategias activas
 * - GET /api/strategies/tier/:tier - Estrategias por tier específico
 * - GET /api/strategies/symbol/:symbol - Estrategias para símbolo específico
 * - GET /api/tier-performance - Análisis de performance por tiers
 * - GET /api/market-alignment - Alineación de estrategias con mercado
 * - POST /api/generate-strategy - Generar nueva estrategia
 * - POST /api/optimize-strategy - Optimizar estrategia existente
 * - POST /api/validate-strategy - Validar estrategia
 * - PUT /api/strategies/:id - Actualizar estrategia
 * - DELETE /api/strategies/:id - Eliminar estrategia
 * - WebSocket /ws - Updates de estrategias en tiempo real
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import TierStrategyGenerator from '../engines/tier-strategy-generator.js';

const PORT = 14104;
const app = express();
const server = createServer(app);

// Instancia del generador de estrategias
let strategyGenerator = null;
let isInitializing = false;

// Configurar middleware
app.use(express.json());
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[TARGET] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// [HOSPITAL] HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const status = strategyGenerator ? 'healthy' : (isInitializing ? 'initializing' : 'not_ready');
    
    res.json({
        status,
        service: 'Tier Strategy Generator',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        engine_active: !!strategyGenerator,
        initializing: isInitializing,
        active_strategies: strategyGenerator ? strategyGenerator.getActiveStrategiesCount() : 0
    });
});

// [CHART] STATUS ENDPOINT
app.get('/status', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized',
            status: 'service_unavailable'
        });
    }

    try {
        const status = strategyGenerator.getSystemStatus();
        
        res.json({
            status: 'active',
            timestamp: new Date().toISOString(),
            system_status: status,
            service_info: {
                port: PORT,
                uptime: process.uptime(),
                version: '1.0.0'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving status',
            message: error.message
        });
    }
});

// [TARGET] ALL STRATEGIES ENDPOINT
app.get('/api/strategies', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { tier, status, type, limit = 100 } = req.query;
        const filters = {};
        
        if (tier) filters.tier = tier;
        if (status) filters.status = status;
        if (type) filters.type = type;
        
        const strategies = strategyGenerator.getStrategies(filters, parseInt(limit));
        
        res.json({
            strategies,
            total_strategies: strategies.length,
            filters_applied: filters,
            system_metrics: {
                total_active_strategies: strategyGenerator.getActiveStrategiesCount(),
                tier_distribution: strategyGenerator.getTierDistribution(),
                performance_summary: strategyGenerator.getPerformanceSummary()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving strategies',
            message: error.message
        });
    }
});

// [TROPHY] STRATEGIES BY TIER ENDPOINT
app.get('/api/strategies/tier/:tier', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { tier } = req.params;
        const { status, limit = 50 } = req.query;
        
        const validTiers = ['TIER1', 'TIER2', 'TIER3', 'TIER4'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                error: 'Invalid tier',
                valid_tiers: validTiers
            });
        }
        
        const strategies = strategyGenerator.getStrategiesByTier(tier, { status, limit: parseInt(limit) });
        
        res.json({
            tier,
            strategies,
            total_strategies: strategies.length,
            tier_metrics: strategyGenerator.getTierMetrics(tier),
            performance_analysis: strategyGenerator.getTierPerformance(tier),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving tier strategies',
            message: error.message
        });
    }
});

// [TREND_UP] STRATEGIES BY SYMBOL ENDPOINT
app.get('/api/strategies/symbol/:symbol', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { symbol } = req.params;
        const { status, limit = 20 } = req.query;
        
        const strategies = strategyGenerator.getStrategiesBySymbol(symbol, { status, limit: parseInt(limit) });
        
        res.json({
            symbol,
            strategies,
            total_strategies: strategies.length,
            symbol_analysis: strategyGenerator.getSymbolAnalysis(symbol),
            market_conditions: strategyGenerator.getMarketConditionsForSymbol(symbol),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving symbol strategies',
            message: error.message
        });
    }
});

// [CHART] TIER PERFORMANCE ENDPOINT
app.get('/api/tier-performance', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { timeframe = '24h' } = req.query;
        const performance = strategyGenerator.getTierPerformanceAnalysis(timeframe);
        
        res.json({
            timeframe,
            tier_performance: performance,
            global_metrics: strategyGenerator.getGlobalPerformanceMetrics(),
            market_alignment: strategyGenerator.getMarketAlignmentScore(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving tier performance',
            message: error.message
        });
    }
});

// [TARGET] MARKET ALIGNMENT ENDPOINT
app.get('/api/market-alignment', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const alignment = strategyGenerator.getMarketAlignmentAnalysis();
        
        res.json({
            market_alignment: alignment,
            alignment_score: strategyGenerator.getMarketAlignmentScore(),
            recommendations: strategyGenerator.getAlignmentRecommendations(),
            strategy_adjustments: strategyGenerator.getRecommendedAdjustments(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving market alignment',
            message: error.message
        });
    }
});

// 🆕 GENERATE STRATEGY ENDPOINT
app.post('/api/generate-strategy', async (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const {
            symbol,
            tier,
            strategy_type = 'ADAPTIVE',
            market_conditions = {},
            risk_parameters = {},
            optimization_target = 'BALANCED'
        } = req.body;
        
        if (!symbol || !tier) {
            return res.status(400).json({
                error: 'Symbol and tier are required',
                usage: 'POST /api/generate-strategy with {"symbol": "BTCUSDT", "tier": "TIER1", "strategy_type": "ADAPTIVE"}'
            });
        }
        
        const validTiers = ['TIER1', 'TIER2', 'TIER3', 'TIER4'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                error: 'Invalid tier',
                valid_tiers: validTiers
            });
        }
        
        const strategyRequest = {
            symbol,
            tier,
            strategy_type,
            market_conditions,
            risk_parameters,
            optimization_target
        };
        
        const newStrategy = await strategyGenerator.generateStrategy(strategyRequest);
        
        res.json({
            success: true,
            strategy: newStrategy,
            generation_info: {
                strategy_id: newStrategy.id,
                tier,
                symbol,
                strategy_type,
                optimization_target
            },
            validation: strategyGenerator.validateStrategy(newStrategy),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error generating strategy',
            message: error.message
        });
    }
});

// [WRENCH] OPTIMIZE STRATEGY ENDPOINT
app.post('/api/optimize-strategy', async (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const {
            strategy_id,
            optimization_type = 'PERFORMANCE',
            market_data = {},
            constraints = {}
        } = req.body;
        
        if (!strategy_id) {
            return res.status(400).json({
                error: 'Strategy ID is required',
                usage: 'POST /api/optimize-strategy with {"strategy_id": "strategy_123", "optimization_type": "PERFORMANCE"}'
            });
        }
        
        const optimizationRequest = {
            strategy_id,
            optimization_type,
            market_data,
            constraints
        };
        
        const optimizedStrategy = await strategyGenerator.optimizeStrategy(optimizationRequest);
        
        res.json({
            success: true,
            original_strategy_id: strategy_id,
            optimized_strategy: optimizedStrategy,
            optimization_results: strategyGenerator.getOptimizationResults(strategy_id),
            performance_comparison: strategyGenerator.compareStrategies(strategy_id, optimizedStrategy.id),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error optimizing strategy',
            message: error.message
        });
    }
});

// [CHECK] VALIDATE STRATEGY ENDPOINT
app.post('/api/validate-strategy', (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { strategy, validation_type = 'FULL' } = req.body;
        
        if (!strategy) {
            return res.status(400).json({
                error: 'Strategy object is required',
                usage: 'POST /api/validate-strategy with {"strategy": {...}, "validation_type": "FULL"}'
            });
        }
        
        const validation = strategyGenerator.validateStrategy(strategy, validation_type);
        
        res.json({
            validation_results: validation,
            is_valid: validation.is_valid,
            validation_type,
            issues_found: validation.issues?.length || 0,
            recommendations: validation.recommendations || [],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error validating strategy',
            message: error.message
        });
    }
});

// [REFRESH] UPDATE STRATEGY ENDPOINT
app.put('/api/strategies/:id', async (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { id } = req.params;
        const strategyUpdates = req.body;
        
        const updatedStrategy = await strategyGenerator.updateStrategy(id, strategyUpdates);
        
        res.json({
            success: true,
            strategy_id: id,
            updated_strategy: updatedStrategy,
            validation: strategyGenerator.validateStrategy(updatedStrategy),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                error: 'Strategy not found',
                strategy_id: req.params.id
            });
        } else {
            res.status(500).json({
                error: 'Error updating strategy',
                message: error.message
            });
        }
    }
});

// [X] DELETE STRATEGY ENDPOINT
app.delete('/api/strategies/:id', async (req, res) => {
    if (!strategyGenerator) {
        return res.status(503).json({
            error: 'Strategy Generator not initialized'
        });
    }

    try {
        const { id } = req.params;
        
        const deletedStrategy = await strategyGenerator.deleteStrategy(id);
        
        res.json({
            success: true,
            strategy_id: id,
            deleted_strategy: deletedStrategy,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                error: 'Strategy not found',
                strategy_id: req.params.id
            });
        } else {
            res.status(500).json({
                error: 'Error deleting strategy',
                message: error.message
            });
        }
    }
});

// [WRENCH] CONFIGURAR WEBSOCKET
function setupWebSocket() {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[LINK] Nueva conexión WebSocket al Tier Strategy Generator');
        
        // Enviar estado inicial
        if (strategyGenerator) {
            try {
                ws.send(JSON.stringify({
                    type: 'initial_state',
                    data: strategyGenerator.getSystemStatus(),
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error('[X] Error enviando estado inicial:', error.message);
            }
        }

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleWebSocketMessage(data, ws);
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid JSON message',
                    timestamp: new Date().toISOString()
                }));
            }
        });

        ws.on('close', () => {
            console.log('🔌 Conexión WebSocket cerrada');
        });

        ws.on('error', (error) => {
            console.error('[X] Error WebSocket:', error.message);
        });
    });

    // Configurar eventos del generador de estrategias
    if (strategyGenerator) {
        strategyGenerator.on('strategy-generated', (data) => {
            broadcastToClients(wss, {
                type: 'strategy_generated',
                data,
                timestamp: new Date().toISOString()
            });
        });

        strategyGenerator.on('strategy-optimized', (data) => {
            broadcastToClients(wss, {
                type: 'strategy_optimized',
                data,
                timestamp: new Date().toISOString()
            });
        });

        strategyGenerator.on('performance-update', (data) => {
            broadcastToClients(wss, {
                type: 'performance_update',
                data,
                timestamp: new Date().toISOString()
            });
        });
    }

    return wss;
}

// 📨 MANEJAR MENSAJES WEBSOCKET
function handleWebSocketMessage(data, ws) {
    switch (data.type) {
        case 'get_status':
            if (strategyGenerator) {
                ws.send(JSON.stringify({
                    type: 'status',
                    data: strategyGenerator.getSystemStatus(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_strategies':
            if (strategyGenerator) {
                const filters = data.filters || {};
                ws.send(JSON.stringify({
                    type: 'strategies',
                    data: strategyGenerator.getStrategies(filters),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_tier_performance':
            if (strategyGenerator) {
                ws.send(JSON.stringify({
                    type: 'tier_performance',
                    data: strategyGenerator.getTierPerformanceAnalysis(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'generate_strategy':
            if (strategyGenerator && data.request) {
                strategyGenerator.generateStrategy(data.request).then(strategy => {
                    ws.send(JSON.stringify({
                        type: 'strategy_generated',
                        data: strategy,
                        timestamp: new Date().toISOString()
                    }));
                }).catch(error => {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message,
                        timestamp: new Date().toISOString()
                    }));
                });
            }
            break;
            
        case 'ping':
            ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
            }));
            break;
    }
}

// [SATELLITE] BROADCAST A TODOS LOS CLIENTES
function broadcastToClients(wss, message) {
    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            try {
                client.send(messageStr);
            } catch (error) {
                console.error('[X] Error broadcasting mensaje:', error.message);
            }
        }
    });
}

// [ROCKET] INICIALIZAR SERVICIO
async function initializeService() {
    try {
        console.log('[TARGET] =============== TIER STRATEGY GENERATOR SERVICE STARTUP ===============');
        console.log(`[WRENCH] Initializing Tier Strategy Generator on port ${PORT}...`);
        
        isInitializing = true;
        
        // Inicializar generador de estrategias
        strategyGenerator = new TierStrategyGenerator({
            auto_optimization: true,
            performance_tracking: true,
            real_time_updates: true,
            market_data_integration: true
        });
        
        // Esperar a que el generador se inicialice
        await new Promise((resolve) => {
            strategyGenerator.once('engine-initialized', () => {
                console.log('[CHECK] Tier Strategy Generator inicializado correctamente');
                resolve();
            });
        });
        
        isInitializing = false;
        
        // Configurar WebSocket
        setupWebSocket();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Tier Strategy Generator Service started on port ${PORT}`);
            console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
            console.log(`[CHART] Status endpoint: http://localhost:${PORT}/status`);
            console.log(`[TARGET] All strategies: http://localhost:${PORT}/api/strategies`);
            console.log(`[TROPHY] Tier strategies: http://localhost:${PORT}/api/strategies/tier/:tier`);
            console.log(`[TREND_UP] Symbol strategies: http://localhost:${PORT}/api/strategies/symbol/:symbol`);
            console.log(`[CHART] Tier performance: http://localhost:${PORT}/api/tier-performance`);
            console.log(`[TARGET] Market alignment: http://localhost:${PORT}/api/market-alignment`);
            console.log(`🆕 Generate strategy: POST http://localhost:${PORT}/api/generate-strategy`);
            console.log(`[WRENCH] Optimize strategy: POST http://localhost:${PORT}/api/optimize-strategy`);
            console.log(`[CHECK] Validate strategy: POST http://localhost:${PORT}/api/validate-strategy`);
            console.log(`[CRYSTAL_BALL] WebSocket: ws://localhost:${PORT}/ws`);
            console.log('🛡️ Service ready with tier-based strategy generation\\n');
        });
        
    } catch (error) {
        console.error('[X] Error initializing Tier Strategy Generator Service:', error);
        process.exit(1);
    }
}

// [STOP] MANEJO GRACEFUL DE CIERRE
process.on('SIGINT', async () => {
    console.log('[STOP] Graceful shutdown iniciado...');
    
    if (strategyGenerator) {
        await strategyGenerator.shutdown();
    }
    
    server.close(() => {
        console.log('[CHECK] Tier Strategy Generator Service shutdown completed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, shutting down...');
    
    if (strategyGenerator) {
        await strategyGenerator.shutdown();
    }
    
    server.close(() => {
        process.exit(0);
    });
});

// [ROCKET] INICIAR SERVICIO
initializeService().catch(console.error);

export default { app, server, strategyGenerator };
