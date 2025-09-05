#!/usr/bin/env pwsh

<#
.SYNOPSIS
[ROCKET] QBTC QUICK START - Lanzador Rápido del Sistema Completo

.DESCRIPTION
Inicia rápidamente todos los componentes del sistema QBTC:
- Mass Intelligence Scanner
- Web Dashboard Monitor  
- Trading Engine
- System Monitor

.EXAMPLE
.\start-qbtc.ps1
.\start-qbtc.ps1 -WebPort 3002
.\start-qbtc.ps1 -ShowLogs
#>

param(
    [int]$WebPort = 3001,
    [switch]$ShowLogs,
    [switch]$RestartExisting
)

# Colores para output
$Colors = @{
    Header = "Cyan"
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Blue"
    Quantum = "DarkCyan"
}

function Write-QBTCQuickLog {
    param(
        [string]$Message,
        [string]$Color = "Info"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $colorValue = $Colors[$Color]
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $colorValue
}

# Header
Clear-Host
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
Write-Host "[GALAXY] QBTC QUANTUM FUTURES SYSTEM - QUICK START [GALAXY]" -ForegroundColor $Colors.Header
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
Write-Host ""

# Verificar Node.js
Write-QBTCQuickLog "[MAGNIFY] Verificando entorno..." "Quantum"
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-QBTCQuickLog "[CHECK] Node.js detectado: $nodeVersion" "Success"
    } else {
        throw "Node.js no encontrado"
    }
} catch {
    Write-QBTCQuickLog "[X] Node.js no está instalado. Instale Node.js primero." "Error"
    exit 1
}

# Crear directorio de logs si no existe
$logsPath = Join-Path $PWD "logs"
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
    Write-QBTCQuickLog "📁 Directorio de logs creado" "Success"
}

# Lista de procesos para iniciar
$processes = @(
    @{
        Name = "Mass Intelligence Scanner"
        Script = "qbtc-mass-scanner.js"
        Title = "QBTC - Mass Intelligence Scanner"
        Critical = $true
    },
    @{
        Name = "Web Dashboard Monitor"
        Script = "qbtc-web-monitor.js"
        Title = "QBTC - Web Dashboard Monitor"
        Critical = $false
    }
    # Agregar más procesos según estén disponibles
)

# Verificar archivos existentes
$missingScripts = @()
foreach ($proc in $processes) {
    $scriptPath = Join-Path $PWD $proc.Script
    if (-not (Test-Path $scriptPath)) {
        $missingScripts += $proc.Script
    }
}

if ($missingScripts.Count -gt 0) {
    Write-QBTCQuickLog "[X] Scripts faltantes: $($missingScripts -join ', ')" "Error"
    Write-QBTCQuickLog "[BULB] Asegúrese de que todos los scripts estén en el directorio actual" "Warning"
    exit 1
}

# Verificar procesos existentes si se solicita restart
if ($RestartExisting) {
    Write-QBTCQuickLog "[REFRESH] Deteniendo procesos existentes..." "Warning"
    Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.MainWindowTitle -like "*QBTC*" } |
        Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Iniciar procesos
Write-QBTCQuickLog "[ROCKET] Iniciando procesos QBTC..." "Quantum"
Write-Host ""

$startedProcesses = @()
$failedProcesses = @()

