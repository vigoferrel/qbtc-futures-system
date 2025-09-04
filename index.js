#!/usr/bin/env node

/**
 * [OCEAN_WAVE] QBTC Quantum Futures System - Main Entry Point
 * 
 * Sistema integrado que combina:
 * - Análisis cuántico-hermético puro (QBTC)
 * - Ejecución especializada en futuros únicamente
 * 
 * Arquitectura separada para máxima especialización
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[OCEAN_WAVE] Starting QBTC Quantum Futures System');
console.log('=====================================');

// Configuración del sistema
const CONFIG = {
    analysis: {
        port: 4001,
        script: 'analysis-engine/server.js',
        name: 'QBTC Analysis Engine'
    },
    execution: {
        port: 4002,
        script: 'futures-execution/server.js',
        name: 'Futures Execution Engine'
    }
};

let analysisProcess = null;
let executionProcess = null;

// Función para iniciar un proceso
function startProcess(config, type) {
    console.log(`[ROCKET] Starting ${config.name} on port ${config.port}`);
    
    const process = spawn('node', [config.script], {
        cwd: __dirname,
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: config.port,
            SERVICE_TYPE: type
        }
    });
    
    process.on('error', (error) => {
        console.error(`[X] Error in ${config.name}:`, error);
    });
    
    process.on('exit', (code) => {
        console.log(`[WARNING] ${config.name} exited with code ${code}`);
        if (code !== 0) {
            console.log(`[REFRESH] Restarting ${config.name} in 5 seconds...`);
            setTimeout(() => {
                if (type === 'analysis') {
                    analysisProcess = startProcess(CONFIG.analysis, 'analysis');
                } else {
                    executionProcess = startProcess(CONFIG.execution, 'execution');
                }
            }, 5000);
        }
    });
    
    return process;
}

// Iniciar ambos servicios
analysisProcess = startProcess(CONFIG.analysis, 'analysis');

// Esperar 3 segundos antes de iniciar execution (para que analysis esté listo)
setTimeout(() => {
    executionProcess = startProcess(CONFIG.execution, 'execution');
}, 3000);

// Manejo de señales para shutdown graceful
process.on('SIGINT', () => {
    console.log('\n[STOP] Shutting down QBTC System...');
    
    if (analysisProcess) {
        analysisProcess.kill('SIGTERM');
    }
    
    if (executionProcess) {
        executionProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
        console.log('[CHECK] QBTC System shutdown complete');
        process.exit(0);
    }, 2000);
});

console.log('[CHECK] QBTC System started successfully');
console.log('[CHART] Analysis Engine: http://localhost:4001');
console.log('[LIGHTNING] Execution Engine: http://localhost:4002');
console.log('\nPress Ctrl+C to stop the system');
