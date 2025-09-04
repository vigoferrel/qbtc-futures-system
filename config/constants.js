/**
 * [OCEAN_WAVE] QBTC Quantum Constants
 * 
 * Constantes matemáticas fundamentales para el análisis cuántico-hermético
 */

export const QUANTUM_CONSTANTS = {
    // Constante de resonancia fundamental
    LAMBDA_7919: Math.log(7919), // 8.977279923499
    
    // Proporción áurea - base de la correspondencia hermética
    PHI_GOLDEN: (1 + Math.sqrt(5)) / 2, // 1.618033988749
    
    // Frecuencia de resonancia base
    RESONANCE_FREQ: 888,
    
    // Umbral de coherencia cuántica
    COHERENCE_THRESHOLD: 0.941,
    
    // Constante de Euler-Mascheroni
    EULER_GAMMA: 0.5772156649015329,
    
    // Secuencia de Fibonacci cuántica
    QUANTUM_FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597],
    
    // Secuencia de números primos para modulación
    PRIME_SEQUENCE: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],
    
    // Variable compleja fundamental z = 9 + 16i
    Z_COMPLEX: {
        REAL: 9,
        IMAG: 16,
        MAGNITUDE: Math.sqrt(9*9 + 16*16) // 18.358
    },
    
    // Timeframes para análisis de correspondencia
    TIMEFRAMES: ['1m', '5m', '15m', '1h', '4h', '1d'],
    
    // Símbolos cuánticos prioritarios - MODO EXTREMO (77 símbolos)
    QUANTUM_SYMBOLS: [
        // TIER 1: Top cryptocurrencies (3)
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
        
        // TIER 2: Major altcoins (12)
        'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 
        'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
        'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT',
        
        // TIER 3: Popular altcoins (20)
        'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT',
        'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'FTMUSDT',
        'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
        'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT',
        'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT',
        
        // TIER 4: Emerging tokens (14)
        'APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT',
        'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT',
        'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 
        'WIFUSDT', 'BONKUSDT', '1000SATSUSDT',
        
        // TIER 5: DeFi & Specialized (16)
        'CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT',
        'BATUSDT', 'ZRXUSDT', 'RENUSDT', 'STORJUSDT',
        'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT',
        'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT',
        
        // TIER 6: Metaverse & Gaming (12)
        'APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT',
        'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT',
        'TLMUSDT', 'ALPACAUSDT', 'YGGUSDT', 'GHSTUSDT'
    ],
    
    // Métricas cuánticas de la matriz 6x8
    QUANTUM_METRICS: [
        'Coherencia', 'Entrelazamiento', 'Momentum', 'Densidad', 
        'Temperatura', 'Probabilidad', 'Oportunidad', 'Sensibilidad'
    ],
    
    // Principios herméticos
    HERMETIC_PRINCIPLES: {
        CORRESPONDENCE: 'Como es arriba, es abajo',
        VIBRATION: 'Todo vibra, nada está en reposo',
        POLARITY: 'Todo es dual, todo tiene su par de opuestos',
        RHYTHM: 'Todo fluye y refluye, todo tiene sus períodos',
        CAUSATION: 'Toda causa tiene su efecto, todo efecto tiene su causa',
        GENDER: 'El género existe en todo, todo tiene sus principios masculino y femenino',
        MENTALISM: 'El universo es mental, sostenido en la mente del TODO'
    }
};

// Configuración específica para análisis
export const ANALYSIS_CONFIG = {
    // Intervalos de actualización
    DATA_REFRESH_INTERVAL: 30000,      // 30 segundos
    MATRIX_UPDATE_INTERVAL: 60000,     // 1 minuto
    CORRELATION_INTERVAL: 120000,      // 2 minutos
    
    // Thresholds de calidad
    MIN_COHERENCE: 0.6,
    MIN_SIGNAL_STRENGTH: 0.7,
    MIN_CONFIDENCE: 0.65,
    
    // Configuración de la matriz cuántica
    MATRIX_SIZE: { rows: 6, cols: 8 },
    
    // Configuración de correspondencia hermética
    CORRESPONDENCE_WEIGHTS: {
        momentum: 1 / QUANTUM_CONSTANTS.PHI_GOLDEN,
        extremes: 1 / (QUANTUM_CONSTANTS.PHI_GOLDEN ** 2),
        volume: 1 / (QUANTUM_CONSTANTS.PHI_GOLDEN ** 3),
        frequency: 1 / (QUANTUM_CONSTANTS.PHI_GOLDEN ** 4)
    }
};

// Configuración específica para ejecución en futuros
export const EXECUTION_CONFIG = {
    // Límites de riesgo
    MAX_POSITIONS: 8,
    MAX_LEVERAGE: 10,
    MAX_RISK_PER_TRADE: 0.02,          // 2% por trade
    MAX_PORTFOLIO_RISK: 0.15,          // 15% portfolio total
    MAX_DRAWDOWN: 0.20,                // 20% drawdown máximo
    
    // Configuración de órdenes
    ORDER_TYPES: ['MARKET', 'LIMIT', 'STOP_MARKET'],
    DEFAULT_ORDER_TYPE: 'MARKET',
    
    // Gestión de capital
    POSITION_SIZING: {
        method: 'KELLY_QUANTUM',        // Kelly modificado con factores cuánticos
        base_fraction: 0.25,            // 25% base
        quantum_modifier: true          // Aplicar modificadores cuánticos
    },
    
    // Configuración de stop loss cuántico
    STOP_LOSS: {
        method: 'QUANTUM_ATR',
        atr_multiplier: 2.0,
        lambda_adjustment: true,
        consciousness_factor: true,
        fibonacci_levels: true
    },
    
    // Intervalos de ejecución
    SIGNAL_CHECK_INTERVAL: 15000,      // 15 segundos
    RISK_CHECK_INTERVAL: 10000,        // 10 segundos
    POSITION_UPDATE_INTERVAL: 5000     // 5 segundos
};

// URLs y endpoints
export const ENDPOINTS = {
    BINANCE: {
        REST: 'https://fapi.binance.com',
        WEBSOCKET: 'wss://fstream.binance.com/ws',
        TESTNET_REST: 'https://testnet.binancefuture.com',
        TESTNET_WS: 'wss://stream.binancefuture.com/ws'
    },
    
    ANALYSIS_ENGINE: 'http://localhost:4001',
    EXECUTION_ENGINE: 'http://localhost:4002'
};

export default {
    QUANTUM_CONSTANTS,
    ANALYSIS_CONFIG,
    EXECUTION_CONFIG,
    ENDPOINTS
};
