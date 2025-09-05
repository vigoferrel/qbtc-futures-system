#!/usr/bin/env node

/**
 * LEONARDO QUANTUM LIBERATION LAUNCHER
 * ===================================
 * 
 * Script de orquestación y arranque completo para el sistema Leonardo
 * Gestión de 77 símbolos bajo consciencia cuántica
 * 
 * SERVICIOS GESTIONADOS:
 * 1. Leonardo Quantum Liberation Service (Puerto 14777)
 * 2. Frontend Server (Puerto 14800) 
 * 3. Hermetic Auto-Trader Integration
 * 4. Análisis Engine Services
 * 5. Monitoreo y métricas en tiempo real
 * 
 * MODO DE USO:
 * - npm start              → Modo completo
 * - npm start leonardo     → Solo Leonardo Service
 * - npm start full         → Todos los servicios
 * - npm start monitor      → Solo monitoreo
 */

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del launcher
const LEONARDO_LAUNCHER_CONFIG = {
    name: 'LEONARDO_QUANTUM_LAUNCHER',
    version: '1.0.0',
    motto: 'Orquestador de la liberación cuántica Leonardo',
    maxRetries: 3,
    restartDelay: 5000,
    healthCheckInterval: 10000
};

// Servicios disponibles
const SERVICES = {
    leonardo: {
        name: 'Leonardo Quantum Service',
        script: './core/leonardo-quantum-service.js',
        port: 14777,
        enabled: true,
        essential: true,
        env: { LEONARDO_PORT: 14777, NODE_ENV: 'production' }
    },
    frontend: {
        name: 'Frontend Server',
        script: './frontend-server.js',
        port: 14800,
        enabled: true,
        essential: true,
        env: { PORT: 14800, NODE_ENV: 'production' }
    },
    hermetic: {
        name: 'Hermetic Auto-Trader',
        script: './trading/hermetic-auto-trader-server.js',
        port: 14888,
        enabled: true,
        essential: false,
        env: { PORT: 14888 }
    },
    quantumCore: {
        name: 'Quantum Core Analysis',
        script: './analysis-engine/quantum-core.js',
        port: 14105,
        enabled: true,
        essential: false,
        env: { PORT: 14105 }
    },
    consciousness: {
        name: 'Consciousness Engine',
        script: './analysis-engine/consciousness-engine.js',
        port: 14106,
        enabled: false, // Opcional
        essential: false,
        env: { PORT: 14106 }
    }
};

// Estado del launcher
let launcherState = {
    isRunning: false,
    services: new Map(),
    startTime: null,
    mode: 'full',
    retryCount: new Map(),
    healthChecks: new Map()
};

/**
 * Logging elegante del launcher
 */
function leonardoLog(message, type = 'INFO', service = 'LAUNCHER') {
    const timestamp = new Date().toISOString();
    const symbols = {
        'INFO': '[STAR]',
        'SUCCESS': '[SPARKLES]',
        'WARNING': '[LIGHTNING]',
        'ERROR': '🌋',
        'DEBUG': '[MAGNIFY]',
        'SERVICE': '[TARGET]',
        'HEALTH': '💖'
    };
    
    const symbol = symbols[type] || '[CYCLONE]';
    console.log(`${symbol} [${timestamp}] [${service}] ${message}`);
}

/**
 * Verificar si un puerto está disponible
 */
function checkPortAvailable(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        
        server.on('error', () => resolve(false));
    });
}

/**
 * Verificar salud de un servicio
 */
async function checkServiceHealth(serviceName, config) {
    try {
        const response = await fetch(`http://localhost:${config.port}/`, {
            method: 'GET',
            timeout: 5000
        });
        
        const isHealthy = response.ok;
        launcherState.healthChecks.set(serviceName, {
            healthy: isHealthy,
            lastCheck: Date.now(),
            status: response.status
        });
        
        return isHealthy;
        
    } catch (error) {
        launcherState.healthChecks.set(serviceName, {
            healthy: false,
            lastCheck: Date.now(),
            error: error.message
        });
        return false;
    }
}

/**
 * Iniciar un servicio individual
 */
