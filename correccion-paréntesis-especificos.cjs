const fs = require('fs');

console.log('🔧 CORRECCIÓN DE PARÉNTESIS ESPECÍFICOS - QBTC QUANTUM');
console.log('======================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // CORRECCIÓN 1: Línea 94 - Paréntesis extra
    console.log('\n🔧 Corrigiendo línea 94...');
    htmlContent = htmlContent.replace(/\]\);$/gm, '];');
    
    // CORRECCIÓN 2: Línea 175 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 175...');
    htmlContent = htmlContent.replace(/\}\)\);$/gm, '});');
    
    // CORRECCIÓN 3: Línea 183 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 183...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 4: Línea 327 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 327...');
    htmlContent = htmlContent.replace(/\}\) \}\);$/gm, '});');
    
    // CORRECCIÓN 5: Línea 505 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 505...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 6: Línea 542 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 542...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 7: Línea 577 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 577...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 8: Línea 605 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 605...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 9: Línea 617 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 617...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 10: Línea 687 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 687...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 11: Línea 777 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 777...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 12: Línea 885 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 885...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 13: Línea 976 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 976...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 14: Línea 1064 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1064...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 15: Línea 1163 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1163...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 16: Línea 1268 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1268...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 17: Línea 1408 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1408...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 18: Línea 1430 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1430...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 19: Línea 1465 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1465...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 20: Línea 1500 - Paréntesis extra en chain de métodos
    console.log('🔧 Corrigiendo línea 1500...');
    htmlContent = htmlContent.replace(/\)\.sort\(\(a, b\) => b\.score - a\.score\)\.slice\(0, 3\);/gm, '.sort((a, b) => b.score - a.score).slice(0, 3);');
    
    // CORRECCIÓN 21: Línea 1515 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1515...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 22: Línea 1550 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1550...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 23: Línea 1602 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1602...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 24: Línea 1663 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1663...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN 25: Línea 1974 - Paréntesis extra
    console.log('🔧 Corrigiendo línea 1974...');
    htmlContent = htmlContent.replace(/\}\);$/gm, '};');
    
    // CORRECCIÓN GENERAL: Remover paréntesis extra al final de líneas
    console.log('🔧 Limpiando paréntesis extra generales...');
    htmlContent = htmlContent.replace(/\)+$/gm, '');
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN DE PARÉNTESIS COMPLETADA');
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
}

console.log('\n🎯 CORRECCIÓN DE PARÉNTESIS FINALIZADA');
console.log('======================================================');

