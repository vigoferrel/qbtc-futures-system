/**
 * [MONITORING] CONTINUOUS MONITORING SYSTEM
 * =========================================
 * 
 * Sistema de monitoreo continuo para el QBTC Futures System
 * Monitorea todos los componentes en tiempo real
 */

import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import { QUANTUM_CONSTANTS } from '../config/constants.js';
import QuantumDataPurifier from './quantum-data-purifier.js';

class ContinuousMonitoringSystem extends EventEmitter {
    constructor() {
        super();
        this.purifier = new QuantumDataPurifier();
        
        // Constantes físicas reales
        this.LAMBDA_7919 = QUANTUM_CONSTANTS.LAMBDA_7919;
        this.PHI_GOLDEN = QUANTUM_CONSTANTS.PHI_GOLDEN;
        
        // Configuración de monitoreo
        this.monitoringConfig = {
            checkInterval: 5000, // 5 segundos
            alertThresholds: {
                responseTime: 2000,
                errorRate: 0.1,
                memoryUsage: 0.85,
                cpuUsage: 0.8,
                dataQuality: 0.6
            },
            services: [
                { name: 'llm-orchestrator', port: 14077, endpoint: '/health' },
                { name: 'quantum-core', port: 14105, endpoint: '/health' },
                { name: 'futures-execution', port: 14106, endpoint: '/health' },
                { name: 'data-ingestion', port: 14107, endpoint: '/health' },
                { name: 'master-control-hub', port: 14108, endpoint: '/health' }
            ]
        };
        
        // Estado de monitoreo
        this.monitoringState = {
            services: new Map(),
            alerts: [],
            metrics: {
                totalChecks: 0,
                successfulChecks: 0,
                failedChecks: 0,
                averageResponseTime: 0,
                uptime: 0
            },
            lastCheck: null
        };
        
        this.setupMonitoring();
        this.setupDashboard();
        
        console.log('[MONITORING] Continuous Monitoring System initialized');
        console.log(`[LAMBDA] Using λ₇₉₁₉ = ${this.LAMBDA_7919}`);
        console.log(`[PHI] Using φ = ${this.PHI_GOLDEN}`);
    }
    
    /**
     * Configura el sistema de monitoreo
     */
    setupMonitoring() {
        // Inicializar estado de servicios
        this.monitoringConfig.services.forEach(service => {
            this.monitoringState.services.set(service.name, {
                name: service.name,
                port: service.port,
                endpoint: service.endpoint,
                status: 'unknown',
                lastCheck: null,
                responseTime: 0,
                uptime: 0,
                errorCount: 0,
                successCount: 0
            });
        });
        
        // Iniciar monitoreo continuo
        this.startContinuousMonitoring();
        
        console.log('[MONITORING] Continuous monitoring active');
    }
    
    /**
     * Configura dashboard de monitoreo
     */
    setupDashboard() {
        const app = express();
        const PORT = 14109; // Puerto para dashboard
        
        app.use(express.json());
        
        // Endpoint principal del dashboard
        app.get('/', (req, res) => {
            res.json({
                status: 'monitoring_active',
                timestamp: Date.now(),
                services: Array.from(this.monitoringState.services.values()),
                metrics: this.monitoringState.metrics,
                alerts: this.monitoringState.alerts.slice(-10)
            });
        });
        
        // Endpoint de estado de servicios
        app.get('/services', (req, res) => {
            res.json(Array.from(this.monitoringState.services.values()));
        });
        
        // Endpoint de alertas
        app.get('/alerts', (req, res) => {
            res.json(this.monitoringState.alerts);
        });
        
        // Endpoint de métricas
        app.get('/metrics', (req, res) => {
            res.json(this.monitoringState.metrics);
        });
        
        // Endpoint de health check
        app.get('/health', (req, res) => {
            const healthyServices = Array.from(this.monitoringState.services.values())
                .filter(service => service.status === 'healthy').length;
            const totalServices = this.monitoringState.services.size;
            
            res.json({
                status: healthyServices === totalServices ? 'healthy' : 'degraded',
                healthyServices,
                totalServices,
                timestamp: Date.now()
            });
        });
        
        // Iniciar servidor del dashboard
        app.listen(PORT, () => {
            console.log(`[MONITORING] Dashboard running on port ${PORT}`);
        });
    }
    
