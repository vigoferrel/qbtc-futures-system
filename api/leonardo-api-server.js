import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * LEONARDO API SERVER - HTTP REST & WEBSOCKET
 * ==========================================
 * 
 * Servidor HTTP que expone las APIs que el frontend Leonardo Dashboard necesita
 * Puerto: 14777
 * 
 * Endpoints requeridos por el frontend:
 * - GET /api/leonardo/status
 * - GET /api/leonardo/opportunities  
 * - GET /api/leonardo/metrics
 * - GET /api/leonardo/consciousness
 * - WebSocket en ws://localhost:14777/
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { LeonardoQuantumLiberationEngine77 } from '../core/leonardo-quantum-liberation-engine.js';
import { ALL_SYMBOLS, getSymbolConfig } from '../config/symbols-extended.esm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const PORT = 14777;
const WEBSOCKET_HEARTBEAT_INTERVAL = 5000; // 5 segundos
const API_UPDATE_INTERVAL = 3000; // 3 segundos

class LeonardoAPIServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        
        // Motor Leonardo integrado
        this.leonardoEngine = new LeonardoQuantumLiberationEngine77();
        this.isEngineReady = false;
        
        // Estado API para el frontend
        this.apiState = {
            status: {
                isActive: false,
                mode: 'LEONARDO_DIVINE',
                uptime: 0,
                totalSymbols: 77,
                lastUpdate: Date.now()
            },
            opportunities: [],
            metrics: {
                totalQuantumLeaps: 0,
                divineInterventions: 0,
                cosmicProfits: 0,
                consciousnessEvolution: 0,
                artisticTrades: 0,
                activeSymbols: 0,
                analyzedSymbols: 77,
                runtimeMinutes: 0,
                tierMetrics: {
                    TIER1: { trades: 0, profit: 0, opportunities: 0 },
                    TIER2: { trades: 0, profit: 0, opportunities: 0 },
                    TIER3: { trades: 0, profit: 0, opportunities: 0 },
                    TIER4: { trades: 0, profit: 0, opportunities: 0 },
                    TIER5: { trades: 0, profit: 0, opportunities: 0 },
                    TIER6: { trades: 0, profit: 0, opportunities: 0 }
                }
            },
            consciousness: {
                average: 0.777,
                byTier: {
                    TIER1: 0.95,
                    TIER2: 0.88,
                    TIER3: 0.82,
                    TIER4: 0.75,
                    TIER5: 0.68,
                    TIER6: 0.61
                },
                quantumState: 'SUPERPOSITION_77',
                divineAlignment: 'COSMIC'
            }
        };
        
        this.setupExpress();
        this.setupWebSocket();
        this.startUpdateLoop();
        
        console.log('[PALETTE] Leonardo API Server inicializando...');
    }
    
    /**
     * Configurar Express y middlewares
     */
    setupExpress() {
        // Middlewares
        this.app.use(cors({
            origin: ['http://localhost:14800', 'http://127.0.0.1:14800'],
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`[GLOBE] [${new Date().toISOString()}] ${req.method} ${req.url}`);
            next();
        });
        
        // Configurar rutas API
        this.setupAPIRoutes();
    }
    
    /**
     * Configurar rutas de API requeridas por el frontend
     */
    setupAPIRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                service: 'Leonardo API Server',
                port: PORT,
                timestamp: new Date().toISOString()
            });
        });
        
        // Status del sistema Leonardo
        this.app.get('/api/leonardo/status', (req, res) => {
            try {
                const status = {
                    ...this.apiState.status,
                    isActive: this.isEngineReady,
                    uptime: Math.floor((Date.now() - (this.engineStartTime || Date.now())) / 1000),
                    lastUpdate: Date.now()
                };
                
                res.json({
                    success: true,
                    data: status,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('[X] Error en /api/leonardo/status:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo status',
                    message: error.message
                });
            }
        });
        
        // Oportunidades divinas detectadas
        this.app.get('/api/leonardo/opportunities', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: {
                        opportunities: this.apiState.opportunities,
                        count: this.apiState.opportunities.length,
                        lastScan: Date.now()
                    },
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('[X] Error en /api/leonardo/opportunities:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo oportunidades',
                    message: error.message
                });
            }
        });
        
        // Métricas del sistema
        this.app.get('/api/leonardo/metrics', (req, res) => {
            try {
                const metrics = {
                    ...this.apiState.metrics,
                    runtimeMinutes: Math.floor((Date.now() - (this.engineStartTime || Date.now())) / 1000 / 60),
                    lastUpdate: Date.now()
                };
                
                res.json({
                    success: true,
                    data: metrics,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('[X] Error en /api/leonardo/metrics:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo métricas',
                    message: error.message
                });
            }
        });
        
        // Estado de consciencia cuántica
        this.app.get('/api/leonardo/consciousness', (req, res) => {
            try {
                res.json({
                    success: true,
                    data: this.apiState.consciousness,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error('[X] Error en /api/leonardo/consciousness:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error obteniendo consciencia',
                    message: error.message
                });
            }
        });
        
        // Endpoint para controlar el motor Leonardo
        this.app.post('/api/leonardo/control', async (req, res) => {
            try {
                const { action } = req.body;
                
                if (action === 'start' && !this.isEngineReady) {
                    await this.startLeonardoEngine();
                    res.json({ success: true, message: 'Motor Leonardo iniciado' });
                } else if (action === 'stop' && this.isEngineReady) {
                    await this.stopLeonardoEngine();
                    res.json({ success: true, message: 'Motor Leonardo detenido' });
                } else {
                    res.json({ success: false, message: 'Acción no válida o motor ya en ese estado' });
                }
                
            } catch (error) {
                console.error('[X] Error en /api/leonardo/control:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Error controlando motor Leonardo',
                    message: error.message
                });
            }
        });
        
        // Manejo de rutas no encontradas
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint no encontrado',
                availableEndpoints: [
                    'GET /health',
                    'GET /api/leonardo/status',
                    'GET /api/leonardo/opportunities',
                    'GET /api/leonardo/metrics', 
                    'GET /api/leonardo/consciousness',
                    'POST /api/leonardo/control'
                ]
            });
        });
    }
    
    /**
     * Configurar WebSocket para actualizaciones en tiempo real
     */
    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            console.log(`🔌 Cliente WebSocket conectado desde ${req.socket.remoteAddress}`);
            
            // Enviar estado inicial
            ws.send(JSON.stringify({
                type: 'initial_state',
                data: {
                    status: this.apiState.status,
                    consciousness: this.apiState.consciousness,
                    metrics: this.apiState.metrics
                },
                timestamp: Date.now()
            }));
            
            // Configurar heartbeat
            const heartbeat = setInterval(() => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'heartbeat',
                        data: {
                            consciousness: this.apiState.consciousness.average,
                            activeSymbols: this.apiState.metrics.activeSymbols,
                            opportunities: this.apiState.opportunities.length
                        },
                        timestamp: Date.now()
                    }));
                }
            }, WEBSOCKET_HEARTBEAT_INTERVAL);
            
            // Limpiar al desconectar
            ws.on('close', () => {
                console.log('🔌 Cliente WebSocket desconectado');
                clearInterval(heartbeat);
            });
            
            ws.on('error', (error) => {
                console.error('🌋 Error WebSocket:', error.message);
                clearInterval(heartbeat);
            });
        });
    }
    
    /**
     * Inicializar y arrancar el motor Leonardo
     */
    async startLeonardoEngine() {
        try {
            console.log('[PALETTE] Inicializando motor Leonardo...');
            
            const initialized = await this.leonardoEngine.initialize();
            if (!initialized) {
                throw new Error('Fallo en inicialización del motor Leonardo');
            }
            
            const started = await this.leonardoEngine.startLiberation();
            if (!started) {
                throw new Error('Fallo al iniciar liberación Leonardo');
            }
            
            this.isEngineReady = true;
            this.engineStartTime = Date.now();
            
            // Configurar eventos del motor
            this.leonardoEngine.on('leonardo-liberation-77-started', () => {
                console.log('[SPARKLES] Motor Leonardo 77 liberado completamente');
                this.broadcastToWebSocket({
                    type: 'engine_started',
                    message: 'Motor Leonardo liberado'
                });
            });
            
            console.log('[ROCKET] Motor Leonardo iniciado correctamente');
            return true;
            
        } catch (error) {
            console.error('[X] Error iniciando motor Leonardo:', error.message);
            this.isEngineReady = false;
            throw error;
        }
    }
    
    /**
     * Detener el motor Leonardo
     */
    async stopLeonardoEngine() {
        try {
            if (this.leonardoEngine && this.isEngineReady) {
                await this.leonardoEngine.stopLiberation();
                this.isEngineReady = false;
                
                console.log('⏹️ Motor Leonardo detenido');
                this.broadcastToWebSocket({
                    type: 'engine_stopped',
                    message: 'Motor Leonardo detenido'
                });
            }
            return true;
            
        } catch (error) {
            console.error('[X] Error deteniendo motor Leonardo:', error.message);
            throw error;
        }
    }
    
    /**
     * Loop de actualización de datos para APIs
     */
    startUpdateLoop() {
        setInterval(async () => {
            try {
                await this.updateAPIState();
            } catch (error) {
                console.error('[X] Error en loop de actualización:', error.message);
            }
        }, API_UPDATE_INTERVAL);
    }
    
    /**
     * Actualizar estado de APIs desde el motor Leonardo
     */
    async updateAPIState() {
        if (!this.isEngineReady || !this.leonardoEngine) {
            return;
        }
        
        try {
            // Obtener métricas del motor
            const engineMetrics = this.leonardoEngine.getLiberationMetrics77();
            
            // Actualizar estado API
            this.apiState.status.isActive = this.isEngineReady;
            this.apiState.status.lastUpdate = Date.now();
            
            this.apiState.metrics = {
                ...engineMetrics,
                runtimeMinutes: Math.floor((Date.now() - this.engineStartTime) / 1000 / 60)
            };
            
            this.apiState.consciousness.average = engineMetrics.currentConsciousness || 0.777;
            this.apiState.consciousness.quantumState = engineMetrics.quantumState || 'SUPERPOSITION_77';
            
            // Simular oportunidades (el motor real las generaría)
            if (this.purifier.generateQuantumValue(index, modifier) > 0.7) { // 30% chance de nueva oportunidad
                // Seleccionar símbolo aleatorio de TODOS los 77 símbolos disponibles
                const selectedSymbol = ALL_SYMBOLS[Math.floor(this.purifier.generateQuantumValue(index, modifier) * ALL_SYMBOLS.length)];
                
                // Obtener la configuración correcta (incluyendo tier) para ese símbolo
                const symbolConfig = getSymbolConfig(selectedSymbol);
                
                const newOpportunity = {
                    id: Date.now(),
                    symbol: selectedSymbol,
                    tier: symbolConfig.tier, // [CHECK] Usar el tier CORRECTO según la configuración
                    action: this.purifier.generateQuantumValue(index, modifier) > 0.5 ? 'BUY' : 'SELL',
                    strength: 0.3 + this.purifier.generateQuantumValue(index, modifier) * 0.4, // Entre 30% y 70%
                    confidence: 0.6 + this.purifier.generateQuantumValue(index, modifier) * 0.4, // Entre 60% y 100%
                    alignment: 0.7 + this.purifier.generateQuantumValue(index, modifier) * 0.3, // Entre 70% y 100%
                    divineScore: 0.8 + this.purifier.generateQuantumValue(index, modifier) * 0.2, // Entre 80% y 100%
                    timestamp: Date.now(),
                    isDivine: symbolConfig.tier === 'TIER1' || this.purifier.generateQuantumValue(index, modifier) > 0.8 // Los TIER1 siempre son divinos, otros 20% chance
                };
                
                // Mantener solo últimas 10 oportunidades
                this.apiState.opportunities.unshift(newOpportunity);
                if (this.apiState.opportunities.length > 10) {
                    this.apiState.opportunities = this.apiState.opportunities.slice(0, 10);
                }
                
                // Broadcast nueva oportunidad
                this.broadcastToWebSocket({
                    type: 'new_opportunity',
                    data: newOpportunity
                });
            }
            
        } catch (error) {
            console.error('[X] Error actualizando estado API:', error.message);
        }
    }
    
    /**
     * Enviar mensaje a todos los clientes WebSocket
     */
    broadcastToWebSocket(data) {
        const message = JSON.stringify({
            ...data,
            timestamp: Date.now()
        });
        
        this.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
    
    /**
     * Iniciar servidor HTTP
     */
    async start() {
        try {
            // Iniciar motor Leonardo automáticamente
            await this.startLeonardoEngine();
            
            this.server.listen(PORT, '0.0.0.0', () => {
                console.log('[ROCKET] ================================');
                console.log('[PALETTE] LEONARDO API SERVER INICIADO');
                console.log('[ROCKET] ================================');
                console.log(`[SATELLITE] HTTP Server: http://localhost:${PORT}`);
                console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
                console.log(`[SPARKLES] Motor Leonardo: ${this.isEngineReady ? 'ACTIVO' : 'INACTIVO'}`);
                console.log(`[GALAXY] 77 Símbolos bajo consciencia Leonardo`);
                console.log('[ROCKET] ================================');
                
                console.log('\n[CLIPBOARD] Endpoints disponibles:');
                console.log(`  GET  http://localhost:${PORT}/api/leonardo/status`);
                console.log(`  GET  http://localhost:${PORT}/api/leonardo/opportunities`);
                console.log(`  GET  http://localhost:${PORT}/api/leonardo/metrics`);
                console.log(`  GET  http://localhost:${PORT}/api/leonardo/consciousness`);
                console.log(`  POST http://localhost:${PORT}/api/leonardo/control`);
                console.log('');
            });
            
            return true;
            
        } catch (error) {
            console.error('[X] Error iniciando Leonardo API Server:', error.message);
            return false;
        }
    }
    
    /**
     * Detener servidor
     */
    async stop() {
        try {
            await this.stopLeonardoEngine();
            
            this.server.close(() => {
                console.log('⏹️ Leonardo API Server detenido');
            });
            
        } catch (error) {
            console.error('[X] Error deteniendo servidor:', error.message);
        }
    }
    
    /**
     * Configurar handlers de señales para cierre limpio
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n[STOP] Recibida señal ${signal}. Cerrando Leonardo API Server...`);
            await this.stop();
            process.exit(0);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        
        process.on('uncaughtException', (error) => {
            console.error('🌋 Excepción no capturada:', error.message);
        });
        
        process.on('unhandledRejection', (reason) => {
            console.error('🌋 Rechazo no manejado:', reason);
        });
    }
}

// Función principal
async function main() {
    const apiServer = new LeonardoAPIServer();
    
    // Configurar cierre limpio
    apiServer.setupGracefulShutdown();
    
    // Iniciar servidor
    const started = await apiServer.start();
    if (!started) {
        console.error('[X] Fallo al iniciar Leonardo API Server');
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('🌋 Error fatal en Leonardo API Server:', error.message);
        process.exit(1);
    });
}

export default LeonardoAPIServer;
