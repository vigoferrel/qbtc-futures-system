import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [TREND_UP] QBTC POSITION MANAGER - GESTIÓN AVANZADA DE POSICIONES
 * ========================================================
 * Gestor completo de posiciones para el ecosistema QBTC
 * 
 * FUNCIONALIDADES:
 * - Tracking de posiciones en tiempo real
 * - Cálculos avanzados de PnL y margin
 * - Gestión automática de riesgo por posición
 * - Portfolio balancing inteligente
 * - Stop-loss y take-profit dinámicos
 * - Integración con quantum consciousness
 * - Alertas de margin y liquidación
 * - Analytics de performance
 * - Rebalanceo automático por tiers
 */

import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import http from 'http';
import { QUANTUM_CONSTANTS } from '../config/constants.js';
import { ALL_SYMBOLS, QUANTUM_TIER_CONFIG } from '../config/symbols-extended-backend.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 14202;

class QBTCPositionManager extends EventEmitter {
    constructor() {
        super();
        
        this.serviceName = 'QBTC Position Manager';
        this.version = '1.0.0-complete';
        this.startTime = new Date();
        
        // Estado de posiciones
        this.positions = new Map(); // symbol -> position data
        this.closedPositions = [];
        this.orders = new Map(); // orderId -> order data
        
        // Estado del portfolio
        this.portfolioState = {
            totalEquity: 100000, // Comenzar con $100k
            availableBalance: 100000,
            usedMargin: 0,
            freeMargin: 100000,
            marginRatio: 0,
            totalUnrealizedPnL: 0,
            totalRealizedPnL: 0,
            totalFees: 0,
            maxDrawdown: 0,
            peakEquity: 100000,
            dailyPnL: 0,
            
            // Métricas de performance
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,
            averageWin: 0,
            averageLoss: 0,
            profitFactor: 0,
            sharpeRatio: 0,
            maxConsecutiveLosses: 0,
            currentStreak: 0,
            
            // Distribución por tiers
            tierExposure: {
                TIER1: { allocated: 0, used: 0, positions: 0 },
                TIER2: { allocated: 0, used: 0, positions: 0 },
                TIER3: { allocated: 0, used: 0, positions: 0 },
                TIER4: { allocated: 0, used: 0, positions: 0 },
                TIER5: { allocated: 0, used: 0, positions: 0 },
                TIER6: { allocated: 0, used: 0, positions: 0 }
            }
        };
        
        // Configuración de gestión de riesgo
        this.riskConfig = {
            maxPositions: 15,
            maxRiskPerPosition: 0.03, // 3% por posición
            maxPortfolioRisk: 0.15,   // 15% total
            maxLeverage: 25,
            marginCallLevel: 0.8,     // 80% margin ratio
            liquidationLevel: 0.95,   // 95% margin ratio
            
            // Stop-loss dinámico
            baseStopLoss: 0.02,       // 2% base
            atrMultiplier: 2.0,       // 2x ATR para stops
            trailingStopEnabled: true,
            trailingStopDistance: 0.01, // 1%
            
            // Take-profit dinámico
            baseTakeProfit: 0.04,     // 4% base
            riskRewardRatio: 2.0,     // 2:1 R/R
            partialTakeProfitLevels: [0.5, 0.75], // 50% y 75%
            
            // Portfolio balancing
            rebalanceThreshold: 0.1,  // 10% desviación
            tierLimits: {
                TIER1: 0.30,  // 30% máximo
                TIER2: 0.25,  // 25% máximo
                TIER3: 0.20,  // 20% máximo
                TIER4: 0.15,  // 15% máximo
                TIER5: 0.07,  // 7% máximo
                TIER6: 0.03   // 3% máximo
            }
        };
        
        // WebSocket para updates en tiempo real
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.subscribers = new Set();
        
        // Intervalos de monitoreo
        this.intervals = {
            positionMonitoring: null,
            portfolioAnalysis: null,
            riskAssessment: null,
            rebalancing: null
        };
        
        // Estado del servicio
        this.serviceState = {
            status: 'initializing',
            isActive: false,
            lastUpdate: new Date(),
            monitoringEnabled: false,
            rebalancingEnabled: true
        };
        
        this.setupWebSocketServer();
        
        console.log('[TREND_UP] QBTC Position Manager initialized');
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.subscribers.add(ws);
            console.log('[SATELLITE] Position manager subscriber connected');
            
            // Enviar estado inicial
            ws.send(JSON.stringify({
                type: 'portfolio_state',
                data: this.portfolioState
            }));
            
            ws.on('close', () => {
                this.subscribers.delete(ws);
                console.log('[SATELLITE] Position manager subscriber disconnected');
            });
        });
    }
    
    async initialize() {
        console.log('[ROCKET] Initializing QBTC Position Manager...');
        
        try {
            // Inicializar tier allocations
            this.initializeTierAllocations();
            
            // Iniciar monitoreo
            this.startPositionMonitoring();
            this.startPortfolioAnalysis();
            this.startRiskAssessment();
            this.startRebalancing();
            
            this.serviceState.status = 'operational';
            this.serviceState.isActive = true;
            this.serviceState.monitoringEnabled = true;
            
            console.log('[CHECK] QBTC Position Manager operational');
            this.emit('position-manager-ready');
            
            return true;
        } catch (error) {
            console.error('[X] Failed to initialize Position Manager:', error);
            this.serviceState.status = 'error';
            throw error;
        }
    }
    
    initializeTierAllocations() {
        const totalEquity = this.portfolioState.totalEquity;
        
        for (const [tier, limit] of Object.entries(this.riskConfig.tierLimits)) {
            this.portfolioState.tierExposure[tier].allocated = totalEquity * limit;
        }
        
        console.log('[TARGET] Tier allocations initialized');
    }
    
    startPositionMonitoring() {
        console.log('👁️ Starting position monitoring...');
        
        this.intervals.positionMonitoring = setInterval(async () => {
            await this.monitorPositions();
        }, 5000); // Cada 5 segundos
    }
    
    startPortfolioAnalysis() {
        console.log('[CHART] Starting portfolio analysis...');
        
        this.intervals.portfolioAnalysis = setInterval(async () => {
            await this.analyzePortfolioPerformance();
        }, 30000); // Cada 30 segundos
    }
    
    startRiskAssessment() {
        console.log('🛡️ Starting risk assessment...');
        
        this.intervals.riskAssessment = setInterval(async () => {
            await this.assessPortfolioRisk();
        }, 10000); // Cada 10 segundos
    }
    
    startRebalancing() {
        console.log('[SCALES] Starting portfolio rebalancing...');
        
        this.intervals.rebalancing = setInterval(async () => {
            if (this.serviceState.rebalancingEnabled) {
                await this.performPortfolioRebalancing();
            }
        }, 300000); // Cada 5 minutos
    }
    
    async openPosition(positionData) {
        const {
            symbol,
            side, // 'LONG' | 'SHORT'
            size,
            leverage,
            entryPrice,
            stopLoss,
            takeProfit,
            orderId,
            timestamp = new Date(),
            source = 'api'
        } = positionData;
        
        try {
            // Validar que no exceda límites
            const riskValidation = this.validatePositionRisk(symbol, size, leverage);
            if (!riskValidation.isValid) {
                throw new Error(riskValidation.reason);
            }
            
            // Determinar tier del símbolo
            const tier = this.determineSymbolTier(symbol);
            
            // Crear posición
            const position = {
                id: `pos_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`,
                symbol,
                side,
                size,
                leverage,
                entryPrice,
                currentPrice: entryPrice,
                stopLoss,
                takeProfit,
                orderId,
                tier,
                
                // Timestamps
                openTime: timestamp,
                lastUpdate: timestamp,
                
                // P&L tracking
                unrealizedPnL: 0,
                realizedPnL: 0,
                fees: size * entryPrice * 0.0004, // 0.04% fee estimate
                
                // Margin calculation
                initialMargin: (size * entryPrice) / leverage,
                maintenanceMargin: (size * entryPrice) / (leverage * 2),
                
                // Risk metrics
                maxDrawdown: 0,
                peakValue: 0,
                
                // Status
                status: 'OPEN',
                source,
                
                // Dynamic stops
                trailingStop: stopLoss,
                highWaterMark: side === 'LONG' ? entryPrice : entryPrice
            };
            
            // Agregar posición
            this.positions.set(position.id, position);
            
            // Actualizar estado del portfolio
            this.updatePortfolioState();
            
            // Actualizar tier exposure
            this.portfolioState.tierExposure[tier].used += position.initialMargin;
            this.portfolioState.tierExposure[tier].positions += 1;
            
            console.log(`[TREND_UP] Position opened: ${symbol} ${side} ${size} @ ${entryPrice}`);
            
            // Emitir evento
            this.emit('position-opened', position);
            this.broadcast({
                type: 'position_opened',
                data: position
            });
            
            return position;
            
        } catch (error) {
            console.error(`[X] Error opening position for ${symbol}:`, error);
            throw error;
        }
    }
    
    async closePosition(positionId, closePrice, reason = 'manual') {
        try {
            const position = this.positions.get(positionId);
            if (!position) {
                throw new Error(`Position ${positionId} not found`);
            }
            
            // Calcular PnL final
            const pnl = this.calculatePositionPnL(position, closePrice);
            
            // Actualizar posición
            position.status = 'CLOSED';
            position.closeTime = new Date();
            position.closePrice = closePrice;
            position.realizedPnL = pnl;
            position.closeReason = reason;
            
            // Mover a posiciones cerradas
            this.positions.delete(positionId);
            this.closedPositions.push(position);
            
            // Actualizar tier exposure
            const tier = position.tier;
            this.portfolioState.tierExposure[tier].used -= position.initialMargin;
            this.portfolioState.tierExposure[tier].positions -= 1;
            
            // Actualizar portfolio state
            this.portfolioState.totalRealizedPnL += pnl;
            this.portfolioState.totalEquity += pnl;
            this.portfolioState.availableBalance += (position.initialMargin + pnl);
            this.portfolioState.totalTrades += 1;
            
            if (pnl > 0) {
                this.portfolioState.winningTrades += 1;
            } else {
                this.portfolioState.losingTrades += 1;
            }
            
            // Actualizar métricas
            this.updatePerformanceMetrics();
            
            console.log(`📉 Position closed: ${position.symbol} PnL: ${pnl.toFixed(2)} (${reason})`);
            
            // Emitir eventos
            this.emit('position-closed', { position, pnl, reason });
            this.broadcast({
                type: 'position_closed',
                data: { position, pnl, reason }
            });
            
            return { position, pnl, reason };
            
        } catch (error) {
            console.error(`[X] Error closing position ${positionId}:`, error);
            throw error;
        }
    }
    
    calculatePositionPnL(position, currentPrice = null) {
        const price = currentPrice || position.currentPrice;
        const { side, size, entryPrice } = position;
        
        let pnl;
        if (side === 'LONG') {
            pnl = (price - entryPrice) * size;
        } else { // SHORT
            pnl = (entryPrice - price) * size;
        }
        
        return pnl - position.fees;
    }
    
    validatePositionRisk(symbol, size, leverage) {
        const tier = this.determineSymbolTier(symbol);
        const notionalValue = size * 50000; // Assuming ~$50k average price
        const marginRequired = notionalValue / leverage;
        
        // Verificar límites de posiciones
        if (this.positions.size >= this.riskConfig.maxPositions) {
            return {
                isValid: false,
                reason: `Maximum positions limit reached (${this.riskConfig.maxPositions})`
            };
        }
        
        // Verificar margin disponible
        if (marginRequired > this.portfolioState.freeMargin) {
            return {
                isValid: false,
                reason: 'Insufficient free margin'
            };
        }
        
        // Verificar límites de tier
        const tierExposure = this.portfolioState.tierExposure[tier];
        if ((tierExposure.used + marginRequired) > tierExposure.allocated) {
            return {
                isValid: false,
                reason: `${tier} exposure limit exceeded`
            };
        }
        
        // Verificar leverage máximo
        if (leverage > this.riskConfig.maxLeverage) {
            return {
                isValid: false,
                reason: `Leverage exceeds maximum (${this.riskConfig.maxLeverage}x)`
            };
        }
        
        return { isValid: true };
    }
    
    determineSymbolTier(symbol) {
        // Determinar tier basado en configuración
        for (const [tier, config] of Object.entries(QUANTUM_TIER_CONFIG)) {
            if (config.symbols && config.symbols.includes(symbol)) {
                return tier;
            }
        }
        return 'TIER3'; // Default
    }
    
    async monitorPositions() {
        if (this.positions.size === 0) return;
        
        for (const [positionId, position] of this.positions) {
            try {
                // Actualizar precio actual (simulado)
                const currentPrice = await this.getCurrentPrice(position.symbol);
                position.currentPrice = currentPrice;
                position.lastUpdate = new Date();
                
                // Calcular PnL no realizado
                position.unrealizedPnL = this.calculatePositionPnL(position);
                
                // Verificar stops
                await this.checkStopLoss(position);
                await this.checkTakeProfit(position);
                
                // Actualizar trailing stop
                this.updateTrailingStop(position);
                
                // Verificar margin call
                this.checkMarginCall(position);
                
            } catch (error) {
                console.error(`Error monitoring position ${positionId}:`, error);
            }
        }
        
        // Actualizar estado del portfolio
        this.updatePortfolioState();
    }
    
    async getCurrentPrice(symbol) {
        // En implementación real, obtener precio desde exchange
        // Por ahora, simular movimiento de precio
        const basePrice = 50000; // $50k base
        const volatility = 0.001; // 0.1%
        const randomChange = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 2 * volatility;
        
        return basePrice * (1 + randomChange);
    }
    
    async checkStopLoss(position) {
        const { side, stopLoss, currentPrice } = position;
        let triggered = false;
        
        if (side === 'LONG' && currentPrice <= stopLoss) {
            triggered = true;
        } else if (side === 'SHORT' && currentPrice >= stopLoss) {
            triggered = true;
        }
        
        if (triggered) {
            console.log(`[SIREN] Stop-loss triggered for ${position.symbol}`);
            await this.closePosition(position.id, currentPrice, 'stop-loss');
        }
    }
    
    async checkTakeProfit(position) {
        const { side, takeProfit, currentPrice } = position;
        let triggered = false;
        
        if (side === 'LONG' && currentPrice >= takeProfit) {
            triggered = true;
        } else if (side === 'SHORT' && currentPrice <= takeProfit) {
            triggered = true;
        }
        
        if (triggered) {
            console.log(`🎆 Take-profit triggered for ${position.symbol}`);
            await this.closePosition(position.id, currentPrice, 'take-profit');
        }
    }
    
    updateTrailingStop(position) {
        if (!this.riskConfig.trailingStopEnabled) return;
        
        const { side, currentPrice, trailingStop } = position;
        const distance = this.riskConfig.trailingStopDistance;
        
        if (side === 'LONG') {
            if (currentPrice > position.highWaterMark) {
                position.highWaterMark = currentPrice;
                const newStop = currentPrice * (1 - distance);
                if (newStop > trailingStop) {
                    position.trailingStop = newStop;
                    position.stopLoss = newStop;
                }
            }
        } else { // SHORT
            if (currentPrice < position.highWaterMark) {
                position.highWaterMark = currentPrice;
                const newStop = currentPrice * (1 + distance);
                if (newStop < trailingStop) {
                    position.trailingStop = newStop;
                    position.stopLoss = newStop;
                }
            }
        }
    }
    
    checkMarginCall(position) {
        const marginRatio = position.initialMargin / (position.initialMargin + position.unrealizedPnL);
        
        if (marginRatio >= this.riskConfig.marginCallLevel) {
            console.log(`[SIREN] Margin call for ${position.symbol}`);
            this.emit('margin-call', position);
        }
        
        if (marginRatio >= this.riskConfig.liquidationLevel) {
            console.log(`[SIREN] Liquidation triggered for ${position.symbol}`);
            this.closePosition(position.id, position.currentPrice, 'liquidation');
        }
    }
    
    updatePortfolioState() {
        let totalUnrealizedPnL = 0;
        let usedMargin = 0;
        
        // Sumar PnL no realizado y margin usado
        for (const position of this.positions.values()) {
            totalUnrealizedPnL += position.unrealizedPnL;
            usedMargin += position.initialMargin;
        }
        
        // Actualizar estado
        this.portfolioState.totalUnrealizedPnL = totalUnrealizedPnL;
        this.portfolioState.usedMargin = usedMargin;
        this.portfolioState.freeMargin = this.portfolioState.totalEquity - usedMargin;
        this.portfolioState.marginRatio = usedMargin / this.portfolioState.totalEquity;
        
        // Calcular equity actual
        const currentEquity = this.portfolioState.totalEquity + totalUnrealizedPnL;
        
        // Actualizar peak y drawdown
        if (currentEquity > this.portfolioState.peakEquity) {
            this.portfolioState.peakEquity = currentEquity;
        } else {
            const drawdown = (this.portfolioState.peakEquity - currentEquity) / this.portfolioState.peakEquity;
            if (drawdown > this.portfolioState.maxDrawdown) {
                this.portfolioState.maxDrawdown = drawdown;
            }
        }
        
        this.serviceState.lastUpdate = new Date();
    }
    
    updatePerformanceMetrics() {
        const { winningTrades, losingTrades, totalTrades } = this.portfolioState;
        
        // Win rate
        this.portfolioState.winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
        
        // Average win/loss
        if (this.closedPositions.length > 0) {
            const wins = this.closedPositions.filter(p => p.realizedPnL > 0);
            const losses = this.closedPositions.filter(p => p.realizedPnL <= 0);
            
            this.portfolioState.averageWin = wins.length > 0 
                ? wins.reduce((sum, p) => sum + p.realizedPnL, 0) / wins.length 
                : 0;
                
            this.portfolioState.averageLoss = losses.length > 0
                ? Math.abs(losses.reduce((sum, p) => sum + p.realizedPnL, 0) / losses.length)
                : 0;
                
            // Profit factor
            const totalWins = wins.reduce((sum, p) => sum + p.realizedPnL, 0);
            const totalLosses = Math.abs(losses.reduce((sum, p) => sum + p.realizedPnL, 0));
            
            this.portfolioState.profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
        }
    }
    
    async analyzePortfolioPerformance() {
        // Análisis avanzado de performance
        this.updatePerformanceMetrics();
        
        // Broadcast actualización
        this.broadcast({
            type: 'portfolio_update',
            data: this.portfolioState
        });
    }
    
    async assessPortfolioRisk() {
        const totalRisk = this.portfolioState.marginRatio;
        const concentrationRisk = this.calculateConcentrationRisk();
        const correlationRisk = await this.calculateCorrelationRisk();
        
        const overallRisk = (totalRisk + concentrationRisk + correlationRisk) / 3;
        
        if (overallRisk > 0.8) {
            console.log('[SIREN] High portfolio risk detected');
            this.emit('high-risk-alert', { risk: overallRisk });
        }
    }
    
    calculateConcentrationRisk() {
        // Risk por concentración en pocos assets
        const positionSizes = Array.from(this.positions.values())
            .map(p => p.initialMargin);
            
        if (positionSizes.length === 0) return 0;
        
        const totalMargin = positionSizes.reduce((sum, size) => sum + size, 0);
        const maxPosition = Math.max(...positionSizes);
        
        return maxPosition / totalMargin; // Higher = more concentrated
    }
    
    async calculateCorrelationRisk() {
        // Simplified correlation risk
        const symbols = Array.from(this.positions.values()).map(p => p.symbol);
        const uniqueSymbols = new Set(symbols);
        
        // Si todas las posiciones están en el mismo símbolo, riesgo máximo
        if (uniqueSymbols.size === 1) return 1.0;
        
        // Menos diversificación = mayor riesgo
        return 1 - (uniqueSymbols.size / symbols.length);
    }
    
    async performPortfolioRebalancing() {
        console.log('[SCALES] Performing portfolio rebalancing...');
        
        // Verificar desbalance por tier
        const rebalanceNeeded = this.checkTierRebalanceNeeded();
        
        if (rebalanceNeeded.length > 0) {
            console.log(`[REFRESH] Rebalancing needed for tiers: ${rebalanceNeeded.join(', ')}`);
            // En implementación real, crear órdenes de rebalanceo
            this.emit('rebalance-needed', { tiers: rebalanceNeeded });
        }
    }
    
    checkTierRebalanceNeeded() {
        const tiersNeedingRebalance = [];
        
        for (const [tier, exposure] of Object.entries(this.portfolioState.tierExposure)) {
            const utilizationRatio = exposure.used / exposure.allocated;
            
            if (utilizationRatio > (1 + this.riskConfig.rebalanceThreshold) ||
                utilizationRatio < (1 - this.riskConfig.rebalanceThreshold)) {
                tiersNeedingRebalance.push(tier);
            }
        }
        
        return tiersNeedingRebalance;
    }
    
    broadcast(message) {
        const payload = JSON.stringify(message);
        this.subscribers.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        });
    }
    
    getPositions(filter = {}) {
        let positions = Array.from(this.positions.values());
        
        if (filter.symbol) {
            positions = positions.filter(p => p.symbol === filter.symbol);
        }
        
        if (filter.tier) {
            positions = positions.filter(p => p.tier === filter.tier);
        }
        
        if (filter.side) {
            positions = positions.filter(p => p.side === filter.side);
        }
        
        return positions;
    }
    
    getPortfolioSummary() {
        return {
            ...this.portfolioState,
            activePositions: this.positions.size,
            closedPositions: this.closedPositions.length,
            serviceState: this.serviceState,
            uptime: Date.now() - this.startTime.getTime()
        };
    }
    
    async stop() {
        console.log('[STOP] Stopping Position Manager...');
        
        // Limpiar intervalos
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        // Cerrar WebSocket server
        this.wss.close();
        
        this.serviceState.status = 'stopped';
        this.serviceState.isActive = false;
        
        console.log('[CHECK] Position Manager stopped');
    }
}

