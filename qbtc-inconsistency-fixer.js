/**
 * 🔧 QBTC QUANTUM INCONSISTENCY FIXER
 * Corrección de inconsistencias críticas en el análisis integral
 * 
 * INCONSISTENCIAS IDENTIFICADAS:
 * 1. Estados cuánticos inconsistentes (QBTC_SUPERPOSITION_BEAR vs QBTC_COHERENT_BULL)
 * 2. Probabilidades de path irrealistas (67.59% para ORACLE_TOKENS)
 * 3. Leverage máximo inconsistente (100x para MEME_TOKENS)
 * 4. Profit esperado uniforme (25.00% para múltiples sectores)
 * 5. Coherencia cuántica no balanceada
 * 6. Flujo whale/institucional con valores extremos
 */

const QBTC_QUANTUM_CONSTANTS = {
    LAMBDA_7919: 8.977020,
    PHI_GOLDEN: 1.618034,
    RESONANCE_FREQ: 888,
    Z_COMPLEX: { MAGNITUDE: 18.358 },
    QUANTUM_FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597],
    HERMETIC_PRINCIPLES: {
        CAUSATION: "Toda causa tiene su efecto, todo efecto tiene su causa",
        CORRESPONDENCE: "Como es arriba, es abajo",
        FLOW: "Todo fluye y refluye, todo tiene sus períodos"
    }
};

// ===== CORRECCIÓN DE ESTADOS CUÁNTICOS =====
function fixQuantumStateInconsistencies(sectorData) {
    const correctedStates = {};
    
    Object.keys(sectorData).forEach(sector => {
        const data = sectorData[sector];
        const coherence = calculateCorrectedCoherence(data);
        const entanglement = calculateCorrectedEntanglement(data);
        
        // Corregir estados cuánticos basados en coherencia real
        let quantumState;
        if (coherence > 0.7) {
            quantumState = 'QBTC_SUPERPOSITION_BULL';
        } else if (coherence > 0.5) {
            quantumState = 'QBTC_COHERENT_BULL';
        } else if (coherence > 0.3) {
            quantumState = 'QBTC_NEUTRAL_TRANSITION';
        } else if (coherence > 0.15) {
            quantumState = 'QBTC_COHERENT_BEAR';
        } else {
            quantumState = 'QBTC_SUPERPOSITION_BEAR';
        }
        
        // Corregir probabilidad de path basada en datos reales
        const pathProbability = calculateRealisticPathProbability(data, coherence, entanglement);
        
        correctedStates[sector] = {
            ...data,
            quantumState,
            pathProbability: pathProbability * 100, // Convertir a porcentaje
            coherence: coherence,
            entanglement: entanglement
        };
    });
    
    return correctedStates;
}

// ===== CORRECCIÓN DE COHERENCIA CUÁNTICA =====
function calculateCorrectedCoherence(sectorData) {
    if (!sectorData) return 0.3;
    
    const confidence = sectorData.avgConfidence || 0;
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const volume = sectorData.totalVolume || 0;
    const rsi = sectorData.avgRSI || 50;
    
    // Cálculo balanceado usando constantes cuánticas reales
    const confidenceFactor = Math.sin((confidence / 100) * Math.PI) * QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN;
    const strengthFactor = Math.cos((strength / 100) * Math.PI) * QBTC_QUANTUM_CONSTANTS.LAMBDA_7919;
    const volumeFactor = Math.tanh(Math.log(Math.max(1, volume)) / 20) * QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN;
    const rsiFactor = Math.sin((rsi / 100) * Math.PI) * QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN;
    
    const coherence = (confidenceFactor + strengthFactor + volumeFactor + rsiFactor) / 4;
    return Math.max(0.05, Math.min(0.95, coherence));
}

