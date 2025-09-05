#!/usr/bin/env node

/**
 * 🔧 SIMPLE BINANCE CONNECTIVITY TEST
 * ===================================
 *
 * Test rápido de conectividad con Binance API
 */

import axios from 'axios';

async function testBinanceConnectivity() {
    console.log('🔧 Testing Binance API Connectivity...\n');

    const tests = [
        {
            name: 'Futures Ticker (BTCUSDT)',
            url: 'https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT'
        },
        {
            name: 'Spot Ticker (BTCUSDT)',
            url: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
        },
        {
            name: 'Futures Exchange Info',
            url: 'https://fapi.binance.com/fapi/v1/exchangeInfo'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}`);
            const startTime = Date.now();

            const response = await axios.get(test.url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'QBTC-Test/1.0',
                    'Accept': 'application/json'
                }
            });

            const latency = Date.now() - startTime;
            console.log(`✅ SUCCESS: ${response.status} (${latency}ms)`);

            if (response.data && typeof response.data === 'object') {
                console.log(`   📊 Data received: ${Object.keys(response.data).length} fields`);
            }

        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
            }
        }

        console.log('');
    }

    console.log('🏁 Connectivity test completed');
}

// Ejecutar test
testBinanceConnectivity().catch(console.error);