    /**
     * Inicia monitoreo continuo
     */
    startContinuousMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCheck();
        }, this.monitoringConfig.checkInterval);
        
        console.log('[MONITORING] Continuous monitoring started');
    }
    
    /**
     * Realiza check de monitoreo
     */
    async performMonitoringCheck() {
        const startTime = Date.now();
        this.monitoringState.metrics.totalChecks++;
        
        console.log(`🔍 [MONITORING] Performing monitoring check #${this.monitoringState.metrics.totalChecks}`);
        
        // Verificar cada servicio
        const checkPromises = this.monitoringConfig.services.map(service => 
            this.checkService(service)
        );
        
        try {
            const results = await Promise.allSettled(checkPromises);
            
            // Procesar resultados
            results.forEach((result, index) => {
                const service = this.monitoringConfig.services[index];
                if (result.status === 'fulfilled') {
                    this.updateServiceStatus(service.name, result.value);
                    this.monitoringState.metrics.successfulChecks++;
                } else {
                    this.updateServiceStatus(service.name, { status: 'error', error: result.reason });
                    this.monitoringState.metrics.failedChecks++;
                }
            });
            
            // Actualizar métricas
            const responseTime = Date.now() - startTime;
            this.monitoringState.metrics.averageResponseTime = 
                (this.monitoringState.metrics.averageResponseTime + responseTime) / 2;
            this.monitoringState.metrics.uptime = process.uptime();
            this.monitoringState.lastCheck = Date.now();
            
            // Verificar alertas
            this.checkAlertConditions();
            
            // Emitir evento de monitoreo
            this.emit('monitoringCheck', {
                timestamp: Date.now(),
                services: Array.from(this.monitoringState.services.values()),
                metrics: this.monitoringState.metrics
            });
            
        } catch (error) {
            console.error('[ERROR] Monitoring check failed:', error.message);
            this.monitoringState.metrics.failedChecks++;
        }
    }
    
    /**
     * Verifica un servicio específico
     */
    async checkService(service) {
        const startTime = Date.now();
        
        try {
            const response = await axios.get(
                `http://localhost:${service.port}${service.endpoint}`,
                { timeout: 5000 }
            );
            
            const responseTime = Date.now() - startTime;
            
            return {
                status: 'healthy',
                responseTime,
                data: response.data,
                timestamp: Date.now()
            };
            
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                responseTime: Date.now() - startTime,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Actualiza estado de un servicio
     */
    updateServiceStatus(serviceName, checkResult) {
        const service = this.monitoringState.services.get(serviceName);
        
        if (service) {
            service.status = checkResult.status;
            service.lastCheck = checkResult.timestamp;
            service.responseTime = checkResult.responseTime || 0;
            
            if (checkResult.status === 'healthy') {
                service.successCount++;
                service.uptime = checkResult.data?.uptime || 0;
            } else {
                service.errorCount++;
            }
            
            this.monitoringState.services.set(serviceName, service);
        }
    }
    
    /**
     * Verifica condiciones de alerta
     */
    checkAlertConditions() {
        const thresholds = this.monitoringConfig.alertThresholds;
        
        // Verificar cada servicio
        this.monitoringState.services.forEach(service => {
            // Alerta por servicio caído
            if (service.status === 'error') {
                this.createAlert({
                    type: 'SERVICE_DOWN',
                    service: service.name,
                    message: `Service ${service.name} is down`,
                    severity: 'CRITICAL'
                });
            }
            
            // Alerta por tiempo de respuesta lento
            if (service.responseTime > thresholds.responseTime) {
                this.createAlert({
                    type: 'SLOW_RESPONSE',
                    service: service.name,
                    message: `Service ${service.name} response time ${service.responseTime}ms exceeds threshold`,
                    severity: 'WARNING'
                });
            }
            
            // Alerta por alta tasa de error
            const totalChecks = service.successCount + service.errorCount;
            if (totalChecks > 10) {
                const errorRate = service.errorCount / totalChecks;
                if (errorRate > thresholds.errorRate) {
                    this.createAlert({
                        type: 'HIGH_ERROR_RATE',
                        service: service.name,
                        message: `Service ${service.name} error rate ${(errorRate * 100).toFixed(2)}% exceeds threshold`,
                        severity: 'WARNING'
                    });
                }
            }
        });
        
        // Alerta por métricas del sistema
        const memUsage = process.memoryUsage();
        const memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
        
        if (memoryUsage > thresholds.memoryUsage) {
            this.createAlert({
                type: 'HIGH_MEMORY_USAGE',
                message: `Memory usage ${(memoryUsage * 100).toFixed(2)}% exceeds threshold`,
                severity: 'WARNING'
            });
        }
    }
    
    /**
     * Crea una alerta
     */
    createAlert(alert) {
        const fullAlert = {
            ...alert,
            id: this.generateAlertId(),
            timestamp: Date.now(),
            acknowledged: false
        };
        
        this.monitoringState.alerts.push(fullAlert);
        
        // Mantener solo las últimas 100 alertas
        if (this.monitoringState.alerts.length > 100) {
            this.monitoringState.alerts = this.monitoringState.alerts.slice(-100);
        }
        
        // Emitir evento de alerta
        this.emit('alert', fullAlert);
        
        console.log(`🚨 [ALERT] ${fullAlert.type}: ${fullAlert.message}`);
    }
    
    /**
     * Genera ID único para alerta
     */
    generateAlertId() {
        const timeModifier = Math.floor(Date.now() / 1000);
        const quantumValue = this.purifier.generateQuantumValue(timeModifier, 1);
        return `alert_${Date.now()}_${quantumValue.toString(36).substr(2, 8)}`;
    }
    
    /**
     * Obtiene reporte de monitoreo
     */
    getMonitoringReport() {
        const healthyServices = Array.from(this.monitoringState.services.values())
            .filter(service => service.status === 'healthy').length;
        const totalServices = this.monitoringState.services.size;
        
        return {
            status: healthyServices === totalServices ? 'healthy' : 'degraded',
            healthyServices,
            totalServices,
            services: Array.from(this.monitoringState.services.values()),
            metrics: this.monitoringState.metrics,
            alerts: this.monitoringState.alerts.slice(-10),
            lastCheck: this.monitoringState.lastCheck,
            uptime: process.uptime(),
            timestamp: Date.now()
        };
    }
    
    /**
     * Detiene monitoreo
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        console.log('[MONITORING] Continuous monitoring stopped');
    }
}

export default ContinuousMonitoringSystem;
