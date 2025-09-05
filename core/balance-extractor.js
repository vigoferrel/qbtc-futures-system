#!/usr/bin/env node

/**
 * 💰 QBTC BALANCE EXTRACTOR - ROBUST IMPLEMENTATION
 * ================================================
 *
 * Extrae el balance real de la cuenta de Binance
 * - Usa el sistema robusto de credenciales
 * - Manejo avanzado de errores
 * - Formato detallado del balance
 * - Exportación a múltiples formatos
 */

import QBTCCredentialsManager from './credentials-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QBTCBalanceExtractor {
    constructor() {
        this.manager = QBTCCredentialsManager;
        this.lastBalance = null;
        this.balanceHistory = [];
    }

    /**
     * 💰 Extrae balance completo de la cuenta
     */
    async extractBalance(options = {}) {
        const {
            testnet = false,
            format = 'detailed',
            saveToFile = true,
            includePositions = true,
            includeHistory = false
        } = options;

        console.log('💰 QBTC BALANCE EXTRACTOR');
        console.log('=========================\n');

        try {
            // Obtener credenciales activas
            const credentials = this.manager.getActiveCredentials();
            console.log(`🔑 Using ${credentials.source} credentials`);
            console.log(`🌐 Environment: ${testnet ? 'TESTNET' : 'MAINNET'}\n`);

            // Extraer balance
            const balanceData = await this.getAccountBalance(credentials, testnet);

            if (!balanceData.success) {
                console.log('❌ BALANCE EXTRACTION FAILED');
                console.log(`🚨 Error: ${balanceData.error}`);
                console.log(`📝 Message: ${balanceData.message}\n`);

                // Intentar con credenciales alternativas si está disponible
                if (balanceData.error === 'IP_RESTRICTION' && credentials.source === 'primary') {
                    console.log('🔄 Attempting with alternative credentials...');
                    await this.tryAlternativeCredentials(testnet);
                }

                return null;
            }

            // Procesar y mostrar balance
            const processedBalance = this.processBalanceData(balanceData);
            this.displayBalance(processedBalance, format);

            // Guardar balance si se solicita
            if (saveToFile) {
                this.saveBalanceToFile(processedBalance, format);
            }

            // Actualizar historial
            this.updateBalanceHistory(processedBalance);

            // Mostrar resumen
            this.displaySummary(processedBalance);

            return processedBalance;

        } catch (error) {
            console.error('💥 BALANCE EXTRACTION ERROR:', error.message);
            return null;
        }
    }

    /**
     * 🔍 Obtiene balance de cuenta desde Binance
     */
    async getAccountBalance(credentials, testnet = false) {
        return new Promise((resolve) => {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = crypto.createHmac('sha256', credentials.secretKey)
                                  .update(queryString)
                                  .digest('hex');
            const finalQuery = `${queryString}&signature=${signature}`;

            const hostname = testnet ? 'testnet.binance.vision' : 'fapi.binance.com';
            const path = `/fapi/v2/account?${finalQuery}`;

            const options = {
                hostname,
                path,
                method: 'GET',
                headers: {
                    'X-MBX-APIKEY': credentials.apiKey,
                    'User-Agent': 'QBTC-Balance-Extractor/2.0'
                },
                timeout: 15000
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
                                data: response,
                                timestamp: new Date().toISOString(),
                                source: testnet ? 'testnet' : 'mainnet'
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
     * 🔄 Intenta con credenciales alternativas
     */
    async tryAlternativeCredentials(testnet) {
        try {
            // Verificar si hay credenciales de respaldo
            const backupCredentials = this.manager.backupCredentials?.primary;

            if (backupCredentials) {
                console.log('🔄 Trying backup credentials...');
                const backupResult = await this.getAccountBalance(backupCredentials, testnet);

                if (backupResult.success) {
                    console.log('✅ BACKUP CREDENTIALS SUCCESSFUL');
                    const processedBalance = this.processBalanceData(backupResult);
                    this.displayBalance(processedBalance, 'detailed');
                    return processedBalance;
                } else {
                    console.log('❌ BACKUP CREDENTIALS ALSO FAILED');
                }
            } else {
                console.log('⚠️ NO BACKUP CREDENTIALS AVAILABLE');
            }
        } catch (error) {
            console.log('💥 ERROR TRYING BACKUP CREDENTIALS:', error.message);
        }

        return null;
    }

    /**
     * 📊 Procesa datos de balance
     */
    processBalanceData(balanceData) {
        const raw = balanceData.data;

        return {
            accountInfo: {
                accountType: raw.accountType || 'FUTURES',
                feeTier: raw.feeTier || 0,
                canTrade: raw.canTrade || false,
                canDeposit: raw.canDeposit || false,
                canWithdraw: raw.canWithdraw || false,
                updateTime: raw.updateTime,
                multiAssetsMargin: raw.multiAssetsMargin || false
            },
            balances: {
                totalWalletBalance: parseFloat(raw.totalWalletBalance || 0),
                totalUnrealizedProfit: parseFloat(raw.totalUnrealizedProfit || 0),
                totalMarginBalance: parseFloat(raw.totalMarginBalance || 0),
                totalMaintMargin: parseFloat(raw.totalMaintMargin || 0),
                totalInitialMargin: parseFloat(raw.totalInitialMargin || 0),
                totalPositionInitialMargin: parseFloat(raw.totalPositionInitialMargin || 0),
                totalOpenOrderInitialMargin: parseFloat(raw.totalOpenOrderInitialMargin || 0),
                maxWithdrawAmount: parseFloat(raw.maxWithdrawAmount || 0),
                availableBalance: parseFloat(raw.availableBalance || 0)
            },
            positions: raw.positions ? raw.positions
                .filter(pos => parseFloat(pos.positionAmt) !== 0)
                .map(pos => ({
                    symbol: pos.symbol,
                    positionAmt: parseFloat(pos.positionAmt),
                    entryPrice: parseFloat(pos.entryPrice),
                    markPrice: parseFloat(pos.markPrice),
                    unRealizedProfit: parseFloat(pos.unRealizedProfit),
                    liquidationPrice: parseFloat(pos.liquidationPrice),
                    leverage: parseInt(pos.leverage),
                    maxNotionalValue: parseFloat(pos.maxNotionalValue),
                    marginType: pos.marginType,
                    isolatedMargin: parseFloat(pos.isolatedMargin || 0),
                    isAutoAddMargin: pos.isAutoAddMargin === 'true',
                    positionSide: pos.positionSide,
                    notional: parseFloat(pos.notional),
                    isolatedWallet: parseFloat(pos.isolatedWallet || 0),
                    updateTime: pos.updateTime
                })) : [],
            assets: raw.assets ? raw.assets
                .filter(asset => parseFloat(asset.walletBalance) !== 0 || parseFloat(asset.unrealizedProfit) !== 0)
                .map(asset => ({
                    asset: asset.asset,
                    walletBalance: parseFloat(asset.walletBalance),
                    unrealizedProfit: parseFloat(asset.unrealizedProfit),
                    marginBalance: parseFloat(asset.marginBalance),
                    maintMargin: parseFloat(asset.maintMargin),
                    initialMargin: parseFloat(asset.initialMargin),
                    positionInitialMargin: parseFloat(asset.positionInitialMargin),
                    openOrderInitialMargin: parseFloat(asset.openOrderInitialMargin),
                    maxWithdrawAmount: parseFloat(asset.maxWithdrawAmount),
                    crossWalletBalance: parseFloat(asset.crossWalletBalance),
                    crossUnPnl: parseFloat(asset.crossUnPnl),
                    availableBalance: parseFloat(asset.availableBalance),
                    marginAvailable: asset.marginAvailable,
                    updateTime: asset.updateTime
                })) : [],
            metadata: {
                extractionTime: balanceData.timestamp,
                source: balanceData.source,
                apiVersion: 'v2',
                extractorVersion: '2.0-robust'
            }
        };
    }

    /**
     * 📋 Muestra balance en formato especificado
     */
    displayBalance(balance, format = 'detailed') {
        console.log('📊 ACCOUNT BALANCE');
        console.log('==================\n');

        switch (format) {
            case 'simple':
                this.displaySimpleFormat(balance);
                break;
            case 'detailed':
                this.displayDetailedFormat(balance);
                break;
            case 'json':
                console.log(JSON.stringify(balance, null, 2));
                break;
            default:
                this.displayDetailedFormat(balance);
        }
    }

    /**
     * 📈 Formato simple
     */
    displaySimpleFormat(balance) {
        const b = balance.balances;

        console.log('💰 WALLET BALANCE');
        console.log(`   Total: $${b.totalWalletBalance.toLocaleString()}`);
        console.log(`   Available: $${b.availableBalance.toLocaleString()}`);
        console.log(`   P&L: $${b.totalUnrealizedProfit.toLocaleString()}`);
        console.log(`   Max Withdrawal: $${b.maxWithdrawAmount.toLocaleString()}\n`);

        if (balance.positions.length > 0) {
            console.log('📊 ACTIVE POSITIONS');
            balance.positions.forEach(pos => {
                console.log(`   ${pos.symbol}: ${pos.positionAmt} @ $${pos.entryPrice.toLocaleString()}`);
            });
            console.log('');
        }
    }

    /**
     * 📊 Formato detallado
     */
    displayDetailedFormat(balance) {
        const b = balance.balances;
        const a = balance.accountInfo;

        console.log('🏦 ACCOUNT INFORMATION');
        console.log(`   Type: ${a.accountType}`);
        console.log(`   Fee Tier: ${a.feeTier}`);
        console.log(`   Can Trade: ${a.canTrade ? '✅' : '❌'}`);
        console.log(`   Multi-Assets Margin: ${a.multiAssetsMargin ? '✅' : '❌'}\n`);

        console.log('💰 BALANCE SUMMARY');
        console.log(`   Total Wallet Balance: $${b.totalWalletBalance.toLocaleString()}`);
        console.log(`   Available Balance: $${b.availableBalance.toLocaleString()}`);
        console.log(`   Total Unrealized P&L: $${b.totalUnrealizedProfit.toLocaleString()}`);
        console.log(`   Total Margin Balance: $${b.totalMarginBalance.toLocaleString()}`);
        console.log(`   Total Maintenance Margin: $${b.totalMaintMargin.toLocaleString()}`);
        console.log(`   Total Initial Margin: $${b.totalInitialMargin.toLocaleString()}`);
        console.log(`   Max Withdrawal Amount: $${b.maxWithdrawAmount.toLocaleString()}\n`);

        if (balance.assets.length > 0) {
            console.log('🪙 ASSETS BREAKDOWN');
            balance.assets.forEach(asset => {
                console.log(`   ${asset.asset}:`);
                console.log(`     Wallet Balance: ${asset.walletBalance.toLocaleString()}`);
                console.log(`     Unrealized P&L: ${asset.unrealizedProfit.toLocaleString()}`);
                console.log(`     Available Balance: ${asset.availableBalance.toLocaleString()}`);
            });
            console.log('');
        }

        if (balance.positions.length > 0) {
            console.log('📊 ACTIVE POSITIONS');
            balance.positions.forEach(pos => {
                const pnlColor = pos.unRealizedProfit >= 0 ? '🟢' : '🔴';
                console.log(`   ${pos.symbol}:`);
                console.log(`     Size: ${pos.positionAmt}`);
                console.log(`     Entry Price: $${pos.entryPrice.toLocaleString()}`);
                console.log(`     Mark Price: $${pos.markPrice.toLocaleString()}`);
                console.log(`     Leverage: ${pos.leverage}x`);
                console.log(`     P&L: ${pnlColor} $${pos.unRealizedProfit.toLocaleString()}`);
                console.log(`     Liquidation Price: $${pos.liquidationPrice.toLocaleString()}`);
            });
            console.log('');
        }

        console.log('⏰ EXTRACTION INFO');
        console.log(`   Time: ${balance.metadata.extractionTime}`);
        console.log(`   Source: ${balance.metadata.source.toUpperCase()}`);
        console.log(`   API Version: ${balance.metadata.apiVersion}`);
    }

    /**
     * 💾 Guarda balance en archivo
     */
    saveBalanceToFile(balance, format = 'detailed') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `balance-${balance.metadata.source}-${timestamp}`;

        try {
            // Guardar como JSON
            const jsonPath = path.join(__dirname, '..', 'data', `${filename}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(balance, null, 2));
            console.log(`💾 Balance saved to: ${jsonPath}`);

            // Guardar resumen en texto
            const textPath = path.join(__dirname, '..', 'data', `${filename}.txt`);
            let textContent = `QBTC BALANCE EXTRACTION - ${balance.metadata.extractionTime}\n`;
            textContent += '=' .repeat(60) + '\n\n';

            const b = balance.balances;
            textContent += `TOTAL WALLET BALANCE: $${b.totalWalletBalance.toLocaleString()}\n`;
            textContent += `AVAILABLE BALANCE: $${b.availableBalance.toLocaleString()}\n`;
            textContent += `TOTAL P&L: $${b.totalUnrealizedProfit.toLocaleString()}\n`;
            textContent += `MAX WITHDRAWAL: $${b.maxWithdrawAmount.toLocaleString()}\n\n`;

            if (balance.positions.length > 0) {
                textContent += 'ACTIVE POSITIONS:\n';
                balance.positions.forEach(pos => {
                    textContent += `  ${pos.symbol}: ${pos.positionAmt} @ $${pos.entryPrice} (P&L: $${pos.unRealizedProfit})\n`;
                });
            }

            fs.writeFileSync(textPath, textContent);
            console.log(`💾 Summary saved to: ${textPath}\n`);

        } catch (error) {
            console.error('❌ Error saving balance to file:', error.message);
        }
    }

    /**
     * 📈 Actualiza historial de balances
     */
    updateBalanceHistory(balance) {
        this.balanceHistory.push({
            timestamp: balance.metadata.extractionTime,
            totalBalance: balance.balances.totalWalletBalance,
            availableBalance: balance.balances.availableBalance,
            unrealizedPnL: balance.balances.totalUnrealizedProfit,
            positionsCount: balance.positions.length
        });

        // Mantener solo los últimos 10 balances
        if (this.balanceHistory.length > 10) {
            this.balanceHistory = this.balanceHistory.slice(-10);
        }

        this.lastBalance = balance;
    }

    /**
     * 📊 Muestra resumen
     */
    displaySummary(balance) {
        const b = balance.balances;

        console.log('🎯 EXTRACTION SUMMARY');
        console.log('====================');
        console.log(`✅ Balance extracted successfully`);
        console.log(`💰 Total Balance: $${b.totalWalletBalance.toLocaleString()}`);
        console.log(`📊 Active Positions: ${balance.positions.length}`);
        console.log(`🪙 Assets: ${balance.assets.length}`);
        console.log(`⏰ Extraction Time: ${balance.metadata.extractionTime}`);
        console.log(`🌐 Source: ${balance.metadata.source.toUpperCase()}\n`);

        // Comparación con balance anterior si existe
        if (this.balanceHistory.length > 1) {
            const previous = this.balanceHistory[this.balanceHistory.length - 2];
            const current = this.balanceHistory[this.balanceHistory.length - 1];

            const balanceChange = current.totalBalance - previous.totalBalance;
            const pnlChange = current.unrealizedPnL - previous.unrealizedPnL;

            console.log('📈 CHANGES SINCE LAST EXTRACTION');
            console.log('=================================');
            console.log(`Balance Change: ${balanceChange >= 0 ? '📈' : '📉'} $${balanceChange.toLocaleString()}`);
            console.log(`P&L Change: ${pnlChange >= 0 ? '🟢' : '🔴'} $${pnlChange.toLocaleString()}`);
            console.log(`Positions Change: ${current.positionsCount - previous.positionsCount}\n`);
        }
    }

    /**
     * 📋 Obtiene historial de balances
     */
    getBalanceHistory() {
        return this.balanceHistory;
    }

    /**
     * 🔍 Obtiene último balance
     */
    getLastBalance() {
        return this.lastBalance;
    }
}

// Función principal
async function main() {
    console.log('🚀 Starting QBTC Balance Extractor...\n');

    const extractor = new QBTCBalanceExtractor();

    // Parsear argumentos de línea de comandos
    const args = process.argv.slice(2);
    const options = {};

    // Procesar argumentos
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--testnet':
                options.testnet = true;
                break;
            case '--format':
                options.format = args[++i] || 'detailed';
                break;
            case '--no-save':
                options.saveToFile = false;
                break;
            case '--simple':
                options.format = 'simple';
                break;
            case '--json':
                options.format = 'json';
                break;
        }
    }

    console.log('⚙️ Options:', options);
    console.log('🔄 Extracting balance...\n');

    try {
        // Extraer balance
        const result = await extractor.extractBalance(options);

        if (!result) {
            console.log('\n❌ Balance extraction failed');
            process.exit(1);
        } else {
            console.log('\n✅ Balance extraction completed successfully');
            process.exit(0);
        }
    } catch (error) {
        console.error('\n💥 Error in main execution:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 FATAL ERROR:', error.message);
        process.exit(1);
    });
}

export default QBTCBalanceExtractor;