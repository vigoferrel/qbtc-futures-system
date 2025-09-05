const fs = require('fs');

console.log('🔍 BÚSQUEDA ESPECÍFICA DEL ERROR - QBTC QUANTUM');
console.log('===============================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Extraer JavaScript del HTML
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (!scriptMatches) {
        console.log('❌ No se encontraron scripts en el HTML');
        return;
    }
    
    console.log(`📊 Encontrados ${scriptMatches.length} bloques de script`);
    
    let scriptIndex = 0;
    for (const scriptMatch of scriptMatches) {
        scriptIndex++;
        const scriptTag = scriptMatch.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        
        if (scriptTag) {
            const scriptContent = scriptTag[1];
            console.log(`\n🔍 Analizando Script ${scriptIndex} (${scriptContent.length} caracteres)`);
            
            // Dividir en líneas para análisis detallado
            const lines = scriptContent.split('\n');
            
            // Buscar líneas problemáticas
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Buscar patrones problemáticos
                if (line.includes(')') && line.includes(';')) {
                    // Contar paréntesis en esta línea
                    const openParens = (line.match(/\(/g) || []).length;
                    const closeParens = (line.match(/\)/g) || []).length;
                    
                    if (closeParens > openParens) {
                        console.log(`⚠️  Línea ${lineNumber}: Paréntesis de cierre extra`);
                        console.log(`   Contenido: "${line.trim()}"`);
                        console.log(`   Paréntesis abiertos: ${openParens}, cerrados: ${closeParens}`);
                    }
                }
                
                // Buscar template literals malformados
                if (line.includes('`') && line.includes('${')) {
                    const backticks = (line.match(/`/g) || []).length;
                    if (backticks % 2 !== 0) {
                        console.log(`⚠️  Línea ${lineNumber}: Template literal malformado`);
                        console.log(`   Contenido: "${line.trim()}"`);
                    }
                }
                
                // Buscar strings incompletos
                if (line.includes('"') && !line.includes('";')) {
                    const quotes = (line.match(/"/g) || []).length;
                    if (quotes % 2 !== 0) {
                        console.log(`⚠️  Línea ${lineNumber}: String incompleto`);
                        console.log(`   Contenido: "${line.trim()}"`);
                    }
                }
            }
            
            // Probar el script completo
            try {
                eval(scriptContent);
                console.log(`✅ Script ${scriptIndex}: Sintaxis válida`);
            } catch (error) {
                console.log(`❌ Script ${scriptIndex}: ${error.message}`);
                
                // Intentar identificar la línea específica
                if (error.message.includes('Unexpected token \')\'')) {
                    console.log('🔍 Buscando paréntesis problemáticos...');
                    
                    // Buscar paréntesis extra al final de líneas
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line.trim().endsWith(')') && !line.trim().endsWith('();')) {
                            console.log(`   Línea ${i + 1}: "${line.trim()}"`);
                        }
                    }
                }
            }
        }
    }
    
} catch (error) {
    console.error('❌ Error al leer el archivo:', error.message);
}

console.log('\n🎯 BÚSQUEDA ESPECÍFICA FINALIZADA');
console.log('===============================================');
