#!/usr/bin/env node

/**
 * 🔍 ANÁLISIS DE DUPLICACIONES - MASTER CONTROL HUB
 * ================================================
 * Script para detectar duplicaciones y conflictos en la configuración
 */

const fs = require('fs');
const path = require('path');

const MASTER_CONTROL_HUB_PATH = 'C:\\Users\\DELL\\Desktop\\qbtc-futures-system\\core\\master-control-hub.js';

function analyzeDuplicates() {
    console.log('🔍 ANÁLISIS DE DUPLICACIONES EN MASTER CONTROL HUB');
    console.log('='.repeat(60));

    try {
        const content = fs.readFileSync(MASTER_CONTROL_HUB_PATH, 'utf8');
        
        // Extraer servicios usando regex más seguro
        const serviceRegex = /\['([^']+)',\s*\{\s*port:\s*([^,]+),\s*status:\s*'([^']+)',\s*priority:\s*'([^']+)',\s*category:\s*'([^']+)'\s*\}\]/g;
        const services = [];
        let match;
        
        while ((match = serviceRegex.exec(content)) !== null) {
            services.push({
                name: match[1],
                port: match[2] === 'null' ? null : parseInt(match[2]),
                status: match[3],
                priority: match[4],
                category: match[5]
            });
        }

        console.log('\n📈 ESTADÍSTICAS GENERALES:');
        console.log(`📝 Total de servicios: ${services.length}`);

        // Análisis de duplicaciones por nombre
        const nameCount = {};
        services.forEach(service => {
            nameCount[service.name] = (nameCount[service.name] || 0) + 1;
        });

        const duplicates = Object.entries(nameCount).filter(([name, count]) => count > 1);
        
        console.log(`🔄 Servicios únicos: ${Object.keys(nameCount).length}`);
        console.log(`⚠️ Duplicaciones detectadas: ${duplicates.length}`);

        if (duplicates.length > 0) {
            console.log('\n🚨 SERVICIOS DUPLICADOS:');
            duplicates.forEach(([name, count]) => {
                console.log(`  - ${name}: ${count} instancias`);
                const instances = services.filter(s => s.name === name);
                instances.forEach((instance, idx) => {
                    console.log(`    ${idx + 1}. Puerto: ${instance.port}, Categoría: ${instance.category}`);
                });
            });
        }

        // Análisis de conflictos de puerto
        const portMap = {};
        services.forEach(service => {
            if (service.port !== null) {
                if (!portMap[service.port]) {
                    portMap[service.port] = [];
                }
                portMap[service.port].push(service.name);
            }
        });

        const portConflicts = Object.entries(portMap).filter(([port, names]) => names.length > 1);
        
        console.log(`\n🔌 CONFLICTOS DE PUERTO: ${portConflicts.length}`);
        
        if (portConflicts.length > 0) {
            console.log('\n⚠️ PUERTOS COMPARTIDOS:');
            portConflicts.forEach(([port, names]) => {
                console.log(`  Puerto ${port}: ${names.join(', ')}`);
            });
        }

        // Distribución por categoría
        const categoryCount = {};
        services.forEach(service => {
            categoryCount[service.category] = (categoryCount[service.category] || 0) + 1;
        });

        console.log('\n📊 DISTRIBUCIÓN POR CATEGORÍA:');
        Object.keys(categoryCount).sort().forEach(category => {
            console.log(`  ${category}: ${categoryCount[category]} servicios`);
        });

        // Distribución por prioridad
        const priorityCount = {};
        services.forEach(service => {
            priorityCount[service.priority] = (priorityCount[service.priority] || 0) + 1;
        });

        console.log('\n⚖️ DISTRIBUCIÓN POR PRIORIDAD:');
        const priorityOrder = ['MAXIMUM', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        priorityOrder.forEach(priority => {
            if (priorityCount[priority]) {
                console.log(`  ${priority}: ${priorityCount[priority]} servicios`);
            }
        });

        // Servicios con y sin puerto
        const withPort = services.filter(s => s.port !== null).length;
        const withoutPort = services.filter(s => s.port === null).length;

        console.log('\n🌐 SERVICIOS POR TIPO:');
        console.log(`  Con puerto HTTP: ${withPort}`);
        console.log(`  Sin puerto (Engines/Scripts): ${withoutPort}`);

        // Recomendaciones
        console.log('\n💡 RECOMENDACIONES:');
        if (duplicates.length > 0) {
            console.log('  ⚠️ Eliminar servicios duplicados para evitar confusión');
        }
        if (portConflicts.length > 0) {
            console.log('  ⚠️ Resolver conflictos de puerto asignando puertos únicos');
        }
        if (duplicates.length === 0 && portConflicts.length === 0) {
            console.log('  ✅ No se detectaron duplicaciones ni conflictos');
        }

        return {
            totalServices: services.length,
            uniqueServices: Object.keys(nameCount).length,
            duplicates: duplicates.length,
            portConflicts: portConflicts.length,
            categories: categoryCount,
            priorities: priorityCount
        };

    } catch (error) {
        console.error('❌ Error al analizar el archivo:', error.message);
        return null;
    }
}

// Ejecutar análisis
if (require.main === module) {
    analyzeDuplicates();
}

module.exports = analyzeDuplicates;
