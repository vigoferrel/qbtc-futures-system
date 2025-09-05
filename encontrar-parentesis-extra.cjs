const fs = require('fs');

try {
    const htmlContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');
    
    // Extraer el contenido JavaScript
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (scriptMatches) {
        scriptMatches.forEach((script, index) => {
            const jsContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            
            console.log(`\n🔍 Analizando Script ${index + 1}:`);
            
            // Contar paréntesis y llaves
            const openParens = (jsContent.match(/\(/g) || []).length;
            const closeParens = (jsContent.match(/\)/g) || []).length;
            const openBraces = (jsContent.match(/\{/g) || []).length;
            const closeBraces = (jsContent.match(/\}/g) || []).length;
            
            console.log(`Paréntesis: ${openParens} abiertos, ${closeParens} cerrados`);
            console.log(`Llaves: ${openBraces} abiertas, ${closeBraces} cerradas`);
            
            if (closeParens > openParens) {
                console.log(`❌ PROBLEMA: ${closeParens - openParens} paréntesis de cierre extra`);
            }
            if (closeBraces > openBraces) {
                console.log(`❌ PROBLEMA: ${closeBraces - openBraces} llaves de cierre extra`);
            }
            
            // Buscar líneas problemáticas
            const lines = jsContent.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Buscar patrones problemáticos
                if (line.includes('});') && line.includes('sort') && line.includes('slice')) {
                    console.log(`⚠️  Línea ${lineNumber}: Posible problema en cadena de métodos`);
                    console.log(`   Contenido: ${line.trim()}`);
                    
                    // Verificar si hay paréntesis extra en esta línea específica
                    const lineOpenParens = (line.match(/\(/g) || []).length;
                    const lineCloseParens = (line.match(/\)/g) || []).length;
                    
                    if (lineCloseParens > lineOpenParens) {
                        console.log(`   ❌ PROBLEMA: Paréntesis de cierre extra en esta línea`);
                    }
                }
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

