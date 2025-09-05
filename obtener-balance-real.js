#!/usr/bin/env node

/**
 * 💰 OBTENER BALANCE REAL CON PROXY
 * ================================
 *
 * Script para obtener balance real usando proxy con IP autorizada
 */

import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Configuración
const BINANCE_CONFIG = {
    apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
    secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
    testnet: false,
    proxyUrl: 'http://181.43.243.243:8080' // IP autorizada por el usuario
};

// Función para crear firma HMAC-SHA256
async function createSignature(queryString, secretKey) {
    const crypto = await import('crypto');
    return crypto.createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');
}

// Función para consultar balance con proxy
async function consultarBalanceConProxy() {
    const timestamp = Date.now();
    const params = { timestamp };

    // Crear query string
    const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    // Crear firma
    const signature = await createSignature(queryString, BINANCE_CONFIG.secretKey);
    const finalQuery = `${queryString}&signature=${signature}`;

    const baseUrl = BINANCE_CONFIG.testnet ? 'testnet.binance.vision' : 'fapi.binance.com';

    const options = {
        hostname: baseUrl,
        port: 443,
        path: `/fapi/v2/account?${finalQuery}`,
        method: 'GET',
        headers: {
            'X-MBX-APIKEY': BINANCE_CONFIG.apiKey,
            'Content-Type': 'application/json',
            'User-Agent': 'QBTC-Quantum-Trader/1.0'
        },
        timeout: 15000,
        agent: new HttpsProxyAgent(BINANCE_CONFIG.proxyUrl)
    };

    console.log('🔍 CONSULTANDO BALANCE REAL CON PROXY');
    console.log('=====================================');
    console.log(`📡 Endpoint: https://${baseUrl}/fapi/v2/account`);
    console.log(`🔑 API Key: ${BINANCE_CONFIG.apiKey.substring(0, 10)}...`);
    console.log(`🌐 Ambiente: ${BINANCE_CONFIG.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
    console.log(`🌍 Proxy: ${BINANCE_CONFIG.proxyUrl}`);
    console.log('');

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            console.log(`📡 Status HTTP: ${res.statusCode}`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (response.code === -2015) {
                        console.log('\n❌ ERROR -2015: RESTRICCIÓN DE IP');
                        console.log('📝 Mensaje:', response.msg);
                        console.log('\n💡 SOLUCIONES:');
                        console.log('1. Verifica que la IP 181.43.243.243 esté autorizada');
                        console.log('2. Confirma que el proxy esté funcionando');
                        console.log('3. Prueba sin proxy si la IP actual está autorizada');
                        resolve({ success: false, error: 'IP_RESTRICTED', details: response });

                    } else if (response.code === -2014) {
                        console.log('\n❌ ERROR -2014: CREDENCIALES INVÁLIDAS');
                        console.log('📝 Mensaje:', response.msg);
                        console.log('\n💡 SOLUCIÓN:');
                        console.log('Ejecuta: node configurar-credenciales-reales.js');
                        resolve({ success: false, error: 'INVALID_CREDENTIALS', details: response });

                    } else if (response.code) {
                        console.log('\n❌ ERROR DE BINANCE:', response.code);
                        console.log('📝 Mensaje:', response.msg);
                        resolve({ success: false, error: 'BINANCE_ERROR', details: response });

                    } else {
                        console.log('\n🎉 ¡BALANCE REAL OBTENIDO EXITOSAMENTE!');
                        console.log('=====================================\n');

                        console.log('💰 BALANCE DETALLADO:');
                        console.log(`   • Balance total: $${parseFloat(response.totalWalletBalance || 0).toLocaleString()}`);
                        console.log(`   • P&L no realizado: $${parseFloat(response.totalUnrealizedProfit || 0).toLocaleString()}`);
                        console.log(`   • Balance margen: $${parseFloat(response.totalMarginBalance || 0).toLocaleString()}`);
                        console.log(`   • Balance disponible: $${parseFloat(response.availableBalance || 0).toLocaleString()}`);
                        console.log(`   • Posiciones abiertas: ${response.positions?.filter(p => parseFloat(p.positionAmt) !== 0).length || 0}`);

                        console.log('\n✅ CONFIGURACIÓN CORRECTA:');
                        console.log(`   • Fuente: BINANCE_REAL_CON_PROXY`);
                        console.log(`   • Ambiente: ${BINANCE_CONFIG.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
                        console.log(`   • Proxy: ${BINANCE_CONFIG.proxyUrl}`);
                        console.log(`   • Timestamp: ${new Date().toISOString()}`);

                        resolve({
                            success: true,
                            data: response,
                            source: 'BINANCE_REAL_CON_PROXY',
                            proxy: BINANCE_CONFIG.proxyUrl,
                            timestamp: Date.now()
                        });
                    }

                } catch (error) {
                    console.error('❌ Error parseando respuesta:', error.message);
                    console.error('📄 Datos crudos:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('🚨 Error de conexión:', error.message);
            console.error('💡 Verifica que el proxy esté funcionando en', BINANCE_CONFIG.proxyUrl);
            reject(error);
        });

        req.setTimeout(15000, () => {
            console.error('⏰ Timeout en conexión');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

// Función principal
async function obtenerBalanceReal() {
    console.log('💰 OBTENER BALANCE REAL DE CUENTA');
    console.log('=================================\n');

    console.log('🎯 OBJETIVO: Obtener balance real usando proxy con IP autorizada');
    console.log('📍 IP autorizada: 181.43.243.243');
    console.log('🌍 Proxy URL: http://181.43.243.243:8080\n');

    try {
        const resultado = await consultarBalanceConProxy();

        if (resultado.success) {
            console.log('\n🎊 ¡ÉXITO TOTAL!');
            console.log('================');
            console.log('✅ Balance real obtenido correctamente');
            console.log('✅ Credenciales válidas');
            console.log('✅ IP autorizada funciona con proxy');
            console.log('✅ Sistema listo para trading real');

            console.log('\n🚀 PRÓXIMOS PASOS:');
            console.log('   1. Configura el API server para usar este proxy');
            console.log('   2. Reinicia el servidor con datos reales');
            console.log('   3. Los endpoints funcionarán con datos reales');

        } else {
            console.log('\n⚠️ CONFIGURACIÓN INCOMPLETA');
            console.log('===========================');

            if (resultado.error === 'IP_RESTRICTED') {
                console.log('❌ Problema: Restricción de IP');
                console.log('🔧 Soluciones:');
                console.log('   • Verifica que 181.43.243.243 esté en whitelist');
                console.log('   • Confirma que el proxy esté funcionando');
                console.log('   • Prueba con Testnet si Producción falla');

            } else if (resultado.error === 'INVALID_CREDENTIALS') {
                console.log('❌ Problema: Credenciales inválidas');
                console.log('🔧 Solución: Obtener credenciales válidas');

            } else {
                console.log(`❌ Problema: ${resultado.error}`);
                console.log('🔧 Solución: Revisar configuración');
            }
        }

    } catch (error) {
        console.log('\n❌ ERROR DE CONEXIÓN');
        console.log('===================');
        console.log(`📝 Error: ${error.message}`);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Problema: El proxy no está respondiendo');
            console.log('🔧 Solución: Verifica que el proxy esté activo en 181.43.243.243:8080');

        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Problema: No se puede resolver la IP del proxy');
            console.log('🔧 Solución: Verifica la conectividad a 181.43.243.243');

        } else if (error.message.includes('Timeout')) {
            console.log('💡 Problema: Conexión lenta o timeout');
            console.log('🔧 Solución: Verifica la velocidad de conexión');

        } else {
            console.log('💡 Problema: Error desconocido');
            console.log('🔧 Solución: Revisa logs detallados');
        }

        console.log('\n💡 ALTERNATIVAS:');
        console.log('   1. Usa datos simulados mientras configuras el proxy');
        console.log('   2. Configura Testnet para pruebas');
        console.log('   3. Verifica configuración de firewall');
    }

    console.log('\n📊 RESUMEN DE CONFIGURACIÓN:');
    console.log('===========================');
    console.log(`🌍 Proxy: ${BINANCE_CONFIG.proxyUrl}`);
    console.log(`🔑 API Key: ${BINANCE_CONFIG.apiKey.substring(0, 10)}... (válida: ${BINANCE_CONFIG.apiKey.length === 64})`);
    console.log(`🔐 Secret Key: ${'*'.repeat(10)}... (válida: ${BINANCE_CONFIG.secretKey.length === 64})`);
    console.log(`🌐 Ambiente: ${BINANCE_CONFIG.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
}

// Ejecutar script
obtenerBalanceReal().catch(console.error);


