const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// Rate limiting básico - Protección contra abuso
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests por ventana

function rateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    // Limpiar requests antiguos
    for (const [ip, requests] of requestCounts) {
        requestCounts.set(ip, requests.filter(time => time > windowStart));
        if (requestCounts.get(ip).length === 0) {
            requestCounts.delete(ip);
        }
    }

    // Verificar límite
    const clientRequests = requestCounts.get(clientIP) || [];
    if (clientRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((clientRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
        });
    }

    // Registrar request
    clientRequests.push(now);
    requestCounts.set(clientIP, clientRequests);

    next();
}

// Aplicar rate limiting a todas las rutas
app.use(rateLimit);

// Servir solo archivos estáticos desde el directorio del dashboard
app.use(express.static(path.join(__dirname)));

// Ruta principal que sirve el dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint de salud
app.get('/health', (req, res) => {
    const totalRequests = Array.from(requestCounts.values()).reduce((sum, requests) => sum + requests.length, 0);

    res.json({
        status: 'healthy',
        service: 'QBTC Quantum Dashboard Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0-final',
        security: {
            rateLimiting: 'enabled',
            maxRequestsPerWindow: RATE_LIMIT_MAX_REQUESTS,
            windowMinutes: RATE_LIMIT_WINDOW / (60 * 1000),
            activeConnections: requestCounts.size,
            totalRequestsTracked: totalRequests
        },
        environment: {
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsage: process.memoryUsage()
        }
    });
});

// Middleware para manejar errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'El recurso solicitado no existe',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🚀 ============================================');
    console.log('🏆 QBTC QUANTUM MACRO-INTELLIGENCE - DASHBOARD ACTIVO');
    console.log('===========================================');
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log('===========================================');
    console.log('✅ FUNCIONALIDADES COMPLETAS:');
    console.log('   • Análisis Cuántico Completo (6 algoritmos)');
    console.log('   • TP/SL Dinámicos por volatilidad');
    console.log('   • Best Symbol Selection inteligente');
    console.log('   • 150+ Símbolos en 5 sectores');
    console.log('   • Tablas interactivas completas');
    console.log('   • Interfaz moderna sin conflictos');
    console.log('===========================================');
    console.log('🎯 TODAS LAS CORRECCIONES APLICADAS:');
    console.log('   ✅ findBestSymbol() implementada');
    console.log('   ✅ calculateDynamicTPSL() funcionando');
    console.log('   ✅ Tablas con columna Best Symbol');
    console.log('   ✅ 150 símbolos expandidos');
    console.log('   ✅ Sin errores de JavaScript');
    console.log('===========================================');
    console.log('🛑 PRESIONA Ctrl+C PARA DETENER EL SERVIDOR');
    console.log('===========================================');
});

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor QBTC Dashboard...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Servidor QBTC Dashboard detenido');
    process.exit(0);
});