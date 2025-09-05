#!/usr/bin/env node

/**
 * [TEST] LLM-QUANTUM ORCHESTRATOR SUPREME TEST
 * ===========================================
 * 
 * Script de prueba para verificar el funcionamiento del sistema LLM-Quantum
 * Honra las constantes físicas reales del sistema QBTC
 */

import axios from 'axios';
import { QUANTUM_CONSTANTS } from './config/constants.js';

const TEST_CONFIG = {
    llmOrchestratorUrl: 'http://localhost:14077',
    timeout: 10000
};

class LLMQuantumOrchestratorTest {
    constructor() {
        this.testResults = [];
        this.constants = QUANTUM_CONSTANTS;
    }
    
    /**
     * Ejecuta todas las pruebas
     */
    async runAllTests() {
        console.log('[TEST] Starting LLM-Quantum Orchestrator Supreme Tests');
        console.log('=====================================================');
        console.log(`[LAMBDA] λ₇₉₁₉ = ${this.constants.LAMBDA_7919}`);
        console.log(`[PHI] φ = ${this.constants.PHI_GOLDEN}`);
        console.log(`[EULER] γ = ${this.constants.EULER_GAMMA}`);
        
        try {
            // 1. Prueba de conectividad
            await this.testConnectivity();
            
            // 2. Prueba de estado cuántico
            await this.testQuantumState();
            
            // 3. Prueba de orquestación LLM
            await this.testLLMOrchestration();
            
            // 4. Prueba de constantes físicas
            await this.testPhysicalConstants();
            
            // 5. Prueba de integración
            await this.testIntegration();
            
            // Mostrar resultados
            this.displayTestResults();
            
        } catch (error) {
            console.error('[ERROR] Test execution failed:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Prueba de conectividad básica
     */
    async testConnectivity() {
        console.log('\n[TEST] Testing connectivity...');
        
        try {
            const response = await axios.get(`${TEST_CONFIG.llmOrchestratorUrl}/health`, {
                timeout: TEST_CONFIG.timeout
            });
            
            if (response.status === 200) {
                this.addTestResult('Connectivity', 'PASS', 'LLM Orchestrator is reachable');
                console.log('[PASS] LLM Orchestrator is reachable');
            } else {
                this.addTestResult('Connectivity', 'FAIL', `Unexpected status: ${response.status}`);
                console.log('[FAIL] Unexpected status:', response.status);
            }
            
        } catch (error) {
            this.addTestResult('Connectivity', 'FAIL', error.message);
            console.log('[FAIL] Connectivity test failed:', error.message);
        }
    }
    
    /**
     * Prueba de estado cuántico
     */
    async testQuantumState() {
        console.log('\n[TEST] Testing quantum state...');
        
        try {
            const response = await axios.get(`${TEST_CONFIG.llmOrchestratorUrl}/api/quantum-state`, {
                timeout: TEST_CONFIG.timeout
            });
            
            if (response.status === 200) {
                const quantumState = response.data.quantumState;
                
                // Verificar que el estado cuántico tiene las propiedades esperadas
                const requiredProperties = ['consciousness', 'coherence', 'entanglement', 'superposition', 'evolution'];
                const missingProperties = requiredProperties.filter(prop => !(prop in quantumState));
                
                if (missingProperties.length === 0) {
                    this.addTestResult('Quantum State', 'PASS', 'Quantum state has all required properties');
                    console.log('[PASS] Quantum state has all required properties');
                    console.log(`  - Consciousness: ${quantumState.consciousness.toFixed(4)}`);
                    console.log(`  - Coherence: ${quantumState.coherence.toFixed(4)}`);
                    console.log(`  - Entanglement: ${quantumState.entanglement.toFixed(4)}`);
                    console.log(`  - Superposition: ${quantumState.superposition.toFixed(4)}`);
                    console.log(`  - Evolution: ${quantumState.evolution.toFixed(4)}`);
                } else {
                    this.addTestResult('Quantum State', 'FAIL', `Missing properties: ${missingProperties.join(', ')}`);
                    console.log('[FAIL] Missing properties:', missingProperties);
                }
                
            } else {
                this.addTestResult('Quantum State', 'FAIL', `Unexpected status: ${response.status}`);
                console.log('[FAIL] Unexpected status:', response.status);
            }
            
        } catch (error) {
            this.addTestResult('Quantum State', 'FAIL', error.message);
            console.log('[FAIL] Quantum state test failed:', error.message);
        }
    }
    
    /**
     * Prueba de orquestación LLM
     */
    async testLLMOrchestration() {
        console.log('\n[TEST] Testing LLM orchestration...');
        
        try {
            // Datos de mercado de prueba
            const testMarketData = {
                symbol: 'BTCUSDT',
                price: 45000,
                volatility: 0.023,
                volume: 1000000,
                timestamp: Date.now()
            };
            
            const response = await axios.post(`${TEST_CONFIG.llmOrchestratorUrl}/api/orchestrate`, testMarketData, {
                timeout: TEST_CONFIG.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                const orchestration = response.data.orchestration;
                
                // Verificar que la orquestación tiene la estructura esperada
                if (orchestration && orchestration.activeSymbols && orchestration.strategy) {
                    this.addTestResult('LLM Orchestration', 'PASS', 'LLM orchestration successful');
                    console.log('[PASS] LLM orchestration successful');
                    console.log(`  - Action: ${orchestration.action}`);
                    console.log(`  - Strategy: ${orchestration.strategy}`);
                    console.log(`  - Active Symbols: ${orchestration.activeSymbols.length}`);
                    console.log(`  - Confidence: ${orchestration.confidence.toFixed(4)}`);
                } else {
                    this.addTestResult('LLM Orchestration', 'FAIL', 'Invalid orchestration structure');
                    console.log('[FAIL] Invalid orchestration structure');
                }
                
            } else {
                this.addTestResult('LLM Orchestration', 'FAIL', `Unexpected status: ${response.status}`);
                console.log('[FAIL] Unexpected status:', response.status);
            }
            
        } catch (error) {
            this.addTestResult('LLM Orchestration', 'FAIL', error.message);
            console.log('[FAIL] LLM orchestration test failed:', error.message);
        }
    }
    
    /**
     * Prueba de constantes físicas
     */
    async testPhysicalConstants() {
        console.log('\n[TEST] Testing physical constants...');
        
        try {
            const response = await axios.get(`${TEST_CONFIG.llmOrchestratorUrl}/api/quantum-state`, {
                timeout: TEST_CONFIG.timeout
            });
            
            if (response.status === 200) {
                const constants = response.data.constants;
                
                // Verificar que las constantes físicas son correctas
                const expectedConstants = {
                    lambda: this.constants.LAMBDA_7919,
                    phi: this.constants.PHI_GOLDEN,
                    euler: this.constants.EULER_GAMMA,
                    zComplex: this.constants.Z_COMPLEX
                };
                
                let allConstantsCorrect = true;
                const errors = [];
                
                for (const [key, expectedValue] of Object.entries(expectedConstants)) {
                    if (key === 'zComplex') {
                        // Verificar variable compleja
                        if (constants[key].REAL !== expectedValue.REAL || 
                            constants[key].IMAG !== expectedValue.IMAG) {
                            allConstantsCorrect = false;
                            errors.push(`${key} mismatch`);
                        }
                    } else {
                        // Verificar constantes simples
                        if (Math.abs(constants[key] - expectedValue) > 1e-10) {
                            allConstantsCorrect = false;
                            errors.push(`${key} mismatch`);
                        }
                    }
                }
                
                if (allConstantsCorrect) {
                    this.addTestResult('Physical Constants', 'PASS', 'All physical constants are correct');
                    console.log('[PASS] All physical constants are correct');
                    console.log(`  - λ₇₉₁₉ = ${constants.lambda}`);
                    console.log(`  - φ = ${constants.phi}`);
                    console.log(`  - γ = ${constants.euler}`);
                    console.log(`  - z = ${constants.zComplex.REAL} + ${constants.zComplex.IMAG}i`);
                } else {
                    this.addTestResult('Physical Constants', 'FAIL', `Constant errors: ${errors.join(', ')}`);
                    console.log('[FAIL] Constant errors:', errors);
                }
                
            } else {
                this.addTestResult('Physical Constants', 'FAIL', `Unexpected status: ${response.status}`);
                console.log('[FAIL] Unexpected status:', response.status);
            }
            
        } catch (error) {
            this.addTestResult('Physical Constants', 'FAIL', error.message);
            console.log('[FAIL] Physical constants test failed:', error.message);
        }
    }
    
    /**
     * Prueba de integración
     */
    async testIntegration() {
        console.log('\n[TEST] Testing system integration...');
        
        try {
            // Verificar que los componentes conscientes están registrados
            const response = await axios.get(`${TEST_CONFIG.llmOrchestratorUrl}/api/quantum-state`, {
                timeout: TEST_CONFIG.timeout
            });
            
            if (response.status === 200) {
                const consciousComponents = response.data.consciousComponents;
                
                if (consciousComponents && consciousComponents.length > 0) {
                    this.addTestResult('Integration', 'PASS', `${consciousComponents.length} conscious components registered`);
                    console.log('[PASS] Conscious components registered:', consciousComponents.length);
                    
                    for (const [name, component] of consciousComponents) {
                        console.log(`  - ${name}: ${component.status} (coherence: ${component.coherence.toFixed(4)})`);
                    }
                } else {
                    this.addTestResult('Integration', 'FAIL', 'No conscious components found');
                    console.log('[FAIL] No conscious components found');
                }
                
            } else {
                this.addTestResult('Integration', 'FAIL', `Unexpected status: ${response.status}`);
                console.log('[FAIL] Unexpected status:', response.status);
            }
            
        } catch (error) {
            this.addTestResult('Integration', 'FAIL', error.message);
            console.log('[FAIL] Integration test failed:', error.message);
        }
    }
    
    /**
     * Agrega resultado de prueba
     */
    addTestResult(testName, status, message) {
        this.testResults.push({
            test: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Muestra resultados de las pruebas
     */
    displayTestResults() {
        console.log('\n[RESULTS] Test Results Summary');
        console.log('==============================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        console.log('\n[RESULTS] Detailed Results:');
        for (const result of this.testResults) {
            const statusIcon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${statusIcon} ${result.test}: ${result.message}`);
        }
        
        if (failed === 0) {
            console.log('\n🎉 [SUCCESS] All tests passed! LLM-Quantum Orchestrator Supreme is working correctly.');
        } else {
            console.log('\n⚠️ [WARNING] Some tests failed. Please check the system configuration.');
        }
    }
}

// Función principal
async function main() {
    const tester = new LLMQuantumOrchestratorTest();
    await tester.runAllTests();
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('[FATAL] Test execution failed:', error.message);
        process.exit(1);
    });
}

export default LLMQuantumOrchestratorTest;
