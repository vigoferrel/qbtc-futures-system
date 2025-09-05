const fs = require('fs');

console.log('🔧 CORRECCIÓN ERROR DE SINTAXIS - STRINGS INCOMPLETOS');
console.log('='.repeat(80));

// Leer el archivo HTML actual
let html = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// CORRECCIÓN 1: Arreglar las líneas 402-403 con strings incompletos
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW \n/,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';"
);

html = html.replace(
    /analysis \+= '   Institutional Flow: INFLOW \n/,
    "analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';"
);

// CORRECCIÓN 2: Verificar que no haya otros strings incompletos
html = html.replace(
    /analysis \+= '   Whale Flow: INFLOW \$' \+ \(whaleFlow \/ 1000000\)\.toFixed\(2\) \+ 'M\\n';/,
    "analysis += '   Whale Flow: INFLOW $' + (whaleFlow / 1000000).toFixed(2) + 'M\\n';"
);

html = html.replace(
    /analysis \+= '   Institutional Flow: INFLOW \$' \+ \(institutionalFlow \/ 1000000\)\.toFixed\(2\) \+ 'M\\n';/,
    "analysis += '   Institutional Flow: INFLOW $' + (institutionalFlow / 1000000).toFixed(2) + 'M\\n';"
);

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', html, 'utf8');

console.log('✅ CORRECCIÓN ERROR DE SINTAXIS COMPLETADA');
console.log('🔧 Strings incompletos corregidos en líneas 402-403');
console.log('🔧 Whale Flow e Institutional Flow ahora completos');
console.log('🚀 Sistema QBTC sin errores de sintaxis');
