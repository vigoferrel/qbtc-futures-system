#!/usr/bin/env node

/**
 * 🧪 TEST ENDPOINTS BALANCE
 * ========================
 *
 * Script para probar los nuevos endpoints de balance y posiciones
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:14777';

class BalanceEndpointsTester {
    constructor() {
        this.testResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            errors: []
        };
    }

    async runTests() {
        console.log('[🧪] INICIANDO PRUEBAS DE ENDPOINTS BALANCE...\n');

        try {
            // Verificar que el servidor esté corriendo
            await this.testServerHealth();

            // Probar endpoint de balance
            await this.testBalanceEndpoint();

            // Probar endpoint de posiciones
            await this.testPositionsEndpoint();

            // Probar endpoint de status
            await this.testStatusEndpoint();

            // Generar reporte final
            this.generateTestReport();

        } catch (error) {
            console.error('[❌] Error en pruebas:', error.message);
        }
    }

    async testServerHealth() {
        console.log('[❤️] Verificando estado del servidor...');

        try {
            const response = await fetch(`${BASE_URL}/health`);
            const data = await response.json();

            this.testResults.totalTests++;
            if (response.ok && data.status === 'ok') {
                console.log('  ✅ Servidor operativo');
                this.testResults.passedTests++;
            } else {
                console.log('  ❌ Servidor no responde correctamente');
                this.testResults.failedTests++;
                this.testResults.errors.push('Server health check failed');
            }
        } catch (error) {
            console.log('  ❌ Error conectando al servidor:', error.message);
            console.log('  💡 Asegúrate de que el servidor esté corriendo: node api/leonardo-api-simple.js');
            this.testResults.failedTests++;
            this.testResults.errors.push(`Server connection error: ${error.message}`);
        }

        console.log('');
    }

    async testBalanceEndpoint() {
        console.log('[💰] Probando endpoint /api/leonardo/balance...');

        try {
            const response = await fetch(`${BASE_URL}/api/leonardo/balance`);
            const data = await response.json();

            this.testResults.totalTests++;
            if (response.ok && data.success) {
                console.log('  ✅ Endpoint de balance operativo');

                // Verificar estructura de respuesta
                if (data.data && data.data.account_info) {
                    console.log('  ✅ Estructura de respuesta correcta');
                    console.log(`  💵 Balance: $${data.data.account_info.total_wallet_balance?.toLocaleString() || 'N/A'}`);
                    console.log(`  📊 Salud cuenta: ${data.data.account_info.account_health || 'N/A'}`);
                    console.log(`  🔄 Fuente: ${data.data.account_info.source || 'N/A'}`);

                    this.testResults.passedTests++;
                } else {
                    console.log('  ❌ Estructura de respuesta incompleta');
                    this.testResults.failedTests++;
                }
            } else {
                console.log('  ❌ Error en respuesta del endpoint');
                console.log(`     Status: ${response.status}`);
                console.log(`     Error: ${data.error || 'Unknown error'}`);
                this.testResults.failedTests++;
            }
        } catch (error) {
            console.log('  ❌ Error probando endpoint balance:', error.message);
            this.testResults.failedTests++;
            this.testResults.errors.push(`Balance endpoint error: ${error.message}`);
        }

        console.log('');
    }

    async testPositionsEndpoint() {
        console.log('[📊] Probando endpoint /api/leonardo/positions...');

        try {
            const response = await fetch(`${BASE_URL}/api/leonardo/positions`);
            const data = await response.json();

            this.testResults.totalTests++;
            if (response.ok && data.success) {
                console.log('  ✅ Endpoint de posiciones operativo');

                // Verificar estructura de respuesta
                if (data.data) {
                    console.log(`  📈 Posiciones abiertas: ${data.data.count || 0}`);
                    console.log(`  💰 Valor total posiciones: $${data.data.total_positions_value?.toLocaleString() || '0'}`);
                    console.log(`  📊 P&L no realizado: $${data.data.unrealized_pnl?.toLocaleString() || '0'}`);
                    console.log(`  ⚖️ Posiciones apalancadas: ${data.data.leveraged_positions || 0}`);

                    this.testResults.passedTests++;
                } else {
                    console.log('  ❌ Estructura de respuesta incompleta');
                    this.testResults.failedTests++;
                }
            } else {
                console.log('  ❌ Error en respuesta del endpoint');
                console.log(`     Status: ${response.status}`);
                console.log(`     Error: ${data.error || 'Unknown error'}`);
                this.testResults.failedTests++;
            }
        } catch (error) {
            console.log('  ❌ Error probando endpoint posiciones:', error.message);
            this.testResults.failedTests++;
            this.testResults.errors.push(`Positions endpoint error: ${error.message}`);
        }

        console.log('');
    }

    async testStatusEndpoint() {
        console.log('[📊] Probando endpoint /api/leonardo/status...');

        try {
            const response = await fetch(`${BASE_URL}/api/leonardo/status`);
            const data = await response.json();

            this.testResults.totalTests++;
            if (response.ok && data.success) {
                console.log('  ✅ Endpoint de status operativo');
                console.log(`  🧠 Nivel consciencia: ${data.data.leonardo_engine?.consciousness_level?.toFixed(3) || 'N/A'}`);
                console.log(`  🎯 Símbolos activos: ${data.data.leonardo_engine?.active_symbols || 'N/A'}`);

                this.testResults.passedTests++;
            } else {
                console.log('  ❌ Error en respuesta del endpoint');
                this.testResults.failedTests++;
            }
        } catch (error) {
            console.log('  ❌ Error probando endpoint status:', error.message);
            this.testResults.failedTests++;
            this.testResults.errors.push(`Status endpoint error: ${error.message}`);
        }

        console.log('');
    }

    generateTestReport() {
        console.log('[📋] GENERANDO REPORTE DE PRUEBAS...\n');

        console.log('=== RESULTADOS DE PRUEBAS ===');
        console.log(`🧪 Pruebas totales: ${this.testResults.totalTests}`);
        console.log(`✅ Pruebas exitosas: ${this.testResults.passedTests}`);
        console.log(`❌ Pruebas fallidas: ${this.testResults.failedTests}`);
        console.log(`📊 Tasa de éxito: ${((this.testResults.passedTests / this.testResults.totalTests) * 100).toFixed(1)}%`);

        if (this.testResults.errors.length > 0) {
            console.log('\n=== ERRORES ENCONTRADOS ===');
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        console.log('\n=== ENDPOINTS DISPONIBLES ===');
        console.log(`  GET  ${BASE_URL}/health`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/status`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/balance`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/positions`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/opportunities`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/metrics`);
        console.log(`  GET  ${BASE_URL}/api/leonardo/consciousness`);

        console.log('\n=== RECOMENDACIONES ===');
        if (this.testResults.failedTests === 0) {
            console.log('🎉 ¡Todos los endpoints funcionan correctamente!');
            console.log('✅ Sistema de balance completamente operativo');
        } else {
            console.log('⚠️ Algunos endpoints requieren atención');
            console.log('🔧 Verificar configuración del servidor');
        }
    }
}

// Función principal
async function main() {
    console.log('🧪 TEST ENDPOINTS BALANCE - QBTC QUANTUM LEONARDO');
    console.log('=================================================\n');

    const tester = new BalanceEndpointsTester();
    await tester.runTests();

    console.log('\n[✅] Pruebas completadas');
}

// Ejecutar
main().catch(console.error);



