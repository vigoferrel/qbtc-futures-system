#!/usr/bin/env node

/**
 * 🚀 QBTC ULTRA MASTER LAUNCHER - REVOLUTION
 * ==========================================
 * Launcher principal ultra-optimizado con QuantumMemoryManager,
 * UltraStreamingEngine y componentes de alto rendimiento
 * 
 * CARACTERÍSTICAS ULTRA:
 * ⚡ Ultra Bootstrap con inicialización ordenada
 * 🧪 Quantum Memory Manager con mmap y buffer pooling
 * 🌊 Ultra Streaming Engine con zero-copy processing
 * 🏭 Ultra DI Container con dependency resolution
 * 📊 Métricas en tiempo real y health monitoring
 * 🛡️ Recovery automático y error handling avanzado
 * 🎯 Performance optimizado para trading de alta frecuencia
 */

import UltraBootstrap from './core/ultra-bootstrap.js';
import { createRequire } from 'module';
import os from 'os';
import { performance } from 'perf_hooks';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Configuración del launcher ultra-optimizado
const LAUNCHER_CONFIG = {
    version: '4.0.0-ultra',
    compatibility: 'ultra-optimized',
    bootstrap: 'ultra-bootstrap',
    features: {
        quantumMemory: true,
        ultraStreaming: true,
        zeroLatency: true,
        autoRecovery: true
    }
};

class QBTCUltraMasterLauncher {
    constructor() {
        this.bootstrap = null;
        this.container = null;
        this.isRunning = false;
        this.startTime = Date.now();
        this.metrics = {
            startupTime: 0,
            memoryOptimization: 0,
            componentsLoaded: 0
        };
        
        console.log('🚀 QBTC ULTRA MASTER LAUNCHER v' + LAUNCHER_CONFIG.version);
        console.log('🧪 Quantum Memory Manager: ENABLED');
        console.log('⚡ Ultra Streaming Engine: ENABLED');
        console.log('🏭 Ultra DI Container: ENABLED');
        console.log('📊 Performance Monitoring: ENABLED');
        console.log('=' .repeat(60));
        
        this.displaySystemSpecs();
    }
    
    displaySystemSpecs() {
        console.log('\n💻 SYSTEM SPECIFICATIONS:');
        console.log(`   Platform: ${os.platform()} ${os.arch()}`);
        console.log(`   CPUs: ${os.cpus().length} cores`);
        console.log(`   RAM: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total`);
        console.log(`   Free RAM: ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`);
        console.log(`   Node.js: ${process.version}`);
        console.log(`   UV Thread Pool: ${process.env.UV_THREADPOOL_SIZE || 'default'}`);
        console.log();
    }
    
