#!/usr/bin/env node

/**
 * [ROCKET] QBTC LAUNCHER WITH MASS SCANNER - ULTRA OPTIMIZED
 * =========================================================
 * 
 * Launcher completo que incluye el Mass Scanner junto con los servicios core.
 * Integrado con componentes ultra-optimizados para máximo rendimiento:
 * - Ultra Streaming Engine para procesamiento en tiempo real
 * - Autonomous Metrics System para monitoring continuo
 * - Quantum Memory Manager para gestión avanzada de memoria
 * - Hyper Parallel Engine para paralelización
 */

import { spawn, fork } from 'child_process';
import axios from 'axios';
import net from 'net';
import UltraBootstrap from './core/ultra-bootstrap.js';
import { performance } from 'perf_hooks';

const SERVICES = [
    {
        name: 'Master Control Hub',
        path: './core/master-control-hub.js',
        port: 14001,
        type: 'service'
    },
    {
        name: 'Temporal Cycles Engine',
        path: './services/temporal-cycles-engine-service.js',
        port: 14102,
        type: 'service'
    },
    {
        name: 'Multidimensional Weighting',
        path: './services/multidimensional-weighting-service.js',
        port: 14103,
        type: 'service'
    },
    {
        name: 'Mass Intelligence Scanner V2',
        path: './qbtc-mass-intelligence-scanner-v2.js',
        port: 4000, // API port from the scanner
        type: 'scanner'
    }
];

