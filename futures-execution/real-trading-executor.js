import BinanceRealConnector from '../analysis-engine/binance-real-connector.js';
import QuantumDataPurifier from '../core/quantum-data-purifier.js';
import { QUANTUM_CONSTANTS } from '../config/constants.js';

/**
 * 🚀 REAL TRADING EXECUTOR
 * ========================
 * 
 * Ejecutor de trading real que integra señales cuánticas con Binance
 * para ejecutar órdenes reales de Futures
 */

export class RealTradingExecutor {
    constructor(config = {}) {
        this.config = {
            // Configuración de trading
            maxPositions: config.maxPositions || 8,
            maxRiskPerTrade: config.maxRiskPerTrade || 0.035, // 3.5%
            maxDailyLoss: config.maxDailyLoss || 0.05, // 5%
            minConfidence: config.minConfidence || 0.7, // 70%
            
            // Configuración de órdenes
            defaultLeverage: config.defaultLeverage || 3,
            maxLeverage: config.maxLeverage || 15,
            useStopLoss: config.useStopLoss !== false,
            useTakeProfit: config.useTakeProfit !== false,
            
            // Configuración de riesgo
            stopLossPercentage: config.stopLossPercentage || 0.02, // 2%
            takeProfitPercentage: config.takeProfitPercentage || 0.04, // 4%
            
            // Configuración de Binance
            testnet: config.testnet || false,
            symbols: config.symbols || QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.slice(0, 20)
        };
        
        // Conector de Binance
        this.binanceConnector = new BinanceRealConnector({
            testnet: this.config.testnet,
            symbols: this.config.symbols
        });
        
        // Quantum Data Purifier
        this.quantumPurifier = new QuantumDataPurifier();
        
        // Estado del sistema
        this.isInitialized = false;
        this.accountBalance = 0;
        this.dailyPnL = 0;
        this.totalTrades = 0;
        this.winningTrades = 0;
        this.activePositions = new Map();
        this.tradeHistory = [];
        
        // Métricas de performance
        this.performanceMetrics = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            winRate: 0,
            averageWin: 0,
            averageLoss: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            sharpeRatio: 0
        };
        
