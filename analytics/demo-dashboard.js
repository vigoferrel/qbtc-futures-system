#!/usr/bin/env node

/**
 * QBTC Advanced Analytics Dashboard - Demo Autonómica
 * Demostración completa del sistema sin dependencias externas
 */

const http = require('http');
const WebSocket = require('ws');
const express = require('express');

// Configuración simplificada para demo
const CONFIG = {
    port: 14002,
    demoMode: true
};

// Datos de ejemplo para la demo
const sampleMarketData = {
    'BTCUSDT': { price: 103407.50, change24h: -0.45, volume: 830000000, rsi: 53 },
    'ETHUSDT': { price: 4644.65, change24h: 3.98, volume: 1008100000, rsi: 67 },
    'ADAUSDT': { price: 0.8358, change24h: 1.93, volume: 1090700000, rsi: 71 },
    'SOLUSDT': { price: 198.45, change24h: 4.21, volume: 890000000, rsi: 68 },
    'DOTUSDT': { price: 8.945, change24h: -1.23, volume: 456000000, rsi: 45 }
};

// Estado del sistema demo
let systemState = {
    status: 'running',
    timestamp: Date.now(),
    analytics: {
        processedEvents: 0,
        predictionsGenerated: 125,
        alertsTriggered: 3,
        accuracyScore: 0.847
    },
    activeConnections: 0
};

// Función para generar datos dinámicos
function generateDynamicData() {
    const now = Date.now();
    const baseData = { ...sampleMarketData };

    Object.keys(baseData).forEach(symbol => {
        const data = baseData[symbol];
        const variation = Math.sin(now / 10000) * 0.005; // Variación suave
        const noise = (Math.random() - 0.5) * 0.002; // Ruido pequeño

        data.price = data.price * (1 + variation + noise);
        data.change24h = data.change24h + (Math.random() - 0.5) * 0.1;
        data.rsi = Math.max(0, Math.min(100, data.rsi + (Math.random() - 0.5) * 2));
    });

    return baseData;
}

// Función para generar predicciones
function generatePredictions() {
    return {
        shortTerm: Array.from({length: 5}, () => Math.random()),
        mediumTerm: Array.from({length: 5}, () => Math.random()),
        longTerm: Array.from({length: 5}, () => Math.random()),
        confidence: 0.8 + Math.random() * 0.15,
        timestamp: Date.now()
    };
}

// Crear servidor Express
const app = express();
app.use(express.json());

// Rutas del dashboard
app.get('/dashboard', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(generateDashboardHtml());
});

app.get('/api/analytics/state', (req, res) => {
    systemState.marketState = generateDynamicData();
    systemState.timestamp = Date.now();
    res.json(systemState);
});

app.get('/api/analytics/predictions', (req, res) => {
    const predictions = generatePredictions();
    res.json(predictions);
});

app.get('/api/analytics/historical', (req, res) => {
    const historical = [];
    for (let i = 100; i > 0; i--) {
        const timestamp = Date.now() - (i * 60000);
        const price = 103407.50 + Math.sin(i / 10) * 1000;
        historical.push({
            timestamp,
            symbol: 'BTCUSDT',
            price,
            coherence: 0.8 + Math.sin(i / 20) * 0.1
        });
    }
    res.json(historical);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
        connections: systemState.activeConnections,
        analytics: systemState.analytics,
        version: '1.0.0-demo'
    });
});

// Servidor HTTP
const server = http.createServer(app);

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    systemState.activeConnections++;

    console.log(`🔗 Nueva conexión WebSocket (${systemState.activeConnections} total)`);

    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
        type: 'connection-established',
        clientId: `demo_${Date.now()}`,
        dashboardState: systemState,
        timestamp: Date.now()
    }));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📨 Mensaje recibido:', message.type);

            // Responder según el tipo de mensaje
            switch (message.type) {
                case 'subscribe':
                    ws.send(JSON.stringify({
                        type: 'subscription-confirmed',
                        subscriptionType: message.data?.subscriptionType,
                        timestamp: Date.now()
                    }));
                    break;
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    });

    ws.on('close', () => {
        systemState.activeConnections--;
        console.log(`🔌 Conexión cerrada (${systemState.activeConnections} restantes)`);
    });

    ws.on('error', (error) => {
        console.error('Error WebSocket:', error);
    });
});

// Broadcast periódico de datos
setInterval(() => {
    if (wss.clients.size > 0) {
        const analyticsUpdate = {
            type: 'analytics-update',
            data: {
                coherence: 0.8 + Math.sin(Date.now() / 10000) * 0.1,
                momentum: Math.sin(Date.now() / 15000) * 0.05,
                volatility: 0.02 + Math.sin(Date.now() / 20000) * 0.01,
                predictionsCount: systemState.analytics.predictionsGenerated,
                alertsCount: systemState.analytics.alertsTriggered
            },
            timestamp: Date.now()
        };

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(analyticsUpdate));
            }
        });
    }
}, 2000); // Cada 2 segundos

