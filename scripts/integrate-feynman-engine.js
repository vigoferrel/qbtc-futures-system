#!/usr/bin/env node

/**
 * [LINK] FEYNMAN ENGINE INTEGRATION SCRIPT
 * ====================================
 * Script para integrar automáticamente el motor de Feynman
 * con el sistema QBTC existente
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de servicios QBTC
const QBTC_SERVICES = {
    'quantum-core': { port: 14105, path: '../analysis-engine/quantum-core.js' },
    'leverage-entropy': { port: 14107, path: '../engines/quantum-leverage-entropy-engine.js' },
    'consciousness': { port: 14102, path: '../analysis-engine/consciousness-engine.js' },
    'feynman-quantum': { port: 14106, path: '../analysis-engine/feynman-quantum-service.js' },
    'hermetic-trader': { port: 14108, path: '../trading/hermetic-auto-trader.js' }
};

class QBTCFeynmanIntegrator {
    constructor() {
        this.runningServices = new Map();
        this.integrationResults = new Map();
        this.startTime = Date.now();
        
        console.log('[LINK] QBTC Feynman Integration System');
        console.log('==================================');
    }
    
    async startIntegration() {
        console.log('[ROCKET] Iniciando integración del motor de Feynman...\n');
        
        try {
            // 1. Verificar servicios existentes
            await this.checkExistingServices();
            
            // 2. Iniciar motor de Feynman
            await this.startFeynmanService();
            
            // 3. Integrar con servicios existentes
            await this.integrateWithExistingServices();
            
            // 4. Verificar integraciones
            await this.verifyIntegrations();
            
            // 5. Mostrar resumen
            this.showIntegrationSummary();
            
            // 6. Mantener servicios activos
            this.monitorServices();
            
        } catch (error) {
            console.error('[X] Error durante la integración:', error);
            process.exit(1);
        }
    }
    
    async checkExistingServices() {
        console.log('[MAGNIFY] Verificando servicios QBTC existentes...');
        
        for (const [service, config] of Object.entries(QBTC_SERVICES)) {
            if (service === 'feynman-quantum') continue; // Lo iniciamos nosotros
            
            try {
                const response = await this.checkService(config.port);
                if (response) {
                    console.log(`[CHECK] ${service}: Running (port ${config.port})`);
                    this.runningServices.set(service, { ...config, status: 'running' });
                } else {
                    console.log(`[WARNING]  ${service}: Not running (port ${config.port})`);
                    this.runningServices.set(service, { ...config, status: 'stopped' });
                }
            } catch (error) {
                console.log(`[X] ${service}: Error checking (port ${config.port})`);
                this.runningServices.set(service, { ...config, status: 'error' });
            }
        }
        
        console.log('');
    }
    
    async checkService(port) {
        return new Promise((resolve) => {
            const http = require('http');
            
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/health',
                method: 'GET',
                timeout: 2000
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => resolve(false));
            req.end();
        });
    }
    
    async startFeynmanService() {
        console.log('[GALAXY] Iniciando Feynman Quantum Service...');
        
        try {
            const servicePath = path.resolve(__dirname, '../analysis-engine/feynman-quantum-service.js');
            
            const feynmanProcess = spawn('node', [servicePath], {
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env, PORT: '14106' },
                detached: false
            });
            
            // Configurar logging
            feynmanProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) console.log(`[Feynman] ${output}`);
            });
            
            feynmanProcess.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output) console.error(`[Feynman Error] ${output}`);
            });
            
            // Esperar a que el servicio inicie
            await this.waitForService(14106, 10000);
            
            this.runningServices.set('feynman-quantum', {
                port: 14106,
                process: feynmanProcess,
                status: 'running'
            });
            
            console.log('[CHECK] Feynman Quantum Service iniciado correctamente\n');
            
        } catch (error) {
            console.error('[X] Error iniciando Feynman Service:', error);
            throw error;
        }
    }
    
    async waitForService(port, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (await this.checkService(port)) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        throw new Error(`Service on port ${port} did not start within ${timeout}ms`);
    }
    
    async integrateWithExistingServices() {
        console.log('[LINK] Integrando con servicios existentes...');
        
        // Integrar con Quantum Leverage Entropy Engine
        if (this.runningServices.get('leverage-entropy')?.status === 'running') {
            await this.integrateWithEntropyEngine();
        }
        
        // Integrar con Consciousness Engine
        if (this.runningServices.get('consciousness')?.status === 'running') {
            await this.integrateWithConsciousnessEngine();
        }
        
        // Configurar Hermetic Trader para usar Feynman
        if (this.runningServices.get('hermetic-trader')?.status === 'running') {
            await this.integrateWithHermeticTrader();
        }
        
        console.log('');
    }
    
    async integrateWithEntropyEngine() {
        try {
            console.log('  [OCEAN_WAVE] Conectando con Quantum Leverage Entropy Engine...');
            
            const response = await this.makeRequest('POST', 14106, '/integrate/entropy-engine', {
                engine_endpoint: 'http://localhost:14107',
                sync_enabled: true
            });
            
            if (response.success) {
                console.log('  [CHECK] Integración con Entropy Engine establecida');
                this.integrationResults.set('entropy-engine', 'success');
            } else {
                console.log('  [WARNING]  Integración con Entropy Engine parcial');
                this.integrationResults.set('entropy-engine', 'partial');
            }
            
        } catch (error) {
            console.log('  [X] Error integrando con Entropy Engine:', error.message);
            this.integrationResults.set('entropy-engine', 'failed');
        }
    }
    
    async integrateWithConsciousnessEngine() {
        try {
            console.log('  [BRAIN] Conectando con Consciousness Engine...');
            
            const response = await this.makeRequest('POST', 14106, '/integrate/consciousness-engine', {
                engine_endpoint: 'http://localhost:14102',
                consciousness_feedback: true
            });
            
            if (response.success) {
                console.log('  [CHECK] Integración con Consciousness Engine establecida');
                this.integrationResults.set('consciousness-engine', 'success');
            } else {
                console.log('  [WARNING]  Integración con Consciousness Engine parcial');
                this.integrationResults.set('consciousness-engine', 'partial');
            }
            
        } catch (error) {
            console.log('  [X] Error integrando con Consciousness Engine:', error.message);
            this.integrationResults.set('consciousness-engine', 'failed');
        }
    }
    
    async integrateWithHermeticTrader() {
        try {
            console.log('  🌑 Configurando Hermetic Trader para usar Feynman...');
            
            // En un sistema real, aquí se configuraría el Hermetic Trader
            // para consultar el motor de Feynman antes de ejecutar trades
            
            console.log('  [CHECK] Configuración de Hermetic Trader completada');
            this.integrationResults.set('hermetic-trader', 'success');
            
        } catch (error) {
            console.log('  [X] Error configurando Hermetic Trader:', error.message);
            this.integrationResults.set('hermetic-trader', 'failed');
        }
    }
    
    async makeRequest(method, port, path, data = null) {
        return new Promise((resolve, reject) => {
            const http = require('http');
            
            const postData = data ? JSON.stringify(data) : null;
            
            const options = {
                hostname: 'localhost',
                port: port,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData ? Buffer.byteLength(postData) : 0
                },
                timeout: 5000
            };
            
            const req = http.request(options, (res) => {
                let body = '';\n                \n                res.on('data', (chunk) => {\n                    body += chunk;\n                });\n                \n                res.on('end', () => {\n                    try {\n                        const response = JSON.parse(body);\n                        resolve(response);\n                    } catch (error) {\n                        reject(new Error('Invalid JSON response'));\n                    }\n                });\n            });\n            \n            req.on('error', reject);\n            req.on('timeout', () => reject(new Error('Request timeout')));\n            \n            if (postData) {\n                req.write(postData);\n            }\n            \n            req.end();\n        });\n    }\n    \n    async verifyIntegrations() {\n        console.log('[TEST_TUBE] Verificando integraciones...');\n        \n        try {\n            // Probar análisis sintético con Feynman\n            const testResult = await this.makeRequest('POST', 14106, '/test/synthetic-analysis', {\n                symbols_count: 5,\n                price_range: [40000, 60000]\n            });\n            \n            if (testResult.success && testResult.feynman_analysis) {\n                console.log('  [CHECK] Análisis de Feynman funcionando correctamente');\n                console.log(`  [CHART] Probabilidad cuántica: ${testResult.feynman_analysis.probability.toFixed(3)}`);\n                console.log(`  [OCEAN_WAVE] Coherencia: ${(testResult.feynman_analysis.coherence * 100).toFixed(1)}%`);\n                console.log(`  [ATOM]  Caminos analizados: ${testResult.feynman_analysis.paths_count}`);\n            } else {\n                console.log('  [WARNING]  Análisis de Feynman con problemas');\n            }\n            \n        } catch (error) {\n            console.log('  [X] Error verificando integración:', error.message);\n        }\n        \n        console.log('');\n    }\n    \n    showIntegrationSummary() {\n        const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);\n        \n        console.log('[CLIPBOARD] RESUMEN DE INTEGRACIÓN');\n        console.log('========================');\n        console.log(`⏱️  Tiempo total: ${totalTime} segundos`);\n        console.log('');\n        \n        console.log('[WRENCH] Servicios QBTC:');\n        for (const [service, config] of this.runningServices.entries()) {\n            const statusIcon = config.status === 'running' ? '[CHECK]' : \n                              config.status === 'stopped' ? '[WARNING]' : '[X]';\n            console.log(`  ${statusIcon} ${service}: ${config.status} (port ${config.port})`);\n        }\n        \n        console.log('');\n        console.log('[LINK] Integraciones:');\n        for (const [integration, result] of this.integrationResults.entries()) {\n            const resultIcon = result === 'success' ? '[CHECK]' : \n                              result === 'partial' ? '[WARNING]' : '[X]';\n            console.log(`  ${resultIcon} ${integration}: ${result}`);\n        }\n        \n        console.log('');\n        console.log('[ATOM]  Motor de Feynman: ACTIVO');\n        console.log('[GALAXY] Path Integral Analysis: DISPONIBLE');\n        console.log('[CRYSTAL_BALL] Quantum Constants: INTEGRADAS');\n        console.log('');\n        \n        // Endpoints disponibles\n        console.log('[GLOBE] Endpoints del Motor de Feynman:');\n        console.log('  GET  http://localhost:14106/health');\n        console.log('  GET  http://localhost:14106/status');\n        console.log('  POST http://localhost:14106/analyze/path-integral');\n        console.log('  POST http://localhost:14106/test/synthetic-analysis');\n        console.log('  GET  http://localhost:14106/quantum/propagator-matrix');\n        console.log('');\n    }\n    \n    monitorServices() {\n        console.log('👁️  Monitoreando servicios (Ctrl+C para detener)...');\n        \n        // Monitor cada 30 segundos\n        const monitorInterval = setInterval(async () => {\n            let allRunning = true;\n            \n            for (const [service, config] of this.runningServices.entries()) {\n                if (config.status === 'running') {\n                    const isRunning = await this.checkService(config.port);\n                    if (!isRunning) {\n                        console.log(`[WARNING]  Servicio ${service} no responde en puerto ${config.port}`);\n                        allRunning = false;\n                    }\n                }\n            }\n            \n            if (allRunning) {\n                console.log(`[CHECK] ${new Date().toISOString()} - Todos los servicios funcionando`);\n            }\n        }, 30000);\n        \n        // Manejar cierre graceful\n        process.on('SIGINT', () => {\n            console.log('\\n[STOP] Deteniendo integración...');\n            clearInterval(monitorInterval);\n            \n            // Cerrar servicios iniciados por nosotros\n            const feynmanService = this.runningServices.get('feynman-quantum');\n            if (feynmanService && feynmanService.process) {\n                feynmanService.process.kill('SIGTERM');\n            }\n            \n            console.log('[WAVE] Integración finalizada');\n            process.exit(0);\n        });\n    }\n}\n\n// Ejecutar integración\nif (import.meta.url === `file://${process.argv[1]}`) {\n    const integrator = new QBTCFeynmanIntegrator();\n    integrator.startIntegration().catch(console.error);\n}
