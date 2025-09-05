#!/usr/bin/env node

console.log('[MAGNIFY] Starting Hermetic Admin Server Debug...');

try {
    console.log('📦 Importing modules...');
    
    const express = (await import('express')).default;
    console.log('[CHECK] Express imported');
    
    const { WebSocketServer } = await import('ws');
    console.log('[CHECK] WebSocket imported');
    
    const http = (await import('http')).default;
    console.log('[CHECK] HTTP imported');
    
    console.log('🧙 Importing HermeticAutoTrader...');
    const { default: HermeticAutoTrader } = await import('./trading/hermetic-auto-trader.js');
    console.log('[CHECK] HermeticAutoTrader imported');
    
    console.log('[ROCKET] Creating Express app...');
    const app = express();
    
    console.log('🛣️ Setting up routes...');
    app.get('/api/test', (req, res) => {
        res.json({ status: 'ok', message: 'Hermetic Admin Server Debug Online' });
    });
    
    console.log('[GLOBE] Creating HTTP server...');
    const server = http.createServer(app);
    
    console.log('🔌 Setting up WebSocket...');
    const wss = new WebSocketServer({ server });
    
    console.log('🎧 Starting server on port 8888...');
    server.listen(8888, () => {
        console.log('[GALAXY] ========================================');
        console.log('[GALAXY] HERMETIC DEBUG SERVER ONLINE');
        console.log('[GALAXY] ========================================');
        console.log('[GLOBE] Test URL: http://localhost:8888/api/test');
        console.log('[GALAXY] ========================================');
    });
    
    // Mantener el proceso vivo
    process.on('SIGINT', () => {
        console.log('\n🌑 Shutting down debug server...');
        process.exit(0);
    });
    
} catch (error) {
    console.error('[X] Debug server error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
