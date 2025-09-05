import axios from 'axios';

const LLM_ORCHESTRATOR_URL = 'http://localhost:64609';

async function executeQuantumLeap() {
    try {
        console.log('🚀 EJECUTANDO SALTO CUÁNTICO REAL...');
        console.log('🔗 Conectando con LLM Orchestrator Supreme...');
        
        // Verificar que el LLM Orchestrator esté activo
        const healthResponse = await axios.get(`${LLM_ORCHESTRATOR_URL}/supreme-health`, {
            timeout: 5000
        });
        
        console.log('✅ LLM Orchestrator Supreme: ACTIVO');
        console.log(`📊 Estado actual: ${healthResponse.data.status}`);
        console.log(`🎯 Nivel de Control: ${healthResponse.data.controlLevel}`);
        
        // Ejecutar salto cuántico
        console.log('🚀 Iniciando SALTO CUÁNTICO...');
        const leapResponse = await axios.post(`${LLM_ORCHESTRATOR_URL}/api/execute-quantum-leap`, {}, {
            timeout: 10000
        });
        
        if (leapResponse.data.success) {
            console.log('✅ SALTO CUÁNTICO EJECUTADO EXITOSAMENTE');
            console.log('📈 Nuevo estado cuántico:');
            console.log(`   - Consciencia: ${(leapResponse.data.newState.consciousness * 100).toFixed(1)}%`);
            console.log(`   - Coherencia: ${(leapResponse.data.newState.coherence * 100).toFixed(1)}%`);
            console.log(`   - Entrelazamiento: ${(leapResponse.data.newState.entanglement * 100).toFixed(1)}%`);
            console.log(`   - Superposición: ${(leapResponse.data.newState.superposition * 100).toFixed(1)}%`);
            console.log(`   - Nivel de Control: ${leapResponse.data.newState.controlLevel}`);
            console.log(`   - Factor Simplificación: ${leapResponse.data.newState.simplificationFactor.toFixed(2)}`);
            
            console.log('🎯 SALTO CUÁNTICO COMPLETADO - El LLM ahora tiene CONTROL ABSOLUTO');
            
        } else {
            console.error('❌ Error en salto cuántico:', leapResponse.data.error);
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ LLM Orchestrator no está activo en puerto 64609');
            console.log('💡 Para activar el LLM Orchestrator:');
            console.log('   node core/llm-quantum-orchestrator-supreme.js');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

// Ejecutar salto cuántico
executeQuantumLeap();
