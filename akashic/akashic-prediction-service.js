#!/usr/bin/env node

/**
 * [GALAXY] AKASHIC PREDICTION SERVICE - Los Registros del Futuro
 * ========================================================
 * Sistema de Predicción Cuántica basado en Registros Akásicos
 * - Acceso a información no-temporal sobre mercados financieros
 * - Resonancia con el campo morfogenético global
 * - Predicciones basadas en patrones kármicos y frecuencias universales
 * - Integración con dimensiones superiores de información
 * - Servicio HTTP para integración con el sistema
 */

import express from 'express';
import AkashicPredictionSystem from './akashic-prediction-system.js';

const app = express();
const PORT = process.env.PORT || 14403;

app.use(express.json());

// Crear instancia del sistema de predicción akásica
const akashicSystem = new AkashicPredictionSystem();

// Endpoints del servicio
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Akashic Prediction System',
        port: PORT,
        timestamp: new Date().toISOString(),
        akashic_state: {
            connection_strength: akashicSystem.akashicState.connection_strength,
            dimensional_access_level: akashicSystem.akashicState.dimensional_access_level,
            consciousness_frequency: akashicSystem.akashicState.consciousness_frequency,
            karmic_alignment: akashicSystem.akashicState.karmic_alignment,
            morphic_resonance: akashicSystem.akashicState.morphic_resonance,
            akashic_clarity: akashicSystem.akashicState.akashic_clarity,
            is_connected: akashicSystem.isConnected
        }
    });
});

app.get('/status', (req, res) => {
    res.json({
        service: 'Akashic Prediction System',
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        system_metrics: {
            total_predictions: akashicSystem.metrics.total_predictions,
            accurate_predictions: akashicSystem.metrics.accurate_predictions,
            connection_attempts: akashicSystem.metrics.connection_attempts,
            successful_connections: akashicSystem.metrics.successful_connections,
            accuracy_rate: akashicSystem.metrics.total_predictions > 0 ? 
                (akashicSystem.metrics.accurate_predictions / akashicSystem.metrics.total_predictions * 100).toFixed(2) + '%' : '0%'
        }
    });
});

