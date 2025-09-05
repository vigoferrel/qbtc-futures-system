/**
 * [WIZARD] HERMETIC TRANSMUTATION INTEGRATION
 * ======================================
 * Integra el Motor de Transmutación Alquímica de Pérdidas
 * con el sistema de Auto-Trading Hermético
 */

// Usar import para ES modules en HermeticAutoTrader
import LossTransmutationEngine from './loss-transmutation-engine.js';

/**
 * Integra el Motor de Transmutación con el HermeticAutoTrader
 * @param {Object} hermeticTrader - Instancia del HermeticAutoTrader
 * @returns {Object} Motor de transmutación configurado
 */
export function integrateTransmutationEngine(hermeticTrader) {
    // Convertir el CommonJS module a ES module compatible
    // Ya que HermeticAutoTrader usa ES modules
    
    console.log('[CRYSTAL_BALL] Integrando Motor de Transmutación Alquímica...');
    
    // Configuración hermética específica para el motor de transmutación
    const alchemicalConfig = {
        // Configuración basada en estado hermético
        mercuryFactor: hermeticTrader.config.consciousness_multiplier * 0.38, // 0.618 modificado
        sulfurIntensity: hermeticTrader.hermeticState.quantum_coherence * 1.5, // Intensificar con coherencia
        saltStability: Object.values(hermeticTrader.config.dimensional_profit_targets).reduce((a, b) => a + b, 0) / 5,
        
        // Configuración de regeneración basada en fases lunares
        phoenixThreshold: 0.08, // 8% drawdown activa el fénix
        regenerationPower: hermeticTrader.config.merkaba_multiplier / 2, // Pi/2
        
        // Configuración de sabiduría
        wisdomAccumulation: hermeticTrader.hermeticState.consciousness_level * 0.2,
        experienceMultiplier: hermeticTrader.hermeticState.transmutation_efficiency * 1.5,
        
        // Límites operativos
        maxTransmutationsPerHour: hermeticTrader.config.max_positions + 2,
        minLossForTransmutation: 50 // USDT
    };
    
    // Crear el motor de transmutación
    const transmutationEngine = new LossTransmutationEngine(alchemicalConfig);
    
    // Integrar eventos del motor con el trader hermético
    setupTransmutationEvents(transmutationEngine, hermeticTrader);
    
    // Activar el motor
    transmutationEngine.activate();
    
    console.log('⚗️ Motor de Transmutación Alquímica activado con configuración hermética');
    console.log(`[CHART] Factores alquímicos: Mercury(${alchemicalConfig.mercuryFactor.toFixed(3)}) | Sulfur(${alchemicalConfig.sulfurIntensity.toFixed(3)}) | Salt(${alchemicalConfig.saltStability.toFixed(3)})`);
    
    return transmutationEngine;
}

/**
 * Configura los eventos entre el motor de transmutación y el trader hermético
 * @param {Object} engine - Motor de transmutación
 * @param {Object} trader - Trader hermético
 */
function setupTransmutationEvents(engine, trader) {
    // Cuando se completa una transmutación
    engine.on('loss-transmuted', (result) => {
        console.log(`[SPARKLES] Transmutación alquímica completada: ${result.wisdomGained.toFixed(2)} sabiduría ganada`);
        
        // Actualizar métricas de performance hermética
        trader.performance.alchemical_transmutations++;
        
        // Potenciar la consciencia hermética
        trader.hermeticState.consciousness_level = Math.min(
            1.0, 
            trader.hermeticState.consciousness_level + (result.wisdomGained * 0.002)
        );
        
        // Actualizar eficiencia de transmutación
        trader.hermeticState.transmutation_efficiency = Math.min(
            1.0,
            trader.hermeticState.transmutation_efficiency + (result.wisdomGained * 0.001)
        );
        
        // Mejorar coherencia cuántica con sabiduría alquímica
        trader.hermeticState.quantum_coherence = Math.min(
            1.0,
            trader.hermeticState.quantum_coherence + (result.wisdomGained * 0.0015)
        );
        
        // Emitir evento de evolución hermética
        trader.emit('hermetic-evolution', {
            type: 'alchemical-transmutation',
            wisdom_gained: result.wisdomGained,
            new_consciousness: trader.hermeticState.consciousness_level,
            new_coherence: trader.hermeticState.quantum_coherence
        });
        
        // Aplicar recomendaciones si la oportunidad es fuerte
        if (result.newOpportunity && result.newOpportunity.strength > 0.8) {
            applyTransmutationWisdom(result, trader);
        }
    });
    
    // Cuando ocurre un renacimiento del Fénix
    engine.on('phoenix-rebirth', (rebirth) => {
        console.log(`[FIRE] REBIRTH #${rebirth.rebirthNumber}: Fénix activado en trader hermético`);
        
        // Evolución dimensional automática con renacimiento
        if (rebirth.rebirthNumber > 1) {
            const dimensions = Object.keys(trader.config.dimensional_profit_targets);
            const currentIndex = dimensions.indexOf(trader.hermeticState.dimensional_access);
            
            if (currentIndex < dimensions.length - 1) {
                trader.hermeticState.dimensional_access = dimensions[currentIndex + 1];
                console.log(`[CYCLONE] Ascensión dimensional automática a ${trader.hermeticState.dimensional_access}`);
                
                // Activar merkaba si no está activo
                if (!trader.hermeticState.merkaba_active) {
                    trader.activateMerkaba();
                }
            }
        }
        
        // Actualizar fase alquímica
        const phases = ['nigredo', 'albedo', 'citrinitas', 'rubedo'];
        const currentPhaseIndex = phases.indexOf(trader.hermeticState.alchemical_phase);
        trader.hermeticState.alchemical_phase = phases[(currentPhaseIndex + 1) % phases.length];
        
        trader.emit('phoenix-rebirth', rebirth);
    });
    
    // Monitorear estado del motor
    engine.on('transmutation-status', (status) => {
        // Sincronizar estados clave
        trader.hermeticState.transmutation_efficiency = status.systemIntegrity;
    });
}

