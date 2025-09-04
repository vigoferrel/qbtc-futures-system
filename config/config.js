/**
 * [WRENCH] Configuration Management
 * 
 * Gestión centralizada de configuración para todo el sistema
 */

import dotenv from 'dotenv';
import { QUANTUM_CONSTANTS, ANALYSIS_CONFIG, EXECUTION_CONFIG, ENDPOINTS } from './constants.js';
import { TRADING_MODES, ALL_SYMBOLS } from './symbols-extended.esm.js';

// Cargar variables de entorno
dotenv.config();

class ConfigManager {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.isProduction = this.environment === 'production';
        this.isTestnet = process.env.USE_TESTNET === 'true' || !this.isProduction;
        
        this.loadConfiguration();
        this.validateConfiguration();
    }
    
    loadConfiguration() {
        this.config = {
            // Configuración del sistema
            system: {
                environment: this.environment,
                isProduction: this.isProduction,
                isTestnet: this.isTestnet,
                logLevel: process.env.LOG_LEVEL || 'info'
            },
            
            // APIs de Binance
            binance: {
                apiKey: process.env.BINANCE_API_KEY || '',
                apiSecret: process.env.BINANCE_API_SECRET || '',
                testnetApiKey: process.env.BINANCE_TESTNET_API_KEY || '',
                testnetApiSecret: process.env.BINANCE_TESTNET_API_SECRET || '',
                useTestnet: this.isTestnet,
                endpoints: this.isTestnet ? {
                    rest: ENDPOINTS.BINANCE.TESTNET_REST,
                    websocket: ENDPOINTS.BINANCE.TESTNET_WS
                } : {
                    rest: ENDPOINTS.BINANCE.REST,
                    websocket: ENDPOINTS.BINANCE.WEBSOCKET
                }
            },
            
            // Configuración del motor de análisis
            analysis: {
                ...ANALYSIS_CONFIG,
                port: parseInt(process.env.ANALYSIS_PORT) || 4001,
                enableCaching: process.env.ENABLE_ANALYSIS_CACHE !== 'false',
                cacheRedisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
                
                // MODO EXTREMO ACTIVADO - 77 símbolos de máxima cobertura
                MODE: "EXTREME",
                symbols: process.env.ANALYSIS_SYMBOLS ? 
                    process.env.ANALYSIS_SYMBOLS.split(',') : 
                    ALL_SYMBOLS, // 77 símbolos completos
                
                timeframes: process.env.ANALYSIS_TIMEFRAMES ?
                    process.env.ANALYSIS_TIMEFRAMES.split(',') :
                    QUANTUM_CONSTANTS.TIMEFRAMES,
                
                // Configuración de thresholds ajustada para modo EXTREMO
                minCoherence: parseFloat(process.env.MIN_COHERENCE) || 0.45,
                minSignalStrength: parseFloat(process.env.MIN_SIGNAL_STRENGTH) || 0.6,
                minConfidence: parseFloat(process.env.MIN_CONFIDENCE) || 0.55
            },
            
            // Configuración del motor de ejecución
            execution: {
                ...EXECUTION_CONFIG,
                port: parseInt(process.env.EXECUTION_PORT) || 4002,
                analysisEngineUrl: process.env.ANALYSIS_ENGINE_URL || ENDPOINTS.ANALYSIS_ENGINE,
                
                // Configuración de riesgo
                maxPositions: parseInt(process.env.MAX_POSITIONS) || EXECUTION_CONFIG.MAX_POSITIONS,
                maxLeverage: parseInt(process.env.MAX_LEVERAGE) || EXECUTION_CONFIG.MAX_LEVERAGE,
                maxRiskPerTrade: parseFloat(process.env.MAX_RISK_PER_TRADE) || EXECUTION_CONFIG.MAX_RISK_PER_TRADE,
                maxPortfolioRisk: parseFloat(process.env.MAX_PORTFOLIO_RISK) || EXECUTION_CONFIG.MAX_PORTFOLIO_RISK,
                maxDrawdown: parseFloat(process.env.MAX_DRAWDOWN) || EXECUTION_CONFIG.MAX_DRAWDOWN,
                
                // Configuración de capital
                initialCapital: parseFloat(process.env.INITIAL_CAPITAL) || 10000,
                baseCurrency: process.env.BASE_CURRENCY || 'USDT',
                
                // Configuración de órdenes
                defaultOrderType: process.env.DEFAULT_ORDER_TYPE || EXECUTION_CONFIG.DEFAULT_ORDER_TYPE,
                
                // Modo demo/live
                demoMode: process.env.DEMO_MODE === 'true' || !this.isProduction,
                paperTrading: process.env.PAPER_TRADING === 'true'
            },
            
            // Configuración de logging
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
                logDirectory: process.env.LOG_DIRECTORY || './logs',
                maxLogFiles: parseInt(process.env.MAX_LOG_FILES) || 10,
                maxLogSize: process.env.MAX_LOG_SIZE || '10m'
            },
            
            // Configuración de monitoreo
            monitoring: {
                enableMetrics: process.env.ENABLE_METRICS !== 'false',
                metricsPort: parseInt(process.env.METRICS_PORT) || 9090,
                enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
                healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
            },
            
            // Constantes cuánticas (no modificables desde env)
            quantum: QUANTUM_CONSTANTS
        };
    }
    
    validateConfiguration() {
        const errors = [];
        
        // Validar APIs de Binance
        if (this.config.execution.demoMode === false) {
            if (!this.config.binance.apiKey) {
                errors.push('BINANCE_API_KEY is required for live trading');
            }
            if (!this.config.binance.apiSecret) {
                errors.push('BINANCE_API_SECRET is required for live trading');
            }
        }
        
        // Validar configuración de riesgo
        if (this.config.execution.maxRiskPerTrade <= 0 || this.config.execution.maxRiskPerTrade > 0.1) {
            errors.push('MAX_RISK_PER_TRADE must be between 0 and 0.1 (10%)');
        }
        
        if (this.config.execution.maxPortfolioRisk <= 0 || this.config.execution.maxPortfolioRisk > 0.5) {
            errors.push('MAX_PORTFOLIO_RISK must be between 0 and 0.5 (50%)');
        }
        
        if (this.config.execution.maxLeverage < 1 || this.config.execution.maxLeverage > 25) {
            errors.push('MAX_LEVERAGE must be between 1 and 25');
        }
        
        // Validar thresholds de análisis
        if (this.config.analysis.minCoherence < 0 || this.config.analysis.minCoherence > 1) {
            errors.push('MIN_COHERENCE must be between 0 and 1');
        }
        
        if (errors.length > 0) {
            console.error('[X] Configuration validation failed:');
            errors.forEach(error => console.error(`   - ${error}`));
            throw new Error('Invalid configuration');
        }
        
        console.log('[CHECK] Configuration validated successfully');
        
        // Log configuración importante (sin secrets)
        console.log('[CLIPBOARD] Configuration Summary:');
        console.log(`   Environment: ${this.config.system.environment}`);
        console.log(`   Testnet: ${this.config.binance.useTestnet}`);
        console.log(`   Demo Mode: ${this.config.execution.demoMode}`);
        console.log(`   Paper Trading: ${this.config.execution.paperTrading}`);
        console.log(`   Analysis Symbols: ${this.config.analysis.symbols.length}`);
        console.log(`   Max Positions: ${this.config.execution.maxPositions}`);
        console.log(`   Max Risk per Trade: ${(this.config.execution.maxRiskPerTrade * 100).toFixed(1)}%`);
    }
    
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }
    
    getAnalysisConfig() {
        return this.config.analysis;
    }
    
    getExecutionConfig() {
        return this.config.execution;
    }
    
    getBinanceConfig() {
        return this.config.binance;
    }
    
    getQuantumConstants() {
        return this.config.quantum;
    }
    
    // Métodos para actualización en runtime (solo para configuraciones seguras)
    updateAnalysisThreshold(key, value) {
        if (['minCoherence', 'minSignalStrength', 'minConfidence'].includes(key)) {
            this.config.analysis[key] = value;
            console.log(`[CHART] Updated analysis threshold ${key}: ${value}`);
            return true;
        }
        return false;
    }
    
    updateRiskParameter(key, value) {
        const allowedParams = ['maxRiskPerTrade', 'maxPortfolioRisk', 'maxPositions'];
        if (allowedParams.includes(key)) {
            this.config.execution[key] = value;
            console.log(`[WARNING] Updated risk parameter ${key}: ${value}`);
            return true;
        }
        return false;
    }
}

// Instancia singleton
const configManager = new ConfigManager();

export default configManager;
export { ConfigManager };
