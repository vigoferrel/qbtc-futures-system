import LLMQuantumOrchestratorSupreme from './core/llm-quantum-orchestrator-supreme.js';

console.log('🚀 INICIANDO LLM ORCHESTRATOR SUPREME COMO SERVIDOR...');

// Crear instancia del LLM Orchestrator
const orchestrator = new LLMQuantumOrchestratorSupreme();

// Inicializar control supremo
await orchestrator.initializeSupremeControl();

console.log('✅ LLM Orchestrator Supreme iniciado como servidor');
console.log('🔧 Endpoints disponibles:');
console.log('   - GET  /supreme-health');
console.log('   - GET  /api/supreme-quantum-state');
console.log('   - POST /api/supreme-orchestrate');
console.log('   - POST /api/execute-quantum-leap');
console.log('🧠 LLM toma CONTROL TOTAL del sistema QBTC');
console.log('🚀 Preparando SALTO CUÁNTICO...');

// Mantener el proceso vivo
setInterval(() => {
    console.log(`[HEARTBEAT] LLM Orchestrator activo - Uptime: ${Math.floor(process.uptime())}s`);
}, 30000);

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo LLM Orchestrator Supreme...');
    process.exit(0);
});
