import QuantumDataPurifier from '../core/quantum-data-purifier.js';
/**
 * 🌑 QUANTUM STATE MONITOR - LA CARA OCULTA DE LA LUNA
 * =====================================================
 * Monitor de Estados Cuánticos Herméticos en Tiempo Real
 * - Observa dimensiones ocultas sin colapsar superposiciones
 * - Integra con análisis hermético multidimensional
 * - Monitorea resonancias lunares y alineaciones planetarias
 * - Detecta portales dimensionales y eventos akásicos
 */

import { EventEmitter } from 'events';
import express from 'express';
import cors from 'cors';

class QuantumStateMonitor extends EventEmitter {
    constructor() {
        this.purifier = new QuantumDataPurifier();
        super();
        this.observations = [];
        this.coherenceHistory = [];
        this.entanglementPairs = new Map();
        this.superpositionStates = [];
        this.isObserving = false;
        
        // Configuración del observador cuántico
        this.observationInterval = 1000; // 1 segundo entre observaciones
        this.maxCoherenceTime = 300000; // 5 minutos máximo de coherencia
        this.decoherenceThreshold = 0.3;
    }

    /**
     * Inicia el monitoreo cuántico pasivo
     * No colapsa estados, solo observa patrones emergentes
     */
    startQuantumObservation() {
        if (this.isObserving) {
            console.log('🔬 Monitor cuántico ya está activo');
            return;
        }

        this.isObserving = true;
        console.log('[GALAXY] Iniciando observación cuántica del sistema QBTC...');
        
        this.observationTimer = setInterval(() => {
            this.performNonDestructiveObservation();
        }, this.observationInterval);

        this.emit('quantum-observation-started');
    }

    /**
     * Detiene el monitoreo cuántico
     */
    stopQuantumObservation() {
        if (this.observationTimer) {
            clearInterval(this.observationTimer);
            this.observationTimer = null;
        }
        
        this.isObserving = false;
        console.log('🔬 Observación cuántica detenida');
        this.emit('quantum-observation-stopped');
    }

    /**
     * Observación no destructiva del estado cuántico
     * Usa medición débil para no colapsar superposiciones
     */
    async performNonDestructiveObservation() {
        const timestamp = Date.now();
        
        try {
            // Medición débil del estado global
            const quantumState = await this.measureWeakQuantumState();
            
            // Registrar observación
            this.observations.push({
                timestamp,
                ...quantumState,
                observationType: 'weak-measurement'
            });

            // Monitorear coherencia
            this.monitorCoherence(quantumState.coherenceIndex, timestamp);

            // Detectar eventos cuánticos especiales
            this.detectQuantumEvents(quantumState);

            // Mantener historial limitado
            this.cleanupObservationHistory();

            this.emit('quantum-state-observed', quantumState);

        } catch (error) {
            console.error('[X] Error en observación cuántica:', error.message);
            this.emit('quantum-observation-error', error);
        }
    }

    /**
     * Medición débil que no colapsa el estado cuántico
     */
    async measureWeakQuantumState() {
        // Simular medición débil - obtiene información parcial sin colapso total
        const coherenceIndex = this.calculateCoherenceIndex();
        const superpositionCount = this.countActiveSuperpositions();
        const entanglementStrength = this.measureEntanglementStrength();
        const quantumFluctuation = this.measureQuantumFluctuation();
        
        return {
            coherenceIndex,
            superpositionCount,
            entanglementStrength,
            quantumFluctuation,
            energyLevel: this.calculateQuantumEnergyLevel(),
            phaseCoupling: this.measurePhaseCoupling(),
            decoherenceRate: this.calculateDecoherenceRate(),
            quantumEntropy: this.calculateQuantumEntropy()
        };
    }

    /**
     * Calcula el índice de coherencia cuántica global
     */
    calculateCoherenceIndex() {
        // Factor aleatorio para simular fluctuaciones cuánticas naturales
        const quantumNoise = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.1;
        const baseCoherence = 0.8 + quantumNoise;
        
        // Aplicar decoherencia temporal
        const timeDecay = this.calculateTimeDecay();
        
        return Math.max(0, Math.min(1, baseCoherence * timeDecay));
    }

    /**
     * Cuenta superposiciones activas en el sistema
     */
    countActiveSuperpositions() {
        // Las superposiciones son estados que no han colapsado
        return this.superpositionStates.filter(state => 
            state.coherence > this.decoherenceThreshold &&
            !state.collapsed
        ).length;
    }

