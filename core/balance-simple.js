#!/usr/bin/env node

/**
 * 💰 QBTC BALANCE EXTRACTOR - SIMPLE VERSION
 * =========================================
 *
 * Versión simplificada para extraer balance de Binance
 */

import crypto from 'crypto';
import https from 'https';

// Credenciales hardcodeadas (para pruebas)
const API_KEY = 'LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q';
const SECRET_KEY = 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu';

async function getBinanceBalance() {
    console.log('💰 EXTRAYENDO BALANCE DE BINANCE');
    console.log('===============================\n');

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = crypto.createHmac('sha256', SECRET_KEY)
                          .update(queryString)
                          .digest('hex');
    const finalQuery = `${queryString}&signature=${signature}`;

    const options = {
        hostname: 'fapi.binance.com',
        path: `/fapi/v2/account?${finalQuery}`,
        method: 'GET',
        headers: {
            'X-MBX-APIKEY': API_KEY,
            'User-Agent': 'QBTC-Balance-Extractor/1.0'
        },
        timeout: 10000
    };

    return new Promise((resolve, reject) => {
        console.log('🔗 Conectando a Binance Futures API...');

        const req = https.request(options, (res) => {
            let data = '';

            console.log(`📡 Status: ${res.statusCode}`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const response = JSON.parse(data);

                        if (response.code === -2015) {
                            console.log('❌ ERROR: IP no autorizada en Binance');
                            console.log('💡 Solución: Agregar IP a whitelist en Binance');
                            resolve(null);
                            return;
                        }

                        console.log('✅ BALANCE EXTRAÍDO EXITOSAMENTE\n');

                        // Mostrar información principal
                        console.log('💰 BALANCE GENERAL:');
                        console.log(`   Total Wallet: $${parseFloat(response.totalWalletBalance || 0).toLocaleString()}`);
                        console.log(`   Available: $${parseFloat(response.availableBalance || 0).toLocaleString()}`);
                        console.log(`   P&L No Realizado: $${parseFloat(response.totalUnrealizedProfit || 0).toLocaleString()}`);
                        console.log(`   Max Withdrawal: $${parseFloat(response.maxWithdrawAmount || 0).toLocaleString()}\n`);

                        // Mostrar posiciones activas
                        if (response.positions) {
                            const activePositions = response.positions.filter(p => parseFloat(p.positionAmt) !== 0);
                            console.log(`📊 POSICIONES ACTIVAS: ${activePositions.length}`);

                            activePositions.forEach(pos => {
                                const pnl = parseFloat(pos.unRealizedProfit);
                                const pnlEmoji = pnl >= 0 ? '🟢' : '🔴';
                                console.log(`   ${pos.symbol}: ${pos.positionAmt} @ $${parseFloat(pos.entryPrice).toLocaleString()} ${pnlEmoji}$${pnl.toLocaleString()}`);
                            });
                        }

                        resolve(response);
                    } else {
                        console.log(`❌ ERROR HTTP: ${res.statusCode}`);
                        console.log(`📝 Respuesta: ${data}`);
                        resolve(null);
                    }
                } catch (error) {
                    console.log('❌ ERROR procesando respuesta:', error.message);
                    console.log('📝 Datos crudos:', data);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ ERROR de conexión:', error.message);
            resolve(null);
        });

        req.on('timeout', () => {
            console.log('⏰ TIMEOUT en la solicitud');
            req.destroy();
            resolve(null);
        });

        req.end();
    });
}

// Ejecutar
console.log('🚀 Iniciando extracción de balance...\n');
getBinanceBalance().then(result => {
    if (result) {
        console.log('\n✅ Extracción completada exitosamente');
    } else {
        console.log('\n❌ Extracción fallida');
    }
}).catch(error => {
    console.error('\n💥 Error fatal:', error.message);
});