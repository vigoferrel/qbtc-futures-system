#!/usr/bin/env node

/**
 * QBTC Sistema de Prueba Completo v2.0
 * Prueba integral de todas las mejoras implementadas
 */

import axios from 'axios';
import chalk from 'chalk';

console.log(chalk.cyan.bold('\n[TARGET] INICIANDO PRUEBA COMPLETA DEL SISTEMA QBTC ULTIMATE EDITION v2.0\n'));

const tests = [
    {
        name: 'Quantum Monitoring Dashboard - API Status',
        url: 'http://localhost:14999/api/system/status',
        timeout: 5000
    },
    {
        name: 'Quantum Monitoring Dashboard - Web Interface',
        url: 'http://localhost:14999/',
        timeout: 5000,
        checkContent: true
    },
    {
        name: 'Quantum Alert Engine - Alertas Activas',
        url: 'http://localhost:14998/api/alerts/active',
        timeout: 5000
    }
];

// Servicios principales para verificar
const mainServices = [
    { name: 'Master Control Hub', port: 14001, endpoint: '/health' },
    { name: 'Message Bus Event Hub', port: 14002, endpoint: '/health' },
    { name: 'Configuration Service', port: 14003, endpoint: '/status' },
    { name: 'Metrics Collector', port: 14004, endpoint: '/status' },
    { name: 'Quantum Leverage Engine', port: 14101, endpoint: '/health' },
    { name: 'Consciousness Engine', port: 14102, endpoint: '/health' },
    { name: 'Quantum Analysis Server', port: 14103, endpoint: '/health' },
    { name: 'Binance Data Ingestion', port: 14104, endpoint: '/health' },
    { name: 'Quantum Core Engine', port: 14105, endpoint: '/health' },
    { name: 'Trading Engine Executor', port: 14201, endpoint: '/status' },
    { name: 'Position Manager', port: 14202, endpoint: '/status' },
    { name: 'Exchange API Gateway', port: 14204, endpoint: '/status' },
    { name: 'Risk Management Core', port: 14301, endpoint: '/health' },
    { name: 'Emergency Response System', port: 14303, endpoint: '/health' }
];

async function runTest(test) {
    try {
        console.log(chalk.yellow(`[LIGHTNING] Probando: ${test.name}`));
        
        const response = await axios.get(test.url, { 
            timeout: test.timeout,
            validateStatus: () => true 
        });
        
        if (response.status === 200) {
            if (test.checkContent && response.data.includes('QBTC Quantum Monitoring Dashboard')) {
                console.log(chalk.green(`[CHECK] ${test.name}: Web interface OK`));
                return { success: true, status: response.status };
            } else if (!test.checkContent) {
                const dataSize = JSON.stringify(response.data).length;
                console.log(chalk.green(`[CHECK] ${test.name}: API OK (${dataSize} bytes)`));
                return { success: true, status: response.status, dataSize };
            }
        }
        
        console.log(chalk.red(`[X] ${test.name}: Status ${response.status}`));
        return { success: false, status: response.status };
        
    } catch (error) {
        console.log(chalk.red(`[X] ${test.name}: ${error.message}`));
        return { success: false, error: error.message };
    }
}

async function checkMainServices() {
    console.log(chalk.cyan.bold('\n[CHART] VERIFICANDO SERVICIOS PRINCIPALES:\n'));
    
    let successCount = 0;
    const results = [];
    
    for (const service of mainServices) {
        try {
            const response = await axios.get(`http://localhost:${service.port}${service.endpoint}`, { 
                timeout: 3000,
                validateStatus: () => true 
            });
            
            if (response.status === 200) {
                console.log(chalk.green(`[CHECK] ${service.name} (${service.port}${service.endpoint}): HEALTHY`));
                successCount++;
                results.push({ ...service, status: 'HEALTHY', responseTime: response.headers['x-response-time'] || 'N/A' });
            } else {
                console.log(chalk.yellow(`[WARNING]  ${service.name} (${service.port}${service.endpoint}): Status ${response.status}`));
                results.push({ ...service, status: `HTTP_${response.status}` });
            }
        } catch (error) {
            console.log(chalk.red(`[X] ${service.name} (${service.port}${service.endpoint}): ${error.code || error.message}`));
            results.push({ ...service, status: 'ERROR', error: error.code || error.message });
        }
    }
    
    return { successCount, totalCount: mainServices.length, results };
}

async function main() {
    console.log(chalk.blue('[WRENCH] FASE 1: Verificando nuevos servicios de monitoreo\n'));
    
    const newServicesResults = [];
    for (const test of tests) {
        const result = await runTest(test);
        newServicesResults.push({ test: test.name, ...result });
    }
    
    console.log(chalk.blue('\n[WRENCH] FASE 2: Verificando servicios principales\n'));
    const mainServicesResult = await checkMainServices();
    
    // Resumen final
    console.log(chalk.cyan.bold('\n[CLIPBOARD] RESUMEN FINAL DEL SISTEMA:\n'));
    
    console.log(chalk.white('🆕 NUEVOS SERVICIOS DE MONITOREO:'));
    newServicesResults.forEach(result => {
        const status = result.success ? chalk.green('[CHECK] OPERATIVO') : chalk.red('[X] ERROR');
        console.log(`   ${result.test}: ${status}`);
    });
    
    console.log(chalk.white('\n🏢 SERVICIOS PRINCIPALES:'));
    console.log(`   Total: ${mainServicesResult.totalCount}`);
    console.log(`   Saludables: ${chalk.green(mainServicesResult.successCount)}`);
    console.log(`   Cobertura: ${chalk.yellow(((mainServicesResult.successCount / mainServicesResult.totalCount) * 100).toFixed(1) + '%')}`);
    
    const overallHealth = (mainServicesResult.successCount / mainServicesResult.totalCount) * 100;
    const newServicesHealth = (newServicesResults.filter(r => r.success).length / newServicesResults.length) * 100;
    
    console.log(chalk.cyan.bold('\n[STAR] ESTADO GENERAL DEL SISTEMA:'));
    console.log(`   Servicios Principales: ${overallHealth >= 90 ? chalk.green('EXCELENTE') : overallHealth >= 80 ? chalk.yellow('BUENO') : chalk.red('CRÍTICO')} (${overallHealth.toFixed(1)}%)`);
    console.log(`   Nuevos Servicios: ${newServicesHealth >= 80 ? chalk.green('OPERATIVO') : chalk.red('CON PROBLEMAS')} (${newServicesHealth.toFixed(1)}%)`);
    
    if (overallHealth >= 90 && newServicesHealth >= 80) {
        console.log(chalk.green.bold('\n[PARTY] SISTEMA COMPLETAMENTE OPERATIVO - MEJORAS EXITOSAS! [PARTY]\n'));
    } else {
        console.log(chalk.yellow.bold('\n[WARNING]  SISTEMA FUNCIONAL CON ÁREAS DE MEJORA\n'));
    }
    
    process.exit(0);
}

main().catch(error => {
    console.error(chalk.red.bold('\n[BOOM] ERROR CRÍTICO EN LA PRUEBA:'), error.message);
    process.exit(1);
});
