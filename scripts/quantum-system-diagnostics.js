#!/usr/bin/env node

/**
 * 🔬 QUANTUM SYSTEM DIAGNOSTICS - QBTC SYSTEM
 * ===========================================
 * 
 * Generador completo de diagnósticos del sistema QBTC
 * - Análisis de componentes y servicios
 * - Verificación de puertos y conectividad  
 * - Métricas de rendimiento y salud
 * - Reporte de status multidimensional
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

console.log('🔬 QBTC QUANTUM SYSTEM DIAGNOSTICS');
console.log('==================================\n');

class QuantumSystemDiagnostics {
    constructor() {
        this.diagnostics = {
            timestamp: new Date().toISOString(),
            system: {},
            components: {},
            network: {},
            performance: {},
            quantum: {},
            recommendations: []
        };
    }

    async runCompleteDiagnostics() {
        console.log('🔍 Iniciando diagnóstico completo del sistema QBTC...\n');
        
        try {
            // 1. Diagnóstico del sistema base
            await this.diagnoseSystemBase();
            
            // 2. Diagnóstico de componentes
            await this.diagnoseComponents();
            
            // 3. Diagnóstico de red y puertos
            await this.diagnoseNetwork();
            
            // 4. Diagnóstico de rendimiento
            await this.diagnosePerformance();
            
            // 5. Diagnóstico cuántico
            await this.diagnoseQuantumMetrics();
            
            // 6. Generar recomendaciones
            await this.generateRecommendations();
            
            // 7. Crear reporte completo
            await this.generateReport();
            
            console.log('✅ Diagnóstico completo finalizado');
            
        } catch (error) {
            console.error('❌ Error durante el diagnóstico:', error.message);
        }
    }

    async diagnoseSystemBase() {
        console.log('🖥️  Analizando sistema base...');
        
        try {
            // Información del sistema
            const systemInfo = {
                platform: process.platform,
                architecture: process.arch,
                nodeVersion: process.version,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                pid: process.pid,
                cwd: process.cwd(),
                timestamp: new Date().toISOString()
            };

            // Verificar Node.js y npm
            try {
                const { stdout: nodeVersion } = await execAsync('node --version');
                const { stdout: npmVersion } = await execAsync('npm --version');
                systemInfo.nodeVersionDetailed = nodeVersion.trim();
                systemInfo.npmVersion = npmVersion.trim();
            } catch (error) {
                systemInfo.packageManagerError = error.message;
            }

            this.diagnostics.system = {
                ...systemInfo,
                healthStatus: systemInfo.nodeVersion.startsWith('v18.') || 
                             systemInfo.nodeVersion.startsWith('v20.') || 
                             systemInfo.nodeVersion.startsWith('v22.') ? 'HEALTHY' : 'WARNING',
                memoryUsagePercent: ((systemInfo.memory.heapUsed / systemInfo.memory.heapTotal) * 100).toFixed(2)
            };

            console.log(`   ✅ Node.js: ${systemInfo.nodeVersion}`);
            console.log(`   ✅ Platform: ${systemInfo.platform} ${systemInfo.architecture}`);
            console.log(`   ✅ Memory: ${(systemInfo.memory.heapUsed / 1024 / 1024).toFixed(2)}MB used`);
            
        } catch (error) {
            console.error('   ❌ Error en diagnóstico del sistema:', error.message);
            this.diagnostics.system.error = error.message;
        }
    }

    async diagnoseComponents() {
        console.log('🧩 Analizando componentes del sistema...');
        
        const components = {
            scripts: {},
            config: {},
            services: {},
            dependencies: {}
        };

        try {
            // Verificar scripts principales
            const scriptsToCheck = [
                'quantum-metrics-unifier.js',
                'test-metrics-unifier.js', 
                'start-dashboard-server.js',
                'test-dashboard-server.js',
                'launch-dashboard.js'
            ];

            for (const script of scriptsToCheck) {
                const scriptPath = path.join(__dirname, script);
                try {
                    const stats = await fs.stat(scriptPath);
                    components.scripts[script] = {
                        exists: true,
                        size: stats.size,
                        modified: stats.mtime,
                        status: 'AVAILABLE'
                    };
                } catch (error) {
                    components.scripts[script] = {
                        exists: false,
                        status: 'MISSING',
                        error: error.message
                    };
                }
            }

            // Verificar archivos de configuración
            const configFiles = [
                '../package.json',
                '../config/constants.js',
                '../services/binance-data-service.js',
                '../utils/symbol-validation-service.js'
            ];

            for (const configFile of configFiles) {
                const configPath = path.join(__dirname, configFile);
                try {
                    const stats = await fs.stat(configPath);
                    components.config[configFile] = {
                        exists: true,
                        size: stats.size,
                        modified: stats.mtime,
                        status: 'AVAILABLE'
                    };
                } catch (error) {
                    components.config[configFile] = {
                        exists: false,
                        status: 'MISSING',
                        error: error.message
                    };
                }
            }

            // Verificar dependencias del package.json
            try {
                const packageJsonPath = path.join(__dirname, '../package.json');
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                
                components.dependencies = {
                    production: Object.keys(packageJson.dependencies || {}),
                    development: Object.keys(packageJson.devDependencies || {}),
                    scripts: Object.keys(packageJson.scripts || {}),
                    packageInfo: {
                        name: packageJson.name,
                        version: packageJson.version,
                        type: packageJson.type
                    }
                };
            } catch (error) {
                components.dependencies.error = error.message;
            }

            this.diagnostics.components = components;
            
            const scriptsFound = Object.values(components.scripts).filter(s => s.exists).length;
            console.log(`   ✅ Scripts: ${scriptsFound}/${scriptsToCheck.length} encontrados`);
            console.log(`   ✅ Dependencies: ${components.dependencies.production?.length || 0} production`);
            
        } catch (error) {
            console.error('   ❌ Error en diagnóstico de componentes:', error.message);
            this.diagnostics.components.error = error.message;
        }
    }

    async diagnoseNetwork() {
        console.log('🌐 Analizando conectividad de red...');
        
        const network = {
            ports: {},
            connectivity: {},
            services: {}
        };

        try {
            // Verificar puerto principal (3333) usando netstat
            try {
                const { stdout } = await execAsync('netstat -an | findstr :3333');
                if (stdout.includes('LISTENING') || stdout.includes(':3333')) {
                    network.ports['3333'] = {
                        status: 'ACTIVE',
                        service: 'Dashboard Server',
                        port: '3333',
                        protocol: 'TCP'
                    };
                } else {
                    network.ports['3333'] = {
                        status: 'INACTIVE',
                        service: 'Dashboard Server',
                        port: '3333'
                    };
                }
            } catch (error) {
                network.ports['3333'] = {
                    status: 'UNKNOWN',
                    service: 'Dashboard Server',
                    error: 'Cannot verify port status'
                };
            }

            // Verificar servicios usando curl/powershell
            try {
                const { stdout } = await execAsync('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3333/health -TimeoutSec 2).StatusCode } catch { 0 }"');
                if (stdout.trim() === '200') {
                    network.services.health = {
                        status: 'ACTIVE',
                        endpoint: '/health',
                        responseCode: 200
                    };
                } else {
                    network.services.health = {
                        status: 'INACTIVE',
                        endpoint: '/health',
                        note: 'Service not responding'
                    };
                }
            } catch (error) {
                network.services.health = {
                    status: 'UNKNOWN',
                    endpoint: '/health',
                    error: 'Cannot test service'
                };
            }

            // Simular verificación de métricas (sin fetch)
            network.services.metrics = {
                status: network.ports['3333'].status === 'ACTIVE' ? 'ASSUMED_ACTIVE' : 'INACTIVE',
                endpoint: '/api/metrics',
                note: 'Status inferred from port availability'
            };

            // Verificar conectividad a Binance (simulado)
            network.services.binance = {
                status: 'NOT_CONFIGURED',
                note: 'API keys not configured for testing',
                endpoint: 'https://fapi.binance.com'
            };

            this.diagnostics.network = network;
            
            const activeServices = Object.values(network.services).filter(s => s.status === 'ACTIVE').length;
            console.log(`   ${network.ports['3333']?.status === 'ACTIVE' ? '✅' : '❌'} Puerto 3333: ${network.ports['3333']?.status || 'UNKNOWN'}`);
            console.log(`   ✅ Servicios activos: ${activeServices}`);
            
        } catch (error) {
            console.error('   ❌ Error en diagnóstico de red:', error.message);
            this.diagnostics.network.error = error.message;
        }
    }

    async diagnosePerformance() {
        console.log('⚡ Analizando rendimiento del sistema...');
        
        const performance = {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            metrics: {},
            files: {}
        };

        try {
            // Calcular métricas de rendimiento
            const memoryUsage = performance.memory;
            performance.metrics = {
                memoryUsagePercent: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2),
                memoryUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
                memoryTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
                uptimeHours: (performance.uptime / 3600).toFixed(2),
                uptimeFormatted: this.formatUptime(performance.uptime)
            };

            // Verificar archivos de métricas generados
            try {
                const metricsDir = path.join(__dirname, '../metrics-output');
                const files = await fs.readdir(metricsDir);
                
                performance.files = {
                    metricsGenerated: files.length,
                    files: files.filter(f => f.endsWith('.json')),
                    latestAvailable: files.includes('latest-test-metrics.json')
                };
            } catch (error) {
                performance.files = {
                    error: 'Metrics directory not accessible',
                    metricsGenerated: 0
                };
            }

            // Métricas de salud general
            performance.healthScore = this.calculateHealthScore(performance);
            
            this.diagnostics.performance = performance;
            
            console.log(`   ✅ Memory: ${performance.metrics.memoryUsagePercent}% used`);
            console.log(`   ✅ Uptime: ${performance.metrics.uptimeFormatted}`);
            console.log(`   ✅ Metrics files: ${performance.files.metricsGenerated || 0}`);
            console.log(`   ✅ Health score: ${performance.healthScore}%`);
            
        } catch (error) {
            console.error('   ❌ Error en diagnóstico de rendimiento:', error.message);
            this.diagnostics.performance.error = error.message;
        }
    }

    async diagnoseQuantumMetrics() {
        console.log('⚛️  Analizando métricas cuánticas...');
        
        const quantum = {
            constants: {},
            metrics: {},
            consciousness: {},
            status: 'UNKNOWN'
        };

        try {
            // Constantes cuánticas conocidas
            quantum.constants = {
                lambda7919: 7.919,
                phiGolden: 1.618,
                coherenceTarget: 0.963,
                consciousnessTarget: 85.0
            };

            // Intentar obtener métricas actuales del servidor
            try {
                const response = await fetch('http://localhost:3333/api/metrics');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        quantum.metrics = {
                            coherence: data.data.quantum?.coherence || 0,
                            lambdaResonance: data.data.quantum?.lambdaResonance || 0,
                            fieldStrength: data.data.quantum?.fieldStrength || 0,
                            entropy: data.data.quantum?.entropy || 0,
                            lastUpdate: data.data.timestamp
                        };
                        
                        quantum.consciousness = {
                            level: data.data.consciousness?.level || 0,
                            awakening: data.data.consciousness?.awakening || false,
                            enlightenment: data.data.consciousness?.enlightenment || false,
                            chakrasActive: data.data.consciousness?.chakrasActive || 0
                        };
                        
                        quantum.status = 'ACTIVE';
                    }
                }
            } catch (error) {
                quantum.metricsError = error.message;
                quantum.status = 'INACTIVE';
            }

            // Generar métricas simuladas si no hay servidor activo
            if (quantum.status !== 'ACTIVE') {
                const now = Date.now();
                quantum.metrics = {
                    coherence: Math.min(0.99, Math.max(0.85, 0.92 + Math.sin(now / 100000) * 0.05)),
                    lambdaResonance: Math.min(1.0, Math.max(0.5, 0.8 + Math.cos(now / 80000) * 0.15)),
                    fieldStrength: 0.8,
                    entropy: 0.3,
                    source: 'SIMULATED'
                };
                
                quantum.consciousness = {
                    level: 87.5,
                    awakening: true,
                    enlightenment: false,
                    chakrasActive: 10,
                    source: 'SIMULATED'
                };
                
                quantum.status = 'SIMULATED';
            }

            // Calcular score cuántico
            quantum.quantumScore = this.calculateQuantumScore(quantum.metrics);
            
            this.diagnostics.quantum = quantum;
            
            console.log(`   ${quantum.status === 'ACTIVE' ? '✅' : '⚛️ '} Status: ${quantum.status}`);
            console.log(`   ✅ Coherence: ${(quantum.metrics.coherence * 100).toFixed(1)}%`);
            console.log(`   ✅ Consciousness: ${quantum.consciousness.level.toFixed(1)}%`);
            console.log(`   ✅ Quantum Score: ${quantum.quantumScore}%`);
            
        } catch (error) {
            console.error('   ❌ Error en diagnóstico cuántico:', error.message);
            this.diagnostics.quantum.error = error.message;
        }
    }

    async generateRecommendations() {
        console.log('💡 Generando recomendaciones...');
        
        const recommendations = [];

        // Recomendaciones basadas en el sistema
        if (this.diagnostics.system.healthStatus === 'WARNING') {
            recommendations.push({
                type: 'SYSTEM',
                priority: 'HIGH',
                issue: 'Node.js version compatibility',
                recommendation: 'Upgrade to Node.js 18+ for optimal performance'
            });
        }

        // Recomendaciones basadas en componentes
        const missingScripts = Object.entries(this.diagnostics.components.scripts || {})
            .filter(([_, script]) => !script.exists);
        
        if (missingScripts.length > 0) {
            recommendations.push({
                type: 'COMPONENTS',
                priority: 'MEDIUM',
                issue: `Missing ${missingScripts.length} script files`,
                recommendation: 'Verify all required scripts are present'
            });
        }

        // Recomendaciones basadas en red
        if (this.diagnostics.network.ports?.['3333']?.status !== 'ACTIVE') {
            recommendations.push({
                type: 'NETWORK',
                priority: 'HIGH',
                issue: 'Dashboard server not running on port 3333',
                recommendation: 'Start dashboard server with "npm run launch"'
            });
        }

        // Recomendaciones basadas en rendimiento
        const memoryUsage = parseFloat(this.diagnostics.performance.metrics?.memoryUsagePercent || '0');
        if (memoryUsage > 80) {
            recommendations.push({
                type: 'PERFORMANCE',
                priority: 'MEDIUM',
                issue: 'High memory usage detected',
                recommendation: 'Monitor memory consumption and consider optimization'
            });
        }

        // Recomendaciones cuánticas
        if (this.diagnostics.quantum.status === 'INACTIVE') {
            recommendations.push({
                type: 'QUANTUM',
                priority: 'HIGH',
                issue: 'Quantum metrics not accessible',
                recommendation: 'Ensure dashboard server is running to access live quantum data'
            });
        }

        // Recomendaciones generales
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'GENERAL',
                priority: 'LOW',
                issue: 'System operating normally',
                recommendation: 'Continue monitoring and consider performance optimizations'
            });
        }

        this.diagnostics.recommendations = recommendations;
        
        console.log(`   ✅ ${recommendations.length} recomendaciones generadas`);
    }

    async generateReport() {
        console.log('📋 Generando reporte completo...');
        
        try {
            // Crear directorio de reportes
            const reportsDir = path.join(__dirname, '../system-reports');
            await fs.mkdir(reportsDir, { recursive: true });
            
            // Generar reporte JSON completo
            const jsonReport = path.join(reportsDir, `quantum-diagnostics-${Date.now()}.json`);
            await fs.writeFile(jsonReport, JSON.stringify(this.diagnostics, null, 2));
            
            // Generar reporte de texto legible
            const textReport = await this.generateTextReport();
            const txtReportPath = path.join(reportsDir, `quantum-diagnostics-${Date.now()}.txt`);
            await fs.writeFile(txtReportPath, textReport);
            
            // Guardar como último reporte
            const latestJsonPath = path.join(reportsDir, 'latest-diagnostics.json');
            const latestTxtPath = path.join(reportsDir, 'latest-diagnostics.txt');
            await fs.writeFile(latestJsonPath, JSON.stringify(this.diagnostics, null, 2));
            await fs.writeFile(latestTxtPath, textReport);
            
            console.log(`   ✅ Reporte JSON: ${jsonReport}`);
            console.log(`   ✅ Reporte Texto: ${txtReportPath}`);
            console.log(`   ✅ Latest reports updated`);
            
            return { jsonReport, txtReportPath };
            
        } catch (error) {
            console.error('   ❌ Error generando reporte:', error.message);
            throw error;
        }
    }

    async generateTextReport() {
        const { system, components, network, performance, quantum, recommendations } = this.diagnostics;
        
        return `
🔬 QBTC QUANTUM SYSTEM DIAGNOSTICS REPORT
========================================
Generated: ${this.diagnostics.timestamp}

🖥️  SYSTEM STATUS
-----------------
Platform: ${system.platform} ${system.architecture}
Node.js: ${system.nodeVersion} ${system.healthStatus === 'HEALTHY' ? '✅' : '⚠️'}
Memory Usage: ${system.memoryUsagePercent}%
Uptime: ${(system.uptime / 3600).toFixed(2)}h
Process ID: ${system.pid}

🧩 COMPONENTS STATUS  
-------------------
Scripts Found: ${Object.values(components.scripts || {}).filter(s => s.exists).length}/5
Config Files: ${Object.values(components.config || {}).filter(c => c.exists).length}/4
Dependencies: ${components.dependencies?.production?.length || 0} production packages
Package Type: ${components.dependencies?.packageInfo?.type || 'unknown'}

🌐 NETWORK STATUS
-----------------
Dashboard Server (3333): ${network.ports?.['3333']?.status || 'UNKNOWN'} ${network.ports?.['3333']?.status === 'ACTIVE' ? '✅' : '❌'}
API Metrics: ${network.services?.metrics?.status || 'UNKNOWN'} ${network.services?.metrics?.status === 'ACTIVE' ? '✅' : '❌'}
Binance Connection: ${network.services?.binance?.status || 'UNKNOWN'} ⚙️

⚡ PERFORMANCE METRICS
---------------------
Memory Used: ${performance.metrics?.memoryUsedMB || 0}MB / ${performance.metrics?.memoryTotalMB || 0}MB
Memory Usage: ${performance.metrics?.memoryUsagePercent || 0}%
System Uptime: ${performance.metrics?.uptimeFormatted || 'Unknown'}
Metrics Files: ${performance.files?.metricsGenerated || 0} generated
Health Score: ${performance.healthScore || 0}% ${performance.healthScore > 80 ? '✅' : '⚠️'}

⚛️  QUANTUM METRICS
------------------
Status: ${quantum.status} ${quantum.status === 'ACTIVE' ? '✅' : quantum.status === 'SIMULATED' ? '⚛️' : '❌'}
Coherence: ${(quantum.metrics?.coherence * 100).toFixed(1)}% (Target: 96.3%)
Lambda Resonance: ${(quantum.metrics?.lambdaResonance * 100).toFixed(1)}% (λ = 7.919)
Quantum Field: ${(quantum.metrics?.fieldStrength * 100).toFixed(1)}%
System Entropy: ${(quantum.metrics?.entropy * 100).toFixed(1)}%
Consciousness Level: ${quantum.consciousness?.level?.toFixed(1) || 0}% 
Awakening State: ${quantum.consciousness?.awakening ? 'ACTIVE ✅' : 'DEVELOPING ⚛️'}
Active Chakras: ${quantum.consciousness?.chakrasActive || 0}/12
Quantum Score: ${quantum.quantumScore || 0}%

💡 RECOMMENDATIONS (${recommendations.length})
${'-'.repeat(20)}
${recommendations.map((rec, i) => `
${i + 1}. [${rec.priority}] ${rec.type}
   Issue: ${rec.issue}
   Action: ${rec.recommendation}
`).join('')}

🎯 SYSTEM SUMMARY
----------------
Overall Status: ${this.getOverallStatus()} ${this.getOverallStatus() === 'OPERATIONAL' ? '✅' : '⚠️'}
Critical Issues: ${recommendations.filter(r => r.priority === 'HIGH').length}
Quantum Readiness: ${quantum.status === 'ACTIVE' ? 'READY' : quantum.status === 'SIMULATED' ? 'TESTING' : 'PENDING'}
Performance Level: ${performance.healthScore > 80 ? 'EXCELLENT' : performance.healthScore > 60 ? 'GOOD' : 'NEEDS_ATTENTION'}

🌌 Ready for quantum consciousness analysis! 🧠⚛️
        `;
    }

    // Métodos auxiliares
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }

    calculateHealthScore(performance) {
        let score = 100;
        
        // Penalizar por uso alto de memoria
        const memUsage = parseFloat(performance.metrics?.memoryUsagePercent || 0);
        if (memUsage > 80) score -= 20;
        else if (memUsage > 60) score -= 10;
        
        // Bonificar por archivos de métricas disponibles
        if (performance.files?.metricsGenerated > 0) score += 5;
        if (performance.files?.latestAvailable) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateQuantumScore(metrics) {
        if (!metrics) return 0;
        
        const coherenceScore = (metrics.coherence || 0) * 30;
        const resonanceScore = (metrics.lambdaResonance || 0) * 25;
        const fieldScore = (metrics.fieldStrength || 0) * 25;
        const entropyScore = (1 - (metrics.entropy || 1)) * 20; // Menos entropía = mejor
        
        return Math.max(0, Math.min(100, coherenceScore + resonanceScore + fieldScore + entropyScore));
    }

    getOverallStatus() {
        const highPriorityIssues = this.diagnostics.recommendations.filter(r => r.priority === 'HIGH').length;
        const systemHealthy = this.diagnostics.system.healthStatus === 'HEALTHY';
        const dashboardActive = this.diagnostics.network?.ports?.['3333']?.status === 'ACTIVE';
        
        if (highPriorityIssues === 0 && systemHealthy && dashboardActive) {
            return 'OPERATIONAL';
        } else if (highPriorityIssues > 2) {
            return 'DEGRADED';
        } else {
            return 'WARNING';
        }
    }
}

// Función principal
async function main() {
    const diagnostics = new QuantumSystemDiagnostics();
    
    try {
        await diagnostics.runCompleteDiagnostics();
        
        console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
        console.log('=========================');
        console.log(`Overall Status: ${diagnostics.getOverallStatus()}`);
        console.log(`Quantum Status: ${diagnostics.diagnostics.quantum.status}`);
        console.log(`Health Score: ${diagnostics.diagnostics.performance.healthScore}%`);
        console.log(`Recommendations: ${diagnostics.diagnostics.recommendations.length}`);
        console.log('\nReports saved to system-reports/ directory');
        console.log('🌌 Quantum consciousness analysis ready! 🧠⚛️\n');
        
    } catch (error) {
        console.error('💥 Diagnostic failed:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

export { QuantumSystemDiagnostics };
