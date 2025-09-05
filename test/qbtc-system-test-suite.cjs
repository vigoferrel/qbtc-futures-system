/**
 * QBTC Quantum System - Comprehensive Test Suite
 * Pruebas completas de integración end-to-end
 */

const axios = require('axios');
const WebSocket = require('ws');
const { performance } = require('perf_hooks');

class QBTCSystemTestSuite {
    constructor() {
        this.baseUrl = 'http://localhost:14001';
        this.wsUrl = 'ws://localhost:14000';
        this.frontendUrl = 'http://localhost:3001';
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    // ========== UTILIDADES ==========

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    recordTest(name, passed, duration, error = null) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }

        this.results.tests.push({
            name,
            passed,
            duration,
            error: error ? error.message : null,
            timestamp: Date.now()
        });

        this.log(`${passed ? '✅' : '❌'} ${name} - ${duration.toFixed(2)}ms`, passed ? 'success' : 'error');
    }

    // ========== PRUEBAS DE BACKEND ==========

    async testBackendServices() {
        this.log('🚀 Iniciando pruebas de servicios backend...', 'info');

        // Test API Gateway
        await this.testAPIGateway();

        // Test Message Bus
        await this.testMessageBus();

        // Test Integration Orchestrator
        await this.testIntegrationOrchestrator();

        // Test State Manager
        await this.testStateManager();
    }

    async testAPIGateway() {
        const startTime = performance.now();

        try {
            // Test health endpoint
            const healthResponse = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
            const healthPassed = healthResponse.status === 200;

            // Test system status
            const statusResponse = await axios.get(`${this.baseUrl}/system/status`, { timeout: 5000 });
            const statusPassed = statusResponse.status === 200 && statusResponse.data.status;

            const passed = healthPassed && statusPassed;
            const duration = performance.now() - startTime;

            this.recordTest('API Gateway Health & Status', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('API Gateway Health & Status', false, duration, error);
        }
    }

    async testMessageBus() {
        const startTime = performance.now();

        try {
            // Test WebSocket connection
            const ws = new WebSocket(this.wsUrl);

            const connectionPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

                ws.on('open', () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(true);
                });

                ws.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            await connectionPromise;
            const duration = performance.now() - startTime;
            this.recordTest('Message Bus WebSocket Connection', true, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Message Bus WebSocket Connection', false, duration, error);
        }
    }

    async testIntegrationOrchestrator() {
        const startTime = performance.now();

        try {
            // Test component registration
            const registerResponse = await axios.post(`${this.baseUrl}/system/components/register`, {
                name: 'test-component',
                type: 'test',
                endpoints: {}
            }, { timeout: 5000 });

            const registerPassed = registerResponse.status === 200;

            // Test component listing
            const listResponse = await axios.get(`${this.baseUrl}/system/components`, { timeout: 5000 });
            const listPassed = listResponse.status === 200 && Array.isArray(listResponse.data);

            const passed = registerPassed && listPassed;
            const duration = performance.now() - startTime;

            this.recordTest('Integration Orchestrator Components', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Integration Orchestrator Components', false, duration, error);
        }
    }

    async testStateManager() {
        const startTime = performance.now();

        try {
            // Test state update
            const stateResponse = await axios.post(`${this.baseUrl}/system/state/update`, {
                component: 'test-component',
                state: { status: 'active', data: { test: true } }
            }, { timeout: 5000 });

            const statePassed = stateResponse.status === 200;

            // Test state retrieval
            const getStateResponse = await axios.get(`${this.baseUrl}/system/state/test-component`, { timeout: 5000 });
            const getStatePassed = getStateResponse.status === 200;

            const passed = statePassed && getStatePassed;
            const duration = performance.now() - startTime;

            this.recordTest('State Manager Operations', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('State Manager Operations', false, duration, error);
        }
    }

    // ========== PRUEBAS DE FRONTEND ==========

    async testFrontendIntegration() {
        this.log('🌐 Iniciando pruebas de integración frontend...', 'info');

        // Test React app loading
        await this.testReactApp();

        // Test API integration
        await this.testFrontendAPI();

        // Test WebSocket integration
        await this.testFrontendWebSocket();
    }

    async testReactApp() {
        const startTime = performance.now();

        try {
            const response = await axios.get(this.frontendUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'QBTC-Test-Suite/1.0'
                }
            });

            const passed = response.status === 200 && response.data.includes('QBTC Quantum');
            const duration = performance.now() - startTime;

            this.recordTest('React App Loading', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('React App Loading', false, duration, error);
        }
    }

    async testFrontendAPI() {
        const startTime = performance.now();

        try {
            // Test system status endpoint
            const statusResponse = await axios.get(`${this.frontendUrl}/api/system/status`, {
                timeout: 5000
            });

            const passed = statusResponse.status === 200;
            const duration = performance.now() - startTime;

            this.recordTest('Frontend API Integration', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Frontend API Integration', false, duration, error);
        }
    }

    async testFrontendWebSocket() {
        const startTime = performance.now();

        try {
            // Test WebSocket connection from frontend perspective
            const ws = new WebSocket('ws://localhost:3001'); // React dev server WebSocket

            const connectionPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);

                ws.on('open', () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(true);
                });

                ws.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            await connectionPromise;
            const duration = performance.now() - startTime;
            this.recordTest('Frontend WebSocket Integration', true, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Frontend WebSocket Integration', false, duration, error);
        }
    }

    // ========== PRUEBAS END-TO-END ==========

    async testEndToEnd() {
        this.log('🔄 Iniciando pruebas end-to-end...', 'info');

        // Test complete trading workflow
        await this.testTradingWorkflow();

        // Test analysis workflow
        await this.testAnalysisWorkflow();

        // Test system monitoring
        await this.testSystemMonitoring();
    }

    async testTradingWorkflow() {
        const startTime = performance.now();

        try {
            // Register trading component
            const registerResponse = await axios.post(`${this.baseUrl}/system/components/register`, {
                name: 'e2e-trading-engine',
                type: 'trading',
                endpoints: {
                    http: 'http://localhost:3001/api/trading'
                }
            });

            // Test trading data retrieval
            const tradingResponse = await axios.get(`${this.baseUrl}/api/trading/status`);

            // Test position management
            const positionResponse = await axios.get(`${this.baseUrl}/api/trading/positions`);

            const passed = registerResponse.status === 200 &&
                          tradingResponse.status === 200 &&
                          positionResponse.status === 200;

            const duration = performance.now() - startTime;
            this.recordTest('End-to-End Trading Workflow', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('End-to-End Trading Workflow', false, duration, error);
        }
    }

    async testAnalysisWorkflow() {
        const startTime = performance.now();

        try {
            // Register analysis component
            const registerResponse = await axios.post(`${this.baseUrl}/system/components/register`, {
                name: 'e2e-analysis-engine',
                type: 'analysis',
                endpoints: {
                    http: 'http://localhost:3001/api/analysis'
                }
            });

            // Test market data
            const marketResponse = await axios.get(`${this.baseUrl}/api/analysis/market-data`);

            // Test signals
            const signalResponse = await axios.get(`${this.baseUrl}/api/analysis/signals`);

            const passed = registerResponse.status === 200 &&
                          marketResponse.status === 200 &&
                          signalResponse.status === 200;

            const duration = performance.now() - startTime;
            this.recordTest('End-to-End Analysis Workflow', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('End-to-End Analysis Workflow', false, duration, error);
        }
    }

    async testSystemMonitoring() {
        const startTime = performance.now();

        try {
            // Test system metrics
            const metricsResponse = await axios.get(`${this.baseUrl}/system/metrics`);

            // Test component health
            const healthResponse = await axios.get(`${this.baseUrl}/system/health`);

            // Test performance monitoring
            const perfResponse = await axios.get(`${this.baseUrl}/system/performance`);

            const passed = metricsResponse.status === 200 &&
                          healthResponse.status === 200 &&
                          perfResponse.status === 200;

            const duration = performance.now() - startTime;
            this.recordTest('System Monitoring End-to-End', passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('System Monitoring End-to-End', false, duration, error);
        }
    }

    // ========== PRUEBAS DE PERFORMANCE ==========

    async testPerformance() {
        this.log('⚡ Iniciando pruebas de rendimiento...', 'info');

        // Test API response times
        await this.testAPIResponseTimes();

        // Test concurrent connections
        await this.testConcurrentConnections();

        // Test memory usage
        await this.testMemoryUsage();
    }

    async testAPIResponseTimes() {
        const endpoints = [
            '/health',
            '/system/status',
            '/system/components',
            '/api/trading/status',
            '/api/analysis/market-data'
        ];

        const startTime = performance.now();

        try {
            const promises = endpoints.map(endpoint =>
                axios.get(`${this.baseUrl}${endpoint}`, { timeout: 2000 })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.status === 200);

            const duration = performance.now() - startTime;
            const avgResponseTime = duration / endpoints.length;

            this.recordTest(`API Response Times (${avgResponseTime.toFixed(2)}ms avg)`, allSuccessful, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('API Response Times', false, duration, error);
        }
    }

    async testConcurrentConnections() {
        const startTime = performance.now();

        try {
            // Test 10 concurrent connections
            const promises = Array(10).fill().map(() =>
                axios.get(`${this.baseUrl}/health`, { timeout: 3000 })
            );

            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.status === 200);

            const duration = performance.now() - startTime;
            this.recordTest('Concurrent Connections (10)', allSuccessful, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Concurrent Connections (10)', false, duration, error);
        }
    }

    async testMemoryUsage() {
        const startTime = performance.now();

        try {
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const initialMemory = process.memoryUsage();

            // Perform some operations
            const promises = Array(50).fill().map(() =>
                axios.get(`${this.baseUrl}/health`)
            );
            await Promise.all(promises);

            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

            const passed = memoryIncrease < 50 * 1024 * 1024; // Less than 50MB increase
            const duration = performance.now() - startTime;

            this.recordTest(`Memory Usage (${(memoryIncrease / 1024 / 1024).toFixed(2)}MB)`, passed, duration);

        } catch (error) {
            const duration = performance.now() - startTime;
            this.recordTest('Memory Usage', false, duration, error);
        }
    }

    // ========== EJECUCIÓN PRINCIPAL ==========

    async runAllTests() {
        this.log('🧪 Iniciando QBTC Quantum System Test Suite...', 'info');
        this.log('=' .repeat(60), 'info');

        const totalStartTime = performance.now();

        try {
            // Backend Tests
            await this.testBackendServices();

            // Frontend Tests
            await this.testFrontendIntegration();

            // End-to-End Tests
            await this.testEndToEnd();

            // Performance Tests
            await this.testPerformance();

        } catch (error) {
            this.log(`❌ Error crítico en test suite: ${error.message}`, 'error');
        }

        const totalDuration = performance.now() - totalStartTime;

        // Generate Report
        this.generateReport(totalDuration);
    }

    generateReport(totalDuration) {
        this.log('\n' + '=' .repeat(60), 'info');
        this.log('📊 REPORTE FINAL - QBTC QUANTUM TEST SUITE', 'info');
        this.log('=' .repeat(60), 'info');

        this.log(`⏱️  Tiempo Total: ${totalDuration.toFixed(2)}ms`, 'info');
        this.log(`📈 Tests Totales: ${this.results.total}`, 'info');
        this.log(`✅ Tests Pasados: ${this.results.passed}`, 'success');
        this.log(`❌ Tests Fallidos: ${this.results.failed}`, 'error');

        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
        this.log(`🎯 Tasa de Éxito: ${successRate}%`, this.results.failed === 0 ? 'success' : 'warning');

        // Detailed results
        this.log('\n📋 DETALLE DE TESTS:', 'info');
        this.results.tests.forEach((test, index) => {
            const status = test.passed ? '✅' : '❌';
            this.log(`  ${index + 1}. ${status} ${test.name} - ${test.duration.toFixed(2)}ms`, test.passed ? 'success' : 'error');
            if (test.error) {
                this.log(`     Error: ${test.error}`, 'error');
            }
        });

        // System Health Assessment
        this.log('\n🏥 EVALUACIÓN DE SALUD DEL SISTEMA:', 'info');
        if (this.results.failed === 0) {
            this.log('🎉 SISTEMA COMPLETAMENTE OPERATIVO - TODOS LOS TESTS PASARON', 'success');
        } else if (this.results.passed / this.results.total > 0.8) {
            this.log('⚠️  SISTEMA OPERATIVO - ALGUNOS TESTS FALLARON PERO FUNCIONAL', 'warning');
        } else {
            this.log('❌ SISTEMA CON PROBLEMAS - REVISIÓN REQUERIDA', 'error');
        }

        this.log('=' .repeat(60), 'info');
    }
}

// ========== EJECUCIÓN ==========

if (require.main === module) {
    const testSuite = new QBTCSystemTestSuite();
    testSuite.runAllTests().catch(error => {
        console.error('❌ Error fatal en test suite:', error);
        process.exit(1);
    });
}

module.exports = QBTCSystemTestSuite;