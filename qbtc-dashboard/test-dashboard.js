#!/usr/bin/env node

/**
 * QBTC Dashboard - Test Suite Básico
 * Tests manuales para verificar funcionalidad
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';

function makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'User-Agent': 'QBTC-Dashboard-Test/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 QBTC DASHBOARD - SUITE DE TESTS BÁSICOS');
    console.log('==========================================\n');

    const tests = [
        {
            name: 'Health Check Endpoint',
            path: '/health',
            expectStatus: 200,
            validate: (response) => {
                return response.data &&
                       response.data.status === 'healthy' &&
                       response.data.service === 'QBTC Quantum Dashboard Server';
            }
        },
        {
            name: 'Rate Limiting Info',
            path: '/health',
            expectStatus: 200,
            validate: (response) => {
                return response.data.security &&
                       response.data.security.rateLimiting === 'enabled';
            }
        },
        {
            name: 'Main Dashboard Page',
            path: '/',
            expectStatus: 200,
            validate: (response) => {
                return response.data.includes('QBTC') ||
                       response.headers['content-type']?.includes('text/html');
            }
        },
        {
            name: '404 Handling',
            path: '/nonexistent',
            expectStatus: 404,
            validate: (response) => {
                return response.data.error === 'Not Found';
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`🔍 Ejecutando: ${test.name}`);
            const response = await makeRequest(test.path);

            if (response.status === test.expectStatus && test.validate(response)) {
                console.log(`   ✅ PASSED - Status: ${response.status}`);
                passed++;
            } else {
                console.log(`   ❌ FAILED - Status: ${response.status}, Expected: ${test.expectStatus}`);
                console.log(`   Response:`, response.data);
                failed++;
            }
        } catch (error) {
            console.log(`   ❌ ERROR - ${error.message}`);
            failed++;
        }
        console.log('');
    }

    // Test de rate limiting (básico)
    console.log('🔒 Probando Rate Limiting...');
    try {
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(makeRequest('/health'));
        }

        const results = await Promise.allSettled(promises);
        const rateLimited = results.some(result =>
            result.status === 'fulfilled' &&
            result.value.status === 429
        );

        if (rateLimited) {
            console.log('   ⚠️  Rate limiting activado (esperado)');
        } else {
            console.log('   ✅ Rate limiting no activado (todas las requests pasaron)');
        }
    } catch (error) {
        console.log(`   ❌ Error en test de rate limiting: ${error.message}`);
    }

    console.log('\n==========================================');
    console.log('📊 RESULTADOS FINALES:');
    console.log(`   ✅ Tests pasados: ${passed}`);
    console.log(`   ❌ Tests fallidos: ${failed}`);
    console.log(`   📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 TODOS LOS TESTS PASARON - Dashboard funcionando correctamente!');
    } else {
        console.log('\n⚠️  Algunos tests fallaron - revisar configuración del servidor');
    }

    console.log('==========================================\n');

    // Información adicional
    console.log('💡 INFORMACIÓN ADICIONAL:');
    console.log('   • Servidor debe estar ejecutándose en puerto 4000');
    console.log('   • Rate limiting: 100 requests/15min por IP');
    console.log('   • Health check incluye métricas de seguridad');
    console.log('   • Para tests avanzados, usar herramientas como Postman\n');
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };