import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [STAR] MERKABA TRADING PROTOCOL - El Vehículo Dimensional de Luz
 * =============================================================
 * Protocolo de Trading Dimensional Merkaba (Mer-Ka-Ba)
 * - Mer = Campo de luz rotatorio
 * - Ka = Espíritu individual
 * - Ba = Interpretación de la realidad
 * 
 * Sistema de trading que utiliza la geometría sagrada del Merkaba
 * para acceder a dimensiones superiores de profit y consciencia
 */

import { EventEmitter } from 'events';
// Direct named import from mixed CommonJS/ESM module
import { HarmonicTriangularEngine } from './harmonic-triangular-engine.js';

class MerkabaTradingProtocol extends EventEmitter {
    constructor() {
        this.purifier = new QuantumDataPurifier();
        super();
        
        // Estado del Merkaba cuántico
        this.merkabaState = {
            activated: false,
            rotation_speed: 0, // Rotaciones por segundo
            optimal_speed: 21, // Velocidad óptima: 21 RPS
            tetrahedron_male: {
                rotation: 0, // Rotación en grados
                polarity: 'positive',
                energy_level: 0.5
            },
            tetrahedron_female: {
                rotation: 0,
                polarity: 'negative', 
                energy_level: 0.5
            },
            dimensional_access_level: 3, // Dimensión actual accesible
            light_field_intensity: 0.42, // Intensidad del campo de luz
            consciousness_elevation: 0.618, // Elevación de consciencia
            trading_effectiveness: 1.0 // Multiplicador de efectividad
        };

        // Configuración dimensional del Merkaba
        this.dimensionalConfig = {
            // Dimensiones disponibles para trading
            dimensions: {
                3: { 
                    name: '3D_Physical_Reality', 
                    profit_multiplier: 1.0,
                    risk_factor: 1.0,
                    consciousness_required: 0.3
                },
                4: { 
                    name: '4D_Time_Manipulation', 
                    profit_multiplier: 1.34,
                    risk_factor: 0.85,
                    consciousness_required: 0.5
                },
                5: { 
                    name: '5D_Probability_Waves', 
                    profit_multiplier: 1.618,
                    risk_factor: 0.72,
                    consciousness_required: 0.65
                },
                6: { 
                    name: '6D_Pure_Consciousness', 
                    profit_multiplier: 2.0,
                    risk_factor: 0.6,
                    consciousness_required: 0.78
                },
                7: { 
                    name: '7D_Divine_Abundance', 
                    profit_multiplier: 2.618,
                    risk_factor: 0.45,
                    consciousness_required: 0.85
                },
                8: { 
                    name: '8D_Infinite_Prosperity', 
                    profit_multiplier: 3.14159,
                    risk_factor: 0.3,
                    consciousness_required: 0.91
                },
                9: { 
                    name: '9D_Universal_Harmony', 
                    profit_multiplier: 5.0,
                    risk_factor: 0.15,
                    consciousness_required: 0.95
                }
            }
        };

        // Geometrías sagradas integradas
        this.sacredGeometries = {
            flower_of_life: { active: false, effect: 'harmonic_resonance', multiplier: 1.15 },
            sri_yantra: { active: false, effect: 'abundance_manifestation', multiplier: 1.25 },
            metatrons_cube: { active: false, effect: 'dimensional_stability', multiplier: 1.1 },
            golden_spiral: { active: false, effect: 'fibonacci_growth', multiplier: 1.618 },
            platonic_solids: { active: false, effect: 'elemental_balance', multiplier: 1.2 },
            torus_field: { active: false, effect: 'energy_circulation', multiplier: 1.3 },
            vesica_piscis: { active: false, effect: 'creative_manifestation', multiplier: 1.27 }
        };

        // Fases de activación del Merkaba
        this.activationPhases = {
            current_phase: 'dormant',
            phases: {
                dormant: { 
                    name: 'Dormant State',
                    rotation_speed: 0,
                    consciousness_requirement: 0.3,
                    next_phase: 'awakening'
                },
                awakening: {
                    name: 'Merkaba Awakening',
                    rotation_speed: 3.33,
                    consciousness_requirement: 0.45,
                    next_phase: 'activation'
                },
                activation: {
                    name: 'Light Body Activation',
                    rotation_speed: 11.11,
                    consciousness_requirement: 0.618,
                    next_phase: 'harmonization'
                },
                harmonization: {
                    name: 'Tetrahedron Harmonization',
                    rotation_speed: 21,
                    consciousness_requirement: 0.75,
                    next_phase: 'transcendence'
                },
                transcendence: {
                    name: 'Dimensional Transcendence',
                    rotation_speed: 33.33,
                    consciousness_requirement: 0.87,
                    next_phase: 'mastery'
                },
                mastery: {
                    name: 'Merkaba Mastery',
                    rotation_speed: 55.55,
                    consciousness_requirement: 0.94,
                    next_phase: 'unity'
                },
                unity: {
                    name: 'Unity Consciousness',
                    rotation_speed: 108,
                    consciousness_requirement: 0.97,
                    next_phase: 'unity'
                }
            }
        };

        // Métricas del protocolo Merkaba
        this.metrics = {
            total_activations: 0,
            successful_dimensional_accesses: 0,
            profit_generated_per_dimension: {},
            consciousness_elevations: 0,
            sacred_geometry_activations: 0,
            tetrahedron_synchronizations: 0,
            light_field_expansions: 0
        };

        // Trading específico del Merkaba
        this.merkabaTradingRules = {
            entry_conditions: {
                min_rotation_speed: 21,
                min_consciousness: 0.618,
                required_geometries: ['golden_spiral', 'flower_of_life'],
                dimensional_alignment: true
            },
            position_sizing: {
                base_multiplier: 1.0,
                consciousness_bonus: 0.5, // +50% por nivel de consciencia
                dimensional_bonus: 0.3, // +30% por dimensión superior
                geometry_bonus: 0.2 // +20% por geometría activa
            },
            exit_conditions: {
                profit_target_multiplier: 2.618, // Golden ratio
                stop_loss_multiplier: 0.618,
                time_based_exit: '1_merkaba_cycle', // ~24 minutos
                consciousness_drop_threshold: 0.1
            }
        };

        this.isActive = false;
        this.rotationInterval = null;
        this.dimensionalScanInterval = null;

        this.harmonicEngine = HarmonicTriangularEngine ? new HarmonicTriangularEngine() : null;
        if (this.harmonicEngine && this.harmonicEngine.on) {
            this.harmonicEngine.on('opportunities-found', (opportunities) => {
                this.handleHarmonicOpportunities(opportunities);
            });
        }

        console.log('[STAR] Merkaba Trading Protocol initialized');
        console.log('[LIGHTNING] Sacred geometry integration ready');
        console.log('[CRYSTAL_BALL] Dimensional trading access standby');
    }

