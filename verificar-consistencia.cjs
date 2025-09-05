#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE CONSISTENCIA - QBTC DASHBOARD
 * ===============================================
 *
 * Verifica que todos los datos del dashboard sean consistentes
 * y no haya duplicaciones ni incoherencias
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONSISTENCIA DEL DASHBOARD QBTC...\n');

// Leer el archivo HTML del dashboard
const dashboardPath = path.join(__dirname, 'qbtc-dashboard', 'index.html');

if (!fs.existsSync(dashboardPath)) {
    console.error('❌ ERROR: Dashboard no encontrado en:', dashboardPath);
    process.exit(1);
}

const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

console.log('✅ Dashboard encontrado');
console.log('🔍 Analizando contenido...\n');

// Verificar que no haya datos duplicados
const realSectorDataMatches = dashboardContent.match(/realSectorData\s*=\s*\{/g);
const completeSymbolDataMatches = dashboardContent.match(/completeSymbolData\s*=\s*\{/g);

console.log('📊 ANÁLISIS DE ESTRUCTURAS DE DATOS:');
console.log(`   realSectorData declarations: ${realSectorDataMatches ? realSectorDataMatches.length : 0}`);
console.log(`   completeSymbolData declarations: ${completeSymbolDataMatches ? completeSymbolDataMatches.length : 0}`);

// Verificar funciones críticas
const criticalFunctions = [
    'findBestSymbol',
    'calculateDynamicTPSL',
    'createSectorTableComplete',
    'createTickerTableWithTPSL',
    'validateDataConsistency'
];

console.log('\n🔧 VERIFICACIÓN DE FUNCIONES CRÍTICAS:');
criticalFunctions.forEach(func => {
    const regex = new RegExp(`function ${func}\\s*\\(`, 'g');
    const matches = dashboardContent.match(regex);
    const count = matches ? matches.length : 0;

    if (count === 1) {
        console.log(`   ✅ ${func}: PRESENTE (${count} declaración)`);
    } else if (count === 0) {
        console.log(`   ❌ ${func}: FALTANTE`);
    } else {
        console.log(`   ⚠️  ${func}: DUPLICADO (${count} declaraciones)`);
    }
});

// Verificar constantes cuánticas
const quantumConstants = [
    'LAMBDA_7919',
    'PHI_GOLDEN',
    'RESONANCE_FREQ',
    'QUANTUM_FIBONACCI',
    'PRIME_SEQUENCE'
];

console.log('\n🔬 VERIFICACIÓN DE CONSTANTES CUÁNTICAS:');
quantumConstants.forEach(constant => {
    const regex = new RegExp(`${constant}:`, 'g');
    const matches = dashboardContent.match(regex);
    const count = matches ? matches.length : 0;

    if (count >= 1) {
        console.log(`   ✅ ${constant}: PRESENTE (${count} referencias)`);
    } else {
        console.log(`   ❌ ${constant}: FALTANTE`);
    }
});

// Verificar sectores
const sectors = [
    'MAJOR_CRYPTO',
    'LARGE_CAP',
    'DEFI_TOKENS',
    'GAMING_METAVERSE',
    'MEME_TOKENS'
];

console.log('\n🏭 VERIFICACIÓN DE SECTORES:');
sectors.forEach(sector => {
    const regex = new RegExp(`${sector}:`, 'g');
    const matches = dashboardContent.match(regex);
    const count = matches ? matches.length : 0;

    if (count >= 2) { // Debería aparecer en realSectorData y completeSymbolData
        console.log(`   ✅ ${sector}: CONSISTENTE (${count} referencias)`);
    } else if (count === 1) {
        console.log(`   ⚠️  ${sector}: POSIBLE INCONSISTENCIA (${count} referencia)`);
    } else {
        console.log(`   ❌ ${sector}: FALTANTE`);
    }
});

// Verificar que las funciones usen datos consistentes
console.log('\n🔗 VERIFICACIÓN DE USO DE DATOS CONSISTENTES:');

const dataUsagePatterns = [
    { pattern: /realSectorData\.sectorAnalysis/g, description: 'Uso de realSectorData.sectorAnalysis' },
    { pattern: /completeSymbolData\[/g, description: 'Uso de completeSymbolData (debería ser realSectorData)' }
];

dataUsagePatterns.forEach(({ pattern, description }) => {
    const matches = dashboardContent.match(pattern);
    const count = matches ? matches.length : 0;
    console.log(`   📊 ${description}: ${count} usos`);
});

// Verificar validación de datos
const validationPatterns = [
    /validateDataConsistency/g,
    /console\.log.*CONSISTENT/g,
    /console\.error.*INCONSISTENT/g
];

console.log('\n✅ VERIFICACIÓN DE VALIDACIÓN DE DATOS:');
validationPatterns.forEach(pattern => {
    const matches = dashboardContent.match(pattern);
    const count = matches ? matches.length : 0;
    const found = count > 0 ? 'SÍ' : 'NO';
    console.log(`   🔍 ${pattern.source.replace('/g', '')}: ${found} (${count})`);
});

// Resumen final
console.log('\n' + '='.repeat(60));
console.log('📋 RESUMEN DE CONSISTENCIA');
console.log('='.repeat(60));

const totalFunctions = criticalFunctions.length;
const presentFunctions = criticalFunctions.filter(func => {
    const regex = new RegExp(`function ${func}\\s*\\(`, 'g');
    const matches = dashboardContent.match(regex);
    return matches && matches.length === 1;
}).length;

const totalConstants = quantumConstants.length;
const presentConstants = quantumConstants.filter(constant => {
    const regex = new RegExp(`${constant}:`, 'g');
    const matches = dashboardContent.match(regex);
    return matches && matches.length >= 1;
}).length;

const totalSectors = sectors.length;
const consistentSectors = sectors.filter(sector => {
    const regex = new RegExp(`${sector}:`, 'g');
    const matches = dashboardContent.match(regex);
    return matches && matches.length >= 2;
}).length;

console.log(`🔧 Funciones críticas: ${presentFunctions}/${totalFunctions} ✅`);
console.log(`🔬 Constantes cuánticas: ${presentConstants}/${totalConstants} ✅`);
console.log(`🏭 Sectores consistentes: ${consistentSectors}/${totalSectors} ✅`);

const hasValidation = dashboardContent.includes('validateDataConsistency');
console.log(`🔍 Validación de datos: ${hasValidation ? 'SÍ' : 'NO'} ${hasValidation ? '✅' : '❌'}`);

console.log('\n' + '='.repeat(60));

if (presentFunctions === totalFunctions &&
    presentConstants === totalConstants &&
    consistentSectors === totalSectors &&
    hasValidation) {
    console.log('🎉 ¡CONSISTENCIA PERFECTA! El dashboard está completamente consistente.');
    console.log('🌐 El servidor puede iniciarse sin problemas.');
    process.exit(0);
} else {
    console.log('⚠️  INCONSISTENCIAS DETECTADAS - Revisar los elementos marcados con ❌ o ⚠️');
    process.exit(1);
}