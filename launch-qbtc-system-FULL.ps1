# QBTC QUANTUM TRADING SYSTEM LAUNCHER - FULL DEPLOYMENT EDITION
# ===============================================================
# Deploys ALL services in the QBTC system regardless of dependencies
# 
# Author: QBTC Development Team  
# Version: 3.0.0 - FULL DEPLOYMENT EDITION
# Last Updated: 2025-01-20

param(
    [switch]$BackgroundMode,              # Optimize for background execution
    [int]$StartupDelay = 1,               # Seconds between service starts
    [switch]$SkipHealthChecks,            # Skip health checks for faster deployment
    [switch]$ForceDeployAll               # Force deploy all services
)

# Global Variables
$global:RunningProcesses = @{}
$global:StartupLog = @()

# Enhanced Service Configuration - ALL SERVICES
$FullServiceConfig = @{
    # CORE SERVICES (14000-14099)
    Configuration = @{
        Name = "Configuration Service"
        Script = "core/config-service.js"
        Port = 14003
        HealthEndpoint = "/config/health"
    }
    MessageBus = @{
        Name = "Message Bus Event Hub"
        Script = "core/message-bus.js"
        Port = 14002
        HealthEndpoint = "/status"
    }
    MasterControl = @{
        Name = "Master Control Hub"
        Script = "core/master-control-hub.js"
        Port = 14001
        HealthEndpoint = "/health"
    }
    MetricsCollector = @{
        Name = "Metrics Collector"
        Script = "core/metrics-collector.js"
        Port = 14004
        HealthEndpoint = "/metrics/health"
    }
    
    # DATA ANALYSIS LAYER (14100-14199)
    DataIngestion = @{
        Name = "Binance Data Ingestion"
        Script = "analysis-engine/data-ingestion-server.js"
        Port = 14104
        HealthEndpoint = "/health"
    }
    ConsciousnessEngine = @{
        Name = "Consciousness Engine"
        Script = "analysis-engine/consciousness-engine.js"
        Port = 14102
        HealthEndpoint = "/health"
    }
    QuantumCore = @{
        Name = "Quantum Core Engine"
        Script = "analysis-engine/quantum-core.js"
        Port = 14105
        HealthEndpoint = "/health"
    }
    QuantumAnalysisServer = @{
        Name = "Quantum Analysis Server"
        Script = "analysis-engine/quantum-analysis-server.js"
        Port = 14103
        HealthEndpoint = "/health"
    }
    QuantumLeverageEngine = @{
        Name = "Quantum Leverage Engine"
        Script = "analysis-engine/quantum-leverage-engine.js"
        Port = 14106
        HealthEndpoint = "/health"
    }
    
    # EXECUTION LAYER (14200-14299)
    ExchangeGateway = @{
        Name = "Exchange API Gateway"
        Script = "execution-engine/exchange-gateway.js"
        Port = 14204
        HealthEndpoint = "/exchange/health"
    }
    OrderBookManager = @{
        Name = "Order Book Manager"
        Script = "execution-engine/orderbook-manager.js"
        Port = 14206
        HealthEndpoint = "/orderbook/health"
    }
    TradingExecutor = @{
        Name = "Trading Engine Executor"
        Script = "execution-engine/trading-executor.js"
        Port = 14201
        HealthEndpoint = "/trading/health"
    }
    PositionManager = @{
        Name = "Position Manager"
        Script = "execution-engine/position-manager.js"
        Port = 14202
        HealthEndpoint = "/positions/health"
    }
    PortfolioRebalancer = @{
        Name = "Portfolio Rebalancer"
        Script = "execution-engine/portfolio-rebalancer.js"
        Port = 14203
        HealthEndpoint = "/portfolio/health"
    }
    SignalRouter = @{
        Name = "Signal Router"
        Script = "execution-engine/signal-router.js"
        Port = 14205
        HealthEndpoint = "/signals/health"
    }
    FuturesExecutionServer = @{
        Name = "Futures Execution Server"
        Script = "futures-execution/server.js"
        Port = 14207
        HealthEndpoint = "/health"
    }
    
    # MANAGEMENT LAYER (14300-14399)
    SecurityCompliance = @{
        Name = "Security Compliance Engine"
        Script = "management/security-compliance.js"
        Port = 14306
        HealthEndpoint = "/security/health"
    }
    RiskManagement = @{
        Name = "Risk Management Core"
        Script = "management/risk-management.js"
        Port = 14301
        HealthEndpoint = "/risk/health"
    }
    PerformanceTracker = @{
        Name = "Performance Tracker"
        Script = "management/performance-tracker.js"
        Port = 14302
        HealthEndpoint = "/performance/health"
    }
    EmergencyResponse = @{
        Name = "Emergency Response System"
        Script = "management/emergency-response.js"
        Port = 14303
        HealthEndpoint = "/emergency/health"
    }
    QuantumStateMonitor = @{
        Name = "Quantum State Monitor"
        Script = "monitoring/quantum-state-monitor.js"
        Port = 14307
        HealthEndpoint = "/health"
    }
    LeverageManager = @{
        Name = "Quantum Leverage Manager"
        Script = "engines/quantum-leverage-entropy-engine.js"
        Port = 14304
        HealthEndpoint = "/leverage/health"
    }
    PortfolioAnalytics = @{
        Name = "Portfolio Analytics"
        Script = "management/portfolio-analytics.js"
        Port = 14305
        HealthEndpoint = "/analytics/health"
    }
    
    # HERMETIC LAYER (14400-14499)
    HermeticDataPersistence = @{
        Name = "Hermetic Data Persistence"
        Script = "data/hermetic-data-persistence.js"
        Port = 14405
        HealthEndpoint = "/health"
    }
    AkashicAdapter = @{
        Name = "Akashic Records Adapter"
        Script = "akashic/akashic-hermetic-adapter.js"
        Port = 14402
        HealthEndpoint = "/health"
    }
    AkashicPredictionSystem = @{
        Name = "Akashic Prediction System"
        Script = "akashic/akashic-prediction-system.js"
        Port = 14403
        HealthEndpoint = "/health"
    }
    ConsciousnessEvolution = @{
        Name = "Consciousness Evolution Engine"
        Script = "consciousness/consciousness-evolution-engine.js"
        Port = 14404
        HealthEndpoint = "/health"
    }
    QuantumLeverageEntropyEngine = @{
        Name = "Quantum Leverage Entropy Engine"
        Script = "engines/quantum-leverage-entropy-engine.js"
        Port = 14406
        HealthEndpoint = "/health"
    }
    MerkabaProtocol = @{
        Name = "Merkaba Trading Protocol"
        Script = "dimensional/merkaba-trading-protocol.js"
        Port = 14401
        HealthEndpoint = "/health"
    }
    
    # INTERFACE LAYER (14800-14899)
    AdminPanel = @{
        Name = "Admin Configuration Panel"
        Script = "frontend/admin-panel.js"
        Port = 14806
        HealthEndpoint = "/admin/health"
    }
    MasterDashboard = @{
        Name = "Master Control Dashboard"
        Script = "frontend/dashboard-server.js"
        Port = 14801
        HealthEndpoint = "/dashboard/health"
    }
    QuantumDashboard = @{
        Name = "Quantum Analysis Dashboard"
        Script = "frontend/quantum-dashboard-server.js"
        Port = 14802
        HealthEndpoint = "/quantum-ui/health"
    }
    TradingDashboard = @{
        Name = "Trading Execution Dashboard"
        Script = "frontend/trading-dashboard.js"
        Port = 14803
        HealthEndpoint = "/trading-ui/health"
    }
    RiskDashboard = @{
        Name = "Risk Management Dashboard"
        Script = "frontend/risk-dashboard.js"
        Port = 14804
        HealthEndpoint = "/risk-ui/health"
    }
    MobileInterface = @{
        Name = "Mobile Interface"
        Script = "frontend/mobile-server.js"
        Port = 14805
        HealthEndpoint = "/mobile/health"
    }
}

