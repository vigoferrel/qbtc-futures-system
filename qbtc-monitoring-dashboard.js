#!/usr/bin/env node

/**
 * QBTC MONITORING DASHBOARD
 * =========================
 *
 * Dashboard completo para monitoreo del sistema QBTC
 * Integra VPN, Proxy, IP Coordination y métricas en tiempo real
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import QBTCVPNConnector from './qbtc-vpn-connector.js';
import { QBTCIPCoordinator } from './qbtc-ip-coordinator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCMonitoringDashboard {
    constructor(options = {}) {
        this.options = {
            port: process.env.DASHBOARD_PORT || 8080,
            updateInterval: 5000, // 5 seconds
            ...options
        };

        this.app = express();
        this.vpnConnector = new QBTCVPNConnector();
        this.ipCoordinator = new QBTCIPCoordinator();
        this.metrics = {
            startTime: new Date(),
            requests: 0,
            errors: 0,
            vpnConnections: 0,
            ipChanges: 0,
            lastUpdate: null
        };

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.startMetricsCollection();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API Routes
        this.app.get('/api/status', this.getSystemStatus.bind(this));
        this.app.get('/api/metrics', this.getMetrics.bind(this));
        this.app.get('/api/vpn/status', this.getVPNStatus.bind(this));
        this.app.get('/api/ip/status', this.getIPStatus.bind(this));
        this.app.post('/api/vpn/connect', this.connectVPN.bind(this));
        this.app.post('/api/vpn/disconnect', this.disconnectVPN.bind(this));
        this.app.post('/api/coordinator/start', this.startCoordinator.bind(this));
        this.app.post('/api/coordinator/stop', this.stopCoordinator.bind(this));

        // Main dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'monitoring-dashboard.html'));
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });
    }

    setupWebSocket() {
        // WebSocket para actualizaciones en tiempo real
        this.io = require('socket.io')(this.server);

        this.io.on('connection', (socket) => {
            console.log('📡 Client connected to monitoring dashboard');

            socket.on('disconnect', () => {
                console.log('❌ Client disconnected from monitoring dashboard');
            });

            // Enviar datos iniciales
            this.sendRealTimeUpdate(socket);
        });
    }

    async getSystemStatus(req, res) {
        try {
            const vpnStatus = this.vpnConnector.getStatus();
            const coordinatorStatus = this.ipCoordinator.getStatus();
            const ipStatus = await this.ipCoordinator.checkIPStatus();

            const status = {
                timestamp: new Date().toISOString(),
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version
                },
                vpn: vpnStatus,
                coordinator: coordinatorStatus,
                ip: ipStatus,
                metrics: this.metrics
            };

            res.json(status);
        } catch (error) {
            res.status(500).json({
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    getMetrics(req, res) {
        res.json({
            ...this.metrics,
            timestamp: new Date().toISOString()
        });
    }

    async getVPNStatus(req, res) {
        try {
            const status = this.vpnConnector.getStatus();
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getIPStatus(req, res) {
        try {
            const status = await this.ipCoordinator.checkIPStatus();
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async connectVPN(req, res) {
        try {
            await this.vpnConnector.connect();
            this.metrics.vpnConnections++;
            res.json({ success: true, message: 'VPN connection initiated' });
        } catch (error) {
            this.metrics.errors++;
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async disconnectVPN(req, res) {
        try {
            await this.vpnConnector.disconnect();
            res.json({ success: true, message: 'VPN disconnected' });
        } catch (error) {
            this.metrics.errors++;
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async startCoordinator(req, res) {
        try {
            await this.ipCoordinator.start();
            res.json({ success: true, message: 'IP Coordinator started' });
        } catch (error) {
            this.metrics.errors++;
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async stopCoordinator(req, res) {
        try {
            await this.ipCoordinator.stop();
            res.json({ success: true, message: 'IP Coordinator stopped' });
        } catch (error) {
            this.metrics.errors++;
            res.status(500).json({ success: false, error: error.message });
        }
    }

    startMetricsCollection() {
        setInterval(() => {
            this.updateMetrics();
            this.sendRealTimeUpdate();
        }, this.options.updateInterval);
    }

    updateMetrics() {
        this.metrics.lastUpdate = new Date().toISOString();

        // Contar requests (esto es aproximado)
        this.metrics.requests = (this.metrics.requests || 0) + 1;
    }

    sendRealTimeUpdate(socket = null) {
        const updateData = {
            timestamp: new Date().toISOString(),
            vpn: this.vpnConnector.getStatus(),
            coordinator: this.ipCoordinator.getStatus(),
            metrics: this.metrics
        };

        if (socket) {
            socket.emit('update', updateData);
        } else if (this.io) {
            this.io.emit('update', updateData);
        }
    }

    start() {
        // Crear directorio público si no existe
        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        // Crear dashboard HTML
        this.createDashboardHTML();

        // Iniciar servidor HTTP con WebSocket
        const server = require('http').createServer(this.app);
        this.io = require('socket.io')(server);

        server.listen(this.options.port, () => {
            console.log('📊 QBTC MONITORING DASHBOARD STARTED');
            console.log('=====================================');
            console.log(`🚀 Dashboard: http://localhost:${this.options.port}`);
            console.log(`🔌 WebSocket: ws://localhost:${this.options.port}`);
            console.log('=====================================');
        });

        this.server = server;
    }

    createDashboardHTML() {
        const dashboardHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Monitoring Dashboard</title>
    <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .header h1 {
            color: #00d4ff;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: linear-gradient(135deg, #1e1e2e, #2a2a4e);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            border: 1px solid #333;
        }
        .status-card h3 {
            color: #00d4ff;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #333;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-label {
            font-weight: bold;
            color: #ccc;
        }
        .metric-value {
            font-weight: bold;
            color: #fff;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-online { background: #00ff00; }
        .status-offline { background: #ff4444; }
        .status-warning { background: #ffaa00; }
        .controls {
            background: linear-gradient(135deg, #2a2a4e, #1e1e2e);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .control-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        button {
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,212,255,0.3);
        }
        button:disabled {
            background: #555;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .logs {
            background: #1a1a1a;
            border-radius: 10px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #333;
        }
        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }
        .log-timestamp {
            color: #888;
            margin-right: 10px;
        }
        .log-level-info { color: #00d4ff; }
        .log-level-error { color: #ff4444; }
        .log-level-success { color: #00ff00; }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 QBTC MONITORING DASHBOARD</h1>
            <p>Sistema Unificado de Coordinación IP - VPN + Proxy + Monitoreo</p>
        </div>

        <div class="controls">
            <h3>🎮 Controles del Sistema</h3>
            <div class="control-buttons">
                <button onclick="connectVPN()">🔗 Conectar VPN</button>
                <button onclick="disconnectVPN()">🔌 Desconectar VPN</button>
                <button onclick="startCoordinator()">▶️ Iniciar Coordinador</button>
                <button onclick="stopCoordinator()">⏹️ Detener Coordinador</button>
                <button onclick="refreshData()">🔄 Actualizar</button>
            </div>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <h3>🔗 Estado VPN</h3>
                <div class="metric">
                    <span class="metric-label">Conectado:</span>
                    <span class="metric-value">
                        <span id="vpn-status-indicator" class="status-indicator status-offline"></span>
                        <span id="vpn-connected">Cargando...</span>
                    </span>
                </div>
                <div class="metric">
                    <span class="metric-label">IP Actual:</span>
                    <span class="metric-value" id="vpn-current-ip">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">IP Objetivo:</span>
                    <span class="metric-value" id="vpn-target-ip">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Monitoreo:</span>
                    <span class="metric-value" id="vpn-monitoring">-</span>
                </div>
            </div>

            <div class="status-card">
                <h3>🌐 Coordinador IP</h3>
                <div class="metric">
                    <span class="metric-label">Activo:</span>
                    <span class="metric-value">
                        <span id="coord-status-indicator" class="status-indicator status-offline"></span>
                        <span id="coord-active">Cargando...</span>
                    </span>
                </div>
                <div class="metric">
                    <span class="metric-label">Modo Actual:</span>
                    <span class="metric-value" id="coord-mode">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">IP Objetivo:</span>
                    <span class="metric-value" id="coord-target-ip">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Monitoreo:</span>
                    <span class="metric-value" id="coord-monitoring">-</span>
                </div>
            </div>

            <div class="status-card">
                <h3>📊 Métricas del Sistema</h3>
                <div class="metric">
                    <span class="metric-label">Uptime:</span>
                    <span class="metric-value" id="metrics-uptime">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Requests:</span>
                    <span class="metric-value" id="metrics-requests">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Errores:</span>
                    <span class="metric-value" id="metrics-errors">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Última actualización:</span>
                    <span class="metric-value" id="metrics-last-update">-</span>
                </div>
            </div>

            <div class="status-card">
                <h3>🔄 Estado de Conexión IP</h3>
                <div class="metric">
                    <span class="metric-label">IP Actual:</span>
                    <span class="metric-value" id="ip-current">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">IP Objetivo:</span>
                    <span class="metric-value" id="ip-target">-</span>
                </div>
                <div class="metric">
                    <span class="metric-label">¿Objetivo?:</span>
                    <span class="metric-value">
                        <span id="ip-is-target-indicator" class="status-indicator status-offline"></span>
                        <span id="ip-is-target">Cargando...</span>
                    </span>
                </div>
                <div class="metric">
                    <span class="metric-label">Última verificación:</span>
                    <span class="metric-value" id="ip-last-check">-</span>
                </div>
            </div>
        </div>

        <div class="status-card">
            <h3>📋 Historial de Eventos</h3>
            <div id="logs" class="logs">
                <div class="log-entry">
                    <span class="log-timestamp">[Sistema]</span>
                    <span class="log-level-info">Dashboard inicializado</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let systemData = {};

        // Conectar a WebSocket
        socket.on('connect', () => {
            console.log('📡 Conectado al servidor de monitoreo');
            addLogEntry('Sistema', 'Conectado al servidor de monitoreo', 'success');
        });

        socket.on('disconnect', () => {
            console.log('❌ Desconectado del servidor de monitoreo');
            addLogEntry('Sistema', 'Desconectado del servidor de monitoreo', 'error');
        });

        // Recibir actualizaciones en tiempo real
        socket.on('update', (data) => {
            systemData = data;
            updateDashboard(data);
        });

        // Funciones de control
        async function connectVPN() {
            try {
                const response = await fetch('/api/vpn/connect', { method: 'POST' });
                const result = await response.json();
                addLogEntry('VPN', result.message, result.success ? 'success' : 'error');
            } catch (error) {
                addLogEntry('VPN', 'Error conectando VPN: ' + error.message, 'error');
            }
        }

        async function disconnectVPN() {
            try {
                const response = await fetch('/api/vpn/disconnect', { method: 'POST' });
                const result = await response.json();
                addLogEntry('VPN', result.message, result.success ? 'success' : 'error');
            } catch (error) {
                addLogEntry('VPN', 'Error desconectando VPN: ' + error.message, 'error');
            }
        }

        async function startCoordinator() {
            try {
                const response = await fetch('/api/coordinator/start', { method: 'POST' });
                const result = await response.json();
                addLogEntry('Coordinador', result.message, result.success ? 'success' : 'error');
            } catch (error) {
                addLogEntry('Coordinador', 'Error iniciando coordinador: ' + error.message, 'error');
            }
        }

        async function stopCoordinator() {
            try {
                const response = await fetch('/api/coordinator/stop', { method: 'POST' });
                const result = await response.json();
                addLogEntry('Coordinador', result.message, result.success ? 'success' : 'error');
            } catch (error) {
                addLogEntry('Coordinador', 'Error deteniendo coordinador: ' + error.message, 'error');
            }
        }

        async function refreshData() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                updateDashboard(data);
                addLogEntry('Sistema', 'Datos actualizados manualmente', 'info');
            } catch (error) {
                addLogEntry('Sistema', 'Error actualizando datos: ' + error.message, 'error');
            }
        }

        function updateDashboard(data) {
            // Actualizar VPN
            const vpnStatus = data.vpn || {};
            document.getElementById('vpn-connected').textContent = vpnStatus.isConnected ? 'Sí' : 'No';
            document.getElementById('vpn-status-indicator').className =
                'status-indicator ' + (vpnStatus.isConnected ? 'status-online' : 'status-offline');
            document.getElementById('vpn-current-ip').textContent = vpnStatus.currentIP || '-';
            document.getElementById('vpn-target-ip').textContent = vpnStatus.targetIP || '-';
            document.getElementById('vpn-monitoring').textContent = vpnStatus.monitoring ? 'Activo' : 'Inactivo';

            // Actualizar Coordinador
            const coordStatus = data.coordinator || {};
            document.getElementById('coord-active').textContent = coordStatus.isActive ? 'Sí' : 'No';
            document.getElementById('coord-status-indicator').className =
                'status-indicator ' + (coordStatus.isActive ? 'status-online' : 'status-offline');
            document.getElementById('coord-mode').textContent = coordStatus.currentMode || '-';
            document.getElementById('coord-target-ip').textContent = coordStatus.targetIP || '-';
            document.getElementById('coord-monitoring').textContent = coordStatus.monitoring ? 'Activo' : 'Inactivo';

            // Actualizar métricas
            const metrics = data.metrics || {};
            document.getElementById('metrics-uptime').textContent = formatUptime(metrics.uptime || 0);
            document.getElementById('metrics-requests').textContent = metrics.requests || 0;
            document.getElementById('metrics-errors').textContent = metrics.errors || 0;
            document.getElementById('metrics-last-update').textContent =
                metrics.lastUpdate ? new Date(metrics.lastUpdate).toLocaleTimeString() : '-';

            // Actualizar IP
            const ipStatus = data.ip || {};
            document.getElementById('ip-current').textContent = ipStatus.currentIP || '-';
            document.getElementById('ip-target').textContent = ipStatus.targetIP || '-';
            document.getElementById('ip-is-target').textContent = ipStatus.isTargetIP ? 'Sí' : 'No';
            document.getElementById('ip-is-target-indicator').className =
                'status-indicator ' + (ipStatus.isTargetIP ? 'status-online' : 'status-offline');
            document.getElementById('ip-last-check').textContent =
                ipStatus.timestamp ? new Date(ipStatus.timestamp).toLocaleTimeString() : '-';
        }

        function addLogEntry(component, message, level = 'info') {
            const logsDiv = document.getElementById('logs');
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';

            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';
            timestamp.textContent = '[' + new Date().toLocaleTimeString() + ']';

            const levelSpan = document.createElement('span');
            levelSpan.className = 'log-level-' + level;
            levelSpan.textContent = '[' + component + '] ' + message;

            logEntry.appendChild(timestamp);
            logEntry.appendChild(levelSpan);
            logsDiv.appendChild(logEntry);

            // Mantener solo las últimas 50 entradas
            while (logsDiv.children.length > 50) {
                logsDiv.removeChild(logsDiv.firstChild);
            }

            // Auto-scroll
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }

        function formatUptime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return \`\${hours}h \${minutes}m \${secs}s\`;
        }

        // Cargar datos iniciales
        refreshData();

        // Actualizar automáticamente cada 5 segundos
        setInterval(refreshData, 5000);
    </script>
</body>
</html>`;

        fs.writeFileSync(path.join(__dirname, 'public', 'monitoring-dashboard.html'), dashboardHTML);
    }
}

// Función para uso directo desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'start':
                const dashboard = new QBTCMonitoringDashboard();
                dashboard.start();
                break;

            default:
                console.log('Usage: node qbtc-monitoring-dashboard.js <command>');
                console.log('Commands:');
                console.log('  start - Start monitoring dashboard');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Exportar clase para uso como módulo
export default QBTCMonitoringDashboard;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}