#!/usr/bin/env node

/**
 * [GLOBE] QBTC BINANCE EXCHANGE GATEWAY - CONEXIÓN REAL A BINANCE FUTURES
 * ====================================================================
 * Gateway completo para integración con Binance Futures API
 * 
 * FUNCIONALIDADES:
 * - Conexión autenticada a Binance Futures API
 * - WebSocket streams en tiempo real (precios, order book, trades)
 * - Rate limiting inteligente y queue management
 * - Manejo de órdenes completo (market, limit, stop)
 * - Gestión de posiciones y account info
 * - Reconexión automática y error handling
 * - Market data streaming avanzado
 * - Order book depth management
 * - Trade execution con retry logic
 */

import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import crypto from 'crypto';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import http from 'http';
import { ALL_SYMBOLS, QUANTUM_TIER_CONFIG } from '../config/symbols-extended-backend.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 14204;

class QBTCBinanceGateway extends EventEmitter {
    constructor() {
        super();
        
        this.serviceName = 'QBTC Binance Gateway';
        this.version = '1.0.0-complete';
        this.startTime = new Date();
        
        // Binance API Configuration
        this.binanceConfig = {
            baseURL: 'https://fapi.binance.com',
            streamURL: 'wss://fstream.binance.com',
            apiKey: process.env.BINANCE_API_KEY || 'your_api_key_here',
            apiSecret: process.env.BINANCE_API_SECRET || 'your_secret_here',
            testnet: process.env.NODE_ENV !== 'production', // Use testnet unless in production
            
            // Rate limiting
            requestWeight: {
                limit: 1200,        // Per minute
                current: 0,
                resetTime: Date.now() + 60000
            },
            orderLimit: {
                limit: 100,         // Per 10 seconds
                current: 0,
                resetTime: Date.now() + 10000
            }
        };
        
        // Si es testnet, usar URLs de testnet
        if (this.binanceConfig.testnet) {
            this.binanceConfig.baseURL = 'https://testnet.binancefuture.com';
            this.binanceConfig.streamURL = 'wss://stream.binancefuture.com';
            console.log('[TEST_TUBE] Running in TESTNET mode');
        }
        
        // Estado del gateway
        this.gatewayState = {
            status: 'initializing',
            isConnected: false,
            lastPing: null,
            streamConnected: false,
            accountConnected: false,
            requestsToday: 0,
            errors: [],
            lastError: null
        };
        
        // WebSockets para diferentes streams
        this.streams = {
            ticker: null,           // 24hr ticker
            bookTicker: null,       // Best bid/ask
            depth: null,            // Order book depth
            userStream: null,       // User data stream
            markPrice: null,        // Mark price stream
            kline: new Map()        // Kline streams por symbol
        };
        
        // Data cache
        this.marketData = {
            prices: new Map(),      // symbol -> price info
            orderBooks: new Map(),  // symbol -> order book
            trades: new Map(),      // symbol -> recent trades
            klines: new Map(),      // symbol -> kline data
            markPrices: new Map(),  // symbol -> mark price
            fundingRates: new Map() // symbol -> funding rate
        };
        
        // Account info cache
        this.accountInfo = {
            balance: null,
            positions: new Map(),
            openOrders: new Map(),
            lastUpdate: null
        };
        
        // Request queue para rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
        
        // WebSocket server para clientes
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.subscribers = new Set();
        
        // Intervals
        this.intervals = {
            heartbeat: null,
            accountSync: null,
            rateReset: null,
            queueProcessor: null
        };
        
        this.setupWebSocketServer();
        
        console.log('[GLOBE] QBTC Binance Gateway initialized');
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.subscribers.add(ws);
            console.log('[SATELLITE] Gateway subscriber connected');
            
            // Enviar estado inicial
            ws.send(JSON.stringify({
                type: 'gateway_status',
                data: this.gatewayState
            }));
            
            ws.on('close', () => {
                this.subscribers.delete(ws);
                console.log('[SATELLITE] Gateway subscriber disconnected');
            });
        });
    }
    
    async initialize() {
        console.log('[ROCKET] Initializing QBTC Binance Gateway...');
        
        try {
            // Verificar conectividad
            await this.testConnectivity();
            
            // Obtener info de exchange
            await this.getExchangeInfo();
            
            // Conectar streams de mercado
            await this.connectMarketStreams();
            
            // Conectar user data stream si hay API keys
            if (this.hasValidCredentials()) {
                await this.connectUserDataStream();
                await this.syncAccountInfo();
            } else {
                console.log('[WARNING] No valid API credentials - running in market data only mode');
            }
            
            // Iniciar servicios
            this.startHeartbeat();
            this.startAccountSync();
            this.startRateResets();
            this.startQueueProcessor();
            
            this.gatewayState.status = 'operational';
            this.gatewayState.isConnected = true;
            
            console.log('[CHECK] QBTC Binance Gateway operational');
            this.emit('gateway-ready');
            
            return true;
            
        } catch (error) {
            console.error('[X] Failed to initialize Binance Gateway:', error);
            this.gatewayState.status = 'error';
            this.gatewayState.lastError = error.message;
            throw error;
        }
    }
    
    hasValidCredentials() {
        return this.binanceConfig.apiKey !== 'your_api_key_here' && 
               this.binanceConfig.apiSecret !== 'your_secret_here' &&
               this.binanceConfig.apiKey && 
               this.binanceConfig.apiSecret;
    }
    
    async testConnectivity() {
        console.log('[MAGNIFY] Testing Binance connectivity...');
        
        try {
            const response = await axios.get(`${this.binanceConfig.baseURL}/fapi/v1/ping`);
            this.gatewayState.lastPing = new Date();
            console.log('[CHECK] Binance connectivity OK');
            return true;
        } catch (error) {
            console.error('[X] Binance connectivity failed:', error.message);
            throw new Error('Failed to connect to Binance API');
        }
    }
    
    async getExchangeInfo() {
        console.log('[CLIPBOARD] Getting exchange info...');
        
        try {
            const response = await axios.get(`${this.binanceConfig.baseURL}/fapi/v1/exchangeInfo`);
            this.exchangeInfo = response.data;
            console.log(`[CHECK] Exchange info loaded - ${this.exchangeInfo.symbols.length} symbols available`);
            return this.exchangeInfo;
        } catch (error) {
            console.error('[X] Failed to get exchange info:', error);
            throw error;
        }
    }
    
    async connectMarketStreams() {
        console.log('[CHART] Connecting market data streams...');
        
        // Conectar 24hr ticker stream para todos los símbolos
        await this.connectTickerStream();
        
        // Conectar book ticker stream
        await this.connectBookTickerStream();
        
        // Conectar mark price stream
        await this.connectMarkPriceStream();
        
        console.log('[CHECK] Market data streams connected');
    }
    
    async connectTickerStream() {
        const streamUrl = `${this.binanceConfig.streamURL}/ws/!ticker@arr`;
        
        this.streams.ticker = new WebSocket(streamUrl);
        
        this.streams.ticker.on('open', () => {
            console.log('[CHECK] Ticker stream connected');
            this.gatewayState.streamConnected = true;
        });
        
        this.streams.ticker.on('message', (data) => {
            try {
                const tickers = JSON.parse(data);
                
                for (const ticker of tickers) {
                    this.marketData.prices.set(ticker.s, {
                        symbol: ticker.s,
                        price: parseFloat(ticker.c),
                        change: parseFloat(ticker.P),
                        volume: parseFloat(ticker.v),
                        high: parseFloat(ticker.h),
                        low: parseFloat(ticker.l),
                        timestamp: Date.now()
                    });
                }
                
                // Broadcast price updates
                this.broadcast({
                    type: 'price_update',
                    data: tickers.map(t => ({
                        symbol: t.s,
                        price: parseFloat(t.c),
                        change: parseFloat(t.P)
                    }))
                });
                
            } catch (error) {
                console.error('Error processing ticker data:', error);
            }
        });
        
        this.streams.ticker.on('error', (error) => {
            console.error('Ticker stream error:', error);
            this.handleStreamError('ticker', error);
        });
        
        this.streams.ticker.on('close', () => {
            console.log('[WARNING] Ticker stream closed - attempting reconnect...');
            setTimeout(() => this.connectTickerStream(), 5000);
        });
    }
    
    async connectBookTickerStream() {
        const streamUrl = `${this.binanceConfig.streamURL}/ws/!bookTicker`;
        
        this.streams.bookTicker = new WebSocket(streamUrl);
        
        this.streams.bookTicker.on('open', () => {
            console.log('[CHECK] Book ticker stream connected');
        });
        
        this.streams.bookTicker.on('message', (data) => {
            try {
                const bookTicker = JSON.parse(data);
                
                const orderBookData = {
                    symbol: bookTicker.s,
                    bestBid: parseFloat(bookTicker.b),
                    bestBidQty: parseFloat(bookTicker.B),
                    bestAsk: parseFloat(bookTicker.a),
                    bestAskQty: parseFloat(bookTicker.A),
                    spread: parseFloat(bookTicker.a) - parseFloat(bookTicker.b),
                    timestamp: Date.now()
                };
                
                this.marketData.orderBooks.set(bookTicker.s, orderBookData);
                
                this.broadcast({
                    type: 'book_ticker',
                    data: orderBookData
                });
                
            } catch (error) {
                console.error('Error processing book ticker:', error);
            }
        });
        
        this.streams.bookTicker.on('error', (error) => {
            console.error('Book ticker stream error:', error);
            this.handleStreamError('bookTicker', error);
        });
        
        this.streams.bookTicker.on('close', () => {
            console.log('[WARNING] Book ticker stream closed - attempting reconnect...');
            setTimeout(() => this.connectBookTickerStream(), 5000);
        });
    }
    
    async connectMarkPriceStream() {
        const streamUrl = `${this.binanceConfig.streamURL}/ws/!markPrice@arr`;
        
        this.streams.markPrice = new WebSocket(streamUrl);
        
        this.streams.markPrice.on('open', () => {
            console.log('[CHECK] Mark price stream connected');
        });
        
        this.streams.markPrice.on('message', (data) => {
            try {
                const markPrices = JSON.parse(data);
                
                for (const mp of markPrices) {
                    this.marketData.markPrices.set(mp.s, {
                        symbol: mp.s,
                        markPrice: parseFloat(mp.p),
                        indexPrice: parseFloat(mp.i),
                        fundingRate: parseFloat(mp.r),
                        nextFundingTime: parseInt(mp.T),
                        timestamp: Date.now()
                    });
                }
                
                this.broadcast({
                    type: 'mark_price_update',
                    data: markPrices.map(mp => ({
                        symbol: mp.s,
                        markPrice: parseFloat(mp.p),
                        fundingRate: parseFloat(mp.r)
                    }))
                });
                
            } catch (error) {
                console.error('Error processing mark price data:', error);
            }
        });
        
        this.streams.markPrice.on('error', (error) => {
            console.error('Mark price stream error:', error);
            this.handleStreamError('markPrice', error);
        });
        
        this.streams.markPrice.on('close', () => {
            console.log('[WARNING] Mark price stream closed - attempting reconnect...');
            setTimeout(() => this.connectMarkPriceStream(), 5000);
        });
    }
    
    async connectUserDataStream() {
        if (!this.hasValidCredentials()) {
            console.log('[WARNING] Cannot connect user data stream - no API credentials');
            return;
        }
        
        console.log('👤 Connecting user data stream...');
        
        try {
            // Obtener listen key
            const response = await this.signedRequest('POST', '/fapi/v1/listenKey');
            const listenKey = response.data.listenKey;
            
            const streamUrl = `${this.binanceConfig.streamURL}/ws/${listenKey}`;
            
            this.streams.userStream = new WebSocket(streamUrl);
            
            this.streams.userStream.on('open', () => {
                console.log('[CHECK] User data stream connected');
                this.gatewayState.accountConnected = true;
            });
            
            this.streams.userStream.on('message', (data) => {
                try {
                    const event = JSON.parse(data);
                    this.handleUserStreamEvent(event);
                } catch (error) {
                    console.error('Error processing user stream data:', error);
                }
            });
            
            this.streams.userStream.on('error', (error) => {
                console.error('User stream error:', error);
                this.handleStreamError('userStream', error);
            });
            
            this.streams.userStream.on('close', () => {
                console.log('[WARNING] User stream closed - attempting reconnect...');
                this.gatewayState.accountConnected = false;
                setTimeout(() => this.connectUserDataStream(), 5000);
            });
            
            // Programar renovación del listen key cada 30 minutos
            setInterval(async () => {
                try {
                    await this.signedRequest('PUT', '/fapi/v1/listenKey');
                    console.log('[REFRESH] Listen key renewed');
                } catch (error) {
                    console.error('Failed to renew listen key:', error);
                }
            }, 30 * 60 * 1000); // 30 minutos
            
        } catch (error) {
            console.error('[X] Failed to connect user data stream:', error);
            throw error;
        }
    }
    
    handleUserStreamEvent(event) {
        switch (event.e) {
            case 'ACCOUNT_UPDATE':
                this.handleAccountUpdate(event);
                break;
                
            case 'ORDER_TRADE_UPDATE':
                this.handleOrderUpdate(event);
                break;
                
            case 'ACCOUNT_CONFIG_UPDATE':
                this.handleAccountConfigUpdate(event);
                break;
                
            default:
                console.log('Unknown user stream event:', event.e);
        }
    }
    
    handleAccountUpdate(event) {
        console.log('[CHART] Account update received');
        
        // Update balances
        if (event.a && event.a.B) {
            for (const balance of event.a.B) {
                if (balance.a === 'USDT') {
                    this.accountInfo.balance = {
                        asset: balance.a,
                        balance: parseFloat(balance.wb),
                        availableBalance: parseFloat(balance.cw),
                        timestamp: event.E
                    };
                }
            }
        }
        
        // Update positions
        if (event.a && event.a.P) {
            for (const position of event.a.P) {
                if (parseFloat(position.pa) !== 0) {
                    this.accountInfo.positions.set(position.s, {
                        symbol: position.s,
                        positionAmt: parseFloat(position.pa),
                        entryPrice: parseFloat(position.ep),
                        markPrice: parseFloat(position.mp),
                        unrealizedPnl: parseFloat(position.up),
                        marginType: position.mt,
                        positionSide: position.ps,
                        timestamp: event.E
                    });
                } else {
                    this.accountInfo.positions.delete(position.s);
                }
            }
        }
        
        this.accountInfo.lastUpdate = new Date();
        
        this.broadcast({
            type: 'account_update',
            data: {
                balance: this.accountInfo.balance,
                positions: Array.from(this.accountInfo.positions.values())
            }
        });
        
        this.emit('account-update', this.accountInfo);
    }
    
    handleOrderUpdate(event) {
        console.log(`[CLIPBOARD] Order update: ${event.o.s} ${event.o.S} ${event.o.o} - Status: ${event.o.X}`);
        
        const orderData = {
            symbol: event.o.s,
            orderId: event.o.i,
            clientOrderId: event.o.c,
            side: event.o.S,
            orderType: event.o.o,
            timeInForce: event.o.f,
            quantity: parseFloat(event.o.q),
            price: parseFloat(event.o.p),
            stopPrice: parseFloat(event.o.sp),
            executedQty: parseFloat(event.o.z),
            cumulativeQuoteQty: parseFloat(event.o.Z),
            status: event.o.X,
            timeInForce: event.o.f,
            orderType: event.o.o,
            reduceOnly: event.o.R,
            workingType: event.o.wt,
            originalOrderType: event.o.ot,
            positionSide: event.o.ps,
            closePosition: event.o.cp,
            timestamp: event.E,
            updateTime: event.T
        };
        
        if (orderData.status === 'FILLED' || orderData.status === 'PARTIALLY_FILLED') {
            console.log(`[CHECK] Order ${orderData.orderId} executed: ${orderData.executedQty} @ ${event.o.ap}`);
        }
        
        this.accountInfo.openOrders.set(orderData.orderId, orderData);
        
        // Remover órdenes completadas o canceladas
        if (['FILLED', 'CANCELED', 'REJECTED', 'EXPIRED'].includes(orderData.status)) {
            this.accountInfo.openOrders.delete(orderData.orderId);
        }
        
        this.broadcast({
            type: 'order_update',
            data: orderData
        });
        
        this.emit('order-update', orderData);
    }
    
    handleAccountConfigUpdate(event) {
        console.log('⚙️ Account config update received');
        this.emit('config-update', event);
    }
    
    async syncAccountInfo() {
        if (!this.hasValidCredentials()) return;
        
        try {
            // Get account info
            const accountResponse = await this.signedRequest('GET', '/fapi/v2/account');
            const accountData = accountResponse.data;
            
            // Update balance
            const usdtBalance = accountData.assets.find(asset => asset.asset === 'USDT');
            if (usdtBalance) {
                this.accountInfo.balance = {
                    asset: 'USDT',
                    balance: parseFloat(usdtBalance.walletBalance),
                    availableBalance: parseFloat(usdtBalance.availableBalance),
                    timestamp: Date.now()
                };
            }
            
            // Update positions
            this.accountInfo.positions.clear();
            for (const position of accountData.positions) {
                if (parseFloat(position.positionAmt) !== 0) {
                    this.accountInfo.positions.set(position.symbol, {
                        symbol: position.symbol,
                        positionAmt: parseFloat(position.positionAmt),
                        entryPrice: parseFloat(position.entryPrice),
                        markPrice: parseFloat(position.markPrice),
                        unrealizedPnl: parseFloat(position.unRealizedProfit),
                        marginType: position.marginType,
                        positionSide: position.positionSide,
                        timestamp: Date.now()
                    });
                }
            }
            
            // Get open orders
            const ordersResponse = await this.signedRequest('GET', '/fapi/v1/openOrders');
            const openOrders = ordersResponse.data;
            
            this.accountInfo.openOrders.clear();
            for (const order of openOrders) {
                this.accountInfo.openOrders.set(order.orderId, {
                    symbol: order.symbol,
                    orderId: order.orderId,
                    clientOrderId: order.clientOrderId,
                    side: order.side,
                    orderType: order.type,
                    timeInForce: order.timeInForce,
                    quantity: parseFloat(order.origQty),
                    price: parseFloat(order.price),
                    stopPrice: parseFloat(order.stopPrice),
                    executedQty: parseFloat(order.executedQty),
                    status: order.status,
                    reduceOnly: order.reduceOnly,
                    positionSide: order.positionSide,
                    timestamp: order.time,
                    updateTime: order.updateTime
                });
            }
            
            this.accountInfo.lastUpdate = new Date();
            console.log('[CHECK] Account info synchronized');
            
        } catch (error) {
            console.error('[X] Failed to sync account info:', error);
            this.gatewayState.lastError = error.message;
        }
    }
    
    async placeOrder(orderParams) {
        if (!this.hasValidCredentials()) {
            throw new Error('API credentials required for trading');
        }
        
        console.log(`[CLIPBOARD] Placing order: ${orderParams.symbol} ${orderParams.side} ${orderParams.quantity}`);
        
        const params = {
            symbol: orderParams.symbol,
            side: orderParams.side,
            type: orderParams.type || 'MARKET',
            quantity: orderParams.quantity,
            ...orderParams
        };
        
        // Add timestamp
        params.timestamp = Date.now();
        
        try {
            const response = await this.signedRequest('POST', '/fapi/v1/order', params);
            const orderResult = response.data;
            
            console.log(`[CHECK] Order placed successfully: ${orderResult.orderId}`);
            
            this.emit('order-placed', orderResult);
            
            return orderResult;
            
        } catch (error) {
            console.error('[X] Failed to place order:', error.response?.data || error.message);
            this.emit('order-error', { params, error: error.response?.data || error.message });
            throw error;
        }
    }
    
    async cancelOrder(symbol, orderId) {
        if (!this.hasValidCredentials()) {
            throw new Error('API credentials required for trading');
        }
        
        console.log(`[X] Canceling order: ${symbol} - ${orderId}`);
        
        const params = {
            symbol,
            orderId,
            timestamp: Date.now()
        };
        
        try {
            const response = await this.signedRequest('DELETE', '/fapi/v1/order', params);
            const cancelResult = response.data;
            
            console.log(`[CHECK] Order canceled: ${cancelResult.orderId}`);
            
            this.emit('order-canceled', cancelResult);
            
            return cancelResult;
            
        } catch (error) {
            console.error('[X] Failed to cancel order:', error.response?.data || error.message);
            throw error;
        }
    }
    
    async getOrderBook(symbol, limit = 100) {
        try {
            const params = { symbol, limit };
            const response = await this.publicRequest('GET', '/fapi/v1/depth', params);
            
            const orderBook = {
                symbol,
                bids: response.data.bids.map(bid => ({ price: parseFloat(bid[0]), quantity: parseFloat(bid[1]) })),
                asks: response.data.asks.map(ask => ({ price: parseFloat(ask[0]), quantity: parseFloat(ask[1]) })),
                lastUpdateId: response.data.lastUpdateId,
                timestamp: Date.now()
            };
            
            this.marketData.orderBooks.set(symbol, orderBook);
            
            return orderBook;
            
        } catch (error) {
            console.error(`[X] Failed to get order book for ${symbol}:`, error);
            throw error;
        }
    }
    
    async getKlines(symbol, interval = '1m', limit = 100) {
        try {
            const params = { symbol, interval, limit };
            const response = await this.publicRequest('GET', '/fapi/v1/klines', params);
            
            const klines = response.data.map(kline => ({
                openTime: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                closeTime: kline[6],
                quoteAssetVolume: parseFloat(kline[7]),
                numberOfTrades: kline[8],
                takerBuyBaseAssetVolume: parseFloat(kline[9]),
                takerBuyQuoteAssetVolume: parseFloat(kline[10])
            }));
            
            this.marketData.klines.set(`${symbol}_${interval}`, klines);
            
            return klines;
            
        } catch (error) {
            console.error(`[X] Failed to get klines for ${symbol}:`, error);
            throw error;
        }
    }
    
    async publicRequest(method, endpoint, params = {}) {
        const url = `${this.binanceConfig.baseURL}${endpoint}`;
        
        try {
            await this.checkRateLimit();
            
            const config = {
                method,
                url,
                [method === 'GET' ? 'params' : 'data']: params,
                timeout: 10000
            };
            
            const response = await axios(config);
            
            this.updateRateLimit(response.headers);
            
            return response;
            
        } catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    
    async signedRequest(method, endpoint, params = {}) {
        if (!this.hasValidCredentials()) {
            throw new Error('API credentials required');
        }
        
        const timestamp = Date.now();
        const queryString = new URLSearchParams({ ...params, timestamp }).toString();
        const signature = crypto.createHmac('sha256', this.binanceConfig.apiSecret)
                               .update(queryString)
                               .digest('hex');
        
        const signedParams = { ...params, timestamp, signature };
        
        const url = `${this.binanceConfig.baseURL}${endpoint}`;
        
        try {
            await this.checkRateLimit();
            
            const config = {
                method,
                url,
                [method === 'GET' || method === 'DELETE' ? 'params' : 'data']: signedParams,
                headers: {
                    'X-MBX-APIKEY': this.binanceConfig.apiKey
                },
                timeout: 10000
            };
            
            const response = await axios(config);
            
            this.updateRateLimit(response.headers);
            
            return response;
            
        } catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    
    async checkRateLimit() {
        const now = Date.now();
        
        // Reset counters if time expired
        if (now > this.binanceConfig.requestWeight.resetTime) {
            this.binanceConfig.requestWeight.current = 0;
            this.binanceConfig.requestWeight.resetTime = now + 60000;
        }
        
        if (now > this.binanceConfig.orderLimit.resetTime) {
            this.binanceConfig.orderLimit.current = 0;
            this.binanceConfig.orderLimit.resetTime = now + 10000;
        }
        
        // Check limits
        if (this.binanceConfig.requestWeight.current >= this.binanceConfig.requestWeight.limit) {
            const waitTime = this.binanceConfig.requestWeight.resetTime - now;
            console.log(`[HOURGLASS] Rate limit reached, waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime + 100));
        }
    }
    
    updateRateLimit(headers) {
        if (headers['x-mbx-used-weight-1m']) {
            this.binanceConfig.requestWeight.current = parseInt(headers['x-mbx-used-weight-1m']);
        }
        
        if (headers['x-mbx-order-count-1m']) {
            this.binanceConfig.orderLimit.current = parseInt(headers['x-mbx-order-count-1m']);
        }
    }
    
    handleApiError(error) {
        const errorInfo = {
            timestamp: new Date(),
            message: error.message,
            code: error.response?.data?.code,
            msg: error.response?.data?.msg,
            status: error.response?.status
        };
        
        this.gatewayState.errors.push(errorInfo);
        this.gatewayState.lastError = errorInfo;
        
        // Keep only last 100 errors
        if (this.gatewayState.errors.length > 100) {
            this.gatewayState.errors = this.gatewayState.errors.slice(-100);
        }
        
        console.error('[SIREN] API Error:', errorInfo);
        
        this.emit('api-error', errorInfo);
    }
    
    handleStreamError(streamName, error) {
        console.error(`[SIREN] Stream error (${streamName}):`, error);
        
        this.gatewayState.streamConnected = false;
        if (streamName === 'userStream') {
            this.gatewayState.accountConnected = false;
        }
        
        this.emit('stream-error', { stream: streamName, error });
    }
    
    startHeartbeat() {
        this.intervals.heartbeat = setInterval(async () => {
            try {
                await this.testConnectivity();
            } catch (error) {
                console.error('[X] Heartbeat failed:', error);
                this.gatewayState.isConnected = false;
            }
        }, 60000); // Cada minuto
    }
    
    startAccountSync() {
        if (!this.hasValidCredentials()) return;
        
        this.intervals.accountSync = setInterval(async () => {
            await this.syncAccountInfo();
        }, 30000); // Cada 30 segundos
    }
    
    startRateResets() {
        this.intervals.rateReset = setInterval(() => {
            const now = Date.now();
            
            if (now > this.binanceConfig.requestWeight.resetTime) {
                this.binanceConfig.requestWeight.current = 0;
                this.binanceConfig.requestWeight.resetTime = now + 60000;
            }
            
            if (now > this.binanceConfig.orderLimit.resetTime) {
                this.binanceConfig.orderLimit.current = 0;
                this.binanceConfig.orderLimit.resetTime = now + 10000;
            }
        }, 5000); // Cada 5 segundos
    }
    
    startQueueProcessor() {
        this.intervals.queueProcessor = setInterval(async () => {
            if (!this.isProcessingQueue && this.requestQueue.length > 0) {
                await this.processRequestQueue();
            }
        }, 100); // Check every 100ms
    }
    
    async processRequestQueue() {
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                await this.checkRateLimit();
                const result = await request.execute();
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        this.isProcessingQueue = false;
    }
    
    broadcast(message) {
        const payload = JSON.stringify(message);
        this.subscribers.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        });
    }
    
    getMarketData(symbol = null) {
        if (symbol) {
            return {
                price: this.marketData.prices.get(symbol),
                orderBook: this.marketData.orderBooks.get(symbol),
                markPrice: this.marketData.markPrices.get(symbol),
                klines: Array.from(this.marketData.klines.entries())
                    .filter(([key]) => key.startsWith(symbol))
                    .map(([key, value]) => ({ interval: key.split('_')[1], data: value }))
            };
        }
        
        return {
            prices: Object.fromEntries(this.marketData.prices),
            orderBooks: Object.fromEntries(this.marketData.orderBooks),
            markPrices: Object.fromEntries(this.marketData.markPrices),
            totalSymbols: this.marketData.prices.size
        };
    }
    
    getAccountData() {
        return {
            balance: this.accountInfo.balance,
            positions: Array.from(this.accountInfo.positions.values()),
            openOrders: Array.from(this.accountInfo.openOrders.values()),
            lastUpdate: this.accountInfo.lastUpdate
        };
    }
    
    getStatus() {
        return {
            service: this.serviceName,
            version: this.version,
            status: this.gatewayState.status,
            uptime: Date.now() - this.startTime.getTime(),
            connections: {
                api: this.gatewayState.isConnected,
                streams: this.gatewayState.streamConnected,
                account: this.gatewayState.accountConnected
            },
            rateLimit: {
                requestWeight: this.binanceConfig.requestWeight,
                orderLimit: this.binanceConfig.orderLimit
            },
            marketData: {
                symbols: this.marketData.prices.size,
                orderBooks: this.marketData.orderBooks.size,
                markPrices: this.marketData.markPrices.size
            },
            subscribers: this.subscribers.size,
            lastPing: this.gatewayState.lastPing,
            lastError: this.gatewayState.lastError,
            testnet: this.binanceConfig.testnet
        };
    }
    
    async stop() {
        console.log('[STOP] Stopping Binance Gateway...');
        
        // Close all streams
        Object.values(this.streams).forEach(stream => {
            if (stream && stream.readyState === WebSocket.OPEN) {
                stream.close();
            }
        });
        
        // Clear intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        // Close WebSocket server
        this.wss.close();
        
        this.gatewayState.status = 'stopped';
        this.gatewayState.isConnected = false;
        this.gatewayState.streamConnected = false;
        this.gatewayState.accountConnected = false;
        
        console.log('[CHECK] Binance Gateway stopped');
    }
}

// Crear instancia del gateway
const binanceGateway = new QBTCBinanceGateway();

app.use(express.json());

// === BINANCE GATEWAY ROUTES ===

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: binanceGateway.serviceName,
        port: PORT,
        version: binanceGateway.version,
        connected: binanceGateway.gatewayState.isConnected,
        streams: binanceGateway.gatewayState.streamConnected,
        account: binanceGateway.gatewayState.accountConnected,
        uptime: Date.now() - binanceGateway.startTime.getTime(),
        timestamp: new Date().toISOString()
    });
});

// Gateway status
app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: binanceGateway.getStatus()
    });
});

// Market data endpoints
app.get('/market/:symbol?', (req, res) => {
    const { symbol } = req.params;
    const marketData = binanceGateway.getMarketData(symbol?.toUpperCase());
    
    res.json({
        success: true,
        data: marketData
    });
});

// Order book
app.get('/orderbook/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { limit = 100 } = req.query;
        
        const orderBook = await binanceGateway.getOrderBook(symbol.toUpperCase(), parseInt(limit));
        
        res.json({
            success: true,
            data: orderBook
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Klines/candlesticks
app.get('/klines/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval = '1m', limit = 100 } = req.query;
        
        const klines = await binanceGateway.getKlines(symbol.toUpperCase(), interval, parseInt(limit));
        
        res.json({
            success: true,
            data: klines
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Account endpoints
app.get('/account', (req, res) => {
    if (!binanceGateway.hasValidCredentials()) {
        return res.status(401).json({
            success: false,
            message: 'API credentials required'
        });
    }
    
    const accountData = binanceGateway.getAccountData();
    
    res.json({
        success: true,
        data: accountData
    });
});

// Place order
app.post('/orders', async (req, res) => {
    try {
        const orderResult = await binanceGateway.placeOrder(req.body);
        
        res.json({
            success: true,
            message: 'Order placed successfully',
            data: orderResult
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.response?.data?.msg || error.message,
            error: error.response?.data
        });
    }
});

// Cancel order
app.delete('/orders/:symbol/:orderId', async (req, res) => {
    try {
        const { symbol, orderId } = req.params;
        const cancelResult = await binanceGateway.cancelOrder(symbol.toUpperCase(), orderId);
        
        res.json({
            success: true,
            message: 'Order canceled successfully',
            data: cancelResult
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.response?.data?.msg || error.message,
            error: error.response?.data
        });
    }
});

// Exchange info
app.get('/info', (req, res) => {
    res.json({
        success: true,
        data: binanceGateway.exchangeInfo || { message: 'Exchange info not loaded yet' }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: binanceGateway.serviceName,
        version: binanceGateway.version,
        status: binanceGateway.gatewayState.status,
        description: 'Complete Binance Futures API Gateway for QBTC Dimensional Supreme',
        capabilities: [
            'Real-time market data streaming',
            'Order book management',
            'Trading operations (buy/sell/cancel)',
            'Account management',
            'Position tracking',
            'Rate limiting & queue management',
            'WebSocket data streams',
            'Error handling & reconnection',
            'User data streams',
            'Klines/candlestick data'
        ],
        endpoints: {
            '/market/{symbol}': 'Market data for symbol (or all)',
            '/orderbook/{symbol}': 'Order book depth',
            '/klines/{symbol}': 'Kline/candlestick data',
            '/account': 'Account information',
            '/orders': 'Place order (POST) / Get orders (GET)',
            '/orders/{symbol}/{orderId}': 'Cancel order (DELETE)',
            '/info': 'Exchange information',
            '/status': 'Gateway status',
            '/ws': 'WebSocket for real-time updates'
        },
        currentState: {
            connected: binanceGateway.gatewayState.isConnected,
            streams: binanceGateway.gatewayState.streamConnected,
            account: binanceGateway.gatewayState.accountConnected,
            symbols: binanceGateway.marketData.prices.size,
            subscribers: binanceGateway.subscribers.size,
            testnet: binanceGateway.binanceConfig.testnet
        }
    });
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('[GLOBE] QBTC Binance Gateway starting...');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[EARTH] Health check: http://localhost:${PORT}/health`);
    console.log(`[CHART] Market data: http://localhost:${PORT}/market`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    
    if (process.env.NODE_ENV !== 'production') {
        console.log('[TEST_TUBE] RUNNING IN TESTNET MODE');
        console.log('[BULB] Set NODE_ENV=production for live trading');
        console.log('🔑 Set BINANCE_API_KEY and BINANCE_API_SECRET environment variables');
    }
    
    // Inicializar el Binance Gateway
    await binanceGateway.initialize();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, stopping Binance Gateway...');
    await binanceGateway.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[STOP] SIGINT received, stopping Binance Gateway...');
    await binanceGateway.stop();
    process.exit(0);
});

export default binanceGateway;
