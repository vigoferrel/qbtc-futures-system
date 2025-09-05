#!/usr/bin/env node

/**
 * [GALAXY] DIMENSIONAL SUPREME LAUNCHER - ULTRA OPTIMIZED
 * ======================================================
 * Script maestro para iniciar el sistema dimensional supremo QBTC
 * que integra TODOS los engines en una orquestación unificada
 * 
 * INTEGRACIÓN ULTRA-OPTIMIZADA:
 * - Quantum Memory Manager para gestión avanzada de memoria
 * - Ultra Streaming Engine para procesamiento en tiempo real
 * - Hyper Parallel Engine para paralelización masiva
 * - Ultra Distributed Cache para rendimiento extremo
 * - Autonomous Metrics System para monitoreo continuo
 * - Auto Optimization Engine con Machine Learning
 * - Ultra Event Bus para comunicación zero-latency
 */

import DimensionalIntelligenceOrchestrator from './dimensional-intelligence-orchestrator.js';
import UltraBootstrap from '../core/ultra-bootstrap.js';
import { performance } from 'perf_hooks';

console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║      [GALAXY] QBTC DIMENSIONAL INTELLIGENCE ORCHESTRATOR [GALAXY]        ║
    ║                     SUPREME EDITION                          ║
    ║                                                              ║
    ║  Integración completa de sistemas cuánticos dimensionales    ║
    ║                                                              ║
    ║  • Core Metrics Engine (5 métricas unificadas)              ║
    ║  • Merkaba Trading Protocol (9 dimensiones)                 ║
    ║  • Harmonic Triangular Engine (arbitraje)                   ║
    ║  • Quantum Leverage Entropy Engine (125x)                   ║
    ║  • Sistema Hermético y Akásico                              ║
    ║  • Feynman Path Integral Engine                             ║
    ║  • Leonardo Consciousness System                            ║
    ║                                                              ║
    ║  [TARGET] Puerto Maestro: 14999                                   ║
    ║  [GLOBE] Dashboard: 14998                                        ║
    ║  [LIGHTNING] Estado: INICIANDO...                                   ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
