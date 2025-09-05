#!/usr/bin/env node

/**
 * [HOSPITAL] HEALTH CHECK TOOL
 * ===================
 * 
 * Herramienta para verificar el estado de salud de todos los servicios
 * del sistema QBTC Futures
 * 
 * Uso:
 * - node health-check.js                    # Check básico de todos los servicios
 * - node health-check.js --detailed         # Check detallado con métricas
 * - node health-check.js --port=14102       # Check de servicio específico
 * - node health-check.js --continuous       # Monitoreo continuo
 * - node health-check.js --json             # Salida en formato JSON
 * - node health-check.js --alert            # Solo alertas (servicios down)
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de servicios
const SERVICES = [
    {
        name: '[MONITOR] Unified System Monitor',
        port: 14101,
        endpoint: '/health',
        critical: false
    },
    {
        name: '[MOON] Temporal Cycles Engine',
        port: 14102,
        endpoint: '/health',
        critical: true
    },
    {
        name: '[DIAMOND] Multidimensional Weighting Engine',
        port: 14103,
        endpoint: '/health',
        critical: true
    },
    {
        name: '[TARGET] Tier Strategy Generator',
        port: 14104,
        endpoint: '/health',
        critical: true
    },
    {
        name: '[REFRESH] Consolidated Opportunities API',
        port: 14105,
        endpoint: '/health',
        critical: true
    }
];

// Variables globales
let options = {
    detailed: false,
    port: null,
    continuous: false,
    interval: 5000,
    json: false,
    alert: false,
    timeout: 5000
};

// [MEMO] FUNCIONES DE UTILIDAD
function parseArgs() {
    const args = process.argv.slice(2);
    
    args.forEach(arg => {
        if (arg === '--detailed' || arg === '-d') {
            options.detailed = true;
        } else if (arg.startsWith('--port=')) {
            options.port = parseInt(arg.split('=')[1]);
        } else if (arg === '--continuous' || arg === '-c') {
            options.continuous = true;
        } else if (arg.startsWith('--interval=')) {
            options.interval = parseInt(arg.split('=')[1]);
        } else if (arg === '--json' || arg === '-j') {
            options.json = true;
        } else if (arg === '--alert' || arg === '-a') {
            options.alert = true;
        } else if (arg.startsWith('--timeout=')) {
            options.timeout = parseInt(arg.split('=')[1]);
        } else if (arg === '--help' || arg === '-h') {
            showHelp();
            process.exit(0);
        }
    });
}

function showHelp() {
    console.log(`
[HOSPITAL] HEALTH CHECK TOOL - Help
==========================

Uso: node health-check.js [opciones]

Opciones:
  --detailed, -d        Check detallado con métricas y estadísticas
  --port=PORT          Check solo el servicio en el puerto especificado
  --continuous, -c     Monitoreo continuo (Ctrl+C para detener)
  --interval=MS        Intervalo para monitoreo continuo (por defecto: 5000ms)
  --json, -j           Salida en formato JSON
  --alert, -a          Solo mostrar servicios que no responden
  --timeout=MS         Timeout para requests HTTP (por defecto: 5000ms)
  --help, -h           Mostrar esta ayuda

Servicios monitoreados:
`);
    
    SERVICES.forEach(service => {
        const critical = service.critical ? ' (CRÍTICO)' : '';
        console.log(`  ${service.port}: ${service.name}${critical}`);
    });
    
    console.log(`
Ejemplos:
  node health-check.js
    # Check básico de todos los servicios
    
  node health-check.js --detailed --json
    # Check detallado en formato JSON
    
  node health-check.js --continuous --interval=10000
    # Monitoreo continuo cada 10 segundos
    
  node health-check.js --port=14102 --detailed
    # Check detallado solo del Temporal Cycles Engine
`);
}

// [HOSPITAL] FUNCIONES DE HEALTH CHECK
async function checkService(service) {
    const startTime = Date.now();
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout);
        
        const response = await fetch(`http://localhost:${service.port}${service.endpoint}`, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'QBTC-HealthCheck/1.0'
            }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const healthData = await response.json();
            return {
                service: service.name,
                port: service.port,
                status: 'healthy',
                response_time: responseTime,
                critical: service.critical,
                health_data: healthData,
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                service: service.name,
                port: service.port,
                status: 'unhealthy',
                response_time: responseTime,
                critical: service.critical,
                error: `HTTP ${response.status}: ${response.statusText}`,
                timestamp: new Date().toISOString()
            };
        }
        
    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        let errorMessage = error.message;
        if (error.name === 'AbortError') {
            errorMessage = `Timeout after ${options.timeout}ms`;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused - service down';
        }
        
        return {
            service: service.name,
            port: service.port,
            status: 'down',
            response_time: responseTime,
            critical: service.critical,
            error: errorMessage,
            timestamp: new Date().toISOString()
        };
    }
}

async function checkAllServices() {
    const servicesToCheck = options.port 
        ? SERVICES.filter(s => s.port === options.port)
        : SERVICES;
    
    const results = await Promise.all(
        servicesToCheck.map(service => checkService(service))
    );
    
    return results;
}

// [PALETTE] FUNCIONES DE PRESENTACIÓN
function formatHealthCheck(results) {
    if (options.json) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            total_services: results.length,
            healthy_services: results.filter(r => r.status === 'healthy').length,
            unhealthy_services: results.filter(r => r.status === 'unhealthy').length,
            down_services: results.filter(r => r.status === 'down').length,
            critical_down: results.filter(r => r.status === 'down' && r.critical).length,
            results: results
        }, null, 2);
    }
    
    let output = '';
    
    if (!options.continuous) {
        output += '[HOSPITAL] =============== HEALTH CHECK RESULTS ===============\n';
        output += `[CALENDAR] ${new Date().toLocaleString()}\n\n`;
    }
    
    const healthyServices = results.filter(r => r.status === 'healthy');
    const unhealthyServices = results.filter(r => r.status === 'unhealthy');
    const downServices = results.filter(r => r.status === 'down');
    
    // Mostrar solo alertas si está activada la opción
    if (options.alert) {
        if (unhealthyServices.length === 0 && downServices.length === 0) {
            output += '[CHECK] Todos los servicios están funcionando correctamente\n';
            return output;
        }
    }
    
    // Summary
    if (!options.alert) {
        output += `[CHART] RESUMEN:\n`;
        output += `   [CHECK] Saludables: ${healthyServices.length}\n`;
        output += `   [WARNING] No saludables: ${unhealthyServices.length}\n`;
        output += `   [X] Caídos: ${downServices.length}\n`;
        output += `   [SIREN] Críticos caídos: ${downServices.filter(r => r.critical).length}\n\n`;
    }
    
    // Servicios saludables
    if (!options.alert && healthyServices.length > 0) {
        output += '[CHECK] SERVICIOS SALUDABLES:\n';
        healthyServices.forEach(result => {
            output += `   ${result.service} (Puerto ${result.port})\n`;
            output += `      Tiempo de respuesta: ${result.response_time}ms\n`;
            
            if (options.detailed && result.health_data) {
                output += `      Estado: ${result.health_data.status || 'N/A'}\n`;
                output += `      Uptime: ${result.health_data.uptime ? Math.floor(result.health_data.uptime) + 's' : 'N/A'}\n`;
                if (result.health_data.engine_active !== undefined) {
                    output += `      Motor activo: ${result.health_data.engine_active ? 'Sí' : 'No'}\n`;
                }
                if (result.health_data.active_opportunities !== undefined) {
                    output += `      Oportunidades activas: ${result.health_data.active_opportunities}\n`;
                }
                if (result.health_data.connected_engines !== undefined) {
                    output += `      Motores conectados: ${result.health_data.connected_engines}\n`;
                }
                if (result.health_data.dimensions !== undefined) {
                    output += `      Dimensiones: ${result.health_data.dimensions}\n`;
                }
                if (result.health_data.active_strategies !== undefined) {
                    output += `      Estrategias activas: ${result.health_data.active_strategies}\n`;
                }
            }
            output += '\n';
        });
    }
    
    // Servicios no saludables
    if (unhealthyServices.length > 0) {
        output += '[WARNING] SERVICIOS NO SALUDABLES:\n';
        unhealthyServices.forEach(result => {
            output += `   ${result.service} (Puerto ${result.port})\n`;
            output += `      Error: ${result.error}\n`;
            output += `      Tiempo de respuesta: ${result.response_time}ms\n`;
            if (result.critical) output += `      [SIREN] CRÍTICO\n`;
            output += '\n';
        });
    }
    
    // Servicios caídos
    if (downServices.length > 0) {
        output += '[X] SERVICIOS CAÍDOS:\n';
        downServices.forEach(result => {
            output += `   ${result.service} (Puerto ${result.port})\n`;
            output += `      Error: ${result.error}\n`;
            output += `      Tiempo de respuesta: ${result.response_time}ms\n`;
            if (result.critical) output += `      [SIREN] CRÍTICO\n`;
            output += '\n';
        });
    }
    
    return output;
}

// [TREND_UP] FUNCIONES DE ESTADÍSTICAS
function calculateStats(results) {
    const stats = {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length,
        down: results.filter(r => r.status === 'down').length,
        critical_down: results.filter(r => r.status === 'down' && r.critical).length,
        avg_response_time: 0,
        max_response_time: 0,
        min_response_time: Infinity
    };
    
    if (results.length > 0) {
        const healthyResults = results.filter(r => r.status === 'healthy');
        if (healthyResults.length > 0) {
            stats.avg_response_time = Math.round(
                healthyResults.reduce((sum, r) => sum + r.response_time, 0) / healthyResults.length
            );
            stats.max_response_time = Math.max(...healthyResults.map(r => r.response_time));
            stats.min_response_time = Math.min(...healthyResults.map(r => r.response_time));
        }
    }
    
    return stats;
}

// [REFRESH] FUNCIÓN PRINCIPAL
async function performHealthCheck() {
    try {
        const results = await checkAllServices();
        const output = formatHealthCheck(results);
        
        if (options.continuous) {
            // Clear console para monitoreo continuo
            console.clear();
            console.log(`[REFRESH] Monitoreo continuo - ${new Date().toLocaleString()}`);
            console.log('===============================================');
        }
        
        console.log(output);
        
        // Mostrar estadísticas adicionales en modo detallado
        if (options.detailed && !options.json && !options.alert) {
            const stats = calculateStats(results);
            console.log('[TREND_UP] ESTADÍSTICAS:');
            console.log(`   Tiempo promedio de respuesta: ${stats.avg_response_time}ms`);
            console.log(`   Tiempo máximo de respuesta: ${stats.max_response_time}ms`);
            console.log(`   Tiempo mínimo de respuesta: ${stats.min_response_time}ms`);
            console.log(`   Disponibilidad: ${((stats.healthy / stats.total) * 100).toFixed(1)}%\n`);
        }
        
        // Return exit code basado en el estado
        const criticalDown = results.filter(r => r.status === 'down' && r.critical).length;
        return criticalDown > 0 ? 1 : 0;
        
    } catch (error) {
        console.error('[X] Error realizando health check:', error.message);
        return 2;
    }
}

async function continuousMonitoring() {
    console.log(`[REFRESH] Iniciando monitoreo continuo cada ${options.interval}ms...`);
    console.log('Presiona Ctrl+C para detener\n');
    
    while (true) {
        await performHealthCheck();
        await new Promise(resolve => setTimeout(resolve, options.interval));
    }
}

// [ROCKET] MAIN
async function main() {
    parseArgs();
    
    if (options.continuous) {
        // Configurar manejador para Ctrl+C
        process.on('SIGINT', () => {
            console.log('\n[STOP] Deteniendo monitoreo continuo...');
            process.exit(0);
        });
        
        await continuousMonitoring();
    } else {
        const exitCode = await performHealthCheck();
        process.exit(exitCode);
    }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('[X] Error crítico en Health Check:', error);
        process.exit(2);
    });
}

export { checkService, checkAllServices, SERVICES };