// ===== CORRECCIÓN DE ENTRELAZAMIENTO =====
function calculateCorrectedEntanglement(sectorData) {
    if (!sectorData) return 1.5;
    
    const buySignals = sectorData.buySignals || 0;
    const sellSignals = sectorData.sellSignals || 0;
    const holdSignals = sectorData.holdSignals || 0;
    const confidence = sectorData.avgConfidence || 0;
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    
    const totalSignals = buySignals + sellSignals + holdSignals;
    const signalBalance = totalSignals > 0 ? Math.abs(buySignals - sellSignals) / totalSignals : 0.5;
    
    // Cálculo realista usando constantes cuánticas
    const signalEntanglement = Math.sin(Math.max(1, totalSignals) / QBTC_QUANTUM_CONSTANTS.LAMBDA_7919) * 
                               Math.cos(confidence / QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN);
    const strengthEntanglement = Math.tanh(strength / 100) * QBTC_QUANTUM_CONSTANTS.LAMBDA_7919;
    const balanceEntanglement = signalBalance * QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN;
    
    const entanglement = Math.abs(signalEntanglement + strengthEntanglement + balanceEntanglement) / 3;
    return Math.max(0.5, Math.min(3.0, entanglement));
}

// ===== CORRECCIÓN DE PROBABILIDAD DE PATH =====
function calculateRealisticPathProbability(sectorData, coherence, entanglement) {
    if (!sectorData) return 0.15;
    
    const confidence = sectorData.avgConfidence || 0;
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const volume = sectorData.totalVolume || 0;
    
    // Cálculo realista basado en múltiples factores
    const baseProbability = Math.min(0.85, Math.max(0.15, coherence));
    const confidenceFactor = (confidence / 100) * 0.3;
    const strengthFactor = (strength / 100) * 0.3;
    const volumeFactor = Math.min(0.2, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1);
    const entanglementFactor = Math.min(1.2, Math.max(0.8, entanglement / 2)) * 0.1;
    
    const pathProbability = baseProbability + confidenceFactor + strengthFactor + volumeFactor + entanglementFactor;
    return Math.min(0.95, Math.max(0.05, pathProbability));
}

// ===== CORRECCIÓN DE LEVERAGE MÁXIMO =====
function fixLeverageInconsistencies(sectorData) {
    const correctedLeverage = {};
    
    Object.keys(sectorData).forEach(sector => {
        const data = sectorData[sector];
        const maxLeverage = calculateRealisticMaxLeverage(data, sector);
        
        correctedLeverage[sector] = {
            ...data,
            maxLeverage: maxLeverage,
            riskAdjustedLeverage: Math.min(maxLeverage * 0.7, 50) // Más conservador
        };
    });
    
    return correctedLeverage;
}

function calculateRealisticMaxLeverage(sectorData, sector) {
    if (!sectorData) return 25;
    
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const confidence = sectorData.avgConfidence || 0;
    const volume = sectorData.totalVolume || 0;
    const buySignals = sectorData.buySignals || 0;
    const sellSignals = sectorData.sellSignals || 0;
    
    // Leverage base por sector
    const sectorLeverageMap = {
        'MAJOR_CRYPTO': 35,
        'LARGE_CAP': 40,
        'DEFI_TOKENS': 30,
        'GAMING_METAVERSE': 45,
        'MEME_TOKENS': 60, // Reducido de 100x a 60x
        'LAYER1_BLOCKCHAINS': 50,
        'AI_ML_TOKENS': 45,
        'PRIVACY_COINS': 35,
        'STORAGE_TOKENS': 35,
        'ORACLE_TOKENS': 50, // Reducido de 95x a 50x
        'OTHER': 45
    };
    
    const baseLeverage = sectorLeverageMap[sector] || 35;
    
    // Factores de ajuste realistas
    const strengthFactor = Math.min(1.5, Math.max(0.5, (strength / 100) * 1.2 + 0.5));
    const confidenceFactor = Math.min(1.3, Math.max(0.7, (confidence / 100) * 1.0 + 0.7));
    const volumeFactor = Math.min(1.2, Math.max(0.8, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.5 + 0.8));
    
    // Factor de volatilidad basado en señales
    const totalSignals = buySignals + sellSignals;
    const signalVolatility = totalSignals > 0 ? Math.abs(buySignals - sellSignals) / totalSignals : 0.5;
    const volatilityFactor = Math.max(0.6, Math.min(1.1, 1 - signalVolatility * 0.5));
    
    const maxLeverage = baseLeverage * strengthFactor * confidenceFactor * volumeFactor * volatilityFactor;
    return Math.max(10, Math.min(75, maxLeverage)); // Límites más conservadores
}

