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
            
            // Buscar patrones problemáticos
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNumber = i + 1;
                
                // Buscar return statements seguidos inmediatamente por function
                if (line.includes('return') && line.includes('{') && line.includes('}') && line.includes(';')) {
                    // Verificar si la siguiente línea es una función
                    if (i + 1 < lines.length && lines[i + 1].trim().startsWith('function')) {
                        console.log(`⚠️  Línea ${lineNumber}: Posible función sin cerrar`);
                        console.log(`   Contenido: ${line.trim()}`);
                        console.log(`   Siguiente línea: ${lines[i + 1].trim()}`);
                        console.log('');
                    }
                }
                
                // Buscar líneas que terminan en } seguido inmediatamente por function
                if (line.trim().endsWith('};') && i + 1 < lines.length && lines[i + 1].trim().startsWith('function')) {
                    console.log(`⚠️  Línea ${lineNumber}: Posible función sin cerrar`);
                    console.log(`   Contenido: ${line.trim()}`);
                    console.log(`   Siguiente línea: ${lines[i + 1].trim()}`);
                    console.log('');
                }
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

