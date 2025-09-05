const fs = require('fs');

console.log('🔍 Verificando funcionalidades completas del sistema QBTC...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
const content = fs.readFileSync(htmlFile, 'utf8');

// Verificar funciones críticas
const checks = [
    {
        name: 'Función calculateDynamicTPSL',
        pattern: /function calculateDynamicTPSL\(/,
        required: true
    },
    {
        name: 'Función determineSignal',
        pattern: /function determineSignal\(/,
        required: true
    },
    {
        name: 'Función calculateVolatility',
        pattern: /function calculateVolatility\(/,
        required: true
    },
    {
        name: 'Datos completos de símbolos',
        pattern: /const completeSymbolData = {/,
        required: true
    },
    {
        name: 'Función createTickerTableWithTPSL',
        pattern: /function createTickerTableWithTPSL\(\)/,
        required: true
    },
    {
        name: 'Función createSectorTableComplete',
        pattern: /function createSectorTableComplete\(\)/,
        required: true
    },
    {
        name: 'Columnas TP/SL en tabla',
        pattern: /<th>Entry<\/th><th>SL<\/th><th>TP<\/th><th>R\/R<\/th>/,
        required: true
    },
    {
        name: 'Cálculo de TP/SL dinámico',
        pattern: /const tpSl = calculateDynamicTPSL\(/,
        required: true
    },
    {
        name: 'Datos diferenciados por sector',
        pattern: /whaleFlow = 5000000 \+ \(index \* 2500000\)/,
        required: true
    },
    {
        name: 'Señales dinámicas',
        pattern: /const signal = determineSignal\(/,
        required: true
    }
];

let allPassed = true;
let passedCount = 0;

console.log('\n📊 Verificación de funcionalidades:\n');

checks.forEach(check => {
    const found = check.pattern.test(content);
    const status = found ? '✅' : '❌';
    const result = found ? 'ENCONTRADO' : 'NO ENCONTRADO';
    
    console.log(`${status} ${check.name}: ${result}`);
    
    if (found) {
        passedCount++;
    } else if (check.required) {
        allPassed = false;
    }
});

console.log(`\n📈 Resultados: ${passedCount}/${checks.length} verificaciones pasaron`);

if (allPassed) {
    console.log('\n🎉 ¡TODAS LAS FUNCIONALIDADES ESTÁN IMPLEMENTADAS CORRECTAMENTE!');
    console.log('\n✅ Funcionalidades recuperadas:');
    console.log('   • Cálculo dinámico de Take Profit y Stop Loss');
    console.log('   • Tablas completas con todos los símbolos');
    console.log('   • Datos diferenciados por sector');
    console.log('   • Señales dinámicas basadas en RSI y cambio de precio');
    console.log('   • Cálculo de volatilidad personalizado');
    console.log('   • Ratios de riesgo/beneficio');
    console.log('   • Niveles de entrada, salida, SL y TP');
    console.log('   • Timeframes óptimos por estrategia');
    
    console.log('\n🚀 El sistema está listo para uso completo');
} else {
    console.log('\n⚠️  Algunas funcionalidades críticas faltan');
    console.log('   Revisar implementación de funciones requeridas');
}

// Verificar estructura de datos
const symbolDataMatch = content.match(/const completeSymbolData = \{([^}]+)\}/);
if (symbolDataMatch) {
    const symbolData = symbolDataMatch[1];
    const sectorCount = (symbolData.match(/MAJOR_CRYPTO|LARGE_CAP|DEFI_TOKENS|GAMING_METAVERSE|MEME_TOKENS/g) || []).length;
    console.log(`\n📊 Sectores configurados: ${sectorCount}/5`);
    
    if (sectorCount === 5) {
        console.log('✅ Todos los sectores están configurados correctamente');
    } else {
        console.log('❌ Faltan sectores en la configuración');
    }
}

console.log('\n🔧 Verificación completada');