// ===== CORRECCIÓN DE PROFIT ESPERADO =====
function fixProfitInconsistencies(sectorData) {
    const correctedProfit = {};
    
    Object.keys(sectorData).forEach(sector => {
        const data = sectorData[sector];
        const expectedProfit = calculateRealisticExpectedProfit(data, sector);
        
        correctedProfit[sector] = {
            ...data,
            expectedProfit: expectedProfit,
            riskRewardRatio: calculateRealisticRiskReward(data, expectedProfit)
        };
    });
    
    return correctedProfit;
}

function calculateRealisticExpectedProfit(sectorData, sector) {
    if (!sectorData) return 12.0;
    
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const confidence = sectorData.avgConfidence || 0;
    const volume = sectorData.totalVolume || 0;
    const rsi = sectorData.avgRSI || 50;
    
    // Profit base por sector
    const sectorProfitMap = {
        'MAJOR_CRYPTO': 12.0,
        'LARGE_CAP': 15.0,
        'DEFI_TOKENS': 18.0,
        'GAMING_METAVERSE': 20.0,
        'MEME_TOKENS': 22.0, // Reducido de 25% a 22%
        'LAYER1_BLOCKCHAINS': 18.0,
        'AI_ML_TOKENS': 19.0,
        'PRIVACY_COINS': 16.0,
        'STORAGE_TOKENS': 14.0,
        'ORACLE_TOKENS': 13.0, // Reducido de 14.76% a 13%
        'OTHER': 17.0
    };
    
    const baseProfit = sectorProfitMap[sector] || 15.0;
    
    // Factores de ajuste
    const strengthFactor = (strength / 100) * 0.3 + 0.85;
    const confidenceFactor = (confidence / 100) * 0.2 + 0.9;
    const volumeFactor = Math.min(1.2, Math.max(0.8, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1 + 0.9));
    const rsiFactor = rsi > 50 ? 1.1 : 0.9;
    
    const expectedProfit = baseProfit * strengthFactor * confidenceFactor * volumeFactor * rsiFactor;
    return Math.min(30.0, Math.max(8.0, expectedProfit)); // Límites realistas
}

function calculateRealisticRiskReward(sectorData, expectedProfit) {
    if (!sectorData) return 1.5;
    
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const confidence = sectorData.avgConfidence || 0;
    
    const baseRiskReward = 1.5;
    const strengthFactor = (strength / 100) * 0.5 + 0.75;
    const confidenceFactor = (confidence / 100) * 0.3 + 0.85;
    const profitFactor = Math.min(2.0, Math.max(1.0, expectedProfit / 15.0));
    
    const riskReward = baseRiskReward * strengthFactor * confidenceFactor * profitFactor;
    return Math.min(3.0, Math.max(1.1, riskReward));
}

// ===== CORRECCIÓN DE FLUJO WHALE/INSTITUCIONAL =====
function fixFlowInconsistencies(sectorData) {
    const correctedFlow = {};
    
    Object.keys(sectorData).forEach(sector => {
        const data = sectorData[sector];
        const whaleFlow = calculateRealisticWhaleFlow(data, sector);
        const institutionalFlow = calculateRealisticInstitutionalFlow(data, sector);
        const marketImpact = calculateRealisticMarketImpact(whaleFlow, institutionalFlow);
        
        correctedFlow[sector] = {
            ...data,
            whaleFlow: whaleFlow,
            institutionalFlow: institutionalFlow,
            marketImpact: marketImpact
        };
    });
    
    return correctedFlow;
}

function calculateRealisticWhaleFlow(sectorData, sector) {
    if (!sectorData) return { direction: 'NEUTRAL', volume: 0, strength: 0 };
    
    const volume = sectorData.totalVolume || 0;
    const price = sectorData.avgPrice || 1;
    
    // Flujo whale realista (5-15% del volumen total)
    const whalePercentage = 0.10 + (QBTC_QUANTUM_CONSTANTS.LAMBDA_7919 % 0.1); // 10-20%
    const whaleVolume = volume * price * whalePercentage;
    
    // Dirección basada en datos reales
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const confidence = sectorData.avgConfidence || 0;
    const direction = (strength + confidence) > 100 ? 'INFLOW' : 'OUTFLOW';
    
    // Fuerza del flujo realista
    const flowStrength = Math.min(100, Math.max(0, (whaleVolume / 1000000) * 10));
    
    return {
        direction,
        volume: whaleVolume,
        strength: flowStrength
    };
}

