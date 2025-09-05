const fs = require('fs');

console.log('🔧 Corrigiendo error de sintaxis - llave extra...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// Buscar y eliminar la llave extra
const pattern = /        }\s*}/;
const replacement = '        }';

if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    console.log('✅ Llave extra eliminada');
} else {
    console.log('⚠️  No se encontró la llave extra');
}

// Escribir el archivo corregido
fs.writeFileSync(htmlFile, content);

console.log('✅ Sintaxis corregida');

