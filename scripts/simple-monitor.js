#!/usr/bin/env node

/**
 * ??? QBTC SIMPLE MONITOR
 * ======================
 * 
 * Monitor continuo simplificado para el sistema QBTC
 * Optimizado para estabilidad en Windows PowerShell
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

console.log('??? QBTC SIMPLE MONITOR');
console.log('======================\n');

class SimpleMonitor {
    constructor() {
        this.config = {
            CHECK_INTERVAL: 20000, // 20 segundos - menos agresivo
            MAX_ITERATIONS: 10,    // Limitar a 10 iteraciones para evitar colgarse
            HEALTH_THRESHOLD: 80
        };
        
        this.state = {
            iteration: 0,
            startTime: Date.now(),
            healthChecks: 0,
            warnings: 0,
            errors: 0,
            lastHealthy: true
        };
        
        this.isRunning = false;
    }

    async start() {
        console.log('?? Iniciando QBTC Simple Monitor...');
        console.log(`??  Intervalo de verificación: ${this.config.CHECK_INTERVAL/1000}s`);
        console.log(`?? Máximo de iteraciones: ${this.config.MAX_ITERATIONS}`);
        console.log(`?? Umbral de salud mínimo: ${this.config.HEALTH_THRESHOLD}%\n`);
        
        this.isRunning = true;
        
        // Configurar shutdown graceful
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        
        // Iniciar ciclo de monitoreo
        await this.startMonitoringCycle();
    }

    async startMonitoringCycle() {
        while (this.isRunning && this.state.iteration < this.config.MAX_ITERATIONS) {
            this.state.iteration++;
            
            console.log(`\n[${new Date().toLocaleTimeString()}] ?? Ciclo ${this.state.iteration}/${this.config.MAX_ITERATIONS}`);
            console.log('????????????????????????????????????????????????????????????');
            
            await this.performHealthCheck();
            await this.checkSystem();
            await this.generateMetrics();
            
            console.log(`?? Status: ${this.getSystemStatus()}`);
            
            if (this.state.iteration < this.config.MAX_ITERATIONS) {
                console.log(`? Esperando ${this.config.CHECK_INTERVAL/1000}s hasta próximo ciclo...`);
                await this.sleep(this.config.CHECK_INTERVAL);
            }
        }
        
        await this.finalReport();
        console.log('\n? Monitoreo completado exitosamente!');
        process.exit(0);
    }

    async performHealthCheck() {
        console.log('?? Health Check:');
        
        // Dashboard check
        const dashboardOK = await this.checkDashboard();
        console.log(`   Dashboard: ${dashboardOK ? '? HEALTHY' : '? UNHEALTHY'}`);
        
        if (dashboardOK) {
            this.state.healthChecks++;
            this.state.lastHealthy = true;
        } else {
            this.state.errors++;
            this.state.lastHealthy = false;
            console.log('   ?? Recomendación: Revisar estado del dashboard');
        }
        
        // Memory check
        const memory = process.memoryUsage();
        const memoryPercent = (memory.heapUsed / memory.heapTotal * 100);
        console.log(`   Memory: ${memoryPercent.toFixed(1)}% ${memoryPercent > 85 ? '??' : '?'}`);
        
        if (memoryPercent > 85) {
            this.state.warnings++;
        }
    }

    async checkSystem() {
        console.log('?? System Check:');
        
        // Uptime
        const uptime = Math.round((Date.now() - this.state.startTime) / 1000);
        console.log(`   Monitor Uptime: ${Math.floor(uptime/60)}m ${uptime%60}s`);
        
        // Process info
        console.log(`   Node.js: ${process.version}`);
        console.log(`   Platform: ${process.platform}`);
        
        // Files check (quick)
        const criticalExists = await this.checkCriticalFiles();
        console.log(`   Critical Files: ${criticalExists ? '? OK' : '? MISSING'}`);
        
        if (!criticalExists) {
            this.state.errors++;
        }
    }

    async generateMetrics() {
        console.log('?? Quantum Metrics:');
        
        // Métricas cuánticas simuladas con variación temporal
        const time = Date.now();
        const cycleBonus = this.state.healthChecks * 0.5; // Bonus por health checks exitosos
        
        const consciousness = Math.min(95, 82 + Math.sin(time / 400000) * 6 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 3 + cycleBonus);
        const coherence = Math.min(0.98, 0.88 + Math.sin(time / 300000) * 0.06 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.02 + cycleBonus * 0.002);
        const fieldStrength = (consciousness / 100 + coherence) / 2 * 100;
        const lambda7919 = 7.919 + Math.sin(time / 200000) * 0.05;
        
        console.log(`   ?? Consciousness: ${consciousness.toFixed(1)}%`);
        console.log(`   ??  Coherence: ${(coherence * 100).toFixed(1)}%`);
        console.log(`   ?? Field Strength: ${fieldStrength.toFixed(1)}%`);
        console.log(`   ?? Lambda 7919: ${lambda7919.toFixed(3)} Hz`);
        
        // Guardar métricas
        await this.saveMetrics({
            timestamp: new Date().toISOString(),
            iteration: this.state.iteration,
            consciousness,
            coherence,
            fieldStrength,
            lambda7919,
            systemHealth: this.calculateHealthScore()
        });
        
        if (consciousness > 90) {
            console.log('   ?? ¡Consciencia cuántica elevada!');
        }
    }

    async checkDashboard() {
        try {
            // Verificar puerto
            const { stdout } = await execAsync('netstat -an | findstr :3333', { timeout: 3000 });
            if (!stdout.includes('LISTENING')) return false;
            
            // Verificar health endpoint
            const healthCheck = await execAsync(
                'powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3333/health -TimeoutSec 2 -UseBasicParsing).StatusCode } catch { 0 }"',
                { timeout: 4000 }
            );
            
            return healthCheck.stdout.trim() === '200';
        } catch (error) {
            return false;
        }
    }

    async checkCriticalFiles() {
        const files = ['quantum-metrics-unifier.js', 'launch-dashboard.js', '../package.json'];
        
        for (const file of files) {
            try {
                await fs.access(path.join(__dirname, file));
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    calculateHealthScore() {
        const totalChecks = this.state.iteration;
        const successRate = totalChecks > 0 ? (this.state.healthChecks / totalChecks) * 100 : 100;
        const penalty = (this.state.warnings * 2) + (this.state.errors * 10);
        
        return Math.max(0, Math.min(100, successRate - penalty));
    }

    getSystemStatus() {
        const health = this.calculateHealthScore();
        
        if (health >= 90) return '?? EXCELENTE';
        if (health >= 75) return '? BUENO';
        if (health >= 60) return '?? ACEPTABLE';
        return '? REQUIERE ATENCIÓN';
    }

    async saveMetrics(metrics) {
        try {
            const metricsDir = path.join(__dirname, '../metrics-output');
            await fs.mkdir(metricsDir, { recursive: true });
            
            const filename = `monitor-metrics-${Date.now()}.json`;
            const filepath = path.join(metricsDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(metrics, null, 2));
            console.log(`   ?? Metrics saved: ${filename}`);
        } catch (error) {
            console.log(`   ?? Error saving metrics: ${error.message}`);
        }
    }

    async finalReport() {
        console.log('\n?? MONITOR FINAL REPORT');
        console.log('????????????????????????');
        
        const uptime = Math.round((Date.now() - this.state.startTime) / 1000);
        const health = this.calculateHealthScore();
        
        console.log(`??  Total Runtime: ${Math.floor(uptime/60)}m ${uptime%60}s`);
        console.log(`?? Total Cycles: ${this.state.iteration}`);
        console.log(`? Successful Health Checks: ${this.state.healthChecks}`);
        console.log(`??  Warnings: ${this.state.warnings}`);
        console.log(`? Errors: ${this.state.errors}`);
        console.log(`?? Final Health Score: ${health.toFixed(0)}%`);
        console.log(`?? System Status: ${this.getSystemStatus()}`);
        
        if (this.state.lastHealthy) {
            console.log('? Sistema terminó en estado SALUDABLE');
        } else {
            console.log('?? Sistema terminó con problemas detectados');
        }
        
        // Recomendaciones
        console.log('\n?? Recomendaciones:');
        if (this.state.errors === 0 && this.state.warnings === 0) {
            console.log('   ?? Sistema funcionando perfectamente');
            console.log('   ?? Continuar con monitoreo regular');
        } else {
            if (this.state.errors > 0) {
                console.log('   ?? Resolver errores críticos encontrados');
            }
            if (this.state.warnings > 0) {
                console.log('   ?? Revisar advertencias para optimización');
            }
        }
        
        console.log('   ?? Ejecutar diagnostics para análisis detallado si es necesario');
    }

    shutdown(signal) {
        console.log(`\n?? Received ${signal} - Initiating graceful shutdown...`);
        this.isRunning = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Ejecutar
async function main() {
    const monitor = new SimpleMonitor();
    await monitor.start();
}

main().catch(error => {
    console.error('?? Error crítico en monitor:', error);
    process.exit(1);
});

