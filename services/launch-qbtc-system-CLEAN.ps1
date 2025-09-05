#!/usr/bin/env pwsh

<#
.SYNOPSIS
    QBTC UNIFIED SYSTEM LAUNCHER - ACTUALIZADO Y COHERENTE
    
.DESCRIPTION
    Launcher completamente actualizado que refleja el estado REAL del sistema QBTC.
    Corrige todas las inconsistencias del launcher anterior.
    
.PARAMETER Mode
    Modo de operación: Development, Production, Testing
    
.PARAMETER Services
    Lista de servicios específicos a iniciar (opcional)
    
.PARAMETER SkipValidation
    Omitir validaciones previas (no recomendado)
    
.PARAMETER Delay
    Retraso en segundos entre inicios de servicios (default: 2)
    
.EXAMPLE
    .\launch-qbtc-system-CLEAN.ps1
    
.EXAMPLE
    .\launch-qbtc-system-CLEAN.ps1 -Services @("master-control", "temporal-cycles") -Delay 3
    
.NOTES
    Fecha: 2024-12-24
    Versión: 2.0.0 - REAL STATE ALIGNED
    Autor: QBTC System Evolution
#>

[CmdletBinding()]
param(
    [ValidateSet("Development", "Production", "Testing")]
    [string]$Mode = "Development",
    
    [string[]]$Services = @(),
    
    [switch]$SkipValidation,
    
    [int]$Delay = 2,
    
    [switch]$ShowStatus,
    
    [switch]$StopAll,
    
    [switch]$Help
)

# ============================================================================
# CONFIGURACIÓN REAL DE SERVICIOS (ESTADO ACTUAL VERIFICADO)
# ============================================================================

$QBTC_SERVICES = @{
    # CORE ORCHESTRATION
    "master-control" = @{
        Name = "[CORE] Master Control Hub"
        Script = "master-control-hub-service.js"
        Port = 14001
        Category = "CORE"
        Priority = 1
        Description = "Cerebro coordinador de la metaconciencia QBTC"
        Dependencies = @()
        Critical = $true
        HealthEndpoint = "/health"
        StartupTimeout = 15
    }
    
    # ANALYSIS ENGINES (Puertos verificados)
    "temporal-cycles" = @{
        Name = "[ANALYSIS] Temporal Cycles Engine"
        Script = "temporal-cycles-engine-service.js"
        Port = 14102
        Category = "ANALYSIS"
        Priority = 2
        Description = "Motor de análisis de ciclos temporales y fases lunares"
        Dependencies = @()
        Critical = $true
        HealthEndpoint = "/health"
        StartupTimeout = 10
    }
    
    "multidimensional-weighting" = @{
        Name = "[ANALYSIS] Multidimensional Weighting Engine"
        Script = "multidimensional-weighting-service.js"
        Port = 14103
        Category = "ANALYSIS"
        Priority = 3
        Description = "Motor de ponderación multidimensional adaptativa"
        Dependencies = @()
        Critical = $true
        HealthEndpoint = "/health"
        StartupTimeout = 10
    }
    
    "tier-strategy" = @{
        Name = "[ANALYSIS] Tier Strategy Generator"
        Script = "tier-strategy-service.js"
        Port = 14104
        Category = "ANALYSIS"
        Priority = 4
        Description = "Generador de estrategias por tiers"
        Dependencies = @("multidimensional-weighting")
        Critical = $true
        HealthEndpoint = "/health"
        StartupTimeout = 12
    }
    
    "consolidated-opportunities" = @{
        Name = "[ANALYSIS] Consolidated Opportunities API"
        Script = "consolidated-opportunities-service.js"
        Port = 14105
        Category = "ANALYSIS"
        Priority = 5
        Description = "API consolidada de oportunidades de trading"
        Dependencies = @("tier-strategy", "temporal-cycles", "multidimensional-weighting")
        Critical = $true
        HealthEndpoint = "/api/status"
        StartupTimeout = 15
    }
    
    # EXECUTION ENGINES
    "enhanced-multitimeframe" = @{
        Name = "[EXECUTION] Enhanced Multi-Timeframe Confluence"
        Script = "enhanced-multitimeframe-service.js"
        Port = 14201
        Category = "EXECUTION"
        Priority = 6
        Description = "Motor de confluencia multi-timeframe avanzado"
        Dependencies = @("consolidated-opportunities")
        Critical = $false
        HealthEndpoint = "/health"
        StartupTimeout = 12
    }
    
    "multi-timeframe-confluence" = @{
        Name = "[EXECUTION] Multi-Timeframe Confluence (Legacy)"
        Script = "multi-timeframe-confluence-service.js"
        Port = 3003
        Category = "EXECUTION"
        Priority = 7
        Description = "Motor de confluencia multi-timeframe (versión legacy)"
        Dependencies = @()
        Critical = $false
        HealthEndpoint = "/health"
        StartupTimeout = 10
    }
}

