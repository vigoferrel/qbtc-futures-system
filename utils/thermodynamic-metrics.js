/**
 * QBTC Thermodynamic Metrics Module
 * Implementación de métricas termodinámicas para trading algorítmico cuántico
 * Basado en el paper académico: "Aplicación del Principio de Energía Mínima"
 * Sección 6: Termodinámica Financiera del Portafolio
 */

import { SecureLogger } from './secure-logger.js';

// Constantes termodinámicas fundamentales (del paper)
const THERMODYNAMIC_CONSTANTS = {
    // Constantes físicas normalizadas
    BOLTZMANN_CONSTANT: 1.380649e-23,    // k_B (J/K) normalizada para finanzas
    GAS_CONSTANT: 8.314462618,           // R (J/mol·K)
    AVOGADRO_NUMBER: 6.02214076e23,      // N_A
    
    // Rangos de temperatura del mercado (K)
    MIN_MARKET_TEMPERATURE: 100,         // Mercado "frío" (baja volatilidad)
    MAX_MARKET_TEMPERATURE: 1000,        // Mercado "caliente" (alta volatilidad)
    NORMAL_MARKET_TEMPERATURE: 300,      // Temperatura normal de referencia
    
    // Rangos de eficiencia termodinámica (del paper sección 10.2)
    EFFICIENCY_RANGES: {
        CONSERVATIVE: [0.73, 0.81],
        OPTIMISTIC: [0.85, 0.92],
        EXTREME: [0.95, 0.98]
    },
    
    // Factores de conversión energética
    ENERGY_SCALE_FACTOR: 1000,           // Para escalar energías financieras
    ENTROPY_SCALE_FACTOR: 100,           // Para escalar entropías
    
    // Límites físicos del sistema
    MIN_ENTROPY: 0.01,                   // Entropía mínima (orden perfecto)
    MAX_ENTROPY: 10.0,                   // Entropía máxima (caos total)
    MIN_HEAT_CAPACITY: 0.1,              // Capacidad calorífica mínima
    MAX_HEAT_CAPACITY: 100.0             // Capacidad calorífica máxima
};

export class ThermodynamicMetrics {
    constructor(options = {}) {
        this.logger = new SecureLogger('ThermodynamicMetrics');
        
        // Configuración del sistema termodinámico
        this.config = {
            enableAdvancedMetrics: options.enableAdvancedMetrics !== false,
            enablePhaseAnalysis: options.enablePhaseAnalysis !== false,
            temperatureUpdateInterval: options.temperatureUpdateInterval || 30000, // 30 segundos
            entropyHistoryLength: options.entropyHistoryLength || 100,
            heatCapacityWindow: options.heatCapacityWindow || 20
        };
        
        // Estado termodinámico del sistema
        this.state = {
            // Variables de estado fundamentales (sección 6 del paper)
            temperature: THERMODYNAMIC_CONSTANTS.NORMAL_MARKET_TEMPERATURE,
            entropy: 0.5,                    // S (entropía del portafolio)
            internalEnergy: 0,               // E (energía interna)
            freeEnergy: 0,                   // F = E - TS (Helmholtz)
            enthalpy: 0,                     // H = E + PV
            gibbsFreeEnergy: 0,              // G = H - TS
            
            // Capacidades y propiedades derivadas
            heatCapacity: 0,                 // C_v = ∂E/∂T
            heatCapacityConstantPressure: 0, // C_p = ∂H/∂T
            compressibility: 0,              // κ = -∂V/∂P
            thermalExpansion: 0,             // α = ∂V/∂T
            
            // Métricas de eficiencia (sección 6.1 del paper)
            thermodynamicEfficiency: 0,      // η_trading = Profit/Energy_consumed
            carnot Efficiency: 0,            // η_carnot = 1 - T_cold/T_hot
            conservationIndex: 0,            // |ΔE_total|/E_initial
            
            // Historia para cálculos dinámicos
            temperatureHistory: [],
            entropyHistory: [],
            energyHistory: [],
            
            // Estado del sistema
            phase: 'NORMAL',                 // NORMAL, TRANSITION, CRITICAL
            lastUpdate: Date.now()
        };
        
        // Inicializar sistema termodinámico
        this.initialize();
    }
    
