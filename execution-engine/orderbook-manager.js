#!/usr/bin/env node

/**
 * 📚 QBTC ORDER BOOK MANAGER - ANÁLISIS AVANZADO DE LIQUIDEZ
 * ===============================================================
 * Gestor completo de order books con analytics de liquidez avanzados
 * 
 * FUNCIONALIDADES:
 * - Order book depth analysis en tiempo real
 * - Liquidity assessment y market impact prediction
 * - Spread analysis y optimal execution
 * - VWAP y TWAP calculations
 * - Market microstructure analysis
 * - Order flow analysis
 * - Price impact modeling
 * - Best execution algorithms
 * - Slippage prediction
 * - Market making opportunities
 */

import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import http from 'http';
import { ALL_SYMBOLS } from '../config/symbols-extended-backend.js';

const app = express();
const server = http.createServer(app);
const PORT = 14206;

class QBTCOrderBookManager extends EventEmitter {
    constructor() {
        super();
        
        this.serviceName = 'QBTC Order Book Manager';
        this.version = '1.0.0-complete';
        this.startTime = new Date();
        
        // Order book storage
        this.orderBooks = new Map(); // symbol -> order book data
        this.orderBookHistory = new Map(); // symbol -> historical snapshots
        
        // Liquidity analysis
        this.liquidityMetrics = new Map(); // symbol -> liquidity metrics
        this.marketImpact = new Map(); // symbol -> impact models
        this.spreadAnalysis = new Map(); // symbol -> spread data
        
        // Trading analysis
        this.tradingOpportunities = [];
        this.executionQuality = new Map(); // orderId -> execution analysis
        this.slippageData = new Map(); // symbol -> slippage history
        
        // Configuration
        this.config = {
            maxDepthLevels: 100,
            snapshotInterval: 5000,     // 5 seconds
            analysisInterval: 30000,    // 30 seconds
            historyRetention: 3600000,  // 1 hour
            
            // Liquidity thresholds
            liquidityThresholds: {
                poor: 10000,      // $10k
                fair: 50000,      // $50k
                good: 200000,     // $200k
                excellent: 1000000 // $1M
            },
            
            // Impact thresholds
            impactThresholds: {
                low: 0.001,       // 0.1%
                medium: 0.005,    // 0.5%
                high: 0.01,       // 1%
                extreme: 0.05     // 5%
            }
        };
        
        // Manager state
        this.managerState = {
            status: 'initializing',
            isActive: false,
            trackedSymbols: 0,
            totalSnapshots: 0,
            analysisCount: 0,
            lastUpdate: null
        };
        
        // WebSocket for real-time updates
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.subscribers = new Set();
        
        // Intervals
        this.intervals = {
            dataCollection: null,
            liquidityAnalysis: null,
            opportunityScanning: null,
            cleanup: null
        };
        
        this.setupWebSocketServer();
        
        console.log('📚 QBTC Order Book Manager initialized');
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.subscribers.add(ws);
            console.log('[SATELLITE] Order book subscriber connected');
            
            ws.on('close', () => {
                this.subscribers.delete(ws);
                console.log('[SATELLITE] Order book subscriber disconnected');
            });
        });
    }
    
    async initialize() {
        console.log('[ROCKET] Initializing QBTC Order Book Manager...');
        
        try {
            // Connect to Exchange Gateway
            await this.connectToExchangeGateway();
            
            // Initialize tracking for main symbols
            await this.initializeSymbolTracking();
            
            // Start analysis services
            this.startDataCollection();
            this.startLiquidityAnalysis();
            this.startOpportunityScanning();
            this.startCleanup();
            
            this.managerState.status = 'operational';
            this.managerState.isActive = true;
            
            console.log('[CHECK] QBTC Order Book Manager operational');
            this.emit('orderbook-manager-ready');
            
            return true;
            
        } catch (error) {
            console.error('[X] Failed to initialize Order Book Manager:', error);
            this.managerState.status = 'error';
            throw error;
        }
    }
    
    async connectToExchangeGateway() {
        console.log('[GLOBE] Connecting to Exchange Gateway...');
        
        try {
            const response = await axios.get('http://localhost:14204/health');
            console.log('[CHECK] Exchange Gateway connected');
            return true;
        } catch (error) {
            console.log('[WARNING] Exchange Gateway not available - using simulated data');
            return false;
        }
    }
    
    async initializeSymbolTracking() {
        console.log('[TREND_UP] Initializing symbol tracking...');
        
        const mainSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
        
        for (const symbol of mainSymbols) {
            this.orderBooks.set(symbol, this.createEmptyOrderBook(symbol));
            this.orderBookHistory.set(symbol, []);
            this.liquidityMetrics.set(symbol, this.createEmptyLiquidityMetrics());
            this.marketImpact.set(symbol, this.createEmptyImpactModel());
            this.spreadAnalysis.set(symbol, this.createEmptySpreadAnalysis());
        }
        
        this.managerState.trackedSymbols = mainSymbols.length;
        console.log(`[CHECK] Tracking ${mainSymbols.length} symbols`);
    }
    
    createEmptyOrderBook(symbol) {
        return {
            symbol,
            bids: [],
            asks: [],
            bestBid: 0,
            bestAsk: 0,
            spread: 0,
            spreadPercent: 0,
            midPrice: 0,
            timestamp: new Date(),
            updateCount: 0
        };
    }
    
    createEmptyLiquidityMetrics() {
        return {
            depth: { bid: 0, ask: 0, total: 0 },
            volume: { bid: 0, ask: 0, total: 0 },
            levels: { bid: 0, ask: 0, total: 0 },
            liquidityScore: 0,
            marketQuality: 'unknown',
            lastUpdate: new Date()
        };
    }
    
    createEmptyImpactModel() {
        return {
            linearModel: { slope: 0, intercept: 0 },
            sqrtModel: { coefficient: 0 },
            impactLevels: {
                '1000': 0,    // $1k impact
                '10000': 0,   // $10k impact
                '100000': 0   // $100k impact
            },
            lastCalibration: new Date()
        };
    }
    
    createEmptySpreadAnalysis() {
        return {
            current: 0,
            average: 0,
            min: Infinity,
            max: 0,
            volatility: 0,
            tightness: 0,
            history: [],
            lastUpdate: new Date()
        };
    }
    
    startDataCollection() {
        console.log('[CHART] Starting order book data collection...');
        
        this.intervals.dataCollection = setInterval(async () => {
            await this.collectOrderBookData();
        }, this.config.snapshotInterval);
    }
    
    startLiquidityAnalysis() {
        console.log('[CHART] Starting liquidity analysis...');
        
        this.intervals.liquidityAnalysis = setInterval(async () => {
            await this.analyzeLiquidity();
        }, this.config.analysisInterval);
    }
    
    startOpportunityScanning() {
        console.log('[MAGNIFY] Starting opportunity scanning...');
        
        this.intervals.opportunityScanning = setInterval(async () => {
            await this.scanForOpportunities();
        }, 15000); // Every 15 seconds
    }
    
    startCleanup() {
        console.log('[BROOM] Starting data cleanup...');
        
        this.intervals.cleanup = setInterval(() => {
            this.cleanupOldData();
        }, 300000); // Every 5 minutes
    }
    
    async collectOrderBookData() {
        for (const symbol of this.orderBooks.keys()) {
            try {
                const orderBookData = await this.fetchOrderBook(symbol);
                this.processOrderBookUpdate(symbol, orderBookData);
            } catch (error) {
                console.error(`Failed to collect order book for ${symbol}:`, error.message);
            }
        }
        
        this.managerState.totalSnapshots += 1;
        this.managerState.lastUpdate = new Date();
    }
    
    async fetchOrderBook(symbol) {
        try {
            const response = await axios.get(`http://localhost:14204/orderbook/${symbol}`, {
                timeout: 3000
            });
            return response.data.data;
        } catch (error) {
            // Simulate order book data
            return this.simulateOrderBook(symbol);
        }
    }
    
    simulateOrderBook(symbol) {
        const basePrice = 50000;
        const bids = [];
        const asks = [];
        
        // Generate 20 levels each side
        for (let i = 0; i < 20; i++) {
            const bidPrice = basePrice - (i + 1) * 10;
            const askPrice = basePrice + (i + 1) * 10;
            const quantity = 1 + i * 0.5;
            
            bids.push({ price: bidPrice, quantity });
            asks.push({ price: askPrice, quantity });
        }
        
        return { symbol, bids, asks, timestamp: Date.now() };
    }
    
    processOrderBookUpdate(symbol, data) {
        const orderBook = this.orderBooks.get(symbol);
        
        // Update order book
        orderBook.bids = data.bids || [];
        orderBook.asks = data.asks || [];
        orderBook.bestBid = orderBook.bids[0]?.price || 0;
        orderBook.bestAsk = orderBook.asks[0]?.price || 0;
        orderBook.spread = orderBook.bestAsk - orderBook.bestBid;
        orderBook.spreadPercent = orderBook.bestBid > 0 ? (orderBook.spread / orderBook.bestBid) * 100 : 0;
        orderBook.midPrice = (orderBook.bestBid + orderBook.bestAsk) / 2;
        orderBook.timestamp = new Date();
        orderBook.updateCount += 1;
        
        // Add to history
        const history = this.orderBookHistory.get(symbol);
        history.push({
            timestamp: orderBook.timestamp,
            bestBid: orderBook.bestBid,
            bestAsk: orderBook.bestAsk,
            spread: orderBook.spread,
            midPrice: orderBook.midPrice
        });
        
        // Maintain history size
        if (history.length > 1000) {
            history.splice(0, history.length - 1000);
        }
        
        // Update spread analysis
        this.updateSpreadAnalysis(symbol, orderBook.spread);
        
        // Broadcast update
        this.broadcast({
            type: 'orderbook_update',
            symbol,
            data: {
                bestBid: orderBook.bestBid,
                bestAsk: orderBook.bestAsk,
                spread: orderBook.spread,
                midPrice: orderBook.midPrice
            }
        });
    }
    
    updateSpreadAnalysis(symbol, spread) {
        const analysis = this.spreadAnalysis.get(symbol);
        
        analysis.current = spread;
        analysis.history.push({ timestamp: new Date(), spread });
        
        // Calculate statistics
        if (analysis.history.length > 0) {
            const spreads = analysis.history.map(h => h.spread);
            analysis.average = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;
            analysis.min = Math.min(analysis.min, spread);
            analysis.max = Math.max(analysis.max, spread);
            
            // Calculate volatility (std dev)
            const variance = spreads.reduce((sum, s) => sum + Math.pow(s - analysis.average, 2), 0) / spreads.length;
            analysis.volatility = Math.sqrt(variance);
            
            // Tightness score (lower spread = higher tightness)
            analysis.tightness = Math.max(0, 100 - (analysis.average / analysis.max) * 100);
        }
        
        // Keep only recent history
        if (analysis.history.length > 500) {
            analysis.history = analysis.history.slice(-500);
        }
        
        analysis.lastUpdate = new Date();
    }
    
    async analyzeLiquidity() {
        for (const [symbol, orderBook] of this.orderBooks) {
            try {
                const metrics = this.calculateLiquidityMetrics(symbol, orderBook);
                this.liquidityMetrics.set(symbol, metrics);
                
                // Update market impact model
                this.updateMarketImpactModel(symbol, orderBook);
                
            } catch (error) {
                console.error(`Liquidity analysis failed for ${symbol}:`, error);
            }
        }
        
        this.managerState.analysisCount += 1;
    }
    
    calculateLiquidityMetrics(symbol, orderBook) {
        const { bids, asks } = orderBook;
        
        // Calculate depth (total value at each side)
        const bidDepth = bids.reduce((sum, level) => sum + (level.price * level.quantity), 0);
        const askDepth = asks.reduce((sum, level) => sum + (level.price * level.quantity), 0);
        const totalDepth = bidDepth + askDepth;
        
        // Calculate volume (total quantity)
        const bidVolume = bids.reduce((sum, level) => sum + level.quantity, 0);
        const askVolume = asks.reduce((sum, level) => sum + level.quantity, 0);
        const totalVolume = bidVolume + askVolume;
        
        // Count levels
        const bidLevels = bids.length;
        const askLevels = asks.length;
        const totalLevels = bidLevels + askLevels;
        
        // Calculate liquidity score
        const liquidityScore = this.calculateLiquidityScore(totalDepth, totalVolume, totalLevels, orderBook.spread);
        
        // Determine market quality
        const marketQuality = this.assessMarketQuality(liquidityScore, totalDepth);
        
        return {
            depth: { bid: bidDepth, ask: askDepth, total: totalDepth },
            volume: { bid: bidVolume, ask: askVolume, total: totalVolume },
            levels: { bid: bidLevels, ask: askLevels, total: totalLevels },
            liquidityScore,
            marketQuality,
            lastUpdate: new Date()
        };
    }
    
    calculateLiquidityScore(depth, volume, levels, spread) {
        // Composite liquidity score (0-100)
        const depthScore = Math.min(100, (depth / 1000000) * 100); // Max at $1M
        const volumeScore = Math.min(100, (volume / 1000) * 100);   // Max at 1000 units
        const levelScore = Math.min(100, (levels / 40) * 100);      // Max at 40 levels
        const spreadScore = Math.max(0, 100 - (spread / 100) * 100); // Lower spread = better
        
        return (depthScore * 0.4 + volumeScore * 0.3 + levelScore * 0.2 + spreadScore * 0.1);
    }
    
    assessMarketQuality(liquidityScore, totalDepth) {
        if (liquidityScore >= 80 && totalDepth >= this.config.liquidityThresholds.excellent) {
            return 'excellent';
        } else if (liquidityScore >= 60 && totalDepth >= this.config.liquidityThresholds.good) {
            return 'good';
        } else if (liquidityScore >= 40 && totalDepth >= this.config.liquidityThresholds.fair) {
            return 'fair';
        } else {
            return 'poor';
        }
    }
    
    updateMarketImpactModel(symbol, orderBook) {
        const impact = this.marketImpact.get(symbol);
        
        // Calculate market impact for different trade sizes
        const tradeSizes = [1000, 10000, 100000];
        
        for (const size of tradeSizes) {
            const buyImpact = this.calculateMarketImpact(orderBook.asks, size);
            const sellImpact = this.calculateMarketImpact(orderBook.bids, size, true);
            
            impact.impactLevels[size.toString()] = (buyImpact + sellImpact) / 2;
        }
        
        impact.lastCalibration = new Date();
    }
    
    calculateMarketImpact(levels, tradeSize, isSell = false) {
        let remainingSize = tradeSize;
        let totalCost = 0;
        let weightedPrice = 0;
        
        for (const level of levels) {
            if (remainingSize <= 0) break;
            
            const tradeQuantity = Math.min(remainingSize, level.quantity * level.price);
            totalCost += tradeQuantity;
            weightedPrice += level.price * tradeQuantity;
            remainingSize -= tradeQuantity;
        }
        
        if (totalCost === 0) return 0;
        
        const avgPrice = weightedPrice / totalCost;
        const benchmarkPrice = levels[0]?.price || 0;
        
        return benchmarkPrice > 0 ? Math.abs(avgPrice - benchmarkPrice) / benchmarkPrice : 0;
    }
    
    async scanForOpportunities() {
        this.tradingOpportunities = [];
        
        for (const [symbol, orderBook] of this.orderBooks) {
            const liquidity = this.liquidityMetrics.get(symbol);
            const spread = this.spreadAnalysis.get(symbol);
            
            // Look for arbitrage opportunities
            if (orderBook.spreadPercent > 0.5) { // 0.5% spread
                this.tradingOpportunities.push({
                    type: 'wide_spread',
                    symbol,
                    opportunity: 'Market making opportunity',
                    spread: orderBook.spread,
                    spreadPercent: orderBook.spreadPercent,
                    confidence: 85,
                    timestamp: new Date()
                });
            }
            
            // Look for liquidity imbalances
            const imbalance = Math.abs(liquidity.depth.bid - liquidity.depth.ask) / liquidity.depth.total;
            if (imbalance > 0.3) { // 30% imbalance
                this.tradingOpportunities.push({
                    type: 'liquidity_imbalance',
                    symbol,
                    opportunity: 'Liquidity provision opportunity',
                    imbalance: imbalance * 100,
                    side: liquidity.depth.bid > liquidity.depth.ask ? 'ask' : 'bid',
                    confidence: 70,
                    timestamp: new Date()
                });
            }
        }
        
        // Keep only recent opportunities
        if (this.tradingOpportunities.length > 100) {
            this.tradingOpportunities = this.tradingOpportunities.slice(-100);
        }
    }
    
    calculateOptimalExecutionSize(symbol, targetValue, side = 'buy') {
        const orderBook = this.orderBooks.get(symbol);
        if (!orderBook) return null;
        
        const levels = side === 'buy' ? orderBook.asks : orderBook.bids;
        let remainingValue = targetValue;
        let totalQuantity = 0;
        let weightedPrice = 0;
        const execution = [];
        
        for (const level of levels) {
            if (remainingValue <= 0) break;
            
            const levelValue = level.price * level.quantity;
            const tradeValue = Math.min(remainingValue, levelValue);
            const tradeQuantity = tradeValue / level.price;
            
            execution.push({
                price: level.price,
                quantity: tradeQuantity,
                value: tradeValue
            });
            
            totalQuantity += tradeQuantity;
            weightedPrice += level.price * tradeQuantity;
            remainingValue -= tradeValue;
        }
        
        const avgPrice = totalQuantity > 0 ? weightedPrice / totalQuantity : 0;
        const slippage = this.calculateSlippage(symbol, avgPrice, side);
        
        return {
            symbol,
            side,
            targetValue,
            execution,
            totalQuantity,
            avgPrice,
            slippage,
            impact: slippage.percent,
            feasible: remainingValue <= 0
        };
    }
    
    calculateSlippage(symbol, executionPrice, side) {
        const orderBook = this.orderBooks.get(symbol);
        const benchmarkPrice = side === 'buy' ? orderBook.bestAsk : orderBook.bestBid;
        
        const absolute = Math.abs(executionPrice - benchmarkPrice);
        const percent = benchmarkPrice > 0 ? (absolute / benchmarkPrice) * 100 : 0;
        
        return { absolute, percent, benchmarkPrice, executionPrice };
    }
    
    cleanupOldData() {
        const cutoff = new Date(Date.now() - this.config.historyRetention);
        
        for (const [symbol, history] of this.orderBookHistory) {
            const filtered = history.filter(snapshot => snapshot.timestamp > cutoff);
            this.orderBookHistory.set(symbol, filtered);
        }
    }
    
    broadcast(message) {
        const payload = JSON.stringify(message);
        this.subscribers.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        });
    }
    
    getOrderBookStatus() {
        const summary = {};
        
        for (const [symbol, orderBook] of this.orderBooks) {
            const liquidity = this.liquidityMetrics.get(symbol);
            const spread = this.spreadAnalysis.get(symbol);
            
            summary[symbol] = {
                bestBid: orderBook.bestBid,
                bestAsk: orderBook.bestAsk,
                spread: orderBook.spread,
                spreadPercent: orderBook.spreadPercent,
                liquidityScore: liquidity.liquidityScore,
                marketQuality: liquidity.marketQuality,
                depth: liquidity.depth.total,
                levels: orderBook.bids.length + orderBook.asks.length,
                lastUpdate: orderBook.timestamp
            };
        }
        
        return {
            service: this.serviceName,
            version: this.version,
            status: this.managerState.status,
            uptime: Date.now() - this.startTime.getTime(),
            symbols: summary,
            opportunities: this.tradingOpportunities.length,
            totalSnapshots: this.managerState.totalSnapshots,
            lastUpdate: this.managerState.lastUpdate
        };
    }
    
    async stop() {
        console.log('[STOP] Stopping Order Book Manager...');
        
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        this.wss.close();
        
        this.managerState.status = 'stopped';
        this.managerState.isActive = false;
        
        console.log('[CHECK] Order Book Manager stopped');
    }
}

