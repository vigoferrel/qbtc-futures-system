#!/usr/bin/env node

/**
 * 📊 TRADING METRICS SYSTEM - REAL PERFORMANCE TRACKING
 * ====================================================
 * Sistema avanzado de métricas de trading en tiempo real
 * - Seguimiento preciso de P&L
 * - Cálculo de win rate y ratios de riesgo/recompensa
 * - Sharpe ratio y métricas de volatilidad
 * - Análisis de correlación y drawdown máximo
 * - Métricas por estrategia y timeframe
 * - Reportes automatizados de rendimiento
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

export class TradingMetricsSystem extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = {
            enableRealTimeTracking: options.enableRealTimeTracking !== false,
            enableHistoricalAnalysis: options.enableHistoricalAnalysis !== false,
            enableRiskMetrics: options.enableRiskMetrics !== false,
            enableCorrelationAnalysis: options.enableCorrelationAnalysis !== false,
            metricsRetentionDays: options.metricsRetentionDays || 90,
            updateInterval: options.updateInterval || 1000, // 1 second
            storagePath: options.storagePath || './metrics/trading',
            ...options
        };

        // Estado del sistema de métricas
        this.metrics = {
            // Métricas generales
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfitLoss: 0,
            totalVolume: 0,

            // Ratios de rendimiento
            winRate: 0,
            profitFactor: 0,
            sharpeRatio: 0,
            sortinoRatio: 0,

            // Métricas de riesgo
            maxDrawdown: 0,
            currentDrawdown: 0,
            valueAtRisk: 0,
            expectedShortfall: 0,

            // Métricas temporales
            averageTradeDuration: 0,
            bestTrade: 0,
            worstTrade: 0,
            averageWin: 0,
            averageLoss: 0,

            // Métricas por estrategia
            strategyMetrics: new Map(),

            // Métricas por símbolo
            symbolMetrics: new Map(),

            // Métricas por timeframe
            timeframeMetrics: new Map(),

            // Historial de trades
            tradeHistory: [],

            // Equity curve
            equityCurve: [],

            // Timestamp de última actualización
            lastUpdate: Date.now()
        };

        // Estado de operaciones activas
        this.activeTrades = new Map();

        // Historial de precios para cálculos de volatilidad
        this.priceHistory = new Map();

        // Intervalos de actualización
        this.updateInterval = null;

        console.log('[📊] Trading Metrics System initialized');
    }

    /**
     * Inicializar el sistema de métricas
     */
    async initialize() {
        console.log('[📊] Initializing Trading Metrics System...');

        try {
            // Crear directorio de almacenamiento
            await fs.mkdir(this.options.storagePath, { recursive: true });

            // Cargar métricas históricas si existen
            await this.loadHistoricalMetrics();

            // Iniciar actualización en tiempo real si está habilitada
            if (this.options.enableRealTimeTracking) {
                this.startRealTimeUpdates();
            }

            console.log('[✅] Trading Metrics System initialized successfully');
            this.emit('metrics-system-ready');

            return true;

        } catch (error) {
            console.error('[❌] Error initializing Trading Metrics System:', error);
            this.emit('initialization-error', error);
            throw error;
        }
    }

    /**
     * Registrar una nueva operación de trading
     */
    async recordTrade(trade) {
        const tradeRecord = {
            id: trade.id || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            symbol: trade.symbol,
            side: trade.side, // 'buy' or 'sell'
            quantity: trade.quantity,
            entryPrice: trade.entryPrice,
            exitPrice: trade.exitPrice || null,
            entryTime: trade.entryTime || Date.now(),
            exitTime: trade.exitTime || null,
            strategy: trade.strategy || 'unknown',
            timeframe: trade.timeframe || 'unknown',
            status: trade.status || 'open', // 'open', 'closed', 'cancelled'
            profitLoss: 0,
            fees: trade.fees || 0,
            metadata: trade.metadata || {}
        };

        try {
            if (trade.status === 'open') {
                // Registrar trade abierto
                this.activeTrades.set(tradeRecord.id, tradeRecord);
                console.log(`[📈] Trade opened: ${tradeRecord.symbol} ${tradeRecord.side} ${tradeRecord.quantity} @ ${tradeRecord.entryPrice}`);

            } else if (trade.status === 'closed') {
                // Cerrar trade existente
                const existingTrade = this.activeTrades.get(tradeRecord.id);
                if (existingTrade) {
                    tradeRecord.entryTime = existingTrade.entryTime;
                    tradeRecord.entryPrice = existingTrade.entryPrice;
                    tradeRecord.side = existingTrade.side;
                    tradeRecord.quantity = existingTrade.quantity;

                    this.activeTrades.delete(tradeRecord.id);
                }

                // Calcular P&L
                const priceDiff = tradeRecord.exitPrice - tradeRecord.entryPrice;
                const multiplier = tradeRecord.side === 'buy' ? 1 : -1;
                tradeRecord.profitLoss = (priceDiff * multiplier * tradeRecord.quantity) - tradeRecord.fees;

                // Agregar al historial
                this.metrics.tradeHistory.push(tradeRecord);
                this.metrics.totalTrades++;

                // Actualizar métricas generales
                this.metrics.totalProfitLoss += tradeRecord.profitLoss;
                this.metrics.totalVolume += (tradeRecord.entryPrice * tradeRecord.quantity);

                if (tradeRecord.profitLoss > 0) {
                    this.metrics.winningTrades++;
                    this.metrics.averageWin = ((this.metrics.averageWin * (this.metrics.winningTrades - 1)) + tradeRecord.profitLoss) / this.metrics.winningTrades;
                } else {
                    this.metrics.losingTrades++;
                    this.metrics.averageLoss = ((this.metrics.averageLoss * (this.metrics.losingTrades - 1)) + Math.abs(tradeRecord.profitLoss)) / this.metrics.losingTrades;
                }

                // Actualizar mejores/peores trades
                this.metrics.bestTrade = Math.max(this.metrics.bestTrade, tradeRecord.profitLoss);
                this.metrics.worstTrade = Math.min(this.metrics.worstTrade, tradeRecord.profitLoss);

                // Actualizar métricas por estrategia
                this.updateStrategyMetrics(tradeRecord);

                // Actualizar métricas por símbolo
                this.updateSymbolMetrics(tradeRecord);

                // Actualizar métricas por timeframe
                this.updateTimeframeMetrics(tradeRecord);

                // Calcular métricas derivadas
                this.calculateDerivedMetrics();

                // Actualizar equity curve
                this.updateEquityCurve(tradeRecord);

                console.log(`[📉] Trade closed: ${tradeRecord.symbol} P&L: ${tradeRecord.profitLoss.toFixed(2)} (${tradeRecord.profitLoss > 0 ? 'WIN' : 'LOSS'})`);

                this.emit('trade-closed', tradeRecord);
            }

            // Guardar métricas
            await this.saveMetrics();

            return tradeRecord.id;

        } catch (error) {
            console.error('[❌] Error recording trade:', error);
            throw error;
        }
    }

    /**
     * Actualizar métricas por estrategia
     */
    updateStrategyMetrics(trade) {
        if (!this.metrics.strategyMetrics.has(trade.strategy)) {
            this.metrics.strategyMetrics.set(trade.strategy, {
                totalTrades: 0,
                winningTrades: 0,
                totalProfitLoss: 0,
                winRate: 0,
                profitFactor: 0,
                bestTrade: 0,
                worstTrade: 0
            });
        }

        const strategyMetrics = this.metrics.strategyMetrics.get(trade.strategy);
        strategyMetrics.totalTrades++;
        strategyMetrics.totalProfitLoss += trade.profitLoss;

        if (trade.profitLoss > 0) {
            strategyMetrics.winningTrades++;
        }

        strategyMetrics.bestTrade = Math.max(strategyMetrics.bestTrade, trade.profitLoss);
        strategyMetrics.worstTrade = Math.min(strategyMetrics.worstTrade, trade.profitLoss);

        // Calcular win rate y profit factor
        strategyMetrics.winRate = strategyMetrics.winningTrades / strategyMetrics.totalTrades;
        const grossProfit = strategyMetrics.totalProfitLoss > 0 ? strategyMetrics.totalProfitLoss : 0;
        const grossLoss = strategyMetrics.totalProfitLoss < 0 ? Math.abs(strategyMetrics.totalProfitLoss) : 0;
        strategyMetrics.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);
    }

    /**
     * Actualizar métricas por símbolo
     */
    updateSymbolMetrics(trade) {
        if (!this.metrics.symbolMetrics.has(trade.symbol)) {
            this.metrics.symbolMetrics.set(trade.symbol, {
                totalTrades: 0,
                winningTrades: 0,
                totalProfitLoss: 0,
                winRate: 0,
                averageVolume: 0
            });
        }

        const symbolMetrics = this.metrics.symbolMetrics.get(trade.symbol);
        symbolMetrics.totalTrades++;
        symbolMetrics.totalProfitLoss += trade.profitLoss;

        if (trade.profitLoss > 0) {
            symbolMetrics.winningTrades++;
        }

        symbolMetrics.winRate = symbolMetrics.winningTrades / symbolMetrics.totalTrades;
        symbolMetrics.averageVolume = (symbolMetrics.averageVolume * (symbolMetrics.totalTrades - 1) + (trade.entryPrice * trade.quantity)) / symbolMetrics.totalTrades;
    }

    /**
     * Actualizar métricas por timeframe
     */
    updateTimeframeMetrics(trade) {
        if (!this.metrics.timeframeMetrics.has(trade.timeframe)) {
            this.metrics.timeframeMetrics.set(trade.timeframe, {
                totalTrades: 0,
                winningTrades: 0,
                totalProfitLoss: 0,
                winRate: 0,
                averageDuration: 0
            });
        }

        const timeframeMetrics = this.metrics.timeframeMetrics.get(trade.timeframe);
        timeframeMetrics.totalTrades++;
        timeframeMetrics.totalProfitLoss += trade.profitLoss;

        if (trade.profitLoss > 0) {
            timeframeMetrics.winningTrades++;
        }

        timeframeMetrics.winRate = timeframeMetrics.winningTrades / timeframeMetrics.totalTrades;

        // Calcular duración promedio si hay exitTime
        if (trade.exitTime) {
            const duration = trade.exitTime - trade.entryTime;
            timeframeMetrics.averageDuration = (timeframeMetrics.averageDuration * (timeframeMetrics.totalTrades - 1) + duration) / timeframeMetrics.totalTrades;
        }
    }

    /**
     * Calcular métricas derivadas
     */
    calculateDerivedMetrics() {
        // Win Rate
        this.metrics.winRate = this.metrics.totalTrades > 0 ?
            this.metrics.winningTrades / this.metrics.totalTrades : 0;

        // Profit Factor
        const grossProfit = this.metrics.tradeHistory
            .filter(trade => trade.profitLoss > 0)
            .reduce((sum, trade) => sum + trade.profitLoss, 0);

        const grossLoss = Math.abs(this.metrics.tradeHistory
            .filter(trade => trade.profitLoss < 0)
            .reduce((sum, trade) => sum + trade.profitLoss, 0));

        this.metrics.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);

        // Calcular drawdown máximo
        this.calculateMaxDrawdown();

        // Calcular Sharpe ratio (simplificado)
        this.calculateSharpeRatio();
    }

    /**
     * Calcular drawdown máximo
     */
    calculateMaxDrawdown() {
        if (this.metrics.equityCurve.length < 2) return;

        let peak = this.metrics.equityCurve[0];
        let maxDrawdown = 0;

        for (const equity of this.metrics.equityCurve) {
            if (equity > peak) {
                peak = equity;
            }

            const drawdown = (peak - equity) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        }

        this.metrics.maxDrawdown = maxDrawdown;
        this.metrics.currentDrawdown = this.metrics.equityCurve.length > 0 ?
            (peak - this.metrics.equityCurve[this.metrics.equityCurve.length - 1]) / peak : 0;
    }

    /**
     * Calcular Sharpe ratio (versión simplificada)
     */
    calculateSharpeRatio() {
        if (this.metrics.tradeHistory.length < 2) return;

        const returns = this.metrics.tradeHistory.map(trade => trade.profitLoss);
        const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);

        // Asumiendo risk-free rate de 0.02 (2%)
        const riskFreeRate = 0.02;
        this.metrics.sharpeRatio = stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
    }

    /**
     * Actualizar curva de equity
     */
    updateEquityCurve(trade) {
        const lastEquity = this.metrics.equityCurve.length > 0 ?
            this.metrics.equityCurve[this.metrics.equityCurve.length - 1] : 100000; // Capital inicial

        const newEquity = lastEquity + trade.profitLoss;
        this.metrics.equityCurve.push(newEquity);
    }

    /**
     * Obtener métricas de rendimiento actuales
     */
    getPerformanceMetrics() {
        return {
            // Métricas generales
            totalTrades: this.metrics.totalTrades,
            winRate: this.metrics.winRate,
            totalProfitLoss: this.metrics.totalProfitLoss,
            totalVolume: this.metrics.totalVolume,

            // Ratios de rendimiento
            profitFactor: this.metrics.profitFactor,
            sharpeRatio: this.metrics.sharpeRatio,

            // Métricas de riesgo
            maxDrawdown: this.metrics.maxDrawdown,
            currentDrawdown: this.metrics.currentDrawdown,

            // Estadísticas de trades
            averageWin: this.metrics.averageWin,
            averageLoss: this.metrics.averageLoss,
            bestTrade: this.metrics.bestTrade,
            worstTrade: this.metrics.worstTrade,

            // Métricas por categoría
            strategyMetrics: Object.fromEntries(this.metrics.strategyMetrics),
            symbolMetrics: Object.fromEntries(this.metrics.symbolMetrics),
            timeframeMetrics: Object.fromEntries(this.metrics.timeframeMetrics),

            // Estado actual
            activeTrades: this.activeTrades.size,
            lastUpdate: this.metrics.lastUpdate
        };
    }

    /**
     * Obtener análisis de riesgo
     */
    getRiskAnalysis() {
        return {
            maxDrawdown: this.metrics.maxDrawdown,
            currentDrawdown: this.metrics.currentDrawdown,
            valueAtRisk: this.metrics.valueAtRisk,
            expectedShortfall: this.metrics.expectedShortfall,
            sharpeRatio: this.metrics.sharpeRatio,
            sortinoRatio: this.metrics.sortinoRatio,
            riskAdjustedReturn: this.metrics.totalProfitLoss / (this.metrics.maxDrawdown || 1)
        };
    }

    /**
     * Generar reporte de rendimiento
     */
    async generatePerformanceReport(timeframe = 'all') {
        const metrics = this.getPerformanceMetrics();

        const report = {
            generatedAt: new Date().toISOString(),
            timeframe: timeframe,
            summary: {
                totalTrades: metrics.totalTrades,
                winRate: `${(metrics.winRate * 100).toFixed(2)}%`,
                totalProfitLoss: `$${metrics.totalProfitLoss.toFixed(2)}`,
                profitFactor: metrics.profitFactor.toFixed(2),
                sharpeRatio: metrics.sharpeRatio.toFixed(2),
                maxDrawdown: `${(metrics.maxDrawdown * 100).toFixed(2)}%`
            },
            detailedMetrics: metrics,
            recommendations: this.generateRecommendations(metrics)
        };

        // Guardar reporte
        const reportPath = path.join(this.options.storagePath, `performance-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        console.log(`[📊] Performance report generated: ${reportPath}`);

        return report;
    }

    /**
     * Generar recomendaciones basadas en métricas
     */
    generateRecommendations(metrics) {
        const recommendations = [];

        if (metrics.winRate < 0.5) {
            recommendations.push({
                type: 'WARNING',
                message: 'Win rate below 50%. Consider reviewing entry/exit criteria.',
                priority: 'HIGH'
            });
        }

        if (metrics.profitFactor < 1.5) {
            recommendations.push({
                type: 'WARNING',
                message: 'Profit factor below 1.5. Risk management needs improvement.',
                priority: 'HIGH'
            });
        }

        if (metrics.maxDrawdown > 0.2) {
            recommendations.push({
                type: 'CRITICAL',
                message: 'Maximum drawdown exceeds 20%. Implement stricter risk controls.',
                priority: 'CRITICAL'
            });
        }

        if (metrics.sharpeRatio < 1) {
            recommendations.push({
                type: 'WARNING',
                message: 'Sharpe ratio below 1. Returns may not justify risk taken.',
                priority: 'MEDIUM'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'SUCCESS',
                message: 'Performance metrics look good. Continue current strategy.',
                priority: 'LOW'
            });
        }

        return recommendations;
    }

    /**
     * Iniciar actualizaciones en tiempo real
     */
    startRealTimeUpdates() {
        this.updateInterval = setInterval(async () => {
            try {
                this.metrics.lastUpdate = Date.now();

                // Emitir métricas actualizadas
                this.emit('metrics-updated', this.getPerformanceMetrics());

                // Guardar métricas periódicamente
                if (Date.now() % 300000 < this.options.updateInterval) { // Cada 5 minutos
                    await this.saveMetrics();
                }

            } catch (error) {
                console.error('[❌] Error in real-time metrics update:', error);
            }
        }, this.options.updateInterval);

        console.log(`[📊] Real-time metrics updates started (every ${this.options.updateInterval}ms)`);
    }

    /**
     * Cargar métricas históricas
     */
    async loadHistoricalMetrics() {
        try {
            const metricsPath = path.join(this.options.storagePath, 'trading-metrics.json');

            try {
                await fs.access(metricsPath);
                const data = await fs.readFile(metricsPath, 'utf8');
                const historicalMetrics = JSON.parse(data);

                // Fusionar con métricas actuales
                Object.assign(this.metrics, historicalMetrics);

                console.log('[📊] Historical metrics loaded successfully');

            } catch (error) {
                console.log('[📊] No historical metrics found, starting fresh');
            }

        } catch (error) {
            console.error('[❌] Error loading historical metrics:', error);
        }
    }

    /**
     * Guardar métricas actuales
     */
    async saveMetrics() {
        try {
            const metricsPath = path.join(this.options.storagePath, 'trading-metrics.json');
            await fs.writeFile(metricsPath, JSON.stringify(this.metrics, null, 2));

        } catch (error) {
            console.error('[❌] Error saving metrics:', error);
        }
    }

    /**
     * Limpiar métricas antiguas
     */
    async cleanupOldMetrics() {
        const cutoffDate = Date.now() - (this.options.metricsRetentionDays * 24 * 60 * 60 * 1000);

        // Limpiar historial de trades antiguos
        this.metrics.tradeHistory = this.metrics.tradeHistory.filter(
            trade => trade.entryTime > cutoffDate
        );

        console.log('[🧹] Old metrics cleaned up');
    }

    /**
     * Detener el sistema de métricas
     */
    async shutdown() {
        console.log('[📊] Shutting down Trading Metrics System...');

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Guardar métricas finales
        await this.saveMetrics();

        console.log('[✅] Trading Metrics System shutdown complete');
    }
}

/**
 * Función de utilidad para crear instancia del sistema
 */
export function createTradingMetricsSystem(options = {}) {
    return new TradingMetricsSystem(options);
}

/**
 * Función principal para ejecutar el sistema standalone
 */
async function main() {
    console.log('[📊] Starting Trading Metrics System...');

    try {
        const metricsSystem = new TradingMetricsSystem();
        await metricsSystem.initialize();

        console.log('[✅] Trading Metrics System is running...');
        console.log('[INFO] Press Ctrl+C to stop');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n[📊] Shutting down Trading Metrics System...');
            await metricsSystem.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error('[❌] Fatal error in Trading Metrics System:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default TradingMetricsSystem;

