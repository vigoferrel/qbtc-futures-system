#!/usr/bin/env node

/**
 * [OCEAN_WAVE] SERVICIO HTTP PARA TEMPORAL CYCLES ENGINE
 * ===========================================
 * 
 * Servidor HTTP que expone la funcionalidad del Motor Temporal
 * a través de endpoints REST y WebSocket
 * 
 * Puerto: 14102
 * Endpoints:
 * - GET /health - Health check
 * - GET /status - Estado completo del motor
 * - GET /api/cycles - Información de ciclos activos
 * - GET /api/temporal-factors - Factores temporales actuales
 * - GET /api/lunar-position - Posición lunar actual
 * - GET /api/fibonacci-resonance - Resonancia Fibonacci actual
 * - GET /api/next-events - Próximos eventos significativos
 * - WebSocket /ws - Updates en tiempo real
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import TemporalCyclesEngine from '../engines/temporal-cycles-engine.js';

const PORT = 14102;
const app = express();
const server = createServer(app);

// Instancia del motor temporal
let temporalEngine = null;
let isInitializing = false;

// Configurar middleware
app.use(express.json());
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[OCEAN_WAVE] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// [HOSPITAL] HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const status = temporalEngine ? 'healthy' : (isInitializing ? 'initializing' : 'not_ready');
    
    res.json({
        status,
        service: 'Temporal Cycles Engine',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        engine_active: !!temporalEngine,
        initializing: isInitializing
    });
});

// [CHART] STATUS ENDPOINT
app.get('/status', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized',
            status: 'service_unavailable'
        });
    }

    try {
        const statistics = temporalEngine.getEngineStatistics();
        const temporalFactors = temporalEngine.getTemporalEntryExitFactor();
        
        res.json({
            status: 'active',
            timestamp: new Date().toISOString(),
            engine_statistics: statistics,
            temporal_factors: temporalFactors,
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

// [CYCLONE] CYCLES ENDPOINT
app.get('/api/cycles', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const cycles = Array.from(temporalEngine.state.dominant_cycles.entries()).map(([name, cycle]) => ({
            name,
            strength: cycle.strength,
            phase: cycle.phase,
            type: cycle.type,
            period_days: cycle.period_days,
            last_peak: cycle.last_peak,
            next_peak: cycle.next_peak
        }));

        res.json({
            active_cycles: cycles,
            total_cycles: cycles.length,
            coherence: temporalEngine.state.temporal_coherence,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving cycles',
            message: error.message
        });
    }
});

// [LIGHTNING] TEMPORAL FACTORS ENDPOINT
app.get('/api/temporal-factors', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const factors = temporalEngine.getTemporalEntryExitFactor();
        
        res.json({
            ...factors,
            current_state: {
                temporal_coherence: temporalEngine.state.temporal_coherence,
                lunar_position: temporalEngine.state.lunar_position,
                fibonacci_resonance: temporalEngine.state.fibonacci_resonance,
                quantum_phase: temporalEngine.state.quantum_phase
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving temporal factors',
            message: error.message
        });
    }
});

// [MOON] LUNAR POSITION ENDPOINT
app.get('/api/lunar-position', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const now = Date.now();
        const lunarPosition = temporalEngine.calculateLunarPosition(now);
        
        res.json({
            lunar_position: lunarPosition,
            lunar_phase_description: getLunarPhaseDescription(lunarPosition),
            timestamp: new Date().toISOString(),
            calculation_time: now
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error calculating lunar position',
            message: error.message
        });
    }
});

// [CYCLONE] FIBONACCI RESONANCE ENDPOINT
app.get('/api/fibonacci-resonance', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const now = Date.now();
        const fibonacciResonance = temporalEngine.calculateFibonacciResonance(now);
        
        res.json({
            fibonacci_resonance: fibonacciResonance,
            resonance_level: getResonanceLevel(fibonacciResonance),
            timestamp: new Date().toISOString(),
            calculation_time: now
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error calculating Fibonacci resonance',
            message: error.message
        });
    }
});

// [CALENDAR] NEXT EVENTS ENDPOINT
app.get('/api/next-events', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const nextEvents = temporalEngine.state.next_significant_events.map(event => ({
            ...event,
            time_to_event_formatted: formatTimeToEvent(event.time_to_event),
            event_time: new Date(event.timestamp).toISOString()
        }));

        res.json({
            next_significant_events: nextEvents,
            total_events: nextEvents.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving next events',
            message: error.message
        });
    }
});

// [TARGET] CALCULATE SPECIFIC SYMBOL FACTORS
app.post('/api/symbol-factors', (req, res) => {
    if (!temporalEngine) {
        return res.status(503).json({
            error: 'Temporal Engine not initialized'
        });
    }

    try {
        const { symbol } = req.body;
        if (!symbol) {
            return res.status(400).json({
                error: 'Symbol is required',
                usage: 'POST /api/symbol-factors with {"symbol": "BTCUSDT"}'
            });
        }

        const factors = temporalEngine.getTemporalEntryExitFactor(symbol);
        
        res.json({
            symbol,
            temporal_factors: factors,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error calculating symbol factors',
            message: error.message
        });
    }
});

// [WRENCH] CONFIGURAR WEBSOCKET
function setupWebSocket() {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[LINK] Nueva conexión WebSocket al Temporal Cycles Engine');
        
        // Enviar estado inicial
        if (temporalEngine) {
            try {
                ws.send(JSON.stringify({
                    type: 'initial_state',
                    data: temporalEngine.getEngineStatistics(),
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

    // Configurar eventos del motor temporal
    if (temporalEngine) {
        temporalEngine.on('temporal-update', (data) => {
            broadcastToClients(wss, {
                type: 'temporal_update',
                data,
                timestamp: new Date().toISOString()
            });
        });

        temporalEngine.on('engine-initialized', (data) => {
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
            if (temporalEngine) {
                ws.send(JSON.stringify({
                    type: 'status',
                    data: temporalEngine.getEngineStatistics(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_cycles':
            if (temporalEngine) {
                const cycles = Array.from(temporalEngine.state.dominant_cycles.entries());
                ws.send(JSON.stringify({
                    type: 'cycles',
                    data: cycles,
                    timestamp: new Date().toISOString()
                }));
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

// [MOON] HELPER: Descripción de fase lunar
function getLunarPhaseDescription(position) {
    if (position < 0.125) return 'New Moon';
    if (position < 0.375) return 'Waxing Crescent';
    if (position < 0.625) return 'Full Moon';
    if (position < 0.875) return 'Waning Gibbous';
    return 'Waning Crescent';
}

// [CYCLONE] HELPER: Nivel de resonancia
function getResonanceLevel(resonance) {
    if (resonance > 0.8) return 'Very High';
    if (resonance > 0.6) return 'High';
    if (resonance > 0.4) return 'Medium';
    if (resonance > 0.2) return 'Low';
    return 'Very Low';
}

// ⏱️ HELPER: Formatear tiempo hasta evento
function formatTimeToEvent(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// [ROCKET] INICIALIZAR SERVICIO
async function initializeService() {
    try {
        console.log('[OCEAN_WAVE] =============== TEMPORAL CYCLES ENGINE SERVICE STARTUP ===============');
        console.log(`[WRENCH] Initializing Temporal Cycles Engine on port ${PORT}...`);
        
        isInitializing = true;
        
        // Inicializar motor temporal
        temporalEngine = new TemporalCyclesEngine({
            background_mode: true,
            logging_enabled: true,
            performance_tracking: true,
            update_frequency_ms: 60000  // 1 minuto
        });
        
        // Esperar a que el motor se inicialice
        await new Promise((resolve) => {
            temporalEngine.once('engine-initialized', () => {
                console.log('[CHECK] Temporal Cycles Engine inicializado correctamente');
                resolve();
            });
        });
        
        isInitializing = false;
        
        // Configurar WebSocket
        setupWebSocket();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Temporal Cycles Engine Service started on port ${PORT}`);
            console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
            console.log(`[CHART] Status endpoint: http://localhost:${PORT}/status`);
            console.log(`[CYCLONE] Cycles endpoint: http://localhost:${PORT}/api/cycles`);
            console.log(`[LIGHTNING] Temporal factors: http://localhost:${PORT}/api/temporal-factors`);
            console.log(`[MOON] Lunar position: http://localhost:${PORT}/api/lunar-position`);
            console.log(`[CRYSTAL_BALL] WebSocket: ws://localhost:${PORT}/ws`);
            console.log('🛡️ Service ready and monitoring temporal cycles\\n');
        });
        
    } catch (error) {
        console.error('[X] Error initializing Temporal Cycles Engine Service:', error);
        process.exit(1);
    }
}

// [STOP] MANEJO GRACEFUL DE CIERRE
process.on('SIGINT', async () => {
    console.log('[STOP] Graceful shutdown iniciado...');
    
    if (temporalEngine) {
        await temporalEngine.shutdown();
    }
    
    server.close(() => {
        console.log('[CHECK] Temporal Cycles Engine Service shutdown completed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, shutting down...');
    
    if (temporalEngine) {
        await temporalEngine.shutdown();
    }
    
    server.close(() => {
        process.exit(0);
    });
});

// [ROCKET] INICIAR SERVICIO
initializeService().catch(console.error);

export default { app, server, temporalEngine };
