#!/usr/bin/env node

/**
 * 🧪 TEST DASHBOARD SERVER - QBTC SYSTEM
 * ======================================
 * 
 * Versión simplificada del servidor dashboard para testing
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestDashboardServer {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = process.env.PORT || 3333;
        this.dashboardPath = path.join(__dirname, '../dashboard');
        
        this.setup();
    }

    setup() {
        // Middleware básico
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(this.dashboardPath));

        this.setupRoutes();
        this.setupWebSocket();
        this.startMetricsSimulation();

        console.log('🚀 Test Dashboard Server initialized');
    }

    setupRoutes() {
        // Ruta principal del dashboard
        this.app.get('/', async (req, res) => {
            try {
                // Verificar si existe el archivo HTML del dashboard
                const dashboardFile = path.join(this.dashboardPath, 'quantum-dashboard.html');
                
                try {
                    await fs.access(dashboardFile);
                    res.sendFile(dashboardFile);
                } catch (error) {
                    // Si no existe el dashboard, crear una página de prueba
                    res.send(this.generateTestDashboardHTML());
                }
            } catch (error) {
                res.status(500).send('Error loading dashboard');
            }
        });

        // API endpoint para métricas
        this.app.get('/api/metrics', async (req, res) => {
            try {
                const metrics = await this.loadLatestMetrics();
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

        // API endpoint para actualización de métricas
        this.app.post('/api/metrics/refresh', async (req, res) => {
            try {
                console.log('🔄 Manual metrics refresh requested');
                const metrics = await this.generateLiveMetrics();
                
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

        console.log('✅ API routes configured');
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            
            // Enviar métricas iniciales
            this.loadLatestMetrics().then(metrics => {
                if (metrics) {
                    socket.emit('metricsUpdate', metrics);
                }
            });

            socket.on('requestMetrics', async () => {
                try {
                    const metrics = await this.generateLiveMetrics();
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

    async loadLatestMetrics() {
        try {
            const latestFile = path.join(__dirname, '../metrics-output/latest-test-metrics.json');
            const data = await fs.readFile(latestFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('📊 No existing metrics found, generating new ones...');
            return await this.generateLiveMetrics();
        }
    }

    async generateLiveMetrics() {
        // Generar métricas en vivo similares al test unifier
        const lambda7919 = 7.919;
        const phiGolden = 1.618;
        
        const coherence = Math.min(0.99, Math.max(0.85, 0.92 + Math.sin(Date.now() / 100000) * 0.05));
        const lambdaResonance = Math.min(1.0, Math.max(0.5, 0.8 + Math.cos(Date.now() / 80000) * 0.15));
        const fieldStrength = (coherence + lambdaResonance) / 2 * 0.9;
        const entropy = Math.max(0.1, Math.min(0.8, 0.3 + 0.947 * 0.2));
        
        const consciousnessLevel = Math.max(80, Math.min(99, 
            (coherence * 0.4 + lambdaResonance * 0.3 + fieldStrength * 0.3) * 100 +
            Math.sin(Date.now() / 300000) * 3
        ));
        
        return {
            timestamp: new Date().toISOString(),
            updateDuration: Math.floor(0.947 * 200) + 50,
            dataSource: 'LIVE_SIMULATION',
            
            quantum: {
                coherence,
                lambdaResonance,
                fieldStrength,
                entropy,
                lambda7919,
                phiGolden,
                totalVolume: Math.floor(0.947 * 2000000000) + 1000000000,
                avgPriceChange: (0.947 - 0.5) * 6,
                marketMomentum: 0.947 * 0.8 + 0.2,
                superposition: Math.sin(coherence * lambdaResonance * phiGolden) * 0.5 + 0.5,
                entanglement: Math.cos(lambda7919 * 0.1) * 0.4 + 0.6
            },
            
            consciousness: {
                level: consciousnessLevel,
                evolutionRate: 0.001,
                chakrasActive: Math.floor(consciousnessLevel / 8),
                awakening: consciousnessLevel > 85,
                enlightenment: consciousnessLevel > 90,
                transcendence: consciousnessLevel > 95,
                timestamp: new Date().toISOString()
            },
            
            system: {
                status: 'OPERATIONAL',
                health: coherence > 0.9 ? 'EXCELLENT' : coherence > 0.8 ? 'GOOD' : 'FAIR',
                enginesActive: 4,
                neuronsLoaded: 77,
                version: '1.0.0-test',
                timestamp: new Date().toISOString()
            },
            
            performance: {
                uptime: (process.uptime() / 3600).toFixed(2) + 'h',
                responseTime: Math.floor(0.947 * 50) + 20 + 'ms',
                quantumEfficiency: (coherence * lambdaResonance * 100).toFixed(1) + '%',
                efficiencyScore: Math.floor((coherence + lambdaResonance + fieldStrength) / 3 * 100),
                timestamp: new Date().toISOString()
            },
            
            testMode: true,
            coherenceOptimal: coherence > 0.9,
            consciousnessActive: consciousnessLevel > 80
        };
    }

    startMetricsSimulation() {
        // Actualización periódica cada 5 segundos para testing
        setInterval(async () => {
            try {
                const metrics = await this.generateLiveMetrics();
                this.io.emit('metricsUpdate', metrics);
                console.log('📡 Live metrics updated and broadcasted');
            } catch (error) {
                console.error('❌ Error updating live metrics:', error.message);
            }
        }, 5000);

        console.log('✅ Live metrics simulation configured (5s intervals)');
    }

    generateTestDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Quantum Dashboard - Test Mode</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            color: #00ff88;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            border-radius: 10px;
        }

        .header h1 {
            font-size: 2.5em;
            color: #00ff88;
            text-shadow: 0 0 10px #00ff88;
        }

        .status {
            margin: 10px 0;
            color: #ffaa00;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: rgba(0, 255, 136, 0.05);
            border: 1px solid #00ff88;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s ease;
        }

        .metric-card:hover {
            background: rgba(0, 255, 136, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
        }

        .metric-title {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #00ff88;
        }

        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #ffaa00;
            margin-bottom: 5px;
        }

        .metric-status {
            font-size: 0.9em;
            color: #66ff99;
        }

        .log {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #00ff88;
            border-radius: 10px;
            padding: 20px;
            max-height: 300px;
            overflow-y: auto;
        }

        .log-entry {
            margin-bottom: 5px;
            font-size: 0.9em;
        }

        .timestamp {
            color: #666;
        }

        .controls {
            text-align: center;
            margin: 20px 0;
        }

        .btn {
            background: linear-gradient(45deg, #00ff88, #00cc66);
            color: #000;
            border: none;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌌 QBTC QUANTUM DASHBOARD</h1>
            <div class="status" id="connectionStatus">🔌 Connecting to Quantum Brain...</div>
            <div class="status" id="lastUpdate">📡 Initializing...</div>
        </div>

        <div class="controls">
            <button class="btn" onclick="requestMetrics()">🔄 Refresh Metrics</button>
            <button class="btn" onclick="toggleAutoUpdate()">⏯️ Auto Update</button>
            <button class="btn" onclick="clearLog()">🗑️ Clear Log</button>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">🎯 Quantum Coherence</div>
                <div class="metric-value" id="coherence">--.--%</div>
                <div class="metric-status" id="coherenceStatus">Initializing...</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">⚛️ Lambda Resonance</div>
                <div class="metric-value" id="resonance">--.--%</div>
                <div class="metric-status" id="resonanceStatus">Waiting for data...</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">🧠 Consciousness Level</div>
                <div class="metric-value" id="consciousness">--.--%</div>
                <div class="metric-status" id="consciousnessStatus">Awakening...</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">⚡ Quantum Field</div>
                <div class="metric-value" id="field">--.--%</div>
                <div class="metric-status" id="fieldStatus">Stabilizing...</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">💾 System Status</div>
                <div class="metric-value" id="systemStatus">INITIALIZING</div>
                <div class="metric-status" id="systemHealth">Starting up...</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">📈 Performance</div>
                <div class="metric-value" id="performance">--%</div>
                <div class="metric-status" id="performanceStatus">Calculating...</div>
            </div>
        </div>

        <div class="log">
            <h3>📋 System Log</h3>
            <div id="logContainer">
                <div class="log-entry">
                    <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
                    🌌 QBTC Quantum Dashboard initialized in test mode
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        let autoUpdate = true;

        socket.on('connect', () => {
            updateConnectionStatus('🟢 Connected to Quantum Brain');
            addLogEntry('🔌 WebSocket connection established');
        });

        socket.on('disconnect', () => {
            updateConnectionStatus('🔴 Disconnected from Quantum Brain');
            addLogEntry('❌ WebSocket connection lost');
        });

        socket.on('metricsUpdate', (data) => {
            updateMetrics(data);
            updateLastUpdate();
            addLogEntry('📡 Metrics updated successfully');
        });

        function updateMetrics(data) {
            if (!data || !data.quantum) return;

            const q = data.quantum;
            const c = data.consciousness;
            const s = data.system;
            const p = data.performance;

            document.getElementById('coherence').textContent = (q.coherence * 100).toFixed(1) + '%';
            document.getElementById('coherenceStatus').textContent = q.coherence > 0.9 ? 'OPTIMAL' : 'STABILIZING';

            document.getElementById('resonance').textContent = (q.lambdaResonance * 100).toFixed(1) + '%';
            document.getElementById('resonanceStatus').textContent = 'λ = ' + q.lambda7919;

            document.getElementById('consciousness').textContent = c.level.toFixed(1) + '%';
            document.getElementById('consciousnessStatus').textContent = 
                c.awakening ? (c.enlightenment ? 'ENLIGHTENED' : 'AWAKENED') : 'EVOLVING';

            document.getElementById('field').textContent = (q.fieldStrength * 100).toFixed(1) + '%';
            document.getElementById('fieldStatus').textContent = 'Φ = ' + q.phiGolden;

            document.getElementById('systemStatus').textContent = s.status;
            document.getElementById('systemHealth').textContent = s.health;

            document.getElementById('performance').textContent = p.efficiencyScore + '%';
            document.getElementById('performanceStatus').textContent = 'Uptime: ' + p.uptime;
        }

        function updateConnectionStatus(status) {
            document.getElementById('connectionStatus').textContent = status;
        }

        function updateLastUpdate() {
            document.getElementById('lastUpdate').textContent = 
                '📡 Last Update: ' + new Date().toLocaleTimeString();
        }

        function addLogEntry(message) {
            const logContainer = document.getElementById('logContainer');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = \`<span class="timestamp">[\${new Date().toLocaleTimeString()}]</span> \${message}\`;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Mantener solo los últimos 50 logs
            while (logContainer.children.length > 50) {
                logContainer.removeChild(logContainer.firstChild);
            }
        }

        function requestMetrics() {
            socket.emit('requestMetrics');
            addLogEntry('🔄 Manual metrics refresh requested');
        }

        function toggleAutoUpdate() {
            autoUpdate = !autoUpdate;
            addLogEntry(autoUpdate ? '▶️ Auto-update enabled' : '⏸️ Auto-update paused');
        }

        function clearLog() {
            document.getElementById('logContainer').innerHTML = 
                '<div class="log-entry"><span class="timestamp">[' + 
                new Date().toLocaleTimeString() + ']</span> 🗑️ Log cleared</div>';
        }

        // Solicitar métricas iniciales
        setTimeout(() => {
            requestMetrics();
        }, 1000);
    </script>
</body>
</html>
        `;
    }

    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server.listen(this.port, () => {
                    console.log('\n🌌 QBTC QUANTUM DASHBOARD SERVER - TEST MODE');
                    console.log('=============================================');
                    console.log(`🚀 Server running on port ${this.port}`);
                    console.log(`🌐 Dashboard URL: http://localhost:${this.port}`);
                    console.log(`📊 API Base URL: http://localhost:${this.port}/api`);
                    console.log(`🔌 WebSocket server active`);
                    console.log('✅ Test server operational\n');
                    
                    console.log('📋 Available endpoints:');
                    console.log('  GET  /              - Test Dashboard');
                    console.log('  GET  /api/metrics   - Current metrics');
                    console.log('  POST /api/metrics/refresh - Refresh metrics');
                    console.log('  GET  /health        - Health check');
                    console.log('\n🎯 Ready for quantum consciousness testing!');
                    
                    resolve(this.server);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async stop() {
        return new Promise((resolve) => {
            this.server.close(() => {
                console.log('🛑 Test dashboard server stopped');
                resolve();
            });
        });
    }
}

// Función principal
async function main() {
    const testServer = new TestDashboardServer();
    
    try {
        await testServer.start();
        
        // Manejo de señales para shutdown graceful
        process.on('SIGINT', async () => {
            console.log('\n⚠️  Shutting down test server...');
            await testServer.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('💥 Failed to start test server:', error.message);
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

export { TestDashboardServer };
