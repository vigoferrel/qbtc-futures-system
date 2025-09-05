#!/usr/bin/env node

import { config } from 'dotenv';
import crypto from 'crypto';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
config({ path: path.join(__dirname, '..', '.env') });

console.log('[WRENCH] Probando conexión a Binance...');

const apiKey = process.env.BINANCE_API_KEY;
const secretKey = process.env.BINANCE_API_SECRET;

if (!apiKey || !secretKey) {
    console.log('[X] Credenciales no encontradas');
    process.exit(1);
}

console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
console.log(`🔐 Secret: ${secretKey.substring(0, 10)}...`);

const timestamp = Date.now();
const queryString = `timestamp=${timestamp}`;
const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
const finalQuery = `${queryString}&signature=${signature}`;

const options = {
    hostname: 'fapi.binance.com',
    path: `/fapi/v2/account?${finalQuery}`,
    method: 'GET',
    headers: {
        'X-MBX-APIKEY': apiKey
    }
};

console.log('[SATELLITE] Consultando Binance...');

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            
            if (response.totalWalletBalance !== undefined) {
                console.log('[CHECK] ¡CONEXIÓN EXITOSA!');
                console.log(`[MONEY] Balance Total: $${parseFloat(response.totalWalletBalance).toLocaleString()}`);
                console.log(`💸 P&L No Realizado: $${parseFloat(response.totalUnrealizedProfit).toLocaleString()}`);
                console.log(`🏦 Balance Disponible: $${parseFloat(response.availableBalance).toLocaleString()}`);
                
                if (response.positions) {
                    const activePositions = response.positions.filter(p => parseFloat(p.positionAmt) !== 0);
                    console.log(`[CHART] Posiciones Activas: ${activePositions.length}`);
                }
            } else {
                console.log('[X] Error en respuesta de Binance:');
                console.log(JSON.stringify(response, null, 2).substring(0, 500));
            }
        } catch (error) {
            console.log('[X] Error parseando respuesta:');
            console.log(data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.log('[X] Error de conexión:', error.message);
});

req.setTimeout(10000, () => {
    req.destroy();
    console.log('[X] Timeout en consulta a Binance');
});

req.end();
