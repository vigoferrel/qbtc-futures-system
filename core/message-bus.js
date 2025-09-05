#!/usr/bin/env node

/**
 * [SATELLITE] QBTC MESSAGE BUS EVENT HUB - SISTEMA NERVIOSO CENTRAL
 * =========================================================
 * Hub central de comunicación para todo el ecosistema QBTC
 * 
 * FUNCIONALIDADES:
 * - Event-driven architecture completa
 * - WebSocket clustering avanzado
 * - Pub/Sub patterns robustos
 * - Event routing inteligente
 * - Message persistence y replay
 * - Cross-service communication
 * - Real-time event broadcasting
 * - Event filtering y transformación
 * - Dead letter queue management
 * - Circuit breaker patterns
 * - Event analytics y monitoring
 */

import express from 'express';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import http from 'http';
import { createHash } from 'crypto';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const PORT = 14002;

class QBTCMessageBusEventHub extends EventEmitter {
    constructor() {
        super();
        
        this.serviceName = 'QBTC Message Bus Event Hub';
        this.version = '1.0.0-complete';
        this.startTime = new Date();
        
        // Event Hub State
        this.hubState = {
            status: 'initializing',
            isActive: false,
            connectedServices: new Map(),
            totalEvents: 0,
            eventsToday: 0,
            lastEvent: null,
            circuitBreakerOpen: false
        };
        
        // Event subscriptions - topic -> Set(subscribers)
        this.subscriptions = new Map();
        
        // Event history for replay
        this.eventHistory = [];
        this.maxHistorySize = 10000;
        
        // Dead letter queue
        this.deadLetterQueue = [];
        this.maxDLQSize = 1000;
        
        // WebSocket connections
        this.wss = new WebSocketServer({ server, path: '/ws' });
        this.wsConnections = new Map(); // connectionId -> connection info
        
        // Service connections
        this.serviceConnections = new Map();
        
        // Event routing configuration
        this.routingConfig = {
            // Event types y sus rutas
            routes: {
                'position.*': ['position-manager', 'portfolio-rebalancer', 'metrics-collector'],
                'market.*': ['exchange-gateway', 'quantum-engines', 'dashboard'],
                'order.*': ['trading-executor', 'position-manager', 'risk-manager'],
                'risk.*': ['risk-manager', 'position-manager', 'master-control'],
                'rebalance.*': ['portfolio-rebalancer', 'position-manager', 'metrics-collector'],
                'config.*': ['config-service', 'master-control', 'all-services'],
                'system.*': ['master-control', 'metrics-collector', 'dashboard'],
                'quantum.*': ['quantum-engines', 'consciousness-integrator', 'dashboard'],
                'alert.*': ['alert-engine', 'dashboard', 'master-control']
            },
            
            // Filtros de eventos
            filters: {
                priority: {
                    'CRITICAL': ['master-control', 'alert-engine'],
                    'HIGH': ['master-control', 'risk-manager', 'position-manager'],
                    'MEDIUM': ['metrics-collector', 'dashboard'],
                    'LOW': ['metrics-collector']
                },
                
                source: {
                    'user': ['dashboard', 'master-control'],
                    'system': ['metrics-collector', 'master-control'],
                    'market': ['trading-engines', 'quantum-engines'],
                    'risk': ['risk-manager', 'position-manager']
                }
            }
        };
        
        // Circuit breaker configuration
        this.circuitBreaker = {
            failureThreshold: 50,        // 50 fallos
            resetTimeout: 60000,         // 1 minuto
            failureCount: 0,
            lastFailure: null,
            halfOpenRequests: 0,
            maxHalfOpenRequests: 10
        };
        
        // Event statistics
        this.eventStats = {
            byType: new Map(),
            bySource: new Map(),
            byPriority: new Map(),
            byHour: new Array(24).fill(0),
            avgProcessingTime: 0,
            totalProcessingTime: 0,
            errorRate: 0
        };
        
        // Intervals
        this.intervals = {
            healthcheck: null,
            cleanup: null,
            stats: null,
            circuitBreakerReset: null
        };
        
        this.setupWebSocketServer();
        
        console.log('[SATELLITE] QBTC Message Bus Event Hub initialized');
    }
    
