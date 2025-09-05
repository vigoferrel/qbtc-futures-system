const fs = require('fs');

try {
    const htmlContent = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');
    
    // Extraer el contenido JavaScript
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    
    if (scriptMatches) {
        scriptMatches.forEach((script, index) => {
            const jsContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            
            try {
                // Intentar parsear el JavaScript
                eval('(function() { ' + jsContent + ' })');
                console.log(`✅ Script ${index + 1}: Sintaxis válida`);
            } catch (error) {
                console.log(`❌ Script ${index + 1}: Error de sintaxis - ${error.message}`);
            }
        });
    }
    
    console.log('✅ Verificación de sintaxis completada');
} catch (error) {
    console.error('❌ Error al leer el archivo:', error.message);
}
