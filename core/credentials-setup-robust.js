#!/usr/bin/env node

/**
 * ⚙️ QBTC CREDENTIALS SETUP - ROBUST IMPLEMENTATION
 * ================================================
 *
 * Configuración robusta de credenciales Binance
 * - Validación automática
 * - Encriptación de datos
 * - Sistema de respaldo
 * - Verificación de conectividad
 */

import QBTCCredentialsManager from './credentials-manager.js';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class QBTCCredentialsSetup {
    constructor() {
        this.manager = QBTCCredentialsManager;
    }

    /**
     * ❓ Función para hacer preguntas
     */
    question(prompt) {
        return new Promise((resolve) => {
            rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * 🎯 Inicia el proceso de configuración
     */
    async startSetup() {
        console.log('⚙️ QBTC CREDENTIALS ROBUST SETUP');
        console.log('===============================\n');

        console.log('🔐 Este asistente configurará tus credenciales de Binance de forma segura.\n');

        // Verificar credenciales existentes
        await this.checkExistingCredentials();

        // Preguntar si quiere configurar nuevas credenciales
        const configureNew = await this.question('❓ ¿Quieres configurar nuevas credenciales? (y/n): ');

        if (configureNew.toLowerCase() === 'y' || configureNew.toLowerCase() === 'yes') {
            await this.configureNewCredentials();
        } else {
            console.log('\n📋 CONFIGURACIÓN MANUAL:');
            console.log('=======================');
            console.log('Para configurar manualmente:');
            console.log('1. Edita el archivo .binance-config.json');
            console.log('2. O usa el comando: node core/credentials-manager.js');
        }

        rl.close();
    }

    /**
     * 🔍 Verifica credenciales existentes
     */
    async checkExistingCredentials() {
        console.log('🔍 Verificando credenciales existentes...\n');

        try {
            const credentials = this.manager.getActiveCredentials();
            console.log('✅ Credenciales encontradas:');
            console.log(`   📍 Fuente: ${credentials.source}`);
            console.log(`   🌐 Testnet: ${credentials.testnet ? 'SÍ' : 'NO'}`);
            console.log(`   ✅ Validadas: ${credentials.validated ? 'SÍ' : 'NO'}\n`);

            // Probar conectividad
            console.log('🧪 Probando conectividad...');
            const testResult = await this.manager.testConnectivity(credentials, credentials.testnet);

            if (testResult.success) {
                console.log('✅ CONECTIVIDAD EXITOSA');
                console.log(`💰 Balance: $${parseFloat(testResult.balance || 0).toLocaleString()}`);
                console.log(`🏦 Tipo de cuenta: ${testResult.accountType || 'FUTURES'}\n`);
            } else {
                console.log('❌ PROBLEMA DE CONECTIVIDAD');
                console.log(`🚨 Error: ${testResult.error}`);
                console.log(`📝 Mensaje: ${testResult.message}\n`);
            }

        } catch (error) {
            console.log('❌ No se encontraron credenciales válidas\n');
        }
    }

    /**
     * 🔧 Configura nuevas credenciales
     */
    async configureNewCredentials() {
        console.log('\n🔧 CONFIGURACIÓN DE NUEVAS CREDENCIALES');
        console.log('=====================================\n');

        // Información importante
        console.log('📋 INFORMACIÓN IMPORTANTE:');
        console.log('==========================');
        console.log('• Las API Keys deben tener exactamente 64 caracteres');
        console.log('• Solo caracteres alfanuméricos (A-Z, a-z, 0-9)');
        console.log('• Las credenciales se encriptarán automáticamente');
        console.log('• Se creará un sistema de respaldo automático\n');

        // Preguntar por testnet o mainnet
        const useTestnet = await this.question('🌐 ¿Usar Testnet para pruebas? (y/n) [Recomendado: y]: ');
        const isTestnet = useTestnet.toLowerCase() !== 'n' && useTestnet.toLowerCase() !== 'no';

        if (isTestnet) {
            console.log('\n🧪 MODO TESTNET ACTIVADO');
            console.log('Obtén tus credenciales en: https://testnet.binance.vision/\n');
        } else {
            console.log('\n💰 MODO PRODUCCIÓN ACTIVADO');
            console.log('Obtén tus credenciales en: https://www.binance.com/en/my/settings/api-management\n');
        }

        // Ingresar API Key
        let apiKey = '';
        let apiKeyValid = false;

        while (!apiKeyValid) {
            apiKey = await this.question('🔑 Ingresa tu API Key (64 caracteres): ');

            if (!apiKey) {
                console.log('❌ API Key es requerida\n');
                continue;
            }

            const validation = this.manager.validateCredentials(apiKey, 'dummy_secret');
            if (validation.valid) {
                apiKeyValid = true;
                console.log('✅ API Key válida\n');
            } else {
                console.log('❌ API Key inválida:');
                validation.errors.forEach(error => console.log(`   • ${error}`));
                console.log('');
            }
        }

        // Ingresar Secret Key
        let secretKey = '';
        let secretKeyValid = false;

        while (!secretKeyValid) {
            secretKey = await this.question('🔐 Ingresa tu Secret Key (64 caracteres): ');

            if (!secretKey) {
                console.log('❌ Secret Key es requerida\n');
                continue;
            }

            const validation = this.manager.validateCredentials('dummy_api', secretKey);
            if (validation.valid) {
                secretKeyValid = true;
                console.log('✅ Secret Key válida\n');
            } else {
                console.log('❌ Secret Key inválida:');
                validation.errors.forEach(error => console.log(`   • ${error}`));
                console.log('');
            }
        }

        // Configurar credenciales
        console.log('⚙️ Configurando credenciales...\n');

        try {
            const result = await this.manager.setupCredentials(apiKey, secretKey, isTestnet);

            console.log('✅ CREDENCIALES CONFIGURADAS EXITOSAMENTE');
            console.log('======================================');
            console.log(`💰 Balance de cuenta: $${parseFloat(result.balance || 0).toLocaleString()}`);
            console.log(`🏦 Tipo de cuenta: ${result.accountType || 'FUTURES'}`);
            console.log(`🌐 Entorno: ${isTestnet ? 'TESTNET' : 'PRODUCCIÓN'}`);
            console.log(`🔒 Encriptación: ACTIVADA`);
            console.log(`💾 Respaldo: CREADO\n`);

            // Archivos creados
            console.log('📁 ARCHIVOS CREADOS:');
            console.log('===================');
            const files = [
                '.binance-config-primary.json',
                '.binance-config-primary-encrypted.json',
                '.binance-config-backup.json'
            ];

            files.forEach(file => {
                const exists = fs.existsSync(file);
                console.log(`   ${exists ? '✅' : '❌'} ${file}`);
            });

            console.log('\n🚀 PRÓXIMOS PASOS:');
            console.log('==================');
            console.log('1. Reinicia cualquier servidor que use estas credenciales');
            console.log('2. Prueba la conectividad: node core/credentials-test-robust.js');
            console.log('3. Monitorea el estado: El sistema verificará automáticamente cada 5 minutos');

            if (!isTestnet) {
                console.log('\n⚠️ RECUERDA PARA PRODUCCIÓN:');
                console.log('   • Configurar IP whitelist en Binance');
                console.log('   • Activar 2FA en tu cuenta');
                console.log('   • Nunca compartir las credenciales');
            }

        } catch (error) {
            console.log('❌ ERROR EN CONFIGURACIÓN:');
            console.log(`   ${error.message}\n`);

            console.log('🔧 POSIBLES SOLUCIONES:');
            console.log('======================');
            if (error.message.includes('IP_RESTRICTION')) {
                console.log('   • Configura IP whitelist en Binance');
                console.log('   • O usa testnet para pruebas');
            } else if (error.message.includes('API_ERROR')) {
                console.log('   • Verifica que las credenciales sean correctas');
                console.log('   • Asegúrate de que tengas permisos de Futures');
            } else {
                console.log('   • Verifica tu conexión a internet');
                console.log('   • Intenta nuevamente en unos minutos');
            }
        }
    }
}

// Ejecutar configuración
const setup = new QBTCCredentialsSetup();
setup.startSetup().catch(console.error);