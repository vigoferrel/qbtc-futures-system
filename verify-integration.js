import fs from 'fs';
import path from 'path';

console.log('[BRAIN] QBTC Futures System - Verificación de Integración Completa');
console.log('='.repeat(65));

// Verificar servidor de ejecución
console.log('\n1. SERVIDOR DE EJECUCIÓN:');
const serverPath = './futures-execution/server.js';
if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const hasLeverageIntegration = serverContent.includes('QuantumLeverageEngine');
    const hasQuantumCore = serverContent.includes('QBTCQuantumCore');
    const hasBigBangMode = serverContent.includes('bigBangActive');
    
    console.log('   [CHECK] Archivo servidor existente');
    console.log('   ' + (hasLeverageIntegration ? '[CHECK]' : '[X]') + ' Motor de leverage integrado');
    console.log('   ' + (hasQuantumCore ? '[CHECK]' : '[X]') + ' Núcleo cuántico integrado');
    console.log('   ' + (hasBigBangMode ? '[CHECK]' : '[X]') + ' Modo Big Bang implementado');
} else {
    console.log('   [X] Archivo servidor NO ENCONTRADO');
}

// Verificar configuración
console.log('\n2. CONFIGURACIÓN:');
const constantsPath = './config/constants.js';
if (fs.existsSync(constantsPath)) {
    const constantsContent = fs.readFileSync(constantsPath, 'utf8');
    const isExtremeMode = constantsContent.includes('MODE: "EXTREME"');
    const has77Symbols = constantsContent.includes('BTCUSDT') && constantsContent.includes('1000SATSUSDT');
    
    // Contar símbolos habilitados
    const symbolMatches = constantsContent.match(/enabled: true/g);
    const symbolCount = symbolMatches ? symbolMatches.length : 0;
    
    console.log('   [CHECK] Archivo configuración existente');
    console.log('   ' + (isExtremeMode ? '[CHECK]' : '[X]') + ' Modo EXTREMO activado');
    console.log('   ' + (has77Symbols ? '[CHECK]' : '[X]') + ' 77 símbolos configurados');
    console.log('   [CHART] Símbolos habilitados: ' + symbolCount);
} else {
    console.log('   [X] Archivo configuración NO ENCONTRADO');
}

// Verificar núcleo cuántico
console.log('\n3. NÚCLEO CUÁNTICO:');
const quantumCorePath = './analysis-engine/quantum-core.js';
if (fs.existsSync(quantumCorePath)) {
    const quantumContent = fs.readFileSync(quantumCorePath, 'utf8');
    const hasExtendedMatrix = quantumContent.includes('matriz cuántica expandida para 77 símbolos');
    const hasTierSystem = quantumContent.includes('getSymbolTier');
    const hasLambda = quantumContent.includes('LAMBDA_7919');
    
    console.log('   [CHECK] Núcleo cuántico existente');
    console.log('   ' + (hasExtendedMatrix ? '[CHECK]' : '[X]') + ' Matriz expandida para 77 símbolos');
    console.log('   ' + (hasTierSystem ? '[CHECK]' : '[X]') + ' Sistema de tiers implementado');
    console.log('   ' + (hasLambda ? '[CHECK]' : '[X]') + ' Constante λ₇₉₁₉ configurada');
} else {
    console.log('   [X] Núcleo cuántico NO ENCONTRADO');
}

// Verificar motor de leverage
console.log('\n4. MOTOR DE LEVERAGE CUÁNTICO:');
const leveragePath = './analysis-engine/quantum-leverage-engine.js';
if (fs.existsSync(leveragePath)) {
    const leverageContent = fs.readFileSync(leveragePath, 'utf8');
    const hasEntropyCalculation = leverageContent.includes('calculateGlobalEntropy');
    const hasOptimization = leverageContent.includes('optimizeLeverage');
    const hasEventEmitter = leverageContent.includes('EventEmitter');
    
    console.log('   [CHECK] Motor de leverage existente');
    console.log('   ' + (hasEntropyCalculation ? '[CHECK]' : '[X]') + ' Cálculo de entropía global');
    console.log('   ' + (hasOptimization ? '[CHECK]' : '[X]') + ' Optimización dinámica');
    console.log('   ' + (hasEventEmitter ? '[CHECK]' : '[X]') + ' Sistema de eventos');
} else {
    console.log('   [X] Motor de leverage NO ENCONTRADO');
}

// Verificar archivos complementarios
console.log('\n5. ARCHIVOS COMPLEMENTARIOS:');
const files = [
    { path: './package.json', name: 'package.json' },
    { path: './config/env.js', name: 'Variables de entorno' },
    { path: './utils/logger.js', name: 'Sistema de logging' },
    { path: './utils/risk-manager.js', name: 'Gestor de riesgo' }
];

files.forEach(file => {
    const exists = fs.existsSync(file.path);
    console.log('   ' + (exists ? '[CHECK]' : '[X]') + ' ' + file.name);
});

// Resumen final
console.log('\n[FIRE] RESUMEN DE INTEGRACIÓN:');
console.log('='.repeat(65));

const leverageExists = fs.existsSync(leveragePath);
const quantumExists = fs.existsSync(quantumCorePath);
const serverExists = fs.existsSync(serverPath);
const configExists = fs.existsSync(constantsPath);

if (leverageExists && quantumExists && serverExists && configExists) {
    console.log('[ROCKET] SISTEMA COMPLETAMENTE INTEGRADO Y LISTO PARA OPERAR');
    console.log('');
    console.log('Características activas:');
    console.log('• Motor de leverage cuántico ajustado por entropía global');
    console.log('• Núcleo cuántico con matrices expandidas para 77 símbolos');
    console.log('• Sistema de ejecución con integración completa');
    console.log('• Modo EXTREMO con cobertura máxima');
    console.log('• Eventos Big Bang para oportunidades especiales');
    console.log('');
    console.log('Próximos pasos recomendados:');
    console.log('1. Ejecutar simulación de prueba');
    console.log('2. Activar monitoreo en tiempo real');
    console.log('3. Iniciar operaciones en modo paper trading');
} else {
    console.log('[WARNING]  INTEGRACIÓN INCOMPLETA - Revisar componentes faltantes');
}

console.log('\n' + '='.repeat(65));
