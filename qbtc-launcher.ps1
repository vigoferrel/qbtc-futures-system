#!/usr/bin/env pwsh

<#
.SYNOPSIS
[ROCKET] QBTC FUTURES SYSTEM - ORQUESTADOR PRINCIPAL
===============================================

.DESCRIPTION
Lanzador orquestado y limpio para todos los procesos del sistema QBTC:
- Mass Intelligence Scanner (Ranking Cuántico)
- Monitor Web Dashboard 
- Futures Trading Engine
- System Health Monitor
- Gestión avanzada de procesos y logs

.AUTHOR
QBTC Quantum Trading Systems

.VERSION
2.0.0 - Hermetic Edition
#>

param(
    [Parameter(HelpMessage="Modo de ejecución: full, scanner, web, trading, monitor")]
    [ValidateSet("full", "scanner", "web", "trading", "monitor", "stop", "status")]
    [string]$Mode = "full",
    
    [Parameter(HelpMessage="Mostrar logs en tiempo real")]
    [switch]$ShowLogs,
    
    [Parameter(HelpMessage="Modo silencioso (sin interacción)")]
    [switch]$Silent,
    
    [Parameter(HelpMessage="Reiniciar procesos existentes")]
    [switch]$Restart,
    
    [Parameter(HelpMessage="Puerto del monitor web")]
    [int]$WebPort = 3001,
    
    [Parameter(HelpMessage="Configuración de trading")]
    [string]$TradingConfig = "aggressive"
)

# =====================================
# [TARGET] CONFIGURACIÓN GLOBAL
# =====================================

$Global:QBTC_CONFIG = @{
    SystemName = "QBTC Quantum Futures System"
    Version = "2.0.0 - Hermetic Edition"
    BasePath = $PWD
    LogsPath = Join-Path $PWD "logs"
    ConfigPath = Join-Path $PWD "config"
    
    Processes = @{
        Scanner = @{
            Name = "QBTC-Mass-Scanner"
            Script = "qbtc-mass-scanner.js"
            Port = $null
            Dependencies = @()
            Critical = $true
            RetryCount = 3
            HealthCheck = "scanner"
        }
        WebMonitor = @{
            Name = "QBTC-Web-Monitor"
            Script = "qbtc-web-monitor.js"
            Port = $WebPort
            Dependencies = @()
            Critical = $false
            RetryCount = 2
            HealthCheck = "web"
        }
        TradingEngine = @{
            Name = "QBTC-Trading-Engine"
            Script = "qbtc-trading-engine.js"
            Port = $null
            Dependencies = @("Scanner")
            Critical = $true
            RetryCount = 5
            HealthCheck = "trading"
        }
        SystemMonitor = @{
            Name = "QBTC-System-Monitor"
            Script = "qbtc-system-monitor.js"
            Port = $null
            Dependencies = @()
            Critical = $false
            RetryCount = 1
            HealthCheck = "system"
        }
    }
    
    Colors = @{
        Header = "Cyan"
        Success = "Green" 
        Warning = "Yellow"
        Error = "Red"
        Info = "Blue"
        Process = "Magenta"
        Quantum = "DarkCyan"
    }
    
    Timeouts = @{
        ProcessStart = 10
        HealthCheck = 5
        Shutdown = 15
        Restart = 20
    }
}

# =====================================
# [PALETTE] FUNCIONES DE VISUALIZACIÓN
# =====================================

function Write-QBTCHeader {
    Clear-Host
    Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "[GALAXY] QBTC QUANTUM FUTURES SYSTEM - HERMETIC ORCHESTRATOR [GALAXY]" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host ""
    Write-Host "[CRYSTAL_BALL] Version: $($Global:QBTC_CONFIG.Version)" -ForegroundColor $Global:QBTC_CONFIG.Colors.Quantum
    Write-Host "[PIN] Base Path: $($Global:QBTC_CONFIG.BasePath)" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "⏰ Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host ""
}

function Write-QBTCLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "SYSTEM"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { $Global:QBTC_CONFIG.Colors.Success }
        "WARNING" { $Global:QBTC_CONFIG.Colors.Warning }
        "ERROR" { $Global:QBTC_CONFIG.Colors.Error }
        "PROCESS" { $Global:QBTC_CONFIG.Colors.Process }
        "QUANTUM" { $Global:QBTC_CONFIG.Colors.Quantum }
        default { $Global:QBTC_CONFIG.Colors.Info }
    }
    
    $icon = switch ($Level) {
        "SUCCESS" { "[OK]" }
        "WARNING" { "[WARN]" }
        "ERROR" { "[ERROR]" }
        "PROCESS" { "[PROC]" }
        "QUANTUM" { "[QUANTUM]" }
        default { "[INFO]" }
    }
    
    Write-Host "[$timestamp] $icon [$Component] $Message" -ForegroundColor $color
    
    # Log a archivo
    $logFile = Join-Path $Global:QBTC_CONFIG.LogsPath "qbtc-orchestrator.log"
    "[$timestamp] [$Level] [$Component] $Message" | Out-File -FilePath $logFile -Append -Encoding UTF8
}

function Show-QBTCSpinner {
    param(
        [string]$Message,
        [scriptblock]$Action,
        [int]$TimeoutSeconds = 30
    )
    
    $spinnerChars = @("[CYCLONE]", "[OCEAN_WAVE]", "[GALAXY]", "[STAR2]", "[SPARKLES]", "[COMET]")
    $job = Start-Job -ScriptBlock $Action
    $counter = 0
    
    do {
        $spinner = $spinnerChars[$counter % $spinnerChars.Count]
        Write-Host "`r$spinner $Message..." -NoNewline -ForegroundColor $Global:QBTC_CONFIG.Colors.Quantum
        Start-Sleep -Milliseconds 200
        $counter++
    } while ($job.State -eq "Running" -and $counter -lt ($TimeoutSeconds * 5))
    
    Write-Host "`r" -NoNewline
    
    if ($job.State -eq "Completed") {
        $result = Receive-Job $job
        Remove-Job $job
        return $result
    } else {
        Stop-Job $job
        Remove-Job $job
        throw "Operation timed out after $TimeoutSeconds seconds"
    }
}

# =====================================
# 🛠️ FUNCIONES DE GESTIÓN DE PROCESOS
# =====================================

function Initialize-QBTCEnvironment {
    Write-QBTCLog "Inicializando entorno QBTC..." "QUANTUM" "INIT"
    
    # Crear directorios necesarios
    @($Global:QBTC_CONFIG.LogsPath, $Global:QBTC_CONFIG.ConfigPath) | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-QBTCLog "Directorio creado: $_" "SUCCESS" "INIT"
        }
    }
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-QBTCLog "Node.js detectado: $nodeVersion" "SUCCESS" "INIT"
        } else {
            throw "Node.js no encontrado"
        }
    } catch {
        Write-QBTCLog "Node.js no está instalado o no está en PATH" "ERROR" "INIT"
        return $false
    }
    
    # Verificar archivos del sistema
    $missingFiles = @()
    $Global:QBTC_CONFIG.Processes.Values | ForEach-Object {
        $scriptPath = Join-Path $Global:QBTC_CONFIG.BasePath $_.Script
        if (-not (Test-Path $scriptPath)) {
            $missingFiles += $_.Script
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-QBTCLog "Archivos faltantes: $($missingFiles -join ', ')" "ERROR" "INIT"
        return $false
    }
    
    Write-QBTCLog "Entorno QBTC inicializado correctamente" "SUCCESS" "INIT"
    return $true
}

function Get-QBTCProcesses {
    $processes = Get-Process -Name "node", "powershell" -ErrorAction SilentlyContinue | 
        Where-Object { 
            ($_.ProcessName -eq "node") -or 
            ($_.ProcessName -eq "powershell" -and $_.MainWindowTitle -like "*QBTC*")
        }
    
    $qbtcProcesses = @{}
    foreach ($process in $processes) {
        $processInfo = @{
            Id = $process.Id
            Name = $process.ProcessName
            Title = $process.MainWindowTitle
            StartTime = $process.StartTime
            CPU = $process.CPU
            Memory = [Math]::Round($process.WorkingSet64 / 1MB, 2)
            Status = "Running"
        }
        
        # Identificar tipo de proceso QBTC
        $qbtcType = "Unknown"
        if ($process.MainWindowTitle) {
            switch -Regex ($process.MainWindowTitle) {
                "Scanner|Mass.*Intelligence" { $qbtcType = "Scanner" }
                "Web.*Monitor|Dashboard" { $qbtcType = "WebMonitor" }
                "Trading.*Engine|Futures" { $qbtcType = "TradingEngine" }
                "System.*Monitor" { $qbtcType = "SystemMonitor" }
            }
        }
        
        $qbtcProcesses[$qbtcType] = $processInfo
    }
    
    return $qbtcProcesses
}

function Start-QBTCProcess {
    param(
        [string]$ProcessType,
        [hashtable]$ProcessConfig
    )
    
    Write-QBTCLog "Iniciando proceso: $($ProcessConfig.Name)" "PROCESS" $ProcessType
    
    $scriptPath = Join-Path $Global:QBTC_CONFIG.BasePath $ProcessConfig.Script
    $logFile = Join-Path $Global:QBTC_CONFIG.LogsPath "$ProcessType.log"
    
    # Verificar dependencias
    foreach ($dependency in $ProcessConfig.Dependencies) {
        if (-not (Test-QBTCProcessHealth $dependency)) {
            Write-QBTCLog "Dependencia no disponible: $dependency" "ERROR" $ProcessType
            return $false
        }
    }
    
    try {
        # Configurar argumentos según el proceso
        $arguments = @()
        if ($ProcessConfig.Port) {
            $arguments += "--port", $ProcessConfig.Port
        }
        
        if ($ProcessType -eq "TradingEngine") {
            $arguments += "--config", $TradingConfig
        }
        
        # Iniciar proceso con título específico
        $processTitle = "QBTC - $($ProcessConfig.Name)"
        $startInfo = @{
            FilePath = "node"
            ArgumentList = @($scriptPath) + $arguments
            WindowStyle = "Normal"
            WorkingDirectory = $Global:QBTC_CONFIG.BasePath
        }
        
        $process = Start-Process @startInfo -PassThru
        
        # Esperar a que el proceso se estabilice
        Start-Sleep -Seconds 2
        
        # Verificar que el proceso sigue ejecutándose
        if ($process -and -not $process.HasExited) {
            Write-QBTCLog "Proceso iniciado correctamente (PID: $($process.Id))" "SUCCESS" $ProcessType
            
            # Esperar health check
            $healthOk = Wait-QBTCProcessHealth $ProcessType $Global:QBTC_CONFIG.Timeouts.ProcessStart
            if ($healthOk) {
                Write-QBTCLog "Health check exitoso para $ProcessType" "SUCCESS" $ProcessType
                return $true
            } else {
                Write-QBTCLog "Health check falló para $ProcessType" "WARNING" $ProcessType
                return $false
            }
        } else {
            Write-QBTCLog "El proceso falló al iniciar" "ERROR" $ProcessType
            return $false
        }
    } catch {
        Write-QBTCLog "Error al iniciar proceso: $($_.Exception.Message)" "ERROR" $ProcessType
        return $false
    }
}

function Stop-QBTCProcess {
    param([string]$ProcessType)
    
    Write-QBTCLog "Deteniendo proceso: $ProcessType" "PROCESS" $ProcessType
    
    $processes = Get-QBTCProcesses
    if ($processes.ContainsKey($ProcessType)) {
        $processInfo = $processes[$ProcessType]
        try {
            Stop-Process -Id $processInfo.Id -Force
            Write-QBTCLog "Proceso detenido correctamente" "SUCCESS" $ProcessType
        } catch {
            Write-QBTCLog "Error al detener proceso: $($_.Exception.Message)" "ERROR" $ProcessType
        }
    } else {
        Write-QBTCLog "Proceso no encontrado" "WARNING" $ProcessType
    }
}

function Test-QBTCProcessHealth {
    param([string]$ProcessType)
    
    $processes = Get-QBTCProcesses
    return $processes.ContainsKey($ProcessType)
}

