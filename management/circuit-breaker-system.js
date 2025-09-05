// QBTC Circuit Breaker System
// Sistema de protección automática con 3 niveles de emergencia

import EventEmitter from 'events';

export class CircuitBreakerSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Configuración de niveles de riesgo
        this.levels = {
            LEVEL1_WARNING: {
                threshold: 0.012, // 1.2% VaR
                name: 'WARNING',
                color: '🟡',
                actions: ['REDUCE_NEW_POSITIONS', 'INCREASE_MONITORING']
            },
            LEVEL2_CAUTION: {
                threshold: 0.015, // 1.5% VaR
                name: 'CAUTION', 
                color: '🟠',
                actions: ['REDUCE_POSITIONS_25%', 'PAUSE_NEW_ENTRIES', 'ALERT_ADMIN']
            },
            LEVEL3_EMERGENCY: {
                threshold: 0.020, // 2.0% VaR
                name: 'EMERGENCY',
                color: '🔴',
                actions: ['FLATTEN_ALL_POSITIONS', 'EMERGENCY_STOP', 'IMMEDIATE_NOTIFICATION']
            }
        };

        // Estado del sistema
        this.currentLevel = 'NORMAL';
        this.isTripped = false;
        this.lastTripTime = null;
        this.tripHistory = [];
        
        // Configuraciones
        this.emergencyFlattenEnabled = options.emergencyFlattenEnabled !== false;
        this.autoRecoveryEnabled = options.autoRecoveryEnabled !== false;
        this.recoveryThreshold = options.recoveryThreshold || 0.008; // 0.8% para recuperación
        
        // Callbacks para acciones
        this.actionCallbacks = new Map();
        
        console.log('[SIREN] Circuit Breaker System initialized with 3 emergency levels');
    }

    // Verificar estado de riesgo y activar circuit breakers
    checkRiskLevel(riskScore, portfolioValue = 1000000) {
        const riskPercentage = riskScore;
        let triggeredLevel = 'NORMAL';
        let actions = [];

        // Determinar nivel de riesgo
        if (riskPercentage >= this.levels.LEVEL3_EMERGENCY.threshold) {
            triggeredLevel = 'LEVEL3_EMERGENCY';
            actions = this.levels.LEVEL3_EMERGENCY.actions;
        } else if (riskPercentage >= this.levels.LEVEL2_CAUTION.threshold) {
            triggeredLevel = 'LEVEL2_CAUTION';
            actions = this.levels.LEVEL2_CAUTION.actions;
        } else if (riskPercentage >= this.levels.LEVEL1_WARNING.threshold) {
            triggeredLevel = 'LEVEL1_WARNING';
            actions = this.levels.LEVEL1_WARNING.actions;
        }

        // Si cambió el nivel, ejecutar acciones
        if (triggeredLevel !== this.currentLevel) {
            this.handleLevelChange(triggeredLevel, riskPercentage, portfolioValue, actions);
        }

        return {
            currentLevel: this.currentLevel,
            riskScore: riskPercentage,
            actions: actions,
            isTripped: this.isTripped,
            canTrade: this.currentLevel === 'NORMAL' || this.currentLevel === 'LEVEL1_WARNING',
            timestamp: new Date()
        };
    }

    // Manejar cambio de nivel
    handleLevelChange(newLevel, riskScore, portfolioValue, actions) {
        const previousLevel = this.currentLevel;
        this.currentLevel = newLevel;
        
        const levelInfo = this.levels[newLevel] || { name: 'NORMAL', color: '🟢' };
        
        console.log(`${levelInfo.color} CIRCUIT BREAKER: ${previousLevel} → ${levelInfo.name}`);
        console.log(`[CHART] Risk Score: ${(riskScore * 100).toFixed(2)}%`);
        
        // Registrar trip si no es normal
        if (newLevel !== 'NORMAL') {
            this.isTripped = true;
            this.lastTripTime = new Date();
            this.tripHistory.push({
                level: newLevel,
                riskScore,
                timestamp: new Date(),
                portfolioValue
            });
        } else {
            this.isTripped = false;
        }

        // Ejecutar acciones
        this.executeActions(actions, { riskScore, portfolioValue, level: newLevel });

        // Emitir evento
        this.emit('levelChange', {
            previousLevel,
            currentLevel: newLevel,
            riskScore,
            actions,
            timestamp: new Date()
        });
    }

    // Ejecutar acciones automáticas
    async executeActions(actions, context) {
        for (const action of actions) {
            try {
                await this.executeAction(action, context);
            } catch (error) {
                console.error(`[X] Error executing action ${action}:`, error);
            }
        }
    }

    // Ejecutar acción específica
    async executeAction(action, context) {
        console.log(`[WRENCH] Executing action: ${action}`);

        switch (action) {
            case 'REDUCE_NEW_POSITIONS':
                await this.reduceNewPositions(context);
                break;
                
            case 'INCREASE_MONITORING':
                await this.increaseMonitoring(context);
                break;
                
            case 'REDUCE_POSITIONS_25%':
                await this.reducePositions(25, context);
                break;
                
            case 'PAUSE_NEW_ENTRIES':
                await this.pauseNewEntries(context);
                break;
                
            case 'ALERT_ADMIN':
                await this.alertAdmin(context);
                break;
                
            case 'FLATTEN_ALL_POSITIONS':
                await this.flattenAllPositions(context);
                break;
                
            case 'EMERGENCY_STOP':
                await this.emergencyStop(context);
                break;
                
            case 'IMMEDIATE_NOTIFICATION':
                await this.immediateNotification(context);
                break;
                
            default:
                console.log(`[WARNING] Unknown action: ${action}`);
        }

        // Ejecutar callback custom si existe
        const callback = this.actionCallbacks.get(action);
        if (callback) {
            await callback(context);
        }
    }

    // Acciones específicas
    async reduceNewPositions(context) {
        console.log('📉 Reducing new position sizes by 50%');
        this.emit('action', {
            type: 'REDUCE_NEW_POSITIONS',
            reduction: 0.5,
            context
        });
    }

    async increaseMonitoring(context) {
        console.log('👁️ Increasing monitoring frequency');
        this.emit('action', {
            type: 'INCREASE_MONITORING',
            newFrequency: 15, // seconds
            context
        });
    }

    async reducePositions(percentage, context) {
        console.log(`📉 Reducing all positions by ${percentage}%`);
        this.emit('action', {
            type: 'REDUCE_POSITIONS',
            percentage,
            context
        });
    }

    async pauseNewEntries(context) {
        console.log('⏸️ Pausing all new trade entries');
        this.emit('action', {
            type: 'PAUSE_NEW_ENTRIES',
            duration: 300, // 5 minutes
            context
        });
    }

    async alertAdmin(context) {
        console.log('📧 Sending admin alert');
        this.emit('action', {
            type: 'ALERT_ADMIN',
            priority: 'HIGH',
            message: `Risk level ${context.level} triggered at ${(context.riskScore * 100).toFixed(2)}%`,
            context
        });
    }

    async flattenAllPositions(context) {
        if (!this.emergencyFlattenEnabled) {
            console.log('🚫 Emergency flatten disabled - manual intervention required');
            return;
        }

        console.log('🆘 EMERGENCY: Flattening ALL positions');
        this.emit('action', {
            type: 'FLATTEN_ALL_POSITIONS',
            urgency: 'IMMEDIATE',
            reason: 'EMERGENCY_CIRCUIT_BREAKER',
            context
        });
    }

    async emergencyStop(context) {
        console.log('[STOP] EMERGENCY STOP: Halting all trading operations');
        this.emit('action', {
            type: 'EMERGENCY_STOP',
            context
        });
    }

    async immediateNotification(context) {
        console.log('📱 Sending immediate emergency notifications');
        this.emit('action', {
            type: 'IMMEDIATE_NOTIFICATION',
            channels: ['SMS', 'EMAIL', 'SLACK', 'PHONE'],
            message: `QBTC EMERGENCY: Circuit breaker LEVEL 3 activated`,
            context
        });
    }

    // Registrar callback para acción
    registerActionCallback(action, callback) {
        this.actionCallbacks.set(action, callback);
        console.log(`[CHECK] Registered callback for action: ${action}`);
    }

    // Verificar si se puede recuperar
    checkRecovery(currentRiskScore) {
        if (!this.isTripped || !this.autoRecoveryEnabled) {
            return false;
        }

        if (currentRiskScore <= this.recoveryThreshold) {
            console.log('[REFRESH] Circuit breaker recovery conditions met');
            this.handleLevelChange('NORMAL', currentRiskScore, null, []);
            return true;
        }

        return false;
    }

    // Forzar reset manual
    forceReset() {
        console.log('[WRENCH] Manual circuit breaker reset');
        this.currentLevel = 'NORMAL';
        this.isTripped = false;
        this.emit('manualReset', { timestamp: new Date() });
    }

    // Obtener estado completo
    getStatus() {
        return {
            currentLevel: this.currentLevel,
            isTripped: this.isTripped,
            lastTripTime: this.lastTripTime,
            totalTrips: this.tripHistory.length,
            recentTrips: this.tripHistory.slice(-5),
            levels: this.levels,
            recoveryThreshold: this.recoveryThreshold,
            emergencyFlattenEnabled: this.emergencyFlattenEnabled,
            autoRecoveryEnabled: this.autoRecoveryEnabled,
            timestamp: new Date()
        };
    }

    // Obtener estadísticas históricas
    getStatistics() {
        const now = new Date();
        const last24h = this.tripHistory.filter(trip => 
            now - trip.timestamp < 24 * 60 * 60 * 1000
        );

        const levelCounts = {};
        this.tripHistory.forEach(trip => {
            levelCounts[trip.level] = (levelCounts[trip.level] || 0) + 1;
        });

        return {
            totalTrips: this.tripHistory.length,
            tripsLast24h: last24h.length,
            levelCounts,
            averageRecoveryTime: this.calculateAverageRecoveryTime(),
            worstRiskScore: Math.max(...this.tripHistory.map(t => t.riskScore), 0),
            timestamp: new Date()
        };
    }

    // Calcular tiempo promedio de recuperación
    calculateAverageRecoveryTime() {
        const recoveryTimes = [];
        
        for (let i = 0; i < this.tripHistory.length - 1; i++) {
            const trip = this.tripHistory[i];
            const nextTrip = this.tripHistory[i + 1];
            
            // Si hay un gap significativo, asumimos recuperación
            const timeDiff = nextTrip.timestamp - trip.timestamp;
            if (timeDiff > 60000) { // > 1 minuto
                recoveryTimes.push(timeDiff);
            }
        }

        return recoveryTimes.length > 0 
            ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
            : 0;
    }
}

