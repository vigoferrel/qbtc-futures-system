const fs = require('fs');

console.log('🔍 BÚSQUEDA EXACTA DEL ERROR DE SINTAXIS - QBTC QUANTUM');
console.log('========================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Extraer todos los scripts
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (!scriptMatches) {
        console.log('❌ No se encontraron scripts en el HTML');
        return;
    }
    
    console.log(`📊 Encontrados ${scriptMatches.length} bloques de script`);
    
    let totalScriptContent = '';
    let scriptIndex = 0;
    
    for (const scriptMatch of scriptMatches) {
        scriptIndex++;
        const scriptTag = scriptMatch.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        
        if (scriptTag) {
            const scriptContent = scriptTag[1];
            console.log(`\n🔍 Analizando Script ${scriptIndex} (${scriptContent.length} caracteres)`);
            
            // Dividir en líneas para análisis detallado
            const lines = scriptContent.split('\n');
            
            // Probar cada línea individualmente
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Saltar líneas vacías o comentarios
                if (!line.trim() || line.trim().startsWith('//')) {
                    continue;
                }
                
                try {
                    // Intentar evaluar la línea
                    eval(line);
                } catch (error) {
                    if (error.message.includes('Unexpected token \')\'')) {
                        console.log(`❌ ERROR ENCONTRADO:`);
                        console.log(`   Script: ${scriptIndex}`);
                        console.log(`   Línea: ${lineNumber}`);
                        console.log(`   Contenido: "${line.trim()}"`);
                        console.log(`   Error: ${error.message}`);
                        
                        // Mostrar contexto
                        const start = Math.max(0, i - 2);
                        const end = Math.min(lines.length, i + 3);
                        
                        console.log(`\n📋 Contexto (líneas ${start + 1}-${end}):`);
                        for (let j = start; j < end; j++) {
                            const marker = j === i ? '>>> ' : '    ';
                            console.log(`${marker}${j + 1}: ${lines[j]}`);
                        }
                        
                        // Analizar caracteres problemáticos
                        console.log(`\n🔍 Análisis de caracteres en la línea:`);
                        for (let k = 0; k < line.length; k++) {
                            const char = line[k];
                            if (char === '(' || char === ')') {
                                console.log(`   Pos ${k}: '${char}'`);
                            }
                        }
                        
                        return; // Salir después del primer error encontrado
                    }
                }
            }
            
            totalScriptContent += scriptContent + '\n';
        }
    }
    
    // Si no se encontró error línea por línea, probar el contenido completo
    console.log('\n🔍 Probando contenido completo de scripts...');
    
    try {
        eval(totalScriptContent);
        console.log('✅ No se encontraron errores de sintaxis en el contenido completo');
    } catch (error) {
        console.log(`❌ Error en contenido completo: ${error.message}`);
        
        // Buscar patrones problemáticos
        console.log('\n🔍 Buscando patrones problemáticos...');
        
        // Buscar paréntesis extra
        const extraParens = totalScriptContent.match(/\){2,}/g);
        if (extraParens) {
            console.log('⚠️  Encontrados paréntesis extra:');
            extraParens.forEach((match, index) => {
                console.log(`   ${index + 1}: "${match}"`);
            });
        }
        
        // Buscar template literals malformados
        const malformedTemplates = totalScriptContent.match(/`[^`]*\$\{[^}]*\}[^`]*`/g);
        if (malformedTemplates) {
            console.log('⚠️  Posibles template literals malformados:');
            malformedTemplates.forEach((match, index) => {
                console.log(`   ${index + 1}: "${match}"`);
            });
        }
        
        // Buscar strings incompletos
        const incompleteStrings = totalScriptContent.match(/"[^"]*$/gm);
        if (incompleteStrings) {
            console.log('⚠️  Posibles strings incompletos:');
            incompleteStrings.forEach((match, index) => {
                console.log(`   ${index + 1}: "${match}"`);
            });
        }
    }
    
} catch (error) {
    console.error('❌ Error al leer el archivo:', error.message);
}

console.log('\n🎯 BÚSQUEDA EXACTA FINALIZADA');
console.log('========================================================');

