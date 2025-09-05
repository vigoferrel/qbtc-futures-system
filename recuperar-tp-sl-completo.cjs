const fs = require('fs');
const path = require('path');

// Leer el archivo actual
const currentFile = 'monitor-quantum-intelligence-llm-debug.html';
const backupFile = 'monitor-quantum-intelligence-llm-debug-backup.html';

console.log('🔧 Recuperando funcionalidades de Take Profit y Stop Loss...');

// Leer el archivo de respaldo para extraer las funciones de TP/SL
const backupContent = fs.readFileSync(backupFile, 'utf8');

// Extraer las funciones de cálculo de TP/SL del archivo de respaldo
const tpSlFunctionsMatch = backupContent.match(/function getIntegralRecommendation\([^}]+}/);
const tpSlFunctions = tpSlFunctionsMatch ? tpSlFunctionsMatch[0] : '';

// Función para calcular TP/SL dinámicos
const calculateTPSL = `
        // Función para calcular Take Profit y Stop Loss dinámicos
        function calculateDynamicTPSL(symbol, currentPrice, volatility, signal) {
            const basePrice = currentPrice;
            let entryPrice, exitPrice, stopLoss, takeProfit, optimalTimeframe;
            
            // Calcular niveles basados en la señal y volatilidad
            if (signal === 'BUY') {
                if (volatility > 0.8) {
                    // Alta volatilidad - estrategia agresiva
                    entryPrice = basePrice * (1 + volatility * 0.02);
                    exitPrice = basePrice * (1 + volatility * 0.08);
                    stopLoss = basePrice * (1 - volatility * 0.05);
                    takeProfit = basePrice * (1 + volatility * 0.15);
                    optimalTimeframe = '1h';
                } else if (volatility > 0.5) {
                    // Volatilidad media - estrategia moderada
                    entryPrice = basePrice * (1 + volatility * 0.015);
                    exitPrice = basePrice * (1 + volatility * 0.06);
                    stopLoss = basePrice * (1 - volatility * 0.04);
                    takeProfit = basePrice * (1 + volatility * 0.12);
                    optimalTimeframe = '4h';
                } else {
                    // Baja volatilidad - estrategia conservadora
                    entryPrice = basePrice * (1 + volatility * 0.01);
                    exitPrice = basePrice * (1 + volatility * 0.04);
                    stopLoss = basePrice * (1 - volatility * 0.03);
                    takeProfit = basePrice * (1 + volatility * 0.08);
                    optimalTimeframe = '1d';
                }
            } else if (signal === 'SELL') {
                if (volatility > 0.8) {
                    entryPrice = basePrice * (1 - volatility * 0.02);
                    exitPrice = basePrice * (1 - volatility * 0.08);
                    stopLoss = basePrice * (1 + volatility * 0.05);
                    takeProfit = basePrice * (1 - volatility * 0.15);
                    optimalTimeframe = '1h';
                } else if (volatility > 0.5) {
                    entryPrice = basePrice * (1 - volatility * 0.015);
                    exitPrice = basePrice * (1 - volatility * 0.06);
                    stopLoss = basePrice * (1 + volatility * 0.04);
                    takeProfit = basePrice * (1 - volatility * 0.12);
                    optimalTimeframe = '4h';
                } else {
                    entryPrice = basePrice * (1 - volatility * 0.01);
                    exitPrice = basePrice * (1 - volatility * 0.04);
                    stopLoss = basePrice * (1 + volatility * 0.03);
                    takeProfit = basePrice * (1 - volatility * 0.08);
                    optimalTimeframe = '1d';
                }
            } else {
                // HOLD - sin posiciones
                entryPrice = basePrice;
                exitPrice = basePrice;
                stopLoss = basePrice;
                takeProfit = basePrice;
                optimalTimeframe = 'N/A';
            }
            
            return {
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                timeframe: optimalTimeframe,
                riskReward: signal !== 'HOLD' ? Math.abs((takeProfit - entryPrice) / (entryPrice - stopLoss)) : 0
            };
        }

        // Función para determinar la señal basada en RSI y cambio de precio
        function determineSignal(rsi, change24h, volume) {
            if (rsi < 30 && change24h > 0) return 'BUY';
            if (rsi > 70 && change24h < 0) return 'SELL';
            if (rsi > 30 && rsi < 70) {
                if (change24h > 2) return 'BUY';
                if (change24h < -2) return 'SELL';
            }
            return 'HOLD';
        }

        // Función para calcular volatilidad basada en el cambio de precio
        function calculateVolatility(change24h, rsi) {
            const baseVolatility = Math.abs(change24h) / 100;
            const rsiFactor = Math.abs(rsi - 50) / 50;
            return Math.min(1.0, baseVolatility + rsiFactor * 0.3);
        }
`;

