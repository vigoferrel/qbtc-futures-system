#!/usr/bin/env node

/**
 * [DIAMOND] SERVICIO HTTP PARA MULTIDIMENSIONAL WEIGHTING ENGINE
 * ======================================================
 * 
 * Servidor HTTP que expone la funcionalidad del Motor de Ponderación Multidimensional
 * a través de endpoints REST y WebSocket
 * 
 * Puerto: 14103
 * Endpoints:
 * - GET /health - Health check
 * - GET /status - Estado completo del motor
 * - GET /api/weights - Pesos actuales de todas las dimensiones
 * - GET /api/dimensional-metrics - Métricas dimensionales detalladas
 * - GET /api/sector-analysis - Análisis sectorial completo
 * - GET /api/tier-analysis - Análisis por tiers
 * - POST /api/weights-for-app - Pesos optimizados para aplicación específica
 * - POST /api/adaptive-weights - Forzar adaptación de pesos
 * - WebSocket /ws - Updates de optimización en tiempo real
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import MultidimensionalWeightingEngine from '../engines/multidimensional-weighting-engine.js';

const PORT = 14103;
const app = express();
const server = createServer(app);

// Instancia del motor de ponderación
let weightingEngine = null;
let isInitializing = false;

// Configurar middleware
app.use(express.json());
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[DIAMOND] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// [HOSPITAL] HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const status = weightingEngine ? 'healthy' : (isInitializing ? 'initializing' : 'not_ready');
    
    res.json({
        status,
        service: 'Multidimensional Weighting Engine',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        engine_active: !!weightingEngine,
        initializing: isInitializing,
        dimensions: weightingEngine ? weightingEngine.state.current_weights.size : 0
    });
});

// [CHART] STATUS ENDPOINT
app.get('/status', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized',
            status: 'service_unavailable'
        });
    }

    try {
        const statistics = weightingEngine.getEngineStatistics();
        
        res.json({
            status: 'active',
            timestamp: new Date().toISOString(),
            engine_statistics: statistics,
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

// [SCALES] CURRENT WEIGHTS ENDPOINT
app.get('/api/weights', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const weights = weightingEngine.getCurrentWeights();
        
        res.json({
            current_weights: weights,
            coherence_state: weightingEngine.state.coherence_state,
            quantum_resonance: weightingEngine.state.quantum_resonance,
            multidimensional_efficiency: weightingEngine.state.multidimensional_efficiency,
            total_adaptations: weightingEngine.state.total_adaptations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving weights',
            message: error.message
        });
    }
});

// 📏 DIMENSIONAL METRICS ENDPOINT
app.get('/api/dimensional-metrics', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const metrics = weightingEngine.getDimensionalMetrics();
        
        res.json({
            dimensional_metrics: metrics,
            global_coherence: weightingEngine.state.coherence_state,
            global_resonance: weightingEngine.state.quantum_resonance,
            optimization_cycles: weightingEngine.state.optimization_cycles,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving dimensional metrics',
            message: error.message
        });
    }
});

// [CHART] SECTOR ANALYSIS ENDPOINT
app.get('/api/sector-analysis', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const sectorAnalysis = weightingEngine.getSectorAnalysis();
        
        res.json({
            sector_analysis: sectorAnalysis,
            total_sectors: Object.keys(sectorAnalysis).length,
            market_conditions: {
                coherence_state: weightingEngine.state.coherence_state,
                quantum_resonance: weightingEngine.state.quantum_resonance
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving sector analysis',
            message: error.message
        });
    }
});

// [TARGET] TIER ANALYSIS ENDPOINT
app.get('/api/tier-analysis', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const tierAnalysis = weightingEngine.getTierAnalysis();
        
        res.json({
            tier_analysis: tierAnalysis,
            total_tiers: Object.keys(tierAnalysis).length,
            system_alignment: {
                multidimensional_efficiency: weightingEngine.state.multidimensional_efficiency,
                weight_stability: weightingEngine.state.weight_stability_score
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving tier analysis',
            message: error.message
        });
    }
});

// [TARGET] WEIGHTS FOR APPLICATION ENDPOINT
app.post('/api/weights-for-app', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const { application, context = {} } = req.body;
        
        if (!application) {
            return res.status(400).json({
                error: 'Application parameter is required',
                valid_applications: ['RANKING', 'OPPORTUNITIES', 'STRATEGIES', 'EXECUTION'],
                usage: 'POST /api/weights-for-app with {"application": "RANKING", "context": {"symbol_tier": "TIER1"}}'
            });
        }

        const validApplications = ['RANKING', 'OPPORTUNITIES', 'STRATEGIES', 'EXECUTION'];
        if (!validApplications.includes(application)) {
            return res.status(400).json({
                error: 'Invalid application',
                valid_applications: validApplications
            });
        }

        const optimizedWeights = weightingEngine.getWeightsForApplication(application, context);
        
        res.json({
            application,
            context,
            optimized_weights: optimizedWeights,
            base_weights: weightingEngine.getCurrentWeights(),
            optimization_info: {
                coherence_state: weightingEngine.state.coherence_state,
                quantum_resonance: weightingEngine.state.quantum_resonance,
                multidimensional_efficiency: weightingEngine.state.multidimensional_efficiency
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error calculating application weights',
            message: error.message
        });
    }
});

// [REFRESH] FORCE ADAPTIVE WEIGHTS ENDPOINT
app.post('/api/adaptive-weights', (req, res) => {
    if (!weightingEngine) {
        return res.status(503).json({
            error: 'Weighting Engine not initialized'
        });
    }

    try {
        const beforeWeights = weightingEngine.getCurrentWeights();
        
        // Forzar un ciclo de adaptación
        weightingEngine.performOptimizationCycle().then(() => {
            const afterWeights = weightingEngine.getCurrentWeights();
            
            res.json({
                adaptation_completed: true,
                before_weights: beforeWeights,
                after_weights: afterWeights,
                optimization_info: {
                    coherence_state: weightingEngine.state.coherence_state,
                    quantum_resonance: weightingEngine.state.quantum_resonance,
                    total_adaptations: weightingEngine.state.total_adaptations,
                    optimization_cycles: weightingEngine.state.optimization_cycles
                },
                timestamp: new Date().toISOString()
            });
        }).catch(error => {
            res.status(500).json({
                error: 'Error during adaptive weights optimization',
                message: error.message
            });
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Error initiating adaptive weights',
            message: error.message
        });
    }
});

// [WRENCH] CONFIGURAR WEBSOCKET
function setupWebSocket() {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[LINK] Nueva conexión WebSocket al Multidimensional Weighting Engine');
        
        // Enviar estado inicial
        if (weightingEngine) {
            try {
                ws.send(JSON.stringify({
                    type: 'initial_state',
                    data: weightingEngine.getEngineStatistics(),
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

    // Configurar eventos del motor de ponderación
    if (weightingEngine) {
        weightingEngine.on('optimization-update', (data) => {
            broadcastToClients(wss, {
                type: 'optimization_update',
                data,
                timestamp: new Date().toISOString()
            });
        });

        weightingEngine.on('engine-initialized', (data) => {
            broadcastToClients(wss, {
                type: 'engine_initialized',
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
            if (weightingEngine) {
                ws.send(JSON.stringify({
                    type: 'status',
                    data: weightingEngine.getEngineStatistics(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_weights':
            if (weightingEngine) {
                ws.send(JSON.stringify({
                    type: 'weights',
                    data: weightingEngine.getCurrentWeights(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_dimensional_metrics':
            if (weightingEngine) {
                ws.send(JSON.stringify({
                    type: 'dimensional_metrics',
                    data: weightingEngine.getDimensionalMetrics(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'force_optimization':
            if (weightingEngine) {
                weightingEngine.performOptimizationCycle().then(() => {
                    ws.send(JSON.stringify({
                        type: 'optimization_complete',
                        data: weightingEngine.getCurrentWeights(),
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
        console.log('[DIAMOND] =============== MULTIDIMENSIONAL WEIGHTING ENGINE SERVICE STARTUP ===============');
        console.log(`[WRENCH] Initializing Multidimensional Weighting Engine on port ${PORT}...`);
        
        isInitializing = true;
        
        // Inicializar motor de ponderación
        weightingEngine = new MultidimensionalWeightingEngine({
            background_optimization: true,
            logging_enabled: true,
            performance_tracking: true,
            update_frequency_ms: 30000  // 30 segundos
        });
        
        // Esperar a que el motor se inicialice
        await new Promise((resolve) => {
            weightingEngine.once('engine-initialized', () => {
                console.log('[CHECK] Multidimensional Weighting Engine inicializado correctamente');
                resolve();
            });
        });
        
        isInitializing = false;
        
        // Configurar WebSocket
        setupWebSocket();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Multidimensional Weighting Engine Service started on port ${PORT}`);
            console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
            console.log(`[CHART] Status endpoint: http://localhost:${PORT}/status`);
            console.log(`[SCALES] Weights endpoint: http://localhost:${PORT}/api/weights`);
            console.log(`📏 Dimensional metrics: http://localhost:${PORT}/api/dimensional-metrics`);
            console.log(`[CHART] Sector analysis: http://localhost:${PORT}/api/sector-analysis`);
            console.log(`[TARGET] Tier analysis: http://localhost:${PORT}/api/tier-analysis`);
            console.log(`[TARGET] Application weights: POST http://localhost:${PORT}/api/weights-for-app`);
            console.log(`[REFRESH] Adaptive weights: POST http://localhost:${PORT}/api/adaptive-weights`);
            console.log(`[CRYSTAL_BALL] WebSocket: ws://localhost:${PORT}/ws`);
            console.log('🛡️ Service ready with multidimensional optimization\\n');
        });
        
    } catch (error) {
        console.error('[X] Error initializing Multidimensional Weighting Engine Service:', error);
        process.exit(1);
    }
}

// [STOP] MANEJO GRACEFUL DE CIERRE
process.on('SIGINT', async () => {
    console.log('[STOP] Graceful shutdown iniciado...');
    
    if (weightingEngine) {
        await weightingEngine.shutdown();
    }
    
    server.close(() => {
        console.log('[CHECK] Multidimensional Weighting Engine Service shutdown completed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, shutting down...');
    
    if (weightingEngine) {
        await weightingEngine.shutdown();
    }
    
    server.close(() => {
        process.exit(0);
    });
});

// [ROCKET] INICIAR SERVICIO
initializeService().catch(console.error);

export default { app, server, weightingEngine };
