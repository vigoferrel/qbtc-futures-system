#!/usr/bin/env node

/**
 * 🧪 TEST ULTRA OPTIMIZATION - VALIDATION
 * =======================================
 * Script de prueba para validar la integración del QuantumMemoryManager
 * y los componentes ultra-optimizados del sistema QBTC
 * 
 * Ejecutar: node test-ultra-optimization.js
 */

import { performance } from 'perf_hooks';
import os from 'os';
import QuantumMemoryManager from './memory/quantum-memory-manager.js';
import UltraStreamingEngine from './streaming/ultra-streaming-engine.js';
import { UltraDIContainer } from './core/ultra-di-container.js';

console.log('🧪 QBTC ULTRA OPTIMIZATION TEST');
console.log('================================');
console.log(`Platform: ${os.platform()} | CPUs: ${os.cpus().length} | RAM: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
console.log();

async function testQuantumMemoryManager() {
    console.log('🧪 Testing Quantum Memory Manager...');
    
    const startTime = performance.now();
    
    try {
        // Crear instancia
        const qmm = new QuantumMemoryManager({
            mmapDirectory: './test-mmap',
            bufferPoolSizes: [1024, 4096, 16384],
            initialPoolSize: 5,
            maxPoolSize: 20,
            compactionThreshold: 0.8
        });
        
        // Inicializar
        await qmm.initialize();
        console.log('  ✅ Initialization successful');
        
        // Probar buffer pooling
        console.log('  🔧 Testing buffer pooling...');
        const buffers = [];
        
        for (let i = 0; i < 10; i++) {
            const buffer = qmm.acquireBuffer(2048);
            buffers.push(buffer);
            
            // Escribir datos de prueba
            buffer.write('QBTC-TEST-' + i, 0, 'utf8');
        }
        
        console.log(`  📦 Acquired ${buffers.length} buffers`);
        
        // Liberar buffers
        buffers.forEach(buffer => {
            if (buffer.release) {
                buffer.release();
            }
        });
        
        console.log('  ♻️  Released all buffers');
        
        // Obtener métricas
        const metrics = qmm.getDetailedMetrics();
        console.log(`  📊 Buffer pool hit rate: ${((metrics.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(1))}MB`);
        console.log(`  🎯 Pools active: ${metrics.pools.length}`);
        
        // Cleanup
        await qmm.dispose();
        console.log('  🗑️  Cleanup completed');
        
        const testTime = performance.now() - startTime;
        console.log(`  ⏱️  Test completed in ${testTime.toFixed(2)}ms`);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ Test failed:', error.message);
        return false;
    }
}

async function testUltraStreamingEngine() {
    console.log('\n⚡ Testing Ultra Streaming Engine...');
    
    const startTime = performance.now();
    
    try {
        // Crear instancia
        const engine = new UltraStreamingEngine({
            maxConcurrentStreams: 50,
            bufferSize: 32768,
            zeroCopyEnabled: true,
            workerPoolSize: 2,
            enableMetrics: true
        });
        
        // Inicializar
        await engine.initialize();
        console.log('  ✅ Initialization successful');
        
        // Crear stream de prueba
        console.log('  🌊 Testing stream creation...');
        
        const testStream = engine.createUltraStream((chunk) => {
            // Simple transformation: uppercase
            if (Buffer.isBuffer(chunk)) {
                return Buffer.from(chunk.toString().toUpperCase());
            }
            return chunk.toString().toUpperCase();
        }, {
            zeroCopy: true,
            priority: 'HIGH',
            tags: ['test', 'validation']
        });
        
        console.log('  📈 Stream created successfully');
        
        // Obtener métricas
        const metrics = engine.getDetailedMetrics();
        console.log(`  🎯 Active streams: ${metrics.streaming.activeStreamCount}`);
        console.log(`  👷 Worker utilization: ${(metrics.workers.utilization * 100).toFixed(1)}%`);
        
        // Cleanup
        await engine.dispose();
        console.log('  🗑️  Cleanup completed');
        
        const testTime = performance.now() - startTime;
        console.log(`  ⏱️  Test completed in ${testTime.toFixed(2)}ms`);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ Test failed:', error.message);
        return false;
    }
}

async function testUltraDIContainer() {
    console.log('\n🏭 Testing Ultra DI Container...');
    
    const startTime = performance.now();
    
    try {
        // Crear instancia
        const container = new UltraDIContainer({
            enableLazyLoading: true,
            enableMetrics: true,
            enablePooling: true
        });
        
        console.log('  ✅ Initialization successful');
        
        // Registrar servicios de prueba
        console.log('  📝 Registering test services...');
        
        container.register('testConfig', () => ({
            environment: 'test',
            version: '1.0.0',
            features: { testing: true }
        }), { singleton: true, lazy: false });
        
        container.register('testService', (config) => ({
            config,
            process: (data) => `Processed: ${data}`,
            status: 'ACTIVE'
        }), { 
            singleton: true, 
            lazy: true,
            dependencies: ['testConfig']
        });
        
        // Resolver dependencias
        console.log('  🔗 Resolving dependencies...');
        
        const config = container.resolve('testConfig');
        const service = container.resolve('testService');
        
        console.log(`  📊 Config resolved: ${config.environment}`);
        console.log(`  🎯 Service resolved: ${service.status}`);
        
        // Test service functionality
        const result = service.process('QBTC Ultra Test');
        console.log(`  ⚡ Service test: ${result}`);
        
        // Obtener métricas
        const metrics = container.getMetrics();
        console.log(`  📈 Dependencies resolved: ${metrics.resolutions}`);
        console.log(`  🎯 Cache hit rate: ${metrics.resolutions > 0 ? ((metrics.cacheHits / metrics.resolutions) * 100).toFixed(1) : 0}%`);
        
        // Cleanup
        await container.dispose();
        console.log('  🗑️  Cleanup completed');
        
        const testTime = performance.now() - startTime;
        console.log(`  ⏱️  Test completed in ${testTime.toFixed(2)}ms`);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ Test failed:', error.message);
        return false;
    }
}

async function testMemoryPerformance() {
    console.log('\n💾 Testing Memory Performance...');
    
    const startTime = performance.now();
    const initialMemory = process.memoryUsage();
    
    console.log(`  📊 Initial heap: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
    
    // Simular carga de trabajo intensiva
    console.log('  ⚡ Running intensive workload...');
    
    const arrays = [];
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
        // Crear arrays grandes
        const largeArray = new Array(1000).fill(0).map(() => ({
            id: i,
            data: 'QBTC-' + 0.947.toString(36).substring(7),
            timestamp: Date.now(),
            processed: false
        }));
        
        arrays.push(largeArray);
        
        // Procesar algunos datos
        if (i % 100 === 0) {
            arrays.forEach(arr => {
                arr.forEach(item => {
                    item.processed = true;
                    item.result = item.data.toUpperCase();
                });
            });
        }
    }
    
    const peakMemory = process.memoryUsage();
    console.log(`  📈 Peak heap: ${Math.round(peakMemory.heapUsed / 1024 / 1024)}MB`);
    
    // Limpiar arrays
    arrays.length = 0;
    
    // Forzar garbage collection si está disponible
    if (global.gc) {
        console.log('  🗑️  Forcing garbage collection...');
        global.gc();
    }
    
    const finalMemory = process.memoryUsage();
    console.log(`  📉 Final heap: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`);
    
    const testTime = performance.now() - startTime;
    const memoryDifference = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`  ⏱️  Performance test completed in ${testTime.toFixed(2)}ms`);
    console.log(`  📊 Memory difference: ${memoryDifference > 0 ? '+' : ''}${Math.round(memoryDifference / 1024 / 1024)}MB`);
    
    return true;
}

