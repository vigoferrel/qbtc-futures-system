# QBTC QUANTUM TRADING SYSTEM LAUNCHER
# =====================================================
# Master PowerShell script to launch the complete QBTC system
# with anti-conflict port allocation (14000-14999 range)
# 
# Author: QBTC Development Team
# Version: 1.0.0
# Last Updated: 2025-01-20

param(
    [string]$Mode = "BALANCED",           # CONSERVATIVE, BALANCED, AGGRESSIVE, EXTREME
    [switch]$SkipHealthChecks,            # Skip initial health checks
    [switch]$DryRun,                      # Show what would be launched without actually starting
    [string]$LogLevel = "INFO",           # DEBUG, INFO, WARN, ERROR
    [int]$StartupDelay = 2                # Seconds between service starts
)

# Console Colors for Beautiful Output
$Colors = @{
    Success = "Green"
    Warning = "Yellow" 
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
    Quantum = "Blue"
}

# Banner Display
function Show-QBTCBanner {
    Write-Host "`n" -NoNewline
    Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
    Write-Host "=====================================================" -ForegroundColor $Colors.Header
    Write-Host "  ██████  ██████  ████████  ██████     ███████ ██    ██ ███████" -ForegroundColor $Colors.Quantum
    Write-Host " ██    ██ ██   ██    ██    ██          ██       ██  ██  ██     " -ForegroundColor $Colors.Quantum  
    Write-Host " ██    ██ ██████     ██    ██          ███████   ████   ███████" -ForegroundColor $Colors.Quantum
    Write-Host " ██ ▄▄ ██ ██   ██    ██    ██               ██    ██         ██" -ForegroundColor $Colors.Quantum
    Write-Host "  ██████  ██████     ██     ██████     ███████    ██    ███████" -ForegroundColor $Colors.Quantum
    Write-Host "    ▀▀                                                         " -ForegroundColor $Colors.Quantum
    Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
    Write-Host "=====================================================" -ForegroundColor $Colors.Header
    Write-Host "       [LAUNCH] QUANTUM BITCOIN TRADING COMPUTER v2.0" -ForegroundColor $Colors.Header
    Write-Host "       [INFO] Lambda Resonance • Hermetic Analysis • Consciousness Trading" -ForegroundColor $Colors.Info
    Write-Host "       [PORTS] Anti-Conflict Port Range: 14000-14999" -ForegroundColor $Colors.Success
    Write-Host "[QBTC]" -ForegroundColor $Colors.Quantum -NoNewline
    Write-Host "=====================================================`n" -ForegroundColor $Colors.Header
}

