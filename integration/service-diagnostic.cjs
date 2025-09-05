#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO DETALLADO DE SERVICIOS QBTC
 * ==========================================
 * Analiza servicios que no se inician correctamente
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SYSTEM_BASE_PATH = 'C:\\Users\\DELL\\Desktop\\qbtc-futures-system';

// Servicios problemáticos identificados
const PROBLEMATIC_SERVICES = [
    {
        name: 'quantum-analysis-server',
        path: 'analysis-engine/quantum-analysis-server.js',
        port: 14103,
        expectedIssues: ['Missing class dependencies', 'Import errors']
    },
    {
        name: 'position-manager',
        path: 'execution-engine/position-manager.js', 
        port: 14202,
        expectedIssues: ['Async initialization not called', 'Missing server start']
    },
    {
        name: 'exchange-gateway',
        path: 'execution-engine/exchange-gateway.js',
        port: 14204,
        expectedIssues: ['API credentials check', 'Async initialization not called']
    },
    {
        name: 'portfolio-rebalancer',
        path: 'execution-engine/portfolio-rebalancer.js',
        port: 14203,
        expectedIssues: ['Async initialization not called', 'Missing server start']
    },
    {
        name: 'orderbook-manager',
        path: 'execution-engine/orderbook-manager.js',
        port: 14206,
        expectedIssues: ['Async initialization not called', 'Missing server start']
    },
    {
        name: 'quantum-trading-executor',
        path: 'execution-engine/quantum-trading-executor.js',
        port: 14207,
        expectedIssues: ['Async initialization not called', 'Missing server start']
    }
];

class ServiceDiagnostic {
    constructor() {
        this.results = new Map();
    }
    
    async diagnoseAll() {
        console.log('🔍 DIAGNÓSTICO DETALLADO DE SERVICIOS PROBLEMÁTICOS');
        console.log('='.repeat(60));
        
        for (const service of PROBLEMATIC_SERVICES) {
            await this.diagnoseService(service);
        }
        
        this.generateReport();
    }
    
    async diagnoseService(service) {
        console.log(`\n📋 Analizando: ${service.name}`);
        console.log('-'.repeat(40));
        
        const servicePath = path.join(SYSTEM_BASE_PATH, service.path);
        const diagnosis = {
            name: service.name,
            path: service.path,
            port: service.port,
            fileExists: false,
            syntaxValid: false,
            hasServerStart: false,
            hasAsyncInit: false,
            hasHealthEndpoint: false,
            missingDependencies: [],
            errors: [],
            recommendations: []
        };
        
        // 1. Verificar que el archivo existe
        if (!fs.existsSync(servicePath)) {
            diagnosis.errors.push('File does not exist');
            console.log('❌ Archivo no existe');
            this.results.set(service.name, diagnosis);
            return;
        }
        
        diagnosis.fileExists = true;
        console.log('✅ Archivo existe');
        
        // 2. Leer y analizar el contenido
        try {
            const content = fs.readFileSync(servicePath, 'utf8');
            
            // 3. Verificar sintaxis básica
            if (content.includes('import') && content.includes('express')) {
                diagnosis.syntaxValid = true;
                console.log('✅ Sintaxis básica válida');
            } else {
                diagnosis.errors.push('Invalid basic syntax');
                console.log('❌ Sintaxis básica inválida');
            }
            
            // 4. Verificar si tiene server.listen o app.listen
            if (content.includes('.listen(')) {
                diagnosis.hasServerStart = true;
                console.log('✅ Tiene inicialización de servidor');
            } else {
                diagnosis.errors.push('Missing server initialization');
                console.log('❌ Falta inicialización de servidor');
                diagnosis.recommendations.push('Add server.listen() or app.listen()');
            }
            
            // 5. Verificar si tiene método initialize() async
            if (content.includes('async initialize()') || content.includes('async init()')) {
                diagnosis.hasAsyncInit = true;
                console.log('✅ Tiene método de inicialización async');
                
                // Verificar si se llama
                if (!content.includes('.initialize()') && !content.includes('.init()')) {
                    diagnosis.errors.push('Async initialization method not called');
                    console.log('⚠️ Método de inicialización no se llama');
                    diagnosis.recommendations.push('Call initialize() method after class instantiation');
                }
            } else {
                diagnosis.errors.push('Missing async initialization');
                console.log('❌ Falta método de inicialización async');
            }
            
            // 6. Verificar endpoint de health
            if (content.includes('/health')) {
                diagnosis.hasHealthEndpoint = true;
                console.log('✅ Tiene endpoint de health');
            } else {
                diagnosis.errors.push('Missing health endpoint');
                console.log('❌ Falta endpoint de health');
                diagnosis.recommendations.push('Add GET /health endpoint');
            }
            
            // 7. Buscar clases no definidas
            const classMatches = content.match(/new\s+([A-Z][a-zA-Z0-9]*)/g);
            if (classMatches) {
                const definedClasses = content.match(/class\s+([A-Z][a-zA-Z0-9]*)/g) || [];
                const importedClasses = content.match(/import\s*\{[^}]*([A-Z][a-zA-Z0-9]*)[^}]*\}/g) || [];
                
                classMatches.forEach(match => {
                    const className = match.replace('new ', '');
                    const isDefined = definedClasses.some(def => def.includes(className));
                    const isImported = importedClasses.some(imp => imp.includes(className)) || 
                                     content.includes(`import ${className}`);
                    
                    if (!isDefined && !isImported && !['Map', 'Set', 'Date', 'EventEmitter', 'WebSocketServer'].includes(className)) {
                        diagnosis.missingDependencies.push(className);
                    }
                });
            }
            
