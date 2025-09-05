#!/usr/bin/env node

/**
 * 🔧 BINANCE CONNECTIVITY TEST & DIAGNOSTIC
 * ========================================
 *
 * Diagnóstico completo de conectividad con Binance API
 * - Verificación de endpoints
 * - Validación de formato de requests
 * - Test de rate limiting
 * - Diagnóstico de errores 400
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

class BinanceConnectivityTest {
    constructor() {
        this.endpoints = {
            // Futures API endpoints
            futuresTicker: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
            futuresKlines: 'https://fapi.binance.com/fapi/v1/klines',
            futuresExchangeInfo: 'https://fapi.binance.com/fapi/v1/exchangeInfo',

            // Spot API endpoints
            spotTicker: 'https://api.binance.com/api/v3/ticker/24hr',
            spotExchangeInfo: 'https://api.binance.com/api/v3/exchangeInfo',

            // Testnet endpoints
            testnetFutures: 'https://testnet.binancefuture.com/fapi/v1/ticker/24hr',
            testnetSpot: 'https://testnet.binance.vision/api/v3/ticker/24hr'
        };

        this.testSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
        this.results = {
            passed: 0,
            failed: 0,
            errors: [],
            latencies: []
        };

        console.log('🔧 Binance Connectivity Test initialized');
    }

    /**
     * Ejecutar test completo de conectividad
     */
    async runFullTest() {
        console.log('\n🚀 Starting Binance Connectivity Test...\n');

        try {
            // Test 1: Conectividad básica
            await this.testBasicConnectivity();

            // Test 2: Validación de endpoints
            await this.testEndpoints();

            // Test 3: Formato de requests
            await this.testRequestFormats();

            // Test 4: Rate limiting
            await this.testRateLimiting();

            // Test 5: WebSocket connectivity
            await this.testWebSocketConnectivity();

            // Resultados finales
            this.printResults();

        } catch (error) {
            console.error('❌ Fatal error in connectivity test:', error.message);
        }
    }

    /**
     * Test de conectividad básica
     */
    async testBasicConnectivity() {
        console.log('🌐 Testing basic connectivity...');

        const testCases = [
            { name: 'Futures API', url: this.endpoints.futuresTicker + '?symbol=BTCUSDT' },
            { name: 'Spot API', url: this.endpoints.spotTicker + '?symbol=BTCUSDT' },
            { name: 'Futures Exchange Info', url: this.endpoints.futuresExchangeInfo },
            { name: 'Spot Exchange Info', url: this.endpoints.spotExchangeInfo }
        ];

        for (const testCase of testCases) {
            try {
                const startTime = performance.now();
                const response = await axios.get(testCase.url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'QBTC-Connectivity-Test/1.0',
                        'Accept': 'application/json'
                    }
                });

                const latency = performance.now() - startTime;
                this.results.latencies.push(latency);

                console.log(`✅ ${testCase.name}: ${response.status} (${latency.toFixed(2)}ms)`);
                this.results.passed++;

                // Verificar estructura de respuesta
                if (Array.isArray(response.data) || typeof response.data === 'object') {
                    console.log(`   📊 Response format: OK`);
                }

            } catch (error) {
                console.log(`❌ ${testCase.name}: ${error.message}`);
                this.results.failed++;
                this.results.errors.push({
                    test: testCase.name,
                    error: error.message,
                    code: error.code,
                    status: error.response?.status
                });
            }
        }
    }

    /**
     * Test de validación de endpoints
     */
    async testEndpoints() {
        console.log('\n🔗 Testing endpoint validation...');

        const endpointsToTest = [
            { name: 'Futures Ticker', url: this.endpoints.futuresTicker, params: { symbol: 'BTCUSDT' } },
            { name: 'Futures Klines', url: this.endpoints.futuresKlines, params: { symbol: 'BTCUSDT', interval: '1h', limit: 10 } },
            { name: 'Spot Ticker', url: this.endpoints.spotTicker, params: { symbol: 'BTCUSDT' } }
        ];

        for (const endpoint of endpointsToTest) {
            try {
                const response = await axios.get(endpoint.url, {
                    params: endpoint.params,
                    timeout: 5000
                });

                console.log(`✅ ${endpoint.name}: ${response.status}`);

                // Verificar que la respuesta tenga datos válidos
                if (response.data && (Array.isArray(response.data) ? response.data.length > 0 : Object.keys(response.data).length > 0)) {
                    console.log(`   📊 Data received: ${Array.isArray(response.data) ? response.data.length : 'object'} items`);
                } else {
                    console.log(`   ⚠️ Empty response`);
                }

                this.results.passed++;

            } catch (error) {
                console.log(`❌ ${endpoint.name}: ${error.message}`);
                this.results.failed++;
                this.results.errors.push({
                    test: endpoint.name,
                    error: error.message,
                    params: endpoint.params
                });
            }
        }
    }

    /**
     * Test de formato de requests
     */
    async testRequestFormats() {
        console.log('\n📝 Testing request formats...');

        // Test diferentes formatos de parámetros
        const formatTests = [
            {
                name: 'Standard query params',
                url: this.endpoints.futuresTicker,
                params: { symbol: 'BTCUSDT' }
            },
            {
                name: 'Multiple symbols',
                url: this.endpoints.futuresTicker,
                params: { symbols: '["BTCUSDT","ETHUSDT"]' }
            },
            {
                name: 'Klines with all params',
                url: this.endpoints.futuresKlines,
                params: {
                    symbol: 'BTCUSDT',
                    interval: '1h',
                    startTime: Date.now() - 86400000, // 24 horas atrás
                    endTime: Date.now(),
                    limit: 100
                }
            }
        ];

        for (const test of formatTests) {
            try {
                const response = await axios.get(test.url, {
                    params: test.params,
                    timeout: 5000
                });

                console.log(`✅ ${test.name}: ${response.status}`);
                this.results.passed++;

            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                this.results.failed++;
                this.results.errors.push({
                    test: test.name,
                    error: error.message,
                    params: test.params
                });
            }
        }
    }

    /**
     * Test de rate limiting
     */
    async testRateLimiting() {
        console.log('\n⏱️ Testing rate limiting...');

        const requests = [];
        const numRequests = 5;

        console.log(`Making ${numRequests} rapid requests...`);

        for (let i = 0; i < numRequests; i++) {
            const startTime = performance.now();

            try {
                const response = await axios.get(this.endpoints.futuresTicker + '?symbol=BTCUSDT', {
                    timeout: 2000
                });

                const latency = performance.now() - startTime;
                requests.push({ success: true, latency, status: response.status });

            } catch (error) {
                const latency = performance.now() - startTime;
                requests.push({
                    success: false,
                    latency,
                    error: error.message,
                    status: error.response?.status
                });
            }

            // Pequeño delay entre requests
            if (i < numRequests - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        const successful = requests.filter(r => r.success).length;
        const failed = requests.filter(r => !r.success).length;
        const avgLatency = requests.reduce((sum, r) => sum + r.latency, 0) / requests.length;

        console.log(`📊 Results: ${successful}/${numRequests} successful, ${failed} failed`);
        console.log(`⏱️ Average latency: ${avgLatency.toFixed(2)}ms`);

        if (failed > 0) {
            console.log('⚠️ Rate limiting detected or connectivity issues');
            this.results.errors.push({
                test: 'Rate limiting test',
                error: `${failed} requests failed`,
                details: requests.filter(r => !r.success)
            });
        }

        this.results.passed += successful;
        this.results.failed += failed;
    }

    /**
     * Test de conectividad WebSocket
     */
    async testWebSocketConnectivity() {
        console.log('\n🔌 Testing WebSocket connectivity...');

        try {
            // Importar WebSocket dinámicamente para evitar errores si no está disponible
            const WebSocket = (await import('ws')).default;

            const ws = new WebSocket('wss://stream.binance.com:9443/ws');

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    ws.close();
                    console.log('❌ WebSocket test: Timeout');
                    this.results.failed++;
                    resolve();
                }, 5000);

                ws.on('open', () => {
                    console.log('✅ WebSocket connection: SUCCESS');

                    // Enviar un ping
                    ws.send(JSON.stringify({
                        method: 'SUBSCRIBE',
                        params: ['btcusdt@ticker'],
                        id: 1
                    }));

                    setTimeout(() => {
                        ws.close();
                        clearTimeout(timeout);
                        this.results.passed++;
                        resolve();
                    }, 1000);
                });

                ws.on('error', (error) => {
                    console.log(`❌ WebSocket error: ${error.message}`);
                    clearTimeout(timeout);
                    this.results.failed++;
                    this.results.errors.push({
                        test: 'WebSocket connectivity',
                        error: error.message
                    });
                    resolve();
                });
            });

        } catch (error) {
            console.log(`❌ WebSocket test failed: ${error.message}`);
            this.results.failed++;
        }
    }

    /**
     * Imprimir resultados del test
     */
    printResults() {
        console.log('\n' + '='.repeat(50));
        console.log('🎯 BINANCE CONNECTIVITY TEST RESULTS');
        console.log('='.repeat(50));

        console.log(`✅ Tests passed: ${this.results.passed}`);
        console.log(`❌ Tests failed: ${this.results.failed}`);
        console.log(`📊 Total tests: ${this.results.passed + this.results.failed}`);

        if (this.results.latencies.length > 0) {
            const avgLatency = this.results.latencies.reduce((sum, lat) => sum + lat, 0) / this.results.latencies.length;
            const minLatency = Math.min(...this.results.latencies);
            const maxLatency = Math.max(...this.results.latencies);

            console.log(`⏱️ Latency: ${avgLatency.toFixed(2)}ms (min: ${minLatency.toFixed(2)}ms, max: ${maxLatency.toFixed(2)}ms)`);
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS FOUND:');
            this.results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.test}: ${error.error}`);
                if (error.params) {
                    console.log(`      Params: ${JSON.stringify(error.params)}`);
                }
            });

            console.log('\n🔧 RECOMMENDATIONS:');
            console.log('   1. Check API keys if authentication is required');
            console.log('   2. Verify symbol names are correct');
            console.log('   3. Check network connectivity');
            console.log('   4. Consider using testnet for development');
            console.log('   5. Implement exponential backoff for retries');
        } else {
            console.log('\n🎉 ALL TESTS PASSED - Connectivity is good!');
        }

        console.log('='.repeat(50) + '\n');
    }

    /**
     * Ejecutar diagnóstico específico para error 400
     */
    async diagnose400Error() {
        console.log('\n🔍 DIAGNOSTIC FOR 400 BAD REQUEST ERRORS\n');

        const diagnosticTests = [
            {
                name: 'Symbol validation',
                test: async () => {
                    const symbols = ['BTCUSDT', 'ETHUSDT', 'INVALID_SYMBOL'];
                    for (const symbol of symbols) {
                        try {
                            const response = await axios.get(`${this.endpoints.futuresTicker}?symbol=${symbol}`);
                            console.log(`   ${symbol}: ✅ ${response.status}`);
                        } catch (error) {
                            console.log(`   ${symbol}: ❌ ${error.response?.status || 'Unknown'} - ${error.message}`);
                        }
                    }
                }
            },
            {
                name: 'Parameter validation',
                test: async () => {
                    const testParams = [
                        { symbol: 'BTCUSDT' },
                        { symbol: 'btcusdt' }, // lowercase
                        { symbol: 'BTCUSDT', interval: 'invalid' },
                        { symbol: 'BTCUSDT', limit: 1000 }, // too high
                        { symbol: 'BTCUSDT', limit: 'invalid' } // wrong type
                    ];

                    for (const params of testParams) {
                        try {
                            const response = await axios.get(this.endpoints.futuresKlines, { params });
                            console.log(`   Params: ${JSON.stringify(params)} - ✅ ${response.status}`);
                        } catch (error) {
                            console.log(`   Params: ${JSON.stringify(params)} - ❌ ${error.response?.status || 'Unknown'} - ${error.message}`);
                        }
                    }
                }
            }
        ];

        for (const diagnostic of diagnosticTests) {
            console.log(`Testing: ${diagnostic.name}`);
            await diagnostic.test();
            console.log('');
        }
    }
}

/**
 * Función principal
 */
async function main() {
    console.log('🔧 QBTC Binance Connectivity Test\n');

    const tester = new BinanceConnectivityTest();

    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2);

    if (args.includes('--diagnose-400')) {
        await tester.diagnose400Error();
    } else if (args.includes('--quick')) {
        await tester.testBasicConnectivity();
        tester.printResults();
    } else {
        await tester.runFullTest();
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default BinanceConnectivityTest;