foreach ($proc in $processes) {
    Write-QBTCQuickLog "[LIGHTNING] Iniciando $($proc.Name)..." "Info"
    
    try {
        $arguments = @($proc.Script)
        
        # Agregar puerto si es el monitor web
        if ($proc.Script -eq "qbtc-web-monitor.js" -and $WebPort -ne 3001) {
            $arguments += "--port", $WebPort
        }
        
        $processInfo = Start-Process -FilePath "node" -ArgumentList $arguments -WindowStyle "Normal" -PassThru
        
        # Verificar que el proceso se inició correctamente
        Start-Sleep -Seconds 2
        
        if ($processInfo -and -not $processInfo.HasExited) {
            Write-QBTCQuickLog "[CHECK] $($proc.Name) iniciado correctamente (PID: $($processInfo.Id))" "Success"
            $startedProcesses += @{
                Name = $proc.Name
                PID = $processInfo.Id
                Script = $proc.Script
            }
        } else {
            throw "El proceso falló al iniciar"
        }
        
    } catch {
        Write-QBTCQuickLog "[X] Error al iniciar $($proc.Name): $($_.Exception.Message)" "Error"
        $failedProcesses += $proc.Name
        
        if ($proc.Critical) {
            Write-QBTCQuickLog "[WARNING] Proceso crítico falló - continuando con otros procesos" "Warning"
        }
    }
    
    # Pausa entre inicios
    Start-Sleep -Seconds 1
}

# Resumen final
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
Write-Host "[CHART] RESUMEN DE INICIO" -ForegroundColor $Colors.Header
Write-Host "══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header

if ($startedProcesses.Count -gt 0) {
    Write-QBTCQuickLog "[CHECK] Procesos iniciados exitosamente:" "Success"
    foreach ($proc in $startedProcesses) {
        Write-Host "   🔹 $($proc.Name) (PID: $($proc.PID))" -ForegroundColor $Colors.Success
    }
}

if ($failedProcesses.Count -gt 0) {
    Write-QBTCQuickLog "[X] Procesos que fallaron al iniciar:" "Error"
    foreach ($proc in $failedProcesses) {
        Write-Host "   🔸 $proc" -ForegroundColor $Colors.Error
    }
}

# Información importante
Write-Host ""
if ($startedProcesses | Where-Object { $_.Script -eq "qbtc-web-monitor.js" }) {
    Write-QBTCQuickLog "[GLOBE] Dashboard Web disponible en: http://localhost:$WebPort" "Info"
}

Write-QBTCQuickLog "📁 Logs disponibles en: $logsPath" "Info"
Write-QBTCQuickLog "[BULB] Use Ctrl+C para detener los procesos manualmente" "Warning"

# Mostrar logs en tiempo real si se solicita
if ($ShowLogs) {
    Write-Host ""
    Write-QBTCQuickLog "[CLIPBOARD] Mostrando logs en tiempo real..." "Quantum"
    Write-Host "Presione Ctrl+C para salir del modo de logs" -ForegroundColor $Colors.Warning
    Write-Host ""
    
    try {
        # Intentar mostrar logs del orquestador principal si existe
        $mainLogPath = Join-Path $logsPath "qbtc-orchestrator.log"
        if (Test-Path $mainLogPath) {
            Get-Content -Path $mainLogPath -Tail 10 -Wait
        } else {
            # Mostrar logs de cualquier proceso QBTC
            $anyLogFile = Get-ChildItem -Path $logsPath -Filter "*.log" | Select-Object -First 1
            if ($anyLogFile) {
                Get-Content -Path $anyLogFile.FullName -Tail 10 -Wait
            } else {
                Write-Host "No hay archivos de log disponibles aún..." -ForegroundColor $Colors.Warning
                # Esperar y crear un log simple
                while ($true) {
                    $timestamp = Get-Date -Format "HH:mm:ss"
                    Write-Host "[$timestamp] Sistema QBTC ejecutándose... ($($startedProcesses.Count) procesos activos)" -ForegroundColor $Colors.Info
                    Start-Sleep -Seconds 5
                }
            }
        }
    } catch {
        Write-QBTCQuickLog "[X] No se pueden mostrar logs en tiempo real" "Error"
    }
} else {
    Write-Host ""
    Write-QBTCQuickLog "[TARGET] Sistema QBTC iniciado. Use '.\qbtc-launcher.ps1 -Mode status' para ver el estado detallado." "Quantum"
}

Write-Host ""
Write-Host "[GALAXY] QBTC Quick Start completado! [GALAXY]" -ForegroundColor $Colors.Quantum
