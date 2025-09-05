#!/usr/bin/env node

/**
 * 🔑 CONFIGURACIÓN DE CREDENCIALES REALES BINANCE
 * =============================================
 *
 * Script para configurar credenciales reales de Binance Futures
 */

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer preguntas
function pregunta(texto) {
    return new Promise((resolve) => {
        rl.question(texto, (respuesta) => {
            resolve(respuesta);
        });
    });
}

// Función para validar API Key
function validarApiKey(apiKey) {
    // Las API Keys de Binance tienen 64 caracteres
    if (!apiKey || apiKey.length !== 64) {
        return false;
    }

    // No debe contener caracteres inválidos
    const regex = /^[A-Za-z0-9]+$/;
    return regex.test(apiKey);
}

// Función para validar Secret Key
function validarSecretKey(secretKey) {
    // Las Secret Keys de Binance tienen 64 caracteres
    if (!secretKey || secretKey.length !== 64) {
        return false;
    }

    // No debe contener caracteres inválidos
    const regex = /^[A-Za-z0-9]+$/;
    return regex.test(secretKey);
}

// Función principal
async function configurarCredenciales() {
    console.log('🔑 CONFIGURACIÓN DE CREDENCIALES REALES DE BINANCE');
    console.log('================================================\n');

    console.log('🚨 IMPORTANTE: Para obtener balance REAL, necesitas:');
    console.log('1. Credenciales válidas de Binance');
    console.log('2. IP autorizada en whitelist de Binance');
    console.log('3. Permisos de Futures activados\n');

    console.log('📋 PASOS PARA OBTENER CREDENCIALES REALES:');
    console.log('==========================================\n');

    console.log('1️⃣ ACCEDER A BINANCE:');
    console.log('   • Ve a: https://www.binance.com/en/my/settings/api-management');
    console.log('   • Inicia sesión en tu cuenta\n');

    console.log('2️⃣ CREAR NUEVAS CLAVES API:');
    console.log('   • Haz clic en "Create API"');
    console.log('   • Nombre: "QBTC-Quantum-Trader"');
    console.log('   • Tipo: "System Generated"');
    console.log('   • Permisos: Activar "Enable Futures"');
    console.log('   • NO actives restricciones de IP (por ahora)\n');

    console.log('3️⃣ COPIAR CREDENCIALES:');
    console.log('   • API Key (64 caracteres)');
    console.log('   • Secret Key (64 caracteres)');
    console.log('   • Guarda ambas claves de forma segura\n');

    console.log('4️⃣ CONFIGURAR IP WHITELIST (OPCIONAL):');
    console.log('   • En la misma página, ve a "IP Access Restrictions"');
    console.log('   • Activa "Restrict access to trusted IPs only"');
    console.log('   • Agrega tu IP actual: 181.43.243.243');
    console.log('   • Guarda los cambios\n');

    console.log('💡 NOTA: Si no configuras IP whitelist, las claves funcionarán desde cualquier IP\n');

    // Preguntar si quiere configurar credenciales
    const configurarAhora = await pregunta('\n❓ ¿Quieres configurar las credenciales reales ahora? (y/n): ');

    if (configurarAhora.toLowerCase() === 'y' || configurarAhora.toLowerCase() === 'yes') {

        console.log('\n🔐 INGRESANDO CREDENCIALES REALES');
        console.log('==================================\n');

        let apiKey, secretKey;
        let apiKeyValida = false;
        let secretKeyValida = false;

        // Validar API Key
        while (!apiKeyValida) {
            apiKey = await pregunta('Ingresa tu API Key (64 caracteres): ');
            apiKeyValida = validarApiKey(apiKey);

            if (!apiKeyValida) {
                console.log('❌ API Key inválida. Debe tener exactamente 64 caracteres alfanuméricos.');
            }
        }

        console.log('✅ API Key válida\n');

        // Validar Secret Key
        while (!secretKeyValida) {
            secretKey = await pregunta('Ingresa tu Secret Key (64 caracteres): ');
            secretKeyValida = validarSecretKey(secretKey);

            if (!secretKeyValida) {
                console.log('❌ Secret Key inválida. Debe tener exactamente 64 caracteres alfanuméricos.');
            }
        }

        console.log('✅ Secret Key válida\n');

        // Crear configuración
        const configReal = {
            apiKey: apiKey,
            secretKey: secretKey,
            testnet: false,
            timeout: 10000,
            recvWindow: 5000,
            configuredAt: new Date().toISOString(),
            source: 'REAL_USER_CREDENTIALS'
        };

        // Guardar configuración
        fs.writeFileSync('.binance-config-real.json', JSON.stringify(configReal, null, 2));
        fs.writeFileSync('.binance-config.json', JSON.stringify(configReal, null, 2));

        console.log('💾 Credenciales guardadas exitosamente!');
        console.log('📁 Archivos creados:');
        console.log('   • .binance-config.json (configuración principal)');
        console.log('   • .binance-config-real.json (backup)\n');

        console.log('🚀 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. Reinicia el servidor API:');
        console.log('   node api/leonardo-api-simple.js');
        console.log('');
        console.log('2. Prueba el balance real:');
        console.log('   curl http://localhost:14777/api/leonardo/balance');
        console.log('');
        console.log('3. Si obtienes error -2015, configura IP whitelist en Binance');

    } else {
        console.log('\n📚 INSTRUCCIONES PARA CONFIGURACIÓN MANUAL:');
        console.log('===========================================\n');

        console.log('1. Obtén tus credenciales de Binance Futures');
        console.log('2. Edita el archivo .binance-config.json');
        console.log('3. Reemplaza las claves actuales con las reales');
        console.log('4. Reinicia el servidor');
        console.log('');
        console.log('Ejemplo de configuración:');
        console.log(`{
  "apiKey": "TU_API_KEY_DE_64_CARACTERES",
  "secretKey": "TU_SECRET_KEY_DE_64_CARACTERES",
  "testnet": false
}`);
    }

    console.log('\n🔍 VERIFICACIÓN DE FUNCIONAMIENTO:');
    console.log('==================================');
    console.log('Después de configurar, deberías ver en los logs:');
    console.log('✅ "[CHECK] Balance real obtenido: $X,XXX.XX"');
    console.log('✅ "source": "BINANCE_REAL"');
    console.log('');
    console.log('En lugar de:');
    console.log('❌ "source": "SIMULADO_INVALID_CREDENTIALS"');

    rl.close();
}

// Ejecutar configuración
configurarCredenciales().catch(console.error);



