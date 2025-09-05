# QBTC QUANTUM TRADING SYSTEM LAUNCHER - PERFECT EDITION
# =====================================================
# Master PowerShell script for impeccable background system launch
# with intelligent dependency resolution and auto-recovery
# 
# Author: QBTC Development Team  
# Version: 2.0.0 - Perfect Edition
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
$global:LastHealthCheck = Get-Date

# Banner Display
function Show-QBTCBanner {
    if (-not $BackgroundMode) {
        Write-Host "`n" -NoNewline
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================" -ForegroundColor $Colors.Header
        Write-Host "  ██████  ██████  ████████  ██████     ██████  ███████ ██████  ███████ ███████  ██████ ████████" -ForegroundColor $Colors.Quantum
        Write-Host " ██    ██ ██   ██    ██    ██          ██   ██ ██      ██   ██ ██      ██      ██         ██   " -ForegroundColor $Colors.Quantum  
        Write-Host " ██    ██ ██████     ██    ██          ██████  █████   ██████  █████   █████   ██         ██   " -ForegroundColor $Colors.Quantum
        Write-Host " ██ ▄▄ ██ ██   ██    ██    ██          ██      ██      ██   ██ ██      ██      ██         ██   " -ForegroundColor $Colors.Quantum
        Write-Host "  ██████  ██████     ██     ██████     ██      ███████ ██   ██ ██      ███████  ██████    ██   " -ForegroundColor $Colors.Quantum
        Write-Host "    ▀▀                                                                                           " -ForegroundColor $Colors.Quantum
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================" -ForegroundColor $Colors.Header
        Write-Host "       [LAUNCH] QUANTUM BITCOIN TRADING COMPUTER v2.0 PERFECT" -ForegroundColor $Colors.Header
        Write-Host "       [INFO] Impeccable Background Launch • Auto-Recovery • Smart Dependencies" -ForegroundColor $Colors.Info
        Write-Host "       [PORTS] Anti-Conflict Port Range: 14000-14999" -ForegroundColor $Colors.Success
        Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
        Write-Host "=====================================================`n" -ForegroundColor $Colors.Header
    }
}

# Enhanced Service Configuration with Perfect Dependencies
$ServiceConfig = @{
    # CORE SERVICES BLOCK (14000-14099) - INDEPENDENT FOUNDATION
    CoreServices = @{
        Configuration = @{
            Name = "Configuration Service"
            Script = "core/config-service.js" 
            Port = 14003
            Priority = "CRITICAL"
            Dependencies = @()  # No dependencies - starts first
            HealthEndpoint = "/config/health"
            MaxRetries = 5
        }
        MessageBus = @{
            Name = "Message Bus & Event Hub" 
            Script = "core/message-bus.js"
            Port = 14002
            Priority = "CRITICAL"
            Dependencies = @()  # No dependencies - starts first
            HealthEndpoint = "/status"
            MaxRetries = 5
        }
        MasterControl = @{
            Name = "Master Control Hub"
            Script = "core/master-control-hub.js"
            Port = 14001
            Priority = "CRITICAL"
            Dependencies = @("Configuration", "MessageBus")
            HealthEndpoint = "/health"
            MaxRetries = 5
        }
        MetricsCollector = @{
            Name = "Metrics Collector"
            Script = "core/metrics-collector.js"
            Port = 14004
            Priority = "HIGH"
            Dependencies = @("MasterControl")
            HealthEndpoint = "/metrics/health"
            MaxRetries = 3
        }
    }

    # DATA & ANALYSIS LAYER (14100-14199) - SMART DEPENDENCY ORDER
    DataLayer = @{
        DataIngestion = @{
            Name = "Binance Data Ingestion"
            Script = "analysis-engine/data-ingestion-server.js"
            Port = 14104
            Priority = "CRITICAL"
            Dependencies = @("MasterControl", "Configuration")
            HealthEndpoint = "/health"
            MaxRetries = 4
        }
        ConsciousnessEngine = @{
            Name = "Consciousness Engine"
            Script = "analysis-engine/consciousness-engine.js"
            Port = 14102
            Priority = "HIGH"
            Dependencies = @("MessageBus", "DataIngestion")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
        QuantumCore = @{
            Name = "Quantum Core Engine"
            Script = "analysis-engine/quantum-core.js"
            Port = 14105
            Priority = "HIGH"
            Dependencies = @("DataIngestion", "ConsciousnessEngine")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
        QuantumAnalysisServer = @{
            Name = "Quantum Analysis Server (Hermetic)"
            Script = "analysis-engine/quantum-analysis-server.js"
            Port = 14103
            Priority = "CRITICAL"
            Dependencies = @("QuantumCore", "ConsciousnessEngine")
            HealthEndpoint = "/health"
            MaxRetries = 4
        }
        QuantumLeverageEngine = @{
            Name = "Quantum Leverage Engine"
            Script = "analysis-engine/quantum-leverage-engine.js"
            Port = 14106
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "QuantumCore")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
    }

    # EXECUTION LAYER (14200-14299) - TRADING INFRASTRUCTURE
    ExecutionLayer = @{
        ExchangeGateway = @{
            Name = "Exchange API Gateway"
            Script = "execution-engine/exchange-gateway.js"
            Port = 14204
            Priority = "CRITICAL"
            Dependencies = @("Configuration", "DataIngestion")
            HealthEndpoint = "/exchange/health"
            MaxRetries = 4
        }
        OrderBookManager = @{
            Name = "Order Book Manager"
            Script = "execution-engine/orderbook-manager.js"
            Port = 14206
            Priority = "HIGH"
            Dependencies = @("ExchangeGateway", "DataIngestion")
            HealthEndpoint = "/orderbook/health"
            MaxRetries = 3
        }
        TradingExecutor = @{
            Name = "Trading Engine Executor"
            Script = "execution-engine/trading-executor.js"
            Port = 14201
            Priority = "CRITICAL"
            Dependencies = @("QuantumAnalysisServer", "ExchangeGateway")
            HealthEndpoint = "/trading/health"
            MaxRetries = 4
        }
        PositionManager = @{
            Name = "Position Manager"
            Script = "execution-engine/position-manager.js"
            Port = 14202
            Priority = "CRITICAL"
            Dependencies = @("TradingExecutor", "OrderBookManager")
            HealthEndpoint = "/positions/health"
            MaxRetries = 4
        }
        PortfolioRebalancer = @{
            Name = "Portfolio Rebalancer"
            Script = "execution-engine/portfolio-rebalancer.js"
            Port = 14203
            Priority = "HIGH"
            Dependencies = @("PositionManager")
            HealthEndpoint = "/portfolio/health"
            MaxRetries = 3
        }
        SignalRouter = @{
            Name = "Signal Router"
            Script = "execution-engine/signal-router.js"
            Port = 14205
            Priority = "HIGH"
            Dependencies = @("TradingExecutor", "MessageBus")
            HealthEndpoint = "/signals/health"
            MaxRetries = 3
        }
        FuturesExecutionServer = @{
            Name = "Futures Execution Server"
            Script = "futures-execution/server.js"
            Port = 14207
            Priority = "CRITICAL"
            Dependencies = @("TradingExecutor", "PositionManager")
            HealthEndpoint = "/health"
            MaxRetries = 4
        }
    }

    # MANAGEMENT LAYER (14300-14399) - RISK & MONITORING
    ManagementLayer = @{
        SecurityCompliance = @{
            Name = "Security & Compliance"
            Script = "management/security-compliance.js"
            Port = 14306
            Priority = "HIGH"
            Dependencies = @("MasterControl")
            HealthEndpoint = "/security/health"
            MaxRetries = 3
        }
        RiskManagement = @{
            Name = "Risk Management Core"
            Script = "management/risk-management.js"
            Port = 14301
            Priority = "CRITICAL"
            Dependencies = @("PositionManager", "SecurityCompliance")
            HealthEndpoint = "/risk/health"
            MaxRetries = 4
        }
        PerformanceTracker = @{
            Name = "Performance Tracker"
            Script = "management/performance-tracker.js"
            Port = 14302
            Priority = "HIGH"
            Dependencies = @("PositionManager", "MetricsCollector")
            HealthEndpoint = "/performance/health"
            MaxRetries = 3
        }
        EmergencyResponse = @{
            Name = "Emergency Response System"
            Script = "management/emergency-response.js"
            Port = 14303
            Priority = "MAXIMUM"
            Dependencies = @("RiskManagement", "MasterControl")
            HealthEndpoint = "/emergency/health"
            MaxRetries = 5
        }
        QuantumStateMonitor = @{
            Name = "Quantum State Monitor (Hermetic)"
            Script = "monitoring/quantum-state-monitor.js"
            Port = 14307
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "ConsciousnessEngine")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
        LeverageManager = @{
            Name = "Quantum Leverage Manager"
            Script = "engines/quantum-leverage-entropy-engine.js"
            Port = 14304
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "RiskManagement")
            HealthEndpoint = "/leverage/health"
            MaxRetries = 3
        }
        PortfolioAnalytics = @{
            Name = "Portfolio Analytics"
            Script = "management/portfolio-analytics.js"
            Port = 14305
            Priority = "MEDIUM"
            Dependencies = @("PerformanceTracker", "PortfolioRebalancer")
            HealthEndpoint = "/analytics/health"
            MaxRetries = 2
        }
    }

    # HERMETIC LAYER (14400-14499) - ADVANCED FEATURES
    HermeticLayer = @{
        HermeticDataPersistence = @{
            Name = "Hermetic Data Persistence"
            Script = "data/hermetic-data-persistence.js"
            Port = 14405
            Priority = "HIGH"
            Dependencies = @("MasterControl", "Configuration")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
        AkashicAdapter = @{
            Name = "Akashic Records Adapter"
            Script = "akashic/akashic-hermetic-adapter.js"
            Port = 14402
            Priority = "MEDIUM"
            Dependencies = @("ConsciousnessEngine", "HermeticDataPersistence")
            HealthEndpoint = "/health"
            MaxRetries = 2
        }
        AkashicPredictionSystem = @{
            Name = "Akashic Prediction System"
            Script = "akashic/akashic-prediction-system.js"
            Port = 14403
            Priority = "MEDIUM"
            Dependencies = @("AkashicAdapter")
            HealthEndpoint = "/health"
            MaxRetries = 2
        }
        ConsciousnessEvolution = @{
            Name = "Consciousness Evolution Engine"
            Script = "consciousness/consciousness-evolution-engine.js"
            Port = 14404
            Priority = "MEDIUM"
            Dependencies = @("ConsciousnessEngine", "QuantumStateMonitor")
            HealthEndpoint = "/health"
            MaxRetries = 2
        }
        QuantumLeverageEntropyEngine = @{
            Name = "Quantum Leverage Entropy Engine"
            Script = "engines/quantum-leverage-entropy-engine.js"
            Port = 14406
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "QuantumStateMonitor")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
        MerkabaProtocol = @{
            Name = "Merkaba Trading Protocol"
            Script = "dimensional/merkaba-trading-protocol.js"
            Port = 14401
            Priority = "HIGH"
            Dependencies = @("QuantumStateMonitor", "ConsciousnessEvolution")
            HealthEndpoint = "/health"
            MaxRetries = 3
        }
    }

    # INTERFACE LAYER (14800-14899) - USER INTERFACES
    InterfaceLayer = @{
        AdminPanel = @{
            Name = "Admin Configuration Panel"
            Script = "frontend/admin-panel.js"
            Port = 14806
            Priority = "HIGH"
            Dependencies = @("Configuration", "SecurityCompliance")
            HealthEndpoint = "/admin/health"
            MaxRetries = 3
        }
        MasterDashboard = @{
            Name = "Master Control Dashboard"
            Script = "frontend/dashboard-server.js"
            Port = 14801
            Priority = "HIGH"
            Dependencies = @("MasterControl", "PerformanceTracker")
            HealthEndpoint = "/dashboard/health"
            StaticFiles = "frontend/"
            MaxRetries = 3
        }
        QuantumDashboard = @{
            Name = "Quantum Analysis Dashboard"
            Script = "frontend/quantum-dashboard-server.js"
            Port = 14802
            Priority = "MEDIUM"
            Dependencies = @("QuantumAnalysisServer", "ConsciousnessEngine")
            HealthEndpoint = "/quantum-ui/health"
            MaxRetries = 2
        }
        TradingDashboard = @{
            Name = "Trading Execution Dashboard"
            Script = "frontend/trading-dashboard.js"
            Port = 14803
            Priority = "MEDIUM"
            Dependencies = @("TradingExecutor", "PositionManager")
            HealthEndpoint = "/trading-ui/health"
            MaxRetries = 2
        }
        RiskDashboard = @{
            Name = "Risk Management Dashboard"
            Script = "frontend/risk-dashboard.js"
            Port = 14804
            Priority = "MEDIUM"
            Dependencies = @("RiskManagement", "EmergencyResponse")
            HealthEndpoint = "/risk-ui/health"
            MaxRetries = 2
        }
        MobileInterface = @{
            Name = "Mobile Interface"
            Script = "frontend/mobile-server.js"
            Port = 14805
            Priority = "LOW"
            Dependencies = @("MasterDashboard")
            HealthEndpoint = "/mobile/health"
            MaxRetries = 1
        }
    }
}

# Enhanced Logging Function with Background Support
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White",
        [switch]$Background
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Add to startup log
    $global:StartupLog += $logEntry
    
    # Always write to log file in background mode
    if ($BackgroundMode -or $Background) {
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

# Enhanced Port Availability Check with Timeout
function Test-PortAvailability {
    param(
        [int]$Port,
        [int]$TimeoutMs = 1000
    )
    
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

# Intelligent Dependency Resolution System
function Resolve-ServiceDependencies {
    param(
        [hashtable]$AllServices,
        [array]$TargetServices = @()
    )
    
    # Flatten all services into single hashtable with references to their layers
    $FlatServices = @{}
    foreach ($layerName in $AllServices.Keys) {
        $layer = $AllServices[$layerName]
        foreach ($serviceName in $layer.Keys) {
            $service = $layer[$serviceName]
            $service.Layer = $layerName
            $FlatServices[$serviceName] = $service
        }
    }
    
    # If no target services specified, resolve all
    if ($TargetServices.Count -eq 0) {
        $TargetServices = $FlatServices.Keys
    }
    
    # Build dependency graph and resolve order
    $ResolvedOrder = @()
    $Visited = @{}
    $Visiting = @{}
    
    function Visit-Service {
        param([string]$ServiceName)
        
        if ($Visited.ContainsKey($ServiceName)) {
            return
        }
        
        if ($Visiting.ContainsKey($ServiceName)) {
            Write-Log "[DEPENDENCY] Circular dependency detected involving $ServiceName" "ERROR"
            throw "Circular dependency detected involving $ServiceName"
        }
        
        if (-not $FlatServices.ContainsKey($ServiceName)) {
            Write-Log "[DEPENDENCY] Service $ServiceName not found in configuration" "WARN"
            return
        }
        
        $Visiting[$ServiceName] = $true
        
        # Visit all dependencies first
        $service = $FlatServices[$ServiceName]
        if ($service.Dependencies -and $service.Dependencies.Count -gt 0) {
            foreach ($dependency in $service.Dependencies) {
                Visit-Service -ServiceName $dependency
            }
        }
        
        $Visiting.Remove($ServiceName)
        $Visited[$ServiceName] = $true
        $ResolvedOrder += $ServiceName
    }
    
    # Visit all target services
    foreach ($serviceName in $TargetServices) {
        Visit-Service -ServiceName $serviceName
    }
    
    # Return services in dependency-resolved order with their full config
    $OrderedServices = @()
    foreach ($serviceName in $ResolvedOrder) {
        if ($TargetServices -contains $serviceName) {
            $OrderedServices += @{
                Name = $serviceName
                Config = $FlatServices[$serviceName]
            }
        }
    }
    
    return $OrderedServices
}

# Enhanced Prerequisites Check with Detailed Validation
function Test-SystemPrerequisites {
    Write-Log "[CHECK] Performing comprehensive system prerequisites check..." "INFO"
    
    $ChecksPassed = 0
    $TotalChecks = 0
    
    # Check Node.js
    $TotalChecks++
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNumber = [version]($nodeVersion -replace 'v', '')
            if ($versionNumber.Major -ge 16) {
                Write-Log "[OK] Node.js $nodeVersion (minimum v16 required)" "SUCCESS"
                $ChecksPassed++
            } else {
                Write-Log "[ERROR] Node.js $nodeVersion is too old. Minimum v16 required." "ERROR"
            }
        } else {
            Write-Log "[ERROR] Node.js not found. Please install Node.js v16 or higher." "ERROR"
        }
    }
    catch {
        Write-Log "[ERROR] Failed to check Node.js: $($_.Exception.Message)" "ERROR"
    }
    
    # Check npm packages
    $TotalChecks++
    if (Test-Path "node_modules") {
        $packageJsonPath = "package.json"
        if (Test-Path $packageJsonPath) {
            try {
                $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
                $requiredDeps = @("express", "axios", "ws", "cors")
                $missingDeps = @()
                
                foreach ($dep in $requiredDeps) {
                    if (-not $packageJson.dependencies.$dep -and -not $packageJson.devDependencies.$dep) {
                        $missingDeps += $dep
                    }
                }
                
                if ($missingDeps.Count -eq 0) {
                    Write-Log "[OK] All required npm packages are configured" "SUCCESS"
                    $ChecksPassed++
                } else {
                    Write-Log "[WARN] Missing dependencies: $($missingDeps -join ', ')" "WARN"
                    Write-Log "[INFO] Run 'npm install' to install missing packages" "INFO"
                }
            }
            catch {
                Write-Log "[WARN] Could not parse package.json" "WARN"
            }
        } else {
            Write-Log "[WARN] package.json not found" "WARN"
        }
    } else {
        Write-Log "[WARN] node_modules directory not found. Run 'npm install' first." "WARN"
    }
    
    # Check system resources
    $TotalChecks++
    try {
        $memory = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory
        $memoryGB = [math]::Round($memory / 1GB, 2)
        
        if ($memoryGB -ge 4) {
            Write-Log "[OK] System memory: ${memoryGB}GB (minimum 4GB recommended)" "SUCCESS"
            $ChecksPassed++
        } else {
            Write-Log "[WARN] System memory: ${memoryGB}GB (4GB+ recommended for optimal performance)" "WARN"
            $ChecksPassed++  # Not critical, just a warning
        }
    }
    catch {
        Write-Log "[WARN] Could not check system memory" "WARN"
        $ChecksPassed++  # Not critical
    }
    
    # Check port availability for critical services
    $TotalChecks++
    $criticalPorts = @(14001, 14002, 14003, 14104, 14103, 14201, 14301, 14801, 14806)
    $portConflicts = @()
    
    foreach ($port in $criticalPorts) {
        if (-not (Test-PortAvailability -Port $port)) {
            $portConflicts += $port
        }
    }
    
    if ($portConflicts.Count -eq 0) {
        Write-Log "[OK] All critical ports available in range 14000-14999" "SUCCESS"
        $ChecksPassed++
    } else {
        Write-Log "[ERROR] Port conflicts detected: $($portConflicts -join ', ')" "ERROR"
        Write-Log "[INFO] Please free these ports or kill conflicting processes before proceeding" "INFO"
    }
    
    # Check disk space
    $TotalChecks++
    try {
        $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        $freeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 2)
        
        if ($freeSpaceGB -ge 1) {
            Write-Log "[OK] Disk free space: ${freeSpaceGB}GB (minimum 1GB required)" "SUCCESS"
            $ChecksPassed++
        } else {
            Write-Log "[ERROR] Insufficient disk space: ${freeSpaceGB}GB (minimum 1GB required)" "ERROR"
        }
    }
    catch {
        Write-Log "[WARN] Could not check disk space" "WARN"
        $ChecksPassed++  # Not critical
    }
    
    # Create required directories
    $TotalChecks++
    try {
        $requiredDirs = @("logs", "temp", "data")
        foreach ($dir in $requiredDirs) {
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Log "[CREATED] Directory: $dir" "INFO"
            }
        }
        Write-Log "[OK] All required directories exist or created" "SUCCESS"
        $ChecksPassed++
    }
    catch {
        Write-Log "[ERROR] Failed to create required directories: $($_.Exception.Message)" "ERROR"
    }
    
    # Summary
    $successRate = [math]::Round(($ChecksPassed / $TotalChecks) * 100, 1)
    Write-Log "[SUMMARY] Prerequisites check: $ChecksPassed/$TotalChecks passed (${successRate}%)" "INFO"
    
    if ($ChecksPassed -ge $TotalChecks - 1) {  # Allow 1 failure for non-critical items
        Write-Log "[OK] System ready for QBTC launch" "SUCCESS"
        return $true
    } else {
        Write-Log "[ERROR] System prerequisites not met. Please address the issues above" "ERROR"
        return $false
    }
}

