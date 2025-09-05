/**
 * 🚀 DASHBOARD SIMPLE QBTC LLM ORCHESTRATOR
 * =========================================
 * 
 * Dashboard simple que muestra en evidencia:
 * - Estado del LLM Orchestrator
 * - Métricas cuánticas
 * - Decisiones del LLM
 */

import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 8080;

// Configuración del LLM Orchestrator
const LLM_ORCHESTRATOR_URL = 'http://localhost:64609';

// Función para obtener estado del LLM
async function getLLMStatus() {
    try {
        const response = await axios.get(`${LLM_ORCHESTRATOR_URL}/health`);
        return { status: 'ONLINE', data: response.data };
    } catch (error) {
        return { status: 'OFFLINE', error: error.message };
    }
}

// Función para obtener estado cuántico
async function getQuantumState() {
    try {
        const response = await axios.get(`${LLM_ORCHESTRATOR_URL}/api/quantum-state`);
        return response.data;
    } catch (error) {
        return { error: error.message };
    }
}

// Función para probar orquestación
async function testOrchestration() {
    try {
        const testData = {
            symbol: 'BTCUSDT',
            price: 50000,
            volume: 1000000,
            timestamp: Date.now()
        };
        
        const response = await axios.post(`${LLM_ORCHESTRATOR_URL}/api/orchestrate`, testData);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Endpoint principal
app.get('/', async (req, res) => {
    try {
        const llmStatus = await getLLMStatus();
        const quantumState = await getQuantumState();
        const orchestration = await testOrchestration();
        
        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🚀 QBTC LLM Orchestrator Dashboard</title>
            <style>
                body { 
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                    color: #fff;
                    margin: 0;
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
                    background: rgba(255,255,255,0.1);
                    border-radius: 15px;
                }
                .header h1 {
                    font-size: 2.5em;
                    margin-bottom: 10px;
                    color: #00ff88;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }
                .card {
                    background: rgba(255,255,255,0.1);
                    border-radius: 15px;
                    padding: 20px;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .card h3 {
                    color: #00ff88;
                    margin-bottom: 15px;
                }
                .status-online { color: #00ff88; }
                .status-offline { color: #ff4444; }
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
                .decision {
                    background: rgba(0,255,136,0.1);
                    border-radius: 8px;
                    padding: 10px;
                    margin: 5px 0;
                    border-left: 4px solid #00ff88;
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
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 QBTC LLM Orchestrator Dashboard</h1>
                    <p>Sistema de Orquestación Cuántica con LLM Gemini Flash 1.5 8B</p>
                    <button class="refresh-btn" onclick="location.reload()">🔄 Actualizar</button>
                </div>
                
                <div class="grid">
                    <!-- Estado del LLM -->
                    <div class="card">
                        <h3>🧠 LLM Orchestrator Status</h3>
                        <div class="metric">
                            <span>Estado:</span>
                            <span class="${llmStatus.status === 'ONLINE' ? 'status-online' : 'status-offline'}">
                                ${llmStatus.status}
                            </span>
                        </div>
                        ${llmStatus.status === 'ONLINE' ? `
                            <div class="metric">
                                <span>Modelo:</span>
                                <span>${llmStatus.data.model}</span>
                            </div>
                            <div class="metric">
                                <span>Uptime:</span>
                                <span>${Math.round(llmStatus.data.uptime)}s</span>
                            </div>
                        ` : `
                            <div class="metric">
                                <span>Error:</span>
                                <span>${llmStatus.error}</span>
                            </div>
                        `}
                    </div>
                    
                    <!-- Estado Cuántico -->
                    <div class="card">
                        <h3>⚛️ Estado Cuántico</h3>
                        ${quantumState.quantumState ? `
                            <div class="metric">
                                <span>Consciencia:</span>
                                <span class="quantum-value">${(quantumState.quantumState.consciousness * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Coherencia:</span>
                                <span class="quantum-value">${(quantumState.quantumState.coherence * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Entrelazamiento:</span>
                                <span class="quantum-value">${(quantumState.quantumState.entanglement * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Superposición:</span>
                                <span class="quantum-value">${(quantumState.quantumState.superposition * 100).toFixed(1)}%</span>
                            </div>
                            <div class="metric">
                                <span>Evolución:</span>
                                <span class="quantum-value">${quantumState.quantumState.evolution.toFixed(4)}</span>
                            </div>
                        ` : `
                            <div class="metric">
                                <span>Error:</span>
                                <span>${quantumState.error}</span>
                            </div>
                        `}
                    </div>
                    
                    <!-- Decisiones del LLM -->
                    <div class="card">
                        <h3>🎯 Decisiones del LLM</h3>
                        ${orchestration.success ? `
                            <div class="decision">
                                <div class="metric">
                                    <span>Estrategia:</span>
                                    <span>${orchestration.data.orchestration.strategy}</span>
                                </div>
                                <div class="metric">
                                    <span>Acción:</span>
                                    <span>${orchestration.data.orchestration.action}</span>
                                </div>
                                <div class="metric">
                                    <span>Confianza:</span>
                                    <span class="quantum-value">${(orchestration.data.orchestration.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span>Símbolos:</span>
                                    <span>${orchestration.data.orchestration.activeSymbols.join(', ')}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="metric">
                                <span>Error:</span>
                                <span>${orchestration.error}</span>
                            </div>
                        `}
                    </div>
                    
                    <!-- Constantes Físicas -->
                    <div class="card">
                        <h3>🔬 Constantes Físicas</h3>
                        <div class="metric">
                            <span>λ₇₉₁₉:</span>
                            <span class="quantum-value">8.977020214210413</span>
                        </div>
                        <div class="metric">
                            <span>φ (Phi):</span>
                            <span class="quantum-value">1.618033988749895</span>
                        </div>
                        <div class="metric">
                            <span>γ (Euler):</span>
                            <span class="quantum-value">0.5772156649015329</span>
                        </div>
                        <div class="metric">
                            <span>z (Compleja):</span>
                            <span class="quantum-value">9 + 16i</span>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #888;">
                    Última actualización: ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 QBTC Dashboard Simple ejecutándose en puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
});

export default app;