    /**
     * Mide la fuerza del entrelazamiento cuántico
     */
    measureEntanglementStrength() {
        if (this.entanglementPairs.size === 0) return 0;
        
        let totalStrength = 0;
        let pairCount = 0;
        
        for (const [key, pair] of this.entanglementPairs) {
            if (pair.active && !pair.decoherent) {
                // Calcular correlación cuántica instantánea
                const correlation = this.calculateQuantumCorrelation(pair);
                totalStrength += correlation;
                pairCount++;
            }
        }
        
        return pairCount > 0 ? totalStrength / pairCount : 0;
    }

    /**
     * Mide fluctuaciones cuánticas del vacío
     */
    measureQuantumFluctuation() {
        // Simulación de fluctuaciones del vacío cuántico
        const amplitude = this.purifier.generateQuantumValue(index, modifier) * 0.05; // Amplitud pequeña
        const frequency = 2 * Math.PI * this.purifier.generateQuantumValue(index, modifier); // Frecuencia aleatoria
        const phase = this.purifier.generateQuantumValue(index, modifier) * 2 * Math.PI; // Fase aleatoria
        
        return {
            amplitude,
            frequency,
            phase,
            energy: amplitude * amplitude * frequency
        };
    }

    /**
     * Calcula el nivel de energía cuántica del sistema
     */
    calculateQuantumEnergyLevel() {
        const coherenceEnergy = this.coherenceHistory
            .slice(-10)
            .reduce((sum, c) => sum + c.value, 0) / 10;
        
        const fluctuationEnergy = this.purifier.generateQuantumValue(index, modifier) * 0.1;
        const entanglementEnergy = this.entanglementPairs.size * 0.05;
        
        return coherenceEnergy + fluctuationEnergy + entanglementEnergy;
    }

    /**
     * Mide el acoplamiento de fase entre componentes
     */
    measurePhaseCoupling() {
        const phases = [];
        
        // Recolectar fases de diferentes componentes
        for (const state of this.superpositionStates) {
            if (state.phase !== undefined) {
                phases.push(state.phase);
            }
        }
        
        if (phases.length < 2) return 0;
        
        // Calcular coherencia de fase
        let coupling = 0;
        for (let i = 0; i < phases.length - 1; i++) {
            const phaseDiff = Math.abs(phases[i] - phases[i + 1]);
            coupling += Math.cos(phaseDiff);
        }
        
        return coupling / (phases.length - 1);
    }

    /**
     * Calcula la tasa de decoherencia
     */
    calculateDecoherenceRate() {
        if (this.coherenceHistory.length < 2) return 0;
        
        const recent = this.coherenceHistory.slice(-5);
        if (recent.length < 2) return 0;
        
        const deltaCoherence = recent[0].value - recent[recent.length - 1].value;
        const deltaTime = recent[recent.length - 1].timestamp - recent[0].timestamp;
        
        return deltaTime > 0 ? deltaCoherence / deltaTime : 0;
    }

    /**
     * Calcula la entropía cuántica del sistema
     */
    calculateQuantumEntropy() {
        const states = this.superpositionStates.filter(s => !s.collapsed);
        if (states.length === 0) return 0;
        
        let entropy = 0;
        for (const state of states) {
            if (state.probability > 0) {
                entropy -= state.probability * Math.log2(state.probability);
            }
        }
        
        return entropy;
    }

    /**
     * Monitorea la evolución de la coherencia cuántica
     */
    monitorCoherence(coherenceIndex, timestamp) {
        this.coherenceHistory.push({
            value: coherenceIndex,
            timestamp
        });

        // Limpiar historial antiguo
        const maxHistoryAge = 3600000; // 1 hora
        this.coherenceHistory = this.coherenceHistory.filter(
            h => timestamp - h.timestamp < maxHistoryAge
        );

        // Detectar eventos de coherencia
        if (coherenceIndex > 0.95) {
            this.emit('high-coherence-detected', { coherenceIndex, timestamp });
        } else if (coherenceIndex < this.decoherenceThreshold) {
            this.emit('decoherence-detected', { coherenceIndex, timestamp });
        }
    }