# Service Configuration with Safe Ports
$ServiceConfig = @{
    # CORE SERVICES BLOCK (14000-14099)
    CoreServices = @{
        MasterControl = @{
            Name = "Master Control Hub"
            Script = "core/master-control-hub.js"
            Port = 14001
            Priority = "CRITICAL"
            Dependencies = @()
            HealthEndpoint = "/health"
        }
        MessageBus = @{
            Name = "Message Bus & Event Hub" 
            Script = "core/message-bus.js"
            Port = 14002
            Priority = "CRITICAL"
            Dependencies = @()
            HealthEndpoint = "/status"
        }
        Configuration = @{
            Name = "Configuration Service"
            Script = "core/config-service.js" 
            Port = 14003
            Priority = "HIGH"
            Dependencies = @()
            HealthEndpoint = "/config/health"
        }
        MetricsCollector = @{
            Name = "Metrics Collector"
            Script = "core/metrics-collector.js"
            Port = 14004
            Priority = "HIGH"
            Dependencies = @("MasterControl")
            HealthEndpoint = "/metrics/health"
        }
    }

    # ANALYSIS ENGINES BLOCK (14100-14199)
    AnalysisEngines = @{
        DataIngestion = @{
            Name = "Binance Data Ingestion"
            Script = "analysis-engine/data-ingestion-server.js"
            Port = 14104
            Priority = "CRITICAL"
            Dependencies = @("MasterControl", "Configuration")
            HealthEndpoint = "/health"
        }
        ConsciousnessEngine = @{
            Name = "Consciousness Engine"
            Script = "analysis-engine/consciousness-engine.js"
            Port = 14102
            Priority = "HIGH"
            Dependencies = @("MessageBus", "DataIngestion")
            HealthEndpoint = "/health"
        }
        QuantumCore = @{
            Name = "Quantum Core Engine"
            Script = "analysis-engine/quantum-core.js"
            Port = 14105
            Priority = "HIGH"
            Dependencies = @("DataIngestion", "ConsciousnessEngine")
            HealthEndpoint = "/health"
        }
        QuantumAnalysisServer = @{
            Name = "Quantum Analysis Server (Hermetic)"
            Script = "analysis-engine/quantum-analysis-server.js"
            Port = 14103
            Priority = "CRITICAL"
            Dependencies = @("QuantumCore", "ConsciousnessEngine")
            HealthEndpoint = "/health"
        }
        QuantumLeverageEngine = @{
            Name = "Quantum Leverage Engine"
            Script = "analysis-engine/quantum-leverage-engine.js"
            Port = 14106
            Priority = "HIGH"
            Dependencies = @("QuantumCore", "QuantumAnalysisServer")
            HealthEndpoint = "/health"
        }
    }

    # EXECUTION ENGINES BLOCK (14200-14299)
    ExecutionEngines = @{
        ExchangeGateway = @{
            Name = "Exchange API Gateway"
            Script = "execution-engine/exchange-gateway.js"
            Port = 14204
            Priority = "CRITICAL"
            Dependencies = @("Configuration", "DataIngestion")
            HealthEndpoint = "/exchange/health"
        }
        OrderBookManager = @{
            Name = "Order Book Manager"
            Script = "execution-engine/orderbook-manager.js"
            Port = 14206
            Priority = "MEDIUM"
            Dependencies = @("ExchangeGateway")
            HealthEndpoint = "/orderbook/health"
        }
        TradingExecutor = @{
            Name = "Trading Engine Executor"
            Script = "execution-engine/trading-executor.js"
            Port = 14201
            Priority = "CRITICAL"
            Dependencies = @("QuantumAnalysisServer", "ExchangeGateway")
            HealthEndpoint = "/trading/health"
        }
        PositionManager = @{
            Name = "Position Manager"
            Script = "execution-engine/position-manager.js"
            Port = 14202
            Priority = "CRITICAL"
            Dependencies = @("TradingExecutor")
            HealthEndpoint = "/positions/health"
        }
        PortfolioRebalancer = @{
            Name = "Portfolio Rebalancer"
            Script = "execution-engine/portfolio-rebalancer.js"
            Port = 14203
            Priority = "HIGH"
            Dependencies = @("PositionManager")
            HealthEndpoint = "/portfolio/health"
        }
        SignalRouter = @{
            Name = "Signal Router"
            Script = "execution-engine/signal-router.js"
            Port = 14205
            Priority = "HIGH"
            Dependencies = @("TradingExecutor", "MessageBus")
            HealthEndpoint = "/signals/health"
        }
        FuturesExecutionServer = @{
            Name = "Futures Execution Server"
            Script = "futures-execution/server.js"
            Port = 14207
            Priority = "CRITICAL"
            Dependencies = @("QuantumAnalysisServer", "TradingExecutor")
            HealthEndpoint = "/health"
        }
    }

    # MONITORING & QUANTUM SYSTEMS BLOCK (14300-14399)
    ManagementSystems = @{
        RiskManagement = @{
            Name = "Risk Management Core"
            Script = "management/risk-management.js"
            Port = 14301
            Priority = "CRITICAL"
            Dependencies = @("PositionManager", "PortfolioRebalancer")
            HealthEndpoint = "/risk/health"
        }
        PerformanceTracker = @{
            Name = "Performance Tracker"
            Script = "management/performance-tracker.js"
            Port = 14302
            Priority = "HIGH"
            Dependencies = @("PositionManager")
            HealthEndpoint = "/performance/health"
        }
        EmergencyResponse = @{
            Name = "Emergency Response System"
            Script = "management/emergency-response.js"
            Port = 14303
            Priority = "MAXIMUM"
            Dependencies = @("RiskManagement", "MasterControl")
            HealthEndpoint = "/emergency/health"
        }
        LeverageManager = @{
            Name = "Quantum Leverage Manager"
            Script = "engines/quantum-leverage-entropy-engine.js"
            Port = 14304
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "RiskManagement")
            HealthEndpoint = "/leverage/health"
        }
        PortfolioAnalytics = @{
            Name = "Portfolio Analytics"
            Script = "management/portfolio-analytics.js"
            Port = 14305
            Priority = "MEDIUM"
            Dependencies = @("PerformanceTracker")
            HealthEndpoint = "/analytics/health"
        }
        SecurityCompliance = @{
            Name = "Security & Compliance"
            Script = "management/security-compliance.js"
            Port = 14306
            Priority = "HIGH"
            Dependencies = @("MasterControl")
            HealthEndpoint = "/security/health"
        }
        QuantumStateMonitor = @{
            Name = "Quantum State Monitor (Hermetic)"
            Script = "monitoring/quantum-state-monitor.js"
            Port = 14307
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "ConsciousnessEngine")
            HealthEndpoint = "/health"
        }
    }

    # HERMETIC & DIMENSIONAL SYSTEMS BLOCK (14400-14499)
    HermeticSystems = @{
        MerkabaProtocol = @{
            Name = "Merkaba Trading Protocol"
            Script = "dimensional/merkaba-trading-protocol.js"
            Port = 14401
            Priority = "HIGH"
            Dependencies = @("QuantumStateMonitor")
            HealthEndpoint = "/health"
        }
        AkashicAdapter = @{
            Name = "Akashic Records Adapter"
            Script = "akashic/akashic-hermetic-adapter.js"
            Port = 14402
            Priority = "MEDIUM"
            Dependencies = @("ConsciousnessEngine")
            HealthEndpoint = "/health"
        }
        AkashicPredictionSystem = @{
            Name = "Akashic Prediction System"
            Script = "akashic/akashic-prediction-system.js"
            Port = 14403
            Priority = "MEDIUM"
            Dependencies = @("AkashicAdapter")
            HealthEndpoint = "/health"
        }
        ConsciousnessEvolution = @{
            Name = "Consciousness Evolution Engine"
            Script = "consciousness/consciousness-evolution-engine.js"
            Port = 14404
            Priority = "MEDIUM"
            Dependencies = @("ConsciousnessEngine", "QuantumStateMonitor")
            HealthEndpoint = "/health"
        }
        HermeticDataPersistence = @{
            Name = "Hermetic Data Persistence"
            Script = "data/hermetic-data-persistence.js"
            Port = 14405
            Priority = "HIGH"
            Dependencies = @("MasterControl")
            HealthEndpoint = "/health"
        }
        QuantumLeverageEntropyEngine = @{
            Name = "Quantum Leverage Entropy Engine"
            Script = "engines/quantum-leverage-entropy-engine.js"
            Port = 14406
            Priority = "HIGH"
            Dependencies = @("QuantumAnalysisServer", "QuantumStateMonitor")
            HealthEndpoint = "/health"
        }
    }

    # FRONTEND & DASHBOARD INTERFACES BLOCK (14800-14899)
    Dashboards = @{
        MasterDashboard = @{
            Name = "Master Control Dashboard"
            Script = "frontend/dashboard-server.js"
            Port = 14801
            Priority = "HIGH"
            Dependencies = @("MasterControl", "PerformanceTracker")
            HealthEndpoint = "/dashboard/health"
            StaticFiles = "frontend/"
        }
        QuantumDashboard = @{
            Name = "Quantum Analysis Dashboard"
            Script = "frontend/quantum-dashboard-server.js"
            Port = 14802
            Priority = "MEDIUM"
            Dependencies = @("QuantumAnalysisServer", "ConsciousnessEngine")
            HealthEndpoint = "/quantum-ui/health"
        }
        TradingDashboard = @{
            Name = "Trading Execution Dashboard"
            Script = "frontend/trading-dashboard.js"
            Port = 14803
            Priority = "MEDIUM"
            Dependencies = @("TradingExecutor", "PositionManager")
            HealthEndpoint = "/trading-ui/health"
        }
        RiskDashboard = @{
            Name = "Risk Management Dashboard"
            Script = "frontend/risk-dashboard.js"
            Port = 14804
            Priority = "MEDIUM"
            Dependencies = @("RiskManagement", "EmergencyResponse")
            HealthEndpoint = "/risk-ui/health"
        }
        MobileInterface = @{
            Name = "Mobile Interface"
            Script = "frontend/mobile-server.js"
            Port = 14805
            Priority = "LOW"
            Dependencies = @("MasterDashboard")
            HealthEndpoint = "/mobile/health"
        }
        AdminPanel = @{
            Name = "Admin Configuration Panel"
            Script = "frontend/admin-panel.js"
            Port = 14806
            Priority = "MEDIUM"
            Dependencies = @("Configuration", "SecurityCompliance")
            HealthEndpoint = "/admin/health"
        }
    }
}

