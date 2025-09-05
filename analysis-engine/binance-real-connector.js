import WebSocket from 'ws';
import axios from 'axios';
import crypto from 'crypto';
import { QUANTUM_CONSTANTS } from '../config/constants.js';
import QuantumDataPurifier from '../core/quantum-data-purifier.js';

/**
 * 🚀 BINANCE REAL CONNECTOR
 * ========================
 * 
 * Conector real para Binance con autenticación, rate limiting avanzado
 * y soporte completo para trading real en Futures
 */

export class BinanceRealConnector {
    constructor(config = {}) {
        this.config = {
            // URLs de Binance
            baseURL: 'https://api.binance.com',
            futuresURL: 'https://fapi.binance.com',
            testnetURL: 'https://testnet.binancefuture.com',
            websocketURL: 'wss://stream.binance.com:9443/ws',
            futuresWSURL: 'wss://fstream.binance.com/ws',
            
            // Configuración de API
            apiKey: process.env.BINANCE_API_KEY || config.apiKey,
            secretKey: process.env.BINANCE_SECRET_KEY || config.secretKey,
            testnet: config.testnet || false,
            
            // Configuración de trading
            symbols: config.symbols || QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.slice(0, 20), // Empezar con 20 símbolos
            timeframes: config.timeframes || ['1m', '5m', '15m', '1h', '4h', '1d'],
            
            // Rate limiting avanzado
            maxRequestsPerMinute: 1200,
            maxOrdersPerMinute: 50,
            maxPositions: 8,
            maxRiskPerTrade: 0.035, // 3.5%
            
            // Configuración de WebSocket
            reconnectInterval: 5000,
            maxReconnectAttempts: 10
        };
        
        // Estado del sistema
        this.isConnected = false;
        this.isAuthenticated = false;
        this.accountInfo = null;
        this.positions = new Map();
        this.orders = new Map();
        this.marketData = new Map();
        
        // WebSockets
        this.websockets = new Map();
        this.reconnectAttempts = 0;
        
        // Rate limiting avanzado
        this.rateLimiter = {
            requests: [],
            orders: [],
            lastRequestTime: 0,
            lastOrderTime: 0
        };
        
        // Quantum Data Purifier
        this.quantumPurifier = new QuantumDataPurifier();
        
        // Validar configuración
        this.validateConfig();
        
        console.log('[BINANCE-REAL] Binance Real Connector inicializado');
        console.log(`🔑 API Key: ${this.config.apiKey ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
        console.log(`🌐 Testnet: ${this.config.testnet ? 'SÍ' : 'NO'}`);
        console.log(`📊 Símbolos: ${this.config.symbols.length}`);
        console.log(`⚡ Rate Limit: ${this.config.maxRequestsPerMinute} req/min`);
    }
    
    /**
     * Valida la configuración
     */
    validateConfig() {
        if (!this.config.apiKey || !this.config.secretKey) {
            console.warn('[BINANCE-REAL] ⚠️ API Key o Secret Key no configuradas');
            console.warn('[BINANCE-REAL] ⚠️ Solo modo READ-ONLY disponible');
        }
        
        if (this.config.testnet) {
            this.config.baseURL = this.config.testnetURL;
            console.log('[BINANCE-REAL] 🧪 Modo TESTNET activado');
        }
    }
    
    /**
     * Genera firma para requests autenticados
     */
    generateSignature(queryString) {
        return crypto
            .createHmac('sha256', this.config.secretKey)
            .update(queryString)
            .digest('hex');
    }
    
    /**
     * Rate limiting avanzado
     */
    async rateLimitRequest(type = 'request') {
        const now = Date.now();
        const maxRequests = type === 'order' ? this.config.maxOrdersPerMinute : this.config.maxRequestsPerMinute;
        const requests = type === 'order' ? this.rateLimiter.orders : this.rateLimiter.requests;
        
        // Limpiar requests antiguos
        const filteredRequests = requests.filter(timestamp => now - timestamp < 60000);
        
        if (type === 'order') {
            this.rateLimiter.orders = filteredRequests;
        } else {
            this.rateLimiter.requests = filteredRequests;
        }
        
        // Verificar límite
        if (filteredRequests.length >= maxRequests) {
            const oldestRequest = Math.min(...filteredRequests);
            const waitTime = 60000 - (now - oldestRequest);
            console.log(`[BINANCE-REAL] ⏳ Rate limit ${type} alcanzado, esperando ${waitTime}ms`);
            await this.delay(waitTime);
        }
        
        // Delay mínimo
        const minDelay = type === 'order' ? 1000 : 100; // 1s para órdenes, 100ms para requests
        const timeSinceLast = now - (type === 'order' ? this.rateLimiter.lastOrderTime : this.rateLimiter.lastRequestTime);
        
        if (timeSinceLast < minDelay) {
            await this.delay(minDelay - timeSinceLast);
        }
        
        // Registrar request
        filteredRequests.push(Date.now());
        
        if (type === 'order') {
            this.rateLimiter.orders = filteredRequests;
            this.rateLimiter.lastOrderTime = Date.now();
        } else {
            this.rateLimiter.requests = filteredRequests;
            this.rateLimiter.lastRequestTime = Date.now();
        }
    }
    
    /**
     * Request wrapper con autenticación
     */
    async authenticatedRequest(endpoint, params = {}, method = 'GET') {
        if (!this.config.apiKey || !this.config.secretKey) {
            throw new Error('API Key y Secret Key requeridas para requests autenticados');
        }
        
        await this.rateLimitRequest();
        
        const timestamp = Date.now();
        const queryString = new URLSearchParams({
            ...params,
            timestamp: timestamp
        }).toString();
        
        const signature = this.generateSignature(queryString);
        const url = `${this.config.futuresURL}${endpoint}?${queryString}&signature=${signature}`;
        
        try {
            const response = await axios({
                method,
                url,
                headers: {
                    'X-MBX-APIKEY': this.config.apiKey
                }
            });
            
            return response.data;
        } catch (error) {
            console.error(`[BINANCE-REAL] Error en request autenticado:`, error.response?.data || error.message);
            throw error;
        }
    }
    
    /**
     * Obtiene información de la cuenta
     */
    async getAccountInfo() {
        try {
            const accountInfo = await this.authenticatedRequest('/fapi/v2/account');
            this.accountInfo = accountInfo;
            this.isAuthenticated = true;
            
            console.log(`[BINANCE-REAL] ✅ Cuenta autenticada`);
            console.log(`💰 Balance Total: ${accountInfo.totalWalletBalance} USDT`);
            console.log(`📈 PnL Total: ${accountInfo.totalUnrealizedProfit} USDT`);
            
            return accountInfo;
        } catch (error) {
            console.error('[BINANCE-REAL] Error obteniendo información de cuenta:', error.message);
            return null;
        }
    }
    
    /**
     * Obtiene posiciones abiertas
     */
    async getOpenPositions() {
        try {
            const positions = await this.authenticatedRequest('/fapi/v2/positionRisk');
            
            // Filtrar solo posiciones con cantidad > 0
            const openPositions = positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
            
            // Actualizar cache de posiciones
            this.positions.clear();
            openPositions.forEach(pos => {
                this.positions.set(pos.symbol, pos);
            });
            
            console.log(`[BINANCE-REAL] 📊 ${openPositions.length} posiciones abiertas`);
            
            return openPositions;
        } catch (error) {
            console.error('[BINANCE-REAL] Error obteniendo posiciones:', error.message);
            return [];
        }
    }
    
    /**
     * Obtiene datos de mercado en tiempo real
     */
    async getMarketData(symbols = null) {
        const symbolsToFetch = symbols || this.config.symbols.slice(0, 10); // Limitar a 10 símbolos
        
        try {
            await this.rateLimitRequest();
            
            const promises = symbolsToFetch.map(async (symbol) => {
                const url = `${this.config.futuresURL}/fapi/v1/ticker/24hr?symbol=${symbol}`;
                const response = await axios.get(url);
                return response.data;
            });
            
            const results = await Promise.all(promises);
            
            // Actualizar cache
            results.forEach(data => {
                this.marketData.set(data.symbol, {
                    ...data,
                    timestamp: Date.now()
                });
            });
            
            return results;
        } catch (error) {
            console.error('[BINANCE-REAL] Error obteniendo datos de mercado:', error.message);
            return [];
        }
    }
    
    /**
     * Obtiene datos OHLCV históricos
     */
    async getHistoricalData(symbol, interval = '1h', limit = 100) {
        try {
            await this.rateLimitRequest();
            
            const url = `${this.config.futuresURL}/fapi/v1/klines`;
            const params = {
                symbol: symbol,
                interval: interval,
                limit: limit
            };
            
            const response = await axios.get(url, { params });
            
            return response.data.map(candle => ({
                timestamp: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5])
            }));
        } catch (error) {
            console.error(`[BINANCE-REAL] Error obteniendo datos históricos para ${symbol}:`, error.message);
            return [];
        }
    }
    
    /**
     * Coloca una orden de Futures
     */
    async placeFuturesOrder(orderParams) {
        if (!this.isAuthenticated) {
            throw new Error('Cuenta no autenticada');
        }
        
        await this.rateLimitRequest('order');
        
        const {
            symbol,
            side, // BUY o SELL
            type = 'MARKET', // MARKET, LIMIT, STOP_MARKET, etc.
            quantity,
            price = null,
            stopPrice = null,
            timeInForce = 'GTC'
        } = orderParams;
        
        const params = {
            symbol: symbol,
            side: side,
            type: type,
            quantity: quantity.toString()
        };
        
        if (price) params.price = price.toString();
        if (stopPrice) params.stopPrice = stopPrice.toString();
        if (timeInForce) params.timeInForce = timeInForce;
        
        try {
            const order = await this.authenticatedRequest('/fapi/v1/order', params, 'POST');
            
            console.log(`[BINANCE-REAL] ✅ Orden ejecutada: ${symbol} ${side} ${quantity}`);
            console.log(`📋 Order ID: ${order.orderId}`);
            
            // Actualizar cache de órdenes
            this.orders.set(order.orderId, order);
            
            return order;
        } catch (error) {
            console.error(`[BINANCE-REAL] ❌ Error ejecutando orden:`, error.response?.data || error.message);
            throw error;
        }
    }
    
    /**
     * Cierra una posición
     */
    async closePosition(symbol, quantity = null) {
        try {
            const positions = await this.getOpenPositions();
            const position = positions.find(pos => pos.symbol === symbol);
            
            if (!position) {
                throw new Error(`No hay posición abierta para ${symbol}`);
            }
            
            const positionAmt = parseFloat(position.positionAmt);
            const closeQuantity = quantity || Math.abs(positionAmt);
            const side = positionAmt > 0 ? 'SELL' : 'BUY';
            
            const order = await this.placeFuturesOrder({
                symbol: symbol,
                side: side,
                type: 'MARKET',
                quantity: closeQuantity
            });
            
            console.log(`[BINANCE-REAL] 🔒 Posición cerrada: ${symbol} ${closeQuantity}`);
            
            return order;
        } catch (error) {
            console.error(`[BINANCE-REAL] Error cerrando posición ${symbol}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Calcula el tamaño de posición basado en riesgo
     */
    calculatePositionSize(accountBalance, riskPercentage, entryPrice, stopLossPrice) {
        const riskAmount = accountBalance * (riskPercentage / 100);
        const priceDifference = Math.abs(entryPrice - stopLossPrice);
        const positionSize = riskAmount / priceDifference;
        
        return positionSize;
    }
    
    /**
     * Conecta WebSocket para datos en tiempo real
     */
    connectWebSocket(symbols = null) {
        const symbolsToConnect = symbols || this.config.symbols.slice(0, 5); // Limitar a 5 símbolos
        
        symbolsToConnect.forEach(symbol => {
            const wsUrl = `${this.config.futuresWSURL}/${symbol.toLowerCase()}@ticker`;
            
            const ws = new WebSocket(wsUrl);
            
            ws.on('open', () => {
                console.log(`[BINANCE-REAL] 🔌 WebSocket conectado: ${symbol}`);
                this.isConnected = true;
            });
            
            ws.on('message', (data) => {
                try {
                    const ticker = JSON.parse(data);
                    this.marketData.set(symbol, {
                        ...ticker,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error(`[BINANCE-REAL] Error procesando WebSocket data:`, error.message);
                }
            });
            
            ws.on('error', (error) => {
                console.error(`[BINANCE-REAL] WebSocket error para ${symbol}:`, error.message);
            });
            
            ws.on('close', () => {
                console.log(`[BINANCE-REAL] WebSocket desconectado: ${symbol}`);
                this.isConnected = false;
                
                // Reconexión automática
                if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connectWebSocket([symbol]);
                    }, this.config.reconnectInterval);
                }
            });
            
            this.websockets.set(symbol, ws);
        });
    }
    
    /**
     * Desconecta todos los WebSockets
     */
    disconnectWebSockets() {
        this.websockets.forEach((ws, symbol) => {
            ws.close();
        });
        this.websockets.clear();
        this.isConnected = false;
    }
    
    /**
     * Obtiene estado del sistema
     */
    getSystemStatus() {
        return {
            isConnected: this.isConnected,
            isAuthenticated: this.isAuthenticated,
            activeWebSockets: this.websockets.size,
            cachedSymbols: this.marketData.size,
            openPositions: this.positions.size,
            pendingOrders: this.orders.size,
            accountBalance: this.accountInfo?.totalWalletBalance || 0,
            totalPnL: this.accountInfo?.totalUnrealizedProfit || 0
        };
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default BinanceRealConnector;