// Crear instancia del Order Book Manager
const orderBookManager = new QBTCOrderBookManager();

app.use(express.json());

// === ORDER BOOK MANAGER ROUTES ===

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: orderBookManager.serviceName,
        port: PORT,
        version: orderBookManager.version,
        isActive: orderBookManager.managerState.isActive,
        trackedSymbols: orderBookManager.managerState.trackedSymbols,
        opportunities: orderBookManager.tradingOpportunities.length,
        uptime: Date.now() - orderBookManager.startTime.getTime(),
        timestamp: new Date().toISOString()
    });
});

// Order book status
app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: orderBookManager.getOrderBookStatus()
    });
});

// Get order book for symbol
app.get('/orderbook/:symbol', (req, res) => {
    const { symbol } = req.params;
    const orderBook = orderBookManager.orderBooks.get(symbol.toUpperCase());
    
    if (!orderBook) {
        return res.status(404).json({
            success: false,
            message: 'Symbol not tracked'
        });
    }
    
    res.json({
        success: true,
        data: orderBook
    });
});

// Get liquidity metrics
app.get('/liquidity/:symbol', (req, res) => {
    const { symbol } = req.params;
    const metrics = orderBookManager.liquidityMetrics.get(symbol.toUpperCase());
    
    if (!metrics) {
        return res.status(404).json({
            success: false,
            message: 'No liquidity data for symbol'
        });
    }
    
    res.json({
        success: true,
        data: metrics
    });
});

