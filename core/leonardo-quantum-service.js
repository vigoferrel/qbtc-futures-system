#!/usr/bin/env node

/**
 * LEONARDO QUANTUM LIBERATION SERVICE - HTTP API
 * ==============================================
 * 
 * Servicio HTTP que expone el Leonardo Quantum Liberation Engine
 * API REST para control y monitoreo en tiempo real
 * Gestión completa de la consciencia cuántica en 77 símbolos
 * 
 * ENDPOINTS PRINCIPALES:
 * - POST /api/leonardo/start → Iniciar liberación cuántica
 * - POST /api/leonardo/stop → Detener sistema
 * - GET /api/leonardo/status → Estado en tiempo real
 * - GET /api/leonardo/metrics → Métricas de liberación
 * - GET /api/leonardo/consciousness → Consciencia por tiers
 * - GET /api/leonardo/opportunities → Oportunidades divinas actuales
 * - POST /api/leonardo/config → Actualizar configuración
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { LeonardoQuantumLiberationEngine77 } from './leonardo-quantum-liberation-engine.js';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuración del servicio
const SERVICE_CONFIG = {
    name: 'LEONARDO_QUANTUM_SERVICE',
    version: '1.0.0',
    port: process.env.LEONARDO_PORT || 14777,  // Puerto sagrado Leonardo
    host: process.env.LEONARDO_HOST || 'localhost',
    motto: 'Servicio HTTP para la liberación cuántica Leonardo'
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Instancia global del Leonardo Engine
let leonardoEngine = null;
let isServiceRunning = false;
let connectedClients = new Set();

// Métricas del servicio
const serviceMetrics = {
    startTime: Date.now(),
    requests: 0,
    errors: 0,
    lastRequest: null,
    connectedClients: 0,
    totalRequests: {
        status: 0,
        metrics: 0,
        start: 0,
        stop: 0,
        consciousness: 0,
        opportunities: 0
    }
};

/**
 * Middleware de logging
 */
