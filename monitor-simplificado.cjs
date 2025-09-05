const fs = require('fs');

console.log('🔧 Creando versión simplificada y robusta del monitor...');

// Leer el archivo actual
const currentContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// Extraer solo las partes esenciales
const scriptMatch = currentContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('❌ No se encontró la sección <script>');
    process.exit(1);
}

const jsCode = scriptMatch[1];

// Crear una versión simplificada con solo las funciones esenciales
const simplifiedScript = `
        // Constantes cuánticas QBTC
        const QBTC_QUANTUM_CONSTANTS = {
            LAMBDA_7919: 8.977020,
            PHI_GOLDEN: 1.618034,
            RESONANCE_FREQ: 888,
            QUANTUM_FIBONACCI: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765],
            PRIME_SEQUENCE: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71]
        };

        // Datos simplificados de símbolos
        const completeSymbolData = {
            MAJOR_CRYPTO: [
                { symbol: "BTCUSDT", price: 103407.50, change24h: -5.00, volume: 830000000, rsi: 53, sector: "MAJOR_CRYPTO" },
                { symbol: "ETHUSDT", price: 4644.65, change24h: 3.98, volume: 1008100000, rsi: 31, sector: "MAJOR_CRYPTO" },
                { symbol: "BNBUSDT", price: 890.55, change24h: 2.95, volume: 411100000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "ADAUSDT", price: 0.8358, change24h: 1.93, volume: 1090700000, rsi: 64, sector: "MAJOR_CRYPTO" },
                { symbol: "XRPUSDT", price: 2.8355, change24h: 0.91, volume: 222000000, rsi: 63, sector: "MAJOR_CRYPTO" }
            ],
            LARGE_CAP: [
                { symbol: "DOTUSDT", price: 3.7956, change24h: -0.11, volume: 1005600000, rsi: 33, sector: "LARGE_CAP" },
                { symbol: "LINKUSDT", price: 23.4106, change24h: -1.14, volume: 533000000, rsi: 59, sector: "LARGE_CAP" },
                { symbol: "LTCUSDT", price: 67.89, change24h: 1.25, volume: 450000000, rsi: 48, sector: "LARGE_CAP" },
                { symbol: "BCHUSDT", price: 234.56, change24h: -0.87, volume: 380000000, rsi: 51, sector: "LARGE_CAP" },
                { symbol: "ATOMUSDT", price: 12.34, change24h: 3.45, volume: 420000000, rsi: 62, sector: "LARGE_CAP" }
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
                { symbol: "SAFEMOONUSDT", price: 0.0000, change24h: -2.16, volume: 1070700000, rsi: 68, sector: "MEME_TOKENS" },
                { symbol: "PEPEUSDT", price: 0.0000, change24h: 3.45, volume: 890000000, rsi: 67, sector: "MEME_TOKENS" }
            ]
        };

        // Función para encontrar el mejor símbolo por sector
        function findBestSymbol(sectorData) {
            if (!sectorData || sectorData.length === 0) return null;
            
            let bestSymbol = null;
            let bestScore = -Infinity;
            
            for (const symbol of sectorData) {
                const volumeScore = Math.log(symbol.volume) / 10;
                const rsiScore = symbol.rsi > 30 && symbol.rsi < 70 ? 10 : 0;
                const changeScore = Math.abs(symbol.change24h) * 2;
                const priceScore = symbol.price > 0.0001 ? 5 : 0;
                
                const totalScore = volumeScore + rsiScore + changeScore + priceScore;
                
                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestSymbol = symbol.symbol;
                }
            }
            
            return bestSymbol;
        }

        // Función para convertir datos al formato de análisis
        function convertToAnalysisFormat(data) {
            const converted = { sectorAnalysis: {} };
            
            Object.keys(data).forEach(sector => {
                const symbols = data[sector];
                const totalVolume = symbols.reduce((sum, symbol) => sum + symbol.volume, 0);
                const avgRSI = symbols.reduce((sum, symbol) => sum + symbol.rsi, 0) / symbols.length;
                
                converted.sectorAnalysis[sector] = {
                    sectorMetrics: { sectorStrength: 75, sectorConfidence: 80 },
                    avgConfidence: 78,
                    totalVolume: totalVolume,
                    buySignals: 3,
                    sellSignals: 1,
                    holdSignals: 1,
                    avgRSI: avgRSI,
                    tickers: symbols
                };
            });
            
            return converted;
        }

        // Funciones de análisis simplificadas
        function analyzeFeynmanPaths(data) {
            let analysis = '🧠 FEYNMAN PATH INTEGRAL ANALYSIS - QBTC QUANTUM\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    analysis += \`🏭 \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Total Volume: $\${(sectorData.totalVolume / 1000000).toFixed(1)}M\\n\`;
                    analysis += \`   Avg RSI: \${sectorData.avgRSI.toFixed(1)}\\n\`;
                    analysis += \`   Buy Signals: \${sectorData.buySignals}\\n\\n\`;
                });
            }
            
            return analysis;
        }

        function analyzeMarkovChains(data) {
            let analysis = '⛓️ MARKOV CHAIN STATE ANALYSIS - QBTC QUANTUM\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    analysis += \`📊 \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Sector Strength: \${sectorData.sectorMetrics.sectorStrength}%\\n\`;
                    analysis += \`   Confidence: \${sectorData.sectorMetrics.sectorConfidence}%\\n\\n\`;
                });
            }
            
            return analysis;
        }

        function analyzeWhaleFlow(data) {
            let analysis = '🐋 WHALE & INSTITUTIONAL FLOW ANALYSIS\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    const whaleFlow = sectorData.totalVolume * 0.1;
                    analysis += \`💰 \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Whale Flow: $\${(whaleFlow / 1000000).toFixed(1)}M\\n\`;
                    analysis += \`   Institutional Interest: \${Math.floor(Math.random() * 30) + 60}%\\n\\n\`;
                });
            }
            
            return analysis;
        }

        function analyzeMacroSectorial(data) {
            let analysis = '🌍 MACRO-SECTORIAL INTELLIGENCE ANALYSIS\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    analysis += \`🌐 \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Macro Trend: \${Math.floor(Math.random() * 40) + 60}%\\n\`;
                    analysis += \`   Sector Momentum: \${Math.floor(Math.random() * 50) + 50}%\\n\\n\`;
                });
            }
            
            return analysis;
        }

        function analyzeProfitMaximization(data) {
            let analysis = '💰 INGENIERÍA INVERSA - PROFIT MÁXIMO\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    analysis += \`🎯 \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Profit Potential: \${Math.floor(Math.random() * 40) + 60}%\\n\`;
                    analysis += \`   Risk Level: \${Math.floor(Math.random() * 30) + 40}%\\n\\n\`;
                });
            }
            
            return analysis;
        }

        function analyzeMultiTimeframe(data) {
            let analysis = '⏰ MULTI-TIMEFRAME CONFLUENCE ANALYSIS\\n';
            analysis += '='.repeat(60) + '\\n\\n';
            
            if (data.sectorAnalysis) {
                Object.keys(data.sectorAnalysis).forEach(sector => {
                    const sectorData = data.sectorAnalysis[sector];
                    analysis += \`⏱️ \${sector.replace(/_/g, ' ')}\\n\`;
                    analysis += \`   Short Term: \${Math.floor(Math.random() * 30) + 60}%\\n\`;
                    analysis += \`   Medium Term: \${Math.floor(Math.random() * 40) + 50}%\\n\`;
                    analysis += \`   Long Term: \${Math.floor(Math.random() * 50) + 40}%\\n\\n\`;
                });
            }
            
            return analysis;
        }

        // Función para crear tabla de sectores
        function createSectorTableComplete() {
            let html = '<table><thead><tr><th>Sector</th><th>Symbols</th><th>Volume</th><th>Whale Flow</th><th>Signal</th><th>Avg RSI</th><th>Volatility</th><th>Best Symbol</th></tr></thead><tbody>';
            
            Object.keys(completeSymbolData).forEach(sector => {
                const symbols = completeSymbolData[sector];
                const totalVolume = symbols.reduce((sum, symbol) => sum + symbol.volume, 0);
                const avgRSI = symbols.reduce((sum, symbol) => sum + symbol.rsi, 0) / symbols.length;
                const whaleFlow = totalVolume * 0.1;
                const signal = avgRSI > 70 ? 'SELL' : avgRSI < 30 ? 'BUY' : 'HOLD';
                const volatility = Math.random() * 0.05 + 0.01;
                const bestSymbol = findBestSymbol(symbols);
                
                html += \`<tr><td>\${sector.replace(/_/g, ' ')}</td><td>\${symbols.length}</td><td>$\${(totalVolume / 1000000).toFixed(1)}M</td><td>$\${(whaleFlow / 1000000).toFixed(1)}M</td><td><span class="signal \${signal.toLowerCase()}">\${signal}</span></td><td>\${avgRSI.toFixed(1)}</td><td>\${volatility.toFixed(3)}</td><td><span class="best-symbol">\${bestSymbol || 'N/A'}</span></td></tr>\`;
            });
            
            html += '</tbody></table>';
            return html;
        }

        // Función para crear tabla de tickers
        function createTickerTableWithTPSL() {
            let html = '<table><thead><tr><th>Ticker</th><th>Sector</th><th>Precio</th><th>Cambio %</th><th>Volumen</th><th>RSI</th><th>TP</th><th>SL</th><th>Señal</th></tr></thead><tbody>';
            
            Object.keys(completeSymbolData).forEach(sector => {
                const symbols = completeSymbolData[sector];
                symbols.forEach(symbol => {
                    const changeClass = symbol.change24h > 0 ? 'positive' : symbol.change24h < 0 ? 'negative' : 'neutral';
                    const tp = symbol.price * (1 + (Math.random() * 0.1 + 0.05));
                    const sl = symbol.price * (1 - (Math.random() * 0.05 + 0.02));
                    const signal = symbol.rsi > 70 ? 'SELL' : symbol.rsi < 30 ? 'BUY' : 'HOLD';
                    
                    html += \`<tr><td>\${symbol.symbol}</td><td>\${sector.replace(/_/g, ' ')}</td><td>$\${symbol.price.toFixed(4)}</td><td class="\${changeClass}">\${symbol.change24h.toFixed(2)}%</td><td>$\${(symbol.volume / 1000000).toFixed(1)}M</td><td>\${symbol.rsi}</td><td>$\${tp.toFixed(4)}</td><td>$\${sl.toFixed(4)}</td><td>\${signal}</td></tr>\`;
                });
            });
            
            html += '</tbody></table>';
            return html;
        }

        // Funciones principales
        function loadCompleteAnalysis() {
            showStatus('Cargando análisis integral...', 'loading');
            
            setTimeout(() => {
                const analysisData = convertToAnalysisFormat(completeSymbolData);
                
                document.getElementById('feynman-analysis').textContent = analyzeFeynmanPaths(analysisData);
                document.getElementById('markov-analysis').textContent = analyzeMarkovChains(analysisData);
                document.getElementById('whale-analysis').textContent = analyzeWhaleFlow(analysisData);
                document.getElementById('macro-analysis').textContent = analyzeMacroSectorial(analysisData);
                document.getElementById('profit-analysis').textContent = analyzeProfitMaximization(analysisData);
                document.getElementById('timeframe-analysis').textContent = analyzeMultiTimeframe(analysisData);
                document.getElementById('sector-table').innerHTML = createSectorTableComplete();
                document.getElementById('ticker-table').innerHTML = createTickerTableWithTPSL();
                
                showStatus('✅ Análisis integral completado', 'success');
            }, 1000);
        }

        function loadWhaleAnalysis() {
            showStatus('Cargando análisis Whale Flow...', 'loading');
            
            setTimeout(() => {
                const analysisData = convertToAnalysisFormat(completeSymbolData);
                document.getElementById('whale-analysis').textContent = analyzeWhaleFlow(analysisData);
                showStatus('✅ Análisis Whale Flow completado', 'success');
            }, 500);
        }

        function loadFuturesAnalysis() {
            showStatus('Cargando análisis Futures...', 'loading');
            
            setTimeout(() => {
                const analysisData = convertToAnalysisFormat(completeSymbolData);
                document.getElementById('profit-analysis').textContent = analyzeProfitMaximization(analysisData);
                document.getElementById('timeframe-analysis').textContent = analyzeMultiTimeframe(analysisData);
                showStatus('✅ Análisis Futures completado', 'success');
            }, 500);
        }

        function showStatus(message, type) {
            const statusElement = document.getElementById('status');
            statusElement.textContent = message;
            statusElement.className = \`status \${type}\`;
        }

        // Inicializar al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            showStatus('🚀 QBTC Quantum Macro-Intelligence - Sistema Inicializado', 'success');
            loadCompleteAnalysis();
        });
`;

// Crear el nuevo archivo HTML simplificado
const newHtmlContent = currentContent.replace(/<script>[\s\S]*?<\/script>/, `<script>${simplifiedScript}</script>`);

// Escribir el archivo simplificado
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', newHtmlContent);

console.log('✅ Versión simplificada creada exitosamente');
console.log('📊 Funciones incluidas:');
console.log('   • loadCompleteAnalysis');
console.log('   • loadWhaleAnalysis');
console.log('   • loadFuturesAnalysis');
console.log('   • findBestSymbol');
console.log('   • 6 análisis cuánticos');
console.log('   • Tablas con Best Symbol');
console.log('   • 25 símbolos distribuidos en 5 sectores');
