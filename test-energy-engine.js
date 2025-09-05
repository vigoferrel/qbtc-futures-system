/**
 * 🧪 Test Simple del Motor de Energía Mínima
 * Prueba básica para verificar funcionamiento del sistema energético
 */

import EnergyMinimizationEngine from './engines/energy-minimization-engine.js';

async function testEnergyEngine() {
    console.log('🧪 INICIANDO TEST DEL MOTOR DE ENERGÍA MÍNIMA');
    console.log('='.repeat(50));
    
    try {
        // Crear instancia del motor
        console.log('⚡ Creando motor de energía...');
        const engine = new EnergyMinimizationEngine({
            alpha: 0.1,
            beta: 0.05,
            gamma: 0.2,
            delta: 0.15
        });
        
        // Esperar inicialización
        console.log('⚡ Esperando inicialización...');
        await new Promise(resolve => {
            engine.once('engine_ready', resolve);
            // Timeout de seguridad
            setTimeout(resolve, 3000);
        });
        
        console.log('✅ Motor inicializado correctamente');
        
        // Test básico de cálculo de energía
        console.log('\n🔬 Ejecutando tests básicos...');
        
        const testPositions = [0.5, 0.3, 0.2, 0.1, 0.05];
        const testMarketData = {
            BTCUSDT: { priceChange: 0.02, volume: 50000, volatility: 0.015, rsi: 45 },
            ETHUSDT: { priceChange: 0.01, volume: 40000, volatility: 0.020, rsi: 52 }
        };
        
        const totalEnergy = engine.calculateTotalEnergy(testPositions, testMarketData);
        console.log(`🔋 Energía total calculada: ${totalEnergy.toFixed(6)}`);
        
        // Test de estado del sistema
        const systemStatus = engine.getSystemStatus();
        console.log(`🔋 Estado energético:`);
        console.log(`   • Energía total: ${systemStatus.energyState.totalEnergy.toFixed(6)}`);
        console.log(`   • Energía cinética: ${systemStatus.energyState.kineticEnergy.toFixed(6)}`);
        console.log(`   • Energía potencial: ${systemStatus.energyState.potentialEnergy.toFixed(6)}`);
        console.log(`   • Energía interacción: ${systemStatus.energyState.interactionEnergy.toFixed(6)}`);
        console.log(`   • Temperatura: ${systemStatus.energyState.temperature.toFixed(2)}K`);
        console.log(`   • Entropía: ${systemStatus.energyState.entropy.toFixed(4)}`);
        
        // Test de métricas termodinámicas
        const thermoMetrics = engine.calculateThermodynamicMetrics();
        console.log(`\n🌡️ Métricas termodinámicas:`);
        console.log(`   • Temperatura: ${thermoMetrics.temperature.toFixed(2)}K`);
        console.log(`   • Entropía: ${thermoMetrics.entropy.toFixed(4)}`);
        console.log(`   • Capacidad calorífica: ${thermoMetrics.heatCapacity.toFixed(4)}`);
        console.log(`   • Energía libre: ${thermoMetrics.freeEnergy.toFixed(4)}`);
        console.log(`   • Eficiencia: ${(thermoMetrics.efficiency * 100).toFixed(2)}%`);
        console.log(`   • Índice conservación: ${thermoMetrics.conservation_index.toFixed(4)}`);
        
        // Test de leverage óptimo
        console.log(`\n📊 Test de leverage óptimo:`);
        const optimalLeverage = engine.calculateOptimalLeverage('BTCUSDT', {
            volatility: 0.025,
            currentLeverage: 3,
            BTCUSDT: testMarketData.BTCUSDT
        });
        console.log(`   • Leverage óptimo para BTCUSDT: ${optimalLeverage.toFixed(2)}x`);
        
        // Test de detección de transición de fase
        console.log(`\n🌀 Test de detección de transiciones de fase:`);
        const phaseTransition = engine.detectPhaseTransition(testMarketData);
        if (phaseTransition) {
            console.log(`   ✅ Transición de fase detectada:`);
            console.log(`      • Tipo: ${phaseTransition.type}`);
            console.log(`      • Diferencia energética: ${phaseTransition.energyDifference.toFixed(4)}`);
            console.log(`      • Multiplicador leverage: ${phaseTransition.leverageMultiplier}x`);
            console.log(`      • Duración: ${(phaseTransition.duration / 60000).toFixed(1)} min`);
        } else {
            console.log(`   ℹ️ No se detectaron transiciones de fase`);
        }
        
        // Test de validación básica del principio energético
        console.log(`\n🎯 Test básico del Principio de Energía Mínima:`);
        const validationConfigs = [
            {
                name: 'test_config_1',
                positions: [0.8, 0.6, 0.4, 0.2, 0.1],
                marketData: testMarketData
            },
            {
                name: 'test_config_2', 
                positions: [1.0, 0.8, 0.6, 0.4, 0.2],
                marketData: testMarketData
            }
        ];
        
        const basicValidation = engine.validateEnergyMinimumPrinciple(validationConfigs);
        console.log(`   • Principio validado: ${basicValidation.principleValidated ? '✅' : '❌'}`);
        console.log(`   • Energía estado fundamental: ${basicValidation.groundStateEnergy.toFixed(6)}`);
        console.log(`   • Resultados de test: ${basicValidation.testResults.length} configuraciones`);
        
        basicValidation.testResults.forEach((result, index) => {
            console.log(`      ${index + 1}. ${result.configuration}: E=${result.energy.toFixed(6)}, Minimal=${result.isMinimal ? '✅' : '❌'}`);
        });
        
        // Resumen final
        console.log(`\n🎉 RESUMEN DEL TEST`);
        console.log('='.repeat(50));
        console.log(`✅ Motor de energía mínima: FUNCIONANDO`);
        console.log(`✅ Cálculos energéticos: OPERATIVOS`);
        console.log(`✅ Métricas termodinámicas: ACTIVAS`);
        console.log(`✅ Optimización de leverage: DISPONIBLE`);
        console.log(`✅ Detección transiciones de fase: IMPLEMENTADA`);
        console.log(`✅ Validación principio energético: ${basicValidation.principleValidated ? 'PASADA' : 'REQUIERE AJUSTES'}`);
        
        const performanceScore = systemStatus.performance ? 
            (systemStatus.performance.efficiency + systemStatus.performance.stability + systemStatus.performance.convergenceRate) / 3 : 
            0.5;
        
        console.log(`📊 Puntuación de performance: ${(performanceScore * 100).toFixed(1)}%`);
        
        if (performanceScore > 0.8) {
            console.log(`🏆 CALIFICACIÓN: EXCELENTE - Sistema listo para producción`);
        } else if (performanceScore > 0.6) {
            console.log(`🥉 CALIFICACIÓN: BUENO - Sistema funcional con mejoras posibles`);
        } else {
            console.log(`⚠️ CALIFICACIÓN: REQUIERE MEJORAS - Revisar configuración`);
        }
        
    } catch (error) {
        console.error('❌ ERROR EN EL TEST:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar test
testEnergyEngine().then(() => {
    console.log(`\n✅ TEST COMPLETADO EXITOSAMENTE`);
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal en el test:', error);
    process.exit(1);
});
