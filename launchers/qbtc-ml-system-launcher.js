#!/usr/bin/env node

/**
 * 🚀 QBTC ML SYSTEM LAUNCHER
 * =========================
 * 
 * Launcher para ejecutar el Sistema ML Unificado QBTC en segundo plano
 * con monitoreo de métricas de desempeño y lógica para depuración de errores.
 * 
 * FUNCIONALIDADES:
 * - Ejecuta el sistema en proceso background
 * - Monitoreo continuo de métricas de desempeño  
 * - Sistema de logs detallados para debug
 * - Auto-restart en caso de errores
 * - Interfaz de control por CLI
 * - Reportes de estado en tiempo real
 * - Integración con el kernel del sistema
 */

import { spawn, fork } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import QBTCUnifiedMLSystem from '../ml/qbtc-unified-ml-system.js';
import QuantumDataPurifier from '../core/quantum-data-purifier.js';

export class QBTCMLSystemLauncher extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.serviceName = 'QBTC ML System Launcher';
        this.version = '2.0.0-production';
        this.startTime = new Date();
        
        this.config = {
            // Launch Configuration
            runInBackground: config.runInBackground !== false,
            autoRestart: config.autoRestart !== false,
            maxRestarts: config.maxRestarts || 5,
            restartDelay: config.restartDelay || 5000, // 5 seconds
            
            // Monitoring Configuration  
            metricsUpdateInterval: config.metricsUpdateInterval || 30000, // 30 seconds
            healthCheckInterval: config.healthCheckInterval || 10000, // 10 seconds
            performanceThreshold: config.performanceThreshold || 0.8, // 80% CPU/Memory
            
            // Logging Configuration
            enableDetailedLogs: config.enableDetailedLogs !== false,
            logLevel: config.logLevel || 'INFO', // DEBUG, INFO, WARN, ERROR
            logRotation: config.logRotation || true,
            maxLogSize: config.maxLogSize || 10485760, // 10MB
            maxLogFiles: config.maxLogFiles || 5,
            
            // System Integration
            useKernelMetrics: config.useKernelMetrics !== false,
            quantumRandomization: config.quantumRandomization !== false,
            systemResourceMonitoring: config.systemResourceMonitoring !== false,
            
            // ML System Configuration
            mlSystemPort: config.mlSystemPort || 14700,
            enableAutoML: config.enableAutoML !== false,
            trainingInBackground: config.trainingInBackground !== false
        };
        
        // Process Management
        this.mlSystemProcess = null;
        this.mlSystemInstance = null;
        this.processState = 'stopped';
        this.restartCount = 0;
        this.lastError = null;
        
        // Performance Monitoring
        this.performanceMetrics = {
            cpuUsage: 0,
            memoryUsage: 0,
            processUptime: 0,
            systemLoad: 0,
            quantumEntropy: 0,
            networkConnections: 0,
            trainingJobs: 0,
            predictionsPerSecond: 0
        };
        
        // System State
        this.systemState = {
            isHealthy: false,
            lastHealthCheck: null,
            consecutiveErrors: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            quantumCoherence: 0
        };
        
        // Logging
        this.logBuffer = [];
        this.logStream = null;
        this.quantumPurifier = new QuantumDataPurifier();
        
        // Directories
        this.logsDir = path.join(process.cwd(), 'logs', 'ml-system');
        this.metricsDir = path.join(process.cwd(), 'metrics');
        
        console.log('[ML-LAUNCHER] 🚀 QBTC ML System Launcher inicializado');
        console.log(`📊 Metrics Update Interval: ${this.config.metricsUpdateInterval}ms`);
        console.log(`🔄 Auto Restart: ${this.config.autoRestart ? 'Enabled' : 'Disabled'}`);
        console.log(`📝 Detailed Logs: ${this.config.enableDetailedLogs ? 'Enabled' : 'Disabled'}`);
    }
    
    /**
     * Inicializa el launcher
     */
    async initialize() {
        console.log('[ML-LAUNCHER] 🔧 Inicializando launcher...');
        
        try {
            // Crear directorios necesarios
            await this.createDirectories();
            
            // Configurar logging system
            await this.setupLoggingSystem();
            
            // Configurar monitoreo de performance
            this.setupPerformanceMonitoring();
            
            // Configurar health checks
            this.setupHealthChecks();
            
            // Configurar CLI commands
            this.setupCLICommands();
            
            this.log('info', 'Launcher inicializado exitosamente');
            
            return { success: true, message: 'Launcher ready' };
            
        } catch (error) {
            this.log('error', `Error inicializando launcher: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Crea los directorios necesarios
     */
    async createDirectories() {
        const dirs = [this.logsDir, this.metricsDir];
        
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log('debug', `Directorio creado: ${dir}`);
            }
        }
    }
    
    /**
     * Configura el sistema de logging
     */
    async setupLoggingSystem() {
        const logFile = path.join(this.logsDir, `ml-system-${new Date().toISOString().split('T')[0]}.log`);
        
        // Crear stream de logs
        this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
        
        // Configurar rotación de logs si está habilitada
        if (this.config.logRotation) {
            this.setupLogRotation();
        }
        
        this.log('info', 'Sistema de logging configurado');
    }
    
    /**
     * Configura rotación de logs
     */
    setupLogRotation() {
        setInterval(() => {
            this.rotateLogsIfNeeded();
        }, 3600000); // Cada hora
    }
    
    /**
     * Rota logs si es necesario
     */
    async rotateLogsIfNeeded() {
        const logFiles = fs.readdirSync(this.logsDir);
        
        for (const file of logFiles) {
            const filePath = path.join(this.logsDir, file);
            const stats = fs.statSync(filePath);
            
            // Rotar si el archivo es muy grande
            if (stats.size > this.config.maxLogSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFile = path.join(this.logsDir, `${file}.${timestamp}`);
                
                fs.renameSync(filePath, rotatedFile);
                this.log('info', `Log rotado: ${file} -> ${rotatedFile}`);
                
                // Eliminar logs antiguos si hay demasiados
                this.cleanupOldLogs();
            }
        }
    }
    
    /**
     * Limpia logs antiguos
     */
    cleanupOldLogs() {
        const logFiles = fs.readdirSync(this.logsDir)
            .map(file => ({
                name: file,
                path: path.join(this.logsDir, file),
                time: fs.statSync(path.join(this.logsDir, file)).mtime
            }))
            .sort((a, b) => b.time - a.time);
        
        // Eliminar archivos excedentes
        if (logFiles.length > this.config.maxLogFiles) {
            const filesToDelete = logFiles.slice(this.config.maxLogFiles);
            
            for (const file of filesToDelete) {
                fs.unlinkSync(file.path);
                this.log('info', `Log antiguo eliminado: ${file.name}`);
            }
        }
    }
    
    /**
     * Configura monitoreo de performance
     */
    setupPerformanceMonitoring() {
        this.log('info', 'Configurando monitoreo de performance...');
        
        // Monitoreo de métricas del sistema
        setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.metricsUpdateInterval);
        
        // Monitoreo de recursos del kernel
        if (this.config.useKernelMetrics) {
            setInterval(() => {
                this.collectKernelMetrics();
            }, this.config.metricsUpdateInterval / 2);
        }
        
        // Generar entropía cuántica
        if (this.config.quantumRandomization) {
            setInterval(() => {
                this.generateQuantumEntropy();
            }, 15000);
        }
    }
    
    /**
     * Recolecta métricas del sistema
     */
    async collectSystemMetrics() {
        try {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            
            // Actualizar métricas
            this.performanceMetrics.memoryUsage = Math.round((memUsage.rss / 1024 / 1024) * 100) / 100; // MB
            this.performanceMetrics.processUptime = Math.round(process.uptime());
            
            // Obtener load average (solo en sistemas Unix)
            if (os.loadavg) {
                this.performanceMetrics.systemLoad = os.loadavg()[0];
            }
            
            // Generar hash cuántico basado en métricas del sistema
            const systemData = JSON.stringify({
                freeMem: os.freemem(),
                totalMem: os.totalmem(),
                uptime: os.uptime(),
                timestamp: Date.now()
            });
            
            const quantumHash = crypto.createHash('sha256')
                .update(systemData + this.quantumPurifier.generateQuantumValue())
                .digest('hex');
                
            this.performanceMetrics.quantumEntropy = parseInt(quantumHash.slice(0, 8), 16) / 0xffffffff;
            
            // Log métricas si están por encima del umbral
            if (this.performanceMetrics.memoryUsage > this.config.performanceThreshold * 1000 || 
                this.performanceMetrics.systemLoad > this.config.performanceThreshold * 4) {
                
                this.log('warn', `High resource usage detected: Memory=${this.performanceMetrics.memoryUsage}MB, Load=${this.performanceMetrics.systemLoad}`);
            }
            
        } catch (error) {
            this.log('error', `Error collecting system metrics: ${error.message}`);
        }
    }
    
    /**
     * Recolecta métricas del kernel
     */
    async collectKernelMetrics() {
        if (process.platform === 'linux') {
            try {
                // Leer estadísticas del kernel desde /proc
                const loadavg = fs.readFileSync('/proc/loadavg', 'utf8').trim().split(' ')[0];
                const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
                
                // Parsear información de memoria
                const memTotal = meminfo.match(/MemTotal:\s+(\d+)\s+kB/);
                const memFree = meminfo.match(/MemFree:\s+(\d+)\s+kB/);
                
                if (memTotal && memFree) {
                    const totalMem = parseInt(memTotal[1]) * 1024; // Convertir a bytes
                    const freeMem = parseInt(memFree[1]) * 1024;
                    const usedMem = totalMem - freeMem;
                    
                    this.performanceMetrics.memoryUsage = Math.round((usedMem / 1024 / 1024) * 100) / 100;
                }
                
                this.performanceMetrics.systemLoad = parseFloat(loadavg);
                
            } catch (error) {
                this.log('debug', `Unable to read kernel metrics: ${error.message}`);
            }
        }
    }
    
    /**
     * Genera entropía cuántica usando el sistema
     */
    generateQuantumEntropy() {
        try {
            // Generar entropía basada en métricas del sistema
            const entropy = this.quantumPurifier.generateQuantumValue();
            
            // Aplicar transformaciones cuánticas
            const phase = (entropy * 2 * Math.PI) % (2 * Math.PI);
            const amplitude = Math.sin(phase) * Math.cos(phase * entropy);
            
            this.performanceMetrics.quantumEntropy = Math.abs(amplitude);
            
            // Actualizar coherencia cuántica del sistema
            this.systemState.quantumCoherence = 
                (this.systemState.quantumCoherence * 0.9 + entropy * 0.1);
            
        } catch (error) {
            this.log('error', `Error generating quantum entropy: ${error.message}`);
        }
    }
    
    /**
     * Configura health checks
     */
    setupHealthChecks() {
        this.log('info', 'Configurando health checks...');
        
        setInterval(async () => {
            await this.performHealthCheck();
        }, this.config.healthCheckInterval);
    }
    
    /**
     * Realiza health check del sistema ML
     */
    async performHealthCheck() {
        try {
            this.systemState.lastHealthCheck = new Date();
            
            if (!this.mlSystemInstance) {
                this.systemState.isHealthy = false;
                return;
            }
            
            // Verificar si el sistema ML está respondiendo
            const systemStatus = this.mlSystemInstance.getSystemStatus();
            
            if (systemStatus && systemStatus.service.status === 'operational') {
                this.systemState.isHealthy = true;
                this.systemState.consecutiveErrors = 0;
                
                // Actualizar métricas del sistema ML
                this.performanceMetrics.trainingJobs = systemStatus.training.queue + systemStatus.training.active.length;
                
            } else {
                this.systemState.isHealthy = false;
                this.systemState.consecutiveErrors++;
                
                this.log('warn', `Health check failed. Consecutive errors: ${this.systemState.consecutiveErrors}`);
                
                // Auto-restart si hay demasiados errores consecutivos
                if (this.systemState.consecutiveErrors >= 3 && this.config.autoRestart) {
                    this.log('warn', 'Attempting auto-restart due to consecutive health check failures');
                    await this.restart();
                }
            }
            
        } catch (error) {
            this.systemState.isHealthy = false;
            this.systemState.consecutiveErrors++;
            this.log('error', `Health check error: ${error.message}`);
        }
    }
    
    /**
     * Configura comandos CLI
     */
    setupCLICommands() {
        this.log('info', 'Configurando comandos CLI...');
        
        // Manejar señales del sistema
        process.on('SIGINT', async () => {
            this.log('info', 'SIGINT received, shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            this.log('info', 'SIGTERM received, shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });
        
        // Configurar interfaz CLI básica
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            
            process.stdin.on('data', (key) => {
                this.handleCLIInput(key);
            });
        }
    }
    
    /**
     * Maneja input de CLI
     */
    async handleCLIInput(key) {
        if (key === '\u0003') { // Ctrl+C
            await this.stop();
            process.exit(0);
        } else if (key === 'r') {
            console.log('\n[ML-LAUNCHER] 🔄 Restarting ML System...');
            await this.restart();
        } else if (key === 's') {
            this.displayStatus();
        } else if (key === 'h') {
            this.displayHelp();
        }
    }
    
    /**
     * Muestra ayuda de CLI
     */
    displayHelp() {
        console.log('\n🎛️ === QBTC ML SYSTEM LAUNCHER - CLI COMMANDS ===');
        console.log('r - Restart ML System');
        console.log('s - Display Status');
        console.log('h - Show this Help');
        console.log('Ctrl+C - Shutdown');
        console.log('================================================\n');
    }
    
    /**
     * Muestra estado del sistema
     */
    displayStatus() {
        console.log('\n📊 === QBTC ML SYSTEM STATUS ===');
        console.log(`🚀 Process State: ${this.processState.toUpperCase()}`);
        console.log(`❤️ Health Status: ${this.systemState.isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
        console.log(`🔄 Restart Count: ${this.restartCount}/${this.config.maxRestarts}`);
        console.log(`⏱️ Uptime: ${Math.floor(this.performanceMetrics.processUptime / 60)}m ${this.performanceMetrics.processUptime % 60}s`);
        
        console.log('\n📈 Performance Metrics:');
        console.log(`  Memory Usage: ${this.performanceMetrics.memoryUsage} MB`);
        console.log(`  System Load: ${this.performanceMetrics.systemLoad.toFixed(2)}`);
        console.log(`  Training Jobs: ${this.performanceMetrics.trainingJobs}`);
        console.log(`  Quantum Entropy: ${(this.performanceMetrics.quantumEntropy * 100).toFixed(1)}%`);
        console.log(`  Quantum Coherence: ${(this.systemState.quantumCoherence * 100).toFixed(1)}%`);
        
        if (this.lastError) {
            console.log(`\n⚠️ Last Error: ${this.lastError}`);
        }
        
        console.log('=================================\n');
    }
    
    /**
     * Inicia el sistema ML
     */
    async start() {
        this.log('info', 'Iniciando QBTC ML System...');
        
        try {
            if (this.processState === 'running') {
                this.log('warn', 'Sistema ML ya está ejecutándose');
                return;
            }
            
            this.processState = 'starting';
            
            if (this.config.runInBackground) {
                await this.startInBackground();
            } else {
                await this.startInForeground();
            }
            
            // Esperar a que el sistema esté listo
            await this.waitForSystemReady();
            
            this.processState = 'running';
            this.log('info', 'Sistema ML iniciado exitosamente');
            
            this.emit('system-started');
            
        } catch (error) {
            this.processState = 'error';
            this.lastError = error.message;
            this.log('error', `Error iniciando sistema ML: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Inicia el sistema en segundo plano
     */
    async startInBackground() {
        this.log('info', 'Iniciando en modo background...');
        
        // Crear instancia del sistema ML
        this.mlSystemInstance = new QBTCUnifiedMLSystem({
            port: this.config.mlSystemPort,
            enableWebSocket: true,
            autoTraining: this.config.enableAutoML,
            runInBackground: true
        });
        
        // Configurar event listeners
        this.mlSystemInstance.on('ml-system-ready', () => {
            this.log('info', 'Sistema ML completamente operacional');
        });
        
        this.mlSystemInstance.on('error', (error) => {
            this.log('error', `Error en sistema ML: ${error.message}`);
            this.lastError = error.message;
        });
        
        // Inicializar sistema ML
        await this.mlSystemInstance.initialize();
        
        this.log('info', `Sistema ML ejecutándose en puerto ${this.config.mlSystemPort}`);
    }
    
    /**
     * Inicia el sistema en primer plano (deprecated para production)
     */
    async startInForeground() {
        this.log('debug', 'Iniciando en modo foreground (desarrollo solamente)');
        
        // Fork del proceso principal
        this.mlSystemProcess = fork(path.join(__dirname, '../ml/qbtc-unified-ml-system.js'), [], {
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                ML_SYSTEM_PORT: this.config.mlSystemPort
            }
        });
        
        // Configurar handlers del proceso
        this.mlSystemProcess.on('message', (message) => {
            this.log('debug', `Message from ML System: ${JSON.stringify(message)}`);
        });
        
        this.mlSystemProcess.on('error', (error) => {
            this.log('error', `ML System process error: ${error.message}`);
            this.lastError = error.message;
        });
        
        this.mlSystemProcess.on('exit', (code, signal) => {
            this.log('info', `ML System process exited with code ${code}, signal ${signal}`);
            this.processState = 'stopped';
            
            // Auto-restart si está configurado
            if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
                setTimeout(() => {
                    this.restart();
                }, this.config.restartDelay);
            }
        });
    }
    
    /**
     * Espera a que el sistema esté listo
     */
    async waitForSystemReady() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Sistema ML no responde en el tiempo esperado'));
            }, 30000); // 30 segundos timeout
            
            const checkReady = () => {
                if (this.mlSystemInstance && this.mlSystemInstance.pipeline.status === 'operational') {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkReady, 1000);
                }
            };
            
            checkReady();
        });
    }
    
    /**
     * Para el sistema ML
     */
    async stop() {
        this.log('info', 'Deteniendo sistema ML...');
        
        try {
            this.processState = 'stopping';
            
            if (this.mlSystemInstance) {
                // Graceful shutdown
                this.log('info', 'Cerrando instancia del sistema ML...');
                
                // Generar reporte final
                this.mlSystemInstance.generateReport();
                
                this.mlSystemInstance = null;
            }
            
            if (this.mlSystemProcess) {
                this.log('info', 'Terminando proceso del sistema ML...');
                
                this.mlSystemProcess.kill('SIGTERM');
                this.mlSystemProcess = null;
            }
            
            this.processState = 'stopped';
            this.log('info', 'Sistema ML detenido exitosamente');
            
            this.emit('system-stopped');
            
        } catch (error) {
            this.log('error', `Error deteniendo sistema ML: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Reinicia el sistema ML
     */
    async restart() {
        this.log('info', 'Reiniciando sistema ML...');
        
        try {
            this.restartCount++;
            
            if (this.restartCount > this.config.maxRestarts) {
                this.log('error', `Máximo de reintentos alcanzado (${this.config.maxRestarts})`);
                throw new Error('Maximum restart attempts reached');
            }
            
            await this.stop();
            
            // Delay antes del restart
            if (this.config.restartDelay > 0) {
                this.log('info', `Esperando ${this.config.restartDelay}ms antes de reiniciar...`);
                await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
            }
            
            await this.start();
            
            this.log('info', `Sistema ML reiniciado exitosamente (intento ${this.restartCount})`);
            
        } catch (error) {
            this.log('error', `Error reiniciando sistema ML: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Registra mensaje en el log
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] [ML-LAUNCHER] ${message}`;
        
        // Agregar al buffer
        this.logBuffer.push(logEntry);
        
        // Escribir al archivo si hay stream
        if (this.logStream) {
            this.logStream.write(logEntry + '\n');
        }
        
        // Mostrar en consola según nivel
        if (this.shouldLogToConsole(level)) {
            const coloredEntry = this.colorizeLogEntry(level, logEntry);
            console.log(colorizedEntry);
        }
        
        // Mantener buffer limitado
        if (this.logBuffer.length > 1000) {
            this.logBuffer = this.logBuffer.slice(-500);
        }
    }
    
    /**
     * Determina si debe mostrar en consola
     */
    shouldLogToConsole(level) {
        const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const currentLevel = levels.indexOf(this.config.logLevel);
        const messageLevel = levels.indexOf(level.toUpperCase());
        
        return messageLevel >= currentLevel;
    }
    
    /**
     * Coloriza entrada de log
     */
    colorizeLogEntry(level, entry) {
        const colors = {
            DEBUG: '\x1b[36m',    // Cyan
            INFO: '\x1b[32m',     // Green  
            WARN: '\x1b[33m',     // Yellow
            ERROR: '\x1b[31m',    // Red
            RESET: '\x1b[0m'      // Reset
        };
        
        const color = colors[level.toUpperCase()] || colors.INFO;
        return color + entry + colors.RESET;
    }
    
    /**
     * Guarda métricas en archivo
     */
    async saveMetrics() {
        try {
            const metricsFile = path.join(this.metricsDir, `ml-system-metrics-${Date.now()}.json`);
            
            const metricsData = {
                timestamp: new Date().toISOString(),
                launcher: {
                    version: this.version,
                    uptime: Date.now() - this.startTime.getTime(),
                    processState: this.processState,
                    restartCount: this.restartCount
                },
                performance: this.performanceMetrics,
                system: this.systemState,
                mlSystem: this.mlSystemInstance ? this.mlSystemInstance.getSystemStatus() : null
            };
            
            fs.writeFileSync(metricsFile, JSON.stringify(metricsData, null, 2));
            this.log('debug', `Métricas guardadas en ${metricsFile}`);
            
        } catch (error) {
            this.log('error', `Error guardando métricas: ${error.message}`);
        }
    }
    
    /**
     * Genera reporte completo del launcher
     */
    generateReport() {
        console.log('\n🚀 === QBTC ML SYSTEM LAUNCHER REPORT ===');
        console.log(`🌐 Service: ${this.serviceName} v${this.version}`);
        console.log(`📊 Process State: ${this.processState.toUpperCase()}`);
        console.log(`⏱️ Launcher Uptime: ${Math.floor((Date.now() - this.startTime.getTime()) / 1000)}s`);
        console.log(`🔄 Restart Count: ${this.restartCount}/${this.config.maxRestarts}`);
        console.log(`❤️ System Health: ${this.systemState.isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
        
        console.log('\n⚙️ Configuration:');
        console.log(`  Background Mode: ${this.config.runInBackground ? 'Enabled' : 'Disabled'}`);
        console.log(`  Auto Restart: ${this.config.autoRestart ? 'Enabled' : 'Disabled'}`);
        console.log(`  Log Level: ${this.config.logLevel}`);
        console.log(`  ML System Port: ${this.config.mlSystemPort}`);
        console.log(`  AutoML: ${this.config.enableAutoML ? 'Enabled' : 'Disabled'}`);
        
        console.log('\n📊 Performance Metrics:');
        console.log(`  Memory Usage: ${this.performanceMetrics.memoryUsage} MB`);
        console.log(`  System Load: ${this.performanceMetrics.systemLoad.toFixed(2)}`);
        console.log(`  Process Uptime: ${this.performanceMetrics.processUptime}s`);
        console.log(`  Training Jobs: ${this.performanceMetrics.trainingJobs}`);
        console.log(`  Quantum Entropy: ${(this.performanceMetrics.quantumEntropy * 100).toFixed(1)}%`);
        
        console.log('\n🔍 System State:');
        console.log(`  Health Status: ${this.systemState.isHealthy ? 'OK' : 'FAILED'}`);
        console.log(`  Last Health Check: ${this.systemState.lastHealthCheck || 'Never'}`);
        console.log(`  Consecutive Errors: ${this.systemState.consecutiveErrors}`);
        console.log(`  Quantum Coherence: ${(this.systemState.quantumCoherence * 100).toFixed(1)}%`);
        
        if (this.lastError) {
            console.log(`\n⚠️ Last Error: ${this.lastError}`);
        }
        
        console.log('=========================================\n');
        
        // Generar reporte del sistema ML si está activo
        if (this.mlSystemInstance) {
            this.mlSystemInstance.generateReport();
        }
    }
}

// Main execution cuando se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Iniciando QBTC ML System Launcher...\n');
    
    const launcher = new QBTCMLSystemLauncher({
        runInBackground: true,
        enableDetailedLogs: true,
        autoRestart: true,
        maxRestarts: 3
    });
    
    // Inicializar y ejecutar
    launcher.initialize().then(async () => {
        console.log('✅ Launcher inicializado. Iniciando sistema ML...\n');
        
        await launcher.start();
        
        console.log('🎯 Sistema ML operacional. Presiona "h" para ayuda.\n');
        
        // Guardar métricas cada 5 minutos
        setInterval(() => {
            launcher.saveMetrics();
        }, 300000);
        
        // Mostrar estado cada 2 minutos
        setInterval(() => {
            launcher.displayStatus();
        }, 120000);
        
        // Generar reporte completo cada 10 minutos
        setInterval(() => {
            launcher.generateReport();
        }, 600000);
        
    }).catch(error => {
        console.error(`❌ Error fatal: ${error.message}`);
        process.exit(1);
    });
}

export default QBTCMLSystemLauncher;
