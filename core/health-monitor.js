// Usar fetch nativo de Node.js 18+
const fetch = globalThis.fetch;

/**
 * 📊 QBTC HEALTH MONITOR
 * =====================
 * 
 * Sistema de monitoreo de salud para todos los servicios QBTC
 * con verificaciones automáticas, métricas y alertas
 */

export class QBTCHealthMonitor {
    constructor() {
        this.services = new Map();
        this.healthChecks = new Map();
        this.alertThresholds = {
            responseTime: 5000,    // 5 segundos
            errorRate: 0.1,        // 10%
            uptime: 0.95           // 95%
        };
        
        // Configurar servicios conocidos
        this.setupKnownServices();
        
        console.log('[HEALTH-MONITOR] QBTC Health Monitor inicializado');
    }

    /**
     * Configura servicios conocidos del sistema QBTC
     */
    setupKnownServices() {
        this.addService('quantum-core', {
            endpoint: 'http://localhost:50001/health',
            description: 'Quantum Core Analysis Engine',
            critical: true
        });

        this.addService('llm-orchestrator', {
            endpoint: 'http://localhost:64609/supreme-health',
            description: 'LLM Orchestrator Supreme',
            critical: true
        });

        this.addService('futures-execution', {
            endpoint: 'http://localhost:50003/health',
            description: 'Futures Execution Engine',
            critical: true
        });

        this.addService('advanced-strategies', {
            endpoint: 'http://localhost:50004/health',
            description: 'Advanced Strategies Activator',
            critical: false
        });
    }

    /**
     * Agrega un servicio al monitoreo
     */
    addService(serviceName, config) {
        this.services.set(serviceName, {
            ...config,
            status: 'UNKNOWN',
            lastCheck: null,
            uptime: 0,
            responseTime: 0,
            errorCount: 0,
            totalChecks: 0,
            history: []
        });

        console.log(`[HEALTH-MONITOR] Servicio agregado: ${serviceName}`);
    }

    /**
     * Inicia monitoreo de un servicio
     */
    startMonitoring(serviceName, interval = 30000) {
        if (!this.services.has(serviceName)) {
            console.error(`[HEALTH-MONITOR] Servicio ${serviceName} no encontrado`);
            return;
        }

        const healthCheck = setInterval(async () => {
            await this.checkServiceHealth(serviceName);
        }, interval);

        this.healthChecks.set(serviceName, healthCheck);
        console.log(`[HEALTH-MONITOR] Monitoreo iniciado para: ${serviceName} (${interval/1000}s)`);
    }

    /**
     * Detiene monitoreo de un servicio
     */
    stopMonitoring(serviceName) {
        const healthCheck = this.healthChecks.get(serviceName);
        if (healthCheck) {
            clearInterval(healthCheck);
            this.healthChecks.delete(serviceName);
            console.log(`[HEALTH-MONITOR] Monitoreo detenido para: ${serviceName}`);
        }
    }

    /**
     * Verifica la salud de un servicio
     */
    async checkServiceHealth(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) return;

        const startTime = Date.now();
        let healthData = {
            service: serviceName,
            timestamp: new Date().toISOString(),
            status: 'UNKNOWN',
            responseTime: 0,
            error: null
        };

        try {
            const response = await fetch(service.endpoint, {
                method: 'GET',
                timeout: this.alertThresholds.responseTime
            });

            const responseTime = Date.now() - startTime;
            healthData.responseTime = responseTime;

            if (response.ok) {
                const data = await response.json();
                healthData.status = 'HEALTHY';
                healthData.data = data;
                
                // Actualizar métricas del servicio
                service.status = 'HEALTHY';
                service.responseTime = responseTime;
                service.totalChecks++;
                service.lastCheck = new Date();
                
                // Calcular uptime
                const healthyChecks = service.history.filter(h => h.status === 'HEALTHY').length;
                service.uptime = service.totalChecks > 0 ? healthyChecks / service.totalChecks : 0;

            } else {
                healthData.status = 'UNHEALTHY';
                healthData.error = `HTTP ${response.status}: ${response.statusText}`;
                
                service.status = 'UNHEALTHY';
                service.errorCount++;
                service.totalChecks++;
                service.lastCheck = new Date();
            }

        } catch (error) {
            const responseTime = Date.now() - startTime;
            healthData.status = 'ERROR';
            healthData.error = error.message;
            healthData.responseTime = responseTime;

            service.status = 'ERROR';
            service.errorCount++;
            service.totalChecks++;
            service.lastCheck = new Date();
        }

        // Agregar a historial (mantener últimos 100 checks)
        service.history.push(healthData);
        if (service.history.length > 100) {
            service.history.shift();
        }

        // Verificar alertas
        this.checkAlerts(serviceName, healthData);

        // Log del health check
        const logMessage = `[HEALTH] ${serviceName}: ${healthData.status} (${healthData.responseTime}ms)`;
        if (healthData.status === 'HEALTHY') {
            console.log(logMessage);
        } else {
            console.error(logMessage, healthData.error);
        }

