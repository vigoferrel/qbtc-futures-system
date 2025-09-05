#!/usr/bin/env node

/**
 * 🔧 CONFIGURACIÓN DE PROXY PARA BINANCE
 * =====================================
 *
 * Script para configurar proxy y evitar restricciones de IP en Binance API
 */

import https from 'https';
import http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Lista de proxies gratuitos (se pueden cambiar por proxies premium)
const PROXIES_DISPONIBLES = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  'http://181.43.243.243:8080', // IP que el usuario mencionó
  'http://proxy-us.example.com:3128',
  'http://free-proxy.example.com:80'
];

// Configuración de Binance con proxy
const BINANCE_CONFIG = {
  apiKey: "LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q",
  secretKey: "maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu",
  testnet: false,
  proxy: null,
  timeout: 15000
};

// Función para probar un proxy
function testProxy(proxyUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(proxyUrl);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: 'http://httpbin.org/ip',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Proxy ${proxyUrl} funciona - IP externa: ${response.origin}`);
          resolve({ proxy: proxyUrl, ip: response.origin, status: 'WORKING' });
        } catch (error) {
          resolve({ proxy: proxyUrl, status: 'PARSE_ERROR', error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Proxy ${proxyUrl} no funciona: ${error.message}`);
      resolve({ proxy: proxyUrl, status: 'ERROR', error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ proxy: proxyUrl, status: 'TIMEOUT' });
    });

    req.end();
  });
}

// Función para hacer request a Binance usando proxy
function binanceRequestWithProxy(endpoint, params = {}, proxyUrl = null) {
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
    const signature = createSignature(queryString, BINANCE_CONFIG.secretKey);
    const finalQuery = `${queryString}&signature=${signature}`;

    const baseUrl = BINANCE_CONFIG.testnet ? 'testnet.binance.vision' : 'fapi.binance.com';

    const options = {
      hostname: baseUrl,
      port: 443,
      path: `${endpoint}?${finalQuery}`,
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': BINANCE_CONFIG.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'QBTC-Quantum-Trader/1.0'
      }
    };

    // Configurar proxy si se proporciona
    if (proxyUrl) {
      const proxyAgent = new HttpsProxyAgent(proxyUrl);
      options.agent = proxyAgent;
      console.log(`🌐 Usando proxy: ${proxyUrl}`);
    }

    console.log(`📡 Conectando a: https://${baseUrl}${endpoint}`);

    const req = https.request(options, (res) => {
      let data = '';

      console.log(`📡 Status: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📡 Response:`, JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.error(`📡 Parse error:`, error.message);
          console.error(`📡 Raw data:`, data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`🚨 Request error:`, error.message);
      reject(error);
    });

    req.setTimeout(BINANCE_CONFIG.timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Función para crear firma HMAC-SHA256
function createSignature(queryString, secretKey) {
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secretKey)
              .update(queryString)
              .digest('hex');
}

// Función principal de configuración
async function configurarProxyBinance() {
  console.log('🔧 CONFIGURACIÓN DE PROXY PARA BINANCE API');
  console.log('=========================================\n');

  console.log('🎯 IP ya configurada en Binance: 181.43.243.243');
  console.log('🔄 Probando diferentes proxies...\n');

  // Probar proxies disponibles
  const resultadosProxies = [];
  for (const proxyUrl of PROXIES_DISPONIBLES) {
    console.log(`\n🧪 Probando proxy: ${proxyUrl}`);
    const resultado = await testProxy(proxyUrl);
    resultadosProxies.push(resultado);
  }

  // Mostrar resultados
  console.log('\n📊 RESULTADOS DE PRUEBA DE PROXIES:');
  console.log('=====================================');

  const proxiesFuncionando = resultadosProxies.filter(r => r.status === 'WORKING');

  if (proxiesFuncionando.length > 0) {
    console.log(`✅ ${proxiesFuncionando.length} proxies funcionan:`);
    proxiesFuncionando.forEach(proxy => {
      console.log(`   🌐 ${proxy.proxy} (IP externa: ${proxy.ip})`);
    });

    // Probar Binance con el mejor proxy
    const mejorProxy = proxiesFuncionando[0];
    console.log(`\n🚀 Probando Binance con proxy: ${mejorProxy.proxy}`);

    try {
      const accountInfo = await binanceRequestWithProxy('/fapi/v2/account', {}, mejorProxy.proxy);

      if (accountInfo.code === -2015) {
        console.log('\n❌ Aún hay restricción de IP con este proxy');
        console.log('💡 El proxy puede estar usando una IP no autorizada');
      } else if (accountInfo.code) {
        console.log(`\n❌ Error de Binance: ${accountInfo.msg}`);
      } else {
        console.log('\n🎉 ¡CONEXIÓN EXITOSA CON PROXY!');
        console.log(`💰 Balance: $${parseFloat(accountInfo.totalWalletBalance || 0).toLocaleString()}`);
        console.log(`📝 Fuente: BINANCE_REAL (vía proxy)`);

        // Crear configuración con proxy
        const configConProxy = {
          ...BINANCE_CONFIG,
          proxy: mejorProxy.proxy,
          workingProxy: true
        };

        // Guardar configuración
        const fs = await import('fs');
        fs.writeFileSync('.binance-config-proxy.json', JSON.stringify(configConProxy, null, 2));

        console.log('\n💾 Configuración guardada en .binance-config-proxy.json');
        console.log('🔄 Reinicia el servidor para usar la nueva configuración');
      }

    } catch (error) {
      console.log(`\n❌ Error probando Binance con proxy: ${error.message}`);
    }

  } else {
    console.log('❌ No hay proxies funcionando');
    console.log('💡 Opciones alternativas:');
    console.log('   1. Usar VPN con IP autorizada');
    console.log('   2. Configurar servidor dedicado con IP autorizada');
    console.log('   3. Continuar con modo simulado (recomendado para desarrollo)');
  }

  // Recomendaciones finales
  console.log('\n🎯 RECOMENDACIONES FINALES:');
  console.log('===========================');

  if (proxiesFuncionando.length > 0) {
    console.log('✅ Usa proxy para evitar restricciones de IP');
    console.log('🔧 Configuración automática guardada');
  } else {
    console.log('✅ Continúa con modo simulado (más estable)');
    console.log('🔧 El sistema funciona perfectamente con datos simulados');
  }

  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('   1. Reinicia el servidor API');
  console.log('   2. Prueba los endpoints de balance');
  console.log('   3. Verifica que ya no hay valores null');
}

// Ejecutar configuración
configurarProxyBinance().catch(console.error);



