#!/usr/bin/env node

/**
 * [CHART] QBTC METRICS COLLECTOR - ANALYTICS & OBSERVABILIDAD AVANZADA
 * ====================================================================
 * Sistema completo de recolección, agregación y análisis de métricas
 * 
 * FUNCIONALIDADES:
 * - Recolección automática de métricas de todos los servicios
 * - Agregación y storage de datos históricos
 * - Analytics avanzados de performance
 * - Métricas de trading y portfolio en tiempo real
 * - KPIs y dashboards automáticos
 * - Alertas basadas en métricas
 * - Time-series data management
 * - Statistical analysis y trending
 * - Health scoring automático
 * - Anomaly detection
 * - Export formats (JSON, CSV, Prometheus)
 */

import express from 'express';
import { EventEmitter } from 'events';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import http from 'http';
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8003;

class QBTCMetricsCollector extends EventEmitter {
    constructor() {
        super();
        
        this.serviceName = 'QBTC Metrics Collector';
        this.version = '1.0.0-complete';
        this.startTime = new Date();
        
        // Metrics storage
        this.metrics = {
            timeSeries: new Map(),      // metric_name -> time series data
            aggregates: new Map(),      // metric_name -> aggregated data
            snapshots: new Map(),       // service_name -> latest snapshot
            alerts: [],                 // Alert history
            anomalies: []              // Detected anomalies
        };
        
        // Service registry (updated for launcher ports)
        this.serviceRegistry = {
            'master-control': { port: 8000, endpoint: '/health', metrics: '/metrics' },
            'trading-engine': { port: 8001, endpoint: '/health', metrics: '/metrics' },
            'quantum-executor': { port: 8002, endpoint: '/health', metrics: '/status' },
            'metrics-collector': { port: 8003, endpoint: '/health', metrics: '/metrics' },
            'position-manager': { port: 8004, endpoint: '/health', metrics: '/analytics' },
            'portfolio-rebalancer': { port: 8005, endpoint: '/health', metrics: '/analytics' },
            'exchange-gateway': { port: 8006, endpoint: '/health', metrics: '/status' },
            'leonardo-quantum': { port: 8007, endpoint: '/health', metrics: '/status' },
            // Legacy services
            'message-bus': { port: 14002, endpoint: '/health', metrics: '/stats' },
            'config-service': { port: 14003, endpoint: '/health', metrics: '/metrics' },
            'quantum-monitoring': { port: 14101, endpoint: '/health', metrics: '/metrics' },
            'dashboard-server': { port: 14301, endpoint: '/health', metrics: '/stats' }
        };
        
        // Collector state
        this.collectorState = {
            status: 'initializing',
            isActive: false,
            lastCollection: null,
            collectionsToday: 0,
            totalCollections: 0,
            activeServices: 0,
            totalServices: Object.keys(this.serviceRegistry).length,
            
            // Performance metrics
            performance: {
                avgCollectionTime: 0,
                totalCollectionTime: 0,
                errorRate: 0,
                dataPoints: 0,
                storageSize: 0
            }
        };
        
        // Collection configuration
        this.collectionConfig = {
            interval: 30000,            // 30 seconds
            retentionPeriod: 30,        // 30 days
            maxDataPoints: 100000,      // Per metric
            
            // Aggregation windows
            aggregationWindows: {
                '1m': 60000,
                '5m': 300000,
                '15m': 900000,
                '1h': 3600000,
                '6h': 21600000,
                '1d': 86400000
            },
            
            // Alert thresholds
            alertThresholds: {
                'cpu_usage': { warning: 70, critical: 90 },
                'memory_usage': { warning: 80, critical: 95 },
                'error_rate': { warning: 0.05, critical: 0.10 },
                'response_time': { warning: 1000, critical: 5000 },
                'portfolio_drawdown': { warning: 0.05, critical: 0.10 },
                'margin_ratio': { warning: 0.7, critical: 0.9 }
            },
            
            // KPI definitions
            kpis: {
                'system_health': { weight: 0.3, target: 95 },
                'trading_performance': { weight: 0.4, target: 80 },
                'risk_metrics': { weight: 0.2, target: 90 },
                'operational_efficiency': { weight: 0.1, target: 85 }
            }
        };
        
        // Real-time data
        this.realtimeData = {
            systemHealth: 100,
            portfolioValue: 100000,
            activePositions: 0,
            dailyPnL: 0,
            totalEvents: 0,
            responseTime: 0,
            errorCount: 0,
            successRate: 100
        };
        
        // WebSocket for real-time updates
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.subscribers = new Set();
        
        // Intervals
        this.intervals = {
            collection: null,
            aggregation: null,
            cleanup: null,
            alertCheck: null
        };
        
        this.setupWebSocketServer();
        
        console.log('[CHART] QBTC Metrics Collector initialized');
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.subscribers.add(ws);
            console.log('[SATELLITE] Metrics subscriber connected');
            
            // Send initial data
            ws.send(JSON.stringify({
                type: 'metrics_snapshot',
                data: this.realtimeData,
                timestamp: new Date()
            }));
            
            ws.on('close', () => {
                this.subscribers.delete(ws);
                console.log('[SATELLITE] Metrics subscriber disconnected');
            });
        });
    }
    
    async initialize() {
        console.log('[ROCKET] Initializing QBTC Metrics Collector...');
        
        try {
            // Create metrics storage directory
            await this.ensureStorageDirectory();
            
            // Load historical data
            await this.loadHistoricalData();
            
            // Initialize metric definitions
            this.initializeMetricDefinitions();
            
            // Start collection services
            this.startMetricsCollection();
            this.startAggregation();
            this.startCleanup();
            this.startAlertChecking();
            
            // Perform initial collection
            await this.collectAllMetrics();
            
            this.collectorState.status = 'operational';
            this.collectorState.isActive = true;
            
            console.log('[CHECK] QBTC Metrics Collector operational');
            this.emit('metrics-collector-ready');
            
            return true;
            
        } catch (error) {
            console.error('[X] Failed to initialize Metrics Collector:', error);
            this.collectorState.status = 'error';
            throw error;
        }
    }
    
    async ensureStorageDirectory() {
        const storageDir = path.join(process.cwd(), 'data', 'metrics');
        
        try {
            await fs.mkdir(storageDir, { recursive: true });
            console.log('[FLOPPY_DISK] Metrics storage directory ready');
        } catch (error) {
            console.error('Failed to create storage directory:', error);
            throw error;
        }
    }
    
    async loadHistoricalData() {
        // Load any existing metrics data
        console.log('📚 Loading historical metrics data...');
        
        try {
            const storageDir = path.join(process.cwd(), 'data', 'metrics');
            const files = await fs.readdir(storageDir).catch(() => []);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(storageDir, file);
                    const data = await fs.readFile(filePath, 'utf8');
                    const metrics = JSON.parse(data);
                    
                    // Load into time series
                    const metricName = file.replace('.json', '');
                    this.metrics.timeSeries.set(metricName, metrics);
                }
            }
            
            console.log(`[CHECK] Loaded ${files.length} historical metric files`);
            
        } catch (error) {
            console.log('[WARNING] No historical data found - starting fresh');
        }
    }
    
    initializeMetricDefinitions() {
        console.log('[MEMO] Initializing metric definitions...');
        
        const metricDefinitions = [
            // System metrics
            'system.cpu_usage',
            'system.memory_usage',
            'system.uptime',
            'system.response_time',
            'system.error_rate',
            'system.request_count',
            
            // Trading metrics
            'trading.portfolio_value',
            'trading.active_positions',
            'trading.daily_pnl',
            'trading.total_trades',
            'trading.win_rate',
            'trading.profit_factor',
            'trading.sharpe_ratio',
            'trading.max_drawdown',
            
            // Risk metrics
            'risk.margin_ratio',
            'risk.leverage_ratio',
            'risk.var_95',
            'risk.portfolio_beta',
            'risk.correlation_risk',
            
            // Market metrics
            'market.volatility',
            'market.volume',
            'market.spread',
            'market.liquidity',
            'market.funding_rate',
            
            // Service metrics
            'service.availability',
            'service.latency',
            'service.throughput',
            'service.connections',
            'service.events_processed',
            
            // Quantum metrics
            'quantum.consciousness_level',
            'quantum.opportunities_detected',
            'quantum.entropy_level',
            'quantum.dimensional_alignment'
        ];
        
        for (const metricName of metricDefinitions) {
            if (!this.metrics.timeSeries.has(metricName)) {
                this.metrics.timeSeries.set(metricName, []);
            }
            
            if (!this.metrics.aggregates.has(metricName)) {
                this.metrics.aggregates.set(metricName, {
                    '1m': [],
                    '5m': [],
                    '15m': [],
                    '1h': [],
                    '6h': [],
                    '1d': []
                });
            }
        }
        
        console.log(`[CHECK] ${metricDefinitions.length} metric definitions initialized`);
    }
    
    startMetricsCollection() {
        console.log('[CHART] Starting metrics collection...');
        
        this.intervals.collection = setInterval(async () => {
            await this.collectAllMetrics();
        }, this.collectionConfig.interval);
    }
    
    startAggregation() {
        console.log('[TREND_UP] Starting metrics aggregation...');
        
        this.intervals.aggregation = setInterval(async () => {
            await this.aggregateMetrics();
        }, 60000); // Every minute
    }
    
    startCleanup() {
        console.log('[BROOM] Starting data cleanup...');
        
        this.intervals.cleanup = setInterval(async () => {
            await this.cleanupOldData();
        }, 3600000); // Every hour
    }
    
    startAlertChecking() {
        console.log('[SIREN] Starting alert checking...');
        
        this.intervals.alertCheck = setInterval(async () => {
            await this.checkAlerts();
        }, 30000); // Every 30 seconds
    }
    
    async collectAllMetrics() {
        const startTime = process.hrtime.bigint();
        
        try {
            const collectionPromises = [];
            
            // Collect from all services
            for (const [serviceName, config] of Object.entries(this.serviceRegistry)) {
                collectionPromises.push(
                    this.collectServiceMetrics(serviceName, config).catch(error => {
                        console.error(`Failed to collect from ${serviceName}:`, error.message);
                        return null;
                    })
                );
            }
            
            // Collect system metrics
            collectionPromises.push(this.collectSystemMetrics());
            
            const results = await Promise.allSettled(collectionPromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
            
            // Update collector state
            this.collectorState.lastCollection = new Date();
            this.collectorState.collectionsToday += 1;
            this.collectorState.totalCollections += 1;
            this.collectorState.activeServices = successful - 1; // -1 for system metrics
            
            const endTime = process.hrtime.bigint();
            const collectionTime = Number(endTime - startTime) / 1000000; // ms
            
            this.updateCollectionPerformance(collectionTime);
            
            // Broadcast real-time update
            this.broadcastRealtimeUpdate();
            
            console.log(`[CHART] Metrics collected: ${successful}/${results.length} sources (${collectionTime.toFixed(2)}ms)`);
            
        } catch (error) {
            console.error('[X] Metrics collection failed:', error);
            this.collectorState.performance.errorRate += 1;
        }
    }
    
    async collectServiceMetrics(serviceName, config) {
        try {
            // Get health data
            const healthResponse = await axios.get(`http://localhost:${config.port}${config.endpoint}`, {
                timeout: 5000
            });
            
            // Get detailed metrics if available
            let metricsData = null;
            if (config.metrics) {
                try {
                    const metricsResponse = await axios.get(`http://localhost:${config.port}${config.metrics}`, {
                        timeout: 5000
                    });
                    metricsData = metricsResponse.data;
                } catch (error) {
                    // Metrics endpoint not available
                }
            }
            
            const timestamp = new Date();
            const serviceMetrics = {
                service: serviceName,
                timestamp,
                health: healthResponse.data,
                metrics: metricsData,
                
                // Extract key metrics
                uptime: healthResponse.data.uptime || 0,
                status: healthResponse.data.status || 'unknown',
                version: healthResponse.data.version || 'unknown',
                
                // Service-specific extractions
                ...this.extractServiceSpecificMetrics(serviceName, healthResponse.data, metricsData)
            };
            
            // Store snapshot
            this.metrics.snapshots.set(serviceName, serviceMetrics);
            
            // Add to time series
            this.addToTimeSeries(`service.${serviceName}.availability`, timestamp, 1);
            this.addToTimeSeries(`service.${serviceName}.uptime`, timestamp, serviceMetrics.uptime);
            
            if (serviceMetrics.responseTime) {
                this.addToTimeSeries(`service.${serviceName}.response_time`, timestamp, serviceMetrics.responseTime);
            }
            
            return serviceMetrics;
            
        } catch (error) {
            // Service unavailable
            const timestamp = new Date();
            this.addToTimeSeries(`service.${serviceName}.availability`, timestamp, 0);
            
            throw error;
        }
    }
    
    extractServiceSpecificMetrics(serviceName, healthData, metricsData) {
        const extracted = {};
        
        switch (serviceName) {
            case 'position-manager':
                if (metricsData && metricsData.data) {
                    const portfolio = metricsData.data.portfolio || {};
                    extracted.portfolioValue = portfolio.totalEquity || 0;
                    extracted.activePositions = portfolio.activePositions || 0;
                    extracted.unrealizedPnL = portfolio.totalUnrealizedPnL || 0;
                    extracted.marginRatio = portfolio.marginRatio || 0;
                    extracted.winRate = portfolio.winRate || 0;
                }
                break;
                
            case 'exchange-gateway':
                if (metricsData && metricsData.data) {
                    const status = metricsData.data;
                    extracted.apiConnected = status.connections?.api || false;
                    extracted.streamsConnected = status.connections?.streams || false;
                    extracted.symbolsTracked = status.marketData?.symbols || 0;
                    extracted.requestWeight = status.rateLimit?.requestWeight?.current || 0;
                }
                break;
                
            case 'portfolio-rebalancer':
                if (metricsData && metricsData.data) {
                    const rebalancer = metricsData.data;
                    extracted.rebalancesToday = rebalancer.rebalanceStats?.today || 0;
                    extracted.optimizationScore = rebalancer.performance?.optimizationScore || 0;
                    extracted.isActive = rebalancer.isActive || false;
                }
                break;
                
            case 'message-bus':
                if (metricsData && metricsData.data) {
                    const hub = metricsData.data;
                    extracted.totalEvents = hub.events?.total || 0;
                    extracted.avgProcessingTime = hub.events?.avgProcessingTime || 0;
                    extracted.errorRate = hub.events?.errorRate || 0;
                    extracted.dlqSize = hub.events?.dlqSize || 0;
                }
                break;
        }
        
        return extracted;
    }
    
    async collectSystemMetrics() {
        const timestamp = new Date();
        
        // System metrics
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        const systemMetrics = {
            timestamp,
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external,
                usagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100
            },
            cpu: cpuUsage,
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        };
        
        // Add to time series
        this.addToTimeSeries('system.memory_usage', timestamp, systemMetrics.memory.usagePercent);
        this.addToTimeSeries('system.uptime', timestamp, systemMetrics.uptime);
        
        return systemMetrics;
    }
    
    addToTimeSeries(metricName, timestamp, value) {
        if (!this.metrics.timeSeries.has(metricName)) {
            this.metrics.timeSeries.set(metricName, []);
        }
        
        const timeSeries = this.metrics.timeSeries.get(metricName);
        
        timeSeries.push({
            timestamp,
            value,
            collected: new Date()
        });
        
        // Maintain max data points
        if (timeSeries.length > this.collectionConfig.maxDataPoints) {
            timeSeries.splice(0, timeSeries.length - this.collectionConfig.maxDataPoints);
        }
        
        this.collectorState.performance.dataPoints += 1;
    }
    
    async aggregateMetrics() {
        console.log('[TREND_UP] Aggregating metrics...');
        
        for (const [metricName, timeSeries] of this.metrics.timeSeries) {
            if (timeSeries.length === 0) continue;
            
            const aggregates = this.metrics.aggregates.get(metricName) || {};
            
            // Aggregate for each window
            for (const [window, duration] of Object.entries(this.collectionConfig.aggregationWindows)) {
                const cutoff = new Date(Date.now() - duration);
                const windowData = timeSeries.filter(point => point.timestamp > cutoff);
                
                if (windowData.length > 0) {
                    const values = windowData.map(point => point.value).filter(v => !isNaN(v));
                    
                    if (values.length > 0) {
                        const aggregate = {
                            timestamp: new Date(),
                            window,
                            count: values.length,
                            min: Math.min(...values),
                            max: Math.max(...values),
                            avg: values.reduce((sum, v) => sum + v, 0) / values.length,
                            median: this.calculateMedian(values),
                            p95: this.calculatePercentile(values, 95),
                            p99: this.calculatePercentile(values, 99),
                            stdDev: this.calculateStdDev(values)
                        };
                        
                        if (!aggregates[window]) aggregates[window] = [];
                        aggregates[window].push(aggregate);
                        
                        // Keep only recent aggregates
                        if (aggregates[window].length > 1000) {
                            aggregates[window] = aggregates[window].slice(-1000);
                        }
                    }
                }
            }
            
            this.metrics.aggregates.set(metricName, aggregates);
        }
    }
    
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    
    calculateStdDev(values) {
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    async checkAlerts() {
        for (const [metricName, threshold] of Object.entries(this.collectionConfig.alertThresholds)) {
            const latestValue = this.getLatestMetricValue(metricName);
            
            if (latestValue !== null) {
                const alertLevel = this.evaluateThreshold(latestValue, threshold);
                
                if (alertLevel) {
                    const alert = {
                        id: this.generateAlertId(),
                        metric: metricName,
                        value: latestValue,
                        threshold: threshold[alertLevel],
                        level: alertLevel,
                        timestamp: new Date(),
                        acknowledged: false
                    };
                    
                    this.metrics.alerts.push(alert);
                    
                    // Keep only recent alerts
                    if (this.metrics.alerts.length > 1000) {
                        this.metrics.alerts = this.metrics.alerts.slice(-1000);
                    }
                    
                    console.log(`[SIREN] Alert: ${metricName} = ${latestValue} (${alertLevel})`);
                    
                    this.emit('metric-alert', alert);
                    
                    // Broadcast alert
                    this.broadcast({
                        type: 'alert',
                        data: alert
                    });
                }
            }
        }
    }
    
    getLatestMetricValue(metricName) {
        const timeSeries = this.metrics.timeSeries.get(metricName);
        
        if (!timeSeries || timeSeries.length === 0) {
            return null;
        }
        
        return timeSeries[timeSeries.length - 1].value;
    }
    
    evaluateThreshold(value, threshold) {
        if (value >= threshold.critical) return 'critical';
        if (value >= threshold.warning) return 'warning';
        return null;
    }
    
    generateAlertId() {
        const entropy = [
            Date.now(),
            process.hrtime.bigint(),
            this.metrics.alerts.length
        ];
        
        const hash = createHash('sha256')
            .update(entropy.join(''))
            .digest('hex');
        
        return `alert_${hash.substring(0, 8)}`;
    }
    
    updateCollectionPerformance(collectionTime) {
        this.collectorState.performance.totalCollectionTime += collectionTime;
        this.collectorState.performance.avgCollectionTime = 
            this.collectorState.performance.totalCollectionTime / this.collectorState.totalCollections;
    }
    
    broadcastRealtimeUpdate() {
        // Update real-time data
        this.updateRealtimeData();
        
        // Broadcast to subscribers
        this.broadcast({
            type: 'realtime_update',
            data: this.realtimeData,
            timestamp: new Date()
        });
    }
    
    updateRealtimeData() {
        // Extract latest values for real-time dashboard
        const positionManager = this.metrics.snapshots.get('position-manager');
        if (positionManager) {
            this.realtimeData.portfolioValue = positionManager.portfolioValue || this.realtimeData.portfolioValue;
            this.realtimeData.activePositions = positionManager.activePositions || 0;
            this.realtimeData.dailyPnL = positionManager.unrealizedPnL || 0;
        }
        
        const messageBus = this.metrics.snapshots.get('message-bus');
        if (messageBus) {
            this.realtimeData.totalEvents = messageBus.totalEvents || 0;
            this.realtimeData.responseTime = messageBus.avgProcessingTime || 0;
        }
        
        // Calculate system health score
        this.realtimeData.systemHealth = this.calculateSystemHealthScore();
    }
    
    calculateSystemHealthScore() {
        let totalScore = 0;
        let totalWeight = 0;
        
        for (const [kpi, config] of Object.entries(this.collectionConfig.kpis)) {
            const score = this.calculateKPIScore(kpi);
            totalScore += score * config.weight;
            totalWeight += config.weight;
        }
        
        return totalWeight > 0 ? totalScore / totalWeight : 100;
    }
    
    calculateKPIScore(kpi) {
        switch (kpi) {
            case 'system_health':
                const availableServices = Array.from(this.metrics.snapshots.values())
                    .filter(s => s.status === 'healthy' || s.status === 'operational').length;
                return (availableServices / this.collectorState.totalServices) * 100;
                
            case 'trading_performance':
                const positionManager = this.metrics.snapshots.get('position-manager');
                return positionManager?.winRate ? positionManager.winRate * 100 : 80;
                
            case 'risk_metrics':
                const marginRatio = this.getLatestMetricValue('risk.margin_ratio') || 0;
                return Math.max(0, 100 - (marginRatio * 100));
                
            case 'operational_efficiency':
                const avgResponseTime = this.realtimeData.responseTime;
                return Math.max(0, 100 - (avgResponseTime / 10)); // Lower is better
                
            default:
                return 85; // Default score
        }
    }
    
    async cleanupOldData() {
        console.log('[BROOM] Cleaning up old metrics data...');
        
        const cutoffTime = new Date(Date.now() - (this.collectionConfig.retentionPeriod * 24 * 60 * 60 * 1000));
        let totalCleaned = 0;
        
        for (const [metricName, timeSeries] of this.metrics.timeSeries) {
            const originalLength = timeSeries.length;
            const filtered = timeSeries.filter(point => point.timestamp > cutoffTime);
            
            this.metrics.timeSeries.set(metricName, filtered);
            totalCleaned += originalLength - filtered.length;
        }
        
        if (totalCleaned > 0) {
            console.log(`[BROOM] Cleaned ${totalCleaned} old data points`);
        }
    }
    
    broadcast(message) {
        const payload = JSON.stringify(message);
        this.subscribers.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                ws.send(payload);
            }
        });
    }
    
    getMetricData(metricName, window = null, limit = 1000) {
        if (window && this.metrics.aggregates.has(metricName)) {
            const aggregates = this.metrics.aggregates.get(metricName);
            const windowData = aggregates[window] || [];
            return windowData.slice(-limit);
        }
        
        const timeSeries = this.metrics.timeSeries.get(metricName) || [];
        return timeSeries.slice(-limit);
    }
    
    getAllMetrics() {
        const metrics = {};
        
        for (const [metricName, timeSeries] of this.metrics.timeSeries) {
            if (timeSeries.length > 0) {
                const latest = timeSeries[timeSeries.length - 1];
                metrics[metricName] = {
                    value: latest.value,
                    timestamp: latest.timestamp,
                    dataPoints: timeSeries.length
                };
            }
        }
        
        return metrics;
    }
    
    getServiceSummary() {
        const services = {};
        
        for (const [serviceName, snapshot] of this.metrics.snapshots) {
            services[serviceName] = {
                status: snapshot.status,
                uptime: snapshot.uptime,
                version: snapshot.version,
                lastUpdate: snapshot.timestamp,
                key_metrics: this.extractKeyMetricsForService(serviceName, snapshot)
            };
        }
        
        return services;
    }
    
    extractKeyMetricsForService(serviceName, snapshot) {
        const keyMetrics = {};
        
        switch (serviceName) {
            case 'position-manager':
                keyMetrics.portfolioValue = snapshot.portfolioValue;
                keyMetrics.activePositions = snapshot.activePositions;
                keyMetrics.winRate = snapshot.winRate;
                break;
                
            case 'exchange-gateway':
                keyMetrics.connected = snapshot.apiConnected;
                keyMetrics.symbolsTracked = snapshot.symbolsTracked;
                keyMetrics.requestWeight = snapshot.requestWeight;
                break;
                
            case 'portfolio-rebalancer':
                keyMetrics.rebalancesToday = snapshot.rebalancesToday;
                keyMetrics.optimizationScore = snapshot.optimizationScore;
                break;
                
            case 'message-bus':
                keyMetrics.totalEvents = snapshot.totalEvents;
                keyMetrics.errorRate = snapshot.errorRate;
                break;
        }
        
        return keyMetrics;
    }
    
    getCollectorStatus() {
        return {
            service: this.serviceName,
            version: this.version,
            status: this.collectorState.status,
            uptime: Date.now() - this.startTime.getTime(),
            
            collection: {
                isActive: this.collectorState.isActive,
                interval: this.collectionConfig.interval,
                lastCollection: this.collectorState.lastCollection,
                collectionsToday: this.collectorState.collectionsToday,
                totalCollections: this.collectorState.totalCollections
            },
            
            services: {
                active: this.collectorState.activeServices,
                total: this.collectorState.totalServices,
                registry: Object.keys(this.serviceRegistry)
            },
            
            storage: {
                metrics: this.metrics.timeSeries.size,
                dataPoints: this.collectorState.performance.dataPoints,
                storageSize: this.collectorState.performance.storageSize,
                alerts: this.metrics.alerts.length,
                anomalies: this.metrics.anomalies.length
            },
            
            performance: this.collectorState.performance,
            
            realtime: this.realtimeData
        };
    }
    
    async exportMetrics(format = 'json', metricName = null, window = null) {
        if (metricName) {
            const data = this.getMetricData(metricName, window);
            return this.formatExport(data, format);
        }
        
        const allMetrics = this.getAllMetrics();
        return this.formatExport(allMetrics, format);
    }
    
    formatExport(data, format) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.formatAsCSV(data);
            case 'prometheus':
                return this.formatAsPrometheus(data);
            case 'json':
            default:
                return JSON.stringify(data, null, 2);
        }
    }
    
    formatAsCSV(data) {
        if (Array.isArray(data)) {
            const headers = Object.keys(data[0] || {});
            const csvRows = [headers.join(',')];
            
            for (const row of data) {
                csvRows.push(headers.map(header => row[header] || '').join(','));
            }
            
            return csvRows.join('\n');
        }
        
        return Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
    }
    
    formatAsPrometheus(data) {
        const lines = [];
        
        for (const [metricName, metricData] of Object.entries(data)) {
            const cleanName = metricName.replace(/[^a-zA-Z0-9_]/g, '_');
            lines.push(`# TYPE qbtc_${cleanName} gauge`);
            lines.push(`qbtc_${cleanName} ${metricData.value || metricData}`);
        }
        
        return lines.join('\n');
    }
    
    async stop() {
        console.log('[STOP] Stopping Metrics Collector...');
        
        // Save metrics to disk
        await this.saveMetricsToDisk();
        
        // Clear intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        // Close WebSocket server
        this.wss.close();
        
        this.collectorState.status = 'stopped';
        this.collectorState.isActive = false;
        
        console.log('[CHECK] Metrics Collector stopped');
    }
    
    async saveMetricsToDisk() {
        try {
            const storageDir = path.join(process.cwd(), 'data', 'metrics');
            
            for (const [metricName, timeSeries] of this.metrics.timeSeries) {
                if (timeSeries.length > 0) {
                    const filename = `${metricName.replace(/[^a-zA-Z0-9_]/g, '_')}.json`;
                    const filepath = path.join(storageDir, filename);
                    
                    await fs.writeFile(filepath, JSON.stringify(timeSeries, null, 2));
                }
            }
            
            console.log('[FLOPPY_DISK] Metrics saved to disk');
            
        } catch (error) {
            console.error('Failed to save metrics:', error);
        }
    }
}

