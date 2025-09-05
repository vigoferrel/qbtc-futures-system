#!/usr/bin/env node

/**
 * Script de arranque para Leonardo API Server con carga de .env
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el archivo .env en el directorio raíz
const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

console.log('[WRENCH] Cargando variables de entorno...');
console.log(`📁 Archivo .env: ${envPath}`);
console.log(`🔑 BINANCE_API_KEY: ${process.env.BINANCE_API_KEY ? '[CHECK] Configurada' : '[X] No encontrada'}`);
console.log(`🔐 BINANCE_API_SECRET: ${process.env.BINANCE_API_SECRET ? '[CHECK] Configurada' : '[X] No encontrada'}`);
console.log(`[GLOBE] USE_TESTNET: ${process.env.USE_TESTNET || 'false'}`);

// Importar y ejecutar el servidor Leonardo
import('./leonardo-api-simple.js').catch(error => {
    console.error('[X] Error iniciando Leonardo API:', error);
    process.exit(1);
});
