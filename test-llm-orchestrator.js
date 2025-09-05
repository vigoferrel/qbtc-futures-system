import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[TEST] Testing LLM Orchestrator...');

try {
    const orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[TEST] LLM Orchestrator created successfully');
    
    // Iniciar servidor manualmente
    orchestrator.start();
    
} catch (error) {
    console.error('[TEST] Error:', error.message);
    process.exit(1);
}