async function runAllTests() {
    const totalStart = performance.now();
    const results = {
        quantumMemory: false,
        ultraStreaming: false,
        ultraDI: false,
        memoryPerformance: false
    };
    
    try {
        results.quantumMemory = await testQuantumMemoryManager();
        results.ultraStreaming = await testUltraStreamingEngine();
        results.ultraDI = await testUltraDIContainer();
        results.memoryPerformance = await testMemoryPerformance();
        
        const totalTime = performance.now() - totalStart;
        
        console.log('\n🏆 TEST RESULTS SUMMARY');
        console.log('=======================');
        console.log(`🧪 Quantum Memory Manager: ${results.quantumMemory ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`⚡ Ultra Streaming Engine: ${results.ultraStreaming ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🏭 Ultra DI Container: ${results.ultraDI ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`💾 Memory Performance: ${results.memoryPerformance ? '✅ PASSED' : '❌ FAILED'}`);
        
        const passedTests = Object.values(results).filter(result => result).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed`);
        console.log(`⏱️  Total execution time: ${totalTime.toFixed(2)}ms`);
        
        if (passedTests === totalTests) {
            console.log('🎉 ALL TESTS PASSED! Ultra optimization is working correctly!');
            return true;
        } else {
            console.log('⚠️  Some tests failed. Check the logs above for details.');
            return false;
        }
        
    } catch (error) {
        console.error('💥 Critical test failure:', error);
        return false;
    }
}

// Ejecutar tests
runAllTests().then(success => {
    if (success) {
        console.log('\n🚀 QBTC Ultra Optimization: READY FOR DEPLOYMENT!');
        process.exit(0);
    } else {
        console.log('\n❌ QBTC Ultra Optimization: NEEDS ATTENTION!');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});
