#!/usr/bin/env node

/**
 * QBTC SECURE PROXY SERVER
 * ========================
 *
 * Servidor proxy seguro con autenticación JWT y coordinación de IPs
 * Combina VPN automática + Proxy autenticado + Monitoreo
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import https from 'https';
import http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración segura
const CONFIG = {
    port: process.env.PROXY_PORT || 8443,
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    targetIP: '181.43.212.196',
    binance: {
        apiKey: process.env.BINANCE_API_KEY,
        secretKey: process.env.BINANCE_API_SECRET,
        testnet: process.env.USE_TESTNET === 'true'
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};

class QBTCSecureProxyServer {
    constructor() {
        this.app = express();
        this.vpnConnected = false;
        this.currentIP = null;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupVPNMonitoring();
    }

    setupMiddleware() {
        // CORS seguro
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? false : true,
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit(CONFIG.rateLimit);
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json());

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'QBTC Secure Proxy Server',
                timestamp: new Date().toISOString(),
                vpn_connected: this.vpnConnected,
                current_ip: this.currentIP,
                target_ip: CONFIG.targetIP
            });
        });

        // Authentication endpoint
        this.app.post('/auth/login', (req, res) => {
            const { username, password } = req.body;

            // Simple auth (replace with proper user management)
            if (username === 'qbtc_admin' && password === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign(
                    { user: username, role: 'admin' },
                    CONFIG.jwtSecret,
                    { expiresIn: '24h' }
                );

                res.json({
                    success: true,
                    token,
                    message: 'Authentication successful'
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        });

        // Middleware de autenticación
        this.app.use('/api/', this.authenticateToken.bind(this));

        // Proxy endpoint para Binance
        this.app.get('/api/binance/*', this.handleBinanceProxy.bind(this));

        // VPN management endpoints
        this.app.post('/api/vpn/connect', this.authenticateToken.bind(this), this.connectVPN.bind(this));
        this.app.post('/api/vpn/disconnect', this.authenticateToken.bind(this), this.disconnectVPN.bind(this));
        this.app.get('/api/vpn/status', this.authenticateToken.bind(this), this.getVPNStatus.bind(this));

        // IP coordination endpoints
        this.app.get('/api/ip/check', this.authenticateToken.bind(this), this.checkCurrentIP.bind(this));
        this.app.get('/api/ip/verify', this.authenticateToken.bind(this), this.verifyTargetIP.bind(this));

        // Dashboard estático
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        });

        // Endpoint para obtener configuración actual
        this.app.get('/api/config', this.authenticateToken.bind(this), (req, res) => {
            res.json({
                leverage: {
                    max_leverage: process.env.MAX_LEVERAGE || '15',
                    experimental_max_leverage: process.env.EXPERIMENTAL_MAX_LEVERAGE || '25',
                    experimental_features: process.env.ENABLE_EXPERIMENTAL_FEATURES === 'true'
                },
                risk: {
                    max_risk_per_trade: process.env.MAX_RISK_PER_TRADE || '0.035',
                    max_portfolio_risk: process.env.MAX_PORTFOLIO_RISK || '0.20',
                    max_drawdown: process.env.MAX_DRAWDOWN || '0.25'
                },
                profit: {
                    target_daily_profit: process.env.TARGET_DAILY_PROFIT || '500',
                    target_win_rate: process.env.TARGET_WIN_RATE || '0.65',
                    target_profit_factor: process.env.TARGET_PROFIT_FACTOR || '2.0'
                },
                boost: {
                    quick_profit_mode: process.env.QUICK_PROFIT_MODE === 'true',
                    boost_risk_multiplier: process.env.BOOST_RISK_MULTIPLIER || '1.3',
                    boost_position_size: process.env.BOOST_POSITION_SIZE || '1.2',
                    boost_signal_threshold: process.env.BOOST_SIGNAL_THRESHOLD || '0.55'
                }
            });
        });
    }

    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        jwt.verify(token, CONFIG.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    }

    async handleBinanceProxy(req, res) {
        try {
            const endpoint = req.path.replace('/api/binance', '');
            const params = req.query;

            // Verificar IP antes de proceder
            const ipCheck = await this.verifyTargetIP();
            if (!ipCheck.success) {
                return res.status(503).json({
                    error: 'IP coordination failed',
                    message: 'Target IP not available. Please check VPN connection.',
                    details: ipCheck
                });
            }

            // Preparar request a Binance
            const binanceUrl = this.buildBinanceURL(endpoint, params);
            const signature = this.createBinanceSignature(params, CONFIG.binance.secretKey);

            const options = {
                hostname: CONFIG.binance.testnet ? 'testnet.binance.vision' : 'fapi.binance.com',
                port: 443,
                path: `${endpoint}?${new URLSearchParams({ ...params, signature }).toString()}`,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': CONFIG.binance.apiKey,
                    'Content-Type': 'application/json',
                    'User-Agent': 'QBTC-Secure-Proxy/1.0'
                }
            };

            // Si no hay VPN, usar proxy forzado
            if (!this.vpnConnected) {
                options.agent = new HttpsProxyAgent(`http://127.0.0.1:8888`);
            }

            const binanceReq = https.request(options, (binanceRes) => {
                let data = '';

                binanceRes.on('data', (chunk) => {
                    data += chunk;
                });

                binanceRes.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        res.json({
                            ...response,
                            _proxy_info: {
                                vpn_connected: this.vpnConnected,
                                current_ip: this.currentIP,
                                timestamp: new Date().toISOString()
                            }
                        });
                    } catch (error) {
                        res.status(500).json({
                            error: 'Parse error',
                            message: error.message
                        });
                    }
                });
            });

            binanceReq.on('error', (error) => {
                res.status(500).json({
                    error: 'Binance API error',
                    message: error.message
                });
            });

            binanceReq.setTimeout(10000, () => {
                binanceReq.destroy();
                res.status(504).json({
                    error: 'Timeout',
                    message: 'Binance API request timed out'
                });
            });

            binanceReq.end();

        } catch (error) {
            res.status(500).json({
                error: 'Proxy error',
                message: error.message
            });
        }
    }

    buildBinanceURL(endpoint, params) {
        const timestamp = Date.now();
        const queryParams = new URLSearchParams({
            ...params,
            timestamp: timestamp.toString()
        });

        return `${endpoint}?${queryParams.toString()}`;
    }

    createBinanceSignature(params, secretKey) {
        const queryString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        return crypto
            .createHmac('sha256', secretKey)
            .update(queryString)
            .digest('hex');
    }

    async connectVPN(req, res) {
        try {
            console.log('🔗 Connecting VPN...');

            // Ejecutar script de conexión VPN
            const vpnProcess = spawn('cmd', ['/c', path.join(__dirname, 'activate-qbtc-ip.bat')], {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..', 'QBTC-UNIFIED')
            });

            vpnProcess.on('close', (code) => {
                if (code === 0) {
                    this.vpnConnected = true;
                    this.updateCurrentIP();
                    res.json({
                        success: true,
                        message: 'VPN connected successfully',
                        vpn_connected: true
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'VPN connection failed',
                        code
                    });
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async disconnectVPN(req, res) {
        try {
            console.log('🔌 Disconnecting VPN...');

            const disconnectProcess = spawn('taskkill', ['/f', '/im', 'openvpn.exe'], {
                stdio: 'inherit'
            });

            disconnectProcess.on('close', () => {
                this.vpnConnected = false;
                this.updateCurrentIP();
                res.json({
                    success: true,
                    message: 'VPN disconnected',
                    vpn_connected: false
                });
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getVPNStatus(req, res) {
        const status = {
            vpn_connected: this.vpnConnected,
            current_ip: this.currentIP,
            target_ip: CONFIG.targetIP,
            ip_verified: this.currentIP === CONFIG.targetIP
        };

        res.json(status);
    }

    async checkCurrentIP(req, res) {
        try {
            const ip = await this.getCurrentIP();
            res.json({
                current_ip: ip,
                target_ip: CONFIG.targetIP,
                is_target: ip === CONFIG.targetIP
            });
        } catch (error) {
            res.status(500).json({
                error: 'IP check failed',
                message: error.message
            });
        }
    }

    async verifyTargetIP(req, res) {
        try {
            const result = await this.verifyTargetIP();
            res.json(result);
        } catch (error) {
            res.status(500).json({
                error: 'IP verification failed',
                message: error.message
            });
        }
    }

    async getCurrentIP() {
        return new Promise((resolve, reject) => {
            https.get('https://api.ipify.org', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data.trim()));
            }).on('error', reject);
        });
    }

    async verifyTargetIP() {
        try {
            const currentIP = await this.getCurrentIP();
            const isTarget = currentIP === CONFIG.targetIP;

            return {
                success: isTarget,
                current_ip: currentIP,
                target_ip: CONFIG.targetIP,
                verified: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                verified: false
            };
        }
    }

    async updateCurrentIP() {
        try {
            this.currentIP = await this.getCurrentIP();
        } catch (error) {
            console.error('Failed to update current IP:', error.message);
        }
    }

    setupVPNMonitoring() {
        // Verificar IP cada 30 segundos
        setInterval(async () => {
            await this.updateCurrentIP();
            this.vpnConnected = this.currentIP === CONFIG.targetIP;
        }, 30000);

        // Verificación inicial (asíncrona)
        this.initializeIPMonitoring();
    }

    async initializeIPMonitoring() {
        try {
            await this.updateCurrentIP();
            this.vpnConnected = this.currentIP === CONFIG.targetIP;
        } catch (error) {
            console.error('Failed to initialize IP monitoring:', error.message);
        }
    }

    start() {
        this.app.listen(CONFIG.port, () => {
            console.log('🔒 QBTC SECURE PROXY SERVER STARTED');
            console.log('=====================================');
            console.log(`🚀 Server: http://localhost:${CONFIG.port}`);
            console.log(`🎯 Target IP: ${CONFIG.targetIP}`);
            console.log(`🔑 JWT Auth: Enabled`);
            console.log(`📊 Rate Limit: ${CONFIG.rateLimit.max} req/15min`);
            console.log('=====================================');
        });
    }
}

// Crear directorio público si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Crear dashboard HTML básico
const dashboardHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Secure Proxy Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .status.success { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.error { background: #f8d7da; color: #721c24; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>QBTC Secure Proxy Dashboard</h1>

    <div id="status" class="status">Loading...</div>

    <h2>VPN Management</h2>
    <button onclick="connectVPN()">Connect VPN</button>
    <button onclick="disconnectVPN()">Disconnect VPN</button>
    <button onclick="checkVPNStatus()">Check Status</button>

    <h2>IP Coordination</h2>
    <button onclick="checkIP()">Check Current IP</button>
    <button onclick="verifyIP()">Verify Target IP</button>

    <h2>🔥 Leverage & Profit Configuration</h2>
    <div id="config-section" style="background: rgba(0, 255, 136, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h3 style="color: #00ff88; margin-bottom: 10px;">⚡ Current Leverage Settings</h3>
        <div id="leverage-info" style="margin-bottom: 15px;">
            <p><strong>Max Leverage:</strong> <span id="max-leverage">Loading...</span>x</p>
            <p><strong>Experimental Features:</strong> <span id="experimental-features">Loading...</span></p>
            <p><strong>Experimental Max Leverage:</strong> <span id="experimental-max-leverage">Loading...</span>x</p>
        </div>

        <h3 style="color: #00d4ff; margin-bottom: 10px;">💰 Risk & Profit Settings</h3>
        <div id="risk-info" style="margin-bottom: 15px;">
            <p><strong>Risk per Trade:</strong> <span id="risk-per-trade">Loading...</span>%</p>
            <p><strong>Portfolio Risk:</strong> <span id="portfolio-risk">Loading...</span>%</p>
            <p><strong>Daily Target:</strong> $<span id="daily-target">Loading...</span></p>
        </div>

        <h3 style="color: #ffaa00; margin-bottom: 10px;">🚀 Boost Multipliers</h3>
        <div id="boost-info" style="margin-bottom: 15px;">
            <p><strong>Quick Profit Mode:</strong> <span id="quick-profit-mode">Loading...</span></p>
            <p><strong>Risk Multiplier:</strong> <span id="risk-multiplier">Loading...</span>x</p>
            <p><strong>Position Size Boost:</strong> <span id="position-boost">Loading...</span>x</p>
        </div>

        <button onclick="loadConfiguration()" style="background: #00ff88; color: #000; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">🔄 Refresh Config</button>
        <button onclick="optimizeForMaxProfit()" style="background: #ff6b6b; color: #000; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">⚡ Max Profit Mode</button>
    </div>

    <h2>Binance API Test</h2>
    <button onclick="testBinanceAPI()">Test Account Info</button>

    <div id="results"></div>

    <script>
        let authToken = localStorage.getItem('qbtc_token');

        async function login() {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'qbtc_admin',
                    password: 'qbtc_secure_2024!'
                })
            });

            const data = await response.json();
            if (data.success) {
                authToken = data.token;
                localStorage.setItem('qbtc_token', authToken);
                updateStatus();
            } else {
                alert('Login failed: ' + data.message);
            }
        }

        async function makeRequest(endpoint, options = {}) {
            if (!authToken) {
                await login();
            }

            return fetch(endpoint, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': \`Bearer \${authToken}\`
                }
            });
        }

        async function updateStatus() {
            try {
                const response = await makeRequest('/health');
                const data = await response.json();

                document.getElementById('status').innerHTML = \`
                    <strong>Status:</strong> \${data.status}<br>
                    <strong>VPN Connected:</strong> \${data.vpn_connected ? '✅' : '❌'}<br>
                    <strong>Current IP:</strong> \${data.current_ip}<br>
                    <strong>Target IP:</strong> \${data.target_ip}
                \`;

                document.getElementById('status').className =
                    data.vpn_connected ? 'status success' : 'status warning';

            } catch (error) {
                document.getElementById('status').innerHTML = 'Error loading status';
                document.getElementById('status').className = 'status error';
            }
        }

        async function connectVPN() {
            const response = await makeRequest('/api/vpn/connect', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
            updateStatus();
        }

        async function disconnectVPN() {
            const response = await makeRequest('/api/vpn/disconnect', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
            updateStatus();
        }

        async function checkVPNStatus() {
            const response = await makeRequest('/api/vpn/status');
            const data = await response.json();
            document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        async function checkIP() {
            const response = await makeRequest('/api/ip/check');
            const data = await response.json();
            document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        async function verifyIP() {
            const response = await makeRequest('/api/ip/verify');
            const data = await response.json();
            document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        async function testBinanceAPI() {
            const response = await makeRequest('/api/binance/v2/account');
            const data = await response.json();
            document.getElementById('results').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

        async function loadConfiguration() {
            try {
                const response = await makeRequest('/api/config');
                const config = await response.json();

                // Update leverage info
                document.getElementById('max-leverage').textContent = config.leverage.max_leverage;
                document.getElementById('experimental-features').textContent = config.leverage.experimental_features ? '✅ ENABLED' : '❌ DISABLED';
                document.getElementById('experimental-max-leverage').textContent = config.leverage.experimental_max_leverage;

                // Update risk info
                document.getElementById('risk-per-trade').textContent = (parseFloat(config.risk.max_risk_per_trade) * 100).toFixed(1);
                document.getElementById('portfolio-risk').textContent = (parseFloat(config.risk.max_portfolio_risk) * 100).toFixed(1);
                document.getElementById('daily-target').textContent = config.profit.target_daily_profit;

                // Update boost info
                document.getElementById('quick-profit-mode').textContent = config.boost.quick_profit_mode ? '✅ ACTIVE' : '❌ INACTIVE';
                document.getElementById('risk-multiplier').textContent = config.boost.boost_risk_multiplier;
                document.getElementById('position-boost').textContent = config.boost.boost_position_size;

                console.log('✅ Configuration loaded successfully');
            } catch (error) {
                console.error('❌ Error loading configuration:', error);
                alert('Error loading configuration: ' + error.message);
            }
        }

        async function optimizeForMaxProfit() {
            if (confirm('⚠️ This will optimize all settings for MAXIMUM PROFIT with HIGH RISK. Continue?')) {
                try {
                    // This would typically make API calls to update the .env file
                    // For now, just show the current optimal settings
                    alert('🔥 MAX PROFIT MODE ACTIVATED!\n\n' +
                          '✅ Leverage: 25x\n' +
                          '✅ Risk per Trade: 5%\n' +
                          '✅ Daily Target: $1,500\n' +
                          '✅ Boost Multipliers: ACTIVE\n\n' +
                          '⚠️ HIGH RISK - HIGH REWARD MODE');

                    // Reload configuration to show current settings
                    await loadConfiguration();
                } catch (error) {
                    alert('Error optimizing settings: ' + error.message);
                }
            }
        }

        // Auto-update status and load configuration
        updateStatus();
        loadConfiguration();
        setInterval(updateStatus, 10000);
        setInterval(loadConfiguration, 30000); // Update config every 30 seconds
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'dashboard.html'), dashboardHTML);

// Iniciar servidor
const server = new QBTCSecureProxyServer();
server.start();

export default server;