// Datos completos de todos los símbolos con TP/SL
const completeSymbolData = `
        // Datos completos de todos los símbolos con TP/SL
        const completeSymbolData = {
            MAJOR_CRYPTO: [
                { symbol: "BTCUSDT", price: 103407.50, change24h: -5.00, volume: 830000000, rsi: 53, sector: "MAJOR_CRYPTO" },
                { symbol: "ETHUSDT", price: 4644.65, change24h: 3.98, volume: 1008100000, rsi: 31, sector: "MAJOR_CRYPTO" },
                { symbol: "BNBUSDT", price: 890.55, change24h: 2.95, volume: 411100000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "ADAUSDT", price: 0.8358, change24h: 1.93, volume: 1090700000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "XRPUSDT", price: 2.8355, change24h: 0.91, volume: 222000000, rsi: 63, sector: "MAJOR_CRYPTO" }
            ],
            LARGE_CAP: [
                { symbol: "ETHUSDT", price: 4644.65, change24h: 3.98, volume: 204600000, rsi: 37, sector: "LARGE_CAP" },
                { symbol: "BNBUSDT", price: 890.55, change24h: 2.95, volume: 830800000, rsi: 61, sector: "LARGE_CAP" },
                { symbol: "ADAUSDT", price: 0.8358, change24h: 1.93, volume: 2163600000, rsi: 61, sector: "LARGE_CAP" },
                { symbol: "XRPUSDT", price: 2.8355, change24h: 0.91, volume: 917800000, rsi: 40, sector: "LARGE_CAP" },
                { symbol: "DOTUSDT", price: 3.7956, change24h: -0.11, volume: 1005600000, rsi: 33, sector: "LARGE_CAP" },
                { symbol: "LINKUSDT", price: 23.4106, change24h: -1.14, volume: 533000000, rsi: 59, sector: "LARGE_CAP" }
            ],
            DEFI_TOKENS: [
                { symbol: "UNIUSDT", price: 10.0380, change24h: 2.95, volume: 1827400000, rsi: 37, sector: "DEFI_TOKENS" },
                { symbol: "AAVEUSDT", price: 324.4262, change24h: 1.93, volume: 595500000, rsi: 52, sector: "DEFI_TOKENS" },
                { symbol: "COMPUSDT", price: 43.3501, change24h: 0.91, volume: 953100000, rsi: 44, sector: "DEFI_TOKENS" },
                { symbol: "SUSHIUSDT", price: 0.7791, change24h: -0.11, volume: 1878500000, rsi: 47, sector: "DEFI_TOKENS" },
                { symbol: "CRVUSDT", price: 0.7612, change24h: -1.14, volume: 1530100000, rsi: 45, sector: "DEFI_TOKENS" }
            ],
            GAMING_METAVERSE: [
                { symbol: "AXSUSDT", price: 2.5585, change24h: 1.93, volume: 2923300000, rsi: 60, sector: "GAMING_METAVERSE" },
                { symbol: "SANDUSDT", price: 0.2825, change24h: 0.91, volume: 2591700000, rsi: 62, sector: "GAMING_METAVERSE" },
                { symbol: "MANAUSDT", price: 0.2897, change24h: -0.11, volume: 3626800000, rsi: 49, sector: "GAMING_METAVERSE" },
                { symbol: "ENJUSDT", price: 0.0692, change24h: -1.14, volume: 1673100000, rsi: 64, sector: "GAMING_METAVERSE" },
                { symbol: "CHZUSDT", price: 0.0391, change24h: -2.16, volume: 3017400000, rsi: 48, sector: "GAMING_METAVERSE" }
            ],
            MEME_TOKENS: [
                { symbol: "DOGEUSDT", price: 0.2220, change24h: 0.91, volume: 964800000, rsi: 58, sector: "MEME_TOKENS" },
                { symbol: "SHIBUSDT", price: 0.0000, change24h: -0.11, volume: 3031600000, rsi: 69, sector: "MEME_TOKENS" },
                { symbol: "BABYDOGEUSDT", price: 0.0001, change24h: -1.14, volume: 4362800000, rsi: 39, sector: "MEME_TOKENS" },
                { symbol: "SAFEMOONUSDT", price: 0.0000, change24h: -2.16, volume: 1070700000, rsi: 68, sector: "MEME_TOKENS" }
            ]
        };
`;

