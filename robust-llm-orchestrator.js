import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('[ROBUST] Starting Robust LLM Quantum Orchestrator...');

let orchestrator;
let keepAliveInterval;

try {
    orchestrator = new LLMQuantumOrchestratorSupreme();
    console.log('[ROBUST] LLM Orchestrator created successfully');

    // Esperar a que el servidor se inicie y mostrar información
    setTimeout(() => {
        if (orchestrator.actualPort) {
            console.log('\n[ROBUST] ===== SERVER READY =====');
            console.log(`[ROBUST] Port: ${orchestrator.actualPort}`);
            console.log(`[ROBUST] Health: http://localhost:${orchestrator.actualPort}/health`);
            console.log(`[ROBUST] Quantum State: http://localhost:${orchestrator.actualPort}/api/quantum-state`);
            console.log(`[ROBUST] Orchestrate: POST http://localhost:${orchestrator.actualPort}/api/orchestrate`);
            console.log('[ROBUST] ========================\n');
            console.log('[ROBUST] Server is running robustly. Press Ctrl+C to stop.');
        } else {
            console.log('[ROBUST] Waiting for server to start...');
        }
    }, 3000);

    // Mantener el proceso vivo con heartbeat cada 10 segundos
    keepAliveInterval = setInterval(() => {
        console.log(`[ROBUST] Heartbeat - Server running on port ${orchestrator.actualPort || 'starting...'} - ${new Date().toISOString()}`);
    }, 10000);

    // Manejar cierre graceful
    process.on('SIGINT', () => {
        console.log('\n[ROBUST] Shutting down gracefully...');
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        if (orchestrator && orchestrator.server) {
            orchestrator.server.close(() => {
                console.log('[ROBUST] Server closed');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });

    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
        console.error('[ROBUST] Uncaught Exception:', error.message);
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('[ROBUST] Unhandled Rejection at:', promise, 'reason:', reason);
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
        process.exit(1);
    });

    // Mantener el proceso vivo indefinidamente
    console.log('[ROBUST] Process will stay alive indefinitely...');

} catch (error) {
    console.error('[ROBUST] Error:', error.message);
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    process.exit(1);
}