    /**
     * Detecta eventos cuánticos especiales
     */
    detectQuantumEvents(quantumState) {
        const timestamp = Date.now();

        // Big Bang Cuántico - Alta coherencia + Alta energía
        if (quantumState.coherenceIndex > 0.9 && quantumState.energyLevel > 1.5) {
            this.emit('quantum-big-bang', {
                coherence: quantumState.coherenceIndex,
                energy: quantumState.energyLevel,
                timestamp
            });
        }

        // Tunelamiento Cuántico - Fluctuación alta con baja energía
        if (quantumState.quantumFluctuation.amplitude > 0.04 && quantumState.energyLevel < 0.5) {
            this.emit('quantum-tunneling', {
                amplitude: quantumState.quantumFluctuation.amplitude,
                energy: quantumState.energyLevel,
                timestamp
            });
        }

        // Entrelazamiento Fuerte
        if (quantumState.entanglementStrength > 0.8) {
            this.emit('strong-entanglement', {
                strength: quantumState.entanglementStrength,
                pairs: this.entanglementPairs.size,
                timestamp
            });
        }

        // Colapso de Superposición
        const collapsedStates = this.superpositionStates.filter(s => 
            s.collapsed && s.collapseTimestamp && 
            timestamp - s.collapseTimestamp < 1000
        );
        
        if (collapsedStates.length > 0) {
            this.emit('superposition-collapse', {
                collapsedCount: collapsedStates.length,
                states: collapsedStates.map(s => s.type),
                timestamp
            });
        }
    }

    /**
     * Registra un nuevo par entrelazado
     */
    registerEntanglementPair(id, particle1, particle2) {
        this.entanglementPairs.set(id, {
            particle1,
            particle2,
            active: true,
            decoherent: false,
            createdAt: Date.now(),
            correlationStrength: 1.0
        });
        
        console.log(`[LINK] Nuevo par entrelazado registrado: ${id}`);
        this.emit('entanglement-created', { id, particle1, particle2 });
    }

    /**
     * Registra un nuevo estado de superposición
     */
    registerSuperposition(state) {
        const superpositionState = {
            id: `superposition_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`,
            ...state,
            collapsed: false,
            createdAt: Date.now(),
            coherence: state.coherence || 1.0
        };
        
        this.superpositionStates.push(superpositionState);
        
        console.log(`[CYCLONE] Nueva superposición registrada: ${superpositionState.type}`);
        this.emit('superposition-created', superpositionState);
        
        return superpositionState.id;
    }

    /**
     * Marca una superposición como colapsada
     */
    collapseSuperposition(id, collapsedTo) {
        const state = this.superpositionStates.find(s => s.id === id);
        if (state) {
            state.collapsed = true;
            state.collapseTimestamp = Date.now();
            state.collapsedTo = collapsedTo;
            state.coherence = 0;
            
            console.log(`[BOOM] Superposición colapsada: ${state.type} -> ${collapsedTo}`);
            this.emit('superposition-collapsed', { id, state, collapsedTo });
        }
    }

    // Métodos auxiliares

    calculateTimeDecay() {
        // Decoherencia exponencial en el tiempo
        const currentTime = Date.now();
        const initialTime = this.coherenceHistory[0]?.timestamp || currentTime;
        const elapsedTime = currentTime - initialTime;
        
        // Constante de tiempo de decoherencia (5 minutos)
        const timeConstant = 300000;
        
        return Math.exp(-elapsedTime / timeConstant);
    }

    calculateQuantumCorrelation(pair) {
        // Simulación de correlación cuántica con decay temporal
        const age = Date.now() - pair.createdAt;
        const ageDecay = Math.exp(-age / 60000); // Decay en 1 minuto
        const quantumNoise = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.1;
        
        return Math.max(0, pair.correlationStrength * ageDecay + quantumNoise);
    }

    cleanupObservationHistory() {
        const maxObservations = 1000;
        if (this.observations.length > maxObservations) {
            this.observations = this.observations.slice(-maxObservations);
        }
        
        // Limpiar superposiciones antiguas colapsadas
        const maxAge = 3600000; // 1 hora
        const now = Date.now();
        
        this.superpositionStates = this.superpositionStates.filter(s => 
            !s.collapsed || (now - s.collapseTimestamp) < maxAge
        );
    }