function startService(serviceName, config) {
    return new Promise((resolve, reject) => {
        leonardoLog(`Iniciando servicio ${config.name}...`, 'SERVICE', serviceName);
        
        const scriptPath = path.resolve(__dirname, config.script);
        
        // Verificar que el script existe
        if (!fs.existsSync(scriptPath)) {
            leonardoLog(`Script no encontrado: ${scriptPath}`, 'ERROR', serviceName);
            reject(new Error(`Script no encontrado: ${scriptPath}`));
            return;
        }
        
        // Spawn del proceso
        const childProcess = spawn('node', [scriptPath], {
            env: { ...process.env, ...config.env },
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: false
        });
        
        // Configurar logging del proceso
        childProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                leonardoLog(line, 'DEBUG', serviceName);
            });
        });
        
        childProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                leonardoLog(line, 'WARNING', serviceName);
            });
        });
        
        // Manejar eventos del proceso
        childProcess.on('spawn', () => {
            leonardoLog(`Proceso ${config.name} iniciado (PID: ${childProcess.pid})`, 'SUCCESS', serviceName);
            
            launcherState.services.set(serviceName, {
                config,
                process: childProcess,
                startTime: Date.now(),
                restarts: launcherState.retryCount.get(serviceName) || 0,
                status: 'STARTING'
            });
            
            // Verificar que el servicio esté listo después de un delay
            setTimeout(async () => {
                const isHealthy = await checkServiceHealth(serviceName, config);
                if (isHealthy) {
                    launcherState.services.get(serviceName).status = 'RUNNING';
                    leonardoLog(`Servicio ${config.name} LISTO en puerto ${config.port}`, 'SUCCESS', serviceName);
                    resolve(childProcess);
                } else if (config.essential) {
                    leonardoLog(`Servicio esencial ${config.name} falló en health check`, 'ERROR', serviceName);
                    reject(new Error(`Health check falló para ${serviceName}`));
                } else {
                    leonardoLog(`Servicio ${config.name} iniciado pero health check falló`, 'WARNING', serviceName);
                    resolve(childProcess);
                }
            }, 3000);
        });
        
        childProcess.on('error', (error) => {
            leonardoLog(`Error en proceso ${config.name}: ${error.message}`, 'ERROR', serviceName);
            reject(error);
        });
        
        childProcess.on('exit', (code, signal) => {
            leonardoLog(`Proceso ${config.name} terminó (code: ${code}, signal: ${signal})`, 'WARNING', serviceName);
            
            const serviceState = launcherState.services.get(serviceName);
            if (serviceState) {
                serviceState.status = 'STOPPED';
                serviceState.exitCode = code;
                serviceState.exitSignal = signal;
            }
            
            // Auto-restart para servicios esenciales
            if (config.essential && launcherState.isRunning) {
                const retries = launcherState.retryCount.get(serviceName) || 0;
                if (retries < LEONARDO_LAUNCHER_CONFIG.maxRetries) {
                    leonardoLog(`Reiniciando servicio esencial ${config.name} (intento ${retries + 1})`, 'WARNING', serviceName);
                    launcherState.retryCount.set(serviceName, retries + 1);
                    
                    setTimeout(() => {
                        startService(serviceName, config).catch(error => {
                            leonardoLog(`Fallo al reiniciar ${serviceName}: ${error.message}`, 'ERROR', serviceName);
                        });
                    }, LEONARDO_LAUNCHER_CONFIG.restartDelay);
                } else {
                    leonardoLog(`Servicio esencial ${config.name} falló después de ${LEONARDO_LAUNCHER_CONFIG.maxRetries} intentos`, 'ERROR', serviceName);
                }
            }
        });
    });
}

/**
 * Detener un servicio
 */
async function stopService(serviceName) {
    const serviceState = launcherState.services.get(serviceName);
    if (!serviceState || !serviceState.process) {
        leonardoLog(`Servicio ${serviceName} no está corriendo`, 'WARNING');
        return;
    }
    
    leonardoLog(`Deteniendo servicio ${serviceState.config.name}...`, 'WARNING', serviceName);
    
    // Intentar terminación graceful
    serviceState.process.kill('SIGTERM');
    
    // Forzar terminación después de 10 segundos
    setTimeout(() => {
        if (serviceState.process && !serviceState.process.killed) {
            leonardoLog(`Forzando terminación de ${serviceName}`, 'WARNING', serviceName);
            serviceState.process.kill('SIGKILL');
        }
    }, 10000);
    
    launcherState.services.delete(serviceName);
}

/**
 * Iniciar servicios según el modo
 */
