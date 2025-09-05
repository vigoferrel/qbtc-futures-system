#!/usr/bin/env node

/**
 * [GALAXY] DASHBOARD LAUNCHER SIMPLE
 * Lanzador directo para el dashboard hermético
 */

import DashboardServer from './frontend/dashboard-server.js';

console.log('[GALAXY] Iniciando Dashboard Multidimensional Hermético...');

const dashboardServer = new DashboardServer(8081);
dashboardServer.start();

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n[STOP] Cerrando Dashboard Multidimensional...');
    dashboardServer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[STOP] Cerrando Dashboard Multidimensional...');
    dashboardServer.stop();
    process.exit(0);
});

console.log('[SPARKLES] Dashboard launcher inicializado');
