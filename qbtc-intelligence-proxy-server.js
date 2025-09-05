const express = require('express');
const cors = require('cors');
const path = require('path');

class QBTCIntelligenceProxyServer {
    constructor() {
        this.app = express();
        this.port = 64612;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
    }

    setupRoutes() {
        // Servir el dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'monitor-intelligence-advanced.html'));
        });

        // Proxy para precios de Binance
        this.app.get('/api/binance/price/:symbol', async (req, res) => {
            try {
                const { symbol } = req.params;
                const response = await fetch(`https://fapi.binance.com/api/v3/ticker/price?symbol=${symbol}`);
                
                if (response.ok) {
                    const data = await response.json();
                    res.json(data);
                } else {
                    res.status(response.status).json({ error: 'Error obteniendo precio de Binance' });
                }
            } catch (error) {
                console.error(`❌ Error proxy Binance ${req.params.symbol}:`, error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        });

        // Endpoint de salud
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ACTIVE',
                service: 'QBTC Intelligence Proxy Server',
                timestamp: new Date().toISOString(),
                endpoints: [
                    'GET / - Dashboard',
                    'GET /api/binance/price/:symbol - Binance Price Proxy',
                    'GET /health - Health Check'
                ]
            });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('🚀 QBTC Intelligence Proxy Server iniciado');
            console.log(`📊 Dashboard disponible en: http://localhost:${this.port}`);
            console.log(`🔗 Proxy Binance activo en: http://localhost:${this.port}/api/binance/price/:symbol`);
            console.log(`💚 Health check: http://localhost:${this.port}/health`);
        });
    }
}

// Iniciar servidor
const server = new QBTCIntelligenceProxyServer();
server.start();
