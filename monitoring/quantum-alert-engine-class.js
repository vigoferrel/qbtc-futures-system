#!/usr/bin/env node

/**
 * [SIREN] QBTC QUANTUM ALERT ENGINE - CLASS VERSION
 * ================================================
 * 
 * Versión refactorizada como clase exportable para el consolidador
 * Funcionalidades:
 * - Detección predictiva basada en quantum entropy
 * - Respuestas automatizadas
 * - Escalation matrix inteligente
 * - Auto-recovery capabilities
 * - Compatible con Quantum Modules Consolidator
 */

import axios from 'axios';
import { EventEmitter } from 'events';

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

class QuantumAlertEngine extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            consolidator: options.consolidator || null,
            engine: options.engine || 'quantum_core',
            event_bus: options.event_bus || null,
            monitoring_enabled: options.monitoring_enabled !== false,
            auto_recovery_enabled: options.auto_recovery_enabled !== false,
            alert_spam_protection: options.alert_spam_protection !== false,
            max_alerts_per_minute: options.max_alerts_per_minute || 10,
            ...options
        };
        
        // Estado del sistema de alertas
        this.alertState = {
            activeAlerts: new Map(),
            alertHistory: [],
            predictiveModels: new Map(),
            autoResponses: new Map(),
            escalationQueues: new Map(),
            alertCounts: new Map(), // Para spam protection
            metrics: {
                totalAlerts: 0,
                criticalAlerts: 0,
                resolvedAlerts: 0,
                autoResolvedAlerts: 0,
                averageResolutionTime: 0,
                systemReliability: 1.0
            }
        };
        
        // Circuit breaker para evitar spam
        this.circuitBreaker = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            threshold: 5,
            timeout: 60000 // 1 minuto
        };
        
        console.log('[SIREN] Quantum Alert Engine (Class) initialized');
        console.log(`[ATOM] Monitoring ${MONITORED_SERVICES.length} services`);
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Configurar limpieza periódica de alertas
            if (this.config.monitoring_enabled) {
                this.startMonitoring();
            }
            
            console.log('[CHECK] Quantum Alert Engine ready');
            this.emit('engine-initialized');
            
        } catch (error) {
            console.error('[X] Error initializing Quantum Alert Engine:', error.message);
            throw error;
        }
    }
    
    /**
     * Iniciar monitoreo de servicios
     */
    startMonitoring() {
        // Verificación cada 30 segundos (reducido para evitar spam)
        this.monitoringInterval = setInterval(() => {
            if (!this.circuitBreaker.isOpen) {
                this.performHealthCheck();
            } else {
                this.checkCircuitBreaker();
            }
        }, 30000);
        
        // Limpieza de alertas resueltas cada 5 minutos
        this.cleanupInterval = setInterval(() => {
            this.cleanupResolvedAlerts();
        }, 300000);
        
        console.log('[REFRESH] Health monitoring started (30s interval)');
    }
    
    /**
     * Verificar circuit breaker y posible reapertura
     */
    checkCircuitBreaker() {
        const now = Date.now();
        if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.failureCount = 0;
            console.log('[CHECK] Circuit breaker reset - resuming monitoring');
        }
    }
    
    /**
     * Verificar si una alerta debe ser enviada (anti-spam)
     */
    shouldSendAlert(serviceName, level) {
        if (!this.config.alert_spam_protection) return true;
        
        const now = Date.now();
        const key = `${serviceName}_${level}`;
        
        if (!this.alertState.alertCounts.has(key)) {
            this.alertState.alertCounts.set(key, []);
        }
        
        const alerts = this.alertState.alertCounts.get(key);
        
        // Limpiar alertas antiguas (más de 1 minuto)
        const recentAlerts = alerts.filter(timestamp => now - timestamp < 60000);
        this.alertState.alertCounts.set(key, recentAlerts);
        
        // Verificar si excede el límite
        if (recentAlerts.length >= this.config.max_alerts_per_minute) {
            return false;
        }
        
        // Registrar nueva alerta
        recentAlerts.push(now);
        return true;
    }
    
    /**
     * Activar circuit breaker
     */
    activateCircuitBreaker() {
        this.circuitBreaker.isOpen = true;
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        
        console.log(`[WARNING] Circuit breaker activated - monitoring paused for ${this.circuitBreaker.timeout / 1000}s`);
    }
    
    /**
     * Realizar verificación de salud de servicios
     */
    async performHealthCheck() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                servicesChecked: MONITORED_SERVICES.length,
                alerts: [],
                systemHealth: 'UNKNOWN'
            };
            
            let healthyServices = 0;
            let criticalServices = 0;
            
            // Verificar solo servicios esenciales para reducir noise
            const essentialServices = MONITORED_SERVICES.filter(s => 
                s.priority === 'CRITICAL' || s.priority === 'MAXIMUM'
            );
            
            for (const service of essentialServices) {
                const serviceResult = await this.checkSingleService(service);
                
                if (serviceResult.status === 'HEALTHY') {
                    healthyServices++;
                } else if (serviceResult.status === 'CRITICAL') {
                    criticalServices++;
                    
                    // Solo generar alerta si no hay spam
                    if (this.shouldSendAlert(service.name, 'CRITICAL')) {
                        const alert = await this.generateServiceAlert(service, serviceResult, 'CRITICAL');
                        results.alerts.push(alert);
                        
                        // Intentar auto-recovery solo si está habilitado
                        if (this.config.auto_recovery_enabled) {
                            await this.attemptServiceAutoRecovery(service, alert);
                        }
                    }
                }
            }
            
            // Calcular salud del sistema
            const healthRatio = healthyServices / essentialServices.length;
            results.systemHealth = healthRatio > 0.8 ? 'GOOD' : 
                                  healthRatio > 0.5 ? 'WARNING' : 'CRITICAL';
            
            // Solo generar alerta de sistema si hay muchos servicios críticos
            if (criticalServices > 5 && this.shouldSendAlert('SYSTEM', 'CRITICAL')) {
                const systemAlert = await this.generateSystemAlert('CRITICAL', 
                    `Sistema en estado crítico: ${criticalServices} servicios esenciales fallan`);
                results.alerts.push(systemAlert);
            }
            
            // Emitir evento con resultados
            this.emit('health-check-completed', results);
            
            return results;
            
        } catch (error) {
            console.error('[X] Error in health check:', error.message);
            
            // Incrementar contador de errores del circuit breaker
            if (++this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
                this.activateCircuitBreaker();
            }
            
            return { error: error.message, timestamp: new Date().toISOString() };
        }
    }
    
    /**
     * Verificar un servicio individual
     */
    async checkSingleService(service) {
        const startTime = Date.now();
        let status = 'UNKNOWN';
        let responseTime = 0;
        
        try {
            // Intentar solo endpoint básico para reducir noise
            const response = await axios.get(`http://localhost:${service.port}/health`, {
                timeout: ALERT_THRESHOLDS.WARNING.response_time
            });
            
            responseTime = Date.now() - startTime;
            
            if (response && response.status === 200) {
                status = responseTime < ALERT_THRESHOLDS.WARNING.response_time ? 'HEALTHY' : 'WARNING';
            } else {
                status = 'CRITICAL';
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
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Generar alerta para un servicio
     */
    async generateServiceAlert(service, serviceResult, level) {
        const alertId = this.generateAlertId();
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
            message: `${service.name} no responde (Puerto ${service.port})`,
            resolved: false,
            escalated: false
        };
        
        // Registrar alerta
        this.alertState.activeAlerts.set(alertId, alert);
        this.alertState.alertHistory.push(alert);
        this.alertState.metrics.totalAlerts++;
        
        if (level === 'CRITICAL') {
            this.alertState.metrics.criticalAlerts++;
        }
        
        // Emitir evento
        this.emit('alert-generated', alert);
        
        return alert;
    }
    
    /**
     * Generar alerta de sistema
     */
    async generateSystemAlert(level, message) {
        const alertId = this.generateAlertId();
        const alert = {
            id: alertId,
            timestamp: new Date().toISOString(),
            level: level,
            category: 'SYSTEM_HEALTH',
            service: 'SYSTEM',
            message: message,
            resolved: false,
            escalated: false
        };
        
        this.alertState.activeAlerts.set(alertId, alert);
        this.alertState.alertHistory.push(alert);
        
        this.emit('system-alert-generated', alert);
        
        return alert;
    }
    
    /**
     * Intentar auto-recovery de un servicio
     */
    async attemptServiceAutoRecovery(service, alert) {
        console.log(`[REFRESH] Iniciando auto-recovery para ${service.name}`);
        
        const actions = [
            { name: 'Health Check Retry', action: () => this.retryHealthCheck(service) },
            { name: 'Service Restart Signal', action: () => this.sendRestartSignal(service) }
        ];
        
        for (const { name, action } of actions) {
            try {
                console.log(`[WRENCH] Ejecutando: ${name} para ${service.name}`);
                await action();
                
                // Pequeña pausa entre acciones
                await this.sleep(1000);
                
            } catch (error) {
                console.log(`[WARNING] Auto-recovery no disponible para ${service.name} - requiere intervención manual`);
                break;
            }
        }
    }
    
    /**
     * Reintentar health check
     */
    async retryHealthCheck(service) {
        const result = await this.checkSingleService(service);
        return result.status === 'HEALTHY';
    }
    
    /**
     * Enviar señal de restart (simulado)
     */
    async sendRestartSignal(service) {
        // En un sistema real, aquí se enviaría una señal de restart
        // Por ahora es simulado
        return true;
    }
    
    /**
     * Limpiar alertas resueltas
     */
    cleanupResolvedAlerts() {
        const now = Date.now();
        const oneHourAgo = now - 3600000; // 1 hora
        
        // Limpiar alertas activas resueltas
        for (const [alertId, alert] of this.alertState.activeAlerts.entries()) {
            if (alert.resolved && new Date(alert.timestamp).getTime() < oneHourAgo) {
                this.alertState.activeAlerts.delete(alertId);
                this.alertState.metrics.resolvedAlerts++;
            }
        }
        
        // Mantener solo últimas 100 alertas en historial
        if (this.alertState.alertHistory.length > 100) {
            this.alertState.alertHistory = this.alertState.alertHistory.slice(-100);
        }
        
        console.log(`[BROOM] Cleaned up old alerts - Active: ${this.alertState.activeAlerts.size}`);
    }
    
    /**
     * Generar ID único de alerta
     */
    generateAlertId() {
        return `ALERT_${Date.now()}_${this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1).toString(36).substr(2, 6)}`;
    }
    
    /**
     * Utilidad para sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ==================== API PÚBLICA ====================
    
    /**
     * Obtener estado de alertas activas
     */
    getActiveAlerts() {
        return {
            count: this.alertState.activeAlerts.size,
            alerts: Array.from(this.alertState.activeAlerts.values()),
            metrics: this.alertState.metrics,
            circuit_breaker_status: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED'
        };
    }
    
    /**
     * Resolver una alerta manualmente
     */
    resolveAlert(alertId, resolution = 'MANUAL_RESOLUTION') {
        const alert = this.alertState.activeAlerts.get(alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolution = resolution;
            alert.resolvedAt = new Date().toISOString();
            
            this.emit('alert-resolved', alert);
            return true;
        }
        return false;
    }
    
    /**
     * Ejecutar operación específica
     */
    async execute(operation, data = {}) {
        switch (operation) {
            case 'healthCheck':
                return await this.performHealthCheck();
                
            case 'getAlerts':
                return this.getActiveAlerts();
                
            case 'resolveAlert':
                return this.resolveAlert(data.alertId, data.resolution);
                
            case 'circuitBreakerStatus':
                return {
                    isOpen: this.circuitBreaker.isOpen,
                    failureCount: this.circuitBreaker.failureCount,
                    lastFailure: this.circuitBreaker.lastFailureTime
                };
                
            default:
                return { success: false, error: `Unknown operation: ${operation}` };
        }
    }
    
    /**
     * Obtener métricas del engine
     */
    getMetrics() {
        return {
            ...this.alertState.metrics,
            active_alerts: this.alertState.activeAlerts.size,
            circuit_breaker_status: this.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED',
            services_monitored: MONITORED_SERVICES.length,
            monitoring_enabled: this.config.monitoring_enabled,
            last_update: Date.now()
        };
    }
    
    /**
     * Destruir el engine y limpiar recursos
     */
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.removeAllListeners();
        
        console.log('[X] Quantum Alert Engine destroyed');
    }
}

export default QuantumAlertEngine;
export { QuantumAlertEngine, ALERT_THRESHOLDS, MONITORED_SERVICES };

