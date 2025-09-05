#!/usr/bin/env node

/**
 * [TEST_TUBE] QBTC ECOSYSTEM TEST DEPLOYMENT
 * ================================
 * 
 * Script de prueba controlada para validar el ecosistema QBTC antes del despliegue completo.
 * Permite probar servicios individualmente y verificar la integración.
 * 
 * Uso:
 * node test-qbtc-deploy.js --service temporal
 * node test-qbtc-deploy.js --service all --dry-run
 * node test-qbtc-deploy.js --health-check
 */

import QBTCEcosystemDeployer from './deploy-qbtc-ecosystem.js';
import axios from 'axios';
import { program } from 'commander';
import net from 'net';

class QBTCTestDeployer {
    constructor() {
        this.deployer = new QBTCEcosystemDeployer();
        console.log('[TEST_TUBE] QBTC Test Deployment System initialized');
    }

    async testSingleService(serviceName) {
        console.log(`\n[WRENCH] Testing single service: ${serviceName}`);
        
        const serviceMap = new Map(this.deployer.services);
        const service = Array.from(serviceMap.values()).find(s => 
            s.name.toLowerCase().includes(serviceName.toLowerCase())
        );
        
        if (!service) {
            console.log(`[X] Service not found: ${serviceName}`);
            console.log('Available services:');
            serviceMap.forEach(s => console.log(`  - ${s.name}`));
            return;
        }
        
        console.log(`[TARGET] Testing: ${service.name} on port ${service.port}`);
        
        // Test port availability
        const portAvailable = await this.deployer.isPortAvailable(service.port);
        console.log(`[PIN] Port ${service.port}: ${portAvailable ? '[CHECK] Available' : '[X] In use'}`);
        
        // Test file existence
        try {
            await this.deployer.runPreDeploymentChecks();
            console.log('[CHECK] Pre-deployment checks passed');
        } catch (error) {
            console.log(`[X] Pre-deployment check failed: ${error.message}`);
            return;
        }
        
        console.log(`[ROCKET] Starting ${service.name} for testing...`);
        
        try {
            // Create temporary deployer with just this service
            const testDeployer = new QBTCEcosystemDeployer();
            testDeployer.services = new Map([[serviceName, service]]);
            testDeployer.deployment_config.enable_optimization = false;
            testDeployer.deployment_config.enable_auto_integration = false;
            testDeployer.deployment_config.enable_system_verification = false;
            testDeployer.deployment_config.enable_monitoring = false;
            
            const result = await testDeployer.deploy();
            
            if (result.success) {
                console.log(`[CHECK] Service ${service.name} started successfully`);
                
                // Wait a moment then test health
                await new Promise(resolve => setTimeout(resolve, 3000));
                await this.testServiceHealth(service);
                
                // Cleanup
                await testDeployer.cleanup();
                
            } else {
                console.log(`[X] Failed to start ${service.name}: ${result.message}`);
            }
            
        } catch (error) {
            console.log(`[X] Test failed: ${error.message}`);
        }
    }
    
    async testServiceHealth(service) {
        console.log(`[HOSPITAL] Testing health endpoint for ${service.name}...`);
        
        try {
            const response = await axios.get(`http://localhost:${service.port}/health`, {
                timeout: 5000
            });
            
            console.log(`[CHECK] Health check successful: ${JSON.stringify(response.data, null, 2)}`);
            
        } catch (error) {
            console.log(`[X] Health check failed: ${error.message}`);
        }
    }
    
    async performHealthChecks() {
        console.log('\n[HOSPITAL] QBTC ECOSYSTEM HEALTH CHECK');
        console.log('================================');
        
        const services = Array.from(this.deployer.services.values());
        
        for (const service of services) {
            console.log(`\n[MAGNIFY] Checking ${service.name} on port ${service.port}...`);
            
            try {
                const response = await axios.get(`http://localhost:${service.port}/health`, {
                    timeout: 3000
                });
                
                if (response.status === 200) {
                    console.log(`[CHECK] ${service.name}: HEALTHY`);
                    console.log(`   Status: ${response.data.status}`);
                    console.log(`   Uptime: ${response.data.uptime || 'unknown'}s`);
                } else {
                    console.log(`[WARNING] ${service.name}: UNHEALTHY (HTTP ${response.status})`);
                }
                
            } catch (error) {
                if (error.code === 'ECONNREFUSED') {
                    console.log(`[X] ${service.name}: NOT RUNNING`);
                } else {
                    console.log(`[X] ${service.name}: ERROR - ${error.message}`);
                }
            }
        }
        
        console.log('\n[CHART] Health check completed');
    }
    
    async dryRunDeploy() {
        console.log('\n[RUNNER] DRY RUN DEPLOYMENT');
        console.log('===================');
        
        console.log('[CLIPBOARD] Services that would be deployed:');
        this.deployer.services.forEach((service, key) => {
            console.log(`  ${key}: ${service.name} (${service.path}) -> Port ${service.port}`);
        });
        
        console.log('\n[MAGNIFY] Pre-deployment checks:');
        try {
            await this.deployer.runPreDeploymentChecks();
            console.log('[CHECK] All files exist and ports are available');
        } catch (error) {
            console.log(`[X] Pre-deployment check failed: ${error.message}`);
        }
        
        console.log('\n[BULB] To perform actual deployment, run:');
        console.log('   node deploy-qbtc-ecosystem.js');
        console.log('\n[BULB] To test individual services, run:');
        console.log('   node test-qbtc-deploy.js --service temporal');
        console.log('   node test-qbtc-deploy.js --service master_control');
    }
}

// Setup CLI
program
    .version('1.0.0')
    .description('QBTC Ecosystem Test Deployment Tool');

program
    .option('-s, --service <name>', 'Test a single service')
    .option('-d, --dry-run', 'Show what would be deployed without actually deploying')
    .option('-h, --health-check', 'Check health of all services')
    .option('-l, --list', 'List available services');

program.parse(process.argv);

const options = program.opts();
const testDeployer = new QBTCTestDeployer();

// Execute based on options
if (options.list) {
    console.log('\n[CLIPBOARD] Available QBTC Services:');
    testDeployer.deployer.services.forEach((service, key) => {
        console.log(`  ${key}: ${service.name}`);
        console.log(`    Path: ${service.path}`);
        console.log(`    Port: ${service.port}`);
        console.log(`    Critical: ${service.critical ? 'Yes' : 'No'}`);
        console.log('');
    });
    
} else if (options.service) {
    if (options.service === 'all') {
        if (options.dryRun) {
            await testDeployer.dryRunDeploy();
        } else {
            console.log('Use --dry-run with --service all, or specify individual service names');
        }
    } else {
        await testDeployer.testSingleService(options.service);
    }
    
} else if (options.healthCheck) {
    await testDeployer.performHealthChecks();
    
} else if (options.dryRun) {
    await testDeployer.dryRunDeploy();
    
} else {
    // Show help if no options provided
    program.help();
}
