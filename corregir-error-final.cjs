const fs = require('fs');

console.log('🔧 Corrigiendo error de sintaxis final...');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
let content = fs.readFileSync(htmlFile, 'utf8');

// Extraer solo el código JavaScript
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.log('❌ No se encontró la sección <script>');
    process.exit(1);
}

const jsCode = scriptMatch[1];
console.log(`📊 Código JavaScript extraído: ${jsCode.length} caracteres`);

// Contar llaves
const openBraces = (jsCode.match(/\{/g) || []).length;
const closeBraces = (jsCode.match(/\}/g) || []).length;

console.log(`📊 Llaves abiertas: ${openBraces}`);
console.log(`📊 Llaves cerradas: ${closeBraces}`);
console.log(`📊 Diferencia: ${openBraces - closeBraces}`);

if (openBraces > closeBraces) {
    console.log('🔧 Agregando llave faltante...');
    
    // Buscar el final del script y agregar la llave faltante
    const scriptEndIndex = content.lastIndexOf('</script>');
    if (scriptEndIndex !== -1) {
        const beforeScript = content.substring(0, scriptEndIndex);
        const afterScript = content.substring(scriptEndIndex);
        
        // Agregar la llave faltante antes del cierre del script
        const correctedContent = beforeScript + '\n        }\n    ' + afterScript;
        
        fs.writeFileSync(htmlFile, correctedContent);
        console.log('✅ Llave faltante agregada');
    } else {
        console.log('❌ No se pudo encontrar el cierre del script');
    }
} else if (closeBraces > openBraces) {
    console.log('🔧 Eliminando llave extra...');
    
    // Buscar y eliminar la última llave extra
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
        const beforeBrace = content.substring(0, lastBraceIndex);
        const afterBrace = content.substring(lastBraceIndex + 1);
        
        const correctedContent = beforeBrace + afterBrace;
        fs.writeFileSync(htmlFile, correctedContent);
        console.log('✅ Llave extra eliminada');
    }
} else {
    console.log('✅ Las llaves están balanceadas');
}

// Verificar el resultado
const newContent = fs.readFileSync(htmlFile, 'utf8');
const newScriptMatch = newContent.match(/<script>([\s\S]*?)<\/script>/);
if (newScriptMatch) {
    const newJsCode = newScriptMatch[1];
    const newOpenBraces = (newJsCode.match(/\{/g) || []).length;
    const newCloseBraces = (newJsCode.match(/\}/g) || []).length;
    
    console.log('\n📊 VERIFICACIÓN FINAL:');
    console.log(`   • Llaves abiertas: ${newOpenBraces}`);
    console.log(`   • Llaves cerradas: ${newCloseBraces}`);
    console.log(`   • Balance: ${newOpenBraces === newCloseBraces ? '✅ CORRECTO' : '❌ DESBALANCEADO'}`);
}

// Verificar si el archivo termina correctamente
const finalContent = fs.readFileSync(htmlFile, 'utf8');
if (!finalContent.trim().endsWith('</html>')) {
    console.log('⚠️  El archivo no termina con </html>');
    console.log('🔧 Agregando cierre de HTML...');
    
    const correctedContent = finalContent + '\n</html>';
    fs.writeFileSync(htmlFile, correctedContent);
    console.log('✅ Cierre de HTML agregado');
} else {
    console.log('✅ El archivo termina correctamente con </html>');
}
