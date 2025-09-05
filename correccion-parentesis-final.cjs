const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECCIÓN FINAL DE PARÉNTESIS - QBTC QUANTUM MACRO-INTELLIGENCE');
console.log('================================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
const backupFile = 'monitor-quantum-intelligence-llm-debug-backup.html';

try {
    // Leer el archivo HTML
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    // Contar líneas originales
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // CORRECCIÓN 1: Línea 1132 - Template literal malformado
    console.log('\n🔧 Corrigiendo línea 1132 - Template literal...');
    htmlContent = htmlContent.replace(
        /return `Path: \$\{\(pathProb \* 100\)\.toFixed\(1\)\}%\nState: \$\{quantumState\}\nEnt: \$\{entanglement\.toFixed\(1\)\}`;/g,
        'return `Path: ${(pathProb * 100).toFixed(1)}%\nState: ${quantumState}\nEnt: ${entanglement.toFixed(1)}`;'
    );
    
    // CORRECCIÓN 2: Línea 1353 - Template literal malformado
    console.log('🔧 Corrigiendo línea 1353 - Template literal...');
    htmlContent = htmlContent.replace(
        /return `Action: \$\{bestSymbol\.action\}\nLeverage: \$\{leverage\}x\nOptimal TF: \$\{optimalTimeframe\}\nEntry: \$\$\$\{entryPrice\.toFixed\(4\)\}\nExit: \$\$\$\{exitPrice\.toFixed\(4\)\}\nSL: \$\$\$\{stopLoss\.toFixed\(4\)\}\nTP: \$\$\$\{takeProfit\.toFixed\(4\)\}`;/g,
        'return `Action: ${bestSymbol.action}\nLeverage: ${leverage}x\nOptimal TF: ${optimalTimeframe}\nEntry: $${entryPrice.toFixed(4)}\nExit: $${exitPrice.toFixed(4)}\nSL: $${stopLoss.toFixed(4)}\nTP: $${takeProfit.toFixed(4)}`;'
    );
    
    // CORRECCIÓN 3: Líneas 1367-1369 - Funciones de formato de volumen
    console.log('🔧 Corrigiendo líneas 1367-1369 - Funciones de volumen...');
    htmlContent = htmlContent.replace(
        /if \(volume >= 1e9\) return `\$\{\(volume \/ 1e9\)\.toFixed\(1\)\}B`;/g,
        'if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;'
    );
    htmlContent = htmlContent.replace(
        /if \(volume >= 1e6\) return `\$\{\(volume \/ 1e6\)\.toFixed\(1\)\}M`;/g,
        'if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;'
    );
    htmlContent = htmlContent.replace(
        /if \(volume >= 1e3\) return `\$\{\(volume \/ 1e3\)\.toFixed\(1\)\}K`;/g,
        'if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;'
    );
    
    // CORRECCIÓN 4: Línea 1503 - Chain de métodos
    console.log('🔧 Corrigiendo línea 1503 - Chain de métodos...');
    htmlContent = htmlContent.replace(
        /}\)\.sort\(\(a, b\) => b\.score - a\.score\)\.slice\(0, 3\);/g,
        '}).sort((a, b) => b.score - a.score).slice(0, 3);'
    );
    
    // CORRECCIÓN 5: Verificar y corregir QBTC_QUANTUM_CONSTANTS
    console.log('🔧 Verificando QBTC_QUANTUM_CONSTANTS...');
    
    // Buscar posibles problemas en la declaración de constantes
    const constantsPattern = /const QBTC_QUANTUM_CONSTANTS = \{[\s\S]*?\};/g;
    const constantsMatches = htmlContent.match(constantsPattern);
    
    if (constantsMatches && constantsMatches.length > 1) {
        console.log(`⚠️  Encontradas ${constantsMatches.length} declaraciones de QBTC_QUANTUM_CONSTANTS`);
        console.log('🔧 Manteniendo solo la primera declaración...');
        
        // Mantener solo la primera declaración
        const firstDeclaration = constantsMatches[0];
        htmlContent = htmlContent.replace(constantsPattern, (match, index) => {
            if (htmlContent.indexOf(match) === htmlContent.indexOf(firstDeclaration)) {
                return match; // Mantener la primera
            }
            return ''; // Eliminar las demás
        });
    }
    
    // CORRECCIÓN 6: Limpiar líneas vacías extra
    console.log('🔧 Limpiando líneas vacías extra...');
    htmlContent = htmlContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // CORRECCIÓN 7: Verificar paréntesis balanceados
    console.log('🔧 Verificando balance de paréntesis...');
    const openParens = (htmlContent.match(/\(/g) || []).length;
    const closeParens = (htmlContent.match(/\)/g) || []).length;
    
    console.log(`📊 Paréntesis abiertos: ${openParens}`);
    console.log(`📊 Paréntesis cerrados: ${closeParens}`);
    
    if (openParens !== closeParens) {
        console.log(`⚠️  Desbalance de paréntesis: ${openParens - closeParens}`);
        
        // Intentar corregir automáticamente
        if (openParens > closeParens) {
            const extra = openParens - closeParens;
            console.log(`🔧 Agregando ${extra} paréntesis de cierre...`);
            htmlContent += ')'.repeat(extra);
        } else if (closeParens > openParens) {
            const extra = closeParens - openParens;
            console.log(`🔧 Removiendo ${extra} paréntesis de cierre extra...`);
            // Remover paréntesis de cierre extra al final
            htmlContent = htmlContent.replace(/\)+$/, '');
        }
    }
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    // Contar líneas finales
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    console.log('📁 Archivo guardado:', htmlFile);
    
    // Verificar sintaxis después de la corrección
    console.log('\n🔍 Verificando sintaxis después de la corrección...');
    
    // Extraer JavaScript del HTML
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatches) {
        let scriptContent = '';
        scriptMatches.forEach(match => {
            const scriptTag = match.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            if (scriptTag) {
                scriptContent += scriptTag[1] + '\n';
            }
        });
        
        try {
            // Intentar evaluar el JavaScript
            eval(scriptContent);
            console.log('✅ Sintaxis JavaScript válida');
        } catch (error) {
            console.log('❌ Error de sintaxis detectado:', error.message);
            console.log('📍 Línea aproximada:', error.lineNumber || 'N/A');
        }
    }
    
} catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    
    // Restaurar desde backup si hay error
    if (fs.existsSync(backupFile)) {
        console.log('🔄 Restaurando desde backup...');
        const backupContent = fs.readFileSync(backupFile, 'utf8');
        fs.writeFileSync(htmlFile, backupContent, 'utf8');
        console.log('✅ Restauración completada');
    }
}

console.log('\n🎯 CORRECCIÓN DE PARÉNTESIS FINALIZADA');
console.log('================================================================');

