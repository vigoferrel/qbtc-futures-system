import QuantumDataPurifier from '../core/quantum-data-purifier.js';
// QBTC Risk-Adjusted Order Engine
// Motor de ejecución de órdenes con ajuste dinámico por riesgo

import EventEmitter from 'events';

export class RiskAdjustedOrderEngine extends EventEmitter {
    constructor(options = {}) {
        this.purifier = new QuantumDataPurifier();
        super();
        
        // Configuración base
        this.maxOrderSize = options.maxOrderSize || 50000; // $50K max por orden
        this.minOrderSize = options.minOrderSize || 100;   // $100 min por orden
        this.maxSlippage = options.maxSlippage || 0.003;   // 0.3% max slippage
        this.maxMarketImpact = options.maxMarketImpact || 0.0005; // 0.05% max impact
        
        // Factores de ajuste de riesgo
        this.riskAdjustmentFactors = {
            var: { min: 0.5, max: 1.2 },           // Ajuste por VaR
            entropy: { min: 0.6, max: 1.1 },      // Ajuste por entropía
            correlation: { min: 0.7, max: 1.0 },  // Ajuste por correlación
            volatility: { min: 0.4, max: 1.3 },   // Ajuste por volatilidad
            liquidity: { min: 0.3, max: 1.0 }     // Ajuste por liquidez
        };
        
        // Estado del motor
        this.activeOrders = new Map();
        this.executionHistory = [];
        this.riskMetrics = {};
        
        console.log('[LIGHTNING] Risk-Adjusted Order Engine initialized');
    }

