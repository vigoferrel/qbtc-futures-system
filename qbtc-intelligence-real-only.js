import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 64614;

// Función para hacer peticiones HTTPS con manejo de errores real
function makeHttpsRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'QBTC-Real-Data-System/1.0',
                'Accept': 'application/json'
            },
            timeout: 10000
        };

        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } else {
                        console.log(`⚠️ Non-JSON response from API`);
                        reject(new Error('Invalid JSON response'));
                    }
                } catch (e) {
                    console.log(`⚠️ JSON parse error: ${e.message}`);
                    reject(new Error('JSON parse error'));
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

// Función para obtener datos reales de Binance
async function getRealBinanceData(symbol) {
    const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    console.log(`🔗 Real Binance request: ${symbol} -> ${binanceUrl}`);
    
    try {
        const data = await makeHttpsRequest(binanceUrl);
        if (data && data.price) {
            console.log(`✅ Real Binance data: ${symbol} = $${data.price}`);
            return {
                symbol: symbol,
                price: data.price,
                source: 'binance-real',
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error('Invalid price data from Binance');
        }
    } catch (error) {
        console.error(`❌ Real Binance error: ${symbol} - ${error.message}`);
        throw error; // NO FALLBACK - Solo datos reales
    }
}

// Función para obtener datos reales de CoinGecko (alternativa)
async function getRealCoinGeckoData(symbol) {
    // Convertir símbolo de Binance a CoinGecko format
    const symbolMap = {
        'BTCUSDT': 'bitcoin',
        'ETHUSDT': 'ethereum',
        'BNBUSDT': 'binancecoin',
        'ADAUSDT': 'cardano',
        'SOLUSDT': 'solana',
        'DOTUSDT': 'polkadot',
        'LINKUSDT': 'chainlink',
        'MATICUSDT': 'matic-network',
        'AVAXUSDT': 'avalanche-2',
        'ATOMUSDT': 'cosmos'
    };
    
    const coinId = symbolMap[symbol];
    if (!coinId) {
        throw new Error(`Symbol ${symbol} not supported in CoinGecko`);
    }
    
    const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    console.log(`🔗 Real CoinGecko request: ${symbol} -> ${coingeckoUrl}`);
    
    try {
        const data = await makeHttpsRequest(coingeckoUrl);
        if (data && data[coinId] && data[coinId].usd) {
            const price = data[coinId].usd.toString();
            console.log(`✅ Real CoinGecko data: ${symbol} = $${price}`);
            return {
                symbol: symbol,
                price: price,
                source: 'coingecko-real',
                timestamp: new Date().toISOString()
            };
        } else {
            throw new Error('Invalid price data from CoinGecko');
        }
    } catch (error) {
        console.error(`❌ Real CoinGecko error: ${symbol} - ${error.message}`);
        throw error; // NO FALLBACK - Solo datos reales
    }
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
        serveFile(res, 'monitor-intelligence-real-only.html', 'text/html');
        return;
    }

    // Proxy para precios reales de Binance
    if (url.startsWith('/api/binance/price/')) {
        const symbol = url.split('/').pop();
        
        // Intentar Binance primero, luego CoinGecko como respaldo real
        getRealBinanceData(symbol)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            })
            .catch(binanceError => {
                console.log(`🔄 Binance failed, trying CoinGecko for ${symbol}`);
                getRealCoinGeckoData(symbol)
                    .then(data => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(data));
                    })
                    .catch(coingeckoError => {
                        console.error(`❌ Both APIs failed for ${symbol}`);
                        res.writeHead(503, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'No real data available',
                            symbol: symbol,
                            message: 'Both Binance and CoinGecko APIs are unavailable',
                            timestamp: new Date().toISOString()
                        }));
                    });
            });
        return;
    }

    // Health check
    if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ACTIVE',
            service: 'QBTC Intelligence Real-Only Server',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET / - Dashboard',
                'GET /api/binance/price/:symbol - Real Binance/CoinGecko Price Data',
                'GET /health - Health Check'
            ],
            features: [
                'Real data only - NO simulations',
                'Binance API primary source',
                'CoinGecko API backup source',
                'No fallback data - only real prices',
                'CORS support',
                'Timeout protection'
            ],
            dataPolicy: 'REAL_ONLY_NO_FALLBACK'
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
    console.log('🚀 QBTC Intelligence Real-Only Server iniciado');
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔗 Real Binance/CoinGecko proxy: http://localhost:${PORT}/api/binance/price/:symbol`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Servidor listo para recibir peticiones');
    console.log('🔧 Configuración: SOLO DATOS REALES - SIN SIMULACIONES');
    console.log('🚫 POLÍTICA: NO FALLBACK - SOLO PRECIOS REALES');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});
