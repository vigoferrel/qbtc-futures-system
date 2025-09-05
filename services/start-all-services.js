#!/usr/bin/env node

/**
 * [ROCKET] MASTER SERVICE LAUNCHER
 * =========================
 * 
 * Script maestro para iniciar todos los servicios HTTP del sistema
 * de forma coordinada y ordenada
 * 
 * Servicios incluidos:
 * - 14102: Temporal Cycles Engine Service
 * - 14103: Multidimensional Weighting Engine Service  
 * - 14104: Tier Strategy Generator Service
 * - 14105: Consolidated Opportunities API Service
 * - 14101: Unified System Monitor (opcional)
 * 
 * Uso:
 * - node start-all-services.js                    # Iniciar todos los servicios
 * - node start-all-services.js --exclude=14101    # Excluir monitor unificado
 * - node start-all-services.js --only=14102,14103 # Solo servicios específicos
 * - node start-all-services.js --delay=2000       # Retraso entre inicios (ms)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de servicios (actualizada con archivos reales)
const SERVICES = {
    'temporal-cycles': {
        port: 14102,
        script: 'temporal-cycles-engine-service.js',
        name: '[MOON] Temporal Cycles Engine',
        description: 'Motor de análisis de ciclos temporales y fases lunares',
        priority: 1
    },
    'multidimensional-weighting': {
        port: 14103,
        script: 'multidimensional-weighting-service.js',
        name: '[DIAMOND] Multidimensional Weighting Engine',
        description: 'Motor de ponderación multidimensional adaptativa',
        priority: 2
    },
    'tier-strategy': {
        port: 14104,
        script: 'tier-strategy-service.js',
        name: '[TARGET] Tier Strategy Generator',
        description: 'Generador de estrategias por tiers',
        priority: 3
    },
    'consolidated-opportunities': {
        port: 14107,
        script: 'consolidated-opportunities-service.js',
        name: '[REFRESH] Consolidated Opportunities API',
        description: 'API consolidada de oportunidades de trading',
        priority: 4
    },
    'multi-timeframe-confluence': {
        port: 3003,
        script: 'enhanced-multitimeframe-service.js',
        name: '[CHART] Enhanced Multi-Timeframe Confluence',
        description: 'Motor de confluencia multi-timeframe avanzado',
        priority: 5
    },
    'master-control-hub': {
        port: 14001,
        script: 'master-control-hub-service.js',
        name: '[CONTROL_KNOBS] Master Control Hub',
        description: 'Cerebro coordinador de la metaconciencia QBTC',
        priority: 6
    }
};

// Variables globales
const runningProcesses = new Map();
let isShuttingDown = false;
let startupDelay = 2000; // 2 segundos entre inicios por defecto

// [MEMO] FUNCIONES DE UTILIDAD
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        exclude: [],
        only: [],
        delay: 2000,
        monitor: true,
        verbose: false
    };
    
    args.forEach(arg => {
        if (arg.startsWith('--exclude=')) {
            options.exclude = arg.split('=')[1].split(',').map(s => parseInt(s.trim()));
        } else if (arg.startsWith('--only=')) {
            options.only = arg.split('=')[1].split(',').map(s => parseInt(s.trim()));
        } else if (arg.startsWith('--delay=')) {
            options.delay = parseInt(arg.split('=')[1]);
        } else if (arg === '--no-monitor') {
            options.monitor = false;
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        }
    });
    
    return options;
}

function showHelp() {
    console.log(`
[ROCKET] MASTER SERVICE LAUNCHER - Help
================================

Uso: node start-all-services.js [opciones]

Opciones:
  --exclude=PORTS    Excluir servicios por puerto (ej: --exclude=14101,14102)
  --only=PORTS       Solo iniciar servicios específicos (ej: --only=14103,14104)
  --delay=MS         Retraso entre inicios en milisegundos (por defecto: 2000)
  --no-monitor       No incluir el monitor unificado automáticamente
  --verbose, -v      Mostrar salida detallada de cada servicio
  --help, -h         Mostrar esta ayuda

Servicios disponibles:
`);
    
    Object.entries(SERVICES).forEach(([key, service]) => {
        console.log(`  ${service.port}: ${service.name}`);
        console.log(`         ${service.description}`);
    });
    
    console.log(`
Ejemplos:
  node start-all-services.js
    # Iniciar todos los servicios con configuración por defecto
    
  node start-all-services.js --exclude=14101 --delay=3000
    # Iniciar todos excepto el monitor, con 3 segundos de retraso
    
  node start-all-services.js --only=14102,14103 --verbose
    # Solo iniciar los motores temporal y de ponderación con salida detallada
`);
}

// [ROCKET] FUNCIONES DE GESTIÓN DE SERVICIOS
function getServicesToStart(options) {
    let services = Object.entries(SERVICES);
    
    // Filtrar por 'only' si está especificado
    if (options.only.length > 0) {
        services = services.filter(([key, service]) => 
            options.only.includes(service.port)
        );
    }
    
    // Excluir servicios especificados
    if (options.exclude.length > 0) {
        services = services.filter(([key, service]) => 
            !options.exclude.includes(service.port)
        );
    }
    
    // Excluir monitor si está deshabilitado
    if (!options.monitor) {
        services = services.filter(([key, service]) => 
            service.port !== 14101
        );
    }
    
    // Ordenar por prioridad
    services.sort((a, b) => a[1].priority - b[1].priority);
    
    return services;
}

async function startService(serviceKey, serviceConfig, options) {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, serviceConfig.script);
        
        console.log(`[WRENCH] Iniciando ${serviceConfig.name} en puerto ${serviceConfig.port}...`);
        
        const childProcess = spawn('node', [scriptPath], {
            stdio: options.verbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
            env: { 
                ...process.env,
                NODE_ENV: process.env.NODE_ENV || 'development',
                SERVICE_NAME: serviceKey,
                SERVICE_PORT: serviceConfig.port.toString()
            }
        });
        
        runningProcesses.set(serviceKey, {
            process: childProcess,
            config: serviceConfig,
            startTime: new Date(),
            status: 'starting'
        });
        
        let startupOutput = '';
        
        if (!options.verbose) {
            childProcess.stdout?.on('data', (data) => {
                startupOutput += data.toString();
                // Buscar indicadores de éxito
                if (data.toString().includes('Service started') || 
                    data.toString().includes('started on port')) {
                    runningProcesses.get(serviceKey).status = 'running';
                    console.log(`[CHECK] ${serviceConfig.name} iniciado correctamente`);
                    resolve();
                }
            });
            
            childProcess.stderr?.on('data', (data) => {
                const errorMsg = data.toString();
                if (!errorMsg.includes('Warning') && !errorMsg.includes('Deprecation')) {
                    console.error(`[X] Error en ${serviceConfig.name}:`, errorMsg);
                }
            });
        }
        
        childProcess.on('error', (error) => {
            console.error(`[X] Error iniciando ${serviceConfig.name}:`, error.message);
            runningProcesses.delete(serviceKey);
            resolve();
        });
        
        childProcess.on('exit', (code, signal) => {
            if (!isShuttingDown) {
                console.log(`[WARNING] ${serviceConfig.name} terminó inesperadamente (código: ${code}, señal: ${signal})`);
                runningProcesses.delete(serviceKey);
            }
        });
        
        // Timeout para servicios que no envían confirmación
        setTimeout(() => {
            if (runningProcesses.has(serviceKey)) {
                const status = runningProcesses.get(serviceKey);
                if (status.status === 'starting') {
                    status.status = 'running';
                    console.log(`⏱️ ${serviceConfig.name} asumido como iniciado (timeout)`);
                }
            }
            resolve();
        }, 10000); // 10 segundos timeout
    });
}

async function waitForServicesHealth(services) {
    console.log('\n[HOSPITAL] Verificando salud de los servicios...');
    
    for (const [serviceKey, serviceConfig] of services) {
        if (runningProcesses.has(serviceKey)) {
            try {
                const response = await fetch(`http://localhost:${serviceConfig.port}/health`);
                if (response.ok) {
                    const health = await response.json();
                    console.log(`[CHECK] ${serviceConfig.name}: ${health.status}`);
                } else {
                    console.log(`[WARNING] ${serviceConfig.name}: Health check failed`);
                }
            } catch (error) {
                console.log(`[X] ${serviceConfig.name}: No responde (${error.message})`);
            }
        }
    }
}

function showSystemStatus() {
    console.log('\n[CHART] ESTADO ACTUAL DEL SISTEMA');
    console.log('============================');
    
    runningProcesses.forEach((serviceInfo, serviceKey) => {
        const uptime = Math.floor((Date.now() - serviceInfo.startTime.getTime()) / 1000);
        console.log(`${serviceInfo.config.name}:`);
        console.log(`   Puerto: ${serviceInfo.config.port}`);
        console.log(`   Estado: ${serviceInfo.status}`);
        console.log(`   Uptime: ${uptime}s`);
        console.log(`   PID: ${serviceInfo.process.pid}`);
        console.log();
    });
}

async function gracefulShutdown() {
    if (isShuttingDown) return;
    
    isShuttingDown = true;
    console.log('\n[STOP] Iniciando cierre graceful de todos los servicios...');
    
    const shutdownPromises = [];
    
    runningProcesses.forEach((serviceInfo, serviceKey) => {
        console.log(`[REFRESH] Cerrando ${serviceInfo.config.name}...`);
        
        const shutdownPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.log(`[WARNING] Forzando cierre de ${serviceInfo.config.name}`);
                serviceInfo.process.kill('SIGKILL');
                resolve();
            }, 10000); // 10 segundos timeout
            
            serviceInfo.process.on('exit', () => {
                clearTimeout(timeout);
                console.log(`[CHECK] ${serviceInfo.config.name} cerrado`);
                resolve();
            });
            
            // Enviar señal de cierre graceful
            serviceInfo.process.kill('SIGTERM');
        });
        
        shutdownPromises.push(shutdownPromise);
    });
    
    await Promise.all(shutdownPromises);
    console.log('[CHECK] Todos los servicios han sido cerrados correctamente');
    process.exit(0);
}

// [ROCKET] FUNCIÓN PRINCIPAL
async function main() {
    console.log('[ROCKET] =============== MASTER SERVICE LAUNCHER ===============');
    console.log('Iniciando sistema de servicios HTTP QBTC Futures...\n');
    
    const options = parseArgs();
    const services = getServicesToStart(options);
    
    startupDelay = options.delay;
    
    console.log(`[CLIPBOARD] Servicios seleccionados para inicio:`);
    services.forEach(([key, service]) => {
        console.log(`   • ${service.name} (puerto ${service.port})`);
    });
    console.log(`⏱️ Retraso entre inicios: ${startupDelay}ms\n`);
    
    // Configurar manejadores de señales
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    // Iniciar servicios secuencialmente
    for (const [serviceKey, serviceConfig] of services) {
        await startService(serviceKey, serviceConfig, options);
        
        // Esperar antes del siguiente servicio (excepto el último)
        if (services.indexOf([serviceKey, serviceConfig]) < services.length - 1) {
            console.log(`⏱️ Esperando ${startupDelay}ms antes del siguiente servicio...\n`);
            await new Promise(resolve => setTimeout(resolve, startupDelay));
        }
    }
    
    console.log('\n[PARTY] TODOS LOS SERVICIOS HAN SIDO INICIADOS');
    console.log('=========================================');
    
    // Esperar un poco y verificar salud
    await new Promise(resolve => setTimeout(resolve, 3000));
    await waitForServicesHealth(services);
    
    // Mostrar estado del sistema
    showSystemStatus();
    
    console.log('[CRYSTAL_BALL] Servicios ejecutándose. Presiona Ctrl+C para cerrar todos los servicios.');
    console.log('[CHART] Para monitorear el estado: http://localhost:14101/health (si está habilitado)');
    
    // Mantener el proceso principal vivo
    process.stdin.resume();
}

// [ROCKET] INICIAR APLICACIÓN
main().catch((error) => {
    console.error('[X] Error crítico en Master Service Launcher:', error);
    gracefulShutdown();
});