    /**
     * Inicializar sistema de métricas termodinámicas
     */
    initialize() {
        this.logger.info('[🌡️] Inicializando sistema de métricas termodinámicas');
        
        // Configurar monitoreo automático
        if (this.config.enableAdvancedMetrics) {
            this.startAutomaticMonitoring();
        }
        
        this.logger.info(`[🌡️] Sistema termodinámico inicializado - T₀ = ${this.state.temperature.toFixed(2)}K`);
    }
    
    /**
     * Calcular temperatura efectiva del mercado
     * Implementa: T_market = ∂E/∂S = (Volatilidad_promedio / Coherencia_cuántica)
     */
    calculateMarketTemperature(marketData = {}) {
        try {
            const avgVolatility = marketData.averageVolatility || this.estimateAverageVolatility(marketData);
            const quantumCoherence = marketData.quantumCoherence || 0.8;
            
            // Fórmula del paper: T_market = (Volatilidad_promedio / Coherencia_cuántica)
            let temperature = (avgVolatility / quantumCoherence) * THERMODYNAMIC_CONSTANTS.ENERGY_SCALE_FACTOR;
            
            // Aplicar límites físicos
            temperature = Math.max(
                THERMODYNAMIC_CONSTANTS.MIN_MARKET_TEMPERATURE,
                Math.min(THERMODYNAMIC_CONSTANTS.MAX_MARKET_TEMPERATURE, temperature)
            );
            
            // Actualizar estado
            this.state.temperatureHistory.push({
                timestamp: Date.now(),
                temperature,
                volatility: avgVolatility,
                coherence: quantumCoherence
            });
            
            // Mantener historia limitada
            if (this.state.temperatureHistory.length > this.config.entropyHistoryLength) {
                this.state.temperatureHistory.shift();
            }
            
            this.state.temperature = temperature;
            this.state.lastUpdate = Date.now();
            
            this.logger.debug(`[🌡️] Temperatura calculada: ${temperature.toFixed(2)}K (vol=${avgVolatility.toFixed(4)}, coh=${quantumCoherence.toFixed(3)})`);
            
            return temperature;
            
        } catch (error) {
            this.logger.error(`[🌡️] Error calculando temperatura de mercado: ${error.message}`);
            return this.state.temperature;
        }
    }
    
    /**
     * Calcular entropía del portafolio
     * Implementa: S = -k_B Σᵢ pᵢ ln(pᵢ)
     */
    calculatePortfolioEntropy(portfolioData = {}) {
        try {
            // Obtener distribución de probabilidades del portafolio
            const probabilities = portfolioData.probabilities || this.calculateProbabilityDistribution(portfolioData);
            
            if (!probabilities || probabilities.length === 0) {
                this.logger.warn('[🌡️] No hay probabilidades disponibles, usando distribución por defecto');
                // Distribución uniforme por defecto
                const n = 5;
                probabilities = Array(n).fill(1/n);
            }
            
            // Calcular entropía de Shannon: S = -k_B Σᵢ pᵢ ln(pᵢ)
            const kB = THERMODYNAMIC_CONSTANTS.BOLTZMANN_CONSTANT;
            let entropy = 0;
            
            for (const p of probabilities) {
                if (p > 0) {  // Evitar ln(0)
                    entropy -= p * Math.log(p);
                }
            }
            
            // Escalar con constante de Boltzmann normalizada
            entropy *= kB * THERMODYNAMIC_CONSTANTS.ENTROPY_SCALE_FACTOR;
            
            // Aplicar límites físicos
            entropy = Math.max(
                THERMODYNAMIC_CONSTANTS.MIN_ENTROPY,
                Math.min(THERMODYNAMIC_CONSTANTS.MAX_ENTROPY, entropy)
            );
            
            // Actualizar estado
            this.state.entropyHistory.push({
                timestamp: Date.now(),
                entropy,
                probabilities: [...probabilities]
            });
            
            // Mantener historia limitada
            if (this.state.entropyHistory.length > this.config.entropyHistoryLength) {
                this.state.entropyHistory.shift();
            }
            
            this.state.entropy = entropy;
            
            this.logger.debug(`[🌡️] Entropía calculada: ${entropy.toFixed(4)} (distribución: ${probabilities.length} estados)`);
            
            return entropy;
            
        } catch (error) {
            this.logger.error(`[🌡️] Error calculando entropía del portafolio: ${error.message}`);
            return this.state.entropy;
        }
    }
    
