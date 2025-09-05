import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [SIREN] QBTC QUANTUM ALERT ENGINE v2.0
 * 
 * Sistema avanzado de alertas inteligentes con:
 * - Detección predictiva basada en quantum entropy
 * - Respuestas automatizadas
 * - Escalation matrix inteligente
 * - Machine learning para patrones de fallos
 * - Auto-healing capabilities
 * - Integración con todos los servicios QBTC
 */

import express from 'express';
import axios from 'axios';
import { QUANTUM_CONSTANTS } from '../config/constants.js';

const app = express();
const PORT = process.env.ALERT_PORT || 14998;

// Configuración de umbrales críticos
const ALERT_THRESHOLDS = {
    CRITICAL: {
        service_downtime: 30000,        // 30 segundos
        response_time: 5000,            // 5 segundos
        quantum_coherence: 0.5,         // 50%
        consciousness_level: 0.4,       // 40%
        system_entropy: 0.5,           // 50%
        memory_usage: 0.85,            // 85%
        cpu_usage: 0.9                 // 90%
    },
    WARNING: {
        service_downtime: 10000,        // 10 segundos
        response_time: 2000,            // 2 segundos
        quantum_coherence: 0.7,         // 70%
        consciousness_level: 0.6,       // 60%
        system_entropy: 0.3,           // 30%
        memory_usage: 0.7,             // 70%
        cpu_usage: 0.75                // 75%
    }
};

// Estado del sistema de alertas
let alertState = {
    activeAlerts: new Map(),
    alertHistory: [],
    predictiveModels: new Map(),
    autoResponses: new Map(),
    escalationQueues: new Map(),
    metrics: {
        totalAlerts: 0,
        criticalAlerts: 0,
        resolvedAlerts: 0,
        autoResolvedAlerts: 0,
        averageResolutionTime: 0,
        systemReliability: 1.0
    }
};

// Definición de servicios monitoreados
const MONITORED_SERVICES = [
    { name: 'Master Control Hub', port: 14001, priority: 'CRITICAL', category: 'CORE' },
    { name: 'Risk Management Core', port: 14301, priority: 'MAXIMUM', category: 'RISK' },
    { name: 'Emergency Response System', port: 14303, priority: 'MAXIMUM', category: 'EMERGENCY' },
    { name: 'Trading Engine Executor', port: 14201, priority: 'CRITICAL', category: 'EXECUTION' },
    { name: 'Quantum Leverage Engine', port: 14101, priority: 'CRITICAL', category: 'QUANTUM' },
    { name: 'Quantum Core Engine', port: 14105, priority: 'CRITICAL', category: 'QUANTUM' },
    { name: 'Position Manager', port: 14202, priority: 'CRITICAL', category: 'EXECUTION' },
    { name: 'Binance Data Ingestion', port: 14104, priority: 'CRITICAL', category: 'DATA' },
    { name: 'Configuration Service', port: 14003, priority: 'CRITICAL', category: 'CORE' },
    { name: 'Quantum Analysis Server', port: 14103, priority: 'CRITICAL', category: 'QUANTUM' },
    { name: 'Consciousness Engine', port: 14102, priority: 'HIGH', category: 'QUANTUM' },
    { name: 'Exchange API Gateway', port: 14204, priority: 'HIGH', category: 'EXECUTION' },
    { name: 'Message Bus Event Hub', port: 14002, priority: 'HIGH', category: 'CORE' },
    { name: 'Metrics Collector', port: 14004, priority: 'HIGH', category: 'CORE' }
];

app.use(express.json());

// Función para generar ID único de alerta
function generateAlertId() {
    return `ALERT_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`;
}

