#!/usr/bin/env node

/**
 * Script de prueba para verificar importes
 */

console.log('[MAGNIFY] Testing imports...');

try {
    console.log('1. Testing commander...');
    const { program } = await import('commander');
    console.log('[CHECK] Commander OK');
    
    console.log('2. Testing hermetic-logger...');
    const { getLogger } = await import('./utils/hermetic-logger.js');
    console.log('[CHECK] Hermetic Logger OK');
    
    console.log('3. Testing hermetic-data-persistence...');
    const HermeticDataPersistence = (await import('./data/hermetic-data-persistence.js')).default;
    console.log('[CHECK] Hermetic Data Persistence OK');
    
    console.log('4. Testing hermetic-admin-server...');
    const HermeticAdminServer = (await import('./server/hermetic-admin-server.js')).default;
    console.log('[CHECK] Hermetic Admin Server OK');
    
    console.log('5. Testing hermetic-auto-trader...');
    const HermeticAutoTrader = (await import('./trading/hermetic-auto-trader.js')).default;
    console.log('[CHECK] Hermetic Auto Trader OK');
    
    console.log('[PARTY] All imports successful!');
    
} catch (error) {
    console.error('[X] Import failed:', error);
    console.error('Stack:', error.stack);
}