function Wait-QBTCProcessHealth {
    param(
        [string]$ProcessType,
        [int]$TimeoutSeconds
    )
    
    $startTime = Get-Date
    while (((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
        if (Test-QBTCProcessHealth $ProcessType) {
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

# =====================================
# [TARGET] FUNCIONES PRINCIPALES
# =====================================

function Start-QBTCSystem {
    param([string[]]$Components = @())
    
    Write-QBTCLog "Iniciando sistema QBTC..." "QUANTUM" "SYSTEM"
    
    if ($Components.Count -eq 0) {
        $Components = @("Scanner", "WebMonitor", "TradingEngine", "SystemMonitor")
    }
    
    $startOrder = @("Scanner", "SystemMonitor", "WebMonitor", "TradingEngine")
    $successCount = 0
    
    foreach ($component in $startOrder) {
        if ($component -in $Components) {
            $config = $Global:QBTC_CONFIG.Processes[$component]
            
            # Verificar si ya está ejecutándose
            if (Test-QBTCProcessHealth $component) {
                if ($Restart) {
                    Write-QBTCLog "Reiniciando proceso existente..." "PROCESS" $component
                    Stop-QBTCProcess $component
                    Start-Sleep -Seconds 2
                } else {
                    Write-QBTCLog "Proceso ya está ejecutándose" "WARNING" $component
                    $successCount++
                    continue
                }
            }
            
            # Intentar iniciar con reintentos
            $attempts = 0
            $started = $false
            
            while ($attempts -lt $config.RetryCount -and -not $started) {
                $attempts++
                if ($attempts -gt 1) {
                    Write-QBTCLog "Intento $attempts de $($config.RetryCount)..." "PROCESS" $component
                }
                
                $started = Start-QBTCProcess $component $config
                
                if (-not $started -and $attempts -lt $config.RetryCount) {
                    Write-QBTCLog "Esperando antes del siguiente intento..." "PROCESS" $component
                    Start-Sleep -Seconds 3
                }
            }
            
            if ($started) {
                $successCount++
            } else {
                Write-QBTCLog "Falló al iniciar después de $($config.RetryCount) intentos" "ERROR" $component
                if ($config.Critical) {
                    Write-QBTCLog "Proceso crítico falló - Abortando inicio del sistema" "ERROR" "SYSTEM"
                    return $false
                }
            }
            
            # Pausa entre procesos para estabilidad
            Start-Sleep -Seconds 2
        }
    }
    
    Write-QBTCLog "Sistema QBTC iniciado: $successCount/$($Components.Count) procesos" "SUCCESS" "SYSTEM"
    return $successCount -gt 0
}

function Stop-QBTCSystem {
    Write-QBTCLog "Deteniendo sistema QBTC..." "QUANTUM" "SYSTEM"
    
    $processes = Get-QBTCProcesses
    $stopOrder = @("TradingEngine", "WebMonitor", "SystemMonitor", "Scanner")
    
    foreach ($component in $stopOrder) {
        if ($processes.ContainsKey($component)) {
            Stop-QBTCProcess $component
            Start-Sleep -Seconds 1
        }
    }
    
    Write-QBTCLog "Sistema QBTC detenido completamente" "SUCCESS" "SYSTEM"
}

function Show-QBTCStatus {
    Write-QBTCLog "Estado del sistema QBTC..." "QUANTUM" "STATUS"
    Write-Host ""
    
    $processes = Get-QBTCProcesses
    $overallHealth = $true
    
    # Header de tabla
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "| COMPONENTE      | PID  | ESTADO     | MEMORIA | CPU        | UPTIME   |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    
    foreach ($componentName in $Global:QBTC_CONFIG.Processes.Keys) {
        $component = $Global:QBTC_CONFIG.Processes[$componentName]
        
        if ($processes.ContainsKey($componentName)) {
            $proc = $processes[$componentName]
            $uptime = if ($proc.StartTime) { 
                ((Get-Date) - $proc.StartTime).ToString("hh\:mm\:ss")
            } else { 
                "Unknown" 
            }
            
            $status = "RUNNING"
            $color = $Global:QBTC_CONFIG.Colors.Success
            $icon = "[RUN]"
        } else {
            $proc = @{ Id = "-"; Memory = "-"; CPU = "-" }
            $uptime = "-"
            $status = if ($component.Critical) { "STOPPED*" } else { "STOPPED" }
            $color = if ($component.Critical) { $Global:QBTC_CONFIG.Colors.Error } else { $Global:QBTC_CONFIG.Colors.Warning }
            $icon = if ($component.Critical) { "[CRIT]" } else { "[STOP]" }
            $overallHealth = $false
        }
        
        $memStr = if ($proc.Memory -eq "-") { "-" } else { "$($proc.Memory)MB" }
        $cpuStr = if ($proc.CPU -eq "-") { "-" } else { "$([Math]::Round($proc.CPU, 1))%" }
        $line = "$icon $componentName - PID:$($proc.Id) - $status - Mem:$memStr - CPU:$cpuStr - Uptime:$uptime"
            
        Write-Host $line -ForegroundColor $color
    }
    
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host ""
    
    # Estado general
    $healthIcon = if ($overallHealth) { "[HEALTHY]" } else { "[ATTENTION]" }
    $healthStatus = if ($overallHealth) { "SALUDABLE" } else { "REQUIERE ATENCION" }
    $healthColor = if ($overallHealth) { $Global:QBTC_CONFIG.Colors.Success } else { $Global:QBTC_CONFIG.Colors.Error }
    
    Write-Host "$healthIcon Estado General: $healthStatus" -ForegroundColor $healthColor
    Write-Host ""
    
    # Información adicional
    if ($processes.ContainsKey("WebMonitor")) {
        Write-Host "[GLOBE] Dashboard Web: http://localhost:$WebPort" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    }
    
    Write-Host "📁 Logs Path: $($Global:QBTC_CONFIG.LogsPath)" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "* = Proceso crítico" -ForegroundColor $Global:QBTC_CONFIG.Colors.Warning
}

function Show-QBTCMenu {
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "|                    QBTC CONTROL PANEL                      |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header  
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host "| 1. Iniciar Sistema Completo                                |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 2. Iniciar Solo Scanner                                    |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 3. Iniciar Solo Monitor Web                                |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 4. Iniciar Solo Trading Engine                             |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 5. Ver Estado del Sistema                                  |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 6. Reiniciar Sistema                                       |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 7. Detener Sistema                                         |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 8. Ver Logs en Tiempo Real                                 |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "| 0. Salir                                                   |" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor $Global:QBTC_CONFIG.Colors.Header
    Write-Host ""
}

# =====================================
# [CLAPPER] FUNCIÓN PRINCIPAL
# =====================================

function Main {
    # Verificar privilegios si es necesario
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    Write-QBTCHeader
    
    if (-not (Initialize-QBTCEnvironment)) {
        Write-QBTCLog "Falló la inicialización del entorno - Abortando" "ERROR" "SYSTEM"
        return
    }
    
    # Modo automático basado en parámetros
    switch ($Mode) {
        "full" {
            if (-not $Silent) {
                Write-Host "[ROCKET] Iniciando sistema completo..." -ForegroundColor $Global:QBTC_CONFIG.Colors.Quantum
                Start-Sleep -Seconds 2
            }
            $success = Start-QBTCSystem
            if ($success) {
                Show-QBTCStatus
                if (-not $Silent) {
                    Write-Host ""
                    Write-Host "[SPARKLES] Sistema QBTC iniciado correctamente!" -ForegroundColor $Global:QBTC_CONFIG.Colors.Success
                    Write-Host "[GLOBE] Dashboard Web: http://localhost:$WebPort" -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
                }
            }
        }
        
        "scanner" { Start-QBTCSystem @("Scanner") }
        "web" { Start-QBTCSystem @("WebMonitor") }
        "trading" { Start-QBTCSystem @("Scanner", "TradingEngine") }
        "monitor" { Start-QBTCSystem @("SystemMonitor") }
        "stop" { Stop-QBTCSystem }
        "status" { Show-QBTCStatus }
        
        default {
            # Modo interactivo
            if (-not $Silent) {
                do {
                    Show-QBTCStatus
                    Show-QBTCMenu
                    $choice = Read-Host "Seleccione una opción"
                    
                    switch ($choice) {
                        "1" { Start-QBTCSystem; Pause }
                        "2" { Start-QBTCSystem @("Scanner"); Pause }
                        "3" { Start-QBTCSystem @("WebMonitor"); Pause }
                        "4" { Start-QBTCSystem @("Scanner", "TradingEngine"); Pause }
                        "5" { Show-QBTCStatus; Pause }
                        "6" { Stop-QBTCSystem; Start-Sleep 3; Start-QBTCSystem; Pause }
                        "7" { Stop-QBTCSystem; Pause }
                        "8" { 
                            Write-Host "Presione Ctrl+C para volver al menú"
                            Get-Content -Path (Join-Path $Global:QBTC_CONFIG.LogsPath "qbtc-orchestrator.log") -Tail 50 -Wait
                        }
                        "0" { break }
                        default { Write-Host "Opción inválida" -ForegroundColor $Global:QBTC_CONFIG.Colors.Error }
                    }
                    
                    Clear-Host
                    Write-QBTCHeader
                } while ($choice -ne "0")
            }
        }
    }
    
    if ($ShowLogs) {
        Write-Host ""
        Write-Host "[CLIPBOARD] Mostrando logs en tiempo real (Ctrl+C para salir)..." -ForegroundColor $Global:QBTC_CONFIG.Colors.Info
        try {
            Get-Content -Path (Join-Path $Global:QBTC_CONFIG.LogsPath "qbtc-orchestrator.log") -Tail 10 -Wait
        } catch {
            Write-Host "No se pueden mostrar los logs" -ForegroundColor $Global:QBTC_CONFIG.Colors.Warning
        }
    }
}

# =====================================
# [ROCKET] EJECUCIÓN
# =====================================

try {
    Main
} catch {
    Write-QBTCLog "Error crítico en el orquestador: $($_.Exception.Message)" "ERROR" "SYSTEM"
    exit 1
} finally {
    if (-not $Silent) {
        Write-Host ""
        Write-Host "[GALAXY] Gracias por usar QBTC Quantum Futures System! [GALAXY]" -ForegroundColor $Global:QBTC_CONFIG.Colors.Quantum
    }
}