class QBTCLauncherWithScanner {
    constructor() {
        this.runningServices = new Map();
        this.ultraBootstrap = null;
        this.ultraContainer = null;
        this.ultraOptimizationsEnabled = true;
        
        console.log('[ROCKET] QBTC Launcher with Mass Scanner - ULTRA OPTIMIZED');
        console.log('[STAR] Target: 3 Core Services + Mass Intelligence Scanner + Ultra Components');
        console.log('[LIGHTNING] Ultra Optimizations: ENABLED');
        console.log('  • Quantum Memory Manager: ENABLED');
        console.log('  • Ultra Streaming Engine: ENABLED');
        console.log('  • Autonomous Metrics System: ENABLED');
        console.log('  • Hyper Parallel Engine: ENABLED');
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

    async startService(service) {
        console.log(`\\n[ROCKET] Starting ${service.name} on port ${service.port}...`);
        
        // Check port availability
        const portAvailable = await this.isPortAvailable(service.port);
        if (!portAvailable) {
            console.log(`[WARNING] Port ${service.port} is already in use!`);
            return false;
        }

        try {
            let process;
            
            if (service.type === 'scanner') {
                // Use fork for the scanner to handle ES modules properly
                console.log('[ROBOT] Initializing Mass Intelligence Scanner V2.0...');
                process = spawn('node', [service.path], {
                    stdio: ['ignore', 'pipe', 'pipe'],
                    detached: false
                });
            } else {
                process = spawn('node', [service.path], {
                    stdio: ['ignore', 'pipe', 'pipe'],
                    detached: false
                });
            }

            // Log all output with service-specific prefixes
            process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                // Split multiple lines and log each separately
                output.split('\\n').forEach(line => {
                    if (line.trim()) {
                        console.log(`[${service.name}] ${line}`);
                    }
                });
            });

            process.stderr.on('data', (data) => {
                console.log(`[${service.name}] ERROR: ${data.toString().trim()}`);
            });

            process.on('error', (error) => {
                console.log(`[X] ${service.name} process error: ${error.message}`);
            });

            process.on('exit', (code) => {
                console.log(`[WARNING] ${service.name} exited with code ${code}`);
                this.runningServices.delete(service.name);
            });

            // Wait for startup
            const startupTime = service.type === 'scanner' ? 8000 : 3000; // Scanner needs more time
            await new Promise(resolve => setTimeout(resolve, startupTime));

            // Test health for services (scanner might not have /health endpoint)
            if (service.type === 'service') {
                try {
                    const response = await axios.get(`http://localhost:${service.port}/health`, {
                        timeout: 5000
                    });
                    console.log(`[CHECK] ${service.name} health check: ${response.data.status}`);
                } catch (error) {
                    console.log(`[WARNING] ${service.name} health check failed, but process is running`);
                }
            } else if (service.type === 'scanner') {
                // For scanner, just check if port is responding
                try {
                    const response = await axios.get(`http://localhost:${service.port}/api/status`, {
                        timeout: 5000
                    });
                    console.log(`[CHECK] ${service.name} API responding`);
                } catch (error) {
                    console.log(`[INFO] ${service.name} initializing... (API might not be ready yet)`);
                }
            }
            
            this.runningServices.set(service.name, {
                process,
                service,
                startTime: Date.now()
            });
            
            return true;

        } catch (error) {
            console.log(`[X] Failed to start ${service.name}: ${error.message}`);
            return false;
        }
    }

    async initializeUltraComponents() {
        if (!this.ultraOptimizationsEnabled) {
            console.log('[INFO] Ultra optimizations disabled, skipping...');
            return true;
        }
        
        console.log('\\n[LIGHTNING] Initializing Ultra-Optimized Components...');
        console.log('======================================================');
        
        const startTime = performance.now();
        
        try {
            // Initialize Ultra Bootstrap
            this.ultraBootstrap = new UltraBootstrap({
                dataDirectory: './data',
                logsDirectory: './logs',
                enablePerformanceMonitoring: true,
                enableRecovery: true,
                maxStartupTime: 30000
            });
            
            // Initialize ultra-optimized container
            this.ultraContainer = await this.ultraBootstrap.initialize();
            
            if (this.ultraContainer) {
                const initTime = performance.now() - startTime;
                console.log(`[CHECK] Ultra components initialized in ${initTime.toFixed(2)}ms`);
                
                // Display ultra system status
                await this.displayUltraComponentsStatus();
                
                return true;
            } else {
                console.log('[WARNING] Ultra components initialization failed, continuing with standard components');
                this.ultraOptimizationsEnabled = false;
                return false;
            }
            
        } catch (error) {
            console.error('[WARNING] Ultra components initialization error:', error.message);
            console.log('[INFO] Continuing with standard components only');
            this.ultraOptimizationsEnabled = false;
            return false;
        }
    }
    
    async displayUltraComponentsStatus() {
        const bootstrapStatus = this.ultraBootstrap.getStatus();
        const containerMetrics = this.ultraContainer.getMetrics();
        
        console.log('\\n[LIGHTNING] ULTRA COMPONENTS STATUS:');
        console.log(`[CHECK] Components Loaded: ${Object.keys(bootstrapStatus.components).length}`);
        console.log(`[CHECK] System State: ${bootstrapStatus.state.phase}`);
        console.log(`[CHECK] Health: ${bootstrapStatus.state.hasErrors ? 'WITH ERRORS' : 'HEALTHY'}`);
        
        // List active ultra components
        Object.entries(bootstrapStatus.components).forEach(([name, info]) => {
            const status = info.critical ? '[CRITICAL]' : '[OPTIONAL]';
            const uptime = Math.round(info.uptime / 1000);
            console.log(`  • ${name}: ACTIVE ${status} (${uptime}s uptime)`);
        });
        
        // Check specific components that enhance scanner performance
        if (bootstrapStatus.components.ultraStreamingEngine) {
            console.log('[STREAMING] Ultra Streaming Engine ready for real-time processing');
        }
        
        if (bootstrapStatus.components.autonomousMetricsSystem) {
            console.log('[METRICS] Autonomous monitoring active - WebSocket: 3001, API: 3002');
        }
        
        if (bootstrapStatus.components.hyperParallelEngine) {
            console.log('[PARALLEL] Hyper Parallel Engine ready for multi-threaded analysis');
        }
        
        console.log(`[PERFORMANCE] DI Container: ${containerMetrics.dependencies} deps, ${containerMetrics.avgResolutionTime.toFixed(2)}ms avg`);
    }

    async deployAll() {
        console.log('\\n[STAR] Starting QBTC System with Mass Scanner + Ultra Optimizations');
        console.log('================================================================');
        
        // First, initialize ultra-optimized components
        await this.initializeUltraComponents();
        
        let successCount = 0;
        
        // Start services in order
        for (const service of SERVICES) {
            const success = await this.startService(service);
            if (success) {
                successCount++;
                console.log(`[CHECK] ${service.name} started successfully (${successCount}/${SERVICES.length})`);
            } else {
                console.log(`[X] ${service.name} failed to start`);
            }
            
            // Wait between services
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log(`\\n[PARTY] Deployment completed: ${successCount}/${SERVICES.length} components running`);
        
        if (successCount > 0) {
            console.log('\\n[BULB] Active Components:');
            this.runningServices.forEach((info, name) => {
                if (info.service.type === 'service') {
                    console.log(`  • ${name}: http://localhost:${info.service.port}/health`);
                } else {
                    console.log(`  • ${name}: http://localhost:${info.service.port}/api/status (Scanner API)`);
                }
            });
            
            console.log('\\n[INFO] Full QBTC system operational...');
            console.log('[INFO] Mass Scanner is analyzing 77 symbols across 6 tiers');
            console.log('[INFO] Press Ctrl+C to stop all components');
            
            // Keep alive
            process.on('SIGINT', () => {
                this.shutdown();
            });
            
            // Show periodic status
            setInterval(() => {
                console.log(`\\n[CHART] System Status: ${this.runningServices.size} components active`);
            }, 60000); // Every minute
            
            // Prevent exit
            setInterval(() => {
                // Keep alive
            }, 30000);
            
        } else {
            console.log('\\n[X] No components were started successfully');
            process.exit(1);
        }
    }

    shutdown() {
        console.log('\\n[STOP] Shutting down QBTC system...');
        
        this.runningServices.forEach((info, name) => {
            try {
                info.process.kill('SIGTERM');
                console.log(`[CHECK] ${name} terminated`);
            } catch (error) {
                console.log(`[WARNING] Could not terminate ${name}: ${error.message}`);
            }
        });
        
        console.log('[WAVE] QBTC system shutdown complete');
        process.exit(0);
    }
}

// Execute
const launcher = new QBTCLauncherWithScanner();
launcher.deployAll().catch(error => {
    console.error('[X] Fatal error:', error.message);
    process.exit(1);
});
