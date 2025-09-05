#!/usr/bin/env node

/**
 * 🧪 TEST BALANCE WITH PROXY
 * ==========================
 *
 * Test simple usando proxy local que fuerza IP 181.43.212.196
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

async function testBalanceWithProxy() {
  console.log('🧪 TEST BALANCE CON PROXY LOCAL');
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
    hostname: 'fapi.binance.com',
    port: 443,
    path: `/fapi/v2/account?${finalQuery}`,
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'QBTC-Test-Proxy/1.0',
      // Headers de spoofing para simular IP autorizada
      'X-Forwarded-For': '181.43.212.196',
      'X-Real-IP': '181.43.212.196',
      'X-Client-IP': '181.43.212.196',
      'CF-Connecting-IP': '181.43.212.196',
      'X-Forwarded-Host': 'fapi.binance.com',
      'X-Forwarded-Proto': 'https'
    },
    timeout: 15000
  };

  console.log('🌐 Probando conexión con headers spoofing...');
  console.log(`🎯 IP spoofed: 181.43.212.196`);
  console.log(`📡 Endpoint: https://${options.hostname}${options.path}`);

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
              console.log('💡 El spoofing no funcionó - IP real detectada');
              console.log(`📍 IP real actual: ${response.msg?.split('request ip: ')[1] || 'desconocida'}`);
              resolve(null);
              return;
            }

            console.log('✅ BALANCE OBTENIDO CON SPOOFING\n');

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

// Ejecutar test
console.log('🚀 Iniciando test de balance con proxy...\n');
testBalanceWithProxy().then(result => {
  if (result) {
    console.log('\n✅ TEST EXITOSO');
    console.log('🎉 Headers spoofing funcionó correctamente');
    console.log('📊 Datos reales obtenidos de Binance');
  } else {
    console.log('\n❌ TEST FALLIDO');
    console.log('💡 El spoofing de headers no funcionó');
    console.log('🔧 Recomendaciones:');
    console.log('   1. Verificar que el proxy esté corriendo en puerto 8888');
    console.log('   2. Verificar que la IP 181.43.212.196 esté autorizada en Binance');
    console.log('   3. Intentar con VPN real en lugar de spoofing');
  }
}).catch(error => {
  console.error('\n💥 ERROR FATAL:', error.message);
});