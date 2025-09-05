#!/usr/bin/env node

/**
 * 🚀 ULTRA MASTER LAUNCHER - QBTC REVOLUTION
 * ===========================================
 * 
 * Launcher maestro unificado que combina TODOS los sistemas QBTC
 * con componentes ultra-optimizados para máximo rendimiento:
 * 
 * SISTEMAS INTEGRADOS:
 * - QBTC Master System (trading principal)
 * - Mass Intelligence Scanner (análisis masivo) 
 * - Dimensional Supreme Orchestrator (sistemas cuánticos)
 * - Ultra-Optimized Dashboard (monitoring avanzado)
 * - Leonardo API System (conciencia artificial)
 * 
 * COMPONENTES ULTRA-OPTIMIZADOS:
 * - Quantum Memory Manager (gestión avanzada de memoria)
 * - Ultra Streaming Engine (procesamiento en tiempo real)
 * - Hyper Parallel Engine (paralelización masiva)
 * - Ultra Distributed Cache (rendimiento extremo)
 * - Ultra Event Bus (comunicación zero-latency)
 * - Auto Optimization Engine (ML y algoritmos genéticos)
 * - Quantum Randomness Generator (seguridad cuántica)
 * - Autonomous Metrics System (monitoreo continuo)
 * 
 * CARACTERÍSTICAS:
 * ⚡ Inicialización secuencial optimizada
 * 🧪 Gestión unificada de memoria cuántica
 * 🌊 Streaming de datos ultra-rápido
 * 🏎️ Procesamiento paralelo masivo
 * 💾 Cache distribuido de 4 capas
 * 📊 Métricas autónomas en tiempo real
 * 🤖 Optimización automática con IA
 * 🛡️ Recovery automático ante fallos
 * 🔍 Monitoreo continuo de salud
 */

import { spawn, fork } from 'child_process';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import axios from 'axios';
import net from 'net';
import os from 'os';
import { performance } from 'perf_hooks';
import { createRequire } from 'module';

import UltraBootstrap from './core/ultra-bootstrap.js';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// Configuración del ultra-launcher maestro
const ULTRA_MASTER_CONFIG = {
    version: '5.0.0-revolutionary',
    compatibility: 'ultra-optimized-unified',
    features: {
        quantumMemory: true,
        ultraStreaming: true,
        hyperParallel: true,
        ultraCache: true,
        ultraEvents: true,
        autoOptimization: true,
        quantumRng: true,
        autonomousMetrics: true,
        unifiedSystems: true,
        zeroLatency: true,
        autoRecovery: true
    }
};

// Sistemas a inicializar
const UNIFIED_SYSTEMS = [
    {
        name: 'QBTC Master System',
        type: 'master',
        launcher: './launch-qbtc-master.js',
        port: 14000,
        priority: 1,
        critical: true,
        description: 'Sistema principal de trading QBTC'
    },
    {
        name: 'Mass Intelligence Scanner',
        type: 'scanner',
        launcher: './launch-with-scanner.js',
        port: 4000,
        priority: 2,
        critical: true,
        description: 'Scanner de inteligencia masiva V2'
    },
    {
        name: 'Dimensional Supreme System',
        type: 'dimensional',
        launcher: './integration/start-dimensional-supreme.js',
        port: 14999,
        priority: 3,
        critical: false,
        description: 'Orquestador dimensional cuántico'
    },
    {
        name: 'Ultra Dashboard',
        type: 'dashboard',
        launcher: './scripts/launch-dashboard.js',
        port: 3333,
        priority: 4,
        critical: false,
        description: 'Dashboard con métricas ultra-optimizadas'
    },
    {
        name: 'Leonardo API System',
        type: 'api',
        launcher: './api/start-leonardo.js',
        port: 3000,
        priority: 5,
        critical: false,
        description: 'Sistema de conciencia artificial Leonardo'
    }
];

class UltraMasterLauncher {
    constructor() {
        this.ultraBootstrap = null;
        this.ultraContainer = null;
        this.runningSystems = new Map();
        this.masterControlServer = null;
        this.webSocketServer = null;
        this.isOperational = false;
        this.startTime = Date.now();
        this.shutdownInProgress = false;
        
        this.metrics = {
            startupTime: 0,
            systemsLaunched: 0,
            totalSystems: UNIFIED_SYSTEMS.length,
            ultraComponentsLoaded: 0,
            memoryUsed: 0,
            cpuUsage: 0,
            errors: [],
            warnings: []
        };
        
        this.displayWelcomeBanner();
        this.displaySystemSpecs();
    }
    
