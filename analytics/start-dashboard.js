#!/usr/bin/env node

/**
 * QBTC Advanced Analytics Dashboard - Script de Inicio Rápido
 * Inicialización completa del sistema con configuración automática
 */

const path = require('path');
const fs = require('fs');

// Configuración automática
const CONFIG = {
    ports: {
        messageBus: 14000,
        dashboard: 14002,
        apiGateway: 14001
    },
    timeout: 10000,
    maxRetries: 3
};

async function checkDependencies() {
    console.log('🔍 Verificando dependencias...');

    const requiredModules = [
        'express',
        'ws',
        'cors',
        'helmet',
        'express-rate-limit'
    ];

    const missingModules = [];

    for (const module of requiredModules) {
        try {
            require.resolve(module);
        } catch (error) {
            missingModules.push(module);
        }
    }

    if (missingModules.length > 0) {
        console.log('📦 Instalando dependencias faltantes...');
        const { execSync } = require('child_process');
        try {
            execSync(`npm install ${missingModules.join(' ')}`, { stdio: 'inherit' });
            console.log('✅ Dependencias instaladas correctamente');
        } catch (error) {
            console.error('❌ Error instalando dependencias:', error.message);
            console.log('💡 Ejecuta manualmente: npm install');
            return false;
        }
    } else {
        console.log('✅ Todas las dependencias están instaladas');
    }

    return true;
}

async function checkPorts() {
    console.log('🔌 Verificando puertos disponibles...');

    const net = require('net');

    for (const [service, port] of Object.entries(CONFIG.ports)) {
        const isAvailable = await checkPort(port);

        if (!isAvailable) {
            console.log(`⚠️  Puerto ${port} (${service}) está ocupado`);
            console.log(`💡 Asegúrate de que no haya otros servicios ejecutándose en el puerto ${port}`);
            return false;
        } else {
            console.log(`✅ Puerto ${port} (${service}) disponible`);
        }
    }

    return true;
}

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.listen(port, () => {
            server.close();
            resolve(true);
        });

        server.on('error', () => {
            resolve(false);
        });
    });
}

async function initializeMessageBus() {
    console.log('📡 Inicializando Message Bus...');

    try {
        const QBTCMessageBus = require('../core/qbtc-message-bus.cjs');

        const messageBus = new QBTCMessageBus({
            port: CONFIG.ports.messageBus,
            maxConnections: 1000,
            heartbeatInterval: 30000
        });

        await messageBus.initialize();
        console.log('✅ Message Bus inicializado correctamente');

        return messageBus;
    } catch (error) {
        console.error('❌ Error inicializando Message Bus:', error.message);
        throw error;
    }
}

async function initializeDashboard(messageBus) {
    console.log('📊 Inicializando Advanced Analytics Dashboard...');

    try {
        const QBTCAdvancedAnalyticsDashboard = require('./qbtc-advanced-analytics-dashboard.js');

        const dashboardConfig = {
            port: CONFIG.ports.dashboard,
            aiEngineEnabled: true,
            realTimeUpdates: true,
            predictionHorizons: [5, 15, 60, 240],
            maxHistoricalData: 10000
        };

        const dashboard = new QBTCAdvancedAnalyticsDashboard(messageBus, dashboardConfig);
        await dashboard.initialize();
        console.log('✅ Dashboard inicializado correctamente');

        return dashboard;
    } catch (error) {
        console.error('❌ Error inicializando Dashboard:', error.message);
        throw error;
    }
}

async function startSystem() {
    console.log('🚀 Iniciando QBTC Advanced Analytics Dashboard...');
    console.log('='.repeat(60));

    try {
        // Paso 1: Verificar dependencias
        const depsOk = await checkDependencies();
        if (!depsOk) {
            console.error('❌ Dependencias faltantes. Abortando...');
            process.exit(1);
        }

        // Paso 2: Verificar puertos
        const portsOk = await checkPorts();
        if (!portsOk) {
            console.error('❌ Puertos ocupados. Abortando...');
            process.exit(1);
        }

        // Paso 3: Inicializar componentes
        console.log('\n🏗️  Inicializando componentes del sistema...');

        const messageBus = await initializeMessageBus();
        const dashboard = await initializeDashboard(messageBus);

        // Paso 4: Mostrar información de acceso
        console.log('\n🎉 ¡Sistema inicializado exitosamente!');
        console.log('='.repeat(60));
        console.log('📱 DASHBOARD DISPONIBLE EN:');
        console.log(`   🌐 Web Dashboard: http://localhost:${CONFIG.ports.dashboard}/dashboard`);
        console.log(`   🔗 WebSocket: ws://localhost:${CONFIG.ports.dashboard}`);
        console.log(`   📡 Message Bus: ws://localhost:${CONFIG.ports.messageBus}`);
        console.log('');
        console.log('📊 ENDPOINTS DISPONIBLES:');
        console.log(`   🏥 Health Check: http://localhost:${CONFIG.ports.dashboard}/health`);
        console.log(`   📈 Analytics State: http://localhost:${CONFIG.ports.dashboard}/api/analytics/state`);
        console.log(`   🔮 Predictions: http://localhost:${CONFIG.ports.dashboard}/api/analytics/predictions`);
        console.log('');
        console.log('🔧 COMANDOS ÚTILES:');
        console.log('   💻 Presiona Ctrl+C para detener el sistema');
        console.log('   📝 Ejecuta "npm run example" para ver demostración completa');
        console.log('   📊 Monitorea logs en tiempo real arriba');
        console.log('='.repeat(60));

        // Mantener el sistema ejecutándose
        await keepAlive(messageBus, dashboard);

    } catch (error) {
        console.error('❌ Error iniciando el sistema:', error);
        console.log('\n🔧 Sugerencias de solución:');
        console.log('   1. Verifica que los puertos 14000-14002 estén libres');
        console.log('   2. Ejecuta "npm install" para instalar dependencias');
        console.log('   3. Verifica que Node.js >= 18.0.0 esté instalado');
        console.log('   4. Revisa los logs de error arriba para más detalles');
        process.exit(1);
    }
}

async function keepAlive(messageBus, dashboard) {
    // Mantener referencias para limpieza
    const components = { messageBus, dashboard };

    // Manejar señales de terminación
    const cleanup = async (signal) => {
        console.log(`\n🛑 Recibida señal ${signal}, iniciando limpieza...`);

        try {
            if (dashboard && typeof dashboard.shutdown === 'function') {
                await dashboard.shutdown();
            }

            if (messageBus && typeof messageBus.shutdown === 'function') {
                await messageBus.shutdown();
            }

            console.log('✅ Limpieza completada exitosamente');
        } catch (error) {
            console.error('❌ Error durante la limpieza:', error.message);
        }

        process.exit(0);
    };

    process.on('SIGINT', () => cleanup('SIGINT'));
    process.on('SIGTERM', () => cleanup('SIGTERM'));
    process.on('SIGUSR2', () => cleanup('SIGUSR2')); // Para nodemon

    // Mantener el proceso vivo
    return new Promise(() => {
        // El proceso se mantendrá vivo hasta recibir una señal
    });
}

// Función principal
if (require.main === module) {
    startSystem().catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = { startSystem, checkDependencies, checkPorts };




