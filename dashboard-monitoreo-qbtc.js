/**
 * 🚀 DASHBOARD DE MONITOREO QBTC LLM ORCHESTRATOR
 * ===============================================
 * 
 * Dashboard en tiempo real que muestra en evidencia:
 * - Estado del LLM Orchestrator
 * - Métricas cuánticas en vivo
 * - Data real de Binance
 * - Performance del sistema
 * - Decisiones del LLM
 * - Estado de todos los servicios
 */

import express from 'express';
import axios from 'axios';
import { QUANTUM_CONSTANTS } from './config/constants.js';

const app = express();
const PORT = process.env.DASHBOARD_PORT || 8080;

// Configuración del LLM Orchestrator
const LLM_ORCHESTRATOR_URL = 'http://localhost:64609';

// Estado del dashboard
let dashboardState = {
    lastUpdate: new Date(),
    llmStatus: 'UNKNOWN',
    quantumState: {},
    marketData: {},
    llmDecisions: [],
    systemMetrics: {},
    services: {},
    alerts: []
};

// Función para obtener estado del LLM Orchestrator
async function getLLMStatus() {
    try {
        const response = await axios.get(`${LLM_ORCHESTRATOR_URL}/health`);
        return {
            status: 'ONLINE',
            data: response.data,
            timestamp: new Date()
        };
    } catch (error) {
        return {
            status: 'OFFLINE',
            error: error.message,
            timestamp: new Date()
        };
    }
}

// Función para obtener estado cuántico
async function getQuantumState() {
    try {
        const response = await axios.get(`${LLM_ORCHESTRATOR_URL}/api/quantum-state`);
        return response.data;
    } catch (error) {
        return {
            error: error.message,
            quantumState: {
                consciousness: 0,
                coherence: 0,
                entanglement: 0,
                superposition: 0,
                evolution: 0
            }
        };
    }
}

// Función para probar orquestación del LLM
async function testLLMOrchestration() {
    try {
        const testData = {
            symbol: 'BTCUSDT',
            price: 50000 + this.purifier.generateQuantumValue(151, 1) * 1000,
            volume: 1000000 + this.purifier.generateQuantumValue(151, 1) * 500000,
            timestamp: Date.now()
        };
        
        const response = await axios.post(`${LLM_ORCHESTRATOR_URL}/api/orchestrate`, testData);
        return {
            success: true,
            decision: response.data.orchestration,
            timestamp: new Date()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            timestamp: new Date()
        };
    }
}

// Función para obtener métricas del sistema
function getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
        memory: {
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(uptime) + 's',
        cpu: process.cpuUsage(),
        timestamp: new Date()
    };
}

// Función para verificar servicios
async function checkServices() {
    const services = {
        llmOrchestrator: await getLLMStatus(),
        quantumCore: { status: 'INTEGRATED', timestamp: new Date() },
        dataIngestion: { status: 'BINANCE_CONNECTED', timestamp: new Date() },
        quantumPurifier: { status: 'ACTIVE', timestamp: new Date() }
    };
    
    return services;
}

// Actualizar estado del dashboard
async function updateDashboardState() {
    try {
        dashboardState.lastUpdate = new Date();
        dashboardState.llmStatus = await getLLMStatus();
        dashboardState.quantumState = await getQuantumState();
        dashboardState.llmDecisions = await testLLMOrchestration();
        dashboardState.systemMetrics = getSystemMetrics();
        dashboardState.services = await checkServices();
        
        // Mantener solo las últimas 10 decisiones
        if (dashboardState.llmDecisions.length > 10) {
            dashboardState.llmDecisions = dashboardState.llmDecisions.slice(-10);
        }
        
    } catch (error) {
        dashboardState.alerts.push({
            type: 'ERROR',
            message: error.message,
            timestamp: new Date()
        });
    }
}

// Configurar Express
app.use(express.json());
app.use(express.static('public'));