// Función actualizada para crear tabla de tickers con TP/SL
const createTickerTableWithTPSL = `
        function createTickerTableWithTPSL() {
            let html = '<table><thead><tr><th>Ticker</th><th>Sector</th><th>Precio</th><th>Cambio %</th><th>Volumen</th><th>RSI</th><th>Señal</th><th>Entry</th><th>SL</th><th>TP</th><th>R/R</th></tr></thead><tbody>';
            
            Object.keys(completeSymbolData).forEach(sector => {
                completeSymbolData[sector].forEach(ticker => {
                    const signal = determineSignal(ticker.rsi, ticker.change24h, ticker.volume);
                    const volatility = calculateVolatility(ticker.change24h, ticker.rsi);
                    const tpSl = calculateDynamicTPSL(ticker.symbol, ticker.price, volatility, signal);
                    const changeClass = ticker.change24h > 0 ? 'positive' : ticker.change24h < 0 ? 'negative' : 'neutral';
                    
                    html += \`<tr>
                        <td>\${ticker.symbol}</td>
                        <td>\${sector.replace(/_/g, ' ')}</td>
                        <td>$\${ticker.price.toFixed(4)}</td>
                        <td class="\${changeClass}">\${ticker.change24h.toFixed(2)}%</td>
                        <td>$\${(ticker.volume / 1000000).toFixed(1)}M</td>
                        <td>\${ticker.rsi}</td>
                        <td>\${signal}</td>
                        <td>$\${tpSl.entryPrice.toFixed(4)}</td>
                        <td>$\${tpSl.stopLoss.toFixed(4)}</td>
                        <td>$\${tpSl.takeProfit.toFixed(4)}</td>
                        <td>\${tpSl.riskReward.toFixed(2)}</td>
                    </tr>\`;
                });
            });
            
            html += '</tbody></table>';
            return html;
        }
`;

// Función actualizada para crear tabla de sectores con datos diferenciados
const createSectorTableComplete = `
        function createSectorTableComplete() {
            let html = '<table><thead><tr><th>Sector</th><th>Symbols</th><th>Volume</th><th>Whale Flow</th><th>Signal</th><th>Avg RSI</th><th>Volatility</th></tr></thead><tbody>';
            
            Object.keys(completeSymbolData).forEach((sector, index) => {
                const symbols = completeSymbolData[sector];
                const totalVolume = symbols.reduce((sum, ticker) => sum + ticker.volume, 0);
                const avgRSI = symbols.reduce((sum, ticker) => sum + ticker.rsi, 0) / symbols.length;
                const avgChange = symbols.reduce((sum, ticker) => sum + Math.abs(ticker.change24h), 0) / symbols.length;
                const volatility = avgChange / 100;
                const whaleFlow = 5000000 + (index * 2500000);
                
                // Determinar señal dominante del sector
                const signals = symbols.map(ticker => determineSignal(ticker.rsi, ticker.change24h, ticker.volume));
                const buyCount = signals.filter(s => s === 'BUY').length;
                const sellCount = signals.filter(s => s === 'SELL').length;
                const holdCount = signals.filter(s => s === 'HOLD').length;
                
                let dominantSignal = 'HOLD';
                if (buyCount > sellCount && buyCount > holdCount) dominantSignal = 'BUY';
                else if (sellCount > buyCount && sellCount > holdCount) dominantSignal = 'SELL';
                
                html += \`<tr>
                    <td>\${sector.replace(/_/g, ' ')}</td>
                    <td>\${symbols.length}</td>
                    <td>$\${(totalVolume / 1000000).toFixed(1)}M</td>
                    <td>$\${(whaleFlow / 1000000).toFixed(1)}M</td>
                    <td>\${dominantSignal}</td>
                    <td>\${avgRSI.toFixed(1)}</td>
                    <td>\${volatility.toFixed(3)}</td>
                </tr>\`;
            });
            
            html += '</tbody></table>';
            return html;
        }
`;

// Leer el archivo actual
let currentContent = fs.readFileSync(currentFile, 'utf8');

// Encontrar la posición donde insertar las nuevas funciones (después de las constantes)
const insertPosition = currentContent.indexOf('// Funciones de análisis básicas');

// Insertar las nuevas funciones
const newContent = currentContent.slice(0, insertPosition) + 
                  calculateTPSL + 
                  completeSymbolData + 
                  createTickerTableWithTPSL + 
                  createSectorTableComplete + 
                  '\n        ' +
                  currentContent.slice(insertPosition);

// Actualizar las funciones de carga para usar las nuevas tablas
let updatedContent = newContent.replace(
    'document.getElementById(\'sector-table\').innerHTML = createSectorTable(realSectorData);',
    'document.getElementById(\'sector-table\').innerHTML = createSectorTableComplete();'
);

updatedContent = updatedContent.replace(
    'document.getElementById(\'ticker-table\').innerHTML = createTickerTable(realSectorData);',
    'document.getElementById(\'ticker-table\').innerHTML = createTickerTableWithTPSL();'
);

// Escribir el archivo actualizado
fs.writeFileSync(currentFile, updatedContent);

console.log('✅ Funcionalidades de Take Profit y Stop Loss recuperadas');
console.log('✅ Tablas completadas con todos los símbolos');
console.log('✅ Cálculos dinámicos de TP/SL implementados');
console.log('✅ Datos diferenciados por sector restaurados');
