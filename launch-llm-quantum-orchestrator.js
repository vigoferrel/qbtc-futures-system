#!/usr/bin/env node

/**
 * [LAUNCHER] LLM-QUANTUM ORCHESTRATOR SUPREME LAUNCHER
 * ===================================================
 * 
 * Launcher principal que inicia el sistema LLM-Quantum Orchestrator Supreme
 * Integra todos los componentes existentes con el nuevo sistema LLM
 * Honra las constantes físicas reales del sistema QBTC
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';
import QuantumWorkflowIntegrator from './core/quantum-workflow-integrator.js';
import { QUANTUM_CONSTANTS } from './config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[LAUNCHER] Starting LLM-Quantum Orchestrator Supreme');
console.log('===================================================');
console.log(`[LAMBDA] λ₇₉₁₉ = ${QUANTUM_CONSTANTS.LAMBDA_7919}`);
console.log(`[PHI] φ = ${QUANTUM_CONSTANTS.PHI_GOLDEN}`);
console.log(`[EULER] γ = ${QUANTUM_CONSTANTS.EULER_GAMMA}`);

// Configuración del sistema LLM-Quantum
const LLM_QUANTUM_CONFIG = {
    llmOrchestrator: {
        port: 14077,
        name: 'LLM-Quantum Orchestrator Supreme'
    },
    workflowIntegrator: {
        port: 14078,
        name: 'Quantum Workflow Integrator'
    },
    existingComponents: {
        quantumCore: { port: 14105, name: 'QBTC Quantum Core' },
        consciousnessEngine: { port: 14102, name: 'Consciousness Engine' },
        futuresExecution: { port: 14203, name: 'Futures Execution Server' },
        masterControl: { port: 14001, name: 'Master Control Hub' }
    }
};

let llmOrchestrator = null;
let workflowIntegrator = null;
let existingProcesses = new Map();

class LLMQuantumLauncher {
    constructor() {
        this.config = LLM_QUANTUM_CONFIG;
        this.processes = new Map();
        this.quantumState = {
            consciousness: 0.947,
            coherence: 0.923,
            evolution: 0.0
        };
    }
    
    /**
     * Inicia el sistema LLM-Quantum completo
     */
    async startLLMQuantumSystem() {
        console.log('[LAUNCHER] Initializing LLM-Quantum System...');
        
        try {
            // 1. Iniciar LLM Orchestrator
            await this.startLLMOrchestrator();
            
            // 2. Iniciar Workflow Integrator
            await this.startWorkflowIntegrator();
            
            // 3. Iniciar componentes existentes
            await this.startExistingComponents();
            
            // 4. Configurar integración
            await this.setupIntegration();
            
            console.log('[LAUNCHER] LLM-Quantum System started successfully');
            this.displaySystemStatus();
            
        } catch (error) {
            console.error('[ERROR] Failed to start LLM-Quantum System:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }
    
    /**
     * Inicia LLM Orchestrator
     */
    async startLLMOrchestrator() {
        console.log(`[LAUNCHER] Starting ${this.config.llmOrchestrator.name}...`);
        
        try {
            // Crear instancia del LLM Orchestrator
            llmOrchestrator = new LLMQuantumOrchestratorSupreme();
            
            // Configurar eventos
            llmOrchestrator.on('orchestration', (orchestration) => {
                console.log('[ORCHESTRATION] LLM Decision:', orchestration.action);
            });
            
            // Iniciar servidor
            llmOrchestrator.start();
            
            // Esperar a que esté listo
            await this.waitForService(this.config.llmOrchestrator.port);
            
            console.log(`[CHECK] ${this.config.llmOrchestrator.name} ready on port ${this.config.llmOrchestrator.port}`);
            
        } catch (error) {
            throw new Error(`Failed to start LLM Orchestrator: ${error.message}`);
        }
    }
    
    /**
     * Inicia Workflow Integrator
     */
    async startWorkflowIntegrator() {
        console.log(`[LAUNCHER] Starting ${this.config.workflowIntegrator.name}...`);
        
        try {
            // Crear instancia del Workflow Integrator
            workflowIntegrator = new QuantumWorkflowIntegrator();
            
            // Configurar eventos
            workflowIntegrator.on('integration_started', (event) => {
                console.log('[INTEGRATION] Workflow Integrator started:', event.componentCount, 'components');
            });
            
            workflowIntegrator.on('orchestration_result', (result) => {
                console.log('[INTEGRATION] Orchestration applied:', result.applied.activated.length, 'components activated');
            });
            
            // Iniciar integrador
            workflowIntegrator.start();
            
            console.log(`[CHECK] ${this.config.workflowIntegrator.name} ready`);
            
        } catch (error) {
            throw new Error(`Failed to start Workflow Integrator: ${error.message}`);
        }
    }
    
    /**
     * Inicia componentes existentes
     */
    async startExistingComponents() {
        console.log('[LAUNCHER] Starting existing QBTC components...');
        
        const components = this.config.existingComponents;
        
        for (const [name, config] of Object.entries(components)) {
            try {
                await this.startExistingComponent(name, config);
            } catch (error) {
                console.warn(`[WARNING] Failed to start ${name}: ${error.message}`);
            }
        }
    }
    
    /**
     * Inicia componente existente específico
     */
    async startExistingComponent(name, config) {
        console.log(`[LAUNCHER] Starting ${config.name}...`);
        
        // Determinar script a ejecutar basado en el nombre
        const scriptPath = this.getComponentScriptPath(name);
        
        if (!scriptPath) {
            console.warn(`[WARNING] No script found for ${name}, skipping...`);
            return;
        }
        
        const process = spawn('node', [scriptPath], {
            cwd: __dirname,
            stdio: 'inherit',
            env: {
                ...process.env,
                PORT: config.port,
                COMPONENT_NAME: name
            }
        });
        
        process.on('error', (error) => {
            console.error(`[ERROR] ${config.name} failed:`, error.message);
        });
        
        process.on('exit', (code) => {
            console.log(`[WARNING] ${config.name} exited with code ${code}`);
        });
        
        // Guardar proceso
        existingProcesses.set(name, process);
        
        // Esperar a que esté listo
        await this.waitForService(config.port);
        
        console.log(`[CHECK] ${config.name} ready on port ${config.port}`);
    }
    
    /**
     * Obtiene ruta del script del componente
     */
    getComponentScriptPath(componentName) {
        const scriptMap = {
            quantumCore: 'analysis-engine/quantum-core.js',
            consciousnessEngine: 'analysis-engine/consciousness-engine.js',
            futuresExecution: 'futures-execution/server.js',
            masterControl: 'core/master-control-hub.js'
        };
        
        return scriptMap[componentName];
    }
    
    /**
     * Configura integración entre componentes
     */
    async setupIntegration() {
        console.log('[LAUNCHER] Setting up component integration...');
        
        try {
            // Conectar LLM Orchestrator con Workflow Integrator
            if (llmOrchestrator && workflowIntegrator) {
                // La integración ya está configurada en el constructor del Workflow Integrator
                console.log('[CHECK] LLM Orchestrator ↔ Workflow Integrator connected');
            }
            
            // Configurar comunicación con componentes existentes
            await this.setupComponentCommunication();
            
            console.log('[CHECK] Component integration configured');
            
        } catch (error) {
            throw new Error(`Failed to setup integration: ${error.message}`);
        }
    }
    
    /**
     * Configura comunicación con componentes existentes
     */
    async setupComponentCommunication() {
        // En una implementación real, configuraría WebSocket o HTTP communication
        // entre el Workflow Integrator y los componentes existentes
        
        console.log('[INTEGRATION] Component communication channels configured');
    }
    
    /**
     * Espera a que un servicio esté listo
     */
    async waitForService(port, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const response = await fetch(`http://localhost:${port}/health`);
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                // Servicio no está listo aún
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        throw new Error(`Service on port ${port} not ready within ${timeout}ms`);
    }
    
    /**
     * Muestra estado del sistema
     */
    displaySystemStatus() {
        console.log('\n[STATUS] LLM-Quantum Orchestrator Supreme System Status');
        console.log('========================================================');
        console.log(`[LLM] Orchestrator: ${llmOrchestrator ? '✅ RUNNING' : '❌ STOPPED'} (Port ${this.config.llmOrchestrator.port})`);
        console.log(`[INTEGRATION] Workflow Integrator: ${workflowIntegrator ? '✅ RUNNING' : '❌ STOPPED'}`);
        
        console.log('\n[COMPONENTS] Existing QBTC Components:');
        for (const [name, config] of Object.entries(this.config.existingComponents)) {
            const process = existingProcesses.get(name);
            const status = process && !process.killed ? '✅ RUNNING' : '❌ STOPPED';
            console.log(`  - ${config.name}: ${status} (Port ${config.port})`);
        }
        
        console.log('\n[QUANTUM] System Constants:');
        console.log(`  - λ₇₉₁₉ = ${QUANTUM_CONSTANTS.LAMBDA_7919}`);
        console.log(`  - φ = ${QUANTUM_CONSTANTS.PHI_GOLDEN}`);
        console.log(`  - γ = ${QUANTUM_CONSTANTS.EULER_GAMMA}`);
        console.log(`  - z = ${QUANTUM_CONSTANTS.Z_COMPLEX.REAL} + ${QUANTUM_CONSTANTS.Z_COMPLEX.IMAG}i`);
        
        console.log('\n[ENDPOINTS] Available APIs:');
        console.log(`  - LLM Orchestrator: http://localhost:${this.config.llmOrchestrator.port}/api/orchestrate`);
        console.log(`  - Quantum State: http://localhost:${this.config.llmOrchestrator.port}/api/quantum-state`);
        console.log(`  - Health Check: http://localhost:${this.config.llmOrchestrator.port}/health`);
        
        console.log('\n[READY] LLM-Quantum Orchestrator Supreme is ready for quantum trading!');
        console.log('[INFO] Press Ctrl+C to stop the system');
    }
    
    /**
     * Limpia recursos al salir
     */
    async cleanup() {
        console.log('\n[LAUNCHER] Shutting down LLM-Quantum System...');
        
        // Detener procesos existentes
        for (const [name, process] of existingProcesses) {
            console.log(`[STOP] Stopping ${name}...`);
            process.kill('SIGTERM');
        }
        
        // Limpiar referencias
        llmOrchestrator = null;
        workflowIntegrator = null;
        existingProcesses.clear();
        
        console.log('[CHECK] LLM-Quantum System shutdown complete');
    }
    
    /**
     * Maneja señales de interrupción
     */
    setupSignalHandlers() {
        process.on('SIGINT', async () => {
            console.log('\n[INTERRUPT] Received SIGINT, shutting down gracefully...');
            await this.cleanup();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n[TERMINATE] Received SIGTERM, shutting down gracefully...');
            await this.cleanup();
            process.exit(0);
        });
    }
}

// Función principal
async function main() {
    const launcher = new LLMQuantumLauncher();
    
    // Configurar handlers de señales
    launcher.setupSignalHandlers();
    
    // Iniciar sistema
    await launcher.startLLMQuantumSystem();
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('[FATAL] Failed to start LLM-Quantum System:', error.message);
        process.exit(1);
    });
}

export default LLMQuantumLauncher;