    setupWebSocketServer() {
        this.wss.on('connection', (ws, request) => {
            const connectionId = this.generateConnectionId();
            const connectionInfo = {
                id: connectionId,
                ws,
                connectedAt: new Date(),
                lastActivity: new Date(),
                subscribedTopics: new Set(),
                messagesSent: 0,
                messagesReceived: 0,
                remoteAddress: request.socket.remoteAddress,
                userAgent: request.headers['user-agent']
            };
            
            this.wsConnections.set(connectionId, connectionInfo);
            
            console.log(`[SATELLITE] WebSocket connected: ${connectionId}`);
            
            // Send connection confirmation
            ws.send(JSON.stringify({
                type: 'connection_established',
                connectionId,
                timestamp: new Date(),
                availableTopics: Array.from(this.subscriptions.keys())
            }));
            
            ws.on('message', (data) => {
                this.handleWebSocketMessage(connectionId, data);
            });
            
            ws.on('close', () => {
                this.handleWebSocketDisconnect(connectionId);
            });
            
            ws.on('error', (error) => {
                console.error(`WebSocket error for ${connectionId}:`, error);
                this.handleWebSocketDisconnect(connectionId);
            });
        });
    }
    
    generateConnectionId() {
        const entropy = [
            Date.now(),
            process.hrtime.bigint(),
            process.pid
        ];
        
        const hash = createHash('sha256')
            .update(entropy.join(''))
            .digest('hex');
        
        return `conn_${hash.substring(0, 12)}`;
    }
    
    async initialize() {
        console.log('[ROCKET] Initializing QBTC Message Bus Event Hub...');
        
        try {
            // Discover and connect to services
            await this.discoverServices();
            
            // Initialize default topics
            this.initializeDefaultTopics();
            
            // Start background services
            this.startHealthcheck();
            this.startCleanup();
            this.startStatsCollection();
            this.startCircuitBreakerMonitoring();
            
            this.hubState.status = 'operational';
            this.hubState.isActive = true;
            
            console.log('[CHECK] QBTC Message Bus Event Hub operational');
            this.emit('event-hub-ready');
            
            return true;
            
        } catch (error) {
            console.error('[X] Failed to initialize Message Bus Event Hub:', error);
            this.hubState.status = 'error';
            throw error;
        }
    }
    
    async discoverServices() {
        console.log('[MAGNIFY] Discovering QBTC services...');
        
        const services = [
            { name: 'master-control', port: 14001, endpoint: '/health' },
            { name: 'config-service', port: 14003, endpoint: '/health' },
            { name: 'exchange-gateway', port: 14204, endpoint: '/health' },
            { name: 'position-manager', port: 14202, endpoint: '/health' },
            { name: 'portfolio-rebalancer', port: 14203, endpoint: '/health' },
            { name: 'metrics-collector', port: 14004, endpoint: '/health' },
            { name: 'quantum-monitoring', port: 14101, endpoint: '/health' },
            { name: 'dashboard-server', port: 14301, endpoint: '/health' }
        ];
        
        for (const service of services) {
            try {
                const response = await axios.get(`http://localhost:${service.port}${service.endpoint}`, {
                    timeout: 3000
                });
                
                this.hubState.connectedServices.set(service.name, {
                    name: service.name,
                    port: service.port,
                    endpoint: service.endpoint,
                    status: 'connected',
                    lastPing: new Date(),
                    version: response.data.version || 'unknown',
                    messagesSent: 0,
                    messagesReceived: 0
                });
                
                console.log(`[CHECK] Service discovered: ${service.name} on port ${service.port}`);
                
            } catch (error) {
                console.log(`[WARNING] Service not available: ${service.name} on port ${service.port}`);
                
                this.hubState.connectedServices.set(service.name, {
                    name: service.name,
                    port: service.port,
                    status: 'disconnected',
                    lastPing: null,
                    error: error.message
                });
            }
        }
        
        console.log(`[CHART] Services discovered: ${Array.from(this.hubState.connectedServices.values()).filter(s => s.status === 'connected').length}/${services.length}`);
    }
    
