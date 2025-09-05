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
            
            // Probar cada línea individualmente
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                try {
                    // Intentar parsear la línea
                    eval('(function() { ' + line + ' })');
                } catch (error) {
                    if (error.message.includes('Unexpected token') && error.message.includes(')')) {
                        console.log(`❌ Línea ${lineNumber}: Error de sintaxis`);
                        console.log(`   Contenido: ${line.trim()}`);
                        console.log(`   Error: ${error.message}`);
                        
                        // Mostrar contexto
                        const start = Math.max(0, i - 2);
                        const end = Math.min(lines.length, i + 3);
                        console.log(`   Contexto:`);
                        for (let j = start; j < end; j++) {
                            const marker = j === i ? '>>> ' : '    ';
                            console.log(`${marker}${j + 1}: ${lines[j].trim()}`);
                        }
                        console.log('');
                    }
                }
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

