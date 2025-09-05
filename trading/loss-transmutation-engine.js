// Sistema de Transmutación Automática de Pérdidas
// Alquimia Financiera Hermética - Convertir Pérdidas en Sabiduría y Oportunidades
// "Solve et Coagula" - Disolver y Coagular

import { EventEmitter } from 'events';

class LossTransmutationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Configuración de Transmutación
            minLossForTransmutation: config.minLossForTransmutation || 100, // USDT mínimo
            transmutationThreshold: config.transmutationThreshold || 0.03, // 3% pérdida
            maxTransmutationsPerHour: config.maxTransmutationsPerHour || 5,
            
            // Configuración Alquímica
            mercuryFactor: config.mercuryFactor || 0.618, // Proporción áurea
            sulfurIntensity: config.sulfurIntensity || 1.414, // Raíz de 2
            saltStability: config.saltStability || 2.718, // Número e
            
            // Configuración de Sabiduría
            wisdomAccumulation: config.wisdomAccumulation || 0.1,
            experienceMultiplier: config.experienceMultiplier || 1.2,
            intuitionBoost: config.intuitionBoost || 0.05,
            
            // Configuración de Regeneración
            phoenixThreshold: config.phoenixThreshold || 0.1, // 10% drawdown
            regenerationPower: config.regenerationPower || 1.5,
            vitalForceRecovery: config.vitalForceRecovery || 0.8,
            
            ...config
        };

        // Estado del Motor de Transmutación
        this.state = {
            isActive: false,
            totalLossesTransmuted: 0,
            wisdomAccumulated: 0,
            transmutationLevel: 1,
            alchemicalExperience: 0,
            phoenixRebirths: 0,
            vitalForce: 100,
            
            // Métricas de Performance
            successfulTransmutations: 0,
            failedTransmutations: 0,
            averageTransmutationTime: 0,
            
            // Estado Alquímico
            mercury: 50, // Fluidez y adaptabilidad
            sulfur: 50,  // Intensidad y transformación
            salt: 50     // Estabilidad y preservación
        };

        // Histórico de Transmutaciones
        this.transmutationHistory = [];
        this.lossPatterns = new Map();
        this.wisdomKnowledge = new Map();
        
        // Contadores
        this.transmutationsThisHour = 0;
        this.lastTransmutationTime = 0;
        
        // Timers
        this.intervals = {
            monitoring: null,
            alchemicalProcess: null,
            wisdomDigestion: null
        };

        console.log('[WIZARD] Sistema de Transmutación Automática de Pérdidas inicializado');
        console.log(`⚗️ Configuración Alquímica:`, {
            mercury: this.config.mercuryFactor,
            sulfur: this.config.sulfurIntensity,  
            salt: this.config.saltStability
        });
    }

    // Activar el motor de transmutación
    activate() {
        if (this.state.isActive) {
            console.log('[WARNING] Motor de transmutación ya está activo');
            return;
        }

        this.state.isActive = true;
        this.startMonitoring();
        this.startAlchemicalProcesses();
        this.startWisdomDigestion();
        
        console.log('[FIRE] Motor de Transmutación Activado - Alquimia financiera iniciada');
        this.emit('transmutation-engine-activated', this.state);
    }

    // Desactivar el motor
    deactivate() {
        this.state.isActive = false;
        this.stopAllProcesses();
        
        console.log('[MOON] Motor de Transmutación Desactivado');
        this.emit('transmutation-engine-deactivated', this.state);
    }

    // Procesar una pérdida para transmutación
    async processLoss(lossData) {
        if (!this.state.isActive) {
            console.log('[WARNING] Motor de transmutación no está activo');
            return null;
        }

        const { amount, symbol, reason, timestamp, metadata = {} } = lossData;
        
        // Validar si la pérdida califica para transmutación
        if (!this.qualifiesForTransmutation(amount, reason)) {
            console.log(`[LIGHTNING] Pérdida de ${amount} USDT no califica para transmutación`);
            return null;
        }

        console.log(`[CRYSTAL_BALL] Iniciando transmutación de pérdida: ${amount} USDT en ${symbol}`);
        
        try {
            // Realizar el proceso de transmutación
            const transmutationResult = await this.performTransmutation({
                amount,
                symbol,
                reason,
                timestamp: timestamp || new Date(),
                metadata
            });
            
            // Actualizar métricas
            this.state.successfulTransmutations++;
            this.state.totalLossesTransmuted += amount;
            this.transmutationsThisHour++;
            this.lastTransmutationTime = Date.now();
            
            // Acumular sabiduría
            await this.accumulateWisdom(transmutationResult);
            
            // Emitir evento
            this.emit('loss-transmuted', transmutationResult);
            
            console.log(`[SPARKLES] Transmutación completada: ${transmutationResult.wisdomGained} puntos de sabiduría`);
            return transmutationResult;
            
        } catch (error) {
            console.error('[X] Error en transmutación:', error);
            this.state.failedTransmutations++;
            this.emit('transmutation-failed', { lossData, error: error.message });
            return null;
        }
    }

    // Verificar si una pérdida califica para transmutación
    qualifiesForTransmutation(amount, reason) {
        // Verificar umbral mínimo
        if (Math.abs(amount) < this.config.minLossForTransmutation) {
            return false;
        }
        
        // Verificar límite de transmutaciones por hora
        if (this.transmutationsThisHour >= this.config.maxTransmutationsPerHour) {
            console.log('⏰ Límite de transmutaciones por hora alcanzado');
            return false;
        }
        
        // Verificar tiempo mínimo entre transmutaciones
        const timeSinceLastTransmutation = Date.now() - this.lastTransmutationTime;
        if (timeSinceLastTransmutation < 60000) { // 1 minuto mínimo
            return false;
        }
        
        return true;
    }

    // Realizar el proceso alquímico de transmutación
    async performTransmutation(lossData) {
        const startTime = Date.now();
        
        // Fase 1: Nigredo - Descomposición de la pérdida
        console.log('🌑 Fase Nigredo: Descomponiendo la pérdida...');
        const dissolvedLoss = await this.nigredoPhase(lossData);
        
        // Fase 2: Albedo - Purificación y extracción de lecciones  
        console.log('🌕 Fase Albedo: Purificando y extrayendo lecciones...');
        const purifiedWisdom = await this.albedoPhase(dissolvedLoss);
        
        // Fase 3: Citrinitas - Iluminación y comprensión
        console.log('🌞 Fase Citrinitas: Iluminando la comprensión...');
        const illuminatedInsight = await this.citrinitasPhase(purifiedWisdom);
        
        // Fase 4: Rubedo - Síntesis y nueva oportunidad
        console.log('🔴 Fase Rubedo: Sintetizando nueva oportunidad...');
        const transmutationResult = await this.rubedoPhase(illuminatedInsight);
        
        // Calcular métricas de transmutación
        const transmutationTime = Date.now() - startTime;
        this.updateAverageTransmutationTime(transmutationTime);
        
        return {
            ...transmutationResult,
            transmutationTime,
            phases: ['nigredo', 'albedo', 'citrinitas', 'rubedo'],
            alchemicalSignature: this.generateAlchemicalSignature(lossData)
        };
    }

    // Fase Nigredo: Descomposición de la pérdida
    async nigredoPhase(lossData) {
        const { amount, symbol, reason, metadata } = lossData;
        
        // Descomponer la pérdida en elementos constituyentes
        const lossElements = {
            magnitude: Math.abs(amount),
            complexity: this.calculateLossComplexity(reason, metadata),
            emotionalImpact: this.calculateEmotionalImpact(amount),
            technicalFactors: this.extractTechnicalFactors(metadata),
            marketConditions: this.analyzeMarketConditions(symbol, metadata)
        };
        
        // Reducir la vitalidad temporalmente
        this.state.vitalForce = Math.max(20, this.state.vitalForce - (amount / 1000));
        
        return {
            originalLoss: lossData,
            elements: lossElements,
            dissolution: {
                mercury: lossElements.complexity * this.config.mercuryFactor,
                sulfur: lossElements.emotionalImpact * this.config.sulfurIntensity,
                salt: lossElements.magnitude * this.config.saltStability
            }
        };
    }

    // Fase Albedo: Purificación y extracción de lecciones
    async albedoPhase(dissolvedLoss) {
        const { elements, dissolution } = dissolvedLoss;
        
        // Extraer lecciones puras de los elementos disueltos
        const lessons = {
            riskManagement: this.extractRiskLessons(elements),
            marketTiming: this.extractTimingLessons(elements),
            emotionalControl: this.extractEmotionalLessons(elements),
            strategyRefinement: this.extractStrategyLessons(elements),
            opportunityRecognition: this.extractOpportunityLessons(elements)
        };
        
        // Purificar mediante filtrado hermético
        const purifiedLessons = this.hermeticFilter(lessons);
        
        return {
            ...dissolvedLoss,
            lessons: purifiedLessons,
            purificationLevel: this.calculatePurificationLevel(purifiedLessons)
        };
    }

    // Fase Citrinitas: Iluminación y comprensión
    async citrinitasPhase(purifiedWisdom) {
        const { lessons, purificationLevel } = purifiedWisdom;
        
        // Iluminar la comprensión profunda
        const insights = {
            patternRecognition: this.illuminatePatterns(lessons),
            futurePreparation: this.illuminateFutureStrategies(lessons),
            consciousnessExpansion: this.expandConsciousness(lessons, purificationLevel),
            intuitiveDevelopment: this.developIntuition(lessons)
        };
        
        // Calcular nivel de iluminación
        const illuminationLevel = this.calculateIlluminationLevel(insights);
        
        return {
            ...purifiedWisdom,
            insights,
            illuminationLevel
        };
    }

    // Fase Rubedo: Síntesis y nueva oportunidad
    async rubedoPhase(illuminatedInsight) {
        const { insights, illuminationLevel, originalLoss } = illuminatedInsight;
        
        // Sintetizar nueva oportunidad de trading
        const newOpportunity = await this.synthesizeOpportunity(insights, illuminationLevel);
        
        // Generar recomendaciones específicas
        const recommendations = this.generateRecommendations(insights, newOpportunity);
        
        // Calcular la sabiduría ganada
        const wisdomGained = this.calculateWisdomGain(illuminationLevel, originalLoss.amount);
        
        // Regenerar vitalidad (Efecto Fénix)
        if (this.shouldTriggerPhoenixRebirth(originalLoss.amount)) {
            await this.triggerPhoenixRebirth();
        }
        
        return {
            originalLoss: originalLoss.amount,
            wisdomGained,
            newOpportunity,
            recommendations,
            alchemicalGain: {
                mercury: insights.patternRecognition * 0.1,
                sulfur: insights.consciousnessExpansion * 0.15,
                salt: insights.futurePreparation * 0.12
            },
            regenerationBonus: this.state.phoenixRebirths > 0 ? this.config.regenerationPower : 1
        };
    }

    // Calcular complejidad de la pérdida
    calculateLossComplexity(reason, metadata) {
        let complexity = 1;
        
        // Factores que aumentan complejidad
        if (reason.includes('liquidation')) complexity += 0.5;
        if (reason.includes('stop-loss')) complexity += 0.3;
        if (reason.includes('market-crash')) complexity += 0.8;
        if (metadata.leverageUsed > 10) complexity += 0.4;
        if (metadata.positions > 5) complexity += 0.2;
        
        return Math.min(complexity, 3); // Máximo 3
    }

    // Calcular impacto emocional
    calculateEmotionalImpact(amount) {
        // El impacto emocional no es lineal con el monto
        return Math.log10(Math.abs(amount) / 100 + 1) * 0.5;
    }

    // Extraer factores técnicos
    extractTechnicalFactors(metadata) {
        return {
            leverage: metadata.leverageUsed || 1,
            positions: metadata.positions || 1,
            timeframe: metadata.timeframe || '1h',
            indicators: metadata.indicators || [],
            marketCondition: metadata.marketCondition || 'neutral'
        };
    }

    // Analizar condiciones de mercado
    analyzeMarketConditions(symbol, metadata) {
        return {
            volatility: metadata.volatility || 0.5,
            trend: metadata.trend || 'sideways',
            volume: metadata.volume || 'normal',
            sentiment: metadata.sentiment || 'neutral'
        };
    }

    // Extraer lecciones de gestión de riesgo
    extractRiskLessons(elements) {
        const lessons = [];
        
        if (elements.technicalFactors.leverage > 10) {
            lessons.push('Reducir apalancamiento en condiciones volátiles');
        }
        
        if (elements.magnitude > 500) {
            lessons.push('Implementar stop-loss más estrictos para posiciones grandes');
        }
        
        if (elements.marketConditions.volatility > 0.7) {
            lessons.push('Ajustar tamaño de posición según volatilidad del mercado');
        }
        
        return lessons;
    }

    // Extraer lecciones de timing
    extractTimingLessons(elements) {
        const lessons = [];
        
        if (elements.marketConditions.trend === 'bearish' && elements.magnitude > 200) {
            lessons.push('Evitar posiciones largas en tendencias bajistas fuertes');
        }
        
        if (elements.technicalFactors.timeframe === '1m') {
            lessons.push('Considerar timeframes más largos para mejor precisión');
        }
        
        return lessons;
    }

    // Extraer lecciones emocionales
    extractEmotionalLessons(elements) {
        const lessons = [];
        
        if (elements.emotionalImpact > 1.5) {
            lessons.push('Implementar técnicas de control emocional antes del trading');
            lessons.push('Considerar pausas después de pérdidas significativas');
        }
        
        return lessons;
    }

    // Filtro hermético para purificar lecciones
    hermeticFilter(lessons) {
        const filtered = {};
        
        for (const [category, categoryLessons] of Object.entries(lessons)) {
            // Aplicar principios herméticos para filtrar lecciones
            filtered[category] = categoryLessons.filter(lesson => {
                // Principio de Correspondencia: "Como arriba, así abajo"
                const hasUniversalApplication = lesson.length > 20;
                
                // Principio de Vibración: Lecciones con alta resonancia
                const hasHighResonance = !lesson.includes('maybe') && !lesson.includes('sometimes');
                
                return hasUniversalApplication && hasHighResonance;
            });
        }
        
        return filtered;
    }

    // Iluminar patrones
    illuminatePatterns(lessons) {
        let patternScore = 0;
        
        // Buscar patrones recurrentes en el historial
        for (const transmutation of this.transmutationHistory.slice(-10)) {
            if (transmutation.lessons) {
                const commonLessons = this.findCommonLessons(lessons, transmutation.lessons);
                patternScore += commonLessons.length * 0.1;
            }
        }
        
        return Math.min(patternScore, 1);
    }

    // Desarrollar intuición
    developIntuition(lessons) {
        const intuitionGrowth = Object.values(lessons)
            .flat()
            .length * this.config.intuitionBoost;
        
        return Math.min(intuitionGrowth, 0.5);
    }

    // Sintetizar nueva oportunidad
    async synthesizeOpportunity(insights, illuminationLevel) {
        const opportunityStrength = illuminationLevel * this.state.wisdomAccumulated * 0.01;
        
        const opportunity = {
            type: 'enhanced-strategy',
            strength: Math.min(opportunityStrength, 1),
            recommendations: {
                riskReduction: insights.patternRecognition * 0.2,
                timingImprovement: insights.futurePreparation * 0.15,
                emotionalMastery: insights.consciousnessExpansion * 0.1,
                intuitionApplication: insights.intuitiveDevelopment * 0.25
            },
            applicableSymbols: this.suggestOptimalSymbols(insights),
            timeframe: this.suggestOptimalTimeframe(insights)
        };
        
        return opportunity;
    }

    // Verificar si debe activar renacimiento del Fénix
    shouldTriggerPhoenixRebirth(lossAmount) {
        const lossPercentage = Math.abs(lossAmount) / 10000; // Asumiendo balance base 10k
        return lossPercentage >= this.config.phoenixThreshold;
    }

    // Activar renacimiento del Fénix
    async triggerPhoenixRebirth() {
        console.log('[FIRE] ACTIVANDO RENACIMIENTO DEL FÉNIX [FIRE]');
        
        this.state.phoenixRebirths++;
        
        // Regenerar vitalidad completamente
        this.state.vitalForce = 100 * this.config.vitalForceRecovery;
        
        // Boost alquímico temporal
        this.state.mercury += 20;
        this.state.sulfur += 25;
        this.state.salt += 15;
        
        // Límites máximos
        this.state.mercury = Math.min(this.state.mercury, 100);
        this.state.sulfur = Math.min(this.state.sulfur, 100);
        this.state.salt = Math.min(this.state.salt, 100);
        
        // Incrementar nivel de transmutación
        this.state.transmutationLevel = Math.floor(this.state.phoenixRebirths / 3) + 1;
        
        this.emit('phoenix-rebirth', {
            rebirthNumber: this.state.phoenixRebirths,
            newVitalForce: this.state.vitalForce,
            transmutationLevel: this.state.transmutationLevel,
            alchemicalBoost: {
                mercury: 20,
                sulfur: 25,
                salt: 15
            }
        });
        
        console.log(`[FIRE] Renacimiento #${this.state.phoenixRebirths} completado - Vitalidad restaurada al ${this.state.vitalForce}%`);
    }

    // Acumular sabiduría
    async accumulateWisdom(transmutationResult) {
        const wisdomGain = transmutationResult.wisdomGained;
        this.state.wisdomAccumulated += wisdomGain;
        this.state.alchemicalExperience += wisdomGain * 0.5;
        
        // Actualizar elementos alquímicos gradualmente
        this.state.mercury += transmutationResult.alchemicalGain.mercury;
        this.state.sulfur += transmutationResult.alchemicalGain.sulfur;
        this.state.salt += transmutationResult.alchemicalGain.salt;
        
        // Mantener límites
        this.state.mercury = Math.min(this.state.mercury, 100);
        this.state.sulfur = Math.min(this.state.sulfur, 100);
        this.state.salt = Math.min(this.state.salt, 100);
        
        // Registrar en histórico
        this.transmutationHistory.push({
            timestamp: new Date(),
            ...transmutationResult
        });
        
        // Mantener histórico limitado
        if (this.transmutationHistory.length > 100) {
            this.transmutationHistory = this.transmutationHistory.slice(-50);
        }
        
        console.log(`[BRAIN] Sabiduría acumulada: ${this.state.wisdomAccumulated.toFixed(2)} puntos`);
    }

    // Calcular ganancia de sabiduría
    calculateWisdomGain(illuminationLevel, lossAmount) {
        const baseLoss = Math.abs(lossAmount);
        const wisdomMultiplier = this.config.wisdomAccumulation * this.config.experienceMultiplier;
        const levelBonus = this.state.transmutationLevel * 0.1;
        
        return (baseLoss / 100) * wisdomMultiplier * illuminationLevel * (1 + levelBonus);
    }

    // Generar recomendaciones específicas
    generateRecommendations(insights, opportunity) {
        const recommendations = [];
        
        if (opportunity.strength > 0.7) {
            recommendations.push({
                type: 'strategy-enhancement',
                priority: 'high',
                action: 'Implementar nueva estrategia mejorada basada en lecciones transmutadas',
                details: opportunity.recommendations
            });
        }
        
        if (insights.patternRecognition > 0.5) {
            recommendations.push({
                type: 'pattern-application',
                priority: 'medium',
                action: 'Aplicar reconocimiento de patrones mejorado en próximas operaciones',
                patterns: 'Patrones identificados durante transmutación'
            });
        }
        
        if (insights.consciousnessExpansion > 0.4) {
            recommendations.push({
                type: 'consciousness-integration',
                priority: 'medium',
                action: 'Integrar consciencia expandida en proceso de toma de decisiones'
            });
        }
        
        return recommendations;
    }

    // Iniciar monitoreo
    startMonitoring() {
        this.intervals.monitoring = setInterval(() => {
            this.performMaintenanceCheck();
        }, 30000); // Cada 30 segundos
        
        // Resetear contador de transmutaciones cada hora
        setInterval(() => {
            this.transmutationsThisHour = 0;
        }, 3600000);
    }

    // Iniciar procesos alquímicos
    startAlchemicalProcesses() {
        this.intervals.alchemicalProcess = setInterval(() => {
            this.performAlchemicalMaintenance();
        }, 60000); // Cada minuto
    }

    // Iniciar digestión de sabiduría
    startWisdomDigestion() {
        this.intervals.wisdomDigestion = setInterval(() => {
            this.digestAccumulatedWisdom();
        }, 300000); // Cada 5 minutos
    }

    // Mantenimiento alquímico
    performAlchemicalMaintenance() {
        // Regeneración natural gradual
        if (this.state.vitalForce < 100) {
            this.state.vitalForce = Math.min(100, this.state.vitalForce + 0.5);
        }
        
        // Balance alquímico natural
        const targetBalance = 50;
        this.state.mercury += (targetBalance - this.state.mercury) * 0.01;
        this.state.sulfur += (targetBalance - this.state.sulfur) * 0.01;
        this.state.salt += (targetBalance - this.state.salt) * 0.01;
    }

    // Digerir sabiduría acumulada
    digestAccumulatedWisdom() {
        if (this.state.wisdomAccumulated > 10) {
            // Convertir sabiduría en experiencia alquímica
            const wisdomToDigest = this.state.wisdomAccumulated * 0.1;
            this.state.alchemicalExperience += wisdomToDigest;
            this.state.wisdomAccumulated -= wisdomToDigest;
            
            console.log(`[WIZARD] Sabiduría digerida: ${wisdomToDigest.toFixed(2)} → Experiencia Alquímica`);
        }
    }

    // Realizar chequeo de mantenimiento
    performMaintenanceCheck() {
        if (!this.state.isActive) return;
        
        // Verificar integridad del sistema
        const integrity = this.calculateSystemIntegrity();
        
        if (integrity < 0.8) {
            console.log('[WARNING] Integridad del sistema baja, realizando auto-reparación...');
            this.performSelfRepair();
        }
        
        // Emitir estado actual
        this.emit('transmutation-status', this.getSystemStatus());
    }

    // Calcular integridad del sistema
    calculateSystemIntegrity() {
        const vitalityScore = this.state.vitalForce / 100;
        const balanceScore = 1 - Math.abs(this.state.mercury + this.state.sulfur + this.state.salt - 150) / 150;
        const experienceScore = Math.min(this.state.alchemicalExperience / 100, 1);
        
        return (vitalityScore + balanceScore + experienceScore) / 3;
    }

    // Auto-reparación del sistema
    performSelfRepair() {
        // Rebalancear elementos alquímicos
        const average = (this.state.mercury + this.state.sulfur + this.state.salt) / 3;
        
        this.state.mercury += (average - this.state.mercury) * 0.1;
        this.state.sulfur += (average - this.state.sulfur) * 0.1;  
        this.state.salt += (average - this.state.salt) * 0.1;
        
        // Restaurar vitalidad parcialmente
        this.state.vitalForce = Math.min(100, this.state.vitalForce + 5);
        
        console.log('[WRENCH] Auto-reparación completada');
    }

    // Obtener estado del sistema
    getSystemStatus() {
        return {
            isActive: this.state.isActive,
            vitalForce: this.state.vitalForce,
            transmutationLevel: this.state.transmutationLevel,
            wisdomAccumulated: this.state.wisdomAccumulated,
            alchemicalExperience: this.state.alchemicalExperience,
            phoenixRebirths: this.state.phoenixRebirths,
            
            alchemicalBalance: {
                mercury: this.state.mercury,
                sulfur: this.state.sulfur,
                salt: this.state.salt
            },
            
            performance: {
                successfulTransmutations: this.state.successfulTransmutations,
                failedTransmutations: this.state.failedTransmutations,
                totalLossesTransmuted: this.state.totalLossesTransmuted,
                averageTransmutationTime: this.state.averageTransmutationTime
            },
            
            systemIntegrity: this.calculateSystemIntegrity(),
            transmutationsThisHour: this.transmutationsThisHour
        };
    }

    // Generar firma alquímica única
    generateAlchemicalSignature(lossData) {
        const { amount, symbol, reason } = lossData;
        const signature = `${symbol}-${Math.abs(amount)}-${reason.slice(0,3)}-${this.state.transmutationLevel}`;
        return signature.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    // Métodos auxiliares
    updateAverageTransmutationTime(newTime) {
        if (this.state.averageTransmutationTime === 0) {
            this.state.averageTransmutationTime = newTime;
        } else {
            this.state.averageTransmutationTime = 
                (this.state.averageTransmutationTime * 0.8) + (newTime * 0.2);
        }
    }

    calculatePurificationLevel(purifiedLessons) {
        const totalLessons = Object.values(purifiedLessons).flat().length;
        return Math.min(totalLessons / 10, 1);
    }

    calculateIlluminationLevel(insights) {
        const totalInsights = Object.values(insights).reduce((sum, val) => sum + val, 0);
        return Math.min(totalInsights / 2, 1);
    }

    findCommonLessons(currentLessons, historicalLessons) {
        const current = Object.values(currentLessons).flat();
        const historical = Object.values(historicalLessons).flat();
        
        return current.filter(lesson => 
            historical.some(hLesson => 
                this.calculateStringSimilarity(lesson, hLesson) > 0.8
            )
        );
    }

    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    suggestOptimalSymbols(insights) {
        // Sugerir símbolos basados en insights
        const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'];
        
        if (insights.patternRecognition > 0.7) {
            symbols.push('SOL/USDT', 'MATIC/USDT');
        }
        
        return symbols;
    }

    suggestOptimalTimeframe(insights) {
        if (insights.consciousnessExpansion > 0.6) {
            return '4h'; // Timeframe más largo para mayor consciencia
        } else if (insights.patternRecognition > 0.7) {
            return '1h'; // Timeframe medio para patrones
        }
        return '15m'; // Timeframe por defecto
    }

    extractStrategyLessons(elements) {
        const lessons = [];
        
        if (elements.technicalFactors.indicators.length < 3) {
            lessons.push('Incorporar más indicadores técnicos para confirmación');
        }
        
        if (elements.marketConditions.volume === 'low') {
            lessons.push('Evitar trading en condiciones de bajo volumen');
        }
        
        return lessons;
    }

    extractOpportunityLessons(elements) {
        const lessons = [];
        
        if (elements.marketConditions.sentiment === 'fear') {
            lessons.push('Las oportunidades mejores aparecen durante el miedo del mercado');
        }
        
        if (elements.complexity > 2) {
            lessons.push('Simplificar estrategias en mercados complejos');
        }
        
        return lessons;
    }

    expandConsciousness(lessons, purificationLevel) {
        const totalLessons = Object.values(lessons).flat().length;
        return totalLessons * purificationLevel * 0.1;
    }

    illuminateFutureStrategies(lessons) {
        const strategicLessons = lessons.strategyRefinement || [];
        return strategicLessons.length * 0.15;
    }

    // Detener todos los procesos
    stopAllProcesses() {
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        
        this.intervals = {
            monitoring: null,
            alchemicalProcess: null,
            wisdomDigestion: null
        };
    }

    // Destructor
    destroy() {
        this.deactivate();
        this.removeAllListeners();
        console.log('[WIZARD] Motor de Transmutación de Pérdidas destruido');
    }
}

export default LossTransmutationEngine;
