#!/usr/bin/env node

/**
 * [REFRESH] SERVICIO HTTP PARA CONSOLIDATED OPPORTUNITIES API
 * ==================================================
 * 
 * Servidor HTTP que expone la API consolidada de oportunidades de trading
 * unificando datos de todos los motores del sistema
 * 
 * Puerto: 14105
 * Endpoints:
 * - GET /health - Health check
 * - GET /status - Estado completo de la API
 * - GET /api/opportunities - Todas las oportunidades activas
 * - GET /api/opportunities/tier/:tier - Oportunidades por tier específico
 * - GET /api/opportunities/symbol/:symbol - Oportunidades para símbolo específico
 * - GET /api/opportunities/priority/:level - Oportunidades por prioridad
 * - GET /api/market-overview - Vista general del mercado
 * - GET /api/tier-summary - Resumen por tiers
 * - GET /api/performance-metrics - Métricas de performance
 * - GET /api/risk-analysis - Análisis de riesgo consolidado
 * - POST /api/opportunities/refresh - Forzar refresh de oportunidades
 * - POST /api/opportunities/filter - Filtrar oportunidades con criterios avanzados
 * - POST /api/opportunities/export - Exportar oportunidades
 * - WebSocket /ws - Updates de oportunidades en tiempo real
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import ConsolidatedOpportunitiesAPI from '../api/consolidated-opportunities-api.js';

const PORT = 14105;
const app = express();
const server = createServer(app);

// Instancia de la API consolidada
let opportunitiesAPI = null;
let isInitializing = false;

// Configurar middleware
app.use(express.json());
app.use(cors());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[REFRESH] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// [HOSPITAL] HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const status = opportunitiesAPI ? 'healthy' : (isInitializing ? 'initializing' : 'not_ready');
    
    res.json({
        status,
        service: 'Consolidated Opportunities API',
        port: PORT,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        api_active: !!opportunitiesAPI,
        initializing: isInitializing,
        active_opportunities: opportunitiesAPI ? opportunitiesAPI.getActiveOpportunitiesCount() : 0,
        connected_engines: opportunitiesAPI ? opportunitiesAPI.getConnectedEnginesCount() : 0
    });
});

// [CHART] STATUS ENDPOINT
app.get('/status', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized',
            status: 'service_unavailable'
        });
    }

    try {
        const systemStatus = opportunitiesAPI.getSystemStatus();
        
        res.json({
            status: 'active',
            timestamp: new Date().toISOString(),
            system_status: systemStatus,
            api_info: {
                port: PORT,
                uptime: process.uptime(),
                version: '1.0.0'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving status',
            message: error.message
        });
    }
});

// [TARGET] ALL OPPORTUNITIES ENDPOINT
app.get('/api/opportunities', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { 
            tier, 
            priority, 
            symbol, 
            status = 'ACTIVE', 
            min_confidence = 0.0,
            limit = 100,
            sort_by = 'priority_score',
            order = 'desc'
        } = req.query;
        
        const filters = {
            tier,
            priority,
            symbol,
            status,
            min_confidence: parseFloat(min_confidence),
            limit: parseInt(limit),
            sort_by,
            order
        };
        
        const opportunities = opportunitiesAPI.getOpportunities(filters);
        
        res.json({
            opportunities,
            total_opportunities: opportunities.length,
            filters_applied: filters,
            summary_metrics: {
                total_active: opportunitiesAPI.getActiveOpportunitiesCount(),
                tier_distribution: opportunitiesAPI.getTierDistribution(),
                priority_distribution: opportunitiesAPI.getPriorityDistribution(),
                average_confidence: opportunitiesAPI.getAverageConfidence()
            },
            market_conditions: opportunitiesAPI.getCurrentMarketConditions(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving opportunities',
            message: error.message
        });
    }
});

// [TROPHY] OPPORTUNITIES BY TIER ENDPOINT
app.get('/api/opportunities/tier/:tier', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { tier } = req.params;
        const { priority, status = 'ACTIVE', limit = 50 } = req.query;
        
        const validTiers = ['TIER1', 'TIER2', 'TIER3', 'TIER4'];
        if (!validTiers.includes(tier)) {
            return res.status(400).json({
                error: 'Invalid tier',
                valid_tiers: validTiers
            });
        }
        
        const opportunities = opportunitiesAPI.getOpportunitiesByTier(tier, {
            priority,
            status,
            limit: parseInt(limit)
        });
        
        res.json({
            tier,
            opportunities,
            total_opportunities: opportunities.length,
            tier_metrics: opportunitiesAPI.getTierMetrics(tier),
            tier_performance: opportunitiesAPI.getTierPerformance(tier),
            market_alignment: opportunitiesAPI.getTierMarketAlignment(tier),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving tier opportunities',
            message: error.message
        });
    }
});

// [TREND_UP] OPPORTUNITIES BY SYMBOL ENDPOINT
app.get('/api/opportunities/symbol/:symbol', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { symbol } = req.params;
        const { priority, status = 'ACTIVE', limit = 20 } = req.query;
        
        const opportunities = opportunitiesAPI.getOpportunitiesBySymbol(symbol, {
            priority,
            status,
            limit: parseInt(limit)
        });
        
        res.json({
            symbol,
            opportunities,
            total_opportunities: opportunities.length,
            symbol_analysis: opportunitiesAPI.getSymbolAnalysis(symbol),
            symbol_ranking: opportunitiesAPI.getSymbolRanking(symbol),
            temporal_analysis: opportunitiesAPI.getSymbolTemporalAnalysis(symbol),
            risk_profile: opportunitiesAPI.getSymbolRiskProfile(symbol),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving symbol opportunities',
            message: error.message
        });
    }
});

// [LIGHTNING] OPPORTUNITIES BY PRIORITY ENDPOINT
app.get('/api/opportunities/priority/:level', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { level } = req.params;
        const { tier, status = 'ACTIVE', limit = 30 } = req.query;
        
        const validLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                error: 'Invalid priority level',
                valid_levels: validLevels
            });
        }
        
        const opportunities = opportunitiesAPI.getOpportunitiesByPriority(level, {
            tier,
            status,
            limit: parseInt(limit)
        });
        
        res.json({
            priority_level: level,
            opportunities,
            total_opportunities: opportunities.length,
            priority_analysis: opportunitiesAPI.getPriorityAnalysis(level),
            urgency_metrics: opportunitiesAPI.getUrgencyMetrics(level),
            execution_recommendations: opportunitiesAPI.getExecutionRecommendations(level),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving priority opportunities',
            message: error.message
        });
    }
});

// [GLOBE] MARKET OVERVIEW ENDPOINT
app.get('/api/market-overview', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const marketOverview = opportunitiesAPI.getMarketOverview();
        
        res.json({
            market_overview: marketOverview,
            global_metrics: opportunitiesAPI.getGlobalMetrics(),
            market_sentiment: opportunitiesAPI.getMarketSentiment(),
            temporal_insights: opportunitiesAPI.getTemporalInsights(),
            risk_assessment: opportunitiesAPI.getGlobalRiskAssessment(),
            top_opportunities: opportunitiesAPI.getTopOpportunities(10),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving market overview',
            message: error.message
        });
    }
});

// [CHART] TIER SUMMARY ENDPOINT
app.get('/api/tier-summary', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const tierSummary = opportunitiesAPI.getTierSummary();
        
        res.json({
            tier_summary: tierSummary,
            tier_rankings: opportunitiesAPI.getTierRankings(),
            tier_performance_comparison: opportunitiesAPI.getTierPerformanceComparison(),
            tier_allocation_recommendations: opportunitiesAPI.getTierAllocationRecommendations(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving tier summary',
            message: error.message
        });
    }
});

// [TREND_UP] PERFORMANCE METRICS ENDPOINT
app.get('/api/performance-metrics', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { timeframe = '24h' } = req.query;
        const performanceMetrics = opportunitiesAPI.getPerformanceMetrics(timeframe);
        
        res.json({
            timeframe,
            performance_metrics: performanceMetrics,
            success_rates: opportunitiesAPI.getSuccessRates(timeframe),
            profit_analysis: opportunitiesAPI.getProfitAnalysis(timeframe),
            engine_performance: opportunitiesAPI.getEnginePerformance(timeframe),
            historical_trends: opportunitiesAPI.getHistoricalTrends(timeframe),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving performance metrics',
            message: error.message
        });
    }
});

// [WARNING] RISK ANALYSIS ENDPOINT
app.get('/api/risk-analysis', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const riskAnalysis = opportunitiesAPI.getRiskAnalysis();
        
        res.json({
            risk_analysis: riskAnalysis,
            portfolio_risk: opportunitiesAPI.getPortfolioRisk(),
            concentration_risk: opportunitiesAPI.getConcentrationRisk(),
            market_risk: opportunitiesAPI.getMarketRisk(),
            risk_recommendations: opportunitiesAPI.getRiskRecommendations(),
            stress_test_results: opportunitiesAPI.getStressTestResults(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error retrieving risk analysis',
            message: error.message
        });
    }
});

// [REFRESH] REFRESH OPPORTUNITIES ENDPOINT
app.post('/api/opportunities/refresh', async (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const { force = false, engines = [] } = req.body;
        
        const refreshResults = await opportunitiesAPI.refreshOpportunities({
            force,
            specific_engines: engines
        });
        
        res.json({
            refresh_completed: true,
            refresh_results: refreshResults,
            new_opportunities: refreshResults.new_opportunities_count,
            updated_opportunities: refreshResults.updated_opportunities_count,
            removed_opportunities: refreshResults.removed_opportunities_count,
            engines_refreshed: refreshResults.engines_refreshed,
            total_opportunities: opportunitiesAPI.getActiveOpportunitiesCount(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error refreshing opportunities',
            message: error.message
        });
    }
});

// [MAGNIFY] ADVANCED FILTER ENDPOINT
app.post('/api/opportunities/filter', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const {
            advanced_filters = {},
            sorting_criteria = {},
            aggregations = [],
            export_format = null
        } = req.body;
        
        const filterResults = opportunitiesAPI.filterOpportunities({
            advanced_filters,
            sorting_criteria,
            aggregations,
            export_format
        });
        
        res.json({
            filter_results: filterResults,
            total_matches: filterResults.opportunities.length,
            filters_applied: advanced_filters,
            sorting_applied: sorting_criteria,
            aggregation_results: filterResults.aggregations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error filtering opportunities',
            message: error.message
        });
    }
});

// 📤 EXPORT OPPORTUNITIES ENDPOINT
app.post('/api/opportunities/export', (req, res) => {
    if (!opportunitiesAPI) {
        return res.status(503).json({
            error: 'Consolidated Opportunities API not initialized'
        });
    }

    try {
        const {
            format = 'json',
            filters = {},
            include_metadata = true,
            include_analytics = false
        } = req.body;
        
        const validFormats = ['json', 'csv', 'xlsx'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                error: 'Invalid export format',
                valid_formats: validFormats
            });
        }
        
        const exportData = opportunitiesAPI.exportOpportunities({
            format,
            filters,
            include_metadata,
            include_analytics
        });
        
        // Configurar headers según el formato
        switch (format) {
            case 'csv':
                res.set({
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename=opportunities_${new Date().toISOString().split('T')[0]}.csv`
                });
                break;
            case 'xlsx':
                res.set({
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename=opportunities_${new Date().toISOString().split('T')[0]}.xlsx`
                });
                break;
            default:
                res.set('Content-Type', 'application/json');
        }
        
        res.send(exportData);
        
    } catch (error) {
        res.status(500).json({
            error: 'Error exporting opportunities',
            message: error.message
        });
    }
});

// [WRENCH] CONFIGURAR WEBSOCKET
function setupWebSocket() {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('[LINK] Nueva conexión WebSocket a Consolidated Opportunities API');
        
        // Enviar estado inicial
        if (opportunitiesAPI) {
            try {
                ws.send(JSON.stringify({
                    type: 'initial_state',
                    data: opportunitiesAPI.getSystemStatus(),
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

    // Configurar eventos de la API consolidada
    if (opportunitiesAPI) {
        opportunitiesAPI.on('opportunities-updated', (data) => {
            broadcastToClients(wss, {
                type: 'opportunities_updated',
                data,
                timestamp: new Date().toISOString()
            });
        });

        opportunitiesAPI.on('new-opportunity', (data) => {
            broadcastToClients(wss, {
                type: 'new_opportunity',
                data,
                timestamp: new Date().toISOString()
            });
        });

        opportunitiesAPI.on('opportunity-expired', (data) => {
            broadcastToClients(wss, {
                type: 'opportunity_expired',
                data,
                timestamp: new Date().toISOString()
            });
        });

        opportunitiesAPI.on('market-conditions-changed', (data) => {
            broadcastToClients(wss, {
                type: 'market_conditions_changed',
                data,
                timestamp: new Date().toISOString()
            });
        });
    }

    return wss;
}

// 📨 MANEJAR MENSAJES WEBSOCKET
function handleWebSocketMessage(data, ws) {
    switch (data.type) {
        case 'get_opportunities':
            if (opportunitiesAPI) {
                const filters = data.filters || {};
                ws.send(JSON.stringify({
                    type: 'opportunities',
                    data: opportunitiesAPI.getOpportunities(filters),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_market_overview':
            if (opportunitiesAPI) {
                ws.send(JSON.stringify({
                    type: 'market_overview',
                    data: opportunitiesAPI.getMarketOverview(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'get_tier_summary':
            if (opportunitiesAPI) {
                ws.send(JSON.stringify({
                    type: 'tier_summary',
                    data: opportunitiesAPI.getTierSummary(),
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'subscribe_to_tier':
            if (opportunitiesAPI && data.tier) {
                // Implementar suscripción a tier específico
                ws.tierSubscription = data.tier;
                ws.send(JSON.stringify({
                    type: 'subscription_confirmed',
                    tier: data.tier,
                    timestamp: new Date().toISOString()
                }));
            }
            break;
            
        case 'refresh_opportunities':
            if (opportunitiesAPI) {
                opportunitiesAPI.refreshOpportunities().then(results => {
                    ws.send(JSON.stringify({
                        type: 'refresh_complete',
                        data: results,
                        timestamp: new Date().toISOString()
                    }));
                }).catch(error => {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message,
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
                // Filtrar por suscripciones si es necesario
                if (message.type === 'tier_update' && client.tierSubscription) {
                    if (message.data.tier === client.tierSubscription) {
                        client.send(messageStr);
                    }
                } else {
                    client.send(messageStr);
                }
            } catch (error) {
                console.error('[X] Error broadcasting mensaje:', error.message);
            }
        }
    });
}

// [ROCKET] INICIALIZAR SERVICIO
async function initializeService() {
    try {
        console.log('[REFRESH] =============== CONSOLIDATED OPPORTUNITIES API SERVICE STARTUP ===============');
        console.log(`[WRENCH] Initializing Consolidated Opportunities API on port ${PORT}...`);
        
        isInitializing = true;
        
        // Inicializar API consolidada
        opportunitiesAPI = new ConsolidatedOpportunitiesAPI({
            real_time_updates: true,
            performance_tracking: true,
            risk_monitoring: true,
            export_capabilities: true,
            engines_integration: {
                temporal_cycles: true,
                multidimensional_weighting: true,
                tier_strategy: true
            }
        });
        
        // Esperar a que la API se inicialice
        await new Promise((resolve) => {
            opportunitiesAPI.once('api-initialized', () => {
                console.log('[CHECK] Consolidated Opportunities API inicializada correctamente');
                resolve();
            });
        });
        
        isInitializing = false;
        
        // Configurar WebSocket
        setupWebSocket();
        
        // Iniciar servidor
        server.listen(PORT, () => {
            console.log(`[CHECK] Consolidated Opportunities API Service started on port ${PORT}`);
            console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
            console.log(`[CHART] Status endpoint: http://localhost:${PORT}/status`);
            console.log(`[TARGET] All opportunities: http://localhost:${PORT}/api/opportunities`);
            console.log(`[TROPHY] Tier opportunities: http://localhost:${PORT}/api/opportunities/tier/:tier`);
            console.log(`[TREND_UP] Symbol opportunities: http://localhost:${PORT}/api/opportunities/symbol/:symbol`);
            console.log(`[LIGHTNING] Priority opportunities: http://localhost:${PORT}/api/opportunities/priority/:level`);
            console.log(`[GLOBE] Market overview: http://localhost:${PORT}/api/market-overview`);
            console.log(`[CHART] Tier summary: http://localhost:${PORT}/api/tier-summary`);
            console.log(`[TREND_UP] Performance metrics: http://localhost:${PORT}/api/performance-metrics`);
            console.log(`[WARNING] Risk analysis: http://localhost:${PORT}/api/risk-analysis`);
            console.log(`[REFRESH] Refresh opportunities: POST http://localhost:${PORT}/api/opportunities/refresh`);
            console.log(`[MAGNIFY] Filter opportunities: POST http://localhost:${PORT}/api/opportunities/filter`);
            console.log(`📤 Export opportunities: POST http://localhost:${PORT}/api/opportunities/export`);
            console.log(`[CRYSTAL_BALL] WebSocket: ws://localhost:${PORT}/ws`);
            console.log('🛡️ Service ready with consolidated opportunities integration\\n');
        });
        
    } catch (error) {
        console.error('[X] Error initializing Consolidated Opportunities API Service:', error);
        process.exit(1);
    }
}

// [STOP] MANEJO GRACEFUL DE CIERRE
process.on('SIGINT', async () => {
    console.log('[STOP] Graceful shutdown iniciado...');
    
    if (opportunitiesAPI) {
        await opportunitiesAPI.shutdown();
    }
    
    server.close(() => {
        console.log('[CHECK] Consolidated Opportunities API Service shutdown completed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, shutting down...');
    
    if (opportunitiesAPI) {
        await opportunitiesAPI.shutdown();
    }
    
    server.close(() => {
        process.exit(0);
    });
});

// [ROCKET] INICIAR SERVICIO
initializeService().catch(console.error);

export default { app, server, opportunitiesAPI };
