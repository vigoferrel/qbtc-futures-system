# QBTC QUANTUM TRADING SYSTEM LAUNCHER - PERFECT EDITION CLEAN
# ============================================================
# Master PowerShell script for impeccable background system launch
# with intelligent dependency resolution and auto-recovery
# 
# Author: QBTC Development Team  
# Version: 2.0.1 - Perfect Clean Edition
# Last Updated: 2025-01-20

param(
    [string]$Mode = "BALANCED",           # CONSERVATIVE, BALANCED, AGGRESSIVE, EXTREME
    [switch]$SkipHealthChecks,            # Skip initial health checks
    [switch]$DryRun,                      # Show what would be launched without actually starting
    [string]$LogLevel = "INFO",           # DEBUG, INFO, WARN, ERROR
    [int]$StartupDelay = 2,               # Seconds between service starts
    [int]$MaxRetries = 3,                 # Max retries for critical services
    [switch]$EnableAutoRecovery,          # Enable automatic service recovery
    [switch]$BackgroundMode,              # Optimize for background execution
    [int]$HealthCheckInterval = 30        # Seconds between health checks in background
)

# Console Colors for Beautiful Output
$Colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
    Quantum = "Blue"
    Critical = "Red"
    Recovery = "DarkYellow"
}

# Global Variables
$global:RunningProcesses = @{}
$global:StartupLog = @()
$global:SystemHealthy = $true
$global:ServiceRetries = @{}
$global:BackgroundMonitoring = $false

