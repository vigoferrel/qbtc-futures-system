#!/usr/bin/env node

/**
 * 🚀 DASHBOARD SERVER STARTER - QBTC SYSTEM
 * =========================================
 * 
 * Script para iniciar el servidor HTTP del dashboard con métricas unificadas
 * - Ejecuta el servidor Express con proxy hacia el backend
 * - Integra el Quantum Metrics Unifier para datos consistentes
 * - Proporciona endpoints de API y WebSocket
 * - Facilita validación y testing del dashboard
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { QuantumMetricsUnifier } from './quantum-metrics-unifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DashboardServerManager {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.metricsUnifier = new QuantumMetricsUnifier();
        this.port = process.env.PORT || 3333;
        this.dashboardPath = path.join(__dirname, '../dashboard');
        
        this.setup();
    }

    setup() {
        // Middleware básico
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(this.dashboardPath));

        // Headers de seguridad
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });

        this.setupRoutes();
        this.setupWebSocket();
        this.startMetricsUpdates();

        console.log('🚀 Dashboard Server Manager initialized');
    }

    setupRoutes() {
        // Ruta principal del dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(this.dashboardPath, 'quantum-dashboard.html'));
        });

        // API endpoints para métricas
        this.app.get('/api/metrics', async (req, res) => {
            try {
                const metrics = this.metricsUnifier.getUnifiedMetrics();
                res.json({
                    success: true,
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // API endpoint para actualización forzada de métricas
        this.app.post('/api/metrics/refresh', async (req, res) => {
            try {
                console.log('🔄 Manual metrics refresh requested');
                const metrics = await this.metricsUnifier.unifyAllMetrics();
                
                // Emitir actualización via WebSocket
                this.io.emit('metricsUpdate', metrics);
                
                res.json({
                    success: true,
                    message: 'Metrics refreshed successfully',
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                pid: process.pid,
                timestamp: new Date().toISOString()
            });
        });

        // Proxy hacia el backend principal (si está disponible)
        this.app.all('/api/proxy/*', async (req, res) => {
            try {
                // Aquí iría la lógica de proxy hacia el backend principal
                // Por ahora retornamos un mock
                res.json({
                    success: true,
                    message: 'Proxy endpoint - backend integration pending',
                    path: req.path,
                    method: req.method,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        console.log('✅ API routes configured');
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            
            // Enviar métricas iniciales
            const currentMetrics = this.metricsUnifier.getUnifiedMetrics();
            if (currentMetrics && Object.keys(currentMetrics).length > 0) {
                socket.emit('metricsUpdate', currentMetrics);
            }

            // Manejar solicitudes del cliente
            socket.on('requestMetrics', async () => {
                try {
                    const metrics = await this.metricsUnifier.unifyAllMetrics();
                    socket.emit('metricsUpdate', metrics);
                } catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });

            socket.on('disconnect', () => {
                console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });

        console.log('✅ WebSocket server configured');
    }

    startMetricsUpdates() {
        // Actualización inicial
        setTimeout(async () => {
            try {
                console.log('🔄 Starting initial metrics load...');
                const metrics = await this.metricsUnifier.unifyAllMetrics();
                this.io.emit('metricsUpdate', metrics);
                console.log('✅ Initial metrics loaded and broadcasted');
            } catch (error) {
                console.error('❌ Error loading initial metrics:', error.message);
            }
        }, 2000);

        // Actualización periódica cada 30 segundos
        setInterval(async () => {
            try {
                const metrics = await this.metricsUnifier.unifyAllMetrics();
                this.io.emit('metricsUpdate', metrics);
                console.log('📡 Metrics updated and broadcasted to all clients');
            } catch (error) {
                console.error('❌ Error updating metrics:', error.message);
            }
        }, 30000);

        console.log('✅ Metrics update scheduler configured');
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server.listen(this.port, () => {
                    console.log('\n🌌 QBTC QUANTUM DASHBOARD SERVER');
                    console.log('================================');
                    console.log(`🚀 Server running on port ${this.port}`);
                    console.log(`🌐 Dashboard URL: http://localhost:${this.port}`);
                    console.log(`📊 API Base URL: http://localhost:${this.port}/api`);
                    console.log(`🔌 WebSocket server active`);
                    console.log('✅ All systems operational\n');
                    
                    console.log('📋 Available endpoints:');
                    console.log('  GET  /              - Quantum Dashboard (HTML)');
                    console.log('  GET  /api/metrics   - Current unified metrics');
                    console.log('  POST /api/metrics/refresh - Force metrics refresh');
                    console.log('  GET  /health        - Server health check');
                    console.log('  ALL  /api/proxy/*   - Backend proxy (pending)');
                    console.log('\n🎯 Ready for quantum consciousness analysis!');
                    
                    resolve(this.server);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('🛑 Dashboard server stopped');
                resolve();
            });
        });
    }
}

// Función principal
async function main() {
    const serverManager = new DashboardServerManager();
    
    try {
        await serverManager.start();
        
        // Manejo de señales para shutdown graceful
        process.on('SIGINT', async () => {
            console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
            await serverManager.stop();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
            await serverManager.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('💥 Failed to start dashboard server:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

export { DashboardServerManager };
