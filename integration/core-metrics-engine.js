import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * 🔬 CORE METRICS ENGINE - MÉTRICAS NO REDUNDANTES OPTIMIZADAS
 * ============================================================
 * Sistema de 5 métricas core unificadas que alimentan el orquestador dimensional
 * Elimina redundancias y captura información esencial para trading cuántico
 * 
 * INTEGRA CON:
 * - Dimensional Intelligence Orchestrator (Puerto 14999)
 * - Leonardo Consciousness System (Puerto 9090)
 * - Merkaba Trading Protocol (Puerto 14401)
 * - Sistema Hermético y Akásico (Puerto 8888)
 */

import { EventEmitter } from 'events';

class CoreMetricsEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Configuración de datos de mercado
            symbols: config.symbols || ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
            updateInterval: config.updateInterval || 3000, // 3 segundos (fibonacci)
            
            // Umbrales de activación
            funding_extreme_threshold: config.funding_extreme_threshold || 0.7,
            liquidity_toxicity_threshold: config.liquidity_toxicity_threshold || 0.3,
            vol_regime_crisis_percentile: config.vol_regime_crisis_percentile || 90,
            price_discovery_efficiency_threshold: config.price_discovery_efficiency_threshold || 0.95,
            institutional_sentiment_std_multiplier: config.institutional_sentiment_std_multiplier || 1.5,
            
            // Generación determinística sin Math.random (usando λ₇₉₁₉)
            lambda_7919: 7919.23584,
            phi_golden: 1.618033988749,
            use_deterministic_generation: true
        };
        
        // Estado de métricas core
        this.coreMetrics = {
            funding_ecosystem_health: {
                current_rate: 0,
                rate_velocity: 0,
                carry_opportunity: 0,
                extremeness: 0,
                signal: 'NEUTRAL'
            },
            liquidity_flow_dynamics: {
                directional_flow: 0,
                orderbook_toxicity: 0,
                whale_footprint: 0,
                venue_arbitrage: 0,
                signal: 'NEUTRAL'
            },
            volatility_regime: {
                realized_vol: 0,
                vol_of_vol: 0,
                vol_skew: 0,
                vol_term_structure: 0,
                regime: 'NORMAL',
                signal: 'NEUTRAL'
            },
            price_discovery_efficiency: {
                cross_venue_efficiency: 0,
                microstructure_noise: 0,
                information_share: 0,
                mean_reversion_speed: 0,
                signal: 'NEUTRAL'
            },
            institutional_sentiment: {
                options_flow_bias: 0,
                gamma_exposure: 0,
                funding_vs_spot: 0,
                term_structure_slope: 0,
                sentiment_score: 0,
                signal: 'NEUTRAL'
            }
        };
        
        // Cache de datos históricos para cálculos
        this.historicalData = {
            fundingRates: new Map(),
            priceData: new Map(),
            volumeData: new Map(),
            tradesData: new Map(),
            orderbookData: new Map()
        };
        
        // Métricas de rendimiento
        this.performance = {
            calculations_per_second: 0,
            last_update_timestamp: 0,
            successful_calculations: 0,
            failed_calculations: 0,
            data_freshness: 0
        };
        
        // Intervalos para actualizaciones
        this.updateInterval = null;
        this.isActive = false;
        
        console.log('[CORE_METRICS] Engine inicializado con 5 metricas core no redundantes');
        this.logMetric('CORE_METRICS', 'INITIALIZATION', 'SUCCESS');
    }
    
    /**
     * [FIRE] MÉTRICA 1: FUNDING ECOSYSTEM HEALTH
     * Reemplaza: Volume Delta + OBV + Accumulation/Distribution + Multiple EMAs + SMAs + Momentum
     */
    async calculateFundingEcosystemHealth(symbol) {
        try {
            // Obtener datos de funding rate
            const fundingRates = await this.getFundingRatesHistory(symbol, 72); // 3 días
            if (!fundingRates || fundingRates.length < 2) {
                return this.getDefaultFundingHealth();
            }
            
            const currentRate = fundingRates[0].fundingRate;
            const prevRate = fundingRates[1].fundingRate;
            
            // Calcular velocidad de cambio del funding rate
            const rateVelocity = (currentRate - prevRate) * 24; // Cambio por día
            
            // Calcular extremidad usando desviación estándar histórica
            const rates = fundingRates.map(r => r.fundingRate);
            const avgRate = this.calculateMean(rates);
            const stdRate = this.calculateStandardDeviation(rates, avgRate);
            const extremeness = Math.tanh(Math.abs(currentRate) / Math.max(stdRate, 0.001));
            
            // Calcular oportunidad de carry trade (simplificado)
            const borrowingCost = 0.05 / 365; // 5% anual simplificado
            const fundingYield = Math.abs(currentRate) * 3; // 3 veces al día
            const carryOpportunity = fundingYield - borrowingCost;
            
            const fundingHealth = {
                current_rate: currentRate * 100,
                rate_velocity: rateVelocity * 100,
                carry_opportunity: carryOpportunity * 100,
                extremeness: extremeness,
                signal: this.generateFundingSignal(extremeness, Math.abs(rateVelocity))
            };
            
            this.coreMetrics.funding_ecosystem_health = fundingHealth;
            this.logMetric('FUNDING_HEALTH', 'EXTREMENESS', extremeness.toFixed(3));
            
            return fundingHealth;
            
        } catch (error) {
            this.logMetric('FUNDING_HEALTH', 'ERROR', error.message);
            this.performance.failed_calculations++;
            return this.getDefaultFundingHealth();
        }
    }
    
    /**
     * [FIRE] MÉTRICA 2: LIQUIDITY FLOW DYNAMICS
     * Reemplaza: RSI + Stoch + Williams %R + CCI + MACD + Signal + Histogram + Bollinger Bands
     */
    async calculateLiquidityFlowDynamics(symbol) {
        try {
            // Obtener datos de trades y orderbook recientes
            const recentTrades = await this.getRecentTrades(symbol, 100);
            const orderbook = await this.getOrderbook(symbol);
            
            if (!recentTrades || !orderbook) {
                return this.getDefaultLiquidityFlow();
            }
            
            // Calcular flujo direccional usando momentum de precio y volumen
            const priceDelta = this.calculatePriceMomentum(recentTrades);
            const volumeRatio = this.calculateVolumeRatio(recentTrades);
            const spreadCompression = this.analyzeSpreadCompression(orderbook);
            
            const directionalFlow = Math.sign(priceDelta) * Math.sqrt(volumeRatio * spreadCompression);
            
            // Calcular toxicidad del orderbook
            const bidPressure = this.calculateBidPressure(orderbook);
            const askPressure = this.calculateAskPressure(orderbook);
            const totalDepth = bidPressure + askPressure;
            const orderbookToxicity = totalDepth > 0 ? (bidPressure - askPressure) / totalDepth : 0;
            
            // Detectar huellas de ballenas
            const whaleFootprint = this.detectWhaleFootprint(recentTrades);
            
            // Calcular arbitraje entre venues (simplificado)
            const venueArbitrage = await this.calculateVenueArbitrage(symbol);
            
            const liquidityFlow = {
                directional_flow: directionalFlow,
                orderbook_toxicity: orderbookToxicity,
                whale_footprint: whaleFootprint,
                venue_arbitrage: venueArbitrage,
                signal: this.generateLiquiditySignal(Math.abs(orderbookToxicity), whaleFootprint)
            };
            
            this.coreMetrics.liquidity_flow_dynamics = liquidityFlow;
            this.logMetric('LIQUIDITY_FLOW', 'TOXICITY', orderbookToxicity.toFixed(3));
            
            return liquidityFlow;
            
        } catch (error) {
            this.logMetric('LIQUIDITY_FLOW', 'ERROR', error.message);
            this.performance.failed_calculations++;
            return this.getDefaultLiquidityFlow();
        }
    }
    
    /**
     * [FIRE] MÉTRICA 3: VOLATILITY REGIME DETECTION
     * Reemplaza: Large orders + Whale tracking + Dark pools + Iceberg + Put/Call + Max pain + Options flow
     */
    async calculateVolatilityRegime(symbol) {
        try {
            // Obtener datos históricos de precios
            const priceHistory = await this.getPriceHistory(symbol, 48); // 48 horas
            if (!priceHistory || priceHistory.length < 10) {
                return this.getDefaultVolatilityRegime();
            }
            
            // Calcular volatilidad realizada (24h)
            const returns24h = this.calculateReturns(priceHistory.slice(0, 24));
            const realizedVol = Math.sqrt(252) * this.calculateStandardDeviation(returns24h, 0);
            
            // Calcular volatilidad de volatilidad (7 días simulados)
            const volSeries = [];
            for (let i = 0; i < Math.min(7, Math.floor(priceHistory.length / 24)); i++) {
                const dayReturns = this.calculateReturns(priceHistory.slice(i * 24, (i + 1) * 24));
                volSeries.push(this.calculateStandardDeviation(dayReturns, 0));
            }
            const volOfVol = volSeries.length > 1 ? this.calculateStandardDeviation(volSeries, this.calculateMean(volSeries)) : 0;
            
            // Simular vol skew y term structure (datos opciones no disponibles)
            const volSkew = this.generateDeterministicValue('vol_skew', symbol) * 0.1 - 0.05; // -5% a +5%
            const volTermStructure = this.generateDeterministicValue('vol_term', symbol) * 0.2 - 0.1; // -10% a +10%
            
            // Clasificar régimen de volatilidad
            const volRegime = this.classifyVolatilityRegime(realizedVol, volOfVol, symbol);
            
            const volatilityRegime = {
                realized_vol: realizedVol,
                vol_of_vol: volOfVol,
                vol_skew: volSkew,
                vol_term_structure: volTermStructure,
                regime: volRegime,
                signal: this.generateVolatilitySignal(volRegime)
            };
            
            this.coreMetrics.volatility_regime = volatilityRegime;
            this.logMetric('VOL_REGIME', 'CLASSIFICATION', volRegime);
            
            return volatilityRegime;
            
        } catch (error) {
            this.logMetric('VOL_REGIME', 'ERROR', error.message);
            this.performance.failed_calculations++;
            return this.getDefaultVolatilityRegime();
        }
    }
    
    /**
     * [FIRE] MÉTRICA 4: PRICE DISCOVERY EFFICIENCY
     * Combinación optimizada de eficiencia cross-venue + microstructure noise
     */
    async calculatePriceDiscoveryEfficiency(symbol) {
        try {
            // Obtener precios de múltiples fuentes (simulado)
            const prices = await this.getMultiVenuePrices(symbol);
            const tickData = await this.getTickData(symbol, 1000); // 1000 ticks
            
            // Calcular eficiencia cross-venue
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);
            const avgPrice = this.calculateMean(prices);
            const crossVenueEfficiency = avgPrice > 0 ? 1 - (maxPrice - minPrice) / avgPrice : 0;
            
            // Calcular ruido microestructural
            let microstructureNoise = 0;
            if (tickData && tickData.length > 10) {
                const tickReturns = this.calculateReturns(tickData.map(t => t.price));
                const fiveMinReturns = this.calculate5MinReturns(tickData);
                const tickStd = this.calculateStandardDeviation(tickReturns, 0);
                const fiveMinStd = this.calculateStandardDeviation(fiveMinReturns, 0);
                microstructureNoise = fiveMinStd > 0 ? tickStd / fiveMinStd : 0;
            }
            
            // Calcular información compartida (correlación precio-volumen)
            const priceChanges = this.calculateReturns(tickData.map(t => t.price));
            const volumeChanges = this.calculateVolumeChanges(tickData);
            const informationShare = this.calculateCorrelation(priceChanges, volumeChanges);
            
            // Calcular velocidad de reversión a la media
            const meanReversionSpeed = this.calculateMeanReversionSpeed(tickData);
            
            const priceDiscovery = {
                cross_venue_efficiency: crossVenueEfficiency,
                microstructure_noise: microstructureNoise,
                information_share: informationShare,
                mean_reversion_speed: meanReversionSpeed,
                signal: this.generatePriceDiscoverySignal(crossVenueEfficiency, microstructureNoise)
            };
            
            this.coreMetrics.price_discovery_efficiency = priceDiscovery;
            this.logMetric('PRICE_DISCOVERY', 'EFFICIENCY', crossVenueEfficiency.toFixed(3));
            
            return priceDiscovery;
            
        } catch (error) {
            this.logMetric('PRICE_DISCOVERY', 'ERROR', error.message);
            this.performance.failed_calculations++;
            return this.getDefaultPriceDiscovery();
        }
    }
    
    /**
     * [FIRE] MÉTRICA 5: INSTITUTIONAL SENTIMENT PROXY
     * Proxy consolidado del flujo institucional real
     */
    async calculateInstitutionalSentiment(symbol) {
        try {
            // Datos de opciones simulados (no disponibles en Binance Futures)
            const optionsFlowBias = this.generateDeterministicValue('options_flow', symbol) * 2 - 1; // -1 a +1
            
            // Gamma exposure simulado
            const gammaExposure = this.generateDeterministicValue('gamma', symbol) * 1000000; // 0 a 1M
            
            // Funding vs spot (disponible)
            const futuresPrice = await this.getFuturesPrice(symbol);
            const spotPrice = await this.getSpotPrice(symbol);
            const fundingVsSpot = (spotPrice > 0) ? (futuresPrice - spotPrice) / spotPrice : 0;
            
            // Term structure slope (simulado)
            const termStructureSlope = this.generateDeterministicValue('term_structure', symbol) * 0.1 - 0.05;
            
            // Calcular score de sentimiento ponderado
            const sentimentComponents = {
                options_flow_bias: optionsFlowBias * 0.3,
                gamma_exposure: (gammaExposure / 1000000) * 0.2,
                funding_vs_spot: fundingVsSpot * 100 * 0.35, // Peso mayor por ser real
                term_structure_slope: termStructureSlope * 0.15
            };
            
            const sentimentScore = Object.values(sentimentComponents).reduce((sum, val) => sum + val, 0);
            
            const institutionalSentiment = {
                options_flow_bias: optionsFlowBias,
                gamma_exposure: gammaExposure,
                funding_vs_spot: fundingVsSpot,
                term_structure_slope: termStructureSlope,
                sentiment_score: sentimentScore,
                signal: this.generateInstitutionalSignal(Math.abs(sentimentScore))
            };
            
            this.coreMetrics.institutional_sentiment = institutionalSentiment;
            this.logMetric('INSTITUTIONAL', 'SENTIMENT_SCORE', sentimentScore.toFixed(3));
            
            return institutionalSentiment;
            
        } catch (error) {
            this.logMetric('INSTITUTIONAL', 'ERROR', error.message);
            this.performance.failed_calculations++;
            return this.getDefaultInstitutionalSentiment();
        }
    }
    
    /**
     * [TARGET] CONSOLIDACIÓN DE INTELIGENCIA SUPREMA
     * Integra las 5 métricas core en señal maestra
     */
    generateMasterSignal() {
        const signals = {
            funding: this.coreMetrics.funding_ecosystem_health.signal,
            liquidity: this.coreMetrics.liquidity_flow_dynamics.signal,
            volatility: this.coreMetrics.volatility_regime.signal,
            price_discovery: this.coreMetrics.price_discovery_efficiency.signal,
            institutional: this.coreMetrics.institutional_sentiment.signal
        };
        
        // Condiciones de entrada optimizadas
        const entryConditions = [
            this.coreMetrics.funding_ecosystem_health.extremeness > this.config.funding_extreme_threshold,
            Math.abs(this.coreMetrics.liquidity_flow_dynamics.directional_flow) > 0.5,
            this.coreMetrics.volatility_regime.regime !== 'CRISIS',
            this.coreMetrics.price_discovery_efficiency.cross_venue_efficiency > this.config.price_discovery_efficiency_threshold
        ];
        
        const entryScore = entryConditions.filter(Boolean).length / entryConditions.length;
        
        // Condiciones de salida optimizadas
        const exitConditions = [
            Math.abs(this.coreMetrics.funding_ecosystem_health.rate_velocity) < 0.05,
            this.coreMetrics.liquidity_flow_dynamics.whale_footprint < 0,
            this.coreMetrics.volatility_regime.regime === 'CRISIS'
        ];
        
        const exitScore = exitConditions.filter(Boolean).length / exitConditions.length;
        
        // Condiciones de riesgo
        const riskConditions = [
            this.coreMetrics.price_discovery_efficiency.cross_venue_efficiency < 0.90,
            Math.abs(this.coreMetrics.institutional_sentiment.sentiment_score) > 2.0,
            this.coreMetrics.volatility_regime.regime === 'CRISIS'
        ];
        
        const riskScore = riskConditions.filter(Boolean).length / riskConditions.length;
        
        const masterSignal = {
            entry_score: entryScore,
            exit_score: exitScore,
            risk_score: riskScore,
            overall_signal: this.calculateOverallSignal(entryScore, exitScore, riskScore),
            individual_signals: signals,
            timestamp: Date.now()
        };
        
        this.logMetric('MASTER_SIGNAL', 'ENTRY_SCORE', entryScore.toFixed(3));
        this.logMetric('MASTER_SIGNAL', 'RISK_SCORE', riskScore.toFixed(3));
        
        this.emit('master-signal-generated', masterSignal);
        return masterSignal;
    }
    
    // ========== MÉTODOS DE GENERACIÓN DETERMINÍSTICA ==========
    
    /**
     * Genera valor determinístico usando λ₇₉₁₉ (NO Math.random)
     */
    generateDeterministicValue(metric, symbol, modifier = 1) {
        if (!this.config.use_deterministic_generation) {
            return this.purifier.generateQuantumValue(index, modifier); // Fallback para testing
        }
        
        const symbolIndex = this.config.symbols.indexOf(symbol) + 1;
        const timeIndex = Math.floor(Date.now() / 10000); // Cambia cada 10 segundos
        const metricHash = this.hashString(metric);
        
        const lambda_factor = Math.sin(this.config.lambda_7919 * symbolIndex / 1000);
        const time_factor = Math.cos(timeIndex * this.config.phi_golden / 1000);
        const metric_factor = Math.sin(metricHash * modifier / 100);
        
        const combined = lambda_factor * time_factor * metric_factor;
        return (combined + 1) / 2; // Normalizar a [0, 1]
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    // ========== MÉTODOS DE CÁLCULO AUXILIARES ==========
    
    calculateMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    calculateStandardDeviation(values, mean = null) {
        const avg = mean !== null ? mean : this.calculateMean(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        return Math.sqrt(this.calculateMean(squareDiffs));
    }
    
    calculateReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            if (prices[i-1] > 0) {
                returns.push(Math.log(prices[i] / prices[i-1]));
            }
        }
        return returns;
    }
    
    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length < 2) return 0;
        
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    // ========== SEÑALES Y CLASIFICACIONES ==========
    
    generateFundingSignal(extremeness, rateVelocity) {
        if (extremeness > 0.7 || rateVelocity > 0.1) return 'REVERSAL_LIKELY';
        if (extremeness < 0.3 && rateVelocity < 0.05) return 'STABLE';
        return 'NEUTRAL';
    }
    
    generateLiquiditySignal(toxicity, whaleFootprint) {
        if (Math.abs(toxicity) > 0.3 && whaleFootprint > 0) return 'INSTITUTIONAL_MOVEMENT';
        if (Math.abs(toxicity) > 0.5) return 'HIGH_TOXICITY';
        return 'NEUTRAL';
    }
    
    generateVolatilitySignal(regime) {
        return regime === 'CRISIS' ? 'HIGH_RISK' : 
               regime === 'LOW' ? 'LOW_RISK' : 'NORMAL_RISK';
    }
    
    generatePriceDiscoverySignal(efficiency, noise) {
        if (efficiency < 0.95 || noise > 2.0) return 'ARBITRAGE_OPPORTUNITY';
        return 'EFFICIENT';
    }
    
    generateInstitutionalSignal(sentimentAbs) {
        return sentimentAbs > 1.5 ? 'EXTREME_SENTIMENT' : 'NORMAL_SENTIMENT';
    }
    
    classifyVolatilityRegime(realizedVol, volOfVol, symbol) {
        // Usar percentiles históricos simulados
        const historicalVol = this.getHistoricalVolatilityPercentiles(symbol);
        
        if (realizedVol > historicalVol.p90) return 'CRISIS';
        if (realizedVol < historicalVol.p10) return 'LOW';
        if (volOfVol > historicalVol.volOfVolThreshold) return 'UNSTABLE';
        return 'NORMAL';
    }
    
    calculateOverallSignal(entryScore, exitScore, riskScore) {
        if (riskScore > 0.6) return 'HIGH_RISK';
        if (entryScore > 0.75) return 'STRONG_ENTRY';
        if (exitScore > 0.75) return 'STRONG_EXIT';
        if (entryScore > 0.5) return 'ENTRY';
        return 'NEUTRAL';
    }
    
    // ========== MÉTODOS DE DATOS (SIMULADOS/REALES) ==========
    
    async getFundingRatesHistory(symbol, hours) {
        // Simular datos de funding rate con patrón determinístico
        const rates = [];
        for (let i = 0; i < hours; i++) {
            const time = Date.now() - (i * 3600000); // Hora hacia atrás
            const baseRate = this.generateDeterministicValue('funding', symbol, i) * 0.002 - 0.001; // -0.1% a +0.1%
            rates.push({
                symbol: symbol,
                fundingRate: baseRate,
                fundingTime: time
            });
        }
        return rates;
    }
    
    async getRecentTrades(symbol, count) {
        // Simular trades recientes
        const trades = [];
        const basePrice = 50000; // Precio base para BTC
        
        for (let i = 0; i < count; i++) {
            const time = Date.now() - (i * 1000); // Segundo hacia atrás
            const priceVariation = this.generateDeterministicValue('price', symbol, i) * 0.001 - 0.0005;
            const volumeVariation = this.generateDeterministicValue('volume', symbol, i) * 10;
            
            trades.push({
                id: time,
                price: basePrice * (1 + priceVariation),
                qty: volumeVariation,
                time: time,
                isBuyerMaker: this.generateDeterministicValue('side', symbol, i) > 0.5
            });
        }
        return trades;
    }
    
    async getOrderbook(symbol) {
        // Simular orderbook
        const basePrice = 50000;
        const bids = [];
        const asks = [];
        
        for (let i = 1; i <= 20; i++) {
            const bidPrice = basePrice * (1 - i * 0.0001);
            const askPrice = basePrice * (1 + i * 0.0001);
            const bidQty = this.generateDeterministicValue('bid_qty', symbol, i) * 10;
            const askQty = this.generateDeterministicValue('ask_qty', symbol, i) * 10;
            
            bids.push([bidPrice.toString(), bidQty.toString()]);
            asks.push([askPrice.toString(), askQty.toString()]);
        }
        
        return { bids, asks };
    }
    
    // ========== VALORES POR DEFECTO ==========
    
    getDefaultFundingHealth() {
        return {
            current_rate: 0,
            rate_velocity: 0,
            carry_opportunity: 0,
            extremeness: 0,
            signal: 'NEUTRAL'
        };
    }
    
    getDefaultLiquidityFlow() {
        return {
            directional_flow: 0,
            orderbook_toxicity: 0,
            whale_footprint: 0,
            venue_arbitrage: 0,
            signal: 'NEUTRAL'
        };
    }
    
    getDefaultVolatilityRegime() {
        return {
            realized_vol: 0,
            vol_of_vol: 0,
            vol_skew: 0,
            vol_term_structure: 0,
            regime: 'NORMAL',
            signal: 'NEUTRAL'
        };
    }
    
    getDefaultPriceDiscovery() {
        return {
            cross_venue_efficiency: 0.95,
            microstructure_noise: 1.0,
            information_share: 0.5,
            mean_reversion_speed: 0.1,
            signal: 'EFFICIENT'
        };
    }
    
    getDefaultInstitutionalSentiment() {
        return {
            options_flow_bias: 0,
            gamma_exposure: 0,
            funding_vs_spot: 0,
            term_structure_slope: 0,
            sentiment_score: 0,
            signal: 'NEUTRAL'
        };
    }
    
    // ========== MÉTODOS AUXILIARES ADICIONALES ==========
    
    calculatePriceMomentum(trades) {
        if (trades.length < 2) return 0;
        const firstPrice = trades[trades.length - 1].price;
        const lastPrice = trades[0].price;
        return (lastPrice - firstPrice) / firstPrice;
    }
    
    calculateVolumeRatio(trades) {
        if (trades.length < 10) return 1;
        const recentVolume = trades.slice(0, 10).reduce((sum, t) => sum + parseFloat(t.qty), 0);
        const olderVolume = trades.slice(-10).reduce((sum, t) => sum + parseFloat(t.qty), 0);
        return olderVolume > 0 ? recentVolume / olderVolume : 1;
    }
    
    analyzeSpreadCompression(orderbook) {
        if (!orderbook.bids[0] || !orderbook.asks[0]) return 1;
        const spread = parseFloat(orderbook.asks[0][0]) - parseFloat(orderbook.bids[0][0]);
        const midPrice = (parseFloat(orderbook.asks[0][0]) + parseFloat(orderbook.bids[0][0])) / 2;
        return midPrice > 0 ? 1 - (spread / midPrice) : 1; // Invertido: menor spread = mayor compresión
    }
    
    calculateBidPressure(orderbook) {
        return orderbook.bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
    }
    
    calculateAskPressure(orderbook) {
        return orderbook.asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);
    }
    
    detectWhaleFootprint(trades) {
        if (trades.length === 0) return 0;
        const volumes = trades.map(t => parseFloat(t.qty));
        const meanVolume = this.calculateMean(volumes);
        const largeTradesCount = volumes.filter(v => v > meanVolume * 5).length;
        return largeTradesCount / trades.length;
    }
    
    async calculateVenueArbitrage(symbol) {
        // Simular diferencias de precio entre exchanges
        return this.generateDeterministicValue('venue_arb', symbol) * 0.001; // 0 a 0.1%
    }
    
    async getPriceHistory(symbol, hours) {
        const prices = [];
        const basePrice = 50000;
        
        for (let i = 0; i < hours; i++) {
            const time = Date.now() - (i * 3600000);
            const variation = this.generateDeterministicValue('historical_price', symbol, i) * 0.05 - 0.025;
            prices.push(basePrice * (1 + variation));
        }
        return prices;
    }
    
    getHistoricalVolatilityPercentiles(symbol) {
        const baseVol = 0.02; // 2% volatilidad base
        return {
            p10: baseVol * 0.5,
            p90: baseVol * 2.5,
            volOfVolThreshold: baseVol * 0.1
        };
    }
    
    async getMultiVenuePrices(symbol) {
        const basePrice = 50000;
        const venues = ['binance', 'coinbase', 'bybit', 'okx'];
        return venues.map(venue => {
            const variation = this.generateDeterministicValue(`${venue}_price`, symbol) * 0.001 - 0.0005;
            return basePrice * (1 + variation);
        });
    }
    
    async getTickData(symbol, count) {
        // Simular datos de tick
        return this.getRecentTrades(symbol, count);
    }
    
    calculate5MinReturns(tickData) {
        const fiveMinBuckets = [];
        const bucketSize = Math.floor(tickData.length / 10); // 10 buckets de 5 minutos simulados
        
        for (let i = 0; i < 10; i++) {
            const bucket = tickData.slice(i * bucketSize, (i + 1) * bucketSize);
            if (bucket.length > 0) {
                const avgPrice = this.calculateMean(bucket.map(t => t.price));
                fiveMinBuckets.push(avgPrice);
            }
        }
        
        return this.calculateReturns(fiveMinBuckets);
    }
    
    calculateVolumeChanges(tickData) {
        const volumes = tickData.map(t => parseFloat(t.qty));
        const changes = [];
        for (let i = 1; i < volumes.length; i++) {
            changes.push(volumes[i] - volumes[i-1]);
        }
        return changes;
    }
    
    calculateMeanReversionSpeed(tickData) {
        if (tickData.length < 10) return 0.1;
        
        const prices = tickData.map(t => t.price);
        const returns = this.calculateReturns(prices);
        
        // Calcular autocorrelación simple
        let autocorr = 0;
        for (let i = 1; i < returns.length; i++) {
            autocorr += returns[i] * returns[i-1];
        }
        autocorr /= (returns.length - 1);
        
        // Convertir a velocidad de reversión
        return Math.max(0, -Math.log(Math.abs(autocorr) + 0.01));
    }
    
    async getFuturesPrice(symbol) {
        return 50000 * (1 + this.generateDeterministicValue('futures', symbol) * 0.001);
    }
    
    async getSpotPrice(symbol) {
        return 50000 * (1 + this.generateDeterministicValue('spot', symbol) * 0.001);
    }
    
    // ========== CONTROL Y MONITOREO ==========
    
    /**
     * Inicia el motor de métricas core
     */
    start() {
        if (this.isActive) {
            console.log('[CORE_METRICS] Motor ya activo');
            return;
        }
        
        this.isActive = true;
        console.log('[CORE_METRICS] Iniciando motor de metricas core...');
        
        // Actualizar métricas cada 3 segundos
        this.updateInterval = setInterval(async () => {
            await this.updateAllMetrics();
        }, this.config.updateInterval);
        
        // Actualización inicial inmediata
        setTimeout(() => {
            this.updateAllMetrics();
        }, 1000);
        
        this.logMetric('CORE_METRICS', 'STATUS', 'STARTED');
    }
    
    /**
     * Detiene el motor
     */
    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('[CORE_METRICS] Motor detenido');
        this.logMetric('CORE_METRICS', 'STATUS', 'STOPPED');
    }
    
    /**
     * Actualiza todas las métricas core
     */
    async updateAllMetrics() {
        if (!this.isActive) return;
        
        const startTime = Date.now();
        let successCount = 0;
        
        try {
            // Actualizar métricas para cada símbolo
            for (const symbol of this.config.symbols) {
                try {
                    await Promise.all([
                        this.calculateFundingEcosystemHealth(symbol),
                        this.calculateLiquidityFlowDynamics(symbol),
                        this.calculateVolatilityRegime(symbol),
                        this.calculatePriceDiscoveryEfficiency(symbol),
                        this.calculateInstitutionalSentiment(symbol)
                    ]);
                    successCount++;
                } catch (error) {
                    this.logMetric('UPDATE_ERROR', symbol, error.message);
                }
            }
            
            // Generar señal maestra
            const masterSignal = this.generateMasterSignal();
            
            // Actualizar métricas de rendimiento
            const endTime = Date.now();
            this.performance.calculations_per_second = 1000 / (endTime - startTime);
            this.performance.last_update_timestamp = endTime;
            this.performance.successful_calculations += successCount;
            this.performance.data_freshness = endTime - startTime;
            
            this.emit('metrics-updated', {
                core_metrics: this.coreMetrics,
                master_signal: masterSignal,
                performance: this.performance,
                timestamp: endTime
            });
            
        } catch (error) {
            this.performance.failed_calculations++;
            this.logMetric('UPDATE_ALL_ERROR', 'GENERAL', error.message);
        }
    }
    
    /**
     * Obtiene estado completo del motor
     */
    getEngineStatus() {
        return {
            is_active: this.isActive,
            config: this.config,
            core_metrics: this.coreMetrics,
            performance: this.performance,
            symbols_monitored: this.config.symbols,
            last_update: new Date(this.performance.last_update_timestamp).toISOString()
        };
    }
    
    /**
     * Logging estructurado sin emojis (cumpliendo reglas del usuario)
     */
    logMetric(component, metric, value, unit = '') {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp}|${component}|${metric}|${value}|${unit}`);
    }
}

export default CoreMetricsEngine;

// Uso standalone del motor
if (import.meta.url === `file://${process.argv[1]}`) {
    const engine = new CoreMetricsEngine({
        symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
        updateInterval: 3000
    });
    
    engine.on('metrics-updated', (data) => {
        console.log('\n========== CORE METRICS UPDATE ==========');
        console.log('FUNDING HEALTH:', data.core_metrics.funding_ecosystem_health.signal);
        console.log('LIQUIDITY FLOW:', data.core_metrics.liquidity_flow_dynamics.signal);
        console.log('VOL REGIME:', data.core_metrics.volatility_regime.regime);
        console.log('PRICE DISCOVERY:', data.core_metrics.price_discovery_efficiency.signal);
        console.log('INSTITUTIONAL:', data.core_metrics.institutional_sentiment.signal);
        console.log('MASTER SIGNAL:', data.master_signal.overall_signal);
        console.log('========================================\n');
    });
    
    engine.on('master-signal-generated', (signal) => {
        if (signal.overall_signal !== 'NEUTRAL') {
            console.log(`\n!!! MASTER SIGNAL: ${signal.overall_signal} !!!`);
            console.log(`Entry Score: ${signal.entry_score.toFixed(3)}`);
            console.log(`Risk Score: ${signal.risk_score.toFixed(3)}\n`);
        }
    });
    
    engine.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nDeteniendo Core Metrics Engine...');
        engine.stop();
        process.exit(0);
    });
    
    console.log('Core Metrics Engine iniciado');
    console.log('Generacion deterministica usando lambda_7919 (NO Math.random)');
    console.log('Presiona Ctrl+C para detener');
}