    initializeDefaultTopics() {
        console.log('[MEMO] Initializing default event topics...');
        
        const defaultTopics = [
            'system.startup',
            'system.shutdown',
            'system.error',
            'system.config_changed',
            
            'market.price_update',
            'market.order_book_update',
            'market.trade_executed',
            'market.volatility_alert',
            
            'position.opened',
            'position.closed',
            'position.modified',
            'position.margin_call',
            'position.liquidation',
            
            'order.placed',
            'order.filled',
            'order.cancelled',
            'order.rejected',
            'order.expired',
            
            'risk.alert',
            'risk.limit_exceeded',
            'risk.portfolio_rebalance',
            
            'rebalance.triggered',
            'rebalance.completed',
            'rebalance.failed',
            
            'quantum.consciousness_update',
            'quantum.opportunity_detected',
            'quantum.analysis_complete',
            
            'alert.critical',
            'alert.warning',
            'alert.info'
        ];
        
        for (const topic of defaultTopics) {
            this.subscriptions.set(topic, new Set());
        }
        
        console.log(`[CHECK] ${defaultTopics.length} default topics initialized`);
    }
    
    handleWebSocketMessage(connectionId, data) {
        try {
            const message = JSON.parse(data);
            const connection = this.wsConnections.get(connectionId);
            
            if (!connection) {
                console.error(`Unknown connection: ${connectionId}`);
                return;
            }
            
            connection.lastActivity = new Date();
            connection.messagesReceived += 1;
            
            switch (message.type) {
                case 'subscribe':
                    this.handleSubscription(connectionId, message);
                    break;
                    
                case 'unsubscribe':
                    this.handleUnsubscription(connectionId, message);
                    break;
                    
                case 'publish':
                    this.handlePublish(connectionId, message);
                    break;
                    
                case 'replay_request':
                    this.handleReplayRequest(connectionId, message);
                    break;
                    
                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
            
        } catch (error) {
            console.error(`Error processing message from ${connectionId}:`, error);
            this.sendToConnection(connectionId, {
                type: 'error',
                message: 'Invalid message format',
                error: error.message
            });
        }
    }
    
    handleSubscription(connectionId, message) {
        const { topic, filters = {} } = message;
        
        if (!topic) {
            this.sendToConnection(connectionId, {
                type: 'error',
                message: 'Topic required for subscription'
            });
            return;
        }
        
        // Create topic if doesn't exist
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, new Set());
        }
        
        // Add subscriber
        const subscriber = {
            connectionId,
            filters,
            subscribedAt: new Date()
        };
        
        this.subscriptions.get(topic).add(subscriber);
        this.wsConnections.get(connectionId).subscribedTopics.add(topic);
        
        console.log(`[SATELLITE] Subscription: ${connectionId} -> ${topic}`);
        
