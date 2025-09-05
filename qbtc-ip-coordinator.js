#!/usr/bin/env node

/**
 * QBTC IP COORDINATOR
 * ===================
 *
 * Sistema unificado para coordinación de IPs
 * Combina VPN + Proxy con failover automático
 */

import QBTCVPNConnector from './qbtc-vpn-connector.js';
import express from 'express';
import https from 'https';
import http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';
import crypto from 'crypto';
import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCIPCoordinator extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            targetIP: '181.43.212.196',
            proxyPort: 8888,
            checkInterval: 15000, // 15 seconds
            failoverTimeout: 30000, // 30 seconds
            maxRetries: 3,
            ...options
        };

        this.vpnConnector = new QBTCVPNConnector(this.options);
        this.proxyServer = null;
        this.currentMode = 'none'; // 'vpn', 'proxy', or 'none'
        this.isActive = false;
        this.lastCheck = null;
        this.failoverHistory = [];

        this.setupEventHandlers();
        this.setupProxyServer();
    }

    setupEventHandlers() {
        // Eventos del VPN Connector
        this.vpnConnector.on('connected', () => {
            console.log('🔗 VPN connected - switching to VPN mode');
            this.currentMode = 'vpn';
            this.emit('mode-changed', 'vpn');
            this.logFailoverEvent('vpn_connected');
        });

        this.vpnConnector.on('disconnected', () => {
            console.log('🔌 VPN disconnected - attempting failover');
            this.handleVPNDisconnection();
        });

        this.vpnConnector.on('error', (error) => {
            console.error('🚨 VPN error:', error.message);
            this.emit('error', error);
        });

        // Eventos propios
        this.on('mode-changed', (mode) => {
            console.log(`🔄 IP Coordinator mode changed to: ${mode}`);
        });

        this.on('failover-triggered', (reason) => {
            console.log(`🔄 Failover triggered: ${reason}`);
        });
    }

    setupProxyServer() {
        this.proxyServer = http.createServer((req, res) => {
            this.handleProxyRequest(req, res);
        });
    }

    async start() {
        console.log('🚀 Starting QBTC IP Coordinator...');
        console.log(`🎯 Target IP: ${this.options.targetIP}`);

        // Iniciar servidor proxy
        this.proxyServer.listen(this.options.proxyPort, () => {
            console.log(`🌐 Proxy server listening on port ${this.options.proxyPort}`);
        });

        // Iniciar monitoreo
        this.startMonitoring();

        // Intentar conexión inicial
        await this.ensureConnection();

        this.isActive = true;
        this.emit('started');
    }

    async stop() {
        console.log('🛑 Stopping QBTC IP Coordinator...');

        this.stopMonitoring();

        if (this.proxyServer) {
            this.proxyServer.close();
        }

        await this.vpnConnector.disconnect();

        this.isActive = false;
        this.currentMode = 'none';
        this.emit('stopped');
    }

    async ensureConnection() {
        console.log('🔍 Ensuring IP connection...');

        // Verificar estado actual
        const status = await this.checkIPStatus();

        if (status.isTargetIP) {
            // Ya conectado a la IP objetivo
            if (!this.vpnConnector.isConnected) {
                // Puede ser conexión directa o proxy
                this.currentMode = 'direct';
                this.logFailoverEvent('direct_connection_detected');
            }
            return { success: true, mode: this.currentMode };
        }

        // Intentar VPN primero
        try {
            console.log('🔗 Attempting VPN connection...');
            await this.vpnConnector.connect();
            return { success: true, mode: 'vpn' };
        } catch (vpnError) {
            console.warn('VPN connection failed, falling back to proxy mode');
            this.logFailoverEvent('vpn_failed_fallback_to_proxy', vpnError.message);

            // Activar modo proxy
            this.currentMode = 'proxy';
            this.emit('mode-changed', 'proxy');

            return { success: true, mode: 'proxy' };
        }
    }

    async handleVPNDisconnection() {
        console.log('🔄 Handling VPN disconnection...');

        // Verificar si aún tenemos la IP objetivo
        const status = await this.checkIPStatus();

        if (status.isTargetIP) {
            // La IP objetivo se mantiene, puede ser conexión directa
            this.currentMode = 'direct';
            this.logFailoverEvent('vpn_disconnected_but_ip_maintained');
            return;
        }

        // Intentar reconectar VPN
        try {
            console.log('🔄 Attempting VPN reconnection...');
            await this.vpnConnector.connect();
        } catch (error) {
            console.warn('VPN reconnection failed, switching to proxy mode');
            this.currentMode = 'proxy';
            this.emit('mode-changed', 'proxy');
            this.emit('failover-triggered', 'vpn_reconnection_failed');
            this.logFailoverEvent('vpn_reconnection_failed_proxy_activated');
        }
    }

    async checkIPStatus() {
        try {
            const currentIP = await this.getCurrentIP();
            const isTargetIP = currentIP === this.options.targetIP;

            this.lastCheck = {
                timestamp: new Date().toISOString(),
                currentIP: currentIP,
                targetIP: this.options.targetIP,
                isTargetIP: isTargetIP
            };

            return this.lastCheck;
        } catch (error) {
            console.error('Error checking IP status:', error.message);
            return {
                timestamp: new Date().toISOString(),
                error: error.message,
                isTargetIP: false
            };
        }
    }

    async getCurrentIP() {
        return new Promise((resolve, reject) => {
            const services = [
                'https://api.ipify.org',
                'https://ipinfo.io/ip',
                'https://icanhazip.com'
            ];

            let completed = 0;
            let foundIP = null;

            services.forEach(service => {
                https.get(service, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        if (!foundIP) {
                            foundIP = data.trim();
                            resolve(foundIP);
                        }
                    });
                }).on('error', () => {
                    completed++;
                    if (completed === services.length && !foundIP) {
                        reject(new Error('All IP services failed'));
                    }
                });
            });
        });
    }

    handleProxyRequest(req, res) {
        console.log(`🌐 Proxy request: ${req.method} ${req.url}`);

        // Solo procesar si estamos en modo proxy
        if (this.currentMode !== 'proxy') {
            res.writeHead(503);
            res.end('Proxy not active - use VPN mode');
            return;
        }

        // Configurar headers para forzar IP
        const targetHeaders = {
            ...req.headers,
            'X-Forwarded-For': this.options.targetIP,
            'X-Real-IP': this.options.targetIP,
            'X-Client-IP': this.options.targetIP,
            'CF-Connecting-IP': this.options.targetIP,
            'X-Forwarded-Host': req.headers.host || 'fapi.binance.com',
            'X-Forwarded-Proto': 'https',
            'User-Agent': 'QBTC-IP-Coordinator/1.0'
        };

        // Determinar host objetivo
        let targetHost = 'fapi.binance.com';
        let targetPort = 443;

        if (req.url.includes('testnet')) {
            targetHost = 'testnet.binancefuture.com';
        }

        const options = {
            hostname: targetHost,
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: targetHeaders
        };

        console.log(`🎯 Proxying to: ${targetHost}${req.url} (forcing IP: ${this.options.targetIP})`);

        const proxyReq = https.request(options, (proxyRes) => {
            console.log(`✅ Proxy response: ${proxyRes.statusCode}`);

            // Copiar headers de respuesta
            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            // Pipe de respuesta
            proxyRes.pipe(res);
        });

        // Pipe de request
        req.pipe(proxyReq);

        proxyReq.on('error', (error) => {
            console.error('❌ Proxy error:', error.message);
            res.writeHead(500);
            res.end('Proxy Error: ' + error.message);
        });

        // Timeout
        proxyReq.setTimeout(30000, () => {
            proxyReq.destroy();
            res.writeHead(504);
            res.end('Proxy Timeout');
        });
    }

    startMonitoring() {
        if (this.monitoring) return;

        this.monitoring = true;
        console.log('🔍 Starting IP monitoring...');

        this.monitorInterval = setInterval(async () => {
            if (!this.isActive) return;

            const status = await this.checkIPStatus();

            // Verificar si necesitamos failover
            if (!status.isTargetIP && this.currentMode === 'vpn') {
                this.emit('failover-triggered', 'ip_changed_during_vpn');
                this.handleVPNDisconnection();
            }

        }, this.options.checkInterval);
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.monitoring = false;
    }

    logFailoverEvent(event, details = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            mode: this.currentMode,
            details: details
        };

        this.failoverHistory.push(logEntry);
        console.log(`📝 Failover event: ${event}`);

        // Mantener solo los últimos 100 eventos
        if (this.failoverHistory.length > 100) {
            this.failoverHistory = this.failoverHistory.slice(-100);
        }
    }

    getStatus() {
        return {
            isActive: this.isActive,
            currentMode: this.currentMode,
            targetIP: this.options.targetIP,
            lastCheck: this.lastCheck,
            vpnStatus: this.vpnConnector.getStatus(),
            failoverHistory: this.failoverHistory.slice(-10), // Últimos 10 eventos
            monitoring: this.monitoring
        };
    }

    // API para integración con otros sistemas
    async forceMode(mode) {
        console.log(`🔧 Forcing mode: ${mode}`);

        switch (mode) {
            case 'vpn':
                this.currentMode = 'vpn';
                await this.vpnConnector.connect();
                break;

            case 'proxy':
                this.currentMode = 'proxy';
                await this.vpnConnector.disconnect();
                break;

            case 'direct':
                this.currentMode = 'direct';
                await this.vpnConnector.disconnect();
                break;

            default:
                throw new Error(`Unknown mode: ${mode}`);
        }

        this.emit('mode-changed', mode);
        return { success: true, mode: mode };
    }
}

