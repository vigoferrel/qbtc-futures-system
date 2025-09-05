#!/usr/bin/env node

/**
 * [CONTROL_KNOBS] QBTC ENGINES ORCHESTRATOR
 * ============================
 * 
 * SCRIPT MAESTRO PARA ORQUESTACIÓN DE TODOS LOS MOTORES QBTC
 * 
 * FUNCIONES:
 * - Inicialización secuencial de todos los motores
 * - Health checks automáticos y monitoreo continuo
 * - Manejo de dependencias entre servicios
 * - Auto-recovery y reinicio de motores fallidos
 * - Dashboard de estado en tiempo real
 * - Logging centralizado y métricas de rendimiento
 * - Gestión graceful de shutdown
 * 
 * MOTORES GESTIONADOS:
 * 1. Temporal Cycles Engine (Puerto 14102)
 * 2. Multidimensional Weighting Engine (Puerto 14103)  
 * 3. Tier Strategy Generator (Puerto 14104)
 * 4. Consolidated Opportunities API (Puerto 14107)
 * 5. Validated Quantum Ranking Engine (In-process)
 * 
 * SISTEMA UNIFICADO:
 * 6. QBTC Unified System Monitor (Puerto 3001)
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

// Configuración de motores y servicios
const ENGINES_CONFIG = {
    temporal: {
        name: 'Temporal Cycles Engine',
        script: 'services/temporal-cycles-engine-service.js',
        port: 14102,
        priority: 1,
        dependencies: [],
        healthEndpoint: '/health',
        critical: true,
        autoRestart: true,
        startupDelay: 2000
    },
    
    weighting: {
        name: 'Multidimensional Weighting Engine',
        script: 'services/multidimensional-weighting-service.js',
        port: 14103,
        priority: 2,
        dependencies: ['temporal'],
        healthEndpoint: '/health',
        critical: true,
        autoRestart: true,
        startupDelay: 3000
    },
    
    strategies: {
        name: 'Tier Strategy Generator',
        script: 'services/tier-strategy-generator-service.js',
        port: 14104,
        priority: 3,
        dependencies: ['temporal', 'weighting'],
        healthEndpoint: '/health',
        critical: true,
        autoRestart: true,
        startupDelay: 2000
    },
    
    opportunities: {
        name: 'Consolidated Opportunities API',
        script: 'services/consolidated-opportunities-service.js',
        port: 14107,
        priority: 4,
        dependencies: ['temporal', 'weighting', 'strategies'],
        healthEndpoint: '/health',
        critical: true,
        autoRestart: true,
        startupDelay: 2000
    },
    
    monitor: {
        name: 'QBTC Unified System Monitor',
        script: 'qbtc-unified-system-monitor.js',
        port: 3001,
        priority: 5,
        dependencies: [], // Monitor independiente
        healthEndpoint: null, // Monitor maneja su propio health
        critical: false,
        autoRestart: true,
        startupDelay: 1000
    }
};

class QBTCEnginesOrchestrator extends EventEmitter {
    constructor() {
        super();
        
        this.processes = new Map();
        this.healthChecks = new Map();
        this.startupSequence = [];
        this.isShuttingDown = false;
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        
        // Estado del orquestador
        this.state = {
            totalEngines: Object.keys(ENGINES_CONFIG).length,
            runningEngines: 0,
            failedEngines: 0,
            healthyEngines: 0,
            lastHealthCheck: null,
            systemStatus: 'INITIALIZING',
            startupTime: Date.now(),
            uptimeSeconds: 0
        };
        
        // Configurar secuencia de inicio por prioridad
        this.setupStartupSequence();
        
        console.log('[CONTROL_KNOBS] =============== QBTC ENGINES ORCHESTRATOR STARTUP ===============');
        console.log(`[ROCKET] Inicializando ${this.state.totalEngines} motores QBTC...`);
        console.log('[CLIPBOARD] Secuencia de inicio configurada por dependencias y prioridades');
    }
    
    /**
     * Configura la secuencia de inicio basada en prioridades y dependencias
     */
    setupStartupSequence() {
        this.startupSequence = Object.entries(ENGINES_CONFIG)
            .sort(([, a], [, b]) => a.priority - b.priority)
            .map(([key, config]) => ({ key, ...config }));
        
        console.log('[CHART] Secuencia de inicio:');
        this.startupSequence.forEach((engine, index) => {
            const deps = engine.dependencies.length > 0 ? 
                `(depende de: ${engine.dependencies.join(', ')})` : '(independiente)';
            console.log(`   ${index + 1}. ${engine.name} - Puerto ${engine.port} ${deps}`);
        });
        console.log('');
    }
    
    /**
     * Inicia todos los motores en secuencia
     */
    async startAllEngines() {
        console.log('[ROCKET] Iniciando secuencia de arranque de motores...\n');
        
        for (const engine of this.startupSequence) {
            try {
                await this.startEngine(engine.key, engine);
                
                // Esperar delay de startup si está configurado
                if (engine.startupDelay > 0) {
                    console.log(`⏱️ Esperando ${engine.startupDelay}ms antes del siguiente motor...`);
                    await this.delay(engine.startupDelay);
                }
                
            } catch (error) {
                console.error(`[X] Error iniciando ${engine.name}:`, error.message);
                
                if (engine.critical) {
                    console.error('[STOP] Motor crítico falló - continuando con advertencia');
                    this.state.failedEngines++;
                } else {
                    console.log('[WARNING] Motor no crítico falló - continuando');
                }
            }
        }
        
        // Configurar health checks periódicos
        this.startHealthChecking();
        
        // Configurar métricas y logging
        this.startMetricsCollection();
        
        this.state.systemStatus = 'RUNNING';
        console.log('[CHECK] Secuencia de arranque completada');
        console.log(`[CONTROL_KNOBS] Sistema QBTC operativo con ${this.state.runningEngines}/${this.state.totalEngines} motores\n`);
        
        this.emit('orchestrator-ready', this.getSystemStatus());
    }
    
    /**
     * Inicia un motor específico
     */
    async startEngine(engineKey, config) {
        console.log(`[WRENCH] Iniciando ${config.name}...`);
        
        // Verificar dependencias
        const dependenciesReady = await this.checkDependencies(config.dependencies);
        if (!dependenciesReady) {
            throw new Error(`Dependencias no satisfechas: ${config.dependencies.join(', ')}`);
        }
        
        // Verificar que el archivo del script existe
        const scriptPath = path.resolve(config.script);
        try {
            await fs.access(scriptPath);
        } catch (error) {
            throw new Error(`Script no encontrado: ${scriptPath}`);
        }
        
        // Spawn del proceso
        const process = spawn('node', [scriptPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, ENGINE_KEY: engineKey },
            cwd: process.cwd()
        });
        
        // Configurar manejo de eventos del proceso
        this.setupProcessHandlers(engineKey, config, process);
        
        // Almacenar referencia del proceso
        this.processes.set(engineKey, {
            process,
            config,
            startTime: Date.now(),
            restarts: 0,
            lastHealthCheck: null,
            healthStatus: 'UNKNOWN'
        });
        
        // Esperar a que el proceso se estabilice
        await this.waitForEngineReady(engineKey, config);
        
        this.state.runningEngines++;
        console.log(`[CHECK] ${config.name} iniciado correctamente en puerto ${config.port}`);
        
        this.emit('engine-started', { engineKey, config });
        
        return process;
    }
    
    /**
     * Configura handlers para un proceso
     */
    setupProcessHandlers(engineKey, config, process) {
        process.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                console.log(`[${config.name}] ${output}`);
            }
        });
        
        process.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error) {
                console.error(`[${config.name}] ERROR: ${error}`);
            }
        });
        
        process.on('error', (error) => {
            console.error(`[X] Error en proceso ${config.name}:`, error.message);
            this.handleProcessFailure(engineKey, config, error);
        });
        
        process.on('exit', (code, signal) => {
            console.log(`[REFRESH] Proceso ${config.name} terminó con código ${code} (señal: ${signal})`);
            
            if (!this.isShuttingDown) {
                this.handleProcessFailure(engineKey, config, new Error(`Process exited with code ${code}`));
            }
        });
    }
    
    /**
     * Espera a que un motor esté listo
     */
    async waitForEngineReady(engineKey, config, timeout = 30000) {
        const startTime = Date.now();
        const checkInterval = 1000;
        
        while (Date.now() - startTime < timeout) {
            try {
                if (config.healthEndpoint) {
                    const isHealthy = await this.checkEngineHealth(engineKey, config);
                    if (isHealthy) {
                        return true;
                    }
                } else {
                    // Para motores sin health endpoint, esperar un tiempo fijo
                    await this.delay(5000);
                    return true;
                }
                
                await this.delay(checkInterval);
            } catch (error) {
                // Continuar esperando
                await this.delay(checkInterval);
            }
        }
        
        throw new Error(`Motor ${config.name} no respondió health check en ${timeout}ms`);
    }
    
    /**
     * Verifica dependencias de un motor
     */
    async checkDependencies(dependencies) {
        if (dependencies.length === 0) return true;
        
        for (const dep of dependencies) {
            const depProcess = this.processes.get(dep);
            if (!depProcess) {
                console.log(`[WARNING] Dependencia ${dep} no encontrada`);
                return false;
            }
            
            const isHealthy = await this.checkEngineHealth(dep, depProcess.config);
            if (!isHealthy) {
                console.log(`[WARNING] Dependencia ${dep} no está saludable`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Verifica salud de un motor específico
     */
    async checkEngineHealth(engineKey, config) {
        if (!config.healthEndpoint) return true;
        
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`http://localhost:${config.port}${config.healthEndpoint}`, {
                signal: controller.signal,
                method: 'GET'
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                const healthData = await response.json();
                
                // Actualizar estado de salud
                const processData = this.processes.get(engineKey);
                if (processData) {
                    processData.lastHealthCheck = Date.now();
                    processData.healthStatus = healthData.status === 'healthy' ? 'HEALTHY' : 'UNHEALTHY';
                }
                
                return healthData.status === 'healthy';
            }
            
            return false;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`⏰ Health check timeout para ${config.name}`);
            }
            return false;
        }
    }
    
    /**
     * Maneja fallos de procesos
     */
    async handleProcessFailure(engineKey, config, error) {
        console.error(`[BOOM] Fallo en ${config.name}:`, error.message);
        
        const processData = this.processes.get(engineKey);
        if (processData) {
            processData.healthStatus = 'FAILED';
        }
        
        this.state.runningEngines--;
        this.state.failedEngines++;
        
        // Auto-restart si está habilitado
        if (config.autoRestart && !this.isShuttingDown) {
            const retries = this.retryAttempts.get(engineKey) || 0;
            
            if (retries < this.maxRetries) {
                console.log(`[REFRESH] Auto-restart ${config.name} (intento ${retries + 1}/${this.maxRetries})`);
                
                this.retryAttempts.set(engineKey, retries + 1);
                
                // Delay progresivo entre reintentos
                const delay = Math.min(5000 * Math.pow(2, retries), 30000);
                await this.delay(delay);
                
                try {
                    await this.startEngine(engineKey, config);
                    this.retryAttempts.delete(engineKey); // Reset reintentos si tuvo éxito
                } catch (restartError) {
                    console.error(`[X] Fallo en auto-restart de ${config.name}:`, restartError.message);
                }
            } else {
                console.error(`[STOP] Max reintentos alcanzado para ${config.name} - marcando como permanentemente fallido`);
            }
        }
        
        this.emit('engine-failed', { engineKey, config, error });
    }
    
    /**
     * Inicia health checking periódico
     */
    startHealthChecking() {
        setInterval(async () => {
            try {
                await this.performHealthChecks();
            } catch (error) {
                console.error('[X] Error en health checks:', error.message);
            }
        }, 30000); // Cada 30 segundos
        
        console.log('[HOSPITAL] Health checking periódico activado (30s)');
    }
    
    /**
     * Realiza health checks de todos los motores
     */
    async performHealthChecks() {
        let healthyCount = 0;
        
        for (const [engineKey, processData] of this.processes) {
            const isHealthy = await this.checkEngineHealth(engineKey, processData.config);
            
            if (isHealthy) {
                healthyCount++;
            } else {
                console.log(`[WARNING] Health check failed para ${processData.config.name}`);
            }
        }
        
        this.state.healthyEngines = healthyCount;
        this.state.lastHealthCheck = Date.now();
        
        // Log periódico de estado
        if (Date.now() % (5 * 60 * 1000) < 30000) { // Cada 5 minutos aprox
            console.log(`[HOSPITAL] Health Status: ${healthyCount}/${this.processes.size} motores saludables`);
        }
    }
    
    /**
     * Inicia recolección de métricas
     */
    startMetricsCollection() {
        setInterval(() => {
            this.state.uptimeSeconds = Math.floor((Date.now() - this.state.startupTime) / 1000);
            
            // Emitir métricas para logging externo
            this.emit('metrics-update', this.getSystemStatus());
        }, 60000); // Cada minuto
        
        console.log('[CHART] Recolección de métricas activada (1min)');
    }
    
    /**
     * Obtiene estado completo del sistema
     */
    getSystemStatus() {
        const processes = {};
        
        this.processes.forEach((processData, engineKey) => {
            processes[engineKey] = {
                name: processData.config.name,
                port: processData.config.port,
                pid: processData.process.pid,
                healthStatus: processData.healthStatus,
                uptime: Date.now() - processData.startTime,
                restarts: processData.restarts,
                lastHealthCheck: processData.lastHealthCheck
            };
        });
        
        return {
            orchestrator: {
                ...this.state,
                timestamp: new Date().toISOString()
            },
            processes
        };
    }
    
    /**
     * Detiene todos los motores gracefully
     */
    async shutdown() {
        console.log('[STOP] Iniciando shutdown graceful del orquestador...');
        this.isShuttingDown = true;
        this.state.systemStatus = 'SHUTTING_DOWN';
        
        // Detener en orden inverso al startup
        const shutdownSequence = [...this.startupSequence].reverse();
        
        for (const engine of shutdownSequence) {
            const processData = this.processes.get(engine.key);
            if (processData) {
                console.log(`[STOP] Cerrando ${engine.name}...`);
                
                try {
                    processData.process.kill('SIGTERM');
                    
                    // Esperar cierre graceful
                    await Promise.race([
                        new Promise(resolve => processData.process.once('exit', resolve)),
                        this.delay(10000) // Timeout de 10 segundos
                    ]);
                    
                    console.log(`[CHECK] ${engine.name} cerrado correctamente`);
                    
                } catch (error) {
                    console.error(`[X] Error cerrando ${engine.name}:`, error.message);
                    
                    // Force kill si es necesario
                    try {
                        processData.process.kill('SIGKILL');
                    } catch (killError) {
                        console.error(`[X] Error en force kill:`, killError.message);
                    }
                }
            }
        }
        
        console.log('[CHECK] Shutdown del orquestador completado');
        this.emit('orchestrator-shutdown');
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// [ROCKET] INICIALIZAR Y EJECUTAR ORQUESTADOR
async function main() {
    const orchestrator = new QBTCEnginesOrchestrator();
    
    // Configurar manejo de señales de cierre
    process.on('SIGINT', async () => {
        console.log('\n[STOP] SIGINT recibido - iniciando shutdown...');
        await orchestrator.shutdown();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n[STOP] SIGTERM recibido - iniciando shutdown...');
        await orchestrator.shutdown();
        process.exit(0);
    });
    
    // Configurar listeners de eventos
    orchestrator.on('orchestrator-ready', (status) => {
        console.log('[PARTY] ¡Sistema QBTC completamente operativo!');
        console.log(`[CHART] Estado: ${status.orchestrator.healthyEngines}/${status.orchestrator.totalEngines} motores saludables`);
    });
    
    orchestrator.on('engine-failed', ({ engineKey, config }) => {
        console.log(`[BOOM] Motor ${config.name} ha fallado y requiere atención`);
    });
    
    // Iniciar todos los motores
    try {
        await orchestrator.startAllEngines();
    } catch (error) {
        console.error('[X] Error crítico en orquestador:', error.message);
        process.exit(1);
    }
}

// Ejecutar main solo si este es el script principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default QBTCEnginesOrchestrator;
