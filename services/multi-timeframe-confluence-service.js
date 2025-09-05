#!/usr/bin/env node

/**
 * [GLOBE] MULTI-TIMEFRAME CONFLUENCE SERVICE
 * ===================================
 * 
 * Servicio HTTP que expone el Enhanced Multi-Timeframe Confluence Engine
 * Incluye endpoints REST y WebSocket para análisis en tiempo real
 */

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import EnhancedMultiTimeframeConfluenceEngine from '../engines/enhanced-multitimeframe-confluence-engine.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configuración
const PORT = process.env.PORT || 3003;
const ENV = process.env.NODE_ENV || 'development';

// Instancia del motor principal
const confluenceEngine = new EnhancedMultiTimeframeConfluenceEngine({
    rate_limit: {
        requests_per_minute: ENV === 'production' ? 60 : 100,
        batch_size: 3,
        delay_between_batches: ENV === 'production' ? 8000 : 6000
    }
});

// Middleware
app.use(cors({
    origin: ENV === 'production' ? ['https://yourdomain.com'] : '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // máximo 100 requests por minuto por IP
    message: {
        error: 'Too many requests from this IP',
        retry_after: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Estado del servicio
const serviceState = {
    started: new Date().toISOString(),
    requests_served: 0,
    websocket_connections: 0,
    active_analyses: 0,
    high_confidence_detections: 0
};

// Listeners del motor
confluenceEngine.on('high-confluence-detected', (data) => {
    serviceState.high_confidence_detections++;
    
    // Broadcast a WebSocket clients
    broadcastToAllClients({
        type: 'HIGH_CONFLUENCE_DETECTED',
        timestamp: new Date().toISOString(),
        data: data
    });
});

confluenceEngine.on('system-initialized', (data) => {
    console.log('[ROCKET] Enhanced Multi-Timeframe Engine initialized:', data);
});

// ENDPOINTS REST

/**
 * GET /api/status - Estado del servicio
 */
app.get('/api/status', (req, res) => {
    res.json({
        service: 'Multi-Timeframe Confluence Service',
        status: 'OPERATIONAL',
        version: '1.0.0',
        engine_initialized: confluenceEngine.state.initialized,
        uptime: process.uptime(),
        stats: {
            ...serviceState,
            engine_stats: {
                total_requests: confluenceEngine.state.total_requests,
                cache_hits: confluenceEngine.state.cache_hits,
                cache_misses: confluenceEngine.state.cache_misses,
                confluence_detections: confluenceEngine.state.confluence_detections,
                cache_hit_ratio: confluenceEngine.state.cache_hits > 0 ? 
                    ((confluenceEngine.state.cache_hits / (confluenceEngine.state.cache_hits + confluenceEngine.state.cache_misses)) * 100).toFixed(1) + '%' : '0%'
            }
        },
        features: [
            'Multi-Timeframe Analysis (12 TFs)',
            'Golden Confluence Detection',
            '4-Layer Confirmation System',
            'Multi-Stage Exit Strategy',
            'Real-time WebSocket Updates',
            'Intelligent Rate Limiting'
        ]
    });
});

/**
 * POST /api/analyze - Análisis completo de confluencia multi-timeframe
 */
app.post('/api/analyze', async (req, res) => {
    serviceState.requests_served++;
    serviceState.active_analyses++;
    
    try {
        const { symbol, direction = 'LONG' } = req.body;
        
        if (!symbol) {
            return res.status(400).json({
                error: 'Missing required parameter: symbol',
                example: { symbol: 'BTCUSDT', direction: 'LONG' }
            });
        }
        
        console.log(`[CHART] [API] Analyzing ${symbol} for ${direction}...`);
        
        const startTime = Date.now();
        const analysis = await confluenceEngine.analyzeMultiTimeframeConfluence(symbol, direction);
        const analysisTime = Date.now() - startTime;
        
        res.json({
            success: true,
            analysis_time_ms: analysisTime,
            timestamp: new Date().toISOString(),
            analysis: analysis
        });
        
        serviceState.active_analyses--;
        
        // Log si es alta confluencia
        if (analysis.total_confluence_score > 0.80) {
            console.log(`[TARGET] HIGH CONFLUENCE detected for ${symbol}: ${(analysis.total_confluence_score * 100).toFixed(1)}%`);
        }
        
    } catch (error) {
        serviceState.active_analyses--;
        console.error('[X] Error in analysis:', error);
        
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/batch-analyze - Análisis por lotes de múltiples símbolos
 */
app.post('/api/batch-analyze', async (req, res) => {
    serviceState.requests_served++;
    
    try {
        const { symbols, direction = 'LONG', concurrency = 3 } = req.body;
        
        if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
            return res.status(400).json({
                error: 'Missing or invalid symbols array',
                example: { symbols: ['BTCUSDT', 'ETHUSDT'], direction: 'LONG' }
            });
        }
        
        console.log(`[CHART] [BATCH API] Analyzing ${symbols.length} symbols for ${direction}...`);
        
        const startTime = Date.now();
        const results = [];
        
        // Procesar en lotes de 'concurrency'
        for (let i = 0; i < symbols.length; i += concurrency) {
            const batch = symbols.slice(i, i + concurrency);
            serviceState.active_analyses += batch.length;
            
            const batchPromises = batch.map(async (symbol) => {
                try {
                    const analysis = await confluenceEngine.analyzeMultiTimeframeConfluence(symbol, direction);
                    return { symbol, success: true, analysis };
                } catch (error) {
                    return { symbol, success: false, error: error.message };
                } finally {
                    serviceState.active_analyses--;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // Delay entre lotes para rate limiting
            if (i + concurrency < symbols.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        const analysisTime = Date.now() - startTime;
        
        // Estadísticas del batch
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const highConfluence = successful.filter(r => r.analysis.total_confluence_score > 0.80);
        
        res.json({
            success: true,
            batch_analysis_time_ms: analysisTime,
            timestamp: new Date().toISOString(),
            summary: {
                total_symbols: symbols.length,
                successful_analyses: successful.length,
                failed_analyses: failed.length,
                high_confluence_detected: highConfluence.length,
                average_confluence_score: successful.length > 0 ? 
                    (successful.reduce((sum, r) => sum + r.analysis.total_confluence_score, 0) / successful.length).toFixed(3) : 0
            },
            results: results
        });
        
        console.log(`[CHECK] Batch analysis completed: ${successful.length}/${symbols.length} successful, ${highConfluence.length} high confluence`);
        
    } catch (error) {
        console.error('[X] Error in batch analysis:', error);
        
        res.status(500).json({
            error: 'Batch analysis failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/quick-scan/:symbol - Escaneo rápido de confluencia
 */
app.get('/api/quick-scan/:symbol', async (req, res) => {
    serviceState.requests_served++;
    
    try {
        const { symbol } = req.params;
        const { direction = 'LONG' } = req.query;
        
        console.log(`[LIGHTNING] [QUICK SCAN] ${symbol} for ${direction}`);
        
        const analysis = await confluenceEngine.analyzeMultiTimeframeConfluence(symbol, direction);
        
        // Respuesta simplificada para quick scan
        const quickResult = {
            symbol: symbol,
            direction: direction,
            confluence_score: analysis.total_confluence_score,
            confluence_grade: getConfluenceGrade(analysis.total_confluence_score),
            detected_patterns: analysis.confluence_patterns.filter(p => p.detected).length,
            golden_confluence: analysis.confluence_patterns.some(p => 
                p.pattern_name === 'GOLDEN_CONFLUENCE' && p.detected
            ),
            recommendation: getQuickRecommendation(analysis),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            quick_scan: quickResult
        });
        
    } catch (error) {
        console.error('[X] Error in quick scan:', error);
        
        res.status(500).json({
            error: 'Quick scan failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/golden-confluence-scan - Escaneo de Golden Confluence en símbolos populares
 */
app.get('/api/golden-confluence-scan', async (req, res) => {
    serviceState.requests_served++;
    
    try {
        const { direction = 'LONG' } = req.query;
        const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT'];
        
        console.log(`[STAR] [GOLDEN SCAN] Scanning ${popularSymbols.length} symbols for Golden Confluence...`);
        
        const startTime = Date.now();
        const goldenResults = [];
        
        // Procesar en paralelo con límite
        const concurrentLimit = 3;
        for (let i = 0; i < popularSymbols.length; i += concurrentLimit) {
            const batch = popularSymbols.slice(i, i + concurrentLimit);
            
            const batchPromises = batch.map(async (symbol) => {
                try {
                    const analysis = await confluenceEngine.analyzeMultiTimeframeConfluence(symbol, direction);
                    
                    // Solo incluir si tiene alta confluencia
                    if (analysis.total_confluence_score > 0.75) {
                        const goldenPattern = analysis.confluence_patterns.find(p => p.pattern_name === 'GOLDEN_CONFLUENCE');
                        
                        return {
                            symbol,
                            confluence_score: analysis.total_confluence_score,
                            golden_confluence_detected: goldenPattern?.detected || false,
                            golden_confidence: goldenPattern?.confidence || 0,
                            success_rate: goldenPattern?.success_rate || 0,
                            risk_reward: goldenPattern?.risk_reward || 0,
                            leverage_multiplier: goldenPattern?.leverage_multiplier || 1,
                            aligned_timeframes: goldenPattern?.aligned_timeframes || 0,
                            expected_performance: analysis.expected_performance
                        };
                    }
                    
                    return null;
                    
                } catch (error) {
                    console.warn(`[WARNING] Failed to analyze ${symbol}: ${error.message}`);
                    return null;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            goldenResults.push(...batchResults.filter(result => result !== null));
            
            if (i + concurrentLimit < popularSymbols.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        const scanTime = Date.now() - startTime;
        
        // Ordenar por confluence score
        goldenResults.sort((a, b) => b.confluence_score - a.confluence_score);
        
        res.json({
            success: true,
            scan_time_ms: scanTime,
            timestamp: new Date().toISOString(),
            direction: direction,
            summary: {
                symbols_scanned: popularSymbols.length,
                high_confluence_found: goldenResults.length,
                golden_confluence_detected: goldenResults.filter(r => r.golden_confluence_detected).length,
                top_confluence_score: goldenResults.length > 0 ? goldenResults[0].confluence_score.toFixed(3) : 0
            },
            golden_opportunities: goldenResults
        });
        
        console.log(`[STAR] Golden scan completed: ${goldenResults.length} high confluence opportunities found`);
        
    } catch (error) {
        console.error('[X] Error in Golden Confluence scan:', error);
        
        res.status(500).json({
            error: 'Golden Confluence scan failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// WEBSOCKET HANDLING

wss.on('connection', (ws, req) => {
    serviceState.websocket_connections++;
    
    console.log('🔌 New WebSocket connection established');
    
    // Enviar mensaje de bienvenida
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        timestamp: new Date().toISOString(),
        message: 'Connected to Multi-Timeframe Confluence Service',
        service_status: {
            initialized: confluenceEngine.state.initialized,
            total_detections: confluenceEngine.state.confluence_detections
        }
    }));
    
    // Handler para mensajes del cliente
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'REQUEST_ANALYSIS':
                    const { symbol, direction = 'LONG' } = data;
                    if (symbol) {
                        const analysis = await confluenceEngine.analyzeMultiTimeframeConfluence(symbol, direction);
                        
                        ws.send(JSON.stringify({
                            type: 'ANALYSIS_RESULT',
                            timestamp: new Date().toISOString(),
                            request_id: data.request_id,
                            symbol,
                            direction,
                            analysis
                        }));
                    }
                    break;
                    
                case 'SUBSCRIBE_GOLDEN_ALERTS':
                    ws.golden_alerts_subscribed = true;
                    ws.send(JSON.stringify({
                        type: 'SUBSCRIPTION_CONFIRMED',
                        timestamp: new Date().toISOString(),
                        subscription: 'GOLDEN_CONFLUENCE_ALERTS'
                    }));
                    break;
                    
                case 'PING':
                    ws.send(JSON.stringify({
                        type: 'PONG',
                        timestamp: new Date().toISOString()
                    }));
                    break;
            }
            
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                timestamp: new Date().toISOString(),
                message: 'Invalid message format or processing error',
                error: error.message
            }));
        }
    });
    
    ws.on('close', () => {
        serviceState.websocket_connections--;
        console.log('🔌 WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        console.error('[X] WebSocket error:', error);
    });
});

// UTILITY FUNCTIONS

function broadcastToAllClients(message) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            // Solo enviar alerts a clientes suscritos si es alert
            if (message.type === 'HIGH_CONFLUENCE_DETECTED' && !client.golden_alerts_subscribed) {
                return;
            }
            client.send(JSON.stringify(message));
        }
    });
}

function getConfluenceGrade(score) {
    if (score >= 0.90) return 'S+ (EXCEPTIONAL)';
    if (score >= 0.85) return 'S (GOLDEN)';
    if (score >= 0.80) return 'A (EXCELLENT)';
    if (score >= 0.75) return 'B (VERY GOOD)';
    if (score >= 0.70) return 'C (GOOD)';
    if (score >= 0.60) return 'D (FAIR)';
    return 'F (POOR)';
}

function getQuickRecommendation(analysis) {
    const score = analysis.total_confluence_score;
    const hasGolden = analysis.confluence_patterns.some(p => 
        p.pattern_name === 'GOLDEN_CONFLUENCE' && p.detected
    );
    
    if (hasGolden && score >= 0.85) {
        return 'EXECUTE IMMEDIATELY - Golden Confluence detected';
    } else if (score >= 0.80) {
        return 'STRONG BUY - High confluence alignment';
    } else if (score >= 0.70) {
        return 'BUY - Good confluence setup';
    } else if (score >= 0.60) {
        return 'WAIT - Monitor for improvement';
    } else {
        return 'AVOID - Low confluence score';
    }
}

// ERROR HANDLING
app.use((error, req, res, next) => {
    console.error('[X] Unhandled error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET  /api/status',
            'POST /api/analyze',
            'POST /api/batch-analyze',
            'GET  /api/quick-scan/:symbol',
            'GET  /api/golden-confluence-scan'
        ],
        websocket_available: true,
        timestamp: new Date().toISOString()
    });
});

// STARTUP
async function startService() {
    try {
        console.log('[ROCKET] Starting Enhanced Multi-Timeframe Confluence Service...');
        
        // Inicializar el motor
        await confluenceEngine.initialize();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Service running on port ${PORT}`);
            console.log(`[GLOBE] REST API: http://localhost:${PORT}/api/`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
            console.log(`[CHART] Status: http://localhost:${PORT}/api/status`);
            console.log(`[STAR] Golden Scan: http://localhost:${PORT}/api/golden-confluence-scan`);
            console.log('');
            console.log('[SATELLITE] Ready to analyze multi-timeframe confluence patterns!');
        });
        
    } catch (error) {
        console.error('[X] Failed to start service:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[STOP] Shutting down Multi-Timeframe Confluence Service...');
    
    server.close(() => {
        console.log('[CHECK] Service stopped gracefully');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('[X] Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[X] Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the service
startService();
