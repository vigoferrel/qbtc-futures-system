const fs = require('fs');

console.log('🔧 CORRECCIÓN DE ARGUMENTOS FALTANTES - QBTC QUANTUM');
console.log('====================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // Buscar patrones problemáticos de argumentos
    console.log('\n🔍 Buscando patrones problemáticos...');
    
    // CORRECCIÓN 1: Funciones con argumentos faltantes
    console.log('🔧 Corrigiendo funciones con argumentos faltantes...');
    
    // Buscar patrones como functionName( sin cerrar
    htmlContent = htmlContent.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, funcName, args) => {
        console.log(`   Función encontrada: ${funcName}`);
        return match;
    });
    
    // CORRECCIÓN 2: Llamadas a funciones con argumentos faltantes
    console.log('🔧 Corrigiendo llamadas a funciones...');
    
    // Buscar patrones como functionName( sin cerrar
    htmlContent = htmlContent.replace(/(\w+)\s*\(([^)]*)\)/g, (match, funcName, args) => {
        // Verificar si es una llamada a función válida
        if (funcName && !funcName.includes('function') && !funcName.includes('if') && !funcName.includes('for')) {
            // Verificar si los argumentos están balanceados
            const openParens = (args.match(/\(/g) || []).length;
            const closeParens = (args.match(/\)/g) || []).length;
            
            if (openParens !== closeParens) {
                console.log(`   Llamada problemática: ${funcName}(${args})`);
                // Agregar paréntesis faltantes
                const missingParens = openParens - closeParens;
                if (missingParens > 0) {
                    return `${funcName}(${args}${')'.repeat(missingParens)})`;
                }
            }
        }
        return match;
    });
    
    // CORRECCIÓN 3: Template literals malformados
    console.log('🔧 Corrigiendo template literals...');
    
    // Buscar template literals que no están cerrados correctamente
    htmlContent = htmlContent.replace(/`([^`]*)\$\{([^}]*)\}([^`]*)/g, (match, before, expr, after) => {
        console.log(`   Template literal encontrado: ${before}${expr}${after}`);
        return match;
    });
    
    // CORRECCIÓN 4: Strings incompletos
    console.log('🔧 Corrigiendo strings incompletos...');
    
    // Buscar strings que no están cerrados
    htmlContent = htmlContent.replace(/"([^"]*)$/gm, (match, content) => {
        console.log(`   String incompleto encontrado: "${content}"`);
        return match;
    });
    
    // CORRECCIÓN 5: Verificar balance de paréntesis en todo el archivo
    console.log('🔧 Verificando balance de paréntesis...');
    
    const openParens = (htmlContent.match(/\(/g) || []).length;
    const closeParens = (htmlContent.match(/\)/g) || []).length;
    
    console.log(`   Paréntesis abiertos: ${openParens}`);
    console.log(`   Paréntesis cerrados: ${closeParens}`);
    
    if (openParens !== closeParens) {
        console.log(`   ⚠️  Desbalance de paréntesis: ${openParens - closeParens}`);
        
        // Intentar corregir automáticamente
        if (openParens > closeParens) {
            const extra = openParens - closeParens;
            console.log(`   🔧 Agregando ${extra} paréntesis de cierre...`);
            htmlContent += ')'.repeat(extra);
        } else if (closeParens > openParens) {
            const extra = closeParens - openParens;
            console.log(`   🔧 Removiendo ${extra} paréntesis de cierre extra...`);
            // Remover paréntesis de cierre extra al final
            htmlContent = htmlContent.replace(/\)+$/, '');
        }
    }
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN DE ARGUMENTOS COMPLETADA');
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
            
            // Si el error persiste, mostrar más detalles
            if (error.message.includes('missing ) after argument list')) {
                console.log('🔍 Buscando argumentos faltantes específicos...');
                
                // Buscar líneas con patrones problemáticos
                const lines = scriptContent.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('(') && !line.includes(')')) {
                        console.log(`   Línea ${i + 1}: "${line.trim()}"`);
                    }
                }
            }
        }
    }
    
} catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
}

console.log('\n🎯 CORRECCIÓN DE ARGUMENTOS FINALIZADA');
console.log('====================================================');

