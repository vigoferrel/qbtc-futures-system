import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[START] Starting LLM Quantum Orchestrator...');

let orchestrator;

try {
    orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[START] LLM Orchestrator created successfully');

    // Esperar a que el servidor se inicie y mostrar información
    setTimeout(() => {
        if (orchestrator.actualPort) {
            console.log('\n[START] ===== SERVER READY =====');
            console.log(`[START] Port: ${orchestrator.actualPort}`);
            console.log(`[START] Health: http://localhost:${orchestrator.actualPort}/health`);
            console.log(`[START] Quantum State: http://localhost:${orchestrator.actualPort}/api/quantum-state`);
            console.log(`[START] Orchestrate: POST http://localhost:${orchestrator.actualPort}/api/orchestrate`);
            console.log('[START] ========================\n');
            console.log('[START] Server is running. Press Ctrl+C to stop.');
        } else {
            console.log('[START] Waiting for server to start...');
        }
    }, 3000);

    // Mantener el proceso vivo indefinidamente
    process.on('SIGINT', () => {
        console.log('\n[START] Shutting down gracefully...');
        process.exit(0);
    });

    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
        console.error('[START] Uncaught Exception:', error.message);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('[START] Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

} catch (error) {
    console.error('[START] Error:', error.message);
    process.exit(1);
}