// Función principal de verificación de servicios con alertas
async function checkServicesWithAlerts() {
    const results = {
        timestamp: new Date().toISOString(),
        servicesChecked: MONITORED_SERVICES.length,
        alerts: [],
        predictiveWarnings: [],
        systemHealth: 'UNKNOWN'
    };

    let healthyServices = 0;
    let criticalServices = 0;
    let totalResponseTime = 0;

    for (const service of MONITORED_SERVICES) {
        const serviceResult = await checkSingleService(service);
        
        if (serviceResult.status === 'HEALTHY') {
            healthyServices++;
        } else if (serviceResult.status === 'CRITICAL') {
            criticalServices++;
            
            // Generar alerta crítica
            const alert = await generateServiceAlert(service, serviceResult, 'CRITICAL');
            results.alerts.push(alert);
            
            // Intentar auto-recovery
            await attemptServiceAutoRecovery(service, alert);
        } else if (serviceResult.status === 'WARNING') {
            const alert = await generateServiceAlert(service, serviceResult, 'WARNING');
            results.alerts.push(alert);
        }

        totalResponseTime += serviceResult.responseTime;

        // Análisis predictivo
        const prediction = await analyzePredictivePatterns(service, serviceResult);
        if (prediction.risk > 0.7) {
            results.predictiveWarnings.push(prediction);
        }
    }

    // Calcular métricas del sistema
    const healthRatio = healthyServices / MONITORED_SERVICES.length;
    results.systemHealth = healthRatio > 0.9 ? 'EXCELLENT' : 
                          healthRatio > 0.75 ? 'GOOD' : 
                          healthRatio > 0.5 ? 'WARNING' : 'CRITICAL';

    // Generar alertas de sistema si es necesario
    if (criticalServices > 3) {
        const systemAlert = await generateSystemAlert('CRITICAL', 
            `Sistema en estado crítico: ${criticalServices} servicios fallan`);
        results.alerts.push(systemAlert);
    }

    // Verificar métricas cuánticas
    const quantumAlerts = await checkQuantumMetrics();
    results.alerts.push(...quantumAlerts);

    return results;
}

// Verificar un servicio individual
async function checkSingleService(service) {
    const startTime = Date.now();
    let status = 'UNKNOWN';
    let responseTime = 0;
    let healthData = null;
    let metrics = null;

    try {
        // Intentar múltiples endpoints para máxima cobertura
        const endpoints = ['/health', '/status', '/metrics/health', '/metrics', '/'];
        let response = null;
        let endpoint_used = null;

        for (const endpoint of endpoints) {
            try {
                response = await axios.get(`http://localhost:${service.port}${endpoint}`, {
                    timeout: ALERT_THRESHOLDS.WARNING.response_time
                });
                endpoint_used = endpoint;
                break;
            } catch (e) {
                continue;
            }
        }

        responseTime = Date.now() - startTime;

        if (response && response.status === 200) {
            healthData = response.data;
            
            // Determinar estado basado en respuesta
            if (responseTime < ALERT_THRESHOLDS.WARNING.response_time) {
                status = 'HEALTHY';
            } else if (responseTime < ALERT_THRESHOLDS.CRITICAL.response_time) {
                status = 'WARNING';
            } else {
                status = 'CRITICAL';
            }

            // Extraer métricas adicionales si están disponibles
            if (healthData.metrics) {
                metrics = healthData.metrics;
                
                // Verificar métricas específicas
                if (metrics.system && metrics.system.memory) {
                    const memoryUsage = metrics.system.memory.heapUsed / metrics.system.memory.heapTotal;
                    if (memoryUsage > ALERT_THRESHOLDS.CRITICAL.memory_usage) {
                        status = 'CRITICAL';
                    }
                }
            }
        } else {
            status = 'CRITICAL';
            responseTime = ALERT_THRESHOLDS.CRITICAL.response_time;
        }
    } catch (error) {
        status = 'CRITICAL';
        responseTime = ALERT_THRESHOLDS.CRITICAL.response_time;
    }

    return {
        service: service.name,
        port: service.port,
        status,
        responseTime,
        healthData,
        metrics,
        timestamp: new Date().toISOString()
    };
}

// Generar alerta para un servicio
async function generateServiceAlert(service, serviceResult, level) {
    const alertId = generateAlertId();
    const alert = {
        id: alertId,
        timestamp: new Date().toISOString(),
        level: level,
        category: 'SERVICE_HEALTH',
        service: service.name,
        port: service.port,
        priority: service.priority,
        status: serviceResult.status,
        responseTime: serviceResult.responseTime,
        message: generateAlertMessage(service, serviceResult, level),
        metadata: {
            service_category: service.category,
            quantum_id: Math.floor(this.purifier.generateQuantumValue(index, modifier) * 9999),
            affected_endpoints: getAffectedEndpoints(service),
            potential_impact: assessPotentialImpact(service, level),
            recommended_actions: generateRecommendedActions(service, serviceResult, level)
        },
        autoResponse: null,
        resolved: false,
        escalated: false
    };

    // Registrar alerta activa
    alertState.activeAlerts.set(alertId, alert);
    alertState.alertHistory.push(alert);
    alertState.metrics.totalAlerts++;
    
    if (level === 'CRITICAL') {
        alertState.metrics.criticalAlerts++;
    }

    // Determinar si requiere escalation
    if (shouldEscalateAlert(service, level)) {
        await escalateAlert(alert);
    }

    return alert;
}