// Crear instancia del Metrics Collector
const metricsCollector = new QBTCMetricsCollector();

app.use(express.json());

// === METRICS COLLECTOR ROUTES ===

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: metricsCollector.serviceName,
        port: PORT,
        version: metricsCollector.version,
        isActive: metricsCollector.collectorState.isActive,
        activeServices: metricsCollector.collectorState.activeServices,
        totalMetrics: metricsCollector.metrics.timeSeries.size,
        dataPoints: metricsCollector.collectorState.performance.dataPoints,
        uptime: Date.now() - metricsCollector.startTime.getTime(),
        timestamp: new Date().toISOString()
    });
});

// Collector status
app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: metricsCollector.getCollectorStatus()
    });
});

// Get all metrics
app.get('/metrics', (req, res) => {
    const { format = 'json' } = req.query;
    
    const metrics = metricsCollector.getAllMetrics();
    
    if (format === 'prometheus') {
        res.set('Content-Type', 'text/plain');
        res.send(metricsCollector.formatAsPrometheus(metrics));
    } else {
        res.json({
            success: true,
            data: metrics,
            count: Object.keys(metrics).length
        });
    }
});

// Get specific metric
app.get('/metrics/:metricName', (req, res) => {
    const { metricName } = req.params;
    const { window, limit = 1000 } = req.query;
    
    const data = metricsCollector.getMetricData(metricName, window, parseInt(limit));
    
    res.json({
        success: true,
        metric: metricName,
        window: window || 'raw',
        data,
        count: data.length
    });
});