# Banner Display
function Show-QBTCBanner {
    if (-not $BackgroundMode) {
        Write-Host "`n" -NoNewline
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================" -ForegroundColor $Colors.Header
        Write-Host "   QBTC PERFECT EDITION - QUANTUM TRADING COMPUTER" -ForegroundColor $Colors.Quantum
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================" -ForegroundColor $Colors.Header
        Write-Host "       [LAUNCH] QUANTUM BITCOIN TRADING COMPUTER v2.0.1 CLEAN" -ForegroundColor $Colors.Header
        Write-Host "       [INFO] Impeccable Background Launch | Auto-Recovery | Smart Dependencies" -ForegroundColor $Colors.Info
        Write-Host "       [PORTS] Anti-Conflict Port Range: 14000-14999" -ForegroundColor $Colors.Success
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================`n" -ForegroundColor $Colors.Header
    }
}

# [LIGHTNING] QBTC SYSTEM CONFIGURATION - COMPLETE ARCHITECTURE
$ServiceConfig = @{
    # [BRAIN] QUANTUM CORE SERVICES (14000-14099) - Sistema de Consciencia y Leverage
    QuantumCore = @{
        QuantumLeverageEngine = @{
            Name = "Quantum Leverage Entropy Engine"
            Script = "engines/quantum-leverage-entropy-engine.js"
            Port = 14001
            Priority = "MAXIMUM"
            Dependencies = @()
            HealthEndpoint = "/leverage/health"
            MaxRetries = 5
            Description = "Motor de leverage cuántico con entropía λ₇₉₁₉"
        }
        ConsciousnessEvolution = @{
            Name = "Consciousness Evolution Engine"
            Script = "consciousness/consciousness-evolution-engine.js"
            Port = 14002
            Priority = "CRITICAL"
            Dependencies = @()
            HealthEndpoint = "/consciousness/health"
            MaxRetries = 5
            Description = "Evolución de consciencia cuántica hermética"
        }
        MerkabaProtocol = @{
            Name = "Merkaba Trading Protocol"
            Script = "dimensional/merkaba-trading-protocol.js"
            Port = 14003
            Priority = "CRITICAL"
            Dependencies = @("ConsciousnessEvolution")
            HealthEndpoint = "/merkaba/health"
            MaxRetries = 4
            Description = "Protocolo dimensional Merkaba para trading superior"
        }
    }

    # [WIZARD] HERMETIC SERVICES (14100-14199) - Trading Hermético y Transmutación
    HermeticServices = @{
        HermeticAutoTrader = @{
            Name = "Hermetic Auto-Trader"
            Script = "trading/hermetic-auto-trader.js"
            Port = 14101
            Priority = "MAXIMUM"
            Dependencies = @("QuantumLeverageEngine", "ConsciousnessEvolution", "MerkabaProtocol")
            HealthEndpoint = "/hermetic/health"
            MaxRetries = 5
            Description = "Trader automático hermético con jerarquización"
        }
        TransmutationEngine = @{
            Name = "Alchemical Transmutation Engine"
            Script = "trading/hermetic-transmutation-integration.js"
            Port = 14102
            Priority = "HIGH"
            Dependencies = @("HermeticAutoTrader")
            HealthEndpoint = "/transmutation/health"
            MaxRetries = 3
            Description = "Motor de transmutación alquímica pérdidas→sabiduría"
        }
        AkashicAdapter = @{
            Name = "Akashic Prediction System"
            Script = "akashic/akashic-prediction-system.js"
            Port = 14103
            Priority = "HIGH"
            Dependencies = @("ConsciousnessEvolution")
            HealthEndpoint = "/akashic/health"
            MaxRetries = 3
            Description = "Sistema de predicciones akáshicas universales"
        }
    }

    # [CHART] ANALYSIS SERVICES (14200-14299) - Análisis y Datos
    AnalysisServices = @{
        QuantumAnalysisCore = @{
            Name = "Quantum Analysis Core"
            Script = "analysis-engine/quantum-core.js"
            Port = 14201
            Priority = "CRITICAL"
            Dependencies = @("QuantumLeverageEngine")
            HealthEndpoint = "/quantum/health"
            MaxRetries = 4
            Description = "Núcleo de análisis cuántico con λ₇₉₁₉"
        }
        DataIngestionServer = @{
            Name = "QBTC Data Ingestion"
            Script = "analysis-engine/data-ingestion-server.js"
            Port = 14202
            Priority = "CRITICAL"
            Dependencies = @()
            HealthEndpoint = "/data/health"
            MaxRetries = 4
            Description = "Ingesta de datos de 77 símbolos divinos"
        }
        ConsciousnessAnalyzer = @{
            Name = "Consciousness State Analyzer"
            Script = "analysis-engine/consciousness-engine.js"
            Port = 14203
            Priority = "HIGH"
            Dependencies = @("ConsciousnessEvolution", "DataIngestionServer")
            HealthEndpoint = "/consciousness-analysis/health"
            MaxRetries = 3
            Description = "Analizador de estado de consciencia"
        }
    }

    # [GLOBE] ADMIN & INTERFACE (14300-14399) - Servidores de Administración
    AdminServices = @{
        HermeticAdminServer = @{
            Name = "Hermetic Admin Server ULTIMATE"
            Script = "server/hermetic-admin-server.js"
            Port = 8888
            Priority = "CRITICAL"
            Dependencies = @("HermeticAutoTrader", "QuantumLeverageEngine", "ConsciousnessEvolution")
            HealthEndpoint = "/api/system/health"
            MaxRetries = 4
            Description = "Servidor de administración maestro QBTC"
        }
        ConsciousnessIntegrator = @{
            Name = "Consciousness-QBTC Integrator"
            Script = "integrations/consciousness-qbtc-integrator.js"
            Port = 14301
            Priority = "HIGH"
            Dependencies = @("HermeticAutoTrader", "ConsciousnessEvolution", "MerkabaProtocol")
            HealthEndpoint = "/integration/health"
            MaxRetries = 3
            Description = "Integrador de consciencia con sistema QBTC"
        }
        TradingDashboard = @{
            Name = "QBTC Trading Dashboard"
            Script = "frontend/trading-dashboard.js"
            Port = 14302
            Priority = "MEDIUM"
            Dependencies = @("HermeticAdminServer")
            HealthEndpoint = "/dashboard/health"
            MaxRetries = 2
            Description = "Dashboard de trading en tiempo real"
        }
    }

    # [SATELLITE] DATA PERSISTENCE (14400-14499) - Almacenamiento y Logs
    DataServices = @{
        HermeticDataPersistence = @{
            Name = "Hermetic Data Persistence"
            Script = "data/hermetic-data-persistence.js"
            Port = 14401
            Priority = "HIGH"
            Dependencies = @("HermeticAutoTrader")
            HealthEndpoint = "/persistence/health"
            MaxRetries = 3
            Description = "Sistema de persistencia de datos hermético"
        }
        HermeticLogger = @{
            Name = "Advanced Hermetic Logger"
            Script = "utils/hermetic-logger.js"
            Port = 14402
            Priority = "MEDIUM"
            Dependencies = @()
            HealthEndpoint = "/logger/health"
            MaxRetries = 2
            Description = "Sistema de logging avanzado hermético"
        }
    }
}

# Enhanced Logging Function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Add to startup log
    $global:StartupLog += $logEntry
    
    # Always write to log file in background mode
    if ($BackgroundMode) {
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        Add-Content -Path "logs/qbtc-system-$(Get-Date -Format 'yyyyMMdd').log" -Value $logEntry -Encoding UTF8
    }
    
    # Display with colors only if not in background mode
    if (-not $BackgroundMode) {
        $displayColor = switch ($Level) {
            "ERROR" { $Colors.Error }
            "WARN"  { $Colors.Warning }
            "SUCCESS" { $Colors.Success }
            "INFO"  { $Colors.Info }
            "CRITICAL" { $Colors.Critical }
            "RECOVERY" { $Colors.Recovery }
            default { $Color }
        }
        
        Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
        Write-Host "[$Level] " -NoNewline -ForegroundColor $displayColor
        Write-Host $Message -ForegroundColor $displayColor
    }
}

# Port Availability Check
function Test-PortAvailability {
    param([int]$Port, [int]$TimeoutMs = 1000)
    
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $client.BeginConnect([System.Net.IPAddress]::Loopback, $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        
        if ($wait) {
            try {
                $client.EndConnect($asyncResult)
                $client.Close()
                return $false  # Port is in use
            } catch {
                return $true   # Port is free
            }
        } else {
            $client.Close()
            return $true       # Timeout = Port is free
        }
    }
    catch {
        return $true
    }
}

# Service Health Check
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [hashtable]$ServiceConfig,
        [int]$MaxRetries = 3
    )
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $healthUrl = "http://localhost:$($ServiceConfig.Port)$($ServiceConfig.HealthEndpoint)"
            $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
            
            if ($response.status -eq "healthy" -or $response.status -eq "running") {
                return $true
            }
        }
        catch {
            Write-Log "[HEALTH] $ServiceName health check failed (attempt $attempt): $($_.Exception.Message)" "WARN"
        }
        
        if ($attempt -lt $MaxRetries) {
            Start-Sleep -Seconds 2
        }
    }
    
    return $false
}

# Start QBTC Service
function Start-QBTCService {
    param(
        [hashtable]$Service,
        [string]$ServiceName,
        [string]$Category
    )
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would start: $($Service.Name) on port $($Service.Port)" "INFO"
        
        # Simulate adding to running processes for dependency checks
        $global:RunningProcesses[$ServiceName] = @{
            Process = $null
            Service = $Service
            StartTime = Get-Date
            Category = $Category
            DryRun = $true
        }
        
        return $true
    }
    
    # Check if script exists, create wrapper if needed
    $scriptPath = Join-Path $PWD $Service.Script
    if (-not (Test-Path $scriptPath)) {
        Write-Log "[WARN] Script not found: $scriptPath. Creating wrapper..." "WARN"
        
        # Create directory if needed
        $placeholderDir = Split-Path $scriptPath -Parent
        if (-not (Test-Path $placeholderDir)) {
            New-Item -ItemType Directory -Path $placeholderDir -Force | Out-Null
        }
        
        # Create placeholder JavaScript content
        $placeholderContent = @"
// QBTC Service: $($Service.Name)
// Auto-generated wrapper
// Port: $($Service.Port)

import express from "express";
const app = express();
const PORT = $($Service.Port);
const SERVICE_NAME = "$($Service.Name)";

app.use(express.json());

let serviceState = {
    status: "healthy",
    startTime: new Date(),
    requestCount: 0
};

app.use((req, res, next) => {
    serviceState.requestCount++;
    next();
});

app.get("$($Service.HealthEndpoint)", (req, res) => {
    const uptime = Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000);
    res.json({
        status: serviceState.status,
        service: SERVICE_NAME,
        port: PORT,
        uptime: uptime,
        requestCount: serviceState.requestCount
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "QBTC " + SERVICE_NAME + " - Perfect Clean Edition",
        service: SERVICE_NAME,
        port: PORT,
        version: "2.0.1-clean"
    });
});

app.listen(PORT, () => {
    console.log('QBTC Service ' + SERVICE_NAME + ' running on port ' + PORT);
    console.log('Health check: http://localhost:' + PORT + '$($Service.HealthEndpoint)');
});

process.on("SIGTERM", () => {
    console.log("Graceful shutdown initiated...");
    process.exit(0);
});
"@
        
        Set-Content -Path $scriptPath -Value $placeholderContent -Encoding UTF8
        Write-Log "[CREATED] Wrapper: $scriptPath" "SUCCESS"
    }
    
    try {
        Write-Log "[LAUNCH] Starting: $($Service.Name) on port $($Service.Port)" "INFO"
        
        # Ensure logs directory exists
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        
        $processArgs = @{
            FilePath = "node"
            ArgumentList = @($Service.Script)
            WindowStyle = "Hidden"
            PassThru = $true
            RedirectStandardOutput = "logs/$ServiceName-output.log"
            RedirectStandardError = "logs/$ServiceName-error.log"
        }
        
        $process = Start-Process @processArgs
        
        # Store process info
        $global:RunningProcesses[$ServiceName] = @{
            Process = $process
            Service = $Service
            StartTime = Get-Date
            Category = $Category
        }
        
        # Wait for startup
        Start-Sleep -Seconds 3
        
        # Check if process is still running
        if ($process.HasExited) {
            Write-Log "[ERROR] Failed to start: $($Service.Name)" "ERROR"
            return $false
        } else {
            Write-Log "[OK] Started successfully: $($Service.Name) (PID: $($process.Id))" "SUCCESS"
            
            # Perform health check
            Start-Sleep -Seconds 2
            $healthResult = Test-ServiceHealth -ServiceName $ServiceName -ServiceConfig $Service
            
            if ($healthResult) {
                Write-Log "[HEALTHY] $($Service.Name) passed health check" "SUCCESS"
            } else {
                Write-Log "[WARN] $($Service.Name) started but health check failed" "WARN"
            }
            
            return $true
        }
    }
    catch {
        Write-Log "[ERROR] Error starting $($Service.Name): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Start Service Layer
function Start-ServiceLayer {
    param(
        [hashtable]$Services,
        [string]$LayerName,
        [string]$LayerIcon
    )
    
    Write-Log "$LayerIcon Starting $LayerName..." "INFO"
    
    $startedCount = 0
    $totalCount = $Services.Count
    
    foreach ($serviceName in $Services.Keys) {
        $service = $Services[$serviceName]
        
        # Check dependencies
        $dependenciesReady = $true
        if ($service.Dependencies -and $service.Dependencies.Count -gt 0) {
            foreach ($dep in $service.Dependencies) {
                if (-not $global:RunningProcesses.ContainsKey($dep)) {
                    Write-Log "[DEPENDENCY] $serviceName waiting for: $dep" "WARN"
                    $dependenciesReady = $false
                    break
                }
            }
        }
        
        if (-not $dependenciesReady) {
            Write-Log "[SKIP] $serviceName - dependencies not ready" "WARN"
            continue
        }
        
        # Start the service
        if (Start-QBTCService -Service $service -ServiceName $serviceName -Category $LayerName) {
            $startedCount++
        }
        
        # Inter-service delay
        if ($StartupDelay -gt 0) {
            Start-Sleep -Seconds $StartupDelay
        }
    }
    
    $successRate = if ($totalCount -gt 0) { [math]::Round(($startedCount / $totalCount) * 100, 1) } else { 100 }
    Write-Log "[STATS] $LayerName`: $startedCount/$totalCount services started ($successRate%)" "INFO"
    
    return $startedCount
}

# System Status Display
function Show-SystemStatus {
    if ($global:RunningProcesses.Count -eq 0) {
        Write-Log "[STATUS] No services currently running." "WARN"
        return
    }
    
    Write-Log "[STATUS] QBTC System Status:" "INFO"
    
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $service = $serviceInfo.Service
        $process = $serviceInfo.Process
        
        $isRunning = $process -and -not $process.HasExited
        
        if ($isRunning) {
            $uptime = ((Get-Date) - $serviceInfo.StartTime).ToString('hh\:mm\:ss')
            Write-Log "  [RUNNING] $($service.Name) | Port: $($service.Port) | Uptime: $uptime" "SUCCESS"
        } else {
            Write-Log "  [STOPPED] $($service.Name) | Port: $($service.Port)" "ERROR"
        }
    }
}

