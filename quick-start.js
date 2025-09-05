#!/usr/bin/env node

/**
 * [LIGHTNING] QBTC QUICK START - LANZAMIENTO RÁPIDO PARA DESARROLLO
 * ======================================================
 * Lanzador ligero para desarrollo y testing
 * Solo servicios esenciales para funcionamiento básico
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import axios from 'axios';
import path from 'path';

const SYSTEM_BASE_PATH = 'C:\\Users\\DELL\\Desktop\\qbtc-futures-system';

class QBTCQuickStart {
    constructor() {
        this.launchedServices = new Map();
        
        // Solo servicios esenciales para desarrollo
        this.essentialServices = [
            { name: 'master-control-hub', path: 'core/master-control-hub.js', port: 14001, priority: 'MAXIMUM' },
            { name: 'quantum-leverage-engine-service', path: 'engines/quantum-leverage-engine-service.js', port: 14101, priority: 'CRITICAL' },
            { name: 'trading-executor', path: 'execution/trading-executor.js', port: 14201, priority: 'CRITICAL' },
            { name: 'risk-management', path: 'management/risk-management.js', port: 14301, priority: 'MAXIMUM' },
            { name: 'dashboard-server', path: 'frontend/dashboard-server.js', port: 14801, priority: 'MEDIUM' }
        ];
    }
    
    async quickLaunch() {
        console.log('[LIGHTNING] QBTC QUICK START - DESARROLLO RÁPIDO');
        console.log('='.repeat(50));
        console.log('[ROCKET] Iniciando servicios esenciales...\n');
        
        for (const service of this.essentialServices) {
            await this.launchService(service);
            await this.sleep(2000); // Espera breve entre servicios
        }
        
        await this.verifyServices();
        this.displayQuickSummary();
        
        return this.launchedServices.size > 0;
    }
    
    async launchService(service) {
        const servicePath = path.join(SYSTEM_BASE_PATH, service.path);
        
        try {
            if (!existsSync(servicePath)) {
                console.log(`[WARNING] ${service.name}: Archivo no encontrado`);
                return;
            }
            
            console.log(`[ROCKET] Iniciando ${service.name}...`);
            
            const child = spawn('node', [servicePath], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                cwd: SYSTEM_BASE_PATH,
                env: { ...process.env, NODE_ENV: 'development' }
            });
            
            child.unref();
            
            this.launchedServices.set(service.name, {
                ...service,
                pid: child.pid,
                startTime: new Date(),
                process: child
            });
            
            console.log(`[CHECK] ${service.name}: INICIADO (PID: ${child.pid})`);
            
        } catch (error) {
            console.log(`[X] ${service.name}: ERROR - ${error.message}`);
        }
    }
    
    async verifyServices() {
        console.log('\n[MAGNIFY] Verificando servicios...');
        
        for (const [serviceName, serviceInfo] of this.launchedServices) {
            const isHealthy = await this.checkHealth(serviceInfo.port);
            
            if (isHealthy) {
                console.log(`[CHECK] ${serviceName}: OPERACIONAL`);
            } else {
                console.log(`[WARNING] ${serviceName}: INICIANDO...`);
            }
        }
    }
    
    async checkHealth(port, timeout = 3000) {
        try {
            const response = await axios.get(`http://localhost:${port}/health`, { timeout });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    displayQuickSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('[LIGHTNING] QBTC QUICK START - RESUMEN');
        console.log('='.repeat(50));
        
        console.log(`\n[CHART] Servicios iniciados: ${this.launchedServices.size}/5`);
        
        console.log('\n[GLOBE] ENDPOINTS ACTIVOS:');
        for (const [name, info] of this.launchedServices) {
            console.log(`   🔸 ${name}: http://localhost:${info.port}`);
        }
        
        console.log('\n[TARGET] ACCESOS RÁPIDOS:');
        console.log('   [CHART] Master Control: http://localhost:14001');
        console.log('   [TREND_UP] Dashboard: http://localhost:14801');
        console.log('   [LIGHTNING] Trading: http://localhost:14201');
        console.log('   🛡️ Risk Management: http://localhost:14301');
        
        console.log('\n[BULB] COMANDOS ÚTILES:');
        console.log('   curl http://localhost:14001/health');
        console.log('   curl http://localhost:14001/system/status');
        
        console.log('\n[LIGHTNING] Quick Start completado. Presiona Ctrl+C para salir.\n');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async shutdown() {
        console.log('\n[STOP] Cerrando servicios...');
        
        for (const [serviceName, serviceInfo] of this.launchedServices) {
            try {
                if (serviceInfo.process && !serviceInfo.process.killed) {
                    serviceInfo.process.kill('SIGTERM');
                    console.log(`[STOP] ${serviceName}: Cerrado`);
                }
            } catch (error) {
                console.log(`[WARNING] Error cerrando ${serviceName}`);
            }
        }
        
        await this.sleep(2000);
        console.log('[CHECK] Quick Start finalizado');
    }
}

// Manejo de señales
process.on('SIGINT', async () => {
    if (global.quickStart) {
        await global.quickStart.shutdown();
    }
    process.exit(0);
});

async function main() {
    const quickStart = new QBTCQuickStart();
    global.quickStart = quickStart;
    
    try {
        await quickStart.quickLaunch();
        
        // Mantener activo
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
        
    } catch (error) {
        console.error(`[X] Error: ${error.message}`);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default QBTCQuickStart;
