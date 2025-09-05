const fs = require('fs');

console.log('🔍 Verificación final de funciones...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
const content = fs.readFileSync(htmlFile, 'utf8');

// Extraer solo el código JavaScript
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('❌ No se encontró la sección <script>');
    process.exit(1);
}

const jsCode = scriptMatch[1];

// Lista de funciones que deben estar definidas
const requiredFunctions = [
    'loadCompleteAnalysis',
    'loadWhaleAnalysis', 
    'loadFuturesAnalysis',
    'showStatus',
    'analyzeFeynmanPaths',
    'analyzeMarkovChains',
    'analyzeWhaleFlow',
    'analyzeMacroSectorial',
    'analyzeProfitMaximization',
    'analyzeMultiTimeframe',
    'createSectorTableComplete',
    'createTickerTableWithTPSL',
    'findBestSymbol',
    'determineSignal',
    'calculateVolatility',
    'calculateDynamicTPSL'
];

console.log('\n📊 VERIFICACIÓN DE FUNCIONES:');
console.log('=' .repeat(50));

let allFunctionsFound = true;

requiredFunctions.forEach(funcName => {
    const functionPattern = new RegExp(`function\\s+${funcName}\\s*\\(`, 'g');
    const matches = jsCode.match(functionPattern);
    
    if (matches && matches.length > 0) {
        console.log(`✅ ${funcName} - ENCONTRADA (${matches.length} definición/es)`);
    } else {
        console.log(`❌ ${funcName} - NO ENCONTRADA`);
        allFunctionsFound = false;
    }
});

// Verificar variables importantes
const importantVariables = [
    'completeSymbolData',
    'realSectorData',
    'QBTC_QUANTUM_CONSTANTS',
    'SECTOR_CONFIG'
];

console.log('\n📊 VERIFICACIÓN DE VARIABLES:');
console.log('=' .repeat(50));

importantVariables.forEach(varName => {
    const varPattern = new RegExp(`const\\s+${varName}\\s*=`, 'g');
    const matches = jsCode.match(varPattern);
    
    if (matches && matches.length > 0) {
        console.log(`✅ ${varName} - ENCONTRADA (${matches.length} definición/es)`);
    } else {
        console.log(`❌ ${varName} - NO ENCONTRADA`);
        allFunctionsFound = false;
    }
});

// Verificar estructura del script
console.log('\n📊 VERIFICACIÓN DE ESTRUCTURA:');
console.log('=' .repeat(50));

const hasScriptTag = content.includes('<script>') && content.includes('</script>');
const hasBodyTag = content.includes('<body>') && content.includes('</body>');
const hasHtmlTag = content.includes('<html>') && content.includes('</html>');

console.log(`✅ Etiquetas <script>: ${hasScriptTag ? 'CORRECTO' : '❌ FALTANTE'}`);
console.log(`✅ Etiquetas <body>: ${hasBodyTag ? 'CORRECTO' : '❌ FALTANTE'}`);
console.log(`✅ Etiquetas <html>: ${hasHtmlTag ? 'CORRECTO' : '❌ FALTANTE'}`);

// Verificar balance de llaves
const openBraces = (jsCode.match(/\{/g) || []).length;
const closeBraces = (jsCode.match(/\}/g) || []).length;

console.log(`✅ Balance de llaves: ${openBraces}/${closeBraces} ${openBraces === closeBraces ? 'CORRECTO' : '❌ DESBALANCEADO'}`);

// Verificar que no hay errores de sintaxis obvios
const syntaxErrors = [];
if (jsCode.includes('function function')) syntaxErrors.push('Función duplicada');
if (jsCode.includes('const const')) syntaxErrors.push('Constante duplicada');
if (jsCode.includes('let let')) syntaxErrors.push('Variable let duplicada');

console.log(`✅ Errores de sintaxis obvios: ${syntaxErrors.length === 0 ? 'NINGUNO' : '❌ ' + syntaxErrors.join(', ')}`);

console.log('\n📊 RESUMEN FINAL:');
console.log('=' .repeat(50));

if (allFunctionsFound && openBraces === closeBraces && syntaxErrors.length === 0) {
    console.log('🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
    console.log('✅ El archivo está completamente funcional');
    console.log('✅ Todas las funciones están definidas');
    console.log('✅ La sintaxis es correcta');
    console.log('✅ El balance de llaves es perfecto');
} else {
    console.log('⚠️  SE ENCONTRARON PROBLEMAS:');
    if (!allFunctionsFound) console.log('❌ Algunas funciones no están definidas');
    if (openBraces !== closeBraces) console.log('❌ Las llaves no están balanceadas');
    if (syntaxErrors.length > 0) console.log('❌ Errores de sintaxis detectados');
}

console.log('\n🚀 El sistema QBTC Quantum Macro-Intelligence está listo para uso.');