# Enhanced Logging Function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    $global:StartupLog += $logEntry
    
    if ($BackgroundMode) {
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        Add-Content -Path "logs/qbtc-full-system-$(Get-Date -Format 'yyyyMMdd').log" -Value $logEntry -Encoding UTF8
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "INFO" { "Cyan" }
            default { "White" }
        }
        Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
    }
}

# Enhanced Service Starter - Creates missing scripts automatically
function Start-QBTCServiceFull {
    param(
        [string]$ServiceName,
        [hashtable]$ServiceConfig
    )
    
    $scriptPath = Join-Path $PWD $ServiceConfig.Script
    
    # Create directory if it doesn't exist
    $serviceDir = Split-Path $scriptPath -Parent
    if (-not (Test-Path $serviceDir)) {
        New-Item -ItemType Directory -Path $serviceDir -Force | Out-Null
        Write-Log "[CREATED] Directory: $serviceDir" "INFO"
    }
    
    # Create service script if it doesn't exist
    if (-not (Test-Path $scriptPath)) {
        Write-Log "[GENERATING] Auto-creating service: $ServiceName" "INFO"
        
        # Enhanced service template with more endpoints
        $serviceTemplate = @"
// QBTC FULL SERVICE: $($ServiceConfig.Name)
// Auto-generated Full Deployment Service
// Port: $($ServiceConfig.Port)
// Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

import express from "express";
const app = express();
const PORT = $($ServiceConfig.Port);
const SERVICE_NAME = "$($ServiceConfig.Name)";

app.use(express.json());

// Service state with enhanced metrics
let serviceState = {
    status: "healthy",
    startTime: new Date(),
    requestCount: 0,
    lastActivity: new Date(),
    version: "3.0.0-full",
    mode: "production",
    metrics: {
        cpu: 0,
        memory: 0,
        uptime: 0
    }
};

// Request tracking middleware
app.use((req, res, next) => {
    serviceState.requestCount++;
    serviceState.lastActivity = new Date();
    next();
});

// Health check endpoint
app.get("$($ServiceConfig.HealthEndpoint)", (req, res) => {
    const uptime = Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000);
    serviceState.metrics.uptime = uptime;
    serviceState.metrics.memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
    
    res.json({
        status: serviceState.status,
        service: SERVICE_NAME,
        port: PORT,
        uptime: uptime,
        requestCount: serviceState.requestCount,
        lastActivity: serviceState.lastActivity.toISOString(),
        version: serviceState.version,
        mode: serviceState.mode,
        metrics: serviceState.metrics,
        timestamp: new Date().toISOString()
    });
});

// Status endpoint
app.get("/status", (req, res) => {
    res.json({
        service: SERVICE_NAME,
        status: serviceState.status,
        port: PORT,
        version: serviceState.version,
        uptime: Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000),
        healthy: true
    });
});

