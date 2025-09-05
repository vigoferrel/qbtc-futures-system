/**
 * [PALETTE] LEONARDO QUANTUM LIBERATION - EXTENDED SYMBOLS CONFIGURATION
 * "Simplicity is the ultimate sophistication" - Leonardo da Vinci
 * 
 * 77 Divine Instruments organized by Quantum Consciousness Levels
 */

// Make configuration globally available for frontend
window.LeonardoSymbolsExtended = window.LeonardoSymbolsExtended || {};

// [TROPHY] QUANTUM_CORE: Divine Trinity (Maximum consciousness)
window.LeonardoSymbolsExtended.TIER1_SYMBOLS = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT'
];

// 🥈 NEURAL_PRIME: Stellar Consciousness (High awareness)
window.LeonardoSymbolsExtended.TIER2_SYMBOLS = [
    'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 
    'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
    'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT'
];

// 🥉 CREATIVE_FORCE: Artistic Flow (Creative patterns)
window.LeonardoSymbolsExtended.TIER3_SYMBOLS = [
    'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT',
    'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'FTMUSDT',
    'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
    'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT',
    'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT'
];

// [ROCKET] HARMONIC_WAVE: Emerging Harmonics (High volatility opportunities)
window.LeonardoSymbolsExtended.TIER4_SYMBOLS = [
    'APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT',
    'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT',
    'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 
    'WIFUSDT', 'BONKUSDT', '1000SATSUSDT'
];

// [DIAMOND] RESONANT_FIELD: Specialized Resonance (Niche but profitable)
window.LeonardoSymbolsExtended.TIER5_SYMBOLS = [
    'CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT',
    'BATUSDT', 'ZRXUSDT', 'RENUSDT', 'STORJUSDT',
    'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT',
    'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT'
];

// [OCEAN_WAVE] EMERGING_PATTERN: Gaming & Meta (Extreme volatility trends)
window.LeonardoSymbolsExtended.TIER6_SYMBOLS = [
    'APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT',
    'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT',
    'TLMUSDT', 'ALPACAUSDT', 'YGGUSDT', 'GHSTUSDT'
];

// [LIGHTNING] LEONARDO QUANTUM CONFIGURATIONS BY TIER
window.LeonardoSymbolsExtended.QUANTUM_TIER_CONFIG = {
    TIER1: {
        leverage_multiplier: 1.0,
        signal_weight: 1.0,
        entropy_sensitivity: 1.0,
        min_coherence: 0.7,
        quantum_priority: 10,
        consciousness_level: 0.95,
        divine_alignment: 'COSMIC'
    },
    TIER2: {
        leverage_multiplier: 1.1,
        signal_weight: 0.9,
        entropy_sensitivity: 1.1,
        min_coherence: 0.65,
        quantum_priority: 8,
        consciousness_level: 0.88,
        divine_alignment: 'STELLAR'
    },
    TIER3: {
        leverage_multiplier: 1.2,
        signal_weight: 0.8,
        entropy_sensitivity: 1.2,
        min_coherence: 0.6,
        quantum_priority: 6,
        consciousness_level: 0.82,
        divine_alignment: 'LUMINOUS'
    },
    TIER4: {
        leverage_multiplier: 1.3,
        signal_weight: 0.7,
        entropy_sensitivity: 1.4,
        min_coherence: 0.55,
        quantum_priority: 4,
        consciousness_level: 0.75,
        divine_alignment: 'RADIANT'
    },
    TIER5: {
        leverage_multiplier: 1.1,
        signal_weight: 0.6,
        entropy_sensitivity: 1.3,
        min_coherence: 0.5,
        quantum_priority: 3,
        consciousness_level: 0.68,
        divine_alignment: 'BRIGHT'
    },
    TIER6: {
        leverage_multiplier: 1.4,
        signal_weight: 0.5,
        entropy_sensitivity: 1.5,
        min_coherence: 0.45,
        quantum_priority: 2,
        consciousness_level: 0.61,
        divine_alignment: 'AWAKENING'
    }
};

