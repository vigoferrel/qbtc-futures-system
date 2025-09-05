/**
 * 🔐 QBTC CREDENTIALS MANAGER - ROBUST IMPLEMENTATION
 * ===================================================
 *
 * Sistema robusto para gestión de credenciales Binance
 * - Validación automática
 * - Encriptación de datos sensibles
 * - Sistema de respaldo
 * - Monitoreo de conectividad
 * - Rotación automática de credenciales
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCCredentialsManager {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.credentials = {};
        this.backupCredentials = {};
        this.healthStatus = {
            primary: 'UNKNOWN',
            backup: 'UNKNOWN',
            lastCheck: null,
            connectivity: false
        };
        this.loadCredentials();
    }

    /**
     * 🔑 Genera clave de encriptación
     */
    generateEncryptionKey() {
        // Genera una clave de 32 bytes para AES-256
        return crypto.randomBytes(32);
    }

    /**
     * 🔐 Encripta datos sensibles
     */
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { encrypted, iv: iv.toString('hex') };
    }

    /**
     * 🔓 Desencripta datos sensibles
     */
    decrypt(encryptedData) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, Buffer.from(encryptedData.iv, 'hex'));
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * 📂 Carga credenciales desde archivos
     */
    loadCredentials() {
        try {
            // Cargar credenciales principales
            if (fs.existsSync('.binance-config.json')) {
                const primaryData = JSON.parse(fs.readFileSync('.binance-config.json', 'utf8'));
                this.credentials.primary = {
                    apiKey: primaryData.apiKey,
                    secretKey: primaryData.secretKey,
                    testnet: primaryData.testnet || false,
                    encrypted: false
                };
                console.log('✅ [CREDENTIALS] Primary credentials loaded');
            }

            // Cargar credenciales de respaldo
            if (fs.existsSync('.binance-config-backup.json')) {
                const backupData = JSON.parse(fs.readFileSync('.binance-config-backup.json', 'utf8'));
                this.backupCredentials.primary = {
                    apiKey: backupData.apiKey,
                    secretKey: backupData.secretKey,
                    testnet: backupData.testnet || false,
                    encrypted: false
                };
                console.log('✅ [CREDENTIALS] Backup credentials loaded');
            }

            // Cargar credenciales encriptadas si existen
            if (fs.existsSync('.binance-config-encrypted.json')) {
                const encryptedData = JSON.parse(fs.readFileSync('.binance-config-encrypted.json', 'utf8'));
                this.credentials.encrypted = {
                    apiKey: this.decrypt({ encrypted: encryptedData.apiKey, iv: encryptedData.apiKeyIv }),
                    secretKey: this.decrypt({ encrypted: encryptedData.secretKey, iv: encryptedData.secretKeyIv }),
                    testnet: encryptedData.testnet || false,
                    encrypted: true
                };
                console.log('✅ [CREDENTIALS] Encrypted credentials loaded and decrypted');
            }

        } catch (error) {
            console.error('❌ [CREDENTIALS] Error loading credentials:', error.message);
        }
    }

    /**
     * 💾 Guarda credenciales de forma segura
     */
    saveCredentials(credentials, type = 'primary') {
        try {
            const configData = {
                apiKey: credentials.apiKey,
                secretKey: credentials.secretKey,
                testnet: credentials.testnet || false,
                lastUpdated: new Date().toISOString(),
                version: '2.0-robust'
            };

            // Guardar versión sin encriptar
            fs.writeFileSync(`.binance-config-${type}.json`, JSON.stringify(configData, null, 2));

            // Guardar versión encriptada
            const encryptedApiKey = this.encrypt(credentials.apiKey);
            const encryptedSecretKey = this.encrypt(credentials.secretKey);

            const encryptedConfig = {
                apiKey: encryptedApiKey.encrypted,
                apiKeyIv: encryptedApiKey.iv,
                secretKey: encryptedSecretKey.encrypted,
                secretKeyIv: encryptedSecretKey.iv,
                testnet: credentials.testnet || false,
                lastUpdated: new Date().toISOString(),
                encrypted: true
            };

            fs.writeFileSync(`.binance-config-${type}-encrypted.json`, JSON.stringify(encryptedConfig, null, 2));

            console.log(`✅ [CREDENTIALS] ${type} credentials saved securely`);
        } catch (error) {
            console.error(`❌ [CREDENTIALS] Error saving ${type} credentials:`, error.message);
            throw error;
        }
    }

    /**
     * 🔍 Valida formato de credenciales
     */
    validateCredentials(apiKey, secretKey) {
        const errors = [];

        // Validar API Key
        if (!apiKey || typeof apiKey !== 'string') {
            errors.push('API Key is required and must be a string');
        } else if (apiKey.length !== 64) {
            errors.push('API Key must be exactly 64 characters');
        } else if (!/^[A-Za-z0-9]+$/.test(apiKey)) {
            errors.push('API Key must contain only alphanumeric characters');
        }

        // Validar Secret Key
        if (!secretKey || typeof secretKey !== 'string') {
            errors.push('Secret Key is required and must be a string');
        } else if (secretKey.length !== 64) {
            errors.push('Secret Key must be exactly 64 characters');
        } else if (!/^[A-Za-z0-9]+$/.test(secretKey)) {
            errors.push('Secret Key must contain only alphanumeric characters');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 🌐 Prueba conectividad con Binance
     */
    async testConnectivity(credentials, useTestnet = false) {
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto.createHmac('sha256', credentials.secretKey)
                                  .update(queryString)
                                  .digest('hex');
            const finalQuery = `${queryString}&signature=${signature}`;

            const hostname = useTestnet ? 'testnet.binance.vision' : 'fapi.binance.com';
            const path = `/fapi/v2/account?${finalQuery}`;

            const options = {
                hostname,
                path,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': credentials.apiKey,
                    'User-Agent': 'QBTC-Credentials-Manager/2.0'
                },
                timeout: 10000
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);

                        if (response.code === -2015) {
                            resolve({
                                success: false,
                                error: 'IP_RESTRICTION',
                                message: 'IP not whitelisted in Binance',
                                details: response
                            });
                        } else if (response.code) {
                            resolve({
                                success: false,
                                error: 'API_ERROR',
                                message: response.msg,
                                details: response
                            });
                        } else {
                            resolve({
                                success: true,
                                balance: response.totalWalletBalance,
                                accountType: response.accountType || 'FUTURES',
                                permissions: response.permissions || []
                            });
                        }
                    } catch (error) {
                        resolve({
                            success: false,
                            error: 'PARSE_ERROR',
                            message: 'Failed to parse Binance response',
                            details: data
                        });
                    }
                });
            });

            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: 'CONNECTION_ERROR',
                    message: error.message
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'TIMEOUT',
                    message: 'Request timeout'
                });
            });

            req.end();
        });
    }

    /**
     * 🔄 Rota credenciales automáticamente
     */
    async rotateCredentials() {
        console.log('🔄 [CREDENTIALS] Starting automatic credential rotation...');

        try {
            // Verificar estado actual
            const primaryStatus = await this.testConnectivity(this.credentials.primary);
            const backupStatus = this.backupCredentials.primary ?
                await this.testConnectivity(this.backupCredentials.primary) : null;

            // Si las credenciales principales fallan, usar respaldo
            if (!primaryStatus.success && backupStatus && backupStatus.success) {
                console.log('⚠️ [CREDENTIALS] Primary credentials failed, switching to backup');
                this.credentials.primary = { ...this.backupCredentials.primary };
                this.saveCredentials(this.credentials.primary, 'primary-rotated');
            }

            // Actualizar estado de salud
            this.healthStatus.primary = primaryStatus.success ? 'HEALTHY' : 'UNHEALTHY';
            this.healthStatus.backup = backupStatus ? (backupStatus.success ? 'HEALTHY' : 'UNHEALTHY') : 'NOT_AVAILABLE';
            this.healthStatus.lastCheck = new Date().toISOString();
            this.healthStatus.connectivity = primaryStatus.success;

        } catch (error) {
            console.error('❌ [CREDENTIALS] Error during rotation:', error.message);
        }
    }

    /**
     * 📊 Obtiene estado de salud de credenciales
     */
    getHealthStatus() {
        return {
            ...this.healthStatus,
            credentialsLoaded: Object.keys(this.credentials).length > 0,
            backupAvailable: Object.keys(this.backupCredentials).length > 0,
            lastRotation: new Date().toISOString()
        };
    }

    /**
     * 🔑 Obtiene credenciales activas
     */
    getActiveCredentials() {
        // Priorizar credenciales principales
        if (this.credentials.primary) {
            return {
                ...this.credentials.primary,
                source: 'primary',
                validated: this.healthStatus.primary === 'HEALTHY'
            };
        }

        // Fallback a credenciales encriptadas
        if (this.credentials.encrypted) {
            return {
                ...this.credentials.encrypted,
                source: 'encrypted',
                validated: this.healthStatus.primary === 'HEALTHY'
            };
        }

        // Último recurso: credenciales de respaldo
        if (this.backupCredentials.primary) {
            return {
                ...this.backupCredentials.primary,
                source: 'backup',
                validated: this.healthStatus.backup === 'HEALTHY'
            };
        }

        throw new Error('No valid credentials available');
    }

    /**
     * 🔧 Configura credenciales nuevas
     */
    async setupCredentials(apiKey, secretKey, testnet = false) {
        // Validar formato
        const validation = this.validateCredentials(apiKey, secretKey);
        if (!validation.valid) {
            throw new Error(`Invalid credentials: ${validation.errors.join(', ')}`);
        }

        const newCredentials = {
            apiKey,
            secretKey,
            testnet
        };

        // Probar conectividad
        console.log('🧪 [CREDENTIALS] Testing new credentials...');
        const testResult = await this.testConnectivity(newCredentials, testnet);

        if (!testResult.success) {
            throw new Error(`Credential test failed: ${testResult.message}`);
        }

        // Guardar como principales
        this.credentials.primary = newCredentials;
        this.saveCredentials(newCredentials, 'primary');

        // Actualizar estado de salud
        this.healthStatus.primary = 'HEALTHY';
        this.healthStatus.lastCheck = new Date().toISOString();
        this.healthStatus.connectivity = true;

        console.log('✅ [CREDENTIALS] New credentials configured successfully');
        console.log(`💰 Account Balance: $${parseFloat(testResult.balance || 0).toLocaleString()}`);

        return {
            success: true,
            balance: testResult.balance,
            accountType: testResult.accountType
        };
    }

    /**
     * 🔄 Inicia monitoreo automático
     */
    startMonitoring(intervalMinutes = 5) {
        console.log(`👀 [CREDENTIALS] Starting monitoring every ${intervalMinutes} minutes`);

        setInterval(async () => {
            await this.rotateCredentials();

            const health = this.getHealthStatus();
            if (!health.connectivity) {
                console.warn('⚠️ [CREDENTIALS] Connectivity issues detected');
            }
        }, intervalMinutes * 60 * 1000);
    }
}

// Exportar instancia singleton
export default new QBTCCredentialsManager();