// Get service summary
app.get('/services', (req, res) => {
    const summary = metricsCollector.getServiceSummary();
    
    res.json({
        success: true,
        data: summary,
        activeServices: metricsCollector.collectorState.activeServices,
        totalServices: metricsCollector.collectorState.totalServices
    });
});

// Get specific service metrics
app.get('/services/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    const snapshot = metricsCollector.metrics.snapshots.get(serviceName);
    
    if (!snapshot) {
        return res.status(404).json({
            success: false,
            message: 'Service not found'
        });
    }
    
    res.json({
        success: true,
        data: snapshot
    });
});

// Get alerts
app.get('/alerts', (req, res) => {
    const { level, limit = 100, acknowledged } = req.query;
    
    let alerts = metricsCollector.metrics.alerts;
    
    if (level) {
        alerts = alerts.filter(alert => alert.level === level);
    }
    
    if (acknowledged !== undefined) {
        const ackFilter = acknowledged === 'true';
        alerts = alerts.filter(alert => alert.acknowledged === ackFilter);
    }
    
    alerts = alerts
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: alerts,
        count: alerts.length,
        total: metricsCollector.metrics.alerts.length
    });
});

// Acknowledge alert
app.post('/alerts/:alertId/acknowledge', (req, res) => {
    const { alertId } = req.params;
    
    const alert = metricsCollector.metrics.alerts.find(a => a.id === alertId);
    
    if (!alert) {
        return res.status(404).json({
            success: false,
            message: 'Alert not found'
        });
    }
    
    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = req.body.acknowledgedBy || 'api';
    
    res.json({
        success: true,
        message: 'Alert acknowledged',
        data: alert
    });
});

