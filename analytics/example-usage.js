/**
 * QBTC Advanced Analytics Dashboard - Ejemplo de Uso Completo
 * Demostración de integración completa con el sistema QBTC
 */

const QBTCMessageBus = require('../core/qbtc-message-bus.cjs');
const QBTCAdvancedAnalyticsDashboard = require('./qbtc-advanced-analytics-dashboard.js');

async function main() {
    console.log('🚀 Iniciando ejemplo completo de QBTC Advanced Analytics Dashboard...');

    try {
        // ===== PASO 1: INICIALIZACIÓN DEL SISTEMA =====

        console.log('\n📡 Inicializando Message Bus...');
        const messageBus = new QBTCMessageBus({
            port: 14000,
            maxConnections: 1000,
            heartbeatInterval: 30000
        });

        await messageBus.initialize();
        console.log('✅ Message Bus inicializado en puerto 14000');

        // ===== PASO 2: CONFIGURACIÓN DEL DASHBOARD =====

        console.log('\n📊 Inicializando Advanced Analytics Dashboard...');
        const dashboardConfig = {
            port: 14002,
            aiEngineEnabled: true,
            realTimeUpdates: true,
            predictionHorizons: [5, 15, 60, 240], // minutos
            maxHistoricalData: 10000
        };

        const dashboard = new QBTCAdvancedAnalyticsDashboard(messageBus, dashboardConfig);
        await dashboard.initialize();
        console.log('✅ Dashboard inicializado en puerto 14002');

        // ===== PASO 3: SIMULACIÓN DE DATOS DE MERCADO =====

        console.log('\n📈 Iniciando simulación de datos de mercado...');

        // Simular datos de mercado en tiempo real
        const marketSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
        let simulationCounter = 0;

        const marketDataSimulator = setInterval(() => {
            simulationCounter++;

            // Generar datos de mercado simulados
            const marketData = generateSimulatedMarketData(marketSymbols, simulationCounter);

            // Enviar datos al Message Bus
            messageBus.broadcastMessage({
                type: 'market-data-update',
                data: marketData,
                timestamp: Date.now(),
                source: 'simulator'
            });

            console.log(`📊 Simulación #${simulationCounter}: Enviados datos de ${marketSymbols.length} símbolos`);

            // Simular trades ejecutados
            if (simulationCounter % 10 === 0) {
                const tradeData = generateSimulatedTrade(marketSymbols);
                messageBus.broadcastMessage({
                    type: 'trade-executed',
                    data: tradeData,
                    timestamp: Date.now(),
                    source: 'trading-engine'
                });
                console.log(`💰 Trade ejecutado: ${tradeData.symbol} ${tradeData.side} ${tradeData.quantity}`);
            }

            // Simular alertas del sistema
            if (simulationCounter % 25 === 0) {
                const alertData = generateSimulatedAlert();
                messageBus.broadcastMessage({
                    type: 'system-alert',
                    data: alertData,
                    timestamp: Date.now(),
                    severity: alertData.severity
                });
                console.log(`🚨 Alerta del sistema: ${alertData.message}`);
            }

        }, 2000); // Cada 2 segundos

        // ===== PASO 4: DEMOSTRACIÓN DE FUNCIONALIDADES =====

        console.log('\n🎯 Iniciando demostración de funcionalidades...');

        // Esperar a que el sistema esté listo
        setTimeout(async () => {

            console.log('\n📡 Probando API REST...');

            // Probar health check
            try {
                const response = await fetch('http://localhost:14002/health');
                const health = await response.json();
                console.log('🏥 Health Check:', health);
            } catch (error) {
                console.error('❌ Error en health check:', error.message);
            }

            // Probar estado del sistema
            try {
                const response = await fetch('http://localhost:14002/api/analytics/state');
                const state = await response.json();
                console.log('📊 Estado del sistema:', {
                    status: state.marketState ? 'OK' : 'ERROR',
                    timestamp: new Date(state.timestamp).toLocaleTimeString()
                });
            } catch (error) {
                console.error('❌ Error obteniendo estado:', error.message);
            }

            // Probar predicciones
            try {
                const response = await fetch('http://localhost:14002/api/analytics/predictions');
                const predictions = await response.json();
                console.log('🔮 Predicciones disponibles:', predictions.length);
            } catch (error) {
                console.error('❌ Error obteniendo predicciones:', error.message);
            }

        }, 5000);

        // ===== PASO 5: DEMOSTRACIÓN DE WEBSOCKET =====

        console.log('\n🌐 Probando WebSocket connection...');

        setTimeout(() => {
            const WebSocket = require('ws');
            const ws = new WebSocket('ws://localhost:14002');

            ws.on('open', () => {
                console.log('🔗 WebSocket conectado exitosamente');

                // Suscribirse a eventos de predicciones
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    data: {
                        subscriptionType: 'real-time-predictions'
                    }
                }));

                // Suscribirse a actualizaciones de analytics
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    data: {
                        subscriptionType: 'analytics-update'
                    }
                }));

                console.log('📡 Suscripciones realizadas');
            });

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());

                    switch (message.type) {
                        case 'connection-established':
                            console.log('✅ Conexión establecida:', message.clientId);
                            break;
                        case 'subscription-confirmed':
                            console.log('📝 Suscripción confirmada:', message.subscriptionType);
                            break;
                        case 'real-time-predictions':
                            console.log('🔮 Nueva predicción recibida');
                            break;
                        case 'analytics-update':
                            console.log('📊 Analytics actualizado - Coherencia:', message.data.coherence?.toFixed(3));
                            break;
                        default:
                            console.log('📨 Mensaje recibido:', message.type);
                    }
                } catch (error) {
                    console.error('❌ Error procesando mensaje WebSocket:', error);
                }
            });

            ws.on('error', (error) => {
                console.error('❌ Error WebSocket:', error);
            });

            ws.on('close', () => {
                console.log('🔌 WebSocket desconectado');
            });

            // Cerrar WebSocket después de 30 segundos
            setTimeout(() => {
                ws.close();
            }, 30000);

        }, 3000);

        // ===== PASO 6: MONITOREO CONTINUO =====

        console.log('\n📈 Iniciando monitoreo continuo...');

        const monitoringInterval = setInterval(() => {
            const metrics = dashboard.getPerformanceMetrics();
            console.log(`📊 Métricas en tiempo real:
                - Eventos procesados: ${metrics.processedEvents}
                - Predicciones generadas: ${metrics.predictionsGenerated}
                - Conexiones activas: ${metrics.connections}
                - Uptime: ${Math.floor(metrics.uptime / 1000)}s
                - Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
        }, 10000); // Cada 10 segundos

        // ===== PASO 7: LIMPIEZA Y CIERRE =====

        // Manejar señales de terminación
        process.on('SIGINT', async () => {
            console.log('\n🛑 Recibida señal de terminación, limpiando...');

            clearInterval(marketDataSimulator);
            clearInterval(monitoringInterval);

            await dashboard.shutdown();
            await messageBus.shutdown();

            console.log('✅ Limpieza completada. ¡Hasta luego!');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Recibida señal SIGTERM, limpiando...');

            clearInterval(marketDataSimulator);
            clearInterval(monitoringInterval);

            await dashboard.shutdown();
            await messageBus.shutdown();

            console.log('✅ Limpieza completada. ¡Hasta luego!');
            process.exit(0);
        });

        console.log('\n🎉 Ejemplo completo iniciado exitosamente!');
        console.log('📱 Dashboard disponible en: http://localhost:14002/dashboard');
        console.log('🔧 Presiona Ctrl+C para detener');

    } catch (error) {
        console.error('❌ Error en el ejemplo:', error);
        process.exit(1);
    }
}

// ========== FUNCIONES AUXILIARES ==========

function generateSimulatedMarketData(symbols, counter) {
    const basePrices = {
        'BTCUSDT': 103407.50,
        'ETHUSDT': 4644.65,
        'ADAUSDT': 0.8358,
        'SOLUSDT': 198.45,
        'DOTUSDT': 8.945
    };

    const marketData = {};

    symbols.forEach(symbol => {
        const basePrice = basePrices[symbol] || 100;
        const volatility = 0.02; // 2% volatility
        const trend = Math.sin(counter / 10) * 0.01; // Trend component
        const noise = (Math.random() - 0.5) * volatility; // Random noise

        const price = basePrice * (1 + trend + noise);
        const change24h = (Math.sin(counter / 20) + Math.random() - 0.5) * 0.05;
        const volume = 1000000 + Math.random() * 500000;
        const rsi = 30 + Math.sin(counter / 15) * 40 + Math.random() * 20;

        marketData[symbol] = {
            symbol,
            price: Math.max(0.000001, price),
            change24h,
            volume,
            rsi: Math.max(0, Math.min(100, rsi)),
            timestamp: Date.now()
        };
    });

    return marketData;
}

function generateSimulatedTrade(symbols) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const sides = ['BUY', 'SELL'];
    const side = sides[Math.floor(Math.random() * sides.length)];

    return {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        quantity: Math.floor(Math.random() * 100) + 10,
        price: 50000 + Math.random() * 10000, // Random price around BTC level
        timestamp: Date.now(),
        status: 'FILLED'
    };
}

function generateSimulatedAlert() {
    const alerts = [
        {
            id: 'alert_high_volatility',
            type: 'market_volatility',
            severity: 'warning',
            message: 'Volatilidad elevada detectada en múltiples símbolos',
            details: 'Índice de volatilidad > 3.5%'
        },
        {
            id: 'alert_coherence_drop',
            type: 'quantum_coherence',
            severity: 'critical',
            message: 'Caída significativa en coherencia cuántica',
            details: 'Coherencia λ₇₉₁₉ por debajo del 40%'
        },
        {
            id: 'alert_prediction_accuracy',
            type: 'ai_performance',
            severity: 'info',
            message: 'Precisión de predicciones mejorada',
            details: 'Accuracy aumentó al 87.3%'
        }
    ];

    return alerts[Math.floor(Math.random() * alerts.length)];
}

// ========== EJECUCIÓN ==========

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, generateSimulatedMarketData, generateSimulatedTrade, generateSimulatedAlert };

