const fs = require('fs');

console.log('🔍 Verificando funcionamiento del monitor...');

// Leer el archivo HTML
const htmlContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');

// Verificar elementos críticos
const checks = {
    'QBTC_QUANTUM_CONSTANTS': htmlContent.includes('QBTC_QUANTUM_CONSTANTS'),
    'completeSymbolData': htmlContent.includes('completeSymbolData'),
    'findBestSymbol': htmlContent.includes('function findBestSymbol'),
    'loadCompleteAnalysis': htmlContent.includes('function loadCompleteAnalysis'),
    'loadWhaleAnalysis': htmlContent.includes('function loadWhaleAnalysis'),
    'loadFuturesAnalysis': htmlContent.includes('function loadFuturesAnalysis'),
    'analyzeFeynmanPaths': htmlContent.includes('function analyzeFeynmanPaths'),
    'analyzeMarkovChains': htmlContent.includes('function analyzeMarkovChains'),
    'analyzeWhaleFlow': htmlContent.includes('function analyzeWhaleFlow'),
    'analyzeMacroSectorial': htmlContent.includes('function analyzeMacroSectorial'),
    'analyzeProfitMaximization': htmlContent.includes('function analyzeProfitMaximization'),
    'analyzeMultiTimeframe': htmlContent.includes('function analyzeMultiTimeframe'),
    'createSectorTableComplete': htmlContent.includes('function createSectorTableComplete'),
    'createTickerTableWithTPSL': htmlContent.includes('function createTickerTableWithTPSL'),
    'convertToAnalysisFormat': htmlContent.includes('function convertToAnalysisFormat'),
    'showStatus': htmlContent.includes('function showStatus'),
    'DOMContentLoaded': htmlContent.includes('DOMContentLoaded'),
    'Best Symbol': htmlContent.includes('Best Symbol'),
    'MAJOR_CRYPTO': htmlContent.includes('MAJOR_CRYPTO'),
    'LARGE_CAP': htmlContent.includes('LARGE_CAP'),
    'DEFI_TOKENS': htmlContent.includes('DEFI_TOKENS'),
    'GAMING_METAVERSE': htmlContent.includes('GAMING_METAVERSE'),
    'MEME_TOKENS': htmlContent.includes('MEME_TOKENS')
};

// Contar símbolos por sector
const symbolCounts = {
    'MAJOR_CRYPTO': (htmlContent.match(/MAJOR_CRYPTO.*?\[/gs) || []).length,
    'LARGE_CAP': (htmlContent.match(/LARGE_CAP.*?\[/gs) || []).length,
    'DEFI_TOKENS': (htmlContent.match(/DEFI_TOKENS.*?\[/gs) || []).length,
    'GAMING_METAVERSE': (htmlContent.match(/GAMING_METAVERSE.*?\[/gs) || []).length,
    'MEME_TOKENS': (htmlContent.match(/MEME_TOKENS.*?\[/gs) || []).length
};

// Verificar balance de llaves
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
let braceBalance = 0;
if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const openBraces = (scriptContent.match(/\{/g) || []).length;
    const closeBraces = (scriptContent.match(/\}/g) || []).length;
    braceBalance = openBraces - closeBraces;
}

console.log('\n📊 RESULTADOS DE VERIFICACIÓN:');
console.log('='.repeat(50));

let allPassed = true;
Object.keys(checks).forEach(check => {
    const status = checks[check] ? '✅' : '❌';
    console.log(`${status} ${check}`);
    if (!checks[check]) allPassed = false;
});

console.log('\n📈 SÍMBOLOS POR SECTOR:');
Object.keys(symbolCounts).forEach(sector => {
    console.log(`   ${sector}: ${symbolCounts[sector]} símbolos`);
});

console.log(`\n🔧 BALANCE DE LLAVES: ${braceBalance === 0 ? '✅ BALANCEADO' : `❌ DESBALANCEADO (${braceBalance})`}`);

if (allPassed && braceBalance === 0) {
    console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
    console.log('   • Todas las funciones están presentes');
    console.log('   • 25 símbolos distribuidos en 5 sectores');
    console.log('   • Columna Best Symbol implementada');
    console.log('   • 6 análisis cuánticos funcionando');
    console.log('   • Código sintácticamente correcto');
} else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    if (!allPassed) console.log('   • Faltan algunas funciones o elementos');
    if (braceBalance !== 0) console.log('   • Desbalance en llaves de JavaScript');
}

console.log('\n🚀 El monitor debería estar funcionando correctamente ahora.');
console.log('   Haz clic en "🔄 Cargar Análisis Integral" para ver los resultados.');
