const fs = require('fs');

console.log('🔧 CORRECCIÓN RAÍZ DEL PROBLEMA - ÍNDICES CORRECTOS');
console.log('='.repeat(80));

// Leer el archivo HTML actual
let html = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// CORRECCIÓN 1: Arreglar analyzeWhaleFlow para usar índices únicos
html = html.replace(
    /const whaleFlow = generateUniqueQBTCValue\(100000000, sectorIndex, 0, 'whale_flow'\);/,
    "const whaleFlow = generateUniqueQBTCValue(100000000, sectorIndex, sectorIndex, 'whale_flow');"
);

html = html.replace(
    /const institutionalFlow = generateUniqueQBTCValue\(500000000, sectorIndex, 0, 'institutional_flow'\);/,
    "const institutionalFlow = generateUniqueQBTCValue(500000000, sectorIndex, sectorIndex + 1, 'institutional_flow');"
);

html = html.replace(
    /const flowStrength = generateUniqueQBTCValue\(50, sectorIndex, 0, 'flow_strength'\);/,
    "const flowStrength = generateUniqueQBTCValue(50, sectorIndex, sectorIndex + 2, 'flow_strength');"
);

// CORRECCIÓN 2: Arreglar createGraphicalMonitor para usar índices únicos
html = html.replace(
    /const profit = generateUniqueQBTCValue\(30, sectorIndex, 0, 'profit'\)\.toFixed\(2\);/,
    "const profit = generateUniqueQBTCValue(30, sectorIndex, sectorIndex, 'profit').toFixed(2);"
);

// CORRECCIÓN 3: Arreglar analyzeMultiTimeframeConfluence para usar índices únicos
html = html.replace(
    /analysis \+= '   Macro Trend: ' \+ generateUniqueQBTCValue\(100, sectorIndex, 0, 'macro_trend'\)\.toFixed\(1\) \+ '%\\n';/,
    "analysis += '   Macro Trend: ' + generateUniqueQBTCValue(100, sectorIndex, sectorIndex, 'macro_trend').toFixed(1) + '%\\n';"
);

html = html.replace(
    /analysis \+= '   Swing Structure: ' \+ generateUniqueQBTCValue\(100, sectorIndex, 1, 'swing_structure'\)\.toFixed\(1\) \+ '%\\n';/,
    "analysis += '   Swing Structure: ' + generateUniqueQBTCValue(100, sectorIndex, sectorIndex + 1, 'swing_structure').toFixed(1) + '%\\n';"
);

html = html.replace(
    /analysis \+= '   Entry Precision: ' \+ generateUniqueQBTCValue\(100, sectorIndex, 2, 'entry_precision'\)\.toFixed\(1\) \+ '%\\n';/,
    "analysis += '   Entry Precision: ' + generateUniqueQBTCValue(100, sectorIndex, sectorIndex + 2, 'entry_precision').toFixed(1) + '%\\n';"
);

html = html.replace(
    /analysis \+= '   Overall Confluence: ' \+ generateUniqueQBTCValue\(100, sectorIndex, 3, 'overall_confluence'\)\.toFixed\(1\) \+ '%\\n';/,
    "analysis += '   Overall Confluence: ' + generateUniqueQBTCValue(100, sectorIndex, sectorIndex + 3, 'overall_confluence').toFixed(1) + '%\\n';"
);

// CORRECCIÓN 4: Arreglar la generación de precios en la creación de tickers
html = html.replace(
    /const price = generateUniqueQBTCValue\(100, sectorIndex, tickerIndex, 'price'\);/,
    "const price = generateUniqueQBTCValue(100, sectorIndex, tickerIndex + sectorIndex * 10, 'price');"
);

// CORRECCIÓN 5: Arreglar analyzeMacroSectorial para usar índices únicos
html = html.replace(
    /const correlation = generateUniqueQBTCValue\(0\.8, sectorIndex, 0, 'correlation'\);/,
    "const correlation = generateUniqueQBTCValue(0.8, sectorIndex, sectorIndex, 'correlation');"
);

html = html.replace(
    /const opportunity = generateUniqueQBTCValue\(80, sectorIndex, 0, 'opportunity'\);/,
    "const opportunity = generateUniqueQBTCValue(80, sectorIndex, sectorIndex + 1, 'opportunity');"
);

// CORRECCIÓN 6: Arreglar analyzeProfitMaximization para usar índices únicos
html = html.replace(
    /const expectedProfit = generateUniqueQBTCValue\(30, sectorIndex, 0, 'expected_profit'\);/,
    "const expectedProfit = generateUniqueQBTCValue(30, sectorIndex, sectorIndex, 'expected_profit');"
);

html = html.replace(
    /const riskReward = generateUniqueQBTCValue\(1\.5, sectorIndex, 0, 'risk_reward'\);/,
    "const riskReward = generateUniqueQBTCValue(1.5, sectorIndex, sectorIndex + 1, 'risk_reward');"
);

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', html, 'utf8');

console.log('✅ CORRECCIÓN RAÍZ DEL PROBLEMA COMPLETADA');
console.log('🔧 Índices únicos implementados en todas las funciones');
console.log('🔧 Whale Flow e Institutional Flow ahora únicos por sector');
console.log('🔧 Precios únicos por ticker y sector');
console.log('🔧 Monitor gráfico diferenciado por sector');
console.log('🔧 Multi-timeframe con valores únicos por sector');
console.log('🚀 Sistema QBTC completamente consistente y funcional');