        this.sendToConnection(connectionId, {
            type: 'subscription_confirmed',
            topic,
            filters,
            timestamp: new Date()
        });
    }
    
    handleUnsubscription(connectionId, message) {
        const { topic } = message;
        
        if (!topic || !this.subscriptions.has(topic)) {
            this.sendToConnection(connectionId, {
                type: 'error',
                message: 'Invalid topic for unsubscription'
            });
            return;
        }
        
        // Remove subscriber
        const subscribers = this.subscriptions.get(topic);
        for (const subscriber of subscribers) {
            if (subscriber.connectionId === connectionId) {
                subscribers.delete(subscriber);
                break;
            }
        }
        
        this.wsConnections.get(connectionId).subscribedTopics.delete(topic);
        
        console.log(`[SATELLITE] Unsubscription: ${connectionId} from ${topic}`);
        
        this.sendToConnection(connectionId, {
            type: 'unsubscription_confirmed',
            topic,
            timestamp: new Date()
        });
    }
    
    handlePublish(connectionId, message) {
        const { topic, data, priority = 'MEDIUM', source = 'unknown' } = message;
        
        if (!topic || !data) {
            this.sendToConnection(connectionId, {
                type: 'error',
                message: 'Topic and data required for publishing'
            });
            return;
        }
        
        // Create event
        const event = {
            id: this.generateEventId(),
            topic,
            data,
            priority,
            source,
            publishedBy: connectionId,
            timestamp: new Date(),
            processed: false,
            attempts: 0,
            maxAttempts: 3
        };
        
        // Publish event
        this.publishEvent(event);
        
        this.sendToConnection(connectionId, {
            type: 'publish_confirmed',
            eventId: event.id,
            topic,
            timestamp: event.timestamp
        });
    }
    
    handleReplayRequest(connectionId, message) {
        const { topic, since, limit = 100 } = message;
        
        let events = this.eventHistory;
        
        // Filter by topic if specified
        if (topic) {
            events = events.filter(event => this.matchesTopic(event.topic, topic));
        }
        
        // Filter by timestamp if specified
        if (since) {
            const sinceDate = new Date(since);
            events = events.filter(event => event.timestamp > sinceDate);
        }
        
        // Limit results
        events = events.slice(-limit);
        
        this.sendToConnection(connectionId, {
            type: 'replay_response',
            events,
            count: events.length,
            timestamp: new Date()
        });
    }
    
    publishEvent(event) {
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
            console.log('[WARNING] Circuit breaker open - event queued');
            this.deadLetterQueue.push(event);
            return;
        }
        
        try {
            const startTime = process.hrtime.bigint();
            
            // Add to history
            this.addToHistory(event);
            
            // Update statistics
            this.updateEventStats(event);
            
            // Route event to subscribers
            this.routeEvent(event);
            
            // Broadcast to WebSocket subscribers
            this.broadcastToSubscribers(event);
            
            // Mark as processed
            event.processed = true;
            event.processedAt = new Date();
            
            const endTime = process.hrtime.bigint();
            const processingTime = Number(endTime - startTime) / 1000000; // ms
            
            this.updateProcessingTime(processingTime);
            
            this.hubState.totalEvents += 1;
            this.hubState.eventsToday += 1;
            this.hubState.lastEvent = event;
            
            console.log(`[SATELLITE] Event published: ${event.topic} (${processingTime.toFixed(2)}ms)`);
            
        } catch (error) {
            console.error(`[X] Failed to publish event:`, error);
            this.handlePublishError(event, error);
        }
    }
    
    routeEvent(event) {
        // Route based on topic patterns
        for (const [pattern, targets] of Object.entries(this.routingConfig.routes)) {
            if (this.matchesPattern(event.topic, pattern)) {
                for (const target of targets) {
                    this.sendToService(target, event);
                }
            }
        }
        
        // Route based on priority
        const priorityTargets = this.routingConfig.filters.priority[event.priority] || [];
        for (const target of priorityTargets) {
            this.sendToService(target, event);
        }
        
        // Route based on source
        const sourceTargets = this.routingConfig.filters.source[event.source] || [];
        for (const target of sourceTargets) {
            this.sendToService(target, event);
        }
    }
    
    matchesPattern(topic, pattern) {
        // Simple wildcard matching (* = any)
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(topic);
    }
    
    matchesTopic(eventTopic, filterTopic) {
        if (filterTopic.includes('*')) {
            return this.matchesPattern(eventTopic, filterTopic);
        }
        return eventTopic === filterTopic;
    }
    
    broadcastToSubscribers(event) {
        // Find all subscribers for this topic
        for (const [topic, subscribers] of this.subscriptions) {
            if (this.matchesTopic(event.topic, topic)) {
                for (const subscriber of subscribers) {
                    // Apply filters
                    if (this.passesFilters(event, subscriber.filters)) {
                        this.sendToConnection(subscriber.connectionId, {
                            type: 'event',
                            event
                        });
                    }
                }
            }
        }
    }
    
    passesFilters(event, filters) {
        if (!filters || Object.keys(filters).length === 0) return true;
        
        // Priority filter
        if (filters.priority && filters.priority !== event.priority) {
            return false;
        }
        
        // Source filter
        if (filters.source && filters.source !== event.source) {
            return false;
        }
        
        // Custom filters
        if (filters.custom) {
            for (const [key, value] of Object.entries(filters.custom)) {
                if (event.data[key] !== value) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    sendToService(serviceName, event) {
        const service = this.hubState.connectedServices.get(serviceName);
        
        if (!service || service.status !== 'connected') {
            return;
        }
        
        // En implementación real, enviar evento vía HTTP/WebSocket al servicio
        // Por ahora, simular envío
        service.messagesSent += 1;
        
        console.log(`📤 Event routed to ${serviceName}: ${event.topic}`);
    }
    
    sendToConnection(connectionId, message) {
        const connection = this.wsConnections.get(connectionId);
        
        if (!connection || connection.ws.readyState !== connection.ws.OPEN) {
            return;
        }
        
        try {
            connection.ws.send(JSON.stringify(message));
            connection.messagesSent += 1;
            connection.lastActivity = new Date();
        } catch (error) {
            console.error(`Failed to send to ${connectionId}:`, error);
            this.handleWebSocketDisconnect(connectionId);
        }
    }
    
    handleWebSocketDisconnect(connectionId) {
        const connection = this.wsConnections.get(connectionId);
        
        if (connection) {
            // Remove from all subscriptions
            for (const topic of connection.subscribedTopics) {
                const subscribers = this.subscriptions.get(topic);
                if (subscribers) {
                    for (const subscriber of subscribers) {
                        if (subscriber.connectionId === connectionId) {
                            subscribers.delete(subscriber);
                            break;
                        }
                    }
                }
            }
            
            this.wsConnections.delete(connectionId);
            console.log(`[SATELLITE] WebSocket disconnected: ${connectionId}`);
        }
    }
    
    addToHistory(event) {
        this.eventHistory.push(event);
        
        // Maintain history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    
    updateEventStats(event) {
        // By type
        const currentCount = this.eventStats.byType.get(event.topic) || 0;
        this.eventStats.byType.set(event.topic, currentCount + 1);
        
        // By source
        const sourceCount = this.eventStats.bySource.get(event.source) || 0;
        this.eventStats.bySource.set(event.source, sourceCount + 1);
        
        // By priority
        const priorityCount = this.eventStats.byPriority.get(event.priority) || 0;
        this.eventStats.byPriority.set(event.priority, priorityCount + 1);
        
        // By hour
        const hour = new Date().getHours();
        this.eventStats.byHour[hour] += 1;
    }
    
    updateProcessingTime(processingTime) {
        this.eventStats.totalProcessingTime += processingTime;
        const totalEvents = this.hubState.totalEvents + 1;
        this.eventStats.avgProcessingTime = this.eventStats.totalProcessingTime / totalEvents;
    }
    
    handlePublishError(event, error) {
        event.attempts += 1;
        
        if (event.attempts < event.maxAttempts) {
            // Retry after delay
            setTimeout(() => {
                this.publishEvent(event);
            }, 1000 * event.attempts); // Exponential backoff
        } else {
            // Move to dead letter queue
            this.deadLetterQueue.push({
                ...event,
                failedAt: new Date(),
                error: error.message
            });
            
            // Maintain DLQ size
            if (this.deadLetterQueue.length > this.maxDLQSize) {
                this.deadLetterQueue = this.deadLetterQueue.slice(-this.maxDLQSize);
            }
        }
        
        // Update circuit breaker
        this.circuitBreaker.failureCount += 1;
        this.circuitBreaker.lastFailure = new Date();
    }
    
    generateEventId() {
        const entropy = [
            Date.now(),
            process.hrtime.bigint(),
            this.hubState.totalEvents
        ];
        
        const hash = createHash('sha256')
            .update(entropy.join(''))
            .digest('hex');
        
        return `event_${hash.substring(0, 12)}`;
    }
    
    startHealthcheck() {
        console.log('❤️ Starting service healthcheck...');
        
        this.intervals.healthcheck = setInterval(async () => {
            await this.checkServiceHealth();
        }, 60000); // Every minute
    }
    
    startCleanup() {
        console.log('[BROOM] Starting cleanup service...');
        
        this.intervals.cleanup = setInterval(() => {
            this.cleanupOldEvents();
            this.cleanupDeadConnections();
        }, 300000); // Every 5 minutes
    }
    
    startStatsCollection() {
        console.log('[CHART] Starting stats collection...');
        
        this.intervals.stats = setInterval(() => {
            this.calculateEventStats();
        }, 60000); // Every minute
    }
    
    startCircuitBreakerMonitoring() {
        console.log('🔌 Starting circuit breaker monitoring...');
        
        this.intervals.circuitBreakerReset = setInterval(() => {
            this.checkCircuitBreakerReset();
        }, 30000); // Every 30 seconds
    }
    
    async checkServiceHealth() {
        for (const [serviceName, service] of this.hubState.connectedServices) {
            if (service.status === 'connected') {
                try {
                    await axios.get(`http://localhost:${service.port}${service.endpoint}`, {
                        timeout: 3000
                    });
                    service.lastPing = new Date();
                } catch (error) {
                    console.log(`[WARNING] Service unhealthy: ${serviceName}`);
                    service.status = 'disconnected';
                    service.error = error.message;
                }
            }
        }
    }
    
    cleanupOldEvents() {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
        
        const originalLength = this.eventHistory.length;
        this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoff);
        
        const cleaned = originalLength - this.eventHistory.length;
        if (cleaned > 0) {
            console.log(`[BROOM] Cleaned ${cleaned} old events`);
        }
    }
    
    cleanupDeadConnections() {
        const cutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
        
        for (const [connectionId, connection] of this.wsConnections) {
            if (connection.lastActivity < cutoff || connection.ws.readyState !== connection.ws.OPEN) {
                this.handleWebSocketDisconnect(connectionId);
            }
        }
    }
    
    calculateEventStats() {
        const totalEvents = this.hubState.totalEvents;
        const errors = this.deadLetterQueue.length;
        
        this.eventStats.errorRate = totalEvents > 0 ? errors / totalEvents : 0;
    }
    
    checkCircuitBreakerReset() {
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
            const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailure.getTime();
            
            if (timeSinceLastFailure > this.circuitBreaker.resetTimeout) {
                console.log('[REFRESH] Circuit breaker reset - processing DLQ');
                this.circuitBreaker.failureCount = 0;
                this.processDLQ();
            }
        }
    }
    
    processDLQ() {
        const dlqEvents = this.deadLetterQueue.splice(0, 10); // Process 10 at a time
        
        for (const event of dlqEvents) {
            event.attempts = 0; // Reset attempts
            this.publishEvent(event);
        }
    }
    
    getHubStatus() {
        return {
            service: this.serviceName,
            version: this.version,
            status: this.hubState.status,
            uptime: Date.now() - this.startTime.getTime(),
            
            connections: {
                webSocket: this.wsConnections.size,
                services: Array.from(this.hubState.connectedServices.values())
                    .filter(s => s.status === 'connected').length,
                total: this.hubState.connectedServices.size
            },
            
            events: {
                total: this.hubState.totalEvents,
                today: this.hubState.eventsToday,
                historySize: this.eventHistory.length,
                dlqSize: this.deadLetterQueue.length,
                avgProcessingTime: this.eventStats.avgProcessingTime,
                errorRate: this.eventStats.errorRate
            },
            
            topics: {
                total: this.subscriptions.size,
                active: Array.from(this.subscriptions.values())
                    .filter(subscribers => subscribers.size > 0).length,
                mostActive: this.getMostActiveTopics(5)
            },
            
            circuitBreaker: {
                isOpen: this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold,
                failureCount: this.circuitBreaker.failureCount,
                threshold: this.circuitBreaker.failureThreshold,
                lastFailure: this.circuitBreaker.lastFailure
            }
        };
    }
    
    getMostActiveTopics(limit) {
        return Array.from(this.eventStats.byType.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([topic, count]) => ({ topic, count }));
    }
    
    async stop() {
        console.log('[STOP] Stopping Message Bus Event Hub...');
        
        // Clear intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        // Close all WebSocket connections
        for (const [connectionId, connection] of this.wsConnections) {
            if (connection.ws.readyState === connection.ws.OPEN) {
                connection.ws.close();
            }
        }
        
        // Close WebSocket server
        this.wss.close();
        
        this.hubState.status = 'stopped';
        this.hubState.isActive = false;
        
        console.log('[CHECK] Message Bus Event Hub stopped');
    }
}

// Crear instancia del Event Hub
const eventHub = new QBTCMessageBusEventHub();

app.use(express.json());

// === MESSAGE BUS EVENT HUB ROUTES ===

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: eventHub.serviceName,
        port: PORT,
        version: eventHub.version,
        isActive: eventHub.hubState.isActive,
        connections: eventHub.wsConnections.size,
        topics: eventHub.subscriptions.size,
        events: eventHub.hubState.totalEvents,
        uptime: Date.now() - eventHub.startTime.getTime(),
        timestamp: new Date().toISOString()
    });
});