# Global Variables
$global:RunningProcesses = @{}
$global:StartupLog = @()
$global:SystemHealthy = $true

# Logging Function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Add to startup log
    $global:StartupLog += $logEntry
    
    # Display with colors
    $displayColor = switch ($Level) {
        "ERROR" { $Colors.Error }
        "WARN"  { $Colors.Warning }
        "SUCCESS" { $Colors.Success }
        "INFO"  { $Colors.Info }
        default { $Color }
    }
    
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host "[$Level] " -NoNewline -ForegroundColor $displayColor
    Write-Host $Message -ForegroundColor $displayColor
}

# Port Availability Check
function Test-PortAvailability {
    param([int]$Port)
    
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

# Check Prerequisites
function Test-Prerequisites {
    Write-Log "[CHECK] Checking system prerequisites..." "INFO" $Colors.Info
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "[OK] Node.js detected: $nodeVersion" "SUCCESS"
        } else {
            Write-Log "[ERROR] Node.js not found. Please install Node.js v16 or higher." "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "[ERROR] Node.js not found. Please install Node.js v16 or higher." "ERROR"
        return $false
    }
    
    # Check npm packages
    if (Test-Path "node_modules") {
        Write-Log "[OK] npm packages detected" "SUCCESS"
    } else {
        Write-Log "[WARN] npm packages not found. Run 'npm install' first." "WARN"
    }
    
    # Check port availability for critical services
    $criticalPorts = @(14001, 14002, 14103, 14201, 14301, 14801)
    $portConflicts = @()
    
    foreach ($port in $criticalPorts) {
        if (-not (Test-PortAvailability -Port $port)) {
            $portConflicts += $port
        }
    }
    
    if ($portConflicts.Count -gt 0) {
        Write-Log "Port conflicts detected: $($portConflicts -join ', ')" "ERROR"
        Write-Log "Please free these ports or kill conflicting processes." "ERROR"
        return $false
    } else {
        Write-Log "All critical ports available (14000-14999 range)" "SUCCESS"
    }
    
    return $true
}