# ============================================================================
# CONFIGURACIÓN GLOBAL
# ============================================================================

$SYSTEM_CONFIG = @{
    BaseDir = Split-Path -Parent $PSScriptRoot
    ServicesDir = $PSScriptRoot
    LogDir = Join-Path $PSScriptRoot "logs"
    DefaultStartupDelay = 2
    MaxStartupTime = 300
    HealthCheckRetries = 5
    HealthCheckInterval = 2
}

$RunningProcesses = @{}
$GlobalStartTime = Get-Date
$IsShuttingDown = $false

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

function Write-QBTCLog {
    param(
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR", "DEBUG")]
        [string]$Level = "INFO",
        [string]$Component = "LAUNCHER"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $prefix = switch ($Level) {
        "INFO" { "[INFO]" }
        "SUCCESS" { "[OK]" }
        "WARNING" { "[WARN]" }
        "ERROR" { "[ERROR]" }
        "DEBUG" { "[DEBUG]" }
    }
    
    $colorMap = @{
        "INFO" = "White"
        "SUCCESS" = "Green"
        "WARNING" = "Yellow"
        "ERROR" = "Red"
        "DEBUG" = "Cyan"
    }
    
    Write-Host "$prefix [$timestamp] [$Component] $Message" -ForegroundColor $colorMap[$Level]
}

function Test-ServiceFile {
    param([string]$ServiceKey)
    
    $service = $QBTC_SERVICES[$ServiceKey]
    if (-not $service) {
        Write-QBTCLog "Servicio '$ServiceKey' no encontrado en configuración" -Level "ERROR"
        return $false
    }
    
    $scriptPath = Join-Path $SYSTEM_CONFIG.ServicesDir $service.Script
    if (-not (Test-Path $scriptPath)) {
        Write-QBTCLog "Archivo de servicio no encontrado: $scriptPath" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Test-PortAvailable {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        return -not $connection.TcpTestSucceeded
    } catch {
        return $true
    }
}

function Test-ServiceHealth {
    param(
        [string]$ServiceKey,
        [int]$MaxRetries = 1,
        [int]$RetryInterval = 2
    )
    
    $service = $QBTC_SERVICES[$ServiceKey]
    $url = "http://localhost:$($service.Port)$($service.HealthEndpoint)"
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5 -ErrorAction Stop
            if ($response) {
                return $true
            }
        } catch {
            if ($i -lt $MaxRetries) {
                Start-Sleep -Seconds $RetryInterval
            }
        }
    }
    
    return $false
}

