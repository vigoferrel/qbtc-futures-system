#!/usr/bin/env node

/**
 * 👀 QBTC CREDENTIALS MONITOR - ROBUST IMPLEMENTATION
 * ==================================================
 *
 * Monitoreo continuo del estado de credenciales
 * - Verificación automática de conectividad
 * - Alertas de problemas
 * - Reportes periódicos
 * - Recuperación automática
 */

import QBTCCredentialsManager from './credentials-manager.js';

class QBTCCredentialsMonitor {
    constructor() {
        this.manager = QBTCCredentialsManager;
        this.monitoring = false;
        this.alerts = [];
        this.metrics = {
            checksPerformed: 0,
            connectivityIssues: 0,
            lastSuccessfulCheck: null,
            uptime: 0
        };
    }

    /**
     * 🚀 Inicia el monitoreo
     */
    startMonitoring(intervalMinutes = 5) {
        if (this.monitoring) {
            console.log('⚠️ [MONITOR] Monitoring already running');
            return;
        }

        this.monitoring = true;
        console.log(`👀 [MONITOR] Starting credentials monitoring every ${intervalMinutes} minutes`);
        console.log('=' .repeat(60));

        // Verificación inicial
        this.performCheck();

        // Monitoreo continuo
        this.intervalId = setInterval(() => {
            this.performCheck();
        }, intervalMinutes * 60 * 1000);

        // Monitoreo de salud cada hora
        setInterval(() => {
            this.generateHealthReport();
        }, 60 * 60 * 1000);
    }

    /**
     * 🛑 Detiene el monitoreo
     */
    stopMonitoring() {
        if (this.monitoring) {
            clearInterval(this.intervalId);
            this.monitoring = false;
            console.log('🛑 [MONITOR] Monitoring stopped');
        }
    }

    /**
     * 🔍 Realiza verificación de credenciales
     */
    async performCheck() {
        const startTime = Date.now();
        this.metrics.checksPerformed++;

        console.log(`\n🔍 [MONITOR] Performing credentials check #${this.metrics.checksPerformed}`);
        console.log(`📅 ${new Date().toISOString()}`);

        try {
            // Obtener credenciales activas
            const credentials = this.manager.getActiveCredentials();
            console.log(`🔑 Using ${credentials.source} credentials (${credentials.testnet ? 'TESTNET' : 'MAINNET'})`);

            // Probar conectividad
            const result = await this.manager.testConnectivity(credentials, credentials.testnet);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (result.success) {
                console.log('✅ [MONITOR] Connectivity OK');
                console.log(`💰 Balance: $${parseFloat(result.balance || 0).toLocaleString()}`);
                console.log(`⚡ Response time: ${responseTime}ms`);

                this.metrics.lastSuccessfulCheck = new Date().toISOString();
                this.metrics.connectivityIssues = 0;

                // Limpiar alertas si existían
                if (this.alerts.length > 0) {
                    console.log('🧹 [MONITOR] Clearing previous alerts');
                    this.alerts = [];
                }

            } else {
                console.log('❌ [MONITOR] Connectivity ISSUE');
                console.log(`🚨 Error: ${result.error}`);
                console.log(`📝 Message: ${result.message}`);
                console.log(`⚡ Response time: ${responseTime}ms`);

                this.metrics.connectivityIssues++;

                // Crear alerta
                this.createAlert('CONNECTIVITY_ISSUE', {
                    error: result.error,
                    message: result.message,
                    responseTime,
                    checkNumber: this.metrics.checksPerformed
                });

                // Intentar recuperación automática
                await this.attemptRecovery();
            }

        } catch (error) {
            console.log('💥 [MONITOR] Check failed with exception:', error.message);

            this.metrics.connectivityIssues++;
            this.createAlert('EXCEPTION', {
                message: error.message,
                stack: error.stack,
                checkNumber: this.metrics.checksPerformed
            });
        }

        // Mostrar métricas actuales
        this.displayMetrics();
    }

    /**
     * 🔧 Intenta recuperación automática
     */
    async attemptRecovery() {
        console.log('🔧 [MONITOR] Attempting automatic recovery...');

        try {
            // Intentar rotación de credenciales
            await this.manager.rotateCredentials();

            // Verificar si la recuperación funcionó
            const credentials = this.manager.getActiveCredentials();
            const testResult = await this.manager.testConnectivity(credentials, credentials.testnet);

            if (testResult.success) {
                console.log('✅ [MONITOR] Recovery successful');
                this.createAlert('RECOVERY_SUCCESS', {
                    newSource: credentials.source,
                    balance: testResult.balance
                });
                return true;
            } else {
                console.log('❌ [MONITOR] Recovery failed');
                this.createAlert('RECOVERY_FAILED', {
                    attemptedSource: credentials.source,
                    error: testResult.error
                });
                return false;
            }

        } catch (error) {
            console.log('💥 [MONITOR] Recovery failed with exception:', error.message);
            this.createAlert('RECOVERY_EXCEPTION', {
                message: error.message
            });
            return false;
        }
    }

