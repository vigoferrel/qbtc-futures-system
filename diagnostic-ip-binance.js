#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO IP BINANCE
 * ========================
 *
 * Script para diagnosticar problemas de restricción de IP con Binance API
 */

import https from 'https';
import crypto from 'crypto';
import { networkInterfaces } from 'os';

// Configuración actual de Binance
const config = {
  apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
  secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
  testnet: false
};

// Función para obtener IPs locales
function getLocalIPs() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

// Función para crear firma HMAC-SHA256
function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
              .update(queryString)
              .digest('hex');
}

// Función para hacer request a Binance con logging detallado
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
        'Content-Type': 'application/json',
        'User-Agent': 'QBTC-Quantum-Trader/1.0'
      }
    };

    console.log('🌐 REQUEST DETAILS:');
    console.log(`   URL: https://${baseUrl}${endpoint}`);
    console.log(`   Method: ${options.method}`);
    console.log(`   API Key: ${config.apiKey.substring(0, 10)}...`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Query: ${queryString.substring(0, 100)}...`);
    console.log(`   Signature: ${signature.substring(0, 20)}...`);

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`📡 RESPONSE:`);
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers:`, JSON.stringify(res.headers, null, 2));

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   Raw Response: ${data.substring(0, 200)}...`);

        try {
          const response = JSON.parse(data);
          console.log(`   Parsed Response:`, JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.error(`   Parse Error:`, error.message);
          console.error(`   Raw Data:`, data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`🚨 REQUEST ERROR:`, error.message);
      reject(error);
    });

    req.setTimeout(15000, () => {
      console.error('⏰ TIMEOUT: Request took too long');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Función principal de diagnóstico
async function runIPDiagnostic() {
  console.log('🔍 DIAGNÓSTICO DE RESTRICCIÓN IP BINANCE');
  console.log('========================================\n');

  // Mostrar información de IP local
  console.log('🏠 INFORMACIÓN DE IP LOCAL:');
  const localIPs = getLocalIPs();
  localIPs.forEach((ip, index) => {
    console.log(`   ${index + 1}. ${ip}`);
  });
  console.log('');

  // Verificar configuración
  console.log('🔧 CONFIGURACIÓN ACTUAL:');
  console.log(`   API Key: ${config.apiKey.substring(0, 10)}...${config.apiKey.substring(config.apiKey.length - 5)}`);
  console.log(`   Environment: ${config.testnet ? 'TESTNET' : 'PRODUCTION'}`);
  console.log(`   Endpoint: ${config.testnet ? 'testnet.binance.vision' : 'fapi.binance.com'}`);
  console.log('');

  try {
    console.log('📊 PRUEBA 1: Endpoint /fapi/v2/account (Balance)');
    const accountResponse = await binanceRequest('/fapi/v2/account');

    if (accountResponse.code) {
      console.log('\n❌ RESULTADO: ERROR DE API');
      console.log(`   Código: ${accountResponse.code}`);
      console.log(`   Mensaje: ${accountResponse.msg}`);

      if (accountResponse.code === -2015) {
        console.log('\n🚫 DIAGNÓSTICO: RESTRICCIÓN DE IP DETECTADA');
        console.log('   Las claves de API están restringidas por IP.');
        console.log('   La IP actual NO está en la whitelist de Binance.');
        console.log('\n💡 SOLUCIONES:');
        console.log('   1. Agregar la IP actual a la whitelist en Binance:');
        localIPs.forEach(ip => {
          console.log(`      - ${ip}`);
        });
        console.log('   2. Crear nuevas claves sin restricciones de IP');
        console.log('   3. Usar Testnet (sin restricciones de IP)');
        console.log('\n🔗 PASOS PARA CONFIGURAR IP EN BINANCE:');
        console.log('   1. Ir a: https://www.binance.com/en/my/settings/api-management');
        console.log('   2. Seleccionar las claves de API');
        console.log('   3. Ir a "IP Access Restrictions"');
        console.log('   4. Agregar las IPs listadas arriba');
        console.log('   5. Guardar cambios');

      } else if (accountResponse.code === -2014) {
        console.log('\n🚫 DIAGNÓSTICO: CLAVES INVÁLIDAS');
        console.log('   Las claves de API no son válidas o han expirado.');
      }

    } else {
      console.log('\n✅ RESULTADO: CONEXIÓN EXITOSA');
      console.log(`   Balance: $${parseFloat(accountResponse.totalWalletBalance || 0).toLocaleString()}`);
      console.log('   Las claves funcionan correctamente.');
    }

  } catch (error) {
    console.log('\n❌ RESULTADO: ERROR DE CONEXIÓN');
    console.log(`   Error: ${error.message}`);

    if (error.message.includes('ENOTFOUND')) {
      console.log('   Problema: No se puede resolver el dominio de Binance');
      console.log('   Solución: Verificar conexión a internet');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   Problema: Binance rechaza la conexión');
      console.log('   Solución: Verificar firewall/antivirus');
    }
  }

  console.log('\n📋 RECOMENDACIONES ADICIONALES:');
  console.log('1. Para desarrollo/testing: Usar Testnet (sin restricciones IP)');
  console.log('2. Para producción: Configurar whitelist de IPs en Binance');
  console.log('3. Verificar que las claves tengan permisos para Futures');
  console.log('4. Asegurarse de que las claves no hayan expirado');

  console.log('\n🔄 PRUEBA TESTNET (opcional):');
  console.log('Si quieres probar con Testnet, ejecuta: node test-binance-testnet.js');
}

// Ejecutar diagnóstico
runIPDiagnostic().catch(console.error);



