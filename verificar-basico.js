#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR BÁSICO DE EXPANSIÓN LEONARDO
 * ============================================
 * 
 * Script básico para verificar la expansión Leonardo + Leverage Matrix
 */

const fs = require('fs');
const path = require('path');

class BasicLeonardoVerifier {
    constructor() {
        this.results = {
            components: [],
            leonardoFiles: [],
            errors: []
        };
    }

    async verifySystem() {
        console.log('[🔍] INICIANDO VERIFICACIÓN BÁSICA LEONARDO...\n');
        
        try {
            // Verificar archivos Leonardo
            this.verifyLeonardoFiles();
            
            // Verificar componentes core
            this.verifyCoreComponents();
            
            // Generar reporte
            this.generateReport();
            
        } catch (error) {
            console.error('[❌] Error en verificación:', error.message);
        }
    }

    verifyLeonardoFiles() {
        console.log('[🎯] Verificando archivos Leonardo...');
        
        const leonardoFiles = [
            'core/leonardo-quantum-liberation-engine.js',
            'engines/quantum-leverage-entropy-engine.js',
            'core/ultra-di-container.js',
            'core/master-control-hub.js',
            'trading/hermetic-auto-trader.js',
            'analysis-engine/quantum-core.js',
            'leonardo-massive-activation.js',
            'verificar-expansion-leonardo.js',
            'launch-leonardo-complete-system.js'
        ];

        for (const file of leonardoFiles) {
            try {
                if (fs.existsSync(file)) {
                    console.log(`  ✅ ${file} - EXISTE`);
                    this.results.leonardoFiles.push({ file, status: 'EXISTS' });
                } else {
                    console.log(`  ❌ ${file} - NO EXISTE`);
                    this.results.leonardoFiles.push({ file, status: 'MISSING' });
                }
            } catch (error) {
                console.log(`  ⚠️ ${file} - ERROR: ${error.message}`);
                this.results.leonardoFiles.push({ file, status: 'ERROR', error: error.message });
            }
        }
        
        console.log('');
    }

    verifyCoreComponents() {
        console.log('[🔧] Verificando componentes core...');
        
        const coreComponents = [
            'core/',
            'engines/',
            'trading/',
            'analysis-engine/',
            'dimensional/',
            'akashic/'
        ];

        for (const component of coreComponents) {
            try {
                if (fs.existsSync(component)) {
                    const files = fs.readdirSync(component);
                    console.log(`  ✅ ${component} - ${files.length} archivos`);
                    this.results.components.push({ component, status: 'EXISTS', fileCount: files.length });
                } else {
                    console.log(`  ❌ ${component} - NO EXISTE`);
                    this.results.components.push({ component, status: 'MISSING' });
                }
            } catch (error) {
                console.log(`  ⚠️ ${component} - ERROR: ${error.message}`);
                this.results.components.push({ component, status: 'ERROR', error: error.message });
            }
        }
        
        console.log('');
    }

    generateReport() {
        console.log('[📊] GENERANDO REPORTE DE VERIFICACIÓN...\n');
        
        const totalFiles = this.results.leonardoFiles.length;
        const existingFiles = this.results.leonardoFiles.filter(f => f.status === 'EXISTS').length;
        const missingFiles = this.results.leonardoFiles.filter(f => f.status === 'MISSING').length;
        const errorFiles = this.results.leonardoFiles.filter(f => f.status === 'ERROR').length;
        
        console.log('=== RESUMEN DE VERIFICACIÓN ===');
        console.log(`📁 Archivos Leonardo: ${existingFiles}/${totalFiles} existentes`);
        console.log(`❌ Archivos faltantes: ${missingFiles}`);
        console.log(`⚠️ Archivos con error: ${errorFiles}`);
        console.log('');
        
        if (existingFiles === totalFiles) {
            console.log('🎉 ¡SISTEMA LEONARDO COMPLETAMENTE IMPLEMENTADO!');
        } else if (existingFiles >= totalFiles * 0.8) {
            console.log('✅ Sistema Leonardo mayormente implementado');
        } else {
            console.log('⚠️ Sistema Leonardo parcialmente implementado');
        }
        
        console.log('');
        console.log('=== ARCHIVOS LEONARDO ===');
        this.results.leonardoFiles.forEach(file => {
            const status = file.status === 'EXISTS' ? '✅' : file.status === 'MISSING' ? '❌' : '⚠️';
            console.log(`${status} ${file.file}`);
        });
        
        console.log('');
        console.log('=== COMPONENTES CORE ===');
        this.results.components.forEach(comp => {
            const status = comp.status === 'EXISTS' ? '✅' : comp.status === 'MISSING' ? '❌' : '⚠️';
            const info = comp.fileCount ? ` (${comp.fileCount} archivos)` : '';
            console.log(`${status} ${comp.component}${info}`);
        });
    }
}

// Función principal
function main() {
    const verifier = new BasicLeonardoVerifier();
    verifier.verifySystem();
}

// Ejecutar
main();



