#!/usr/bin/env node

/**
 * LAUNCH 100% - QBTC System Launcher to 100% Operational
 * ====================================================
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkService(port, serviceName) {
    try {
        const { stdout, stderr } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}/health`, {
            timeout: 3000
        });
        
        const statusCode = stdout.trim();
        if (statusCode === '200') {
            console.log(`✅ ${serviceName.padEnd(35)} Port ${port} - HEALTHY`);
            return true;
        } else {
            console.log(`❌ ${serviceName.padEnd(35)} Port ${port} - ERROR ${statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${serviceName.padEnd(35)} Port ${port} - NOT RESPONDING`);
        return false;
    }
}

async function launchMainSystem() {
    console.log('[ROCKET] Launching main QBTC system...');
    
    return new Promise((resolve) => {
        const mainLauncher = spawn('node', ['launch-ultra-perfect-system.js'], {
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        let outputBuffer = '';
        let hasLaunched = false;
        
        mainLauncher.stdout.on('data', (data) => {
            const text = data.toString();
            outputBuffer += text;
            
            // Show important messages
            text.split('\n').forEach(line => {
                if (line.includes('✅') || line.includes('launched successfully') || 
                    line.includes('OPERATIONAL') || line.includes('ERROR')) {
                    console.log(`[MAIN] ${line.trim()}`);
                }
            });
            
            // Check completion
            if (!hasLaunched && text.includes('Sistema funcionando')) {
                hasLaunched = true;
                console.log('[CHECK] Main system launched - waiting for stabilization...');
                
                setTimeout(() => {
                    console.log('[CHECK] System should be stabilized now');
                    resolve(mainLauncher);
                }, 10000);
            }
        });
        
        mainLauncher.stderr.on('data', (data) => {
            console.error(`[MAIN ERROR] ${data.toString()}`);
        });
        
        // Fallback timeout
        setTimeout(() => {
            if (!hasLaunched) {
                console.log('[CHECK] Timeout reached - proceeding with verification...');
                resolve(mainLauncher);
            }
        }, 45000);
    });
}

async function generateSystemReport() {
    console.log('\\n' + '='.repeat(70));
    console.log('🎯 QBTC SYSTEM STATUS REPORT - 100% OPERATIONAL TARGET');
    console.log('='.repeat(70));
    
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
        { name: 'Position Manager (Legacy)', port: 14202 },
        { name: 'Portfolio Rebalancer (Legacy)', port: 14203 },
        { name: 'Dashboard Server', port: 14801 },
        { name: 'Quantum Monitoring', port: 14999 }
    ];
    
    let healthyCount = 0;
    const totalServices = services.length;
    
    for (const service of services) {
        const isHealthy = await checkService(service.port, service.name);
        if (isHealthy) healthyCount++;
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

async function main() {
    try {
        console.log('[GALAXY] QBTC LAUNCH TO 100% OPERATIONAL');
        console.log('[GALAXY] Timestamp:', new Date().toISOString());
        console.log('='.repeat(60));
        
        // Phase 1: Launch main system
        const launcher = await launchMainSystem();
        
        // Phase 2: Wait additional time for complete startup
        console.log('[CLOCK] Waiting for complete system initialization...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Phase 3: Generate system report
        const percentage = await generateSystemReport();
        
        if (percentage === 100) {
            console.log('\\n🎯 MISSION ACCOMPLISHED: 100% OPERATIONAL SYSTEM');
        } else {
            console.log(`\\n📊 Current Status: ${percentage}% operational`);
            console.log('Some services may need additional configuration or are still starting up.');
        }
        
        console.log('\\n[INFO] System is running. Press Ctrl+C to stop all services.');
        
        // Keep the main launcher process alive
        process.on('SIGINT', () => {
            console.log('\\n[STOP] Shutting down system...');
            if (launcher && !launcher.killed) {
                launcher.kill('SIGTERM');
            }
            setTimeout(() => process.exit(0), 2000);
        });
        
        // Keep alive
        setInterval(() => {
            console.log(`[HEARTBEAT] ${new Date().toISOString()} - System running`);
        }, 60000);
        
    } catch (error) {
        console.error('[X] Launch failed:', error);
        process.exit(1);
    }
}

main();