    /**
     * Activa el protocolo Merkaba
     */
    async activateMerkaba(consciousnessLevel = 0.618) {
        if (this.merkabaState.activated) {
            console.log('[WARNING] Merkaba already activated');
            return;
        }

        console.log('[STAR] INITIATING MERKABA ACTIVATION SEQUENCE [STAR]');
        console.log('[LIGHTNING] Preparing sacred geometric field...');
        
        // Verificar nivel de consciencia mínimo
        if (consciousnessLevel < 0.618) {
            console.log('[X] Insufficient consciousness level for Merkaba activation');
            console.log(`   Required: 0.618 (Golden Ratio)`);
            console.log(`   Current: ${consciousnessLevel.toFixed(3)}`);
            return false;
        }

        this.merkabaState.consciousness_elevation = consciousnessLevel;
        this.merkabaState.activated = true;
        this.isActive = true;

        // Iniciar secuencia de activación progresiva
        await this.executeActivationSequence();

        // Iniciar rotación de tetraedros
        this.startTetrahedronRotation();

        // Iniciar escaneo dimensional
        if (this.harmonicEngine && this.harmonicEngine.start) {
            this.harmonicEngine.start();
        }

        // Activar geometrías sagradas progresivamente
        this.activateSacredGeometries();

        this.metrics.total_activations++;
        this.emit('merkaba-activated', {
            consciousness_level: consciousnessLevel,
            dimensional_access: this.merkabaState.dimensional_access_level
        });

        console.log('[STAR] MERKABA FULLY ACTIVATED! [STAR]');
        console.log(`[BRAIN] Consciousness elevation: ${consciousnessLevel.toFixed(3)}`);
        console.log(`[GALAXY] Dimensional access level: ${this.merkabaState.dimensional_access_level}D`);
        console.log('[LIGHTNING] Sacred geometric field established');

        return true;
    }