            if (diagnosis.missingDependencies.length > 0) {
                console.log(`⚠️ Dependencias faltantes: ${diagnosis.missingDependencies.join(', ')}`);
                diagnosis.recommendations.push('Define or import missing classes: ' + diagnosis.missingDependencies.join(', '));
            }
            
            // 8. Verificar imports problemáticos
            const imports = content.match(/import\s+.*?from\s+['"][^'"]*['"]/g) || [];
            imports.forEach(imp => {
                const modulePath = imp.match(/from\s+['"]([^'"]*)['"]/)[1];
                if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
                    const fullPath = path.resolve(path.dirname(servicePath), modulePath);
                    if (!fs.existsSync(fullPath) && !fs.existsSync(fullPath + '.js')) {
                        diagnosis.errors.push(`Missing import: ${modulePath}`);
                        console.log(`❌ Import faltante: ${modulePath}`);
                    }
                }
            });
            
        } catch (error) {
            diagnosis.errors.push(`File read error: ${error.message}`);
            console.log(`❌ Error leyendo archivo: ${error.message}`);
        }
        
        this.results.set(service.name, diagnosis);
    }
    
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE CONSOLIDADO DE DIAGNÓSTICO');
        console.log('='.repeat(60));
        
        let totalServices = this.results.size;
        let servicesWithErrors = 0;
        let totalErrors = 0;
        
        console.log('\n🔍 RESUMEN POR SERVICIO:');
        for (const [name, diagnosis] of this.results) {
            if (diagnosis.errors.length > 0) {
                servicesWithErrors++;
                totalErrors += diagnosis.errors.length;
            }
            
            console.log(`\n📋 ${name}:`);
            console.log(`   Puerto: ${diagnosis.port}`);
            console.log(`   Errores: ${diagnosis.errors.length}`);
            console.log(`   Servidor: ${diagnosis.hasServerStart ? '✅' : '❌'}`);
            console.log(`   Inicialización: ${diagnosis.hasAsyncInit ? '✅' : '❌'}`);
            console.log(`   Health endpoint: ${diagnosis.hasHealthEndpoint ? '✅' : '❌'}`);
            
            if (diagnosis.errors.length > 0) {
                console.log(`   🔴 Errores:`);
                diagnosis.errors.forEach(error => {
                    console.log(`      - ${error}`);
                });
            }
            
            if (diagnosis.recommendations.length > 0) {
                console.log(`   💡 Recomendaciones:`);
                diagnosis.recommendations.forEach(rec => {
                    console.log(`      - ${rec}`);
                });
            }
        }
        
        console.log('\n📈 ESTADÍSTICAS FINALES:');
        console.log(`   📊 Total servicios analizados: ${totalServices}`);
        console.log(`   🔴 Servicios con errores: ${servicesWithErrors}`);
        console.log(`   ⚠️ Total errores encontrados: ${totalErrors}`);
        console.log(`   📈 Tasa de éxito: ${((totalServices - servicesWithErrors) / totalServices * 100).toFixed(1)}%`);
        
        console.log('\n🛠️ ACCIONES RECOMENDADAS:');
        console.log('1. Corregir inicializaciones de servidor faltantes');
        console.log('2. Agregar llamadas a métodos initialize()');
        console.log('3. Resolver dependencias de clases faltantes');
        console.log('4. Agregar endpoints de health faltantes');
        console.log('5. Verificar y corregir imports problemáticos');
    }
}

// Ejecutar diagnóstico
if (require.main === module) {
    const diagnostic = new ServiceDiagnostic();
    diagnostic.diagnoseAll().catch(error => {
        console.error('❌ Error en diagnóstico:', error);
        process.exit(1);
    });
}

module.exports = ServiceDiagnostic;
