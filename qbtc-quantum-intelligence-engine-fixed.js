import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 64619;

// ===== CONSTANTES CUÁNTICAS DEL SISTEMA QBTC =====
const QUANTUM_CONSTANTS = {
    LAMBDA_7919: 8.977020214210413,
    PHI: 1.618033988749895,
    GAMMA: 0.5772156649015329,
    EULER: 2.718281828459045,
    PI: 3.141592653589793
};

// ===== ENGINE DE INGENIERÍA INVERSA MEJORADO =====
class QuantumIntelligenceEngineFixed {
    constructor() {
        this.marketState = {};
        this.quantumMetrics = {};
        this.strategyMatrix = {};
        this.recommendationEngine = {};
        this.lastUpdate = Date.now();
    }

    // Generar valor cuántico determinístico
    generateQuantumValue(seed = Date.now()) {
        const lambda = QUANTUM_CONSTANTS.LAMBDA_7919;
        const phi = QUANTUM_CONSTANTS.PHI;
        const gamma = QUANTUM_CONSTANTS.GAMMA;
        
        const quantumValue = Math.sin(seed / lambda) * Math.cos(seed / phi) * gamma;
        return Math.abs(quantumValue) % 1;
    }

    // Obtener datos reales del mercado con fallback robusto
    async getRealMarketData(symbol) {
        try {
            // Intentar Binance primero
            const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
            const data = await this.makeHttpsRequest(binanceUrl);
            
            if (data && data.price) {
                return {
                    price: parseFloat(data.price),
                    change24h: 0,
                    source: 'binance-real',
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            console.log(`⚠️ Binance failed for ${symbol}: ${error.message}`);
        }

        try {
            // Fallback a CoinGecko
            const symbolMap = {
                'BTCUSDT': 'bitcoin',
                'ETHUSDT': 'ethereum',
                'BNBUSDT': 'binancecoin',
                'ADAUSDT': 'cardano',
                'SOLUSDT': 'solana'
            };
            
            const coinId = symbolMap[symbol];
            if (!coinId) throw new Error(`Symbol ${symbol} not supported`);
            
            const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
            const data = await this.makeHttpsRequest(coingeckoUrl);
            
            if (data && data[coinId] && data[coinId].usd) {
                return {
                    price: parseFloat(data[coinId].usd),
                    change24h: data[coinId].usd_24h_change || 0,
                    source: 'coingecko-real',
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            console.log(`⚠️ CoinGecko failed for ${symbol}: ${error.message}`);
        }

        // Fallback final con datos simulados basados en precios reales conocidos
        console.log(`🔄 Using fallback data for ${symbol}`);
        return this.getFallbackData(symbol);
    }

    // Datos de fallback basados en precios reales conocidos
    getFallbackData(symbol) {
        const basePrices = {
            'BTCUSDT': 108000,
            'ETHUSDT': 4350,
            'BNBUSDT': 580,
            'ADAUSDT': 0.45,
            'SOLUSDT': 95
        };

        const basePrice = basePrices[symbol] || 100;
        const quantumFactor = this.generateQuantumValue(symbol.charCodeAt(0));
        const variation = (quantumFactor - 0.5) * 0.02; // ±1% variación
        const price = basePrice * (1 + variation);
        const change24h = (quantumFactor - 0.5) * 4; // ±2% cambio 24h

        return {
            price: price,
            change24h: change24h,
            source: 'fallback-quantum-simulated',
            timestamp: Date.now()
        };
    }

    // Análisis de patrones de mercado usando ingeniería inversa
    async analyzeMarketPatterns(symbols) {
        const patterns = {};
        
        for (const symbol of symbols) {
            try {
                const data = await this.getRealMarketData(symbol);
                const price = data.price;
                
                // Ingeniería inversa: Extraer patrones ocultos
                const volatility = this.calculateVolatility(price, data.change24h);
                const momentum = this.calculateMomentum(price, data.change24h);
                const support = this.calculateSupportLevels(price);
                const resistance = this.calculateResistanceLevels(price);
                const quantumState = this.calculateQuantumState(price);
                
                patterns[symbol] = {
                    price,
                    volatility,
                    momentum,
                    support,
                    resistance,
                    quantumState,
                    pattern: this.identifyPattern(volatility, momentum, quantumState),
                    confidence: this.calculateConfidence(volatility, momentum, quantumState),
                    source: data.source,
                    timestamp: data.timestamp
                };
            } catch (error) {
                console.log(`⚠️ Error analyzing ${symbol}: ${error.message}`);
                // Proporcionar datos de fallback incluso si hay error
                patterns[symbol] = this.createFallbackPattern(symbol);
            }
        }
        
        return patterns;
    }

    // Crear patrón de fallback
    createFallbackPattern(symbol) {
        const basePrice = this.getFallbackData(symbol).price;
        const quantumFactor = this.generateQuantumValue(symbol.charCodeAt(0));
        
        return {
            price: basePrice,
            volatility: 50 + quantumFactor * 30,
            momentum: (quantumFactor - 0.5) * 0.8,
            support: [basePrice * 0.95, basePrice * 0.90, basePrice * 0.85],
            resistance: [basePrice * 1.05, basePrice * 1.10, basePrice * 1.15],
            quantumState: {
                consciousness: 70 + quantumFactor * 30,
                coherence: 65 + quantumFactor * 35,
                entanglement: 60 + quantumFactor * 40,
                superposition: 55 + quantumFactor * 45
            },
            pattern: ['NEUTRAL_PATTERN'],
            confidence: 60 + quantumFactor * 30,
            source: 'fallback-pattern',
            timestamp: Date.now()
        };
    }

    // Calcular volatilidad usando ingeniería inversa
    calculateVolatility(price, change24h) {
        const baseVolatility = Math.abs(change24h) / 100;
        const quantumFactor = this.generateQuantumValue(price);
        const volatility = baseVolatility * (1 + quantumFactor);
        return Math.min(100, Math.max(10, volatility * 100)); // Mínimo 10%, máximo 100%
    }

    // Calcular momentum usando análisis técnico inverso
    calculateMomentum(price, change24h) {
        const baseMomentum = change24h / 100;
        const quantumMomentum = this.generateQuantumValue(price * 1000);
        const momentum = baseMomentum + (quantumMomentum - 0.5) * 0.1;
        return Math.max(-1, Math.min(1, momentum));
    }

    // Calcular niveles de soporte usando ingeniería inversa
    calculateSupportLevels(price) {
        const quantumFactor = this.generateQuantumValue(price);
        const support1 = price * (0.95 + quantumFactor * 0.05);
        const support2 = price * (0.90 + quantumFactor * 0.05);
        const support3 = price * (0.85 + quantumFactor * 0.05);
        
        return [support1, support2, support3];
    }

    // Calcular niveles de resistencia usando ingeniería inversa
    calculateResistanceLevels(price) {
        const quantumFactor = this.generateQuantumValue(price * 100);
        const resistance1 = price * (1.05 + quantumFactor * 0.05);
        const resistance2 = price * (1.10 + quantumFactor * 0.05);
        const resistance3 = price * (1.15 + quantumFactor * 0.05);
        
        return [resistance1, resistance2, resistance3];
    }

    // Calcular estado cuántico del mercado
    calculateQuantumState(price) {
        const consciousness = 70 + this.generateQuantumValue(price) * 30;
        const coherence = 65 + this.generateQuantumValue(price * 10) * 35;
        const entanglement = 60 + this.generateQuantumValue(price * 100) * 40;
        const superposition = 55 + this.generateQuantumValue(price * 1000) * 45;
        
        return { consciousness, coherence, entanglement, superposition };
    }

    // Identificar patrones usando ingeniería inversa
    identifyPattern(volatility, momentum, quantumState) {
        const patterns = [];
        
        if (volatility > 50) patterns.push('HIGH_VOLATILITY');
        if (momentum > 0.3) patterns.push('BULLISH_MOMENTUM');
        if (momentum < -0.3) patterns.push('BEARISH_MOMENTUM');
        if (quantumState.consciousness > 80) patterns.push('QUANTUM_COHERENCE');
        if (quantumState.entanglement > 75) patterns.push('MARKET_ENTANGLEMENT');
        
        return patterns.length > 0 ? patterns : ['NEUTRAL_PATTERN'];
    }

    // Calcular confianza usando análisis inverso
    calculateConfidence(volatility, momentum, quantumState) {
        const baseConfidence = 50;
        const volatilityFactor = Math.min(volatility / 100, 1) * 20;
        const momentumFactor = Math.abs(momentum) * 15;
        const quantumFactor = (quantumState.consciousness + quantumState.coherence) / 200 * 15;
        
        return Math.min(95, Math.max(30, baseConfidence + volatilityFactor + momentumFactor + quantumFactor));
    }

    // Generar recomendaciones de alto valor usando ingeniería inversa
    async generateHighValueRecommendations(marketPatterns) {
        const recommendations = [];
        
        for (const [symbol, pattern] of Object.entries(marketPatterns)) {
            const recommendation = this.createRecommendation(symbol, pattern);
            recommendations.push(recommendation);
        }
        
        // Análisis de correlación entre activos
        const correlationAnalysis = this.analyzeCorrelations(marketPatterns);
        
        // Estrategias de portafolio
        const portfolioStrategies = this.generatePortfolioStrategies(recommendations, correlationAnalysis);
        
        return {
            individualRecommendations: recommendations,
            correlationAnalysis,
            portfolioStrategies,
            riskAssessment: this.assessRisk(recommendations),
            quantumInsights: this.generateQuantumInsights(marketPatterns)
        };
    }

    // Crear recomendación individual de alto valor
    createRecommendation(symbol, pattern) {
        const { price, volatility, momentum, support, resistance, pattern: patterns, confidence } = pattern;
        
        // Ingeniería inversa: Determinar acción óptima
        let action = 'HOLD';
        let reason = '';
        let targetPrice = price;
        let stopLoss = price * 0.95;
        let takeProfit = price * 1.05;
        
        if (patterns.includes('BULLISH_MOMENTUM') && confidence > 70) {
            action = 'BUY';
            reason = 'Momentum alcista fuerte con alta confianza cuántica';
            targetPrice = resistance[0];
            stopLoss = support[0];
            takeProfit = resistance[1];
        } else if (patterns.includes('BEARISH_MOMENTUM') && confidence > 70) {
            action = 'SELL';
            reason = 'Momentum bajista fuerte con alta confianza cuántica';
            targetPrice = support[0];
            stopLoss = resistance[0];
            takeProfit = support[1];
        } else if (patterns.includes('HIGH_VOLATILITY')) {
            action = 'SCALP';
            reason = 'Alta volatilidad - oportunidad de scalping';
            targetPrice = momentum > 0 ? resistance[0] : support[0];
            stopLoss = momentum > 0 ? support[0] : resistance[0];
            takeProfit = momentum > 0 ? resistance[1] : support[1];
        } else {
            reason = 'Patrón neutral - mantener posición actual';
        }
        
        return {
            symbol,
            currentPrice: price,
            action,
            reason,
            targetPrice,
            stopLoss,
            takeProfit,
            confidence,
            riskLevel: this.calculateRiskLevel(volatility, momentum),
            timeHorizon: this.calculateTimeHorizon(patterns),
            quantumMetrics: pattern.quantumState,
            technicalIndicators: {
                volatility,
                momentum,
                support: support[0],
                resistance: resistance[0],
                patterns
            },
            source: pattern.source
        };
    }

    // Calcular nivel de riesgo
    calculateRiskLevel(volatility, momentum) {
        const riskScore = (volatility / 100) * 0.6 + Math.abs(momentum) * 0.4;
        
        if (riskScore < 0.3) return 'LOW';
        if (riskScore < 0.6) return 'MEDIUM';
        return 'HIGH';
    }

    // Calcular horizonte temporal
    calculateTimeHorizon(patterns) {
        if (patterns.includes('HIGH_VOLATILITY')) return 'SHORT_TERM';
        if (patterns.includes('QUANTUM_COHERENCE')) return 'MEDIUM_TERM';
        return 'LONG_TERM';
    }

    // Analizar correlaciones entre activos
    analyzeCorrelations(marketPatterns) {
        const symbols = Object.keys(marketPatterns);
        const correlations = {};
        
        for (let i = 0; i < symbols.length; i++) {
            for (let j = i + 1; j < symbols.length; j++) {
                const symbol1 = symbols[i];
                const symbol2 = symbols[j];
                const pattern1 = marketPatterns[symbol1];
                const pattern2 = marketPatterns[symbol2];
                
                const correlation = this.calculateCorrelation(pattern1, pattern2);
                correlations[`${symbol1}-${symbol2}`] = correlation;
            }
        }
        
        return correlations;
    }

    // Calcular correlación entre dos patrones
    calculateCorrelation(pattern1, pattern2) {
        const priceCorrelation = Math.abs(pattern1.price - pattern2.price) / Math.max(pattern1.price, pattern2.price);
        const momentumCorrelation = Math.abs(pattern1.momentum - pattern2.momentum);
        const volatilityCorrelation = Math.abs(pattern1.volatility - pattern2.volatility) / 100;
        
        const correlation = (priceCorrelation + momentumCorrelation + volatilityCorrelation) / 3;
        return Math.min(1, correlation);
    }

    // Generar estrategias de portafolio
    generatePortfolioStrategies(recommendations, correlations) {
        const buySignals = recommendations.filter(r => r.action === 'BUY');
        const sellSignals = recommendations.filter(r => r.action === 'SELL');
        const scalpSignals = recommendations.filter(r => r.action === 'SCALP');
        
        return {
            aggressiveStrategy: {
                name: 'Estrategia Agresiva',
                description: 'Máximo aprovechamiento de oportunidades de alto rendimiento',
                allocations: this.calculateAllocations(buySignals, 'AGGRESSIVE'),
                expectedReturn: this.calculateExpectedReturn(buySignals, 'AGGRESSIVE'),
                riskLevel: 'HIGH'
            },
            balancedStrategy: {
                name: 'Estrategia Balanceada',
                description: 'Equilibrio entre rendimiento y gestión de riesgo',
                allocations: this.calculateAllocations([...buySignals, ...scalpSignals], 'BALANCED'),
                expectedReturn: this.calculateExpectedReturn([...buySignals, ...scalpSignals], 'BALANCED'),
                riskLevel: 'MEDIUM'
            },
            conservativeStrategy: {
                name: 'Estrategia Conservadora',
                description: 'Enfoque en preservación de capital con crecimiento moderado',
                allocations: this.calculateAllocations(scalpSignals, 'CONSERVATIVE'),
                expectedReturn: this.calculateExpectedReturn(scalpSignals, 'CONSERVATIVE'),
                riskLevel: 'LOW'
            }
        };
    }

    // Calcular asignaciones de portafolio
    calculateAllocations(signals, strategy) {
        if (signals.length === 0) {
            return { 'NO_SIGNALS': 100 };
        }
        
        const totalConfidence = signals.reduce((sum, signal) => sum + signal.confidence, 0);
        const allocations = {};
        
        signals.forEach(signal => {
            let allocation = (signal.confidence / totalConfidence) * 100;
            
            if (strategy === 'AGGRESSIVE') allocation *= 1.5;
            if (strategy === 'CONSERVATIVE') allocation *= 0.7;
            
            allocations[signal.symbol] = Math.min(25, allocation); // Máximo 25% por activo
        });
        
        return allocations;
    }

    // Calcular retorno esperado
    calculateExpectedReturn(signals, strategy) {
        if (signals.length === 0) return 0;
        
        const totalReturn = signals.reduce((sum, signal) => {
            const potentialGain = (signal.takeProfit - signal.currentPrice) / signal.currentPrice * 100;
            const potentialLoss = (signal.stopLoss - signal.currentPrice) / signal.currentPrice * 100;
            const expectedReturn = (potentialGain * 0.7) + (potentialLoss * 0.3);
            return sum + expectedReturn;
        }, 0);
        
        const multiplier = strategy === 'AGGRESSIVE' ? 1.2 : strategy === 'CONSERVATIVE' ? 0.8 : 1.0;
        return (totalReturn / signals.length) * multiplier;
    }

    // Evaluar riesgo del portafolio
    assessRisk(recommendations) {
        if (recommendations.length === 0) {
            return {
                overallRisk: 'LOW',
                riskBreakdown: { high: 0, medium: 0, low: 0 },
                riskScore: 1.0,
                recommendations: ['No hay recomendaciones activas']
            };
        }
        
        const highRiskCount = recommendations.filter(r => r.riskLevel === 'HIGH').length;
        const mediumRiskCount = recommendations.filter(r => r.riskLevel === 'MEDIUM').length;
        const lowRiskCount = recommendations.filter(r => r.riskLevel === 'LOW').length;
        
        const totalRisk = (highRiskCount * 3 + mediumRiskCount * 2 + lowRiskCount * 1) / recommendations.length;
        
        return {
            overallRisk: totalRisk < 1.5 ? 'LOW' : totalRisk < 2.5 ? 'MEDIUM' : 'HIGH',
            riskBreakdown: { high: highRiskCount, medium: mediumRiskCount, low: lowRiskCount },
            riskScore: totalRisk,
            recommendations: this.generateRiskRecommendations(totalRisk, recommendations)
        };
    }

    // Generar recomendaciones de riesgo
    generateRiskRecommendations(riskScore, recommendations) {
        if (riskScore > 2.5) {
            return [
                'Considerar reducir exposición a activos de alto riesgo',
                'Implementar stops más ajustados',
                'Diversificar hacia activos más estables'
            ];
        } else if (riskScore < 1.5) {
            return [
                'Oportunidad para aumentar exposición a activos de mayor rendimiento',
                'Considerar estrategias más agresivas',
                'Evaluar apalancamiento moderado'
            ];
        } else {
            return [
                'Mantener balance actual del portafolio',
                'Monitorear cambios en volatilidad',
                'Revisar posiciones semanalmente'
            ];
        }
    }

    // Generar insights cuánticos
    generateQuantumInsights(marketPatterns) {
        const insights = [];
        const quantumStates = Object.values(marketPatterns).map(p => p.quantumState);
        
        if (quantumStates.length === 0) {
            return {
                insights: ['Analizando patrones cuánticos...'],
                quantumMetrics: { avgConsciousness: 70, avgCoherence: 65, avgEntanglement: 60 },
                marketPhase: 'QUANTUM_ANALYZING'
            };
        }
        
        const avgConsciousness = quantumStates.reduce((sum, qs) => sum + qs.consciousness, 0) / quantumStates.length;
        const avgCoherence = quantumStates.reduce((sum, qs) => sum + qs.coherence, 0) / quantumStates.length;
        const avgEntanglement = quantumStates.reduce((sum, qs) => sum + qs.entanglement, 0) / quantumStates.length;
        
        if (avgConsciousness > 80) {
            insights.push('Mercado en estado de alta conciencia cuántica - tendencias claras');
        }
        if (avgCoherence > 75) {
            insights.push('Alta coherencia cuántica - movimientos sincronizados esperados');
        }
        if (avgEntanglement > 70) {
            insights.push('Entrelazamiento cuántico detectado - correlaciones fuertes');
        }
        
        if (insights.length === 0) {
            insights.push('Mercado en estado cuántico neutral - monitorear cambios');
        }
        
        return {
            insights,
            quantumMetrics: { avgConsciousness, avgCoherence, avgEntanglement },
            marketPhase: this.determineMarketPhase(avgConsciousness, avgCoherence, avgEntanglement)
        };
    }

    // Determinar fase del mercado
    determineMarketPhase(consciousness, coherence, entanglement) {
        if (consciousness > 80 && coherence > 75) return 'QUANTUM_BULL_MARKET';
        if (consciousness < 60 && coherence < 65) return 'QUANTUM_BEAR_MARKET';
        if (entanglement > 70) return 'QUANTUM_CORRELATED_MARKET';
        return 'QUANTUM_NEUTRAL_MARKET';
    }

    // Función para hacer peticiones HTTPS
    makeHttpsRequest(url) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout'));
            }, 5000);

            https.get(url, {
                headers: {
                    'User-Agent': 'QBTC-Quantum-Engine/1.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                clearTimeout(timeout);
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('JSON parse error'));
                    }
                });
            }).on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
}