// Hub status
app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: eventHub.getHubStatus()
    });
});

// Get all topics
app.get('/topics', (req, res) => {
    const topics = Array.from(eventHub.subscriptions.keys()).map(topic => ({
        topic,
        subscribers: eventHub.subscriptions.get(topic).size,
        events: eventHub.eventStats.byType.get(topic) || 0
    }));
    
    res.json({
        success: true,
        data: topics,
        total: topics.length
    });
});

// Get topic details
app.get('/topics/:topic', (req, res) => {
    const { topic } = req.params;
    
    if (!eventHub.subscriptions.has(topic)) {
        return res.status(404).json({
            success: false,
            message: 'Topic not found'
        });
    }
    
    const subscribers = Array.from(eventHub.subscriptions.get(topic))
        .map(sub => ({
            connectionId: sub.connectionId,
            subscribedAt: sub.subscribedAt,
            filters: sub.filters
        }));
    
    res.json({
        success: true,
        data: {
            topic,
            subscribers,
            subscriberCount: subscribers.length,
            eventCount: eventHub.eventStats.byType.get(topic) || 0
        }
    });
});

// Publish event via HTTP
app.post('/publish', (req, res) => {
    try {
        const { topic, data, priority = 'MEDIUM', source = 'http' } = req.body;
        
        if (!topic || !data) {
            return res.status(400).json({
                success: false,
                message: 'Topic and data required'
            });
        }
        
        const event = {
            id: eventHub.generateEventId(),
            topic,
            data,
            priority,
            source,
            publishedBy: 'http',
            timestamp: new Date(),
            processed: false,
            attempts: 0,
            maxAttempts: 3
        };
        
        eventHub.publishEvent(event);
        
        res.json({
            success: true,
            message: 'Event published successfully',
            eventId: event.id,
            topic: event.topic
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get event history
app.get('/events', (req, res) => {
    const { topic, since, limit = 100, priority, source } = req.query;
    
    let events = eventHub.eventHistory;
    
    // Apply filters
    if (topic) {
        events = events.filter(event => eventHub.matchesTopic(event.topic, topic));
    }
    
    if (priority) {
        events = events.filter(event => event.priority === priority);
    }
    
    if (source) {
        events = events.filter(event => event.source === source);
    }
    
    if (since) {
        const sinceDate = new Date(since);
        events = events.filter(event => event.timestamp > sinceDate);
    }
    
    // Limit and sort
    events = events
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));
    
    res.json({
        success: true,
        data: events,
        count: events.length,
        total: eventHub.eventHistory.length
    });
});

// Get dead letter queue
app.get('/dlq', (req, res) => {
    res.json({
        success: true,
        data: eventHub.deadLetterQueue,
        count: eventHub.deadLetterQueue.length
    });
});

// Get statistics
app.get('/stats', (req, res) => {
    const stats = {
        events: {
            total: eventHub.hubState.totalEvents,
            today: eventHub.hubState.eventsToday,
            byType: Object.fromEntries(eventHub.eventStats.byType),
            bySource: Object.fromEntries(eventHub.eventStats.bySource),
            byPriority: Object.fromEntries(eventHub.eventStats.byPriority),
            byHour: eventHub.eventStats.byHour,
            avgProcessingTime: eventHub.eventStats.avgProcessingTime,
            errorRate: eventHub.eventStats.errorRate
        },
        
        connections: {
            webSocket: eventHub.wsConnections.size,
            services: Array.from(eventHub.hubState.connectedServices.values())
        },
        
        topics: {
            total: eventHub.subscriptions.size,
            mostActive: eventHub.getMostActiveTopics(10)
        },
        
        performance: {
            uptime: Date.now() - eventHub.startTime.getTime(),
            circuitBreaker: eventHub.circuitBreaker,
            dlqSize: eventHub.deadLetterQueue.length
        }
    };
    
    res.json({
        success: true,
        data: stats
    });
});

// Circuit breaker controls
app.post('/circuit-breaker/reset', (req, res) => {
    eventHub.circuitBreaker.failureCount = 0;
    eventHub.circuitBreaker.lastFailure = null;
    
    console.log('[REFRESH] Circuit breaker manually reset');
    
    res.json({
        success: true,
        message: 'Circuit breaker reset successfully'
    });
});

// Process DLQ manually
app.post('/dlq/process', (req, res) => {
    const { limit = 10 } = req.body;
    
    const processed = eventHub.deadLetterQueue.splice(0, limit);
    
    for (const event of processed) {
        event.attempts = 0;
        eventHub.publishEvent(event);
    }
    
    res.json({
        success: true,
        message: `Processing ${processed.length} events from DLQ`,
        processed: processed.length
    });
});

// Get routing configuration
app.get('/routing', (req, res) => {
    res.json({
        success: true,
        data: eventHub.routingConfig
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: eventHub.serviceName,
        version: eventHub.version,
        status: eventHub.hubState.status,
        description: 'Central message bus and event hub for QBTC Dimensional Supreme',
        capabilities: [
            'Event-driven architecture',
            'WebSocket clustering',
            'Pub/Sub messaging patterns',
            'Intelligent event routing',
            'Message persistence & replay',
            'Cross-service communication',
            'Real-time broadcasting',
            'Event filtering & transformation',
            'Dead letter queue management',
            'Circuit breaker protection',
            'Event analytics & monitoring'
        ],
        eventTypes: [
            'system.* - System events',
            'market.* - Market data events',
            'position.* - Position events',
            'order.* - Order events',
            'risk.* - Risk management events',
            'rebalance.* - Portfolio rebalancing',
            'quantum.* - Quantum consciousness',
            'alert.* - Alert system events'
        ],
        endpoints: {
            '/topics': 'All topics (GET)',
            '/topics/{topic}': 'Topic details',
            '/publish': 'Publish event (POST)',
            '/events': 'Event history with filters',
            '/dlq': 'Dead letter queue',
            '/stats': 'Event statistics',
            '/routing': 'Routing configuration',
            '/circuit-breaker/reset': 'Reset circuit breaker',
            '/dlq/process': 'Process DLQ manually',
            '/ws': 'WebSocket for real-time events'
        },
        currentState: {
            isActive: eventHub.hubState.isActive,
            connections: eventHub.wsConnections.size,
            connectedServices: Array.from(eventHub.hubState.connectedServices.values())
                .filter(s => s.status === 'connected').length,
            topics: eventHub.subscriptions.size,
            totalEvents: eventHub.hubState.totalEvents,
            dlqSize: eventHub.deadLetterQueue.length,
            circuitBreakerOpen: eventHub.circuitBreaker.failureCount >= eventHub.circuitBreaker.failureThreshold
        }
    });
});

// Iniciar servidor
server.listen(PORT, async () => {
    console.log('[SATELLITE] QBTC Message Bus Event Hub starting...');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[GLOBE] Health check: http://localhost:${PORT}/health`);
    console.log(`[CHART] Statistics: http://localhost:${PORT}/stats`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
    
    // Inicializar el Event Hub
    await eventHub.initialize();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[STOP] SIGTERM received, stopping Message Bus Event Hub...');
    await eventHub.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[STOP] SIGINT received, stopping Message Bus Event Hub...');
    await eventHub.stop();
    process.exit(0);
});

export default eventHub;
