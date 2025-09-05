/**
 * 🔬 QBTC System Validation Runner
 * Ejecutor completo de validación del sistema QBTC
 * Valida el Principio de Energía Mínima y todos los componentes energéticos
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Imports del sistema
import EnergyMinimizationEngine from './engines/energy-minimization-engine.js';
import EnergyValidationSystem from './utils/energy-validation-system.js';
import { SecureLogger } from './shared/qbtc-secure-logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('🔬 INICIANDO VALIDACIÓN COMPLETA DEL SISTEMA QBTC');
    console.log('='.repeat(60));
    
    // Inicializar logger
    const logger = new SecureLogger({
        serviceName: 'QBTC-System-Validation',
        logDirectory: path.join(__dirname, 'logs'),
        enableConsole: true,
        enableFile: true
    });
    
    logger.info('Iniciando validación completa del sistema QBTC');
    
    try {
        // 1. INICIALIZAR MOTOR DE ENERGÍA MÍNIMA
        console.log('\n⚡ Inicializando Motor de Energía Mínima...');
        const energyEngine = new EnergyMinimizationEngine({
            alpha: 0.1,
            beta: 0.05,
            gamma: 0.2,
            delta: 0.15
        });
        
        // Esperar inicialización
        await new Promise(resolve => {
            energyEngine.once('engine_ready', resolve);
        });
        
        console.log('✅ Motor de Energía Mínima inicializado correctamente');
        
        // 2. INICIALIZAR SISTEMA DE VALIDACIÓN
        console.log('\n🔬 Inicializando Sistema de Validación...');
        const validationSystem = new EnergyValidationSystem({
            numRandomTests: 500,          // Reducido para demo
            confidenceLevel: 0.95,
            successThreshold: 0.98,
            energyTolerance: 1e-8,
            logValidationResults: true
        });
        
        console.log('✅ Sistema de Validación inicializado');
        
        // 3. CONFIGURACIONES DE TEST
        console.log('\n📊 Preparando configuraciones de test...');
        const testConfigurations = [
            {
                name: 'conservative_portfolio',
                positions: [0.3, 0.2, 0.15, 0.1, 0.05],
                marketData: { 
                    volatility: 0.015, 
                    volume: 50000,
                    BTCUSDT: { priceChange: 0.02, volume: 50000, volatility: 0.015, rsi: 45 },
                    ETHUSDT: { priceChange: 0.01, volume: 40000, volatility: 0.020, rsi: 52 }
                }
            },
            {
                name: 'aggressive_portfolio',
                positions: [1.5, 1.2, 1.0, 0.8, 0.6],
                marketData: { 
                    volatility: 0.035, 
                    volume: 200000,
                    BTCUSDT: { priceChange: 0.05, volume: 200000, volatility: 0.035, rsi: 65 },
                    ETHUSDT: { priceChange: 0.04, volume: 180000, volatility: 0.040, rsi: 70 }
                }
            },
            {
                name: 'balanced_portfolio',
                positions: [0.8, 0.6, 0.5, 0.4, 0.3],
                marketData: { 
                    volatility: 0.025, 
                    volume: 100000,
                    BTCUSDT: { priceChange: 0.03, volume: 100000, volatility: 0.025, rsi: 55 },
                    ETHUSDT: { priceChange: 0.02, volume: 90000, volatility: 0.030, rsi: 48 }
                }
            }
        ];
        
        console.log(`✅ Configuradas ${testConfigurations.length} configuraciones de test`);
        
        // 4. EJECUTAR VALIDACIÓN COMPLETA
        console.log('\n🚀 EJECUTANDO VALIDACIÓN DEL PRINCIPIO DE ENERGÍA MÍNIMA');
        console.log('-'.repeat(60));
        
        const validationStartTime = Date.now();
        
        const validationResults = await validationSystem.validateEnergyMinimumPrinciple(
            energyEngine,
            testConfigurations
        );
        
        const validationDuration = Date.now() - validationStartTime;
        
        // 5. MOSTRAR RESULTADOS
        console.log('\n📋 RESULTADOS DE VALIDACIÓN');
        console.log('='.repeat(60));
        
        console.log(`⚡ Principio Validado: ${validationResults.principleValidated ? '✅ SÍ' : '❌ NO'}`);
        console.log(`⚡ Calificación de Calidad: ${validationResults.qualityRating}`);
        console.log(`⚡ Tasa de Éxito General: ${(validationResults.overallSuccessRate * 100).toFixed(2)}%`);
        console.log(`⚡ Tiempo de Validación: ${validationDuration}ms`);
        
        // Resultados detallados
        console.log('\n🔍 DETALLES DE VALIDACIÓN');
        console.log('-'.repeat(40));
        
        // Test de Minimalidad
        const minimalityResults = validationResults.minimalityTest;
        console.log(`\n📊 Test de Minimalidad Energética:`);
        console.log(`   • Tests Totales: ${minimalityResults.totalTests}`);
        console.log(`   • Tests Pasados: ${minimalityResults.passedTests}`);
        console.log(`   • Tasa de Éxito: ${(minimalityResults.successRate * 100).toFixed(2)}%`);
        console.log(`   • Energía Estado Fundamental: ${minimalityResults.groundStateEnergy?.toFixed(6) || 'N/A'}`);
        console.log(`   • Desviación Promedio: ${minimalityResults.averageDeviation?.toFixed(8) || 'N/A'}`);
        console.log(`   • Test Pasado: ${minimalityResults.testPassed ? '✅' : '❌'}`);
        
        // Estados Fundamentales
        const groundStateResults = validationResults.groundStateVerification;
        console.log(`\n🎯 Verificación de Estados Fundamentales:`);
        console.log(`   • Eigenvalores Válidos: ${groundStateResults.allEigenvaluesValid ? '✅' : '❌'}`);
        console.log(`   • Eigenvectores Válidos: ${groundStateResults.allEigenvectorsValid ? '✅' : '❌'}`);
        console.log(`   • Ortogonalidad: ${groundStateResults.allOrthogonal ? '✅' : '❌'}`);
        console.log(`   • Energía Estado Fundamental: ${groundStateResults.groundStateEnergy?.toFixed(6) || 'N/A'}`);
        console.log(`   • Gap Energético: ${groundStateResults.energyGap?.toFixed(6) || 'N/A'}`);
        console.log(`   • Test Pasado: ${groundStateResults.testPassed ? '✅' : '❌'}`);
        
        // Modos Normales
        const normalModeResults = validationResults.normalModeAnalysis;
        console.log(`\n🌊 Análisis de Modos Normales:`);
        console.log(`   • Modos Estables: ${normalModeResults.allModesStable ? '✅' : '❌'}`);
        console.log(`   • Modos Inestables: ${normalModeResults.unstableModes || 0}`);
        console.log(`   • Frecuencia Fundamental: ${normalModeResults.fundamentalFrequency?.toFixed(4) || 'N/A'}`);
        console.log(`   • Índice de Estabilidad: ${normalModeResults.globalStability?.stabilityIndex?.toFixed(3) || 'N/A'}`);
        console.log(`   • Test Pasado: ${normalModeResults.testPassed ? '✅' : '❌'}`);
        
        // Métricas de Calidad
        console.log(`\n⭐ Evaluación de Calidad:`);
        const qualityMetrics = validationResults.qualityMetrics;
        if (qualityMetrics) {
            console.log(`   • Tasa de Éxito Minimalidad: ${(qualityMetrics.minimalitySuccessRate * 100).toFixed(2)}%`);
            console.log(`   • Desviación Energética: ${qualityMetrics.energyDeviation?.toExponential(2) || 'N/A'}`);
            console.log(`   • Validez Estado Fundamental: ${qualityMetrics.groundStateValidity ? '✅' : '❌'}`);
            console.log(`   • Estabilidad Modos: ${qualityMetrics.normalModeStability ? '✅' : '❌'}`);
            console.log(`   • Puntuación General: ${(validationResults.qualityMetrics.overallStability * 100).toFixed(1)}%`);
        }
        
        // Recomendaciones
        if (validationResults.recommendations && validationResults.recommendations.length > 0) {
            console.log(`\n💡 Recomendaciones:`);
            validationResults.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
        
        // 6. ESTADO DEL SISTEMA ENERGÉTICO
        console.log('\n⚙️ ESTADO DEL SISTEMA ENERGÉTICO');
        console.log('-'.repeat(40));
        
        const systemStatus = energyEngine.getSystemStatus();
        console.log(`🔋 Energía Total: ${systemStatus.energyState.totalEnergy.toFixed(6)}`);
        console.log(`🔋 Energía Cinética: ${systemStatus.energyState.kineticEnergy.toFixed(6)}`);
        console.log(`🔋 Energía Potencial: ${systemStatus.energyState.potentialEnergy.toFixed(6)}`);
        console.log(`🔋 Energía Interacción: ${systemStatus.energyState.interactionEnergy.toFixed(6)}`);
        console.log(`🌡️ Temperatura: ${systemStatus.energyState.temperature.toFixed(2)}K`);
        console.log(`📈 Entropía: ${systemStatus.energyState.entropy.toFixed(4)}`);
        
        // Performance
        if (systemStatus.performance) {
            console.log(`\n📊 Métricas de Performance:`);
            console.log(`   • Eficiencia: ${(systemStatus.performance.efficiency * 100).toFixed(2)}%`);
            console.log(`   • Estabilidad: ${(systemStatus.performance.stability * 100).toFixed(2)}%`);
            console.log(`   • Tasa Convergencia: ${(systemStatus.performance.convergenceRate * 100).toFixed(2)}%`);
        }
        
        // 7. ANÁLISIS FINAL
        console.log('\n🎯 ANÁLISIS FINAL');
        console.log('='.repeat(60));
        
        if (validationResults.principleValidated) {
            console.log('🎉 ✅ EL SISTEMA QBTC HA PASADO TODAS LAS VALIDACIONES');
            console.log('🎉 ✅ EL PRINCIPIO DE ENERGÍA MÍNIMA SE CUMPLE CORRECTAMENTE');
            console.log(`🎉 ✅ CALIDAD DEL SISTEMA: ${validationResults.qualityRating}`);
            
            // Comparación con estándares
            if (validationResults.qualityRating === 'EXCELLENT') {
                console.log('🏆 SISTEMA DE CLASE MUNDIAL - SUPERANDO ESTÁNDARES INDUSTRIALES');
            } else if (validationResults.qualityRating === 'GOOD') {
                console.log('🥉 SISTEMA DE CALIDAD PROFESIONAL - CUMPLE ESTÁNDARES INDUSTRIALES');
            }
        } else {
            console.log('⚠️ ❌ EL SISTEMA REQUIERE MEJORAS');
            console.log('⚠️ ❌ EL PRINCIPIO DE ENERGÍA MÍNIMA NO SE CUMPLE COMPLETAMENTE');
            console.log(`⚠️ ❌ CALIDAD DEL SISTEMA: ${validationResults.qualityRating}`);
        }
        
        // 8. GUARDAR REPORTE
        console.log(`\n💾 Guardando reporte de validación...`);
        
        const reportPath = path.join(__dirname, 'logs', `validation-report-${Date.now()}.json`);
        const fs = await import('fs');
        
        const fullReport = {
            timestamp: new Date().toISOString(),
            system: 'QBTC Futures System',
            validation_version: '1.0.0',
            validation_duration_ms: validationDuration,
            results: validationResults,
            system_status: systemStatus,
            test_configurations: testConfigurations,
            summary: {
                principle_validated: validationResults.principleValidated,
                quality_rating: validationResults.qualityRating,
                overall_success_rate: validationResults.overallSuccessRate,
                total_tests: minimalityResults.totalTests,
                passed_tests: minimalityResults.passedTests,
                ground_state_energy: minimalityResults.groundStateEnergy,
                system_stable: normalModeResults.allModesStable
            }
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
        console.log(`✅ Reporte guardado en: ${reportPath}`);
        
        // 9. LOG FINAL
        logger.audit('QBTC_SYSTEM_VALIDATION_COMPLETED', {
            principle_validated: validationResults.principleValidated,
            quality_rating: validationResults.qualityRating,
            success_rate: validationResults.overallSuccessRate,
            duration_ms: validationDuration,
            total_tests: minimalityResults.totalTests,
            report_path: reportPath
        });
        
        console.log('\n🎉 VALIDACIÓN COMPLETA DEL SISTEMA QBTC FINALIZADA');
        console.log('='.repeat(60));
        
        // Exit code basado en resultados
        process.exit(validationResults.principleValidated ? 0 : 1);
        
    } catch (error) {
        logger.error('Error durante validación del sistema QBTC', { error });
        console.error('❌ ERROR DURANTE LA VALIDACIÓN:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}

export default main;