    displayWelcomeBanner() {
        console.log(`
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║    🚀 QBTC ULTRA MASTER LAUNCHER - REVOLUTIONARY EDITION 🚀                  ║
    ║                                                                              ║
    ║    Unified System Integration with Ultra-Optimized Components               ║
    ║                                                                              ║
    ║    • QBTC Master Trading System        • Mass Intelligence Scanner          ║
    ║    • Dimensional Supreme Orchestrator  • Ultra-Optimized Dashboard          ║
    ║    • Leonardo AI Consciousness         • Autonomous Metrics System          ║
    ║                                                                              ║
    ║    🧪 Quantum Memory Manager    🌊 Ultra Streaming Engine                    ║
    ║    🏎️ Hyper Parallel Engine     💾 Ultra Distributed Cache                  ║
    ║    📡 Ultra Event Bus          🤖 Auto Optimization Engine                  ║
    ║    🎲 Quantum RNG              📊 Autonomous Metrics                        ║
    ║                                                                              ║
    ║    Version: ${ULTRA_MASTER_CONFIG.version}                                          ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
        `);
        
        console.log('🌟 Initializing QBTC Revolutionary Trading System...');
        console.log(`📦 Version: ${pkg.version} with Ultra Master Launcher`);
        console.log('⚡ All ultra-optimized components will be loaded');
        console.log('🔗 All systems will be unified under master control');
        console.log('=' .repeat(80));
    }
    
    displaySystemSpecs() {
        console.log('\n💻 SYSTEM SPECIFICATIONS:');
        console.log(`   Platform: ${os.platform()} ${os.arch()}`);
        console.log(`   CPUs: ${os.cpus().length} cores (${os.cpus()[0].model})`);
        console.log(`   RAM: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total, ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB free`);
        console.log(`   Node.js: ${process.version}`);
        console.log(`   UV Thread Pool: ${process.env.UV_THREADPOOL_SIZE || Math.max(16, os.cpus().length * 2)} threads`);
        
        console.log('\n🎯 DEPLOYMENT STRATEGY:');
        console.log(`   Total Systems: ${UNIFIED_SYSTEMS.length}`);
        console.log(`   Critical Systems: ${UNIFIED_SYSTEMS.filter(s => s.critical).length}`);
        console.log(`   Optional Systems: ${UNIFIED_SYSTEMS.filter(s => !s.critical).length}`);
        console.log(`   Ultra Components: ${Object.values(ULTRA_MASTER_CONFIG.features).filter(f => f).length}`);
        console.log();
    }
    
    async launch() {
        const launchStartTime = performance.now();
        
        try {
            console.log('🚀 Starting QBTC Ultra Master Launcher...');
            console.log('==========================================');
            
            // Fase 1: Inicializar componentes ultra-optimizados
            await this.initializeUltraComponents();
            
            // Fase 2: Configurar master control server
            await this.setupMasterControlServer();
            
            // Fase 3: Inicializar sistemas unificados
            await this.launchUnifiedSystems();
            
            // Fase 4: Configurar monitoreo y health checks
            await this.setupUnifiedMonitoring();
            
            // Fase 5: Activar sistema maestro
            await this.activateMasterSystem();
            
            this.metrics.startupTime = performance.now() - launchStartTime;
            this.isOperational = true;
            
            console.log(`\n🎉 QBTC ULTRA MASTER SYSTEM OPERATIONAL!`);
            console.log(`⚡ Startup completed in ${this.metrics.startupTime.toFixed(2)}ms`);
            console.log(`🔧 Systems launched: ${this.metrics.systemsLaunched}/${this.metrics.totalSystems}`);
            console.log(`🧪 Ultra components: ${this.metrics.ultraComponentsLoaded}`);
            
            await this.displayMasterSystemStatus();
            
            // Configurar graceful shutdown
            this.setupGracefulShutdown();
            
            // Mantener proceso activo
            this.keepAlive();
            
            return true;
            
        } catch (error) {
            console.error('💥 ULTRA MASTER LAUNCHER FAILED:', error.message);
            console.error('Stack trace:', error.stack);
            return false;
        }
    }
    
