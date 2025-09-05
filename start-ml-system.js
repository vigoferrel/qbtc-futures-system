#!/usr/bin/env node

/**
 * 🚀 QBTC ML SYSTEM - STARTUP SCRIPT
 * ==================================
 * 
 * Script de inicio para lanzar el Sistema ML Unificado QBTC
 * con todos los componentes integrados.
 * 
 * COMPONENTES INCLUIDOS:
 * ✅ Quantum Neural Networks
 * ✅ Risk Assessment Engine
 * ✅ Reinforcement Learning Agent
 * ✅ AutoML Pipeline
 * ✅ Time Series Forecasting (LSTM, Transformer, Quantum RNN)
 * ✅ Ensemble Methods
 * ✅ Hyperparameter Optimization
 * ✅ Performance Monitoring
 * ✅ Background Execution
 * 
 * MODO DE USO:
 * node start-ml-system.js
 * node start-ml-system.js --port=14700
 * node start-ml-system.js --foreground
 * node start-ml-system.js --debug
 */

import QBTCMLSystemLauncher from './launchers/qbtc-ml-system-launcher.js';
import { QUANTUM_CONSTANTS } from './config/constants.js';

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2);
const config = {};

args.forEach(arg => {
    if (arg.startsWith('--port=')) {
        config.mlSystemPort = parseInt(arg.split('=')[1]);
    } else if (arg === '--foreground') {
        config.runInBackground = false;
    } else if (arg === '--debug') {
        config.logLevel = 'DEBUG';
        config.enableDetailedLogs = true;
    } else if (arg === '--no-auto-restart') {
        config.autoRestart = false;
    } else if (arg === '--no-automl') {
        config.enableAutoML = false;
    }
});

// Configuración por defecto
const defaultConfig = {
    // Launcher Configuration
    runInBackground: true,
    autoRestart: true,
    maxRestarts: 3,
    restartDelay: 5000,
    
    // ML System Configuration
    mlSystemPort: 14700,
    enableAutoML: true,
    trainingInBackground: true,
    
    // Monitoring
    metricsUpdateInterval: 30000,
    healthCheckInterval: 10000,
    
    // Logging
    enableDetailedLogs: true,
    logLevel: 'INFO',
    logRotation: true,
    
    // System Integration
    useKernelMetrics: true,
    quantumRandomization: true,
    systemResourceMonitoring: true,
    
    // Advanced Features
    enableWebSocket: true,
    autoTraining: true,
    hyperparameterOptimization: true,
    featureSelection: true,
    modelEnsembling: true
};

// Combinar configuraciones
const finalConfig = { ...defaultConfig, ...config };

console.log('🚀 QBTC ML SYSTEM - UNIVERSAL LAUNCHER');
console.log('=====================================');
console.log('');
console.log('🎯 COMPONENTES INTEGRADOS:');
console.log('✅ Quantum Neural Networks');
console.log('✅ Risk Assessment Engine'); 
console.log('✅ Reinforcement Learning Agent');
console.log('✅ AutoML Pipeline');
console.log('✅ Time Series Forecasting');
console.log('✅ Ensemble Methods');
console.log('✅ Hyperparameter Optimization');
console.log('✅ Performance Monitoring');
console.log('');
console.log('⚙️ CONFIGURACIÓN:');
console.log(`   Puerto: ${finalConfig.mlSystemPort}`);
console.log(`   Background: ${finalConfig.runInBackground ? 'Sí' : 'No'}`);
console.log(`   AutoML: ${finalConfig.enableAutoML ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`   Auto Restart: ${finalConfig.autoRestart ? 'Habilitado' : 'Deshabilitado'}`);
console.log(`   Log Level: ${finalConfig.logLevel}`);
console.log(`   Quantum Constants: λ=${QUANTUM_CONSTANTS.LAMBDA_7919}`);
console.log('');

// Crear launcher
const launcher = new QBTCMLSystemLauncher(finalConfig);

// Configurar handlers de eventos
launcher.on('system-started', () => {
    console.log('✅ Sistema ML iniciado exitosamente');
    console.log('🌐 Endpoints disponibles:');
    console.log(`   - Health Check: http://localhost:${finalConfig.mlSystemPort}/health`);
    console.log(`   - Models: http://localhost:${finalConfig.mlSystemPort}/models`);
    console.log(`   - Predict: POST http://localhost:${finalConfig.mlSystemPort}/predict`);
    console.log(`   - Metrics: http://localhost:${finalConfig.mlSystemPort}/metrics`);
    
    if (finalConfig.enableWebSocket) {
        console.log(`   - WebSocket: ws://localhost:${finalConfig.mlSystemPort}/ws`);
    }
    
    console.log('');
    console.log('🎛️ COMANDOS DISPONIBLES:');
    console.log('   r - Reiniciar Sistema');
    console.log('   s - Mostrar Estado');
    console.log('   h - Mostrar Ayuda');
    console.log('   Ctrl+C - Cerrar');
    console.log('');
});

launcher.on('system-stopped', () => {
    console.log('⏹️ Sistema ML detenido');
});

// Función principal
async function main() {
    try {
        console.log('🔧 Inicializando launcher...');
        await launcher.initialize();
        
        console.log('🚀 Iniciando sistema ML...');
        await launcher.start();
        
        // Si está corriendo en background, mantener el proceso activo
        if (finalConfig.runInBackground) {
            console.log('📊 Sistema ejecutándose en segundo plano...');
            console.log('🔍 Monitoreo automático activo');
            
            // Mostrar status inicial después de 5 segundos
            setTimeout(() => {
                launcher.displayStatus();
            }, 5000);
            
            // Generar reporte completo después de 30 segundos
            setTimeout(() => {
                launcher.generateReport();
            }, 30000);
            
            // Configurar intervalos de reporte
            setInterval(() => {
                launcher.saveMetrics();
            }, 300000); // Cada 5 minutos
            
            // Mantener proceso vivo
            process.stdin.resume();
        }
        
    } catch (error) {
        console.error('❌ Error fatal iniciando sistema ML:');
        console.error(error.message);
        console.error('');
        console.error('💡 TIPS PARA SOLUCIÓN:');
        console.error('   - Verificar que no hay otro proceso usando el puerto');
        console.error('   - Revisar permisos de archivos y directorios');
        console.error('   - Verificar espacio en disco disponible');
        console.error('   - Revisar logs en ./logs/ml-system/');
        
        process.exit(1);
    }
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    launcher.log('error', `Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    launcher.log('error', `Unhandled Rejection: ${reason}`);
});

// Mostrar ayuda si se solicita
if (args.includes('--help') || args.includes('-h')) {
    console.log('🚀 QBTC ML SYSTEM - AYUDA');
    console.log('=========================');
    console.log('');
    console.log('OPCIONES:');
    console.log('  --port=PUERTO          Puerto para el servidor (default: 14700)');
    console.log('  --foreground           Ejecutar en primer plano');
    console.log('  --debug                Habilitar logs de debug');
    console.log('  --no-auto-restart      Deshabilitar auto-restart');
    console.log('  --no-automl            Deshabilitar AutoML');
    console.log('  --help, -h             Mostrar esta ayuda');
    console.log('');
    console.log('EJEMPLOS:');
    console.log('  node start-ml-system.js');
    console.log('  node start-ml-system.js --port=15000');
    console.log('  node start-ml-system.js --debug --foreground');
    console.log('');
    process.exit(0);
}

// Ejecutar función principal
main();