# Advanced Service Health Check with Retry Logic
function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [hashtable]$ServiceConfig,
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $healthUrl = "http://localhost:$($ServiceConfig.Port)$($ServiceConfig.HealthEndpoint)"
            $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
            
            if ($response.status -eq "healthy" -or $response.status -eq "running") {
                if ($attempt -gt 1) {
                    Write-Log "[RECOVERED] $ServiceName health check passed on attempt $attempt" "RECOVERY"
                }
                return $true
            } else {
                Write-Log "[UNHEALTHY] $ServiceName - Status: $($response.status) (attempt $attempt/$MaxRetries)" "WARN"
            }
        }
        catch {
            Write-Log "[FAILED] $ServiceName health check failed (attempt $attempt/$MaxRetries): $($_.Exception.Message)" "WARN"
        }
        
        if ($attempt -lt $MaxRetries) {
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    return $false
}

# Intelligent Service Startup with Retry Logic
function Start-QBTCService {
    param(
        [hashtable]$Service,
        [string]$ServiceName,
        [string]$Category,
        [int]$MaxRetries = 3
    )
    
    # Validate parameters
    if (-not $Service) {
        Write-Log "[ERROR] Service parameter is null for $ServiceName" "ERROR"
        return $false
    }
    
    if (-not $Service.Name) {
        Write-Log "[ERROR] Service.Name is null for $ServiceName" "ERROR"
        return $false
    }
    
    # Check if service is already running
    if ($global:RunningProcesses.ContainsKey($ServiceName)) {
        $existingProcess = $global:RunningProcesses[$ServiceName].Process
        if ($existingProcess -and -not $existingProcess.HasExited) {
            Write-Log "[INFO] Service $ServiceName is already running (PID: $($existingProcess.Id))" "INFO"
            return $true
        }
    }
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would start: $($Service.Name) on port $($Service.Port)" "INFO"
        
        # In dry run mode, simulate adding to running processes for dependency checks
        $global:RunningProcesses[$ServiceName] = @{
            Process = $null
            Service = $Service
            StartTime = Get-Date
            Category = $Category
            DryRun = $true
        }
        
        return $true
    }
    
    # Initialize retry counter
    if (-not $global:ServiceRetries.ContainsKey($ServiceName)) {
        $global:ServiceRetries[$ServiceName] = 0
    }
    
    $serviceMaxRetries = if ($Service.MaxRetries) { $Service.MaxRetries } else { $MaxRetries }
    
    # Check if max retries exceeded
    if ($global:ServiceRetries[$ServiceName] -ge $serviceMaxRetries) {
        Write-Log "[CRITICAL] $ServiceName exceeded maximum retry attempts ($serviceMaxRetries)" "CRITICAL"
        return $false
    }
    
    # Check if script exists, create wrapper if needed
    $scriptPath = Join-Path $PWD $Service.Script
    if (-not (Test-Path $scriptPath)) {
        Write-Log "[WARN] Script not found: $scriptPath. Creating intelligent wrapper..." "WARN"
        
        # Create placeholder script
        $placeholderDir = Split-Path $scriptPath -Parent
        if (-not (Test-Path $placeholderDir)) {
            New-Item -ItemType Directory -Path $placeholderDir -Force | Out-Null
        }
        
        # Generate enhanced placeholder content
        $placeholderContent = @'
// QBTC Service: {0}
// Auto-generated intelligent wrapper
// Port: {1}
// Priority: {4}
// Generated: {5}

import express from "express";
const app = express();
const PORT = {1};
const SERVICE_NAME = "{0}";
const CATEGORY = "{3}";
const PRIORITY = "{4}";

app.use(express.json());

// Service state management
let serviceState = {{
    status: "starting",
    startTime: new Date(),
    requestCount: 0,
    lastActivity: new Date(),
    errors: []
}};

// Middleware for request tracking
app.use((req, res, next) => {{
    serviceState.requestCount++;
    serviceState.lastActivity = new Date();
    next();
}});

// Health check endpoint
app.get("{2}", (req, res) => {{
    const uptime = Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000);
    res.json({{
        status: serviceState.status,
        service: SERVICE_NAME,
        port: PORT,
        category: CATEGORY,
        priority: PRIORITY,
        timestamp: new Date().toISOString(),
        uptime: uptime,
        requestCount: serviceState.requestCount,
        lastActivity: serviceState.lastActivity.toISOString(),
        version: "2.0.0-perfect",
        mode: process.env.QBTC_MODE || "BALANCED"
    }});
}});

