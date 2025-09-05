#!/usr/bin/env node

/**
 * QBTC UNIFIED LAUNCHER
 * =====================
 *
 * Launcher unificado para el sistema QBTC completo
 * Integra VPN, Proxy Seguro, Coordinador IP y Dashboard de Monitoreo
 */

import { spawn, fork } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCUnifiedLauncher {
    constructor(options = {}) {
        this.options = {
            autoStart: true,
            enableVPN: true,
            enableProxy: true,
            enableCoordinator: true,
            enableDashboard: true,
            targetIP: '181.43.212.196',
            ...options
        };

        this.processes = new Map();
        this.status = {
            vpn: false,
            proxy: false,
            coordinator: false,
            dashboard: false,
            system: false
        };

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            this.gracefulShutdown('uncaughtException');
        });
    }

    async start() {
        console.log('🚀 INICIANDO SISTEMA QBTC UNIFICADO');
        console.log('=====================================');
        console.log(`🎯 IP Objetivo: ${this.options.targetIP}`);
        console.log(`🔗 VPN: ${this.options.enableVPN ? 'Habilitado' : 'Deshabilitado'}`);
        console.log(`🌐 Proxy: ${this.options.enableProxy ? 'Habilitado' : 'Deshabilitado'}`);
        console.log(`🎛️  Coordinador: ${this.options.enableCoordinator ? 'Habilitado' : 'Deshabilitado'}`);
        console.log(`📊 Dashboard: ${this.options.enableDashboard ? 'Habilitado' : 'Deshabilitado'}`);
        console.log('=====================================\n');

        try {
            // Verificar dependencias
            await this.checkDependencies();

            // Iniciar componentes en orden
            if (this.options.enableVPN) {
                await this.startVPNComponent();
            }

            if (this.options.enableProxy) {
                await this.startProxyComponent();
            }

            if (this.options.enableCoordinator) {
                await this.startCoordinatorComponent();
            }

            if (this.options.enableDashboard) {
                await this.startDashboardComponent();
            }

            // Verificar estado del sistema
            await this.verifySystemStatus();

            console.log('\n✅ SISTEMA QBTC UNIFICADO INICIADO EXITOSAMENTE');
            console.log('==================================================');
            this.printSystemInfo();

            this.status.system = true;

        } catch (error) {
            console.error('❌ Error iniciando sistema:', error.message);
            await this.gracefulShutdown('startup_error');
            process.exit(1);
        }
    }

    async checkDependencies() {
        console.log('🔍 Verificando dependencias...');

        const dependencies = [
            { file: 'qbtc-vpn-connector.js', name: 'VPN Connector' },
            { file: 'qbtc-secure-proxy-server.js', name: 'Secure Proxy Server' },
            { file: 'qbtc-ip-coordinator.js', name: 'IP Coordinator' },
            { file: 'qbtc-monitoring-dashboard.js', name: 'Monitoring Dashboard' }
        ];

        for (const dep of dependencies) {
            if (!fs.existsSync(path.join(__dirname, dep.file))) {
                throw new Error(`Dependencia faltante: ${dep.file} (${dep.name})`);
            }
            console.log(`✅ ${dep.name}: OK`);
        }

        // Verificar archivos de configuración VPN
        const vpnConfigPath = path.join(__dirname, '..', 'QBTC-UNIFIED', 'qbtc-openvpn-config.ovpn');
        const vpnCredentialsPath = path.join(__dirname, '..', 'QBTC-UNIFIED', 'qbtc-credentials.txt');

        if (this.options.enableVPN) {
            if (!fs.existsSync(vpnConfigPath)) {
                console.warn(`⚠️  Archivo de configuración VPN no encontrado: ${vpnConfigPath}`);
                console.warn('   El componente VPN podría no funcionar correctamente');
            } else {
                console.log('✅ Configuración VPN: OK');
            }

            if (!fs.existsSync(vpnCredentialsPath)) {
                console.warn(`⚠️  Archivo de credenciales VPN no encontrado: ${vpnCredentialsPath}`);
                console.warn('   El componente VPN podría no funcionar correctamente');
            } else {
                console.log('✅ Credenciales VPN: OK');
            }
        }

        console.log('🔍 Verificación de dependencias completada\n');
    }

    async startVPNComponent() {
        console.log('🔗 Iniciando componente VPN...');

        try {
            const vpnProcess = fork(path.join(__dirname, 'qbtc-vpn-connector.js'), ['monitor'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, NODE_ENV: 'production' }
            });

            this.processes.set('vpn', vpnProcess);
            this.status.vpn = true;

            vpnProcess.on('message', (message) => {
                console.log('📡 VPN:', message);
            });

            vpnProcess.on('error', (error) => {
                console.error('❌ Error en VPN:', error.message);
                this.status.vpn = false;
            });

            vpnProcess.on('close', (code) => {
                console.log(`🔌 VPN process closed with code ${code}`);
                this.status.vpn = false;
            });

            // Esperar a que se inicie
            await this.waitForComponent('VPN', 5000);

        } catch (error) {
            console.error('❌ Error iniciando VPN:', error.message);
            throw error;
        }
    }

    async startProxyComponent() {
        console.log('🌐 Iniciando servidor proxy seguro...');

        try {
            const proxyProcess = fork(path.join(__dirname, 'qbtc-secure-proxy-server.js'), [], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'production',
                    PROXY_PORT: '8443'
                }
            });

            this.processes.set('proxy', proxyProcess);
            this.status.proxy = true;

            proxyProcess.on('message', (message) => {
                console.log('📡 Proxy:', message);
            });

            proxyProcess.on('error', (error) => {
                console.error('❌ Error en Proxy:', error.message);
                this.status.proxy = false;
            });

            proxyProcess.on('close', (code) => {
                console.log(`🔌 Proxy process closed with code ${code}`);
                this.status.proxy = false;
            });

            // Esperar a que se inicie
            await this.waitForComponent('Proxy', 3000);

        } catch (error) {
            console.error('❌ Error iniciando Proxy:', error.message);
            throw error;
        }
    }

    async startCoordinatorComponent() {
        console.log('🎛️  Iniciando coordinador IP...');

        try {
            const coordinatorProcess = fork(path.join(__dirname, 'qbtc-ip-coordinator.js'), ['start', '--api'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'production'
                }
            });

            this.processes.set('coordinator', coordinatorProcess);
            this.status.coordinator = true;

            coordinatorProcess.on('message', (message) => {
                console.log('📡 Coordinator:', message);
            });

            coordinatorProcess.on('error', (error) => {
                console.error('❌ Error en Coordinator:', error.message);
                this.status.coordinator = false;
            });

            coordinatorProcess.on('close', (code) => {
                console.log(`🔌 Coordinator process closed with code ${code}`);
                this.status.coordinator = false;
            });

            // Esperar a que se inicie
            await this.waitForComponent('Coordinator', 5000);

        } catch (error) {
            console.error('❌ Error iniciando Coordinator:', error.message);
            throw error;
        }
    }

    async startDashboardComponent() {
        console.log('📊 Iniciando dashboard de monitoreo...');

        try {
            const dashboardProcess = fork(path.join(__dirname, 'qbtc-monitoring-dashboard.js'), ['start'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'production',
                    DASHBOARD_PORT: '8080'
                }
            });

            this.processes.set('dashboard', dashboardProcess);
            this.status.dashboard = true;

            dashboardProcess.on('message', (message) => {
                console.log('📡 Dashboard:', message);
            });

            dashboardProcess.on('error', (error) => {
                console.error('❌ Error en Dashboard:', error.message);
                this.status.dashboard = false;
            });

            dashboardProcess.on('close', (code) => {
                console.log(`🔌 Dashboard process closed with code ${code}`);
                this.status.dashboard = false;
            });

            // Esperar a que se inicie
            await this.waitForComponent('Dashboard', 3000);

        } catch (error) {
            console.error('❌ Error iniciando Dashboard:', error.message);
            throw error;
        }
    }

    async waitForComponent(componentName, timeout) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`✅ ${componentName} iniciado`);
                resolve();
            }, timeout);
        });
    }

    async verifySystemStatus() {
        console.log('🔍 Verificando estado del sistema...');

        // Verificar conectividad básica
        try {
            const response = await this.makeHttpRequest('http://localhost:8443/health');
            if (response) {
                console.log('✅ Proxy server responding');
            }
        } catch (error) {
            console.warn('⚠️  Proxy server not responding:', error.message);
        }

        try {
            const response = await this.makeHttpRequest('http://localhost:8080/health');
            if (response) {
                console.log('✅ Dashboard responding');
            }
        } catch (error) {
            console.warn('⚠️  Dashboard not responding:', error.message);
        }

        console.log('🔍 Verificación completada\n');
    }

    makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                });
            });

            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    printSystemInfo() {
        console.log('📊 COMPONENTES ACTIVOS:');
        console.log(`   🔗 VPN: ${this.status.vpn ? '✅ Activo' : '❌ Inactivo'}`);
        console.log(`   🌐 Proxy Seguro: ${this.status.proxy ? '✅ Activo (puerto 8443)' : '❌ Inactivo'}`);
        console.log(`   🎛️  Coordinador IP: ${this.status.coordinator ? '✅ Activo' : '❌ Inactivo'}`);
        console.log(`   📊 Dashboard: ${this.status.dashboard ? '✅ Activo (puerto 8080)' : '❌ Inactivo'}`);

        console.log('\n🔗 URLs DE ACCESO:');
        if (this.status.proxy) {
            console.log('   🌐 Proxy Seguro: http://localhost:8443');
        }
        if (this.status.dashboard) {
            console.log('   📊 Dashboard: http://localhost:8080');
        }

        console.log('\n🎯 IP OBJETIVO:');
        console.log(`   📍 ${this.options.targetIP}`);

        console.log('\n💡 COMANDOS ÚTILES:');
        console.log('   🔄 Reiniciar: node qbtc-unified-launcher.js restart');
        console.log('   🛑 Detener: node qbtc-unified-launcher.js stop');
        console.log('   📊 Estado: node qbtc-unified-launcher.js status');
        console.log('==================================================\n');
    }

    async gracefulShutdown(reason) {
        console.log(`\n🛑 Iniciando apagado graceful (${reason})...`);

        const shutdownPromises = [];

        for (const [name, process] of this.processes) {
            console.log(`🔌 Deteniendo ${name}...`);
            shutdownPromises.push(
                new Promise((resolve) => {
                    process.on('close', () => {
                        console.log(`✅ ${name} detenido`);
                        resolve();
                    });

                    process.kill('SIGTERM');

                    // Timeout de respaldo
                    setTimeout(() => {
                        if (!process.killed) {
                            process.kill('SIGKILL');
                        }
                        resolve();
                    }, 5000);
                })
            );
        }

        try {
            await Promise.all(shutdownPromises);
            console.log('✅ Todos los componentes detenidos correctamente');
        } catch (error) {
            console.error('❌ Error durante el apagado:', error.message);
        }

        console.log('👋 Sistema QBTC Unificado finalizado');
        process.exit(0);
    }

    getStatus() {
        return {
            ...this.status,
            processes: Array.from(this.processes.keys()),
            targetIP: this.options.targetIP,
            uptime: process.uptime()
        };
    }
}

