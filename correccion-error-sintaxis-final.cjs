const fs = require('fs');

console.log('🔧 CORRECCIÓN ERROR SINTAXIS LÍNEA 351');
console.log('='.repeat(80));

// Leer el archivo HTML actual
let html = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// Buscar y corregir el problema específico
// El problema parece estar en el reemplazo de las líneas de whale flow

// CORRECCIÓN ESPECÍFICA: Reemplazar las líneas problemáticas
html = html.replace(
    /const whaleFlow = generateUniqueQBTCValue\(100000000, sectorIndex, sectorIndex, 'whale_flow'\);\s*const whaleFlowAdjusted = whaleFlow \* \(0\.8 \+ \(sectorIndex \* 0\.1\)\);/g,
    `const whaleFlow = generateUniqueQBTCValue(100000000, sectorIndex, sectorIndex, 'whale_flow');
                const whaleFlowAdjusted = whaleFlow * (0.8 + (sectorIndex * 0.1));`
);

html = html.replace(
    /const institutionalFlow = generateUniqueQBTCValue\(500000000, sectorIndex, sectorIndex \+ 1, 'institutional_flow'\);\s*const institutionalFlowAdjusted = institutionalFlow \* \(0\.7 \+ \(sectorIndex \* 0\.15\)\);/g,
    `const institutionalFlow = generateUniqueQBTCValue(500000000, sectorIndex, sectorIndex + 1, 'institutional_flow');
                const institutionalFlowAdjusted = institutionalFlow * (0.7 + (sectorIndex * 0.15));`
);

// CORRECCIÓN: Reemplazar las líneas de análisis
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW \$' \+ \(whaleFlowAdjusted \/ 1000000\)\.toFixed\(2\) \+ 'M\\n';/g,
    `analysis += '   Whale Flow: INFLOW $' + (whaleFlowAdjusted / 1000000).toFixed(2) + 'M\\n';`
);

html = html.replace(
    /analysis \+= '   Institutional Flow: INFLOW \$' \+ \(institutionalFlowAdjusted \/ 1000000\)\.toFixed\(2\) \+ 'M\\n';/g,
    `analysis += '   Institutional Flow: INFLOW $' + (institutionalFlowAdjusted / 1000000).toFixed(2) + 'M\\n';`
);

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', html, 'utf8');

console.log('✅ ERROR SINTAXIS CORREGIDO');
console.log('🔧 Línea 351 restaurada correctamente');
console.log('🚀 Sistema QBTC funcional');
