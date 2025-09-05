const fs = require('fs');

try {
    const htmlContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');
    
    // Extraer el contenido JavaScript
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (scriptMatches) {
        scriptMatches.forEach((script, index) => {
            const jsContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            
            console.log(`\n🔍 Analizando Script ${index + 1}:`);
            
            // Dividir en líneas para análisis detallado
            const lines = jsContent.split('\n');
            
            // Contar paréntesis y llaves
            const openParens = (jsContent.match(/\(/g) || []).length;
            const closeParens = (jsContent.match(/\)/g) || []).length;
            const openBraces = (jsContent.match(/\{/g) || []).length;
            const closeBraces = (jsContent.match(/\}/g) || []).length;
            
            console.log(`Paréntesis: ${openParens} abiertos, ${closeParens} cerrados`);
            console.log(`Llaves: ${openBraces} abiertas, ${closeBraces} cerradas`);
            
            if (closeParens > openParens) {
                console.log(`❌ PROBLEMA: ${closeParens - openParens} paréntesis de cierre extra`);
                
                // Buscar líneas con paréntesis extra
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const lineNumber = i + 1;
                    
                    // Buscar líneas con paréntesis extra
                    if (line.includes(')') && !line.includes('(')) {
                        console.log(`⚠️  Línea ${lineNumber}: Paréntesis de cierre extra`);
                        console.log(`   Contenido: ${line.trim()}`);
                    }
                    
                    // Buscar líneas con múltiples paréntesis de cierre
                    const lineCloseParens = (line.match(/\)/g) || []).length;
                    const lineOpenParens = (line.match(/\(/g) || []).length;
                    
                    if (lineCloseParens > lineOpenParens + 1) {
                        console.log(`⚠️  Línea ${lineNumber}: Múltiples paréntesis de cierre extra`);
                        console.log(`   Contenido: ${line.trim()}`);
                    }
                }
            }
            
            if (closeBraces > openBraces) {
                console.log(`❌ PROBLEMA: ${closeBraces - openBraces} llaves de cierre extra`);
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