/**
 * Aplica la sabiduría transmutada al trader hermético
 * @param {Object} transmutationResult - Resultado de la transmutación
 * @param {Object} trader - Trader hermético
 */
function applyTransmutationWisdom(transmutationResult, trader) {
    const { recommendations, newOpportunity } = transmutationResult;
    
    console.log('[BRAIN] Aplicando sabiduría alquímica al trader hermético...');
    
    // Aplicar recomendaciones prioritarias
    for (const rec of recommendations) {
        if (rec.priority === 'high') {
            console.log(`[LIGHTNING] Recomendación prioritaria: ${rec.action}`);
            
            // Ajustar parámetros de trading basados en recomendaciones
            if (rec.type === 'strategy-enhancement') {
                const { riskReduction, timingImprovement, emotionalMastery } = rec.details || {};
                
                // Ajustar tamaño de posición con sabiduría transmutada
                if (riskReduction > 0.3) {
                    trader.config.base_position_size *= (1 - (riskReduction * 0.2));
                    console.log(`📉 Tamaño de posición ajustado a ${trader.config.base_position_size.toFixed(4)}`);
                }
                
                // Ajustar multiplicadores de consciencia
                if (emotionalMastery > 0.4) {
                    trader.config.consciousness_multiplier *= (1 + (emotionalMastery * 0.1));
                    console.log(`[TREND_UP] Multiplicador de consciencia ajustado a ${trader.config.consciousness_multiplier.toFixed(4)}`);
                }
            }
        }
    }
    
    // Aplicar optimizaciones de símbolos si están disponibles
    if (newOpportunity && newOpportunity.applicableSymbols && newOpportunity.applicableSymbols.length > 0) {
        console.log(`[MAGNIFY] Símbolos óptimos identificados: ${newOpportunity.applicableSymbols.join(', ')}`);
        
        // Se podría priorizar estos símbolos en las próximas operaciones
        trader.emit('optimal-symbols-identified', {
            symbols: newOpportunity.applicableSymbols,
            timeframe: newOpportunity.timeframe,
            confidence: newOpportunity.strength
        });
    }
}

/**
 * Procesa una pérdida a través del motor de transmutación
 * @param {Object} transmutationEngine - El motor de transmutación
 * @param {Object} tradeResult - El resultado del trade con pérdida
 */
export async function processLossThroughTransmutation(transmutationEngine, tradeResult) {
    const { symbol, side, entry, exit, amount, reason } = tradeResult;
    const loss = Math.abs(amount);
    
    console.log(`⚗️ Procesando pérdida de ${loss.toFixed(2)} USDT en ${symbol} para transmutación...`);
    
    // Preparar datos para transmutación
    const lossData = {
        amount: loss,
        symbol,
        reason: reason || 'trade-loss',
        timestamp: new Date(),
        metadata: {
            side,
            entryPrice: entry,
            exitPrice: exit,
            leverageUsed: tradeResult.leverage || 1,
            timeframe: tradeResult.timeframe || '1h',
            indicators: tradeResult.indicators || [],
            marketCondition: tradeResult.marketCondition || 'neutral',
            positions: tradeResult.positions || 1,
            volatility: tradeResult.volatility || 0.5,
            volume: tradeResult.volume || 'normal',
            sentiment: tradeResult.sentiment || 'neutral'
        }
    };
    
    // Procesar a través del motor de transmutación
    try {
        const result = await transmutationEngine.processLoss(lossData);
        
        if (result) {
            console.log(`[WIZARD] Transmutación completada: ${result.wisdomGained.toFixed(2)} sabiduría`);
            return result;
        } else {
            console.log('[WARNING] La pérdida no pudo ser transmutada');
            return null;
        }
    } catch (error) {
        console.error('[X] Error en transmutación:', error);
        return null;
    }
}

// Exportar funciones principales
export default {
    integrateTransmutationEngine,
    processLossThroughTransmutation
};
