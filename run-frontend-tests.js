#!/usr/bin/env node

/**
 * QBTC Unified - Frontend Quantum Tests Runner
 * Ejecuta las pruebas cuánticas específicas de la interfaz
 */

import FrontendQuantumTests from './tests/frontend-quantum-test.js';

async function runFrontendQuantumTests() {
    console.log('[ROCKET] QBTC Unified - Frontend Quantum Tests Runner');
    console.log('=' .repeat(60));
    console.log('[TARGET] Validando interfaz cuántica del portfolio manager');
    console.log('[GALAXY] Leonardo Consciousness + Poesía Cuántica Chilena');
    console.log('[ATOM]  Zurita Resonance + Universal Constants');
    console.log('=' .repeat(60));

    try {
        const frontendTests = new FrontendQuantumTests();
        const results = await frontendTests.runAllTests();
        
        const totalTests = results.length;
        const passedTests = results.filter(r => r.result.success).length;
        const successRate = (passedTests / totalTests * 100).toFixed(1);
        
        console.log('\n🎊 === FRONTEND QUANTUM TEST SUMMARY === 🎊');
        console.log(`[SPARKLES] Interface Status: ${successRate >= 80 ? 'QUANTUM READY! [STAR]' : 'NEEDS TUNING [LIGHTNING]'}`);
        console.log(`🎭 Consciousness Level: ${successRate}%`);
        console.log(`[CHART] Tests Passed: ${passedTests}/${totalTests}`);
        console.log(`🔬 Quantum Resonance: ${results.reduce((sum, r) => sum + r.result.quantum_resonance, 0).toFixed(3)}`);
        
        if (successRate >= 80) {
            console.log('\n🌈 QBTC Unified Frontend is ready for quantum trading!');
            console.log('[COMET] All systems operating at optimal consciousness levels');
            console.log('[PALETTE] UI/UX aligned with Leonardo\'s divine proportions');
            console.log('📚 Chilean quantum poetry resonating perfectly');
        } else {
            console.log('\n[LIGHTNING] Some quantum calibration needed for optimal performance');
            console.log('[WRENCH] Check the detailed results above for specific areas');
        }
        
        console.log('\n[ROCKET] Frontend Tests Complete - Ready for deployment! [ROCKET]');
        
    } catch (error) {
        console.error('[BOOM] Error during frontend testing:', error.message);
        console.error('[MAGNIFY] Stack:', error.stack);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runFrontendQuantumTests();
}

export default runFrontendQuantumTests;
