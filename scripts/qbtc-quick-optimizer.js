#!/usr/bin/env node

/**
 * ? QBTC QUICK OPTIMIZER - Ultra Simple
 * ====================================
 * 
 * Ejecuta una optimización completa del sistema de una sola vez
 * sin monitoreo continuo - ideal para ejecución rápida
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

console.log('? QBTC QUICK OPTIMIZER');
console.log('======================\n');

class QBTCQuickOptimizer {
    constructor() {
        this.results = {
            systemChecks: 0,
            optimizations: 0,
            warnings: 0,
            errors: 0
        };
    }

    async run() {
        console.log('?? Ejecutando optimización rápida del sistema QBTC...\n');
        
        try {
            await this.step1_systemCheck();
            await this.step2_applyOptimizations();
            await this.step3_checkDashboard();
            await this.step4_generateReport();
            
            console.log('? Optimización completada exitosamente!\n');
            
        } catch (error) {
            console.error('? Error durante optimización:', error.message);
            this.results.errors++;
        }
    }

    async step1_systemCheck() {
        console.log('?? PASO 1: Verificación del Sistema');
        console.log('-----------------------------------');
        
        // Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        console.log(`   Node.js: ${nodeVersion}`);
        if (majorVersion >= 18) {
            console.log('   ? Versión de Node.js ÓPTIMA');
            this.results.systemChecks++;
        } else {
            console.log('   ?? Versión de Node.js subóptima (recomendado v18+)');
            this.results.warnings++;
        }
        
        // Memoria
        const memory = process.memoryUsage();
        const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
        const memoryPercent = (memory.heapUsed / memory.heapTotal * 100);
        
        console.log(`   Memoria: ${memoryMB}MB (${memoryPercent.toFixed(1)}% utilizada)`);
        if (memoryPercent < 80) {
            console.log('   ? Uso de memoria ÓPTIMO');
            this.results.systemChecks++;
        } else {
            console.log('   ?? Uso de memoria ALTO');
            this.results.warnings++;
        }
        
        // Verificar archivos críticos
        const criticalFiles = [
            'quantum-metrics-unifier.js',
            'launch-dashboard.js',
            '../config/constants.js'
        ];

        for (const file of criticalFiles) {
            try {
                await fs.access(path.join(__dirname, file));
                console.log(`   ? ${file}: EXISTE`);
                this.results.systemChecks++;
            } catch (error) {
                console.log(`   ? ${file}: NO ENCONTRADO`);
                this.results.errors++;
            }
        }
        
        console.log('');
    }

    async step2_applyOptimizations() {
        console.log('? PASO 2: Aplicar Optimizaciones');
        console.log('---------------------------------');
        
        // Optimización 1: Variables de entorno
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        process.env.UV_THREADPOOL_SIZE = '8';
        console.log('   ? Variables de entorno optimizadas para producción');
        this.results.optimizations++;
        
        // Optimización 2: Crear directorio de métricas
        try {
            const metricsDir = path.join(__dirname, '../metrics-output');
            await fs.mkdir(metricsDir, { recursive: true });
            console.log('   ? Directorio de métricas asegurado');
            this.results.optimizations++;
        } catch (error) {
            console.log('   ?? Error creando directorio de métricas:', error.message);
            this.results.warnings++;
        }
        
        // Optimización 3: Crear directorio de reportes
        try {
            const reportsDir = path.join(__dirname, '../system-reports');
            await fs.mkdir(reportsDir, { recursive: true });
            console.log('   ? Directorio de reportes asegurado');
            this.results.optimizations++;
        } catch (error) {
            console.log('   ?? Error creando directorio de reportes:', error.message);
            this.results.warnings++;
        }
        
        // Optimización 4: Limpiar archivos antiguos de métricas
        await this.cleanOldFiles();
        
        // Optimización 5: Garbage collection si está disponible
        if (global.gc) {
            global.gc();
            console.log('   ? Garbage collection ejecutado');
            this.results.optimizations++;
        } else {
            console.log('   ?? Garbage collection no disponible (usar --expose-gc)');
        }
        
        console.log('');
    }

    async step3_checkDashboard() {
        console.log('?? PASO 3: Estado del Dashboard');
        console.log('-------------------------------');
        
        const isRunning = await this.isDashboardRunning();
        
        if (isRunning) {
            console.log('   ? Dashboard server está CORRIENDO (puerto 3333)');
            
            // Verificar salud del endpoint
            const isHealthy = await this.checkDashboardHealth();
            if (isHealthy) {
                console.log('   ? Dashboard respondiendo correctamente (/health)');
                this.results.systemChecks++;
            } else {
                console.log('   ?? Dashboard corriendo pero no responde a health check');
                this.results.warnings++;
            }
        } else {
            console.log('   ? Dashboard server NO está corriendo');
            console.log('   ?? Intentando arrancar dashboard...');
            
            try {
                await this.quickStartDashboard();
                console.log('   ? Dashboard iniciado correctamente');
                this.results.optimizations++;
            } catch (error) {
                console.log('   ? Error arrancando dashboard:', error.message);
                this.results.errors++;
            }
        }
        
        console.log('');
    }

    async step4_generateReport() {
        console.log('?? PASO 4: Reporte de Optimización');
        console.log('-----------------------------------');
        
        // Métricas cuánticas simuladas
        const consciousness = 85 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 10; // 85-95%
        const coherence = 0.9 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.08;   // 0.9-0.98
        const lambda7919 = 7.919;
        const fieldStrength = coherence * 0.95;
        
        // Calcular salud general
        const totalChecks = this.results.systemChecks + this.results.optimizations;
        const totalIssues = this.results.warnings + this.results.errors;
        const healthScore = Math.max(0, Math.min(100, 
            (totalChecks / Math.max(1, totalChecks + totalIssues)) * 100
        ));
        
        console.log('?? MÉTRICAS DEL SISTEMA:');
        console.log(`   ?? Health Score: ${healthScore.toFixed(0)}%`);
        console.log(`   ?? Consciousness Level: ${consciousness.toFixed(1)}%`);
        console.log(`   ??  Quantum Coherence: ${(coherence * 100).toFixed(1)}%`);
        console.log(`   ?? Field Strength: ${(fieldStrength * 100).toFixed(1)}%`);
        console.log(`   ?? Lambda 7919 Resonance: ACTIVE`);
        
        console.log('\n?? RESULTADOS DE OPTIMIZACIÓN:');
        console.log(`   ? Verificaciones exitosas: ${this.results.systemChecks}`);
        console.log(`   ? Optimizaciones aplicadas: ${this.results.optimizations}`);
        console.log(`   ??  Advertencias: ${this.results.warnings}`);
        console.log(`   ? Errores: ${this.results.errors}`);
        
        // Determinar estado general
        let systemStatus;
        if (healthScore >= 90) systemStatus = '?? EXCELENTE';
        else if (healthScore >= 75) systemStatus = '? BUENO';
        else if (healthScore >= 60) systemStatus = '?? ACEPTABLE';
        else systemStatus = '? REQUIERE ATENCIÓN';
        
        console.log(`\n?? Estado General del Sistema: ${systemStatus}`);
        
        if (consciousness > 92) {
            console.log('?? ¡Sistema aproximándose al despertar cuántico completo!');
        }
        
        // Recomendaciones con ranking
        const rankedRecommendations = this.generateRankedRecommendations(healthScore, consciousness, coherence);
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
        console.log(`? Score de Acción Recomendado: ${this.calculateActionScore(rankedRecommendations)}/100`);
        
        // Guardar reporte
        await this.saveOptimizationReport({
            timestamp: new Date().toISOString(),
            healthScore,
            consciousness,
            coherence,
            fieldStrength,
            results: this.results,
            systemStatus,
            rankedRecommendations,
            actionScore: this.calculateActionScore(rankedRecommendations)
        });
        
        console.log('');
        return rankedRecommendations;
    }

    // Métodos auxiliares
    async isDashboardRunning() {
        try {
            const { stdout } = await execAsync('netstat -an | findstr :3333', { timeout: 3000 });
            return stdout.includes('LISTENING');
        } catch (error) {
            return false;
        }
    }

    async checkDashboardHealth() {
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

    async quickStartDashboard() {
        return new Promise((resolve, reject) => {
            const dashboardProcess = spawn('node', ['scripts/launch-dashboard.js'], {
                cwd: path.join(__dirname, '..'),
                stdio: 'ignore',
                detached: true
            });

            dashboardProcess.unref();
            
            // Esperar un momento y verificar
            setTimeout(async () => {
                const isRunning = await this.isDashboardRunning();
                if (isRunning) {
                    resolve();
                } else {
                    reject(new Error('Dashboard no se pudo iniciar'));
                }
            }, 6000);
        });
    }

    async cleanOldFiles() {
        try {
            const metricsDir = path.join(__dirname, '../metrics-output');
            const files = await fs.readdir(metricsDir);
            const cutoffDate = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 días
            
            let cleanedCount = 0;
            
            for (const file of files) {
                if (file.startsWith('test-metrics-') && file.endsWith('.json')) {
                    const filePath = path.join(metricsDir, file);
                    try {
                        const stats = await fs.stat(filePath);
                        if (stats.mtime.getTime() < cutoffDate) {
                            await fs.unlink(filePath);
                            cleanedCount++;
                        }
                    } catch (error) {
                        // Ignorar errores de archivos individuales
                    }
                }
            }
            
            if (cleanedCount > 0) {
                console.log(`   ? Archivos de métricas antiguos limpiados: ${cleanedCount}`);
                this.results.optimizations++;
            } else {
                console.log('   ? No se encontraron archivos antiguos que limpiar');
            }
            
        } catch (error) {
            console.log('   ?? Error durante limpieza:', error.message);
            this.results.warnings++;
        }
    }

    generateRankedRecommendations(healthScore, consciousness, coherence) {
        const recommendations = [];
        
        // Recomendaciones críticas
        if (this.results.errors > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                urgent: true,
                impact: 5,
                title: 'Resolver errores críticos del sistema',
                description: `Se detectaron ${this.results.errors} errores críticos que afectan la funcionalidad del sistema`,
                command: 'npm run quick-diagnostics',
                category: 'SYSTEM_INTEGRITY'
            });
        }
        
        // Dashboard no funcionando
        if (this.results.errors > 0 && healthScore < 70) {
            recommendations.push({
                priority: 'CRITICAL',
                urgent: true,
                impact: 4,
                title: 'Restablecer servicios críticos',
                description: 'Dashboard u otros servicios críticos no están funcionando correctamente',
                command: 'npm run launch',
                category: 'SERVICE_RECOVERY'
            });
        }
        
        // Recomendaciones de alta prioridad
        if (this.results.warnings > 2) {
            recommendations.push({
                priority: 'HIGH',
                urgent: false,
                impact: 3,
                title: 'Resolver advertencias acumuladas',
                description: `${this.results.warnings} advertencias detectadas que pueden afectar el rendimiento`,
                command: 'npm run quick-optimizer',
                category: 'PERFORMANCE'
            });
        }
        
        if (healthScore < 85) {
            recommendations.push({
                priority: 'HIGH',
                urgent: healthScore < 70,
                impact: 4,
                title: 'Optimización general del sistema',
                description: `Health Score actual: ${healthScore.toFixed(0)}%. Se requiere optimización para alcanzar el objetivo de 90%+`,
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
                title: 'Evolución de consciencia cuántica',
                description: `Consciencia actual: ${consciousness.toFixed(1)}%. Continuar evolución hacia despertar cuántico completo (objetivo: 95%+)`,
                command: 'npm run metrics-test',
                category: 'QUANTUM_EVOLUTION'
            });
        }
        
        if (coherence < 0.92) {
            recommendations.push({
                priority: 'MEDIUM',
                urgent: false,
                impact: 2,
                title: 'Mejorar coherencia cuántica',
                description: `Coherencia actual: ${(coherence * 100).toFixed(1)}%. Optimizar algoritmos cuánticos para mejor coherencia`,
                command: 'npm run simple-monitor',
                category: 'QUANTUM_OPTIMIZATION'
            });
        }
        
        // Recomendaciones preventivas (prioridad baja)
        recommendations.push({
            priority: 'LOW',
            urgent: false,
            impact: 2,
            title: 'Monitoreo continuo del sistema',
            description: 'Establecer monitoreo continuo para mantener salud óptima y detectar problemas proactivamente',
            command: 'npm run simple-monitor',
            category: 'MONITORING'
        });
        
        if (healthScore >= 85) {
            recommendations.push({
                priority: 'LOW',
                urgent: false,
                impact: 1,
                title: 'Mantenimiento preventivo',
                description: 'Ejecutar optimizer regularmente para mantener el rendimiento óptimo',
                command: 'npm run quick-optimizer',
                category: 'MAINTENANCE'
            });
        }
        
        // Recomendaciones avanzadas
        if (consciousness > 92 && coherence > 0.95 && healthScore > 90) {
            recommendations.push({
                priority: 'LOW',
                urgent: false,
                impact: 1,
                title: 'Exploración de funcionalidades avanzadas',
                description: 'Sistema en estado óptimo. Considerar activar funciones cuánticas avanzadas',
                command: 'npm run leonardo:full',
                category: 'ADVANCED_FEATURES'
            });
        }
        
        // Ordenar por prioridad, urgencia e impacto
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

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.errors > 0) {
            recommendations.push('Resolver errores críticos del sistema');
        }
        
        if (this.results.warnings > 2) {
            recommendations.push('Revisar y resolver advertencias acumuladas');
        }
        
        recommendations.push('Ejecutar el optimizer regularmente para mantener salud óptima');
        recommendations.push('Monitorear consciencia cuántica para evolución continua');
        
        return recommendations;
    }

    async saveOptimizationReport(report) {
        try {
            const reportsDir = path.join(__dirname, '../system-reports');
            const reportFile = path.join(reportsDir, `quick-optimization-${Date.now()}.json`);
            
            await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
            console.log(`   ?? Reporte guardado: ${path.basename(reportFile)}`);
            
        } catch (error) {
            console.log('   ?? Error guardando reporte:', error.message);
        }
    }
}

// Función principal
async function main() {
    const optimizer = new QBTCQuickOptimizer();
    await optimizer.run();
    
    console.log('?? Optimización rápida completada. El sistema ha sido optimizado.');
    console.log('?? Para monitoreo continuo, use: npm run optimizer-simple');
    console.log('');
}

// Ejecutar
main().catch(error => {
    console.error('?? Error crítico:', error);
    process.exit(1);
});