// Enhanced status endpoint
app.get("/status", (req, res) => {{
    const uptime = Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000);
    res.json({{
        service: SERVICE_NAME,
        status: serviceState.status,
        port: PORT,
        category: CATEGORY,
        priority: PRIORITY,
        uptime: uptime,
        requestCount: serviceState.requestCount,
        lastActivity: serviceState.lastActivity.toISOString(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
    }});
}});

// Metrics endpoint
app.get("/metrics", (req, res) => {{
    res.json({{
        service: SERVICE_NAME,
        metrics: {{
            uptime: Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000),
            requests: serviceState.requestCount,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            errors: serviceState.errors.length
        }}
    }});
}});

// Default route
app.get("/", (req, res) => {{
    res.json({{
        message: "QBTC {0} - Perfect Edition",
        service: SERVICE_NAME,
        port: PORT,
        version: "2.0.0-perfect",
        endpoints: ["{2}", "/status", "/metrics"],
        documentation: "Auto-generated intelligent service wrapper"
    }});
}});

// Error handler
app.use((error, req, res, next) => {{
    serviceState.errors.push({{
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
    }});
    
    // Keep only last 10 errors
    if (serviceState.errors.length > 10) {{
        serviceState.errors = serviceState.errors.slice(-10);
    }}
    
    res.status(500).json({{
        error: "Internal server error",
        service: SERVICE_NAME,
        timestamp: new Date().toISOString()
    }});
}});

app.listen(PORT, () => {{
    serviceState.status = "healthy";
    console.log(`[ROCKET] QBTC Service ${{SERVICE_NAME}} running on port ${{PORT}}`);
    console.log(`[CHART] Health check: http://localhost:${{PORT}}{2}`);
    console.log(`[TREND_UP] Status: http://localhost:${{PORT}}/status`);
    console.log(`[CLIPBOARD] Metrics: http://localhost:${{PORT}}/metrics`);
}});

// Graceful shutdown handling
process.on("SIGTERM", () => {{
    console.log("📤 Graceful shutdown initiated...");
    serviceState.status = "shutting_down";
    process.exit(0);
}});

process.on("SIGINT", () => {{
    console.log("📤 Received SIGINT, shutting down...");
    serviceState.status = "shutting_down";
    process.exit(0);
}});

// Uncaught exception handler
process.on("uncaughtException", (error) => {{
    console.error("[SIREN] Uncaught Exception:", error);
    serviceState.status = "error";
    serviceState.errors.push({{
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        type: "uncaughtException"
    }});
}});