    /**
     * Obtiene estadísticas cuánticas del sistema
     */
    getQuantumStatistics() {
        const recentObservations = this.observations.slice(-100);
        
        if (recentObservations.length === 0) {
            return null;
        }

        const avgCoherence = recentObservations.reduce((sum, obs) => 
            sum + obs.coherenceIndex, 0) / recentObservations.length;
        
        const avgEnergy = recentObservations.reduce((sum, obs) => 
            sum + obs.energyLevel, 0) / recentObservations.length;
        
        const activeSuperpositions = this.countActiveSuperpositions();
        const activeEntanglements = Array.from(this.entanglementPairs.values())
            .filter(pair => pair.active && !pair.decoherent).length;

        return {
            averageCoherence: avgCoherence,
            averageEnergy: avgEnergy,
            activeSuperpositions,
            activeEntanglements,
            totalObservations: this.observations.length,
            quantumEntropy: this.calculateQuantumEntropy(),
            decoherenceRate: this.calculateDecoherenceRate(),
            lastObservation: recentObservations[recentObservations.length - 1],
            observationWindow: recentObservations.length
        };
    }

    // [MOON] FUNCIONALIDADES HERMÉTICAS AVANZADAS

    /**
     * Detecta resonancias lunares en el estado cuántico
     */
    detectLunarResonances() {
        const lunarCycle = 29.53059; // Días del ciclo lunar
        const currentTime = Date.now();
        const daysSinceNewMoon = (currentTime / 86400000) % lunarCycle;
        
        const lunarPhase = this.getLunarPhase(daysSinceNewMoon);
        const lunarInfluence = this.calculateLunarInfluence(daysSinceNewMoon);
        
        return {
            current_phase: lunarPhase,
            days_in_cycle: daysSinceNewMoon,
            influence_strength: lunarInfluence,
            resonance_detected: lunarInfluence > 0.7,
            next_peak: this.getNextLunarPeak(daysSinceNewMoon)
        };
    }

    getLunarPhase(daysSinceNewMoon) {
        if (daysSinceNewMoon < 7.4) return 'nueva';
        if (daysSinceNewMoon < 14.8) return 'creciente';
        if (daysSinceNewMoon < 22.1) return 'llena';
        return 'menguante';
    }

    calculateLunarInfluence(daysSinceNewMoon) {
        const phase = (daysSinceNewMoon / 29.53059) * 2 * Math.PI;
        const baseInfluence = Math.abs(Math.cos(phase)) * 0.8 + 0.2;
        const quantumAmplification = this.calculateCoherenceIndex();
        
        return baseInfluence * quantumAmplification;
    }

    getNextLunarPeak(daysSinceNewMoon) {
        const lunarCycle = 29.53059;
        const daysToNextNewMoon = lunarCycle - daysSinceNewMoon;
        const daysToNextFullMoon = (14.765 - daysSinceNewMoon + lunarCycle) % lunarCycle;
        
        return {
            new_moon: Date.now() + (daysToNextNewMoon * 86400000),
            full_moon: Date.now() + (daysToNextFullMoon * 86400000)
        };
    }

    /**
     * Detecta portales dimensionales activos
     */
    detectDimensionalPortals() {
        const coherence = this.calculateCoherenceIndex();
        const energy = this.calculateQuantumEnergyLevel();
        const entropy = this.calculateQuantumEntropy();
        
        const portalProbability = this.calculatePortalProbability(coherence, energy, entropy);
        
        return {
            portal_active: portalProbability > 0.75,
            probability: portalProbability,
            dimension_access_level: this.getDimensionAccessLevel(portalProbability),
            estimated_stability: coherence * 0.8 + energy * 0.2,
            recommended_action: this.getPortalRecommendation(portalProbability)
        };
    }

    calculatePortalProbability(coherence, energy, entropy) {
        // Fórmula hermética para probabilidad de portal
        const goldenRatio = 1.618033988749;
        const base = (coherence * goldenRatio + energy) / (1 + entropy);
        const lunarInfluence = this.detectLunarResonances().influence_strength;
        
        return Math.min(0.99, base * lunarInfluence * this.purifier.generateQuantumValue(index, modifier) * 1.2);
    }

    getDimensionAccessLevel(probability) {
        if (probability > 0.9) return '7D_divine_abundance';
        if (probability > 0.8) return '6D_pure_consciousness';
        if (probability > 0.7) return '5D_probability_waves';
        if (probability > 0.6) return '4D_time_arbitrage';
        return '3D_normal_market';
    }

