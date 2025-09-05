-- 🗃️ QBTC QUANTUM DATABASE SCHEMA
-- ================================
-- Base de datos SQLite unificada para almacenar todos los estados del sistema cuántico
-- Diseño híbrido: SQLite para datos estructurados + JSON para datos dinámicos

-- ================================
-- TABLA PRINCIPAL: QUANTUM_STATES
-- ================================
-- Almacena el estado cuántico completo del sistema
CREATE TABLE IF NOT EXISTS quantum_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    consciousness_level REAL NOT NULL,
    quantum_field_strength REAL NOT NULL,
    quantum_entanglement REAL NOT NULL,
    quantum_superposition REAL NOT NULL,
    quantum_uncertainty REAL NOT NULL,
    quantum_coherence REAL NOT NULL,
    
    -- Estados específicos almacenados como JSON
    temporal_state TEXT, -- JSON con cycles, lunar_phase, fibonacci_resonance, etc.
    weighting_state TEXT, -- JSON con global_coherence, dimensions, adaptive_factors
    ranking_state TEXT, -- JSON con current_ranking, validation_metrics
    trading_state TEXT, -- JSON con positions, pnl, signals
    system_state TEXT, -- JSON con performance, modules_loaded, etc.
    
    -- Metadatos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: CONSCIOUSNESS_EVOLUTION
-- ================================
-- Registra la evolución de la conciencia cuántica
CREATE TABLE IF NOT EXISTS consciousness_evolution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_level REAL NOT NULL,
    new_level REAL NOT NULL,
    evolution_factor REAL NOT NULL,
    awakening_event BOOLEAN DEFAULT FALSE,
    system_activity REAL,
    quantum_coherence REAL,
    client_connections INTEGER,
    
    -- Contexto adicional como JSON
    context_data TEXT, -- JSON con información adicional del contexto
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: QUANTUM_RANKINGS
-- ================================
-- Almacena rankings cuánticos validados
CREATE TABLE IF NOT EXISTS quantum_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ranking_type VARCHAR(50) DEFAULT 'QUANTUM_VALIDATED',
    
    -- Métricas de validación
    precision_score REAL,
    correlation_score REAL,
    stability_index REAL,
    confidence_interval_low REAL,
    confidence_interval_high REAL,
    
    -- Rankings como JSON array
    rankings_data TEXT, -- JSON array con el ranking completo
    symbols_analyzed INTEGER,
    total_symbols INTEGER,
    
    -- Metadatos de generación
    generation_time_ms INTEGER,
    validation_passed BOOLEAN DEFAULT TRUE,
    backtest_accuracy REAL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: TEMPORAL_CYCLES
