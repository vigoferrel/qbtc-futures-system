const fs = require('fs');

console.log('🔧 CORRECCIÓN SIMPLE DE STRINGS HTML - QBTC QUANTUM');
console.log('==================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // CORRECCIÓN: Reemplazar strings malformados que empiezan con comillas dobles
    console.log('\n🔧 Corrigiendo strings malformados...');
    
    // Buscar y reemplazar líneas que empiezan con comillas dobles sin cerrar
    const lines = htmlContent.split('\n');
    const correctedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Si la línea empieza con comillas dobles y no está cerrada correctamente
        if (line.trim().startsWith('"') && !line.trim().endsWith('";')) {
            console.log(`🔧 Corrigiendo línea ${i + 1}: ${line.trim().substring(0, 50)}...`);
            
            // Remover las comillas dobles del inicio y agregar comillas simples apropiadas
            line = line.replace(/^"+\s*/, '            ');
            
            // Si la línea contiene HTML, convertir a comillas simples
            if (line.includes('html +=') && line.includes('<')) {
                line = line.replace(/html \+= "([^"]*)"/g, 'html += \'$1\'');
            }
            
            // Si la línea contiene template literals, corregirlos
            if (line.includes('${') && line.includes('}')) {
                line = line.replace(/`([^`]*)`/g, '\'$1\'');
            }
        }
        
        correctedLines.push(line);
    }
    
    htmlContent = correctedLines.join('\n');
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN SIMPLE COMPLETADA');
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

console.log('\n🎯 CORRECCIÓN SIMPLE FINALIZADA');
console.log('==================================================');