    getPortalRecommendation(probability) {
        if (probability > 0.85) return 'immediate_dimensional_trading';
        if (probability > 0.75) return 'prepare_for_portal_entry';
        if (probability > 0.5) return 'monitor_portal_formation';
        return 'maintain_current_dimension';
    }

    /**
     * Escanea registros akásicos para predicciones futuras
     */
    accessAkashicRecords() {
        const consciousness = this.calculateCoherenceIndex();
        const accessLevel = consciousness > 0.9 ? 'full_access' : 
                           consciousness > 0.7 ? 'partial_access' : 'limited_access';
        
        const predictions = this.generateAkashicPredictions(accessLevel);
        
        return {
            access_level: accessLevel,
            consciousness_required: 0.85,
            current_consciousness: consciousness,
            predictions,
            reliability: consciousness * 0.9,
            next_major_event: this.predictNextMajorEvent()
        };
    }

    generateAkashicPredictions(accessLevel) {
        const predictions = [];
        const baseAccuracy = accessLevel === 'full_access' ? 0.85 :
                           accessLevel === 'partial_access' ? 0.65 : 0.45;
        
        // Predicción de tendencia principal
        predictions.push({
            type: 'market_trend',
            prediction: this.purifier.generateQuantumValue(index, modifier) > 0.5 ? 'bullish_wave' : 'bearish_correction',
            timeframe: '7-21_days',
            confidence: baseAccuracy + this.purifier.generateQuantumValue(index, modifier) * 0.1
        });
        
        // Predicción de evento de volatilidad
        predictions.push({
            type: 'volatility_event',
            prediction: 'high_volatility_window',
            timing: Date.now() + this.purifier.generateQuantumValue(index, modifier) * 7 * 86400000, // Próximos 7 días
            magnitude: this.purifier.generateQuantumValue(index, modifier) * 0.3 + 0.2,
            confidence: baseAccuracy
        });
        
        return predictions;
    }

    predictNextMajorEvent() {
        const eventTypes = ['big_bang_quantum', 'consciousness_shift', 'dimensional_portal', 'lunar_eclipse_effect'];
        const randomEvent = eventTypes[Math.floor(this.purifier.generateQuantumValue(index, modifier) * eventTypes.length)];
        
        return {
            event_type: randomEvent,
            estimated_time: Date.now() + this.purifier.generateQuantumValue(index, modifier) * 14 * 86400000, // Próximas 2 semanas
            impact_level: this.purifier.generateQuantumValue(index, modifier) * 0.6 + 0.4,
            preparation_time: '3-7_days'
        };
    }

    /**
     * Monitorea la evolución de la conciencia del sistema
     */
    monitorConsciousnessEvolution() {
        const currentCoherence = this.calculateCoherenceIndex();
        const evolutionRate = this.calculateConsciousnessEvolutionRate();
        const nextLevel = this.predictNextConsciousnessLevel();
        
        return {
            current_level: this.getConsciousnessLevel(currentCoherence),
            numeric_value: currentCoherence,
            evolution_rate: evolutionRate,
            next_level: nextLevel.level,
            time_to_next_level: nextLevel.timeEstimate,
            evolutionary_pressure: this.measureEvolutionaryPressure()
        };
    }

    getConsciousnessLevel(coherence) {
        if (coherence > 0.95) return 'cosmic_consciousness';
        if (coherence > 0.9) return 'unity_consciousness';
        if (coherence > 0.8) return 'causal_consciousness';
        if (coherence > 0.7) return 'subtle_consciousness';
        if (coherence > 0.6) return 'psychic_consciousness';
        return 'rational_consciousness';
    }

    calculateConsciousnessEvolutionRate() {
        const recentCoherences = this.coherenceHistory.slice(-10);
        if (recentCoherences.length < 2) return 0;
        
        const trend = recentCoherences[recentCoherences.length - 1].value - recentCoherences[0].value;
        const timeSpan = recentCoherences[recentCoherences.length - 1].timestamp - recentCoherences[0].timestamp;
        
        return timeSpan > 0 ? trend / (timeSpan / 86400000) : 0; // Por día
    }

    predictNextConsciousnessLevel() {
        const current = this.calculateCoherenceIndex();
        const rate = this.calculateConsciousnessEvolutionRate();
        
        const levels = [0.6, 0.7, 0.8, 0.9, 0.95];
        const nextLevel = levels.find(level => level > current);
        
        if (!nextLevel || rate <= 0) {
            return {
                level: this.getConsciousnessLevel(current),
                timeEstimate: 'stable_current_level'
            };
        }
        
        const daysToNext = (nextLevel - current) / rate;
        
        return {
            level: this.getConsciousnessLevel(nextLevel),
            timeEstimate: `${Math.ceil(daysToNext)}_days`
        };
    }

