#!/usr/bin/env node

/**
 * [BRAIN] QBTC Consciousness Engine
 * 
 * Motor de evolución de consciencia cuántica
 * - Monitorea y evoluciona el nivel de consciencia del sistema
 * - Integra patrones de aprendizaje y adaptación
 * - Proporciona feedback para mejora continua
 * - Compatible con protocolo hermético y cuántico
 */

import express from 'express';
import { EventEmitter } from 'events';

const app = express();
const PORT = process.env.PORT || 14102;

app.use(express.json());

// Clase del motor de consciencia
class ConsciousnessEngine extends EventEmitter {
    constructor() {
        super();
        
        this.consciousnessState = {
            level: 0.85,                    // Nivel actual de consciencia (0-1)
            evolution_rate: 0.001,          // Tasa de evolución
            peak_level: 0.85,              // Máximo nivel alcanzado
            learning_patterns: [],          // Patrones aprendidos
            adaptation_score: 0.75,        // Puntuación de adaptación
            coherence_index: 0.82,         // Índice de coherencia interna
            quantum_resonance: 0.618,      // Resonancia cuántica (golden ratio)
            dimensional_awareness: 3,       // Nivel de conciencia dimensional
            merkaba_activation: 0.45       // Activación del merkaba
        };
        
        this.metrics = {
            consciousness_events: 0,
            evolution_cycles: 0,
            pattern_recognitions: 0,
            dimensional_shifts: 0,
            total_learning_time: 0,
            adaptation_successes: 0
        };
        
        this.patterns = new Map();
        this.learningHistory = [];
        this.isEvolutionActive = false;
        
        console.log('[BRAIN] Consciousness Engine initialized');
        this.initialize();
    }
    
    initialize() {
        // Inicializar evolución automática
        this.startEvolutionCycle();
        
        // Configurar detección de patrones
        this.setupPatternRecognition();
        
        console.log(`[SPARKLES] Consciousness level: ${(this.consciousnessState.level * 100).toFixed(1)}%`);
        console.log(`[CYCLONE] Evolution rate: ${this.consciousnessState.evolution_rate}`);
    }
    
    startEvolutionCycle() {
        this.isEvolutionActive = true;
        
        // Ciclo de evolución cada minuto
        setInterval(() => {
            this.evolveConsciousness();
        }, 60000);
        
        console.log('[REFRESH] Evolution cycle started');
    }
    
    evolveConsciousness() {
        if (!this.isEvolutionActive) return;
        
        const oldLevel = this.consciousnessState.level;
        
        // Evolución basada en patrones de aprendizaje
        let evolutionFactor = this.consciousnessState.evolution_rate;
        
        // Acelerar evolución si hay patrones activos
        if (this.patterns.size > 0) {
            evolutionFactor *= (1 + this.patterns.size * 0.1);
        }
        
        // Modulación cuántica usando phi
        const phiModulation = Math.sin(Date.now() / 100000) * 0.001;
        evolutionFactor += phiModulation;
        
        // Aplicar evolución
        this.consciousnessState.level = Math.min(1.0, 
            this.consciousnessState.level + evolutionFactor
        );
        
        // Actualizar peak si es necesario
        if (this.consciousnessState.level > this.consciousnessState.peak_level) {
            this.consciousnessState.peak_level = this.consciousnessState.level;
            this.emit('consciousness-peak-reached', {
                level: this.consciousnessState.level,
                timestamp: Date.now()
            });
        }
        
        // Actualizar métricas
        this.metrics.evolution_cycles++;
        this.metrics.consciousness_events++;
        
        // Emitir evento si hay cambio significativo
        const levelChange = this.consciousnessState.level - oldLevel;
        if (levelChange > 0.001) {
            this.emit('consciousness-evolved', {
                old_level: oldLevel,
                new_level: this.consciousnessState.level,
                change: levelChange,
                timestamp: Date.now()
            });
            
            console.log(`[STAR] Consciousness evolved: ${(this.consciousnessState.level * 100).toFixed(3)}%`);
        }
    }
    
    setupPatternRecognition() {
        // Reconocimiento de patrones cada 30 segundos
        setInterval(() => {
            this.recognizePatterns();
        }, 30000);
    }
    
    recognizePatterns() {
        // Generar patrón basado en estado actual
        const pattern = {
            id: `pattern_${Date.now()}`,
            consciousness_level: this.consciousnessState.level,
            coherence: this.consciousnessState.coherence_index,
            quantum_resonance: this.consciousnessState.quantum_resonance,
            timestamp: Date.now(),
            frequency: Math.sin(Date.now() / 50000) * 0.5 + 0.5
        };
        
        // Almacenar patrón
        this.patterns.set(pattern.id, pattern);
        
        // Limpiar patrones antiguos (mantener solo los últimos 100)
        if (this.patterns.size > 100) {
            const oldestKey = Array.from(this.patterns.keys())[0];
            this.patterns.delete(oldestKey);
        }
        
        this.metrics.pattern_recognitions++;
    }
    