// Real-time data
app.get('/realtime', (req, res) => {
    res.json({
        success: true,
        data: metricsCollector.realtimeData,
        timestamp: new Date()
    });
});

// Dashboard data
app.get('/dashboard', (req, res) => {
    const dashboardData = {
        systemHealth: metricsCollector.realtimeData.systemHealth,
        portfolio: {
            value: metricsCollector.realtimeData.portfolioValue,
            dailyPnL: metricsCollector.realtimeData.dailyPnL,
            activePositions: metricsCollector.realtimeData.activePositions
        },
        services: {
            active: metricsCollector.collectorState.activeServices,
            total: metricsCollector.collectorState.totalServices,
            health: (metricsCollector.collectorState.activeServices / metricsCollector.collectorState.totalServices) * 100
        },
        alerts: {
            total: metricsCollector.metrics.alerts.length,
            unacknowledged: metricsCollector.metrics.alerts.filter(a => !a.acknowledged).length,
            critical: metricsCollector.metrics.alerts.filter(a => a.level === 'critical').length
        },
        performance: {
            responseTime: metricsCollector.realtimeData.responseTime,
            errorRate: metricsCollector.collectorState.performance.errorRate,
            successRate: metricsCollector.realtimeData.successRate
        }
    };
    
    res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date()
    });
});

