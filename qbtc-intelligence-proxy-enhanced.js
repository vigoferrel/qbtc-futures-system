import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 64613;

// Función para hacer peticiones HTTPS con mejor manejo de errores
function makeHttpsRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'QBTC-Intelligence-System/1.0',
                'Accept': 'application/json'
            },
            timeout: 5000
        };

        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    // Verificar si la respuesta es JSON válido
                    if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } else {
                        // Si no es JSON, crear datos de fallback
                        console.log(`⚠️ Non-JSON response from Binance, using fallback data`);
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`⚠️ JSON parse error, using fallback data: ${e.message}`);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            console.error(`❌ HTTPS request error: ${err.message}`);
            reject(err);
        }).on('timeout', () => {
            console.error(`⏰ Request timeout`);
            reject(new Error('Request timeout'));
        });
    });
}

// Función para generar datos de fallback cuánticos
function generateFallbackPrice(symbol) {
    const basePrices = {
        'BTCUSDT': 50000,
        'ETHUSDT': 3000,
        'BNBUSDT': 400,
        'ADAUSDT': 0.5,
        'SOLUSDT': 100,
        'DOTUSDT': 7,
        'LINKUSDT': 15,
        'MATICUSDT': 0.8,
        'AVAXUSDT': 25,
        'ATOMUSDT': 8
    };
    
    const basePrice = basePrices[symbol] || 100;
    const timestamp = Date.now();
    const quantumValue = Math.sin(timestamp / 1000) * Math.cos(timestamp / 500);
    const variation = (quantumValue * 0.02); // ±2% variación
    
    return {
        symbol: symbol,
        price: (basePrice * (1 + variation)).toFixed(8),
        source: 'quantum-fallback'
    };
}

// Función para servir archivos estáticos
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const url = req.url;

    console.log(`📡 Request: ${req.method} ${url}`);

    // Ruta principal - servir el dashboard
    if (url === '/' || url === '/index.html') {
        serveFile(res, 'monitor-intelligence-advanced.html', 'text/html');
        return;
    }

    // Proxy para precios de Binance
    if (url.startsWith('/api/binance/price/')) {
        const symbol = url.split('/').pop();
        const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
        
        console.log(`🔗 Proxy request: ${symbol} -> ${binanceUrl}`);
        
        makeHttpsRequest(binanceUrl)
            .then(data => {
                if (data && data.price) {
                    // Datos reales de Binance
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                    console.log(`✅ Success: ${symbol} = $${data.price}`);
                } else {
                    // Usar datos de fallback
                    const fallbackData = generateFallbackPrice(symbol);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fallbackData));
                    console.log(`🔄 Fallback: ${symbol} = $${fallbackData.price}`);
                }
            })
            .catch(error => {
                console.error(`❌ Error: ${symbol} - ${error.message}`);
                // Usar datos de fallback en caso de error
                const fallbackData = generateFallbackPrice(symbol);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(fallbackData));
                console.log(`🔄 Error Fallback: ${symbol} = $${fallbackData.price}`);
            });
        return;
    }

    // Health check
    if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ACTIVE',
            service: 'QBTC Intelligence Proxy Server (Enhanced)',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET / - Dashboard',
                'GET /api/binance/price/:symbol - Binance Price Proxy with Fallback',
                'GET /health - Health Check'
            ],
            features: [
                'Enhanced error handling',
                'Quantum fallback data',
                'CORS support',
                'Timeout protection'
            ]
        }));
        return;
    }

    // Servir archivos estáticos
    if (url.endsWith('.html')) {
        serveFile(res, url.substring(1), 'text/html');
        return;
    }

    if (url.endsWith('.css')) {
        serveFile(res, url.substring(1), 'text/css');
        return;
    }

    if (url.endsWith('.js')) {
        serveFile(res, url.substring(1), 'application/javascript');
        return;
    }

    // 404 para rutas no encontradas
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log('🚀 QBTC Intelligence Proxy Server (Enhanced) iniciado');
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔗 Proxy Binance activo en: http://localhost:${PORT}/api/binance/price/:symbol`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Servidor listo para recibir peticiones');
    console.log('🔧 Configuración: ES Modules + Enhanced Error Handling');
    console.log('🔄 Fallback: Datos cuánticos cuando Binance no responde');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});
