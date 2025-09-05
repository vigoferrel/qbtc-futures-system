#!/usr/bin/env node

/**
 * QBTC ESSENTIAL SERVICES STARTUP SCRIPT
 * =====================================
 * Inicia los servicios básicos del sistema QBTC en orden de prioridad
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EssentialServicesStarter {
    constructor() {
        this.processes = new Map();
        this.startTime = new Date();
        this.services = [
            // Servicios básicos primero
            {
                name: 'Config Service',
                script: path.join(__dirname, 'core/config-service.js'),
                port: 14003,
                priority: 1,
                healthEndpoint: '/health'
            },
            {
                name: 'Message Bus',
                script: path.join(__dirname, 'core/message-bus.js'),
                port: 14002,
                priority: 2,
                healthEndpoint: '/health'
            },
            {
                name: 'Master Control Hub',
                script: path.join(__dirname, 'core/master-control-hub.js'),
                port: 14001,
                priority: 3,
                healthEndpoint: '/health'
            },
            {
                name: 'Data Ingestion Server',
                script: path.join(__dirname, 'analysis-engine/data-ingestion-server.js'),
                port: 14104,
                priority: 4,
                healthEndpoint: '/health'
            },
            {
                name: 'Dashboard Server',
                script: path.join(__dirname, 'scripts/launch-dashboard.js'),
                port: 14801,
                priority: 5,
                healthEndpoint: '/'
            }
        ];
    }
    
    async start() {
        console.log('🚀 Starting QBTC Essential Services...');
        console.log(`⏰ Start time: ${this.startTime.toISOString()}`);
        console.log('═'.repeat(60));
        
        // Ordenar servicios por prioridad
        this.services.sort((a, b) => a.priority - b.priority);
        
        for (const service of this.services) {
            await this.startService(service);
            await this.waitForService(service, 15000); // Wait 15 seconds max
            await this.sleep(2000); // Wait 2 seconds between services
        }
        
        console.log('═'.repeat(60));
        console.log('✅ Essential services startup completed!');
        await this.performHealthCheck();
        
        // Keep the script running
        console.log('\n📊 Monitoring services... (Press Ctrl+C to stop)');
        setInterval(async () => {
            await this.performHealthCheck();
        }, 30000); // Health check every 30 seconds
    }
    
    async startService(service) {
        console.log(`\n🔄 Starting ${service.name}...`);
        console.log(`   📁 Script: ${service.script}`);
        console.log(`   🔌 Port: ${service.port}`);
        
        try {
            const process = spawn('node', [service.script], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false,
                cwd: __dirname
            });
            
            this.processes.set(service.name, {
                process,
                service,
                startTime: new Date(),
                lastHealthCheck: null,
                status: 'starting'
            });
            
            process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`   [${service.name}] ${output}`);
                }
            });
            
            process.stderr.on('data', (data) => {
                const error = data.toString().trim();
                if (error) {
                    console.error(`   [${service.name}] ERROR: ${error}`);
                }
            });
            
            process.on('close', (code) => {
                console.log(`❌ [${service.name}] Process exited with code ${code}`);
                const procInfo = this.processes.get(service.name);
                if (procInfo) {
                    procInfo.status = 'stopped';
                }
            });
            
            process.on('error', (error) => {
                console.error(`❌ [${service.name}] Failed to start: ${error.message}`);
            });
            
            console.log(`✅ [${service.name}] Process started (PID: ${process.pid})`);
            
        } catch (error) {
            console.error(`❌ [${service.name}] Startup failed: ${error.message}`);
        }
    }
    
    async waitForService(service, timeoutMs = 15000) {
        console.log(`   ⏳ Waiting for ${service.name} to be ready...`);
        
        const startTime = Date.now();
        const checkInterval = 1000; // Check every 1 second
        
        while (Date.now() - startTime < timeoutMs) {
            try {
                const response = await axios.get(`http://localhost:${service.port}${service.healthEndpoint}`, {
                    timeout: 3000
                });
                
                if (response.status === 200) {
                    const procInfo = this.processes.get(service.name);
                    if (procInfo) {
                        procInfo.status = 'healthy';
                        procInfo.lastHealthCheck = new Date();
                    }
                    
                    console.log(`   ✅ [${service.name}] Service is healthy!`);
                    return true;
                }
            } catch (error) {
                // Service not ready yet, continue waiting
            }
            
            await this.sleep(checkInterval);
        }
        
        console.log(`   ⚠️  [${service.name}] Service did not become healthy within ${timeoutMs}ms`);
        return false;
    }
    
    async performHealthCheck() {
        console.log('\n🔍 Performing health check on all services...');
        
        let healthy = 0;
        let total = this.services.length;
        
        for (const service of this.services) {
            try {
                const response = await axios.get(`http://localhost:${service.port}${service.healthEndpoint}`, {
                    timeout: 3000
                });
                
                if (response.status === 200) {
                    console.log(`   ✅ [${service.name}] HEALTHY`);
                    healthy++;
                    
                    const procInfo = this.processes.get(service.name);
                    if (procInfo) {
                        procInfo.status = 'healthy';
                        procInfo.lastHealthCheck = new Date();
                    }
                } else {
                    console.log(`   ⚠️  [${service.name}] UNHEALTHY (Status: ${response.status})`);
                }
            } catch (error) {
                console.log(`   ❌ [${service.name}] DOWN (${error.message})`);
                
                const procInfo = this.processes.get(service.name);
                if (procInfo) {
                    procInfo.status = 'down';
                }
            }
        }
        
        const healthPercentage = ((healthy / total) * 100).toFixed(1);
        console.log(`\n📊 System Health: ${healthy}/${total} services healthy (${healthPercentage}%)`);
        
        if (healthy === total) {
            console.log('🎉 All services are healthy!');
        } else if (healthy >= total * 0.8) {
            console.log('⚠️  Most services are healthy, but some need attention');
        } else {
            console.log('🚨 Critical: Many services are down!');
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async stop() {
        console.log('\n🛑 Stopping all services...');
        
        for (const [name, procInfo] of this.processes) {
            try {
                if (procInfo.process && !procInfo.process.killed) {
                    console.log(`   🔄 Stopping ${name}...`);
                    procInfo.process.kill('SIGTERM');
                    
                    // Wait a bit for graceful shutdown
                    await this.sleep(2000);
                    
                    if (!procInfo.process.killed) {
                        console.log(`   ⚡ Force killing ${name}...`);
                        procInfo.process.kill('SIGKILL');
                    }
                    
                    console.log(`   ✅ ${name} stopped`);
                }
            } catch (error) {
                console.error(`   ❌ Error stopping ${name}: ${error.message}`);
            }
        }
        
        console.log('✅ All services stopped');
        process.exit(0);
    }
}

// Crear instancia y iniciar
const starter = new EssentialServicesStarter();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n📥 Received SIGINT, shutting down gracefully...');
    await starter.stop();
});

process.on('SIGTERM', async () => {
    console.log('\n📥 Received SIGTERM, shutting down gracefully...');
    await starter.stop();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the services
starter.start().catch(error => {
    console.error('💥 Failed to start essential services:', error);
    process.exit(1);
});