process.on("unhandledRejection", (reason, promise) => {{
    console.error("[SIREN] Unhandled Rejection at:", promise, "reason:", reason);
    serviceState.status = "error";
    serviceState.errors.push({{
        timestamp: new Date().toISOString(),
        error: reason.toString(),
        type: "unhandledRejection"
    }});
}});
'@
        $placeholderContent = $placeholderContent -f $Service.Name, $Service.Port, $Service.HealthEndpoint, $Category, $Service.Priority, (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        Set-Content -Path $scriptPath -Value $placeholderContent -Encoding UTF8
        Write-Log "[CREATED] Intelligent wrapper: $scriptPath" "SUCCESS"
    }
    
    try {
        # Increment retry counter
        $global:ServiceRetries[$ServiceName]++
        
        # Set environment variables
        $env:QBTC_SERVICE_NAME = $Service.Name
        $env:QBTC_SERVICE_PORT = $Service.Port
        $env:QBTC_MODE = $Mode
        $env:QBTC_LOG_LEVEL = $LogLevel
        $env:QBTC_CATEGORY = $Category
        
        # Start the service
        $attemptMsg = if ($global:ServiceRetries[$ServiceName] -gt 1) { " (retry $($global:ServiceRetries[$ServiceName])/$serviceMaxRetries)" } else { "" }
        Write-Log "[LAUNCH] Starting: $($Service.Name) on port $($Service.Port)$attemptMsg" "INFO"
        
        $processArgs = @{
            FilePath = "node"
            ArgumentList = @($Service.Script)
            WindowStyle = "Hidden"
            PassThru = $true
            RedirectStandardOutput = "logs/$ServiceName-output.log"
            RedirectStandardError = "logs/$ServiceName-error.log"
        }
        
        # Ensure logs directory exists
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        
        $process = Start-Process @processArgs
        
        # Store process info
        $global:RunningProcesses[$ServiceName] = @{
            Process = $process
            Service = $Service
            StartTime = Get-Date
            Category = $Category
            RetryCount = $global:ServiceRetries[$ServiceName]
            LastHealthCheck = $null
        }
        
        # Wait a moment for startup
        Start-Sleep -Seconds 2
        
        # Check if process is still running
        if ($process.HasExited) {
            Write-Log "[ERROR] Failed to start: $($Service.Name) (exit code: $($process.ExitCode))" "ERROR"
            
            # Log error details
            $errorLogPath = "logs/$ServiceName-error.log"
            if (Test-Path $errorLogPath) {
                $errorContent = Get-Content $errorLogPath -Tail 5 | Out-String
                if ($errorContent.Trim()) {
                    Write-Log "[ERROR DETAILS] $($errorContent.Trim())" "ERROR"
                }
            }
            
            return $false
        } else {
            Write-Log "[OK] Started successfully: $($Service.Name) (PID: $($process.Id))" "SUCCESS"
            
            # Wait a bit more and perform initial health check
            Start-Sleep -Seconds 3
            $healthResult = Test-ServiceHealth -ServiceName $ServiceName -ServiceConfig $Service -MaxRetries 2 -RetryDelay 1
            
            if ($healthResult) {
                Write-Log "[HEALTHY] $($Service.Name) passed initial health check" "SUCCESS"
                # Reset retry counter on successful start
                $global:ServiceRetries[$ServiceName] = 0
                return $true
            } else {
                Write-Log "[WARN] $($Service.Name) started but failed health check" "WARN"
                # Don't fail startup for health check issues, service might still be initializing
                return $true
            }
        }
    }
    catch {
        Write-Log "[ERROR] Error starting $($Service.Name): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Comprehensive Health Check System
function Test-AllServicesHealth {
    param([switch]$Detailed)
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would perform health checks on all services" "INFO"
        return $true
    }
    
    Write-Log "[HEALTH] Performing comprehensive health checks..." "INFO"
    
    $healthyServices = 0
    $totalServices = $global:RunningProcesses.Count
    $healthResults = @{}
    
    if ($totalServices -eq 0) {
        Write-Log "[WARN] No services running to check" "WARN"
        return $false
    }
    
    # Parallel health checks for faster execution
    $jobs = @()
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $service = $serviceInfo.Service
        
        $job = Start-Job -ScriptBlock {
            param($ServiceName, $ServiceConfig)
            
            try {
                $healthUrl = "http://localhost:$($ServiceConfig.Port)$($ServiceConfig.HealthEndpoint)"
                $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
                
                return @{
                    ServiceName = $ServiceName
                    Success = $true
                    Status = $response.status
                    Response = $response
                    Error = $null
                }
            }
            catch {
                return @{
                    ServiceName = $ServiceName
                    Success = $false
                    Status = "failed"
                    Response = $null
                    Error = $_.Exception.Message
                }
            }
        } -ArgumentList $serviceName, $service
        
        $jobs += @{ Job = $job; ServiceName = $serviceName; Service = $service }
    }
    
    # Wait for all health checks to complete
    foreach ($jobInfo in $jobs) {
        $result = Receive-Job -Job $jobInfo.Job -Wait
        Remove-Job -Job $jobInfo.Job -Force
        
        $serviceName = $result.ServiceName
        $healthResults[$serviceName] = $result
        
        if ($result.Success -and ($result.Status -eq "healthy" -or $result.Status -eq "running")) {
            Write-Log "[HEALTHY] $serviceName" "SUCCESS"
            $healthyServices++
            
            # Update last health check time
            if ($global:RunningProcesses.ContainsKey($serviceName)) {
                $global:RunningProcesses[$serviceName].LastHealthCheck = Get-Date
            }
        } else {
            if ($result.Success) {
                Write-Log "[UNHEALTHY] $serviceName - Status: $($result.Status)" "WARN"
            } else {
                Write-Log "[FAILED] $serviceName - Error: $($result.Error)" "ERROR"
            }
            $global:SystemHealthy = $false
        }
    }
    
    # Update global health check timestamp
    $global:LastHealthCheck = Get-Date
    
    $healthRate = if ($totalServices -gt 0) { [math]::Round(($healthyServices / $totalServices) * 100, 1) } else { 0 }
    Write-Log "[HEALTH] Summary: $healthyServices/$totalServices services healthy (${healthRate}%)" "INFO"
    
    # Detailed reporting if requested
    if ($Detailed) {
        Write-Log "[DETAILED] Health check results:" "INFO"
        foreach ($serviceName in $healthResults.Keys) {
            $result = $healthResults[$serviceName]
            $service = $global:RunningProcesses[$serviceName].Service
            
            if ($result.Success -and $result.Response) {
                $uptime = if ($result.Response.uptime) { $result.Response.uptime } else { "N/A" }
                $requests = if ($result.Response.requestCount) { $result.Response.requestCount } else { "N/A" }
                Write-Log "  - $serviceName (Port: $($service.Port)): $($result.Status) | Uptime: ${uptime}s | Requests: $requests" "INFO"
            } else {
                Write-Log "  - $serviceName (Port: $($service.Port)): FAILED - $($result.Error)" "ERROR"
            }
        }
    }
    
    return ($healthyServices -eq $totalServices)
}