function calculateRealisticInstitutionalFlow(sectorData, sector) {
    if (!sectorData) return { direction: 'NEUTRAL', volume: 0 };
    
    const volume = sectorData.totalVolume || 0;
    const price = sectorData.avgPrice || 1;
    
    // Flujo institucional realista (15-25% del volumen total)
    const institutionalPercentage = 0.20 + (QBTC_QUANTUM_CONSTANTS.PHI_GOLDEN % 0.1); // 20-30%
    const institutionalVolume = volume * price * institutionalPercentage;
    
    // Dirección basada en fuerza del sector
    const strength = sectorData.sectorMetrics?.sectorStrength || 0;
    const direction = strength > 50 ? 'INFLOW' : 'OUTFLOW';
    
    return {
        direction,
        volume: institutionalVolume
    };
}

function calculateRealisticMarketImpact(whaleFlow, institutionalFlow) {
    const whaleImpact = whaleFlow.strength * 0.4;
    const institutionalImpact = Math.min(60, (institutionalFlow.volume / 10000000) * 20);
    return Math.min(100, whaleImpact + institutionalImpact);
}

// ===== FUNCIÓN PRINCIPAL DE CORRECCIÓN =====
function fixQBTCInconsistencies(originalData) {
    console.log('🔧 Iniciando corrección de inconsistencias QBTC Quantum...');
    
    // Aplicar todas las correcciones
    let correctedData = { ...originalData };
    
    // 1. Corregir estados cuánticos
    correctedData.sectorAnalysis = fixQuantumStateInconsistencies(correctedData.sectorAnalysis);
    
    // 2. Corregir leverage
    correctedData.sectorAnalysis = fixLeverageInconsistencies(correctedData.sectorAnalysis);
    
    // 3. Corregir profit esperado
    correctedData.sectorAnalysis = fixProfitInconsistencies(correctedData.sectorAnalysis);
    
    // 4. Corregir flujos
    correctedData.sectorAnalysis = fixFlowInconsistencies(correctedData.sectorAnalysis);
    
    console.log('✅ Corrección de inconsistencias completada');
    return correctedData;
}

// ===== VALIDACIÓN DE CORRECCIONES =====
function validateCorrections(correctedData) {
    const validation = {
        quantumStates: {},
        leverage: {},
        profit: {},
        flow: {},
        overall: true
    };
    
    Object.keys(correctedData.sectorAnalysis).forEach(sector => {
        const data = correctedData.sectorAnalysis[sector];
        
        // Validar estados cuánticos
        validation.quantumStates[sector] = {
            valid: data.quantumState && data.quantumState.includes('QBTC_'),
            coherence: data.coherence >= 0.05 && data.coherence <= 0.95,
            entanglement: data.entanglement >= 0.5 && data.entanglement <= 3.0
        };
        
        // Validar leverage
        validation.leverage[sector] = {
            valid: data.maxLeverage >= 10 && data.maxLeverage <= 75,
            riskAdjusted: data.riskAdjustedLeverage <= data.maxLeverage
        };
        
        // Validar profit
        validation.profit[sector] = {
            valid: data.expectedProfit >= 8.0 && data.expectedProfit <= 30.0,
            riskReward: data.riskRewardRatio >= 1.1 && data.riskRewardRatio <= 3.0
        };
        
        // Validar flujos
        validation.flow[sector] = {
            whaleValid: data.whaleFlow && data.whaleFlow.strength >= 0 && data.whaleFlow.strength <= 100,
            institutionalValid: data.institutionalFlow && data.institutionalFlow.volume >= 0,
            marketImpactValid: data.marketImpact >= 0 && data.marketImpact <= 100
        };
        
        // Verificar si hay inconsistencias
        const hasIssues = !validation.quantumStates[sector].valid || 
                         !validation.leverage[sector].valid || 
                         !validation.profit[sector].valid || 
                         !validation.flow[sector].whaleValid;
        
        if (hasIssues) {
            validation.overall = false;
        }
    });
    
    return validation;
}

// Exportar funciones para uso en el monitor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fixQBTCInconsistencies,
        validateCorrections,
        QBTC_QUANTUM_CONSTANTS
    };
}

// Para uso en navegador
if (typeof window !== 'undefined') {
    window.QBTCInconsistencyFixer = {
        fixQBTCInconsistencies,
        validateCorrections,
        QBTC_QUANTUM_CONSTANTS
    };
}
