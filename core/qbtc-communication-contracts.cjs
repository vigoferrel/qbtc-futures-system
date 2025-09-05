/**
 * QBTC Quantum Communication Contracts
 * Contratos estandarizados para 151 componentes
 * Define interfaces, formatos y protocolos de comunicación
 */

class QBTCCommunicationContracts {
    constructor() {
        // Initialize contracts
        this.contracts = {};
        this.contracts.messageFormats = this.defineMessageFormats();
        this.contracts.apiEndpoints = this.defineAPIEndpoints();
        this.contracts.eventTypes = this.defineEventTypes();
        this.contracts.stateSchemas = this.defineStateSchemas();
        this.contracts.errorCodes = this.defineErrorCodes();
        this.contracts.authTokens = this.defineAuthTokens();
    }

    // ========== FORMATOS DE MENSAJE ==========

    defineMessageFormats() {
        // Define base message format
        const baseMessage = {
            id: 'string',           // UUID único
            from: 'string',         // ID del componente emisor
            to: 'string',           // ID del componente receptor o 'broadcast'
            type: 'string',         // Tipo de mensaje
            payload: 'object',      // Datos del mensaje
            timestamp: 'number',    // Timestamp Unix
            ttl: 'number',          // Time to live en ms (opcional)
            priority: 'string',     // 'low', 'normal', 'high', 'critical'
            correlationId: 'string', // Para correlacionar request/response
            metadata: 'object'      // Metadatos adicionales
        };

        return {
            // Mensaje estándar
            standard: baseMessage,

            // Mensaje de comando
            command: {
                ...baseMessage,
                command: 'string',      // Nombre del comando
                parameters: 'object',   // Parámetros del comando
                timeout: 'number'       // Timeout esperado
            },

            // Mensaje de evento
            event: {
                ...baseMessage,
                eventType: 'string',    // Tipo específico de evento
                eventData: 'object',    // Datos del evento
                severity: 'string'      // 'info', 'warning', 'error', 'critical'
            },

            // Mensaje de estado
            state: {
                ...baseMessage,
                stateType: 'string',    // 'update', 'sync', 'query'
                stateData: 'object',    // Datos de estado
                version: 'number'       // Versión del estado
            }
        };
    }

    // ========== ENDPOINTS API ==========

    defineAPIEndpoints() {
        return {
            // Core services
            core: {
                'quantum-data-purifier': {
                    base: '/api/core/data-purifier',
                    endpoints: {
                        purify: 'POST /purify',
                        validate: 'POST /validate',
                        metrics: 'GET /metrics'
                    }
                },
                'llm-quantum-orchestrator-supreme': {
                    base: '/api/core/llm-orchestrator',
                    endpoints: {
                        orchestrate: 'POST /orchestrate',
                        status: 'GET /status',
                        history: 'GET /history'
                    }
                },
                'master-control-hub': {
                    base: '/api/core/master-control',
                    endpoints: {
                        execute: 'POST /execute',
                        monitor: 'GET /monitor',
                        emergency: 'POST /emergency'
                    }
                }
            },

            // Analysis services
            analysis: {
                'binance-real-connector': {
                    base: '/api/analysis/binance',
                    endpoints: {
                        connect: 'POST /connect',
                        prices: 'GET /prices',
                        orders: 'POST /orders'
                    }
                },
                'data-ingestion': {
                    base: '/api/analysis/data-ingestion',
                    endpoints: {
                        ingest: 'POST /ingest',
                        status: 'GET /status',
                        streams: 'GET /streams'
                    }
                }
            },

            // Trading services
            trading: {
                'hermetic-auto-trader': {
                    base: '/api/trading/hermetic',
                    endpoints: {
                        start: 'POST /start',
                        stop: 'POST /stop',
                        status: 'GET /status',
                        positions: 'GET /positions'
                    }
                }
            },

            // WebSocket endpoints
            websocket: {
                realtime: '/ws/realtime',
                trading: '/ws/trading',
                analysis: '/ws/analysis'
            }
        };
    }

    // ========== TIPOS DE EVENTO ==========

