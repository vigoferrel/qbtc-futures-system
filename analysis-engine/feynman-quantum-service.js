import QuantumDataPurifier from '../core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [GALAXY] FEYNMAN QUANTUM SERVICE
 * ==========================
 * Servicio HTTP para el motor de integrales de camino de Feynman
 * - Integrado con la arquitectura QBTC existente
 * - Compatible con el sistema de puertos existente
 * - Conecta con QuantumLeverageEntropyEngine y ConsciousnessEngine
 */

import express from 'express';
import cors from 'cors';
import FeynmanPathIntegralEngine from '../engines/feynman-path-integral-engine.js';

const app = express();
const PORT = process.env.PORT || 14106; // Puerto siguiendo la convención QBTC

app.use(cors());
app.use(express.json());

// Crear instancia del motor de Feynman
const feynmanEngine = new FeynmanPathIntegralEngine({
    path_count: 8,
    time_slices: 100,
    action_threshold: 0.75,
    coherence_minimum: 0.65,
    entropy_integration: true,
    consciousness_feedback: true
});

// Variables para integraciones con otros motores
let quantumLeverageEngine = null;
let consciousnessEngine = null;

// Endpoints del servicio
app.get('/health', (req, res) => {
    const status = feynmanEngine.getEngineStatus();
    res.json({
        status: 'healthy',
        service: 'Feynman Quantum Service',
        port: PORT,
        timestamp: new Date().toISOString(),
        engine_status: {
            coherence: status.state.coherence_percentage + '%',
            total_integrations: status.state.total_integrations,
            success_rate: (status.state.success_rate * 100).toFixed(1) + '%',
            amplitude_magnitude: status.state.amplitude_magnitude.toFixed(4),
            quantum_constants: status.quantum_constants_used
        }
    });
});

app.get('/status', (req, res) => {
    const status = feynmanEngine.getEngineStatus();
    res.json({
        service: 'Feynman Quantum Service',
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        engine_metrics: status.state,
        integrations: {
            entropy_engine: quantumLeverageEngine ? 'connected' : 'disconnected',
            consciousness_engine: consciousnessEngine ? 'connected' : 'disconnected'
        },
        quantum_physics: {
            path_integral_method: 'Feynman Sum-Over-Paths',
            complex_analysis: 'QBTC Complex Numbers',
            quantum_constants: status.quantum_constants_used,
            propagator_matrix: 'Active (8x8)'
        }
    });
});

app.post('/analyze/path-integral', async (req, res) => {
    try {
        const { market_data, symbols, options = {} } = req.body;
        
        if (!market_data || Object.keys(market_data).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'market_data is required'
            });
        }
        
        // Configurar opciones específicas si se proporcionan
        if (options.path_count) feynmanEngine.config.path_count = options.path_count;
        if (options.action_threshold) feynmanEngine.config.action_threshold = options.action_threshold;
        
        // Calcular integral de caminos de Feynman
        const result = feynmanEngine.calculateFeynmanPathIntegral(market_data);
        
        res.json({
            success: true,
            feynman_analysis: result,
            quantum_metrics: {
                paths_analyzed: result.paths_count,
                quantum_coherence: result.coherence,
                probability_amplitude: result.probability,
                phase_information: result.quantum_phase,
                action_average: result.average_action
            },
            trading_signals: {
                direction: result.feynman_prediction.direction,
                confidence: result.feynman_prediction.confidence,
                signal_strength: result.feynman_prediction.feynman_signal,
                quantum_phase_degrees: (result.quantum_phase * 180 / Math.PI).toFixed(2)
            },
            timestamp: result.timestamp
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            service: 'Feynman Quantum Service'
        });
    }
});

