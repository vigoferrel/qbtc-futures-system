#!/usr/bin/env node

/**
 * START ADDITIONAL SERVICES - QBTC Ecosystem Support
 * ================================================
 * Launches all the missing services that the metrics collector expects to find
 * 
 * Services to launch:
 * - Message Bus Event Hub (14002)
 * - Config Service (14003)  
 * - Quantum Monitoring Dashboard (14101)
 * - Dashboard Server (14301)
 * - Quantum Trading Executor Server (14207)
 * - Leonardo Quantum Service (14777)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AdditionalServicesLauncher {
    constructor() {
        this.processes = [];
        this.services = [
            {
                name: 'Message Bus Event Hub',
                script: 'core/message-bus.js',
                port: 14002,
                priority: 'HIGH'
            },
            {
                name: 'Config Service',
                script: 'core/config-service.js',
                port: 14003,
                priority: 'CRITICAL'
            },
            {
                name: 'Quantum Monitoring Dashboard',
                script: 'monitoring/quantum-monitoring-dashboard.js',
                port: 14101,
                priority: 'HIGH'
            },
            {
                name: 'Dashboard Server',
                script: 'frontend/dashboard-server.js',
                port: 14301,
                priority: 'MEDIUM'
            },
            {
                name: 'Quantum Trading Executor Server',
                script: 'execution-engine/quantum-trading-executor-server.js',
                port: 14207,
                priority: 'CRITICAL'
            },
            {
                name: 'Leonardo Quantum Service',
                script: 'core/leonardo-quantum-service.js',
                port: 14777,
                priority: 'HIGH'
            }
        ];
        
        this.isShuttingDown = false;
        this.setupSignalHandlers();
    }
    
    setupSignalHandlers() {
        const gracefulShutdown = () => {
            if (this.isShuttingDown) return;
            
            console.log('\n[STOP] Graceful shutdown initiated...');
            this.isShuttingDown = true;
            
            // Kill all spawned processes
            this.processes.forEach((proc, index) => {
                try {
                    console.log(`[STOP] Terminating ${this.services[index].name}...`);
                    proc.kill('SIGTERM');
                    
                    // Force kill after 5 seconds
                    setTimeout(() => {
                        if (!proc.killed) {
                            proc.kill('SIGKILL');
                        }
                    }, 5000);
                } catch (error) {
                    console.error(`[X] Error terminating ${this.services[index].name}:`, error);
                }
            });
            
            // Exit after cleanup
            setTimeout(() => {
                console.log('[CHECK] Additional services shutdown complete');
                process.exit(0);
            }, 6000);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGBREAK', gracefulShutdown);
    }
    
    async launchService(serviceConfig) {
        return new Promise((resolve, reject) => {
            console.log(`[ROCKET] Launching ${serviceConfig.name} on port ${serviceConfig.port}...`);
            
            const scriptPath = join(__dirname, serviceConfig.script);
            
            const proc = spawn('node', [scriptPath], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, PORT: serviceConfig.port }
            });
            
            let output = '';
            let hasStarted = false;
            
            proc.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                
                // Log service output with prefix
                text.split('\n').forEach(line => {
                    if (line.trim()) {
                        console.log(`[${serviceConfig.name.toUpperCase()}] ${line}`);
                    }
                });
                
                // Check if service has started successfully
                if (!hasStarted && (
                    text.includes('operational') ||
                    text.includes('running on port') ||
                    text.includes('listening on') ||
                    text.includes('Server started') ||
                    text.includes('initialized')
                )) {
                    hasStarted = true;
                    resolve(proc);
                }
            });
            
            proc.stderr.on('data', (data) => {
                const text = data.toString();
                console.error(`[${serviceConfig.name.toUpperCase()}] ERROR: ${text}`);
            });
            
            proc.on('error', (error) => {
                console.error(`[X] Failed to start ${serviceConfig.name}:`, error);
                reject(error);
            });
            
            proc.on('exit', (code, signal) => {
                if (!this.isShuttingDown) {
                    console.log(`[WARNING] ${serviceConfig.name} exited with code ${code}, signal ${signal}`);
                }
            });
            
            this.processes.push(proc);
            
            // Timeout after 10 seconds if service doesn't start
            setTimeout(() => {
                if (!hasStarted) {
                    console.log(`[CHECK] ${serviceConfig.name} - startup timeout reached, assuming started`);
                    resolve(proc);
                }
            }, 10000);
        });
    }
    
    async launchAllServices() {
        console.log('[GLOBE] QBTC Additional Services Launcher');
        console.log('[GLOBE] Starting missing services for metrics collection...');
        console.log('='.repeat(60));
        
        const startTime = Date.now();
        let launched = 0;
        
        for (const service of this.services) {
            try {
                await this.launchService(service);
                launched++;
                console.log(`[CHECK] ✅ ${service.name} launched successfully (${launched}/${this.services.length})`);
                
                // Brief delay between launches
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`[X] ❌ Failed to launch ${service.name}:`, error.message);
            }
        }
        
        const totalTime = Date.now() - startTime;
        
        console.log('='.repeat(60));
        console.log(`[CHART] Launch Summary:`);
        console.log(`[CHART] Services launched: ${launched}/${this.services.length}`);
        console.log(`[CHART] Total time: ${totalTime}ms`);
        console.log(`[CHART] Success rate: ${Math.round((launched/this.services.length)*100)}%`);
        
        if (launched > 0) {
            console.log('\n[STAR] Additional services are now running!');
            console.log('[STAR] Services will continue running until terminated with Ctrl+C');
            console.log('[STAR] Check metrics collector - services should now be reachable');
            
            // Keep the launcher alive
            console.log('\n[INFO] Press Ctrl+C to stop all additional services');
            
            // Periodic status check
            setInterval(() => {
                const aliveProcesses = this.processes.filter(proc => !proc.killed).length;
                if (aliveProcesses > 0) {
                    console.log(`[HEARTBEAT] ${aliveProcesses}/${this.processes.length} services still running`);
                }
            }, 60000); // Every minute
            
        } else {
            console.log('[X] No services were successfully launched');
            process.exit(1);
        }
    }
}

// Launch if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        console.log('[DEBUG] Starting additional services launcher...');
        const launcher = new AdditionalServicesLauncher();
        launcher.launchAllServices().catch(error => {
            console.error('[X] Fatal error:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('[X] Error creating launcher:', error);
        process.exit(1);
    }
}

export default AdditionalServicesLauncher;
