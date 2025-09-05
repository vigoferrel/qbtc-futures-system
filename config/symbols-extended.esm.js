/**
 * [TARGET] EXTENDED SYMBOLS CONFIGURATION
 * Lista extendida de símbolos de futuros de Binance para máxima cobertura
 * 
 * Organizada por categorías para optimización cuántica
 */

// [TROPHY] TIER 1: Top cryptocurrencies (Alta liquidez, volumen máximo)
export const TIER1_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT'
];

// 🥈 TIER 2: Major altcoins (Alta liquidez, gran volumen)
export const TIER2_SYMBOLS = [
    'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 
    'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
    'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT'
];

// 🥉 TIER 3: Popular altcoins (Buena liquidez, volumen medio-alto)
export const TIER3_SYMBOLS = [
    'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT',
    'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'FTMUSDT',
    'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
    'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT',
    'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT'
];

// [ROCKET] TIER 4: Emerging tokens (Volatilidad alta, oportunidades especiales)
export const TIER4_SYMBOLS = [
    'APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT',
    'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT',
    'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 
    'WIFUSDT', 'BONKUSDT', '1000SATSUSDT'
];

// [DIAMOND] TIER 5: DeFi & Specialized (Nicho pero rentable)
export const TIER5_SYMBOLS = [
    'CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT',
    'BATUSDT', 'ZRXUSDT', 'RENUSDT', 'STORJUSDT',
    'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT',
    'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT'
];

// [OCEAN_WAVE] TIER 6: Metaverse & Gaming (Alta volatilidad en tendencias)
export const TIER6_SYMBOLS = [
    'APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT',
    'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT',
    'TLMUSDT', 'ALPACAUSDT', 'YGGUSDT', 'GHSTUSDT'
];

// [LIGHTNING] CONFIGURACIONES CUÁNTICAS POR TIER
export const QUANTUM_TIER_CONFIG = {
    TIER1: {
        leverage_multiplier: 1.0,        // Leverage estándar
        signal_weight: 1.0,              // Peso máximo en señales
        entropy_sensitivity: 1.0,        // Sensibilidad estándar
        min_coherence: 0.7,              // Alta coherencia requerida
        quantum_priority: 10             // Máxima prioridad
    },
    TIER2: {
        leverage_multiplier: 1.1,        // 10% más leverage
        signal_weight: 0.9,              
        entropy_sensitivity: 1.1,        
        min_coherence: 0.65,            
        quantum_priority: 8              
    },
    TIER3: {
        leverage_multiplier: 1.2,        // 20% más leverage
        signal_weight: 0.8,              
        entropy_sensitivity: 1.2,        
        min_coherence: 0.6,             
        quantum_priority: 6              
    },
    TIER4: {
        leverage_multiplier: 1.3,        // 30% más leverage (alta volatilidad)
        signal_weight: 0.7,              
        entropy_sensitivity: 1.4,        
        min_coherence: 0.55,            
        quantum_priority: 4              
    },
    TIER5: {
        leverage_multiplier: 1.1,        
        signal_weight: 0.6,              
        entropy_sensitivity: 1.3,        
        min_coherence: 0.5,             
        quantum_priority: 3              
    },
    TIER6: {
        leverage_multiplier: 1.4,        // Máximo leverage (alta volatilidad)
        signal_weight: 0.5,              
        entropy_sensitivity: 1.5,        
        min_coherence: 0.45,            
        quantum_priority: 2              
    }
};

// [FIRE] CONFIGURACIONES DE TRADING POR MODALIDAD
export const TRADING_MODES = {
    // Modo conservador (solo TIER 1-2)
    CONSERVATIVE: {
        symbols: [...TIER1_SYMBOLS, ...TIER2_SYMBOLS],
        max_positions: 6,
        risk_per_trade: 0.02,
        leverage_limit: 15
    },
    
    // Modo balanceado (TIER 1-3)
    BALANCED: {
        symbols: [...TIER1_SYMBOLS, ...TIER2_SYMBOLS, ...TIER3_SYMBOLS],
        max_positions: 10,
        risk_per_trade: 0.025,
        leverage_limit: 20
    },
    
    // Modo agresivo (TIER 1-4)
    AGGRESSIVE: {
        symbols: [...TIER1_SYMBOLS, ...TIER2_SYMBOLS, ...TIER3_SYMBOLS, ...TIER4_SYMBOLS],
        max_positions: 15,
        risk_per_trade: 0.035,
        leverage_limit: 25
    },
    
    // Modo extremo (todos los tiers)
    EXTREME: {
        symbols: [
            ...TIER1_SYMBOLS, ...TIER2_SYMBOLS, ...TIER3_SYMBOLS, 
            ...TIER4_SYMBOLS, ...TIER5_SYMBOLS, ...TIER6_SYMBOLS
        ],
        max_positions: 20,
        risk_per_trade: 0.05,
        leverage_limit: 30
    }
};

// [TARGET] SÍMBOLOS TOTALES DISPONIBLES
export const ALL_SYMBOLS = [
    ...TIER1_SYMBOLS,    // 3 símbolos
    ...TIER2_SYMBOLS,    // 12 símbolos  
    ...TIER3_SYMBOLS,    // 20 símbolos
    ...TIER4_SYMBOLS,    // 14 símbolos
    ...TIER5_SYMBOLS,    // 16 símbolos
    ...TIER6_SYMBOLS     // 12 símbolos
    // TOTAL: 77 símbolos
];

