/**
 * QBTC Variational Quantum Optimizer
 * Implementación de optimización variacional cuántica para trading algorítmico
 * Basado en el paper académico: "Aplicación del Principio de Energía Mínima"
 * Sección 13: Implementación Algorítmica - Solver de Energía Mínima
 */

import { EventEmitter } from 'events';
import { SecureLogger } from './secure-logger.js';

// Constantes para optimización variacional (del paper académico)
const VARIATIONAL_CONSTANTS = {
    // Parámetros de convergencia (sección 13.1)
    DEFAULT_MAX_ITERATIONS: 1000,
    DEFAULT_CONVERGENCE_THRESHOLD: 1e-8,
    DEFAULT_LEARNING_RATE: 0.01,
    DEFAULT_DAMPING_FACTOR: 0.1,
    
    // Constantes físicas normalizadas
    PLANCK_REDUCED: 1.0545718e-34,      // ℏ normalizada
    ELECTRON_MASS: 9.1093837015e-31,    // m_e normalizada
    
    // Parámetros de evolución unitaria (ecuación de Schrödinger)
    DEFAULT_TIME_STEP: 0.001,           // dt para evolución temporal
    MAX_TIME_STEP: 0.1,                 // Límite superior para estabilidad
    MIN_TIME_STEP: 1e-6,                // Límite inferior
    
    // Parámetros de optimización
    GRADIENT_EPSILON: 1e-6,             // ε para diferencias finitas
    HESSIAN_EPSILON: 1e-4,              // ε para segunda derivada
    MOMENTUM_BETA: 0.9,                 // β para optimización momentum
    ADAM_BETA1: 0.9,                    // β₁ para Adam
    ADAM_BETA2: 0.999,                  // β₂ para Adam
    ADAM_EPSILON: 1e-8,                 // ε para Adam
    
    // Límites numéricos
    MAX_EIGENVALUE: 1000,               // Máximo eigenvalor permitido
    MIN_EIGENVALUE: -1000,              // Mínimo eigenvalor permitido
    MAX_MATRIX_CONDITION: 1e12,         // Número de condición máximo
    NUMERICAL_ZERO: 1e-14,              // Cero numérico
    
    // Configuración de estados cuánticos
    DEFAULT_STATE_DIMENSION: 10,        // Dimensión por defecto del espacio de Hilbert
    MAX_STATE_DIMENSION: 1000,          // Dimensión máxima
    DEFAULT_NUM_EIGENSTATES: 5          // Número de eigenstados a calcular
};