    /**
     * Calcular capacidad calorífica del portafolio
     * Implementa: C_v = ∂E/∂T = Σᵢ (∂E_i/∂T_market)
     */
    calculateHeatCapacity(energyData = {}) {
        try {
            if (this.state.temperatureHistory.length < 2 || this.state.energyHistory.length < 2) {
                // No hay suficientes datos para derivada, usar estimación
                return this.estimateHeatCapacity();
            }
            
            // Calcular derivada numérica ∂E/∂T usando ventana deslizante
            const window = Math.min(this.config.heatCapacityWindow, this.state.temperatureHistory.length);
            const recentTemperatures = this.state.temperatureHistory.slice(-window);
            const recentEnergies = this.state.energyHistory.slice(-window);
            
            if (recentTemperatures.length !== recentEnergies.length) {
                throw new Error('Desalineación entre historias de temperatura y energía');
            }
            
            // Calcular capacidad calorífica promedio usando diferencias finitas
            let totalCapacity = 0;
            let validSamples = 0;
            
            for (let i = 1; i < recentTemperatures.length; i++) {
                const dT = recentTemperatures[i].temperature - recentTemperatures[i-1].temperature;
                const dE = recentEnergies[i].energy - recentEnergies[i-1].energy;
                
                if (Math.abs(dT) > 1e-6) {  // Evitar división por cero
                    const capacity = dE / dT;
                    
                    // Filtrar valores extremos
                    if (capacity > THERMODYNAMIC_CONSTANTS.MIN_HEAT_CAPACITY && 
                        capacity < THERMODYNAMIC_CONSTANTS.MAX_HEAT_CAPACITY) {
                        totalCapacity += capacity;
                        validSamples++;
                    }
                }
            }
            
            const heatCapacity = validSamples > 0 ? totalCapacity / validSamples : this.estimateHeatCapacity();
            
            this.state.heatCapacity = heatCapacity;
            
            this.logger.debug(`[🌡️] Capacidad calorífica: C_v = ${heatCapacity.toFixed(4)} (${validSamples} muestras)`);
            
            return heatCapacity;
            
        } catch (error) {
            this.logger.error(`[🌡️] Error calculando capacidad calorífica: ${error.message}`);
            return this.estimateHeatCapacity();
        }
    }
    
    /**
     * Calcular energía libre de Helmholtz
     * Implementa: F = E - TS = Internal_energy - Temperature × Entropy
     */
    calculateHelmholtzFreeEnergy(energyData = {}) {
        const internalEnergy = energyData.internalEnergy || this.state.internalEnergy;
        const temperature = this.state.temperature;
        const entropy = this.state.entropy;
        
        // F = E - TS
        const freeEnergy = internalEnergy - (temperature * entropy);
        
        this.state.freeEnergy = freeEnergy;
        
        this.logger.debug(`[🌡️] Energía libre de Helmholtz: F = ${freeEnergy.toFixed(6)} (E=${internalEnergy.toFixed(4)}, T=${temperature.toFixed(2)}, S=${entropy.toFixed(4)})`);
        
        return freeEnergy;
    }
    
    /**
     * Calcular eficiencia termodinámica del trading
     * Implementa: η_trading = Profit_generated / Energy_consumed
     */
    calculateThermodynamicEfficiency(performanceData = {}) {
        try {
            const profitGenerated = performanceData.profit || 0;
            const energyConsumed = performanceData.energyConsumed || Math.abs(this.state.internalEnergy);
            
            let efficiency = 0;
            
            if (energyConsumed > 0) {
                efficiency = Math.abs(profitGenerated) / energyConsumed;
            } else {
                // Si no hay energía consumida, usar eficiencia por defecto
                efficiency = THERMODYNAMIC_CONSTANTS.EFFICIENCY_RANGES.CONSERVATIVE[0];
            }
            
            // Limitar eficiencia a rangos físicamente posibles
            efficiency = Math.max(0, Math.min(1, efficiency));
            
            this.state.thermodynamicEfficiency = efficiency;
            
            this.logger.debug(`[🌡️] Eficiencia termodinámica: η = ${(efficiency * 100).toFixed(2)}% (P=${profitGenerated.toFixed(4)}, E=${energyConsumed.toFixed(4)})`);
            
            return efficiency;
            
        } catch (error) {
            this.logger.error(`[🌡️] Error calculando eficiencia termodinámica: ${error.message}`);
            return this.state.thermodynamicEfficiency;
        }
    }
    
