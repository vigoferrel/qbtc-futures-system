#!/usr/bin/env node

/**
 * 🧪 QBTC SYSTEM VALIDATION - COMPREHENSIVE INTEGRATION TEST
 * ==========================================================
 * Comprehensive validation of the QBTC Ultra-Optimized System
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

class QBTCSystemValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            testsPassed: 0,
            testsFailed: 0,
            totalTests: 0,
            startTime: Date.now(),
            components: new Map(),
            performance: new Map(),
            errors: [],
            warnings: []
        };
        
        this.baselineMemory = process.memoryUsage();
    }

    async runTest(testName, testFn) {
        this.results.totalTests++;
        console.log(`[TEST] ${testName}...`);
        
        const startTime = performance.now();
        
        try {
            const result = await testFn();
            const duration = performance.now() - startTime;
            
            this.results.testsPassed++;
            console.log(`✅ ${testName} - PASSED (${duration.toFixed(2)}ms)`);
            
            return { passed: true, duration, result };
        } catch (error) {
            const duration = performance.now() - startTime;
            
            this.results.testsFailed++;
            this.results.errors.push({ test: testName, error: error.message, duration });
            console.log(`❌ ${testName} - FAILED: ${error.message} (${duration.toFixed(2)}ms)`);
            
            return { passed: false, duration, error: error.message };
        }
    }

    async validateComponentsExist() {
        console.log('\n📁 VALIDATING COMPONENT STRUCTURE...');
        
        const components = [
            { name: 'UltraDIContainer', path: './core/ultra-di-container.js' },
            { name: 'QuantumMemoryManager', path: './memory/quantum-memory-manager.js' },
            { name: 'UltraStreamingEngine', path: './streaming/ultra-streaming-engine.js' },
            { name: 'UltraEventBus', path: './events/ultra-event-bus.js' },
            { name: 'AutoOptimizationEngine', path: './optimization/auto-optimization-engine.js' },
            { name: 'QuantumRandomnessGenerator', path: './random/quantum-randomness-generator.js' },
            { name: 'AutonomousMetricsSystem', path: './metrics/autonomous-metrics-system.js' },
            { name: 'HyperParallelEngine', path: './parallel/hyper-parallel-engine.js' },
            { name: 'UltraDistributedCache', path: './cache/ultra-distributed-cache.js' },
            { name: 'UltraBootstrap', path: './core/ultra-bootstrap.js' }
        ];

        for (const component of components) {
            await this.runTest(`Component: ${component.name}`, async () => {
                try {
                    const module = await import(component.path);
                    
                    if (!module.default && !module[component.name]) {
                        throw new Error(`Component ${component.name} not exported properly`);
                    }
                    
                    this.results.components.set(component.name, {
                        status: 'LOADED',
                        path: component.path,
                        hasDefault: !!module.default,
                        hasNamedExport: !!module[component.name],
                        exports: Object.keys(module)
                    });
                    
                    return 'LOADED';
                } catch (importError) {
                    this.results.components.set(component.name, {
                        status: 'ERROR',
                        path: component.path,
                        error: importError.message
                    });
                    throw importError;
                }
            });
        }
    }

    async validateSystemFiles() {
        console.log('\n📄 VALIDATING SYSTEM FILES...');
        
        const systemFiles = [
            './package.json',
            './launch-qbtc-master.js',
            './launch-with-scanner.js',
            './scripts/launch-dashboard.js'
        ];

        for (const filePath of systemFiles) {
            await this.runTest(`System File: ${path.basename(filePath)}`, async () => {
                try {
                    await fs.access(filePath);
                    const stats = await fs.stat(filePath);
                    return `EXISTS (${stats.size} bytes)`;
                } catch {
                    throw new Error(`File not found: ${filePath}`);
                }
            });
        }
    }

    async validateDirectoryStructure() {
        console.log('\n🗂️ VALIDATING DIRECTORY STRUCTURE...');
        
        const requiredDirs = [
            './core', './memory', './streaming', './events',
            './optimization', './random', './metrics', './parallel',
            './cache', './integration', './scripts', './frontend'
        ];

        for (const dir of requiredDirs) {
            await this.runTest(`Directory: ${path.basename(dir)}`, async () => {
                try {
                    const stats = await fs.stat(dir);
                    if (!stats.isDirectory()) {
                        throw new Error(`${dir} is not a directory`);
                    }
                    
                    const files = await fs.readdir(dir);
                    return `EXISTS (${files.length} items)`;
                } catch {
                    throw new Error(`Directory not found: ${dir}`);
                }
            });
        }
    }

    async performanceBaseline() {
        console.log('\n⚡ PERFORMANCE BASELINE TESTING...');
        
        await this.runTest('Memory Usage Baseline', async () => {
            const memUsage = process.memoryUsage();
            
            const metrics = {
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
                rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
                external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
            };
            
            this.results.performance.set('memory', metrics);
            
            console.log(`   Heap Used: ${metrics.heapUsed} MB`);
            console.log(`   Heap Total: ${metrics.heapTotal} MB`);
            console.log(`   RSS: ${metrics.rss} MB`);
            
            if (metrics.heapUsed > 150) {
                this.results.warnings.push('High memory usage detected');
            }
            
            return `Memory OK (${metrics.heapUsed} MB heap)`;
        });

        await this.runTest('CPU Performance Test', async () => {
            const startTime = performance.now();
            
            let sum = 0;
            for (let i = 0; i < 1000000; i++) {
                sum += Math.sqrt(i);
            }
            
            const duration = performance.now() - startTime;
            this.results.performance.set('cpu', {
                duration: Math.round(duration * 100) / 100,
                operations: 1000000,
                opsPerMs: Math.round(1000000 / duration)
            });
            
            console.log(`   CPU test: ${duration.toFixed(2)}ms`);
            
            if (duration > 2000) {
                throw new Error('Performance degradation detected');
            }
            
            return `CPU OK (${duration.toFixed(2)}ms)`;
        });

        await this.runTest('I/O Performance Test', async () => {
            const startTime = performance.now();
            
            // Test file I/O
            const testFile = './test-temp-file.txt';
            const testData = 'x'.repeat(1024 * 100); // 100KB
            
            await fs.writeFile(testFile, testData);
            const readData = await fs.readFile(testFile, 'utf8');
            await fs.unlink(testFile);
            
            const duration = performance.now() - startTime;
            
            this.results.performance.set('io', {
                duration: Math.round(duration * 100) / 100,
                dataSize: testData.length,
                throughput: Math.round(testData.length / duration * 1000) // bytes/sec
            });
            
            console.log(`   I/O test: ${duration.toFixed(2)}ms`);
            
            if (readData.length !== testData.length) {
                throw new Error('Data integrity check failed');
            }
            
            return `I/O OK (${duration.toFixed(2)}ms)`;
        });
    }

    async validateUltraComponents() {
        console.log('\n🚀 VALIDATING ULTRA COMPONENTS...');
        
        // Test DI Container
        await this.runTest('DI Container Instantiation', async () => {
            const { UltraDIContainer } = await import('./core/ultra-di-container.js');
            const container = new UltraDIContainer();
            
            if (!container.register || !container.resolve) {
                throw new Error('DI Container methods missing');
            }
            
            return 'DI Container functional';
        });

        // Test Memory Manager
        await this.runTest('Quantum Memory Manager', async () => {
            const QuantumMemoryManager = (await import('./memory/quantum-memory-manager.js')).default;
            const memManager = new QuantumMemoryManager();
            
            if (!memManager.allocateBuffer || !memManager.releaseBuffer) {
                throw new Error('Memory Manager methods missing');
            }
            
            return 'Memory Manager functional';
        });

        // Test Event Bus
        await this.runTest('Ultra Event Bus', async () => {
            const UltraEventBus = (await import('./events/ultra-event-bus.js')).default;
            const eventBus = new UltraEventBus();
            
            if (!eventBus.publish || !eventBus.subscribe) {
                throw new Error('Event Bus methods missing');
            }
            
            return 'Event Bus functional';
        });

        // Test Streaming Engine
        await this.runTest('Ultra Streaming Engine', async () => {
            const UltraStreamingEngine = (await import('./streaming/ultra-streaming-engine.js')).default;
            const streamingEngine = new UltraStreamingEngine();
            
            if (!streamingEngine.createStream) {
                throw new Error('Streaming Engine methods missing');
            }
            
            return 'Streaming Engine functional';
        });
    }

    async generateReport() {
        console.log('\n📊 GENERATING COMPREHENSIVE REPORT...');
        
        const endTime = Date.now();
        const totalDuration = endTime - this.results.startTime;
        
        const report = {
            ...this.results,
            endTime: new Date().toISOString(),
            totalDuration,
            summary: {
                totalTests: this.results.totalTests,
                passed: this.results.testsPassed,
                failed: this.results.testsFailed,
                passRate: this.results.totalTests > 0 ? 
                    ((this.results.testsPassed / this.results.totalTests) * 100).toFixed(1) + '%' : '0%',
                duration: `${(totalDuration / 1000).toFixed(2)}s`
            },
            components: Object.fromEntries(this.results.components),
            performance: Object.fromEntries(this.results.performance),
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cpus: require('os').cpus().length,
                totalMemory: Math.round(require('os').totalmem() / 1024 / 1024),
                freeMemory: Math.round(require('os').freemem() / 1024 / 1024)
            }
        };

        // Save report
        await fs.mkdir('./integration', { recursive: true });
        const reportPath = './integration/system-validation-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport(report);
        await fs.writeFile('./integration/system-validation-report.html', htmlReport);

        return report;
    }

    generateHTMLReport(report) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>QBTC System Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { background: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .pass { color: #27ae60; }
        .fail { color: #e74c3c; }
        .component { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 3px; }
        .metric { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 3px solid #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 QBTC Ultra-Optimized System Validation Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Tests Run:</strong> ${report.summary.totalTests}</p>
        <p><strong>Pass Rate:</strong> <span class="${report.testsFailed === 0 ? 'pass' : 'fail'}">${report.summary.passRate}</span></p>
        <p><strong>Duration:</strong> ${report.summary.duration}</p>
    </div>
    
    <h2>🧩 Components Status</h2>
    ${Object.entries(report.components).map(([name, info]) => `
        <div class="component">
            <h3>${info.status === 'LOADED' ? '✅' : '❌'} ${name}</h3>
            <p><strong>Status:</strong> ${info.status}</p>
            <p><strong>Path:</strong> ${info.path}</p>
        </div>
    `).join('')}
    
    <h2>⚡ Performance Metrics</h2>
    ${Object.entries(report.performance).map(([metric, data]) => `
        <div class="metric">
            <h4>${metric.toUpperCase()}</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
    `).join('')}
    
    <h2>🖥️ System Information</h2>
    <div class="metric">
        <pre>${JSON.stringify(report.systemInfo, null, 2)}</pre>
    </div>
    
    ${report.errors.length > 0 ? `
    <h2>❌ Errors</h2>
    ${report.errors.map(error => `
        <div class="component">
            <h4>${error.test}</h4>
            <p><strong>Error:</strong> ${error.error}</p>
        </div>
    `).join('')}
    ` : ''}
</body>
</html>`;
    }

    async runFullValidation() {
        console.log('🚀 ================================================================');
        console.log('   QBTC SYSTEM VALIDATION - COMPREHENSIVE INTEGRATION TEST');
        console.log('   Validating Ultra-Optimized System Components');
        console.log('================================================================ 🚀');

        await this.validateDirectoryStructure();
        await this.validateSystemFiles();
        await this.validateComponentsExist();
        await this.performanceBaseline();
        await this.validateUltraComponents();

        const report = await this.generateReport();

        console.log('\n📊 ================================================================');
        console.log('   VALIDATION RESULTS SUMMARY');
        console.log('================================================================ 📊');
        console.log('');
        console.log(`📈 OVERALL PASS RATE: ${report.summary.passRate}`);
        console.log(`🧪 TESTS RUN: ${report.summary.totalTests}`);
        console.log(`✅ TESTS PASSED: ${report.summary.passed}`);
        console.log(`❌ TESTS FAILED: ${report.summary.failed}`);
        console.log(`⏱️ DURATION: ${report.summary.duration}`);
        console.log('');

        if (report.failed > 0) {
            console.log('❌ FAILURES DETECTED:');
            console.log('=====================');
            for (const error of report.errors) {
                console.log(`   ${error.test}: ${error.error}`);
            }
            console.log('');
        }

        if (report.warnings.length > 0) {
            console.log('⚠️ WARNINGS:');
            console.log('============');
            for (const warning of report.warnings) {
                console.log(`   ${warning}`);
            }
            console.log('');
        }

        console.log('🧩 COMPONENT STATUS:');
        console.log('====================');
        for (const [component, info] of Object.entries(report.components)) {
            const emoji = info.status === 'LOADED' ? '✅' : '❌';
            console.log(`${emoji} ${component}: ${info.status}`);
        }
        console.log('');

        const overallScore = report.summary.passed / report.summary.totalTests;
        let assessment = '';
        let emoji = '';

        if (overallScore >= 0.95) {
            assessment = 'EXCELLENT - System fully validated and ready!';
            emoji = '🏆';
        } else if (overallScore >= 0.85) {
            assessment = 'GOOD - System ready with minor issues!';
            emoji = '🎯';
        } else if (overallScore >= 0.75) {
            assessment = 'ACCEPTABLE - Some components need attention!';
            emoji = '✅';
        } else {
            assessment = 'NEEDS WORK - Critical issues detected!';
            emoji = '⚠️';
        }

        console.log(`${emoji} FINAL ASSESSMENT: ${assessment}`);
        console.log('');
        console.log(`📄 Reports saved to:`);
        console.log(`   JSON: ${path.resolve('./integration/system-validation-report.json')}`);
        console.log(`   HTML: ${path.resolve('./integration/system-validation-report.html')}`);
        console.log('');
        
        console.log('🎉 ================================================================');
        console.log('   QBTC SYSTEM VALIDATION COMPLETED!');
        console.log('================================================================ 🎉');

        return overallScore >= 0.8 ? 0 : 1;
    }
}

async function main() {
    try {
        const validator = new QBTCSystemValidator();
        const exitCode = await validator.runFullValidation();
        process.exit(exitCode);
    } catch (error) {
        console.error('❌ Critical validation failure:', error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