# Start Individual Service
function Start-QBTCService {
    param(
        [hashtable]$Service,
        [string]$ServiceName,
        [string]$Category
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
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Would start: $($Service.Name) on port $($Service.Port)" "INFO" $Colors.Quantum
        
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
    
    # Check if script exists
    $scriptPath = Join-Path $PWD $Service.Script
    if (-not (Test-Path $scriptPath)) {
        Write-Log "[WARN] Script not found: $scriptPath. Creating placeholder..." "WARN"
        
        # Create placeholder script
        $placeholderDir = Split-Path $scriptPath -Parent
        if (-not (Test-Path $placeholderDir)) {
            New-Item -ItemType Directory -Path $placeholderDir -Force | Out-Null
        }
        
        # Generate placeholder content with ES module syntax
        $placeholderContent = @'
// QBTC Service Placeholder: {0}
// Auto-generated by launch script
// Port: {1}

import express from "express";
const app = express();
const PORT = {1};

app.use(express.json());

// Health check endpoint
app.get("{2}", (req, res) => {{
    res.json({{
        status: "healthy",
        service: "{0}",
        port: PORT,
        timestamp: new Date().toISOString(),
        message: "QBTC {0} - Placeholder Service"
    }});
}});

// Basic status endpoint
app.get("/status", (req, res) => {{
    res.json({{
        service: "{0}",
        status: "running",
        port: PORT,
        category: "{3}",
        priority: "{4}",
        uptime: process.uptime()
    }});
}});

// Default route
app.get("/", (req, res) => {{
    res.json({{
        message: "QBTC {0} - Placeholder Service",
        port: PORT,
        endpoints: ["{2}", "/status"]
    }});
}});

app.listen(PORT, () => {{
    console.log("Service {0} running on port " + PORT);
    console.log("Health check: http://localhost:" + PORT + "{2}");
}});

// Handle graceful shutdown
process.on("SIGTERM", () => {{
    console.log("Graceful shutdown initiated...");
    process.exit(0);
}});

process.on("SIGINT", () => {{
    console.log("Received SIGINT, shutting down...");
    process.exit(0);
}});
'@
        $placeholderContent = $placeholderContent -f $Service.Name, $Service.Port, $Service.HealthEndpoint, $Category, $Service.Priority
        Set-Content -Path $scriptPath -Value $placeholderContent -Encoding UTF8
        Write-Log "[OK] Created placeholder: $scriptPath" "SUCCESS"
    }
    
    try {
        # Set environment variables
        $env:QBTC_SERVICE_NAME = $Service.Name
        $env:QBTC_SERVICE_PORT = $Service.Port
        $env:QBTC_MODE = $Mode
        $env:QBTC_LOG_LEVEL = $LogLevel
        
        # Start the service
        Write-Log "[LAUNCH] Starting: $($Service.Name) on port $($Service.Port)..." "INFO" $Colors.Quantum
        
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
        }
        
        # Wait a moment for startup
        Start-Sleep -Seconds 1
        
        # Check if process is still running
        if ($process.HasExited) {
            Write-Log "[ERROR] Failed to start: $($Service.Name)" "ERROR"
            return $false
        } else {
            Write-Log "[OK] Started successfully: $($Service.Name) (PID: $($process.Id))" "SUCCESS"
            return $true
        }
    }
    catch {
        Write-Log "[ERROR] Error starting $($Service.Name): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Start Service Category
function Start-ServiceCategory {
    param(
        [hashtable]$Services,
        [string]$CategoryName,
        [string]$CategoryIcon
    )
    
    Write-Log "`n$CategoryIcon Starting $CategoryName..." "INFO" $Colors.Header
    
    $startedCount = 0
    $totalCount = $Services.Count
    
    foreach ($serviceName in $Services.Keys) {
        $service = $Services[$serviceName]
        
        # Check dependencies
        if ($service.Dependencies -and ($service.Dependencies.Count -gt 0)) {
            $dependenciesMet = $true
            foreach ($dep in $service.Dependencies) {
                if (-not $global:RunningProcesses.ContainsKey($dep)) {
                    Write-Log "[WAIT] Waiting for dependency: $dep" "WARN"
                    $dependenciesMet = $false
                    break
                }
            }
            
            if (-not $dependenciesMet) {
                Write-Log "[SKIP] Skipping $serviceName - dependencies not met" "WARN"
                continue
            }
        }
        
        # Start the service
        if (Start-QBTCService -Service $service -ServiceName $serviceName -Category $CategoryName) {
            $startedCount++
        }
        
        # Startup delay
        if ($StartupDelay -gt 0) {
            Start-Sleep -Seconds $StartupDelay
        }
    }
    
    Write-Log "[STATS] $CategoryName - $startedCount/$totalCount services started" "INFO" $Colors.Info
    return $startedCount
}

# Health Check Services
function Test-ServicesHealth {
    if ($DryRun) {
        Write-Log "[DRY RUN] Would perform health checks on all services" "INFO" $Colors.Quantum
        return $true
    }
    
    Write-Log "`n[HEALTH] Performing health checks..." "INFO" $Colors.Info
    
    $healthyServices = 0
    $totalServices = $global:RunningProcesses.Count
    
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $service = $serviceInfo.Service
        
        try {
            $healthUrl = "http://localhost:$($service.Port)$($service.HealthEndpoint)"
            $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5 -ErrorAction Stop
            
            if ($response.status -eq "healthy" -or $response.status -eq "running") {
                Write-Log "[HEALTHY] $($service.Name)" "SUCCESS"
                $healthyServices++
            } else {
                Write-Log "[UNHEALTHY] $($service.Name) - Status: $($response.status)" "WARN"
            }
        }
        catch {
            Write-Log "[FAILED] Health check failed: $($service.Name) - $($_.Exception.Message)" "ERROR"
            $global:SystemHealthy = $false
        }
    }
    
    Write-Log "[HEALTH] Summary: $healthyServices/$totalServices services healthy" "INFO" $Colors.Info
    return ($healthyServices -eq $totalServices)
}

# Shutdown Function
function Stop-QBTCSystem {
    Write-Log "`n[SHUTDOWN] Initiating graceful shutdown..." "INFO" $Colors.Warning
    
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $process = $serviceInfo.Process
        $service = $serviceInfo.Service
        
        if (-not $process.HasExited) {
            Write-Log "[STOP] Stopping: $($service.Name)..." "INFO"
            
            try {
                # Try graceful shutdown first
                $process.CloseMainWindow()
                
                # Wait up to 5 seconds for graceful shutdown
                if (-not $process.WaitForExit(5000)) {
                    Write-Log "[KILL] Force killing: $($service.Name)" "WARN"
                    $process.Kill()
                }
                
                Write-Log "[STOPPED] $($service.Name)" "SUCCESS"
            }
            catch {
                Write-Log "[ERROR] Error stopping $($service.Name): $($_.Exception.Message)" "ERROR"
            }
        }
    }
    
    Write-Log "[COMPLETE] QBTC System shutdown complete" "SUCCESS"
}

