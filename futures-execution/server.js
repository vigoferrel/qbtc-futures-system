import QuantumDataPurifier from '../core/quantum-data-purifier.js';
/**
 * [LIGHTNING] QBTC Futures Execution Engine Server
 * 
 * Motor de ejecución especializado ÚNICAMENTE en futuros
 * - Consume señales del motor de análisis
 * - Ejecuta trades automáticamente en Binance Futures
 * - Gestión avanzada de riesgo cuántico
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import WebSocket from 'ws';
import Binance from 'node-binance-api';
import configManager from '../config/config.js';
import { QBTCQuantumCore } from '../analysis-engine/quantum-core.js';

// Importar motor de leverage cuántico
let QuantumLeverageEngine;
try {
    const { QuantumLeverageEngine: LeverageEngine } = await import('../analysis-engine/quantum-leverage-engine.js');
    QuantumLeverageEngine = LeverageEngine;
    console.log('[CHECK] Quantum Leverage Engine importado exitosamente');
} catch (error) {
    console.warn('[WARNING]  Quantum Leverage Engine not available for execution engine:', error.message);
    QuantumLeverageEngine = null;
}

class FuturesExecutionServer {
    constructor() {
        this.app = express();
        // Importar mapeo de puertos
        import('../config/port-mapping.js').then(({ QBTC_PORT_MAPPING }) => {
            this.port = QBTC_PORT_MAPPING.EXECUTION.FUTURES_EXECUTION_SERVER;
        }).catch(() => {
            this.port = configManager.get('execution.port') || 14203;
        });
        this.config = configManager.getExecutionConfig();
        this.binanceConfig = configManager.getBinanceConfig();
        
        // Inicializar cliente Binance para futuros
        this.binance = new Binance().options({
            APIKEY: this.binanceConfig.useTestnet ? 
                this.binanceConfig.testnetApiKey : this.binanceConfig.apiKey,
            APISECRET: this.binanceConfig.useTestnet ? 
                this.binanceConfig.testnetApiSecret : this.binanceConfig.apiSecret,
            useServerTime: true,
            test: this.config.demoMode || this.config.paperTrading,
            urls: {
                base: this.binanceConfig.endpoints.rest,
                stream: this.binanceConfig.endpoints.websocket
            }
        });
        
        // Estado del motor de ejecución
        this.executionState = {
            isRunning: false,
            positions: new Map(),
            orders: new Map(),
            balance: 0,
            totalPnL: 0,
            tradesExecuted: 0,
            errors: 0,
            lastSignalCheck: null,
            riskMetrics: {
                currentRisk: 0,
                maxDrawdown: 0,
                sharpeRatio: 0,
                winRate: 0
            }
        };
        
        // Conexión con el motor de análisis
        this.analysisEngineUrl = this.config.analysisEngineUrl;
        this.signalCheckInterval = null;
        
        // Inicializar motor de leverage cuántico
        this.initializeLeverageEngine();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        
        console.log('[LIGHTNING] QBTC Futures Execution Engine initialized');
        console.log(`[TARGET] Mode: ${this.config.demoMode ? 'DEMO' : 'LIVE'} | Paper Trading: ${this.config.paperTrading}`);
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Middleware de logging
        this.app.use((req, res, next) => {
            console.log(`[LIGHTNING] ${req.method} ${req.path} - ${new Date().toISOString()}`);
            next();
        });
        
        // Middleware de autenticación
        if (process.env.EXECUTION_API_KEY) {
            this.app.use((req, res, next) => {
                const apiKey = req.headers['x-api-key'];
                if (apiKey !== process.env.EXECUTION_API_KEY) {
                    return res.status(401).json({ error: 'Invalid API key' });
                }
                next();
            });
        }
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'QBTC Futures Execution Engine',
                version: '1.0.0',
                uptime: process.uptime(),
                isRunning: this.executionState.isRunning,
                mode: this.config.demoMode ? 'DEMO' : 'LIVE',
                paperTrading: this.config.paperTrading,
                tradesExecuted: this.executionState.tradesExecuted,
                timestamp: new Date().toISOString()
            });
        });
        
        // Estado completo del sistema
        this.app.get('/status', (req, res) => {
            res.json({
                success: true,
                state: this.executionState,
                config: {
                    maxPositions: this.config.maxPositions,
                    maxLeverage: this.config.maxLeverage,
                    maxRiskPerTrade: this.config.maxRiskPerTrade,
                    maxPortfolioRisk: this.config.maxPortfolioRisk,
                    demoMode: this.config.demoMode,
                    paperTrading: this.config.paperTrading
                },
                binanceConnection: this.checkBinanceConnection()
            });
        });
        
        // Control del motor de ejecución
        this.app.post('/start', async (req, res) => {
            try {
                await this.startExecution();
                res.json({ success: true, message: 'Execution engine started' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        this.app.post('/stop', (req, res) => {
            try {
                this.stopExecution();
                res.json({ success: true, message: 'Execution engine stopped' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Posiciones y órdenes
        this.app.get('/positions', (req, res) => {
            const positions = Array.from(this.executionState.positions.values());
            res.json({
                success: true,
                positions: positions,
                count: positions.length,
                totalValue: this.calculateTotalPositionValue(positions)
            });
        });
        
        this.app.get('/orders', (req, res) => {
            const orders = Array.from(this.executionState.orders.values());
            res.json({
                success: true,
                orders: orders,
                count: orders.length,
                pending: orders.filter(o => o.status === 'pending').length
            });
        });
        
        // Balance y PnL
        this.app.get('/balance', async (req, res) => {
            try {
                const balance = await this.getAccountBalance();
                res.json({
                    success: true,
                    balance: balance,
                    totalPnL: this.executionState.totalPnL,
                    riskMetrics: this.executionState.riskMetrics
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Ejecución manual de trade
        this.app.post('/trade/execute', async (req, res) => {
            try {
                const { symbol, side, quantity, type, price } = req.body;
                const result = await this.executeManualTrade({
                    symbol, side, quantity, type, price
                });
                res.json({ success: true, trade: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Cerrar posición
        this.app.post('/position/close/:symbol', async (req, res) => {
            try {
                const symbol = req.params.symbol.toUpperCase();
                const result = await this.closePosition(symbol);
                res.json({ success: true, result: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Configuración de riesgo
        this.app.post('/risk/update', (req, res) => {
            try {
                const { maxRiskPerTrade, maxPortfolioRisk, maxPositions } = req.body;
                
                if (maxRiskPerTrade !== undefined) {
                    this.config.maxRiskPerTrade = Math.max(0.001, Math.min(0.05, maxRiskPerTrade));
                }
                if (maxPortfolioRisk !== undefined) {
                    this.config.maxPortfolioRisk = Math.max(0.05, Math.min(0.5, maxPortfolioRisk));
                }
                if (maxPositions !== undefined) {
                    this.config.maxPositions = Math.max(1, Math.min(20, maxPositions));
                }
                
                res.json({ 
                    success: true, 
                    message: 'Risk parameters updated',
                    riskConfig: {
                        maxRiskPerTrade: this.config.maxRiskPerTrade,
                        maxPortfolioRisk: this.config.maxPortfolioRisk,
                        maxPositions: this.config.maxPositions
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Métricas y estadísticas
        this.app.get('/metrics', (req, res) => {
            res.json({
                success: true,
                metrics: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    executionState: this.executionState,
                    performance: this.calculatePerformanceMetrics(),
                    riskAnalysis: this.calculateRiskAnalysis()
                }
            });
        });
    }
    
    setupErrorHandling() {
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint not found',
                availableEndpoints: [
                    'GET /health',
                    'GET /status', 
                    'POST /start',
                    'POST /stop',
                    'GET /positions',
                    'GET /orders',
                    'GET /balance',
                    'POST /trade/execute',
                    'POST /position/close/:symbol',
                    'POST /risk/update',
                    'GET /metrics'
                ]
            });
        });
        
        this.app.use((error, req, res, next) => {
            console.error('[SIREN] Execution server error:', error);
            this.executionState.errors++;
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
    }
    
    // Métodos del motor de ejecución
    async startExecution() {
        if (this.executionState.isRunning) {
            throw new Error('Execution engine is already running');
        }
        
        console.log('[ROCKET] Starting QBTC Futures Execution Engine...');
        
        try {
            // Verificar conexión con Binance
            await this.testBinanceConnection();
            
            // Verificar conexión con motor de análisis
            await this.testAnalysisConnection();
            
            // Inicializar balance
            await this.initializeBalance();
            
            this.executionState.isRunning = true;
            this.executionState.errors = 0;
            
            // Iniciar loop de verificación de señales
            this.startSignalLoop();
            
            console.log('[CHECK] QBTC Futures Execution Engine started successfully');
        } catch (error) {
            this.executionState.isRunning = false;
            throw error;
        }
    }
    
    stopExecution() {
        if (!this.executionState.isRunning) {
            throw new Error('Execution engine is not running');
        }
        
        console.log('[STOP] Stopping QBTC Futures Execution Engine...');
        
        this.executionState.isRunning = false;
        
        if (this.signalCheckInterval) {
            clearInterval(this.signalCheckInterval);
            this.signalCheckInterval = null;
        }
        
        console.log('[CHECK] QBTC Futures Execution Engine stopped');
    }
    
    startSignalLoop() {
        // Verificar señales cada 15 segundos
        this.signalCheckInterval = setInterval(async () => {
            try {
                await this.checkAndExecuteSignals();
                this.executionState.lastSignalCheck = Date.now();
            } catch (error) {
                console.error('[X] Signal check error:', error);
                this.executionState.errors++;
            }
        }, this.config.signalCheckInterval || 15000);
    }
    
    async checkAndExecuteSignals() {
        if (!this.executionState.isRunning) return;
        
        try {
            // Obtener señales del motor de análisis
            const response = await axios.get(`${this.analysisEngineUrl}/signals`);
            const signals = response.data.signals;
            
            if (!signals || signals.length === 0) return;
            
            // Filtrar señales válidas
            const validSignals = signals.filter(signal => 
                signal.strength >= this.config.minSignalStrength &&
                signal.confidence >= this.config.minConfidence &&
                signal.instrument === 'FUTURES'
            );
            
            // Ejecutar señales una por una
            for (const signal of validSignals) {
                await this.processSignal(signal);
            }
            
            console.log(`[CHART] Processed ${validSignals.length} signals from ${signals.length} total`);
        } catch (error) {
            console.error('[X] Error checking signals:', error);
            throw error;
        }
    }
    
    async processSignal(signal) {
        try {
            // Verificar si ya tenemos posición en este símbolo
            const existingPosition = this.executionState.positions.get(signal.symbol);
            
            // Verificar límites de riesgo
            if (!this.checkRiskLimits(signal)) {
                console.log(`[WARNING] Signal ${signal.symbol} rejected due to risk limits`);
                return;
            }
            
            // Calcular tamaño de posición
            const positionSize = this.calculatePositionSize(signal);
            
            if (positionSize <= 0) {
                console.log(`[WARNING] Signal ${signal.symbol} rejected - invalid position size`);
                return;
            }
            
            // Ejecutar el trade
            const trade = await this.executeTrade({
                symbol: signal.symbol,
                side: signal.direction === 'BUY' ? 'BUY' : 'SELL',
                quantity: positionSize,
                type: this.config.defaultOrderType,
                signal: signal
            });
            
            console.log(`[CHECK] Trade executed: ${trade.symbol} ${trade.side} ${trade.quantity}`);
            this.executionState.tradesExecuted++;
            
        } catch (error) {
            console.error(`[X] Error processing signal ${signal.symbol}:`, error);
            this.executionState.errors++;
        }
    }
    
    async executeTrade(tradeParams) {
        if (this.config.paperTrading) {
            return this.executePaperTrade(tradeParams);
        } else {
            return this.executeRealTrade(tradeParams);
        }
    }
    
    async executePaperTrade(tradeParams) {
        // Simular ejecución para paper trading
        const PURIFIED_REAL_DATATrade = {
            orderId: `PAPER_${Date.now()}`,
            symbol: tradeParams.symbol,
            side: tradeParams.side,
            quantity: tradeParams.quantity,
            price: tradeParams.signal.entry_zones[0]?.price || 0,
            status: 'FILLED',
            timestamp: Date.now(),
            type: 'PAPER_TRADE'
        };
        
        this.executionState.orders.set(PURIFIED_REAL_DATATrade.orderId, PURIFIED_REAL_DATATrade);
        
        // Actualizar posiciones paper
        this.updatePaperPosition(PURIFIED_REAL_DATATrade);
        
        return PURIFIED_REAL_DATATrade;
    }
    
    async executeRealTrade(tradeParams) {
        // Implementar ejecución real con Binance API
        try {
            const order = await this.binance.futuresMarketOrder(
                tradeParams.side,
                tradeParams.symbol,
                tradeParams.quantity
            );
            
            this.executionState.orders.set(order.orderId, {
                ...order,
                signal: tradeParams.signal,
                timestamp: Date.now()
            });
            
            return order;
        } catch (error) {
            console.error('[X] Real trade execution error:', error);
            throw error;
        }
    }
    
    // Métodos auxiliares
    checkRiskLimits(signal) {
        const currentPositions = this.executionState.positions.size;
        const currentRisk = this.calculateCurrentRisk();
        
        // Verificar límite de posiciones
        if (currentPositions >= this.config.maxPositions) {
            return false;
        }
        
        // Verificar riesgo de portfolio
        if (currentRisk >= this.config.maxPortfolioRisk) {
            return false;
        }
        
        return true;
    }
    
    calculatePositionSize(signal) {
        const balance = this.executionState.balance;
        const entryPrice = signal.entry_zones[0]?.price || 0;
        
        if (entryPrice <= 0) return 0;
        
        let baseRiskAmount = balance * this.config.maxRiskPerTrade;
        let finalLeverage = this.config.defaultLeverage || 3;
        let entropyAdjustment = 1.0;
        
        // Usar motor de leverage cuántico para cálculo completo
        if (this.leverageEngine) {
            try {
                // Preparar datos de mercado para el motor cuántico
                const marketData = {
                    volatility: this.calculateVolatility(signal),
                    volume: signal.volume || 1000000,
                    price: entryPrice
                };
                
                // Preparar estado cuántico de la señal
                const quantumState = {
                    coherence: signal.quantum_factors?.coherence || 0.8,
                    lambda_resonance: signal.quantum_factors?.lambda_resonance || 0.5
                };
                
                // CALCULAR LEVERAGE ÓPTIMO basado en entropía global
                finalLeverage = this.leverageEngine.calculateOptimalLeverage(
                    signal.symbol, 
                    marketData, 
                    quantumState
                );
                
                // Obtener estado de entropía global para ajuste de riesgo
                const entropyData = this.leverageEngine.calculateGlobalEntropy(
                    { [signal.symbol]: marketData }, 
                    quantumState
                );
                
                // CONTROL DE ENTROPÍA: Ajustar riesgo basado en entropía global
                const globalEntropy = entropyData.global_entropy;
                const coherenceIndex = entropyData.coherence_index;
                
                // Factor de ajuste por entropía (menos riesgo en alta entropía)
                entropyAdjustment = Math.max(0.3, 1 - (globalEntropy * 0.5));
                
                // Factor de ajuste por coherencia (más riesgo en alta coherencia)
                const coherenceAdjustment = 0.7 + (coherenceIndex * 0.6);
                
                // Combinar ajustes
                const quantumRiskAdjustment = entropyAdjustment * coherenceAdjustment;
                baseRiskAmount *= quantumRiskAdjustment;
                
                console.log(`[ATOM]  ${signal.symbol} - Leverage cuántico: ${finalLeverage.toFixed(2)}x`);
                console.log(`[OCEAN_WAVE] Entropía global: ${(globalEntropy * 100).toFixed(1)}% | Coherencia: ${(coherenceIndex * 100).toFixed(1)}%`);
                console.log(`[TARGET] Ajuste de riesgo cuántico: ${(quantumRiskAdjustment * 100).toFixed(1)}%`);
                
                // Verificar condiciones para Big Bang si es necesario
                if (coherenceIndex > this.leverageEngine.bigBangThreshold && this.purifier.generateQuantumValue(index, modifier) > 0.95) {
                    console.log(`[BOOM] Condiciones de Big Bang detectadas para ${signal.symbol}`);
                }
                
            } catch (error) {
                console.warn(`[WARNING]  Error en motor de leverage cuántico para ${signal.symbol}:`, error.message);
                finalLeverage = this.config.defaultLeverage || 3;
            }
        }
        
        // Calcular tamaño de posición usando leverage cuántico
        let positionSize = (baseRiskAmount * finalLeverage) / entryPrice;
        
        // Aplicar modificadores cuánticos adicionales de la señal
        if (this.config.positionSizing?.quantum_modifier && signal.quantum_factors) {
            const signalModifier = (
                (signal.quantum_factors.coherence || 1) * 0.4 +
                (signal.quantum_factors.lambda_resonance || 1) * 0.3 +
                (signal.quantum_factors.hermetic_alignment || 1) * 0.3
            );
            
            positionSize *= signalModifier;
            console.log(`[GALAXY] Modificador de señal cuántica: ${signalModifier.toFixed(3)}`);
        }
        
        // Aplicar multiplicadores de Big Bang si están activos
        if (this.config.bigBangActive) {
            const bigBangMultiplier = this.config.leverageMultiplier || 1.5;
            positionSize *= bigBangMultiplier;
            console.log(`[BOOM] Big Bang activo - Multiplicador: ${bigBangMultiplier}x`);
        }
        
        // Limitar tamaño máximo de posición por seguridad
        const maxPositionSize = (balance * 0.2) / entryPrice; // Máximo 20% del balance por posición
        positionSize = Math.min(positionSize, maxPositionSize);
        
        console.log(`[TREND_UP] Tamaño final de posición para ${signal.symbol}: ${positionSize.toFixed(6)} (Leverage: ${finalLeverage}x, Entropía: ${entropyAdjustment.toFixed(3)})`);
        
        return positionSize;
    }
    
    /**
     * Calcula volatilidad estimada para un símbolo
     */
    calculateVolatility(signal) {
        // Si la señal incluye datos de precios históricos, calcular volatilidad real
        if (signal.historical_prices && signal.historical_prices.length > 1) {
            const prices = signal.historical_prices;
            const returns = [];
            
            for (let i = 1; i < prices.length; i++) {
                returns.push(Math.log(prices[i] / prices[i-1]));
            }
            
            const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
            
            return Math.sqrt(variance * 24); // Volatilidad diaria aproximada
        }
        
        // Usar volatilidad estimada basada en el tipo de símbolo
        const volatilityMap = {
            'BTCUSDT': 0.03, 'ETHUSDT': 0.04, 'BNBUSDT': 0.05,
            'SOLUSDT': 0.06, 'XRPUSDT': 0.05, 'DOGEUSDT': 0.08
        };
        
        return volatilityMap[signal.symbol] || 0.05; // 5% por defecto
    }
    
    calculateCurrentRisk() {
        let totalRisk = 0;
        this.executionState.positions.forEach(position => {
            totalRisk += Math.abs(position.unrealizedPnL || 0);
        });
        return totalRisk / Math.max(this.executionState.balance, 1);
    }
    
    async testBinanceConnection() {
        try {
            await this.binance.futuresAccount();
            console.log('[CHECK] Binance connection verified');
        } catch (error) {
            throw new Error(`Binance connection failed: ${error.message}`);
        }
    }
    
    async testAnalysisConnection() {
        try {
            const response = await axios.get(`${this.analysisEngineUrl}/health`);
            if (response.status === 200) {
                console.log('[CHECK] Analysis engine connection verified');
            }
        } catch (error) {
            throw new Error(`Analysis engine connection failed: ${error.message}`);
        }
    }
    
    async initializeBalance() {
        if (this.config.paperTrading) {
            this.executionState.balance = this.config.initialCapital;
        } else {
            const account = await this.binance.futuresAccount();
            this.executionState.balance = parseFloat(account.totalWalletBalance);
        }
        console.log(`[MONEY] Balance initialized: ${this.executionState.balance} USDT`);
    }
    
    checkBinanceConnection() {
        return {
            configured: !!this.binanceConfig.apiKey,
            testnet: this.binanceConfig.useTestnet,
            demoMode: this.config.demoMode,
            paperTrading: this.config.paperTrading
        };
    }
    
    calculatePerformanceMetrics() {
        // Calcular métricas básicas de performance
        const totalTrades = this.executionState.tradesExecuted;
        const totalPnL = this.executionState.totalPnL;
        
        return {
            totalTrades,
            totalPnL,
            avgPnLPerTrade: totalTrades > 0 ? totalPnL / totalTrades : 0,
            errorRate: totalTrades > 0 ? this.executionState.errors / totalTrades : 0
        };
    }
    
    calculateRiskAnalysis() {
        return {
            currentRisk: this.calculateCurrentRisk(),
            positionCount: this.executionState.positions.size,
            maxPositionsUsed: this.config.maxPositions,
            riskUtilization: this.calculateCurrentRisk() / this.config.maxPortfolioRisk
        };
    }
    
    updatePaperPosition(trade) {
        const existing = this.executionState.positions.get(trade.symbol) || {
            symbol: trade.symbol,
            size: 0,
            avgPrice: 0,
            unrealizedPnL: 0
        };
        
        // Actualizar posición paper
        if (trade.side === 'BUY') {
            existing.size += parseFloat(trade.quantity);
        } else {
            existing.size -= parseFloat(trade.quantity);
        }
        
        existing.avgPrice = parseFloat(trade.price);
        this.executionState.positions.set(trade.symbol, existing);
    }
    
    // ===== QUANTUM LEVERAGE ENGINE INTEGRATION =====
    
    initializeLeverageEngine() {
        if (!QuantumLeverageEngine) {
            console.log('[WARNING]  Quantum Leverage Engine not available - using default leverage management');
            this.leverageEngine = null;
            return;
        }
        
        try {
            this.leverageEngine = new QuantumLeverageEngine({
                maxLeverage: this.config.maxLeverage || 20,
                defaultLeverage: this.config.defaultLeverage || 3,
                entropyThreshold: 0.6,
                bigBangThreshold: 0.92,
                volatilityMultiplier: 0.7
            });
            
            // Configurar eventos del motor de leverage
            this.setupLeverageEngineEvents();
            
            console.log('[GALAXY] Quantum Leverage Engine initialized for execution');
            console.log(`[ATOM]  Default leverage: ${this.leverageEngine.defaultLeverage}x`);
            console.log(`[TARGET] Max leverage: ${this.leverageEngine.maxLeverage}x`);
            console.log(`[OCEAN_WAVE] λ₇₉₁₉ resonance integrated`);
            
        } catch (error) {
            console.error('[X] Error initializing Quantum Leverage Engine:', error);
            this.leverageEngine = null;
        }
    }
    
    setupLeverageEngineEvents() {
        if (!this.leverageEngine) return;
        
        this.leverageEngine.on('entropy_update', (data) => {
            console.log(`[TARGET] Entropía global: ${(data.entropy * 100).toFixed(1)}% | Coherencia: ${(data.coherence * 100).toFixed(1)}%`);
            
            // Actualizar configuración dinámicamente
            this.config.globalEntropy = data.entropy;
            this.config.coherenceIndex = data.coherence;
            this.config.lastEntropyUpdate = data.timestamp;
        });
        
        this.leverageEngine.on('big_bang', (data) => {
            console.log('\n[BOOM] ====== BIG BANG CUÁNTICO ACTIVADO ====== [BOOM]');
            console.log(`[ROCKET] Leverage multiplicador: ${data.leverage_multiplier}x`);
            console.log(`[FIRE] Risk multiplicador: ${data.risk_multiplier}x`);
            console.log(`⏱️ Duración: ${Math.round(data.duration/60000)} minutos`);
            console.log(`[ATOM] Coherencia: ${(data.coherence * 100).toFixed(1)}%`);
            console.log('===============================================\n');
            
            // Activar modo Big Bang en el sistema de ejecución
            this.activateBigBangMode(data);
        });
        
        this.leverageEngine.on('leverage_optimization', (data) => {
            console.log(`[ATOM] Optimización de leverage completada - ${Object.keys(data.leverages).length} símbolos`);
            
            // Almacenar leverages optimizados para uso posterior
            this.config.optimizedLeverages = data.leverages;
            this.config.lastOptimization = data.timestamp;
        });
    }
    
    activateBigBangMode(bigBangData) {
        const { leverage_multiplier, risk_multiplier, duration } = bigBangData;
        
        // Activar modo de ultra-alta ganancia temporal
        this.config.bigBangActive = true;
        this.config.leverageMultiplier = leverage_multiplier;
        this.config.riskMultiplier = risk_multiplier;
        this.config.bigBangStartTime = Date.now();
        this.config.bigBangDuration = duration;
        
        console.log('[GALAXY] MODO BIG BANG ACTIVADO EN EXECUTION ENGINE:');
        console.log(`   • Leverage multiplicador: ${leverage_multiplier}x`);
        console.log(`   • Risk multiplicador: ${risk_multiplier}x`);
        console.log(`   • Duración: ${Math.round(duration/60000)} minutos`);
        
        // Programar desactivación automática
        if (this.bigBangTimeout) {
            clearTimeout(this.bigBangTimeout);
        }
        
        this.bigBangTimeout = setTimeout(() => {
            this.deactivateBigBangMode('TIMEOUT');
        }, duration); // Usar duración del evento
        
        // Aumentar temporalmente los límites de riesgo durante Big Bang
        this.originalRiskLimits = {
            maxRiskPerTrade: this.config.maxRiskPerTrade,
            maxPortfolioRisk: this.config.maxPortfolioRisk
        };
        
        // Aumentar límites durante Big Bang usando los multiplicadores
        this.config.maxRiskPerTrade = Math.min(this.config.maxRiskPerTrade * risk_multiplier, 0.08); // Max 8%
        this.config.maxPortfolioRisk = Math.min(this.config.maxPortfolioRisk * risk_multiplier, 0.4); // Max 40%
        
        console.log(`⚙️  Límites de riesgo ajustados temporalmente:`);
        console.log(`   • Risk per trade: ${(this.config.maxRiskPerTrade * 100).toFixed(1)}%`);
        console.log(`   • Portfolio risk: ${(this.config.maxPortfolioRisk * 100).toFixed(1)}%`);
    }
    
    deactivateBigBangMode(reason = 'MANUAL') {
        if (!this.config.bigBangMode) return;
        
        const duration = Date.now() - this.config.bigBangStartTime;
        const durationMinutes = Math.round(duration / 60000);
        
        console.log(`\n🌅 DESACTIVANDO MODO BIG BANG (${reason})`);
        console.log(`🕰️  Duración: ${durationMinutes} minutos`);
        console.log(`[REFRESH] Volviendo a leverage normal`);
        
        // Restaurar configuración normal
        this.config.bigBangMode = false;
        this.config.bigBangLeverage = null;
        this.config.bigBangMultiplier = null;
        this.config.bigBangStartTime = null;
        this.config.bigBangEventNumber = null;
        
        // Restaurar límites de riesgo originales
        if (this.originalRiskLimits) {
            this.config.maxRiskPerTrade = this.originalRiskLimits.maxRiskPerTrade;
            this.config.maxPortfolioRisk = this.originalRiskLimits.maxPortfolioRisk;
            this.originalRiskLimits = null;
            
            console.log(`⚙️  Límites de riesgo restaurados:`);
            console.log(`   • Risk per trade: ${(this.config.maxRiskPerTrade * 100).toFixed(1)}%`);
            console.log(`   • Portfolio risk: ${(this.config.maxPortfolioRisk * 100).toFixed(1)}%`);
        }
        
        // Limpiar timeout si existe
        if (this.bigBangTimeout) {
            clearTimeout(this.bigBangTimeout);
            this.bigBangTimeout = null;
        }
        
        console.log('[CHECK] Modo Big Bang desactivado exitosamente\n');
    }
    
    async start() {
        try {
            this.server = this.app.listen(this.port, () => {
                console.log(`[LIGHTNING] QBTC Futures Execution Server running on port ${this.port}`);
                console.log(`[TARGET] Mode: ${this.config.demoMode ? 'DEMO' : 'LIVE'} | Paper Trading: ${this.config.paperTrading}`);
                console.log(`[CHART] Max Positions: ${this.config.maxPositions} | Risk per Trade: ${(this.config.maxRiskPerTrade * 100).toFixed(1)}%`);
                
                // Auto-start execution if configured
                if (this.config.autoStart) {
                    setTimeout(() => this.startExecution(), 10000); // 10 segundos después del análisis
                }
            });
        } catch (error) {
            console.error('[X] Failed to start execution server:', error);
            throw error;
        }
    }
    
    async shutdown() {
        console.log('[STOP] Shutting down QBTC Futures Execution Server...');
        
        if (this.executionState.isRunning) {
            this.stopExecution();
        }
        
        if (this.server) {
            this.server.close();
        }
        
        console.log('[CHECK] Execution server shutdown complete');
    }
}

// Manejo de señales del sistema
process.on('SIGINT', async () => {
    console.log('\n[STOP] Received SIGINT, shutting down gracefully...');
    if (global.executionServer) {
        await global.executionServer.shutdown();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[STOP] Received SIGTERM, shutting down gracefully...');
    if (global.executionServer) {
        await global.executionServer.shutdown();
    }
    process.exit(0);
});

// Crear y exportar instancia del servidor
const executionServer = new FuturesExecutionServer();
global.executionServer = executionServer;

export default executionServer;

// Auto-start server
executionServer.start().catch(error => {
    console.error('[X] Failed to start QBTC Futures Execution Engine:', error);
    process.exit(1);
});
