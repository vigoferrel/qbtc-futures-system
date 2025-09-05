#!/usr/bin/env node

/**
 * 🧪 TEST CONEXIÓN BINANCE TESTNET
 * ================================
 *
 * Script para probar la conexión con Binance Testnet (sin restricciones IP)
 */

import https from 'https';
import crypto from 'crypto';

// Configuración de Binance TESTNET (mismas claves, pero en testnet)
const config = {
  apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
  secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
  testnet: true // IMPORTANTE: Cambiado a true
};

// Función para crear firma HMAC-SHA256
function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
              .update(queryString)
              .digest('hex');
}

// Función para hacer request a Binance TESTNET
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

    console.log(`[TESTNET] Conectando a: ${baseUrl}${endpoint}`);
    console.log(`[TESTNET] Query: ${queryString.substring(0, 100)}...`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout en conexión Testnet'));
    });

    req.end();
  });
}

// Función principal de test
async function testBinanceTestnet() {
  console.log('🧪 TEST DE CONEXIÓN BINANCE TESTNET (SIN RESTRICCIONES IP)');
  console.log('=========================================================\n');

  try {
    console.log('📊 Probando endpoint /fapi/v2/account en TESTNET...');

    const accountInfo = await binanceRequest('/fapi/v2/account');

    if (accountInfo.code) {
      console.error('❌ Error en Testnet:');
      console.error(`   Código: ${accountInfo.code}`);
      console.error(`   Mensaje: ${accountInfo.msg}`);

      if (accountInfo.code === -2015) {
        console.log('\n🚫 Las claves no funcionan en Testnet tampoco');
        console.log('💡 Posibles causas:');
        console.log('   1. Las claves son solo para producción');
        console.log('   2. Las claves han expirado');
        console.log('   3. Las claves no tienen permisos para Futures');
      }
    } else {
      console.log('✅ CONEXIÓN TESTNET EXITOSA!');
      console.log('🎉 Las claves funcionan correctamente en Testnet');

      // Mostrar información relevante
      console.log('\n📈 INFORMACIÓN DE CUENTA TESTNET:');
      console.log(`   Balance total: $${parseFloat(accountInfo.totalWalletBalance || 0).toLocaleString()}`);
      console.log(`   P&L no realizado: $${parseFloat(accountInfo.totalUnrealizedProfit || 0).toLocaleString()}`);
      console.log(`   Balance margen: $${parseFloat(accountInfo.totalMarginBalance || 0).toLocaleString()}`);
      console.log(`   Balance disponible: $${parseFloat(accountInfo.availableBalance || 0).toLocaleString()}`);
      console.log(`   Posiciones abiertas: ${accountInfo.positions?.filter(p => parseFloat(p.positionAmt) !== 0).length || 0}`);

      console.log('\n💡 RECOMENDACIONES:');
      console.log('   ✅ Testnet funciona - puedes desarrollar aquí');
      console.log('   📝 Para producción: Configurar IPs en whitelist');
      console.log('   🔄 Cambiar config a testnet para desarrollo');
    }

  } catch (error) {
    console.error('❌ Error en test de Testnet:');
    console.error(`   ${error.message}`);

    if (error.message.includes('ENOTFOUND')) {
      console.log('   Problema: No se puede resolver testnet.binance.vision');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   Problema: Testnet no disponible');
    }

    console.log('\n💡 SOLUCIONES ALTERNATIVAS:');
    console.log('   1. Mantener modo simulado (datos simulados)');
    console.log('   2. Crear nuevas claves de API solo para Testnet');
    console.log('   3. Configurar IPs en producción');
  }
}

// Ejecutar test
testBinanceTestnet().catch(console.error);