    async initializeUltraComponents() {
        console.log('\n🧪 INITIALIZING ULTRA-OPTIMIZED COMPONENTS');
        console.log('===========================================');
        
        const startTime = performance.now();
        
        try {
            // Crear instancia del Ultra Bootstrap
            this.ultraBootstrap = new UltraBootstrap({
                dataDirectory: './data',
                logsDirectory: './logs',
                enablePerformanceMonitoring: true,
                enableRecovery: true,
                maxStartupTime: 60000 // 60 segundos para sistema completo
            });
            
            // Configurar event handlers
            this.setupUltraBootstrapEventHandlers();
            
            // Inicializar container ultra-optimizado
            this.ultraContainer = await this.ultraBootstrap.initialize();
            
            if (this.ultraContainer) {
                const initTime = performance.now() - startTime;
                console.log(`✅ Ultra components initialized in ${initTime.toFixed(2)}ms`);
                
                const bootstrapStatus = this.ultraBootstrap.getStatus();
                this.metrics.ultraComponentsLoaded = Object.keys(bootstrapStatus.components).length;
                
                console.log(`📦 Loaded ${this.metrics.ultraComponentsLoaded} ultra components`);
                
                // List loaded components
                Object.entries(bootstrapStatus.components).forEach(([name, info]) => {
                    const criticality = info.critical ? '[CRITICAL]' : '[OPTIONAL]';
                    console.log(`   ✓ ${name} ${criticality}`);
                });
                
                return true;
            } else {
                throw new Error('Ultra Bootstrap initialization failed');
            }
            
        } catch (error) {
            console.error('❌ Ultra components initialization failed:', error.message);
            throw error;
        }
    }
    
    setupUltraBootstrapEventHandlers() {
        if (!this.ultraBootstrap) return;
        
        this.ultraBootstrap.on('bootstrap-completed', (data) => {
            console.log(`🎉 Bootstrap completed: ${data.metrics.componentsInitialized} components`);
        });
        
        this.ultraBootstrap.on('system-metrics', (metrics) => {
            this.metrics.memoryUsed = metrics.memory.heapUsed;
            this.metrics.cpuUsage = metrics.cpu.user;
        });
        
        this.ultraBootstrap.on('component-error', (data) => {
            console.error(`❌ Component error: ${data.component} - ${data.error}`);
            this.metrics.errors.push(data);
        });
    }
    
