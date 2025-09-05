#!/usr/bin/env node

/**
 * 🚀 CONFIGURACIÓN SIMPLE DE PROXY PARA BINANCE
 * ============================================
 *
 * Configuración directa usando la IP autorizada: 181.43.243.243
 */

import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import crypto from 'crypto';

// Configuración usando la IP autorizada del usuario
const PROXY_CONFIG = {
  proxyUrl: 'http://181.43.243.243:8080',
  binance: {
    apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
    secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
    testnet: false
  }
};

// Función para crear firma HMAC-SHA256
function createSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey)
               .update(queryString)
               .digest('hex');
}

// Función para probar conexión a Binance usando proxy
async function testBinanceWithProxy() {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const params = { timestamp };

    // Crear query string
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Crear firma
    const signature = createSignature(queryString, PROXY_CONFIG.binance.secretKey);
    const finalQuery = `${queryString}&signature=${signature}`;

    const options = {
      hostname: PROXY_CONFIG.binance.testnet ? 'testnet.binance.vision' : 'fapi.binance.com',
      port: 443,
      path: `/fapi/v2/account?${finalQuery}`,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': PROXY_CONFIG.binance.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'QBTC-Quantum-Trader/1.0'
      },
      agent: new HttpsProxyAgent(PROXY_CONFIG.proxyUrl),
      timeout: 15000
    };

    console.log('🌐 Probando conexión con proxy...');
    console.log(`📡 Proxy: ${PROXY_CONFIG.proxyUrl}`);
    console.log(`🎯 Endpoint: https://${options.hostname}${options.path}`);

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`📡 Status HTTP: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📡 Respuesta de Binance:');
          console.log(JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.error('📡 Error parseando respuesta:', error.message);
          console.error('📡 Datos crudos:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('🚨 Error de conexión:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('⏰ Timeout en conexión');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Función principal
async function configurarProxySimple() {
  console.log('🚀 CONFIGURACIÓN SIMPLE DE PROXY PARA BINANCE');
  console.log('============================================\n');

  console.log('🎯 IP autorizada en Binance: 181.43.243.243');
  console.log('🌐 Configurando proxy: http://181.43.243.243:8080\n');

  try {
    console.log('🔄 Probando conexión a Binance usando proxy...\n');

    const accountInfo = await testBinanceWithProxy();

    if (accountInfo.code === -2015) {
      console.log('\n❌ ERROR -2015: Restricción de IP aún activa');
      console.log('💡 El proxy puede estar usando una IP diferente');
      console.log('🔧 Verifica que el proxy esté configurado correctamente');

      console.log('\n💡 SOLUCIONES:');
      console.log('   1. Verifica que el servidor proxy esté usando la IP 181.43.243.243');
      console.log('   2. Configura el proxy para que use exactamente esa IP');
      console.log('   3. Prueba con un proxy diferente');

    } else if (accountInfo.code) {
      console.log(`\n❌ Error de Binance: Código ${accountInfo.code}`);
      console.log(`📝 Mensaje: ${accountInfo.msg}`);

    } else {
      console.log('\n🎉 ¡CONEXIÓN EXITOSA CON PROXY!');
      console.log('✅ Las claves funcionan correctamente con proxy');

      console.log('\n📊 INFORMACIÓN DE CUENTA:');
      console.log(`💰 Balance total: $${parseFloat(accountInfo.totalWalletBalance || 0).toLocaleString()}`);
      console.log(`📈 P&L no realizado: $${parseFloat(accountInfo.totalUnrealizedProfit || 0).toLocaleString()}`);
      console.log(`💵 Balance disponible: $${parseFloat(accountInfo.availableBalance || 0).toLocaleString()}`);
      console.log(`📊 Posiciones abiertas: ${accountInfo.positions?.filter(p => parseFloat(p.positionAmt) !== 0).length || 0}`);

      // Crear configuración de producción con proxy
      const configProduccion = {
        apiKey: PROXY_CONFIG.binance.apiKey,
        secretKey: PROXY_CONFIG.binance.secretKey,
        testnet: false,
        proxy: PROXY_CONFIG.proxyUrl,
        timeout: 15000,
        workingProxy: true
      };

      // Guardar configuración
      const fs = await import('fs');
      fs.writeFileSync('.binance-config-production.json', JSON.stringify(configProduccion, null, 2));

      console.log('\n💾 Configuración guardada en .binance-config-production.json');

      console.log('\n🔄 PRÓXIMOS PASOS:');
      console.log('   1. Copia la configuración a .binance-config.json');
      console.log('   2. Reinicia el servidor API');
      console.log('   3. Los endpoints usarán datos reales vía proxy');

      console.log('\n📋 COMANDO PARA ACTIVAR:');
      console.log('   copy .binance-config-production.json .binance-config.json');
      console.log('   node api/leonardo-api-simple.js');

    }

  } catch (error) {
    console.log('\n❌ Error en configuración de proxy:');
    console.log(`   ${error.message}`);

    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Problema: No se puede resolver el dominio del proxy');
      console.log('🔧 Verifica que la IP del proxy sea correcta');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Problema: El proxy rechaza la conexión');
      console.log('🔧 Verifica que el puerto del proxy sea correcto (8080)');
    } else if (error.message.includes('Timeout')) {
      console.log('💡 Problema: El proxy está lento o no responde');
      console.log('🔧 Prueba con un proxy diferente');
    }

    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Verifica que el servidor proxy esté funcionando');
    console.log('   2. Confirma que la IP 181.43.243.243 esté autorizada en Binance');
    console.log('   3. Prueba con otro puerto si 8080 no funciona');
    console.log('   4. El sistema funciona perfectamente con datos simulados');
  }
}

// Ejecutar configuración
configurarProxySimple().catch(console.error);