// Crear instancia del Position Manager
const positionManager = new QBTCPositionManager();

app.use(express.json());

// === POSITION MANAGER ROUTES ===

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: positionManager.serviceName,
        port: PORT,
        version: positionManager.version,
        activePositions: positionManager.positions.size,
        portfolioValue: positionManager.portfolioState.totalEquity,
        uptime: Date.now() - positionManager.startTime.getTime(),
        timestamp: new Date().toISOString()
    });
});

// Portfolio summary
app.get('/portfolio', (req, res) => {
    res.json({
        success: true,
        data: positionManager.getPortfolioSummary()
    });
});

// Get all positions
app.get('/positions', (req, res) => {
    const { symbol, tier, side } = req.query;
    const positions = positionManager.getPositions({ symbol, tier, side });
    
    res.json({
        success: true,
        data: positions,
        count: positions.length
    });
});

// Get specific position
app.get('/positions/:id', (req, res) => {
    const position = positionManager.positions.get(req.params.id);
    
    if (!position) {
        return res.status(404).json({
            success: false,
            message: 'Position not found'
        });
    }
    
    res.json({
        success: true,
        data: position
    });
});

// Open new position
app.post('/positions', async (req, res) => {
    try {
        const position = await positionManager.openPosition(req.body);
        
        res.json({
            success: true,
            message: 'Position opened successfully',
            data: position
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Close position
app.post('/positions/:id/close', async (req, res) => {
    try {
        const { closePrice, reason = 'manual' } = req.body;
        const result = await positionManager.closePosition(req.params.id, closePrice, reason);
        
        res.json({
            success: true,
            message: 'Position closed successfully',
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get closed positions history
app.get('/history', (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    const history = positionManager.closedPositions
        .slice(offset, offset + parseInt(limit))
        .sort((a, b) => new Date(b.closeTime) - new Date(a.closeTime));
    
    res.json({
        success: true,
        data: history,
        total: positionManager.closedPositions.length
    });
});

// Portfolio performance analytics
app.get('/analytics', (req, res) => {
    const analytics = {
        portfolio: positionManager.portfolioState,
        positions: {
            active: positionManager.positions.size,
            closed: positionManager.closedPositions.length,
            byTier: {}
        },
        risk: {
            marginRatio: positionManager.portfolioState.marginRatio,
            maxDrawdown: positionManager.portfolioState.maxDrawdown,
            concentrationRisk: positionManager.calculateConcentrationRisk()
        }
    };
    
    // Count positions by tier
    for (const position of positionManager.positions.values()) {
        analytics.positions.byTier[position.tier] = 
            (analytics.positions.byTier[position.tier] || 0) + 1;
    }
    
    res.json({
        success: true,
        data: analytics
    });
});

// Service status
app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            service: positionManager.serviceName,
            version: positionManager.version,
            status: positionManager.serviceState.status,
            uptime: Date.now() - positionManager.startTime.getTime(),
            isActive: positionManager.serviceState.isActive,
            monitoringEnabled: positionManager.serviceState.monitoringEnabled,
            rebalancingEnabled: positionManager.serviceState.rebalancingEnabled,
            activePositions: positionManager.positions.size,
            subscribers: positionManager.subscribers.size
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: positionManager.serviceName,
        version: positionManager.version,
        status: positionManager.serviceState.status,
        description: 'Advanced position management system for QBTC Dimensional Supreme',
        capabilities: [
            'Real-time position tracking',
            'Advanced PnL calculations',
            'Dynamic stop-loss and take-profit',
            'Portfolio risk management',
            'Tier-based exposure limits',
            'Automatic rebalancing',
            'Performance analytics',
            'Margin call monitoring',
            'WebSocket real-time updates'
        ],
        endpoints: {
            '/portfolio': 'Portfolio summary',
            '/positions': 'All positions (GET/POST)',
            '/positions/{id}': 'Specific position',
            '/positions/{id}/close': 'Close position',
            '/history': 'Closed positions history',
            '/analytics': 'Performance analytics',
            '/status': 'Service status',
            '/ws': 'WebSocket for real-time updates'
        },
        currentState: {
            activePositions: positionManager.positions.size,
            portfolioValue: positionManager.portfolioState.totalEquity.toFixed(2),
            unrealizedPnL: positionManager.portfolioState.totalUnrealizedPnL.toFixed(2),
            marginRatio: (positionManager.portfolioState.marginRatio * 100).toFixed(2) + '%',
            winRate: (positionManager.portfolioState.winRate * 100).toFixed(1) + '%'
        }
    });
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('[TREND_UP] QBTC Position Manager starting...');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
    console.log(`📉 Portfolio: http://localhost:${PORT}/portfolio`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    
    // Inicializar el Position Manager
    await positionManager.initialize();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, stopping Position Manager...');
    await positionManager.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[STOP] SIGINT received, stopping Position Manager...');
    await positionManager.stop();
    process.exit(0);
});

export default positionManager;