    defineEventTypes() {
        return {
            // Eventos del sistema
            system: {
                'system-startup': 'Sistema iniciado',
                'system-shutdown': 'Sistema apagado',
                'component-registered': 'Componente registrado',
                'component-unregistered': 'Componente removido',
                'health-check': 'Verificación de salud'
            },

            // Eventos de trading
            trading: {
                'trade-executed': 'Trade ejecutado',
                'position-opened': 'Posición abierta',
                'position-closed': 'Posición cerrada',
                'order-placed': 'Orden colocada',
                'order-filled': 'Orden completada',
                'order-cancelled': 'Orden cancelada'
            },

            // Eventos de análisis
            analysis: {
                'market-data-received': 'Datos de mercado recibidos',
                'signal-generated': 'Señal generada',
                'prediction-made': 'Predicción realizada',
                'analysis-complete': 'Análisis completado'
            },

            // Eventos de estado
            state: {
                'state-updated': 'Estado actualizado',
                'state-synced': 'Estado sincronizado',
                'state-conflict': 'Conflicto de estado',
                'state-recovered': 'Estado recuperado'
            },

            // Eventos de error
            error: {
                'error-occurred': 'Error ocurrido',
                'error-recovered': 'Error recuperado',
                'service-down': 'Servicio caído',
                'service-recovered': 'Servicio recuperado'
            }
        };
    }

    // ========== ESQUEMAS DE ESTADO ==========

    defineStateSchemas() {
        // Define base component schema
        const baseComponent = {
            id: { type: 'string', required: true },
            name: { type: 'string', required: true },
            status: { type: 'string', required: true, enum: ['initializing', 'active', 'inactive', 'error'] },
            timestamp: { type: 'number', required: true },
            version: { type: 'string', required: true },
            metadata: { type: 'object' }
        };

        return {
            // Estado base de componente
            component: baseComponent,

            // Estado de trading
            trading: {
                ...baseComponent,
                positions: { type: 'array' },
                balance: { type: 'object' },
                activeOrders: { type: 'array' },
                pnl: { type: 'object' },
                riskMetrics: { type: 'object' }
            },

            // Estado de análisis
            analysis: {
                ...baseComponent,
                activeStreams: { type: 'array' },
                lastAnalysis: { type: 'object' },
                predictions: { type: 'array' },
                accuracy: { type: 'number' }
            },

            // Estado del sistema
            system: {
                components: { type: 'object' },
                health: { type: 'object' },
                metrics: { type: 'object' },
                alerts: { type: 'array' }
            }
        };
    }

    // ========== CÓDIGOS DE ERROR ==========

    defineErrorCodes() {
        return {
            // Errores generales
            GENERAL: {
                'UNKNOWN_ERROR': { code: 'GENERAL_001', message: 'Error desconocido' },
                'INVALID_REQUEST': { code: 'GENERAL_002', message: 'Solicitud inválida' },
                'TIMEOUT': { code: 'GENERAL_003', message: 'Timeout excedido' },
                'SERVICE_UNAVAILABLE': { code: 'GENERAL_004', message: 'Servicio no disponible' }
            },

            // Errores de comunicación
            COMMUNICATION: {
                'CONNECTION_FAILED': { code: 'COMM_001', message: 'Fallo de conexión' },
                'MESSAGE_FORMAT_ERROR': { code: 'COMM_002', message: 'Formato de mensaje inválido' },
                'ROUTING_ERROR': { code: 'COMM_003', message: 'Error de enrutamiento' },
                'PROTOCOL_ERROR': { code: 'COMM_004', message: 'Error de protocolo' }
            },

            // Errores de trading
            TRADING: {
                'INSUFFICIENT_BALANCE': { code: 'TRADING_001', message: 'Balance insuficiente' },
                'ORDER_REJECTED': { code: 'TRADING_002', message: 'Orden rechazada' },
                'MARKET_CLOSED': { code: 'TRADING_003', message: 'Mercado cerrado' },
                'RISK_LIMIT_EXCEEDED': { code: 'TRADING_004', message: 'Límite de riesgo excedido' }
            },

            // Errores de análisis
            ANALYSIS: {
                'DATA_UNAVAILABLE': { code: 'ANALYSIS_001', message: 'Datos no disponibles' },
                'CALCULATION_ERROR': { code: 'ANALYSIS_002', message: 'Error de cálculo' },
                'MODEL_ERROR': { code: 'ANALYSIS_003', message: 'Error de modelo' }
            }
        };
    }

    // ========== TOKENS DE AUTENTICACIÓN ==========