app.post('/connect', async (req, res) => {
    try {
        const connected = await akashicSystem.connectToAkashicRecords();
        
        res.json({
            success: connected,
            message: connected ? 'Connected to Akashic Records' : 'Failed to connect to Akashic Records',
            connection_quality: connected ? akashicSystem.akashicState.connection_strength : 0,
            dimensional_access: akashicSystem.akashicState.dimensional_access_level,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/predictions/generate', async (req, res) => {
    try {
        const { symbols = [], timeframes = ['1h', '4h', '1d'], prediction_types = ['price_movements'] } = req.body;
        
        if (!akashicSystem.isConnected) {
            return res.status(400).json({
                success: false,
                error: 'Not connected to Akashic Records. Please connect first.'
            });
        }
        
        const predictions = [];
        
        // Generar predicciones para cada símbolo y timeframe
        for (const symbol of symbols) {
            for (const timeframe of timeframes) {
                const prediction = await akashicSystem.generatePrediction(symbol, timeframe, prediction_types);
                if (prediction) {
                    predictions.push(prediction);
                }
            }
        }
        
        res.json({
            success: true,
            predictions: predictions,
            total_predictions: predictions.length,
            connection_quality: akashicSystem.akashicState.connection_strength,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/predictions/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = akashicSystem.predictionHistory.slice(-limit);
        
        res.json({
            success: true,
            prediction_history: history,
            total_historical: akashicSystem.predictionHistory.length,
            returned: history.length,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/akashic-state', (req, res) => {
    try {
        res.json({
            success: true,
            akashic_state: akashicSystem.akashicState,
            temporal_windows: akashicSystem.akashicConfig.temporal_windows,
            information_layers: akashicSystem.akashicConfig.information_layers,
            resonance_frequencies: akashicSystem.akashicConfig.resonance_frequencies,
            is_connected: akashicSystem.isConnected,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/tune-frequency', async (req, res) => {
    try {
        const { frequency } = req.body;
        
        if (!frequency || typeof frequency !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Valid frequency is required'
            });
        }
        
        await akashicSystem.tuneConsciousnessFrequency(frequency);
        
        res.json({
            success: true,
            message: 'Consciousness frequency tuned',
            new_frequency: akashicSystem.akashicState.consciousness_frequency,
            connection_strength: akashicSystem.akashicState.connection_strength,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/karmic-alignment', async (req, res) => {
    try {
        const alignment = await akashicSystem.performKarmicAlignment();
        
        res.json({
            success: true,
            message: 'Karmic alignment performed',
            karmic_alignment: akashicSystem.akashicState.karmic_alignment,
            alignment_quality: alignment,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/symbol/:symbol/patterns', (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const symbolData = akashicSystem.akashicSymbols[symbol];
        
        if (!symbolData) {
            return res.status(404).json({
                success: false,
                error: `Symbol ${symbol} not found in Akashic Records`
            });
        }
        
        res.json({
            success: true,
            symbol: symbol,
            akashic_data: symbolData,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/metrics', (req, res) => {
    try {
        res.json({
            success: true,
            metrics: akashicSystem.metrics,
            performance_stats: {
                accuracy_rate: akashicSystem.metrics.total_predictions > 0 ? 
                    (akashicSystem.metrics.accurate_predictions / akashicSystem.metrics.total_predictions) : 0,
                connection_success_rate: akashicSystem.metrics.connection_attempts > 0 ?
                    (akashicSystem.metrics.successful_connections / akashicSystem.metrics.connection_attempts) : 0
            },
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
        message: 'QBTC Akashic Prediction System - Access to Universal Knowledge',
        port: PORT,
        version: '1.0.0',
        endpoints: {
            health: '/health',
            status: '/status',
            connect: 'POST /connect',
            generate_predictions: 'POST /predictions/generate',
            prediction_history: '/predictions/history',
            akashic_state: '/akashic-state',
            tune_frequency: 'POST /tune-frequency',
            karmic_alignment: 'POST /karmic-alignment',
            symbol_patterns: '/symbol/:symbol/patterns',
            metrics: '/metrics'
        },
        akashic_symbols: Object.keys(akashicSystem.akashicSymbols),
        consciousness_frequency: akashicSystem.akashicState.consciousness_frequency,
        connection_status: akashicSystem.isConnected ? 'Connected' : 'Disconnected'
    });
});

// Configurar listeners de eventos del sistema akásico
akashicSystem.on('akashic-connected', (data) => {
    console.log(`[STAR] Connected to Akashic Records (${(data.connection_quality * 100).toFixed(1)}%)`);
});

akashicSystem.on('akashic-disconnected', () => {
    console.log('🌑 Disconnected from Akashic Records');
});

akashicSystem.on('high-confidence-predictions', (predictions) => {
    console.log(`[CRYSTAL_BALL] Generated ${predictions.length} high-confidence predictions`);
});

akashicSystem.on('akashic-connection-failed', (data) => {
    console.log(`[X] Connection failed: ${data.error}`);
});

app.listen(PORT, () => {
    console.log(`[GALAXY] Akashic Prediction System running on port ${PORT}`);
    console.log(`[CRYSTAL_BALL] Connection strength: ${(akashicSystem.akashicState.connection_strength * 100).toFixed(1)}%`);
    console.log(`[SATELLITE] Consciousness frequency: ${akashicSystem.akashicState.consciousness_frequency} Hz`);
    console.log(`[SPARKLES] Dimensional access level: ${akashicSystem.akashicState.dimensional_access_level}D`);
    console.log(`[CRYSTAL_BALL] Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
    console.log('[GALAXY] Graceful shutdown initiated...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[GALAXY] Received SIGINT, shutting down...');
    process.exit(0);
});