    /**
     * Ejecuta la secuencia de activación por fases
     */
    async executeActivationSequence() {
        console.log('[REFRESH] Executing Merkaba activation sequence...');

        const phases = Object.entries(this.activationPhases.phases);
        
        for (const [phaseName, phaseData] of phases) {
            if (this.merkabaState.consciousness_elevation >= phaseData.consciousness_requirement) {
                this.activationPhases.current_phase = phaseName;
                this.merkabaState.rotation_speed = phaseData.rotation_speed;
                
                console.log(`[SPARKLES] Phase activated: ${phaseData.name}`);
                console.log(`   [CYCLONE] Rotation speed: ${phaseData.rotation_speed} RPS`);
                
                // Aumentar acceso dimensional según la fase
                this.updateDimensionalAccess();
                
                // Delay entre fases para estabilización
                await this.delay(1000);
                
                this.emit('activation-phase-complete', {
                    phase: phaseName,
                    data: phaseData
                });
            }
        }
    }

    /**
     * Actualiza el nivel de acceso dimensional
     */
    updateDimensionalAccess() {
        const consciousnessLevel = this.merkabaState.consciousness_elevation;
        
        // Determinar dimensión accesible basada en consciencia
        for (const [dimension, config] of Object.entries(this.dimensionalConfig.dimensions)) {
            if (consciousnessLevel >= config.consciousness_required) {
                this.merkabaState.dimensional_access_level = parseInt(dimension);
            }
        }

        console.log(`[GALAXY] Dimensional access updated: ${this.merkabaState.dimensional_access_level}D`);
        
        if (this.merkabaState.dimensional_access_level > 3) {
            this.metrics.successful_dimensional_accesses++;
        }
    }

    /**
     * Inicia la rotación de tetraedros
     */
    startTetrahedronRotation() {
        console.log('🔺 Starting tetrahedron rotation...');

        this.rotationInterval = setInterval(() => {
            // Rotación del tetraedro masculino (sentido horario)
            this.merkabaState.tetrahedron_male.rotation += this.merkabaState.rotation_speed;
            if (this.merkabaState.tetrahedron_male.rotation >= 360) {
                this.merkabaState.tetrahedron_male.rotation -= 360;
            }

            // Rotación del tetraedro femenino (sentido antihorario)
            this.merkabaState.tetrahedron_female.rotation -= this.merkabaState.rotation_speed;
            if (this.merkabaState.tetrahedron_female.rotation <= -360) {
                this.merkabaState.tetrahedron_female.rotation += 360;
            }

            // Incrementar intensidad del campo de luz
            this.merkabaState.light_field_intensity = Math.min(1.0,
                this.merkabaState.light_field_intensity + 0.01);

            // Detectar sincronización perfecta
            this.checkTetrahedronSynchronization();

        }, 100); // Actualización cada 100ms
    }