// [FIRE] LEONARDO TRADING MODES
window.LeonardoSymbolsExtended.TRADING_MODES = {
    CONSERVATIVE: {
        symbols: [...window.LeonardoSymbolsExtended.TIER1_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS],
        max_positions: 6,
        risk_per_trade: 0.02,
        leverage_limit: 15
    },
    BALANCED: {
        symbols: [...window.LeonardoSymbolsExtended.TIER1_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER3_SYMBOLS],
        max_positions: 10,
        risk_per_trade: 0.025,
        leverage_limit: 20
    },
    AGGRESSIVE: {
        symbols: [...window.LeonardoSymbolsExtended.TIER1_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER3_SYMBOLS, ...window.LeonardoSymbolsExtended.TIER4_SYMBOLS],
        max_positions: 15,
        risk_per_trade: 0.035,
        leverage_limit: 25
    },
    EXTREME: {
        symbols: [
            ...window.LeonardoSymbolsExtended.TIER1_SYMBOLS, 
            ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS, 
            ...window.LeonardoSymbolsExtended.TIER3_SYMBOLS, 
            ...window.LeonardoSymbolsExtended.TIER4_SYMBOLS, 
            ...window.LeonardoSymbolsExtended.TIER5_SYMBOLS, 
            ...window.LeonardoSymbolsExtended.TIER6_SYMBOLS
        ],
        max_positions: 20,
        risk_per_trade: 0.05,
        leverage_limit: 30
    }
};

// [TARGET] ALL 77 DIVINE SYMBOLS
window.LeonardoSymbolsExtended.ALL_SYMBOLS = [
    ...window.LeonardoSymbolsExtended.TIER1_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER3_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER4_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER5_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER6_SYMBOLS
];

// [STAR] RECOMMENDED LEONARDO SYMBOLS (Balanced profit/risk)
window.LeonardoSymbolsExtended.RECOMMENDED_SYMBOLS = [
    ...window.LeonardoSymbolsExtended.TIER1_SYMBOLS,
    ...window.LeonardoSymbolsExtended.TIER2_SYMBOLS,
    'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'FTMUSDT',
    'SANDUSDT', 'MANAUSDT', 'GRTUSDT', 'AAVEUSDT',
    'APTUSDT', 'ARBUSDT', 'OPUSDT', 'INJUSDT',
    '1000PEPEUSDT', 'WIFUSDT'
];

// 🧮 QUANTUM SYMBOL MATRIX CONFIGURATION
window.LeonardoSymbolsExtended.QUANTUM_SYMBOL_CONFIG = {
    matrix_optimization: {
        'BTCUSDT': { coherence_weight: 1.0, lambda_sensitivity: 1.0, sacred_geometry: 'GOLDEN_RATIO' },
        'ETHUSDT': { coherence_weight: 1.0, lambda_sensitivity: 1.1, sacred_geometry: 'FIBONACCI_SPIRAL' },
        'SOLUSDT': { coherence_weight: 0.9, lambda_sensitivity: 1.3, sacred_geometry: 'MERKABA' },
        'XRPUSDT': { coherence_weight: 0.8, lambda_sensitivity: 1.2, sacred_geometry: 'FLOWER_OF_LIFE' },
        'DOGEUSDT': { coherence_weight: 0.7, lambda_sensitivity: 1.5, sacred_geometry: 'INFINITE_SPIRAL' }
    },
    lambda_resonance: {
        'major_crypto': 1.0,
        'altcoins': 1.1,
        'defi_tokens': 1.2,
        'meme_tokens': 1.5,
        'gaming_meta': 1.3
    },
    antimatter_factors: {
        'low_volatility': 0.8,
        'medium_volatility': 1.0,
        'high_volatility': 1.3,
        'extreme_volatility': 1.6
    }
};

