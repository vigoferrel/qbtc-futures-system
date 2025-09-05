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
            
            // Buscar líneas problemáticas específicas
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Buscar patrones específicos que causan errores
                if (line.includes('});') && line.includes('sort') && line.includes('slice')) {
                    console.log(`⚠️  Línea ${lineNumber}: Cadena de métodos problemática`);
                    console.log(`   Contenido: ${line.trim()}`);
                    
                    // Verificar si hay paréntesis extra
                    const openParens = (line.match(/\(/g) || []).length;
                    const closeParens = (line.match(/\)/g) || []).length;
                    
                    console.log(`   Paréntesis: ${openParens} abiertos, ${closeParens} cerrados`);
                    
                    if (closeParens > openParens) {
                        console.log(`   ❌ PROBLEMA: Paréntesis de cierre extra`);
                        
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
                
                // Buscar líneas con múltiples paréntesis de cierre
                if (line.includes(')') && line.includes('}') && line.includes(';')) {
                    const closeParens = (line.match(/\)/g) || []).length;
                    if (closeParens > 2) {
                        console.log(`⚠️  Línea ${lineNumber}: Múltiples paréntesis de cierre`);
                        console.log(`   Contenido: ${line.trim()}`);
                    }
                }
                
                // Buscar líneas con paréntesis extra al final
                if (line.trim().endsWith(')') && !line.includes('(')) {
                    console.log(`⚠️  Línea ${lineNumber}: Paréntesis de cierre extra al final`);
                    console.log(`   Contenido: ${line.trim()}`);
                }
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