// Broadcast de predicciones
setInterval(() => {
    if (wss.clients.size > 0) {
        const predictionsUpdate = {
            type: 'predictions-update',
            data: generatePredictions(),
            timestamp: Date.now()
        };

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(predictionsUpdate));
            }
        });
    }
}, 5000); // Cada 5 segundos

// Función para generar HTML del dashboard
function generateDashboardHtml() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 QBTC Advanced Analytics Dashboard - Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header h1 {
            font-size: 2.5em;
            background: linear-gradient(45deg, #00ff88, #00d4ff, #ff6b6b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        .status {
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
        }
        .status.connected {
            background: rgba(0,255,136,0.2);
            color: #00ff88;
            border: 1px solid #00ff88;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: rgba(255,255,255,0.05);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,255,136,0.2);
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #00ff88;
            margin-bottom: 5px;
            background: linear-gradient(45deg, #00ff88, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .metric-label {
            color: #cccccc;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .charts-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .chart {
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            height: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .chart h3 {
            color: #00d4ff;
            margin-bottom: 20px;
            text-align: center;
        }
        .quantum-field {
            width: 100%;
            height: 200px;
            background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, rgba(0,212,255,0.05) 50%, rgba(255,107,107,0.02) 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .demo-notice {
            background: rgba(255,193,7,0.1);
            border: 1px solid #ffc107;
            color: #ffc107;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .data-display {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 150px;
            overflow-y: auto;
        }
        .connection-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0,212,255,0.1);
            border: 1px solid #00d4ff;
            border-radius: 10px;
        }
        .connection-info h4 {
            color: #00d4ff;
            margin-bottom: 10px;
        }
        .connection-info ul {
            margin: 0;
            padding-left: 20px;
        }
        .connection-info li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 QBTC Advanced Analytics Dashboard</h1>
            <p>Demo Autonómica - Sistema Completo de Analytics en Tiempo Real</p>
            <div id="status" class="status connected">🟢 Sistema Demo Activo</div>
        </div>

        <div class="demo-notice">
            <strong>🎯 DEMO MODE:</strong> Esta es una demostración completa del sistema QBTC Advanced Analytics Dashboard ejecutándose de forma autónoma con datos simulados.
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value" id="coherence">0.00</div>
                <div class="metric-label">Coherencia Cuántica</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="predictions">125</div>
                <div class="metric-label">Predicciones Generadas</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="accuracy">84.7%</div>
                <div class="metric-label">Precisión AI</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="alerts">3</div>
                <div class="metric-label">Alertas Activas</div>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart">
                <h3>📊 Estado de Mercado en Tiempo Real</h3>
                <div id="marketData" class="data-display">
Cargando datos de mercado...
                </div>
            </div>
            <div class="chart">
                <h3>🔮 Predicciones AI</h3>
                <div id="predictionsData" class="data-display">
Cargando predicciones...
                </div>
            </div>
        </div>

        <div class="charts-container">
            <div class="chart">
                <h3>⚛️ Quantum Field Visualization</h3>
                <div class="quantum-field">
                    <div style="text-align: center; color: #00ff88;">
                        <div style="font-size: 3em; margin-bottom: 10px;">λ₇₉₁₉</div>
                        <div>Campo Cuántico Activo</div>
                        <div id="quantumStatus" style="font-size: 0.8em; margin-top: 10px; color: #00d4ff;">
                            Estado: Coherente
                        </div>
                    </div>
                </div>
            </div>
            <div class="chart">
                <h3>📈 Rendimiento del Sistema</h3>
                <div id="performanceData" class="data-display">
Cargando métricas de rendimiento...
                </div>
            </div>
        </div>

        <div class="connection-info">
            <h4>🌐 Información de Conexión</h4>
            <ul>
                <li><strong>WebSocket:</strong> ws://localhost:14002</li>
                <li><strong>HTTP API:</strong> http://localhost:14002/api</li>
                <li><strong>Dashboard:</strong> http://localhost:14002/dashboard</li>
                <li><strong>Health Check:</strong> http://localhost:14002/health</li>
                <li><strong>Estado:</strong> <span id="connectionStatus">Conectando...</span></li>
            </ul>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:14002');
        let connectionEstablished = false;

        ws.onopen = function() {
            console.log('🔗 WebSocket conectado exitosamente');
            document.getElementById('connectionStatus').textContent = '🟢 Conectado';
            document.getElementById('connectionStatus').style.color = '#00ff88';
            connectionEstablished = true;
        };

        ws.onmessage = function(event) {
            try {
                const message = JSON.parse(event.data);

                switch(message.type) {
                    case 'connection-established':
                        console.log('✅ Conexión establecida:', message.clientId);
                        break;

                    case 'analytics-update':
                        updateMetrics(message.data);
                        break;

                    case 'predictions-update':
                        updatePredictions(message.data);
                        break;

                    case 'subscription-confirmed':
                        console.log('📝 Suscripción confirmada:', message.subscriptionType);
                        break;

                    default:
                        console.log('📨 Mensaje recibido:', message.type, message.data);
                }
            } catch (error) {
                console.error('Error procesando mensaje:', error);
            }
        };

        ws.onclose = function() {
            console.log('🔌 WebSocket desconectado');
            document.getElementById('connectionStatus').textContent = '🔴 Desconectado';
            document.getElementById('connectionStatus').style.color = '#ff6b6b';
        };

        ws.onerror = function(error) {
            console.error('Error WebSocket:', error);
            document.getElementById('connectionStatus').textContent = '❌ Error';
            document.getElementById('connectionStatus').style.color = '#ff6b6b';
        };

        // Actualizar métricas en la interfaz
        function updateMetrics(data) {
            if (data.coherence !== undefined) {
                document.getElementById('coherence').textContent = (data.coherence * 100).toFixed(1) + '%';
            }
            if (data.predictionsCount !== undefined) {
                document.getElementById('predictions').textContent = data.predictionsCount;
            }
            if (data.alertsCount !== undefined) {
                document.getElementById('alerts').textContent = data.alertsCount;
            }
        }

        // Actualizar predicciones
        function updatePredictions(data) {
            const predictionsDiv = document.getElementById('predictionsData');
            const shortTerm = data.shortTerm ? data.shortTerm.map(p => (p * 100).toFixed(1) + '%').join(', ') : 'N/A';

            predictionsDiv.textContent = \`Predicciones Corto Plazo: [\${shortTerm}]
Confianza: \${data.confidence ? (data.confidence * 100).toFixed(1) + '%' : 'N/A'}
Timestamp: \${new Date(data.timestamp || Date.now()).toLocaleTimeString()}\`;
        }

        // Cargar datos iniciales
        async function loadInitialData() {
            try {
                // Cargar estado del sistema
                const stateResponse = await fetch('/api/analytics/state');
                const state = await stateResponse.json();

                document.getElementById('predictions').textContent = state.analytics.predictionsGenerated;
                document.getElementById('alerts').textContent = state.analytics.alertsTriggered;
                document.getElementById('accuracy').textContent = (state.analytics.accuracyScore * 100).toFixed(1) + '%';

                // Mostrar datos de mercado
                const marketDiv = document.getElementById('marketData');
                const marketData = state.marketState;
                if (marketData) {
                    let marketText = '';
                    Object.entries(marketData).forEach(([symbol, data]) => {
                        marketText += \`\${symbol}: $\${data.price.toFixed(2)} (\${data.change24h.toFixed(2)}%) RSI: \${data.rsi}\\n\`;
                    });
                    marketDiv.textContent = marketText;
                }

                // Mostrar métricas de rendimiento
                const performanceDiv = document.getElementById('performanceData');
                performanceDiv.textContent = \`Eventos Procesados: \${state.analytics.processedEvents}
Tiempo de Actividad: \${Math.floor((Date.now() - state.timestamp) / 1000)}s
Conexiones Activas: \${state.activeConnections}\`;

            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
            }
        }

        // Actualización periódica del estado cuántico
        setInterval(() => {
            const quantumStatus = document.getElementById('quantumStatus');
            const states = ['Coherente', 'Entrelazado', 'Superposición', 'Resonante'];
            const randomState = states[Math.floor(Math.random() * states.length)];
            quantumStatus.textContent = \`Estado: \${randomState}\`;
        }, 3000);

        // Cargar datos iniciales cuando se carga la página
        window.onload = function() {
            loadInitialData();
        };

        // Ping periódico para mantener la conexión viva
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Cada 30 segundos
    </script>
</body>
</html>`;
}

// Función de limpieza para cerrar el servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Recibida señal de interrupción, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Iniciar servidor
server.listen(CONFIG.port, () => {
    console.log('🚀 ===== QBTC ADVANCED ANALYTICS DASHBOARD - DEMO =====');
    console.log(`🌐 Dashboard disponible en: http://localhost:${CONFIG.port}/dashboard`);
    console.log(`🔗 WebSocket server: ws://localhost:${CONFIG.port}`);
    console.log(`📡 API REST: http://localhost:${CONFIG.port}/api`);
    console.log(`🏥 Health Check: http://localhost:${CONFIG.port}/health`);
    console.log('');
    console.log('🎯 FUNCIONALIDADES DE LA DEMO:');
    console.log('   ✅ Analytics en tiempo real');
    console.log('   ✅ Predicciones AI');
    console.log('   ✅ Visualización cuántica');
    console.log('   ✅ WebSocket real-time');
    console.log('   ✅ API REST completa');
    console.log('   ✅ Datos de mercado simulados');
    console.log('');
    console.log('💻 Presiona Ctrl+C para detener la demo');
    console.log('='.repeat(60));
});