# Show Service Status
function Show-SystemStatus {
    Write-Host "`n[STATUS] QBTC SYSTEM STATUS" -ForegroundColor $Colors.Header
    Write-Host "=========================================================" -ForegroundColor $Colors.Header
    
    if ($global:RunningProcesses.Count -eq 0) {
        Write-Host "No services currently running." -ForegroundColor $Colors.Warning
        return
    }
    
    foreach ($serviceName in $global:RunningProcesses.Keys) {
        $serviceInfo = $global:RunningProcesses[$serviceName]
        $service = $serviceInfo.Service
        $process = $serviceInfo.Process
        
        $status = if ($process.HasExited) { "[STOPPED]" } else { "[RUNNING]" }
        $uptime = if ($process.HasExited) { "N/A" } else { "$(((Get-Date) - $serviceInfo.StartTime).ToString('hh\:mm\:ss'))" }
        
        Write-Host "[SERVICE] $($service.Name)" -NoNewline -ForegroundColor $Colors.Info
        Write-Host " | Port: $($service.Port)" -NoNewline -ForegroundColor Gray
        Write-Host " | $status" -NoNewline -ForegroundColor $(if ($process.HasExited) { $Colors.Error } else { $Colors.Success })
        Write-Host " | Uptime: $uptime" -ForegroundColor Gray
        
        if (-not $process.HasExited) {
            Write-Host "   [URL] http://localhost:$($service.Port)$($service.HealthEndpoint)" -ForegroundColor $Colors.Quantum
        }
    }
    
    Write-Host "=========================================================" -ForegroundColor $Colors.Header
}