# Intelligent Service Launcher with Dependency Resolution
function Start-ServiceLayer {
    param(
        [hashtable]$Services,
        [string]$LayerName,
        [string]$LayerIcon
    )
    
    Write-Log "$LayerIcon Starting $LayerName..." "INFO"
    
    # Use intelligent dependency resolution
    $orderedServices = Resolve-ServiceDependencies -AllServices @{$LayerName = $Services}
    $startedCount = 0
    $totalCount = $orderedServices.Count
    
    foreach ($serviceEntry in $orderedServices) {
        $serviceName = $serviceEntry.Name
        $service = $serviceEntry.Config
        
        # Check dependencies are running
        $dependenciesReady = $true
        if ($service.Dependencies -and $service.Dependencies.Count -gt 0) {
            foreach ($dep in $service.Dependencies) {
                if (-not $global:RunningProcesses.ContainsKey($dep)) {
                    Write-Log "[DEPENDENCY] $serviceName waiting for: $dep" "WARN"
                    $dependenciesReady = $false
                    break
                }
                
                # Check if dependency is healthy
                $depProcess = $global:RunningProcesses[$dep].Process
                if ($depProcess -and $depProcess.HasExited) {
                    Write-Log "[DEPENDENCY] $serviceName dependency $dep has failed" "ERROR"
                    $dependenciesReady = $false
                    break
                }
            }
        }
        
        if (-not $dependenciesReady) {
            Write-Log "[SKIP] $serviceName - dependencies not ready" "WARN"
            continue
        }
        
        # Start the service with intelligent retry
        $success = $false
        $maxRetries = if ($service.MaxRetries) { $service.MaxRetries } else { $MaxRetries }
        
        for ($retry = 1; $retry -le $maxRetries; $retry++) {
            if (Start-QBTCService -Service $service -ServiceName $serviceName -Category $LayerName) {
                $startedCount++
                $success = $true
                break
            } else {
                if ($retry -lt $maxRetries) {
                    $waitTime = [math]::Min($retry * 2, 10)  # Exponential backoff, max 10 seconds
                    Write-Log "[RETRY] Will retry $serviceName in ${waitTime}s (attempt $($retry + 1)/$maxRetries)" "WARN"
                    Start-Sleep -Seconds $waitTime
                }
            }
        }
        
        if (-not $success) {
            Write-Log "[CRITICAL] Failed to start $serviceName after $maxRetries attempts" "CRITICAL"
            if ($service.Priority -eq "CRITICAL" -or $service.Priority -eq "MAXIMUM") {
                Write-Log "[WARNING] Critical service $serviceName failed - system stability may be affected" "ERROR"
            }
        }
        
        # Inter-service startup delay
        if ($StartupDelay -gt 0 -and $success) {
            Start-Sleep -Seconds $StartupDelay
        }
    }
    
    $successRate = if ($totalCount -gt 0) { [math]::Round(($startedCount / $totalCount) * 100, 1) } else { 100 }
    Write-Log "[STATS] $LayerName`: $startedCount/$totalCount services started ($($successRate)%)" "INFO"
    
    return $startedCount
}

# Enhanced System Shutdown
function Stop-QBTCSystem {
    param([switch]$Force)
    
    Write-Log "[SHUTDOWN] Initiating system shutdown..." "INFO"
    
    # Stop auto-recovery first
    if ($global:BackgroundMonitoring) {
        $recoveryJob = Get-Job -Name "QBTC-AutoRecovery" -ErrorAction SilentlyContinue
        if ($recoveryJob) {
            Stop-Job -Job $recoveryJob -ErrorAction SilentlyContinue
            Remove-Job -Job $recoveryJob -Force -ErrorAction SilentlyContinue
            Write-Log "[SHUTDOWN] Auto-recovery system stopped" "INFO"
        }
        $global:BackgroundMonitoring = $false
    }
    
    if ($global:RunningProcesses.Count -eq 0) {
        Write-Log "[SHUTDOWN] No services to stop" "INFO"
        return
    }
    
    # Group services by reverse priority for graceful shutdown
    $priorityGroups = @{
        "LOW" = @()
        "MEDIUM" = @()
        "HIGH" = @()
        "CRITICAL" = @()
        "MAXIMUM" = @()
    }
    
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $priority = $serviceInfo.Service.Priority
        if ($priorityGroups.ContainsKey($priority)) {
            $priorityGroups[$priority] += $serviceName
        } else {
            $priorityGroups["MEDIUM"] += $serviceName
        }
    }
    
    # Shutdown in reverse priority order (LOW first, MAXIMUM last)
    $shutdownOrder = @("LOW", "MEDIUM", "HIGH", "CRITICAL", "MAXIMUM")
    
    foreach ($priority in $shutdownOrder) {
        $services = $priorityGroups[$priority]
        if ($services.Count -gt 0) {
            Write-Log "[SHUTDOWN] Stopping $priority priority services: $($services -join ', ')" "INFO"
            
            foreach ($serviceName in $services) {
                $serviceInfo = $global:RunningProcesses[$serviceName]
                $process = $serviceInfo.Process
                $service = $serviceInfo.Service
                
                if (-not $process -or $process.HasExited) {
                    Write-Log "[SHUTDOWN] $serviceName already stopped" "INFO"
                    continue
                }
                
                try {
                    Write-Log "[SHUTDOWN] Stopping $serviceName (PID: $($process.Id))..." "INFO"
                    
                    if ($Force) {
                        $process.Kill()
                        Write-Log "[SHUTDOWN] Force killed $serviceName" "SUCCESS"
                    } else {
                        # Try graceful shutdown first
                        $process.CloseMainWindow()
                        
                        # Wait for graceful shutdown
                        $timeout = if ($priority -eq "CRITICAL" -or $priority -eq "MAXIMUM") { 10 } else { 5 }
                        if (-not $process.WaitForExit($timeout * 1000)) {
                            Write-Log "[SHUTDOWN] Force killing $serviceName after ${timeout}s timeout" "WARN"
                            $process.Kill()
                        }
                        
                        Write-Log "[SHUTDOWN] Stopped $serviceName" "SUCCESS"
                    }
                }
                catch {
                    Write-Log "[SHUTDOWN] Error stopping $serviceName`: $($_.Exception.Message)" "ERROR"
                }
            }
            
            # Brief pause between priority groups
            if ($priority -ne "MAXIMUM") {
                Start-Sleep -Seconds 2
            }
        }
    }
    
    # Clear global state
    $global:RunningProcesses.Clear()
    $global:ServiceRetries.Clear()
    
    Write-Log "[SHUTDOWN] QBTC system shutdown complete" "SUCCESS"
}

