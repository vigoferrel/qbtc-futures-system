#!/usr/bin/env node

/**
 * QBTC VPN AUTO-CONNECTOR
 * =======================
 *
 * Módulo para gestión automática de conexiones VPN
 * Integración con OpenVPN y monitoreo de estado
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import EventEmitter from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCVPNConnector extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            targetIP: '181.43.212.196',
            vpnConfigPath: path.join(__dirname, '..', 'QBTC-UNIFIED', 'qbtc-openvpn-config.ovpn'),
            credentialsPath: path.join(__dirname, '..', 'QBTC-UNIFIED', 'qbtc-credentials.txt'),
            openvpnPath: 'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe',
            checkInterval: 30000, // 30 seconds
            maxRetries: 3,
            timeout: 60000, // 60 seconds
            ...options
        };

        this.vpnProcess = null;
        this.isConnected = false;
        this.currentIP = null;
        this.retryCount = 0;
        this.monitoring = false;

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.on('connected', () => {
            console.log('🔗 VPN connected successfully');
            this.isConnected = true;
            this.retryCount = 0;
        });

        this.on('disconnected', () => {
            console.log('🔌 VPN disconnected');
            this.isConnected = false;
        });

        this.on('error', (error) => {
            console.error('🚨 VPN error:', error.message);
        });

        this.on('retry', (attempt) => {
            console.log(`🔄 VPN retry attempt ${attempt}/${this.options.maxRetries}`);
        });
    }

    async connect() {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar archivos necesarios
                if (!this.checkVPNFiles()) {
                    throw new Error('VPN configuration files not found');
                }

                // Verificar si ya está conectado
                const currentIP = await this.getCurrentIP();
                if (currentIP === this.options.targetIP) {
                    this.isConnected = true;
                    this.currentIP = currentIP;
                    this.emit('connected');
                    resolve({ success: true, message: 'Already connected to target IP' });
                    return;
                }

                // Desconectar VPNs existentes
                await this.disconnectExistingVPNs();

                console.log('🚀 Starting VPN connection...');

                // Iniciar proceso OpenVPN
                this.vpnProcess = spawn(this.options.openvpnPath, [
                    '--config', this.options.vpnConfigPath,
                    '--auth-user-pass', this.options.credentialsPath,
                    '--script-security', '2'
                ], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    cwd: path.dirname(this.options.vpnConfigPath)
                });

                let connectionTimeout = setTimeout(() => {
                    this.killVPNProcess();
                    reject(new Error('VPN connection timeout'));
                }, this.options.timeout);

                // Monitorear salida del proceso
                this.vpnProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    console.log('VPN stdout:', output);

                    // Detectar conexión exitosa
                    if (output.includes('Initialization Sequence Completed') ||
                        output.includes('Connected')) {
                        clearTimeout(connectionTimeout);
                        this.startMonitoring();
                        resolve({ success: true, message: 'VPN connected successfully' });
                    }
                });

                this.vpnProcess.stderr.on('data', (data) => {
                    const error = data.toString();
                    console.log('VPN stderr:', error);

                    // Algunos errores pueden ser normales durante la conexión
                    if (error.includes('ERROR') && !error.includes('NOTE')) {
                        console.warn('VPN stderr error:', error);
                    }
                });

                this.vpnProcess.on('close', (code) => {
                    clearTimeout(connectionTimeout);
                    console.log(`VPN process exited with code ${code}`);

                    if (code !== 0 && this.retryCount < this.options.maxRetries) {
                        this.retryCount++;
                        this.emit('retry', this.retryCount);
                        setTimeout(() => {
                            this.connect().then(resolve).catch(reject);
                        }, 5000);
                    } else if (code === 0) {
                        this.emit('disconnected');
                    } else {
                        reject(new Error(`VPN process failed with code ${code}`));
                    }
                });

                this.vpnProcess.on('error', (error) => {
                    clearTimeout(connectionTimeout);
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async disconnect() {
        return new Promise((resolve) => {
            if (this.vpnProcess) {
                this.killVPNProcess();
            }

            // También desconectar usando taskkill como respaldo
            exec('taskkill /f /im openvpn.exe', (error) => {
                this.isConnected = false;
                this.stopMonitoring();
                this.emit('disconnected');
                resolve({ success: true, message: 'VPN disconnected' });
            });
        });
    }

    async disconnectExistingVPNs() {
        return new Promise((resolve) => {
            exec('taskkill /f /im openvpn.exe', () => {
                setTimeout(resolve, 2000); // Esperar a que se cierre
            });
        });
    }

    killVPNProcess() {
        if (this.vpnProcess) {
            this.vpnProcess.kill('SIGTERM');
            setTimeout(() => {
                if (!this.vpnProcess.killed) {
                    this.vpnProcess.kill('SIGKILL');
                }
            }, 5000);
            this.vpnProcess = null;
        }
    }

    checkVPNFiles() {
        const configExists = fs.existsSync(this.options.vpnConfigPath);
        const credentialsExist = fs.existsSync(this.options.credentialsPath);

        if (!configExists) {
            console.error(`VPN config file not found: ${this.options.vpnConfigPath}`);
        }

        if (!credentialsExist) {
            console.error(`VPN credentials file not found: ${this.options.credentialsPath}`);
        }

        return configExists && credentialsExist;
    }

    async getCurrentIP() {
        return new Promise((resolve, reject) => {
            https.get('https://api.ipify.org', (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data.trim()));
            }).on('error', reject);
        });
    }

    async verifyConnection() {
        try {
            const currentIP = await this.getCurrentIP();
            const isConnected = currentIP === this.options.targetIP;

            this.currentIP = currentIP;
            this.isConnected = isConnected;

            return {
                connected: isConnected,
                currentIP: currentIP,
                targetIP: this.options.targetIP,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    startMonitoring() {
        if (this.monitoring) return;

        this.monitoring = true;
        console.log('🔍 Starting VPN monitoring...');

        this.monitorInterval = setInterval(async () => {
            const status = await this.verifyConnection();

            if (status.connected && !this.isConnected) {
                this.emit('connected');
            } else if (!status.connected && this.isConnected) {
                this.emit('disconnected');
                // Intentar reconectar automáticamente
                if (this.retryCount < this.options.maxRetries) {
                    console.log('🔄 Auto-reconnecting VPN...');
                    this.connect().catch(error => {
                        console.error('Auto-reconnection failed:', error.message);
                    });
                }
            }
        }, this.options.checkInterval);
    }

    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.monitoring = false;
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            currentIP: this.currentIP,
            targetIP: this.options.targetIP,
            monitoring: this.monitoring,
            retryCount: this.retryCount,
            processRunning: this.vpnProcess && !this.vpnProcess.killed
        };
    }

    // Método para integración con otros sistemas
    async ensureConnected() {
        const status = await this.verifyConnection();

        if (!status.connected) {
            console.log('🔗 Target IP not connected, initiating VPN connection...');
            await this.connect();
            return await this.verifyConnection();
        }

        return status;
    }
}

// Función para uso directo desde línea de comandos
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const connector = new QBTCVPNConnector();

    connector.on('connected', () => {
        console.log('✅ VPN connected successfully');
        process.exit(0);
    });

    connector.on('disconnected', () => {
        console.log('❌ VPN disconnected');
    });

    connector.on('error', (error) => {
        console.error('🚨 VPN error:', error.message);
        process.exit(1);
    });

    connector.on('retry', (attempt) => {
        console.log(`🔄 Retry attempt ${attempt}`);
    });

    try {
        switch (command) {
            case 'connect':
                console.log('🚀 Connecting VPN...');
                await connector.connect();
                break;

            case 'disconnect':
                console.log('🔌 Disconnecting VPN...');
                await connector.disconnect();
                process.exit(0);
                break;

            case 'status':
                const status = await connector.verifyConnection();
                console.log('📊 VPN Status:');
                console.log(JSON.stringify(status, null, 2));
                process.exit(0);
                break;

            case 'monitor':
                console.log('🔍 Starting VPN monitoring...');
                connector.startMonitoring();

                // Mantener el proceso vivo
                process.on('SIGINT', () => {
                    console.log('\n🛑 Stopping VPN monitoring...');
                    connector.stopMonitoring();
                    process.exit(0);
                });

                break;

            default:
                console.log('Usage: node qbtc-vpn-connector.js <command>');
                console.log('Commands:');
                console.log('  connect    - Connect VPN');
                console.log('  disconnect - Disconnect VPN');
                console.log('  status     - Check VPN status');
                console.log('  monitor    - Start monitoring mode');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Exportar clase para uso como módulo
export default QBTCVPNConnector;

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}