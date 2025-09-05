import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('🚀 INICIANDO LLM ORCHESTRATOR SUPREME PERSISTENTE...');

// Crear instancia del LLM Orchestrator
const orchestrator = new LLMQuantumOrchestratorSupreme();

console.log('✅ LLM Orchestrator Supreme iniciado');
console.log('🔧 Endpoints disponibles:');
console.log('   - GET  /supreme-health');
console.log('   - GET  /api/supreme-quantum-state');
console.log('   - POST /api/supreme-orchestrate');
console.log('   - POST /api/execute-quantum-leap');
console.log('🧠 LLM toma CONTROL ABSOLUTO del sistema QBTC');

// Heartbeat para mantener el proceso vivo
setInterval(() => {
    console.log(`[HEARTBEAT] LLM Orchestrator activo - Uptime: ${Math.floor(process.uptime())}s`);
}, 30000);

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo LLM Orchestrator Supreme...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo LLM Orchestrator Supreme...');
    process.exit(0);
});

// Prevenir cierre inesperado
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    console.log('🔄 Reiniciando LLM Orchestrator...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    console.log('🔄 Continuando operación...');
});

console.log('🔄 LLM Orchestrator configurado para ejecución persistente');
