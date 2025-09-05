#!/usr/bin/env node

/**
 * [TARGET] QBTC QUANTUM MONITORING DASHBOARD v2.0
 * 
 * Centro de comando avanzado para monitoreo integral del sistema
 * - Agregación en tiempo real de todas las métricas
 * - Dashboard web interactivo con WebSockets
 * - Alertas inteligentes basadas en quantum entropy
 * - Análisis predictivo de fallos
 * - Visualización de dependencias de servicios
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import axios from 'axios';
import { QUANTUM_CONSTANTS } from '../config/constants.js';

const app = express();
const server = createServer(app);
const io = new SocketIO(server);
const PORT = process.env.MONITOR_PORT || 14999;

// Configuración de servicios monitoreados
const SERVICES = [
    { name: 'Master Control Hub', port: 14001, category: 'CORE', priority: 'CRITICAL' },
    { name: 'Message Bus Event Hub', port: 14002, category: 'CORE', priority: 'HIGH' },
    { name: 'Configuration Service', port: 14003, category: 'CORE', priority: 'CRITICAL' },
    { name: 'Metrics Collector', port: 14004, category: 'CORE', priority: 'HIGH' },
    { name: 'Quantum Leverage Engine', port: 14101, category: 'QUANTUM', priority: 'CRITICAL' },
    { name: 'Consciousness Engine', port: 14102, category: 'QUANTUM', priority: 'HIGH' },
    { name: 'Quantum Analysis Server', port: 14103, category: 'QUANTUM', priority: 'CRITICAL' },
    { name: 'Binance Data Ingestion', port: 14104, category: 'DATA', priority: 'CRITICAL' },
    { name: 'Quantum Core Engine', port: 14105, category: 'QUANTUM', priority: 'CRITICAL' },
    { name: 'Trading Engine Executor', port: 14201, category: 'EXECUTION', priority: 'CRITICAL' },
    { name: 'Position Manager', port: 14202, category: 'EXECUTION', priority: 'CRITICAL' },
    { name: 'Exchange API Gateway', port: 14204, category: 'EXECUTION', priority: 'HIGH' },
    { name: 'Risk Management Core', port: 14301, category: 'RISK', priority: 'MAXIMUM' },
    { name: 'Emergency Response System', port: 14303, category: 'EMERGENCY', priority: 'MAXIMUM' }
];

// Estado global del sistema
let systemState = {
    services: new Map(),
    alerts: [],
    metrics: {
        totalServices: SERVICES.length,
        healthyServices: 0,
        criticalServices: 0,
        averageResponseTime: 0,
        systemUptime: Date.now(),
        quantumCoherence: 0,
        globalConsciousness: 0,
        entropy: 0
    },
    trends: {
        healthHistory: [],
        performanceHistory: [],
        quantumHistory: []
    }
};

app.use(express.json());
app.use(express.static('public')); // Para archivos estáticos del dashboard

// Endpoint principal del dashboard
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Quantum Monitoring Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Consolas', monospace; 
            background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
            color: #00ff88;
            min-height: 100vh;
            overflow-x: auto;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #00ff88;
            padding-bottom: 20px;
        }
        .header h1 { 
            font-size: 2.5rem; 
            text-shadow: 0 0 10px #00ff88; 
            margin-bottom: 10px;
        }
        .header .subtitle { 
            color: #88ffff; 
            font-size: 1.2rem; 
        }
        
        .dashboard-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px;
        }
        
        .panel { 
            background: rgba(0, 255, 136, 0.1); 
            border: 1px solid #00ff88; 
            border-radius: 10px; 
            padding: 20px;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        .panel h2 { 
            color: #00ff88; 
            margin-bottom: 15px; 
            font-size: 1.5rem;
            text-align: center;
        }
        
        .metric { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 5px;
        }
        .metric .label { color: #88ffff; }
        .metric .value { 
            color: #ffffff; 
            font-weight: bold;
        }
        .metric .value.healthy { color: #00ff88; }
        .metric .value.warning { color: #ffaa00; }
        .metric .value.critical { color: #ff4444; }
        
        .service-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 15px; 
        }
        
        .service-card { 
            background: rgba(0, 0, 0, 0.3); 
            border: 1px solid #444; 
            border-radius: 8px; 
            padding: 15px;
            transition: all 0.3s ease;
        }
        .service-card:hover { 
            border-color: #00ff88; 
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }
        .service-card.healthy { border-color: #00ff88; }
        .service-card.warning { border-color: #ffaa00; }
        .service-card.critical { border-color: #ff4444; }
        
        .service-name { 
            font-weight: bold; 
            color: #00ff88; 
            margin-bottom: 8px;
        }
        .service-status { 
            font-size: 0.9rem; 
            margin: 5px 0;
        }
        
        .quantum-display { 
            text-align: center; 
            padding: 20px;
        }
        .quantum-value { 
            font-size: 2.5rem; 
            font-weight: bold; 
            text-shadow: 0 0 20px currentColor;
        }
        
        .alerts-panel { grid-column: 1 / -1; }
        .alert { 
            background: rgba(255, 68, 68, 0.1); 
            border-left: 4px solid #ff4444; 
            padding: 10px; 
            margin: 10px 0; 
            border-radius: 0 5px 5px 0;
        }
        .alert.warning { 
            background: rgba(255, 170, 0, 0.1); 
            border-left-color: #ffaa00; 
        }
        .alert.info { 
            background: rgba(136, 255, 255, 0.1); 
            border-left-color: #88ffff; 
        }
        
        .timestamp { 
            color: #666; 
            font-size: 0.8rem; 
            text-align: center; 
            margin-top: 20px;
        }
        
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulsing { animation: pulse 2s infinite; }
        
        @keyframes glow { 0%, 100% { text-shadow: 0 0 5px currentColor; } 50% { text-shadow: 0 0 20px currentColor; } }
        .glowing { animation: glow 3s infinite; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="glowing">[ATOM] QBTC QUANTUM MONITORING DASHBOARD [ATOM]</h1>
            <div class="subtitle">Centro de Comando Avanzado - Monitoreo en Tiempo Real</div>
            <div class="timestamp" id="timestamp"></div>
        </div>
        
        <div class="dashboard-grid">
            <!-- Panel de Métricas Generales -->
            <div class="panel">
                <h2>[CHART] Métricas del Sistema</h2>
                <div class="metric">
                    <span class="label">Servicios Totales:</span>
                    <span class="value" id="total-services">--</span>
                </div>
                <div class="metric">
                    <span class="label">Servicios Saludables:</span>
                    <span class="value healthy" id="healthy-services">--</span>
                </div>
                <div class="metric">
                    <span class="label">Servicios Críticos:</span>
                    <span class="value critical" id="critical-services">--</span>
                </div>
                <div class="metric">
                    <span class="label">Tiempo de Respuesta Promedio:</span>
                    <span class="value" id="avg-response">--</span>
                </div>
                <div class="metric">
                    <span class="label">Uptime del Sistema:</span>
                    <span class="value" id="system-uptime">--</span>
                </div>
            </div>
            
            <!-- Panel Quantum -->
            <div class="panel">
                <h2>[GALAXY] Estado Cuántico Global</h2>
                <div class="quantum-display">
                    <div>Coherencia Cuántica</div>
                    <div class="quantum-value" id="quantum-coherence">0.000</div>
                </div>
                <div class="metric">
                    <span class="label">Consciencia Global:</span>
                    <span class="value" id="global-consciousness">--</span>
                </div>
                <div class="metric">
                    <span class="label">Entropía del Sistema:</span>
                    <span class="value" id="system-entropy">--</span>
                </div>
            </div>
            
            <!-- Panel de Alertas -->
            <div class="panel alerts-panel">
                <h2>[SIREN] Alertas del Sistema</h2>
                <div id="alerts-container">
                    <div class="alert info">
                        <strong>INFO:</strong> Sistema de monitoreo iniciado correctamente.
                    </div>
                </div>
            </div>
        </div>
        
        <div class="panel">
            <h2>[MONITOR] Estado de Servicios en Tiempo Real</h2>
            <div class="service-grid" id="services-container">
                <!-- Los servicios se cargarán dinámicamente -->
            </div>
        </div>
    </div>
    
    <script>
        const socket = io();
        
        // Actualizar timestamp
        function updateTimestamp() {
            document.getElementById('timestamp').textContent = 
                'Última actualización: ' + new Date().toLocaleString();
        }
        setInterval(updateTimestamp, 1000);
        updateTimestamp();
        
        // Escuchar actualizaciones del sistema
        socket.on('systemUpdate', (data) => {
            updateSystemMetrics(data.metrics);
            updateServices(data.services);
            updateAlerts(data.alerts);
        });
        
        function updateSystemMetrics(metrics) {
            document.getElementById('total-services').textContent = metrics.totalServices;
            document.getElementById('healthy-services').textContent = metrics.healthyServices;
            document.getElementById('critical-services').textContent = metrics.criticalServices;
            document.getElementById('avg-response').textContent = metrics.averageResponseTime + 'ms';
            document.getElementById('system-uptime').textContent = formatUptime(Date.now() - metrics.systemUptime);
            document.getElementById('quantum-coherence').textContent = metrics.quantumCoherence.toFixed(3);
            document.getElementById('global-consciousness').textContent = (metrics.globalConsciousness * 100).toFixed(1) + '%';
            document.getElementById('system-entropy').textContent = metrics.entropy.toFixed(2);
        }
        
        function updateServices(services) {
            const container = document.getElementById('services-container');
            container.innerHTML = '';
            
            services.forEach(service => {
                const card = document.createElement('div');
                card.className = \`service-card \${service.status.toLowerCase()}\`;
                card.innerHTML = \`
                    <div class="service-name">\${service.name}</div>
                    <div class="service-status">Puerto: \${service.port}</div>
                    <div class="service-status">Estado: \${service.status}</div>
                    <div class="service-status">Respuesta: \${service.responseTime}ms</div>
                    <div class="service-status">Categoría: \${service.category}</div>
                    <div class="service-status">Prioridad: \${service.priority}</div>
                \`;
                container.appendChild(card);
            });
        }
        
        function updateAlerts(alerts) {
            const container = document.getElementById('alerts-container');
            container.innerHTML = '';
            
            if (alerts.length === 0) {
                container.innerHTML = '<div class="alert info"><strong>INFO:</strong> No hay alertas activas. Sistema funcionando normalmente.</div>';
                return;
            }
            
            alerts.slice(0, 10).forEach(alert => {
                const alertDiv = document.createElement('div');
                alertDiv.className = \`alert \${alert.level}\`;
                alertDiv.innerHTML = \`
                    <strong>\${alert.level.toUpperCase()}:</strong> \${alert.message}
                    <small style="float: right; color: #666;">\${new Date(alert.timestamp).toLocaleTimeString()}</small>
                \`;
                container.appendChild(alertDiv);
            });
        }
        
        function formatUptime(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) return \`\${days}d \${hours % 24}h \${minutes % 60}m\`;
            if (hours > 0) return \`\${hours}h \${minutes % 60}m \${seconds % 60}s\`;
            if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
            return \`\${seconds}s\`;
        }
        
        // Solicitar datos iniciales
        socket.emit('requestUpdate');
    </script>
</body>
</html>
    `);
});

// API endpoints para métricas
app.get('/api/system/status', (req, res) => {
    res.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        metrics: systemState.metrics,
        services: Array.from(systemState.services.values())
    });
});

app.get('/api/services/health', async (req, res) => {
    const healthResults = await checkAllServicesHealth();
    res.json(healthResults);
});

app.get('/api/metrics/quantum', (req, res) => {
    res.json({
        coherence: systemState.metrics.quantumCoherence,
        consciousness: systemState.metrics.globalConsciousness,
        entropy: systemState.metrics.entropy,
        timestamp: new Date().toISOString()
    });
});

// WebSocket para actualizaciones en tiempo real
io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado al dashboard de monitoreo');
    
    socket.on('requestUpdate', async () => {
        const systemData = await generateSystemUpdate();
        socket.emit('systemUpdate', systemData);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Cliente desconectado del dashboard');
    });
});

// Función para verificar salud de todos los servicios
async function checkAllServicesHealth() {
    const healthResults = [];
    const startTime = Date.now();
    let totalResponseTime = 0;
    let healthyCount = 0;
    let criticalCount = 0;

    for (const service of SERVICES) {
        const serviceStart = Date.now();
        let status = 'UNKNOWN';
        let responseTime = 0;
        let healthData = null;

        try {
            // Intentar múltiples endpoints
            const endpoints = ['/health', '/status', '/metrics/health', '/'];
            let response = null;

            for (const endpoint of endpoints) {
                try {
                    response = await axios.get(`http://localhost:${service.port}${endpoint}`, { 
                        timeout: 3000 
                    });
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (response) {
                responseTime = Date.now() - serviceStart;
                totalResponseTime += responseTime;
                
                if (response.status === 200) {
                    status = 'HEALTHY';
                    healthyCount++;
                } else {
                    status = 'WARNING';
                }
                
                healthData = response.data;
            } else {
                status = 'CRITICAL';
                criticalCount++;
                responseTime = 5000; // Timeout
            }
        } catch (error) {
            status = 'CRITICAL';
            criticalCount++;
            responseTime = 5000;
        }

        const serviceInfo = {
            ...service,
            status,
            responseTime,
            lastCheck: new Date().toISOString(),
            healthData
        };

        healthResults.push(serviceInfo);
        systemState.services.set(service.name, serviceInfo);
    }

    // Actualizar métricas globales
    systemState.metrics.healthyServices = healthyCount;
    systemState.metrics.criticalServices = criticalCount;
    systemState.metrics.averageResponseTime = Math.round(totalResponseTime / SERVICES.length);

    return healthResults;
}

// Función para calcular métricas cuánticas
async function calculateQuantumMetrics() {
    let totalCoherence = 0;
    let totalConsciousness = 0;
    let totalEntropy = 0;
    let quantumServices = 0;

    // Obtener métricas cuánticas de servicios especializados
    const quantumEndpoints = [
        'http://localhost:14105/status', // Quantum Core
        'http://localhost:14103/health', // Quantum Analysis
        'http://localhost:14102/health', // Consciousness Engine
        'http://localhost:14101/health'  // Quantum Leverage
    ];

    for (const endpoint of quantumEndpoints) {
        try {
            const response = await axios.get(endpoint, { timeout: 2000 });
            const data = response.data;

            if (data.quantum_state) {
                totalCoherence += data.quantum_state.coherence || 0;
                totalConsciousness += data.quantum_state.consciousness || 0;
                quantumServices++;
            } else if (data.consciousness_state) {
                totalConsciousness += data.consciousness_state.level || 0;
                totalCoherence += data.consciousness_state.coherence_index || 0;
                quantumServices++;
            }
        } catch (error) {
            // Servicio no disponible o sin métricas cuánticas
        }
    }

    if (quantumServices > 0) {
        systemState.metrics.quantumCoherence = totalCoherence / quantumServices;
        systemState.metrics.globalConsciousness = totalConsciousness / quantumServices;
    }

    // Calcular entropía del sistema basada en salud de servicios
    const healthyRatio = systemState.metrics.healthyServices / systemState.metrics.totalServices;
    systemState.metrics.entropy = 1 - healthyRatio; // Menos entropía = más orden
}

// Función para generar alertas inteligentes
function generateAlerts() {
    const newAlerts = [];
    const now = Date.now();

    // Alerta por servicios críticos
    if (systemState.metrics.criticalServices > 0) {
        newAlerts.push({
            level: 'critical',
            message: `${systemState.metrics.criticalServices} servicios en estado crítico detectados`,
            timestamp: now,
            category: 'service_health'
        });
    }

    // Alerta por baja coherencia cuántica
    if (systemState.metrics.quantumCoherence < 0.7) {
        newAlerts.push({
            level: 'warning',
            message: `Coherencia cuántica baja detectada: ${(systemState.metrics.quantumCoherence * 100).toFixed(1)}%`,
            timestamp: now,
            category: 'quantum_metrics'
        });
    }

    // Alerta por alta entropía del sistema
    if (systemState.metrics.entropy > 0.3) {
        newAlerts.push({
            level: 'warning',
            message: `Alta entropía del sistema detectada: ${(systemState.metrics.entropy * 100).toFixed(1)}%`,
            timestamp: now,
            category: 'system_health'
        });
    }

    // Alerta por tiempo de respuesta alto
    if (systemState.metrics.averageResponseTime > 2000) {
        newAlerts.push({
            level: 'warning',
            message: `Tiempo de respuesta promedio elevado: ${systemState.metrics.averageResponseTime}ms`,
            timestamp: now,
            category: 'performance'
        });
    }

    // Mantener solo las alertas de las últimas 24 horas
    const cutoffTime = now - (24 * 60 * 60 * 1000);
    systemState.alerts = [...newAlerts, ...systemState.alerts.filter(alert => alert.timestamp > cutoffTime)];
}

// Función para generar actualización completa del sistema
async function generateSystemUpdate() {
    await checkAllServicesHealth();
    await calculateQuantumMetrics();
    generateAlerts();

    return {
        timestamp: new Date().toISOString(),
        metrics: systemState.metrics,
        services: Array.from(systemState.services.values()),
        alerts: systemState.alerts.slice(0, 20) // Últimas 20 alertas
    };
}

// Monitoreo continuo en tiempo real
setInterval(async () => {
    try {
        const systemData = await generateSystemUpdate();
        io.emit('systemUpdate', systemData);
        
        // Log de estado cada 30 segundos
        console.log(`[MONITOR] ${new Date().toISOString()} | Servicios: ${systemState.metrics.healthyServices}/${systemState.metrics.totalServices} | Coherencia: ${(systemState.metrics.quantumCoherence * 100).toFixed(1)}% | Alertas: ${systemState.alerts.length}`);
    } catch (error) {
        console.error('[X] Error en monitoreo continuo:', error.message);
    }
}, 5000); // Actualización cada 5 segundos

// Inicializar servidor
server.listen(PORT, () => {
    console.log(`[TARGET] QBTC Quantum Monitoring Dashboard iniciado en puerto ${PORT}`);
    console.log(`[GLOBE] Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`[CHART] API disponible en: http://localhost:${PORT}/api/system/status`);
    console.log(`[ATOM]  Monitoreando ${SERVICES.length} servicios en tiempo real`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('[STOP] Cerrando Monitoring Dashboard...');
    server.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[STOP] Recibido SIGINT, cerrando...');
    server.close();
    process.exit(0);
});

export default app;
