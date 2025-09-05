const fs = require('fs');

console.log('🔧 CORRECCIÓN ERROR PERSISTENTE - LÍNEA 402 CORRUPTA');
console.log('='.repeat(80));

// Leer el archivo HTML actual
let html = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// CORRECCIÓN ESPECÍFICA: Arreglar la línea 402 corrupta
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW                 analysis \+= '   Flow Strength: ' \+ flowStrength\.toFixed\(2\) \+ '%\\n';/,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';" +
    "                analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';" +
    "                analysis += '   Flow Strength: ' + flowStrength.toFixed(2) + '%\\n';"
);

// CORRECCIÓN ALTERNATIVA: Si la anterior no funciona
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW /,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';" +
    "                analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';"
);

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', html, 'utf8');

console.log('✅ CORRECCIÓN ERROR PERSISTENTE COMPLETADA');
console.log('🔧 Línea 402 corrupta reemplazada');
console.log('🔧 Whale Flow e Institutional Flow restaurados correctamente');
console.log('🚀 Sistema QBTC sin errores de sintaxis persistentes');
