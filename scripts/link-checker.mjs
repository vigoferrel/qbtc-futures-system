import fs from 'fs';
import path from 'path';

console.log('🔍 Scanner de Enlaces Markdown - Iniciando...\n');

// Función para buscar archivos markdown
function findMarkdownFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        if (item.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item.name)) {
            files.push(...findMarkdownFiles(path.join(dir, item.name)));
        } else if (item.isFile() && item.name.endsWith('.md')) {
            files.push(path.join(dir, item.name));
        }
    }
    
    return files;
}

// Función para extraer enlaces
function extractLinks(content) {
    const links = [];
    
    // Patrones de enlaces
    const patterns = [
        /\[([^\]]+)\]\(([^)]+)\)/g,  // [text](url)
        /^\[([^\]]+)\]:\s*(.+)$/gm,  // [text]: url
        /<a[^>]+href=["']([^"']+)["'][^>]*>/g  // <a href="">
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            let text = match[1] || 'HTML link';
            let url = match[2] || match[1];
            
            // Para enlaces HTML, extraer href
            if (match[0].includes('href=')) {
                const hrefMatch = match[0].match(/href=["']([^"']+)["']/);
                if (hrefMatch) url = hrefMatch[1];
            }
            
            links.push({
                text: text,
                url: url,
                fullMatch: match[0],
                index: match.index
            });
        }
    });
    
    return links;
}

// Función para verificar si un enlace es interno y está roto
function checkInternalLink(linkUrl, filePath, projectRoot) {
    // Ignorar enlaces externos y especiales
    if (linkUrl.startsWith('http://') || 
        linkUrl.startsWith('https://') || 
        linkUrl.startsWith('#') || 
        linkUrl.startsWith('mailto:')) {
        return null;
    }
    
    const fileDir = path.dirname(filePath);
    let targetPath;
    
    if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
        targetPath = path.resolve(fileDir, linkUrl);
    } else if (linkUrl.startsWith('/')) {
        targetPath = path.join(projectRoot, linkUrl.substring(1));
    } else {
        targetPath = path.resolve(fileDir, linkUrl);
    }
    
    targetPath = path.normalize(targetPath);
    
    if (!fs.existsSync(targetPath)) {
        return {
            url: linkUrl,
            targetPath: path.relative(projectRoot, targetPath),
            reason: 'Archivo no encontrado'
        };
    }
    
    return null;
}

// Main function
async function scanProject() {
    const projectRoot = process.cwd();
    console.log(`📁 Directorio del proyecto: ${projectRoot}\n`);
    
    const markdownFiles = findMarkdownFiles(projectRoot);
    console.log(`📄 Archivos markdown encontrados: ${markdownFiles.length}\n`);
    
    const brokenLinks = [];
    let totalLinks = 0;
    
    for (const filePath of markdownFiles) {
        const relativePath = path.relative(projectRoot, filePath);
        console.log(`🔍 Escaneando: ${relativePath}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const links = extractLinks(content);
            totalLinks += links.length;
            
            for (const link of links) {
                const broken = checkInternalLink(link.url, filePath, projectRoot);
                if (broken) {
                    // Obtener número de línea
                    const lines = content.substring(0, link.index).split('\n');
                    const lineNumber = lines.length;
                    
                    brokenLinks.push({
                        file: relativePath,
                        line: lineNumber,
                        linkText: link.text,
                        linkUrl: link.url,
                        targetPath: broken.targetPath,
                        reason: broken.reason,
                        fullMatch: link.fullMatch
                    });
                }
            }
        } catch (error) {
            console.error(`❌ Error procesando ${relativePath}: ${error.message}`);
        }
    }
    
    // Generar reporte
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DE ENLACES ROTOS');
    console.log('='.repeat(80));
    console.log(`\n📈 ESTADÍSTICAS:`);
    console.log(`   • Archivos escaneados: ${markdownFiles.length}`);
    console.log(`   • Enlaces totales: ${totalLinks}`);
    console.log(`   • Enlaces rotos: ${brokenLinks.length}`);
    
    if (brokenLinks.length === 0) {
        console.log('\n✅ ¡Perfecto! No se encontraron enlaces rotos.');
        return;
    }
    
    console.log('\n❌ ENLACES ROTOS DETECTADOS:\n');
    
    // Agrupar por archivo
    const groupedByFile = {};
    brokenLinks.forEach(broken => {
        if (!groupedByFile[broken.file]) {
            groupedByFile[broken.file] = [];
        }
        groupedByFile[broken.file].push(broken);
    });
    
    let counter = 1;
    for (const [file, links] of Object.entries(groupedByFile)) {
        console.log(`📄 ${file}`);
        console.log('─'.repeat(Math.min(file.length + 2, 50)));
        
        for (const link of links) {
            console.log(`\n   ${counter}. Línea ${link.line}:`);
            console.log(`      📝 Texto: "${link.linkText}"`);
            console.log(`      🔗 URL: "${link.linkUrl}"`);
            console.log(`      📍 Destino: "${link.targetPath}"`);
            console.log(`      ❌ Error: ${link.reason}`);
            counter++;
        }
        console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('💡 Próximo paso: Revisar y corregir estos enlaces');
    console.log('='.repeat(80));
}

// Ejecutar
scanProject().catch(console.error);
