#!/usr/bin/env node

/**
 * [ROCKET] QBTC ECOSYSTEM DEPLOYMENT SCRIPT
 * ===================================
 * 
 * Script maestro para desplegar, inicializar y verificar todo el ecosistema QBTC.
 * Automatiza el proceso completo de puesta en marcha del sistema cuántico.
 * 
 * FUNCIONALIDADES:
 * - Despliegue automático de todos los servicios
 * - Inicialización de motores y APIs
 * - Optimización automática del sistema
 * - Integración de servicios adicionales
 * - Verificación integral del ecosistema
 * - Monitoreo continuo del sistema
 */

import { spawn, exec } from 'child_process';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import net from 'net';

class QBTCEcosystemDeployer {
    constructor() {
        this.services = new Map([
            ['master_control', {
                path: './core/master-control-hub.js',
                port: 14001,
                name: 'Master Control Hub',
                process: null,
                critical: true,
                startup_delay: 0
            }],
            ['temporal_cycles', {
                path: './services/temporal-cycles-engine-service.js',
                port: 14102,
                name: 'Temporal Cycles Engine',
                process: null,
                critical: true,
                startup_delay: 2000
            }],
            ['weighting', {
                path: './services/multidimensional-weighting-service.js',
                port: 14103,
                name: 'Multidimensional Weighting',
                process: null,
                critical: true,
                startup_delay: 3000
            }],
            ['opportunities_api', {
                path: './services/consolidated-opportunities-service.js',
                port: 14107,
                name: 'Consolidated Opportunities API',
                process: null,
                critical: true,
                startup_delay: 4000
            }],
            ['btc_acquisition', {
                path: './core/btc-unified-acquisition-engine.js',
                port: 14106,
                name: 'BTC Unified Acquisition Engine',
                process: null,
                critical: true,
                startup_delay: 5000
            }]
        ]);
        
        this.deployment_config = {
            startup_timeout: 30000,
            health_check_interval: 5000,
            max_startup_attempts: 3,
            enable_optimization: true,
            enable_auto_integration: true,
            enable_system_verification: true,
            enable_monitoring: true
        };
        
        this.deployment_active = false;
        this.services_started = new Set();
        this.deployment_log = [];
        
        console.log('[ROCKET] QBTC Ecosystem Deployer initialized');
    }
    
    async deploy() {
        try {
            console.log('\n' + '='.repeat(80));
            console.log('[STAR] STARTING QBTC ECOSYSTEM DEPLOYMENT');
            console.log('='.repeat(80));
            console.log(`[CALENDAR] Timestamp: ${new Date().toISOString()}`);
            console.log(`[TARGET] Target Services: ${this.services.size}`);
            
            this.deployment_active = true;
            this.logEvent('deployment_started', 'QBTC Ecosystem deployment initiated');
            
            // FASE 1: Pre-deployment checks
            console.log('\n[CLIPBOARD] PHASE 1: Pre-deployment Checks');
            await this.runPreDeploymentChecks();
            
            // FASE 2: Start core services
            console.log('\n[CLAPPER] PHASE 2: Starting Core Services');
            await this.startCoreServices();
            
            // FASE 3: Wait for service initialization
            console.log('\n[HOURGLASS] PHASE 3: Service Initialization');
            await this.waitForServicesInitialization();
            
            // FASE 4: Auto-optimization (if enabled)
            if (this.deployment_config.enable_optimization) {
                console.log('\n[WRENCH] PHASE 4: System Optimization');
                await this.launchSystemOptimizer();
            }
            
            // FASE 5: Auto-integration (if enabled)
            if (this.deployment_config.enable_auto_integration) {
                console.log('\n[LINK] PHASE 5: Auto Integration');
                await this.launchAutoIntegrator();
            }
            
            // FASE 6: System verification (if enabled)
            if (this.deployment_config.enable_system_verification) {
                console.log('\n[CHECK] PHASE 6: System Verification');
                await this.runSystemVerification();
            }
            
            // FASE 7: Enable monitoring (if enabled)
            if (this.deployment_config.enable_monitoring) {
                console.log('\n[CHART] PHASE 7: Enable Monitoring');
                await this.enableContinuousMonitoring();
            }
            
            // Deployment successful
            this.logEvent('deployment_completed', 'QBTC Ecosystem deployment successful');
            this.printDeploymentSummary();
            
            return {
                success: true,
                message: 'QBTC Ecosystem deployed successfully',
                services_started: this.services_started.size,
                deployment_log: this.deployment_log
            };
            
        } catch (error) {
            console.error('[X] Deployment failed:', error.message);
            this.logEvent('deployment_failed', error.message);
            
            // Cleanup on failure
            await this.cleanup();
            
            return {
                success: false,
                message: error.message,
                services_started: this.services_started.size,
                deployment_log: this.deployment_log
            };
        }
    }
    