async function startServices(mode = 'full') {
    leonardoLog(`Iniciando servicios en modo: ${mode.toUpperCase()}`, 'INFO');
    
    let servicesToStart = [];
    
    switch (mode) {
        case 'leonardo':
            servicesToStart = ['leonardo'];
            break;
        case 'full':
        case 'complete':
            servicesToStart = Object.keys(SERVICES).filter(name => SERVICES[name].enabled);
            break;
        case 'essential':
            servicesToStart = Object.keys(SERVICES).filter(name => SERVICES[name].essential);
            break;
        case 'monitor':
            servicesToStart = ['leonardo', 'frontend'];
            break;
        default:
            servicesToStart = Object.keys(SERVICES).filter(name => SERVICES[name].enabled);
    }
    
    leonardoLog(`Servicios seleccionados: ${servicesToStart.join(', ')}`, 'INFO');
    
    // Verificar puertos disponibles
    for (const serviceName of servicesToStart) {
        const config = SERVICES[serviceName];
        const available = await checkPortAvailable(config.port);
        if (!available) {
            leonardoLog(`Puerto ${config.port} no disponible para ${config.name}`, 'WARNING');
            if (config.essential) {
                throw new Error(`Puerto esencial ${config.port} no disponible`);
            }
        }
    }
    
    // Iniciar servicios en orden de prioridad
    const essentialServices = servicesToStart.filter(name => SERVICES[name].essential);
    const optionalServices = servicesToStart.filter(name => !SERVICES[name].essential);
    
    // Primero los servicios esenciales
    for (const serviceName of essentialServices) {
        try {
            await startService(serviceName, SERVICES[serviceName]);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Delay entre servicios
        } catch (error) {
            leonardoLog(`Error iniciando servicio esencial ${serviceName}: ${error.message}`, 'ERROR');
            throw error;
        }
    }
    
    // Luego los servicios opcionales
    for (const serviceName of optionalServices) {
        try {
            await startService(serviceName, SERVICES[serviceName]);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay menor
        } catch (error) {
            leonardoLog(`Error iniciando servicio opcional ${serviceName}: ${error.message}`, 'WARNING');
        }
    }
}

/**
 * Detener todos los servicios
 */
async function stopAllServices() {
    leonardoLog('Deteniendo todos los servicios...', 'WARNING');
    
    const stopPromises = Array.from(launcherState.services.keys()).map(serviceName => 
        stopService(serviceName)
    );
    
    await Promise.all(stopPromises);
    leonardoLog('Todos los servicios detenidos', 'SUCCESS');
}

/**
 * Mostrar estado de los servicios
 */
