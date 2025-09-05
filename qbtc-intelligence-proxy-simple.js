const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 64612;

// Función para hacer peticiones HTTPS
function makeHttpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
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
        const binanceUrl = `https://fapi.binance.com/api/v3/ticker/price?symbol=${symbol}`;
        
        console.log(`🔗 Proxy request: ${symbol} -> ${binanceUrl}`);
        
        makeHttpsRequest(binanceUrl)
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
                console.log(`✅ Success: ${symbol} = $${data.price}`);
            })
            .catch(error => {
                console.error(`❌ Error: ${symbol} - ${error.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error obteniendo precio de Binance' }));
            });
        return;
    }

    // Health check
    if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ACTIVE',
            service: 'QBTC Intelligence Proxy Server',
            timestamp: new Date().toISOString(),
            endpoints: [
                'GET / - Dashboard',
                'GET /api/binance/price/:symbol - Binance Price Proxy',
                'GET /health - Health Check'
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
    console.log('🚀 QBTC Intelligence Proxy Server iniciado');
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔗 Proxy Binance activo en: http://localhost:${PORT}/api/binance/price/:symbol`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Servidor listo para recibir peticiones');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});
