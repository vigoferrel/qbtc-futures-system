import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[TEST] Testing LLM Orchestrator v2...');

let orchestrator;
let actualPort;

try {
    orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[TEST] LLM Orchestrator created successfully');

    // Esperar a que el servidor se inicie
    setTimeout(() => {
        if (orchestrator.actualPort) {
            actualPort = orchestrator.actualPort;
            console.log(`[TEST] Server is running on port ${actualPort}`);
            console.log(`[TEST] Health check: http://localhost:${actualPort}/health`);
            console.log(`[TEST] Quantum state: http://localhost:${actualPort}/api/quantum-state`);
        } else {
            console.log('[TEST] Waiting for server to start...');
        }
    }, 2000);

    // Mantener el proceso vivo
    process.on('SIGINT', () => {
        console.log('[TEST] Shutting down test...');
        process.exit(0);
    });

    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
        console.error('[TEST] Uncaught Exception:', error.message);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('[TEST] Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

} catch (error) {
    console.error('[TEST] Error:', error.message);
    process.exit(1);
}
