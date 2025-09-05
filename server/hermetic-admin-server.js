#!/usr/bin/env node

/**
 * [GALAXY] HERMETIC ADMIN SERVER - CONTROL CENTER
 * =========================================
 * Servidor de administración para el Sistema de Trading Hermético Integrado
 * - Monitoreo en tiempo real de todos los sistemas
 * - Control remoto del trading automático
 * - Dashboard web interactivo
 * - APIs RESTful para integración externa
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs/promises';
import HermeticAutoTrader from '../trading/hermetic-auto-trader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HermeticAdminServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        this.port = 8888; // Puerto sagrado para administración
        
        // Instancia del trader hermético
        this.hermeticTrader = null;
        
        // Estado del servidor
        this.serverState = {
            isActive: false,
            startTime: null,
            connectedClients: 0,
            totalRequests: 0,
            systemHealth: 'unknown'
        };
        
        // Sistema de notificaciones
        this.notifications = [];
        this.maxNotifications = 100;
        
        // Sistema de logs
        this.logs = [];
        this.maxLogs = 500;
        
        // Configuración del servidor
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocketServer();
        
        console.log('[GALAXY] Hermetic Admin Server initialized');
    }
    
    /**
     * Configurar middleware
     */
    setupMiddleware() {
        // CORS para permitir acceso desde cualquier origen
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        
        // Parser JSON
        this.app.use(express.json({ limit: '10mb' }));
        
        // Servir archivos estáticos
        this.app.use('/static', express.static(path.join(__dirname, 'public')));
        
        // Middleware de logging
        this.app.use((req, res, next) => {
            this.serverState.totalRequests++;
            this.addLog('info', `${req.method} ${req.path}`, { 
                ip: req.ip, 
                userAgent: req.get('User-Agent') 
            });
            next();
        });
        
        console.log('[WRENCH] Server middleware configured');
    }
    
    /**
     * Configurar rutas de la API
     */
    setupRoutes() {
        // Ruta principal - Dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        });
        
        // === RUTAS DE CONTROL DEL SISTEMA ===
        
        // Inicializar el trader hermético
        this.app.post('/api/trader/initialize', async (req, res) => {
            try {
                if (this.hermeticTrader) {
                    return res.json({
                        success: false,
                        message: 'Hermetic trader already initialized'
                    });
                }
                
                this.hermeticTrader = new HermeticAutoTrader();
                this.setupTraderEventListeners();
                
                this.addNotification('system', 'Hermetic Auto-Trader initialized successfully');
                
                res.json({
                    success: true,
                    message: 'Hermetic trader initialized',
                    trader_id: `hermetic_${Date.now()}`
                });
            } catch (error) {
                this.addLog('error', 'Failed to initialize trader', { error: error.message });
                res.status(500).json({
                    success: false,
                    message: 'Failed to initialize trader',
                    error: error.message
                });
            }
        });
        
        // Iniciar trading automático
        this.app.post('/api/trader/start', async (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized. Call /api/trader/initialize first'
                    });
                }
                
                await this.hermeticTrader.startHermeticTrading();
                this.addNotification('trading', 'Hermetic trading system activated');
                
                res.json({
                    success: true,
                    message: 'Hermetic trading started',
                    status: 'active'
                });
            } catch (error) {
                this.addLog('error', 'Failed to start trading', { error: error.message });
                res.status(500).json({
                    success: false,
                    message: 'Failed to start trading',
                    error: error.message
                });
            }
        });
        
        // Detener trading
        this.app.post('/api/trader/stop', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                this.hermeticTrader.stopHermeticTrading();
                this.addNotification('trading', 'Hermetic trading system stopped');
                
                res.json({
                    success: true,
                    message: 'Hermetic trading stopped',
                    status: 'stopped'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to stop trading',
                    error: error.message
                });
            }
        });
        
        // === RUTAS DE ESTADO Y MONITOREO ===
        
        // Estado consolidado del sistema
        this.app.get('/api/system/status', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.json({
                        success: true,
                        system_status: 'not_initialized',
                        server_status: this.serverState
                    });
                }
                
                const consolidatedStatus = this.hermeticTrader.getConsolidatedSystemStatus();
                
                res.json({
                    success: true,
                    system_status: consolidatedStatus,
                    server_status: this.serverState
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get system status',
                    error: error.message
                });
            }
        });
        
        // Performance hermética
        this.app.get('/api/system/performance', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                const performance = this.hermeticTrader.getHermeticPerformance();
                
                res.json({
                    success: true,
                    performance: performance
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get performance data',
                    error: error.message
                });
            }
        });
        
        // Estado del sistema de transmutación
        this.app.get('/api/transmutation/status', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                const transmutationStatus = this.hermeticTrader.getTransmutationStatus();
                
                res.json({
                    success: true,
                    transmutation: transmutationStatus
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get transmutation status',
                    error: error.message
                });
            }
        });
        
        // Posiciones actuales
        this.app.get('/api/trading/positions', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                const positions = Array.from(this.hermeticTrader.hermeticState.current_positions.entries())
                    .map(([id, position]) => ({ id, ...position }));
                
                res.json({
                    success: true,
                    positions: positions,
                    total_positions: positions.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get positions',
                    error: error.message
                });
            }
        });
        
        // === RUTAS DE CONTROL ESPECÍFICO ===
        
        // Activar Merkaba manualmente
        this.app.post('/api/merkaba/activate', async (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                const activated = await this.hermeticTrader.activateMerkaba();
                
                res.json({
                    success: activated,
                    message: activated ? 'Merkaba activated successfully' : 'Failed to activate Merkaba',
                    merkaba_active: this.hermeticTrader.hermeticState.merkaba_active
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error activating Merkaba',
                    error: error.message
                });
            }
        });
        
        // Inicializar sistema Akáshico manualmente
        this.app.post('/api/akashic/initialize', async (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                await this.hermeticTrader.initializeAkashicSystem();
                
                res.json({
                    success: true,
                    message: 'Akashic system initialization triggered'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Error initializing Akashic system',
                    error: error.message
                });
            }
        });
        
        // === RUTAS DE NOTIFICACIONES Y LOGS ===
        
        // Obtener notificaciones
        this.app.get('/api/notifications', (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            res.json({
                success: true,
                notifications: this.notifications.slice(-limit).reverse()
            });
        });
        
        // Obtener logs
        this.app.get('/api/logs', (req, res) => {
            const limit = parseInt(req.query.limit) || 50;
            const level = req.query.level;
            
            let filteredLogs = this.logs;
            if (level) {
                filteredLogs = this.logs.filter(log => log.level === level);
            }
            
            res.json({
                success: true,
                logs: filteredLogs.slice(-limit).reverse()
            });
        });
        
        // === RUTAS DE CONFIGURACIÓN ===
        
        // Actualizar configuración
        this.app.put('/api/config', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                const { config } = req.body;
                
                // Actualizar configuración del trader
                Object.assign(this.hermeticTrader.config, config);
                
                this.addNotification('config', 'Trading configuration updated');
                
                res.json({
                    success: true,
                    message: 'Configuration updated',
                    new_config: this.hermeticTrader.config
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update configuration',
                    error: error.message
                });
            }
        });
        
        // Obtener configuración actual
        this.app.get('/api/config', (req, res) => {
            try {
                if (!this.hermeticTrader) {
                    return res.status(400).json({
                        success: false,
                        message: 'Trader not initialized'
                    });
                }
                
                res.json({
                    success: true,
                    config: this.hermeticTrader.config
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get configuration',
                    error: error.message
                });
            }
        });
        
        console.log('??? API routes configured');
    }
    
    /**
     * Configurar servidor WebSocket
     */
    setupWebSocketServer() {
        // Se configurará cuando se inicie el servidor
        console.log('?? WebSocket server setup prepared');
    }
    
    /**
     * Configurar event listeners del trader
     */
    setupTraderEventListeners() {
        if (!this.hermeticTrader) return;
        
        // Trading events
        this.hermeticTrader.on('hermetic-trading-started', () => {
            this.addNotification('trading', 'Hermetic trading system activated');
            this.broadcastSystemUpdate();
        });
        
        this.hermeticTrader.on('hermetic-trading-stopped', () => {
            this.addNotification('trading', 'Hermetic trading system stopped');
            this.broadcastSystemUpdate();
        });
        
        this.hermeticTrader.on('hermetic-trade-executed', (trade) => {
            this.addNotification('trade', `Trade executed: ${trade.symbol} ${trade.direction} (${trade.type})`);
            this.broadcastTradeUpdate(trade);
        });
        
        this.hermeticTrader.on('hermetic-position-closed', (data) => {
            const pnlText = data.pnl > 0 ? 'PROFIT' : 'LOSS';
            const pnlPercentage = ((data.pnl / data.position.size) * 100).toFixed(2);
            this.addNotification('trade', 
                `Position closed: ${data.position.symbol} - ${pnlText} ${pnlPercentage}% (${data.reason})`);
            this.broadcastPositionUpdate(data);
        });
        
        // System evolution events
        this.hermeticTrader.on('merkaba-activated', () => {
            this.addNotification('system', 'MERKABA ACTIVATED! Dimensional trading access granted');
            this.broadcastSystemUpdate();
        });
        
        this.hermeticTrader.on('akashic-system-initialized', () => {
            this.addNotification('system', 'Akashic Prediction System ONLINE');
            this.broadcastSystemUpdate();
        });
        
        this.hermeticTrader.on('transmutation-engine-activated', () => {
            this.addNotification('system', 'Alchemical Transmutation Engine ACTIVATED');
            this.broadcastSystemUpdate();
        });
        
        this.hermeticTrader.on('hermetic-evolution', (data) => {
            this.addNotification('evolution', 
                `Consciousness evolution: +${data.wisdom_gained.toFixed(3)} wisdom gained through ${data.type}`);
            this.broadcastEvolutionUpdate(data);
        });
        
        this.hermeticTrader.on('phoenix-rebirth', (rebirth) => {
            this.addNotification('phoenix', 
                `[FIRE] PHOENIX REBIRTH #${rebirth.rebirthNumber} - System reborn from losses!`);
            this.broadcastPhoenixEvent(rebirth);
        });
        
        this.hermeticTrader.on('dimensional-ascension', (data) => {
            this.addNotification('ascension', 
                `[GALAXY] DIMENSIONAL ASCENSION! Now accessing: ${data.new_dimension}`);
            this.broadcastAscensionEvent(data);
        });
        
        console.log('[TARGET] Trader event listeners configured');
    }
    
    /**
     * Agregar notificación
     */
    addNotification(type, message, data = {}) {
        const notification = {
            id: `notif_${Date.now()}_${this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1).toString(36).substr(2, 5)}`,
            type,
            message,
            data,
            timestamp: Date.now(),
            datetime: new Date().toISOString()
        };
        
        this.notifications.push(notification);
        
        // Limitar número de notificaciones
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(-this.maxNotifications);
        }
        
        // Broadcast a WebSocket clients
        this.broadcast({
            type: 'notification',
            notification
        });
        
        console.log(`?? [${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Agregar log
     */
    addLog(level, message, data = {}) {
        const logEntry = {
            id: `log_${Date.now()}_${this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1).toString(36).substr(2, 5)}`,
            level,
            message,
            data,
            timestamp: Date.now(),
            datetime: new Date().toISOString()
        };
        
        this.logs.push(logEntry);
        
        // Limitar número de logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }
    
    /**
     * Broadcast WebSocket methods
     */
    broadcast(data) {
        if (!this.wss) return;
        
        const message = JSON.stringify(data);
        this.wss.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
    
    broadcastSystemUpdate() {
        if (!this.hermeticTrader) return;
        
        this.broadcast({
            type: 'system_update',
            status: this.hermeticTrader.getConsolidatedSystemStatus()
        });
    }
    
    broadcastTradeUpdate(trade) {
        this.broadcast({
            type: 'trade_executed',
            trade
        });
    }
    
    broadcastPositionUpdate(data) {
        this.broadcast({
            type: 'position_closed',
            data
        });
    }
    
    broadcastEvolutionUpdate(data) {
        this.broadcast({
            type: 'consciousness_evolution',
            data
        });
    }
    
    broadcastPhoenixEvent(rebirth) {
        this.broadcast({
            type: 'phoenix_rebirth',
            rebirth
        });
    }
    
    broadcastAscensionEvent(data) {
        this.broadcast({
            type: 'dimensional_ascension',
            data
        });
    }
    
    /**
     * Iniciar servidor
     */
    async start() {
        try {
            // Crear servidor HTTP
            this.server = http.createServer(this.app);
            
            // Configurar WebSocket
            this.wss = new WebSocketServer({ server: this.server });
            
            this.wss.on('connection', (ws, req) => {
                this.serverState.connectedClients++;
                console.log(`?? WebSocket client connected (${this.serverState.connectedClients} total)`);
                
                // Enviar estado inicial
                if (this.hermeticTrader) {
                    ws.send(JSON.stringify({
                        type: 'initial_status',
                        status: this.hermeticTrader.getConsolidatedSystemStatus()
                    }));
                }
                
                ws.on('close', () => {
                    this.serverState.connectedClients--;
                    console.log(`?? WebSocket client disconnected (${this.serverState.connectedClients} remaining)`);
                });
                
                ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                });
            });
            
            // Iniciar servidor
            await new Promise((resolve) => {
                this.server.listen(this.port, () => {
                    this.serverState.isActive = true;
                    this.serverState.startTime = Date.now();
                    this.serverState.systemHealth = 'healthy';
                    
                    console.log('[GALAXY] ========================================');
                    console.log('[GALAXY] HERMETIC ADMIN SERVER ONLINE');
                    console.log('[GALAXY] ========================================');
                    console.log(`[GLOBE] Web Interface: http://localhost:${this.port}`);
                    console.log(`?? WebSocket: ws://localhost:${this.port}`);
                    console.log(`[SATELLITE] API Base URL: http://localhost:${this.port}/api`);
                    console.log('[GALAXY] ========================================');
                    
                    this.addNotification('system', 'Hermetic Admin Server started successfully');
                    resolve();
                });
            });
            
        } catch (error) {
            console.error('[X] Failed to start Hermetic Admin Server:', error);
            throw error;
        }
    }
    
    /**
     * Detener servidor
     */
    async stop() {
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
            
            this.serverState.isActive = false;
            console.log('?? Hermetic Admin Server stopped');
        }
    }
}

// Función para iniciar el servidor
async function startHermeticAdminServer() {
    const server = new HermeticAdminServer();
    
    try {
        await server.start();
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n?? Shutting down Hermetic Admin Server...');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n?? Shutting down Hermetic Admin Server...');
            await server.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('[X] Failed to start server:', error);
        process.exit(1);
    }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    startHermeticAdminServer();
}

export default HermeticAdminServer;

