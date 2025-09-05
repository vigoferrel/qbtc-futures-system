const fs = require('fs');

console.log('🔧 Expandindo símbolos y reemplazando SAFEMOON...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// Nuevos datos de símbolos expandidos
const expandedSymbolData = `
        // Datos completos de todos los símbolos con TP/SL - EXPANDIDOS
        const completeSymbolData = {
            MAJOR_CRYPTO: [
                { symbol: "BTCUSDT", price: 103407.50, change24h: -5.00, volume: 830000000, rsi: 53, sector: "MAJOR_CRYPTO" },
                { symbol: "ETHUSDT", price: 4644.65, change24h: 3.98, volume: 1008100000, rsi: 31, sector: "MAJOR_CRYPTO" },
                { symbol: "BNBUSDT", price: 890.55, change24h: 2.95, volume: 411100000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "ADAUSDT", price: 0.8358, change24h: 1.93, volume: 1090700000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "XRPUSDT", price: 2.8355, change24h: 0.91, volume: 222000000, rsi: 63, sector: "MAJOR_CRYPTO" },
                { symbol: "SOLUSDT", price: 98.45, change24h: 4.23, volume: 750000000, rsi: 58, sector: "MAJOR_CRYPTO" },
                { symbol: "MATICUSDT", price: 0.8923, change24h: -1.45, volume: 680000000, rsi: 42, sector: "MAJOR_CRYPTO" },
                { symbol: "AVAXUSDT", price: 34.67, change24h: 2.18, volume: 520000000, rsi: 55, sector: "MAJOR_CRYPTO" }
            ],
            LARGE_CAP: [
                { symbol: "ETHUSDT", price: 4644.65, change24h: 3.98, volume: 204600000, rsi: 37, sector: "LARGE_CAP" },
                { symbol: "BNBUSDT", price: 890.55, change24h: 2.95, volume: 830800000, rsi: 61, sector: "LARGE_CAP" },
                { symbol: "ADAUSDT", price: 0.8358, change24h: 1.93, volume: 2163600000, rsi: 61, sector: "LARGE_CAP" },
                { symbol: "XRPUSDT", price: 2.8355, change24h: 0.91, volume: 917800000, rsi: 40, sector: "LARGE_CAP" },
                { symbol: "DOTUSDT", price: 3.7956, change24h: -0.11, volume: 1005600000, rsi: 33, sector: "LARGE_CAP" },
                { symbol: "LINKUSDT", price: 23.4106, change24h: -1.14, volume: 533000000, rsi: 59, sector: "LARGE_CAP" },
                { symbol: "LTCUSDT", price: 67.89, change24h: 1.25, volume: 450000000, rsi: 48, sector: "LARGE_CAP" },
                { symbol: "BCHUSDT", price: 234.56, change24h: -0.87, volume: 380000000, rsi: 51, sector: "LARGE_CAP" },
                { symbol: "ATOMUSDT", price: 12.34, change24h: 3.45, volume: 420000000, rsi: 62, sector: "LARGE_CAP" },
                { symbol: "NEARUSDT", price: 5.67, change24h: -2.11, volume: 290000000, rsi: 38, sector: "LARGE_CAP" }
            ],
            DEFI_TOKENS: [
                { symbol: "UNIUSDT", price: 10.0380, change24h: 2.95, volume: 1827400000, rsi: 37, sector: "DEFI_TOKENS" },
                { symbol: "AAVEUSDT", price: 324.4262, change24h: 1.93, volume: 595500000, rsi: 52, sector: "DEFI_TOKENS" },
                { symbol: "COMPUSDT", price: 43.3501, change24h: 0.91, volume: 953100000, rsi: 44, sector: "DEFI_TOKENS" },
                { symbol: "SUSHIUSDT", price: 0.7791, change24h: -0.11, volume: 1878500000, rsi: 47, sector: "DEFI_TOKENS" },
                { symbol: "CRVUSDT", price: 0.7612, change24h: -1.14, volume: 1530100000, rsi: 45, sector: "DEFI_TOKENS" },
                { symbol: "MKRUSDT", price: 2345.67, change24h: 4.32, volume: 320000000, rsi: 66, sector: "DEFI_TOKENS" },
                { symbol: "SNXUSDT", price: 3.45, change24h: -1.23, volume: 280000000, rsi: 41, sector: "DEFI_TOKENS" },
                { symbol: "YFIUSDT", price: 12345.67, change24h: 2.87, volume: 150000000, rsi: 59, sector: "DEFI_TOKENS" },
                { symbol: "1INCHUSDT", price: 0.4567, change24h: 1.34, volume: 420000000, rsi: 54, sector: "DEFI_TOKENS" },
                { symbol: "BALUSDT", price: 8.90, change24h: -0.56, volume: 180000000, rsi: 46, sector: "DEFI_TOKENS" }
            ],
            GAMING_METAVERSE: [
                { symbol: "AXSUSDT", price: 2.5585, change24h: 1.93, volume: 2923300000, rsi: 60, sector: "GAMING_METAVERSE" },
                { symbol: "SANDUSDT", price: 0.2825, change24h: 0.91, volume: 2591700000, rsi: 62, sector: "GAMING_METAVERSE" },
                { symbol: "MANAUSDT", price: 0.2897, change24h: -0.11, volume: 3626800000, rsi: 49, sector: "GAMING_METAVERSE" },
                { symbol: "ENJUSDT", price: 0.0692, change24h: -1.14, volume: 1673100000, rsi: 64, sector: "GAMING_METAVERSE" },
                { symbol: "CHZUSDT", price: 0.0391, change24h: -2.16, volume: 3017400000, rsi: 48, sector: "GAMING_METAVERSE" },
                { symbol: "GALAUSDT", price: 0.0234, change24h: 3.45, volume: 890000000, rsi: 67, sector: "GAMING_METAVERSE" },
                { symbol: "ILVUSDT", price: 45.67, change24h: -1.23, volume: 340000000, rsi: 43, sector: "GAMING_METAVERSE" },
                { symbol: "ALICEUSDT", price: 1.23, change24h: 2.34, volume: 560000000, rsi: 58, sector: "GAMING_METAVERSE" },
                { symbol: "TLMUSDT", price: 0.0123, change24h: -0.87, volume: 780000000, rsi: 39, sector: "GAMING_METAVERSE" },
                { symbol: "HEROUSDT", price: 0.0456, change24h: 1.67, volume: 450000000, rsi: 55, sector: "GAMING_METAVERSE" }
            ],
            MEME_TOKENS: [
                { symbol: "DOGEUSDT", price: 0.2220, change24h: 0.91, volume: 964800000, rsi: 58, sector: "MEME_TOKENS" },
                { symbol: "SHIBUSDT", price: 0.0000, change24h: -0.11, volume: 3031600000, rsi: 69, sector: "MEME_TOKENS" },
                { symbol: "BABYDOGEUSDT", price: 0.0001, change24h: -1.14, volume: 4362800000, rsi: 39, sector: "MEME_TOKENS" },
                { symbol: "FLOKIUSDT", price: 0.0002, change24h: 2.34, volume: 890000000, rsi: 62, sector: "MEME_TOKENS" },
                { symbol: "PEPEUSDT", price: 0.0000, change24h: 1.23, volume: 1560000000, rsi: 55, sector: "MEME_TOKENS" },
                { symbol: "BONKUSDT", price: 0.0000, change24h: -0.45, volume: 2340000000, rsi: 47, sector: "MEME_TOKENS" },
                { symbol: "WIFUSDT", price: 0.0000, change24h: 3.67, volume: 1230000000, rsi: 71, sector: "MEME_TOKENS" },
                { symbol: "MYROUSDT", price: 0.0000, change24h: -1.89, volume: 890000000, rsi: 33, sector: "MEME_TOKENS" }
            ]
        };
`;

// Función mejorada para manejar precios muy bajos
const improvedTPSLFunction = `
        // Función para calcular Take Profit y Stop Loss dinámicos - MEJORADA
        function calculateDynamicTPSL(symbol, currentPrice, volatility, signal) {
            // Validar precio mínimo para evitar divisiones por cero
            const minPrice = 0.0001;
            const basePrice = Math.max(currentPrice, minPrice);
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
            
            // Calcular risk/reward con validación
            let riskReward = 0;
            if (signal !== 'HOLD' && Math.abs(entryPrice - stopLoss) > 0.0001) {
                riskReward = Math.abs((takeProfit - entryPrice) / (entryPrice - stopLoss));
            }
            
            return {
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                timeframe: optimalTimeframe,
                riskReward: riskReward
            };
        }
`;

// Reemplazar los datos de símbolos
content = content.replace(
    /const completeSymbolData = \{[\s\S]*?\};/,
    expandedSymbolData.trim()
);

// Reemplazar la función de cálculo de TP/SL
content = content.replace(
    /function calculateDynamicTPSL\([\s\S]*?\};/,
    improvedTPSLFunction.trim()
);

// Escribir el archivo actualizado
fs.writeFileSync(htmlFile, content);

console.log('✅ Símbolos expandidos:');
console.log('   • MAJOR_CRYPTO: 8 símbolos (agregados SOL, MATIC, AVAX)');
console.log('   • LARGE_CAP: 10 símbolos (agregados LTC, BCH, ATOM, NEAR)');
console.log('   • DEFI_TOKENS: 10 símbolos (agregados MKR, SNX, YFI, 1INCH, BAL)');
console.log('   • GAMING_METAVERSE: 10 símbolos (agregados GALA, ILV, ALICE, TLM, HERO)');
console.log('   • MEME_TOKENS: 8 símbolos (reemplazado SAFEMOON por FLOKI, PEPE, BONK, WIF, MYRO)');
console.log('✅ Función TP/SL mejorada para manejar precios muy bajos');
console.log('✅ Total: 46 símbolos distribuidos en 5 sectores');
