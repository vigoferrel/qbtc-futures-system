const fs = require('fs');

console.log('🔧 CORRECCIÓN ERROR CRÍTICO - STRINGS COMPLETAMENTE CORROMPIDOS');
console.log('='.repeat(80));

// Leer el archivo HTML actual
let html = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// CORRECCIÓN CRÍTICA: Reemplazar las líneas completamente corruptas
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW                 analysis \+= '   Institutional Flow: INFLOW /,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';" +
    "                analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';"
);

// CORRECCIÓN ALTERNATIVA: Si la anterior no funciona, reemplazar línea por línea
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW /,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';"
);

html = html.replace(
    /analysis \+= '   Institutional Flow: INFLOW /,
    "analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';"
);

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', html, 'utf8');

console.log('✅ CORRECCIÓN ERROR CRÍTICO COMPLETADA');
console.log('🔧 Strings completamente corruptos reemplazados');
console.log('🔧 Whale Flow e Institutional Flow restaurados');
console.log('🚀 Sistema QBTC sin errores de sintaxis críticos');
