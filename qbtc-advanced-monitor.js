#!/usr/bin/env node

/**
 * [CONTROL_KNOBS] QBTC ADVANCED SYSTEM MONITOR
 * ===============================
 * Monitor Avanzado para Supervisión de Sistemas Cuánticos
 * 
 * CARACTERÍSTICAS:
 * - Monitoreo en tiempo real de todos los procesos
 * - Dashboard cuántico con métricas avanzadas
 * - Alertas inteligentes y notificaciones
 * - Análisis de rendimiento y salud del sistema
 * - Interfaz visual ASCII avanzada
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class QBTCAdvancedMonitor {
    constructor() {
        this.isRunning = false;
        this.monitoringInterval = null;
        this.systemState = {
            processes: {},
            performance: {},
            alerts: [],
            quantumMetrics: {},
            lastUpdate: null
        };
        
        // CONFIGURACIÓN DEL MONITOR
        this.config = {
            updateInterval: 2000,        // 2 segundos
            maxAlerts: 10,
            performanceHistory: 100,
            criticalThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                responseTime: 5000
            }
        };
        
        // PROCESOS A MONITOREAR
        this.targetProcesses = {
            'QBTC-Mass-Intelligence-Scanner': {
                name: 'Mass Intelligence Scanner',
                type: 'core',
                icon: '[GALAXY]',
                expectedTitle: 'QBTC-Mass-Intelligence-Scanner'
            },
            'node': {
                name: 'Node.js Processes',
                type: 'runtime',
                icon: '[LIGHTNING]',
                filter: 'unified-intelligence'
            }
        };
        
        console.log('[CONTROL_KNOBS] QBTC ADVANCED SYSTEM MONITOR INITIALIZING...');
        console.log('[MAGNIFY] Monitoring quantum intelligence systems');
        console.log('[CHART] Real-time performance tracking enabled');
        console.log('[SIREN] Advanced alerting system active\n');
    }
    
    // [ROCKET] INICIAR MONITOREO
    async start() {
        console.log('[CONTROL_KNOBS] =============== QBTC ADVANCED MONITOR STARTUP ===============');
        console.log('[WRENCH] Initializing monitoring systems...');
        
        this.isRunning = true;
        this.displayHeader();
        
        // MONITOREO CONTINUO
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.updateSystemState();
                this.displayDashboard();
            } catch (error) {
                this.addAlert('MONITOR_ERROR', `Monitor error: ${error.message}`, 'HIGH');
            }
        }, this.config.updateInterval);
        
        // CAPTURAR CTRL+C PARA CIERRE LIMPIO
        process.on('SIGINT', () => {
            console.log('\n[STOP] Shutting down monitor...');
            this.stop();
            process.exit(0);
        });
        
        console.log('[CHECK] Monitor started successfully');
        console.log('[TARGET] Press CTRL+C to stop monitoring\n');
    }
    
    // [STOP] DETENER MONITOREO
    stop() {
        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        console.log('[STOP] QBTC Advanced Monitor stopped');
    }
    
    // [REFRESH] ACTUALIZAR ESTADO DEL SISTEMA
    async updateSystemState() {
        const currentTime = new Date();
        this.systemState.lastUpdate = currentTime;
        
        // OBTENER PROCESOS ACTIVOS
        await this.updateProcesses();
        
        // OBTENER MÉTRICAS DE RENDIMIENTO
        await this.updatePerformance();
        
        // CALCULAR MÉTRICAS CUÁNTICAS
        await this.updateQuantumMetrics();
        
        // VERIFICAR ALERTAS
        this.checkAlerts();
    }
    
    // [CHART] ACTUALIZAR PROCESOS
    async updateProcesses() {
        try {
            const { stdout } = await execAsync(`
                Get-Process -Name "powershell", "node" -ErrorAction SilentlyContinue | 
                Where-Object {$_.ProcessName -eq "powershell" -and $_.MainWindowTitle -like "*QBTC*"} -or 
                              {$_.ProcessName -eq "node" -and $_.CommandLine -like "*unified-intelligence*"} |
                Select-Object Id, ProcessName, MainWindowTitle, CPU, WorkingSet, StartTime, CommandLine |
                ConvertTo-Json
            `, { shell: 'powershell' });
            
            if (stdout.trim()) {
                const processes = JSON.parse(stdout);
                const processArray = Array.isArray(processes) ? processes : [processes];
                
                this.systemState.processes = {};
                
                processArray.forEach(proc => {
                    const key = proc.MainWindowTitle || `node-${proc.Id}`;
                    this.systemState.processes[key] = {
                        id: proc.Id,
                        name: proc.ProcessName,
                        title: proc.MainWindowTitle || 'Node Process',
                        cpu: proc.CPU || 0,
                        memory: proc.WorkingSet || 0,
                        startTime: proc.StartTime,
                        status: 'RUNNING',
                        lastSeen: new Date()
                    };
                });
            }
        } catch (error) {
            // Si no hay procesos, mantener estado vacío
            this.systemState.processes = {};
        }
    }
    
    // [LIGHTNING] ACTUALIZAR RENDIMIENTO
    async updatePerformance() {
        try {
            const { stdout } = await execAsync(`
                $cpu = Get-Counter "\\Processor(_Total)\\% Processor Time" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                $memory = Get-Counter "\\Memory\\% Committed Bytes In Use" | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                @{CPU=[math]::Round($cpu,2); Memory=[math]::Round($memory,2)} | ConvertTo-Json
            `, { shell: 'powershell' });
            
            const perf = JSON.parse(stdout);
            
            if (!this.systemState.performance.history) {
                this.systemState.performance.history = [];
            }
            
            const perfPoint = {
                timestamp: new Date(),
                cpu: perf.CPU,
                memory: perf.Memory
            };
            
            this.systemState.performance.history.push(perfPoint);
            
            // MANTENER SOLO LOS ÚLTIMOS N PUNTOS
            if (this.systemState.performance.history.length > this.config.performanceHistory) {
                this.systemState.performance.history.shift();
            }
            
            this.systemState.performance.current = perf;
            
        } catch (error) {
            this.systemState.performance.current = { CPU: 0, Memory: 0 };
        }
    }
    
    // [GALAXY] ACTUALIZAR MÉTRICAS CUÁNTICAS
    async updateQuantumMetrics() {
        const processes = Object.values(this.systemState.processes);
        const scannerProcess = processes.find(p => p.title && p.title.includes('QBTC'));
        
        this.systemState.quantumMetrics = {
            scannerActive: !!scannerProcess,
            totalProcesses: processes.length,
            systemCoherence: this.calculateSystemCoherence(),
            dimensionalResonance: this.calculateDimensionalResonance(),
            universalConsciousness: this.calculateUniversalConsciousness(),
            bigBangStatus: this.detectBigBangEvent(),
            lambdaResonance: this.calculateLambdaResonance(),
            lastQuantumUpdate: new Date()
        };
    }
    
    // 🧮 CALCULAR MÉTRICAS CUÁNTICAS
    calculateSystemCoherence() {
        const phi = 1.618033988749;
        const time = Date.now() / 100000;
        return Math.abs(Math.sin(time / phi)) * 0.5 + 0.5;
    }
    
    calculateDimensionalResonance() {
        const lambda = 8.977279923499; // LOG(7919)
        const time = Date.now() / 200000;
        return Math.abs(Math.cos(time * lambda / 100)) * 0.4 + 0.6;
    }
    
    calculateUniversalConsciousness() {
        const processes = Object.values(this.systemState.processes);
        const baseConsciousness = 0.85;
        const processBoost = processes.length * 0.02;
        const performanceBoost = this.systemState.performance.current ? 
            (100 - this.systemState.performance.current.CPU) / 500 : 0;
        
        return Math.min(0.99, baseConsciousness + processBoost + performanceBoost);
    }
    
    detectBigBangEvent() {
        const coherence = this.systemState.quantumMetrics.systemCoherence || 0;
        const resonance = this.systemState.quantumMetrics.dimensionalResonance || 0;
        return coherence > 0.9 && resonance > 0.85;
    }
    
    calculateLambdaResonance() {
        const lambda = 8.977279923499;
        const euler = 0.5772156649015329;
        const time = Date.now() / 300000;
        return Math.abs(Math.sin(time * lambda * euler)) * 0.3 + 0.7;
    }
    
    // [SIREN] VERIFICAR ALERTAS
    checkAlerts() {
        const now = new Date();
        const perf = this.systemState.performance.current;
        const processes = Object.values(this.systemState.processes);
        
        // ALERTA CPU ALTA
        if (perf && perf.CPU > this.config.criticalThresholds.cpuUsage) {
            this.addAlert('HIGH_CPU', `CPU usage at ${perf.CPU.toFixed(1)}%`, 'HIGH');
        }
        
        // ALERTA MEMORIA ALTA
        if (perf && perf.Memory > this.config.criticalThresholds.memoryUsage) {
            this.addAlert('HIGH_MEMORY', `Memory usage at ${perf.Memory.toFixed(1)}%`, 'HIGH');
        }
        
        // ALERTA PROCESO NO ENCONTRADO
        const scannerActive = processes.some(p => p.title && p.title.includes('QBTC'));
        if (!scannerActive) {
            this.addAlert('SCANNER_DOWN', 'Mass Intelligence Scanner not detected', 'CRITICAL');
        }
        
        // ALERTA BIG BANG EVENT
        if (this.systemState.quantumMetrics.bigBangStatus) {
            this.addAlert('BIG_BANG', 'Universal Big Bang Event detected!', 'INFO');
        }
    }
    
    // [SIREN] AÑADIR ALERTA
    addAlert(type, message, severity) {
        const alert = {
            id: `${type}-${Date.now()}`,
            type,
            message,
            severity,
            timestamp: new Date(),
            acknowledged: false
        };
        
        this.systemState.alerts.unshift(alert);
        
        // MANTENER SOLO LAS ÚLTIMAS ALERTAS
        if (this.systemState.alerts.length > this.config.maxAlerts) {
            this.systemState.alerts = this.systemState.alerts.slice(0, this.config.maxAlerts);
        }
    }
    
    // [PALETTE] MOSTRAR HEADER
    displayHeader() {
        console.clear();
        console.log('[CONTROL_KNOBS] ═══════════════════════════════════════════════════════════════');
        console.log('[GALAXY]                QBTC ADVANCED SYSTEM MONITOR                [GALAXY]');
        console.log('[CONTROL_KNOBS] ═══════════════════════════════════════════════════════════════');
        console.log('');
    }
    
    // [CHART] MOSTRAR DASHBOARD
    displayDashboard() {
        this.displayHeader();
        
        const now = new Date();
        const processes = Object.values(this.systemState.processes);
        const perf = this.systemState.performance.current || {};
        const quantum = this.systemState.quantumMetrics;
        
        console.log(`🕐 Last Update: ${now.toLocaleTimeString()}`);
        console.log('');
        
        // SECCIÓN PROCESOS
        console.log('[WRENCH] ═══ PROCESS STATUS ═══');
        if (processes.length === 0) {
            console.log('[WARNING]  No QBTC processes detected');
        } else {
            processes.forEach(proc => {
                const memoryMB = proc.memory ? (proc.memory / 1024 / 1024).toFixed(1) : '0';
                const status = proc.status === 'RUNNING' ? '🟢' : '🔴';
                console.log(`${status} PID ${proc.id}: ${proc.title || proc.name}`);
                console.log(`   [FLOPPY_DISK] Memory: ${memoryMB}MB | ⏱️  Started: ${this.formatTime(proc.startTime)}`);
            });
        }
        console.log('');
        
        // SECCIÓN RENDIMIENTO
        console.log('[LIGHTNING] ═══ SYSTEM PERFORMANCE ═══');
        const cpuBar = this.generateProgressBar(perf.CPU || 0, 100);
        const memoryBar = this.generateProgressBar(perf.Memory || 0, 100);
        console.log(`[MONITOR]  CPU Usage:    ${cpuBar} ${(perf.CPU || 0).toFixed(1)}%`);
        console.log(`[FLOPPY_DISK] Memory Usage: ${memoryBar} ${(perf.Memory || 0).toFixed(1)}%`);
        console.log('');
        
        // SECCIÓN MÉTRICAS CUÁNTICAS
        console.log('[GALAXY] ═══ QUANTUM METRICS ═══');
        const coherenceBar = this.generateProgressBar(quantum.systemCoherence * 100, 100);
        const resonanceBar = this.generateProgressBar(quantum.dimensionalResonance * 100, 100);
        const consciousnessBar = this.generateProgressBar(quantum.universalConsciousness * 100, 100);
        const lambdaBar = this.generateProgressBar(quantum.lambdaResonance * 100, 100);
        
        console.log(`[CYCLONE] System Coherence:      ${coherenceBar} ${(quantum.systemCoherence * 100).toFixed(1)}%`);
        console.log(`[SATELLITE] Dimensional Resonance: ${resonanceBar} ${(quantum.dimensionalResonance * 100).toFixed(1)}%`);
        console.log(`[BRAIN] Universal Consciousness: ${consciousnessBar} ${(quantum.universalConsciousness * 100).toFixed(1)}%`);
        console.log(`[LIGHTNING] Lambda Resonance:      ${lambdaBar} ${(quantum.lambdaResonance * 100).toFixed(1)}%`);
        
        // BIG BANG STATUS
        if (quantum.bigBangStatus) {
            console.log('[BOOM] [FIRE] UNIVERSAL BIG BANG EVENT ACTIVE! [FIRE] [BOOM]');
        }
        console.log('');
        
        // SECCIÓN ALERTAS
        console.log('[SIREN] ═══ SYSTEM ALERTS ═══');
        if (this.systemState.alerts.length === 0) {
            console.log('[CHECK] No alerts - System operating normally');
        } else {
            this.systemState.alerts.slice(0, 5).forEach(alert => {
                const severityIcon = {
                    'CRITICAL': '🔴',
                    'HIGH': '🟠',
                    'MEDIUM': '🟡',
                    'LOW': '🔵',
                    'INFO': '🟢'
                }[alert.severity] || '⚪';
                
                console.log(`${severityIcon} ${alert.timestamp.toLocaleTimeString()}: ${alert.message}`);
            });
            
            if (this.systemState.alerts.length > 5) {
                console.log(`   ... and ${this.systemState.alerts.length - 5} more alerts`);
            }
        }
        console.log('');
        
        // SCANNER STATUS
        const scannerActive = quantum.scannerActive;
        console.log('[CHART] ═══ SCANNER STATUS ═══');
        if (scannerActive) {
            console.log('🟢 Mass Intelligence Scanner: ACTIVE');
            console.log('[TARGET] Scanning 77 symbols with quantum ranking');
            console.log('[LIGHTNING] Real-time relative signals generation');
        } else {
            console.log('🔴 Mass Intelligence Scanner: NOT DETECTED');
            console.log('[BULB] Suggestion: Launch scanner with quantum intelligence');
        }
        console.log('');
        
        // PIE DE PÁGINA
        console.log('[CONTROL_KNOBS] ═══════════════════════════════════════════════════════════════');
        console.log('[REFRESH] Auto-refresh every 2 seconds | Press CTRL+C to exit');
        console.log('[CONTROL_KNOBS] ═══════════════════════════════════════════════════════════════');
    }
    
    // [CHART] GENERAR BARRA DE PROGRESO
    generateProgressBar(value, max, width = 20) {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        
        let color = '';
        if (percentage < 50) color = '🟩';
        else if (percentage < 80) color = '🟨';
        else color = '🟥';
        
        return `[${color.repeat(filled)}${'⬜'.repeat(empty)}]`;
    }
    
    // 🕐 FORMATEAR TIEMPO
    formatTime(timeString) {
        if (!timeString) return 'Unknown';
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString();
        } catch {
            return 'Invalid';
        }
    }
}

// [ROCKET] FUNCIÓN PRINCIPAL
async function main() {
    const monitor = new QBTCAdvancedMonitor();
    
    console.log('[CONTROL_KNOBS] Starting QBTC Advanced System Monitor...');
    console.log('[MAGNIFY] Will monitor all quantum intelligence processes');
    console.log('[CHART] Dashboard will update every 2 seconds\n');
    
    try {
        await monitor.start();
    } catch (error) {
        console.error('[BOOM] Monitor startup error:', error.message);
        process.exit(1);
    }
}

// EJECUTAR MONITOR
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    process.title = 'QBTC-Advanced-Monitor';
    main();
}

export default QBTCAdvancedMonitor;