// Generar alerta de sistema
async function generateSystemAlert(level, message) {
    const alertId = generateAlertId();
    const alert = {
        id: alertId,
        timestamp: new Date().toISOString(),
        level: level,
        category: 'SYSTEM_HEALTH',
        service: 'SYSTEM',
        message: message,
        metadata: {
            system_wide: true,
            quantum_entropy: await calculateSystemEntropy(),
            affected_services: getAffectedServices(),
            priority_escalation: level === 'CRITICAL'
        },
        resolved: false,
        escalated: false
    };

    alertState.activeAlerts.set(alertId, alert);
    alertState.alertHistory.push(alert);
    
    return alert;
}

// Verificar métricas cuánticas para alertas
async function checkQuantumMetrics() {
    const alerts = [];
    
    try {
        // Verificar coherencia cuántica global
        const quantumEndpoints = [
            'http://localhost:14105/status', // Quantum Core
            'http://localhost:14103/health', // Quantum Analysis
            'http://localhost:14102/health', // Consciousness Engine
            'http://localhost:14101/health'  // Quantum Leverage
        ];

        let totalCoherence = 0;
        let totalConsciousness = 0;
        let quantumServices = 0;

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
                // Servicio quantum no disponible - generar alerta
                const alertId = generateAlertId();
                const alert = {
                    id: alertId,
                    timestamp: new Date().toISOString(),
                    level: 'CRITICAL',
                    category: 'QUANTUM_METRICS',
                    service: 'QUANTUM_SUBSYSTEM',
                    message: `Servicio cuántico no disponible: ${endpoint}`,
                    metadata: {
                        endpoint: endpoint,
                        quantum_coherence_impacted: true,
                        system_consciousness_affected: true
                    },
                    resolved: false
                };
                
                alerts.push(alert);
                alertState.activeAlerts.set(alertId, alert);
            }
        }

        // Verificar umbrales cuánticos
        if (quantumServices > 0) {
            const avgCoherence = totalCoherence / quantumServices;
            const avgConsciousness = totalConsciousness / quantumServices;

            if (avgCoherence < ALERT_THRESHOLDS.CRITICAL.quantum_coherence) {
                const alertId = generateAlertId();
                const alert = {
                    id: alertId,
                    timestamp: new Date().toISOString(),
                    level: 'CRITICAL',
                    category: 'QUANTUM_METRICS',
                    service: 'QUANTUM_COHERENCE',
                    message: `Coherencia cuántica crítica: ${(avgCoherence * 100).toFixed(1)}%`,
                    metadata: {
                        coherence_level: avgCoherence,
                        threshold_critical: ALERT_THRESHOLDS.CRITICAL.quantum_coherence,
                        consciousness_level: avgConsciousness,
                        impact: 'HIGH'
                    },
                    resolved: false
                };
                
                alerts.push(alert);
                alertState.activeAlerts.set(alertId, alert);
            }

            if (avgConsciousness < ALERT_THRESHOLDS.CRITICAL.consciousness_level) {
                const alertId = generateAlertId();
                const alert = {
                    id: alertId,
                    timestamp: new Date().toISOString(),
                    level: 'WARNING',
                    category: 'QUANTUM_METRICS',
                    service: 'CONSCIOUSNESS_ENGINE',
                    message: `Nivel de consciencia bajo: ${(avgConsciousness * 100).toFixed(1)}%`,
                    metadata: {
                        consciousness_level: avgConsciousness,
                        coherence_level: avgCoherence,
                        quantum_stability: avgCoherence * avgConsciousness
                    },
                    resolved: false
                };
                
                alerts.push(alert);
                alertState.activeAlerts.set(alertId, alert);
            }
        }
    } catch (error) {
        console.error('Error verificando métricas cuánticas:', error.message);
    }

    return alerts;
}