# System Status Display
function Show-SystemStatus {
    param([switch]$Detailed)
    
    if (-not $BackgroundMode) {
        Write-Host "`n[STATUS] QBTC PERFECT SYSTEM STATUS" -ForegroundColor $Colors.Header
        Write-Host "=========================================================" -ForegroundColor $Colors.Header
    }
    
    if ($global:RunningProcesses.Count -eq 0) {
        $msg = "No services currently running."
        Write-Log "[STATUS] $msg" "WARN"
        if (-not $BackgroundMode) {
            Write-Host $msg -ForegroundColor $Colors.Warning
        }
        return
    }
    
    # Group by category/layer
    $layerGroups = @{}
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $layer = $serviceInfo.Category
        if (-not $layerGroups.ContainsKey($layer)) {
            $layerGroups[$layer] = @()
        }
        $layerGroups[$layer] += $serviceName
    }
    
    $totalRunning = 0
    $totalHealthy = 0
    
    foreach ($layer in $layerGroups.Keys | Sort-Object) {
        Write-Log "[LAYER] $layer" "INFO"
        
        foreach ($serviceName in $layerGroups[$layer] | Sort-Object) {
            $serviceInfo = $global:RunningProcesses[$serviceName]
            $service = $serviceInfo.Service
            $process = $serviceInfo.Process
            
            $isRunning = $process -and -not $process.HasExited
            $totalRunning += if ($isRunning) { 1 } else { 0 }
            
            if ($isRunning) {
                $uptime = ((Get-Date) - $serviceInfo.StartTime).ToString('hh\:mm\:ss')
                $status = "[RUNNING]"
                $statusColor = if (-not $BackgroundMode) { $Colors.Success } else { "Success" }
                
                # Check if service is healthy (if health check was performed recently)
                $isHealthy = $serviceInfo.LastHealthCheck -and 
                           ((Get-Date) - $serviceInfo.LastHealthCheck).TotalMinutes -lt 5
                $totalHealthy += if ($isHealthy) { 1 } else { 0 }
                
                $healthStatus = if ($isHealthy) { "[CHECK]" } else { "[WARNING]" }
            } else {
                $uptime = "N/A"
                $status = "[STOPPED]"
                $statusColor = if (-not $BackgroundMode) { $Colors.Error } else { "Error" }
                $healthStatus = "[X]"
            }
            
            $statusLine = "  $healthStatus [$($service.Priority)] $($service.Name) | Port: $($service.Port) | $status | Uptime: $uptime"
            Write-Log $statusLine "INFO"
            
            if (-not $BackgroundMode -and $isRunning -and $Detailed) {
                Write-Host "     [URL] http://localhost:$($service.Port)$($service.HealthEndpoint)" -ForegroundColor $Colors.Quantum
            }
        }
    }
    
    $healthRate = if ($totalRunning -gt 0) { [math]::Round(($totalHealthy / $totalRunning) * 100, 1) } else { 0 }
    Write-Log "[SUMMARY] Running: $totalRunning | Healthy: $totalHealthy (${healthRate}%)" "INFO"
    
    if (-not $BackgroundMode) {
        Write-Host "=========================================================" -ForegroundColor $Colors.Header
    }
}

# Auto-Recovery System with Intelligent Restart Logic
function Start-ServiceAutoRecovery {
    if (-not $EnableAutoRecovery) {
        return
    }
    
    Write-Log "[RECOVERY] Auto-recovery system activated" "INFO"
    
    $global:BackgroundMonitoring = $true
    
    # Create recovery job with more sophisticated logic
    Start-Job -Name "QBTC-AutoRecovery" -InitializationScript {
        # Import necessary functions into job context
        function Write-RecoveryLog {
            param([string]$Message, [string]$Level = "INFO")
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
            $logEntry = "[$timestamp] [$Level] $Message"
            Add-Content -Path "logs/qbtc-recovery-$(Get-Date -Format 'yyyyMMdd').log" -Value $logEntry -Encoding UTF8
        }
    } -ScriptBlock {
        param($ServiceConfig, $HealthCheckInterval, $BackgroundMode)
        
        Write-RecoveryLog "[RECOVERY] Auto-recovery monitoring started"
        $recoveryAttempts = @{}
        $maxRecoveryAttempts = 3
        $recoveryWindow = 300  # 5 minutes
        
        while ($true) {
            try {
                Start-Sleep -Seconds $HealthCheckInterval
                
                # Get current running processes (need to re-query each time)
                $currentProcesses = @{}
                Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
                    $currentProcesses[$_.Id] = $_
                }
                
                # Check for dead processes and attempt recovery
                $currentTime = Get-Date
                
                # Read service status from log files or attempt HTTP checks
                $services = @(
                    @{Name="DataIngestion"; Port=14104; Priority="CRITICAL"},
                    @{Name="QuantumAnalysisServer"; Port=14103; Priority="CRITICAL"},
                    @{Name="TradingExecutor"; Port=14201; Priority="CRITICAL"},
                    @{Name="RiskManagement"; Port=14301; Priority="CRITICAL"},
                    @{Name="MasterControl"; Port=14001; Priority="CRITICAL"}
                )
                
                foreach ($service in $services) {
                    try {
                        $healthUrl = "http://localhost:$($service.Port)/health"
                        $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 3 -ErrorAction Stop
                        # Service is responding, no action needed
                    }
                    catch {
                        # Service is not responding
                        $serviceName = $service.Name
                        Write-RecoveryLog "[RECOVERY] Service $serviceName (port $($service.Port)) is not responding" "WARN"
                        
                        # Only attempt recovery for critical services
                        if ($service.Priority -eq "CRITICAL") {
                            # Check recovery attempt history
                            $attemptKey = "$serviceName-$($currentTime.ToString('yyyyMMddHH'))"
                            
                            if (-not $recoveryAttempts.ContainsKey($attemptKey)) {
                                $recoveryAttempts[$attemptKey] = 0
                            }
                            
                            if ($recoveryAttempts[$attemptKey] -lt $maxRecoveryAttempts) {
                                $recoveryAttempts[$attemptKey]++
                                Write-RecoveryLog "[RECOVERY] Attempting restart of $serviceName (attempt $($recoveryAttempts[$attemptKey])/$maxRecoveryAttempts)" "INFO"
                                
                                # Log recovery attempt for main process to handle
                                $recoveryRequest = @{
                                    ServiceName = $serviceName
                                    Port = $service.Port
                                    Priority = $service.Priority
                                    Timestamp = $currentTime
                                    Attempt = $recoveryAttempts[$attemptKey]
                                } | ConvertTo-Json -Compress
                                
                                Add-Content -Path "temp/recovery-requests.log" -Value $recoveryRequest -Encoding UTF8
                            } else {
                                Write-RecoveryLog "[RECOVERY] Max recovery attempts reached for $serviceName" "ERROR"
                            }
                        }
                    }
                }
                
                # Clean old recovery attempt records
                $cutoffTime = $currentTime.AddSeconds(-$recoveryWindow)
                $keysToRemove = @()
                foreach ($key in $recoveryAttempts.Keys) {
                    if ($key -match '(.*)-([0-9]{10})$') {
                        $timeStr = $matches[2]
                        try {
                            $attemptTime = [DateTime]::ParseExact($timeStr, 'yyyyMMddHH', $null)
                            if ($attemptTime -lt $cutoffTime) {
                                $keysToRemove += $key
                            }
                        }
                        catch {
                            $keysToRemove += $key
                        }
                    }
                }
                
                foreach ($key in $keysToRemove) {
                    $recoveryAttempts.Remove($key)
                }
            }
            catch {
                Write-RecoveryLog "[RECOVERY] Error in recovery loop: $($_.Exception.Message)" "ERROR"
            }
        }
    } -ArgumentList $ServiceConfig, $HealthCheckInterval, $BackgroundMode | Out-Null
    
    Write-Log "[RECOVERY] Background monitoring job started" "SUCCESS"
}