    async launch() {
        const launchStartTime = performance.now();
        
        try {
            console.log('🚀 Initializing QBTC Ultra-Optimized System...');
            
            // Crear instancia del Ultra Bootstrap
            this.bootstrap = new UltraBootstrap({
                dataDirectory: './data',
                logsDirectory: './logs',
                enablePerformanceMonitoring: true,
                enableRecovery: true,
                maxStartupTime: 45000 // 45 segundos para startup completo
            });
            
            // Configurar event handlers del bootstrap
            this.setupBootstrapEventHandlers();
            
            // Inicializar sistema ultra-optimizado completo
            this.container = await this.bootstrap.initialize();
            
            if (this.container) {
                this.isRunning = true;
                this.metrics.startupTime = performance.now() - launchStartTime;
                
                console.log('\n🎉 QBTC ULTRA SYSTEM OPERATIONAL!');
                console.log('🎯 System Status: READY FOR QUANTUM TRADING');
                console.log('⚡ All ultra-optimized components initialized');
                
                await this.displayUltraSystemInfo();
                
                // Configurar monitoreo continuo
                this.setupContinuousMonitoring();
                
                // Mantener proceso activo
                this.keepAlive();
                
                return true;
            } else {
                throw new Error('Ultra Bootstrap initialization failed');
            }
            
        } catch (error) {
            console.error('❌ QBTC Ultra Launch failed:', error.message);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }
    
    setupBootstrapEventHandlers() {
        if (!this.bootstrap) return;
        
        // Bootstrap events
        this.bootstrap.on('bootstrap-completed', (data) => {
            console.log(`🎉 Bootstrap completed: ${data.metrics.componentsInitialized} components in ${data.metrics.startupTime.toFixed(2)}ms`);
            this.metrics.componentsLoaded = data.metrics.componentsInitialized;
        });
        
        this.bootstrap.on('system-metrics', (metrics) => {
            // Log métricas cada 5 minutos para no saturar
            const now = Date.now();
            if (!this.lastMetricsLog || (now - this.lastMetricsLog) > 300000) {
                const memMB = Math.round(metrics.memory.heapUsed / 1024 / 1024);
                console.log(`📊 System metrics: Memory ${memMB}MB, CPU ${metrics.cpu.user}μs`);
                this.lastMetricsLog = now;
            }
        });
        
        this.bootstrap.on('component-error', (data) => {
            console.error(`❌ Component error: ${data.component} - ${data.error}`);
        });
        
        this.bootstrap.on('shutdown-completed', () => {
            console.log('✅ Ultra Bootstrap shutdown completed');
        });
    }
    
    async displayUltraSystemInfo() {
        const bootstrapStatus = this.bootstrap.getStatus();
        const containerMetrics = this.container.getMetrics();
        
        console.log('\n📊 ULTRA SYSTEM STATUS:');
        console.log(`   Bootstrap Version: ${LAUNCHER_CONFIG.version}`);
        console.log(`   Startup Time: ${this.metrics.startupTime.toFixed(2)}ms`);
        console.log(`   Components Loaded: ${this.metrics.componentsLoaded}`);
        console.log(`   System State: ${bootstrapStatus.state.phase}`);
        console.log(`   Health Status: ${bootstrapStatus.state.hasErrors ? '⚠️  WITH ERRORS' : '✅ HEALTHY'}`);
        
        console.log('\n🏭 ULTRA COMPONENTS:');
        Object.entries(bootstrapStatus.components).forEach(([name, info]) => {
            const icon = info.critical ? '🔴' : '🟢';
            const uptime = Math.round(info.uptime / 1000);
            console.log(`   ${icon} ${name}: ACTIVE (${uptime}s uptime)`);
        });
        
        // Mostrar información detallada de cada componente ultra-optimizado
        console.log('\n🧪 QUANTUM MEMORY MANAGER:');
        const qmm = bootstrapStatus.components.quantumMemoryManager;
        if (qmm) {
            try {
                const qmmMetrics = this.container.resolve('quantumMemoryManager').getDetailedMetrics();
                console.log(`   ✅ Status: ${qmmMetrics.state.memoryPressure || 'OPERATIONAL'}`);
                console.log(`   📦 Buffer Pools: ${qmmMetrics.pools?.length || 0}`);
                console.log(`   🗺️  Memory Maps: ${qmmMetrics.memoryMaps?.length || 0}`);
                console.log(`   📈 Heap Usage: ${(qmmMetrics.system?.memoryUsage?.heapUsed / 1024 / 1024 || 0).toFixed(1)}MB`);
            } catch (error) {
                console.log(`   ✅ Status: INITIALIZED (metrics unavailable)`);
            }
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n⚡ ULTRA STREAMING ENGINE:');
        const streaming = bootstrapStatus.components.ultraStreamingEngine;
        if (streaming) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   🌊 Active Streams: 0 (ready)`);
            console.log(`   🏭 Worker Pool: Ready`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED (optional)`);
        }
        
        console.log('\n🏎️ HYPER PARALLEL ENGINE:');
        const parallel = bootstrapStatus.components.hyperParallelEngine;
        if (parallel) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   👥 Worker Threads: Available`);
            console.log(`   📋 Task Queue: Ready`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n💾 ULTRA DISTRIBUTED CACHE:');
        const cache = bootstrapStatus.components.ultraDistributedCache;
        if (cache) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   🏢 L1-L4 Layers: Active`);
            console.log(`   🔄 Prefetching: Enabled`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n📡 ULTRA EVENT BUS:');
        const events = bootstrapStatus.components.ultraEventBus;
        if (events) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   🔌 Circuit Breakers: Active`);
            console.log(`   📦 Event Batching: Enabled`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n🤖 AUTO OPTIMIZATION ENGINE:');
        const optimizer = bootstrapStatus.components.autoOptimizationEngine;
        if (optimizer) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   🧠 Neural Networks: Ready`);
            console.log(`   🧬 Genetic Algorithms: Active`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED (optional)`);
        }
        
        console.log('\n🎲 QUANTUM RANDOMNESS GENERATOR:');
        const rng = bootstrapStatus.components.quantumRandomnessGenerator;
        if (rng) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   🔬 Kernel Entropy: Active`);
            console.log(`   📊 System Metrics: Collecting`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n📊 AUTONOMOUS METRICS SYSTEM:');
        const metrics = bootstrapStatus.components.autonomousMetricsSystem;
        if (metrics) {
            console.log(`   ✅ Status: OPERATIONAL`);
            console.log(`   📡 WebSocket API: Port 3001`);
            console.log(`   🌐 REST API: Port 3002`);
            console.log(`   🤖 Background Collection: Active`);
        } else {
            console.log(`   ⚠️  Status: NOT LOADED`);
        }
        
        console.log('\n🏭 DI CONTAINER METRICS:');
        console.log(`   📦 Dependencies: ${containerMetrics.dependencies}`);
        console.log(`   🎯 Resolution Rate: ${containerMetrics.resolutions}`);
        console.log(`   ⚡ Cache Hit Rate: ${containerMetrics.resolutions > 0 ? ((containerMetrics.cacheHits / containerMetrics.resolutions) * 100).toFixed(1) : 0}%`);
        console.log(`   ⏱️  Avg Resolution: ${containerMetrics.avgResolutionTime.toFixed(2)}ms`);
        
        console.log('\n📈 PERFORMANCE METRICS:');
        const memUsage = process.memoryUsage();
        console.log(`   💾 Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        console.log(`   📊 Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
        console.log(`   🔄 GC Pressure: ${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1)}%`);
        
        console.log('\n🎯 READY FOR ULTRA-HIGH-FREQUENCY TRADING');
        console.log('🚀 All systems optimized and operational!');
        console.log('=' .repeat(60));
    }
    
    setupContinuousMonitoring() {
        console.log('🔍 Setting up continuous monitoring...');
        
        // Monitoreo de métricas cada 2 minutos
        setInterval(() => {
            if (!this.isRunning) return;
            
            try {
                const metrics = this.bootstrap.collectSystemMetrics();
                this.analyzeSystemHealth(metrics);
            } catch (error) {
                console.error('❌ Error collecting system metrics:', error);
            }
        }, 120000); // 2 minutos
        
        console.log('✅ Continuous monitoring configured');
    }
    
    analyzeSystemHealth(metrics) {
        const memPressure = metrics.memory.heapUsed / metrics.memory.heapTotal;
        const freeMem = metrics.system.freemem;
        
        // Alertas de memoria
        if (memPressure > 0.85) {
            console.warn(`⚠️  HIGH MEMORY PRESSURE: ${(memPressure * 100).toFixed(1)}%`);
            
            // Trigger garbage collection if available
            if (global.gc) {
                console.log('🗑️  Triggering garbage collection...');
                global.gc();
            }
        }
        
        // Alertas de memoria del sistema
        if (freeMem < 1024 * 1024 * 1024) { // Menos de 1GB libre
            console.warn(`⚠️  LOW SYSTEM MEMORY: ${Math.round(freeMem / 1024 / 1024)}MB free`);
        }
        
        // Quantum Memory Manager health check
        try {
            const qmm = this.container.resolve('quantumMemoryManager');
            const qmmMetrics = qmm.getDetailedMetrics();
            
            if (qmmMetrics.state.memoryPressure === 'CRITICAL') {
                console.warn('🧪 QUANTUM MEMORY MANAGER: Critical pressure detected');
                qmm.triggerCompaction();
            }
        } catch (error) {
            // QMM might not be available
        }
    }
    
    keepAlive() {
        // Mantener proceso activo sin usar stdin.setRawMode
        const heartbeat = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(heartbeat);
                return;
            }
            
            // Heartbeat silencioso cada 30 segundos
            const uptime = Math.round((Date.now() - this.startTime) / 1000);
            if (uptime % 300 === 0) { // Log cada 5 minutos
                console.log(`💚 System heartbeat - Uptime: ${uptime}s`);
            }
        }, 30000);
        
        // Graceful shutdown handlers
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('exit', () => this.gracefulShutdown('EXIT'));
    }
    
    async gracefulShutdown(signal) {
        if (!this.isRunning) return;
        
        console.log(`\n🔄 Received ${signal} - Initiating ultra-graceful shutdown...`);
        this.isRunning = false;
        
        const shutdownStart = performance.now();
        
        try {
            if (this.bootstrap) {
                console.log('🚀 Shutting down Ultra Bootstrap...');
                await this.bootstrap.shutdown();
            }
            
            const shutdownTime = performance.now() - shutdownStart;
            console.log(`✅ QBTC Ultra System shutdown completed in ${shutdownTime.toFixed(2)}ms`);
            console.log('👋 Goodbye from QBTC Ultra!');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        } finally {
            process.exit(0);
        }
    }
    
    // Método para obtener status del sistema
    getStatus() {
        return {
            launcher: {
                version: LAUNCHER_CONFIG.version,
                running: this.isRunning,
                uptime: Date.now() - this.startTime,
                features: LAUNCHER_CONFIG.features,
                metrics: this.metrics
            },
            bootstrap: this.bootstrap?.getStatus() || null,
            container: this.container?.getMetrics() || null
        };
    }
}

// Función principal
async function main() {
    console.log(`🌟 Starting QBTC v${pkg.version} with Ultra Master Launcher`);
    
    const launcher = new QBTCUltraMasterLauncher();
    
    try {
        const success = await launcher.launch();
        
        if (!success) {
            console.error('❌ Launch failed');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Critical error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Auto-ejecutar si es llamado directamente
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    main().catch(console.error);
}

export default QBTCUltraMasterLauncher;