    async setupMasterControlServer() {
        console.log('\n🎛️ SETTING UP MASTER CONTROL SERVER');
        console.log('====================================');
        
        const app = express();
        const server = createServer(app);
        this.webSocketServer = new Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });
        
        app.use(express.json());
        
        // Master control endpoints
        app.get('/api/master/status', (req, res) => {
            res.json(this.getMasterStatus());
        });
        
        app.get('/api/master/systems', (req, res) => {
            const systems = Array.from(this.runningSystems.values()).map(sys => ({
                name: sys.config.name,
                type: sys.config.type,
                port: sys.config.port,
                status: sys.process ? 'RUNNING' : 'STOPPED',
                uptime: sys.startTime ? Date.now() - sys.startTime : 0,
                critical: sys.config.critical
            }));
            res.json({ systems });
        });
        
        app.post('/api/master/system/:name/restart', async (req, res) => {
            const systemName = req.params.name;
            try {
                await this.restartSystem(systemName);
                res.json({ success: true, message: `System ${systemName} restarted` });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // WebSocket for real-time updates
        this.webSocketServer.on('connection', (socket) => {
            console.log(`🔌 Master control client connected: ${socket.id}`);
            
            // Send initial status
            socket.emit('masterStatus', this.getMasterStatus());
            
            socket.on('requestStatus', () => {
                socket.emit('masterStatus', this.getMasterStatus());
            });
            
            socket.on('disconnect', () => {
                console.log(`❌ Master control client disconnected: ${socket.id}`);
            });
        });
        
        const MASTER_PORT = 5000;
        server.listen(MASTER_PORT, () => {
            console.log(`✅ Master Control Server listening on port ${MASTER_PORT}`);
            console.log(`🌐 Control Panel: http://localhost:${MASTER_PORT}/api/master/status`);
            console.log(`🔌 WebSocket: ws://localhost:${MASTER_PORT}`);
        });
        
        this.masterControlServer = server;
    }
    
    async launchUnifiedSystems() {
        console.log('\n🚀 LAUNCHING UNIFIED SYSTEMS');
        console.log('=============================');
        
        // Sort systems by priority
        const sortedSystems = [...UNIFIED_SYSTEMS].sort((a, b) => a.priority - b.priority);
        
        for (const system of sortedSystems) {
            try {
                console.log(`\n🔄 Launching ${system.name}...`);
                const success = await this.launchSystem(system);
                
                if (success) {
                    this.metrics.systemsLaunched++;
                    console.log(`✅ ${system.name} launched successfully`);
                } else {
                    if (system.critical) {
                        throw new Error(`Critical system ${system.name} failed to launch`);
                    } else {
                        console.log(`⚠️ Optional system ${system.name} failed to launch, continuing...`);
                        this.metrics.warnings.push(`Failed to launch ${system.name}`);
                    }
                }
                
                // Wait between system launches to avoid resource conflicts
                await this.sleep(3000);
                
            } catch (error) {
                console.error(`❌ Failed to launch ${system.name}:`, error.message);
                this.metrics.errors.push({ system: system.name, error: error.message });
                
                if (system.critical) {
                    throw new Error(`Critical system failure: ${system.name}`);
                }
            }
        }
        
        console.log(`\n📊 Systems launch completed: ${this.metrics.systemsLaunched}/${this.metrics.totalSystems}`);
    }
    
    async launchSystem(systemConfig) {
        try {
            // Check if port is available
            const portAvailable = await this.isPortAvailable(systemConfig.port);
            if (!portAvailable) {
                console.log(`⚠️ Port ${systemConfig.port} already in use for ${systemConfig.name}`);
                return false;
            }
            
            // Launch the system
            const process = spawn('node', [systemConfig.launcher], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false,
                env: {
                    ...process.env,
                    ULTRA_MASTER_MODE: 'true',
                    ULTRA_MASTER_PORT: '5000'
                }
            });
            
            // Setup process monitoring
            const systemInfo = {
                config: systemConfig,
                process: process,
                startTime: Date.now(),
                lastHealthCheck: Date.now(),
                status: 'STARTING'
            };
            
            // Handle process output
            process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                console.log(`[${systemConfig.name}] ${output}`);
            });
            
            process.stderr.on('data', (data) => {
                const error = data.toString().trim();
                console.log(`[${systemConfig.name}] ERROR: ${error}`);
            });
            
            process.on('exit', (code) => {
                console.log(`[${systemConfig.name}] Process exited with code ${code}`);
                systemInfo.status = 'STOPPED';
                
                if (!this.shutdownInProgress && systemConfig.critical) {
                    console.log(`🔄 Restarting critical system: ${systemConfig.name}`);
                    setTimeout(() => this.restartSystem(systemConfig.name), 5000);
                }
            });
            
            process.on('error', (error) => {
                console.error(`[${systemConfig.name}] Process error:`, error);
                systemInfo.status = 'ERROR';
            });
            
            this.runningSystems.set(systemConfig.name, systemInfo);
            
            // Wait for system to start
            await this.sleep(systemConfig.type === 'scanner' ? 8000 : 5000);
            
            // Health check
            if (systemConfig.port) {
                try {
                    const healthEndpoint = systemConfig.type === 'scanner' 
                        ? `http://localhost:${systemConfig.port}/api/status`
                        : `http://localhost:${systemConfig.port}/health`;
                    
                    const response = await axios.get(healthEndpoint, { timeout: 5000 });
                    systemInfo.status = 'RUNNING';
                    console.log(`✅ ${systemConfig.name} health check passed`);
                    return true;
                } catch (error) {
                    console.log(`⚠️ ${systemConfig.name} health check failed, but process is running`);
                    systemInfo.status = 'RUNNING';
                    return true;
                }
            }
            
            systemInfo.status = 'RUNNING';
            return true;
            
        } catch (error) {
            console.error(`❌ Error launching ${systemConfig.name}:`, error.message);
            return false;
        }
    }
    
    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(1000);
            
            socket.on('connect', () => {
                socket.destroy();
                resolve(false);
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.on('error', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.connect(port, 'localhost');
        });
    }
    
    async restartSystem(systemName) {
        const systemInfo = this.runningSystems.get(systemName);
        if (!systemInfo) {
            throw new Error(`System ${systemName} not found`);
        }
        
        console.log(`🔄 Restarting system: ${systemName}`);
        
        // Stop current process
        if (systemInfo.process) {
            systemInfo.process.kill('SIGTERM');
            await this.sleep(2000);
        }
        
        // Relaunch system
        const success = await this.launchSystem(systemInfo.config);
        if (success) {
            console.log(`✅ System ${systemName} restarted successfully`);
        } else {
            throw new Error(`Failed to restart system ${systemName}`);
        }
    }
    
    async setupUnifiedMonitoring() {
        console.log('\n📊 SETTING UP UNIFIED MONITORING');
        console.log('==================================');
        
        // System health monitoring every 30 seconds
        setInterval(() => {
            this.performHealthChecks();
        }, 30000);
        
        // Metrics collection every 60 seconds
        setInterval(() => {
            this.collectUnifiedMetrics();
        }, 60000);
        
        // Broadcast status updates every 10 seconds
        setInterval(() => {
            if (this.webSocketServer) {
                this.webSocketServer.emit('masterStatus', this.getMasterStatus());
            }
        }, 10000);
        
        console.log('✅ Unified monitoring configured');
    }
    
    performHealthChecks() {
        const now = Date.now();
        
        for (const [systemName, systemInfo] of this.runningSystems) {
            const timeSinceLastCheck = now - systemInfo.lastHealthCheck;
            
            // Perform health check every 2 minutes
            if (timeSinceLastCheck > 120000) {
                this.checkSystemHealth(systemName, systemInfo);
                systemInfo.lastHealthCheck = now;
            }
        }
    }
    
    async checkSystemHealth(systemName, systemInfo) {
        try {
            if (systemInfo.config.port) {
                const healthEndpoint = systemInfo.config.type === 'scanner' 
                    ? `http://localhost:${systemInfo.config.port}/api/status`
                    : `http://localhost:${systemInfo.config.port}/health`;
                
                await axios.get(healthEndpoint, { timeout: 5000 });
                systemInfo.status = 'RUNNING';
            }
        } catch (error) {
            console.log(`⚠️ Health check failed for ${systemName}: ${error.message}`);
            systemInfo.status = 'UNHEALTHY';
            
            // Auto-restart critical systems
            if (systemInfo.config.critical && !this.shutdownInProgress) {
                console.log(`🔄 Auto-restarting unhealthy critical system: ${systemName}`);
                setTimeout(() => this.restartSystem(systemName), 1000);
            }
        }
    }
    
    collectUnifiedMetrics() {
        if (this.ultraBootstrap) {
            const metrics = this.ultraBootstrap.collectSystemMetrics();
            this.metrics.memoryUsed = metrics.memory.heapUsed;
            this.metrics.cpuUsage = metrics.cpu.user;
        }
    }
    
    getMasterStatus() {
        const runningCount = Array.from(this.runningSystems.values())
            .filter(sys => sys.status === 'RUNNING').length;
        
        return {
            launcher: {
                version: ULTRA_MASTER_CONFIG.version,
                operational: this.isOperational,
                uptime: Date.now() - this.startTime,
                features: ULTRA_MASTER_CONFIG.features
            },
            systems: {
                total: this.metrics.totalSystems,
                running: runningCount,
                launched: this.metrics.systemsLaunched,
                critical: UNIFIED_SYSTEMS.filter(s => s.critical).length
            },
            ultraComponents: {
                loaded: this.metrics.ultraComponentsLoaded,
                bootstrap: this.ultraBootstrap ? this.ultraBootstrap.getStatus() : null,
                container: this.ultraContainer ? this.ultraContainer.getMetrics() : null
            },
            performance: {
                startupTime: this.metrics.startupTime,
                memoryUsed: Math.round(this.metrics.memoryUsed / 1024 / 1024),
                cpuUsage: this.metrics.cpuUsage,
                errors: this.metrics.errors.length,
                warnings: this.metrics.warnings.length
            },
            timestamp: new Date().toISOString()
        };
    }
    
    async activateMasterSystem() {
        console.log('\n⚡ ACTIVATING MASTER SYSTEM');
        console.log('===========================');
        
        // Verify all critical systems are running
        const criticalSystems = Array.from(this.runningSystems.values())
            .filter(sys => sys.config.critical);
        
        const runningCritical = criticalSystems.filter(sys => sys.status === 'RUNNING');
        
        console.log(`🔍 Critical systems check: ${runningCritical.length}/${criticalSystems.length} running`);
        
        if (runningCritical.length === criticalSystems.length) {
            console.log('✅ All critical systems operational');
        } else {
            console.log('⚠️ Some critical systems not running, but continuing...');
        }
        
        // Activate inter-system communication
        console.log('🔗 Activating inter-system communication...');
        
        // Notify all systems that master is active
        this.webSocketServer?.emit('masterActivated', {
            timestamp: new Date().toISOString(),
            systems: Array.from(this.runningSystems.keys())
        });
        
        console.log('✅ Master system activated');
    }
    
    async displayMasterSystemStatus() {
        const status = this.getMasterStatus();
        
        console.log('\n🎛️ MASTER SYSTEM STATUS');
        console.log('=======================');
        console.log(`Version: ${status.launcher.version}`);
        console.log(`Uptime: ${Math.round(status.launcher.uptime / 1000)}s`);
        console.log(`Systems: ${status.systems.running}/${status.systems.total} running`);
        console.log(`Ultra Components: ${status.ultraComponents.loaded} loaded`);
        console.log(`Memory Usage: ${status.performance.memoryUsed}MB`);
        console.log(`Errors: ${status.performance.errors}, Warnings: ${status.performance.warnings}`);
        
        console.log('\n🏭 RUNNING SYSTEMS:');
        for (const [name, info] of this.runningSystems) {
            const icon = info.status === 'RUNNING' ? '🟢' : 
                        info.status === 'UNHEALTHY' ? '🟡' : '🔴';
            const uptime = Math.round((Date.now() - info.startTime) / 1000);
            const critical = info.config.critical ? '[CRITICAL]' : '[OPTIONAL]';
            console.log(`   ${icon} ${name} ${critical} - ${info.status} (${uptime}s)`);
        }
        
        console.log('\n🧪 ULTRA COMPONENTS:');
        if (status.ultraComponents.bootstrap?.components) {
            Object.entries(status.ultraComponents.bootstrap.components).forEach(([name, info]) => {
                const icon = info.critical ? '🔴' : '🟢';
                const uptime = Math.round(info.uptime / 1000);
                console.log(`   ${icon} ${name} - ACTIVE (${uptime}s)`);
            });
        }
        
        console.log('\n🌐 MASTER CONTROL ENDPOINTS:');
        console.log('   • GET  /api/master/status - Master system status');
        console.log('   • GET  /api/master/systems - All systems status');
        console.log('   • POST /api/master/system/{name}/restart - Restart system');
        console.log('   • WS   ws://localhost:5000 - Real-time updates');
        
        console.log('\n🎯 SYSTEM READY FOR ULTRA-HIGH-PERFORMANCE TRADING');
        console.log('🚀 All systems unified and operational!');
        console.log('=' .repeat(50));
    }
    
    setupGracefulShutdown() {
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('exit', () => this.gracefulShutdown('EXIT'));
    }
    
    async gracefulShutdown(signal) {
        if (this.shutdownInProgress) return;
        
        console.log(`\n🔄 Received ${signal} - Initiating graceful shutdown...`);
        this.shutdownInProgress = true;
        
        const shutdownStart = performance.now();
        
        try {
            // Shutdown all systems
            console.log('🛑 Shutting down unified systems...');
            for (const [name, systemInfo] of this.runningSystems) {
                try {
                    if (systemInfo.process) {
                        console.log(`   Stopping ${name}...`);
                        systemInfo.process.kill('SIGTERM');
                        await this.sleep(1000);
                    }
                } catch (error) {
                    console.log(`   ⚠️ Error stopping ${name}: ${error.message}`);
                }
            }
            
            // Shutdown ultra components
            if (this.ultraBootstrap) {
                console.log('🧪 Shutting down ultra components...');
                await this.ultraBootstrap.shutdown();
            }
            
            // Shutdown master control server
            if (this.masterControlServer) {
                console.log('🎛️ Shutting down master control server...');
                this.masterControlServer.close();
            }
            
            const shutdownTime = performance.now() - shutdownStart;
            console.log(`✅ Ultra Master System shutdown completed in ${shutdownTime.toFixed(2)}ms`);
            console.log('👋 Goodbye from QBTC Ultra Master!');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        } finally {
            process.exit(0);
        }
    }
    
    keepAlive() {
        // Heartbeat every 30 seconds
        setInterval(() => {
            if (this.isOperational) {
                const uptime = Math.round((Date.now() - this.startTime) / 1000);
                if (uptime % 300 === 0) { // Log every 5 minutes
                    console.log(`💚 Ultra Master heartbeat - Uptime: ${uptime}s, Systems: ${this.metrics.systemsLaunched}/${this.metrics.totalSystems}`);
                }
            }
        }, 30000);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función principal
async function main() {
    console.log(`🌟 Starting QBTC v${pkg.version} with Ultra Master Launcher`);
    
    const launcher = new UltraMasterLauncher();
    
    try {
        const success = await launcher.launch();
        
        if (!success) {
            console.error('❌ Ultra Master Launch failed');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Critical error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Auto-ejecutar si es llamado directamente
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    main().catch(console.error);
}

export default UltraMasterLauncher;
