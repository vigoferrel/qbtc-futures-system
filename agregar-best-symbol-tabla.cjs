const fs = require('fs');

console.log('🔧 Agregando columna Best Symbol a la tabla de sectores...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// Actualizar el header de la tabla de sectores
const newSectorHeader = `
                    <tr>
                        <th>Sector</th>
                        <th>Symbols</th>
                        <th>Volume</th>
                        <th>Whale Flow</th>
                        <th>Signal</th>
                        <th>Avg RSI</th>
                        <th>Volatility</th>
                        <th>Best Symbol</th>
                    </tr>
`;

// Actualizar la función que genera las filas de sectores
const updatedSectorFunction = `
        function updateSectorTable() {
            const sectorTable = document.getElementById('sectorTable');
            const tbody = sectorTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            Object.keys(completeSymbolData).forEach(sector => {
                const symbols = completeSymbolData[sector];
                const totalVolume = symbols.reduce((sum, s) => sum + s.volume, 0);
                const avgRSI = symbols.reduce((sum, s) => sum + s.rsi, 0) / symbols.length;
                const avgVolatility = symbols.reduce((sum, s) => sum + Math.abs(s.change24h), 0) / symbols.length;
                const whaleFlow = totalVolume * 0.001; // 0.1% del volumen total
                
                // Determinar señal basada en RSI promedio
                let signal = 'HOLD';
                if (avgRSI < 30) signal = 'BUY';
                else if (avgRSI > 70) signal = 'SELL';
                
                // Encontrar el mejor símbolo del sector
                const bestSymbol = findBestSymbol(symbols);
                
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${sector.replace('_', ' ')}</td>
                    <td>\${symbols.length}</td>
                    <td>\$\${(totalVolume / 1000000).toFixed(1)}M</td>
                    <td>\$\${(whaleFlow / 1000000).toFixed(1)}M</td>
                    <td><span class="signal \${signal.toLowerCase()}">\${signal}</span></td>
                    <td>\${avgRSI.toFixed(1)}</td>
                    <td>\${avgVolatility.toFixed(3)}</td>
                    <td><span class="best-symbol">\${bestSymbol || 'N/A'}</span></td>
                \`;
                tbody.appendChild(row);
            });
        }
`;

// Reemplazar el header de la tabla
content = content.replace(
    /<tr>\s*<th>Sector<\/th>\s*<th>Symbols<\/th>\s*<th>Volume<\/th>\s*<th>Whale Flow<\/th>\s*<th>Signal<\/th>\s*<th>Avg RSI<\/th>\s*<th>Volatility<\/th>\s*<\/tr>/,
    newSectorHeader.trim()
);

// Reemplazar la función updateSectorTable
content = content.replace(
    /function updateSectorTable\(\) \{[\s\S]*?\}/,
    updatedSectorFunction.trim()
);

// Agregar estilos CSS para la columna Best Symbol
const bestSymbolCSS = `
        .best-symbol {
            font-weight: bold;
            color: #00ff88;
            background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }
`;

// Agregar los estilos CSS
content = content.replace(
    /<\/style>/,
    `${bestSymbolCSS}\n    </style>`
);

// Escribir el archivo actualizado
fs.writeFileSync(htmlFile, content);

console.log('✅ Columna Best Symbol agregada a la tabla de sectores');
console.log('✅ Función updateSectorTable actualizada');
console.log('✅ Estilos CSS agregados para Best Symbol');
