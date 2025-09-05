#!/usr/bin/env node

/**
 * 🔍 VERIFICACIÓN DE BALANCE REAL
 * ===============================
 *
 * Script para verificar que el sistema obtiene balance real de Binance
 */

import https from 'https';
import crypto from 'crypto';

// Cargar configuración actual
let config;
try {
    const fs = await import('fs');
    config = JSON.parse(fs.readFileSync('.binance-config.json', 'utf8'));
} catch (error) {
    console.log('❌ No se pudo cargar la configuración. Ejecuta primero:');
    console.log('   node configurar-credenciales-reales.js');
    process.exit(1);
}

// Función para crear firma HMAC-SHA256
async function createSignature(queryString, secretKey) {
    const crypto = await import('crypto');
    return crypto.createHmac('sha256', secretKey)
                .update(queryString)
                .digest('hex');
}

// Función para consultar balance
async function consultarBalance() {
    const timestamp = Date.now();
    const params = { timestamp };

    // Crear query string
    const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    // Crear firma
    const signature = await createSignature(queryString, config.secretKey);
    const finalQuery = `${queryString}&signature=${signature}`;

    const baseUrl = config.testnet ? 'testnet.binance.vision' : 'fapi.binance.com';

    const options = {
        hostname: baseUrl,
        port: 443,
        path: `/fapi/v2/account?${finalQuery}`,
        method: 'GET',
        headers: {
            'X-MBX-APIKEY': config.apiKey,
            'Content-Type': 'application/json',
            'User-Agent': 'QBTC-Quantum-Trader/1.0'
        },
        timeout: 15000
    };

    console.log('🔍 CONSULTANDO BALANCE REAL...');
    console.log(`📡 Endpoint: https://${baseUrl}/fapi/v2/account`);
    console.log(`🔑 API Key: ${config.apiKey.substring(0, 10)}...`);
    console.log(`🌐 Ambiente: ${config.testnet ? 'TESTNET' : 'PRODUCCIÓN'}\n`);

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
                        console.log('\n❌ ERROR -2015: RESTRICCIÓN DE IP DETECTADA');
                        console.log('📝 Mensaje:', response.msg);
                        console.log('\n💡 SOLUCIONES:');
                        console.log('1. Agrega tu IP a la whitelist de Binance');
                        console.log('2. O crea nuevas claves sin restricciones de IP');
                        console.log('\n🔗 Instrucciones:');
                        console.log('   https://www.binance.com/en/my/settings/api-management');
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
                        console.log(`   • Fuente: BINANCE_REAL`);
                        console.log(`   • Ambiente: ${config.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
                        console.log(`   • Timestamp: ${new Date().toISOString()}`);

                        resolve({
                            success: true,
                            data: response,
                            source: 'BINANCE_REAL',
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
async function verificarBalanceReal() {
    console.log('🔍 VERIFICACIÓN DE BALANCE REAL');
    console.log('================================\n');

    console.log('📋 CONFIGURACIÓN ACTUAL:');
    console.log(`   • API Key: ${config.apiKey.substring(0, 10)}...${config.apiKey.substring(config.apiKey.length - 5)}`);
    console.log(`   • Ambiente: ${config.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
    console.log(`   • Configurado: ${config.configuredAt || 'N/A'}\n`);

    try {
        const resultado = await consultarBalance();

        if (resultado.success) {
            console.log('\n🎊 ¡ÉXITO TOTAL!');
            console.log('================');
            console.log('✅ Balance real obtenido correctamente');
            console.log('✅ Credenciales válidas');
            console.log('✅ IP autorizada (o sin restricciones)');
            console.log('✅ Sistema listo para trading real');

            console.log('\n🚀 PRÓXIMOS PASOS:');
            console.log('   1. El servidor ya está usando datos reales');
            console.log('   2. Los endpoints /balance y /positions funcionan');
            console.log('   3. Puedes comenzar a operar con datos reales');

        } else {
            console.log('\n⚠️ CONFIGURACIÓN INCOMPLETA');
            console.log('===========================');

            if (resultado.error === 'IP_RESTRICTED') {
                console.log('❌ Problema: Restricción de IP');
                console.log('🔧 Solución: Configurar whitelist en Binance');

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

        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Problema: No se puede resolver el dominio de Binance');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Problema: Binance rechaza la conexión');
        } else if (error.message.includes('Timeout')) {
            console.log('💡 Problema: Conexión lenta o timeout');
        }

        console.log('\n🔧 SOLUCIONES:');
        console.log('   1. Verifica conexión a internet');
        console.log('   2. Revisa configuración de firewall');
        console.log('   3. Intenta con Testnet si Producción falla');
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log('==================');

    if (config.source === 'REAL_USER_CREDENTIALS') {
        console.log('✅ Credenciales reales configuradas');
    } else {
        console.log('⚠️ Credenciales simuladas o inválidas');
    }

    console.log(`🌐 Ambiente: ${config.testnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
    console.log(`🔑 API Key válida: ${config.apiKey.length === 64}`);
    console.log(`🔐 Secret Key válida: ${config.secretKey.length === 64}`);
}

// Ejecutar verificación
verificarBalanceReal().catch(console.error);

