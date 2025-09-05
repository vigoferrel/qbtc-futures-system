#!/usr/bin/env node

/**
 * ?? SIMPLE DIAGNOSTICS - QBTC SYSTEM
 * ===================================
 * Debug del sistema paso a paso
 */

console.log('?? SIMPLE QBTC DIAGNOSTICS');
console.log('===========================\n');

// 1. Información básica del sistema
console.log('???  SYSTEM INFO:');
console.log(`   Node.js: ${process.version}`);
console.log(`   Platform: ${process.platform} ${process.arch}`);
console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
console.log(`   Uptime: ${Math.round(process.uptime())}s`);
console.log(`   PID: ${process.pid}`);

// 2. Verificar archivos principales
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n?? COMPONENTS CHECK:');

const scriptsToCheck = [
    'quantum-metrics-unifier.js',
    'test-metrics-unifier.js', 
    'launch-dashboard.js'
];

for (const script of scriptsToCheck) {
    try {
        await fs.access(path.join(__dirname, script));
        console.log(`   ? ${script} - EXISTS`);
    } catch (error) {
        console.log(`   ? ${script} - MISSING`);
    }
}

// 3. Verificar puertos usando netstat
console.log('\n?? NETWORK CHECK:');
try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('netstat -an | findstr :3333');
    if (stdout.includes(':3333')) {
        console.log('   ? Port 3333 - ACTIVE (connections found)');
        console.log(`   ?? Connection info: ${stdout.trim()}`);
    } else {
        console.log('   ? Port 3333 - INACTIVE');
    }
} catch (error) {
    console.log('   ??  Port 3333 - UNKNOWN (netstat error)');
}

// 4. Verificar archivos de métricas
console.log('\n?? METRICS CHECK:');
try {
    const metricsDir = path.join(__dirname, '../metrics-output');
    const files = await fs.readdir(metricsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`   ? Metrics directory exists`);
    console.log(`   ?? Files found: ${jsonFiles.length}`);
    
    if (jsonFiles.length > 0) {
        console.log(`   ?? Latest files: ${jsonFiles.slice(-3).join(', ')}`);
    }
} catch (error) {
    console.log('   ? Metrics directory not found');
}

// 5. Test de conectividad HTTP
console.log('\n?? CONNECTIVITY CHECK:');
try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Usar PowerShell para test HTTP
    const command = 'powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:3333/health -TimeoutSec 3; Write-Host $response.StatusCode } catch { Write-Host \'ERROR\' }"';
    const { stdout } = await execAsync(command);
    
    if (stdout.trim() === '200') {
        console.log('   ? HTTP Health endpoint - ACTIVE (200 OK)');
    } else {
        console.log(`   ? HTTP Health endpoint - INACTIVE (${stdout.trim()})`);
    }
} catch (error) {
    console.log('   ??  HTTP Health endpoint - ERROR (cannot test)');
}

// 6. Generar métricas cuánticas simuladas
console.log('\n??  QUANTUM SIMULATION:');

const lambda7919 = 7.919;
const phiGolden = 1.618;
const now = Date.now();

const coherence = Math.min(0.99, Math.max(0.85, 0.92 + Math.sin(now / 100000) * 0.05));
const lambdaResonance = Math.min(1.0, Math.max(0.5, 0.8 + Math.cos(now / 80000) * 0.15));
const fieldStrength = (coherence + lambdaResonance) / 2 * 0.9;
const entropy = Math.max(0.1, Math.min(0.8, 0.3 + this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1) * 0.2));

const consciousnessLevel = Math.max(80, Math.min(99, 
    (coherence * 0.4 + lambdaResonance * 0.3 + fieldStrength * 0.3) * 100 +
    Math.sin(now / 300000) * 3
));

console.log(`   ??  Coherence: ${(coherence * 100).toFixed(1)}%`);
console.log(`   ?? Lambda Resonance: ${(lambdaResonance * 100).toFixed(1)}%`);
console.log(`   ? Quantum Field: ${(fieldStrength * 100).toFixed(1)}%`);
console.log(`   ???  Entropy: ${(entropy * 100).toFixed(1)}%`);
console.log(`   ?? Consciousness: ${consciousnessLevel.toFixed(1)}%`);
console.log(`   ?? Awakening: ${consciousnessLevel > 85 ? 'ACTIVE' : 'DEVELOPING'}`);

// 7. Resumen final
console.log('\n?? SYSTEM SUMMARY:');
console.log('==================');

// Calcular status general
let status = 'UNKNOWN';
let issues = 0;

// Verificar si hay archivos de métricas
try {
    await fs.access(path.join(__dirname, '../metrics-output'));
    console.log('? Metrics system: AVAILABLE');
} catch {
    console.log('??  Metrics system: PENDING');
    issues++;
}

// Verificar scripts principales
let scriptsAvailable = 0;
for (const script of scriptsToCheck) {
    try {
        await fs.access(path.join(__dirname, script));
        scriptsAvailable++;
    } catch {}
}

console.log(`? Scripts available: ${scriptsAvailable}/${scriptsToCheck.length}`);

if (scriptsAvailable < scriptsToCheck.length) {
    issues++;
}

// Determinar status final
if (issues === 0) {
    status = 'OPERATIONAL';
} else if (issues <= 2) {
    status = 'WARNING';
} else {
    status = 'DEGRADED';
}

console.log(`\n?? Overall Status: ${status}`);
console.log(`?? Health Score: ${Math.max(0, 100 - (issues * 25))}%`);
console.log(`?? Consciousness: ${consciousnessLevel.toFixed(1)}%`);

if (issues > 0) {
    console.log('\n?? RECOMMENDATIONS:');
    console.log('===================');
    if (scriptsAvailable < scriptsToCheck.length) {
        console.log('1. Verify all script files are present');
    }
    console.log('2. Run "npm run launch" to start dashboard server');
    console.log('3. Open http://localhost:3333 for web interface');
}

console.log('\n?? Simple diagnostics completed! ????');