// Intentar auto-recovery de un servicio
async function attemptServiceAutoRecovery(service, alert) {
    console.log(`[REFRESH] Iniciando auto-recovery para ${service.name}`);
    
    const recoveryActions = [
        {
            name: 'Health Check Retry',
            action: async () => {
                // Esperar 5 segundos y reintentar
                await new Promise(resolve => setTimeout(resolve, 5000));
                return await checkSingleService(service);
            }
        },
        {
            name: 'Service Restart Signal',
            action: async () => {
                // Intentar enviar señal de reinicio al servicio
                try {
                    await axios.post(`http://localhost:${service.port}/admin/restart`, {}, { timeout: 3000 });
                    return { status: 'RESTART_INITIATED' };
                } catch (e) {
                    return { status: 'RESTART_FAILED' };
                }
            }
        }
    ];

    for (const recovery of recoveryActions) {
        try {
            console.log(`[WRENCH] Ejecutando: ${recovery.name} para ${service.name}`);
            const result = await recovery.action();
            
            if (result.status === 'HEALTHY' || result.status === 'RESTART_INITIATED') {
                // Auto-recovery exitoso
                alert.autoResponse = {
                    timestamp: new Date().toISOString(),
                    action: recovery.name,
                    result: 'SUCCESS',
                    new_status: result.status
                };
                
                // Marcar alerta como auto-resuelta
                if (result.status === 'HEALTHY') {
                    alert.resolved = true;
                    alert.resolvedAt = new Date().toISOString();
                    alert.resolutionMethod = 'AUTO_RECOVERY';
                    alertState.metrics.autoResolvedAlerts++;
                }

                console.log(`[CHECK] Auto-recovery exitoso para ${service.name}: ${recovery.name}`);
                return true;
            }
        } catch (error) {
            console.log(`[X] Auto-recovery fallido para ${service.name}: ${recovery.name} - ${error.message}`);
        }
    }

    console.log(`[WARNING]  Auto-recovery no disponible para ${service.name} - requiere intervención manual`);
    return false;
}

// Análisis predictivo de patrones
async function analyzePredictivePatterns(service, currentResult) {
    // Obtener historial reciente del servicio
    const recentHistory = alertState.alertHistory
        .filter(alert => alert.service === service.name)
        .slice(-10) // Últimas 10 alertas
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let riskScore = 0;
    let pattern = 'STABLE';

    if (recentHistory.length > 0) {
        // Calcular frecuencia de fallos
        const recentFailures = recentHistory.filter(alert => 
            alert.level === 'CRITICAL' && 
            (Date.now() - new Date(alert.timestamp)) < (24 * 60 * 60 * 1000) // Últimas 24h
        ).length;

        if (recentFailures > 3) {
            riskScore = 0.9;
            pattern = 'DEGRADING';
        } else if (recentFailures > 1) {
            riskScore = 0.6;
            pattern = 'UNSTABLE';
        } else if (currentResult.responseTime > ALERT_THRESHOLDS.WARNING.response_time) {
            riskScore = 0.4;
            pattern = 'SLOW_RESPONSE';
        }
    }

    return {
        service: service.name,
        risk: riskScore,
        pattern: pattern,
        prediction: riskScore > 0.7 ? 'FAILURE_LIKELY' : 
                   riskScore > 0.4 ? 'PERFORMANCE_DEGRADATION' : 'STABLE',
        recommendedAction: riskScore > 0.7 ? 'IMMEDIATE_ATTENTION' :
                          riskScore > 0.4 ? 'MONITOR_CLOSELY' : 'CONTINUE_MONITORING',
        confidence: Math.min(recentHistory.length / 10, 1), // Confianza basada en datos históricos
        timestamp: new Date().toISOString()
    };
}

// Funciones de apoyo
function generateAlertMessage(service, serviceResult, level) {
    if (level === 'CRITICAL') {
        if (serviceResult.status === 'CRITICAL') {
            return `CRÍTICO: ${service.name} no responde (Puerto ${service.port})`;
        } else {
            return `CRÍTICO: ${service.name} con problemas graves - Tiempo respuesta: ${serviceResult.responseTime}ms`;
        }
    } else if (level === 'WARNING') {
        return `ADVERTENCIA: ${service.name} respuesta lenta - Tiempo: ${serviceResult.responseTime}ms`;
    }
    return `${service.name}: ${serviceResult.status}`;
}

function getAffectedEndpoints(service) {
    const baseEndpoints = ['/', '/health', '/status'];
    if (service.category === 'QUANTUM') {
        baseEndpoints.push('/quantum/state', '/metrics');
    } else if (service.category === 'EXECUTION') {
        baseEndpoints.push('/trades', '/positions', '/orders');
    } else if (service.category === 'DATA') {
        baseEndpoints.push('/market-data', '/feed', '/stream');
    }
    return baseEndpoints.map(ep => `http://localhost:${service.port}${ep}`);
}