// [CHART] EXPECTED PERFORMANCE METRICS BY TIER
window.LeonardoSymbolsExtended.PERFORMANCE_METRICS = {
    TIER1: {
        expected_daily_return: 0.02,
        max_drawdown: 0.15,
        win_rate_target: 0.7,
        volatility: 'LOW',
        divine_frequency: 21000000
    },
    TIER2: {
        expected_daily_return: 0.035,
        max_drawdown: 0.20,
        win_rate_target: 0.65,
        volatility: 'MEDIUM',
        divine_frequency: 18000000
    },
    TIER3: {
        expected_daily_return: 0.05,
        max_drawdown: 0.25,
        win_rate_target: 0.60,
        volatility: 'MEDIUM-HIGH',
        divine_frequency: 15000000
    },
    TIER4: {
        expected_daily_return: 0.08,
        max_drawdown: 0.35,
        win_rate_target: 0.55,
        volatility: 'HIGH',
        divine_frequency: 12000000
    },
    TIER5: {
        expected_daily_return: 0.06,
        max_drawdown: 0.30,
        win_rate_target: 0.58,
        volatility: 'HIGH',
        divine_frequency: 9000000
    },
    TIER6: {
        expected_daily_return: 0.10,
        max_drawdown: 0.40,
        win_rate_target: 0.50,
        volatility: 'EXTREME',
        divine_frequency: 6000000
    }
};

// [TARGET] Helper Functions
window.LeonardoSymbolsExtended.getSymbolsForMode = function(mode = 'BALANCED') {
    return window.LeonardoSymbolsExtended.TRADING_MODES[mode]?.symbols || window.LeonardoSymbolsExtended.RECOMMENDED_SYMBOLS;
};

window.LeonardoSymbolsExtended.getSymbolConfig = function(symbol) {
    let tier = 'TIER3'; // default
    
    if (window.LeonardoSymbolsExtended.TIER1_SYMBOLS.includes(symbol)) tier = 'TIER1';
    else if (window.LeonardoSymbolsExtended.TIER2_SYMBOLS.includes(symbol)) tier = 'TIER2';
    else if (window.LeonardoSymbolsExtended.TIER3_SYMBOLS.includes(symbol)) tier = 'TIER3';
    else if (window.LeonardoSymbolsExtended.TIER4_SYMBOLS.includes(symbol)) tier = 'TIER4';
    else if (window.LeonardoSymbolsExtended.TIER5_SYMBOLS.includes(symbol)) tier = 'TIER5';
    else if (window.LeonardoSymbolsExtended.TIER6_SYMBOLS.includes(symbol)) tier = 'TIER6';
    
    return {
        tier,
        config: window.LeonardoSymbolsExtended.QUANTUM_TIER_CONFIG[tier],
        performance: window.LeonardoSymbolsExtended.PERFORMANCE_METRICS[tier],
        quantum_config: window.LeonardoSymbolsExtended.QUANTUM_SYMBOL_CONFIG.matrix_optimization[symbol] || {
            coherence_weight: 0.8,
            lambda_sensitivity: 1.2,
            sacred_geometry: 'HARMONIC_RESONANCE'
        }
    };
};

// Tier mapping for colors and display
window.LeonardoSymbolsExtended.TIER_COLORS = {
    'TIER1': '#FFD700', // Gold
    'TIER2': '#E6E6FA', // Lavender
    'TIER3': '#DA70D6', // Orchid
    'TIER4': '#20B2AA', // Light Sea Green
    'TIER5': '#32CD32', // Lime Green
    'TIER6': '#FF6347'  // Tomato
};

window.LeonardoSymbolsExtended.TIER_NAMES = {
    'TIER1': 'Quantum Core',
    'TIER2': 'Neural Prime',
    'TIER3': 'Creative Force',
    'TIER4': 'Harmonic Wave',
    'TIER5': 'Resonant Field',
    'TIER6': 'Emerging Pattern'
};

console.log('[PALETTE] Leonardo Quantum Symbols Extended Configuration Loaded - 77 Divine Instruments Ready');