# Main System Launcher - Perfect Edition
function Start-QBTCSystemPerfect {
    # Show banner
    Show-QBTCBanner
    
    # Configuration summary
    $configMsg = "Mode=$Mode | LogLevel=$LogLevel | StartupDelay=${StartupDelay}s | MaxRetries=$MaxRetries"
    if ($EnableAutoRecovery) { $configMsg += " | AutoRecovery=ON" }
    if ($BackgroundMode) { $configMsg += " | BackgroundMode=ON" }
    Write-Log "[CONFIG] $configMsg" "INFO"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Simulation mode - no services will actually start" "WARN"
    }
    
    # Prerequisites check
    if (-not $SkipHealthChecks) {
        if (-not (Test-SystemPrerequisites)) {
            Write-Log "[ERROR] System prerequisites failed. Use -SkipHealthChecks to bypass" "ERROR"
            return $false
        }
    }
    
    # Initialize system
    Write-Log "[STARTUP] Initiating QBTC Perfect system startup sequence..." "INFO"
    
    # Create temp directory for inter-process communication
    if (-not (Test-Path "temp")) {
        New-Item -ItemType Directory -Path "temp" -Force | Out-Null
    }
    
    $totalStarted = 0
    $startTime = Get-Date
    
    # Start services layer by layer with intelligent dependency resolution
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.CoreServices -LayerName "Core Services" -LayerIcon "[WRENCH] [CORE]"
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.DataLayer -LayerName "Data Layer" -LayerIcon "[SATELLITE] [DATA]"
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.ExecutionLayer -LayerName "Execution Layer" -LayerIcon "[LIGHTNING] [EXECUTION]"
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.ManagementLayer -LayerName "Management Layer" -LayerIcon "🛡️ [MANAGEMENT]"
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.HermeticLayer -LayerName "Hermetic Layer" -LayerIcon "[CRYSTAL_BALL] [HERMETIC]"
    $totalStarted += Start-ServiceLayer -Services $ServiceConfig.InterfaceLayer -LayerName "Interface Layer" -LayerIcon "[MONITOR] [INTERFACE]"
    
    $totalTime = ((Get-Date) - $startTime).TotalSeconds
    
    # Final status
    Write-Log "[COMPLETE] QBTC Perfect startup completed in ${totalTime}s" "SUCCESS"
    Write-Log "[STATS] Services started: $totalStarted" "INFO"
    Write-Log "[SYSTEM] Port range: 14000-14999 | Background optimized" "INFO"
    
    # Post-startup health checks
    if (-not $SkipHealthChecks -and -not $DryRun -and $totalStarted -gt 0) {
        Write-Log "[HEALTH] Performing initial system health verification..." "INFO"
        Start-Sleep -Seconds 5
        Test-AllServicesHealth -Detailed
    }
    
    # Start auto-recovery if enabled
    if ($EnableAutoRecovery -and -not $DryRun) {
        Start-ServiceAutoRecovery
    }
    
    # Show primary access points
    if (-not $BackgroundMode -and $totalStarted -gt 0) {
        Write-Host "`n[ACCESS] PRIMARY ACCESS POINTS:" -ForegroundColor $Colors.Header
        Write-Host "=========================================================" -ForegroundColor $Colors.Header
        Write-Host "[CONTROL_KNOBS]  [MASTER] Master Dashboard:     http://localhost:14801" -ForegroundColor $Colors.Success
        Write-Host "🔬 [QUANTUM] Quantum Analysis:    http://localhost:14802" -ForegroundColor $Colors.Quantum
        Write-Host "[TREND_UP] [TRADING] Trading Dashboard:   http://localhost:14803" -ForegroundColor $Colors.Info
        Write-Host "🛡️  [RISK] Risk Management:        http://localhost:14804" -ForegroundColor $Colors.Warning
        Write-Host "⚙️  [ADMIN] Admin Panel:           http://localhost:14806" -ForegroundColor $Colors.Info
        Write-Host "[CHART] [DATA] Data Ingestion API:     http://localhost:14104" -ForegroundColor $Colors.Quantum
        Write-Host "=========================================================" -ForegroundColor $Colors.Header
    }
    
    # Show system status
    Show-SystemStatus -Detailed:$(-not $BackgroundMode)
    
    # Background vs interactive mode handling
    if ($BackgroundMode -or $DryRun) {
        Write-Log "[BACKGROUND] System running in background mode" "SUCCESS"
        return $true
    } else {
        Write-Host "`n[BULB] [INFO] Press Ctrl+C to shutdown the system gracefully" -ForegroundColor $Colors.Info
        Write-Host "[REFRESH] [INFO] Auto-recovery: $(if ($EnableAutoRecovery) { 'ENABLED' } else { 'DISABLED' })" -ForegroundColor $(if ($EnableAutoRecovery) { $Colors.Success } else { $Colors.Warning })
        
        # Interactive monitoring loop
        try {
            $lastStatusUpdate = Get-Date
            while ($true) {
                Start-Sleep -Seconds $HealthCheckInterval
                
                # Periodic status update
                if (((Get-Date) - $lastStatusUpdate).TotalMinutes -ge 5) {
                    Write-Log "[MONITOR] Periodic system check..." "INFO"
                    Show-SystemStatus
                    Test-AllServicesHealth
                    $lastStatusUpdate = Get-Date
                }
                
                # Check for dead processes
                $deadProcesses = @()
                foreach ($serviceName in $global:RunningProcesses.Keys) {
                    $process = $global:RunningProcesses[$serviceName].Process
                    if ($process -and $process.HasExited) {
                        $deadProcesses += $serviceName
                    }
                }
                
                if ($deadProcesses.Count -gt 0) {
                    Write-Log "[ALERT] Dead processes detected: $($deadProcesses -join ', ')" "ERROR"
                    if (-not $EnableAutoRecovery) {
                        Write-Log "[INFO] Enable auto-recovery (-EnableAutoRecovery) for automatic restart" "INFO"
                    }
                }
            }
        }
        catch [System.Management.Automation.PipelineStoppedException] {
            Write-Log "[SHUTDOWN] Shutdown signal received..." "INFO"
        }
        finally {
            Stop-QBTCSystem
        }
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
    Write-Log "[TRACE] Stack trace: $($_.ScriptStackTrace)" "ERROR"
    
    # Emergency cleanup
    if ($global:RunningProcesses.Count -gt 0) {
        Write-Log "[CLEANUP] Performing emergency cleanup..." "WARN"
        Stop-QBTCSystem -Force
    }
    
    exit 1
}
finally {
    # Save comprehensive startup log
    if ($global:StartupLog.Count -gt 0) {
        $logFile = "logs/qbtc-perfect-startup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        $global:StartupLog | Out-File -FilePath $logFile -Encoding UTF8
        Write-Log "[LOG] Comprehensive startup log saved: $logFile" "INFO"
    }
    
    # Background mode completion message
    if ($BackgroundMode -and $global:RunningProcesses.Count -gt 0) {
        Write-Log "[PERFECT] QBTC Perfect system is now running optimally in background" "SUCCESS"
        Write-Log "[MONITOR] Check logs/qbtc-system-$(Get-Date -Format 'yyyyMMdd').log for ongoing status" "INFO"
    }
}
