const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname)));

// Ruta principal que sirve el dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'monitor-quantum-intelligence-llm-debug.html'));
});

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'QBTC Quantum Dashboard Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🚀 ============================================');
    console.log('🏆 QBTC QUANTUM MACRO-INTELLIGENCE - SERVIDOR ACTIVO');
    console.log('===========================================');
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log('===========================================');
    console.log('✅ SISTEMA COMPLETO FUNCIONANDO:');
    console.log('   • Análisis Cuántico Completo');
    console.log('   • TP/SL Dinámicos');
    console.log('   • Best Symbol Selection');
    console.log('   • 150+ Símbolos');
    console.log('   • Tablas Interactivas');
    console.log('===========================================');
    console.log('🎯 PRESIONA Ctrl+C PARA DETENER EL SERVIDOR');
    console.log('===========================================');
});

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor QBTC...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Servidor QBTC detenido');
    process.exit(0);
});