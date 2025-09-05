#!/usr/bin/env node

/**
 * [ROCKET] ENHANCED MULTI-TIMEFRAME CONFLUENCE SERVICE
 * =============================================
 * 
 * Servicio HTTP que expone el Enhanced Multi-Timeframe Confluence Engine
 * con rate limiting inteligente y todas las mejoras del sistema propuesto
 * 
 * Puerto: 14201
 * 
 * CARACTERÍSTICAS:
 * - Golden Confluence Detection (target: >85%)
 * - 4 Capas de confirmación con pesos adaptativos 
 * - Estrategia de salida multi-stage con 4 niveles
 * - Rate limiting para evitar bans de Binance
 * - Cache inteligente por timeframe
 * - Scoring mejorado basado en el sistema Multi-TF propuesto
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import EnhancedMultiTimeframeConfluenceEngine from '../engines/enhanced-multitimeframe-confluence-engine.js';

const PORT = 14201;
const app = express();
const server = createServer(app);

// Instancia del motor mejorado
let mtfEngine = null;
let isInitializing = false;
let isShuttingDown = false;

// Configuración del servicio
const serviceConfig = {
    max_concurrent_analyses: 5,
    analysis_timeout: 30000, // 30 segundos timeout
    websocket_update_interval: 15000, // 15 segundos
    demo_symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT']
};

// Estado del servicio
const serviceState = {
    active_analyses: new Map(),
    total_analyses: 0,
    successful_analyses: 0,
    golden_confluences_detected: 0,
    uptime_start: new Date()
};

// Configurar middleware
app.use(express.json());
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[ROCKET] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// [HOSPITAL] HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - serviceState.uptime_start.getTime()) / 1000);
    
    res.json({
        status: mtfEngine && mtfEngine.state.initialized ? 'healthy' : (isInitializing ? 'initializing' : 'not_ready'),
        service: 'Enhanced Multi-Timeframe Confluence Service',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime_seconds: uptimeSeconds,
        uptime_formatted: `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`,
        
        // Estado del motor
        engine_status: {
            initialized: mtfEngine ? mtfEngine.state.initialized : false,
            active_analyses: serviceState.active_analyses.size,
            total_requests: mtfEngine ? mtfEngine.state.total_requests : 0,
            cache_hit_ratio: mtfEngine ? `${(mtfEngine.state.cache_hits / (mtfEngine.state.cache_hits + mtfEngine.state.cache_misses) * 100 || 0).toFixed(1)}%` : '0%',
            confluence_detections: mtfEngine ? mtfEngine.state.confluence_detections : 0
        },
        
        // Estadísticas del servicio
        service_statistics: {
            total_analyses: serviceState.total_analyses,
            successful_analyses: serviceState.successful_analyses,
            golden_confluences_detected: serviceState.golden_confluences_detected,
            success_rate: serviceState.total_analyses > 0 ? `${((serviceState.successful_analyses / serviceState.total_analyses) * 100).toFixed(1)}%` : '0%'
        }
    });
});

// [CHART] STATUS ENDPOINT COMPLETO
app.get('/status', (req, res) => {
    if (!mtfEngine) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not initialized',
            status: 'service_unavailable'
        });
    }

    try {
        const engineState = mtfEngine.state;
        const uptimeSeconds = Math.floor((Date.now() - serviceState.uptime_start.getTime()) / 1000);
        
        res.json({
            status: 'active',
            timestamp: new Date().toISOString(),
            uptime_seconds: uptimeSeconds,
            
            // Estado del motor mejorado
            enhanced_engine_status: {
                initialized: engineState.initialized,
                timeframes_configured: Object.keys(mtfEngine.getAllTimeframes()).length,
                confluence_patterns: Object.keys(mtfEngine.confluencePatterns.entry_patterns).length,
                confirmation_layers: Object.keys(mtfEngine.confirmationLayers).length,
                
                // Configuración de rate limiting
                rate_limiting: {
                    requests_per_minute: mtfEngine.config.rate_limit.requests_per_minute,
                    batch_size: mtfEngine.config.rate_limit.batch_size,
                    delay_between_batches: mtfEngine.config.rate_limit.delay_between_batches
                },
                
                // Estado del cache
                cache_stats: {
                    total_requests: engineState.total_requests,
                    cache_hits: engineState.cache_hits,
                    cache_misses: engineState.cache_misses,
                    cache_hit_ratio: engineState.cache_hits + engineState.cache_misses > 0 ? 
                        `${((engineState.cache_hits / (engineState.cache_hits + engineState.cache_misses)) * 100).toFixed(1)}%` : '0%',
                    active_cache_entries: mtfEngine.cache.size
                }
            },
            
            // Patrones de confluencia configurados
            confluence_patterns: mtfEngine.confluencePatterns.entry_patterns,
            
            // Jerarquía de timeframes
            timeframe_hierarchy: {
                macro: Object.keys(mtfEngine.timeframeHierarchy.macro),
                swing: Object.keys(mtfEngine.timeframeHierarchy.swing),
                entry: Object.keys(mtfEngine.timeframeHierarchy.entry)
            },
            
            // Estadísticas del servicio
            service_metrics: {
                total_analyses: serviceState.total_analyses,
                successful_analyses: serviceState.successful_analyses,
                golden_confluences_detected: serviceState.golden_confluences_detected,
                active_analyses: serviceState.active_analyses.size,
                success_rate: serviceState.total_analyses > 0 ? 
                    ((serviceState.successful_analyses / serviceState.total_analyses) * 100).toFixed(1) + '%' : '0%'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving status',
            message: error.message
        });
    }
});

// [TARGET] ANÁLISIS MULTI-TIMEFRAME PRINCIPAL
app.post('/api/analyze', async (req, res) => {
    if (!mtfEngine || !mtfEngine.state.initialized) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not ready'
        });
    }

    // Verificar límite de análisis concurrentes
    if (serviceState.active_analyses.size >= serviceConfig.max_concurrent_analyses) {
        return res.status(429).json({
            error: 'Too many concurrent analyses',
            max_concurrent: serviceConfig.max_concurrent_analyses,
            current_active: serviceState.active_analyses.size
        });
    }

    try {
        const { symbol, target_direction = 'LONG' } = req.body;
        
        if (!symbol) {
            return res.status(400).json({
                error: 'Symbol is required',
                usage: 'POST /api/analyze with {"symbol": "BTCUSDT", "target_direction": "LONG"}',
                supported_directions: ['LONG', 'SHORT']
            });
        }

        const validDirections = ['LONG', 'SHORT'];
        if (!validDirections.includes(target_direction)) {
            return res.status(400).json({
                error: 'Invalid target_direction',
                provided: target_direction,
                valid_directions: validDirections
            });
        }

        const analysisId = `${symbol}_${target_direction}_${Date.now()}`;
        serviceState.active_analyses.set(analysisId, { symbol, target_direction, started_at: new Date() });
        serviceState.total_analyses++;

        console.log(`[CHART] Starting enhanced multi-timeframe analysis for ${symbol} ${target_direction}...`);

        // Configurar timeout
        const analysisPromise = mtfEngine.analyzeMultiTimeframeConfluence(symbol, target_direction);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), serviceConfig.analysis_timeout)
        );

        const analysis = await Promise.race([analysisPromise, timeoutPromise]);
        
        serviceState.active_analyses.delete(analysisId);
        serviceState.successful_analyses++;

        // Contar Golden Confluences detectadas
        const goldenPattern = analysis.confluence_patterns?.find(p => p.pattern_name === 'GOLDEN_CONFLUENCE');
        if (goldenPattern && goldenPattern.detected) {
            serviceState.golden_confluences_detected++;
        }

        res.json({
            success: true,
            analysis_id: analysisId,
            symbol,
            target_direction,
            
            // Análisis completo mejorado
            enhanced_analysis: analysis,
            
            // Resumen ejecutivo
            executive_summary: generateExecutiveSummary(analysis),
            
            // Métricas del servicio
            service_info: {
                analysis_duration: Date.now() - serviceState.active_analyses.get(analysisId)?.started_at?.getTime() || 0,
                cache_used: analysis.system_state?.cache_hit_ratio || '0%',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        const analysisId = Array.from(serviceState.active_analyses.keys()).find(id => 
            id.startsWith(req.body.symbol || 'UNKNOWN')
        );
        if (analysisId) {
            serviceState.active_analyses.delete(analysisId);
        }

        console.error('[X] Error in multi-timeframe analysis:', error.message);
        
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message,
            suggestion: error.message.includes('timeout') ? 
                'Try again - system might be processing too many requests' :
                'Check symbol format and try again'
        });
    }
});

// [TARGET] ANÁLISIS RÁPIDO DE GOLDEN CONFLUENCE
app.get('/api/golden-confluence/:symbol', async (req, res) => {
    if (!mtfEngine || !mtfEngine.state.initialized) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not ready'
        });
    }

    try {
        const { symbol } = req.params;
        const { direction = 'LONG' } = req.query;
        
        console.log(`[DIAMOND] Quick Golden Confluence check for ${symbol}...`);
        
        const analysis = await mtfEngine.analyzeMultiTimeframeConfluence(symbol, direction);
        const goldenPattern = analysis.confluence_patterns?.find(p => p.pattern_name === 'GOLDEN_CONFLUENCE');
        
        const response = {
            symbol,
            direction,
            timestamp: new Date().toISOString(),
            
            // Enfoque en Golden Confluence
            golden_confluence: {
                detected: goldenPattern?.detected || false,
                confidence: goldenPattern?.confidence || 0,
                required_confidence: 0.85, // Tu target
                aligned_timeframes: goldenPattern?.aligned_timeframes || 0,
                required_timeframes: goldenPattern?.required_timeframes || 9,
                success_rate: goldenPattern?.success_rate || 0,
                risk_reward: goldenPattern?.risk_reward || 0,
                execution_priority: goldenPattern?.execution_priority || 'NONE'
            },
            
            // Scoring total
            total_confluence_score: analysis.total_confluence_score,
            
            // Confirmación en capas
            layer_confirmation: {
                passing_layers: analysis.layered_confirmation?.passing_layers || 0,
                total_layers: analysis.layered_confirmation?.total_layers || 4,
                composite_score: analysis.layered_confirmation?.composite_score || 0,
                consensus: analysis.layered_confirmation?.layer_consensus || 0
            },
            
            // Estrategia recomendada si Golden Confluence detectada
            recommended_strategy: goldenPattern?.detected ? {
                entry_method: analysis.final_entry_strategy?.entry_method,
                leverage: analysis.final_entry_strategy?.recommended_leverage,
                position_size: analysis.final_entry_strategy?.position_sizing,
                expected_success_rate: analysis.final_entry_strategy?.expected_metrics?.success_probability,
                expected_risk_reward: analysis.final_entry_strategy?.expected_metrics?.risk_reward_ratio
            } : null,
            
            // Salida multi-stage si detectada
            exit_strategy: goldenPattern?.detected ? analysis.scaled_exit_strategy : null
        };
        
        res.json(response);
        
    } catch (error) {
        res.status(500).json({
            error: 'Golden Confluence analysis failed',
            message: error.message
        });
    }
});

// [CHART] ANÁLISIS BATCH DE MÚLTIPLES SÍMBOLOS
app.post('/api/analyze-batch', async (req, res) => {
    if (!mtfEngine || !mtfEngine.state.initialized) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not ready'
        });
    }

    try {
        const { symbols = serviceConfig.demo_symbols, target_direction = 'LONG' } = req.body;
        
        if (!Array.isArray(symbols) || symbols.length === 0) {
            return res.status(400).json({
                error: 'Symbols array is required',
                usage: 'POST /api/analyze-batch with {"symbols": ["BTCUSDT", "ETHUSDT"], "target_direction": "LONG"}',
                demo_symbols: serviceConfig.demo_symbols
            });
        }

        if (symbols.length > 10) {
            return res.status(400).json({
                error: 'Too many symbols',
                provided: symbols.length,
                maximum: 10,
                suggestion: 'Split into smaller batches'
            });
        }

        console.log(`[CHART] Starting batch analysis for ${symbols.length} symbols...`);

        const batchResults = [];
        const startTime = Date.now();
        
        // Procesar símbolos en serie para respetar rate limits
        for (const symbol of symbols) {
            try {
                console.log(`  [TREND_UP] Analyzing ${symbol}...`);
                const analysis = await mtfEngine.analyzeMultiTimeframeConfluence(symbol, target_direction);
                
                const goldenPattern = analysis.confluence_patterns?.find(p => p.pattern_name === 'GOLDEN_CONFLUENCE');
                
                batchResults.push({
                    symbol,
                    success: true,
                    confluence_score: analysis.total_confluence_score,
                    golden_confluence: goldenPattern?.detected || false,
                    golden_confidence: goldenPattern?.confidence || 0,
                    execution_priority: goldenPattern?.execution_priority || 'NONE',
                    layer_consensus: analysis.layered_confirmation?.layer_consensus || 0,
                    recommended_leverage: analysis.final_entry_strategy?.recommended_leverage || '50x',
                    expected_performance: analysis.expected_performance?.probability_weighted_return || '0%'
                });
                
                serviceState.successful_analyses++;
                if (goldenPattern?.detected) {
                    serviceState.golden_confluences_detected++;
                }
                
            } catch (error) {
                console.error(`  [X] Failed to analyze ${symbol}:`, error.message);
                batchResults.push({
                    symbol,
                    success: false,
                    error: error.message
                });
            }
            
            // Pequeño delay entre análisis para rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        serviceState.total_analyses += symbols.length;

        // Ordenar resultados por confluence score
        const successfulResults = batchResults.filter(r => r.success);
        successfulResults.sort((a, b) => b.confluence_score - a.confluence_score);

        const batchDuration = Date.now() - startTime;

        res.json({
            success: true,
            batch_analysis: {
                symbols_requested: symbols.length,
                symbols_analyzed: successfulResults.length,
                symbols_failed: batchResults.filter(r => !r.success).length,
                target_direction,
                analysis_duration_ms: batchDuration,
                analysis_duration_formatted: `${Math.floor(batchDuration / 1000)}s`
            },
            
            // Resultados ordenados por confluencia
            results: batchResults,
            
            // Top opportunities (Golden Confluence detectada)
            top_opportunities: successfulResults
                .filter(r => r.golden_confluence)
                .slice(0, 5)
                .map(r => ({
                    symbol: r.symbol,
                    golden_confidence: r.golden_confidence,
                    execution_priority: r.execution_priority,
                    expected_performance: r.expected_performance,
                    recommended_leverage: r.recommended_leverage
                })),
            
            // Estadísticas del batch
            batch_statistics: {
                average_confluence: successfulResults.length > 0 ? 
                    (successfulResults.reduce((sum, r) => sum + r.confluence_score, 0) / successfulResults.length).toFixed(3) : 0,
                golden_confluences_found: successfulResults.filter(r => r.golden_confluence).length,
                high_confidence_count: successfulResults.filter(r => r.confluence_score > 0.80).length,
                symbols_above_threshold: successfulResults.filter(r => r.confluence_score > 0.70).length
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Batch analysis failed',
            message: error.message
        });
    }
});

// [TARGET] CONFIGURACIÓN DEL MOTOR
app.get('/api/configuration', (req, res) => {
    if (!mtfEngine) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not ready'
        });
    }

    res.json({
        timeframe_hierarchy: mtfEngine.timeframeHierarchy,
        confluence_patterns: mtfEngine.confluencePatterns,
        confirmation_layers: mtfEngine.confirmationLayers,
        exit_strategy: mtfEngine.exitStrategy,
        
        rate_limiting_config: mtfEngine.config.rate_limit,
        cache_config: mtfEngine.config.cache,
        
        service_config: serviceConfig,
        
        demo_symbols: serviceConfig.demo_symbols
    });
});

// [CHART] ESTADÍSTICAS Y MÉTRICAS
app.get('/api/statistics', (req, res) => {
    if (!mtfEngine) {
        return res.status(503).json({
            error: 'Enhanced Multi-Timeframe Engine not ready'
        });
    }

    const uptimeSeconds = Math.floor((Date.now() - serviceState.uptime_start.getTime()) / 1000);
    const engineState = mtfEngine.state;

    res.json({
        service_uptime: {
            seconds: uptimeSeconds,
            formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
            started_at: serviceState.uptime_start.toISOString()
        },
        
        analysis_statistics: {
            total_analyses: serviceState.total_analyses,
            successful_analyses: serviceState.successful_analyses,
            failed_analyses: serviceState.total_analyses - serviceState.successful_analyses,
            success_rate: serviceState.total_analyses > 0 ? 
                ((serviceState.successful_analyses / serviceState.total_analyses) * 100).toFixed(1) + '%' : '0%',
            golden_confluences_detected: serviceState.golden_confluences_detected,
            golden_confluence_rate: serviceState.successful_analyses > 0 ?
                ((serviceState.golden_confluences_detected / serviceState.successful_analyses) * 100).toFixed(1) + '%' : '0%'
        },
        
        engine_statistics: {
            total_requests: engineState.total_requests,
            cache_hits: engineState.cache_hits,
            cache_misses: engineState.cache_misses,
            cache_hit_ratio: engineState.cache_hits + engineState.cache_misses > 0 ? 
                ((engineState.cache_hits / (engineState.cache_hits + engineState.cache_misses)) * 100).toFixed(1) + '%' : '0%',
            active_cache_entries: mtfEngine.cache.size,
            confluence_detections: engineState.confluence_detections
        },
        
        current_activity: {
            active_analyses: serviceState.active_analyses.size,
            max_concurrent: serviceConfig.max_concurrent_analyses,
            queue_size: engineState.queue_size || 0
        }
    });
});

// [WRENCH] CONFIGURAR WEBSOCKET
function setupWebSocket() {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[LINK] Nueva conexión WebSocket al Enhanced Multi-Timeframe Service');
        
        // Enviar estado inicial
        if (mtfEngine && mtfEngine.state.initialized) {
            try {
                ws.send(JSON.stringify({
                    type: 'initial_state',
                    data: {
                        engine_initialized: mtfEngine.state.initialized,
                        timeframes_count: Object.keys(mtfEngine.getAllTimeframes()).length,
                        patterns_count: Object.keys(mtfEngine.confluencePatterns.entry_patterns).length,
                        service_statistics: {
                            total_analyses: serviceState.total_analyses,
                            golden_confluences: serviceState.golden_confluences_detected,
                            success_rate: serviceState.total_analyses > 0 ? 
                                ((serviceState.successful_analyses / serviceState.total_analyses) * 100).toFixed(1) + '%' : '0%'
                        }
                    },
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error('[X] Error enviando estado inicial:', error.message);
            }
        }

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleWebSocketMessage(data, ws);
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid JSON message',
                    timestamp: new Date().toISOString()
                }));
            }
        });

        ws.on('close', () => {
            console.log('🔌 Conexión WebSocket cerrada');
        });

        ws.on('error', (error) => {
            console.error('[X] Error WebSocket:', error.message);
        });
    });

    // Configurar eventos del motor
    if (mtfEngine) {
        mtfEngine.on('high-confluence-detected', (data) => {
            broadcastToClients(wss, {
                type: 'high_confluence_detected',
                data: {
                    symbol: data.symbol,
                    direction: data.direction,
                    score: data.score,
                    patterns_detected: data.patterns,
                    alert_level: data.score > 0.9 ? 'CRITICAL' : data.score > 0.85 ? 'HIGH' : 'MEDIUM'
                },
                timestamp: new Date().toISOString()
            });
        });

        mtfEngine.on('system-initialized', (data) => {
            broadcastToClients(wss, {
                type: 'system_initialized',
                data,
                timestamp: new Date().toISOString()
            });
        });
    }

    // Broadcast periódico de estadísticas
    setInterval(() => {
        if (mtfEngine && mtfEngine.state.initialized) {
            broadcastToClients(wss, {
                type: 'statistics_update',
                data: {
                    total_analyses: serviceState.total_analyses,
                    golden_confluences: serviceState.golden_confluences_detected,
                    active_analyses: serviceState.active_analyses.size,
                    cache_hit_ratio: mtfEngine.state.cache_hits + mtfEngine.state.cache_misses > 0 ? 
                        ((mtfEngine.state.cache_hits / (mtfEngine.state.cache_hits + mtfEngine.state.cache_misses)) * 100).toFixed(1) + '%' : '0%'
                },
                timestamp: new Date().toISOString()
            });
        }
    }, serviceConfig.websocket_update_interval);

    return wss;
}

// 📨 MANEJAR MENSAJES WEBSOCKET
function handleWebSocketMessage(data, ws) {
    switch (data.type) {
        case 'get_status':
            if (mtfEngine && mtfEngine.state.initialized) {
                ws.send(JSON.stringify({
                    type: 'status',
                    data: {
                        engine_status: mtfEngine.state,
                        service_statistics: {
                            total_analyses: serviceState.total_analyses,
                            successful_analyses: serviceState.successful_analyses,
                            golden_confluences: serviceState.golden_confluences_detected
                        }
                    },
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'analyze_symbol':
            if (mtfEngine && mtfEngine.state.initialized && data.symbol) {
                mtfEngine.analyzeMultiTimeframeConfluence(data.symbol, data.direction || 'LONG')
                    .then(analysis => {
                        ws.send(JSON.stringify({
                            type: 'analysis_result',
                            data: {
                                symbol: data.symbol,
                                analysis: generateExecutiveSummary(analysis)
                            },
                            timestamp: new Date().toISOString()
                        }));
                    })
                    .catch(error => {
                        ws.send(JSON.stringify({
                            type: 'analysis_error',
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }));
                    });
            }
            break;
            
        case 'ping':
            ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
            }));
            break;
    }
}

// [SATELLITE] BROADCAST A TODOS LOS CLIENTES
function broadcastToClients(wss, message) {
    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            try {
                client.send(messageStr);
            } catch (error) {
                console.error('[X] Error broadcasting mensaje:', error.message);
            }
        }
    });
}

// [CLIPBOARD] GENERAR RESUMEN EJECUTIVO
function generateExecutiveSummary(analysis) {
    const goldenPattern = analysis.confluence_patterns?.find(p => p.pattern_name === 'GOLDEN_CONFLUENCE');
    const layeredConfirmation = analysis.layered_confirmation;
    
    return {
        symbol: analysis.symbol,
        direction: analysis.target_direction,
        timestamp: analysis.analysis_timestamp,
        
        // Confluencia principal
        confluence_score: Number(analysis.total_confluence_score.toFixed(3)),
        
        // Golden Confluence
        golden_confluence: {
            detected: goldenPattern?.detected || false,
            confidence: goldenPattern?.confidence || 0,
            execution_priority: goldenPattern?.execution_priority || 'NONE',
            success_rate: goldenPattern?.success_rate || 0,
            risk_reward: goldenPattern?.risk_reward || 0
        },
        
        // Confirmación en capas
        layer_confirmation: {
            passing_layers: layeredConfirmation?.passing_layers || 0,
            total_layers: layeredConfirmation?.total_layers || 4,
            consensus: layeredConfirmation?.layer_consensus || 0
        },
        
        // Recomendación
        recommendation: {
            action: goldenPattern?.detected ? 'STRONG_BUY' : layeredConfirmation?.passing_layers >= 3 ? 'BUY' : layeredConfirmation?.passing_layers >= 2 ? 'WEAK_BUY' : 'WAIT',
            leverage: analysis.final_entry_strategy?.recommended_leverage || '50x',
            confidence: goldenPattern?.detected ? 'HIGH' : layeredConfirmation?.passing_layers >= 2 ? 'MEDIUM' : 'LOW'
        },
        
        // Performance esperada
        expected_performance: analysis.expected_performance?.probability_weighted_return || '0%'
    };
}

// [ROCKET] INICIALIZAR SERVICIO
async function initializeService() {
    try {
        console.log('[ROCKET] =============== ENHANCED MULTI-TIMEFRAME CONFLUENCE SERVICE STARTUP ===============');
        console.log(`[WRENCH] Initializing Enhanced Multi-Timeframe Service on port ${PORT}...`);
        
        isInitializing = true;
        
        // Inicializar motor mejorado
        mtfEngine = new EnhancedMultiTimeframeConfluenceEngine({
            rate_limit: {
                requests_per_minute: 100,  // Conservador para evitar bans
                batch_size: 3,             // Batches más pequeños
                delay_between_batches: 5000 // 5 segundos entre batches
            },
            cache: {
                timeframe_cache_ttl: 45000,   // 45 segundos cache TF
                analysis_cache_ttl: 90000     // 90 segundos cache análisis
            }
        });
        
        await mtfEngine.initialize();
        
        isInitializing = false;
        
        // Configurar WebSocket
        setupWebSocket();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Enhanced Multi-Timeframe Confluence Service started on port ${PORT}`);
            console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
            console.log(`[CHART] Full status: http://localhost:${PORT}/status`);
            console.log(`[TARGET] Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
            console.log(`[DIAMOND] Golden Confluence: GET http://localhost:${PORT}/api/golden-confluence/:symbol`);
            console.log(`[CHART] Batch analysis: POST http://localhost:${PORT}/api/analyze-batch`);
            console.log(`⚙️ Configuration: GET http://localhost:${PORT}/api/configuration`);
            console.log(`[TREND_UP] Statistics: GET http://localhost:${PORT}/api/statistics`);
            console.log(`[CRYSTAL_BALL] WebSocket: ws://localhost:${PORT}/ws`);
            console.log('🛡️ Service ready with intelligent rate limiting and Golden Confluence detection');
            console.log('[TARGET] Supports your Multi-Timeframe system with 4-layer confirmation and multi-stage exits\\n');
        });
        
    } catch (error) {
        console.error('[X] Error initializing Enhanced Multi-Timeframe Service:', error);
        process.exit(1);
    }
}

// [STOP] MANEJO GRACEFUL DE CIERRE
process.on('SIGINT', async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log('[STOP] Graceful shutdown iniciado...');
    
    // Cancelar análisis activos
    console.log(`[REFRESH] Canceling ${serviceState.active_analyses.size} active analyses...`);
    serviceState.active_analyses.clear();
    
    if (mtfEngine) {
        console.log('[REFRESH] Shutting down Enhanced Multi-Timeframe Engine...');
        // El motor no tiene método shutdown específico, solo limpiamos
        if (mtfEngine.cache) {
            mtfEngine.cache.clear();
        }
    }
    
    server.close(() => {
        console.log('[CHECK] Enhanced Multi-Timeframe Service shutdown completed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, shutting down...');
    process.emit('SIGINT');
});

// [ROCKET] INICIAR SERVICIO
initializeService().catch(console.error);

export default { app, server, mtfEngine };