app.use((req, res, next) => {
    serviceMetrics.requests++;
    serviceMetrics.lastRequest = Date.now();
    serviceMetrics.totalRequests[req.url.split('/').pop()] = 
        (serviceMetrics.totalRequests[req.url.split('/').pop()] || 0) + 1;
    
    console.log(`[STAR] [Leonardo API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

/**
 * Middleware de manejo de errores
 */
const errorHandler = (error, req, res, next) => {
    serviceMetrics.errors++;
    console.error('🌋 [Leonardo API Error]:', error.message);
    
    res.status(500).json({
        success: false,
        error: error.message,
        timestamp: Date.now(),
        endpoint: req.url
    });
};

// ===== ENDPOINTS PRINCIPALES =====

/**
 * GET / - Información del servicio
 */
app.get('/', (req, res) => {
    res.json({
        service: SERVICE_CONFIG.name,
        version: SERVICE_CONFIG.version,
        motto: SERVICE_CONFIG.motto,
        status: isServiceRunning ? 'ACTIVE' : 'INACTIVE',
        leonardo_engine: leonardoEngine ? 'INITIALIZED' : 'NOT_INITIALIZED',
        endpoints: [
            'POST /api/leonardo/start',
            'POST /api/leonardo/stop', 
            'GET /api/leonardo/status',
            'GET /api/leonardo/metrics',
            'GET /api/leonardo/consciousness',
            'GET /api/leonardo/opportunities',
            'POST /api/leonardo/config',
            'GET /api/leonardo/symbols',
            'GET /api/leonardo/tiers'
        ],
        timestamp: Date.now()
    });
});

/**
 * POST /api/leonardo/start - Iniciar Leonardo Liberation Engine
 */
app.post('/api/leonardo/start', async (req, res) => {
    try {
        if (isServiceRunning && leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine ya está activo',
                status: 'ALREADY_RUNNING',
                timestamp: Date.now()
            });
        }

        console.log('[PALETTE] Iniciando Leonardo Quantum Liberation Engine...');
        
        // Crear nueva instancia
        leonardoEngine = new LeonardoQuantumLiberationEngine77();
        
        // Configurar eventos
        setupEngineEvents();
        
        // Inicializar
        const initialized = await leonardoEngine.initialize();
        if (!initialized) {
            throw new Error('Fallo en inicialización del motor Leonardo');
        }
        
        // Iniciar liberación
        const started = await leonardoEngine.startLiberation();
        if (!started) {
            throw new Error('Fallo al iniciar liberación cuántica');
        }
        
        isServiceRunning = true;
        
        // Notificar a clientes WebSocket
        io.emit('leonardo-started', {
            timestamp: Date.now(),
            status: 'ACTIVE',
            message: '[GALAXY] Leonardo Quantum Liberation ACTIVADA'
        });
        
        res.json({
            success: true,
            message: '[GALAXY] Leonardo Quantum Liberation Engine iniciado exitosamente',
            status: 'ACTIVE',
            engine_id: leonardoEngine.config.name,
            symbols_count: 77,
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            status: 'ERROR',
            timestamp: Date.now()
        });
    }
});

/**
 * POST /api/leonardo/stop - Detener Leonardo Liberation Engine
 */
app.post('/api/leonardo/stop', async (req, res) => {
    try {
        if (!isServiceRunning || !leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no está activo',
                status: 'NOT_RUNNING',
                timestamp: Date.now()
            });
        }

        console.log('[LIGHTNING] Deteniendo Leonardo Quantum Liberation Engine...');
        
        const stopped = await leonardoEngine.stopLiberation();
        if (stopped) {
            isServiceRunning = false;
            
            // Notificar a clientes WebSocket
            io.emit('leonardo-stopped', {
                timestamp: Date.now(),
                status: 'INACTIVE',
                message: '[STOP] Leonardo Quantum Liberation DETENIDA'
            });
        }
        
        res.json({
            success: stopped,
            message: stopped ? 
                '[STOP] Leonardo Quantum Liberation Engine detenido' :
                '[WARNING] Error deteniendo Leonardo Engine',
            status: stopped ? 'STOPPED' : 'ERROR',
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/status - Estado actual del sistema
 */
app.get('/api/leonardo/status', (req, res) => {
    try {
        const status = {
            service: {
                name: SERVICE_CONFIG.name,
                version: SERVICE_CONFIG.version,
                uptime: Date.now() - serviceMetrics.startTime,
                isRunning: isServiceRunning
            },
            leonardo_engine: {
                initialized: leonardoEngine !== null,
                active: isServiceRunning,
                quantum_state: leonardoEngine?.quantumState || 'DORMANT',
                symbols_count: 77,
                liberation_active: leonardoEngine?.isLiberated || false
            },
            metrics: serviceMetrics,
            timestamp: Date.now()
        };
        
        res.json(status);
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/metrics - Métricas completas de liberación
 */
app.get('/api/leonardo/metrics', (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const leonardoMetrics = leonardoEngine.getLiberationMetrics77();
        
        res.json({
            success: true,
            data: {
                leonardo_metrics: leonardoMetrics,
                service_metrics: serviceMetrics,
                real_time: {
                    consciousness: leonardoMetrics.currentConsciousness,
                    active_symbols: leonardoMetrics.activeSymbols,
                    divine_symbols: leonardoMetrics.divineSymbols.length,
                    total_opportunities: leonardoMetrics.totalQuantumLeaps
                }
            },
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/consciousness - Consciencia por tiers
 */
app.get('/api/leonardo/consciousness', (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const tierConsciousness = {};
        leonardoEngine.tierConsciousness.forEach((data, tier) => {
            tierConsciousness[tier] = {
                level: data.level,
                opportunities: data.opportunities,
                quantum_resonance: data.quantumResonance,
                symbols_count: data.symbols.length
            };
        });
        
        res.json({
            success: true,
            data: {
                average_consciousness: leonardoEngine.calculateAverageConsciousness(),
                tier_consciousness: tierConsciousness,
                quantum_state: leonardoEngine.quantumState,
                total_symbols: 77
            },
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/opportunities - Oportunidades divinas actuales
 */
app.get('/api/leonardo/opportunities', async (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const opportunities = await leonardoEngine.scanForDivineOpportunities77();
        const divine = opportunities.filter(o => o.isDivine);
        
        res.json({
            success: true,
            data: {
                total_opportunities: opportunities.length,
                divine_opportunities: divine.length,
                opportunities: opportunities.slice(0, 20), // Top 20
                divine_symbols: divine.map(o => o.symbol),
                analysis_time: Date.now()
            },
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/symbols - Información de símbolos
 */
app.get('/api/leonardo/symbols', (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const symbolStates = {};
        leonardoEngine.symbolQuantumStates.forEach((state, symbol) => {
            symbolStates[symbol] = {
                coherence: state.coherence,
                entanglement: state.entanglement,
                opportunity: state.opportunity,
                tier: state.tier,
                last_update: state.lastUpdate
            };
        });
        
        res.json({
            success: true,
            data: {
                total_symbols: 77,
                symbol_states: symbolStates,
                active_symbols: Object.values(symbolStates)
                    .filter(s => s.opportunity > 0.4).length
            },
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * GET /api/leonardo/tiers - Análisis por tiers
 */
app.get('/api/leonardo/tiers', (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const tierAnalysis = {};
        leonardoEngine.tierConsciousness.forEach((consciousness, tierName) => {
            const performance = leonardoEngine.tierPerformance.get(tierName);
            const metrics = leonardoEngine.liberationMetrics77.tierMetrics[tierName];
            
            tierAnalysis[tierName] = {
                consciousness: consciousness.level,
                symbols_count: consciousness.symbols.length,
                opportunities: consciousness.opportunities,
                quantum_resonance: consciousness.quantumResonance,
                performance_metrics: performance,
                liberation_metrics: metrics,
                symbols: consciousness.symbols
            };
        });
        
        res.json({
            success: true,
            data: tierAnalysis,
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

/**
 * POST /api/leonardo/config - Actualizar configuración
 */
app.post('/api/leonardo/config', (req, res) => {
    try {
        if (!leonardoEngine) {
            return res.json({
                success: false,
                message: 'Leonardo Engine no inicializado',
                timestamp: Date.now()
            });
        }
        
        const { config } = req.body;
        
        if (config) {
            // Actualizar configuración del motor
            Object.assign(leonardoEngine.config, config);
        }
        
        res.json({
            success: true,
            message: 'Configuración actualizada',
            current_config: leonardoEngine.config,
            timestamp: Date.now()
        });
        
    } catch (error) {
        serviceMetrics.errors++;
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: Date.now()
        });
    }
});

// ===== WEBSOCKET EVENTS =====

/**
 * Configuración de WebSocket para updates en tiempo real
 */
io.on('connection', (socket) => {
    connectedClients.add(socket);
    serviceMetrics.connectedClients = connectedClients.size;
    
    console.log(`[SPARKLES] Cliente WebSocket conectado. Total: ${connectedClients.size}`);
    
    // Enviar estado inicial
    socket.emit('leonardo-status', {
        active: isServiceRunning,
        engine_initialized: leonardoEngine !== null,
        timestamp: Date.now()
    });
    
    // Manejar desconexión
    socket.on('disconnect', () => {
        connectedClients.delete(socket);
        serviceMetrics.connectedClients = connectedClients.size;
        console.log(`[LIGHTNING] Cliente WebSocket desconectado. Total: ${connectedClients.size}`);
    });
});

/**
 * Configurar eventos del Leonardo Engine
 */
function setupEngineEvents() {
    if (!leonardoEngine) return;
    
    leonardoEngine.on('leonardo-liberation-77-started', () => {
        io.emit('engine-event', {
            type: 'LEONARDO_STARTED',
            message: '[GALAXY] Leonardo Quantum Liberation 77 INICIADA',
            timestamp: Date.now()
        });
    });
    
    leonardoEngine.on('leonardo-liberation-77-stopped', () => {
        io.emit('engine-event', {
            type: 'LEONARDO_STOPPED',
            message: '[STOP] Leonardo Quantum Liberation 77 DETENIDA',
            timestamp: Date.now()
        });
    });
}

/**
 * Envío periódico de métricas en tiempo real
 */
function startRealTimeMetrics() {
    setInterval(() => {
        if (leonardoEngine && isServiceRunning && connectedClients.size > 0) {
            const metrics = leonardoEngine.getLiberationMetrics77();
            
            io.emit('real-time-metrics', {
                consciousness: metrics.currentConsciousness,
                active_symbols: metrics.activeSymbols,
                divine_symbols: metrics.divineSymbols.length,
                quantum_leaps: metrics.totalQuantumLeaps,
                artistic_trades: metrics.artisticTrades,
                divine_interventions: metrics.divineInterventions,
                runtime: metrics.runtimeMinutes,
                timestamp: Date.now()
            });
        }
    }, 5000); // Cada 5 segundos
}

// ===== ERROR HANDLING =====

app.use(errorHandler);

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('🌋 [Service] Excepción no capturada:', error.message);
    serviceMetrics.errors++;
});

process.on('unhandledRejection', (reason) => {
    console.error('🌋 [Service] Rechazo no manejado:', reason);
    serviceMetrics.errors++;
});

// ===== INICIO DEL SERVICIO =====

function startService() {
    const port = SERVICE_CONFIG.port;
    const host = SERVICE_CONFIG.host;
    
    server.listen(port, host, () => {
        console.log('[STAR] ============================================');
        console.log('[PALETTE] LEONARDO QUANTUM LIBERATION SERVICE STARTED');
        console.log('[STAR] ============================================');
        console.log(`[SPARKLES] Servicio: ${SERVICE_CONFIG.name} v${SERVICE_CONFIG.version}`);
        console.log(`[GLOBE] URL: http://${host}:${port}`);
        console.log(`[LINK] WebSocket: ws://${host}:${port}`);
        console.log(`[CHART] Símbolos soportados: 77`);
        console.log(`[TARGET] Puerto sagrado Leonardo: ${port}`);
        console.log('[STAR] ============================================');
        
        // Iniciar métricas en tiempo real
        startRealTimeMetrics();
    });
}

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`\n[LIGHTNING] Recibida señal ${signal}. Cerrando Leonardo Service...`);
    
    if (leonardoEngine && isServiceRunning) {
        leonardoEngine.stopLiberation().then(() => {
            console.log('[GALAXY] Leonardo Engine detenido');
            server.close(() => {
                console.log('[STOP] Leonardo Service cerrado');
                process.exit(0);
            });
        });
    } else {
        server.close(() => {
            console.log('[STOP] Leonardo Service cerrado');
            process.exit(0);
        });
    }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Iniciar servicio
if (import.meta.url === `file://${process.argv[1]}`) {
    startService();
}

export { 
    app, 
    server, 
    io, 
    leonardoEngine, 
    SERVICE_CONFIG, 
    serviceMetrics 
};
