#!/usr/bin/env node

/**
 * 🧪 TEST CONEXIÓN BINANCE
 * =======================
 *
 * Script para probar la conexión con Binance API
 */

import https from 'https';
import crypto from 'crypto';

// Configuración de Binance (usando el archivo de configuración)
const config = {
  apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
  secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
  testnet: false
};

// Función para crear firma HMAC-SHA256
function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
              .update(queryString)
              .digest('hex');
}

// Función para hacer request a Binance
function binanceRequest(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();

    // Añadir timestamp
    params.timestamp = timestamp;

    // Crear query string
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Crear firma
    const signature = createSignature(queryString, config.secretKey);
    const finalQuery = `${queryString}&signature=${signature}`;

    const baseUrl = config.testnet ? 'testnet.binance.vision' : 'fapi.binance.com';

    const options = {
      hostname: baseUrl,
      port: 443,
      path: `${endpoint}?${finalQuery}`,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': config.apiKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(`[TEST] Conectando a: ${baseUrl}${endpoint}`);
    console.log(`[TEST] Query: ${queryString.substring(0, 100)}...`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`[TEST] Status: ${res.statusCode}`);
          console.log(`[TEST] Response:`, JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.error(`[TEST] Error parseando respuesta:`, error.message);
          console.error(`[TEST] Raw data:`, data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[TEST] Error de conexión:`, error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout en conexión'));
    });

    req.end();
  });
}

// Función principal de test
async function testBinanceConnection() {
  console.log('🧪 TEST DE CONEXIÓN BINANCE API');
  console.log('================================\n');

  try {
    console.log('📊 Probando endpoint /fapi/v2/account...');

    const accountInfo = await binanceRequest('/fapi/v2/account');

    if (accountInfo.code) {
      console.error('❌ Error de Binance API:');
      console.error(`   Código: ${accountInfo.code}`);
      console.error(`   Mensaje: ${accountInfo.msg}`);
      return;
    }

    console.log('✅ Conexión exitosa con Binance!');

    // Mostrar información relevante
    console.log('\n📈 INFORMACIÓN DE CUENTA:');
    console.log(`   Balance total: $${parseFloat(accountInfo.totalWalletBalance || 0).toLocaleString()}`);
    console.log(`   P&L no realizado: $${parseFloat(accountInfo.totalUnrealizedProfit || 0).toLocaleString()}`);
    console.log(`   Balance margen: $${parseFloat(accountInfo.totalMarginBalance || 0).toLocaleString()}`);
    console.log(`   Balance disponible: $${parseFloat(accountInfo.availableBalance || 0).toLocaleString()}`);
    console.log(`   Posiciones abiertas: ${accountInfo.positions?.filter(p => parseFloat(p.positionAmt) !== 0).length || 0}`);

  } catch (error) {
    console.error('❌ Error en test de conexión:');
    console.error(`   ${error.message}`);

    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Posibles causas:');
      console.log('   - Sin conexión a internet');
      console.log('   - Firewall bloqueando conexión');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Posibles causas:');
      console.log('   - Binance API no disponible');
      console.log('   - Problemas de red');
    }
  }
}

// Ejecutar test
testBinanceConnection().catch(console.error);



