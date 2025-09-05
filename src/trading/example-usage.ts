/**
 * Ejemplo de uso del sistema QBTC Trading refactorizado
 * Demuestra cómo usar la nueva arquitectura modular
 */

import { QBTCTradingSystem } from './QBTCTradingSystem';
import { TradingConfig } from './types';

// Configuración del sistema
const tradingConfig: TradingConfig = {
  apiKey: process.env.BINANCE_API_KEY || '',
  secretKey: process.env.BINANCE_SECRET_KEY || '',
  testnet: process.env.BINANCE_TESTNET === 'true',
  baseUrl: 'https://fapi.binance.com',
  recvWindow: 5000,
  timeout: 10000
};

async function main() {
  try {
    console.log('🚀 Iniciando ejemplo de QBTC Trading System...\n');

    // Crear instancia del sistema
    const tradingSystem = new QBTCTradingSystem(tradingConfig);

    // Configurar event listeners
    tradingSystem.on('system-initialized', (data) => {
      console.log('✅ Sistema inicializado:', data.timestamp);
    });

    tradingSystem.on('system-ready', (data) => {
      console.log('🚀 Sistema listo para trading:', data.timestamp);
    });

    tradingSystem.on('trading-state-updated', (data) => {
      console.log('📊 Estado de trading actualizado:', {
        balance: data.state.balance?.total || 'N/A',
        positions: data.state.positions.length,
        orders: data.state.orders.length
      });
    });

    tradingSystem.on('system-error', (data) => {
      console.error('❌ Error del sistema:', data.error);
    });

    // Esperar a que el sistema esté inicializado
    await new Promise(resolve => {
      tradingSystem.once('system-initialized', resolve);
    });

    // Iniciar el sistema
    await tradingSystem.startSystem();

    // Mostrar estado del sistema
    console.log('\n📊 Estado del sistema:');
    const systemState = tradingSystem.getSystemState();
    console.log(JSON.stringify(systemState, null, 2));

    // Mostrar métricas
    console.log('\n📈 Métricas del sistema:');
    const metrics = tradingSystem.getSystemMetrics();
    console.log(JSON.stringify(metrics, null, 2));

    // Simular operación de trading
    console.log('\n🔄 Simulando operaciones de trading...');
    
    // Mantener el sistema corriendo por 30 segundos
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Detener el sistema
    console.log('\n🛑 Deteniendo sistema...');
    tradingSystem.stopSystem();

    // Mostrar estado final
    console.log('\n📊 Estado final del sistema:');
    const finalState = tradingSystem.getSystemState();
    console.log(JSON.stringify(finalState, null, 2));

    // Destruir sistema
    tradingSystem.destroy();
    console.log('\n✅ Ejemplo completado exitosamente');

  } catch (error) {
    console.error('❌ Error en ejemplo:', error);
    process.exit(1);
  }
}

// Función para mostrar información del sistema
function showSystemInfo(tradingSystem: QBTCTradingSystem) {
  console.log('\n🔍 Información del sistema:');
  const info = tradingSystem.getSystemInfo();
  console.log(`Versión: ${info.version}`);
  console.log(`Estado: ${info.status}`);
  console.log(`Uptime: ${info.uptime}ms`);
  console.log(`Testnet: ${info.config.testnet}`);
  console.log(`Base URL: ${info.config.baseUrl}`);
}

// Función para monitorear estado en tiempo real
function startMonitoring(tradingSystem: QBTCTradingSystem) {
  const interval = setInterval(() => {
    const state = tradingSystem.getSystemState();
    const tradingState = tradingSystem.getTradingState();
    
    console.log('\n📊 Estado en tiempo real:');
    console.log(`Sistema: ${state.health.status}`);
    console.log(`Trading: ${state.trading ? 'Activo' : 'Inactivo'}`);
    console.log(`Autenticación: ${state.authentication ? 'Conectado' : 'Desconectado'}`);
    console.log(`Proxy: ${state.proxy ? 'Conectado' : 'Desconectado'}`);
    console.log(`Balance: ${tradingState.balance?.total || 'N/A'}`);
    console.log(`Posiciones: ${tradingState.positions.length}`);
    console.log(`Órdenes: ${tradingState.orders.length}`);
    
    // Detener monitoreo después de 5 actualizaciones
    if (state.health.lastCheck.getTime() > Date.now() - 50000) {
      clearInterval(interval);
    }
  }, 10000);
}

// Ejecutar ejemplo si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

export { main, showSystemInfo, startMonitoring };