function Invoke-PreStartValidation {
    Write-QBTCLog "Iniciando validaciones previas..." -Level "INFO"
    
    $validationErrors = @()
    
    # Validar Node.js
    try {
        $nodeVersion = & node --version 2>$null
        if ($nodeVersion) {
            Write-QBTCLog "Node.js detectado: $nodeVersion" -Level "SUCCESS"
        } else {
            $validationErrors += "Node.js no responde correctamente"
        }
    } catch {
        $validationErrors += "Node.js no está instalado o no está en PATH"
    }
    
    # Validar directorio de servicios
    if (-not (Test-Path $SYSTEM_CONFIG.ServicesDir)) {
        $validationErrors += "Directorio de servicios no encontrado: $($SYSTEM_CONFIG.ServicesDir)"
    }
    
    # Validar archivos de servicios
    foreach ($serviceKey in $QBTC_SERVICES.Keys) {
        if (-not (Test-ServiceFile -ServiceKey $serviceKey)) {
            $validationErrors += "Servicio '$serviceKey' no válido"
        }
    }
    
    # Validar puertos
    $usedPorts = @()
    foreach ($service in $QBTC_SERVICES.Values) {
        if ($usedPorts -contains $service.Port) {
            $validationErrors += "Puerto $($service.Port) duplicado"
        }
        $usedPorts += $service.Port
    }
    
    # Crear directorio de logs si no existe
    if (-not (Test-Path $SYSTEM_CONFIG.LogDir)) {
        New-Item -Path $SYSTEM_CONFIG.LogDir -ItemType Directory -Force | Out-Null
        Write-QBTCLog "Directorio de logs creado: $($SYSTEM_CONFIG.LogDir)" -Level "INFO"
    }
    
    if ($validationErrors.Count -gt 0) {
        Write-QBTCLog "VALIDACIONES FALLIDAS:" -Level "ERROR"
        foreach ($error in $validationErrors) {
            Write-QBTCLog "  • $error" -Level "ERROR"
        }
        return $false
    }
    
    Write-QBTCLog "Todas las validaciones previas exitosas" -Level "SUCCESS"
    return $true
}

function Get-ServiceStatus {
    $status = @{
        Running = @()
        Stopped = @()
        Failed = @()
        Total = $QBTC_SERVICES.Count
    }
    
    foreach ($serviceKey in $QBTC_SERVICES.Keys) {
        $service = $QBTC_SERVICES[$serviceKey]
        
        if (Test-PortAvailable -Port $service.Port) {
            $status.Stopped += $serviceKey
        } else {
            try {
                if (Test-ServiceHealth -ServiceKey $serviceKey -MaxRetries 1) {
                    $status.Running += $serviceKey
                } else {
                    $status.Failed += $serviceKey
                }
            } catch {
                $status.Failed += $serviceKey
            }
        }
    }
    
    return $status
}

