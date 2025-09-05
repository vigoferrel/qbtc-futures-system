#!/usr/bin/env node

/**
 * QBTC Markdown Link Scanner
 * Herramienta avanzada para detectar enlaces rotos y referencias inválidas
 * en archivos Markdown del proyecto QBTC
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MarkdownLinkScanner {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.brokenLinks = [];
        this.scannedFiles = 0;
        this.totalLinks = 0;
    }

    /**
     * Escanea todos los archivos markdown en el proyecto
     */
    async scanProject() {
        console.log('🔍 Iniciando scanner completo de enlaces Markdown...\n');
        
        // Buscar todos los archivos .md
        const markdownFiles = this.findMarkdownFiles(this.projectRoot);
        
        console.log(`📁 Encontrados ${markdownFiles.length} archivos Markdown para escanear\n`);
        
        for (const filePath of markdownFiles) {
            await this.scanFile(filePath);
        }
        
        this.generateReport();
    }

    /**
     * Busca recursivamente todos los archivos .md
     */
    findMarkdownFiles(dir, files = []) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Evitar directorios comunes que no necesitamos
                if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                    this.findMarkdownFiles(fullPath, files);
                }
            } else if (stat.isFile() && item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    /**
     * Escanea un archivo específico en busca de enlaces rotos
     */
    async scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const relativePath = path.relative(this.projectRoot, filePath);
            
            console.log(`📄 Escaneando: ${relativePath}`);
            
            this.scannedFiles++;
            
            // Extraer enlaces markdown [text](link)
            const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
            
            // Extraer enlaces de referencia [text]: link
            const referenceLinks = content.match(/^\[([^\]]+)\]:\s*(.+)$/gm) || [];
            
            // Extraer enlaces HTML <a href="">
            const htmlLinks = content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/g) || [];
            
            const allLinks = [...markdownLinks, ...referenceLinks, ...htmlLinks];
            this.totalLinks += allLinks.length;
            
            for (const linkMatch of allLinks) {
                this.checkLink(linkMatch, filePath, relativePath, content);
            }
            
        } catch (error) {
            console.error(`❌ Error escaneando ${filePath}: ${error.message}`);
        }
    }

    /**
     * Verifica si un enlace está roto
     */
    checkLink(linkMatch, filePath, relativePath, content) {
        let linkUrl = '';
        let linkText = '';
        
        // Extraer URL según el tipo de enlace
        if (linkMatch.includes('](')) {
            // Markdown link [text](url)
            const match = linkMatch.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
                linkText = match[1];
                linkUrl = match[2];
            }
        } else if (linkMatch.includes(']: ')) {
            // Reference link [text]: url
            const match = linkMatch.match(/^\[([^\]]+)\]:\s*(.+)$/);
            if (match) {
                linkText = match[1];
                linkUrl = match[2];
            }
        } else if (linkMatch.includes('href=')) {
            // HTML link <a href="url">
            const match = linkMatch.match(/href=["']([^"']+)["']/);
            if (match) {
                linkUrl = match[1];
                linkText = 'HTML link';
            }
        }
        
        if (!linkUrl) return;
        
        // Ignorar enlaces externos (http/https)
        if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
            return;
        }
        
        // Ignorar anclas internas
        if (linkUrl.startsWith('#')) {
            return;
        }
        
        // Ignorar enlaces mailto
        if (linkUrl.startsWith('mailto:')) {
            return;
        }
        
        // Verificar enlaces internos
        this.checkInternalLink(linkUrl, filePath, relativePath, linkText, linkMatch, content);
    }

    /**
     * Verifica enlaces internos al proyecto
     */
    checkInternalLink(linkUrl, filePath, relativePath, linkText, fullMatch, content) {
        const fileDir = path.dirname(filePath);
        let targetPath;
        
        if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
            // Enlace relativo
            targetPath = path.resolve(fileDir, linkUrl);
        } else if (linkUrl.startsWith('/')) {
            // Enlace absoluto desde la raíz del proyecto
            targetPath = path.join(this.projectRoot, linkUrl.substring(1));
        } else {
            // Enlace relativo sin ./
            targetPath = path.resolve(fileDir, linkUrl);
        }
        
        // Normalizar el path
        targetPath = path.normalize(targetPath);
        
        // Verificar si el archivo/directorio existe
        if (!fs.existsSync(targetPath)) {
            const lineNumber = this.getLineNumber(content, fullMatch);
            
            this.brokenLinks.push({
                file: relativePath,
                line: lineNumber,
                linkText: linkText,
                linkUrl: linkUrl,
                fullMatch: fullMatch,
                targetPath: path.relative(this.projectRoot, targetPath),
                reason: 'File not found'
            });
        }
    }

    /**
     * Obtiene el número de línea donde aparece un enlace
     */
    getLineNumber(content, searchText) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * Genera el reporte de enlaces rotos
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 REPORTE COMPLETO DE ENLACES ROTOS');
        console.log('='.repeat(80));
        
        console.log(`\n📈 ESTADÍSTICAS:`);
        console.log(`   • Archivos escaneados: ${this.scannedFiles}`);
        console.log(`   • Enlaces totales encontrados: ${this.totalLinks}`);
        console.log(`   • Enlaces rotos detectados: ${this.brokenLinks.length}`);
        
        if (this.brokenLinks.length === 0) {
            console.log('\n✅ ¡Excelente! No se encontraron enlaces rotos.');
            return;
        }
        
        console.log(`\n❌ ENLACES ROTOS DETECTADOS:\n`);
        
        // Agrupar por archivo
        const groupedByFile = {};
        for (const broken of this.brokenLinks) {
            if (!groupedByFile[broken.file]) {
                groupedByFile[broken.file] = [];
            }
            groupedByFile[broken.file].push(broken);
        }
        
        let counter = 1;
        for (const [file, links] of Object.entries(groupedByFile)) {
            console.log(`📄 ${file}`);
            console.log('─'.repeat(file.length + 2));
            
            for (const link of links) {
                console.log(`   ${counter}. Línea ${link.line}:`);
                console.log(`      Texto: "${link.linkText}"`);
                console.log(`      URL: "${link.linkUrl}"`);
                console.log(`      Destino buscado: "${link.targetPath}"`);
                console.log(`      Razón: ${link.reason}`);
                console.log(`      Enlace completo: ${link.fullMatch}`);
                console.log('');
                counter++;
            }
            console.log('');
        }
        
        console.log('='.repeat(80));
        console.log('💡 SUGERENCIAS:');
        console.log('   1. Revisa que los archivos referenciados existan');
        console.log('   2. Verifica las rutas relativas y absolutas');
        console.log('   3. Confirma la estructura de directorios');
        console.log('   4. Considera si algunos enlaces deben ser externos');
        console.log('='.repeat(80));
    }
}

// Ejecutar scanner si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const projectRoot = path.resolve(__dirname, '..');
    const scanner = new MarkdownLinkScanner(projectRoot);
    scanner.scanProject().catch(console.error);
}

export default MarkdownLinkScanner;
