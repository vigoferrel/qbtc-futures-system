const fs = require('fs');

try {
    let content = fs.readFileSync('monitor-quantum-intelligence-llm-debug.html', 'utf8');
    
    // Patrones para encontrar return statements sin punto y coma
    const patterns = [
        // return { ... } sin punto y coma
        /(return\s*\{[^}]*\})\s*\n/g,
        // return `...` sin punto y coma  
        /(return\s*`[^`]*`)\s*\n/g,
        // return null sin punto y coma
        /(return\s*null)\s*\n/g,
        // return 0 sin punto y coma
        /(return\s*0)\s*\n/g
    ];
    
    let changes = 0;
    
    patterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            console.log(`Patrón ${index + 1}: ${matches.length} coincidencias encontradas`);
            content = content.replace(pattern, '$1;\n');
            changes += matches.length;
        }
    });
    
    if (changes > 0) {
        fs.writeFileSync('monitor-quantum-intelligence-llm-debug.html', content, 'utf8');
        console.log(`✅ Corregidos ${changes} return statements sin punto y coma`);
    } else {
        console.log('✅ No se encontraron return statements sin punto y coma');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