// [STAR] SÍMBOLOS RECOMENDADOS POR DEFECTO (equilibrio profit/riesgo)
export const RECOMMENDED_SYMBOLS = [
    // TIER 1 completo (estabilidad)
    ...TIER1_SYMBOLS,
    
    // TIER 2 completo (liquidez)
    ...TIER2_SYMBOLS,
    
    // TIER 3 seleccionado (oportunidades)
    'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'FTMUSDT',
    'SANDUSDT', 'MANAUSDT', 'GRTUSDT', 'AAVEUSDT',
    
    // TIER 4 seleccionado (alta volatilidad)
    'APTUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT',
    '1000PEPEUSDT', 'WIFUSDT'
];
// TOTAL RECOMENDADO: 27 símbolos

// 🧮 CONFIGURACIÓN CUÁNTICA DE SÍMBOLOS
export const QUANTUM_SYMBOL_CONFIG = {
    // Matriz cuántica optimizada por símbolo
    matrix_optimization: {
        'BTCUSDT': { coherence_weight: 1.0, lambda_sensitivity: 1.0 },
        'ETHUSDT': { coherence_weight: 1.0, lambda_sensitivity: 1.1 },
        'SOLUSDT': { coherence_weight: 0.9, lambda_sensitivity: 1.3 },
        'XRPUSDT': { coherence_weight: 0.8, lambda_sensitivity: 1.2 },
        'DOGEUSDT': { coherence_weight: 0.7, lambda_sensitivity: 1.5 }
        // ... más configuraciones específicas por símbolo
    },
    
    // Resonancia λ₇₉₁₉ por categoría
    lambda_resonance: {
        'major_crypto': 1.0,      // BTC, ETH, BNB
        'altcoins': 1.1,          // SOL, ADA, DOT, etc.
        'defi_tokens': 1.2,       // UNI, AAVE, COMP, etc.
        'meme_tokens': 1.5,       // DOGE, PEPE, FLOKI, etc.
        'gaming_meta': 1.3        // APE, GALA, SAND, etc.
    },
    
    // Factores de antimateria por volatilidad
    antimatter_factors: {
        'low_volatility': 0.8,    // BTC, ETH estables
        'medium_volatility': 1.0, // Mayoría de altcoins
        'high_volatility': 1.3,   // Tokens emergentes
        'extreme_volatility': 1.6 // Meme tokens, nuevos listings
    }
};

// [CHART] MÉTRICAS DE RENDIMIENTO ESPERADO POR TIER
export const PERFORMANCE_METRICS = {
    TIER1: {
        expected_daily_return: 0.02,      // 2% diario promedio
        max_drawdown: 0.15,               // 15% drawdown máximo
        win_rate_target: 0.7,             // 70% win rate
        volatility: 'LOW'
    },
    TIER2: {
        expected_daily_return: 0.035,     // 3.5% diario promedio
        max_drawdown: 0.20,               
        win_rate_target: 0.65,            
        volatility: 'MEDIUM'
    },
    TIER3: {
        expected_daily_return: 0.05,      // 5% diario promedio
        max_drawdown: 0.25,               
        win_rate_target: 0.60,            
        volatility: 'MEDIUM-HIGH'
    },
    TIER4: {
        expected_daily_return: 0.08,      // 8% diario promedio
        max_drawdown: 0.35,               
        win_rate_target: 0.55,            
        volatility: 'HIGH'
    },
    TIER5: {
        expected_daily_return: 0.06,      
        max_drawdown: 0.30,               
        win_rate_target: 0.58,            
        volatility: 'HIGH'
    },
    TIER6: {
        expected_daily_return: 0.10,      // 10% diario (alta volatilidad)
        max_drawdown: 0.40,               
        win_rate_target: 0.50,            
        volatility: 'EXTREME'
    }
};

// [TARGET] FUNCIÓN PARA OBTENER SÍMBOLOS SEGÚN MODO
export function getSymbolsForMode(mode = 'BALANCED') {
    return TRADING_MODES[mode]?.symbols || RECOMMENDED_SYMBOLS;
}

// [WRENCH] FUNCIÓN PARA OBTENER CONFIGURACIÓN DE SÍMBOLO
export function getSymbolConfig(symbol) {
    // Determinar tier del símbolo
    let tier = 'TIER3'; // default
    
    if (TIER1_SYMBOLS.includes(symbol)) tier = 'TIER1';
    else if (TIER2_SYMBOLS.includes(symbol)) tier = 'TIER2';
    else if (TIER3_SYMBOLS.includes(symbol)) tier = 'TIER3';
    else if (TIER4_SYMBOLS.includes(symbol)) tier = 'TIER4';
    else if (TIER5_SYMBOLS.includes(symbol)) tier = 'TIER5';
    else if (TIER6_SYMBOLS.includes(symbol)) tier = 'TIER6';
    
    return {
        tier,
        config: QUANTUM_TIER_CONFIG[tier],
        performance: PERFORMANCE_METRICS[tier],
        quantum_config: QUANTUM_SYMBOL_CONFIG.matrix_optimization[symbol] || {
            coherence_weight: 0.8,
            lambda_sensitivity: 1.2
        }
    };
}

export default {
    TIER1_SYMBOLS,
    TIER2_SYMBOLS,
    TIER3_SYMBOLS,
    TIER4_SYMBOLS,
    TIER5_SYMBOLS,
    TIER6_SYMBOLS,
    ALL_SYMBOLS,
    RECOMMENDED_SYMBOLS,
    TRADING_MODES,
    QUANTUM_TIER_CONFIG,
    QUANTUM_SYMBOL_CONFIG,
    PERFORMANCE_METRICS,
    getSymbolsForMode,
    getSymbolConfig
};

