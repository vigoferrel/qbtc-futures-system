/**
 * QBTC Quantum Message Bus Central
 * Sistema de comunicación unificado para 151 componentes enterprise
 * Arquitectura event-driven con soporte multi-protocolo
 */

const EventEmitter = require('events');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');

class QBTCMessageBus extends EventEmitter {
    constructor(config = {}) {
        super();

        this.config = {
            port: config.port || 14000,
            maxConnections: config.maxConnections || 1000,
            heartbeatInterval: config.heartbeatInterval || 30000,
            messageTimeout: config.messageTimeout || 5000,
            ...config
        };

        // Componentes registrados
        this.components = new Map();
        this.componentStates = new Map();
        this.messageQueue = new Map();

        // Conexiones activas
        this.wsServer = null;
        this.httpServer = null;
        this.activeConnections = new Set();

        // Métricas y monitoreo
        this.metrics = {
            messagesProcessed: 0,
            componentsRegistered: 0,
            connectionsActive: 0,
            errorsCount: 0,
            uptime: Date.now()
        };

        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 Inicializando QBTC Message Bus Central...');

            // Inicializar servidores
            await this.initializeServers();

            // Configurar manejadores de eventos
            this.setupEventHandlers();

            // Iniciar heartbeat
            this.startHeartbeat();

            console.log(`✅ Message Bus inicializado en puerto ${this.config.port}`);
            this.emit('bus-ready', { timestamp: Date.now(), components: this.components.size });

        } catch (error) {
            console.error('❌ Error inicializando Message Bus:', error);
            this.emit('bus-error', error);
        }
    }

    async initializeServers() {
        // Servidor HTTP para REST API
        this.httpServer = http.createServer((req, res) => {
            this.handleHttpRequest(req, res);
        });

        // Servidor WebSocket para comunicación real-time
        this.wsServer = new WebSocket.Server({ server: this.httpServer });

        this.wsServer.on('connection', (ws, req) => {
            this.handleWebSocketConnection(ws, req);
        });

        return new Promise((resolve, reject) => {
            this.httpServer.listen(this.config.port, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    setupEventHandlers() {
        // Manejadores internos del bus
        this.on('component-register', (data) => this.onComponentRegister(data));
        this.on('component-unregister', (data) => this.onComponentUnregister(data));
        this.on('message-route', (data) => this.onMessageRoute(data));
        this.on('state-update', (data) => this.onStateUpdate(data));
    }

    // ========== REGISTRO DE COMPONENTES ==========

    async registerComponent(componentInfo) {
        const componentId = componentInfo.id || crypto.randomUUID();

        const component = {
            id: componentId,
            name: componentInfo.name,
            type: componentInfo.type,
            version: componentInfo.version || '1.0.0',
            endpoints: componentInfo.endpoints || [],
            capabilities: componentInfo.capabilities || [],
            dependencies: componentInfo.dependencies || [],
            registeredAt: Date.now(),
            lastHeartbeat: Date.now(),
            status: 'active',
            metadata: componentInfo.metadata || {}
        };

        this.components.set(componentId, component);
        this.componentStates.set(componentId, { status: 'initializing' });

        this.metrics.componentsRegistered++;

        console.log(`📝 Componente registrado: ${component.name} (${componentId})`);

        this.emit('component-registered', component);
        this.broadcastMessage({ type: 'component-joined', component });

        return componentId;
    }

    unregisterComponent(componentId) {
        if (this.components.has(componentId)) {
            const component = this.components.get(componentId);
            this.components.delete(componentId);
            this.componentStates.delete(componentId);

            console.log(`📤 Componente removido: ${component.name} (${componentId})`);

            this.emit('component-unregistered', component);
            this.broadcastMessage({ type: 'component-left', component: { id: componentId, name: component.name } });
        }
    }

    // ========== COMUNICACIÓN ==========

    async sendMessage(targetId, message, options = {}) {
        const messageId = crypto.randomUUID();

        const envelope = {
            id: messageId,
            from: 'message-bus',
            to: targetId,
            type: message.type || 'direct',
            payload: message,
            timestamp: Date.now(),
            ttl: options.ttl || this.config.messageTimeout,
            priority: options.priority || 'normal'
        };

        // Intentar entrega directa primero
        if (this.components.has(targetId)) {
            return await this.deliverDirect(envelope);
        }

        // Si no está conectado, encolar para reintento
        this.queueMessage(envelope);
        return { queued: true, messageId };
    }

    async broadcastMessage(message, filter = null) {
        const envelope = {
            id: crypto.randomUUID(),
            from: 'message-bus',
            to: 'broadcast',
            type: 'broadcast',
            payload: message,
            timestamp: Date.now(),
            filter: filter
        };

        let delivered = 0;
        for (const [componentId, component] of this.components) {
            if (!filter || this.matchesFilter(component, filter)) {
                try {
                    await this.deliverDirect({ ...envelope, to: componentId });
                    delivered++;
                } catch (error) {
                    console.warn(`Error broadcasting to ${component.name}:`, error);
                }
            }
        }

        return { delivered, total: this.components.size };
    }

    async deliverDirect(envelope) {
        const targetComponent = this.components.get(envelope.to);
        if (!targetComponent) {
            throw new Error(`Component ${envelope.to} not found`);
        }

        // Intentar entrega por WebSocket si está conectado
        const wsConnection = this.findWebSocketConnection(envelope.to);
        if (wsConnection) {
            wsConnection.send(JSON.stringify(envelope));
            this.metrics.messagesProcessed++;
            return { delivered: true, method: 'websocket' };
        }

        // Intentar entrega por HTTP
        if (targetComponent.endpoints.http) {
            return await this.deliverHttp(envelope);
        }

        throw new Error(`No delivery method available for component ${envelope.to}`);
    }

    async deliverHttp(envelope) {
        const targetComponent = this.components.get(envelope.to);
        const endpoint = targetComponent.endpoints.http;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(envelope)
            });

            if (response.ok) {
                this.metrics.messagesProcessed++;
                return { delivered: true, method: 'http' };
            } else {
                throw new Error(`HTTP delivery failed: ${response.status}`);
            }
        } catch (error) {
            throw new Error(`HTTP delivery error: ${error.message}`);
        }
    }

    // ========== MANEJO DE CONEXIONES ==========

    handleWebSocketConnection(ws, req) {
        const connectionId = crypto.randomUUID();
        this.activeConnections.add(connectionId);

        ws.connectionId = connectionId;
        this.metrics.connectionsActive++;

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleIncomingMessage(ws, message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            this.activeConnections.delete(connectionId);
            this.metrics.connectionsActive--;
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.metrics.errorsCount++;
        });

        // Enviar confirmación de conexión
        ws.send(JSON.stringify({
            type: 'connection-established',
            connectionId,
            timestamp: Date.now()
        }));
    }

    handleHttpRequest(req, res) {
        if (req.method === 'POST' && req.url === '/message') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const message = JSON.parse(body);
                    this.handleIncomingMessage(null, message);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'received' }));
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    }

    handleIncomingMessage(connection, message) {
        // Registrar componente si es un mensaje de registro
        if (message.type === 'register') {
            this.registerComponent(message.payload);
            return;
        }

        // Procesar mensaje normal
        this.emit('message-received', { connection, message });

        // Enrutar mensaje
        if (message.to) {
            this.routeMessage(message);
        }
    }

    // ========== UTILIDADES ==========

    findWebSocketConnection(componentId) {
        for (const ws of this.wsServer.clients) {
            if (ws.componentId === componentId) {
                return ws;
            }
        }
        return null;
    }

    matchesFilter(component, filter) {
        if (typeof filter === 'function') {
            return filter(component);
        }

        if (typeof filter === 'string') {
            return component.type === filter || component.name.includes(filter);
        }

        if (Array.isArray(filter)) {
            return filter.includes(component.type) || filter.includes(component.name);
        }

        return true;
    }

    queueMessage(envelope) {
        if (!this.messageQueue.has(envelope.to)) {
            this.messageQueue.set(envelope.to, []);
        }
        this.messageQueue.get(envelope.to).push(envelope);
    }

    startHeartbeat() {
        setInterval(() => {
            this.broadcastMessage({
                type: 'heartbeat',
                timestamp: Date.now(),
                busMetrics: this.metrics
            });
        }, this.config.heartbeatInterval);
    }

    // ========== API PÚBLICA ==========

    getComponent(componentId) {
        return this.components.get(componentId);
    }

    getAllComponents() {
        return Array.from(this.components.values());
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.metrics.uptime,
            components: this.components.size,
            connections: this.activeConnections.size
        };
    }

    async shutdown() {
        console.log('🛑 Apagando Message Bus...');

        // Notificar a todos los componentes
        await this.broadcastMessage({ type: 'bus-shutdown' });

        // Cerrar conexiones
        if (this.wsServer) {
            this.wsServer.close();
        }

        if (this.httpServer) {
            this.httpServer.close();
        }

        this.emit('bus-shutdown');
    }
}

module.exports = QBTCMessageBus;