    defineAuthTokens() {
        return {
            // Niveles de acceso
            levels: {
                'read': 'Lectura básica',
                'write': 'Escritura y modificación',
                'admin': 'Acceso administrativo completo',
                'system': 'Acceso a nivel de sistema'
            },

            // Permisos por componente
            permissions: {
                'core': ['read', 'write', 'admin'],
                'trading': ['read', 'write'],
                'analysis': ['read', 'write'],
                'frontend': ['read']
            },

            // Token structure
            structure: {
                id: 'string',           // Token ID
                component: 'string',    // Componente que emite
                permissions: 'array',   // Permisos otorgados
                expires: 'number',      // Timestamp de expiración
                signature: 'string'     // Firma digital
            }
        };
    }

    // ========== MÉTODOS DE VALIDACIÓN ==========

    validateMessage(message, type = 'standard') {
        const schema = this.contracts.messageFormats[type];
        if (!schema) {
            throw new Error(`Unknown message type: ${type}`);
        }

        const errors = [];

        for (const [field, expectedType] of Object.entries(schema)) {
            if (expectedType === 'required' && !(field in message)) {
                errors.push(`Missing required field: ${field}`);
            } else if (field in message && typeof message[field] !== expectedType) {
                errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${typeof message[field]}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Message validation failed: ${errors.join(', ')}`);
        }

        return true;
    }

    validateEndpoint(service, endpoint) {
        if (!this.contracts || !this.contracts.apiEndpoints) {
            // Skip validation if contracts not initialized
            return true;
        }

        const serviceConfig = this.contracts.apiEndpoints[service];
        if (!serviceConfig) {
            throw new Error(`Unknown service: ${service}`);
        }

        if (!serviceConfig.endpoints[endpoint]) {
            throw new Error(`Unknown endpoint: ${endpoint} for service ${service}`);
        }

        return serviceConfig.endpoints[endpoint];
    }

    validateEventType(eventType) {
        const allEvents = Object.values(this.contracts.eventTypes).flatMap(category =>
            Object.keys(category)
        );

        if (!allEvents.includes(eventType)) {
            throw new Error(`Unknown event type: ${eventType}`);
        }

        return true;
    }

    validateState(state, schemaType) {
        const schema = this.contracts.stateSchemas[schemaType];
        if (!schema) {
            throw new Error(`Unknown state schema: ${schemaType}`);
        }

        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            if (rules.required && !(field in state)) {
                errors.push(`Missing required field: ${field}`);
            } else if (field in state) {
                if (rules.type && typeof state[field] !== rules.type) {
                    errors.push(`Invalid type for ${field}: expected ${rules.type}`);
                }
                if (rules.enum && !rules.enum.includes(state[field])) {
                    errors.push(`Invalid value for ${field}: must be one of ${rules.enum.join(', ')}`);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(`State validation failed: ${errors.join(', ')}`);
        }

        return true;
    }

    // ========== UTILIDADES ==========

    createMessage(from, to, type, payload, options = {}) {
        return {
            id: require('crypto').randomUUID(),
            from,
            to,
            type,
            payload,
            timestamp: Date.now(),
            priority: options.priority || 'normal',
            correlationId: options.correlationId,
            metadata: options.metadata || {}
        };
    }

    createErrorResponse(errorCode, details = {}) {
        const errorCategory = errorCode.split('_')[0];
        const errorInfo = this.contracts.errorCodes[errorCategory]?.[errorCode];

        return {
            success: false,
            error: {
                code: errorInfo?.code || errorCode,
                message: errorInfo?.message || 'Unknown error',
                details,
                timestamp: Date.now()
            }
        };
    }

    createSuccessResponse(data, metadata = {}) {
        return {
            success: true,
            data,
            metadata: {
                timestamp: Date.now(),
                ...metadata
            }
        };
    }

    // ========== GETTERS ==========

    getMessageFormat(type) {
        return this.contracts.messageFormats[type] || this.contracts.messageFormats.standard;
    }

    getAPIEndpoint(service, endpoint) {
        return this.contracts.apiEndpoints[service]?.endpoints[endpoint];
    }

    getEventDescription(eventType) {
        for (const category of Object.values(this.contracts.eventTypes)) {
            if (category[eventType]) {
                return category[eventType];
            }
        }
        return 'Unknown event';
    }

    getStateSchema(schemaType) {
        return this.contracts.stateSchemas[schemaType];
    }

    getErrorInfo(errorCode) {
        const category = errorCode.split('_')[0];
        return this.contracts.errorCodes[category]?.[errorCode];
    }
}

module.exports = QBTCCommunicationContracts;