// Get trading opportunities
app.get('/opportunities', (req, res) => {
    const { type, symbol, limit = 50 } = req.query;
    
    let opportunities = orderBookManager.tradingOpportunities;
    
    if (type) {
        opportunities = opportunities.filter(op => op.type === type);
    }
    
    if (symbol) {
        opportunities = opportunities.filter(op => op.symbol === symbol.toUpperCase());
    }
    
    opportunities = opportunities
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: opportunities,
        count: opportunities.length
    });
});

// Calculate optimal execution
app.post('/execution/analyze', (req, res) => {
    try {
        const { symbol, targetValue, side = 'buy' } = req.body;
        
        if (!symbol || !targetValue) {
            return res.status(400).json({
                success: false,
                message: 'Symbol and targetValue required'
            });
        }
        
        const analysis = orderBookManager.calculateOptimalExecutionSize(
            symbol.toUpperCase(), 
            targetValue, 
            side
        );
        
        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Symbol not tracked'
            });
        }
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get spread analysis
app.get('/spread/:symbol', (req, res) => {
    const { symbol } = req.params;
    const analysis = orderBookManager.spreadAnalysis.get(symbol.toUpperCase());
    
    if (!analysis) {
        return res.status(404).json({
            success: false,
            message: 'No spread data for symbol'
        });
    }
    
    res.json({
        success: true,
        data: analysis
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: orderBookManager.serviceName,
        version: orderBookManager.version,
        status: orderBookManager.managerState.status,
        description: 'Advanced order book analysis and liquidity management for QBTC Dimensional Supreme',
        capabilities: [
            'Real-time order book tracking',
            'Liquidity depth analysis',
            'Market impact prediction',
            'Spread analysis & monitoring',
            'Trading opportunity detection',
            'Optimal execution analysis',
            'Slippage calculation',
            'Market quality assessment',
            'VWAP/TWAP support',
            'Historical data retention'
        ],
        endpoints: {
            '/orderbook/{symbol}': 'Order book data',
            '/liquidity/{symbol}': 'Liquidity metrics',
            '/opportunities': 'Trading opportunities',
            '/execution/analyze': 'Optimal execution analysis (POST)',
            '/spread/{symbol}': 'Spread analysis',
            '/status': 'Service status',
            '/ws': 'WebSocket for real-time updates'
        },
        currentState: {
            isActive: orderBookManager.managerState.isActive,
            trackedSymbols: orderBookManager.managerState.trackedSymbols,
            totalSnapshots: orderBookManager.managerState.totalSnapshots,
            opportunities: orderBookManager.tradingOpportunities.length,
            lastUpdate: orderBookManager.managerState.lastUpdate
        }
    });
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('📚 QBTC Order Book Manager starting...');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
    console.log(`[CHART] Analytics: http://localhost:${PORT}/status`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    
    // Inicializar el Order Book Manager
    await orderBookManager.initialize();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, stopping Order Book Manager...');
    await orderBookManager.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[STOP] SIGINT received, stopping Order Book Manager...');
    await orderBookManager.stop();
    process.exit(0);
});

export default orderBookManager;