// ===== INSTANCIA GLOBAL DEL ENGINE =====
const quantumEngine = new QuantumIntelligenceEngineFixed();

// ===== FUNCIONES PARA EL SERVIDOR =====

// Función para servir archivos estáticos
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Función para generar recomendaciones completas
async function generateCompleteRecommendations() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
    
    try {
        // Análisis de patrones de mercado
        const marketPatterns = await quantumEngine.analyzeMarketPatterns(symbols);
        
        // Generar recomendaciones de alto valor
        const recommendations = await quantumEngine.generateHighValueRecommendations(marketPatterns);
        
        return {
            timestamp: new Date().toISOString(),
            marketPatterns,
            recommendations,
            engineVersion: 'QUANTUM_INTELLIGENCE_ENGINE_FIXED_v1.0',
            analysisMethod: 'REVERSE_ENGINEERING_QUANTUM_ANALYSIS_FIXED'
        };
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
}

// ===== SERVIDOR HTTP =====
const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const url = req.url;
    console.log(`📡 Quantum Engine Fixed Request: ${req.method} ${url}`);

    // Ruta principal - servir el dashboard
    if (url === '/' || url === '/index.html') {
        serveFile(res, 'monitor-quantum-intelligence-fixed.html', 'text/html');
        return;
    }

    // API para recomendaciones de alto valor
    if (url === '/api/recommendations/quantum') {
        generateCompleteRecommendations()
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch(error => {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Recommendations unavailable',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }));
            });
        return;
    }

    // API para análisis de patrones
    if (url === '/api/patterns/quantum') {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
        quantumEngine.analyzeMarketPatterns(symbols)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    patterns: data,
                    analysis: 'QUANTUM_PATTERN_ANALYSIS_FIXED'
                }));
            })
            .catch(error => {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Pattern analysis unavailable',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }));
            });
        return;
    }

    // Health check
    if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ACTIVE',
            service: 'QBTC Quantum Intelligence Engine FIXED',
            timestamp: new Date().toISOString(),
            engine: 'QUANTUM_INTELLIGENCE_ENGINE_FIXED_v1.0',
            features: [
                'Reverse Engineering Market Analysis FIXED',
                'Quantum Pattern Recognition FIXED',
                'High-Value Investment Recommendations FIXED',
                'Portfolio Strategy Generation FIXED',
                'Risk Assessment & Management FIXED',
                'Quantum Market Insights FIXED',
                'Technical Analysis with Quantum Metrics FIXED',
                'Robust Error Handling & Fallback Data'
            ],
            endpoints: [
                'GET / - Quantum Intelligence Dashboard FIXED',
                'GET /api/recommendations/quantum - High-Value Recommendations FIXED',
                'GET /api/patterns/quantum - Quantum Pattern Analysis FIXED',
                'GET /health - Health Check'
            ],
            quantumConstants: QUANTUM_CONSTANTS
        }));
        return;
    }

    // Servir archivos estáticos
    if (url.endsWith('.html')) {
        serveFile(res, url.substring(1), 'text/html');
        return;
    }

    // 404 para rutas no encontradas
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log('🚀 QBTC Quantum Intelligence Engine FIXED iniciado');
    console.log(`📊 Dashboard cuántico FIXED disponible en: http://localhost:${PORT}`);
    console.log(`🔮 Recomendaciones cuánticas FIXED: http://localhost:${PORT}/api/recommendations/quantum`);
    console.log(`📈 Análisis de patrones FIXED: http://localhost:${PORT}/api/patterns/quantum`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Engine FIXED listo para análisis cuántico');
    console.log('🔧 Configuración: INGENIERÍA INVERSA CON ANÁLISIS CUÁNTICO FIXED');
    console.log('🎯 RECOMENDACIONES DE ALTO VALOR - HONRANDO EL TRABAJO PREVIO FIXED');
    console.log('🛡️ MANEJO ROBUSTO DE ERRORES Y DATOS DE FALLBACK');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando Quantum Intelligence Engine FIXED...');
    server.close(() => {
        console.log('✅ Engine FIXED cerrado');
        process.exit(0);
    });
});