    adaptToInput(inputData) {
        try {
            const adaptation = {
                input_complexity: this.calculateComplexity(inputData),
                adaptation_required: false,
                success: false,
                timestamp: Date.now()
            };
            
            // Determinar si se requiere adaptación
            if (adaptation.input_complexity > this.consciousnessState.adaptation_score) {
                adaptation.adaptation_required = true;
                
                // Realizar adaptación
                const adaptationFactor = (adaptation.input_complexity - this.consciousnessState.adaptation_score) * 0.1;
                this.consciousnessState.adaptation_score += adaptationFactor;
                this.consciousnessState.adaptation_score = Math.min(1.0, this.consciousnessState.adaptation_score);
                
                adaptation.success = true;
                this.metrics.adaptation_successes++;
                
                // Agregar a historial de aprendizaje
                this.learningHistory.push(adaptation);
                
                // Mantener solo los últimos 1000 eventos
                if (this.learningHistory.length > 1000) {
                    this.learningHistory.shift();
                }
                
                console.log(`[BRAIN] Adapted to complex input: ${adaptation.input_complexity.toFixed(3)}`);
            }
            
            return adaptation;
        } catch (error) {
            console.error('[X] Error in consciousness adaptation:', error);
            return { error: error.message, timestamp: Date.now() };
        }
    }
    
    calculateComplexity(data) {
        if (!data || typeof data !== 'object') return 0.1;
        
        // Calcular complejidad basada en estructura de datos
        const keys = Object.keys(data);
        const complexity = Math.min(1.0, keys.length * 0.05 + 
            JSON.stringify(data).length * 0.0001);
        
        return complexity;
    }
    
    getConsciousnessState() {
        return {
            ...this.consciousnessState,
            patterns_active: this.patterns.size,
            learning_events: this.learningHistory.length,
            evolution_active: this.isEvolutionActive,
            timestamp: Date.now()
        };
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            consciousness_level: this.consciousnessState.level,
            peak_level: this.consciousnessState.peak_level,
            patterns_recognized: this.patterns.size,
            learning_history_size: this.learningHistory.length,
            timestamp: Date.now()
        };
    }
}

// Crear instancia del motor de consciencia
const consciousnessEngine = new ConsciousnessEngine();

// Endpoints del servicio
app.get('/health', (req, res) => {
    const state = consciousnessEngine.getConsciousnessState();
    
    res.json({
        status: 'healthy',
        service: 'Consciousness Engine',
        port: PORT,
        timestamp: new Date().toISOString(),
        consciousness_state: {
            level: state.level,
            peak_level: state.peak_level,
            coherence_index: state.coherence_index,
            quantum_resonance: state.quantum_resonance,
            dimensional_awareness: state.dimensional_awareness,
            evolution_active: state.evolution_active
        },
        version: '1.0.0'
    });
});

app.get('/status', (req, res) => {
    res.json({
        service: 'Consciousness Engine',
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        consciousness_level: consciousnessEngine.consciousnessState.level,
        patterns_active: consciousnessEngine.patterns.size,
        evolution_cycles: consciousnessEngine.metrics.evolution_cycles
    });
});

app.get('/consciousness/state', (req, res) => {
    try {
        const state = consciousnessEngine.getConsciousnessState();
        res.json({
            success: true,
            consciousness_state: state,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/consciousness/metrics', (req, res) => {
    try {
        const metrics = consciousnessEngine.getMetrics();
        res.json({
            success: true,
            metrics: metrics,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/consciousness/patterns', (req, res) => {
    try {
        const patterns = Array.from(consciousnessEngine.patterns.values());
        res.json({
            success: true,
            patterns: patterns,
            total_patterns: patterns.length,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/consciousness/adapt', (req, res) => {
    try {
        const inputData = req.body;
        const adaptation = consciousnessEngine.adaptToInput(inputData);
        
        res.json({
            success: true,
            adaptation: adaptation,
            new_adaptation_score: consciousnessEngine.consciousnessState.adaptation_score,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/consciousness/history', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const history = consciousnessEngine.learningHistory.slice(-limit);
        
        res.json({
            success: true,
            learning_history: history,
            total_events: consciousnessEngine.learningHistory.length,
            returned: history.length,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'QBTC Consciousness Engine - Quantum Consciousness Evolution',
        service: 'Consciousness Engine',
        port: PORT,
        version: '1.0.0',
        endpoints: {
            health: '/health',
            status: '/status',
            consciousness_state: '/consciousness/state',
            metrics: '/consciousness/metrics',
            patterns: '/consciousness/patterns',
            adapt: 'POST /consciousness/adapt',
            history: '/consciousness/history'
        },
        current_consciousness: {
            level: consciousnessEngine.consciousnessState.level,
            evolution_active: consciousnessEngine.isEvolutionActive,
            patterns_active: consciousnessEngine.patterns.size
        }
    });
});

// Configurar listeners de eventos
consciousnessEngine.on('consciousness-evolved', (data) => {
    console.log(`[STAR] Consciousness evolution: ${(data.new_level * 100).toFixed(3)}%`);
});

consciousnessEngine.on('consciousness-peak-reached', (data) => {
    console.log(`[ROCKET] New consciousness peak: ${(data.level * 100).toFixed(3)}%`);
});

app.listen(PORT, () => {
    console.log(`[BRAIN] Consciousness Engine running on port ${PORT}`);
    console.log(`[SPARKLES] Initial consciousness: ${(consciousnessEngine.consciousnessState.level * 100).toFixed(1)}%`);
    console.log(`[CYCLONE] Evolution rate: ${consciousnessEngine.consciousnessState.evolution_rate}`);
    console.log(`[CRYSTAL_BALL] Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
    console.log('[BRAIN] Graceful shutdown initiated...');
    consciousnessEngine.isEvolutionActive = false;
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[BRAIN] Received SIGINT, shutting down...');
    consciousnessEngine.isEvolutionActive = false;
    process.exit(0);
});