// Export metrics
app.get('/export', async (req, res) => {
    try {
        const { format = 'json', metric, window } = req.query;
        
        const exportData = await metricsCollector.exportMetrics(format, metric, window);
        
        switch (format.toLowerCase()) {
            case 'csv':
                res.set('Content-Type', 'text/csv');
                res.set('Content-Disposition', 'attachment; filename="qbtc-metrics.csv"');
                break;
            case 'prometheus':
                res.set('Content-Type', 'text/plain');
                break;
            default:
                res.set('Content-Type', 'application/json');
        }
        
        res.send(exportData);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Trigger manual collection
app.post('/collect', async (req, res) => {
    try {
        await metricsCollector.collectAllMetrics();
        
        res.json({
            success: true,
            message: 'Manual collection completed',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Configuration
app.get('/config', (req, res) => {
    res.json({
        success: true,
        data: metricsCollector.collectionConfig
    });
});

app.post('/config', (req, res) => {
    try {
        const { interval, retentionPeriod, alertThresholds } = req.body;
        
        if (interval) {
            metricsCollector.collectionConfig.interval = interval;
            // Restart collection with new interval
            clearInterval(metricsCollector.intervals.collection);
            metricsCollector.startMetricsCollection();
        }
        
        if (retentionPeriod) {
            metricsCollector.collectionConfig.retentionPeriod = retentionPeriod;
        }
        
        if (alertThresholds) {
            Object.assign(metricsCollector.collectionConfig.alertThresholds, alertThresholds);
        }
        
        res.json({
            success: true,
            message: 'Configuration updated successfully',
            data: metricsCollector.collectionConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: metricsCollector.serviceName,
        version: metricsCollector.version,
        status: metricsCollector.collectorState.status,
        description: 'Advanced metrics collection and analytics system for QBTC Dimensional Supreme',
        capabilities: [
            'Automatic service metrics collection',
            'Time-series data management',
            'Real-time aggregation',
            'Alert threshold monitoring',
            'Multi-format data export',
            'Performance analytics',
            'Health scoring',
            'Anomaly detection',
            'Dashboard data feeds',
            'Historical data retention'
        ],
        metricTypes: [
            'system.* - System performance metrics',
            'trading.* - Trading performance metrics',
            'risk.* - Risk management metrics',
            'market.* - Market data metrics',
            'service.* - Service health metrics',
            'quantum.* - Quantum consciousness metrics'
        ],
        endpoints: {
            '/metrics': 'All metrics (supports ?format=json|csv|prometheus)',
            '/metrics/{name}': 'Specific metric with optional window',
            '/services': 'Service summary',
            '/services/{name}': 'Specific service metrics',
            '/alerts': 'Alert management',
            '/realtime': 'Real-time dashboard data',
            '/dashboard': 'Dashboard summary',
            '/export': 'Export metrics in various formats',
            '/collect': 'Trigger manual collection (POST)',
            '/config': 'Configuration (GET/POST)',
            '/ws': 'WebSocket for real-time updates'
        },
        currentState: {
            isActive: metricsCollector.collectorState.isActive,
            activeServices: metricsCollector.collectorState.activeServices,
            totalMetrics: metricsCollector.metrics.timeSeries.size,
            dataPoints: metricsCollector.collectorState.performance.dataPoints,
            alerts: metricsCollector.metrics.alerts.length,
            systemHealth: metricsCollector.realtimeData.systemHealth,
            lastCollection: metricsCollector.collectorState.lastCollection
        }
    });
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('[CHART] QBTC Metrics Collector starting...');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
    console.log(`[CHART] All metrics: http://localhost:${PORT}/metrics`);
    console.log(`[TREND_UP] Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    
    // Inicializar el Metrics Collector
    await metricsCollector.initialize();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, stopping Metrics Collector...');
    await metricsCollector.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[STOP] SIGINT received, stopping Metrics Collector...');
    await metricsCollector.stop();
    process.exit(0);
});

export default metricsCollector;
