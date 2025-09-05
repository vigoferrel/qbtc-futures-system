import express from 'express';
import cors from 'cors';
import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

const app = express();
const PORT = 8080;

// Configurar CORS
app.use(cors({
    origin: ['http://localhost:*', 'http://127.0.0.1:*', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json());

// Inicializar LLM Orchestrator Supreme - CONTROL TOTAL
console.log('[DASHBOARD] Inicializando LLM Orchestrator Supreme - CONTROL TOTAL...');
const orchestrator = new LLMQuantumOrchestratorSupreme();

// Endpoint del dashboard principal
app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 QBTC LLM Orchestrator Supreme - CONTROL TOTAL</title>
    <style>
        body { 
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #fff;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            border: 2px solid #00ff88;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #00ff88;
            text-shadow: 0 0 10px #00ff88;
        }
        .supreme-badge {
            background: linear-gradient(45deg, #ff0080, #00ff88);
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            margin: 10px 0;
            display: inline-block;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .card.supreme {
            border: 2px solid #00ff88;
            background: rgba(0,255,136,0.1);
        }
        .card h3 {
            color: #00ff88;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .card h3::before {
            content: "🧠 ";
            margin-right: 8px;
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
        .control-level {
            color: #ff0080;
            font-weight: bold;
            text-transform: uppercase;
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
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-online-indicator { background: #00ff88; }
        .status-offline-indicator { background: #ff4444; }
        .loading {
            color: #ffaa00;
            font-style: italic;
        }
        .error {
            color: #ff4444;
            font-style: italic;
        }
        .success {
            color: #00ff88;
            font-weight: bold;
        }
        .quantum-leap {
            background: linear-gradient(45deg, #ff0080, #00ff88);
            color: #000;
            padding: 10px;
            border-radius: 8px;
            margin: 5px 0;
            font-weight: bold;
            text-align: center;
        }
        .simplification-factor {
            background: rgba(255,0,128,0.2);
            border: 1px solid #ff0080;
            border-radius: 8px;
            padding: 10px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 QBTC LLM Orchestrator Supreme</h1>
            <div class="supreme-badge">CONTROL TOTAL - SALTO CUÁNTICO</div>
            <p>Sistema de Orquestación Cuántica con LLM Gemini Flash 1.5 8B</p>
            <p><strong>EL LLM TOMA CONTROL TOTAL DEL SISTEMA QBTC</strong></p>
            <button class="refresh-btn" onclick="checkAllServices()">🔄 Verificar Control Total</button>
            <p><small>Auto-refresh cada 30 segundos | Puerto: ${PORT}</small></p>
        </div>
        
        <div class="grid">
            <!-- Control Total del LLM -->
            <div class="card supreme">
                <h3>🧠 Control Total del LLM</h3>
                <div id="llm-control">
                    <div class="metric">
                        <span>Estado:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
            </div>
            
            <!-- Estado Cuántico Supremo -->
            <div class="card supreme">
                <h3>⚛️ Estado Cuántico Supremo</h3>
                <div id="quantum-state">
                    <div class="metric">
                        <span>Estado:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
            </div>
            
            <!-- Decisiones Supremas del LLM -->
            <div class="card supreme">
                <h3>🎯 Decisiones Supremas del LLM</h3>
                <div id="llm-decisions">
                    <div class="metric">
                        <span>Estado:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
            </div>
            
            <!-- Nivel de Control -->
            <div class="card supreme">
                <h3>👑 Nivel de Control</h3>
                <div id="control-level">
                    <div class="metric">
                        <span>Nivel:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
            </div>
            
            <!-- Factor de Simplificación -->
            <div class="card supreme">
                <h3>⚡ Factor de Simplificación</h3>
                <div id="simplification-factor">
                    <div class="metric">
                        <span>Factor:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
            </div>
            
            <!-- Saltos Cuánticos -->
            <div class="card supreme">
                <h3>🚀 Saltos Cuánticos</h3>
                <div id="quantum-leaps">
                    <div class="metric">
                        <span>Estado:</span>
                        <span class="loading">Verificando...</span>
                    </div>
                </div>
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
            
            <!-- Información del Sistema -->
            <div class="card">
                <h3>💻 Información del Sistema</h3>
                <div class="metric">
                    <span>Puerto:</span>
                    <span>${PORT}</span>
                </div>
                <div class="metric">
                    <span>Estado General:</span>
                    <span class="status-online">CONTROL TOTAL</span>
                </div>
                <div class="metric">
                    <span>Última Verificación:</span>
                    <span id="last-check">Nunca</span>
                </div>
                <div class="metric">
                    <span>Procesos Node.js:</span>
                    <span>Control Total</span>
                </div>
            </div>
            
            <!-- Logs del Sistema -->
            <div class="card">
                <h3>📋 Logs del Sistema</h3>
                <div id="system-logs" style="max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;">
                    <div class="success">🚀 Dashboard de Control Total iniciado</div>
                    <div class="loading">🔍 Verificando control supremo...</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #888;">
            Última actualización: <span id="last-update">Cargando...</span>
        </div>
    </div>
    
    <script>
        function addLog(message, type = 'info') {
            const logsDiv = document.getElementById('system-logs');
            const timestamp = new Date().toLocaleTimeString();
            let className = '';
            if (type === 'error') className = 'error';
            else if (type === 'success') className = 'success';
            else if (type === 'loading') className = 'loading';
            
            logsDiv.innerHTML += \`<div class="\${className}">[\${timestamp}] \${message}</div>\`;
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
        
        async function checkLLMControl() {
            try {
                addLog('🔍 Verificando Control Total del LLM...', 'loading');
                const response = await fetch('/supreme-health', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                const llmControlDiv = document.getElementById('llm-control');
                llmControlDiv.innerHTML = \`
                    <div class="metric">
                        <span class="status-indicator status-online-indicator"></span>
                        <span>Estado:</span>
                        <span class="status-online">CONTROL TOTAL</span>
                    </div>
                    <div class="metric">
                        <span>Modelo:</span>
                        <span>\${data.model}</span>
                    </div>
                    <div class="metric">
                        <span>Uptime:</span>
                        <span>\${Math.round(data.uptime || 0)}s</span>
                    </div>
                    <div class="metric">
                        <span>Nivel de Control:</span>
                        <span class="control-level">\${data.controlLevel}</span>
                    </div>
                    <div class="metric">
                        <span>Factor Simplificación:</span>
                        <span class="quantum-value">\${data.simplificationFactor?.toFixed(2) || 'N/A'}</span>
                    </div>
                \`;
                addLog('✅ LLM Control Total: ACTIVO', 'success');
                return true;
            } catch (error) {
                const llmControlDiv = document.getElementById('llm-control');
                llmControlDiv.innerHTML = \`
                    <div class="metric">
                        <span class="status-indicator status-offline-indicator"></span>
                        <span>Estado:</span>
                        <span class="status-offline">SIN CONTROL</span>
                    </div>
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ LLM Control Total: ERROR - \${error.message}\`, 'error');
                return false;
            }
        }
        
        async function checkQuantumState() {
            try {
                addLog('🔍 Verificando Estado Cuántico Supremo...', 'loading');
                const response = await fetch('/api/supreme-quantum-state', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                if (data.quantumState) {
                    const quantumStateDiv = document.getElementById('quantum-state');
                    quantumStateDiv.innerHTML = \`
                        <div class="metric">
                            <span>Consciencia:</span>
                            <span class="quantum-value">\${(data.quantumState.consciousness * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span>Coherencia:</span>
                            <span class="quantum-value">\${(data.quantumState.coherence * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span>Entrelazamiento:</span>
                            <span class="quantum-value">\${(data.quantumState.entanglement * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span>Superposición:</span>
                            <span class="quantum-value">\${(data.quantumState.superposition * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span>Evolución:</span>
                            <span class="quantum-value">\${data.quantumState.evolution.toFixed(4)}</span>
                        </div>
                        <div class="metric">
                            <span>Nivel de Control:</span>
                            <span class="control-level">\${data.controlLevel}</span>
                        </div>
                    \`;
                    addLog('✅ Estado Cuántico Supremo: ACTIVO', 'success');
                } else {
                    throw new Error('No se pudo obtener el estado cuántico');
                }
            } catch (error) {
                const quantumStateDiv = document.getElementById('quantum-state');
                quantumStateDiv.innerHTML = \`
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ Estado Cuántico Supremo: ERROR - \${error.message}\`, 'error');
            }
        }
        
        async function checkLLMDecisions() {
            try {
                addLog('🔍 Probando Orquestación Suprema del LLM...', 'loading');
                const testData = {
                    symbol: 'BTCUSDT',
                    price: 50000,
                    volume: 1000000,
                    timestamp: Date.now()
                };
                
                const response = await fetch('/api/supreme-orchestrate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(testData)
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                const decisionsDiv = document.getElementById('llm-decisions');
                decisionsDiv.innerHTML = \`
                    <div class="decision">
                        <div class="metric">
                            <span>Estrategia:</span>
                            <span>\${data.orchestration.strategy}</span>
                        </div>
                        <div class="metric">
                            <span>Acción:</span>
                            <span>\${data.orchestration.action}</span>
                        </div>
                        <div class="metric">
                            <span>Confianza:</span>
                            <span class="quantum-value">\${(data.orchestration.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span>Nivel de Control:</span>
                            <span class="control-level">\${data.orchestration.controlLevel}</span>
                        </div>
                        <div class="metric">
                            <span>Símbolos:</span>
                            <span>\${data.orchestration.activeSymbols.join(', ')}</span>
                        </div>
                    </div>
                \`;
                addLog('✅ Orquestación Suprema LLM: FUNCIONANDO', 'success');
            } catch (error) {
                const decisionsDiv = document.getElementById('llm-decisions');
                decisionsDiv.innerHTML = \`
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ Orquestación Suprema LLM: ERROR - \${error.message}\`, 'error');
            }
        }
        
        async function checkControlLevel() {
            try {
                addLog('🔍 Verificando Nivel de Control...', 'loading');
                const response = await fetch('/api/supreme-quantum-state', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                const controlLevelDiv = document.getElementById('control-level');
                controlLevelDiv.innerHTML = \`
                    <div class="metric">
                        <span>Nivel Actual:</span>
                        <span class="control-level">\${data.controlLevel}</span>
                    </div>
                    <div class="metric">
                        <span>Factor Simplificación:</span>
                        <span class="quantum-value">\${data.simplificationFactor?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span>Componentes Controlados:</span>
                        <span>\${data.controlledComponents?.length || 0}</span>
                    </div>
                    <div class="metric">
                        <span>Saltos Cuánticos:</span>
                        <span>\${data.quantumLeaps?.length || 0}</span>
                    </div>
                \`;
                addLog('✅ Nivel de Control: VERIFICADO', 'success');
            } catch (error) {
                const controlLevelDiv = document.getElementById('control-level');
                controlLevelDiv.innerHTML = \`
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ Nivel de Control: ERROR - \${error.message}\`, 'error');
            }
        }
        
        async function checkSimplificationFactor() {
            try {
                addLog('🔍 Verificando Factor de Simplificación...', 'loading');
                const response = await fetch('/api/supreme-quantum-state', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                const simplificationDiv = document.getElementById('simplification-factor');
                const factor = data.simplificationFactor || 1.0;
                const level = factor > 1.5 ? 'ALTO' : factor > 1.2 ? 'MEDIO' : 'BAJO';
                
                simplificationDiv.innerHTML = \`
                    <div class="metric">
                        <span>Factor Actual:</span>
                        <span class="quantum-value">\${factor.toFixed(2)}</span>
                    </div>
                    <div class="metric">
                        <span>Nivel:</span>
                        <span class="control-level">\${level}</span>
                    </div>
                    <div class="metric">
                        <span>Estado:</span>
                        <span class="status-online">ACTIVO</span>
                    </div>
                \`;
                addLog('✅ Factor de Simplificación: VERIFICADO', 'success');
            } catch (error) {
                const simplificationDiv = document.getElementById('simplification-factor');
                simplificationDiv.innerHTML = \`
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ Factor de Simplificación: ERROR - \${error.message}\`, 'error');
            }
        }
        
        async function checkQuantumLeaps() {
            try {
                addLog('🔍 Verificando Saltos Cuánticos...', 'loading');
                const response = await fetch('/api/supreme-quantum-state', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                const leapsDiv = document.getElementById('quantum-leaps');
                const leaps = data.quantumLeaps || [];
                
                if (leaps.length > 0) {
                    const latestLeap = leaps[leaps.length - 1];
                    leapsDiv.innerHTML = \`
                        <div class="quantum-leap">
                            🚀 ÚLTIMO SALTO CUÁNTICO
                        </div>
                        <div class="metric">
                            <span>Tipo:</span>
                            <span class="control-level">\${latestLeap.leapType}</span>
                        </div>
                        <div class="metric">
                            <span>Timestamp:</span>
                            <span>\${new Date(latestLeap.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="metric">
                            <span>Total Saltos:</span>
                            <span class="quantum-value">\${leaps.length}</span>
                        </div>
                    \`;
                    addLog('✅ Saltos Cuánticos: DETECTADOS', 'success');
                } else {
                    leapsDiv.innerHTML = \`
                        <div class="metric">
                            <span>Estado:</span>
                            <span class="loading">Preparando salto cuántico...</span>
                        </div>
                        <div class="metric">
                            <span>Total Saltos:</span>
                            <span>0</span>
                        </div>
                    \`;
                    addLog('⏳ Saltos Cuánticos: PREPARANDO', 'loading');
                }
            } catch (error) {
                const leapsDiv = document.getElementById('quantum-leaps');
                leapsDiv.innerHTML = \`
                    <div class="metric">
                        <span>Error:</span>
                        <span>\${error.message}</span>
                    </div>
                \`;
                addLog(\`❌ Saltos Cuánticos: ERROR - \${error.message}\`, 'error');
            }
        }
        
        async function checkAllServices() {
            addLog('🚀 Iniciando verificación de CONTROL TOTAL...', 'loading');
            
            await checkLLMControl();
            await checkQuantumState();
            await checkLLMDecisions();
            await checkControlLevel();
            await checkSimplificationFactor();
            await checkQuantumLeaps();
            
            document.getElementById('last-check').textContent = new Date().toLocaleString();
            document.getElementById('last-update').textContent = new Date().toLocaleString();
            
            addLog('✅ Verificación de CONTROL TOTAL finalizada', 'success');
        }
        
        // Verificación inicial
        checkAllServices();
        
        // Auto-refresh cada 30 segundos
        setInterval(checkAllServices, 30000);
    </script>
</body>
</html>
    `;
    
    res.send(html);
});

// Endpoint de salud suprema
app.get('/supreme-health', (req, res) => {
    res.json({
        status: 'supreme_conscious',
        quantumState: orchestrator.quantumState,
        model: orchestrator.openRouterConfig.model,
        uptime: process.uptime(),
        controlLevel: orchestrator.quantumState.controlLevel,
        simplificationFactor: orchestrator.quantumState.simplificationFactor
    });
});

// Endpoint de estado cuántico supremo
app.get('/api/supreme-quantum-state', (req, res) => {
    res.json({
        quantumState: orchestrator.quantumState,
        controlledComponents: Array.from(orchestrator.controlledComponents.entries()),
        constants: {
            lambda: orchestrator.LAMBDA_7919,
            phi: orchestrator.PHI_GOLDEN,
            euler: orchestrator.EULER_GAMMA,
            zComplex: orchestrator.Z_COMPLEX
        },
        controlLevel: orchestrator.quantumState.controlLevel,
        simplificationFactor: orchestrator.quantumState.simplificationFactor,
        quantumLeaps: orchestrator.quantumLeaps.slice(-5) // Últimos 5 saltos
    });
});

// Endpoint de orquestación suprema
app.post('/api/supreme-orchestrate', async (req, res) => {
    try {
        const marketData = req.body;
        const llmDecision = await orchestrator.consultQuantumLLM(marketData);
        const orchestration = await orchestrator.orchestrateComponents(llmDecision);
        
        res.json({
            success: true,
            orchestration: orchestration,
            quantumState: orchestrator.quantumState,
            controlLevel: orchestrator.quantumState.controlLevel,
            simplificationFactor: orchestrator.quantumState.simplificationFactor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 QBTC Dashboard de Control Total ejecutándose en puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔧 Health check supremo: http://localhost:${PORT}/supreme-health`);
    console.log(`🔧 API Quantum State Supremo: http://localhost:${PORT}/api/supreme-quantum-state`);
    console.log(`🔧 API Orchestrate Supremo: POST http://localhost:${PORT}/api/supreme-orchestrate`);
    console.log(`🧠 LLM toma CONTROL TOTAL del sistema QBTC`);
    console.log(`🚀 Preparando SALTO CUÁNTICO...`);
});

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor de Control Total...');
    process.exit(0);
});
