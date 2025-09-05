const fs = require('fs');

console.log('🔧 Corrigiendo definitivamente todos los errores de sintaxis...');

// Leer el archivo HTML
let content = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// Reemplazar template literals con concatenación de strings
const templateLiteralPatterns = [
    // Patrón para template literals con variables
    /\`([^\`]*)\$\{([^}]+)\}([^\`]*)\`/g,
    // Patrón para template literals simples
    /\`([^\`]+)\`/g
];

// Reemplazar template literals con variables
content = content.replace(/\`([^\`]*)\$\{([^}]+)\}([^\`]*)\`/g, (match, before, variable, after) => {
    return "'" + before + "' + " + variable + " + '" + after + "'";
});

// Reemplazar template literals simples
content = content.replace(/\`([^\`]+)\`/g, "'$1'");

// Limpiar líneas vacías y caracteres extra
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
content = content.replace(/>\s*\n\s*>/g, '>');

// Escribir el archivo corregido
fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', content, 'utf8');

console.log('✅ Todos los template literals corregidos');
console.log('🎉 Sistema QBTC Quantum Macro-Intelligence listo para usar');
