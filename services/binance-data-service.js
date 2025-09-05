import QuantumDataPurifier from '../core/quantum-data-purifier.js';
/**
 * 🌐 BINANCE DATA SERVICE - QBTC QUANTUM BRAIN
 * ===========================================
 * 
 * Servicio de integración de datos reales de Binance con el sistema QBTC
 * - Obtiene datos reales de precios, volúmenes y estadísticas
 * - Integra con las constantes y símbolos del sistema QBTC
 * - Cache inteligente con TTL optimizado
 * - Fallback a valores cuánticos cuando API no disponible
 */

import https from 'https';
import { QUANTUM_CONSTANTS } from '../config/constants.js';
import { SymbolValidationService } from '../utils/symbol-validation-service.js';

class BinanceDataService {
    constructor() {
        this.config = {
            BASE_URL: 'https://fapi.binance.com',
            REQUEST_TIMEOUT: 30000,
            CACHE_TTL: 30000, // 30 segundos
            RETRY_ATTEMPTS: 3
        };
        
        this.cache = new Map();
        this.symbolValidator = new SymbolValidationService();
        this.lastUpdate = 0;
        this.isUpdating = false;
        
        console.log('🌐 Binance Data Service initialized');
    }

    /**
     * Realiza petición HTTP con retry y timeout
     */
    async makeRequest(endpoint, retries = this.config.RETRY_ATTEMPTS) {
        const url = `${this.config.BASE_URL}${endpoint}`;
        
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: this.config.REQUEST_TIMEOUT }, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`JSON parsing failed: ${error.message}`));
                    }
                });
            });
            
            request.on('error', async (error) => {
                if (retries > 0) {
                    console.log(`[BINANCE] Retrying request... (${retries} attempts left)`);
                    await this.delay(2000);
                    try {
                        const result = await this.makeRequest(endpoint, retries - 1);
                        resolve(result);
                    } catch (retryError) {
                        reject(retryError);
                    }
                } else {
                    reject(error);
                }
            });
            
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtiene estadísticas de 24h de todos los símbolos
     */
    async get24HrStats() {
        try {
            const cacheKey = '24hr_stats';
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.config.CACHE_TTL) {
                return cached.data;
            }
            
            console.log('[BINANCE] Fetching 24hr stats...');
            const stats = await this.makeRequest('/fapi/v1/ticker/24hr');
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: stats,
                timestamp: Date.now()
            });
            
            console.log(`[BINANCE] ✅ Fetched stats for ${stats.length} symbols`);
            return stats;
            
        } catch (error) {
            console.error(`[BINANCE] ❌ Failed to fetch 24hr stats: ${error.message}`);
            return this.getFallback24HrStats();
        }
    }

    /**
     * Obtiene precios actuales de símbolos
     */
    async getCurrentPrices(symbols = null) {
        try {
            const targetSymbols = symbols || QUANTUM_CONSTANTS.QUANTUM_SYMBOLS;
            const cacheKey = 'current_prices';
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.config.CACHE_TTL) {
                return this.filterPricesBySymbols(cached.data, targetSymbols);
            }
            
            console.log('[BINANCE] Fetching current prices...');
            const prices = await this.makeRequest('/fapi/v1/ticker/price');
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: prices,
                timestamp: Date.now()
            });
            
            const filteredPrices = this.filterPricesBySymbols(prices, targetSymbols);
            console.log(`[BINANCE] ✅ Fetched prices for ${filteredPrices.length} quantum symbols`);
            
            return filteredPrices;
            
        } catch (error) {
            console.error(`[BINANCE] ❌ Failed to fetch prices: ${error.message}`);
            return this.getFallbackPrices(symbols);
        }
    }

    /**
     * Obtiene información del libro de órdenes
     */
    async getOrderBookTicker() {
        try {
            const cacheKey = 'orderbook_ticker';
            const cached = this.cache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.config.CACHE_TTL) {
                return cached.data;
            }
            
            console.log('[BINANCE] Fetching order book ticker...');
            const orderbook = await this.makeRequest('/fapi/v1/ticker/bookTicker');
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: orderbook,
                timestamp: Date.now()
            });
            
            return orderbook;
            
        } catch (error) {
            console.error(`[BINANCE] ❌ Failed to fetch orderbook: ${error.message}`);
            return this.getFallbackOrderBook();
        }
    }

    /**
     * Obtiene datos integrados para el dashboard
     */
    async getQuantumDashboardData() {
        try {
            console.log('[BINANCE] Generating quantum dashboard data...');
            
            // Validar símbolos
            const validSymbols = await this.symbolValidator.validateSymbols();
            
            // Obtener datos de mercado
            const [stats24hr, currentPrices, orderbook] = await Promise.all([
                this.get24HrStats(),
                this.getCurrentPrices(),
                this.getOrderBookTicker()
            ]);
            
            // Procesar datos para dashboard
            const dashboardData = this.processDataForDashboard(stats24hr, currentPrices, orderbook, validSymbols);
            
            console.log('[BINANCE] ✅ Quantum dashboard data generated');
            return dashboardData;
            
        } catch (error) {
            console.error(`[BINANCE] ❌ Failed to generate dashboard data: ${error.message}`);
            return this.getFallbackDashboardData();
        }
    }

    /**
     * Procesa datos para el dashboard cuántico
     */
    processDataForDashboard(stats24hr, prices, orderbook, validSymbols) {
        const quantumSymbols = QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.filter(s => validSymbols.includes(s));
        
        // Organizar por tiers
        const symbolsByTier = this.organizeSymbolsByTier(quantumSymbols, stats24hr, prices);
        
        // Calcular métricas cuánticas
        const quantumMetrics = this.calculateQuantumMetrics(stats24hr, validSymbols);
        
        // Generar estado del sistema
        const systemState = this.generateSystemState(quantumMetrics);
        
        return {
            timestamp: new Date().toISOString(),
            validSymbolsCount: validSymbols.length,
            quantumSymbolsCount: quantumSymbols.length,
            symbolsByTier,
            quantumMetrics,
            systemState,
            marketSummary: this.generateMarketSummary(stats24hr, quantumSymbols)
        };
    }

    /**
     * Organiza símbolos por tiers con datos reales
     */
    organizeSymbolsByTier(symbols, stats24hr, prices) {
        const tiers = {
            TIER1: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
            TIER2: ['SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT', 'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT'],
            TIER3: ['UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT', 'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT', 'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT', 'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT'],
            TIER4: ['APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT', 'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 'WIFUSDT', 'BONKUSDT', '1000SATSUSDT'],
            TIER5: ['CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT', 'BATUSDT', 'ZRXUSDT', 'STORJUSDT', 'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT', 'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT'],
            TIER6: ['APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT', 'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT', 'TLMUSDT', 'YGGUSDT', 'GHSTUSDT']
        };
        
        const result = {};
        
        Object.keys(tiers).forEach(tier => {
            result[tier] = tiers[tier].filter(symbol => symbols.includes(symbol)).map(symbol => {
                const stat = stats24hr.find(s => s.symbol === symbol);
                const price = prices.find(p => p.symbol === symbol);
                
                return {
                    symbol,
                    tier,
                    price: price ? parseFloat(price.price) : 0,
                    change24h: stat ? parseFloat(stat.priceChangePercent) : 0,
                    volume24h: stat ? parseFloat(stat.volume) : 0,
                    quantumScore: this.calculateQuantumScore(symbol, stat),
                    coherence: this.calculateSymbolCoherence(symbol, stat)
                };
            });
        });
        
        return result;
    }

    /**
     * Calcula score cuántico para un símbolo
     */
    calculateQuantumScore(symbol, stats) {
        if (!stats) return this.getFallbackQuantumScore(symbol);
        
        const priceChange = Math.abs(parseFloat(stats.priceChangePercent));
        const volume = parseFloat(stats.volume);
        const count = parseInt(stats.count);
        
        // Fórmula cuántica usando constantes QBTC
        const lambda = QUANTUM_CONSTANTS.LAMBDA_7919;
        const phi = QUANTUM_CONSTANTS.PHI_GOLDEN;
        
        // Score basado en actividad y momentum
        let score = (priceChange / 10) * 20; // Base por cambio de precio
        score += Math.log10(volume) / 10 * 30; // Factor volumen
        score += Math.log10(count) / 5 * 20; // Factor actividad
        
        // Modulación cuántica
        const quantumModulation = Math.sin(lambda * phi) * 10;
        score += quantumModulation;
        
        // Normalizar entre 0-100
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calcula coherencia cuántica de un símbolo
     */
    calculateSymbolCoherence(symbol, stats) {
        if (!stats) return 0.5;
        
        const priceChange = parseFloat(stats.priceChangePercent);
        const volume = parseFloat(stats.volume);
        const high = parseFloat(stats.highPrice);
        const low = parseFloat(stats.lowPrice);
        
        // Coherencia basada en volatilidad y consistencia
        const volatility = (high - low) / low;
        const momentum = Math.abs(priceChange) / 100;
        
        // Factor de coherencia cuántica
        const coherence = Math.exp(-volatility) * (1 - momentum) * QUANTUM_CONSTANTS.PHI_GOLDEN / 2;
        
        return Math.max(0, Math.min(1, coherence));
    }

    /**
     * Calcula métricas cuánticas globales
     */
    calculateQuantumMetrics(stats24hr, validSymbols) {
        const relevantStats = stats24hr.filter(s => validSymbols.includes(s.symbol));
        
        if (relevantStats.length === 0) {
            return this.getFallbackQuantumMetrics();
        }
        
        // Calcular métricas agregadas
        const totalVolume = relevantStats.reduce((sum, s) => sum + parseFloat(s.volume), 0);
        const avgPriceChange = relevantStats.reduce((sum, s) => sum + Math.abs(parseFloat(s.priceChangePercent)), 0) / relevantStats.length;
        const totalTrades = relevantStats.reduce((sum, s) => sum + parseInt(s.count), 0);
        
        // Coherencia cuántica global
        const globalCoherence = this.calculateGlobalCoherence(relevantStats);
        
        // Resonancia Lambda
        const lambdaResonance = this.calculateLambdaResonance(avgPriceChange, totalVolume);
        
        return {
            coherence: globalCoherence,
            lambdaResonance,
            totalVolume,
            avgPriceChange,
            totalTrades,
            activeSymbols: relevantStats.length,
            marketMomentum: this.calculateMarketMomentum(relevantStats),
            consciousnessLevel: this.calculateConsciousnessLevel(globalCoherence, lambdaResonance)
        };
    }

    calculateGlobalCoherence(stats) {
        if (stats.length === 0) return 0.963; // Default quantum coherence
        
        // Coherencia basada en dispersión de cambios de precio
        const priceChanges = stats.map(s => parseFloat(s.priceChangePercent));
        const mean = priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length;
        const variance = priceChanges.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / priceChanges.length;
        
        // Coherencia inversa a la volatilidad
        const coherence = Math.exp(-variance / 100) * QUANTUM_CONSTANTS.COHERENCE_THRESHOLD;
        
        return Math.max(0.85, Math.min(0.99, coherence));
    }

    calculateLambdaResonance(avgChange, volume) {
        const lambda = QUANTUM_CONSTANTS.LAMBDA_7919;
        const resonance = Math.sin(lambda * avgChange / 100) * Math.log10(volume) / 20;
        
        return Math.max(0.5, Math.min(1, Math.abs(resonance) * 0.8 + 0.7));
    }

    calculateMarketMomentum(stats) {
        const positiveChanges = stats.filter(s => parseFloat(s.priceChangePercent) > 0).length;
        const totalSymbols = stats.length;
        
        return positiveChanges / totalSymbols;
    }

    calculateConsciousnessLevel(coherence, lambdaResonance) {
        return (coherence * 0.6 + lambdaResonance * 0.4) * 100;
    }

    /**
     * Genera estado del sistema
     */
    generateSystemState(metrics) {
        return {
            status: 'OPERATIONAL',
            uptime: process.uptime(),
            coherenceLevel: (metrics.coherence * 100).toFixed(1) + '%',
            lambdaResonance: (metrics.lambdaResonance * 100).toFixed(1) + '%',
            consciousnessLevel: metrics.consciousnessLevel.toFixed(1) + '%',
            activeEngines: 4,
            totalNeurons: 77,
            marketCondition: this.assessMarketCondition(metrics),
            timestamp: new Date().toISOString()
        };
    }

    assessMarketCondition(metrics) {
        if (metrics.coherence > 0.9 && metrics.lambdaResonance > 0.8) {
            return 'OPTIMAL';
        } else if (metrics.coherence > 0.8 && metrics.lambdaResonance > 0.7) {
            return 'GOOD';
        } else if (metrics.coherence > 0.7) {
            return 'MODERATE';
        } else {
            return 'VOLATILE';
        }
    }

    generateMarketSummary(stats24hr, quantumSymbols) {
        const relevantStats = stats24hr.filter(s => quantumSymbols.includes(s.symbol));
        
        if (relevantStats.length === 0) {
            return this.getFallbackMarketSummary();
        }
        
        const gainers = relevantStats.filter(s => parseFloat(s.priceChangePercent) > 0).length;
        const losers = relevantStats.filter(s => parseFloat(s.priceChangePercent) < 0).length;
        const totalVolume = relevantStats.reduce((sum, s) => sum + parseFloat(s.volume), 0);
        
        return {
            totalSymbols: relevantStats.length,
            gainers,
            losers,
            neutral: relevantStats.length - gainers - losers,
            totalVolume24h: totalVolume,
            avgChange: relevantStats.reduce((sum, s) => sum + parseFloat(s.priceChangePercent), 0) / relevantStats.length,
            topGainer: relevantStats.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))[0],
            topLoser: relevantStats.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))[0]
        };
    }

    // Helper functions for filtering
    filterPricesBySymbols(prices, symbols) {
        return prices.filter(price => symbols.includes(price.symbol));
    }

    // Fallback functions for when API is not available
    getFallbackQuantumScore(symbol) {
        const index = QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.indexOf(symbol);
        const phi = QUANTUM_CONSTANTS.PHI_GOLDEN;
        const lambda = QUANTUM_CONSTANTS.LAMBDA_7919;
        
        return 60 + Math.sin(lambda * index / phi) * 30;
    }

    getFallback24HrStats() {
        console.log('[BINANCE] 🔄 Using fallback 24hr stats');
        return QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.map((symbol, index) => ({
            symbol,
            priceChangePercent: (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 10,
            volume: this.purifier.generateQuantumValue(index, modifier) * 1000000,
            count: Math.floor(this.purifier.generateQuantumValue(index, modifier) * 10000),
            highPrice: 100 * (1 + this.purifier.generateQuantumValue(index, modifier) * 0.1),
            lowPrice: 100 * (1 - this.purifier.generateQuantumValue(index, modifier) * 0.1)
        }));
    }

    getFallbackPrices(symbols) {
        const targetSymbols = symbols || QUANTUM_CONSTANTS.QUANTUM_SYMBOLS;
        console.log('[BINANCE] 🔄 Using fallback prices');
        return targetSymbols.map(symbol => ({
            symbol,
            price: this.generateFallbackPrice(symbol)
        }));
    }

    generateFallbackPrice(symbol) {
        const basePrices = {
            'BTCUSDT': 43000,
            'ETHUSDT': 2600,
            'BNBUSDT': 300,
            'SOLUSDT': 100,
            'XRPUSDT': 0.6,
            'ADAUSDT': 0.5
        };
        
        const basePrice = basePrices[symbol] || 10;
        const variation = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.1;
        
        return basePrice * (1 + variation);
    }

    getFallbackOrderBook() {
        console.log('[BINANCE] 🔄 Using fallback order book');
        return QUANTUM_CONSTANTS.QUANTUM_SYMBOLS.map(symbol => ({
            symbol,
            bidPrice: this.generateFallbackPrice(symbol) * 0.999,
            askPrice: this.generateFallbackPrice(symbol) * 1.001
        }));
    }

    getFallbackQuantumMetrics() {
        return {
            coherence: 0.963,
            lambdaResonance: 0.791,
            totalVolume: 1000000000,
            avgPriceChange: 2.5,
            totalTrades: 500000,
            activeSymbols: 77,
            marketMomentum: 0.6,
            consciousnessLevel: 85
        };
    }

    getFallbackMarketSummary() {
        return {
            totalSymbols: 77,
            gainers: 45,
            losers: 28,
            neutral: 4,
            totalVolume24h: 1500000000,
            avgChange: 2.1,
            topGainer: { symbol: 'BTCUSDT', priceChangePercent: '8.5' },
            topLoser: { symbol: 'ADAUSDT', priceChangePercent: '-3.2' }
        };
    }

    getFallbackDashboardData() {
        console.log('[BINANCE] 🔄 Using fallback dashboard data');
        return {
            timestamp: new Date().toISOString(),
            validSymbolsCount: 475,
            quantumSymbolsCount: 77,
            symbolsByTier: {
                TIER1: [
                    { symbol: 'BTCUSDT', tier: 'TIER1', price: 43250, change24h: 2.5, volume24h: 1000000, quantumScore: 85, coherence: 0.95 },
                    { symbol: 'ETHUSDT', tier: 'TIER1', price: 2650, change24h: 1.8, volume24h: 800000, quantumScore: 82, coherence: 0.93 },
                    { symbol: 'BNBUSDT', tier: 'TIER1', price: 305, change24h: 3.2, volume24h: 500000, quantumScore: 78, coherence: 0.91 }
                ]
            },
            quantumMetrics: this.getFallbackQuantumMetrics(),
            systemState: {
                status: 'OPERATIONAL',
                uptime: process.uptime(),
                coherenceLevel: '96.3%',
                lambdaResonance: '79.1%',
                consciousnessLevel: '85.0%',
                activeEngines: 4,
                totalNeurons: 77,
                marketCondition: 'OPTIMAL',
                timestamp: new Date().toISOString()
            },
            marketSummary: this.getFallbackMarketSummary()
        };
    }
}

export { BinanceDataService };
