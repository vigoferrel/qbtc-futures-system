# QBTC BACKEND COMPLETE LAUNCHER
# Sistema completo de lanzamiento de servicios backend
# Cumple con las reglas: procesos en segundo plano con métricas de rendimiento

param(
    [switch]$OnlyEssential,
    [switch]$IncludeOptional,
    [switch]$NoWait
)

Write-Host "🌌 QBTC BACKEND COMPLETE LAUNCHER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Initializing complete QBTC backend ecosystem..." -ForegroundColor White
Write-Host ""

# Crear directorio de logs
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logsDir = "logs/backend-$timestamp"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    Write-Host "[FOLDER] Created logs directory: $logsDir" -ForegroundColor Green
}

# Configuración de servicios del backend
$backendServices = @{
    "hermetic_admin_ultimate" = @{
        script = "server/hermetic-admin-server-ULTIMATE.js"
        port = 8888
        priority = "CRITICAL"
        description = "Centro de Control Maestro"
        essential = $true
        startup_delay = 0
    }
    "quantum_analysis_server" = @{
        script = "analysis-engine/quantum-analysis-server.js"  
        port = 14103
        priority = "HIGH"
        description = "Motor de Análisis Cuántico"
        essential = $true
        startup_delay = 3
    }
    "dashboard_main" = @{
        script = "frontend/dashboard-server.js"
        port = 14801
        priority = "HIGH"
        description = "Dashboard Principal"
        essential = $true
        startup_delay = 5
    }
    "futures_execution" = @{
        script = "futures-execution/server.js"
        port = 14203
        priority = "HIGH"
        description = "Executor de Futuros"
        essential = $true
        startup_delay = 7
    }
    "leonardo_quantum" = @{
        script = "core/leonardo-quantum-service.js"
        port = 14777
        priority = "MEDIUM"
        description = "Servicio Cuántico Leonardo"
        essential = $false
        startup_delay = 10
    }
    "akashic_prediction" = @{
        script = "akashic/akashic-prediction-service.js"
        port = 14403
        priority = "MEDIUM"
        description = "Sistema de Predicción Akáshico"
        essential = $false
        startup_delay = 12
    }
    "quantum_monitoring" = @{
        script = "monitoring/quantum-monitoring-dashboard.js"
        port = 14999
        priority = "MEDIUM"
        description = "Dashboard de Monitoreo Cuántico"
        essential = $false
        startup_delay = 15
    }
    "data_ingestion" = @{
        script = "analysis-engine/data-ingestion-server.js"
        port = 14104
        priority = "MEDIUM" 
        description = "Servidor de Ingesta de Datos"
        essential = $false
        startup_delay = 17
    }
}

# Array para tracking de procesos
$launchedProcesses = @()
$processInfo = @{}

