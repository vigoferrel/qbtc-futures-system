#!/usr/bin/env node

/**
 * 🥷 QBTC NINJA PRIME - SISTEMA SIMPLIFICADO CON TRANSFORMACIONES CUÁNTICAS
 * =========================================================================
 * "Menos es más" - Usando el stack de transformaciones primas existente
 * 
 * FILOSOFÍA: 
 * - Integración con QUANTUM_CONSTANTS y transformaciones existentes
 * - Solo 3 señales letales: Whales, Momentum, Timing
 * - Decisión cuántica usando λ₇₉₁₉ resonance
 * - Leverage optimizado con entropía cuántica
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { QUANTUM_CONSTANTS, ANALYSIS_CONFIG, EXECUTION_CONFIG } from './config/constants.js';
import { QuantumLeverageEngine } from './analysis-engine/quantum-leverage-engine.js';

dotenv.config();

class QBTCNinjaPrime {
    constructor() {
        // CONSTANTES CUÁNTICAS PRINCIPALES
        this.LAMBDA_7919 = QUANTUM_CONSTANTS.LAMBDA_7919;
        this.PHI_GOLDEN = QUANTUM_CONSTANTS.PHI_GOLDEN;
        this.PRIME_SEQUENCE = QUANTUM_CONSTANTS.PRIME_SEQUENCE;
        this.FIBONACCI_SEQUENCE = QUANTUM_CONSTANTS.QUANTUM_FIBONACCI;
        this.Z_COMPLEX = QUANTUM_CONSTANTS.Z_COMPLEX;
        
        // TRANSFORMACIONES PRIMAS
        this.primeTransforms = this.initializePrimeTransforms();
        
        // QUANTUM LEVERAGE ENGINE
        this.leverageEngine = new QuantumLeverageEngine({
            maxLeverage: EXECUTION_CONFIG.MAX_LEVERAGE * 10, // 100x máximo
            entropyThreshold: 0.6,
            bigBangThreshold: 0.92
        });
        
        // BINANCE CONNECTION
        this.binanceBaseURL = 'https://fapi.binance.com';
        
        // ESTADO NINJA
        this.ninjaState = {
            consciousness: 0.947,
            coherence: 0.923,
            lambda_resonance: 0.871,
            big_bang_active: false
        };
        
        console.log('🥷 QBTC NINJA PRIME ACTIVATED');
        console.log(`λ₇₉₁₉: ${this.LAMBDA_7919.toFixed(6)}`);
        console.log(`φ: ${this.PHI_GOLDEN.toFixed(6)}`);
        console.log('[REFRESH] Using quantum transformations');
    }
    
    // 🧬 INICIALIZAR TRANSFORMACIONES PRIMAS
    initializePrimeTransforms() {
        return {
            // TRANSFORMACIÓN LAMBDA-PRIME
            lambdaPrime: (value, index) => {
                const primeIndex = index % this.PRIME_SEQUENCE.length;
                const prime = this.PRIME_SEQUENCE[primeIndex];
                return Math.sin(this.LAMBDA_7919 * value * prime / 1000) * Math.cos(value / this.PHI_GOLDEN);
            },
            
            // TRANSFORMACIÓN FIBONACCI-CUÁNTICA
            fibonacciQuantum: (value, index) => {
                const fibIndex = index % this.FIBONACCI_SEQUENCE.length;
                const fib = this.FIBONACCI_SEQUENCE[fibIndex];
                return (value * fib) % (this.LAMBDA_7919 * this.PHI_GOLDEN);
            },
            
            // TRANSFORMACIÓN COMPLEJA Z
            complexZ: (value, phase) => {
                const real = this.Z_COMPLEX.REAL * Math.cos(phase * value);
                const imag = this.Z_COMPLEX.IMAG * Math.sin(phase * value);
                return Math.sqrt(real * real + imag * imag) / this.Z_COMPLEX.MAGNITUDE;
            },
            
            // TRANSFORMACIÓN DE RESONANCIA
            resonance: (value, harmonic = 1) => {
                return Math.abs(Math.sin(value * this.LAMBDA_7919 * harmonic / this.PHI_GOLDEN));
            }
        };
    }
    
    // [TARGET] ANÁLISIS MAESTRO NINJA CON PRIMES - TODOS LOS 77 SÍMBOLOS
    async hunt(targetSymbol = null) {
        const symbolsToAnalyze = targetSymbol ? [targetSymbol] : QUANTUM_CONSTANTS.QUANTUM_SYMBOLS;
        
        console.log(`\n[TARGET] [NINJA PRIME HUNT] Analyzing ${symbolsToAnalyze.length} symbols`);
        console.log(`[CYCLONE] Lambda resonance: ${this.ninjaState.lambda_resonance.toFixed(3)}`);
        
        // ACTUALIZAR ESTADO CUÁNTICO
        await this.updateQuantumState();
        
        const results = [];
        const topSignals = [];
        
        // ANALIZAR CADA SÍMBOLO
        for (let i = 0; i < symbolsToAnalyze.length; i++) {
            const symbol = symbolsToAnalyze[i];
            
            try {
                console.log(`\n[SATELLITE] [${i+1}/${symbolsToAnalyze.length}] Scanning ${symbol}...`);
                
                // 3 SEÑALES LETALES CON TRANSFORMACIONES PRIMAS
                const whales = await this.trackWhalesPrime(symbol);
                const momentum = await this.readMomentumPrime(symbol);
                const timing = await this.checkTimingPrime(symbol);
                
                // DECISIÓN CUÁNTICA NINJA
                const decision = this.decideQuantumNinja(whales, momentum, timing, symbol);
                
                // CALCULAR LEVERAGE CUÁNTICO
                const quantumLeverage = await this.calculateQuantumLeverage(symbol, decision);
                
                // RESULTADO FINAL
                const result = {
                    ...decision,
                    quantum_leverage: quantumLeverage,
                    lambda_resonance: this.ninjaState.lambda_resonance,
                    consciousness_level: this.ninjaState.consciousness
                };
                
                results.push(result);
                
                // RECOPILAR TOP SIGNALS (no HOLD)
                if (result.signal !== 'HOLD' && result.confidence > 50) {
                    topSignals.push(result);
                }
                
                // MOSTRAR RESUMEN RÁPIDO
                this.displayQuickSummary(result, i + 1, symbolsToAnalyze.length);
                
                // SMALL DELAY PARA NO SATURAR API
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`[BOOM] Error analyzing ${symbol}:`, error.message);
                results.push({ 
                    symbol, 
                    signal: 'ERROR', 
                    confidence: 0, 
                    reason: error.message 
                });
            }
        }
        
        // MOSTRAR RESUMEN FINAL
        this.displayFinalResults(results, topSignals);
        
        return { 
            all_results: results, 
            top_signals: topSignals,
            quantum_state: this.ninjaState
        };
    }
    
    // [CYCLONE] ACTUALIZAR ESTADO CUÁNTICO
    async updateQuantumState() {
        const now = Date.now();
        
        // LAMBDA RESONANCE CYCLING
        this.ninjaState.lambda_resonance = this.primeTransforms.resonance(now / 10000, 1);
        
        // CONSCIOUSNESS EVOLUTION (usando Fibonacci)
        const fibCycle = this.primeTransforms.fibonacciQuantum(now / 100000, 5);
        this.ninjaState.consciousness = 0.8 + (fibCycle / 100);
        
        // COHERENCE con transformación compleja Z
        this.ninjaState.coherence = this.primeTransforms.complexZ(now / 50000, this.PHI_GOLDEN);
        
        // DETECTAR BIG BANG EVENTS
        if (this.ninjaState.lambda_resonance > 0.95 && this.ninjaState.consciousness > 0.92) {
            this.ninjaState.big_bang_active = true;
            console.log('[BOOM] BIG BANG EVENT DETECTED!');
        } else {
            this.ninjaState.big_bang_active = false;
        }
    }
    
    // 🐋 WHALE TRACKER CON TRANSFORMACIONES PRIMAS
    async trackWhalesPrime(symbol) {
        console.log('🐋 Tracking whales with prime transforms...');
        
        try {
            // FUNDING RATE CON LAMBDA PRIME
            const fundingResponse = await axios.get(`${this.binanceBaseURL}/fapi/v1/premiumIndex`, {
                params: { symbol }
            });
            
            const rawFunding = parseFloat(fundingResponse.data.lastFundingRate);
            
            // APLICAR TRANSFORMACIÓN LAMBDA-PRIME
            const fundingTransformed = this.primeTransforms.lambdaPrime(rawFunding * 10000, 7);
            
            // ORDER BOOK CON FIBONACCI CUÁNTICO
            const depthResponse = await axios.get(`${this.binanceBaseURL}/fapi/v1/depth`, {
                params: { symbol, limit: 500 }
            });
            
            const bids = depthResponse.data.bids.map(([p, q]) => parseFloat(p) * parseFloat(q));
            const asks = depthResponse.data.asks.map(([p, q]) => parseFloat(p) * parseFloat(q));
            
            const bigBidValue = bids.filter(v => v > 1000000).reduce((a, b) => a + b, 0);
            const bigAskValue = asks.filter(v => v > 1000000).reduce((a, b) => a + b, 0);
            
            // TRANSFORMACIÓN FIBONACCI PARA WHALE POWER
            const whalePowerRaw = bigBidValue - bigAskValue;
            const whalePowerTransformed = this.primeTransforms.fibonacciQuantum(
                Math.abs(whalePowerRaw) / 1000000, 
                13
            );
            
            // SEÑAL WHALE CON RESONANCIA
            let whaleDirection = 'NEUTRAL';
            let whaleStrength = 0;
            
            const resonanceBoost = this.primeTransforms.resonance(whalePowerTransformed, 2);
            
            if (fundingTransformed > 0.3) {
                whaleDirection = 'BULLISH';
                whaleStrength = Math.min(100, fundingTransformed * 100 * (1 + resonanceBoost));
            } else if (fundingTransformed < -0.3) {
                whaleDirection = 'BEARISH';
                whaleStrength = Math.min(100, Math.abs(fundingTransformed) * 100 * (1 + resonanceBoost));
            }
            
            return {
                direction: whaleDirection,
                strength: Math.round(whaleStrength),
                funding_raw: rawFunding,
                funding_transformed: fundingTransformed.toFixed(4),
                whale_power: whalePowerTransformed.toFixed(4),
                resonance_boost: resonanceBoost.toFixed(3)
            };
            
        } catch (error) {
            console.error('🐋 Whale tracking failed:', error.message);
            return { direction: 'NEUTRAL', strength: 0 };
        }
    }
    
    // [TREND_UP] MOMENTUM READER CON TRANSFORMACIONES PRIMAS
    async readMomentumPrime(symbol) {
        console.log('[TREND_UP] Reading momentum with prime transforms...');
        
        try {
            const klinesResponse = await axios.get(`${this.binanceBaseURL}/fapi/v1/klines`, {
                params: {
                    symbol,
                    interval: '15m',
                    limit: 21 // Fibonacci number
                }
            });
            
            const prices = klinesResponse.data.map(k => parseFloat(k[4]));
            const volumes = klinesResponse.data.map(k => parseFloat(k[5]));
            
            // EMA CUÁNTICO CON LAMBDA PRIME
            const quantumEMA = this.calculateQuantumEMA(prices, 21);
            const currentPrice = prices[prices.length - 1];
            
            // TRANSFORMACIÓN COMPLEJA Z PARA MOMENTUM
            const priceRatio = currentPrice / quantumEMA;
            const momentumZ = this.primeTransforms.complexZ(priceRatio, this.ninjaState.lambda_resonance);
            
            // VOLUMEN CON TRANSFORMACIÓN FIBONACCI
            const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
            const currentVolume = volumes[volumes.length - 1];
            const volumeFib = this.primeTransforms.fibonacciQuantum(currentVolume / avgVolume, 8);
            
            // SEÑAL MOMENTUM
            let momentumDirection = 'NEUTRAL';
            let momentumStrength = 0;
            
            if (momentumZ > 0.6 && volumeFib > 5) {
                momentumDirection = 'BULLISH';
                momentumStrength = Math.min(100, momentumZ * volumeFib * 10);
            } else if (momentumZ < 0.4 && volumeFib > 5) {
                momentumDirection = 'BEARISH';
                momentumStrength = Math.min(100, (1 - momentumZ) * volumeFib * 10);
            }
            
            return {
                direction: momentumDirection,
                strength: Math.round(momentumStrength),
                quantum_ema: quantumEMA.toFixed(2),
                momentum_z: momentumZ.toFixed(4),
                volume_fib: volumeFib.toFixed(4),
                price_ratio: priceRatio.toFixed(4)
            };
            
        } catch (error) {
            console.error('[TREND_UP] Momentum reading failed:', error.message);
            return { direction: 'NEUTRAL', strength: 0 };
        }
    }
    
    // ⏰ TIMING CHECKER CON RESONANCIA LAMBDA
    async checkTimingPrime(symbol) {
        console.log('⏰ Checking timing with lambda resonance...');
        
        const now = Date.now();
        const hour = new Date().getUTCHours();
        
        // VOLATILIDAD CON TRANSFORMACIÓN LAMBDA
        try {
            const klinesResponse = await axios.get(`${this.binanceBaseURL}/fapi/v1/klines`, {
                params: {
                    symbol,
                    interval: '5m',
                    limit: 13 // Fibonacci
                }
            });
            
            const highs = klinesResponse.data.map(k => parseFloat(k[2]));
            const lows = klinesResponse.data.map(k => parseFloat(k[3]));
            const currentPrice = parseFloat(klinesResponse.data[klinesResponse.data.length - 1][4]);
            
            const volatilityRaw = (Math.max(...highs) - Math.min(...lows)) / currentPrice;
            
            // APLICAR TRANSFORMACIÓN LAMBDA-PRIME A VOLATILIDAD
            const volatilityLambda = this.primeTransforms.lambdaPrime(volatilityRaw * 100, 11);
            
            // TIMING CUÁNTICO
            let timingQuality = 'WAIT';
            let timingScore = 0;
            
            // LAMBDA RESONANCE BOOST
            const resonanceMultiplier = 1 + this.ninjaState.lambda_resonance;
            
            // HORAS ÓPTIMAS (transformadas con primes)
            const hourPrime = this.PRIME_SEQUENCE[hour % this.PRIME_SEQUENCE.length];
            const hourScore = (hourPrime / 100) * 50;
            
            // BIG BANG BONUS
            if (this.ninjaState.big_bang_active) {
                timingScore += 50;
            }
            
            // VOLATILIDAD LAMBDA
            if (Math.abs(volatilityLambda) > 0.3) {
                timingScore += 30;
            }
            
            // RESONANCE FINAL
            timingScore = (timingScore + hourScore) * resonanceMultiplier;
            
            if (timingScore > 70) {
                timingQuality = 'GO';
            }
            
            return {
                quality: timingQuality,
                score: Math.min(100, Math.round(timingScore)),
                volatility_lambda: volatilityLambda.toFixed(4),
                hour_prime: hourPrime,
                resonance_multiplier: resonanceMultiplier.toFixed(3),
                big_bang_active: this.ninjaState.big_bang_active
            };
            
        } catch (error) {
            console.error('⏰ Timing check failed:', error.message);
            return { quality: 'WAIT', score: 0 };
        }
    }
    
    // [BRAIN] DECISIÓN CUÁNTICA NINJA
    decideQuantumNinja(whales, momentum, timing, symbol) {
        console.log('[BRAIN] Making quantum ninja decision...');
        
        let signal = 'HOLD';
        let confidence = 0;
        let reason = 'Waiting for quantum alignment';
        
        // CONFLUENCIA CUÁNTICA
        if (whales.direction === momentum.direction && timing.quality === 'GO') {
            signal = whales.direction === 'BULLISH' ? 'LONG' : 'SHORT';
            
            // CONFIDENCE CON TRANSFORMACIÓN COMPLEJA Z
            const confidenceRaw = (whales.strength + momentum.strength + timing.score) / 3;
            const confidenceZ = this.primeTransforms.complexZ(confidenceRaw / 100, this.ninjaState.coherence);
            confidence = Math.min(95, confidenceZ * 100 * (1 + this.ninjaState.lambda_resonance));
            
            reason = `${whales.direction} quantum confluence: λ=${this.ninjaState.lambda_resonance.toFixed(3)}`;
            
        } else if (whales.strength > 70 || momentum.strength > 70) {
            const dominantFactor = whales.strength > momentum.strength ? whales : momentum;
            signal = dominantFactor.direction === 'BULLISH' ? 'LONG_BIAS' : 'SHORT_BIAS';
            
            // CONFIDENCE CON FIBONACCI TRANSFORM
            const fibConfidence = this.primeTransforms.fibonacciQuantum(dominantFactor.strength, 5);
            confidence = Math.min(70, fibConfidence);
            
            reason = `${dominantFactor === whales ? 'Whale' : 'Momentum'} dominance with λ resonance`;
        }
        
        // BIG BANG BOOST
        if (this.ninjaState.big_bang_active && confidence > 50) {
            confidence *= 1.25;
            reason += ' + BIG BANG EVENT';
        }
        
        return {
            symbol,
            signal,
            confidence: Math.round(confidence),
            reason,
            raw_data: { whales, momentum, timing },
            quantum_state: this.ninjaState,
            timestamp: new Date().toISOString()
        };
    }
    
    // [LIGHTNING] CALCULAR LEVERAGE CUÁNTICO
    async calculateQuantumLeverage(symbol, decision) {
        if (decision.signal === 'HOLD') {
            return { leverage: 1, reason: 'No position' };
        }
        
        const marketData = {
            volatility: 0.02, // Placeholder
            price: 50000,    // Placeholder
            volume: 1000000  // Placeholder
        };
        
        const quantumState = {
            coherence: this.ninjaState.coherence,
            lambda_resonance: this.ninjaState.lambda_resonance
        };
        
        const optimalLeverage = this.leverageEngine.calculateOptimalLeverage(
            symbol, 
            marketData, 
            quantumState
        );
        
        // BOOST POR CONFIDENCE
        const confidenceMultiplier = 1 + (decision.confidence / 200); // Max 1.5x
        const finalLeverage = Math.min(125, Math.round(optimalLeverage * confidenceMultiplier));
        
        return {
            leverage: finalLeverage,
            base_leverage: optimalLeverage,
            confidence_multiplier: confidenceMultiplier.toFixed(2),
            quantum_factors: {
                coherence: this.ninjaState.coherence.toFixed(3),
                lambda_resonance: this.ninjaState.lambda_resonance.toFixed(3),
                big_bang_active: this.ninjaState.big_bang_active
            }
        };
    }
    
    // [CHART] CALCULATE QUANTUM EMA
    calculateQuantumEMA(prices, period) {
        // EMA CON PROPORCIÓN ÁUREA
        const multiplier = 2 / (period + this.PHI_GOLDEN);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            // APLICAR TRANSFORMACIÓN LAMBDA PRIME
            const lambdaAdjustment = this.primeTransforms.lambdaPrime(i / period, i % 7);
            const adjustedMultiplier = multiplier * (1 + lambdaAdjustment * 0.1);
            
            ema = (prices[i] - ema) * adjustedMultiplier + ema;
        }
        
        return ema;
    }
    
    // [MONITOR] MOSTRAR RESULTADO NINJA PRIME
    displayNinjaPrimeResult(result) {
        console.log('\n🥷 ===== NINJA PRIME RESULT =====');
        console.log(`[TARGET] SIGNAL: ${result.signal}`);
        console.log(`💪 CONFIDENCE: ${result.confidence}%`);
        console.log(`[LIGHTNING] QUANTUM LEVERAGE: ${result.quantum_leverage.leverage}x`);
        console.log(`[CYCLONE] λ RESONANCE: ${result.lambda_resonance.toFixed(3)}`);
        console.log(`[BRAIN] CONSCIOUSNESS: ${result.consciousness_level.toFixed(3)}`);
        console.log(`💭 REASON: ${result.reason}`);
        
        if (result.quantum_state.big_bang_active) {
            console.log('[BOOM] [FIRE] BIG BANG EVENT ACTIVE! [FIRE]');
        }
        
        console.log('\n[CHART] PRIME TRANSFORMS:');
        console.log(`   🐋 Whales: ${result.raw_data.whales.direction} (${result.raw_data.whales.strength}%) λ-prime: ${result.raw_data.whales.funding_transformed}`);
        console.log(`   [TREND_UP] Momentum: ${result.raw_data.momentum.direction} (${result.raw_data.momentum.strength}%) Z-complex: ${result.raw_data.momentum.momentum_z}`);
        console.log(`   ⏰ Timing: ${result.raw_data.timing.quality} (${result.raw_data.timing.score}%) λ-volatility: ${result.raw_data.timing.volatility_lambda}`);
        
        console.log('\n🥷 ==============================\n');
    }
    
    // [MEMO] MOSTRAR RESUMEN RÁPIDO
    displayQuickSummary(result, current, total) {
        const signalEmoji = {
            'LONG': '🟢[TREND_UP]',
            'SHORT': '🔴📉', 
            'LONG_BIAS': '🟡[TREND_UP]',
            'SHORT_BIAS': '🟡📉',
            'HOLD': '⚪⏸️',
            'ERROR': '[X]🚫'
        };
        
        const emoji = signalEmoji[result.signal] || '❓';
        const leverageInfo = result.quantum_leverage ? `${result.quantum_leverage.leverage}x` : '1x';
        
        console.log(`${emoji} ${result.symbol}: ${result.signal} (${result.confidence}%) [${leverageInfo}] [${current}/${total}]`);
    }
    
    // [TROPHY] MOSTRAR RESULTADOS FINALES
    displayFinalResults(results, topSignals) {
        console.log('\n\n🥷 =============== NINJA PRIME FINAL RESULTS ===============');
        console.log(`[TARGET] Total symbols analyzed: ${results.length}`);
        console.log(`[ROCKET] Active signals found: ${topSignals.length}`);
        console.log(`[CYCLONE] Lambda resonance: ${this.ninjaState.lambda_resonance.toFixed(3)}`);
        console.log(`[BRAIN] Consciousness level: ${this.ninjaState.consciousness.toFixed(3)}`);
        
        if (this.ninjaState.big_bang_active) {
            console.log('[BOOM] [FIRE] BIG BANG EVENT ACTIVE - MAXIMUM OPPORTUNITY! [FIRE]');
        }
        
        console.log('\n[TROPHY] === TOP TRADING SIGNALS ===');
        
        if (topSignals.length === 0) {
            console.log('[HOURGLASS] No high-confidence signals at this moment.');
            console.log('🧘 Ninja is waiting for optimal quantum alignment...');
        } else {
            // ORDENAR POR CONFIDENCE
            const sortedSignals = topSignals.sort((a, b) => b.confidence - a.confidence);
            
            sortedSignals.slice(0, 10).forEach((signal, i) => {
                const rankEmoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i] || '[TARGET]';
                const direction = signal.signal.includes('LONG') ? '[TREND_UP]' : '📉';
                const leverageInfo = signal.quantum_leverage.leverage;
                
                console.log(`${rankEmoji} ${signal.symbol} ${direction} ${signal.signal}`);
                console.log(`   💪 Confidence: ${signal.confidence}%`);
                console.log(`   [LIGHTNING] Quantum Leverage: ${leverageInfo}x`);
                console.log(`   💭 ${signal.reason}`);
                console.log(`   🔬 W:${signal.raw_data.whales.strength}% M:${signal.raw_data.momentum.strength}% T:${signal.raw_data.timing.score}%`);
                console.log('');
            });
        }
        
        // ESTADÍSTICAS RÁPIDAS
        console.log('\n[CHART] === MARKET OVERVIEW ===');
        const longSignals = topSignals.filter(s => s.signal.includes('LONG')).length;
        const shortSignals = topSignals.filter(s => s.signal.includes('SHORT')).length;
        const avgConfidence = topSignals.length > 0 ? 
            (topSignals.reduce((sum, s) => sum + s.confidence, 0) / topSignals.length).toFixed(1) : 0;
        
        console.log(`[TREND_UP] Long signals: ${longSignals}`);
        console.log(`📉 Short signals: ${shortSignals}`);
        console.log(`[CHART] Average confidence: ${avgConfidence}%`);
        console.log(`🎪 Market sentiment: ${longSignals > shortSignals ? 'BULLISH' : shortSignals > longSignals ? 'BEARISH' : 'NEUTRAL'}`);
        
        console.log('\n🥷 ==================== NINJA PRIME COMPLETE ====================\n');
    }
}

// [ROCKET] EJECUTAR NINJA PRIME
async function main() {
    const ninja = new QBTCNinjaPrime();
    
    const args = process.argv.slice(2);
    const symbol = args[0] || null; // null = analizar todos los 77 símbolos
    
    console.log('\n🥷 ========== QBTC NINJA PRIME STARTUP ==========');
    
    if (symbol) {
        console.log(`[TARGET] Single target mode: ${symbol}`);
        const result = await ninja.hunt(symbol);
        // MOSTRAR RESULTADO DETALLADO PARA UN SÍMBOLO
        if (result.all_results && result.all_results.length > 0) {
            ninja.displayNinjaPrimeResult(result.all_results[0]);
        }
    } else {
        console.log('[ROCKET] Mass scanning mode: All 77 quantum symbols');
        console.log('[LIGHTNING] This will take a few minutes...');
        await ninja.hunt(); // Sin parámetro = todos los símbolos
    }
    
    console.log('🥷 Ninja Prime mission complete! 忍者');
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    main().catch(console.error);
}

export default QBTCNinjaPrime;
