#!/usr/bin/env node

/**
 * [ROCKET] SIMPLE QBTC DEPLOYER - DIAGNOSTIC VERSION
 * =================================================
 * 
 * Launcher simplificado para diagnóstico y control manual del ecosistema QBTC.
 * Permite iniciar servicios uno por uno y ver exactamente qué está pasando.
 */

import { spawn } from 'child_process';
import axios from 'axios';
import net from 'net';

const SERVICES = [
    {
        name: 'Master Control Hub',
        path: './core/master-control-hub.js',
        port: 14001
    },
    {
        name: 'Temporal Cycles Engine',
        path: './services/temporal-cycles-engine-service.js',
        port: 14102
    },
    {
        name: 'Multidimensional Weighting',
        path: './services/multidimensional-weighting-service.js',
        port: 14103
    }
];

class SimpleDeploy {
    constructor() {
        this.runningServices = new Map();
        console.log('[ROCKET] Simple QBTC Deployer initialized');
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
        console.log(`[ROCKET] Starting ${service.name} on port ${service.port}...`);
        
        // Check port availability
        const portAvailable = await this.isPortAvailable(service.port);
        if (!portAvailable) {
            console.log(`[WARNING] Port ${service.port} is already in use!`);
            return false;
        }

        try {
            const process = spawn('node', [service.path], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false
            });

            // Log all output
            process.stdout.on('data', (data) => {
                console.log(`[${service.name}] ${data.toString().trim()}`);
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
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Test health
            try {
                const response = await axios.get(`http://localhost:${service.port}/health`, {
                    timeout: 5000
                });
                console.log(`[CHECK] ${service.name} health check: ${response.data.status}`);
                
                this.runningServices.set(service.name, {
                    process,
                    service,
                    startTime: Date.now()
                });
                
                return true;
                
            } catch (error) {
                console.log(`[X] ${service.name} health check failed: ${error.message}`);
                process.kill();
                return false;
            }

        } catch (error) {
            console.log(`[X] Failed to start ${service.name}: ${error.message}`);
            return false;
        }
    }

    async deployAll() {
        console.log('[STAR] Starting Simple Deployment');
        console.log('==================================');
        
        let successCount = 0;
        
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

        console.log(`\n[PARTY] Deployment completed: ${successCount}/${SERVICES.length} services running`);
        
        if (successCount > 0) {
            console.log('\n[BULB] Active Services:');
            this.runningServices.forEach((info, name) => {
                console.log(`  • ${name}: http://localhost:${info.service.port}/health`);
            });
            
            console.log('\n[INFO] Services will continue running...');
            console.log('[INFO] Press Ctrl+C to stop all services');
            
            // Keep alive
            process.on('SIGINT', () => {
                this.shutdown();
            });
            
            // Prevent exit
            setInterval(() => {
                // Keep alive
            }, 30000);
            
        } else {
            console.log('\n[X] No services were started successfully');
            process.exit(1);
        }
    }

    shutdown() {
        console.log('\n[STOP] Shutting down services...');
        
        this.runningServices.forEach((info, name) => {
            try {
                info.process.kill('SIGTERM');
                console.log(`[CHECK] ${name} terminated`);
            } catch (error) {
                console.log(`[WARNING] Could not terminate ${name}: ${error.message}`);
            }
        });
        
        console.log('[WAVE] Shutdown complete');
        process.exit(0);
    }
}

// Execute
const deployer = new SimpleDeploy();
deployer.deployAll().catch(error => {
    console.error('[X] Fatal error:', error.message);
    process.exit(1);
});