    /**
     * Calcular índice de conservación energética
     * Implementa: Conservation_Index = |ΔE_total| / E_initial
     */
    calculateEnergyConservationIndex(energyData = {}) {
        try {
            const initialEnergy = energyData.initialEnergy || (this.state.energyHistory[0]?.energy || 0.12);
            const currentEnergy = energyData.currentEnergy || this.state.internalEnergy;
            
            const energyChange = Math.abs(currentEnergy - initialEnergy);
            const conservationIndex = initialEnergy > 0 ? energyChange / initialEnergy : 0;
            
            this.state.conservationIndex = conservationIndex;
            
            this.logger.debug(`[🌡️] Índice de conservación: ${(conservationIndex * 100).toFixed(3)}% (ΔE=${energyChange.toFixed(6)}, E₀=${initialEnergy.toFixed(6)})`);
            
            return conservationIndex;
            
        } catch (error) {
            this.logger.error(`[🌡️] Error calculando índice de conservación: ${error.message}`);
            return this.state.conservationIndex;
        }
    }
    
    /**
     * Determinar rango de eficiencia según condiciones termodinámicas
     */
    determineEfficiencyRange() {
        const temperature = this.state.temperature;
        const entropy = this.state.entropy;
        
        // Clasificar según temperatura y entropía
        if (temperature < 200 && entropy < 2) {
            return THERMODYNAMIC_CONSTANTS.EFFICIENCY_RANGES.EXTREME;
        } else if (temperature < 400 && entropy < 5) {
            return THERMODYNAMIC_CONSTANTS.EFFICIENCY_RANGES.OPTIMISTIC;
        } else {
            return THERMODYNAMIC_CONSTANTS.EFFICIENCY_RANGES.CONSERVATIVE;
        }
    }
    
    /**
     * Detectar transición de fase termodinámica
     */
    detectPhaseTransition() {
        const temperature = this.state.temperature;
        const entropy = this.state.entropy;
        const efficiency = this.state.thermodynamicEfficiency;
        
        let phase = 'NORMAL';
        let transitionDetected = false;
        
        // Detectar fase crítica (alta temperatura, alta entropía)
        if (temperature > 600 && entropy > 7) {
            phase = 'CRITICAL';
            transitionDetected = true;
        }
        // Detectar fase de transición (cambios rápidos)
        else if (this.hasRapidStateChanges()) {
            phase = 'TRANSITION';
            transitionDetected = true;
        }
        
        if (this.state.phase !== phase) {
            this.logger.info(`[🌡️] Transición de fase detectada: ${this.state.phase} → ${phase}`);
            this.state.phase = phase;
        }
        
        return {
            phase,
            transitionDetected,
            temperature,
            entropy,
            efficiency
        };
    }
    
    /**
     * Obtener métricas termodinámicas completas
     */
    getAllMetrics() {
        // Calcular eficiencia de Carnot teórica
        const coldTemp = Math.min(...this.state.temperatureHistory.slice(-10).map(h => h.temperature));
        const hotTemp = Math.max(...this.state.temperatureHistory.slice(-10).map(h => h.temperature));
        const carnotEfficiency = hotTemp > coldTemp ? 1 - (coldTemp / hotTemp) : 0;
        
        return {
            timestamp: new Date().toISOString(),
            
            // Variables de estado fundamentales
            temperature: this.state.temperature,
            entropy: this.state.entropy,
            internalEnergy: this.state.internalEnergy,
            freeEnergy: this.state.freeEnergy,
            
            // Capacidades y propiedades
            heatCapacity: this.state.heatCapacity,
            heatCapacityConstantPressure: this.state.heatCapacityConstantPressure,
            
            // Métricas de eficiencia
            thermodynamicEfficiency: this.state.thermodynamicEfficiency,
            carnotEfficiency: carnotEfficiency,
            conservationIndex: this.state.conservationIndex,
            efficiencyRange: this.determineEfficiencyRange(),
            
            // Estado del sistema
            phase: this.state.phase,
            stability: this.calculateSystemStability(),
            
            // Estadísticas históricas
            temperatureStats: this.calculateTemperatureStats(),
            entropyStats: this.calculateEntropyStats(),
            
            // Diagnósticos
            dataQuality: this.assessDataQuality(),
            lastUpdate: this.state.lastUpdate
        };
    }
    
