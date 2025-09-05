#!/usr/bin/env node

/**
 * [BRAIN] QBTC Quantum Leverage Engine Service
 * 
 * Motor de leverage máximo ajustado por entropía global
 * - Calcula leverage óptimo basado en condiciones cuánticas
 * - Integra con el kernel cuántico para máxima coherencia
 * - Emite eventos de actualización y oportunidades especiales
 * - Servicio HTTP para integración con el sistema
 */

import express from 'express';
import { QuantumLeverageEngine } from './quantum-leverage-engine.js';

const app = express();
const PORT = process.env.PORT || 14101;

app.use(express.json());

// Crear instancia del engine de leverage cuántico
const leverageEngine = new QuantumLeverageEngine({
    maxLeverage: 125,
    defaultLeverage: 20,
    entropyThreshold: 0.6,
    bigBangThreshold: 0.92
});

// Endpoints del servicio
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Quantum Leverage Engine',
        port: PORT,
        timestamp: new Date().toISOString(),
        engine_state: {
            global_entropy: leverageEngine.globalEntropy,
            coherence_index: leverageEngine.coherenceIndex,
            max_leverage: leverageEngine.maxLeverage,
            big_bang_events: leverageEngine.bigBangEvents || 0
        }
    });
});

app.get('/status', (req, res) => {
    res.json({
        service: 'Quantum Leverage Engine',
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        current_state: {
            global_entropy: leverageEngine.globalEntropy,
            coherence_index: leverageEngine.coherenceIndex,
            last_optimization: new Date(leverageEngine.lastOptimization).toISOString(),
            active_symbols: leverageEngine.leverageCache.size
        }
    });
});

app.post('/calculate-leverage', (req, res) => {
    try {
        const { symbol, market_data = {}, quantum_state = {} } = req.body;
        
        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: 'Symbol is required'
            });
        }
        
        const optimalLeverage = leverageEngine.calculateOptimalLeverage(
            symbol, 
            market_data, 
            quantum_state
        );
        
        // Obtener información adicional del cache
        const leverageInfo = leverageEngine.leverageCache.get(symbol);
        
        res.json({
            success: true,
            symbol: symbol,
            optimal_leverage: optimalLeverage,
            leverage_info: leverageInfo || null,
            global_entropy: leverageEngine.globalEntropy,
            coherence_index: leverageEngine.coherenceIndex,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/entropy-state', (req, res) => {
    try {
        const currentEntropy = leverageEngine.updateGlobalEntropy();
        
        res.json({
            success: true,
            global_entropy: currentEntropy,
            coherence_index: leverageEngine.coherenceIndex,
            entropy_threshold: leverageEngine.entropyThreshold,
            big_bang_threshold: leverageEngine.bigBangThreshold,
            lambda_constant: leverageEngine.LAMBDA_7919,
            phi_golden: leverageEngine.PHI_GOLDEN,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/update-symbol-metrics', (req, res) => {
    try {
        const { symbol, metrics } = req.body;
        
        if (!symbol || !metrics) {
            return res.status(400).json({
                success: false,
                error: 'Symbol and metrics are required'
            });
        }
        
        // Actualizar métricas del símbolo
        leverageEngine.symbolMetrics.set(symbol, {
            ...metrics,
            timestamp: Date.now()
        });
        
        res.json({
            success: true,
            message: `Updated metrics for ${symbol}`,
            symbol: symbol,
            metrics_count: leverageEngine.symbolMetrics.size
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/leverage-cache', (req, res) => {
    try {
        const cache = {};
        
        for (const [symbol, data] of leverageEngine.leverageCache.entries()) {
            cache[symbol] = data;
        }
        
        res.json({
            success: true,
            leverage_cache: cache,
            cache_size: leverageEngine.leverageCache.size,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/symbol-multiplier/:symbol', (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const multiplier = leverageEngine.getSymbolMultiplier(symbol);
        
        res.json({
            success: true,
            symbol: symbol,
            symbol_multiplier: multiplier,
            tier_info: leverageEngine.getSymbolTierInfo ? 
                leverageEngine.getSymbolTierInfo(symbol) : null,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'QBTC Quantum Leverage Engine - Maximum Leverage with Quantum Entropy',
        port: PORT,
        version: '1.0.0',
        endpoints: {
            health: '/health',
            status: '/status',
            calculate_leverage: 'POST /calculate-leverage',
            entropy_state: '/entropy-state',
            update_metrics: 'POST /update-symbol-metrics',
            leverage_cache: '/leverage-cache',
            symbol_multiplier: '/symbol-multiplier/:symbol'
        },
        quantum_constants: {
            lambda_7919: leverageEngine.LAMBDA_7919,
            phi_golden: leverageEngine.PHI_GOLDEN,
            max_leverage: leverageEngine.maxLeverage
        }
    });
});

// Configurar listeners de eventos del engine
leverageEngine.on('entropy_update', (data) => {
    console.log(`[OCEAN_WAVE] Global entropy updated: ${(data.entropy * 100).toFixed(1)}%`);
});

leverageEngine.on('big_bang', (event) => {
    console.log(`[FIRE] BIG BANG EVENT! Duration: ${event.duration / 60000} minutes`);
    console.log(`[TREND_UP] Leverage multiplier: ${event.leverage_multiplier}x`);
});

app.listen(PORT, () => {
    console.log(`[BRAIN] Quantum Leverage Engine running on port ${PORT}`);
    console.log(`[GALAXY] Maximum leverage: ${leverageEngine.maxLeverage}x`);
    console.log(`[ATOM]  Quantum entropy monitoring active`);
    console.log(`[CRYSTAL_BALL] Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
    console.log('[BRAIN] Graceful shutdown initiated...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[BRAIN] Received SIGINT, shutting down...');
    process.exit(0);
});