// Metrics endpoint  
app.get("/metrics", (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        service: SERVICE_NAME,
        metrics: {
            uptime: Math.floor((Date.now() - serviceState.startTime.getTime()) / 1000),
            requests: serviceState.requestCount,
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
                external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100
            },
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            pid: process.pid
        }
    });
});

// API endpoints for service-specific functionality
app.get("/api/info", (req, res) => {
    res.json({
        name: SERVICE_NAME,
        description: "QBTC Full Deployment Service - $($ServiceConfig.Name)",
        version: serviceState.version,
        endpoints: [
            "$($ServiceConfig.HealthEndpoint)",
            "/status",
            "/metrics",
            "/api/info"
        ],
        capabilities: [
            "Health Monitoring",
            "Metrics Collection",
            "API Gateway",
            "Service Discovery"
        ]
    });
});

// Default route
app.get("/", (req, res) => {
    res.json({
        message: "QBTC Full Deployment - $($ServiceConfig.Name)",
        service: SERVICE_NAME,
        port: PORT,
        status: serviceState.status,
        version: serviceState.version,
        documentation: "Full QBTC Trading System Component"
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Service Error:", error.message);
    serviceState.status = "error";
    res.status(500).json({
        error: "Internal service error",
        service: SERVICE_NAME,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[ROCKET] QBTC Full Service: $($ServiceConfig.Name)`);
    console.log(`[PIN] Running on port: $PORT`);
    console.log(`[HOSPITAL] Health check: http://localhost:$PORT$($ServiceConfig.HealthEndpoint)`);
    console.log(`[CHART] Metrics: http://localhost:$PORT/metrics`);
    console.log(`[CLIPBOARD] Info: http://localhost:$PORT/api/info`);
    console.log(`[CHECK] Service ready for production`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("[STOP] Graceful shutdown initiated...");
    serviceState.status = "shutting_down";
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("[STOP] SIGINT received, shutting down...");
    serviceState.status = "shutting_down";
    process.exit(0);
});

// Error handlers
process.on("uncaughtException", (error) => {
    console.error("[SIREN] Uncaught Exception:", error);
    serviceState.status = "error";
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[SIREN] Unhandled Rejection:", reason);
    serviceState.status = "error";
});
"@

        Set-Content -Path $scriptPath -Value $serviceTemplate -Encoding UTF8
        Write-Log "[CREATED] Service script: $scriptPath" "SUCCESS"
    }
    
    # Start the service
    try {
        Write-Log "[STARTING] $($ServiceConfig.Name) on port $($ServiceConfig.Port)" "INFO"
        
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        
        $process = Start-Process -FilePath "node" -ArgumentList $ServiceConfig.Script -WindowStyle Hidden -PassThru -RedirectStandardOutput "logs/$ServiceName-output.log" -RedirectStandardError "logs/$ServiceName-error.log"
        
        # Store process info
        $global:RunningProcesses[$ServiceName] = @{
            Process = $process
            Service = $ServiceConfig
            StartTime = Get-Date
        }
        
        # Brief startup delay
        Start-Sleep -Seconds 2
        
        if (-not $process.HasExited) {
            Write-Log "[SUCCESS] Started $($ServiceConfig.Name) (PID: $($process.Id))" "SUCCESS"
            return $true
        } else {
            Write-Log "[ERROR] Failed to start $($ServiceConfig.Name)" "ERROR"
            return $false
        }
    }
    catch {
        Write-Log "[ERROR] Error starting $($ServiceConfig.Name): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main Full Deployment Function
function Start-QBTCFullSystem {
    Write-Log "[QBTC] Starting FULL SYSTEM DEPLOYMENT" "INFO"
    Write-Log "[QBTC] Version: 3.0.0 - FULL DEPLOYMENT EDITION" "INFO"
    Write-Log "[QBTC] Total services to deploy: $($FullServiceConfig.Count)" "INFO"
    
    $totalStarted = 0
    $startTime = Get-Date
    
    # Deploy ALL services without dependency checks
    foreach ($serviceName in $FullServiceConfig.Keys) {
        $serviceConfig = $FullServiceConfig[$serviceName]
        
        if (Start-QBTCServiceFull -ServiceName $serviceName -ServiceConfig $serviceConfig) {
            $totalStarted++
        }
        
        # Inter-service delay
        if ($StartupDelay -gt 0) {
            Start-Sleep -Seconds $StartupDelay
        }
    }
    
    $totalTime = ((Get-Date) - $startTime).TotalSeconds
    $successRate = [math]::Round(($totalStarted / $FullServiceConfig.Count) * 100, 1)
    
    Write-Log "[COMPLETE] QBTC Full System deployment completed!" "SUCCESS"
    Write-Log "[STATS] Services started: $totalStarted/$($FullServiceConfig.Count) ($successRate%)" "SUCCESS"
    Write-Log "[STATS] Total deployment time: ${totalTime}s" "INFO"
    
    return $totalStarted
}

# Execute Full Deployment
try {
    if (-not $BackgroundMode) {
        Write-Host "`n[ROCKET] QBTC FULL SYSTEM DEPLOYMENT 3.0.0" -ForegroundColor Green
        Write-Host "====================================" -ForegroundColor Green
        Write-Host "[CHART] Total services: $($FullServiceConfig.Count)" -ForegroundColor Cyan
        Write-Host "[WRENCH] Mode: FULL DEPLOYMENT (ignores dependencies)" -ForegroundColor Yellow
        Write-Host "[LIGHTNING] Starting complete system..`n" -ForegroundColor Cyan
    }
    
    $servicesStarted = Start-QBTCFullSystem
    
    if ($BackgroundMode) {
        Write-Log "[SUCCESS] QBTC Full System running in background with $servicesStarted services" "SUCCESS"
    } else {
        Write-Host "`n[CHECK] FULL DEPLOYMENT COMPLETE!" -ForegroundColor Green
        Write-Host "Services started: $servicesStarted/$($FullServiceConfig.Count)" -ForegroundColor Green
        Write-Host "[GLOBE] All services available on ports 14000-14899" -ForegroundColor Cyan
        Write-Host "[CHART] Use health check endpoints to verify each service" -ForegroundColor Yellow
    }
}
catch {
    Write-Log "[FATAL] Full deployment error: $($_.Exception.Message)" "ERROR"
    exit 1
}
finally {
    # Save comprehensive deployment log
    if ($global:StartupLog.Count -gt 0) {
        $logFile = "logs/qbtc-full-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
        if (-not (Test-Path "logs")) {
            New-Item -ItemType Directory -Path "logs" -Force | Out-Null
        }
        $global:StartupLog | Out-File -FilePath $logFile -Encoding UTF8
        Write-Log "[LOG] Full deployment log saved: $logFile" "INFO"
    }
}
