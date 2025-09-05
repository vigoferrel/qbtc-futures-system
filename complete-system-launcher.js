#!/usr/bin/env node

/**
 * COMPLETE SYSTEM LAUNCHER - QBTC 100% Operational
 * ===============================================
 * Launches all required services for 100% system functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CompleteSystemLauncher {
    constructor() {
        this.processes = [];
        this.isShuttingDown = false;
        this.launchStats = {
            total: 0,
            successful: 0,
            failed: 0,
            startTime: Date.now()
        };
        
        // PHASE 1: Start main launcher system (ports 8000-8007)
        this.mainLauncher = null;
        
        // PHASE 2: Additional services that metrics collector expects
        this.additionalServices = [
            // This will be filled after main launcher is verified
        ];
        
        this.setupSignalHandlers();
    }
    
    setupSignalHandlers() {
        const gracefulShutdown = () => {
            if (this.isShuttingDown) return;
            console.log('\n[STOP] Graceful shutdown initiated...');
            this.isShuttingDown = true;
            
            // Stop main launcher
            if (this.mainLauncher && !this.mainLauncher.killed) {
                console.log('[STOP] Terminating main launcher...');
                this.mainLauncher.kill('SIGTERM');
            }
            
            // Stop additional services
            this.processes.forEach((proc, index) => {
                if (!proc.killed) {
                    console.log(`[STOP] Terminating additional service ${index + 1}...`);
                    proc.kill('SIGTERM');
                }
            });
            
            setTimeout(() => {
                console.log('[CHECK] Complete system shutdown complete');
                process.exit(0);
            }, 3000);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGBREAK', gracefulShutdown);
    }
    
    async launchMainSystem() {
        console.log('[ROCKET] Phase 1: Launching main QBTC system...');
        
        return new Promise((resolve, reject) => {
            this.mainLauncher = spawn('node', ['launch-ultra-perfect-system.js'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let hasLaunched = false;
            let outputBuffer = '';
            
            this.mainLauncher.stdout.on('data', (data) => {
                const text = data.toString();
                outputBuffer += text;
                
                // Log key messages
                text.split('\n').forEach(line => {
                    if (line.trim() && (
                        line.includes('✅') ||
                        line.includes('OPERATIONAL') ||
                        line.includes('launched successfully') ||
                        line.includes('ERROR') ||
                        line.includes('FAILED')
                    )) {
                        console.log(`[MAIN] ${line.trim()}`);
                    }
                });
                
                // Check if all 8 core services have launched
                if (!hasLaunched && outputBuffer.includes('Exchange Gateway') && 
                    outputBuffer.includes('launched successfully')) {
                    hasLaunched = true;
                    console.log('[CHECK] Main system core services launched!');
                    
                    // Wait a bit for services to stabilize
                    setTimeout(() => resolve(), 5000);
                }
            });
            
            this.mainLauncher.stderr.on('data', (data) => {
                console.error(`[MAIN ERROR] ${data.toString()}`);
            });
            
            this.mainLauncher.on('error', (error) => {
                console.error('[X] Main launcher failed:', error);
                reject(error);
            });
            
            this.mainLauncher.on('exit', (code, signal) => {
                if (!this.isShuttingDown) {
                    console.log(`[WARNING] Main launcher exited: code ${code}, signal ${signal}`);
                }
            });
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (!hasLaunched) {
                    console.log('[CHECK] Main launcher timeout - proceeding with status check...');
                    resolve();
                }
            }, 30000);
        });
    }
    
    async verifyServices() {
        console.log('[MAGNIFY] Phase 2: Verifying service availability...');
        
        const expectedPorts = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007];
        const availablePorts = [];
        
        for (const port of expectedPorts) {
            try {
                const response = await fetch(`http://localhost:${port}/health`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(2000)
                });
                
                if (response.ok) {
                    availablePorts.push(port);
                    console.log(`[CHECK] Port ${port}: ✅ HEALTHY`);
                } else {
                    console.log(`[WARNING] Port ${port}: ❌ Status ${response.status}`);
                }
            } catch (error) {
                console.log(`[WARNING] Port ${port}: ❌ Not responding`);
            }
        }
        
        console.log(`[CHART] Core services status: ${availablePorts.length}/${expectedPorts.length} active`);
        return availablePorts;
    }
    
    async waitForStabilization() {
        console.log('[CLOCK] Phase 3: Waiting for system stabilization...');
        
        // Wait for metrics to be collected and errors to be processed
        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log(`[CLOCK] Stabilization: ${(i + 1) * 5} seconds...`);
        }
        
        console.log('[CHECK] System stabilization complete');
    }
    
    async checkMetricsErrors() {
        console.log('[CHART] Phase 4: Checking metrics collection status...');
        
        try {
            const response = await fetch('http://localhost:8003/metrics', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`[CHART] Metrics Collector: ✅ Active - ${data.metrics?.activeServices || 'N/A'} services`);
                return true;
            } else {
                console.log(`[WARNING] Metrics Collector: Status ${response.status}`);
                return false;
            }
        } catch (error) {
            console.log(`[WARNING] Metrics Collector: ${error.message}`);
            return false;
        }
    }
    
    async generateSystemReport() {
        console.log('\n' + '='.repeat(70));
        console.log('🎯 QBTC SYSTEM STATUS REPORT - 100% OPERATIONAL TARGET');
        console.log('='.repeat(70));
        
        // Check all expected services
        const services = [
            { name: 'Master Control Hub', port: 8000 },
            { name: 'Ultra-Perfect Trading Engine', port: 8001 },
            { name: 'Quantum Trading Executor', port: 8002 },
            { name: 'QBTC Metrics Collector', port: 8003 },
            { name: 'Position Manager', port: 8004 },
            { name: 'Portfolio Rebalancer', port: 8005 },
            { name: 'Exchange Gateway', port: 8006 },
            { name: 'Leonardo Quantum', port: 8007 },
            { name: 'Message Bus', port: 14002 },
            { name: 'Config Service', port: 14003 },
            { name: 'Dashboard Server', port: 14801 },
            { name: 'Quantum Monitoring', port: 14999 }
        ];
        
        let healthyCount = 0;
        let totalServices = services.length;
        
        for (const service of services) {
            try {
                const response = await fetch(`http://localhost:${service.port}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                });
                
                if (response.ok) {
                    console.log(`✅ ${service.name.padEnd(35)} Port ${service.port} - HEALTHY`);
                    healthyCount++;
                } else {
                    console.log(`❌ ${service.name.padEnd(35)} Port ${service.port} - ERROR ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ ${service.name.padEnd(35)} Port ${service.port} - NOT RESPONDING`);
            }
        }
        
        const percentage = Math.round((healthyCount / totalServices) * 100);
        
        console.log('='.repeat(70));
        console.log(`📊 SYSTEM OPERATIONAL STATUS: ${healthyCount}/${totalServices} services (${percentage}%)`);
        
        if (percentage === 100) {
            console.log('🎉 🎯 TARGET ACHIEVED: 100% OPERATIONAL SYSTEM! 🎯 🎉');
        } else if (percentage >= 90) {
            console.log('🚀 EXCELLENT: Near-perfect system operation');
        } else if (percentage >= 75) {
            console.log('✅ GOOD: Majority of services operational');
        } else {
            console.log('⚠️  NEEDS ATTENTION: Multiple services down');
        }
        
        console.log('='.repeat(70));
        
        return percentage;
    }
    
    async launch() {
        try {
            console.log('[GALAXY] QBTC COMPLETE SYSTEM LAUNCHER - TARGET: 100%');
            console.log('[GALAXY] Timestamp:', new Date().toISOString());
            console.log('='.repeat(60));
            
            // Phase 1: Launch main system
            await this.launchMainSystem();
            
            // Phase 2: Verify services
            const activePorts = await this.verifyServices();
            
            // Phase 3: Wait for stabilization
            await this.waitForStabilization();
            
            // Phase 4: Check metrics
            const metricsOK = await this.checkMetricsErrors();
            
            // Phase 5: Generate final report
            const operationalPercentage = await this.generateSystemReport();
            
            if (operationalPercentage === 100) {
                console.log('\n🎯 MISSION ACCOMPLISHED: 100% OPERATIONAL SYSTEM');
                console.log('System is running with no errors - press Ctrl+C to stop');
            } else {
                console.log(`\n📊 Current Status: ${operationalPercentage}% operational`);
                console.log('System is partially functional - check logs for details');
            }
            
            // Keep system running
            this.keepAlive();
            
        } catch (error) {
            console.error('[X] Complete system launch failed:', error);
            process.exit(1);
        }
    }
    
    keepAlive() {
        // Heartbeat every minute
        setInterval(async () => {
            if (!this.isShuttingDown) {
                const percentage = await this.generateSystemReport();
                if (percentage === 100) {
                    console.log(`\n[HEARTBEAT] ${new Date().toISOString()} - 🎯 100% OPERATIONAL`);
                } else {
                    console.log(`\n[HEARTBEAT] ${new Date().toISOString()} - 📊 ${percentage}% operational`);
                }
            }
        }, 60000);
    }
}

// Launch if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const launcher = new CompleteSystemLauncher();
    launcher.launch().catch(error => {
        console.error('[X] Fatal error:', error);
        process.exit(1);
    });
}

export default CompleteSystemLauncher;
