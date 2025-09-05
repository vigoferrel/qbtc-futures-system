import { spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * 🚀 QBTC PROCESS MANAGER
 * =======================
 * 
 * Sistema de gestión de procesos para mantener todos los servicios QBTC
 * activos con health checks, auto-restart y monitoreo en tiempo real
 */

export class QBTCProcessManager extends EventEmitter {
    constructor() {
        super();
        this.processes = new Map();
        this.healthChecks = new Map();
        this.autoRestart = true;
        this.maxRestartAttempts = 5;
        this.restartDelay = 5000; // 5 segundos
        this.healthCheckInterval = 30000; // 30 segundos
        
        console.log('[PROCESS-MANAGER] QBTC Process Manager inicializado');
    }

    /**
     * Inicia un servicio con persistencia
     */
    async startService(serviceName, scriptPath, options = {}) {
        try {
            console.log(`[PROCESS-MANAGER] Iniciando servicio: ${serviceName}`);
            
            const processOptions = {
                stdio: 'pipe',
                detached: false,
                ...options
            };

            const childProcess = spawn('node', [scriptPath], processOptions);
            
            // Configurar el proceso
            this.processes.set(serviceName, {
                process: childProcess,
                scriptPath,
                startTime: Date.now(),
                restartCount: 0,
                status: 'STARTING',
                options
            });

            // Configurar event listeners
            childProcess.stdout.on('data', (data) => {
                console.log(`[${serviceName}] ${data.toString().trim()}`);
            });

            childProcess.stderr.on('data', (data) => {
                console.error(`[${serviceName}-ERROR] ${data.toString().trim()}`);
            });

            childProcess.on('close', (code) => {
                console.log(`[PROCESS-MANAGER] Servicio ${serviceName} cerrado con código: ${code}`);
                this.handleProcessExit(serviceName, code);
            });

            childProcess.on('error', (error) => {
                console.error(`[PROCESS-MANAGER] Error en servicio ${serviceName}:`, error);
                this.handleProcessError(serviceName, error);
            });

            // Marcar como iniciado
            setTimeout(() => {
                const processInfo = this.processes.get(serviceName);
                if (processInfo) {
                    processInfo.status = 'RUNNING';
                    console.log(`[PROCESS-MANAGER] Servicio ${serviceName} iniciado exitosamente`);
                }
            }, 2000);

            // Iniciar health check
            this.startHealthCheck(serviceName);

            return { success: true, serviceName, pid: childProcess.pid };

        } catch (error) {
            console.error(`[PROCESS-MANAGER] Error iniciando servicio ${serviceName}:`, error);
            return { success: false, serviceName, error: error.message };
        }
    }

    /**
     * Maneja el cierre de un proceso
     */
    handleProcessExit(serviceName, code) {
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) return;

        processInfo.status = 'STOPPED';
        console.log(`[PROCESS-MANAGER] Servicio ${serviceName} detenido (código: ${code})`);

        // Auto-restart si está habilitado
        if (this.autoRestart && processInfo.restartCount < this.maxRestartAttempts) {
            console.log(`[PROCESS-MANAGER] Reiniciando servicio ${serviceName} en ${this.restartDelay}ms...`);
            
            setTimeout(() => {
                this.restartService(serviceName);
            }, this.restartDelay);
        } else if (processInfo.restartCount >= this.maxRestartAttempts) {
            console.error(`[PROCESS-MANAGER] Servicio ${serviceName} excedió el límite de reintentos`);
            this.emit('service-failed', { serviceName, restartCount: processInfo.restartCount });
        }
    }

    /**
     * Maneja errores de proceso
     */
    handleProcessError(serviceName, error) {
        console.error(`[PROCESS-MANAGER] Error en servicio ${serviceName}:`, error);
        this.emit('service-error', { serviceName, error: error.message });
    }

    /**
     * Reinicia un servicio
     */
    async restartService(serviceName) {
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) {
            console.error(`[PROCESS-MANAGER] Servicio ${serviceName} no encontrado`);
            return;
        }

        console.log(`[PROCESS-MANAGER] Reiniciando servicio: ${serviceName}`);
        
        // Detener proceso actual
        await this.stopService(serviceName);
        
        // Incrementar contador de reinicios
        processInfo.restartCount++;
        
        // Reiniciar servicio
        await this.startService(serviceName, processInfo.scriptPath, processInfo.options);
    }

    /**
     * Detiene un servicio
     */
    async stopService(serviceName) {
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) {
            console.error(`[PROCESS-MANAGER] Servicio ${serviceName} no encontrado`);
            return;
        }

        console.log(`[PROCESS-MANAGER] Deteniendo servicio: ${serviceName}`);
        
        // Detener health check
        this.stopHealthCheck(serviceName);
        
        // Terminar proceso
        if (!processInfo.process.killed) {
            processInfo.process.kill('SIGTERM');
            
            // Forzar cierre si no responde
            setTimeout(() => {
                if (!processInfo.process.killed) {
                    processInfo.process.kill('SIGKILL');
                }
            }, 5000);
        }
        
        this.processes.delete(serviceName);
        console.log(`[PROCESS-MANAGER] Servicio ${serviceName} detenido`);
    }

    /**
     * Inicia health check para un servicio
     */
    startHealthCheck(serviceName) {
        const healthCheck = setInterval(async () => {
            await this.performHealthCheck(serviceName);
        }, this.healthCheckInterval);

        this.healthChecks.set(serviceName, healthCheck);
        console.log(`[PROCESS-MANAGER] Health check iniciado para: ${serviceName}`);
    }

    /**
     * Detiene health check para un servicio
     */
    stopHealthCheck(serviceName) {
        const healthCheck = this.healthChecks.get(serviceName);
        if (healthCheck) {
            clearInterval(healthCheck);
            this.healthChecks.delete(serviceName);
            console.log(`[PROCESS-MANAGER] Health check detenido para: ${serviceName}`);
        }
    }

    /**
     * Realiza health check de un servicio
     */
    async performHealthCheck(serviceName) {
        const processInfo = this.processes.get(serviceName);
        if (!processInfo) return;

        try {
            // Verificar si el proceso está vivo
            if (processInfo.process.killed) {
                console.warn(`[PROCESS-MANAGER] Health check fallido: ${serviceName} está muerto`);
                this.handleProcessExit(serviceName, -1);
                return;
            }

            // Verificar uptime
            const uptime = Date.now() - processInfo.startTime;
            const uptimeMinutes = Math.floor(uptime / 60000);

            // Log de health check
            console.log(`[PROCESS-MANAGER] Health check OK: ${serviceName} (uptime: ${uptimeMinutes}m)`);

            // Emitir evento de health check
            this.emit('health-check', {
                serviceName,
                status: 'HEALTHY',
                uptime: uptimeMinutes,
                restartCount: processInfo.restartCount
            });

        } catch (error) {
            console.error(`[PROCESS-MANAGER] Error en health check de ${serviceName}:`, error);
            this.emit('health-check', {
                serviceName,
                status: 'UNHEALTHY',
                error: error.message
            });
        }
    }

    /**
     * Obtiene estado de todos los servicios
     */
    getServicesStatus() {
        const status = {};
        
        for (const [serviceName, processInfo] of this.processes) {
            status[serviceName] = {
                status: processInfo.status,
                uptime: Math.floor((Date.now() - processInfo.startTime) / 60000),
                restartCount: processInfo.restartCount,
                pid: processInfo.process.pid,
                scriptPath: processInfo.scriptPath
            };
        }
        
        return status;
    }

    /**
     * Inicia todos los servicios QBTC
     */
    async startAllQBTCServices() {
        console.log('[PROCESS-MANAGER] Iniciando todos los servicios QBTC...');
        
        const services = [
            { name: 'quantum-core', script: 'analysis-engine/quantum-core.js' },
            { name: 'llm-orchestrator', script: 'llm-orchestrator-persistent.js' },
            { name: 'futures-execution', script: 'futures-execution/server.js' },
            { name: 'advanced-strategies', script: 'activate-advanced-strategies.js' }
        ];

        const results = [];
        
        for (const service of services) {
            const result = await this.startService(service.name, service.script);
            results.push(result);
            
            // Esperar un poco entre servicios
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('[PROCESS-MANAGER] Todos los servicios QBTC iniciados');
        return results;
    }

    /**
     * Detiene todos los servicios
     */
    async stopAllServices() {
        console.log('[PROCESS-MANAGER] Deteniendo todos los servicios...');
        
        const serviceNames = Array.from(this.processes.keys());
        const stopPromises = serviceNames.map(serviceName => this.stopService(serviceName));
        
        await Promise.all(stopPromises);
        console.log('[PROCESS-MANAGER] Todos los servicios detenidos');
    }

    /**
     * Configuración de auto-restart
     */
    setAutoRestart(enabled, maxAttempts = 5, delay = 5000) {
        this.autoRestart = enabled;
        this.maxRestartAttempts = maxAttempts;
        this.restartDelay = delay;
        
        console.log(`[PROCESS-MANAGER] Auto-restart configurado: ${enabled}, max attempts: ${maxAttempts}, delay: ${delay}ms`);
    }

    /**
     * Manejo de señales del sistema
     */
    setupSignalHandlers() {
        process.on('SIGINT', async () => {
            console.log('\n[PROCESS-MANAGER] Recibida señal SIGINT, deteniendo todos los servicios...');
            await this.stopAllServices();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n[PROCESS-MANAGER] Recibida señal SIGTERM, deteniendo todos los servicios...');
            await this.stopAllServices();
            process.exit(0);
        });
    }
}

export default QBTCProcessManager;