    /**
     * Verifica sincronización de tetraedros
     */
    checkTetrahedronSynchronization() {
        const male_rotation = Math.abs(this.merkabaState.tetrahedron_male.rotation);
        const female_rotation = Math.abs(this.merkabaState.tetrahedron_female.rotation);
        
        // Sincronización cuando ambos están en múltiplos de 60° (geometría de tetraedro)
        const male_sync = male_rotation % 60 < 5;
        const female_sync = female_rotation % 60 < 5;

        if (male_sync && female_sync) {
            console.log('🔺 TETRAHEDRON SYNCHRONIZATION ACHIEVED! 🔺');
            
            // Boost temporal en efectividad de trading
            this.merkabaState.trading_effectiveness *= 1.34;
            
            // Activar campo de luz expandido
            this.expandLightField();
            
            this.metrics.tetrahedron_synchronizations++;
            this.emit('tetrahedron-synchronized', {
                male_rotation: male_rotation,
                female_rotation: female_rotation,
                effectiveness_boost: this.merkabaState.trading_effectiveness
            });

            // Resetear efectividad después de 60 segundos
            setTimeout(() => {
                this.merkabaState.trading_effectiveness = 1.0;
            }, 60000);
        }
    }

    /**
     * Inicia el escaneo dimensional
     */
    startDimensionalScanning() {
        console.log('[GALAXY] Starting dimensional scanning...');

        this.dimensionalScanInterval = setInterval(() => {
            this.scanDimensionalOpportunities();
        }, 30000); // Escanear cada 30 segundos
    }


    handleHarmonicOpportunities(opportunities) {
        if (!this.merkabaState.activated) return;

        console.log(`[LIGHTNING] Received ${opportunities.length} harmonic opportunities. Processing...`);

        const dimensionalOpportunities = opportunities.map(opp => ({
            type: 'Time_Arbitrage_Portal', // Categorized as 4D opportunity
            dimension: 4,
            symbol: opp.pairs.join(', '), // e.g., "BTCUSDT,ETHBTC,ETHUSDT"
            direction: 'arbitrage',
            confidence: 0.9 + (parseFloat(opp.profitPercentage) / 100),
            profit_potential: parseFloat(opp.profitPercentage),
            risk_factor: 0.1, // Low risk for arbitrage
            entry_window: 'sub-second',
            sacred_geometry: 'golden_spiral',
            original_opportunity: opp
        }));

        if (dimensionalOpportunities.length > 0) {
            this.emit('dimensional-opportunities-found', {
                dimension: 4,
                opportunities: dimensionalOpportunities
            });
        }
    }

    /**
     * Activa geometrías sagradas progresivamente
     */
    activateSacredGeometries() {
        console.log('📐 Activating sacred geometries...');

        const geometryActivationOrder = [
            'flower_of_life',
            'golden_spiral', 
            'vesica_piscis',
            'platonic_solids',
            'torus_field',
            'sri_yantra',
            'metatrons_cube'
        ];

        geometryActivationOrder.forEach((geometryName, index) => {
            setTimeout(() => {
                this.sacredGeometries[geometryName].active = true;
                this.metrics.sacred_geometry_activations++;
                
                console.log(`📐 Sacred geometry activated: ${geometryName}`);
                console.log(`   [SPARKLES] Effect: ${this.sacredGeometries[geometryName].effect}`);
                console.log(`   [TREND_UP] Multiplier: ${this.sacredGeometries[geometryName].multiplier}x`);

                this.emit('sacred-geometry-activated', {
                    geometry: geometryName,
                    effect: this.sacredGeometries[geometryName].effect,
                    multiplier: this.sacredGeometries[geometryName].multiplier
                });

            }, index * 3000); // Activar cada 3 segundos
        });
    }