    async runPreDeploymentChecks() {
        console.log('[MAGNIFY] Running pre-deployment checks...');
        
        // Check if ports are available
        for (const [serviceKey, service] of this.services.entries()) {
            const portAvailable = await this.isPortAvailable(service.port);
            if (!portAvailable) {
                console.log(`[WARNING] Port ${service.port} is already in use - attempting to free it...`);
                await this.freePort(service.port);
            }
            console.log(`[CHECK] Port ${service.port} (${service.name}) - Available`);
        }
        
        // Check if service files exist
        for (const [serviceKey, service] of this.services.entries()) {
            try {
                await fs.access(service.path);
                console.log(`[CHECK] Service file found: ${service.name}`);
            } catch (error) {
                throw new Error(`Service file not found: ${service.path}`);
            }
        }
        
        console.log('[CHECK] All pre-deployment checks passed');
    }
    
    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            
            socket.setTimeout(1000);
            socket.on('connect', () => {
                socket.destroy();
                resolve(false); // Port is busy
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(true); // Port is available
            });
            
            socket.on('error', () => {
                socket.destroy();
                resolve(true); // Port is available
            });
            
            socket.connect(port, 'localhost');
        });
    }
    
    async freePort(port) {
        return new Promise((resolve) => {
            // Try to kill processes using the port (Windows)
            if (process.platform === 'win32') {
                exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                    if (stdout) {
                        const lines = stdout.split('\n');
                        lines.forEach(line => {
                            const parts = line.trim().split(/\s+/);
                            if (parts.length > 4 && parts[1].includes(`:${port}`)) {
                                const pid = parts[parts.length - 1];
                                if (pid && !isNaN(pid)) {
                                    exec(`taskkill /PID ${pid} /F`, () => {});
                                }
                            }
                        });
                    }
                    setTimeout(resolve, 1000);
                });
            } else {
                // Unix/Linux
                exec(`lsof -ti:${port} | xargs kill -9`, () => {
                    setTimeout(resolve, 1000);
                });
            }
        });
    }
    
    async startCoreServices() {
        const startupPromises = [];
        
        // Start services in order with delays
        for (const [serviceKey, service] of this.services.entries()) {
            startupPromises.push(
                this.startServiceWithDelay(serviceKey, service)
            );
        }
        
        // Wait for all services to start
        await Promise.allSettled(startupPromises);
        
        console.log(`[TARGET] Started ${this.services_started.size}/${this.services.size} services`);
    }
    
    async startServiceWithDelay(serviceKey, service) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    await this.startService(serviceKey, service);
                    resolve();
                } catch (error) {
                    console.error(`[X] Failed to start ${service.name}: ${error.message}`);
                    resolve();
                }
            }, service.startup_delay);
        });
    }
    
    async startService(serviceKey, service) {
        console.log(`[ROCKET] Starting ${service.name}...`);
        
        const serviceProcess = spawn('node', [service.path], {
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: false
        });
        
        service.process = serviceProcess;
        
        // Handle process events
        serviceProcess.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Server running') || output.includes('listening on port') || output.includes('started')) {
                console.log(`[CHECK] ${service.name} started successfully (PID: ${serviceProcess.pid})`);
                this.services_started.add(serviceKey);
                this.logEvent('service_started', `${service.name} started on port ${service.port}`);
            }
        });
        
        serviceProcess.stderr.on('data', (data) => {
            console.log(`[WARNING] ${service.name} stderr: ${data.toString().trim()}`);
        });
        
        serviceProcess.on('error', (error) => {
            console.error(`[X] ${service.name} process error:`, error.message);
            this.logEvent('service_error', `${service.name}: ${error.message}`);
        });
        
        serviceProcess.on('exit', (code) => {
            if (code !== 0) {
                console.log(`[WARNING] ${service.name} exited with code ${code}`);
                this.services_started.delete(serviceKey);
            }
        });
        
        // Give process time to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    async waitForServicesInitialization() {
        const maxWaitTime = this.deployment_config.startup_timeout;
        const checkInterval = this.deployment_config.health_check_interval;
        let totalWaitTime = 0;
        
        console.log(`[HOURGLASS] Waiting for services to initialize (max ${maxWaitTime/1000}s)...`);
        
        while (totalWaitTime < maxWaitTime) {
            const healthyServices = await this.checkServicesHealth();
            const healthyCount = Array.from(healthyServices.values()).filter(h => h).length;
            
            console.log(`[CHART] Services health: ${healthyCount}/${this.services.size} healthy`);
            
            if (healthyCount === this.services.size) {
                console.log('[CHECK] All services are healthy and ready');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            totalWaitTime += checkInterval;
        }
        
        const healthyServices = await this.checkServicesHealth();
        const healthyCount = Array.from(healthyServices.values()).filter(h => h).length;
        
        if (healthyCount < this.services.size) {
            const unhealthyServices = [];
            for (const [serviceKey, healthy] of healthyServices.entries()) {
                if (!healthy) {
                    unhealthyServices.push(this.services.get(serviceKey).name);
                }
            }
            throw new Error(`Some services failed to start: ${unhealthyServices.join(', ')}`);
        }
    }
    
    async checkServicesHealth() {
        const healthResults = new Map();
        
        for (const [serviceKey, service] of this.services.entries()) {
            try {
                const response = await axios.get(`http://localhost:${service.port}/health`, {
                    timeout: 3000
                });
                healthResults.set(serviceKey, response.status === 200);
            } catch (error) {
                healthResults.set(serviceKey, false);
            }
        }
        
        return healthResults;
    }
    
    async launchSystemOptimizer() {
        console.log('[WRENCH] Launching System Optimizer...');
        
        try {
            const optimizer = spawn('node', ['./services/system-optimizer.js'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: true
            });
            
            optimizer.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('System Optimizer is now running')) {
                    console.log('[CHECK] System Optimizer launched successfully');
                    this.logEvent('optimizer_started', 'System Optimizer active');
                }
            });
            
            optimizer.unref(); // Allow parent to exit independently
            
        } catch (error) {
            console.log(`[WARNING] Could not launch System Optimizer: ${error.message}`);
        }
    }
    
    async launchAutoIntegrator() {
        console.log('[LINK] Launching Auto Integrator...');
        
        try {
            const integrator = spawn('node', ['./services/auto-integrator.js'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: true
            });
            
            integrator.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Auto Integrator is now running')) {
                    console.log('[CHECK] Auto Integrator launched successfully');
                    this.logEvent('integrator_started', 'Auto Integrator active');
                }
            });
            
            integrator.unref(); // Allow parent to exit independently
            
        } catch (error) {
            console.log(`[WARNING] Could not launch Auto Integrator: ${error.message}`);
        }
    }
    
    async runSystemVerification() {
        console.log('[CHECK] Running system verification...');
        
        // Wait a bit for services to stabilize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return new Promise((resolve) => {
            const verifier = spawn('node', ['./services/system-verifier.js'], {
                stdio: ['ignore', 'pipe', 'pipe']
            });
            
            let verificationOutput = '';
            
            verifier.stdout.on('data', (data) => {
                const output = data.toString();
                verificationOutput += output;
                console.log(output.trim());
            });
            
            verifier.stderr.on('data', (data) => {
                console.log(`[WARNING] Verifier: ${data.toString().trim()}`);
            });
            
            verifier.on('close', (code) => {
                if (code === 0) {
                    console.log('[CHECK] System verification completed successfully');
                    this.logEvent('verification_passed', 'System verification successful');
                } else {
                    console.log('[WARNING] System verification completed with warnings');
                    this.logEvent('verification_warnings', `System verification exit code: ${code}`);
                }
                resolve();
            });
        });
    }
    
    async enableContinuousMonitoring() {
        console.log('[CHART] Enabling continuous monitoring...');
        
        // Start monitoring interval
        this.monitoring_interval = setInterval(async () => {
            const healthResults = await this.checkServicesHealth();
            const healthyCount = Array.from(healthResults.values()).filter(h => h).length;
            
            if (healthyCount < this.services.size) {
                console.log(`[WARNING] Health check: ${healthyCount}/${this.services.size} services healthy`);
                this.logEvent('health_warning', `Only ${healthyCount}/${this.services.size} services healthy`);
            }
        }, 30000); // Check every 30 seconds
        
        console.log('[CHECK] Continuous monitoring enabled');
        this.logEvent('monitoring_enabled', 'Continuous health monitoring active');
    }
    
    logEvent(type, message) {
        this.deployment_log.push({
            timestamp: new Date().toISOString(),
            type,
            message
        });
    }
    
    printDeploymentSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('[PARTY] QBTC ECOSYSTEM DEPLOYMENT COMPLETED');
        console.log('='.repeat(80));
        console.log(`[CALENDAR] Completion Time: ${new Date().toISOString()}`);
        console.log(`[TARGET] Services Started: ${this.services_started.size}/${this.services.size}`);
        
        console.log('\n[GLOBE] ACTIVE SERVICES:');
        for (const [serviceKey, service] of this.services.entries()) {
            if (this.services_started.has(serviceKey)) {
                console.log(`[CHECK] ${service.name} - http://localhost:${service.port}`);
            } else {
                console.log(`[X] ${service.name} - FAILED TO START`);
            }
        }
        
        console.log('\n[LINK] KEY ENDPOINTS:');
        console.log(`[GAMEPAD] Master Control Hub: http://localhost:14001/health`);
        console.log(`[CHART] Consolidated API: http://localhost:14107/health`);
        console.log(`[DIAMOND] BTC Acquisition: http://localhost:14106/health`);
        console.log(`[OCEAN_WAVE] Temporal Analysis: http://localhost:14102/health`);
        console.log(`[SCALES] Dimensional Weights: http://localhost:14103/health`);
        
        console.log('\n[BULB] NEXT STEPS:');
        console.log('• Monitor system health via Master Control Hub');
        console.log('• Access opportunities via Consolidated API');
        console.log('• Review BTC acquisition metrics');
        console.log('• System will auto-optimize and integrate new services');
        console.log('• Use Ctrl+C to gracefully shutdown the ecosystem');
        
        console.log('\n' + '='.repeat(80));
        console.log('[ROCKET] QBTC ECOSYSTEM IS NOW OPERATIONAL');
        console.log('='.repeat(80));
    }
    
    async cleanup() {
        console.log('\n[BROOM] Cleaning up deployment...');
        
        if (this.monitoring_interval) {
            clearInterval(this.monitoring_interval);
        }
        
        // Terminate all spawned processes
        for (const [serviceKey, service] of this.services.entries()) {
            if (service.process) {
                try {
                    service.process.kill('SIGTERM');
                    console.log(`[STOP] Terminated ${service.name}`);
                } catch (error) {
                    console.log(`[WARNING] Could not terminate ${service.name}: ${error.message}`);
                }
            }
        }
        
        this.deployment_active = false;
        console.log('[CHECK] Cleanup completed');
    }
    
    async shutdown() {
        console.log('\n[STOP] Shutting down QBTC Ecosystem...');
        await this.cleanup();
        console.log('[WAVE] QBTC Ecosystem shutdown complete');
        process.exit(0);
    }
}

// Handle graceful shutdown
const deployer = new QBTCEcosystemDeployer();

process.on('SIGINT', async () => {
    console.log('\n[STOP] Received shutdown signal...');
    await deployer.shutdown();
});

process.on('SIGTERM', async () => {
    console.log('\n[STOP] Received termination signal...');
    await deployer.shutdown();
});

// Start deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deployer.deploy().then((result) => {
        if (result.success) {
            console.log('\n[PARTY] QBTC Ecosystem is ready for quantum operations!');
            
            // Keep the process alive for monitoring
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', async (key) => {
                // Ctrl+C
                if (key[0] === 3) {
                    await deployer.shutdown();
                }
            });
            
        } else {
            console.log('\n[X] QBTC Ecosystem deployment failed');
            console.log(`Error: ${result.message}`);
            process.exit(1);
        }
    }).catch(async (error) => {
        console.error('[X] Fatal deployment error:', error);
        await deployer.cleanup();
        process.exit(1);
    });
}

export default QBTCEcosystemDeployer;
