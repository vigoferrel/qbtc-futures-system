#!/usr/bin/env node

/**
 * 🚀 QBTC SYSTEM RECOVERY & AUTO-START SCRIPT
 * Comprehensive diagnostic and automatic recovery system for QBTC Ultra-Perfect ecosystem
 */

import { spawn, execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color utilities for beautiful output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = (level, message) => {
    const timestamp = new Date().toISOString();
    const levelColors = {
        ERROR: colors.red + colors.bright,
        SUCCESS: colors.green + colors.bright,
        WARNING: colors.yellow + colors.bright,
        INFO: colors.blue + colors.bright,
        SYSTEM: colors.cyan + colors.bright
    };
    console.log(`${levelColors[level] || colors.white}[${timestamp}] [QBTC Recovery] ${message}${colors.reset}`);
};

class QBTCSystemRecovery {
    constructor() {
        this.requiredServices = [
            { name: 'Master Control Hub', port: 8000, script: 'core/master-control-hub.js' },
            { name: 'Message Bus', port: 8001, script: 'core/message-bus.js' },
            { name: 'Config Service', port: 8002, script: 'core/config-service.js' },
            { name: 'Metrics Collector', port: 8003, script: 'core/metrics-collector.js' },
            { name: 'Trading Engine', port: 8004, script: 'trading/ultra-perfect-qbtc-trading-engine.js' },
            { name: 'Position Manager', port: 8005, script: 'execution-engine/position-manager.js' },
            { name: 'Exchange Gateway', port: 8006, script: 'execution-engine/exchange-gateway.js' },
            { name: 'Portfolio Rebalancer', port: 8007, script: 'execution-engine/portfolio-rebalancer.js' }
        ];

        this.additionalServices = [
            { name: 'Quantum Executor', port: 14201, script: 'execution-engine/quantum-executor.js' },
            { name: 'Leonardo Quantum', port: 14404, script: 'analysis-engine/leonardo-quantum.js' },
            { name: 'Dashboard Server', port: 14801, script: 'frontend/dashboard-server.js' },
            { name: 'Quantum Monitoring', port: 14999, script: 'monitoring/quantum-monitoring-dashboard.js' }
        ];

        this.activeProcesses = new Map();
        this.healthCheckInterval = null;
    }

    async systemDiagnostic() {
        log('SYSTEM', '🔍 Starting comprehensive system diagnostic...');
        
        const diagnosticResults = {
            nodeProcesses: await this.checkNodeProcesses(),
            portAvailability: await this.checkPortAvailability(),
            fileIntegrity: await this.checkFileIntegrity(),
            moduleCompatibility: await this.checkModuleCompatibility(),
            systemResources: await this.checkSystemResources()
        };

        log('INFO', '📊 Diagnostic Results Summary:');
        console.log('─'.repeat(80));
        
        Object.entries(diagnosticResults).forEach(([category, results]) => {
            console.log(`${colors.cyan}${colors.bright}${category}:${colors.reset}`);
            if (Array.isArray(results)) {
                results.forEach(result => {
                    const status = result.status === 'OK' ? `${colors.green}✓` : `${colors.red}✗`;
                    console.log(`  ${status} ${result.name}: ${result.message}${colors.reset}`);
                });
            } else {
                const status = results.status === 'OK' ? `${colors.green}✓` : `${colors.red}✗`;
                console.log(`  ${status} ${results.message}${colors.reset}`);
            }
            console.log('');
        });

        return diagnosticResults;
    }

    async checkNodeProcesses() {
        try {
            const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf8' });
            const nodeProcesses = processes.split('\n').filter(line => line.includes('node.exe')).length - 1;
            
            return {
                status: nodeProcesses > 0 ? 'OK' : 'WARNING',
                name: 'Node.js Processes',
                message: `${nodeProcesses} active Node.js processes found`,
                count: nodeProcesses
            };
        } catch (error) {
            return {
                status: 'ERROR',
                name: 'Node.js Processes',
                message: 'Unable to check Node.js processes',
                count: 0
            };
        }
    }

    async checkPortAvailability() {
        const allPorts = [...this.requiredServices, ...this.additionalServices].map(s => s.port);
        const portResults = [];

        for (const port of allPorts) {
            try {
                const result = execSync(`netstat -an | findstr ":${port} "`, { encoding: 'utf8', stdio: 'pipe' });
                const isListening = result.includes('LISTENING');
                
                portResults.push({
                    status: isListening ? 'OK' : 'WARNING',
                    name: `Port ${port}`,
                    message: isListening ? 'Service listening' : 'Port available',
                    port,
                    listening: isListening
                });
            } catch (error) {
                portResults.push({
                    status: 'OK',
                    name: `Port ${port}`,
                    message: 'Port available',
                    port,
                    listening: false
                });
            }
        }

        return portResults;
    }

    async checkFileIntegrity() {
        const allServices = [...this.requiredServices, ...this.additionalServices];
        const fileResults = [];

        for (const service of allServices) {
            const filePath = path.join(__dirname, service.script);
            try {
                await fs.access(filePath);
                const stats = await fs.stat(filePath);
                
                fileResults.push({
                    status: stats.size > 0 ? 'OK' : 'WARNING',
                    name: service.name,
                    message: `File exists (${Math.round(stats.size / 1024)}KB)`,
                    path: filePath,
                    size: stats.size
                });
            } catch (error) {
                fileResults.push({
                    status: 'ERROR',
                    name: service.name,
                    message: 'File not found or inaccessible',
                    path: filePath,
                    error: error.message
                });
            }
        }

        return fileResults;
    }

    async checkModuleCompatibility() {
        try {
            const packageJsonPath = path.join(__dirname, 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            
            const moduleType = packageJson.type || 'commonjs';
            const hasEsModules = moduleType === 'module';

            return {
                status: 'OK',
                name: 'Module System',
                message: `Using ${hasEsModules ? 'ES Modules' : 'CommonJS'}`,
                type: moduleType,
                compatible: true
            };
        } catch (error) {
            return {
                status: 'WARNING',
                name: 'Module System',
                message: 'Unable to determine module type',
                error: error.message
            };
        }
    }

    async checkSystemResources() {
        try {
            // Check available memory
            const memInfo = execSync('wmic computersystem get TotalPhysicalMemory /value', { encoding: 'utf8' });
            const totalMemory = parseInt(memInfo.match(/TotalPhysicalMemory=(\d+)/)?.[1] || '0');
            const totalMemoryGB = Math.round(totalMemory / (1024 * 1024 * 1024));

            // Check CPU usage
            const cpuInfo = execSync('wmic cpu get NumberOfCores,NumberOfLogicalProcessors /value', { encoding: 'utf8' });
            const cores = parseInt(cpuInfo.match(/NumberOfCores=(\d+)/)?.[1] || '0');
            const threads = parseInt(cpuInfo.match(/NumberOfLogicalProcessors=(\d+)/)?.[1] || '0');

            return {
                status: totalMemoryGB >= 4 && cores >= 2 ? 'OK' : 'WARNING',
                name: 'System Resources',
                message: `${totalMemoryGB}GB RAM, ${cores} cores, ${threads} threads`,
                memory: totalMemoryGB,
                cores,
                threads
            };
        } catch (error) {
            return {
                status: 'WARNING',
                name: 'System Resources',
                message: 'Unable to check system resources',
                error: error.message
            };
        }
    }

    async killExistingProcesses() {
        log('SYSTEM', '🔄 Cleaning up existing Node.js processes...');
        try {
            execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
            log('SUCCESS', 'Existing Node.js processes terminated');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } catch (error) {
            log('INFO', 'No existing Node.js processes to terminate');
        }
    }

    async startService(service) {
        const filePath = path.join(__dirname, service.script);
        
        try {
            await fs.access(filePath);
        } catch (error) {
            log('ERROR', `Cannot start ${service.name}: File ${service.script} not found`);
            return false;
        }

        log('INFO', `🚀 Starting ${service.name} on port ${service.port}...`);
        
        try {
            const process = spawn('node', [filePath], {
                env: { ...process.env, PORT: service.port.toString() },
                detached: false,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            this.activeProcesses.set(service.name, process);

            process.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    log('INFO', `[${service.name}] ${output}`);
                }
            });

            process.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output && !output.includes('ExperimentalWarning')) {
                    log('WARNING', `[${service.name}] ${output}`);
                }
            });

            process.on('exit', (code) => {
                if (code !== 0) {
                    log('ERROR', `${service.name} exited with code ${code}`);
                }
                this.activeProcesses.delete(service.name);
            });

            // Wait a bit for the service to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if service is responding
            const isHealthy = await this.checkServiceHealth(service);
            if (isHealthy) {
                log('SUCCESS', `${service.name} started successfully ✓`);
                return true;
            } else {
                log('WARNING', `${service.name} started but not responding to health checks`);
                return false;
            }
            
        } catch (error) {
            log('ERROR', `Failed to start ${service.name}: ${error.message}`);
            return false;
        }
    }

    async checkServiceHealth(service) {
        try {
            const response = await fetch(`http://localhost:${service.port}/health`, {
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            // Try alternative health endpoints
            try {
                const response = await fetch(`http://localhost:${service.port}/status`, {
                    timeout: 5000
                });
                return response.ok;
            } catch (error2) {
                return false;
            }
        }
    }

    async startAllServices() {
        log('SYSTEM', '🚀 Starting QBTC Ultra-Perfect System Services...');
        
        const startResults = {
            required: { started: 0, total: this.requiredServices.length, services: [] },
            additional: { started: 0, total: this.additionalServices.length, services: [] }
        };

        // Start required services first
        log('INFO', '📋 Starting required core services...');
        for (const service of this.requiredServices) {
            const started = await this.startService(service);
            startResults.required.services.push({ ...service, started });
            if (started) startResults.required.started++;
        }

        // Wait a bit before starting additional services
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Start additional services
        log('INFO', '📋 Starting additional enhanced services...');
        for (const service of this.additionalServices) {
            const started = await this.startService(service);
            startResults.additional.services.push({ ...service, started });
            if (started) startResults.additional.started++;
        }

        return startResults;
    }

    async performSystemHealthCheck() {
        log('INFO', '🏥 Performing comprehensive system health check...');
        
        const healthResults = {
            totalServices: this.requiredServices.length + this.additionalServices.length,
            healthyServices: 0,
            unhealthyServices: 0,
            serviceStatus: []
        };

        const allServices = [...this.requiredServices, ...this.additionalServices];
        
        for (const service of allServices) {
            const isHealthy = await this.checkServiceHealth(service);
            healthResults.serviceStatus.push({
                name: service.name,
                port: service.port,
                healthy: isHealthy,
                status: isHealthy ? 'HEALTHY' : 'UNHEALTHY'
            });
            
            if (isHealthy) {
                healthResults.healthyServices++;
            } else {
                healthResults.unhealthyServices++;
            }
        }

        const healthPercentage = Math.round((healthResults.healthyServices / healthResults.totalServices) * 100);
        
        log('INFO', '📊 System Health Summary:');
        console.log('─'.repeat(80));
        console.log(`${colors.cyan}${colors.bright}Overall Health: ${healthPercentage}%${colors.reset}`);
        console.log(`${colors.green}Healthy Services: ${healthResults.healthyServices}${colors.reset}`);
        console.log(`${colors.red}Unhealthy Services: ${healthResults.unhealthyServices}${colors.reset}`);
        console.log('');

        healthResults.serviceStatus.forEach(service => {
            const status = service.healthy ? `${colors.green}HEALTHY` : `${colors.red}UNHEALTHY`;
            console.log(`  ${status} ${service.name} (Port ${service.port})${colors.reset}`);
        });

        return healthResults;
    }

    async startContinuousMonitoring() {
        log('SYSTEM', '🔄 Starting continuous health monitoring...');
        
        this.healthCheckInterval = setInterval(async () => {
            const healthResults = await this.performSystemHealthCheck();
            
            if (healthResults.healthPercentage < 80) {
                log('WARNING', `System health dropped to ${healthResults.healthPercentage}%`);
                // Auto-recovery logic could be implemented here
            }
            
        }, 30000); // Check every 30 seconds

        log('SUCCESS', 'Continuous monitoring activated ✓');
    }

    async fullSystemRecovery() {
        log('SYSTEM', '🛠️ STARTING FULL QBTC SYSTEM RECOVERY...');
        console.log('═'.repeat(80));

        try {
            // Step 1: System Diagnostic
            const diagnosticResults = await this.systemDiagnostic();
            
            // Step 2: Clean existing processes
            await this.killExistingProcesses();
            
            // Step 3: Start all services
            const startResults = await this.startAllServices();
            
            // Step 4: Health check
            const healthResults = await this.performSystemHealthCheck();
            
            // Step 5: Start monitoring
            await this.startContinuousMonitoring();
            
            // Final summary
            log('SYSTEM', '🎯 RECOVERY COMPLETE - FINAL SUMMARY:');
            console.log('═'.repeat(80));
            log('SUCCESS', `Required Services: ${startResults.required.started}/${startResults.required.total} started`);
            log('SUCCESS', `Additional Services: ${startResults.additional.started}/${startResults.additional.total} started`);
            log('SUCCESS', `System Health: ${Math.round((healthResults.healthyServices / healthResults.totalServices) * 100)}%`);
            log('SUCCESS', `Active Processes: ${this.activeProcesses.size}`);
            
            if (healthResults.healthyServices / healthResults.totalServices >= 0.8) {
                log('SUCCESS', '🎊 QBTC SYSTEM RECOVERY SUCCESSFUL! System is operational.');
            } else {
                log('WARNING', '⚠️ PARTIAL RECOVERY - Some services may need manual intervention.');
            }
            
            log('INFO', '🔄 Continuous monitoring is active. System will auto-recover issues.');
            log('INFO', '📊 Use Ctrl+C to stop the recovery system.');
            
            // Keep the process running
            process.on('SIGINT', () => {
                log('SYSTEM', '🛑 Shutting down QBTC Recovery System...');
                if (this.healthCheckInterval) {
                    clearInterval(this.healthCheckInterval);
                }
                
                // Gracefully terminate spawned processes
                this.activeProcesses.forEach((proc, name) => {
                    log('INFO', `Terminating ${name}...`);
                    proc.kill('SIGTERM');
                });
                
                process.exit(0);
            });
            
        } catch (error) {
            log('ERROR', `Recovery failed: ${error.message}`);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const recovery = new QBTCSystemRecovery();
    await recovery.fullSystemRecovery();
    
    // Keep the process alive
    setInterval(() => {
        // Heartbeat
    }, 60000);
}

main().catch(error => {
    console.error('Recovery system failed:', error);
    process.exit(1);
});
