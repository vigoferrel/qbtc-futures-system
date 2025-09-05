import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[PERSISTENT] Starting Persistent LLM Quantum Orchestrator...');

let orchestrator;
let server;

try {
    orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[PERSISTENT] LLM Orchestrator created successfully');

    // Esperar a que el servidor se inicie
    setTimeout(() => {
        if (orchestrator.actualPort) {
            console.log('\n[PERSISTENT] ===== SERVER READY =====');
            console.log(`[PERSISTENT] Port: ${orchestrator.actualPort}`);
            console.log(`[PERSISTENT] Health: http://localhost:${orchestrator.actualPort}/health`);
            console.log(`[PERSISTENT] Quantum State: http://localhost:${orchestrator.actualPort}/api/quantum-state`);
            console.log(`[PERSISTENT] Orchestrate: POST http://localhost:${orchestrator.actualPort}/api/orchestrate`);
            console.log('[PERSISTENT] ========================\n');
            console.log('[PERSISTENT] Server is running persistently. Press Ctrl+C to stop.');
            
            // Guardar referencia al servidor
            server = orchestrator.server;
        } else {
            console.log('[PERSISTENT] Waiting for server to start...');
        }
    }, 3000);

    // Mantener el proceso vivo indefinidamente
    process.on('SIGINT', () => {
        console.log('\n[PERSISTENT] Shutting down gracefully...');
        if (server) {
            server.close(() => {
                console.log('[PERSISTENT] Server closed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });

    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
        console.error('[PERSISTENT] Uncaught Exception:', error.message);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('[PERSISTENT] Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    // Mantener el proceso vivo con un heartbeat
    setInterval(() => {
        console.log(`[PERSISTENT] Heartbeat - Server running on port ${orchestrator.actualPort || 'starting...'}`);
    }, 30000); // Cada 30 segundos

} catch (error) {
    console.error('[PERSISTENT] Error:', error.message);
    process.exit(1);
}