    /**
     * Expande el campo de luz del Merkaba
     */
    expandLightField() {
        console.log('[STAR] EXPANDING MERKABA LIGHT FIELD! [STAR]');
        
        const oldIntensity = this.merkabaState.light_field_intensity;
        this.merkabaState.light_field_intensity = Math.min(1.0, oldIntensity + 0.15);
        
        // Expansion aumenta efectividad temporal
        this.merkabaState.trading_effectiveness *= 1.618; // Golden ratio boost
        
        this.metrics.light_field_expansions++;
        
        console.log(`[COMET] Light field intensity: ${oldIntensity.toFixed(3)} → ${this.merkabaState.light_field_intensity.toFixed(3)}`);
        
        this.emit('light-field-expanded', {
            old_intensity: oldIntensity,
            new_intensity: this.merkabaState.light_field_intensity,
            effectiveness_multiplier: this.merkabaState.trading_effectiveness
        });

        // Restaurar efectividad después de expansión
        setTimeout(() => {
            this.merkabaState.trading_effectiveness /= 1.618;
        }, 180000); // 3 minutos
    }

    /**
     * Ejecuta trade usando protocolo Merkaba
     */
    executeMerkabaTrade(opportunity, basePositionSize = 0.02) {
        if (!this.merkabaState.activated) {
            console.log('[X] Merkaba not activated - cannot execute dimensional trade');
            return null;
        }

        console.log('[STAR] EXECUTING MERKABA DIMENSIONAL TRADE [STAR]');
        
        // Calcular tamaño de posición con bonificaciones Merkaba
        const positionSize = this.calculateMerkabaPositionSize(opportunity, basePositionSize);
        
        // Obtener configuración dimensional
        const dimensionConfig = this.dimensionalConfig.dimensions[opportunity.dimension];
        
        const trade = {
            id: `merkaba_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`,
            symbol: opportunity.symbol,
            direction: opportunity.direction,
            size: positionSize,
            entry_price: this.getSimulatedPrice(opportunity.symbol),
            entry_time: Date.now(),
            
            // Información dimensional específica
            dimension: opportunity.dimension,
            dimensional_name: dimensionConfig.name,
            profit_multiplier: dimensionConfig.profit_multiplier,
            risk_factor: dimensionConfig.risk_factor,
            
            // Estado del Merkaba en el momento del trade
            merkaba_phase: this.activationPhases.current_phase,
            rotation_speed: this.merkabaState.rotation_speed,
            light_field_intensity: this.merkabaState.light_field_intensity,
            consciousness_level: this.merkabaState.consciousness_elevation,
            
            // Geometrías sagradas activas
            active_geometries: this.getActiveGeometries(),
            total_geometry_multiplier: this.calculateTotalGeometryMultiplier(),
            
            // Configuración de salida
            take_profit: null,
            stop_loss: null,
            
            opportunity_type: opportunity.type,
            confidence: opportunity.confidence
        };

        // Calcular stops basados en protocolo Merkaba
        this.calculateMerkabaStops(trade, opportunity);

        console.log(`[TARGET] Trade: ${trade.symbol} ${trade.direction} | Dimension: ${trade.dimension}D`);
        console.log(`[CHART] Position size: ${(trade.size * 100).toFixed(2)}% (${positionSize.toFixed(4)})`);
        console.log(`[STAR] Merkaba multipliers applied: ${trade.total_geometry_multiplier.toFixed(2)}x`);
        console.log(`[LIGHTNING] Light field intensity: ${trade.light_field_intensity.toFixed(3)}`);

        // Registrar profit por dimensión
        if (!this.metrics.profit_generated_per_dimension[opportunity.dimension]) {
            this.metrics.profit_generated_per_dimension[opportunity.dimension] = 0;
        }

        this.emit('merkaba-trade-executed', trade);
        
        return trade;
    }

