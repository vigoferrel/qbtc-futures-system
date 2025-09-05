/**
 * QBTC Integration Test
 * Prueba de concepto de la arquitectura de integración
 * Demuestra la comunicación entre componentes
 */

const QBTCIntegrationOrchestrator = require('./qbtc-integration-orchestrator');

async function testIntegration() {
    console.log('🧪 Iniciando prueba de integración QBTC...');

    try {
        // 1. Inicializar orquestador
        const orchestrator = new QBTCIntegrationOrchestrator({
            messageBus: { port: 14000 },
            apiGateway: { port: 14001 },
            stateManager: { persistencePath: './data/test-state' }
        });

        // Esperar inicialización
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('✅ Orquestador inicializado');

        // 2. Registrar componentes de prueba
        console.log('📝 Registrando componentes de prueba...');

        const components = [
            {
                name: 'test-trading-engine',
                type: 'trading',
                capabilities: ['trading', 'state-subscriber'],
                endpoints: {
                    http: 'http://localhost:3001',
                    ws: 'ws://localhost:3001'
                }
            },
            {
                name: 'test-analysis-engine',
                type: 'analysis',
                capabilities: ['analysis', 'data-processing'],
                endpoints: {
                    http: 'http://localhost:3002'
                }
            },
            {
                name: 'test-data-connector',
                type: 'data',
                capabilities: ['data-ingestion', 'api-connector'],
                endpoints: {
                    http: 'http://localhost:3003'
                }
            }
        ];

        const registeredComponents = [];
        for (const component of components) {
            const result = await orchestrator.integrateComponent(
                component.name,
                component.type,
                component
            );
            registeredComponents.push(result);
            console.log(`✅ Registrado: ${component.name} -> ${result.componentId}`);
        }

        // 3. Probar comunicación
        console.log('📡 Probando comunicación...');

        // Enviar mensaje de trading engine a analysis engine
        const tradingComponent = registeredComponents[0];
        const analysisComponent = registeredComponents[1];

        const testMessage = {
            type: 'market-data',
            payload: {
                symbol: 'BTCUSDT',
                price: 45000,
                volume: 100
            },
            timestamp: Date.now()
        };

        await orchestrator.sendMessage(analysisComponent.componentId, testMessage);
        console.log('✅ Mensaje enviado de trading a analysis');

        // 4. Probar broadcast
        await orchestrator.broadcastMessage({
            type: 'system-announcement',
            payload: {
                message: 'Integration test completed',
                level: 'info'
            }
        });
        console.log('✅ Broadcast enviado a todos los componentes');

        // 5. Probar gestión de estado
        console.log('💾 Probando gestión de estado...');

        await orchestrator.updateComponentState(tradingComponent.componentId, {
            status: 'active',
            lastTrade: {
                symbol: 'BTCUSDT',
                side: 'buy',
                amount: 0.1,
                price: 45000
            },
            pnl: 125.50
        });

        const state = await orchestrator.getComponentState(tradingComponent.componentId);
        console.log('✅ Estado actualizado:', JSON.stringify(state, null, 2));

        // 6. Probar métricas
        console.log('📊 Métricas del sistema:');
        const metrics = orchestrator.getMetrics();
        console.log(JSON.stringify(metrics, null, 2));

        // 7. Probar health check
        console.log('🏥 Health check:');
        const health = orchestrator.getHealthStatus();
        console.log(JSON.stringify(health, null, 2));

        console.log('🎉 Prueba de integración completada exitosamente!');
        console.log('📈 Resultados:');
        console.log(`   - Componentes integrados: ${registeredComponents.length}`);
        console.log(`   - Mensajes procesados: ${metrics.orchestrator.messagesProcessed}`);
        console.log(`   - Estado del sistema: ${health.status}`);

        // Mantener vivo para inspección
        console.log('⏳ Manteniendo sistema activo por 10 segundos...');
        setTimeout(async () => {
            console.log('🛑 Apagando sistema de prueba...');
            await orchestrator.shutdown();
            console.log('✅ Sistema apagado correctamente');
            process.exit(0);
        }, 10000);

    } catch (error) {
        console.error('❌ Error en prueba de integración:', error);
        process.exit(1);
    }
}

// Ejecutar prueba
if (require.main === module) {
    testIntegration();
}

module.exports = { testIntegration };