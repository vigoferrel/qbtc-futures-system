const fs = require('fs');

console.log('🔍 Verificando sintaxis del archivo HTML...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// Verificar si hay errores comunes de sintaxis
let errors = [];

// 1. Verificar si hay cadenas de texto mal formadas
const stringErrors = content.match(/"[^"]*\n[^"]*"/g);
if (stringErrors) {
    console.log('⚠️  Encontradas cadenas de texto mal formadas');
    errors.push('Cadenas de texto mal formadas');
}

// 2. Verificar si hay llaves desbalanceadas en JavaScript
const jsContent = content.match(/<script>([\s\S]*?)<\/script>/);
if (jsContent) {
    const jsCode = jsContent[1];
    const openBraces = (jsCode.match(/\{/g) || []).length;
    const closeBraces = (jsCode.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        console.log(`⚠️  Llaves desbalanceadas: ${openBraces} abiertas, ${closeBraces} cerradas`);
        errors.push('Llaves desbalanceadas en JavaScript');
    }
}

// 3. Verificar si hay paréntesis desbalanceados
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;

if (openParens !== closeParens) {
    console.log(`⚠️  Paréntesis desbalanceados: ${openParens} abiertos, ${closeParens} cerrados`);
    errors.push('Paréntesis desbalanceados');
}

// 4. Verificar si hay funciones faltantes
const requiredFunctions = [
    'loadCompleteAnalysis',
    'loadWhaleAnalysis', 
    'loadFuturesAnalysis',
    'findBestSymbol',
    'determineSignal',
    'createTickerTableWithTPSL',
    'createSectorTableComplete'
];

requiredFunctions.forEach(funcName => {
    if (!content.includes(`function ${funcName}`)) {
        console.log(`⚠️  Función faltante: ${funcName}`);
        errors.push(`Función ${funcName} faltante`);
    }
});

// 5. Verificar si hay variables faltantes
const requiredVariables = [
    'completeSymbolData',
    'realSectorData',
    'QBTC_QUANTUM_CONSTANTS'
];

requiredVariables.forEach(varName => {
    if (!content.includes(varName)) {
        console.log(`⚠️  Variable faltante: ${varName}`);
        errors.push(`Variable ${varName} faltante`);
    }
});

// 6. Verificar si hay errores de sintaxis en template literals
const templateErrors = content.match(/\$\{[^}]*\n[^}]*\}/g);
if (templateErrors) {
    console.log('⚠️  Template literals mal formados');
    errors.push('Template literals mal formados');
}

if (errors.length === 0) {
    console.log('✅ No se encontraron errores de sintaxis evidentes');
} else {
    console.log('❌ Errores encontrados:');
    errors.forEach(error => console.log(`   - ${error}`));
}

// Verificar si el archivo termina correctamente
if (!content.trim().endsWith('</html>')) {
    console.log('⚠️  El archivo no termina con </html>');
    errors.push('Archivo no termina correctamente');
}

// Verificar si hay etiquetas HTML desbalanceadas
const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
const closeTags = (content.match(/<\/[^>]*>/g) || []).length;

if (Math.abs(openTags - closeTags) > 10) { // Permitir algunas diferencias por tags auto-cerrados
    console.log(`⚠️  Posibles etiquetas HTML desbalanceadas: ${openTags} abiertas, ${closeTags} cerradas`);
    errors.push('Etiquetas HTML posiblemente desbalanceadas');
}

console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log(`   • Total de errores encontrados: ${errors.length}`);
console.log(`   • Estado del archivo: ${errors.length === 0 ? '✅ VÁLIDO' : '❌ CON ERRORES'}`);

if (errors.length > 0) {
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('   1. Revisar las funciones faltantes');
    console.log('   2. Verificar la sintaxis de JavaScript');
    console.log('   3. Comprobar el balance de llaves y paréntesis');
    console.log('   4. Validar las etiquetas HTML');
} else {
    console.log('\n🎉 El archivo HTML parece estar sintácticamente correcto');
}