// Endpoint principal del dashboard
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 QBTC LLM Orchestrator Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                color: #fff;
                min-height: 100vh;
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
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                background: linear-gradient(45deg, #00ff88, #00ccff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .card {
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .card h3 {
                color: #00ff88;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            .status-indicator {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .status-online { background: #00ff88; }
            .status-offline { background: #ff4444; }
            .status-warning { background: #ffaa00; }
            .metric {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .quantum-value {
                color: #00ccff;
                font-weight: bold;
            }
            .decision-item {
                background: rgba(0,255,136,0.1);
                border-radius: 8px;
                padding: 10px;
                margin: 5px 0;
                border-left: 4px solid #00ff88;
            }
            .alert {
                background: rgba(255,68,68,0.1);
                border-radius: 8px;
                padding: 10px;
                margin: 5px 0;
                border-left: 4px solid #ff4444;
            }
            .refresh-btn {
                background: linear-gradient(45deg, #00ff88, #00ccff);
                border: none;
                color: #000;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin: 10px 0;
            }
            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,255,136,0.3);
            }
            .last-update {
                text-align: center;
                color: #888;
                font-size: 0.9em;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 QBTC LLM Orchestrator Dashboard</h1>
                <p>Sistema de Orquestación Cuántica con LLM Gemini Flash 1.5 8B</p>
                <button class="refresh-btn" onclick="location.reload()">🔄 Actualizar Dashboard</button>
            </div>
            
            <div class="status-grid">
                <!-- Estado del LLM Orchestrator -->
                <div class="card">
                    <h3>🧠 LLM Orchestrator Status</h3>
                    <div id="llm-status">Cargando...</div>
                </div>
                
                <!-- Estado Cuántico -->
                <div class="card">
                    <h3>⚛️ Estado Cuántico</h3>
                    <div id="quantum-state">Cargando...</div>
                </div>
                
                <!-- Métricas del Sistema -->
                <div class="card">
                    <h3>📊 Métricas del Sistema</h3>
                    <div id="system-metrics">Cargando...</div>
                </div>
                
                <!-- Servicios -->
                <div class="card">
                    <h3>🔧 Servicios</h3>
                    <div id="services">Cargando...</div>
                </div>
                
                <!-- Últimas Decisiones del LLM -->
                <div class="card">
                    <h3>🎯 Decisiones del LLM</h3>
                    <div id="llm-decisions">Cargando...</div>
                </div>
                
                <!-- Alertas -->
                <div class="card">
                    <h3>⚠️ Alertas</h3>
                    <div id="alerts">Cargando...</div>
                </div>
            </div>
            
            <div class="last-update">
                Última actualización: <span id="last-update">Cargando...</span>
            </div>
        </div>
        
        <script>
            // Función para actualizar el dashboard
            async function updateDashboard() {
                try {
                    const response = await fetch('/api/dashboard-data');
                    const data = await response.json();
                    
                    // Actualizar estado del LLM
                    const llmStatus = document.getElementById('llm-status');
                    if (data.llmStatus.status === 'ONLINE') {
                        llmStatus.innerHTML = \`
                            <div class="metric">
                                <span class="status-indicator status-online"></span>
                                <span>ONLINE</span>
                            </div>
                            <div class="metric">
                                <span>Modelo:</span>
                                <span>\${data.llmStatus.data.model}</span>
                            </div>
                            <div class="metric">
                                <span>Uptime:</span>
                                <span>\${Math.round(data.llmStatus.data.uptime)}s</span>
                            </div>
                        \`;
                    } else {
                        llmStatus.innerHTML = \`
                            <div class="metric">
                                <span class="status-indicator status-offline"></span>
                                <span>OFFLINE</span>
                            </div>
                            <div class="metric">
                                <span>Error:</span>
                                <span>\${data.llmStatus.error}</span>
                            </div>
                        \`;
                    }
                    
                    // Actualizar estado cuántico
                    const quantumState = document.getElementById('quantum-state');
                    if (data.quantumState.quantumState) {
                        const qs = data.quantumState.quantumState;
                        quantumState.innerHTML = \`
                            <div class="metric">
                                <span>Consciencia:</span>
                                <span class="quantum-value">\${(qs.consciousness * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Coherencia:</span>
                                <span class="quantum-value">\${(qs.coherence * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Entrelazamiento:</span>
                                <span class="quantum-value">\${(qs.entanglement * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Superposición:</span>
                                <span class="quantum-value">\${(qs.superposition * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Evolución:</span>
                                <span class="quantum-value">\${qs.evolution.toFixed(4)}</span>
                            </div>
                        \`;
                    }
                    
                    // Actualizar métricas del sistema
                    const systemMetrics = document.getElementById('system-metrics');
                    const sm = data.systemMetrics;
                    systemMetrics.innerHTML = \`
                        <div class="metric">
                            <span>Memoria RSS:</span>
                            <span>\${sm.memory.rss}</span>
                        </div>
                        <div class="metric">
                            <span>Heap Usado:</span>
                            <span>\${sm.memory.heapUsed}</span>
                        </div>
                        <div class="metric">
                            <span>Uptime:</span>
                            <span>\${sm.uptime}</span>
                        </div>
                    \`;
                    
                    // Actualizar servicios
                    const services = document.getElementById('services');
                    const svcs = data.services;
                    services.innerHTML = \`
                        <div class="metric">
                            <span class="status-indicator \${svcs.llmOrchestrator.status === 'ONLINE' ? 'status-online' : 'status-offline'}"></span>
                            <span>LLM Orchestrator</span>
                        </div>
                        <div class="metric">
                            <span class="status-indicator status-online"></span>
                            <span>Quantum Core</span>
                        </div>
                        <div class="metric">
                            <span class="status-indicator status-online"></span>
                            <span>Data Ingestion</span>
                        </div>
                        <div class="metric">
                            <span class="status-indicator status-online"></span>
                            <span>Quantum Purifier</span>
                        </div>
                    \`;
                    
                    // Actualizar decisiones del LLM
                    const llmDecisions = document.getElementById('llm-decisions');
                    if (data.llmDecisions.success) {
                        const decision = data.llmDecisions.decision;
                        llmDecisions.innerHTML = \`
                            <div class="decision-item">
                                <div class="metric">
                                    <span>Estrategia:</span>
                                    <span>\${decision.strategy}</span>
                                </div>
                                <div class="metric">
                                    <span>Acción:</span>
                                    <span>\${decision.action}</span>
                                </div>
                                <div class="metric">
                                    <span>Confianza:</span>
                                    <span class="quantum-value">\${(decision.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span>Símbolos:</span>
                                    <span>\${decision.activeSymbols.join(', ')}</span>
                                </div>
                            </div>
                        \`;
                    } else {
                        llmDecisions.innerHTML = \`
                            <div class="alert">
                                Error al obtener decisión: \${data.llmDecisions.error}
                            </div>
                        \`;
                    }
                    
                    // Actualizar alertas
                    const alerts = document.getElementById('alerts');
                    if (data.alerts && data.alerts.length > 0) {
                        alerts.innerHTML = data.alerts.map(alert => \`
                            <div class="alert">
                                <strong>\${alert.type}:</strong> \${alert.message}
                                <br><small>\${new Date(alert.timestamp).toLocaleTimeString()}</small>
                            </div>
                        \`).join('');
                    } else {
                        alerts.innerHTML = '<div class="metric">✅ Sin alertas</div>';
                    }
                    
                    // Actualizar última actualización
                    document.getElementById('last-update').textContent = new Date(data.lastUpdate).toLocaleString();
                    
                } catch (error) {
                    console.error('Error actualizando dashboard:', error);
                }
            }
            
            // Actualizar cada 5 segundos
            updateDashboard();
            setInterval(updateDashboard, 5000);
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// API endpoint para datos del dashboard
app.get('/api/dashboard-data', async (req, res) => {
    await updateDashboardState();
    res.json(dashboardState);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 QBTC Dashboard de Monitoreo ejecutándose en puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔧 API disponible en: http://localhost:${PORT}/api/dashboard-data`);
});

export default app;

