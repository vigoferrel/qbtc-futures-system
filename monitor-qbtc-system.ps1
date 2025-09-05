#!/usr/bin/env pwsh

<#
.SYNOPSIS
    [GLOBE] QBTC System Status Monitor Script
    
.DESCRIPTION
    Este script monitorea el estado del sistema QBTC completo:
    - Unified System Monitor (Puerto 14401)
    - Mass Intelligence Scanner 
    - Quantum Core Engine (Puerto 14105)
    - PowerShell Jobs del sistema
    
.NOTES
    Compatible con la arquitectura de puertos QBTC (14000-14999)
    Configurado para la arquitectura definida en system-architecture-overview
#>

param(
    [switch]$Continuous = $false,
    [int]$IntervalSeconds = 30
)

function Show-QBTCSystemStatus {
    Clear-Host
    Write-Host "[GALAXY] =============== QBTC SYSTEM STATUS MONITOR ===============" -ForegroundColor Cyan
    Write-Host "[CALENDAR] Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
    Write-Host ""
    
    # 1. VERIFICAR JOBS DE POWERSHELL
    Write-Host "[CONTROL_KNOBS] PowerShell Jobs Status:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    $jobs = Get-Job -ErrorAction SilentlyContinue
    if ($jobs) {
        $jobs | Format-Table Id, Name, State, HasMoreData -AutoSize | Out-String | Write-Host
        
        # Mostrar jobs activos
        $runningJobs = $jobs | Where-Object { $_.State -eq "Running" }
        Write-Host "[CHECK] Jobs activos: $($runningJobs.Count)" -ForegroundColor Green
        
        # Mostrar jobs completados/fallidos
        $completedJobs = $jobs | Where-Object { $_.State -eq "Completed" }
        $failedJobs = $jobs | Where-Object { $_.State -eq "Failed" }
        if ($completedJobs.Count -gt 0) {
            Write-Host "ℹ️ Jobs completados: $($completedJobs.Count)" -ForegroundColor Blue
        }
        if ($failedJobs.Count -gt 0) {
            Write-Host "[X] Jobs fallidos: $($failedJobs.Count)" -ForegroundColor Red
        }
    } else {
        Write-Host "[X] No hay jobs de QBTC ejecutándose" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # 2. VERIFICAR PUERTOS QBTC
    Write-Host "[GLOBE] QBTC Ports Status (Architecture Range 14000-14999):" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    $qbtcPorts = @{
        "14105" = "Quantum Core Engine"
        "14401" = "Master Control Dashboard (Unified Monitor)"
        "3001"  = "Legacy Port (should be migrated)"
    }
    
    foreach ($port in $qbtcPorts.Keys) {
        $portCheck = netstat -ano | Select-String ":$port.*LISTENING"
        if ($portCheck) {
            Write-Host "[CHECK] Port $port ($($qbtcPorts[$port])): ACTIVE" -ForegroundColor Green
            $portCheck | ForEach-Object { 
                $parts = $_.ToString().Trim() -split '\s+'
                $pid = $parts[-1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        $memoryMB = [math]::Round($process.WorkingSet / 1MB, 1)
                        Write-Host "   └─ PID: $pid, Process: $($process.ProcessName), Memory: ${memoryMB}MB" -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "   └─ PID: $pid (process info unavailable)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "[X] Port $port ($($qbtcPorts[$port])): INACTIVE" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    
    # 3. VERIFICAR PROCESOS NODE.JS
    Write-Host "[ATOM] Node.js Processes:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
            $cpuPercent = if ($_.CPU) { [math]::Round($_.CPU, 2) } else { 0 }
            Write-Host "[CHECK] PID: $($_.Id) | CPU: ${cpuPercent}s | Memory: ${memoryMB}MB | Start: $($_.StartTime.ToString('HH:mm:ss'))" -ForegroundColor Green
        }
        Write-Host "[CHART] Total Node.js processes: $($nodeProcesses.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "[X] No Node.js processes found" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # 4. VERIFICAR CONNECTIVITY
    Write-Host "[EARTH] QBTC Services Connectivity:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    # Test Dashboard
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:14401" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "[CHECK] Dashboard (http://localhost:14401): ACCESSIBLE" -ForegroundColor Green
    } catch {
        Write-Host "[X] Dashboard (http://localhost:14401): NOT ACCESSIBLE" -ForegroundColor Red
    }
    
    # Test Quantum Core Health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:14105/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "[CHECK] Quantum Core Health (http://localhost:14105/health): ACCESSIBLE" -ForegroundColor Green
    } catch {
        Write-Host "[X] Quantum Core Health (http://localhost:14105/health): NOT ACCESSIBLE" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # 5. SYSTEM RESOURCES
    Write-Host "[CHART] System Resources:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    # CPU Usage
    try {
        $cpuCounter = Get-Counter "\Processor(_Total)\% Processor Time" -ErrorAction SilentlyContinue
        $cpuUsage = [math]::Round($cpuCounter.CounterSamples[0].CookedValue, 1)
        $cpuColor = if ($cpuUsage -gt 80) { "Red" } elseif ($cpuUsage -gt 50) { "Yellow" } else { "Green" }
        Write-Host "[MONITOR] CPU Usage: $cpuUsage%" -ForegroundColor $cpuColor
    } catch {
        Write-Host "[MONITOR] CPU Usage: Unable to determine" -ForegroundColor Gray
    }
    
    # Memory Usage
    try {
        $memCounter = Get-Counter "\Memory\% Committed Bytes In Use" -ErrorAction SilentlyContinue
        $memUsage = [math]::Round($memCounter.CounterSamples[0].CookedValue, 1)
        $memColor = if ($memUsage -gt 85) { "Red" } elseif ($memUsage -gt 70) { "Yellow" } else { "Green" }
        Write-Host "[FLOPPY_DISK] Memory Usage: $memUsage%" -ForegroundColor $memColor
    } catch {
        Write-Host "[FLOPPY_DISK] Memory Usage: Unable to determine" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "[STAR] QBTC System using SAFE PORT RANGE 14000-14999 (Anti-Conflict Zone)" -ForegroundColor Magenta
    Write-Host "[LINK] Access Points:" -ForegroundColor Cyan
    Write-Host "   [CHART] Main Dashboard: http://localhost:14401" -ForegroundColor White
    Write-Host "   🔬 Quantum Health: http://localhost:14105/health" -ForegroundColor White
    Write-Host "===============================================================" -ForegroundColor Cyan
}

# FUNCTION TO START QBTC SYSTEM
function Start-QBTCSystem {
    Write-Host "[ROCKET] Starting QBTC System..." -ForegroundColor Green
    
    # Start Unified Monitor
    try {
        $unifiedMonitorJob = Start-Job -ScriptBlock { 
            Set-Location "C:\Users\DELL\Desktop\qbtc-futures-system"
            node qbtc-unified-system-monitor.js 
        } -Name "QBTC-UnifiedMonitor"
        Write-Host "[CHECK] Unified Monitor started (Job ID: $($unifiedMonitorJob.Id))" -ForegroundColor Green
    } catch {
        Write-Host "[X] Failed to start Unified Monitor: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Start Mass Scanner
    try {
        $massScannerJob = Start-Job -ScriptBlock { 
            Set-Location "C:\Users\DELL\Desktop\qbtc-futures-system"
            node qbtc-mass-scanner.js 
        } -Name "QBTC-MassScanner"
        Write-Host "[CHECK] Mass Scanner started (Job ID: $($massScannerJob.Id))" -ForegroundColor Green
    } catch {
        Write-Host "[X] Failed to start Mass Scanner: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "[CONTROL_KNOBS] QBTC System startup initiated. Use 'Show-QBTCSystemStatus' to monitor." -ForegroundColor Cyan
}

# MAIN EXECUTION
if ($Continuous) {
    Write-Host "[REFRESH] Starting continuous monitoring mode (interval: ${IntervalSeconds}s)" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop..." -ForegroundColor Gray
    
    while ($true) {
        Show-QBTCSystemStatus
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Show-QBTCSystemStatus
}

# EXPORT FUNCTIONS FOR MANUAL USE
Export-ModuleMember -Function Show-QBTCSystemStatus, Start-QBTCSystem