export class VariationalOptimizer extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.logger = new SecureLogger('VariationalOptimizer');
        
        // Configuración del optimizador
        this.config = {
            // Parámetros de optimización
            maxIterations: options.maxIterations || VARIATIONAL_CONSTANTS.DEFAULT_MAX_ITERATIONS,
            convergenceThreshold: options.convergenceThreshold || VARIATIONAL_CONSTANTS.DEFAULT_CONVERGENCE_THRESHOLD,
            learningRate: options.learningRate || VARIATIONAL_CONSTANTS.DEFAULT_LEARNING_RATE,
            dampingFactor: options.dampingFactor || VARIATIONAL_CONSTANTS.DEFAULT_DAMPING_FACTOR,
            
            // Configuración de evolución temporal
            timeStep: options.timeStep || VARIATIONAL_CONSTANTS.DEFAULT_TIME_STEP,
            adaptiveTimeStep: options.adaptiveTimeStep !== false,
            maxTimeStep: options.maxTimeStep || VARIATIONAL_CONSTANTS.MAX_TIME_STEP,
            minTimeStep: options.minTimeStep || VARIATIONAL_CONSTANTS.MIN_TIME_STEP,
            
            // Método de optimización
            optimizationMethod: options.optimizationMethod || 'ADAM',  // 'SGD', 'MOMENTUM', 'ADAM', 'BFGS'
            
            // Configuración de matriz
            stateDimension: options.stateDimension || VARIATIONAL_CONSTANTS.DEFAULT_STATE_DIMENSION,
            numEigenStates: options.numEigenStates || VARIATIONAL_CONSTANTS.DEFAULT_NUM_EIGENSTATES,
            
            // Opciones avanzadas
            enableHessian: options.enableHessian === true,
            enableMomentum: options.enableMomentum !== false,
            enableAdaptiveLearningRate: options.enableAdaptiveLearningRate !== false,
            
            // Monitoreo
            enableDetailedLogging: options.enableDetailedLogging === true,
            logInterval: options.logInterval || 100
        };
        
        // Estado del optimizador
        this.state = {
            // Estado de optimización
            currentIteration: 0,
            converged: false,
            bestEnergy: Infinity,
            currentEnergy: Infinity,
            energyHistory: [],
            gradientNorm: Infinity,
            
            // Estados cuánticos
            currentState: null,
            groundState: null,
            eigenStates: [],
            eigenValues: [],
            
            // Matrices del sistema
            hamiltonian: null,
            densityMatrix: null,
            evolutionOperator: null,
            
            // Optimización
            gradientHistory: [],
            momentum: null,
            adamM: null,
            adamV: null,
            learningRateHistory: [],
            
            // Estadísticas
            totalComputationTime: 0,
            averageIterationTime: 0,
            lastOptimizationTime: null
        };
        
        this.initialize();
    }
    
    /**
     * Inicializar optimizador variacional
     */
    initialize() {
        this.logger.info('[🔬] Inicializando Optimizador Variacional Cuántico');
        this.logger.info(`[🔬] Dimensión del estado: ${this.config.stateDimension}`);
        this.logger.info(`[🔬] Método de optimización: ${this.config.optimizationMethod}`);
        this.logger.info(`[🔬] Umbral de convergencia: ${this.config.convergenceThreshold}`);
        
        // Inicializar matrices y vectores
        this.initializeMatrices();
        
        // Inicializar optimizadores específicos
        this.initializeOptimizers();
        
        this.logger.info('[🔬] Optimizador variacional inicializado');
    }
    
    /**
     * Encontrar el estado fundamental del sistema
     * Implementa E_ground = min⟨Ψ|H|Ψ⟩ sujeto a ⟨Ψ|Ψ⟩ = 1
     */
    async findGroundState(hamiltonian, initialState = null) {
        const startTime = Date.now();
        
        this.logger.info('[🔬] Iniciando búsqueda del estado fundamental');
        
        try {
            // Validar y preparar Hamiltoniano
            this.state.hamiltonian = this.validateHamiltonian(hamiltonian);
            
            // Inicializar estado si no se proporciona
            if (!initialState) {
                initialState = this.generateRandomState(this.config.stateDimension);
            }
            
            // Normalizar estado inicial
            this.state.currentState = this.normalizeState(initialState);
            
            // Resetear estado de optimización
            this.resetOptimizationState();
            
            // Ejecutar optimización variacional
            const result = await this.executeVariationalOptimization();
            
            // Calcular tiempo total
            const computationTime = Date.now() - startTime;
            this.state.totalComputationTime = computationTime;
            this.state.averageIterationTime = computationTime / this.state.currentIteration;
            this.state.lastOptimizationTime = Date.now();
            
            this.logger.info(`[🔬] Estado fundamental encontrado en ${this.state.currentIteration} iteraciones`);
            this.logger.info(`[🔬] Energía final: ${result.energy.toFixed(8)} unidades`);
            this.logger.info(`[🔬] Tiempo de cómputo: ${computationTime}ms`);
            
            // Emitir evento de completion
            this.emit('ground_state_found', result);
            
            return result;
            
        } catch (error) {
            this.logger.error(`[🔬] Error en búsqueda del estado fundamental: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Calcular evolución temporal según la ecuación de Schrödinger
     * Implementa iℏ ∂|Ψ⟩/∂t = H|Ψ⟩
     */
    evolveQuantumState(initialState, timeStep = null, numSteps = 1) {
        const dt = timeStep || this.config.timeStep;
        const hbar = VARIATIONAL_CONSTANTS.PLANCK_REDUCED;
        
        try {
            let currentState = [...initialState];
            const evolutionHistory = [{ time: 0, state: [...currentState] }];
            
            for (let step = 1; step <= numSteps; step++) {
                // Calcular operador de evolución unitaria: U = exp(-iHt/ℏ)
                const evolutionOperator = this.calculateEvolutionOperator(dt);
                
                // Aplicar evolución: |Ψ(t+dt)⟩ = U|Ψ(t)⟩
                currentState = this.applyUnitaryOperator(evolutionOperator, currentState);
                
                // Normalizar estado para mantener unitaridad
                currentState = this.normalizeState(currentState);
                
                // Registrar historia si se requiere
                if (step % Math.max(1, Math.floor(numSteps / 10)) === 0) {
                    evolutionHistory.push({
                        time: step * dt,
                        state: [...currentState],
                        energy: this.calculateExpectationValue(this.state.hamiltonian, currentState)
                    });
                }
            }
            
            this.logger.debug(`[🔬] Evolución cuántica completada: ${numSteps} pasos, dt=${dt.toFixed(6)}`);
            
            return {
                finalState: currentState,
                evolutionHistory,
                totalTime: numSteps * dt,
                timeStep: dt,
                steps: numSteps
            };
            
        } catch (error) {
            this.logger.error(`[🔬] Error en evolución cuántica: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Diagonalizar Hamiltoniano para encontrar eigenestados
     * det(H - λI) = 0
     */
    diagonalizeHamiltonian(hamiltonian = null) {
        const H = hamiltonian || this.state.hamiltonian;
        
        if (!H) {
            throw new Error('Hamiltoniano no disponible para diagonalización');
        }
        
        try {
            this.logger.debug('[🔬] Iniciando diagonalización del Hamiltoniano');
            
            // Verificar que la matriz sea hermítica
            if (!this.isHermitian(H)) {
                this.logger.warn('[🔬] Hamiltoniano no es hermítico, usando parte hermítica');
                H = this.makeHermitian(H);
            }
            
            // Realizar diagonalización (implementación simplificada)
            const diagonalization = this.performEigendecomposition(H);
            
            // Ordenar eigenvalores y eigenvectores
            const sortedResults = this.sortEigenResults(diagonalization.eigenValues, diagonalization.eigenVectors);
            
            // Actualizar estado
            this.state.eigenValues = sortedResults.eigenValues;
            this.state.eigenStates = sortedResults.eigenVectors;
            this.state.groundState = sortedResults.eigenVectors[0];
            this.state.bestEnergy = sortedResults.eigenValues[0];
            
            this.logger.info(`[🔬] Diagonalización completada`);
            this.logger.info(`[🔬] Estado fundamental: E₀ = ${this.state.bestEnergy.toFixed(8)}`);
            this.logger.info(`[🔬] Gap energético: ΔE = ${(sortedResults.eigenValues[1] - sortedResults.eigenValues[0]).toFixed(8)}`);
            
            return {
                eigenValues: this.state.eigenValues,
                eigenVectors: this.state.eigenStates,
                groundState: this.state.groundState,
                groundEnergy: this.state.bestEnergy
            };
            
        } catch (error) {
            this.logger.error(`[🔬] Error en diagonalización: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Ejecutar optimización variacional
     */
    async executeVariationalOptimization() {
        this.logger.info(`[🔬] Ejecutando optimización variacional (método: ${this.config.optimizationMethod})`);
        
        let converged = false;
        
        while (this.state.currentIteration < this.config.maxIterations && !converged) {
            const iterationStartTime = Date.now();
            
            // Calcular energía actual
            const currentEnergy = this.calculateExpectationValue(this.state.hamiltonian, this.state.currentState);
            this.state.currentEnergy = currentEnergy;
            this.state.energyHistory.push(currentEnergy);
            
            // Calcular gradiente
            const gradient = this.calculateEnergyGradient(this.state.currentState);
            const gradientNorm = this.calculateVectorNorm(gradient);
            this.state.gradientNorm = gradientNorm;
            this.state.gradientHistory.push(gradient);
            
            // Verificar convergencia
            if (gradientNorm < this.config.convergenceThreshold) {
                converged = true;
                this.state.converged = true;
                break;
            }
            
            // Actualizar estado usando método seleccionado
            this.state.currentState = this.updateStateWithOptimizer(this.state.currentState, gradient);
            
            // Normalizar estado
            this.state.currentState = this.normalizeState(this.state.currentState);
            
            // Actualizar mejor energía
            if (currentEnergy < this.state.bestEnergy) {
                this.state.bestEnergy = currentEnergy;
                this.state.groundState = [...this.state.currentState];
            }
            
            this.state.currentIteration++;
            
            // Log progreso
            if (this.config.enableDetailedLogging && this.state.currentIteration % this.config.logInterval === 0) {
                const iterationTime = Date.now() - iterationStartTime;
                this.logger.debug(`[🔬] Iter ${this.state.currentIteration}: E=${currentEnergy.toFixed(8)}, |∇E|=${gradientNorm.toFixed(8)}, t=${iterationTime}ms`);
            }
            
            // Emitir progreso
            this.emit('optimization_progress', {
                iteration: this.state.currentIteration,
                energy: currentEnergy,
                gradientNorm: gradientNorm,
                converged: converged
            });
        }
        
        return {
            converged: this.state.converged,
            iterations: this.state.currentIteration,
            energy: this.state.bestEnergy,
            groundState: this.state.groundState,
            gradientNorm: this.state.gradientNorm,
            energyHistory: [...this.state.energyHistory]
        };
    }
    
    /**
     * Calcular gradiente de energía para optimización variacional
     */
    calculateEnergyGradient(state) {
        const epsilon = VARIATIONAL_CONSTANTS.GRADIENT_EPSILON;
        const gradient = new Array(state.length).fill(0);
        
        const baseEnergy = this.calculateExpectationValue(this.state.hamiltonian, state);
        
        for (let i = 0; i < state.length; i++) {
            // Perturbación hacia adelante
            const stateForward = [...state];
            stateForward[i] += epsilon;
            const normalizedForward = this.normalizeState(stateForward);
            const energyForward = this.calculateExpectationValue(this.state.hamiltonian, normalizedForward);
            
            // Perturbación hacia atrás
            const stateBackward = [...state];
            stateBackward[i] -= epsilon;
            const normalizedBackward = this.normalizeState(stateBackward);
            const energyBackward = this.calculateExpectationValue(this.state.hamiltonian, normalizedBackward);
            
            // Diferencia finita centrada
            gradient[i] = (energyForward - energyBackward) / (2 * epsilon);
        }
        
        return gradient;
    }
    
    /**
     * Actualizar estado usando el optimizador seleccionado
     */
    updateStateWithOptimizer(state, gradient) {
        switch (this.config.optimizationMethod) {
            case 'SGD':
                return this.updateWithSGD(state, gradient);
                
            case 'MOMENTUM':
                return this.updateWithMomentum(state, gradient);
                
            case 'ADAM':
                return this.updateWithAdam(state, gradient);
                
            case 'BFGS':
                return this.updateWithBFGS(state, gradient);
                
            default:
                this.logger.warn(`[🔬] Método desconocido: ${this.config.optimizationMethod}, usando SGD`);
                return this.updateWithSGD(state, gradient);
        }
    }
    
    /**
     * Actualización con Stochastic Gradient Descent
     */
    updateWithSGD(state, gradient) {
        const newState = new Array(state.length);
        for (let i = 0; i < state.length; i++) {
            newState[i] = state[i] - this.config.learningRate * gradient[i];
        }
        return newState;
    }
    
    /**
     * Actualización con Momentum
     */
    updateWithMomentum(state, gradient) {
        if (!this.state.momentum) {
            this.state.momentum = new Array(state.length).fill(0);
        }
        
        const beta = VARIATIONAL_CONSTANTS.MOMENTUM_BETA;
        const newState = new Array(state.length);
        
        for (let i = 0; i < state.length; i++) {
            this.state.momentum[i] = beta * this.state.momentum[i] + this.config.learningRate * gradient[i];
            newState[i] = state[i] - this.state.momentum[i];
        }
        
        return newState;
    }
    
    /**
     * Actualización con Adam optimizer
     */
    updateWithAdam(state, gradient) {
        if (!this.state.adamM) {
            this.state.adamM = new Array(state.length).fill(0);
            this.state.adamV = new Array(state.length).fill(0);
        }
        
        const beta1 = VARIATIONAL_CONSTANTS.ADAM_BETA1;
        const beta2 = VARIATIONAL_CONSTANTS.ADAM_BETA2;
        const epsilon = VARIATIONAL_CONSTANTS.ADAM_EPSILON;
        const t = this.state.currentIteration + 1;
        
        const newState = new Array(state.length);
        
        for (let i = 0; i < state.length; i++) {
            // Actualizar momentos
            this.state.adamM[i] = beta1 * this.state.adamM[i] + (1 - beta1) * gradient[i];
            this.state.adamV[i] = beta2 * this.state.adamV[i] + (1 - beta2) * gradient[i] * gradient[i];
            
            // Corrección de sesgo
            const mHat = this.state.adamM[i] / (1 - Math.pow(beta1, t));
            const vHat = this.state.adamV[i] / (1 - Math.pow(beta2, t));
            
            // Actualización
            newState[i] = state[i] - this.config.learningRate * mHat / (Math.sqrt(vHat) + epsilon);
        }
        
        return newState;
    }
    
    /**
     * Actualización con BFGS (aproximación)
     */
    updateWithBFGS(state, gradient) {
        // Implementación simplificada de BFGS
        // En una implementación completa, se mantendría una aproximación de la matriz Hessiana inversa
        const dampingFactor = this.config.dampingFactor;
        const newState = new Array(state.length);
        
        for (let i = 0; i < state.length; i++) {
            newState[i] = state[i] - this.config.learningRate * gradient[i] / (1 + dampingFactor);
        }
        
        return newState;
    }
    
    /**
     * Calcular valor esperado ⟨Ψ|H|Ψ⟩
     */
    calculateExpectationValue(operator, state) {
        // ⟨Ψ|H|Ψ⟩ = Ψ†HΨ
        const HState = this.matrixVectorMultiply(operator, state);
        return this.innerProduct(state, HState);
    }
    
    /**
     * Calcular operador de evolución temporal U = exp(-iHt/ℏ)
     */
    calculateEvolutionOperator(timeStep) {
        const dt = timeStep;
        const hbar = VARIATIONAL_CONSTANTS.PLANCK_REDUCED;
        
        // Para matrices pequeñas, usar aproximación de primer orden: U ≈ I - iHt/ℏ
        const H = this.state.hamiltonian;
        const dimension = H.length;
        const U = this.createIdentityMatrix(dimension);
        
        const factor = -1 * dt / hbar;  // -it/ℏ (parte imaginaria implícita)
        
        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                if (i !== j) {
                    U[i][j] = factor * H[i][j];
                } else {
                    U[i][j] = 1 + factor * H[i][j];
                }
            }
        }
        
        return U;
    }
    
    /**
     * Aplicar operador unitario a un estado
     */
    applyUnitaryOperator(operator, state) {
        return this.matrixVectorMultiply(operator, state);
    }
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    initializeMatrices() {
        const dim = this.config.stateDimension;
        
        // Inicializar estado aleatorio normalizado
        this.state.currentState = this.generateRandomState(dim);
        this.state.currentState = this.normalizeState(this.state.currentState);
        
        this.logger.debug(`[🔬] Matrices inicializadas (dimensión: ${dim})`);
    }
    
    initializeOptimizers() {
        // Inicializar estructuras específicas del optimizador
        switch (this.config.optimizationMethod) {
            case 'MOMENTUM':
                this.state.momentum = new Array(this.config.stateDimension).fill(0);
                break;
                
            case 'ADAM':
                this.state.adamM = new Array(this.config.stateDimension).fill(0);
                this.state.adamV = new Array(this.config.stateDimension).fill(0);
                break;
        }
        
        this.logger.debug(`[🔬] Optimizador ${this.config.optimizationMethod} inicializado`);
    }
    
    resetOptimizationState() {
        this.state.currentIteration = 0;
        this.state.converged = false;
        this.state.bestEnergy = Infinity;
        this.state.energyHistory = [];
        this.state.gradientHistory = [];
        this.state.gradientNorm = Infinity;
        
        // Resetear optimizadores
        if (this.state.momentum) {
            this.state.momentum.fill(0);
        }
        if (this.state.adamM) {
            this.state.adamM.fill(0);
            this.state.adamV.fill(0);
        }
    }
    
    validateHamiltonian(H) {
        if (!H || !Array.isArray(H) || !Array.isArray(H[0])) {
            throw new Error('Hamiltoniano debe ser una matriz 2D');
        }
        
        const n = H.length;
        if (H.some(row => row.length !== n)) {
            throw new Error('Hamiltoniano debe ser una matriz cuadrada');
        }
        
        return H;
    }
    
    generateRandomState(dimension) {
        const state = new Array(dimension);
        for (let i = 0; i < dimension; i++) {
            state[i] = Math.random() - 0.5;  // Valores aleatorios centrados en 0
        }
        return state;
    }
    
    normalizeState(state) {
        const norm = this.calculateVectorNorm(state);
        if (norm < VARIATIONAL_CONSTANTS.NUMERICAL_ZERO) {
            throw new Error('Estado con norma cero no puede ser normalizado');
        }
        
        return state.map(component => component / norm);
    }
    
    calculateVectorNorm(vector) {
        return Math.sqrt(vector.reduce((sum, component) => sum + component * component, 0));
    }
    
    innerProduct(vec1, vec2) {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectores deben tener la misma dimensión');
        }
        
        return vec1.reduce((sum, component, i) => sum + component * vec2[i], 0);
    }
    
    matrixVectorMultiply(matrix, vector) {
        const result = new Array(matrix.length);
        
        for (let i = 0; i < matrix.length; i++) {
            result[i] = 0;
            for (let j = 0; j < vector.length; j++) {
                result[i] += matrix[i][j] * vector[j];
            }
        }
        
        return result;
    }
    
    createIdentityMatrix(dimension) {
        const identity = Array(dimension).fill().map(() => Array(dimension).fill(0));
        for (let i = 0; i < dimension; i++) {
            identity[i][i] = 1;
        }
        return identity;
    }
    
    isHermitian(matrix) {
        const n = matrix.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.abs(matrix[i][j] - matrix[j][i]) > VARIATIONAL_CONSTANTS.NUMERICAL_ZERO) {
                    return false;
                }
            }
        }
        return true;
    }
    
    makeHermitian(matrix) {
        const n = matrix.length;
        const hermitian = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                hermitian[i][j] = (matrix[i][j] + matrix[j][i]) / 2;
            }
        }
        
        return hermitian;
    }
    
    performEigendecomposition(matrix) {
        // Implementación simplificada usando el método de potencia para el eigenvalor más pequeño
        // En una implementación completa, se usaría una biblioteca especializada
        
        const n = matrix.length;
        const eigenValues = new Array(Math.min(n, this.config.numEigenStates));
        const eigenVectors = [];
        
        // Aproximación: usar elementos diagonales como eigenvalores
        for (let i = 0; i < eigenValues.length; i++) {
            eigenValues[i] = matrix[i][i];
            
            // Eigenvector canónico
            const eigenVector = new Array(n).fill(0);
            eigenVector[i] = 1;
            eigenVectors.push(eigenVector);
        }
        
        return { eigenValues, eigenVectors };
    }
    
    sortEigenResults(eigenValues, eigenVectors) {
        // Combinar eigenvalores y eigenvectores para ordenar
        const combined = eigenValues.map((value, index) => ({
            value,
            vector: eigenVectors[index]
        }));
        
        // Ordenar por eigenvalor (ascendente para encontrar estado fundamental)
        combined.sort((a, b) => a.value - b.value);
        
        return {
            eigenValues: combined.map(item => item.value),
            eigenVectors: combined.map(item => item.vector)
        };
    }
    
    /**
     * Obtener estadísticas del optimizador
     */
    getOptimizationStatistics() {
        return {
            timestamp: new Date().toISOString(),
            
            // Estado actual
            currentIteration: this.state.currentIteration,
            converged: this.state.converged,
            currentEnergy: this.state.currentEnergy,
            bestEnergy: this.state.bestEnergy,
            gradientNorm: this.state.gradientNorm,
            
            // Historia
            energyHistory: [...this.state.energyHistory],
            convergenceHistory: this.state.energyHistory.map((energy, i) => ({
                iteration: i,
                energy,
                improvement: i > 0 ? this.state.energyHistory[i-1] - energy : 0
            })),
            
            // Performance
            totalComputationTime: this.state.totalComputationTime,
            averageIterationTime: this.state.averageIterationTime,
            
            // Configuración
            config: { ...this.config },
            
            // Estados cuánticos
            hasGroundState: this.state.groundState !== null,
            numEigenStates: this.state.eigenStates.length,
            
            // Calidad de la solución
            solutionQuality: this.assessSolutionQuality()
        };
    }
    
    assessSolutionQuality() {
        if (!this.state.converged || this.state.energyHistory.length === 0) {
            return 'POOR';
        }
        
        const finalGradient = this.state.gradientNorm;
        const energyStability = this.calculateEnergyStability();
        
        if (finalGradient < this.config.convergenceThreshold * 0.1 && energyStability > 0.95) {
            return 'EXCELLENT';
        } else if (finalGradient < this.config.convergenceThreshold && energyStability > 0.9) {
            return 'GOOD';
        } else if (this.state.converged) {
            return 'FAIR';
        } else {
            return 'POOR';
        }
    }
    
    calculateEnergyStability() {
        if (this.state.energyHistory.length < 10) return 0;
        
        const recent = this.state.energyHistory.slice(-10);
        const mean = recent.reduce((sum, e) => sum + e, 0) / recent.length;
        const variance = recent.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / recent.length;
        const stdDev = Math.sqrt(variance);
        
        return 1 / (1 + stdDev / Math.abs(mean));
    }
}

export default VariationalOptimizer;