    /**
     * Actualizar energía interna del sistema
     */
    updateInternalEnergy(energy) {
        this.state.energyHistory.push({
            timestamp: Date.now(),
            energy
        });
        
        // Mantener historia limitada
        if (this.state.energyHistory.length > this.config.entropyHistoryLength) {
            this.state.energyHistory.shift();
        }
        
        this.state.internalEnergy = energy;
        
        // Recalcular energía libre
        this.calculateHelmholtzFreeEnergy();
    }
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    startAutomaticMonitoring() {
        setInterval(() => {
            this.updateMetrics();
        }, this.config.temperatureUpdateInterval);
        
        this.logger.info(`[🌡️] Monitoreo automático iniciado (intervalo: ${this.config.temperatureUpdateInterval}ms)`);
    }
    
    updateMetrics() {
        try {
            // Actualizar métricas básicas
            this.calculateHeatCapacity();
            this.calculateEnergyConservationIndex();
            
            // Detectar transiciones de fase
            if (this.config.enablePhaseAnalysis) {
                this.detectPhaseTransition();
            }
            
        } catch (error) {
            this.logger.error(`[🌡️] Error en actualización automática: ${error.message}`);
        }
    }
    
    estimateAverageVolatility(marketData) {
        // Estimación por defecto si no hay datos
        return marketData.symbols ? 
            Object.values(marketData.symbols).reduce((sum, s) => sum + (s.volatility || 0.02), 0) / Object.keys(marketData.symbols).length :
            0.03; // 3% por defecto
    }
    
    calculateProbabilityDistribution(portfolioData) {
        // Distribución simplificada basada en pesos del portafolio
        if (portfolioData.weights) {
            const total = portfolioData.weights.reduce((sum, w) => sum + Math.abs(w), 0);
            return portfolioData.weights.map(w => Math.abs(w) / total);
        }
        
        // Distribución uniforme por defecto
        const n = portfolioData.assetCount || 5;
        return Array(n).fill(1/n);
    }
    
    estimateHeatCapacity() {
        // Estimación basada en temperatura actual
        const temp = this.state.temperature;
        return Math.max(1.0, Math.min(50.0, temp / 100));
    }
    
    hasRapidStateChanges() {
        if (this.state.temperatureHistory.length < 5) return false;
        
        const recent = this.state.temperatureHistory.slice(-5);
        const tempRange = Math.max(...recent.map(h => h.temperature)) - Math.min(...recent.map(h => h.temperature));
        
        return tempRange > 100; // Cambio de más de 100K es "rápido"
    }
    
    calculateSystemStability() {
        if (this.state.temperatureHistory.length < 3) return 1.0;
        
        const recent = this.state.temperatureHistory.slice(-10);
        const temps = recent.map(h => h.temperature);
        const mean = temps.reduce((sum, t) => sum + t, 0) / temps.length;
        const variance = temps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temps.length;
        const stdDev = Math.sqrt(variance);
        
        // Estabilidad inversamente proporcional a desviación estándar
        return 1.0 / (1.0 + stdDev / mean);
    }
    
    calculateTemperatureStats() {
        if (this.state.temperatureHistory.length === 0) return null;
        
        const temps = this.state.temperatureHistory.map(h => h.temperature);
        return {
            min: Math.min(...temps),
            max: Math.max(...temps),
            mean: temps.reduce((sum, t) => sum + t, 0) / temps.length,
            current: this.state.temperature,
            samples: temps.length
        };
    }
    
    calculateEntropyStats() {
        if (this.state.entropyHistory.length === 0) return null;
        
        const entropies = this.state.entropyHistory.map(h => h.entropy);
        return {
            min: Math.min(...entropies),
            max: Math.max(...entropies),
            mean: entropies.reduce((sum, s) => sum + s, 0) / entropies.length,
            current: this.state.entropy,
            samples: entropies.length
        };
    }
    
    assessDataQuality() {
        const tempHistorySize = this.state.temperatureHistory.length;
        const entropyHistorySize = this.state.entropyHistory.length;
        const energyHistorySize = this.state.energyHistory.length;
        
        let quality = 'GOOD';
        
        if (tempHistorySize < 5 || entropyHistorySize < 5 || energyHistorySize < 5) {
            quality = 'POOR';
        } else if (tempHistorySize < 20 || entropyHistorySize < 20 || energyHistorySize < 20) {
            quality = 'FAIR';
        }
        
        return {
            overall: quality,
            temperatureHistory: tempHistorySize,
            entropyHistory: entropyHistorySize,
            energyHistory: energyHistorySize
        };
    }
}

export default ThermodynamicMetrics;