    /**
     * 🚨 Crea una alerta
     */
    createAlert(type, data) {
        const alert = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type,
            data,
            resolved: false
        };

        this.alerts.push(alert);

        // Mostrar alerta en consola
        const emoji = this.getAlertEmoji(type);
        console.log(`${emoji} [ALERT] ${type}: ${JSON.stringify(data, null, 2)}`);

        // Mantener solo las últimas 10 alertas
        if (this.alerts.length > 10) {
            this.alerts = this.alerts.slice(-10);
        }
    }

    /**
     * 🎯 Obtiene emoji para tipo de alerta
     */
    getAlertEmoji(type) {
        const emojis = {
            'CONNECTIVITY_ISSUE': '🔌',
            'EXCEPTION': '💥',
            'RECOVERY_SUCCESS': '✅',
            'RECOVERY_FAILED': '❌',
            'RECOVERY_EXCEPTION': '🔧'
        };
        return emojis[type] || '⚠️';
    }

    /**
     * 📊 Muestra métricas actuales
     */
    displayMetrics() {
        const uptime = this.metrics.checksPerformed > 0 ?
            ((this.metrics.checksPerformed - this.metrics.connectivityIssues) / this.metrics.checksPerformed * 100) : 0;

        console.log('\n📊 [MONITOR] Current Metrics:');
        console.log(`   Checks performed: ${this.metrics.checksPerformed}`);
        console.log(`   Connectivity issues: ${this.metrics.connectivityIssues}`);
        console.log(`   Uptime: ${uptime.toFixed(1)}%`);
        console.log(`   Last success: ${this.metrics.lastSuccessfulCheck || 'Never'}`);
        console.log(`   Active alerts: ${this.alerts.filter(a => !a.resolved).length}`);
    }

    /**
     * 📋 Genera reporte de salud
     */
    generateHealthReport() {
        console.log('\n🏥 [MONITOR] Health Report');
        console.log('=' .repeat(40));

        const health = this.manager.getHealthStatus();

        console.log('🔍 Credentials Health:');
        console.log(`   Primary: ${health.primary}`);
        console.log(`   Backup: ${health.backup}`);
        console.log(`   Connectivity: ${health.connectivity ? '✅' : '❌'}`);
        console.log(`   Credentials loaded: ${health.credentialsLoaded ? '✅' : '❌'}`);
        console.log(`   Backup available: ${health.backupAvailable ? '✅' : '❌'}`);

        console.log('\n📊 Monitoring Metrics:');
        console.log(`   Total checks: ${this.metrics.checksPerformed}`);
        console.log(`   Issues detected: ${this.metrics.connectivityIssues}`);
        console.log(`   Active alerts: ${this.alerts.filter(a => !a.resolved).length}`);

        if (this.alerts.length > 0) {
            console.log('\n🚨 Recent Alerts:');
            this.alerts.slice(-3).forEach(alert => {
                const emoji = this.getAlertEmoji(alert.type);
                console.log(`   ${emoji} ${alert.type} - ${alert.timestamp}`);
            });
        }

        console.log('\n💡 Recommendations:');
        if (health.connectivity && health.primary === 'HEALTHY') {
            console.log('   ✅ System is healthy');
        } else if (health.connectivity && health.backup === 'HEALTHY') {
            console.log('   ⚠️ Using backup credentials');
        } else {
            console.log('   ❌ Action required - check credentials');
        }
    }

    /**
     * 📈 Obtiene estadísticas
     */
    getStats() {
        return {
            monitoring: {
                active: this.monitoring,
                checksPerformed: this.metrics.checksPerformed,
                connectivityIssues: this.metrics.connectivityIssues,
                uptime: this.metrics.uptime,
                lastSuccessfulCheck: this.metrics.lastSuccessfulCheck
            },
            alerts: {
                total: this.alerts.length,
                active: this.alerts.filter(a => !a.resolved).length,
                recent: this.alerts.slice(-5)
            },
            health: this.manager.getHealthStatus()
        };
    }
}

// Función principal
function main() {
    const monitor = new QBTCCredentialsMonitor();

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        console.log('\n🛑 [MONITOR] Received SIGINT, stopping monitoring...');
        monitor.stopMonitoring();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 [MONITOR] Received SIGTERM, stopping monitoring...');
        monitor.stopMonitoring();
        process.exit(0);
    });

    // Iniciar monitoreo
    const intervalMinutes = process.argv[2] ? parseInt(process.argv[2]) : 5;
    monitor.startMonitoring(intervalMinutes);

    // Mantener el proceso vivo
    setInterval(() => {
        // Keep alive
    }, 1000);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default QBTCCredentialsMonitor;