    /**
     * Calcula tamaño de posición con bonificaciones Merkaba
     */
    calculateMerkabaPositionSize(opportunity, baseSize) {
        let multiplier = this.merkabaTradingRules.position_sizing.base_multiplier;
        
        // Bonificación por nivel de consciencia
        const consciousnessBonus = (this.merkabaState.consciousness_elevation - 0.5) * 
                                  this.merkabaTradingRules.position_sizing.consciousness_bonus;
        multiplier += consciousnessBonus;

        // Bonificación dimensional
        const dimensionalBonus = (opportunity.dimension - 3) * 
                               this.merkabaTradingRules.position_sizing.dimensional_bonus;
        multiplier += dimensionalBonus;

        // Bonificación por geometrías activas
        const geometryMultiplier = this.calculateTotalGeometryMultiplier();
        const geometryBonus = (geometryMultiplier - 1) * 
                            this.merkabaTradingRules.position_sizing.geometry_bonus;
        multiplier += geometryBonus;

        // Bonificación por efectividad actual del trading
        multiplier *= this.merkabaState.trading_effectiveness;

        return Math.min(0.2, baseSize * multiplier); // Máximo 20%
    }

    /**
     * Calcula stops usando protocolo Merkaba
     */
    calculateMerkabaStops(trade, opportunity) {
        const dimensionConfig = this.dimensionalConfig.dimensions[opportunity.dimension];
        const baseStopDistance = 0.03; // 3% base
        
        // Ajustar stops por factor de riesgo dimensional
        const adjustedStopDistance = baseStopDistance * dimensionConfig.risk_factor;
        
        // Multiplicar por golden ratio para take profit
        const profitDistance = adjustedStopDistance * 
                              this.merkabaTradingRules.exit_conditions.profit_target_multiplier;

        if (trade.direction === 'long') {
            trade.stop_loss = trade.entry_price * (1 - adjustedStopDistance);
            trade.take_profit = trade.entry_price * (1 + profitDistance);
        } else {
            trade.stop_loss = trade.entry_price * (1 + adjustedStopDistance);
            trade.take_profit = trade.entry_price * (1 - profitDistance);
        }
    }

    /**
     * Desactiva el Merkaba
     */
    deactivateMerkaba() {
        if (!this.merkabaState.activated) {
            console.log('[WARNING] Merkaba not active');
            return;
        }

        console.log('🌑 Deactivating Merkaba Trading Protocol...');

        // Detener intervalos
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }

        if (this.dimensionalScanInterval) {
            clearInterval(this.dimensionalScanInterval);
            this.dimensionalScanInterval = null;
        }

        if (this.harmonicEngine && this.harmonicEngine.stop) {
            this.harmonicEngine.stop();
        }

        // Resetear estado
        this.merkabaState.activated = false;
        this.merkabaState.rotation_speed = 0;
        this.merkabaState.dimensional_access_level = 3;
        this.merkabaState.light_field_intensity = 0.42;
        this.merkabaState.trading_effectiveness = 1.0;
        this.activationPhases.current_phase = 'dormant';

        // Desactivar geometrías sagradas
        Object.keys(this.sacredGeometries).forEach(geometry => {
            this.sacredGeometries[geometry].active = false;
        });