function assessPotentialImpact(service, level) {
    const priorityImpact = {
        'MAXIMUM': level === 'CRITICAL' ? 'SYSTEM_WIDE' : 'HIGH',
        'CRITICAL': level === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        'HIGH': level === 'CRITICAL' ? 'MEDIUM' : 'LOW'
    };
    
    return {
        level: priorityImpact[service.priority] || 'LOW',
        affected_systems: service.category,
        business_impact: service.priority === 'MAXIMUM' ? 'TRADING_HALT' : 
                        service.priority === 'CRITICAL' ? 'DEGRADED_PERFORMANCE' : 'MINIMAL',
        estimated_downtime: level === 'CRITICAL' ? '5-15 minutes' : 'N/A'
    };
}

function generateRecommendedActions(service, serviceResult, level) {
    const actions = [];
    
    if (level === 'CRITICAL') {
        actions.push('1. Verificar conectividad del servicio');
        actions.push('2. Revisar logs del servicio');
        actions.push('3. Intentar reinicio del servicio');
        if (service.priority === 'MAXIMUM') {
            actions.push('4. Activar plan de contingencia');
            actions.push('5. Notificar a equipo de emergencia');
        }
    } else if (level === 'WARNING') {
        actions.push('1. Monitorear de cerca el rendimiento');
        actions.push('2. Verificar uso de recursos');
        actions.push('3. Considerar optimización');
    }
    
    return actions;
}

function shouldEscalateAlert(service, level) {
    return (service.priority === 'MAXIMUM' && level === 'CRITICAL') ||
           (service.priority === 'CRITICAL' && level === 'CRITICAL');
}

async function escalateAlert(alert) {
    alert.escalated = true;
    alert.escalatedAt = new Date().toISOString();
    
    console.log(`[SIREN] ALERTA ESCALADA: ${alert.service} - ${alert.message}`);
    
    // Aquí se podría integrar con sistemas externos de notificación
    // como email, Slack, PagerDuty, etc.
}

function getAffectedServices() {
    return Array.from(alertState.activeAlerts.values())
        .filter(alert => !alert.resolved)
        .map(alert => alert.service);
}

async function calculateSystemEntropy() {
    const activeAlerts = Array.from(alertState.activeAlerts.values()).filter(alert => !alert.resolved);
    const totalServices = MONITORED_SERVICES.length;
    const criticalAlerts = activeAlerts.filter(alert => alert.level === 'CRITICAL').length;
    
    return Math.min(criticalAlerts / totalServices, 1);
}

// API Endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Quantum Alert Engine',
        port: PORT,
        timestamp: new Date().toISOString(),
        metrics: alertState.metrics,
        active_alerts: alertState.activeAlerts.size
    });
});

app.get('/api/alerts/active', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        total: alertState.activeAlerts.size,
        alerts: Array.from(alertState.activeAlerts.values()).filter(alert => !alert.resolved)
    });
});

app.get('/api/alerts/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({
        timestamp: new Date().toISOString(),
        total: alertState.alertHistory.length,
        alerts: alertState.alertHistory.slice(-limit).reverse()
    });
});

app.get('/api/system/health-check', async (req, res) => {
    try {
        const results = await checkServicesWithAlerts();
        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: 'Health check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/alerts/:id/resolve', (req, res) => {
    const alertId = req.params.id;
    const alert = alertState.activeAlerts.get(alertId);
    
    if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
    }
    
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolutionMethod = 'MANUAL';
    alertState.metrics.resolvedAlerts++;
    
    res.json({
        message: 'Alert resolved successfully',
        alert: alert
    });
});

// Monitoreo continuo
setInterval(async () => {
    try {
        await checkServicesWithAlerts();
        
        // Log de estado cada minuto
        const activeCount = Array.from(alertState.activeAlerts.values()).filter(alert => !alert.resolved).length;
        console.log(`[ALERT-ENGINE] ${new Date().toISOString()} | Alertas activas: ${activeCount} | Total alertas: ${alertState.metrics.totalAlerts}`);
        
    } catch (error) {
        console.error('[X] Error en monitoreo de alertas:', error.message);
    }
}, 10000); // Verificación cada 10 segundos

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`[SIREN] QBTC Quantum Alert Engine iniciado en puerto ${PORT}`);
    console.log(`[CHART] API de alertas: http://localhost:${PORT}/api/alerts/active`);
    console.log(`[MAGNIFY] Health check: http://localhost:${PORT}/api/system/health-check`);
    console.log(`[ATOM]  Monitoreando ${MONITORED_SERVICES.length} servicios con alertas inteligentes`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('[STOP] Cerrando Alert Engine...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[STOP] Recibido SIGINT, cerrando Alert Engine...');
    process.exit(0);
});

export default app;