# Función para lanzar servicio
function Start-QbtcService($serviceName, $config) {
    Write-Host ""
    Write-Host "[ROCKET] Launching $serviceName..." -ForegroundColor Yellow
    Write-Host "  Script: $($config.script)" -ForegroundColor White
    Write-Host "  Port: $($config.port)" -ForegroundColor White
    Write-Host "  Priority: $($config.priority)" -ForegroundColor White
    Write-Host "  Description: $($config.description)" -ForegroundColor White
    
    # Verificar que el archivo existe
    if (-not (Test-Path $config.script)) {
        Write-Host "  [ERROR] Script file not found: $($config.script)" -ForegroundColor Red
        return $null
    }
    
    # Configurar archivos de log
    $logFile = "$logsDir/$serviceName.log"
    $errorFile = "$logsDir/$serviceName.error.log"
    
    # Configurar variables de entorno
    $env:NODE_ENV = "production"
    $env:QBTC_SERVICE_NAME = $serviceName
    $env:QBTC_PORT = $config.port
    $env:QBTC_PRIORITY = $config.priority
    
    try {
        # Lanzar proceso en segundo plano
        $processParams = @{
            FilePath = "node"
            ArgumentList = @($config.script)
            RedirectStandardOutput = $logFile
            RedirectStandardError = $errorFile
            NoNewWindow = $true
            PassThru = $true
        }
        
        $process = Start-Process @processParams
        
        if ($process -ne $null) {
            # Guardar información del proceso
            $processInfo[$serviceName] = @{
                process = $process
                config = $config
                startTime = Get-Date
                logFile = $logFile
                errorFile = $errorFile
            }
            
            $launchedProcesses += $serviceName
            Write-Host "  [CHECK] Process started successfully (PID: $($process.Id))" -ForegroundColor Green
            Write-Host "  [FLOPPY_DISK] Logs: $logFile" -ForegroundColor Cyan
            
            return $process
        } else {
            Write-Host "  [ERROR] Failed to start process" -ForegroundColor Red
            return $null
        }
        
    } catch {
        Write-Host "  [ERROR] Exception starting service: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para verificar estado del proceso
function Test-ProcessHealth($serviceName, $processInfo) {
    $process = $processInfo.process
    $config = $processInfo.config
    
    try {
        $runningProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
        if ($runningProcess) {
            return @{
                running = $true
                pid = $process.Id
                memory = [math]::Round($runningProcess.WorkingSet / 1MB, 2)
                cpu = $runningProcess.CPU
            }
        } else {
            return @{ running = $false }
        }
    } catch {
        return @{ running = $false }
    }
}

# INICIO DEL LANZAMIENTO
Write-Host ""
Write-Host "🎯 STARTING BACKEND SERVICES" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Determinar qué servicios lanzar
$servicesToLaunch = @()

if ($OnlyEssential) {
    $servicesToLaunch = $backendServices.GetEnumerator() | Where-Object { $_.Value.essential -eq $true }
    Write-Host "Mode: ESSENTIAL SERVICES ONLY" -ForegroundColor Yellow
} elseif ($IncludeOptional) {
    $servicesToLaunch = $backendServices.GetEnumerator()
    Write-Host "Mode: ALL SERVICES (Including Optional)" -ForegroundColor Yellow
} else {
    # Default: Essential + algunos importantes
    $servicesToLaunch = $backendServices.GetEnumerator() | Where-Object { 
        $_.Value.essential -eq $true -or $_.Value.priority -eq "HIGH" 
    }
    Write-Host "Mode: ESSENTIAL + HIGH PRIORITY SERVICES" -ForegroundColor Yellow
}

Write-Host "Services to launch: $($servicesToLaunch.Count)" -ForegroundColor White
Write-Host ""

# Lanzar servicios en orden de prioridad y delay
$sortedServices = $servicesToLaunch | Sort-Object { $_.Value.startup_delay }

foreach ($serviceEntry in $sortedServices) {
    $serviceName = $serviceEntry.Key
    $config = $serviceEntry.Value
    
    # Aplicar delay de startup
    if ($config.startup_delay -gt 0 -and -not $NoWait) {
        Write-Host "[HOURGLASS] Waiting $($config.startup_delay) seconds before launching $serviceName..." -ForegroundColor Gray
        Start-Sleep -Seconds $config.startup_delay
    }
    
    # Lanzar servicio
    $process = Start-QbtcService $serviceName $config
    
    # Pequeña pausa entre servicios
    if (-not $NoWait) {
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "✅ LAUNCH SEQUENCE COMPLETED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Esperar un momento para que los servicios se estabilicen
if (-not $NoWait) {
    Write-Host "Waiting 10 seconds for services to stabilize..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "📊 SERVICES STATUS REPORT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Verificar estado de todos los servicios
foreach ($serviceName in $launchedProcesses) {
    if ($processInfo.ContainsKey($serviceName)) {
        $info = $processInfo[$serviceName]
        $health = Test-ProcessHealth $serviceName $info
        
        Write-Host ""
        Write-Host "Service: $serviceName" -ForegroundColor White
        Write-Host "  Script: $($info.config.script)" -ForegroundColor Gray
        Write-Host "  Port: $($info.config.port)" -ForegroundColor Gray
        Write-Host "  Priority: $($info.config.priority)" -ForegroundColor Gray
        
        if ($health.running) {
            Write-Host "  Status: RUNNING" -ForegroundColor Green
            Write-Host "  PID: $($health.pid)" -ForegroundColor White
            Write-Host "  Memory: $($health.memory) MB" -ForegroundColor White
            Write-Host "  Start Time: $($info.startTime.ToString('HH:mm:ss'))" -ForegroundColor White
        } else {
            Write-Host "  Status: STOPPED/FAILED" -ForegroundColor Red
        }
        
        Write-Host "  Logs: $($info.logFile)" -ForegroundColor Cyan
        Write-Host "  Errors: $($info.errorFile)" -ForegroundColor Cyan
    }
}

# Crear archivo de resumen de procesos
$summaryFile = "$logsDir/backend-processes-summary.json"
$summary = @{
    launchTime = Get-Date
    launchedServices = $launchedProcesses
    processInfo = @{}
    totalServices = $launchedProcesses.Count
    logDirectory = $logsDir
}

# Agregar información de procesos al resumen
foreach ($serviceName in $launchedProcesses) {
    if ($processInfo.ContainsKey($serviceName)) {
        $info = $processInfo[$serviceName] 
        $health = Test-ProcessHealth $serviceName $info
        
        $summary.processInfo[$serviceName] = @{
            pid = if ($health.running) { $health.pid } else { $null }
            port = $info.config.port
            priority = $info.config.priority
            essential = $info.config.essential
            running = $health.running
            startTime = $info.startTime
            logFile = $info.logFile
            errorFile = $info.errorFile
            script = $info.config.script
        }
    }
}

$summary | ConvertTo-Json -Depth 4 | Out-File -FilePath $summaryFile -Encoding UTF8
Write-Host ""
Write-Host "[FLOPPY_DISK] Process summary saved: $summaryFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎯 MONITORING COMMANDS" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "1. Check all processes:" -ForegroundColor White
Write-Host "   Get-Process -Name 'node' | Where-Object { `$_.StartTime -gt (Get-Date).AddMinutes(-5) }" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Stop all QBTC processes:" -ForegroundColor White  
Write-Host "   Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. View logs:" -ForegroundColor White
Write-Host "   Get-Content '$logsDir/[service_name].log' -Wait" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test main services:" -ForegroundColor White
Write-Host "   Invoke-RestMethod 'http://localhost:8888' # ULTIMATE Server" -ForegroundColor Cyan
Write-Host "   Invoke-RestMethod 'http://localhost:14103/health' # Quantum Analysis" -ForegroundColor Cyan
Write-Host "   Invoke-RestMethod 'http://localhost:14801/dashboard/health' # Dashboard" -ForegroundColor Cyan

$runningCount = ($summary.processInfo.Values | Where-Object { $_.running -eq $true }).Count
Write-Host ""
Write-Host "🚀 BACKEND LAUNCH SUMMARY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "Total Services Launched: $($launchedProcesses.Count)" -ForegroundColor White
Write-Host "Currently Running: $runningCount" -ForegroundColor Green
Write-Host "Log Directory: $logsDir" -ForegroundColor Cyan
Write-Host "Launch Time: $(Get-Date)" -ForegroundColor White
Write-Host ""
Write-Host "Backend is ready for operation!" -ForegroundColor Green
Write-Host ""