function showStatus() {
    console.log('\n[STAR] ========== LEONARDO QUANTUM LAUNCHER STATUS ==========');
    console.log(`[SPARKLES] Launcher: ${launcherState.isRunning ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`⏱️  Uptime: ${launcherState.startTime ? ((Date.now() - launcherState.startTime) / 1000 / 60).toFixed(1) + ' minutos' : 'N/A'}`);
    console.log(`[TARGET] Modo: ${launcherState.mode.toUpperCase()}`);
    console.log(`[CHART] Servicios activos: ${launcherState.services.size}`);
    
    console.log('\n[WRENCH] SERVICIOS:');
    Object.entries(SERVICES).forEach(([name, config]) => {
        const serviceState = launcherState.services.get(name);
        const healthCheck = launcherState.healthChecks.get(name);
        
        let statusIcon = '⚫';
        let status = 'DETENIDO';
        
        if (serviceState) {
            switch (serviceState.status) {
                case 'STARTING':
                    statusIcon = '🟡';
                    status = 'INICIANDO';
                    break;
                case 'RUNNING':
                    statusIcon = healthCheck?.healthy ? '🟢' : '🟠';
                    status = healthCheck?.healthy ? 'ACTIVO' : 'PROBLEMAS';
                    break;
                case 'STOPPED':
                    statusIcon = '🔴';
                    status = 'DETENIDO';
                    break;
            }
        }
        
        console.log(`  ${statusIcon} ${config.name} (${name}) - ${status} - Puerto ${config.port}`);
        if (serviceState) {
            const uptime = ((Date.now() - serviceState.startTime) / 1000 / 60).toFixed(1);
            console.log(`     Uptime: ${uptime} min | Reintentos: ${serviceState.restarts}`);
        }
    });
    
    console.log('[STAR] ===================================================\n');
}

/**
 * Inicializar health checks periódicos
 */
function startHealthChecks() {
    setInterval(async () => {
        for (const [serviceName, serviceState] of launcherState.services) {
            if (serviceState.status === 'RUNNING') {
                await checkServiceHealth(serviceName, serviceState.config);
            }
        }
    }, LEONARDO_LAUNCHER_CONFIG.healthCheckInterval);
}

/**
 * Interfaz de línea de comandos
 */
function setupCommandInterface() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('\n[PALETTE] LEONARDO QUANTUM LAUNCHER - Comandos disponibles:');
    console.log('  status    - Mostrar estado de servicios');
    console.log('  start     - Iniciar todos los servicios');
    console.log('  stop      - Detener todos los servicios');
    console.log('  restart   - Reiniciar todos los servicios');
    console.log('  leonardo  - Solo Leonardo service');
    console.log('  help      - Mostrar ayuda');
    console.log('  quit      - Salir del launcher\n');
    
    rl.on('line', async (input) => {
        const command = input.trim().toLowerCase();
        
        switch (command) {
            case 'status':
            case 's':
                showStatus();
                break;
                
            case 'start':
                if (!launcherState.isRunning) {
                    try {
                        await startServices(launcherState.mode);
                        leonardoLog('Todos los servicios iniciados', 'SUCCESS');
                    } catch (error) {
                        leonardoLog(`Error iniciando servicios: ${error.message}`, 'ERROR');
                    }
                } else {
                    leonardoLog('Los servicios ya están corriendo', 'WARNING');
                }
                break;
                
            case 'stop':
                await stopAllServices();
                break;
                
            case 'restart':
                await stopAllServices();
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await startServices(launcherState.mode);
                    leonardoLog('Servicios reiniciados', 'SUCCESS');
                } catch (error) {
                    leonardoLog(`Error reiniciando servicios: ${error.message}`, 'ERROR');
                }
                break;
                
            case 'leonardo':
                await stopAllServices();
                await new Promise(resolve => setTimeout(resolve, 1000));
                try {
                    await startServices('leonardo');
                    launcherState.mode = 'leonardo';
                    leonardoLog('Leonardo service iniciado', 'SUCCESS');
                } catch (error) {
                    leonardoLog(`Error iniciando Leonardo: ${error.message}`, 'ERROR');
                }
                break;
                
            case 'help':
            case 'h':
                setupCommandInterface();
                break;
                
            case 'quit':
            case 'exit':
            case 'q':
                leonardoLog('Cerrando Leonardo Quantum Launcher...', 'WARNING');
                await stopAllServices();
                process.exit(0);
                break;
                
            default:
                leonardoLog(`Comando desconocido: ${command}. Usa 'help' para ver comandos disponibles.`, 'WARNING');
        }
    });
}

/**
 * Manejo de señales del sistema
 */
function setupSignalHandlers() {
    const gracefulShutdown = async (signal) => {
        leonardoLog(`Recibida señal ${signal}. Cerrando Leonardo Quantum Launcher...`, 'WARNING');
        launcherState.isRunning = false;
        await stopAllServices();
        process.exit(0);
    };
    
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    process.on('uncaughtException', (error) => {
        leonardoLog(`Excepción no capturada: ${error.message}`, 'ERROR');
    });
    
    process.on('unhandledRejection', (reason) => {
        leonardoLog(`Rechazo no manejado: ${reason}`, 'ERROR');
    });
}

/**
 * Función principal
 */
async function main() {
    leonardoLog('[STAR] =============================================');
    leonardoLog('[PALETTE] LEONARDO QUANTUM LIBERATION LAUNCHER STARTED');
    leonardoLog('[STAR] =============================================');
    leonardoLog(`[SPARKLES] ${LEONARDO_LAUNCHER_CONFIG.name} v${LEONARDO_LAUNCHER_CONFIG.version}`);
    leonardoLog(`[GALAXY] ${LEONARDO_LAUNCHER_CONFIG.motto}`);
    leonardoLog('[STAR] =============================================\n');
    
    // Configurar estado inicial
    launcherState.startTime = Date.now();
    launcherState.mode = process.argv[2] || 'full';
    launcherState.isRunning = true;
    
    // Configurar handlers
    setupSignalHandlers();
    
    // Iniciar health checks
    startHealthChecks();
    
    try {
        // Iniciar servicios
        await startServices(launcherState.mode);
        leonardoLog(`Sistema Leonardo iniciado exitosamente en modo ${launcherState.mode.toUpperCase()}`, 'SUCCESS');
        
        // Mostrar estado inicial
        setTimeout(showStatus, 2000);
        
        // Configurar interfaz de comandos
        setTimeout(setupCommandInterface, 3000);
        
    } catch (error) {
        leonardoLog(`Error crítico al iniciar: ${error.message}`, 'ERROR');
        leonardoLog('Deteniendo servicios parcialmente iniciados...', 'WARNING');
        await stopAllServices();
        process.exit(1);
    }
}

// Ejecutar launcher
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        leonardoLog(`Error fatal en launcher: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

export {
    LEONARDO_LAUNCHER_CONFIG,
    SERVICES,
    launcherState,
    startServices,
    stopAllServices,
    showStatus
};