`);

async function initializeUltraOptimizedComponents() {
    console.log('\n[LIGHTNING] Inicializando Componentes Ultra-Optimizados...');
    console.log('=========================================================');
    
    const startTime = performance.now();
    let ultraBootstrap = null;
    let ultraContainer = null;
    
    try {
        // Initialize Ultra Bootstrap with optimized settings
        ultraBootstrap = new UltraBootstrap({
            dataDirectory: './data',
            logsDirectory: './logs',
            enablePerformanceMonitoring: true,
            enableRecovery: true,
            maxStartupTime: 45000 // 45 seconds for complex dimensional systems
        });
        
        // Initialize ultra-optimized container
        ultraContainer = await ultraBootstrap.initialize();
        
        if (ultraContainer) {
            const initTime = performance.now() - startTime;
            console.log(`[CHECK] Componentes ultra-optimizados inicializados en ${initTime.toFixed(2)}ms`);
            
            // Display ultra components status
            const bootstrapStatus = ultraBootstrap.getStatus();
            const containerMetrics = ultraContainer.getMetrics();
            
            console.log('\n[LIGHTNING] ULTRA COMPONENTS STATUS:');
            console.log(`[CHECK] Componentes Cargados: ${Object.keys(bootstrapStatus.components).length}`);
            console.log(`[CHECK] Estado del Sistema: ${bootstrapStatus.state.phase}`);
            console.log(`[CHECK] Salud: ${bootstrapStatus.state.hasErrors ? 'CON ERRORES' : 'SALUDABLE'}`);
            
            // List critical components
            Object.entries(bootstrapStatus.components).forEach(([name, info]) => {
                const criticality = info.critical ? '[CRÍTICO]' : '[OPCIONAL]';
                const uptime = Math.round(info.uptime / 1000);
                console.log(`  • ${name}: ACTIVO ${criticality} (${uptime}s uptime)`);
            });
            
            // Show enhancement for dimensional processing
            if (bootstrapStatus.components.hyperParallelEngine) {
                console.log('[PARALLEL] Hyper Parallel Engine ready for dimensional computations');
            }
            
            if (bootstrapStatus.components.ultraDistributedCache) {
                console.log('[CACHE] Ultra Distributed Cache ready for dimensional data');
            }
            
            if (bootstrapStatus.components.autonomousMetricsSystem) {
                console.log('[METRICS] Autonomous monitoring active for dimensional systems');
            }
            
            console.log(`[PERFORMANCE] DI Container: ${containerMetrics.dependencies} deps, ${containerMetrics.avgResolutionTime.toFixed(2)}ms promedio`);
            
            return { ultraBootstrap, ultraContainer };
        } else {
            console.log('[WARNING] Componentes ultra-optimizados fallaron, continuando con sistema estándar');
            return null;
        }
        
    } catch (error) {
        console.error('[WARNING] Error inicializando componentes ultra-optimizados:', error.message);
        console.log('[INFO] Continuando solo con sistema dimensional estándar');
        return null;
    }
}

async function startDimensionalSupremeSystem() {
    console.log('[GALAXY] Iniciando Sistema Dimensional Supremo Ultra-Optimizado...');
    console.log('==================================================================');
    
    // First, initialize ultra-optimized components
    const ultraComponents = await initializeUltraOptimizedComponents();
    
    const orchestrator = new DimensionalIntelligenceOrchestrator();
    
    try {
        console.log('\n[REFRESH] Inicializando Orquestador Dimensional Supremo...');
        
        // If ultra components are available, pass them to the orchestrator
        if (ultraComponents) {
            console.log('[ULTRA] Inyectando componentes ultra-optimizados en el orquestador...');
            // The orchestrator can use ultra components for enhanced performance
            orchestrator.setUltraComponents(ultraComponents);
        }
        
        await orchestrator.start();
        
        console.log('\n[PARTY] SISTEMA DIMENSIONAL SUPREMO ACTIVO');
        console.log('============================================');
        console.log(`[GLOBE] Control Center: http://localhost:14999`);
        console.log(`[CHART] Dashboard: http://localhost:14998`);
        console.log(`[LIGHTNING] WebSocket: ws://localhost:14999`);
        console.log('============================================');
        
        // Endpoints principales
        console.log('\n📌 ENDPOINTS PRINCIPALES:');
        console.log('• POST /api/supreme/initialize-all - Inicializar todo el sistema');
        console.log('• GET  /api/supreme/status-complete - Estado completo');
        console.log('• GET  /api/supreme/intelligence - Inteligencia suprema');
        console.log('• POST /api/supreme/big-bang-activation - Activación Big Bang');
        console.log('• POST /api/core-metrics/start - Iniciar métricas core');
        console.log('• GET  /api/core-metrics/status - Estado métricas core');
        
        console.log('\n[TARGET] El sistema está listo para operar.');
        console.log('[GALAXY] Nivel de acceso dimensional inicial: 3D');
        console.log('[BRAIN] Core Metrics Engine integrado y listo');
        console.log('[LIGHTNING] Quantum entanglement activado');
        
        // Graceful shutdown handlers
        process.on('SIGINT', async () => {
            console.log('\n[WARNING]  Recibida señal de interrupción...');
            console.log('[STOP] Deteniendo Orquestador Dimensional Supremo...');
            await orchestrator.stop();
            console.log('[CHECK] Sistema detenido correctamente');
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n[WARNING]  Recibida señal de terminación...');
            console.log('[STOP] Deteniendo Orquestador Dimensional Supremo...');
            await orchestrator.stop();
            console.log('[CHECK] Sistema detenido correctamente');
            process.exit(0);
        });
        
        // Mantener el proceso activo
        process.on('uncaughtException', async (error) => {
            console.error('[X] Error crítico no capturado:', error);
            console.log('[STOP] Deteniendo sistema por seguridad...');
            await orchestrator.stop();
            process.exit(1);
        });
        
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('[X] Promesa rechazada no manejada:', reason);
            console.log('[STOP] Deteniendo sistema por seguridad...');
            await orchestrator.stop();
            process.exit(1);
        });
        
    } catch (error) {
        console.error('\n[X] ERROR CRÍTICO AL INICIAR EL SISTEMA:');
        console.error(error);
        console.log('\n[BULB] Verificar:');
        console.log('  - Puertos 14999 y 14998 disponibles');
        console.log('  - Dependencias instaladas correctamente');
        console.log('  - Archivos de sistema presentes');
        process.exit(1);
    }
}

// Ejecutar el launcher
startDimensionalSupremeSystem();
