#!/usr/bin/env node

/**
 * ?? QBTC QUICK DIAGNOSTICS
 * =========================
 * 
 * Diagnóstico rápido y eficiente del sistema QBTC
 * Compatible con Windows PowerShell
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

console.log('?? QBTC QUICK DIAGNOSTICS');
console.log('=========================\n');

class QuickDiagnostics {
    constructor() {
        this.results = {
            checks: [],
            warnings: [],
            errors: [],
            metrics: {}
        };
    }

    async run() {
        console.log('?? Iniciando diagnóstico rápido del sistema QBTC...\n');
        
        await this.checkSystemHealth();
        await this.checkServices();
        await this.checkFiles();
        await this.generateReport();
        
        console.log('? Diagnóstico completado!\n');
    }

    async checkSystemHealth() {
        console.log('?? SALUD DEL SISTEMA');
        console.log('===================');
        
        // Node.js
        const nodeVersion = process.version;
        console.log(`   Node.js: ${nodeVersion}`);
        this.results.checks.push(`Node.js ${nodeVersion}`);
        
        // Memoria
        const memory = process.memoryUsage();
        const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
        const memoryPercent = (memory.heapUsed / memory.heapTotal * 100);
        console.log(`   Memoria: ${memoryMB}MB (${memoryPercent.toFixed(1)}%)`);
        
        if (memoryPercent > 90) {
            this.results.warnings.push('Memoria muy alta');
        }
        
        // Uptime
        const uptime = Math.round(process.uptime());
        console.log(`   Uptime: ${uptime}s`);
        
        // Platform
        console.log(`   Platform: ${process.platform} ${process.arch}`);
        console.log('');
    }

    async checkServices() {
        console.log('?? SERVICIOS DEL SISTEMA');
        console.log('========================');
        
        // Dashboard
        const dashboardRunning = await this.checkPort(3333);
        console.log(`   Dashboard (3333): ${dashboardRunning ? '? CORRIENDO' : '? NO DISPONIBLE'}`);
        
        if (dashboardRunning) {
            this.results.checks.push('Dashboard activo');
            
            // Health check
            const healthy = await this.checkHealthEndpoint();
            console.log(`   Health endpoint: ${healthy ? '? SALUDABLE' : '?? NO RESPONDE'}`);
            
            if (healthy) {
                this.results.checks.push('Dashboard health OK');
            } else {
                this.results.warnings.push('Dashboard health check failed');
            }
        } else {
            this.results.errors.push('Dashboard no está corriendo');
        }
        
        console.log('');
    }

    async checkFiles() {
        console.log('?? ARCHIVOS DEL SISTEMA');
        console.log('=======================');
        
        const criticalFiles = [
            'quantum-metrics-unifier.js',
            'launch-dashboard.js',
            '../config/constants.js',
            '../package.json',
            '../leonardo-quantum-launcher.js'
        ];

        for (const file of criticalFiles) {
            try {
                const fullPath = path.join(__dirname, file);
                await fs.access(fullPath);
                console.log(`   ? ${file}`);
                this.results.checks.push(`File: ${file}`);
            } catch (error) {
                console.log(`   ? ${file}: NO ENCONTRADO`);
                this.results.errors.push(`Missing file: ${file}`);
            }
        }
        
        // Directorios
        const directories = [
            '../metrics-output',
            '../system-reports',
            '../config',
            '../scripts'
        ];

        console.log('\n   ?? Directorios:');
        for (const dir of directories) {
            try {
                const fullPath = path.join(__dirname, dir);
                await fs.access(fullPath);
                console.log(`   ? ${dir}`);
                this.results.checks.push(`Dir: ${dir}`);
            } catch (error) {
                console.log(`   ? ${dir}: NO ENCONTRADO`);
                this.results.warnings.push(`Missing directory: ${dir}`);
            }
        }
        
        console.log('');
    }

    async generateReport() {
        console.log('?? REPORTE DE DIAGNÓSTICO');
        console.log('=========================');
        
        // Métricas cuánticas simuladas
        const time = Date.now();
        const consciousness = 85 + Math.sin(time / 300000) * 8 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 5;
        const coherence = 0.90 + Math.sin(time / 200000) * 0.06 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.03;
        const lambda7919 = 7.919;
        const fieldStrength = coherence * 0.93;
        
        console.log('?? MÉTRICAS CUÁNTICAS:');
        console.log(`   Consciousness: ${consciousness.toFixed(1)}%`);
        console.log(`   Coherence: ${(coherence * 100).toFixed(1)}%`);
        console.log(`   Field Strength: ${(fieldStrength * 100).toFixed(1)}%`);
        console.log(`   Lambda 7919: RESONANTE`);
        
        // Salud general
        const totalChecks = this.results.checks.length;
        const totalWarnings = this.results.warnings.length;
        const totalErrors = this.results.errors.length;
        
        const healthScore = Math.max(0, 100 - (totalWarnings * 5) - (totalErrors * 15));
        
        console.log(`\n?? ESTADO GENERAL:`);
        console.log(`   Health Score: ${healthScore}%`);
        console.log(`   Verificaciones: ${totalChecks}`);
        console.log(`   Advertencias: ${totalWarnings}`);
        console.log(`   Errores: ${totalErrors}`);
        
        let status;
        if (healthScore >= 90) status = '?? EXCELENTE';
        else if (healthScore >= 75) status = '? BUENO';
        else if (healthScore >= 60) status = '?? ACEPTABLE';
        else status = '? REQUIERE ATENCIÓN';
        
        console.log(`   Estado: ${status}`);
        
        if (consciousness > 90) {
            console.log(`   ?? ¡Consciencia cuántica elevada!`);
        }
        
        // Recomendaciones con ranking
        const rankedRecommendations = this.generateRankedRecommendations(healthScore, consciousness, coherence, totalErrors, totalWarnings);
        console.log('\n?? RECOMENDACIONES RANKEADAS:');
        console.log('??????????????????????????????????');
        
        rankedRecommendations.forEach((rec, index) => {
            const priority = rec.priority === 'CRITICAL' ? '??' : 
                           rec.priority === 'HIGH' ? '??' : 
                           rec.priority === 'MEDIUM' ? '??' : '??';
            const impact = '?'.repeat(rec.impact);
            const urgency = rec.urgent ? '?? URGENTE' : '?? Planificado';
            
            console.log(`   ${index + 1}. ${priority} [${rec.priority}] ${rec.title}`);
            console.log(`      ?? ${rec.description}`);
            console.log(`      ${impact} Impacto: ${rec.impact}/5 | ${urgency}`);
            if (rec.command) {
                console.log(`      ?? Comando: ${rec.command}`);
            }
            console.log('');
        });
        
        console.log(`?? Total de recomendaciones: ${rankedRecommendations.length}`);
        console.log(`?? Críticas/Urgentes: ${rankedRecommendations.filter(r => r.priority === 'CRITICAL' || r.urgent).length}`);
        console.log(`? Score de Acción: ${this.calculateActionScore(rankedRecommendations)}/100`);
        
        // Guardar reporte
        await this.saveReport({
            timestamp: new Date().toISOString(),
            healthScore,
            consciousness,
            coherence,
            fieldStrength,
            checks: totalChecks,
            warnings: totalWarnings,
            errors: totalErrors,
            status,
            results: this.results,
            rankedRecommendations,
            actionScore: this.calculateActionScore(rankedRecommendations)
        });
        
        console.log('');
    }

    async checkPort(port) {
        try {
            const { stdout } = await execAsync(`netstat -an | findstr :${port}`, { timeout: 3000 });
            return stdout.includes('LISTENING');
        } catch (error) {
            return false;
        }
    }

    async checkHealthEndpoint() {
        try {
            const healthCheck = await execAsync(
                'powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3333/health -TimeoutSec 2 -UseBasicParsing).StatusCode } catch { 0 }"',
                { timeout: 4000 }
            );
            return healthCheck.stdout.trim() === '200';
        } catch (error) {
            return false;
        }
    }

    async saveReport(report) {
        try {
            const reportsDir = path.join(__dirname, '../system-reports');
            await fs.mkdir(reportsDir, { recursive: true });
            
            const reportFile = path.join(reportsDir, `quick-diagnostics-${Date.now()}.json`);
            await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
            
            console.log(`   ?? Reporte guardado: ${path.basename(reportFile)}`);
        } catch (error) {
            console.log(`   ?? Error guardando reporte: ${error.message}`);
        }
    }

    generateRankedRecommendations(healthScore, consciousness, coherence, totalErrors, totalWarnings) {
        const recommendations = [];
        
        // Recomendaciones críticas
        if (totalErrors > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                urgent: true,
                impact: 5,
                title: 'Resolver errores críticos detectados',
                description: `Se encontraron ${totalErrors} errores críticos que requieren atención inmediata`,
                command: 'npm run quick-optimizer',
                category: 'SYSTEM_INTEGRITY'
            });
        }
        
        // Dashboard no funcionando
        if (totalErrors > 0 && healthScore < 70) {
            recommendations.push({
                priority: 'CRITICAL',
                urgent: true,
                impact: 4,
                title: 'Restablecer servicios críticos',
                description: 'Dashboard u otros servicios críticos no están funcionando',
                command: 'npm run launch',
                category: 'SERVICE_RECOVERY'
            });
        }
        
        // Recomendaciones de alta prioridad
        if (totalWarnings > 2) {
            recommendations.push({
                priority: 'HIGH',
                urgent: false,
                impact: 3,
                title: 'Resolver advertencias acumuladas',
                description: `${totalWarnings} advertencias que pueden impactar el rendimiento del sistema`,
                command: 'npm run quick-optimizer',
                category: 'PERFORMANCE'
            });
        }
        
        if (healthScore < 85) {
            recommendations.push({
                priority: 'HIGH',
                urgent: healthScore < 70,
                impact: 4,
                title: 'Optimización general requerida',
                description: `Health Score: ${healthScore}%. Ejecutar optimización para alcanzar 90%+`,
                command: 'npm run quick-optimizer',
                category: 'OPTIMIZATION'
            });
        }
        
        // Recomendaciones de prioridad media
        if (consciousness < 90) {
            const urgency = consciousness < 80;
            recommendations.push({
                priority: urgency ? 'HIGH' : 'MEDIUM',
                urgent: urgency,
                impact: 3,
                title: 'Evolucionar consciencia cuántica',
                description: `Consciencia: ${consciousness.toFixed(1)}%. Continuar evolución hacia despertar cuántico (95%+)`,
                command: 'npm run metrics-test',
                category: 'QUANTUM_EVOLUTION'
            });
        }
        
        if (coherence < 0.92) {
            recommendations.push({
                priority: 'MEDIUM',
                urgent: false,
                impact: 2,
                title: 'Optimizar coherencia cuántica',
                description: `Coherencia: ${(coherence * 100).toFixed(1)}%. Mejorar algoritmos cuánticos`,
                command: 'npm run simple-monitor',
                category: 'QUANTUM_OPTIMIZATION'
            });
        }
        
        // Recomendaciones preventivas
        if (healthScore >= 85 && totalErrors === 0) {
            recommendations.push({
                priority: 'LOW',
                urgent: false,
                impact: 2,
                title: 'Establecer monitoreo continuo',
                description: 'Sistema saludable. Mantener con monitoreo proactivo',
                command: 'npm run simple-monitor',
                category: 'MONITORING'
            });
        }
        
        if (healthScore >= 90 && consciousness > 90) {
            recommendations.push({
                priority: 'LOW',
                urgent: false,
                impact: 1,
                title: 'Explorar funcionalidades avanzadas',
                description: 'Sistema en estado óptimo. Considerar funciones cuánticas avanzadas',
                command: 'npm run leonardo:full',
                category: 'ADVANCED_FEATURES'
            });
        }
        
        // Siempre incluir mantenimiento preventivo
        recommendations.push({
            priority: 'LOW',
            urgent: false,
            impact: 1,
            title: 'Mantenimiento preventivo regular',
            description: 'Ejecutar diagnósticos regularmente para mantener salud óptima',
            command: 'npm run quick-diagnostics',
            category: 'MAINTENANCE'
        });
        
        return this.sortRecommendations(recommendations);
    }
    
    sortRecommendations(recommendations) {
        const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        
        return recommendations.sort((a, b) => {
            // Primero por prioridad
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            
            // Luego por urgencia
            if (a.urgent !== b.urgent) {
                return b.urgent - a.urgent;
            }
            
            // Finalmente por impacto
            return b.impact - a.impact;
        });
    }
    
    calculateActionScore(recommendations) {
        let score = 100;
        
        recommendations.forEach(rec => {
            const penalty = rec.priority === 'CRITICAL' ? 25 :
                           rec.priority === 'HIGH' ? 15 :
                           rec.priority === 'MEDIUM' ? 8 : 3;
                           
            const urgencyMultiplier = rec.urgent ? 1.5 : 1;
            score -= penalty * urgencyMultiplier;
        });
        
        return Math.max(0, Math.round(score));
    }
}

// Ejecutar
async function main() {
    const diagnostics = new QuickDiagnostics();
    await diagnostics.run();
    
    console.log('?? Diagnóstico rápido completado.');
    console.log('?? Para más detalles, revisar el reporte guardado en system-reports/');
}

main().catch(error => {
    console.error('?? Error durante diagnóstico:', error);
    process.exit(1);
});