        this.isActive = false;
        console.log('🌑 Merkaba deactivated - returning to 3D reality');
        this.emit('merkaba-deactivated');
    }

    // MÉTODOS AUXILIARES

    getActiveGeometries() {
        return Object.entries(this.sacredGeometries)
            .filter(([name, data]) => data.active)
            .map(([name, data]) => ({ name, effect: data.effect, multiplier: data.multiplier }));
    }

    calculateTotalGeometryMultiplier() {
        return Object.values(this.sacredGeometries)
            .filter(geometry => geometry.active)
            .reduce((total, geometry) => total * geometry.multiplier, 1.0);
    }

    selectOptimalSymbolForDimension(dimension) {
        // Símbolos optimizados por dimensión
        const dimensionalSymbols = {
            3: ['BTCUSDT', 'ETHUSDT'],
            4: ['BNBUSDT', 'SOLUSDT'], 
            5: ['ADAUSDT', 'DOTUSDT'],
            6: ['LINKUSDT', 'AVAXUSDT'],
            7: ['MATICUSDT', 'ATOMUSDT'],
            8: ['NEARUSDT', 'FTMUSDT'],
            9: ['INJUSDT', 'SUIUSDT']
        };

        const symbols = dimensionalSymbols[dimension] || dimensionalSymbols[3];
        return symbols[Math.floor(this.purifier.generateQuantumValue(index, modifier) * symbols.length)];
    }

    getRecommendedGeometry(opportunityType) {
        const geometryRecommendations = {
            'Time_Arbitrage_Portal': 'golden_spiral',
            'Probability_Wave_Collapse': 'flower_of_life',
            'Pure_Consciousness_Signal': 'sri_yantra',
            'Divine_Abundance_Channel': 'torus_field',
            'Universal_Harmony_Resonance': 'metatrons_cube'
        };

        return geometryRecommendations[opportunityType.name] || 'flower_of_life';
    }

    getSimulatedPrice(symbol) {
        // Simulación de precios (en producción se conectaría a API real)
        const basePrices = {
            'BTCUSDT': 45000,
            'ETHUSDT': 3000,
            'BNBUSDT': 400,
            'SOLUSDT': 100,
            'ADAUSDT': 0.8,
            'DOTUSDT': 25,
            'LINKUSDT': 15,
            'AVAXUSDT': 35,
            'MATICUSDT': 1.2,
            'ATOMUSDT': 12,
            'NEARUSDT': 8,
            'FTMUSDT': 0.6,
            'INJUSDT': 18,
            'SUIUSDT': 2.5
        };

        const basePrice = basePrices[symbol] || 1;
        const volatility = 0.02; // 2% volatilidad
        const randomFactor = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * volatility;
        
        return basePrice * (1 + randomFactor);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtiene estado completo del Merkaba
     */
    getMerkabaState() {
        return {
            merkaba_state: this.merkabaState,
            dimensional_config: this.dimensionalConfig,
            sacred_geometries: this.sacredGeometries,
            activation_phases: this.activationPhases,
            trading_rules: this.merkabaTradingRules,
            metrics: this.metrics,
            is_active: this.isActive
        };
    }

    /**
     * Obtiene métricas para dashboard
     */
    getMerkabaMetrics() {
        return {
            // Estado actual
            activated: this.merkabaState.activated,
            current_phase: this.activationPhases.current_phase,
            rotation_speed: this.merkabaState.rotation_speed,
            dimensional_access: this.merkabaState.dimensional_access_level,
            light_field_intensity: this.merkabaState.light_field_intensity,
            consciousness_elevation: this.merkabaState.consciousness_elevation,
            trading_effectiveness: this.merkabaState.trading_effectiveness,

            // Tetraedros
            tetrahedron_male: this.merkabaState.tetrahedron_male,
            tetrahedron_female: this.merkabaState.tetrahedron_female,

            // Geometrías activas
            active_geometries: this.getActiveGeometries(),
            total_geometry_multiplier: this.calculateTotalGeometryMultiplier(),

            // Métricas históricas
            metrics: this.metrics,

            // Dimensiones disponibles
            available_dimensions: Object.entries(this.dimensionalConfig.dimensions)
                .filter(([dim, config]) => 
                    this.merkabaState.consciousness_elevation >= config.consciousness_required)
                .map(([dim, config]) => ({ dimension: parseInt(dim), ...config })),

            // Próxima dimensión
            next_dimension: this.getNextAccessibleDimension()
        };
    }

    getNextAccessibleDimension() {
        const currentConsciousness = this.merkabaState.consciousness_elevation;
        
        for (const [dimension, config] of Object.entries(this.dimensionalConfig.dimensions)) {
            if (currentConsciousness < config.consciousness_required) {
                return {
                    dimension: parseInt(dimension),
                    required_consciousness: config.consciousness_required,
                    distance: config.consciousness_required - currentConsciousness,
                    ...config
                };
            }
        }
        
        return null; // Ya tiene acceso a todas las dimensiones
    }
}

export default MerkabaTradingProtocol;