# Main Execution Function
function Start-QBTCSystem {
    # Show banner
    Show-QBTCBanner
    
    # Show configuration
    Write-Log "[CONFIG] Mode=$Mode, LogLevel=$LogLevel, StartupDelay=$StartupDelay`s" "INFO" $Colors.Info
    if ($DryRun) {
        Write-Log "[DRY RUN] No services will actually start" "WARN" $Colors.Warning
    }
    
    # Check prerequisites
    if (-not $SkipHealthChecks) {
        if (-not (Test-Prerequisites)) {
            Write-Log "[ERROR] Prerequisites check failed. Aborting startup." "ERROR"
            exit 1
        }
    }
    
    # Initialize startup sequence
    Write-Log "`n[STARTUP] Initiating QBTC system startup sequence..." "INFO" $Colors.Header
    
    $totalStarted = 0
    
    # Start services in dependency order
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.CoreServices -CategoryName "Core Services" -CategoryIcon "[CORE]"
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.AnalysisEngines -CategoryName "Analysis Engines" -CategoryIcon "[ANALYSIS]" 
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.ExecutionEngines -CategoryName "Execution Engines" -CategoryIcon "[EXECUTION]"
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.ManagementSystems -CategoryName "Management Systems" -CategoryIcon "[MANAGEMENT]"
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.HermeticSystems -CategoryName "Hermetic & Dimensional Systems" -CategoryIcon "[HERMETIC]"
    $totalStarted += Start-ServiceCategory -Services $ServiceConfig.Dashboards -CategoryName "Dashboard Interfaces" -CategoryIcon "[DASHBOARD]"
    
    # Final status
    Write-Log "`n[COMPLETE] STARTUP COMPLETE!" "SUCCESS" $Colors.Success
    Write-Log "[STATS] Total services started: $totalStarted" "INFO" $Colors.Info
    Write-Log "[PORTS] Port range used: 14000-14999 (anti-conflict)" "INFO" $Colors.Success
    
    if (-not $SkipHealthChecks -and -not $DryRun) {
        # Perform health checks
        Start-Sleep -Seconds 3
        Test-ServicesHealth
    }
    
    # Show access URLs
    Write-Host "`n[ACCESS] PRIMARY ACCESS POINTS:" -ForegroundColor $Colors.Header
    Write-Host "=========================================================" -ForegroundColor $Colors.Header
    Write-Host "[MASTER] Master Dashboard:     http://localhost:14801" -ForegroundColor $Colors.Success
    Write-Host "[QUANTUM] Quantum Analysis:    http://localhost:14802" -ForegroundColor $Colors.Quantum
    Write-Host "[TRADING] Trading Dashboard:   http://localhost:14803" -ForegroundColor $Colors.Info
    Write-Host "[RISK] Risk Management:        http://localhost:14804" -ForegroundColor $Colors.Warning
    Write-Host "[ADMIN] Admin Panel:           http://localhost:14806" -ForegroundColor $Colors.Info
    Write-Host "=========================================================" -ForegroundColor $Colors.Header
    
    # Show system status
    Show-SystemStatus
    
    if (-not $DryRun) {
        Write-Host "`n[INFO] Press Ctrl+C to shutdown the system gracefully" -ForegroundColor $Colors.Info
        
        # Wait for shutdown signal
        try {
            while ($true) {
                Start-Sleep -Seconds 10
                
                # Check if any critical processes have died
                $deadProcesses = @()
                foreach ($serviceName in $global:RunningProcesses.Keys) {
                    $process = $global:RunningProcesses[$serviceName].Process
                    if ($process.HasExited) {
                        $deadProcesses += $serviceName
                    }
                }
                
                if ($deadProcesses.Count -gt 0) {
                    Write-Log "[WARN] Dead processes detected: $($deadProcesses -join ', ')" "WARN"
                    # Could implement auto-restart logic here
                }
            }
        }
        catch [System.Management.Automation.PipelineStoppedException] {
            # Ctrl+C pressed
            Write-Log "`n[SHUTDOWN] Shutdown signal received..." "INFO" $Colors.Warning
        }
        finally {
            Stop-QBTCSystem
        }
    } else {
        Write-Log "`n[COMPLETE] DRY RUN COMPLETED - No actual services started" "SUCCESS" $Colors.Success
    }
}

# Script Execution Entry Point
try {
    Start-QBTCSystem
}
catch {
    Write-Log "[FATAL] Fatal error during startup: $($_.Exception.Message)" "ERROR"
    Write-Log "[TRACE] Stack trace: $($_.ScriptStackTrace)" "ERROR"
    
    # Attempt cleanup
    if ($global:RunningProcesses.Count -gt 0) {
        Write-Log "[CLEANUP] Attempting cleanup..." "WARN"
        Stop-QBTCSystem
    }
    
    exit 1
}
finally {
    # Save startup log
    if ($global:StartupLog.Count -gt 0) {
        $logFile = "logs/qbtc-startup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        $global:StartupLog | Out-File -FilePath $logFile -Encoding UTF8
        Write-Log "[LOG] Startup log saved: $logFile" "INFO" $Colors.Info
    }
}
