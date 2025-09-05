import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[TEST] Iniciando LLM Orchestrator con CORS...');

try {
    const orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[TEST] LLM Orchestrator iniciado exitosamente');
    console.log('[TEST] Puerto:', orchestrator.actualPort || 'No asignado');
    
    // Mantener el proceso vivo
    console.log('[TEST] Servidor ejecutándose. Presiona Ctrl+C para detener.');
    
    process.on('SIGINT', () => {
        console.log('[TEST] Deteniendo servidor...');
        if (orchestrator.server) {
            orchestrator.server.close(() => {
                console.log('[TEST] Servidor detenido');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
    
} catch (error) {
    console.error('[TEST] Error:', error.message);
    console.error('[TEST] Stack:', error.stack);
    process.exit(1);
}