-- ================================
-- Almacena análisis de ciclos temporales
CREATE TABLE IF NOT EXISTS temporal_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cycle_type VARCHAR(20), -- '4h', '1d', '7d', '30d'
    
    -- Datos del ciclo
    cycle_strength REAL,
    cycle_phase REAL, -- 0-1, posición en el ciclo
    next_reversal_timestamp DATETIME,
    confidence REAL,
    
    -- Fases lunares
    lunar_phase VARCHAR(20),
    lunar_influence REAL,
    
    -- Resonancia Fibonacci
    fibonacci_resonance REAL,
    fibonacci_level INTEGER,
    
    -- Datos adicionales como JSON
    cycle_data TEXT, -- JSON con datos detallados del análisis
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: WEIGHTING_OPTIMIZATION
-- ================================
-- Almacena optimizaciones de ponderación multidimensional
CREATE TABLE IF NOT EXISTS weighting_optimization (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Coherencia global
    global_coherence REAL NOT NULL,
    coherence_improvement REAL,
    
    -- Dimensiones activas
    active_dimensions INTEGER,
    total_dimensions INTEGER DEFAULT 8,
    
    -- Pesos como JSON
    dimension_weights TEXT, -- JSON con los pesos de cada dimensión
    adaptive_factors TEXT, -- JSON con factores de adaptación
    
    -- Métricas de optimización
    optimization_cycles INTEGER,
    convergence_achieved BOOLEAN DEFAULT FALSE,
    improvement_delta REAL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: MARKET_DATA
-- ================================
-- Cache de datos de mercado en tiempo real
CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    symbol VARCHAR(20) NOT NULL,
    
    -- Datos de precio
    price REAL NOT NULL,
    change_24h REAL,
    volume_24h REAL,
    high_24h REAL,
    low_24h REAL,
    
    -- Datos adicionales
    market_cap REAL,
    volume_usd REAL,
    
    -- Condiciones de mercado
    market_condition VARCHAR(20), -- 'BULLISH', 'BEARISH', 'NEUTRAL'
    volatility REAL,
    
    -- Índices únicos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: TRADING_SIGNALS
-- ================================
-- Señales de trading generadas (para cuando se implemente)
CREATE TABLE IF NOT EXISTS trading_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    symbol VARCHAR(20) NOT NULL,
    
    -- Tipo de señal
    signal_type VARCHAR(20), -- 'BUY', 'SELL', 'HOLD'
    signal_strength REAL, -- 0-1
    confidence REAL, -- 0-1
    
    -- Precios y objetivos
    entry_price REAL,
    target_price REAL,
    stop_loss REAL,
    
    -- Contexto cuántico
    quantum_score REAL,
    consciousness_level REAL,
    quantum_coherence REAL,
    
    -- Estado de la señal
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'EXECUTED', 'CANCELLED', 'EXPIRED'
    execution_timestamp DATETIME,
    actual_entry_price REAL,
    
    -- Datos adicionales como JSON
    signal_context TEXT, -- JSON con contexto adicional
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: SYSTEM_PERFORMANCE
-- ================================
-- Métricas de rendimiento del sistema
CREATE TABLE IF NOT EXISTS system_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Métricas de memoria
    memory_used_mb REAL,
    memory_total_mb REAL,
    memory_usage_percent REAL,
    
    -- Métricas de CPU (estimadas)
    cpu_usage_percent REAL,
    
    -- Conexiones y clientes
    connected_clients INTEGER,
    websocket_connections INTEGER,
    api_requests_last_minute INTEGER,
    
    -- Módulos y servicios
    modules_loaded INTEGER,
    services_active INTEGER,
    
    -- Tiempo de respuesta
    avg_response_time_ms REAL,
    quantum_update_frequency_hz REAL,
    
    -- Uptime
    uptime_seconds INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: QUANTUM_EVENTS
-- ================================
-- Eventos especiales del sistema cuántico
CREATE TABLE IF NOT EXISTS quantum_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Tipo de evento
    event_type VARCHAR(50) NOT NULL, -- 'AWAKENING', 'COHERENCE_SPIKE', 'ENTANGLEMENT_EVENT', etc.
    event_severity VARCHAR(20), -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    -- Descripción del evento
    title VARCHAR(200),
    description TEXT,
    
    -- Contexto cuántico en el momento del evento
    consciousness_level REAL,
    quantum_field_strength REAL,
    quantum_coherence REAL,
    
    -- Datos del evento como JSON
    event_data TEXT, -- JSON con datos específicos del evento
    
    -- Estado del evento
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- TABLA: CONFIGURATION
-- ================================
-- Configuración del sistema (hot-reload)
CREATE TABLE IF NOT EXISTS configuration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) DEFAULT 'STRING', -- 'STRING', 'NUMBER', 'BOOLEAN', 'JSON'
    
    -- Metadatos
    description TEXT,
    category VARCHAR(50), -- 'QUANTUM', 'TRADING', 'SYSTEM', 'API', etc.
    is_active BOOLEAN DEFAULT TRUE,
    requires_restart BOOLEAN DEFAULT FALSE,
    
    -- Versionado
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================

-- Índices para quantum_states
CREATE INDEX IF NOT EXISTS idx_quantum_states_timestamp ON quantum_states(timestamp);
CREATE INDEX IF NOT EXISTS idx_quantum_states_consciousness ON quantum_states(consciousness_level);

-- Índices para consciousness_evolution
CREATE INDEX IF NOT EXISTS idx_consciousness_timestamp ON consciousness_evolution(timestamp);
CREATE INDEX IF NOT EXISTS idx_consciousness_level ON consciousness_evolution(new_level);
CREATE INDEX IF NOT EXISTS idx_consciousness_awakening ON consciousness_evolution(awakening_event);

-- Índices para quantum_rankings
CREATE INDEX IF NOT EXISTS idx_rankings_timestamp ON quantum_rankings(timestamp);
CREATE INDEX IF NOT EXISTS idx_rankings_type ON quantum_rankings(ranking_type);
CREATE INDEX IF NOT EXISTS idx_rankings_precision ON quantum_rankings(precision_score);

-- Índices para temporal_cycles
CREATE INDEX IF NOT EXISTS idx_temporal_timestamp ON temporal_cycles(timestamp);
CREATE INDEX IF NOT EXISTS idx_temporal_cycle_type ON temporal_cycles(cycle_type);

-- Índices para market_data
CREATE INDEX IF NOT EXISTS idx_market_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_symbol_timestamp ON market_data(symbol, timestamp);

