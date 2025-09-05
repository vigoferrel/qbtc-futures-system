/**
 * QBTC Quantum API Gateway
 * Puerta de enlace unificada para todos los servicios
 * Maneja 151 componentes con routing inteligente
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

class QBTCAPIGateway {
    constructor(messageBus, config = {}) {
        this.messageBus = messageBus;
        this.config = {
            port: config.port || 14001,
            cors: config.cors || { origin: '*' },
            rateLimit: config.rateLimit || { windowMs: 60000, max: 1000 },
            ...config
        };

        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        // Rutas de servicios por tipo
        this.serviceRoutes = {
            // Core services
            'quantum-data-purifier': '/api/core/data-purifier',
            'llm-quantum-orchestrator-supreme': '/api/core/llm-orchestrator',
            'master-control-hub': '/api/core/master-control',

            // Analysis services
            'binance-real-connector': '/api/analysis/binance',
            'data-ingestion': '/api/analysis/data-ingestion',
            'quantum-analysis-server': '/api/analysis/quantum',

            // Trading services
            'hermetic-auto-trader': '/api/trading/hermetic',
            'ultra-perfect-qbtc-trading-engine': '/api/trading/ultra-perfect',

            // Dimensional services
            'harmonic-triangular-engine': '/api/dimensional/harmonic',

            // Akashic services
            'akashic-prediction-system': '/api/akashic/prediction',

            // Service aggregators
            'consolidated-opportunities-service': '/api/services/opportunities',
            'enhanced-multitimeframe-service': '/api/services/multitimeframe',
            'multidimensional-weighting-service': '/api/services/weighting'
        };

        this.requestMetrics = {
            total: 0,
            byService: {},
            errors: 0,
            avgResponseTime: 0
        };

        this.initialize();
    }

    async initialize() {
        console.log('🔄 Inicializando QBTC API Gateway...');

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocketHandling();

        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, (err) => {
                if (err) reject(err);
                else {
                    console.log(`✅ API Gateway inicializado en puerto ${this.config.port}`);
                    resolve();
                }
            });
        });
    }

    setupMiddleware() {
        // CORS
        this.app.use(cors(this.config.cors));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Logging middleware
        this.app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logRequest(req, res, duration);
            });
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', this.handleHealthCheck.bind(this));

        // Metrics
        this.app.get('/metrics', this.handleMetrics.bind(this));

        // Component registration
        this.app.post('/register', this.handleComponentRegistration.bind(this));

        // Dynamic service routing
        this.app.use('/api/:service/:endpoint*', this.handleServiceRequest.bind(this));

        // WebSocket upgrade handling
        this.app.get('/ws', (req, res) => {
            res.status(426).json({ error: 'WebSocket upgrade required' });
        });

        // 404 handler
        this.app.use('*', this.handleNotFound.bind(this));
    }

    setupWebSocketHandling() {
        this.wss.on('connection', (ws, req) => {
            this.handleWebSocketConnection(ws, req);
        });
    }

    // ========== HANDLERS PRINCIPALES ==========

    handleHealthCheck(req, res) {
        const health = {
            status: 'healthy',
            timestamp: Date.now(),
            uptime: process.uptime(),
            components: this.messageBus.getAllComponents().length,
            connections: this.messageBus.getMetrics().connections,
            version: '1.0.0'
        };

        res.json(health);
    }

    handleMetrics(req, res) {
        const metrics = {
            gateway: this.requestMetrics,
            messageBus: this.messageBus.getMetrics(),
            services: Object.keys(this.requestMetrics.byService).length
        };

        res.json(metrics);
    }

    async handleComponentRegistration(req, res) {
        try {
            const componentInfo = req.body;
            const componentId = await this.messageBus.registerComponent(componentInfo);

            res.json({
                success: true,
                componentId,
                endpoints: this.getComponentEndpoints(componentInfo)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async handleServiceRequest(req, res) {
        const { service, endpoint } = req.params;
        const fullPath = `/${service}/${endpoint}${req.params[0] || ''}`;

        try {
            const result = await this.routeToService(service, {
                method: req.method,
                path: fullPath,
                headers: req.headers,
                body: req.body,
                query: req.query
            });

            res.status(result.status || 200).json(result.data);
        } catch (error) {
            console.error(`Error routing to ${service}:`, error);
            res.status(500).json({ error: error.message });
        }
    }

    handleNotFound(req, res) {
        res.status(404).json({
            error: 'Service not found',
            availableServices: Object.keys(this.serviceRoutes),
            path: req.path
        });
    }

    handleWebSocketConnection(ws, req) {
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                const response = await this.handleWebSocketMessage(message);

                if (response) {
                    ws.send(JSON.stringify(response));
                }
            } catch (error) {
                ws.send(JSON.stringify({ error: error.message }));
            }
        });

        ws.on('close', () => {
            // Cleanup if needed
        });
    }

    // ========== ROUTING Y COMUNICACIÓN ==========

    async routeToService(serviceName, request) {
        // Encontrar componente por nombre
        const component = this.findComponentByName(serviceName);
        if (!component) {
            throw new Error(`Service ${serviceName} not found`);
        }

        // Enviar mensaje al componente
        const response = await this.messageBus.sendMessage(component.id, {
            type: 'api-request',
            method: request.method,
            path: request.path,
            headers: request.headers,
            body: request.body,
            query: request.query
        });

        // Actualizar métricas
        this.updateMetrics(serviceName, request.method);

        return response;
    }

    async handleWebSocketMessage(message) {
        const { service, method, path, data } = message;

        if (!service) {
            return { error: 'Service name required' };
        }

        try {
            const result = await this.routeToService(service, {
                method: method || 'GET',
                path: path || '/',
                body: data,
                headers: {}
            });

            return {
                id: message.id,
                result: result.data,
                status: 'success'
            };
        } catch (error) {
            return {
                id: message.id,
                error: error.message,
                status: 'error'
            };
        }
    }

    findComponentByName(serviceName) {
        const components = this.messageBus.getAllComponents();
        return components.find(comp =>
            comp.name.toLowerCase().includes(serviceName.toLowerCase()) ||
            comp.type === serviceName
        );
    }

    getComponentEndpoints(componentInfo) {
        const endpoints = [];

        // HTTP endpoint
        if (componentInfo.endpoints?.http) {
            endpoints.push({
                type: 'http',
                url: componentInfo.endpoints.http
            });
        }

        // WebSocket endpoint
        if (componentInfo.endpoints?.ws) {
            endpoints.push({
                type: 'websocket',
                url: componentInfo.endpoints.ws
            });
        }

        // API Gateway endpoint
        const route = this.serviceRoutes[componentInfo.name];
        if (route) {
            endpoints.push({
                type: 'gateway',
                url: `http://localhost:${this.config.port}${route}`
            });
        }

        return endpoints;
    }

    // ========== UTILIDADES ==========

    updateMetrics(serviceName, method) {
        this.requestMetrics.total++;

        if (!this.requestMetrics.byService[serviceName]) {
            this.requestMetrics.byService[serviceName] = { total: 0, methods: {} };
        }

        this.requestMetrics.byService[serviceName].total++;
        this.requestMetrics.byService[serviceName].methods[method] =
            (this.requestMetrics.byService[serviceName].methods[method] || 0) + 1;
    }

    logRequest(req, res, duration) {
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }

    // ========== LIFECYCLE ==========

    async shutdown() {
        console.log('🛑 Apagando API Gateway...');

        this.wss.close();
        this.server.close();

        return new Promise(resolve => {
            this.server.on('close', resolve);
        });
    }
}

module.exports = QBTCAPIGateway;