// Servicio de Circuit Breaker
export class CircuitBreakerService {
    constructor(port = 14303) {
        this.port = port;
        this.circuitBreaker = new CircuitBreakerSystem();
        this.isRunning = false;
        
        // Escuchar eventos
        this.circuitBreaker.on('levelChange', (event) => {
            this.handleLevelChange(event);
        });

        this.circuitBreaker.on('action', (action) => {
            this.handleAction(action);
        });
    }

    // Manejar cambios de nivel
    handleLevelChange(event) {
        console.log(`[SIREN] LEVEL CHANGE: ${event.previousLevel} → ${event.currentLevel}`);
        
        // Aquí se integraría con otros sistemas (admin server, notifications, etc.)
    }

    // Manejar acciones
    handleAction(action) {
        console.log(`[CLAPPER] ACTION: ${action.type}`);
        
        // Integración con sistemas de trading, notifications, etc.
        switch (action.type) {
            case 'FLATTEN_ALL_POSITIONS':
                this.notifyTradingEngine('FLATTEN_ALL');
                break;
            case 'EMERGENCY_STOP':
                this.notifyTradingEngine('STOP_ALL');
                break;
            // ... más casos
        }
    }

    // Notificar al motor de trading
    notifyTradingEngine(command) {
        console.log(`[SATELLITE] Notifying trading engine: ${command}`);
        // Aquí se haría la integración real con el Hermetic Auto-Trader
    }

    // API de salud
    getHealthStatus() {
        return {
            service: 'Circuit Breaker Service',
            status: 'healthy',
            port: this.port,
            circuitBreakerStatus: this.circuitBreaker.getStatus(),
            statistics: this.circuitBreaker.getStatistics(),
            timestamp: new Date()
        };
    }
}

export default CircuitBreakerSystem;