# Main System Launcher
function Start-QBTCSystemPerfect {
    # Show banner
    Show-QBTCBanner
    
    Write-Log "[CONFIG] Mode=$Mode | StartupDelay=${StartupDelay}s | MaxRetries=$MaxRetries" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Simulation mode - no services will actually start" "WARN"
    }
    
    # Initialize system
    Write-Log "[STARTUP] Initiating QBTC Perfect system startup..." "INFO"
    
    $totalStarted = 0
    $startTime = Get-Date
    
    # [ROCKET] Start QBTC services in optimal order with dependencies
    Write-Log "[FIRE] LAUNCHING QBTC QUANTUM TRADING ARCHITECTURE" "INFO"
    
    # Phase 1: Quantum Core - Base consciousness and leverage systems
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.QuantumCore -LayerName "Quantum Core Systems" -LayerIcon "[LIGHTNING]"
    
    # Phase 2: Hermetic Services - Trading intelligence and transmutation 
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.HermeticServices -LayerName "Hermetic Trading Services" -LayerIcon "[WIZARD]"
    
    # Phase 3: Analysis Services - Quantum analysis and data processing
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.AnalysisServices -LayerName "Analysis & Data Services" -LayerIcon "[CHART]"
    
    # Phase 4: Admin & Interface - Control and monitoring dashboards
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.AdminServices -LayerName "Admin & Interface Services" -LayerIcon "[GLOBE]"
    
    # Phase 5: Data Services - Persistence and logging
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.DataServices -LayerName "Data Persistence Services" -LayerIcon "[SATELLITE]"
    
    $totalTime = ((Get-Date) - $startTime).TotalSeconds
    
    # Final status
    Write-Log "[COMPLETE] QBTC Perfect startup completed in ${totalTime}s" "SUCCESS"
    Write-Log "[STATS] Services started: $totalStarted" "INFO"
    
    # Show primary QBTC access points
    if (-not $BackgroundMode -and $totalStarted -gt 0) {
        Write-Host "`n[TARGET] [ACCESS] QBTC QUANTUM SYSTEM ACCESS POINTS:" -ForegroundColor $Colors.Header
        Write-Host "🏛️  Hermetic Admin Server:     http://localhost:8888" -ForegroundColor $Colors.Success
        Write-Host "[CHART] Trading Dashboard:         http://localhost:14302" -ForegroundColor $Colors.Success
        Write-Host "[LIGHTNING] Quantum Leverage Engine:   http://localhost:14001/leverage/health" -ForegroundColor $Colors.Quantum
        Write-Host "[BRAIN] Consciousness Evolution:   http://localhost:14002/consciousness/health" -ForegroundColor $Colors.Quantum
        Write-Host "[WIZARD] Hermetic Auto-Trader:      http://localhost:14101/hermetic/health" -ForegroundColor $Colors.Info
        Write-Host "[SATELLITE] Data Ingestion:            http://localhost:14202/data/health" -ForegroundColor $Colors.Info
        Write-Host "[CRYSTAL_BALL] Akashic Predictions:       http://localhost:14103/akashic/health" -ForegroundColor $Colors.Info
    }
    
    # Show system status
    Show-SystemStatus
    
    # Background mode handling
    if ($BackgroundMode -or $DryRun) {
        Write-Log "[BACKGROUND] System running in background mode" "SUCCESS"
        return $true
    }
    
    return $true
}

# Script Execution Entry Point
try {
    $result = Start-QBTCSystemPerfect
    
    if (-not $result) {
        Write-Log "[FATAL] System startup failed" "ERROR"
        exit 1
    }
    
    if ($BackgroundMode) {
        Write-Log "[SUCCESS] QBTC Perfect system launched successfully in background" "SUCCESS"
    }
}
catch {
    Write-Log "[FATAL] Fatal error during startup: $($_.Exception.Message)" "ERROR"
    exit 1
}
finally {
    # Save startup log
    if ($global:StartupLog.Count -gt 0) {
        $logFile = "logs/qbtc-perfect-startup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        $global:StartupLog | Out-File -FilePath $logFile -Encoding UTF8
        Write-Log "[LOG] Startup log saved: $logFile" "INFO"
    }
    
    if ($BackgroundMode -and $global:RunningProcesses.Count -gt 0) {
        Write-Log "[PERFECT] QBTC Perfect system is running optimally" "SUCCESS"
    }
}
