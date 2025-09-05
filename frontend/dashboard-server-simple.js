import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * 🌌 QBTC QUANTUM DASHBOARD SERVER
 * ================================
 * 
 * Servidor HTTP simple para servir el Quantum Dashboard Universal
 * - Sirve archivos estáticos del frontend
 * - Proxy a la API del Quantum Brain
 * - WebSocket passthrough
 * - CORS habilitado para desarrollo
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.DASHBOARD_PORT || 8080;

// CORS para desarrollo
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Servir archivos estáticos
app.use(express.static(__dirname));

// Proxy API requests al Quantum Brain
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:14001',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api'
    },
    onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        res.status(500).json({ 
            error: 'Quantum Brain API not available',
            message: 'Make sure the QBTC Quantum Brain is running on port 14001'
        });
    }
}));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'quantum-dashboard-universal.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'QBTC Quantum Dashboard Server',
        status: 'healthy',
        port: PORT,
        timestamp: new Date().toISOString(),
        quantum_brain_connection: 'http://localhost:14001',
        dashboard_ready: true
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        service: 'Quantum Dashboard Server',
        version: '1.0.0',
        port: PORT,
        uptime: process.uptime(),
        endpoints: {
            dashboard: '/',
            health: '/health',
            api_proxy: '/api/*'
        },
        quantum_integration: {
            brain_api: 'http://localhost:14001/api',
            websocket: 'ws://localhost:14001/quantum-stream',
            symbols_validated: 475,
            coherence_level: '96.3%'
        }
    });
});

// WebSocket Server para comunicación con el dashboard
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('🔌 Dashboard client connected');
    
    // Send initial data
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to QBTC Quantum Dashboard',
        timestamp: new Date().toISOString()
    }));
    
    // Handle messages from dashboard
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📡 Dashboard message:', data);
            
            // Handle different message types
            switch (data.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                    break;
                case 'request_data':
                    // Forward request to Quantum Brain or handle locally
                    handleDataRequest(ws, data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('❌ Dashboard client disconnected');
    });
});

// Handle data requests from dashboard
function handleDataRequest(ws, request) {
    // For now, send simulated data
    // In production, this would fetch from Quantum Brain
    const responseData = {
        type: 'data_response',
        request_id: request.id,
        data: generateSimulatedData(request.data_type),
        timestamp: new Date().toISOString()
    };
    
    ws.send(JSON.stringify(responseData));
}

// Generate simulated quantum data
function generateSimulatedData(dataType) {
    switch (dataType) {
        case 'quantum_metrics':
            return {
                coherence: (95 + this.purifier.generateQuantumValue(index, modifier) * 4).toFixed(1),
                consciousness: (83 + this.purifier.generateQuantumValue(index, modifier) * 4).toFixed(0),
                lambda_resonance: '7919',
                active_engines: 4,
                symbols_count: 475
            };
        case 'symbols_status':
            return {
                total_symbols: 475,
                valid_symbols: 475,
                tier_distribution: {
                    TIER1: 3,
                    TIER2: 12,
                    TIER3: 20,
                    TIER4: 14,
                    TIER5: 16,
                    TIER6: 12
                }
            };
        case 'system_health':
            return {
                uptime: '99.8%',
                response_time: '45ms',
                cpu_usage: '12%',
                memory_usage: '67%',
                services_status: {
                    quantum_brain: 'operational',
                    leonardo_engine: 'active',
                    consciousness: 'evolving',
                    symbol_validation: 'healthy'
                }
            };
        default:
            return { error: `Unknown data type: ${dataType}` };
    }
}

// Start server
server.listen(PORT, () => {
    console.log('\n🌌 ================================================');
    console.log('🌌 QBTC QUANTUM DASHBOARD SERVER STARTED 🌌');
    console.log('================================================');
    console.log(`🚀 Dashboard URL: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`🧠 Quantum Brain API: http://localhost:14001`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('================================================');
    
    // Test connection to Quantum Brain
    testQuantumBrainConnection();
});

// Test connection to Quantum Brain
async function testQuantumBrainConnection() {
    try {
        const response = await fetch('http://localhost:14001/health');
        if (response.ok) {
            console.log('✅ Quantum Brain connection: OK');
        } else {
            console.log('⚠️  Quantum Brain connection: Available but issues detected');
        }
    } catch (error) {
        console.log('⚠️  Quantum Brain connection: Not available (will use simulation mode)');
        console.log('   Make sure to run: node qbtc-quantum-brain.js');
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Graceful shutdown initiated...');
    server.close(() => {
        console.log('✅ Dashboard server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Dashboard server closed');
        process.exit(0);
    });
});

export default app;