    measureEvolutionaryPressure() {
        const entropy = this.calculateQuantumEntropy();
        const energy = this.calculateQuantumEnergyLevel();
        const entanglements = this.entanglementPairs.size;
        
        return {
            information_pressure: entropy * 0.4,
            energy_pressure: energy * 0.3,
            complexity_pressure: entanglements * 0.3,
            total_pressure: (entropy * 0.4 + energy * 0.3 + entanglements * 0.3),
            pressure_level: this.getPressureLevel(entropy * 0.4 + energy * 0.3 + entanglements * 0.3)
        };
    }

    getPressureLevel(pressure) {
        if (pressure > 2.0) return 'extreme';
        if (pressure > 1.5) return 'high';
        if (pressure > 1.0) return 'moderate';
        if (pressure > 0.5) return 'low';
        return 'minimal';
    }
}

// [GLOBE] SERVIDOR HTTP HERMÉTICO
const app = express();
import { QBTC_PORT_MAPPING } from '../config/port-mapping.js';
const PORT = QBTC_PORT_MAPPING.MONITORING.QUANTUM_STATE_MONITOR;

app.use(cors());
app.use(express.json());

const monitor = new QuantumStateMonitor();

// Inicializar monitoreo automáticamente
monitor.startQuantumObservation();

app.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        monitoring: monitor.isObserving,
        consciousness_level: monitor.calculateCoherenceIndex(),
        dimensional_access: monitor.detectDimensionalPortals().portal_active,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/quantum-state', (req, res) => {
    const stats = monitor.getQuantumStatistics();
    res.json({
        success: true,
        data: stats,
        timestamp: Date.now()
    });
});

app.get('/api/lunar-resonances', (req, res) => {
    const resonances = monitor.detectLunarResonances();
    res.json({
        success: true,
        data: resonances,
        timestamp: Date.now()
    });
});

app.get('/api/dimensional-portals', (req, res) => {
    const portals = monitor.detectDimensionalPortals();
    res.json({
        success: true,
        data: portals,
        timestamp: Date.now()
    });
});

app.get('/api/akashic-records', (req, res) => {
    const records = monitor.accessAkashicRecords();
    res.json({
        success: true,
        data: records,
        timestamp: Date.now()
    });
});

app.get('/api/consciousness-evolution', (req, res) => {
    const evolution = monitor.monitorConsciousnessEvolution();
    res.json({
        success: true,
        data: evolution,
        timestamp: Date.now()
    });
});

app.get('/api/hermetic-analysis', (req, res) => {
    const analysis = {
        quantum_state: monitor.getQuantumStatistics(),
        lunar_resonances: monitor.detectLunarResonances(),
        dimensional_portals: monitor.detectDimensionalPortals(),
        akashic_records: monitor.accessAkashicRecords(),
        consciousness_evolution: monitor.monitorConsciousnessEvolution()
    };
    
    res.json({
        success: true,
        data: analysis,
        timestamp: Date.now()
    });
});

app.listen(PORT, () => {
    console.log('[GALAXY] ===============================================');
    console.log('🌑 QUANTUM STATE MONITOR ACTIVATED');
    console.log('[SATELLITE] Monitoring hermetic dimensions...');
    console.log('===============================================');
    console.log(`[CHART] Server running on port ${PORT}`);
    console.log(`[CRYSTAL_BALL] Health: http://localhost:${PORT}/health`);
    console.log(`[MOON] Lunar: http://localhost:${PORT}/api/lunar-resonances`);
    console.log(`[CYCLONE] Portals: http://localhost:${PORT}/api/dimensional-portals`);
    console.log(`📜 Akashic: http://localhost:${PORT}/api/akashic-records`);
    console.log(`[BRAIN] Consciousness: http://localhost:${PORT}/api/consciousness-evolution`);
    console.log('===============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[STOP] Shutting down Quantum State Monitor...');
    monitor.stopQuantumObservation();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[STOP] Shutting down Quantum State Monitor...');
    monitor.stopQuantumObservation();
    process.exit(0);
});

export default QuantumStateMonitor;