function Start-QBTCService {
    param(
        [string]$ServiceKey,
        [int]$StartupDelay = 2
    )
    
    $service = $QBTC_SERVICES[$ServiceKey]
    if (-not $service) {
        Write-QBTCLog "Servicio '$ServiceKey' no encontrado" -Level "ERROR"
        return $false
    }
    
    # Verificar dependencias
    foreach ($dep in $service.Dependencies) {
        if (-not $RunningProcesses.ContainsKey($dep)) {
            Write-QBTCLog "Dependencia '$dep' no está ejecutándose para '$ServiceKey'" -Level "ERROR"
            return $false
        }
    }
    
    # Verificar si el puerto está disponible
    if (-not (Test-PortAvailable -Port $service.Port)) {
        Write-QBTCLog "Puerto $($service.Port) ya está en uso" -Level "WARNING"
        # Intentar health check para ver si es nuestro servicio
        if (Test-ServiceHealth -ServiceKey $ServiceKey -MaxRetries 1) {
            Write-QBTCLog "$($service.Name) ya está ejecutándose" -Level "INFO"
            return $true
        } else {
            Write-QBTCLog "Puerto $($service.Port) ocupado por proceso externo" -Level "ERROR"
            return $false
        }
    }
    
    $scriptPath = Join-Path $SYSTEM_CONFIG.ServicesDir $service.Script
    $logFile = Join-Path $SYSTEM_CONFIG.LogDir "$ServiceKey.log"
    
    Write-QBTCLog "Iniciando $($service.Name) en puerto $($service.Port)..." -Level "INFO" -Component $ServiceKey
    
    try {
        # Iniciar proceso con Start-Process para mejor control
        $processParams = @{
            FilePath = "node"
            ArgumentList = @($scriptPath)
            WorkingDirectory = $SYSTEM_CONFIG.ServicesDir
            WindowStyle = "Hidden"
            PassThru = $true
            RedirectStandardOutput = $logFile
            RedirectStandardError = ($logFile -replace ".log", ".err.log")
        }
        
        $process = Start-Process @processParams
        
        # Guardar información del proceso
        $RunningProcesses[$ServiceKey] = @{
            Process = $process
            Service = $service
            StartTime = Get-Date
            LogFile = $logFile
            Status = "Starting"
        }
        
        # Esperar a que el servicio esté listo
        $timeout = $service.StartupTimeout
        $startTime = Get-Date
        
        while (((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
            if (-not (Test-PortAvailable -Port $service.Port)) {
                Start-Sleep -Seconds 1
                if (Test-ServiceHealth -ServiceKey $ServiceKey -MaxRetries 1) {
                    $RunningProcesses[$ServiceKey].Status = "Running"
                    Write-QBTCLog "$($service.Name) iniciado correctamente" -Level "SUCCESS" -Component $ServiceKey
                    return $true
                }
            }
            Start-Sleep -Seconds 1
        }
        
        Write-QBTCLog "Timeout iniciando $($service.Name)" -Level "WARNING" -Component $ServiceKey
        $RunningProcesses[$ServiceKey].Status = "Failed"
        return $false
        
    } catch {
        Write-QBTCLog "Error iniciando $($service.Name): $($_.Exception.Message)" -Level "ERROR" -Component $ServiceKey
        return $false
    }
}

function Stop-QBTCService {
    param([string]$ServiceKey)
    
    if (-not $RunningProcesses.ContainsKey($ServiceKey)) {
        Write-QBTCLog "Servicio '$ServiceKey' no está ejecutándose" -Level "WARNING"
        return
    }
    
    $processInfo = $RunningProcesses[$ServiceKey]
    $service = $processInfo.Service
    
    Write-QBTCLog "Deteniendo $($service.Name)..." -Level "INFO" -Component $ServiceKey
    
    try {
        if (-not $processInfo.Process.HasExited) {
            $processInfo.Process.Kill()
            $processInfo.Process.WaitForExit(10000)
        }
        
        $RunningProcesses.Remove($ServiceKey)
        Write-QBTCLog "$($service.Name) detenido correctamente" -Level "SUCCESS" -Component $ServiceKey
        
    } catch {
        Write-QBTCLog "Error deteniendo $($service.Name): $($_.Exception.Message)" -Level "ERROR" -Component $ServiceKey
    }
}

function Stop-AllServices {
    Write-QBTCLog "Deteniendo todos los servicios..." -Level "INFO"
    
    $script:IsShuttingDown = $true
    
    # Detener en orden inverso de dependencias
    $servicesToStop = $RunningProcesses.Keys | Sort-Object { $QBTC_SERVICES[$_].Priority } -Descending
    
    foreach ($serviceKey in $servicesToStop) {
        Stop-QBTCService -ServiceKey $serviceKey
        Start-Sleep -Seconds 1
    }
    
    Write-QBTCLog "Todos los servicios detenidos" -Level "SUCCESS"
}

function Show-SystemStatus {
    $status = Get-ServiceStatus
    
    Write-Host ""
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host "                    QBTC SYSTEM STATUS REPORT                                " -ForegroundColor Cyan
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "RESUMEN EJECUTIVO:" -ForegroundColor Yellow
    Write-Host "   • Total de servicios: $($status.Total)" -ForegroundColor White
    Write-Host "   • Ejecutándose: $($status.Running.Count)" -ForegroundColor Green
    Write-Host "   • Detenidos: $($status.Stopped.Count)" -ForegroundColor Gray
    Write-Host "   • Fallidos: $($status.Failed.Count)" -ForegroundColor Red
    Write-Host ""
    
    if ($status.Running.Count -gt 0) {
        Write-Host "SERVICIOS ACTIVOS:" -ForegroundColor Green
        foreach ($serviceKey in $status.Running) {
            $service = $QBTC_SERVICES[$serviceKey]
            Write-Host "   [RUNNING] $($service.Name) - Puerto $($service.Port)" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($status.Failed.Count -gt 0) {
        Write-Host "SERVICIOS FALLIDOS:" -ForegroundColor Red
        foreach ($serviceKey in $status.Failed) {
            $service = $QBTC_SERVICES[$serviceKey]
            Write-Host "   [FAILED] $($service.Name) - Puerto $($service.Port)" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($status.Stopped.Count -gt 0) {
        Write-Host "SERVICIOS DETENIDOS:" -ForegroundColor Gray
        foreach ($serviceKey in $status.Stopped) {
            $service = $QBTC_SERVICES[$serviceKey]
            Write-Host "   [STOPPED] $($service.Name) - Puerto $($service.Port)" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    # Mostrar uptime del sistema
    $uptime = (Get-Date) - $GlobalStartTime
    Write-Host "System Uptime: $($uptime.ToString('dd\.hh\:mm\:ss'))" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "QBTC UNIFIED SYSTEM LAUNCHER - HELP" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Mode <string>           Modo de operación (Development/Production/Testing)" -ForegroundColor White
    Write-Host "  -Services <array>        Lista específica de servicios a iniciar" -ForegroundColor White
    Write-Host "  -Delay <int>             Retraso en segundos entre inicios (default: 2)" -ForegroundColor White
    Write-Host "  -SkipValidation          Omitir validaciones previas" -ForegroundColor White
    Write-Host "  -ShowStatus              Solo mostrar el estado actual y salir" -ForegroundColor White
    Write-Host "  -StopAll                 Detener todos los servicios" -ForegroundColor White
    Write-Host "  -Help                    Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1" -ForegroundColor Green
    Write-Host "    Iniciar todos los servicios en modo Development" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1 -Mode Production -Delay 3" -ForegroundColor Green
    Write-Host "    Modo producción con 3 segundos entre inicios" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1 -Services @('master-control', 'temporal-cycles')" -ForegroundColor Green
    Write-Host "    Iniciar solo servicios específicos" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1 -ShowStatus" -ForegroundColor Green
    Write-Host "    Mostrar estado actual del sistema" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\launch-qbtc-system-CLEAN.ps1 -StopAll" -ForegroundColor Green
    Write-Host "    Detener todos los servicios activos" -ForegroundColor Gray
    Write-Host ""
    Write-Host "SERVICIOS DISPONIBLES:" -ForegroundColor Yellow
    foreach ($serviceKey in $QBTC_SERVICES.Keys | Sort-Object { $QBTC_SERVICES[$_].Priority }) {
        $service = $QBTC_SERVICES[$serviceKey]
        $critical = if ($service.Critical) { "[CRITICAL]" } else { "[OPTIONAL]" }
        Write-Host "  $critical $serviceKey - $($service.Name) (Puerto $($service.Port))" -ForegroundColor White
    }
    Write-Host ""
}

function Start-QBTCSystem {
    param([string[]]$TargetServices = @())
    
    Write-Host ""
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host "                    QBTC UNIFIED SYSTEM LAUNCHER                             " -ForegroundColor Cyan
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host "Iniciado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
    Write-Host "Modo: $Mode" -ForegroundColor White
    Write-Host ""
    
    # Validaciones previas
    if (-not $SkipValidation) {
        if (-not (Invoke-PreStartValidation)) {
            Write-QBTCLog "Validaciones fallidas. Sistema no iniciado." -Level "ERROR"
            return $false
        }
    } else {
        Write-QBTCLog "Saltando validaciones (no recomendado)" -Level "WARNING"
    }
    
    # Determinar servicios a iniciar
    $servicesToStart = if ($TargetServices.Count -gt 0) {
        $TargetServices
    } else {
        $QBTC_SERVICES.Keys | Sort-Object { $QBTC_SERVICES[$_].Priority }
    }
    
    Write-QBTCLog "Servicios programados para inicio:" -Level "INFO"
    foreach ($serviceKey in $servicesToStart) {
        $service = $QBTC_SERVICES[$serviceKey]
        $critical = if ($service.Critical) { "(CRÍTICO)" } else { "" }
        Write-QBTCLog "  • $($service.Name) - Puerto $($service.Port) $critical" -Level "INFO"
    }
    Write-Host ""
    
    # Iniciar servicios
    $successCount = 0
    $failCount = 0
    
    foreach ($serviceKey in $servicesToStart) {
        if (Start-QBTCService -ServiceKey $serviceKey -StartupDelay $Delay) {
            $successCount++
        } else {
            $failCount++
            if ($QBTC_SERVICES[$serviceKey].Critical) {
                Write-QBTCLog "Servicio crítico '$serviceKey' falló. Abortando inicio del sistema." -Level "ERROR"
                Stop-AllServices
                return $false
            }
        }
        
        if ($Delay -gt 0 -and $serviceKey -ne $servicesToStart[-1]) {
            Write-QBTCLog "Esperando ${Delay}s antes del siguiente servicio..." -Level "INFO"
            Start-Sleep -Seconds $Delay
        }
    }
    
    Write-Host ""
    Write-Host "===============================================================================" -ForegroundColor Green
    Write-Host "                    INICIO DE SISTEMA COMPLETADO                             " -ForegroundColor Green
    Write-Host "===============================================================================" -ForegroundColor Green
    Write-Host ""
    Write-QBTCLog "Resumen: $successCount servicios iniciados exitosamente, $failCount fallos" -Level "SUCCESS"
    Write-Host ""
    
    # Mostrar estado final
    Show-SystemStatus
    
    Write-Host "Sistema ejecutándose. Presiona Ctrl+C para detener todos los servicios." -ForegroundColor Cyan
    Write-Host "URLs de monitoreo:" -ForegroundColor Yellow
    Write-Host "   • Master Control: http://localhost:14001/health" -ForegroundColor White
    Write-Host "   • Opportunities: http://localhost:14105/api/status" -ForegroundColor White
    Write-Host ""
    
    return $true
}

# ============================================================================
# PUNTO DE ENTRADA PRINCIPAL
# ============================================================================

function Main {
    try {
        if ($Help) {
            Show-Help
            return
        }
        
        if ($ShowStatus) {
            Show-SystemStatus
            return
        }
        
        if ($StopAll) {
            Stop-AllServices
            return
        }
        
        # Iniciar sistema
        $result = Start-QBTCSystem -TargetServices $Services
        
        if ($result) {
            Write-QBTCLog "Sistema QBTC ejecutándose correctamente" -Level "SUCCESS"
            
            # Mantener el script ejecutándose hasta Ctrl+C
            try {
                while (-not $IsShuttingDown) {
                    Start-Sleep -Seconds 5
                }
            } finally {
                if (-not $IsShuttingDown) {
                    Stop-AllServices
                }
            }
        } else {
            Write-QBTCLog "Error iniciando sistema QBTC" -Level "ERROR"
            exit 1
        }
        
    } catch {
        Write-QBTCLog "Error crítico: $($_.Exception.Message)" -Level "ERROR"
        
        if (-not $IsShuttingDown) {
            Stop-AllServices
        }
        exit 1
    }
}

# Configurar trap para Ctrl+C
trap {
    Write-QBTCLog "Señal de interrupción recibida. Cerrando servicios..." -Level "WARNING"
    $script:IsShuttingDown = $true
    Stop-AllServices
    exit 0
}

# Ejecutar función principal
Main