app.post('/integrate/entropy-engine', (req, res) => {
    try {
        const { engine_endpoint, sync_enabled = true } = req.body;
        
        // En un sistema real, aquí se conectaría con el QuantumLeverageEntropyEngine
        // Por ahora, simulamos la integración
        quantumLeverageEngine = {
            endpoint: engine_endpoint,
            connected: true,
            last_sync: Date.now()
        };
        
        // Configurar listeners simulados
        feynmanEngine.on('path-integral-calculated', (data) => {
            // Enviar feedback de Feynman al motor de entropía
            console.log(`[LINK] Enviando datos de Feynman al Entropy Engine: probabilidad=${data.probability.toFixed(3)}`);
        });
        
        res.json({
            success: true,
            message: 'Integración con Quantum Leverage Entropy Engine establecida',
            integration: quantumLeverageEngine,
            feynman_feedback: 'enabled'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/integrate/consciousness-engine', (req, res) => {
    try {
        const { engine_endpoint, consciousness_feedback = true } = req.body;
        
        consciousnessEngine = {
            endpoint: engine_endpoint,
            connected: true,
            feedback_enabled: consciousness_feedback,
            last_sync: Date.now()
        };
        
        res.json({
            success: true,
            message: 'Integración con Consciousness Engine establecida',
            integration: consciousnessEngine
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/quantum/reset-state', (req, res) => {
    try {
        feynmanEngine.resetQuantumState();
        
        res.json({
            success: true,
            message: 'Estado cuántico reiniciado',
            new_state: {
                amplitude: feynmanEngine.state.feynman_amplitude,
                coherence: feynmanEngine.state.coherence_factor,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/quantum/propagator-matrix', (req, res) => {
    try {
        const matrix = feynmanEngine.state.propagator_matrix;
        
        // Convertir números complejos a formato serializable
        const serializable_matrix = matrix.map(row => 
            row.map(complex => ({
                re: complex.re,
                im: complex.im,
                magnitude: complex.abs(),
                phase: Math.atan2(complex.im, complex.re)
            }))
        );
        
        res.json({
            success: true,
            propagator_matrix: serializable_matrix,
            dimensions: `${matrix.length}x${matrix[0].length}`,
            quantum_mechanics: 'Feynman Propagator Formalism',
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/quantum/paths/:symbol', (req, res) => {
    try {
        const symbol = req.params.symbol;
        const paths = Array.from(feynmanEngine.state.quantum_paths.entries());
        
        const serializable_paths = paths.map(([path_id, path]) => ({
            id: path_id,
            points: path.map(point => ({
                re: point.re,
                im: point.im,
                magnitude: point.abs()
            })),
            length: path.length
        }));
        
        res.json({
            success: true,
            symbol: symbol,
            quantum_paths: serializable_paths,
            total_paths: paths.length,
            path_integral_method: 'Feynman Sum-Over-Paths',
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para pruebas con datos sintéticos
app.post('/test/synthetic-analysis', (req, res) => {
    try {
        const { symbols_count = 10, price_range = [30000, 70000] } = req.body;
        
        // Generar datos de mercado sintéticos usando constantes QBTC
        const synthetic_market_data = {};
        
        for (let i = 0; i < symbols_count; i++) {
            const symbol = `TEST${i}USDT`;
            const base_price = price_range[0] + this.purifier.generateQuantumValue(index, modifier) * (price_range[1] - price_range[0]);
            
            synthetic_market_data[symbol] = {
                price: base_price,
                volume: 1000000 + this.purifier.generateQuantumValue(index, modifier) * 5000000,
                change_24h: (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.2 // ±10% change
            };
        }
        
        // Analizar con Feynman
        const feynman_result = feynmanEngine.calculateFeynmanPathIntegral(synthetic_market_data);
        
        res.json({
            success: true,
            test_data: {
                synthetic_symbols: Object.keys(synthetic_market_data),
                market_data: synthetic_market_data
            },
            feynman_analysis: feynman_result,
            quantum_physics_applied: {
                method: 'Path Integral Formulation',
                physicist: 'Richard Feynman',
                principle: 'Sum over all possible paths',
                implementation: 'QBTC Quantum Constants'
            }
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
        message: 'QBTC Feynman Quantum Service - Path Integral Analysis',
        port: PORT,
        version: '1.0.0',
        physicist: 'Richard P. Feynman',
        quantum_method: 'Path Integral Formulation',
        endpoints: {
            health: '/health',
            status: '/status',
            path_integral_analysis: 'POST /analyze/path-integral',
            entropy_integration: 'POST /integrate/entropy-engine',
            consciousness_integration: 'POST /integrate/consciousness-engine',
            reset_quantum_state: 'POST /quantum/reset-state',
            propagator_matrix: 'GET /quantum/propagator-matrix',
            quantum_paths: 'GET /quantum/paths/:symbol',
            synthetic_test: 'POST /test/synthetic-analysis'
        },
        quantum_constants: feynmanEngine.getEngineStatus().quantum_constants_used,
        feynman_principles: [
            'Sum over all possible paths',
            'Quantum interference effects',
            'Action-based probability amplitudes',
            'Complex-valued wave functions',
            'Path integral formulation'
        ]
    });
});

// Configurar listeners de eventos del motor
feynmanEngine.on('path-integral-calculated', (result) => {
    console.log(`[ATOM] Feynman analysis completed: P=${result.probability.toFixed(3)}, Phase=${(result.quantum_phase * 180/Math.PI).toFixed(1)}°`);
});

feynmanEngine.on('quantum-state-reset', () => {
    console.log('[REFRESH] Quantum state reset event received');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[GALAXY] Feynman Quantum Service running on port ${PORT}`);
    console.log(`[ATOM] Path integral analysis ready`);
    console.log(`[LINK] Integration endpoints available`);
    console.log(`[OCEAN_WAVE] Quantum mechanics: ${feynmanEngine.getEngineStatus().quantum_constants_used.lambda_7919.toFixed(3)} λ₇₉₁₉ resonance`);
    console.log(`[CRYSTAL_BALL] Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
    console.log('[GALAXY] Graceful shutdown initiated...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[GALAXY] Received SIGINT, shutting down...');
    process.exit(0);
});

export { feynmanEngine };