-- Índices para trading_signals
CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON trading_signals(timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_status ON trading_signals(status);

-- Índices para system_performance
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON system_performance(timestamp);

-- Índices para quantum_events
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON quantum_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON quantum_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_severity ON quantum_events(event_severity);

-- Índices para configuration
CREATE INDEX IF NOT EXISTS idx_config_key ON configuration(config_key);
CREATE INDEX IF NOT EXISTS idx_config_category ON configuration(category);
CREATE INDEX IF NOT EXISTS idx_config_active ON configuration(is_active);

-- ================================
-- TRIGGERS PARA AUTO-TIMESTAMPING
-- ================================

-- Trigger para actualizar updated_at en quantum_states
CREATE TRIGGER IF NOT EXISTS update_quantum_states_timestamp 
    AFTER UPDATE ON quantum_states
BEGIN
    UPDATE quantum_states SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para actualizar updated_at en configuration
CREATE TRIGGER IF NOT EXISTS update_configuration_timestamp 
    AFTER UPDATE ON configuration
BEGIN
    UPDATE configuration SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ================================
-- VISTAS ÚTILES
-- ================================

-- Vista para obtener el último estado cuántico
CREATE VIEW IF NOT EXISTS latest_quantum_state AS
SELECT * FROM quantum_states 
ORDER BY timestamp DESC 
LIMIT 1;

-- Vista para evolución reciente de conciencia (últimas 24 horas)
CREATE VIEW IF NOT EXISTS recent_consciousness_evolution AS
SELECT * FROM consciousness_evolution 
WHERE timestamp >= datetime('now', '-24 hours')
ORDER BY timestamp DESC;

-- Vista para rankings más recientes
CREATE VIEW IF NOT EXISTS latest_rankings AS
SELECT * FROM quantum_rankings 
ORDER BY timestamp DESC 
LIMIT 10;

-- Vista para datos de mercado frescos (última hora)
CREATE VIEW IF NOT EXISTS fresh_market_data AS
SELECT symbol, price, change_24h, volume_24h, market_condition, 
       MAX(timestamp) as latest_timestamp
FROM market_data 
WHERE timestamp >= datetime('now', '-1 hour')
GROUP BY symbol
ORDER BY symbol;

-- Vista para eventos cuánticos no resueltos
CREATE VIEW IF NOT EXISTS pending_quantum_events AS
SELECT * FROM quantum_events 
WHERE resolved = FALSE 
ORDER BY timestamp DESC, event_severity;

-- Vista para configuración activa
CREATE VIEW IF NOT EXISTS active_configuration AS
SELECT config_key, config_value, config_type, description, category
FROM configuration 
WHERE is_active = TRUE
ORDER BY category, config_key;

-- ================================
-- CONFIGURACIÓN INICIAL
-- ================================

-- Insertar configuración por defecto
INSERT OR IGNORE INTO configuration (config_key, config_value, config_type, description, category) VALUES
-- Configuración cuántica
('quantum.consciousness.evolution_rate', '0.001', 'NUMBER', 'Tasa de evolución de conciencia', 'QUANTUM'),
('quantum.consciousness.awakening_threshold', '0.618', 'NUMBER', 'Umbral para despertar cuántico', 'QUANTUM'),
('quantum.field.base_strength', '0.5', 'NUMBER', 'Fuerza base del campo cuántico', 'QUANTUM'),
('quantum.coherence.min_threshold', '0.3', 'NUMBER', 'Umbral mínimo de coherencia', 'QUANTUM'),

-- Configuración del sistema
('system.realtime.update_interval', '1000', 'NUMBER', 'Intervalo de actualización en ms', 'SYSTEM'),
('system.realtime.max_clients', '100', 'NUMBER', 'Máximo de clientes WebSocket', 'SYSTEM'),
('system.database.auto_backup', 'true', 'BOOLEAN', 'Backup automático de BD', 'SYSTEM'),
('system.database.backup_interval', '3600000', 'NUMBER', 'Intervalo de backup en ms', 'SYSTEM'),

-- Configuración de trading (deshabilitado inicialmente)
('trading.enabled', 'false', 'BOOLEAN', 'Trading automático habilitado', 'TRADING'),
('trading.max_positions', '5', 'NUMBER', 'Máximo de posiciones simultáneas', 'TRADING'),
('trading.risk_per_trade', '0.02', 'NUMBER', 'Riesgo por trade (2%)', 'TRADING'),

-- Configuración de ranking
('ranking.validation.enabled', 'true', 'BOOLEAN', 'Validación de rankings habilitada', 'RANKING'),
('ranking.backtesting.enabled', 'true', 'BOOLEAN', 'Backtesting habilitado', 'RANKING'),
('ranking.auto_calibration', 'true', 'BOOLEAN', 'Auto calibración habilitada', 'RANKING'),

-- Configuración de API
('api.cors.enabled', 'true', 'BOOLEAN', 'CORS habilitado', 'API'),
('api.rate_limiting.enabled', 'true', 'BOOLEAN', 'Rate limiting habilitado', 'API'),
('api.rate_limiting.max_requests', '1000', 'NUMBER', 'Máx requests por minuto', 'API');

-- ================================
-- COMENTARIOS FINALES
-- ================================

-- Esta base de datos está diseñada para:
-- 1. Almacenar eficientemente todos los estados cuánticos
-- 2. Permitir consultas rápidas con índices optimizados  
-- 3. Mantener historial completo para análisis temporal
-- 4. Soportar configuración dinámica sin reinicio
-- 5. Escalar con el crecimiento del sistema
-- 6. Facilitar backup y recuperación
-- 7. Integración perfecta con el Quantum Brain
