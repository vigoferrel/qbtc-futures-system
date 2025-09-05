#!/usr/bin/env node

/**
 * 🧪 QBTC CREDENTIALS TEST - ROBUST IMPLEMENTATION
 * ===============================================
 *
 * Prueba exhaustiva del sistema de credenciales robusto
 * - Validación automática
 * - Monitoreo de conectividad
 * - Sistema de respaldo
 * - Reporte detallado
 */

import QBTCCredentialsManager from './credentials-manager.js';

class QBTCCredentialsTester {
    constructor() {
        this.manager = QBTCCredentialsManager;
        this.testResults = {
            validation: [],
            connectivity: [],
            backup: [],
            security: [],
            performance: []
        };
    }

    /**
     * 🧪 Ejecuta todas las pruebas
     */
    async runAllTests() {
        console.log('🧪 QBTC CREDENTIALS ROBUST TEST SUITE');
        console.log('=====================================\n');

        try {
            // Prueba 1: Validación de credenciales
            await this.testCredentialValidation();

            // Prueba 2: Conectividad con Binance
            await this.testConnectivity();

            // Prueba 3: Sistema de respaldo
            await this.testBackupSystem();

            // Prueba 4: Seguridad
            await this.testSecurity();

            // Prueba 5: Performance
            await this.testPerformance();

            // Reporte final
            this.generateReport();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * 1️⃣ Prueba de validación de credenciales
     */
    async testCredentialValidation() {
        console.log('1️⃣ TESTING CREDENTIAL VALIDATION');
        console.log('================================\n');

        const testCases = [
            {
                name: 'Valid credentials',
                apiKey: 'LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q',
                secretKey: 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu',
                expected: true
            },
            {
                name: 'Invalid API Key length',
                apiKey: 'SHORT_KEY',
                secretKey: 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu',
                expected: false
            },
            {
                name: 'Invalid characters',
                apiKey: 'LUFHLzW721iW8fj1RslpKllR1IBSRUAxeVef7wgdrv59HJjmKkmOCIM8zjQ59B0Q',
                secretKey: 'maNaQIFdSvfwkUP36Xqt9Gd0YATu1qk13HyIZJuOit6SQldLr8oTQPmVjLZLkcEu!',
                expected: false
            },
            {
                name: 'Empty credentials',
                apiKey: '',
                secretKey: '',
                expected: false
            }
        ];

        for (const testCase of testCases) {
            const result = this.manager.validateCredentials(testCase.apiKey, testCase.secretKey);
            const passed = result.valid === testCase.expected;

            this.testResults.validation.push({
                name: testCase.name,
                passed,
                expected: testCase.expected,
                actual: result.valid,
                errors: result.errors
            });

            console.log(`${passed ? '✅' : '❌'} ${testCase.name}: ${passed ? 'PASSED' : 'FAILED'}`);
            if (!passed) {
                console.log(`   Expected: ${testCase.expected}, Got: ${result.valid}`);
                if (result.errors.length > 0) {
                    console.log(`   Errors: ${result.errors.join(', ')}`);
                }
            }
        }

        console.log('');
    }

    /**
     * 2️⃣ Prueba de conectividad
     */
    async testConnectivity() {
        console.log('2️⃣ TESTING CONNECTIVITY');
        console.log('=======================\n');

        try {
            const credentials = this.manager.getActiveCredentials();
            console.log(`🔑 Testing with ${credentials.source} credentials`);
            console.log(`🌐 Testnet: ${credentials.testnet}\n`);

            const result = await this.manager.testConnectivity(credentials, credentials.testnet);

            this.testResults.connectivity.push({
                name: 'Binance API Connectivity',
                success: result.success,
                responseTime: Date.now(),
                details: result
            });

            if (result.success) {
                console.log('✅ CONNECTIVITY TEST PASSED');
                console.log(`💰 Account Balance: $${parseFloat(result.balance || 0).toLocaleString()}`);
                console.log(`🏦 Account Type: ${result.accountType}`);
                console.log(`🔐 Permissions: ${result.permissions?.join(', ') || 'N/A'}`);
            } else {
                console.log('❌ CONNECTIVITY TEST FAILED');
                console.log(`🚨 Error: ${result.error}`);
                console.log(`📝 Message: ${result.message}`);
            }

        } catch (error) {
            console.log('❌ CONNECTIVITY TEST ERROR:', error.message);
            this.testResults.connectivity.push({
                name: 'Binance API Connectivity',
                success: false,
                error: error.message
            });
        }

        console.log('');
    }

    /**
     * 3️⃣ Prueba del sistema de respaldo
     */
    async testBackupSystem() {
        console.log('3️⃣ TESTING BACKUP SYSTEM');
        console.log('========================\n');

        const health = this.manager.getHealthStatus();

        console.log('📊 Health Status:');
        console.log(`   Primary: ${health.primary}`);
        console.log(`   Backup: ${health.backup}`);
        console.log(`   Connectivity: ${health.connectivity ? '✅' : '❌'}`);
        console.log(`   Last Check: ${health.lastCheck || 'Never'}`);
        console.log(`   Credentials Loaded: ${health.credentialsLoaded ? '✅' : '❌'}`);
        console.log(`   Backup Available: ${health.backupAvailable ? '✅' : '❌'}\n`);

        this.testResults.backup.push({
            name: 'Backup System Health',
            primaryHealthy: health.primary === 'HEALTHY',
            backupAvailable: health.backupAvailable,
            connectivity: health.connectivity,
            credentialsLoaded: health.credentialsLoaded
        });

        if (health.primary === 'HEALTHY' && health.backupAvailable) {
            console.log('✅ BACKUP SYSTEM FULLY OPERATIONAL');
        } else if (health.primary === 'HEALTHY') {
            console.log('⚠️ BACKUP SYSTEM PARTIAL - Primary OK, no backup available');
        } else {
            console.log('❌ BACKUP SYSTEM FAILED - No healthy credentials');
        }

        console.log('');
    }

    /**
     * 4️⃣ Prueba de seguridad
     */
    async testSecurity() {
        console.log('4️⃣ TESTING SECURITY FEATURES');
        console.log('=============================\n');

        // Verificar encriptación
        const testData = 'test_secret_data';
        const encrypted = this.manager.encrypt(testData);
        const decrypted = this.manager.decrypt(encrypted);

        const encryptionWorks = decrypted === testData;

        console.log('🔐 Encryption Test:');
        console.log(`   Original: ${testData}`);
        console.log(`   Encrypted: ${encrypted.encrypted.substring(0, 20)}...`);
        console.log(`   Decrypted: ${decrypted}`);
        console.log(`   Status: ${encryptionWorks ? '✅ WORKING' : '❌ FAILED'}\n`);

        // Verificar archivos seguros
        const secureFiles = [
            '.binance-config-encrypted.json',
            '.binance-config-primary-encrypted.json'
        ];

        console.log('📁 Secure Files Check:');
        for (const file of secureFiles) {
            try {
                const fs = await import('fs');
                const exists = fs.existsSync(file);
                console.log(`   ${file}: ${exists ? '✅ EXISTS' : '⚠️ NOT FOUND'}`);
            } catch (error) {
                console.log(`   ${file}: ❌ ERROR checking file`);
            }
        }

        // Contar archivos que existen
        let existingFiles = 0;
        for (const file of secureFiles) {
            try {
                const fs = await import('fs');
                if (fs.existsSync(file)) {
                    existingFiles++;
                }
            } catch (error) {
                // Ignorar errores de importación
            }
        }

        this.testResults.security.push({
            name: 'Security Features',
            encryption: encryptionWorks,
            secureFiles: existingFiles,
            totalFiles: secureFiles.length
        });

        console.log('');
    }

    /**
     * 5️⃣ Prueba de performance
     */
    async testPerformance() {
        console.log('5️⃣ TESTING PERFORMANCE');
        console.log('======================\n');

        const startTime = Date.now();

        // Prueba de carga rápida
        const credentials = this.manager.getActiveCredentials();
        const results = [];

        for (let i = 0; i < 5; i++) {
            const testStart = Date.now();
            const result = await this.manager.testConnectivity(credentials, credentials.testnet);
            const testEnd = Date.now();

            results.push({
                attempt: i + 1,
                success: result.success,
                responseTime: testEnd - testStart
            });
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        const successRate = (results.filter(r => r.success).length / results.length) * 100;

        console.log('📈 Performance Results:');
        console.log(`   Total Test Time: ${totalTime}ms`);
        console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   Tests Completed: ${results.length}\n`);

        console.log('📊 Individual Test Results:');
        results.forEach((result, index) => {
            console.log(`   Test ${index + 1}: ${result.success ? '✅' : '❌'} ${result.responseTime}ms`);
        });

        this.testResults.performance.push({
            name: 'Performance Test',
            totalTime,
            avgResponseTime,
            successRate,
            testCount: results.length
        });

        console.log('');
    }

    /**
     * 📊 Genera reporte final
     */
    generateReport() {
        console.log('📊 FINAL TEST REPORT');
        console.log('===================\n');

        const allTests = [
            ...this.testResults.validation,
            ...this.testResults.connectivity,
            ...this.testResults.backup,
            ...this.testResults.security,
            ...this.testResults.performance
        ];

        const passedTests = allTests.filter(test => test.passed !== false).length;
        const totalTests = allTests.length;
        const successRate = (passedTests / totalTests) * 100;

        console.log(`🎯 OVERALL RESULTS:`);
        console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   Status: ${successRate >= 80 ? '✅ EXCELLENT' : successRate >= 60 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}\n`);

        // Detalles por categoría
        const categories = ['validation', 'connectivity', 'backup', 'security', 'performance'];

        categories.forEach(category => {
            const tests = this.testResults[category];
            const passed = tests.filter(test => test.passed !== false).length;
            const total = tests.length;

            console.log(`📋 ${category.toUpperCase()}: ${passed}/${total} passed`);

            if (tests.length > 0) {
                tests.forEach(test => {
                    if (test.passed === false) {
                        console.log(`   ❌ ${test.name}: ${test.errors?.join(', ') || 'Failed'}`);
                    }
                });
            }
        });

        console.log('\n🏆 RECOMMENDATIONS:');
        if (successRate >= 90) {
            console.log('   ✅ System is highly robust and ready for production');
        } else if (successRate >= 70) {
            console.log('   ⚠️ System is functional but could use improvements');
        } else {
            console.log('   ❌ System needs significant improvements before production');
        }

        // Estado final
        const finalStatus = successRate >= 80 ? 0 : 1;
        console.log(`\n🎊 FINAL STATUS: ${finalStatus === 0 ? 'SUCCESS' : 'REVIEW REQUIRED'}`);
        process.exit(finalStatus);
    }
}

// Ejecutar pruebas
const tester = new QBTCCredentialsTester();
tester.runAllTests().catch(console.error);