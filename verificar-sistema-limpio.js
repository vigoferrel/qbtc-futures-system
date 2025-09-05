#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE SISTEMA LIMPIO
 * ================================
 *
 * Script para verificar que el sistema esté libre de Math.random
 * y simulaciones que puedan afectar la precisión
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemCleanerVerifier {
    constructor() {
        this.results = {
            filesChecked: 0,
            cleanFiles: 0,
            suspiciousFiles: [],
            mathRandomFound: [],
            simulationsFound: [],
            totalLines: 0
        };

        // Archivos críticos a verificar
        this.criticalFiles = [
            'trading/hermetic-auto-trader.js',
            'core/leonardo-quantum-liberation-engine.js',
            'engines/quantum-leverage-entropy-engine.js',
            'core/ultra-di-container.js',
            'core/master-control-hub.js',
            'analysis-engine/quantum-core.js',
            'api/leonardo-api-simple.js',
            'leonardo-massive-activation.js',
            'verificar-expansion-leonardo.js',
            'launch-leonardo-complete-system.js'
        ];

        // Patrones sospechosos
        this.suspiciousPatterns = [
            /Math\.random\(\)/gi,
            /Math\.random/g,
            /simulad[oa]/gi,
            /fake/gi,
            /mock/gi,
            /dummy/gi,
            /PURIFIED_REAL_DATA/gi,
            /testnet/gi
        ];
    }

    async verifySystem() {
        console.log('[🔍] INICIANDO VERIFICACIÓN DE SISTEMA LIMPIO...\n');

        try {
            // Verificar archivos críticos
            await this.verifyCriticalFiles();

            // Verificar archivos de configuración
            await this.verifyConfigFiles();

            // Generar reporte
            this.generateReport();

        } catch (error) {
            console.error('[❌] Error en verificación:', error.message);
        }
    }

    async verifyCriticalFiles() {
        console.log('[🎯] Verificando archivos críticos...\n');

        for (const file of this.criticalFiles) {
            await this.analyzeFile(file);
        }
    }

    async verifyConfigFiles() {
        console.log('[⚙️] Verificando archivos de configuración...\n');

        const configFiles = [
            'package.json',
            'quantum-config.json',
            '.env',
            '.binance-config.json'
        ];

        for (const file of configFiles) {
            if (fs.existsSync(file)) {
                await this.analyzeFile(file);
            } else {
                console.log(`  ⚠️ ${file} - NO EXISTE`);
            }
        }
    }

    async analyzeFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`  ❌ ${filePath} - NO EXISTE`);
                return;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            this.results.filesChecked++;
            this.results.totalLines += lines.length;

            let hasSuspiciousContent = false;
            let mathRandomCount = 0;
            let simulationCount = 0;

            // Verificar cada patrón sospechoso
            for (const pattern of this.suspiciousPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    if (pattern.source.includes('Math\\.random')) {
                        mathRandomCount += matches.length;
                    } else if (pattern.source.includes('simulad|fake|mock|dummy|PURIFIED_REAL_DATA|testnet')) {
                        simulationCount += matches.length;
                    }
                    hasSuspiciousContent = true;
                }
            }

            if (mathRandomCount > 0) {
                console.log(`  ❌ ${filePath} - ${mathRandomCount} usos de Math.random`);
                this.results.mathRandomFound.push({
                    file: filePath,
                    count: mathRandomCount,
                    lines: this.findLinesWithPattern(content, /Math\.random/g)
                });
            } else if (simulationCount > 0) {
                console.log(`  ⚠️ ${filePath} - ${simulationCount} elementos simulados`);
                this.results.simulationsFound.push({
                    file: filePath,
                    count: simulationCount,
                    lines: this.findLinesWithPattern(content, /(simulad|fake|mock|dummy|PURIFIED_REAL_DATA|testnet)/gi)
                });
            } else {
                console.log(`  ✅ ${filePath} - LIMPIO (${lines.length} líneas)`);
                this.results.cleanFiles++;
            }

        } catch (error) {
            console.log(`  💥 ${filePath} - ERROR: ${error.message}`);
            this.results.suspiciousFiles.push({
                file: filePath,
                error: error.message
            });
        }
    }

    findLinesWithPattern(content, pattern) {
        const lines = content.split('\n');
        const foundLines = [];

        lines.forEach((line, index) => {
            if (pattern.test(line)) {
                foundLines.push({
                    lineNumber: index + 1,
                    content: line.trim()
                });
            }
        });

        return foundLines;
    }

    generateReport() {
        console.log('\n[📊] GENERANDO REPORTE DE VERIFICACIÓN...\n');

        console.log('=== ESTADO DEL SISTEMA ===');
        console.log(`📁 Archivos verificados: ${this.results.filesChecked}`);
        console.log(`✅ Archivos limpios: ${this.results.cleanFiles}`);
        console.log(`⚠️ Archivos sospechosos: ${this.results.suspiciousFiles.length}`);
        console.log(`❌ Usos de Math.random: ${this.results.mathRandomFound.length}`);
        console.log(`🎭 Simulaciones encontradas: ${this.results.simulationsFound.length}`);
        console.log(`📝 Total líneas analizadas: ${this.results.totalLines.toLocaleString()}`);

        const cleanPercentage = ((this.results.cleanFiles / this.results.filesChecked) * 100).toFixed(1);
        console.log(`🧹 Porcentaje de limpieza: ${cleanPercentage}%`);

        console.log('');

        if (this.results.mathRandomFound.length === 0 && this.results.simulationsFound.length === 0) {
            console.log('🎉 ¡SISTEMA COMPLETAMENTE LIMPIO!');
            console.log('✅ No se encontraron usos de Math.random');
            console.log('✅ No se encontraron simulaciones');
            console.log('✅ Sistema listo para trading real');
        } else {
            console.log('⚠️ SISTEMA REQUIERE LIMPIEZA');

            if (this.results.mathRandomFound.length > 0) {
                console.log('\n❌ ARCHIVOS CON Math.random:');
                this.results.mathRandomFound.forEach(item => {
                    console.log(`  📄 ${item.file} (${item.count} usos)`);
                    item.lines.slice(0, 3).forEach(line => {
                        console.log(`    ${line.lineNumber}: ${line.content.substring(0, 80)}...`);
                    });
                });
            }

            if (this.results.simulationsFound.length > 0) {
                console.log('\n🎭 ARCHIVOS CON SIMULACIONES:');
                this.results.simulationsFound.forEach(item => {
                    console.log(`  📄 ${item.file} (${item.count} elementos)`);
                    item.lines.slice(0, 3).forEach(line => {
                        console.log(`    ${line.lineNumber}: ${line.content.substring(0, 80)}...`);
                    });
                });
            }
        }

        console.log('\n=== RECOMENDACIONES ===');
        if (this.results.mathRandomFound.length > 0) {
            console.log('🔧 Reemplazar Math.random con generadores cuánticos deterministas');
        }
        if (this.results.simulationsFound.length > 0) {
            console.log('🎯 Reemplazar datos simulados con datos reales de Binance');
        }
        if (this.results.mathRandomFound.length === 0 && this.results.simulationsFound.length === 0) {
            console.log('✅ Sistema listo para operaciones reales');
        }
    }
}

// Función principal
async function main() {
    console.log('🧹 VERIFICADOR DE SISTEMA LIMPIO - QBTC QUANTUM');
    console.log('================================================\n');

    const verifier = new SystemCleanerVerifier();
    await verifier.verifySystem();
}

// Ejecutar
main().catch(console.error);