    // Calcular tamaño de orden ajustado por riesgo
    calculateAdjustedOrderSize(signal, riskMetrics, marketData) {
        try {
            let baseSize = signal.baseSize || 1000;
            let adjustedSize = baseSize;
            
            // 1. Ajuste por VaR
            const varAdjustment = this.calculateVarAdjustment(riskMetrics.qvar || 0.008);
            adjustedSize *= varAdjustment;
            
            // 2. Ajuste por entropía global
            const entropyAdjustment = this.calculateEntropyAdjustment(riskMetrics.entropy || 0.5);
            adjustedSize *= entropyAdjustment;
            
            // 3. Ajuste por correlación
            const correlationAdjustment = this.calculateCorrelationAdjustment(
                riskMetrics.correlation || 0.15
            );
            adjustedSize *= correlationAdjustment;
            
            // 4. Ajuste por volatilidad
            const volatilityAdjustment = this.calculateVolatilityAdjustment(
                marketData.volatility || 0.02
            );
            adjustedSize *= volatilityAdjustment;
            
            // 5. Ajuste por liquidez
            const liquidityAdjustment = this.calculateLiquidityAdjustment(
                marketData.liquidity || 0.8
            );
            adjustedSize *= liquidityAdjustment;
            
            // 6. Ajuste por confianza de la señal
            const confidenceAdjustment = Math.max(0.3, Math.min(1.2, signal.confidence || 0.7));
            adjustedSize *= confidenceAdjustment;
            
            // Aplicar límites
            adjustedSize = Math.max(this.minOrderSize, Math.min(this.maxOrderSize, adjustedSize));
            
            const adjustments = {
                var: varAdjustment,
                entropy: entropyAdjustment,
                correlation: correlationAdjustment,
                volatility: volatilityAdjustment,
                liquidity: liquidityAdjustment,
                confidence: confidenceAdjustment,
                totalMultiplier: adjustedSize / baseSize
            };
            
            return {
                originalSize: baseSize,
                adjustedSize: Math.round(adjustedSize),
                adjustments,
                riskScore: this.calculateOrderRiskScore(adjustments),
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('[X] Error calculating adjusted order size:', error);
            return {
                originalSize: signal.baseSize || 1000,
                adjustedSize: Math.min(this.maxOrderSize, signal.baseSize || 1000),
                adjustments: {},
                riskScore: 0.5,
                timestamp: new Date()
            };
        }
    }

    // Ajuste por VaR
    calculateVarAdjustment(qvar) {
        const varThreshold = 0.008; // 0.8% threshold
        const varRatio = Math.min(2.0, qvar / varThreshold);
        
        if (varRatio > 1.5) return this.riskAdjustmentFactors.var.min; // Reducir mucho
        if (varRatio > 1.2) return 0.7; // Reducir moderado
        if (varRatio < 0.5) return this.riskAdjustmentFactors.var.max; // Aumentar
        
        return 1.0; // Normal
    }

    // Ajuste por entropía
    calculateEntropyAdjustment(entropy) {
        // A mayor entropía, menor tamaño de orden
        const entropyNormalized = Math.max(0, Math.min(1, entropy));
        return this.riskAdjustmentFactors.entropy.max - 
               (entropyNormalized * (this.riskAdjustmentFactors.entropy.max - this.riskAdjustmentFactors.entropy.min));
    }

    // Ajuste por correlación
    calculateCorrelationAdjustment(correlation) {
        const correlationThreshold = 0.28; // φ-ratio optimizado
        
        if (correlation > correlationThreshold * 1.5) {
            return this.riskAdjustmentFactors.correlation.min; // Reducir por alta correlación
        }
        
        return 1.0 - (correlation / correlationThreshold * 0.3);
    }

    // Ajuste por volatilidad
    calculateVolatilityAdjustment(volatility) {
        const baseVolatility = 0.02; // 2% base
        const volRatio = volatility / baseVolatility;
        
        if (volRatio > 3.0) return this.riskAdjustmentFactors.volatility.min; // Vol muy alta
        if (volRatio > 2.0) return 0.6; // Vol alta
        if (volRatio < 0.5) return this.riskAdjustmentFactors.volatility.max; // Vol baja
        
        return 1.0 / Math.sqrt(volRatio); // Inverse volatility scaling
    }

    // Ajuste por liquidez
    calculateLiquidityAdjustment(liquidity) {
        // Liquidity score: 0 (illiquid) to 1 (very liquid)
        const liquidityNormalized = Math.max(0, Math.min(1, liquidity));
        
        return this.riskAdjustmentFactors.liquidity.min + 
               (liquidityNormalized * (this.riskAdjustmentFactors.liquidity.max - this.riskAdjustmentFactors.liquidity.min));
    }

    // Calcular score de riesgo de la orden
    calculateOrderRiskScore(adjustments) {
        const weights = {
            var: 0.25,
            entropy: 0.20,
            correlation: 0.20,
            volatility: 0.20,
            liquidity: 0.15
        };
        
        let riskScore = 0;
        
        // Scores individuales (1 = bajo riesgo, 0 = alto riesgo)
        const scores = {
            var: Math.max(0, Math.min(1, adjustments.var)),
            entropy: adjustments.entropy,
            correlation: adjustments.correlation, 
            volatility: Math.max(0, Math.min(1, adjustments.volatility)),
            liquidity: adjustments.liquidity
        };
        
        for (const [factor, weight] of Object.entries(weights)) {
            riskScore += (scores[factor] || 0.5) * weight;
        }
        
        return Math.max(0, Math.min(1, riskScore));
    }

    // Crear orden optimizada
    async createOptimizedOrder(signal, riskMetrics, marketData) {
        try {
            const sizeCalculation = this.calculateAdjustedOrderSize(signal, riskMetrics, marketData);
            
            // Determinar tipo de orden óptimo
            const orderType = this.determineOptimalOrderType(signal, marketData, sizeCalculation.riskScore);
            
            // Calcular precio óptimo
            const priceStrategy = this.calculateOptimalPrice(signal, marketData, orderType);
            
            // Calcular stops y targets
            const stopLoss = this.calculateDynamicStopLoss(signal, marketData, sizeCalculation.riskScore);
            const takeProfit = this.calculateTakeProfit(signal, marketData);
            
            const order = {
                id: this.generateOrderId(),
                symbol: signal.symbol,
                side: signal.direction, // 'BUY' or 'SELL'
                type: orderType,
                quantity: sizeCalculation.adjustedSize,
                price: priceStrategy.price,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                timeInForce: this.determineTimeInForce(signal, marketData),
                
                // Metadata
                originalSignal: signal,
                sizeCalculation: sizeCalculation,
                priceStrategy: priceStrategy,
                riskMetrics: { ...riskMetrics },
                marketData: { ...marketData },
                
                // Estado
                status: 'PENDING',
                createdAt: new Date(),
                lastUpdated: new Date()
            };
            
            // Validar orden antes de enviar
            const validation = this.validateOrder(order, marketData);
            if (!validation.isValid) {
                throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Almacenar orden activa
            this.activeOrders.set(order.id, order);
            
            this.emit('orderCreated', {
                order,
                validation,
                timestamp: new Date()
            });
            
            return order;
            
        } catch (error) {
            console.error('[X] Error creating optimized order:', error);
            return null;
        }
    }

    // Determinar tipo de orden óptimo
    determineOptimalOrderType(signal, marketData, riskScore) {
        const spread = marketData.spread || 0.001;
        const volatility = marketData.volatility || 0.02;
        
        // Para órdenes de alto riesgo, usar LIMIT para mejor control
        if (riskScore < 0.4) return 'LIMIT';
        
        // Para mercados volátiles, usar LIMIT
        if (volatility > 0.05) return 'LIMIT';
        
        // Para spreads amplios, usar LIMIT
        if (spread > 0.002) return 'LIMIT';
        
        // Para señales urgentes con buen riesgo, usar MARKET
        if (signal.urgency === 'HIGH' && riskScore > 0.7) return 'MARKET';
        
        return 'LIMIT'; // Default seguro
    }

    // Calcular precio óptimo
    calculateOptimalPrice(signal, marketData, orderType) {
        const currentPrice = marketData.price;
        const spread = marketData.spread || 0.001;
        const orderBook = marketData.orderBook || {};
        
        if (orderType === 'MARKET') {
            return {
                price: null, // Market orders no tienen precio fijo
                strategy: 'MARKET_EXECUTION',
                expectedSlippage: spread * 0.5
            };
        }
        
        // Para LIMIT orders, calcular precio agresivo pero seguro
        let targetPrice;
        const aggressiveness = Math.min(0.8, signal.confidence || 0.6);
        
        if (signal.direction === 'BUY') {
            const bestAsk = orderBook.bestAsk || currentPrice * (1 + spread/2);
            targetPrice = bestAsk - (spread * (1 - aggressiveness));
        } else {
            const bestBid = orderBook.bestBid || currentPrice * (1 - spread/2);
            targetPrice = bestBid + (spread * (1 - aggressiveness));
        }
        
        return {
            price: Math.round(targetPrice * 100) / 100, // Round to 2 decimals
            strategy: 'AGGRESSIVE_LIMIT',
            aggressiveness: aggressiveness,
            expectedFillProbability: aggressiveness * 0.9
        };
    }

    // Calcular stop loss dinámico
    calculateDynamicStopLoss(signal, marketData, riskScore) {
        const currentPrice = marketData.price;
        const volatility = marketData.volatility || 0.02;
        const atr = marketData.atr || volatility * currentPrice;
        
        // Base stop distance (ATR-based)
        let stopDistance = atr * 2.0; // 2x ATR base
        
        // Ajustar por riesgo de la orden
        stopDistance *= (1.5 - riskScore * 0.5); // Más riesgo = stop más cercano
        
        // Ajustar por volatilidad
        const volMultiplier = Math.max(0.5, Math.min(2.0, volatility / 0.02));
        stopDistance *= volMultiplier;
        
        // Ajustar por confianza en la señal
        const confidenceMultiplier = 0.5 + (signal.confidence || 0.7);
        stopDistance *= confidenceMultiplier;
        
        let stopPrice;
        if (signal.direction === 'BUY') {
            stopPrice = currentPrice - stopDistance;
        } else {
            stopPrice = currentPrice + stopDistance;
        }
        
        return {
            price: Math.round(stopPrice * 100) / 100,
            distance: stopDistance,
            atrMultiple: stopDistance / atr,
            riskAdjusted: true
        };
    }

    // Calcular take profit
    calculateTakeProfit(signal, marketData) {
        const currentPrice = marketData.price;
        const atr = marketData.atr || (marketData.volatility || 0.02) * currentPrice;
        
        // Risk/Reward ratio objetivo (dynamic)
        const targetRR = Math.max(1.5, Math.min(3.0, (signal.confidence || 0.7) * 4));
        
        const stopDistance = this.calculateDynamicStopLoss(signal, marketData, 0.5).distance;
        const profitDistance = stopDistance * targetRR;
        
        let targetPrice;
        if (signal.direction === 'BUY') {
            targetPrice = currentPrice + profitDistance;
        } else {
            targetPrice = currentPrice - profitDistance;
        }
        
        return {
            price: Math.round(targetPrice * 100) / 100,
            distance: profitDistance,
            riskRewardRatio: targetRR,
            atrMultiple: profitDistance / atr
        };
    }

    // Determinar Time In Force
    determineTimeInForce(signal, marketData) {
        const volatility = marketData.volatility || 0.02;
        
        // Para mercados muy volátiles, usar IOC (Immediate or Cancel)
        if (volatility > 0.08) return 'IOC';
        
        // Para señales urgentes, usar FOK (Fill or Kill)
        if (signal.urgency === 'IMMEDIATE') return 'FOK';
        
        // Default: GTC (Good Till Cancel)
        return 'GTC';
    }

    // Validar orden
    validateOrder(order, marketData) {
        const errors = [];
        
        // Validar tamaño
        if (order.quantity < this.minOrderSize) {
            errors.push(`Order size ${order.quantity} below minimum ${this.minOrderSize}`);
        }
        
        if (order.quantity > this.maxOrderSize) {
            errors.push(`Order size ${order.quantity} above maximum ${this.maxOrderSize}`);
        }
        
        // Validar precio (solo para LIMIT orders)
        if (order.type === 'LIMIT') {
            const currentPrice = marketData.price;
            const maxDeviation = currentPrice * 0.05; // 5% max deviation
            
            if (Math.abs(order.price - currentPrice) > maxDeviation) {
                errors.push(`Price ${order.price} too far from current price ${currentPrice}`);
            }
        }
        
        // Validar stop loss
        if (order.stopLoss && order.type === 'LIMIT') {
            const stopDistance = Math.abs(order.price - order.stopLoss.price);
            const minStopDistance = order.price * 0.002; // 0.2% minimum
            
            if (stopDistance < minStopDistance) {
                errors.push(`Stop loss too close: ${stopDistance} < ${minStopDistance}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            timestamp: new Date()
        };
    }

    // Generar ID único de orden
    generateOrderId() {
        return `QBTC_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`;
    }

    // Obtener estadísticas del motor
    getEngineStats() {
        const now = new Date();
        const last24h = this.executionHistory.filter(order => 
            now - order.timestamp < 24 * 60 * 60 * 1000
        );
        
        const successfulOrders = last24h.filter(order => order.status === 'FILLED');
        
        return {
            totalActiveOrders: this.activeOrders.size,
            ordersLast24h: last24h.length,
            successRate: last24h.length > 0 ? (successfulOrders.length / last24h.length) * 100 : 0,
            averageOrderSize: successfulOrders.length > 0 
                ? successfulOrders.reduce((sum, order) => sum + order.quantity, 0) / successfulOrders.length 
                : 0,
            averageExecutionTime: this.calculateAverageExecutionTime(successfulOrders),
            riskAdjustmentStats: this.calculateRiskAdjustmentStats(),
            timestamp: new Date()
        };
    }

    // Calcular tiempo promedio de ejecución
    calculateAverageExecutionTime(orders) {
        if (orders.length === 0) return 0;
        
        const executionTimes = orders
            .filter(order => order.filledAt && order.createdAt)
            .map(order => order.filledAt - order.createdAt);
            
        return executionTimes.length > 0
            ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
            : 0;
    }

    // Calcular estadísticas de ajustes de riesgo
    calculateRiskAdjustmentStats() {
        const recentOrders = this.executionHistory.slice(-100); // Last 100 orders
        
        if (recentOrders.length === 0) return {};
        
        const adjustments = recentOrders
            .filter(order => order.sizeCalculation && order.sizeCalculation.adjustments)
            .map(order => order.sizeCalculation.adjustments);
            
        if (adjustments.length === 0) return {};
        
        const avgAdjustments = {};
        const factors = ['var', 'entropy', 'correlation', 'volatility', 'liquidity'];
        
        factors.forEach(factor => {
            const values = adjustments.map(adj => adj[factor]).filter(v => v !== undefined);
            avgAdjustments[factor] = values.length > 0
                ? values.reduce((sum, val) => sum + val, 0) / values.length
                : 1.0;
        });
        
        return avgAdjustments;
    }

    // Actualizar orden activa
    updateOrder(orderId, updates) {
        const order = this.activeOrders.get(orderId);
        if (!order) return null;
        
        Object.assign(order, updates, { lastUpdated: new Date() });
        
        this.emit('orderUpdated', {
            orderId,
            updates,
            order,
            timestamp: new Date()
        });
        
        return order;
    }

    // Completar orden
    completeOrder(orderId, fillData) {
        const order = this.activeOrders.get(orderId);
        if (!order) return null;
        
        // Actualizar orden con datos de fill
        Object.assign(order, fillData, {
            status: 'FILLED',
            filledAt: new Date(),
            lastUpdated: new Date()
        });
        
        // Mover a historial
        this.executionHistory.push(order);
        this.activeOrders.delete(orderId);
        
        this.emit('orderCompleted', {
            order,
            fillData,
            timestamp: new Date()
        });
        
        return order;
    }
}

export default RiskAdjustedOrderEngine;
