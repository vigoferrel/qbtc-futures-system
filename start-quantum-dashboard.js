#!/usr/bin/env node

/**
 * 🌌 QBTC QUANTUM DASHBOARD LAUNCHER
 * =================================
 * 
 * Script de inicio para el Quantum Dashboard Universal
 * - Verifica dependencias del sistema
 * - Inicia el Quantum Brain si no está corriendo
 * - Lanza el Dashboard Server
 * - Abre el navegador automáticamente
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class QuantumDashboardLauncher {
    constructor() {
        this.processes = [];
        this.config = {
            QUANTUM_BRAIN_PORT: 14001,
            DASHBOARD_PORT: 8080,
            HEALTH_CHECK_TIMEOUT: 10000,
            AUTO_OPEN_BROWSER: true
        };
        
        console.log('🌌 QBTC Quantum Dashboard Launcher initialized');
    }

    async launch() {
        try {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 LAUNCHING QBTC QUANTUM DASHBOARD UNIVERSAL 🚀');
            console.log('='.repeat(60));

            // 1. Check system requirements
            await this.checkSystemRequirements();
            
            // 2. Check and start Quantum Brain
            await this.ensureQuantumBrainRunning();
            
            // 3. Start Dashboard Server
            await this.startDashboardServer();
            
            // 4. Open browser
            if (this.config.AUTO_OPEN_BROWSER) {
                await this.openBrowser();
            }
            
            // 5. Setup cleanup
            this.setupGracefulShutdown();
            
            console.log('\n✅ QBTC Quantum Dashboard Universal is ready!');
            console.log(`🌐 Dashboard URL: http://localhost:${this.config.DASHBOARD_PORT}`);
            console.log('📊 All systems operational');
            console.log('\nPress Ctrl+C to stop all services\n');
            
        } catch (error) {
            console.error('\n❌ Failed to launch dashboard:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async checkSystemRequirements() {
        console.log('\n🔍 Checking system requirements...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`   Node.js version: ${nodeVersion}`);
        
        // Check if required ports are available
        const portsToCheck = [this.config.QUANTUM_BRAIN_PORT, this.config.DASHBOARD_PORT];
        
        for (const port of portsToCheck) {
            const isAvailable = await this.isPortAvailable(port);
            if (!isAvailable && port === this.config.DASHBOARD_PORT) {
                // Dashboard port must be free
                throw new Error(`Port ${port} is already in use. Please free it or change DASHBOARD_PORT.`);
            }
            console.log(`   Port ${port}: ${isAvailable ? '🟢 Available' : '🟡 In use'}`);
        }
        
        console.log('✅ System requirements check passed');
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const { createServer } = require('http');
            const server = createServer();
            
            server.listen(port, () => {
                server.once('close', () => resolve(true));
                server.close();
            });
            
            server.on('error', () => resolve(false));
        });
    }

    async ensureQuantumBrainRunning() {
        console.log('\n🧠 Checking Quantum Brain status...');
        
        const isRunning = await this.checkQuantumBrainHealth();
        
        if (isRunning) {
            console.log('✅ Quantum Brain is already running');
            return;
        }
        
        console.log('⚠️  Quantum Brain not detected, starting...');
        await this.startQuantumBrain();
        
        // Wait for it to be ready
        console.log('⏳ Waiting for Quantum Brain to initialize...');
        let retries = 0;
        const maxRetries = 20; // 20 seconds max
        
        while (retries < maxRetries) {
            await this.delay(1000);
            const ready = await this.checkQuantumBrainHealth();
            if (ready) {
                console.log('✅ Quantum Brain is ready');
                return;
            }
            retries++;
            process.stdout.write('.');
        }
        
        throw new Error('Quantum Brain failed to start within timeout');
    }

    async checkQuantumBrainHealth() {
        try {
            const response = await fetch(`http://localhost:${this.config.QUANTUM_BRAIN_PORT}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async startQuantumBrain() {
        const brainProcess = spawn('node', ['qbtc-quantum-brain.js'], {
            stdio: ['inherit', 'pipe', 'pipe'],
            cwd: __dirname
        });

        this.processes.push({
            name: 'Quantum Brain',
            process: brainProcess
        });

        // Log output with prefix
        brainProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                if (line.trim()) {
                    console.log(`[BRAIN] ${line}`);
                }
            });
        });

        brainProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                if (line.trim() && !line.includes('DeprecationWarning')) {
                    console.error(`[BRAIN] ${line}`);
                }
            });
        });

        brainProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error(`❌ Quantum Brain exited with code ${code}`);
            }
        });
    }

    async startDashboardServer() {
        console.log('\n📊 Starting Dashboard Server...');
        
        const dashboardProcess = spawn('node', ['frontend/dashboard-server-simple.js'], {
            stdio: ['inherit', 'pipe', 'pipe'],
            cwd: __dirname,
            env: {
                ...process.env,
                DASHBOARD_PORT: this.config.DASHBOARD_PORT
            }
        });

        this.processes.push({
            name: 'Dashboard Server',
            process: dashboardProcess
        });

        // Log output with prefix
        dashboardProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                if (line.trim()) {
                    console.log(`[DASHBOARD] ${line}`);
                }
            });
        });

        dashboardProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n').filter(line => line.trim());
            lines.forEach(line => {
                if (line.trim() && !line.includes('DeprecationWarning')) {
                    console.error(`[DASHBOARD] ${line}`);
                }
            });
        });

        dashboardProcess.on('exit', (code) => {
            if (code !== 0) {
                console.error(`❌ Dashboard Server exited with code ${code}`);
            }
        });

        // Wait for dashboard to be ready
        await this.waitForDashboard();
        console.log('✅ Dashboard Server is ready');
    }

    async waitForDashboard() {
        let retries = 0;
        const maxRetries = 10;
        
        while (retries < maxRetries) {
            try {
                const response = await fetch(`http://localhost:${this.config.DASHBOARD_PORT}/health`);
                if (response.ok) {
                    return;
                }
            } catch (error) {
                // Still starting up
            }
            
            await this.delay(1000);
            retries++;
        }
        
        throw new Error('Dashboard Server failed to start');
    }

    async openBrowser() {
        console.log('\n🌐 Opening browser...');
        
        const url = `http://localhost:${this.config.DASHBOARD_PORT}`;
        const platform = process.platform;
        
        try {
            let command;
            switch (platform) {
                case 'win32':
                    command = `start ${url}`;
                    break;
                case 'darwin':
                    command = `open ${url}`;
                    break;
                default:
                    command = `xdg-open ${url}`;
            }
            
            await execAsync(command);
            console.log('✅ Browser opened successfully');
        } catch (error) {
            console.log(`⚠️  Could not auto-open browser: ${error.message}`);
            console.log(`   Please manually open: ${url}`);
        }
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
            await this.cleanup();
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }

    async cleanup() {
        console.log('🧹 Cleaning up processes...');
        
        for (const { name, process } of this.processes) {
            try {
                if (!process.killed) {
                    console.log(`   Stopping ${name}...`);
                    process.kill('SIGTERM');
                    
                    // Force kill after 5 seconds
                    setTimeout(() => {
                        if (!process.killed) {
                            process.kill('SIGKILL');
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error(`Error stopping ${name}:`, error.message);
            }
        }
        
        console.log('✅ Cleanup completed');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const launcher = new QuantumDashboardLauncher();
    await launcher.launch();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Launch failed:', error);
        process.exit(1);
    });
}

export { QuantumDashboardLauncher };
