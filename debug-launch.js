#!/usr/bin/env node

/**
 * DEBUG LAUNCH - QBTC System Debug Launcher
 * ========================================
 * Simplified launcher to capture and diagnose system startup issues
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';

console.log('[DEBUG] Starting QBTC System Debug Launch...');
console.log('[DEBUG] Timestamp:', new Date().toISOString());

// Create debug log file
const logFile = 'debug-launch.log';

async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    await fs.appendFile(logFile, logEntry);
    console.log(logEntry.trim());
}

async function checkPortAvailability() {
    console.log('[DEBUG] Checking port availability...');
    
    const ports = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007];
    
    for (const port of ports) {
        try {
            const { spawn } = await import('child_process');
            const netstat = spawn('netstat', ['-ano'], { stdio: 'pipe' });
            
            let output = '';
            netstat.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            await new Promise((resolve) => {
                netstat.on('close', () => resolve());
            });
            
            if (output.includes(`:${port} `)) {
                await logToFile(`[WARNING] Port ${port} appears to be in use`);
            } else {
                await logToFile(`[CHECK] Port ${port} available`);
            }
        } catch (error) {
            await logToFile(`[ERROR] Failed to check port ${port}: ${error.message}`);
        }
    }
}

async function launchSystemWithDebug() {
    await logToFile('[DEBUG] Starting Ultra Perfect System with debug...');
    
    const proc = spawn('node', ['launch-ultra-perfect-system.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
    });
    
    let stdoutData = '';
    let stderrData = '';
    
    proc.stdout.on('data', (data) => {
        const text = data.toString();
        stdoutData += text;
        text.split('\n').forEach(line => {
            if (line.trim()) {
                logToFile(`[STDOUT] ${line}`);
            }
        });
    });
    
    proc.stderr.on('data', (data) => {
        const text = data.toString();
        stderrData += text;
        text.split('\n').forEach(line => {
            if (line.trim()) {
                logToFile(`[STDERR] ${line}`);
            }
        });
    });
    
    proc.on('error', (error) => {
        logToFile(`[ERROR] Process error: ${error.message}`);
    });
    
    proc.on('exit', (code, signal) => {
        logToFile(`[EXIT] Process exited with code ${code}, signal ${signal}`);
        logToFile(`[DEBUG] STDOUT Length: ${stdoutData.length}`);
        logToFile(`[DEBUG] STDERR Length: ${stderrData.length}`);
        
        // Show first 1000 chars of each for debugging
        if (stdoutData.length > 0) {
            logToFile(`[DEBUG] STDOUT Sample: ${stdoutData.substring(0, 1000)}`);
        }
        if (stderrData.length > 0) {
            logToFile(`[DEBUG] STDERR Sample: ${stderrData.substring(0, 1000)}`);
        }
    });
    
    // Kill the process after 15 seconds
    setTimeout(() => {
        if (!proc.killed) {
            logToFile('[DEBUG] Killing process after 15 seconds...');
            proc.kill('SIGTERM');
            
            setTimeout(() => {
                if (!proc.killed) {
                    proc.kill('SIGKILL');
                }
            }, 2000);
        }
    }, 15000);
    
    return new Promise((resolve) => {
        proc.on('exit', resolve);
    });
}

async function main() {
    try {
        // Clear previous log
        await fs.writeFile(logFile, '');
        
        await logToFile('[DEBUG] Debug launcher started');
        await checkPortAvailability();
        await launchSystemWithDebug();
        await logToFile('[DEBUG] Debug launch completed');
        
        console.log('\n[DEBUG] Check debug-launch.log for detailed logs');
        
    } catch (error) {
        await logToFile(`[FATAL] Debug launcher error: ${error.message}`);
        console.error('[FATAL] Debug launcher error:', error);
    }
}

main();