// API REST para gestión del coordinador
class QBTCIPCoordinatorAPI {
    constructor(coordinator) {
        this.coordinator = coordinator;
        this.app = express();
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.use(express.json());

        // Status endpoint
        this.app.get('/status', (req, res) => {
            res.json(this.coordinator.getStatus());
        });

        // Control endpoints
        this.app.post('/start', async (req, res) => {
            try {
                await this.coordinator.start();
                res.json({ success: true, message: 'Coordinator started' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/stop', async (req, res) => {
            try {
                await this.coordinator.stop();
                res.json({ success: true, message: 'Coordinator stopped' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/mode/:mode', async (req, res) => {
            try {
                const result = await this.coordinator.forceMode(req.params.mode);
                res.json(result);
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
        });

        // IP check endpoint
        this.app.get('/ip/check', async (req, res) => {
            try {
                const status = await this.coordinator.checkIPStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`📡 IP Coordinator API listening on port ${port}`);
        });
    }
}

// Función para uso directo desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const coordinator = new QBTCIPCoordinator();

    // Configurar logging de eventos
    coordinator.on('mode-changed', (mode) => {
        console.log(`🔄 Mode changed to: ${mode}`);
    });

    coordinator.on('failover-triggered', (reason) => {
        console.log(`🔄 Failover triggered: ${reason}`);
    });

    coordinator.on('error', (error) => {
        console.error(`🚨 Coordinator error: ${error.message}`);
    });

    try {
        switch (command) {
            case 'start':
                await coordinator.start();

                // Iniciar API si se solicita
                if (args.includes('--api')) {
                    const api = new QBTCIPCoordinatorAPI(coordinator);
                    api.start(3000);
                }

                // Mantener vivo para monitoreo
                process.on('SIGINT', async () => {
                    console.log('\n🛑 Stopping coordinator...');
                    await coordinator.stop();
                    process.exit(0);
                });

                break;

            case 'status':
                const status = coordinator.getStatus();
                console.log('📊 Coordinator Status:');
                console.log(JSON.stringify(status, null, 2));
                break;

            case 'test':
                console.log('🧪 Testing IP coordination...');
                await coordinator.ensureConnection();
                const testStatus = coordinator.getStatus();
                console.log('Test completed:', JSON.stringify(testStatus, null, 2));
                break;

            default:
                console.log('Usage: node qbtc-ip-coordinator.js <command>');
                console.log('Commands:');
                console.log('  start     - Start coordinator');
                console.log('  start --api - Start coordinator with API');
                console.log('  status    - Show coordinator status');
                console.log('  test      - Test IP coordination');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Exportar clases para uso como módulo
export { QBTCIPCoordinator, QBTCIPCoordinatorAPI };
export default QBTCIPCoordinator;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}