        return healthData;
    }

    /**
     * Verifica alertas basadas en métricas
     */
    checkAlerts(serviceName, healthData) {
        const service = this.services.get(serviceName);
        if (!service) return;

        const alerts = [];

        // Alerta por tiempo de respuesta alto
        if (healthData.responseTime > this.alertThresholds.responseTime) {
            alerts.push({
                type: 'HIGH_RESPONSE_TIME',
                message: `${serviceName} response time: ${healthData.responseTime}ms (threshold: ${this.alertThresholds.responseTime}ms)`,
                severity: 'WARNING'
            });
        }

        // Alerta por tasa de error alta
        if (service.totalChecks > 10) {
            const errorRate = service.errorCount / service.totalChecks;
            if (errorRate > this.alertThresholds.errorRate) {
                alerts.push({
                    type: 'HIGH_ERROR_RATE',
                    message: `${serviceName} error rate: ${(errorRate * 100).toFixed(1)}% (threshold: ${(this.alertThresholds.errorRate * 100).toFixed(1)}%)`,
                    severity: 'CRITICAL'
                });
            }
        }

        // Alerta por uptime bajo
        if (service.uptime < this.alertThresholds.uptime && service.totalChecks > 10) {
            alerts.push({
                type: 'LOW_UPTIME',
                message: `${serviceName} uptime: ${(service.uptime * 100).toFixed(1)}% (threshold: ${(this.alertThresholds.uptime * 100).toFixed(1)}%)`,
                severity: 'CRITICAL'
            });
        }

        // Emitir alertas
        alerts.forEach(alert => {
            console.error(`[ALERT-${alert.severity}] ${alert.message}`);
        });
    }

    /**
     * Obtiene estado de salud de todos los servicios
     */
    getAllServicesHealth() {
        const health = {};
        
        for (const [serviceName, service] of this.services) {
            health[serviceName] = {
                name: serviceName,
                description: service.description,
                status: service.status,
                uptime: service.uptime,
                responseTime: service.responseTime,
                errorCount: service.errorCount,
                totalChecks: service.totalChecks,
                lastCheck: service.lastCheck,
                critical: service.critical
            };
        }
        
        return health;
    }

    /**
     * Obtiene métricas agregadas del sistema
     */
    getSystemMetrics() {
        const services = Array.from(this.services.values());
        const totalServices = services.length;
        const healthyServices = services.filter(s => s.status === 'HEALTHY').length;
        const criticalServices = services.filter(s => s.critical && s.status === 'HEALTHY').length;
        const totalCriticalServices = services.filter(s => s.critical).length;

        const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / totalServices;
        const avgUptime = services.reduce((sum, s) => sum + s.uptime, 0) / totalServices;

        return {
            totalServices,
            healthyServices,
            criticalServices,
            totalCriticalServices,
            systemHealth: totalServices > 0 ? healthyServices / totalServices : 0,
            criticalHealth: totalCriticalServices > 0 ? criticalServices / totalCriticalServices : 0,
            avgResponseTime,
            avgUptime,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Inicia monitoreo de todos los servicios
     */
    startMonitoringAll(interval = 30000) {
        console.log(`[HEALTH-MONITOR] Iniciando monitoreo de todos los servicios (${interval/1000}s)`);
        
        for (const serviceName of this.services.keys()) {
            this.startMonitoring(serviceName, interval);
        }
    }

    /**
     * Detiene monitoreo de todos los servicios
     */
    stopMonitoringAll() {
        console.log('[HEALTH-MONITOR] Deteniendo monitoreo de todos los servicios');
        
        for (const serviceName of this.services.keys()) {
            this.stopMonitoring(serviceName);
        }
    }

    /**
     * Verifica salud de todos los servicios una vez
     */
    async checkAllServicesHealth() {
        console.log('[HEALTH-MONITOR] Verificando salud de todos los servicios...');
        
        const promises = Array.from(this.services.keys()).map(serviceName => 
            this.checkServiceHealth(serviceName)
        );
        
        const results = await Promise.allSettled(promises);
        
        const summary = {
            total: results.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
            results: results.map((result, index) => ({
                service: Array.from(this.services.keys())[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : result.reason
            }))
        };
        
        console.log(`[HEALTH-MONITOR] Verificación completada: ${summary.successful}/${summary.total} exitosos`);
        
        return summary;
    }

    /**
     * Genera reporte de salud
     */
    generateHealthReport() {
        const health = this.getAllServicesHealth();
        const metrics = this.getSystemMetrics();
        
        console.log('\n📊 ====== REPORTE DE SALUD QBTC ======');
        console.log(`⏰ Timestamp: ${metrics.timestamp}`);
        console.log(`🏥 Salud del Sistema: ${(metrics.systemHealth * 100).toFixed(1)}%`);
        console.log(`🔴 Servicios Críticos: ${metrics.criticalServices}/${metrics.totalCriticalServices}`);
        console.log(`📈 Uptime Promedio: ${(metrics.avgUptime * 100).toFixed(1)}%`);
        console.log(`⚡ Tiempo de Respuesta Promedio: ${metrics.avgResponseTime.toFixed(0)}ms`);
        
        console.log('\n📋 Estado de Servicios:');
        for (const [serviceName, serviceHealth] of Object.entries(health)) {
            const statusIcon = serviceHealth.status === 'HEALTHY' ? '✅' : '❌';
            const criticalIcon = serviceHealth.critical ? '🔴' : '🟡';
            console.log(`   ${statusIcon} ${criticalIcon} ${serviceName}: ${serviceHealth.status} (uptime: ${(serviceHealth.uptime * 100).toFixed(1)}%)`);
        }
        
        console.log('=====================================\n');
        
        return { health, metrics };
    }
}

export default QBTCHealthMonitor;