// Función para uso desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const launcher = new QBTCUnifiedLauncher();

    try {
        switch (command) {
            case 'start':
                await launcher.start();
                // Mantener vivo para monitoreo
                process.on('SIGINT', () => {});
                break;

            case 'stop':
                await launcher.gracefulShutdown('manual_stop');
                break;

            case 'restart':
                console.log('🔄 Reiniciando sistema...');
                await launcher.gracefulShutdown('restart');
                // Pequeña pausa antes de reiniciar
                setTimeout(async () => {
                    const newLauncher = new QBTCUnifiedLauncher();
                    await newLauncher.start();
                }, 2000);
                break;

            case 'status':
                const status = launcher.getStatus();
                console.log('📊 Estado del Sistema QBTC Unificado:');
                console.log(JSON.stringify(status, null, 2));
                break;

            case 'test':
                console.log('🧪 Probando componentes...');
                const testLauncher = new QBTCUnifiedLauncher({
                    enableVPN: false,
                    enableCoordinator: false
                });
                await testLauncher.start();
                break;

            default:
                console.log('Usage: node qbtc-unified-launcher.js <command>');
                console.log('Commands:');
                console.log('  start   - Start unified system');
                console.log('  stop    - Stop unified system');
                console.log('  restart - Restart unified system');
                console.log('  status  - Show system status');
                console.log('  test    - Test components (VPN/Coordinator disabled)');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Exportar clase para uso como módulo
export default QBTCUnifiedLauncher;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}