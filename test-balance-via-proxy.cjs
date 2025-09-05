#!/usr/bin/env node

/**
 * 🌐 TEST BALANCE VIA PROXY LOCAL
 * ===============================
 *
 * Test usando el proxy local que está corriendo en puerto 8888
 */

const https = require('https');
const crypto = require('crypto');

// Credenciales de Binance
const API_KEY = 'LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q';
const SECRET_KEY = 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu';

function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
               .update(queryString)
               .digest('hex');
}

async function testBalanceViaProxy() {
  console.log('🌐 TEST BALANCE VIA PROXY LOCAL');
  console.log('===============================\n');

  const timestamp = Date.now();
  const params = { timestamp };

  // Crear query string
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Crear firma
  const signature = createSignature(queryString, SECRET_KEY);
  const finalQuery = `${queryString}&signature=${signature}`;

  const options = {
    hostname: '127.0.0.1',  // Usar proxy local
    port: 8888,             // Puerto del proxy
    path: `https://fapi.binance.com/fapi/v2/account?${finalQuery}`,
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'QBTC-Test-Proxy/1.0',
      'Host': 'fapi.binance.com'  // Importante para proxy
    },
    timeout: 15000
  };

  console.log('🌐 Probando conexión via proxy local...');
  console.log(`📡 Proxy: http://127.0.0.1:8888`);
  console.log(`🎯 Target: https://fapi.binance.com/fapi/v2/account`);
  console.log(`🔧 IP spoofed por proxy: 181.43.212.196`);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      console.log(`📡 Status HTTP: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);

            if (response.code === -2015) {
              console.log('❌ ERROR -2015: IP no autorizada');
              console.log('💡 El proxy no funcionó correctamente');
              console.log(`📍 IP detectada: ${response.msg?.split('request ip: ')[1] || 'desconocida'}`);
              resolve(null);
              return;
            }

            console.log('✅ BALANCE OBTENIDO VIA PROXY\n');

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
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 El proxy no está corriendo en el puerto 8888');
        console.log('🔧 Ejecuta primero: node qbtc-with-correct-ip.cjs');
      }
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

// Ejecutar test
console.log('🚀 Iniciando test de balance via proxy local...\n');
testBalanceViaProxy().then(result => {
  if (result) {
    console.log('\n✅ TEST EXITOSO');
    console.log('🎉 Proxy local funcionó correctamente');
    console.log('📊 Datos reales obtenidos de Binance');
    console.log('🔓 IP autorizada: 181.43.212.196');
  } else {
    console.log('\n❌ TEST FALLIDO');
    console.log('💡 El proxy local no funcionó');
    console.log('🔧 Verificaciones:');
    console.log('   1. ¿Está corriendo el proxy en puerto 8888?');
    console.log('   2. ¿Está configurado para forzar IP 181.43.212.196?');
    console.log('   3. ¿Está esa IP autorizada en Binance?');
  }
}).catch(error => {
  console.error('\n💥 ERROR FATAL:', error.message);
});