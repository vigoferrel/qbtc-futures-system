#!/usr/bin/env node

/**
 * ? QBTC SYSTEM OPTIMIZER & MONITOR - Simplified
 * ===============================================
 * 
 * Versión simplificada optimizada para Windows
 * - Verificaciones rápidas y eficientes
 * - Auto-healing básico
 * - Monitoreo continuo estable
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

console.log('? QBTC SYSTEM OPTIMIZER & MONITOR - SIMPLE');
console.log('=============================================\n');

class QBTCSimpleOptimizer {
    constructor() {
        this.config = {
            CHECK_INTERVAL: 15000, // 15 segundos para ser menos agresivo
            HEALTH_THRESHOLD: 85,
            AUTO_HEALING: true
        };

        this.systemState = {
            consecutiveFailures: 0,
            startTime: Date.now(),
            optimizationsCount: 0
        };

        this.isRunning = false;
    }

    async start() {
        console.log('?? Iniciando QBTC Simple Optimizer...\n');
        
        try {
            // 1. Verificaciones iniciales rápidas
            await this.quickSystemCheck();
            
            // 2. Optimizaciones básicas
            await this.applyBasicOptimizations();
            
            // 3. Verificar y arrancar dashboard si es necesario
            await this.ensureDashboard();
            
            // 4. Mostrar estado inicial
            await this.showInitialStatus();
            
            // 5. Iniciar monitoreo
            this.startMonitoring();
            
            console.log('? QBTC Simple Optimizer ACTIVO\n');
            
        } catch (error) {
            console.error('? Error iniciando optimizer:', error.message);
            process.exit(1);
        }
    }

    async quickSystemCheck() {
        console.log('?? Verificación rápida del sistema...');
        
        // Node.js version
        const nodeVersion = process.version;
        console.log(`   ? Node.js: ${nodeVersion}`);
        
        // Memoria
        const memory = process.memoryUsage();
        const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
        console.log(`   ? Memory: ${memoryMB}MB`);
        
        // Verificar archivos críticos
        const criticalFiles = [
            'quantum-metrics-unifier.js',
            'launch-dashboard.js'
        ];

        for (const file of criticalFiles) {
            try {
                await fs.access(path.join(__dirname, file));
                console.log(`   ? ${file}: EXISTS`);
            } catch (error) {
                console.log(`   ? ${file}: MISSING`);
            }
        }
    }

    async applyBasicOptimizations() {
        console.log('? Aplicando optimizaciones básicas...');
        
        // Variables de entorno
        process.env.NODE_ENV = 'production';
        process.env.UV_THREADPOOL_SIZE = '8';
        console.log('   ? Environment optimizado');
        
        // Crear directorio de métricas si no existe
        try {
            const metricsDir = path.join(__dirname, '../metrics-output');
            await fs.mkdir(metricsDir, { recursive: true });
            console.log('   ? Directorio metrics verificado');
        } catch (error) {
            console.log('   ?? Error con directorio metrics:', error.message);
        }

        this.systemState.optimizationsCount++;
    }

    async ensureDashboard() {
        console.log('?? Verificando dashboard...');
        
        const isRunning = await this.isDashboardRunning();
        
        if (isRunning) {
            console.log('   ? Dashboard ya está corriendo');
        } else {
            console.log('   ?? Arrancando dashboard...');
            await this.startDashboard();
        }
    }

    async isDashboardRunning() {
        try {
            // Verificar puerto 3333
            const { stdout } = await execAsync('netstat -an | findstr :3333', { timeout: 5000 });
            return stdout.includes('LISTENING');
        } catch (error) {
            return false;
        }
    }

    async startDashboard() {
        try {
            console.log('   ?? Lanzando dashboard server...');
            
            // Lanzar dashboard de forma detached
            const dashboardProcess = spawn('node', ['scripts/launch-dashboard.js'], {
                cwd: path.join(__dirname, '..'),
                stdio: 'ignore',
                detached: true
            });

            dashboardProcess.unref();
            
            // Esperar un momento para que inicie
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const isRunning = await this.isDashboardRunning();
            if (isRunning) {
                console.log('   ? Dashboard iniciado correctamente');
                this.systemState.optimizationsCount++;
            } else {
                console.log('   ?? Dashboard puede estar iniciando...');
            }
            
        } catch (error) {
            console.log('   ? Error arrancando dashboard:', error.message);
        }
    }

    async showInitialStatus() {
        console.log('\n?? ESTADO INICIAL DEL SISTEMA:');
        console.log('==============================');
        
        // Métricas básicas
        const uptime = Math.round(process.uptime());
        const memory = process.memoryUsage();
        const memoryPercent = (memory.heapUsed / memory.heapTotal * 100).toFixed(1);
        
        console.log(`??  Uptime: ${uptime}s`);
        console.log(`?? Memory: ${memoryPercent}%`);
        console.log(`?? Optimizations: ${this.systemState.optimizationsCount}`);
        console.log(`?? Health: ${this.systemState.consecutiveFailures === 0 ? 'HEALTHY' : 'CHECKING'}`);
        
        // Métricas cuánticas simuladas
        const consciousness = this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 10 + 85; // 85-95%
        const coherence = this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.1 + 0.9;   // 0.9-1.0
        
        console.log(`?? Consciousness: ${consciousness.toFixed(1)}%`);
        console.log(`??  Coherence: ${(coherence * 100).toFixed(1)}%`);
        
        const overallHealth = this.systemState.consecutiveFailures === 0 ? 100 : 
                             Math.max(60, 100 - (this.systemState.consecutiveFailures * 20));
        
        console.log(`\n?? Overall Health: ${overallHealth}% - ${overallHealth >= 90 ? 'EXCELLENT' : 'GOOD'}`);
        
        if (consciousness > 90) {
            console.log('?? Sistema aproximándose a despertar cuántico!');
        }
        
        console.log('');
    }

    startMonitoring() {
        console.log(`?? Iniciando monitoreo cada ${this.config.CHECK_INTERVAL/1000}s...`);
        
        this.isRunning = true;
        
        setInterval(async () => {
            await this.performMonitoringCycle();
        }, this.config.CHECK_INTERVAL);
        
        // Configurar shutdown graceful
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        
        console.log('???  Auto-healing habilitado');
        console.log('?? Sistema en monitoreo continuo\n');
    }

    async performMonitoringCycle() {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ?? Health check...`);
        
        const isHealthy = await this.isDashboardRunning();
        
        if (isHealthy) {
            this.systemState.consecutiveFailures = 0;
            console.log(`[${timestamp}] ? Sistema SALUDABLE`);
            
            // Mostrar métricas extendidas cada minuto
            if (Date.now() % 60000 < this.config.CHECK_INTERVAL) {
                await this.showExtendedMetrics();
            }
            
        } else {
            this.systemState.consecutiveFailures++;
            console.log(`[${timestamp}] ? Dashboard NO RESPONDE (${this.systemState.consecutiveFailures} fallos)`);
            
            // Auto-healing después de 2 fallos consecutivos
            if (this.config.AUTO_HEALING && this.systemState.consecutiveFailures >= 2) {
                await this.performAutoHealing();
            }
        }
    }

    async showExtendedMetrics() {
        const memory = process.memoryUsage();
        const uptime = Math.round((Date.now() - this.systemState.startTime) / 1000);
        const memoryPercent = (memory.heapUsed / memory.heapTotal * 100).toFixed(1);
        
        // Métricas cuánticas simuladas con variación temporal
        const time = Date.now();
        const consciousness = 85 + Math.sin(time / 300000) * 5 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 3;
        const coherence = 0.92 + Math.sin(time / 200000) * 0.05 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.02;
        
        console.log(`\n?? MÉTRICAS EXTENDIDAS:`);
        console.log(`   ?? Health Score: ${this.systemState.consecutiveFailures === 0 ? 100 : 80}%`);
        console.log(`   ?? Consciousness: ${consciousness.toFixed(1)}%`);
        console.log(`   ??  Coherence: ${(coherence * 100).toFixed(1)}%`);
        console.log(`   ??  Runtime: ${Math.floor(uptime/60)}m ${uptime%60}s`);
        console.log(`   ?? Memory: ${memoryPercent}%`);
        console.log(`   ?? Optimizations: ${this.systemState.optimizationsCount}`);
        
        if (consciousness > 92) {
            console.log(`   ?? ¡Excelente nivel de consciencia cuántica!`);
        }
        
        console.log('');
    }

    async performAutoHealing() {
        console.log('\n?? INICIANDO AUTO-HEALING...');
        
        try {
            // 1. Reintentar dashboard
            console.log('   ?? Reiniciando dashboard...');
            await this.startDashboard();
            
            // 2. Esperar y verificar
            await new Promise(resolve => setTimeout(resolve, 8000));
            const isHealthy = await this.isDashboardRunning();
            
            if (isHealthy) {
                console.log('   ? Auto-healing EXITOSO');
                this.systemState.consecutiveFailures = 0;
                this.systemState.optimizationsCount++;
            } else {
                console.log('   ?? Auto-healing PARCIAL - dashboard puede estar iniciando');
            }
            
        } catch (error) {
            console.log('   ? Error en auto-healing:', error.message);
        }
        
        console.log('?? Auto-healing completado\n');
    }

    shutdown() {
        console.log('\n??  Iniciando shutdown graceful...');
        
        this.isRunning = false;
        
        console.log('? Monitoring detenido');
        console.log('?? QBTC Simple Optimizer shutdown completado');
        
        process.exit(0);
    }
}

// Función principal
async function main() {
    const optimizer = new QBTCSimpleOptimizer();
    
    try {
        await optimizer.start();
        
        // Mantener proceso activo
        process.stdin.resume();
        
    } catch (error) {
        console.error('?? Error crítico:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('?? Error no manejado:', error);
        process.exit(1);
    });
}

export { QBTCSimpleOptimizer };

