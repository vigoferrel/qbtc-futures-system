#!/usr/bin/env node

console.log('🧪 Testing component loading...');

const components = [
    { name: 'UltraDIContainer', path: './core/ultra-di-container.js' },
    { name: 'QuantumMemoryManager', path: './memory/quantum-memory-manager.js' },
    { name: 'UltraStreamingEngine', path: './streaming/ultra-streaming-engine.js' },
    { name: 'UltraEventBus', path: './events/ultra-event-bus.js' },
    { name: 'AutoOptimizationEngine', path: './optimization/auto-optimization-engine.js' },
    { name: 'QuantumRandomnessGenerator', path: './random/quantum-randomness-generator.js' },
    { name: 'AutonomousMetricsSystem', path: './metrics/autonomous-metrics-system.js' },
    { name: 'HyperParallelEngine', path: './parallel/hyper-parallel-engine.js' },
    { name: 'UltraDistributedCache', path: './cache/ultra-distributed-cache.js' }
];

async function testComponentLoading() {
    let loaded = 0;
    let failed = 0;
    
    for (const component of components) {
        try {
            console.log(`Testing ${component.name}...`);
            const module = await import(component.path);
            
            if (module.default || module[component.name]) {
                console.log(`✅ ${component.name} - LOADED`);
                loaded++;
            } else {
                console.log(`⚠️ ${component.name} - NO EXPORT`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${component.name} - ERROR: ${error.message}`);
            failed++;
        }
    }
    
    console.log('');
    console.log(`📊 RESULTS: ${loaded} loaded, ${failed} failed out of ${components.length} components`);
    console.log(`📈 Success rate: ${((loaded / components.length) * 100).toFixed(1)}%`);
    
    return { loaded, failed, total: components.length };
}

testComponentLoading().then((results) => {
    console.log('Component loading test completed!');
    process.exit(results.failed === 0 ? 0 : 1);
}).catch((error) => {
    console.error('Critical error:', error);
    process.exit(1);
});
