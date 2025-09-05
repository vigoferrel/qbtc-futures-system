const fs = require('fs');

try {
    const htmlContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');
    
    // Extraer el contenido JavaScript
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (scriptMatches) {
        scriptMatches.forEach((script, index) => {
            const jsContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            
            // Dividir en líneas para análisis detallado
            const lines = jsContent.split('\n');
            
            console.log(`\n🔍 Analizando Script ${index + 1} (${lines.length} líneas):`);
            
            // Verificar línea por línea
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Buscar patrones problemáticos
                if (line.includes('});') && line.includes('sort') && line.includes('slice')) {
                    console.log(`⚠️  Línea ${lineNumber}: Posible problema en cadena de métodos`);
                    console.log(`   Contenido: ${line.trim()}`);
                }
                
                if (line.includes('return {') && !line.includes('};')) {
                    console.log(`⚠️  Línea ${lineNumber}: Return sin punto y coma`);
                    console.log(`   Contenido: ${line.trim()}`);
                }
                
                if (line.includes('}') && line.includes(')') && line.includes(';')) {
                    console.log(`⚠️  Línea ${lineNumber}: Posible problema de paréntesis/llaves`);
                    console.log(`   Contenido: ${line.trim()}`);
                }
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