        console.log('[REAL-TRADING] Real Trading Executor inicializado');
        console.log(`💰 Max Risk per Trade: ${(this.config.maxRiskPerTrade * 100).toFixed(1)}%`);
        console.log(`📊 Max Positions: ${this.config.maxPositions}`);
        console.log(`🎯 Min Confidence: ${(this.config.minConfidence * 100).toFixed(1)}%`);
        console.log(`🧪 Testnet: ${this.config.testnet ? 'SÍ' : 'NO'}`);
    }
    
    /**
     * Inicializa el ejecutor de trading
     */
    async initialize() {
        try {
            console.log('[REAL-TRADING] Inicializando ejecutor de trading...');
            
            // Conectar a Binance
            await this.binanceConnector.getAccountInfo();
            
            if (this.binanceConnector.isAuthenticated) {
                this.accountBalance = parseFloat(this.binanceConnector.accountInfo.totalWalletBalance);
                console.log(`[REAL-TRADING] ✅ Cuenta autenticada - Balance: ${this.accountBalance} USDT`);
                
                // Obtener posiciones activas
                await this.updateActivePositions();
                
                // Conectar WebSockets
                this.binanceConnector.connectWebSocket();
                
                this.isInitialized = true;
                console.log('[REAL-TRADING] ✅ Ejecutor de trading inicializado');
            } else {
                console.warn('[REAL-TRADING] ⚠️ Solo modo READ-ONLY disponible');
            }
            
        } catch (error) {
            console.error('[REAL-TRADING] Error inicializando:', error.message);
            throw error;
        }
    }
    
    /**
     * Actualiza posiciones activas
     */
    async updateActivePositions() {
        try {
            const positions = await this.binanceConnector.getOpenPositions();
            
            this.activePositions.clear();
            positions.forEach(pos => {
                this.activePositions.set(pos.symbol, {
                    symbol: pos.symbol,
                    side: parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT',
                    quantity: Math.abs(parseFloat(pos.positionAmt)),
                    entryPrice: parseFloat(pos.entryPrice),
                    markPrice: parseFloat(pos.markPrice),
                    unrealizedPnL: parseFloat(pos.unrealizedPnl),
                    leverage: parseFloat(pos.leverage)
                });
            });
            
            console.log(`[REAL-TRADING] 📊 ${this.activePositions.size} posiciones activas`);
            
        } catch (error) {
            console.error('[REAL-TRADING] Error actualizando posiciones:', error.message);
        }
    }
    
    /**
     * Ejecuta una señal de trading
     */
    async executeTradeSignal(signal) {
        if (!this.isInitialized) {
            throw new Error('Ejecutor de trading no inicializado');
        }
        
        const {
            symbol,
            side, // 'LONG' o 'SHORT'
            confidence,
            entryPrice,
            stopLoss,
            takeProfit,
            leverage = this.config.defaultLeverage,
            strategy = 'QUANTUM'
        } = signal;
        
        try {
            console.log(`[REAL-TRADING] 🎯 Procesando señal: ${symbol} ${side}`);
            console.log(`📊 Confianza: ${(confidence * 100).toFixed(1)}%`);
            console.log(`💰 Precio entrada: ${entryPrice}`);
            
            // Validar señal
            if (!this.validateTradeSignal(signal)) {
                console.log(`[REAL-TRADING] ❌ Señal rechazada: ${symbol}`);
                return { success: false, reason: 'Signal validation failed' };
            }
            
            // Verificar si ya tenemos posición en este símbolo
            if (this.activePositions.has(symbol)) {
                console.log(`[REAL-TRADING] ⚠️ Posición existente en ${symbol}, cerrando primero`);
                await this.closePosition(symbol);
            }
            
            // Calcular tamaño de posición
            const positionSize = this.calculatePositionSize(signal);
            
            // Ejecutar orden
            const order = await this.placeOrder(signal, positionSize);
            
            if (order.success) {
                // Registrar trade
                this.recordTrade(signal, order);
                
                console.log(`[REAL-TRADING] ✅ Trade ejecutado: ${symbol} ${side} ${positionSize}`);
                return order;
            } else {
                console.log(`[REAL-TRADING] ❌ Error ejecutando trade: ${order.error}`);
                return order;
            }
            
        } catch (error) {
            console.error(`[REAL-TRADING] Error ejecutando señal:`, error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Valida una señal de trading
     */
    validateTradeSignal(signal) {
        const { symbol, confidence, entryPrice } = signal;
        
        // Verificar confianza mínima
        if (confidence < this.config.minConfidence) {
            console.log(`[REAL-TRADING] ❌ Confianza insuficiente: ${(confidence * 100).toFixed(1)}% < ${(this.config.minConfidence * 100).toFixed(1)}%`);
            return false;
        }
        
        // Verificar límite de posiciones
        if (this.activePositions.size >= this.config.maxPositions) {
            console.log(`[REAL-TRADING] ❌ Límite de posiciones alcanzado: ${this.activePositions.size}/${this.config.maxPositions}`);
            return false;
        }
        
        // Verificar pérdida diaria
        if (this.dailyPnL < -(this.accountBalance * this.config.maxDailyLoss)) {
            console.log(`[REAL-TRADING] ❌ Límite de pérdida diaria alcanzado: ${this.dailyPnL.toFixed(2)} USDT`);
            return false;
        }
        
        // Verificar precio válido
        if (!entryPrice || entryPrice <= 0) {
            console.log(`[REAL-TRADING] ❌ Precio de entrada inválido: ${entryPrice}`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Calcula el tamaño de posición basado en riesgo
     */
    calculatePositionSize(signal) {
        const { entryPrice, stopLoss, leverage } = signal;
        
        // Calcular riesgo por trade
        const riskAmount = this.accountBalance * this.config.maxRiskPerTrade;
        
        // Calcular diferencia de precio para stop loss
        const priceDifference = Math.abs(entryPrice - stopLoss);
        
        // Calcular tamaño de posición
        let positionSize = riskAmount / priceDifference;
        
        // Ajustar por leverage
        positionSize = positionSize * leverage;
        
        // Verificar límites
        const maxPositionSize = this.accountBalance * 0.1; // Máximo 10% del balance
        positionSize = Math.min(positionSize, maxPositionSize);
        
        // Redondear a 4 decimales
        positionSize = Math.round(positionSize * 10000) / 10000;
        
        console.log(`[REAL-TRADING] 📏 Tamaño de posición calculado: ${positionSize}`);
        
        return positionSize;
    }
    
    /**
     * Coloca una orden
     */
    async placeOrder(signal, positionSize) {
        const { symbol, side, entryPrice, stopLoss, takeProfit, leverage } = signal;
        
        try {
            // Configurar leverage
            await this.setLeverage(symbol, leverage);
            
            // Determinar lado de la orden
            const orderSide = side === 'LONG' ? 'BUY' : 'SELL';
            
            // Colocar orden principal
            const mainOrder = await this.binanceConnector.placeFuturesOrder({
                symbol: symbol,
                side: orderSide,
                type: 'MARKET',
                quantity: positionSize
            });
            
            // Colocar stop loss si está habilitado
            let stopLossOrder = null;
            if (this.config.useStopLoss && stopLoss) {
                stopLossOrder = await this.placeStopLoss(symbol, side, positionSize, stopLoss);
            }
            
            // Colocar take profit si está habilitado
            let takeProfitOrder = null;
            if (this.config.useTakeProfit && takeProfit) {
                takeProfitOrder = await this.placeTakeProfit(symbol, side, positionSize, takeProfit);
            }
            
            return {
                success: true,
                mainOrder: mainOrder,
                stopLossOrder: stopLossOrder,
                takeProfitOrder: takeProfitOrder,
                symbol: symbol,
                side: side,
                quantity: positionSize,
                entryPrice: entryPrice
            };
            
        } catch (error) {
            console.error(`[REAL-TRADING] Error colocando orden:`, error.message);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Configura el leverage para un símbolo
     */
    async setLeverage(symbol, leverage) {
        try {
            const maxLeverage = Math.min(leverage, this.config.maxLeverage);
            
            await this.binanceConnector.authenticatedRequest('/fapi/v1/leverage', {
                symbol: symbol,
                leverage: maxLeverage
            }, 'POST');
            
            console.log(`[REAL-TRADING] ⚡ Leverage configurado: ${symbol} ${maxLeverage}x`);
            
        } catch (error) {
            console.error(`[REAL-TRADING] Error configurando leverage:`, error.message);
        }
    }
    
    /**
     * Coloca stop loss
     */
    async placeStopLoss(symbol, side, quantity, stopLossPrice) {
        try {
            const stopSide = side === 'LONG' ? 'SELL' : 'BUY';
            
            const order = await this.binanceConnector.placeFuturesOrder({
                symbol: symbol,
                side: stopSide,
                type: 'STOP_MARKET',
                quantity: quantity,
                stopPrice: stopLossPrice
            });
            
            console.log(`[REAL-TRADING] 🛑 Stop Loss colocado: ${symbol} ${stopLossPrice}`);
            
            return order;
        } catch (error) {
            console.error(`[REAL-TRADING] Error colocando stop loss:`, error.message);
            return null;
        }
    }
    
    /**
     * Coloca take profit
     */
    async placeTakeProfit(symbol, side, quantity, takeProfitPrice) {
        try {
            const profitSide = side === 'LONG' ? 'SELL' : 'BUY';
            
            const order = await this.binanceConnector.placeFuturesOrder({
                symbol: symbol,
                side: profitSide,
                type: 'LIMIT',
                quantity: quantity,
                price: takeProfitPrice,
                timeInForce: 'GTC'
            });
            
            console.log(`[REAL-TRADING] 🎯 Take Profit colocado: ${symbol} ${takeProfitPrice}`);
            
            return order;
        } catch (error) {
            console.error(`[REAL-TRADING] Error colocando take profit:`, error.message);
            return null;
        }
    }
    
    /**
     * Cierra una posición
     */
    async closePosition(symbol, quantity = null) {
        try {
            const order = await this.binanceConnector.closePosition(symbol, quantity);
            
            console.log(`[REAL-TRADING] 🔒 Posición cerrada: ${symbol}`);
            
            // Actualizar posiciones activas
            await this.updateActivePositions();
            
            return order;
        } catch (error) {
            console.error(`[REAL-TRADING] Error cerrando posición:`, error.message);
            throw error;
        }
    }
    
    /**
     * Registra un trade en el historial
     */
    recordTrade(signal, order) {
        const trade = {
            id: Date.now(),
            timestamp: new Date(),
            symbol: signal.symbol,
            side: signal.side,
            strategy: signal.strategy,
            confidence: signal.confidence,
            entryPrice: signal.entryPrice,
            quantity: order.quantity,
            leverage: signal.leverage,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            orderId: order.mainOrder.orderId,
            status: 'OPEN'
        };
        
        this.tradeHistory.push(trade);
        this.totalTrades++;
        
        console.log(`[REAL-TRADING] 📝 Trade registrado: ${trade.id}`);
    }
    
    /**
     * Actualiza métricas de performance
     */
    updatePerformanceMetrics() {
        const closedTrades = this.tradeHistory.filter(trade => trade.status === 'CLOSED');
        
        this.performanceMetrics.totalTrades = closedTrades.length;
        this.performanceMetrics.winningTrades = closedTrades.filter(trade => trade.pnl > 0).length;
        this.performanceMetrics.losingTrades = closedTrades.filter(trade => trade.pnl < 0).length;
        
        this.performanceMetrics.totalProfit = closedTrades
            .filter(trade => trade.pnl > 0)
            .reduce((sum, trade) => sum + trade.pnl, 0);
            
        this.performanceMetrics.totalLoss = Math.abs(closedTrades
            .filter(trade => trade.pnl < 0)
            .reduce((sum, trade) => sum + trade.pnl, 0));
        
        this.performanceMetrics.winRate = this.performanceMetrics.totalTrades > 0 
            ? this.performanceMetrics.winningTrades / this.performanceMetrics.totalTrades 
            : 0;
            
        this.performanceMetrics.profitFactor = this.performanceMetrics.totalLoss > 0 
            ? this.performanceMetrics.totalProfit / this.performanceMetrics.totalLoss 
            : 0;
    }
    
    /**
     * Obtiene estado del sistema
     */
    getSystemStatus() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.binanceConnector.isAuthenticated,
            accountBalance: this.accountBalance,
            dailyPnL: this.dailyPnL,
            activePositions: this.activePositions.size,
            totalTrades: this.totalTrades,
            performanceMetrics: this.performanceMetrics,
            binanceStatus: this.binanceConnector.getSystemStatus()
        };
    }
    
    /**
     * Obtiene métricas de performance
     */
    getPerformanceMetrics() {
        this.updatePerformanceMetrics();
        return this.performanceMetrics;
    }
    
    /**
     * Obtiene historial de trades
     */
    getTradeHistory() {
        return this.tradeHistory;
    }
    
    /**
     * Cierra todas las posiciones
     */
    async closeAllPositions() {
        console.log('[REAL-TRADING] 🔒 Cerrando todas las posiciones...');
        
        const closePromises = Array.from(this.activePositions.keys()).map(symbol => 
            this.closePosition(symbol)
        );
        
        await Promise.allSettled(closePromises);
        
        console.log('[REAL-TRADING] ✅ Todas las posiciones cerradas');
    }
    
    /**
     * Limpia el sistema
     */
    async cleanup() {
        console.log('[REAL-TRADING] 🧹 Limpiando sistema...');
        
        // Cerrar todas las posiciones
        await this.closeAllPositions();
        
        // Desconectar WebSockets
        this.binanceConnector.disconnectWebSockets();
        
        console.log('[REAL-TRADING] ✅ Sistema limpiado');
    }
}

export default RealTradingExecutor;
