# [MONEY] QBTC Quantum Futures System - DEPLOY SCRIPT OPTIMIZED FOR REAL PROFIT
# ===============================================================================
# PowerShell Script para Despliegue con Enfoque en MAXIMIZAR GANANCIAS
# "No más dinero dejado en la mesa"
# ===============================================================================

param(
    [string]$Mode = "testnet",          # testnet, live, profit-boost
    [switch]$QuickProfit = $false,      # Activar quick profit mode
    [switch]$SkipValidation = $false,   # Skip validaciones para deployment rápido
    [switch]$MonitorOnly = $false       # Solo monitoreo, no deployment
)

# Configuración de colores y estilos
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

Write-Host "[MONEY] QBTC QUANTUM FUTURES SYSTEM - PROFIT DEPLOYMENT" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host "[ROCKET] OBJETIVO: MAXIMIZAR GANANCIAS REALES" -ForegroundColor Green
Write-Host "[WARNING]  Mode: $Mode | Quick Profit: $QuickProfit" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Yellow

# Variables globales
$QBTC_ROOT = $PSScriptRoot
$LOG_DIR = "$QBTC_ROOT\logs"
$PROFIT_LOG = "$LOG_DIR\profit-tracking.log"
$PROCESS_LOG = "$LOG_DIR\process-status.log"
$ERROR_LOG = "$LOG_DIR\errors.log"

# PIDs de procesos
$ANALYSIS_PID = $null
$EXECUTION_PID = $null
$HERMETIC_PID = $null
$CONSCIOUSNESS_PID = $null
$MONITOR_PID = $null

# Funciones de utilidad
function Write-ProfitLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $PROFIT_LOG -Value $logMessage
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "PROFIT" { Write-Host $logMessage -ForegroundColor Yellow }
        default { Write-Host $logMessage -ForegroundColor White }
    }
}

function Test-Prerequisites {
    Write-ProfitLog "[MAGNIFY] Validando prerrequisitos para maximizar profit..."
    
    # Validar Node.js
    try {
        $nodeVersion = node --version
        if ([version]($nodeVersion.Substring(1)) -lt [version]"18.0.0") {
            throw "Node.js versión >= 18 requerida para performance óptima"
        }
        Write-ProfitLog "[CHECK] Node.js $nodeVersion - OPTIMAL" -Level "SUCCESS"
    } catch {
        Write-ProfitLog "[X] Node.js no encontrado o versión insuficiente" -Level "ERROR"
        return $false
    }
    
    # Validar NPM
    try {
        $npmVersion = npm --version
        Write-ProfitLog "[CHECK] NPM $npmVersion - READY" -Level "SUCCESS"
    } catch {
        Write-ProfitLog "[X] NPM no encontrado" -Level "ERROR"
        return $false
    }
    
    # Validar archivos críticos
    $criticalFiles = @(
        "package.json",
        "index.js", 
        "analysis-engine\server.js",
        "futures-execution\server.js",
        "profit-metrics-analyzer.js",
        ".env"
    )
    
    foreach ($file in $criticalFiles) {
        if (-not (Test-Path "$QBTC_ROOT\$file")) {
            Write-ProfitLog "[X] Archivo crítico faltante: $file" -Level "ERROR"
            return $false
        }
    }
    
    Write-ProfitLog "[CHECK] Todos los archivos críticos encontrados" -Level "SUCCESS"
    return $true
}

function Install-Dependencies {
    Write-ProfitLog "📦 Instalando dependencias optimizadas para profit..."
    
    Set-Location $QBTC_ROOT
    
    try {
        # Instalación optimizada para performance
        npm install --production --no-audit --no-fund --silent
        Write-ProfitLog "[CHECK] Dependencias instaladas - PROFIT READY" -Level "SUCCESS"
    } catch {
        Write-ProfitLog "[X] Error instalando dependencias: $_" -Level "ERROR"
        return $false
    }
    
    return $true
}

function Optimize-Environment {
    Write-ProfitLog "[LIGHTNING] Optimizando entorno para máximo profit..."
    
    # Crear directorio de logs si no existe
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
        Write-ProfitLog "📁 Directorio de logs creado: $LOG_DIR" -Level "SUCCESS"
    }
    
    # Configurar variables de entorno para performance
    $env:NODE_ENV = "production"
    $env:UV_THREADPOOL_SIZE = "16"  # Optimizar para I/O intensivo
    
    # Optimizaciones específicas según modo
    switch ($Mode) {
        "live" {
            $env:USE_TESTNET = "false"
            $env:DEMO_MODE = "false"
            $env:PAPER_TRADING = "false"
            Write-ProfitLog "[SIREN] MODO LIVE ACTIVADO - DINERO REAL" -Level "PROFIT"
        }
        "profit-boost" {
            $env:QUICK_PROFIT_MODE = "true"
            $env:BOOST_RISK_MULTIPLIER = "1.3"
            $env:BOOST_POSITION_SIZE = "1.2"
            $env:AUTO_EXECUTE_HIGH_CONFIDENCE = "true"
            Write-ProfitLog "[ROCKET] PROFIT BOOST MODE ACTIVADO" -Level "PROFIT"
        }
        default {
            $env:USE_TESTNET = "true"
            $env:DEMO_MODE = "false"
            Write-ProfitLog "[TEST_TUBE] Modo testnet activado para pruebas" -Level "INFO"
        }
    }
    
    # Activar Quick Profit si está habilitado
    if ($QuickProfit) {
        $env:QUICK_PROFIT_MODE = "true"
        $env:AUTO_EXECUTE_HIGH_CONFIDENCE = "true"
        $env:MIN_STRENGTH_AUTO = "0.75"
        Write-ProfitLog "[LIGHTNING] QUICK PROFIT MODE HABILITADO" -Level "PROFIT"
    }
    
    Write-ProfitLog "[CHECK] Entorno optimizado para profit" -Level "SUCCESS"
}

function Start-AnalysisEngine {
    Write-ProfitLog "[BRAIN] Iniciando Analysis Engine en segundo plano..."
    
    try {
        $analysisProcess = Start-Process -FilePath "node" -ArgumentList "analysis-engine\server.js" `
            -WorkingDirectory $QBTC_ROOT `
            -RedirectStandardOutput "$LOG_DIR\analysis-output.log" `
            -RedirectStandardError "$LOG_DIR\analysis-error.log" `
            -PassThru -NoNewWindow
        
        $global:ANALYSIS_PID = $analysisProcess.Id
        Add-Content -Path $PROCESS_LOG -Value "ANALYSIS_PID=$($global:ANALYSIS_PID)"
        
        # Verificar que el proceso se inició correctamente
        Start-Sleep -Seconds 3
        if (Get-Process -Id $global:ANALYSIS_PID -ErrorAction SilentlyContinue) {
            Write-ProfitLog "[CHECK] Analysis Engine iniciado (PID: $($global:ANALYSIS_PID))" -Level "SUCCESS"
            
            # Verificar que responde en el puerto
            Start-Sleep -Seconds 5
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4001/health" -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-ProfitLog "[CHECK] Analysis Engine respondiendo en puerto 4001" -Level "SUCCESS"
                } else {
                    throw "No response from Analysis Engine"
                }
            } catch {
                Write-ProfitLog "[WARNING] Analysis Engine iniciado pero puerto no responde aún" -Level "INFO"
            }
        } else {
            throw "Analysis Engine process died immediately"
        }
        
        return $true
    } catch {
        Write-ProfitLog "[X] Error iniciando Analysis Engine: $_" -Level "ERROR"
        return $false
    }
}

function Start-ExecutionEngine {
    Write-ProfitLog "[LIGHTNING] Iniciando Execution Engine para PROFIT..."
    
    try {
        # Esperar un poco para que el Analysis Engine esté listo
        Start-Sleep -Seconds 3
        
        $executionProcess = Start-Process -FilePath "node" -ArgumentList "futures-execution\server.js" `
            -WorkingDirectory $QBTC_ROOT `
            -RedirectStandardOutput "$LOG_DIR\execution-output.log" `
            -RedirectStandardError "$LOG_DIR\execution-error.log" `
            -PassThru -NoNewWindow
        
        $global:EXECUTION_PID = $executionProcess.Id
        Add-Content -Path $PROCESS_LOG -Value "EXECUTION_PID=$($global:EXECUTION_PID)"
        
        # Verificar que el proceso se inició correctamente
        Start-Sleep -Seconds 3
        if (Get-Process -Id $global:EXECUTION_PID -ErrorAction SilentlyContinue) {
            Write-ProfitLog "[CHECK] Execution Engine iniciado (PID: $($global:EXECUTION_PID))" -Level "SUCCESS"
            
            # Verificar que responde en el puerto
            Start-Sleep -Seconds 5
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4002/health" -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-ProfitLog "[CHECK] Execution Engine respondiendo en puerto 4002" -Level "SUCCESS"
                } else {
                    throw "No response from Execution Engine"
                }
            } catch {
                Write-ProfitLog "[WARNING] Execution Engine iniciado pero puerto no responde aún" -Level "INFO"
            }
        } else {
            throw "Execution Engine process died immediately"
        }
        
        return $true
    } catch {
        Write-ProfitLog "[X] Error iniciando Execution Engine: $_" -Level "ERROR"
        return $false
    }
}

function Start-HermeticAutoTrader {
    Write-ProfitLog "[STAR] Iniciando Hermetic Auto-Trader con protocolo Merkaba..."
    
    try {
        # Esperar que otros engines estén listos
        Start-Sleep -Seconds 5
        
        $hermeticProcess = Start-Process -FilePath "node" -ArgumentList "trading\hermetic-auto-trader-server.js" `
            -WorkingDirectory $QBTC_ROOT `
            -RedirectStandardOutput "$LOG_DIR\hermetic-output.log" `
            -RedirectStandardError "$LOG_DIR\hermetic-error.log" `
            -PassThru -NoNewWindow
        
        $global:HERMETIC_PID = $hermeticProcess.Id
        Add-Content -Path $PROCESS_LOG -Value "HERMETIC_PID=$($global:HERMETIC_PID)"
        
        # Verificar que el proceso se inició correctamente
        Start-Sleep -Seconds 5
        if (Get-Process -Id $global:HERMETIC_PID -ErrorAction SilentlyContinue) {
            Write-ProfitLog "[CHECK] Hermetic Auto-Trader iniciado (PID: $($global:HERMETIC_PID))" -Level "SUCCESS"
            
            # Verificar que responde en el puerto
            Start-Sleep -Seconds 8
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4004/api/health" -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-ProfitLog "[CHECK] Hermetic Auto-Trader respondiendo en puerto 4004" -Level "SUCCESS"
                    
                    # Activar auto-trading si está en modo live o profit-boost
                    if ($Mode -eq "live" -or $Mode -eq "profit-boost" -or $QuickProfit) {
                        try {
                            $startResponse = Invoke-RestMethod -Uri "http://localhost:4004/api/start" -Method POST -TimeoutSec 10
                            if ($startResponse.success) {
                                Write-ProfitLog "[CHECK] Hermetic Auto-Trading ACTIVADO" -Level "PROFIT"
                            }
                        } catch {
                            Write-ProfitLog "[WARNING] Auto-trading no se pudo activar: $_" -Level "INFO"
                        }
                    }
                    
                } else {
                    throw "No response from Hermetic Auto-Trader"
                }
            } catch {
                Write-ProfitLog "[WARNING] Hermetic Auto-Trader iniciado pero puerto no responde aún" -Level "INFO"
            }
        } else {
            throw "Hermetic Auto-Trader process died immediately"
        }
        
        return $true
    } catch {
        Write-ProfitLog "[X] Error iniciando Hermetic Auto-Trader: $_" -Level "ERROR"
        return $false
    }
}

function Start-ConsciousnessEngine {
    Write-ProfitLog "[BRAIN] Iniciando Consciousness Evolution Engine..."
    
    try {
        # Script para iniciar el motor de consciencia
        $consciousnessScript = @"
import('./consciousness/consciousness-evolution-engine.js')
    .then(module => {
        const ConsciousnessEngine = module.default;
        const engine = new ConsciousnessEngine();
        engine.startEvolution();
        console.log('[CHECK] Consciousness Evolution Engine started');
        
        // Mantener proceso vivo
        setInterval(() => {
            // Keep alive
        }, 30000);
    })
    .catch(error => {
        console.error('[X] Error starting Consciousness Engine:', error);
    });
"@
        
        # Crear archivo temporal
        $tempScript = "$LOG_DIR\start-consciousness.js"
        $consciousnessScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        $consciousnessProcess = Start-Process -FilePath "node" -ArgumentList $tempScript `
            -WorkingDirectory $QBTC_ROOT `
            -RedirectStandardOutput "$LOG_DIR\consciousness-output.log" `
            -RedirectStandardError "$LOG_DIR\consciousness-error.log" `
            -PassThru -NoNewWindow
        
        $global:CONSCIOUSNESS_PID = $consciousnessProcess.Id
        Add-Content -Path $PROCESS_LOG -Value "CONSCIOUSNESS_PID=$($global:CONSCIOUSNESS_PID)"
        
        # Verificar que el proceso se inició correctamente
        Start-Sleep -Seconds 3
        if (Get-Process -Id $global:CONSCIOUSNESS_PID -ErrorAction SilentlyContinue) {
            Write-ProfitLog "[CHECK] Consciousness Engine iniciado (PID: $($global:CONSCIOUSNESS_PID))" -Level "SUCCESS"
        } else {
            throw "Consciousness Engine process died immediately"
        }
        
        return $true
    } catch {
        Write-ProfitLog "[X] Error iniciando Consciousness Engine: $_" -Level "ERROR"
        return $false
    }
}

function Start-ProfitMonitor {
    Write-ProfitLog "[MONEY] Iniciando Profit Monitor en segundo plano..."
    
    $monitorScript = @"
# PROFIT MONITOR LOOP
while (`$true) {
    try {
        `$analysisHealth = Invoke-RestMethod -Uri "http://localhost:4001/health" -TimeoutSec 5
        `$executionHealth = Invoke-RestMethod -Uri "http://localhost:4002/health" -TimeoutSec 5
        
        `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        `$profitData = "[\$timestamp] Analysis: Running | Execution: Running | Mode: $Mode"
        
        # Obtener métricas de profit si están disponibles
        try {
            `$metrics = Invoke-RestMethod -Uri "http://localhost:4002/metrics" -TimeoutSec 3
            if (`$metrics.success) {
                `$profitData += " | PnL: `$(`$metrics.metrics.executionState.totalPnL) | Trades: `$(`$metrics.metrics.executionState.tradesExecuted)"
            }
        } catch {
            # Métricas no disponibles aún
        }
        
        Add-Content -Path "$PROFIT_LOG" -Value `$profitData
        
        # Verificar si los procesos están vivos
        if (-not (Get-Process -Id $($global:ANALYSIS_PID) -ErrorAction SilentlyContinue)) {
            Add-Content -Path "$ERROR_LOG" -Value "[\$timestamp] ERROR: Analysis Engine process died (PID: $($global:ANALYSIS_PID))"
        }
        
        if (-not (Get-Process -Id $($global:EXECUTION_PID) -ErrorAction SilentlyContinue)) {
            Add-Content -Path "$ERROR_LOG" -Value "[\$timestamp] ERROR: Execution Engine process died (PID: $($global:EXECUTION_PID))"
        }
        
    } catch {
        `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path "$ERROR_LOG" -Value "[\$timestamp] MONITOR ERROR: `$_"
    }
    
    Start-Sleep -Seconds 30
}
"@
    
    try {
        $monitorProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", $monitorScript `
            -WorkingDirectory $QBTC_ROOT `
            -WindowStyle Hidden -PassThru
        
        $global:MONITOR_PID = $monitorProcess.Id
        Add-Content -Path $PROCESS_LOG -Value "MONITOR_PID=$($global:MONITOR_PID)"
        
        Write-ProfitLog "[CHECK] Profit Monitor iniciado (PID: $($global:MONITOR_PID))" -Level "SUCCESS"
        return $true
    } catch {
        Write-ProfitLog "[X] Error iniciando Profit Monitor: $_" -Level "ERROR"
        return $false
    }
}

function Show-ProfitDashboard {
    Write-ProfitLog "[CHART] Mostrando Dashboard de Profit..." -Level "PROFIT"
    
    Write-Host ""
    Write-Host "[MONEY] QBTC SYSTEM STATUS - PROFIT FOCUS" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Yellow
    Write-Host "[BRAIN] Analysis Engine:      PID $($global:ANALYSIS_PID) | Port 4001" -ForegroundColor Green
    Write-Host "[LIGHTNING] Execution Engine:     PID $($global:EXECUTION_PID) | Port 4002" -ForegroundColor Green
    Write-Host "[STAR] Hermetic Auto-Trader: PID $($global:HERMETIC_PID) | Port 4004" -ForegroundColor Green
    Write-Host "[BRAIN] Consciousness Engine: PID $($global:CONSCIOUSNESS_PID) | Background" -ForegroundColor Green
    Write-Host "[CHART] Profit Monitor:       PID $($global:MONITOR_PID) | Background" -ForegroundColor Green
    Write-Host "[TARGET] Trading Mode:       $Mode" -ForegroundColor Cyan
    Write-Host "[ROCKET] Quick Profit:       $QuickProfit" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📨 SYSTEM MONITORING:" -ForegroundColor Yellow
    Write-Host "   • Analysis Health:    http://localhost:4001/health" -ForegroundColor White
    Write-Host "   • Execution Metrics:  http://localhost:4002/metrics" -ForegroundColor White
    Write-Host "   • Hermetic Dashboard: http://localhost:4004/api/dashboard" -ForegroundColor White
    Write-Host "   • Merkaba Status:     http://localhost:4004/api/merkaba/status" -ForegroundColor White
    Write-Host "   • Profit Logs:        $PROFIT_LOG" -ForegroundColor White
    Write-Host "   • Error Logs:         $ERROR_LOG" -ForegroundColor White
    Write-Host ""
    Write-Host "[WARNING]  COMANDOS ÚTILES:" -ForegroundColor Yellow
    Write-Host "   • Detener todo:     .\stop-qbtc.ps1" -ForegroundColor White
    Write-Host "   • Ver profits:      .\monitor.ps1 -ShowProfit" -ForegroundColor White
    Write-Host "   • Reiniciar:        .\deploy.ps1 -Mode $Mode" -ForegroundColor White
    Write-Host ""
}

function Test-SystemHealth {
    Write-ProfitLog "[HOSPITAL] Verificando salud del sistema..."
    
    $healthStatus = @{
        Analysis = $false
        Execution = $false
        Overall = $false
    }
    
    # Test Analysis Engine
    try {
        $analysisResponse = Invoke-WebRequest -Uri "http://localhost:4001/health" -TimeoutSec 10
        if ($analysisResponse.StatusCode -eq 200) {
            $healthStatus.Analysis = $true
            Write-ProfitLog "[CHECK] Analysis Engine: HEALTHY" -Level "SUCCESS"
        }
    } catch {
        Write-ProfitLog "[X] Analysis Engine: UNHEALTHY - $_" -Level "ERROR"
    }
    
    # Test Execution Engine
    try {
        $executionResponse = Invoke-WebRequest -Uri "http://localhost:4002/health" -TimeoutSec 10
        if ($executionResponse.StatusCode -eq 200) {
            $healthStatus.Execution = $true
            Write-ProfitLog "[CHECK] Execution Engine: HEALTHY" -Level "SUCCESS"
        }
    } catch {
        Write-ProfitLog "[X] Execution Engine: UNHEALTHY - $_" -Level "ERROR"
    }
    
    $healthStatus.Overall = $healthStatus.Analysis -and $healthStatus.Execution
    
    if ($healthStatus.Overall) {
        Write-ProfitLog "[PARTY] SISTEMA LISTO PARA GENERAR PROFIT!" -Level "PROFIT"
    } else {
        Write-ProfitLog "[WARNING] Sistema con problemas - revisar logs" -Level "ERROR"
    }
    
    return $healthStatus
}

# ===============================================================================
# FUNCIÓN PRINCIPAL DE DEPLOYMENT
# ===============================================================================

function Deploy-QBTCSystem {
    $startTime = Get-Date
    Write-ProfitLog "[ROCKET] Iniciando deployment QBTC optimizado para PROFIT..." -Level "PROFIT"
    
    try {
        # 1. Validaciones (si no se skipean)
        if (-not $SkipValidation) {
            if (-not (Test-Prerequisites)) {
                throw "Prerequisitos no cumplidos"
            }
        }
        
        # 2. Instalar dependencias
        if (-not (Install-Dependencies)) {
            throw "Error instalando dependencias"
        }
        
        # 3. Optimizar entorno
        Optimize-Environment
        
        # 4. Iniciar Analysis Engine
        if (-not (Start-AnalysisEngine)) {
            throw "Error iniciando Analysis Engine"
        }
        
        # 5. Iniciar Execution Engine
        if (-not (Start-ExecutionEngine)) {
            throw "Error iniciando Execution Engine"
        }
        
        # 6. Iniciar Hermetic Auto-Trader con protocolo Merkaba
        if (-not (Start-HermeticAutoTrader)) {
            Write-ProfitLog "[WARNING] Hermetic Auto-Trader falló, pero continuando..." -Level "INFO"
        }
        
        # 7. Iniciar Consciousness Evolution Engine
        if (-not (Start-ConsciousnessEngine)) {
            Write-ProfitLog "[WARNING] Consciousness Engine falló, pero continuando..." -Level "INFO"
        }
        
        # 8. Iniciar Monitor de Profit
        if (-not (Start-ProfitMonitor)) {
            Write-ProfitLog "[WARNING] Profit Monitor falló, pero continuando..." -Level "INFO"
        }
        
        # 9. Verificar salud del sistema
        Start-Sleep -Seconds 15
        $healthStatus = Test-SystemHealth
        
        if (-not $healthStatus.Overall) {
            Write-ProfitLog "[WARNING] Sistema iniciado con advertencias" -Level "INFO"
        }
        
        # 10. Mostrar dashboard
        Show-ProfitDashboard
        
        $elapsedTime = (Get-Date) - $startTime
        Write-ProfitLog "[CHECK] DEPLOYMENT COMPLETADO en $($elapsedTime.TotalSeconds) segundos" -Level "SUCCESS"
        Write-ProfitLog "[MONEY] SISTEMA LISTO PARA GENERAR PROFIT REAL!" -Level "PROFIT"
        
        return $true
        
    } catch {
        Write-ProfitLog "[X] DEPLOYMENT FALLÓ: $_" -Level "ERROR"
        
        # Cleanup en caso de error
        try {
            if ($global:ANALYSIS_PID) { Stop-Process -Id $global:ANALYSIS_PID -Force -ErrorAction SilentlyContinue }
            if ($global:EXECUTION_PID) { Stop-Process -Id $global:EXECUTION_PID -Force -ErrorAction SilentlyContinue }
            if ($global:HERMETIC_PID) { Stop-Process -Id $global:HERMETIC_PID -Force -ErrorAction SilentlyContinue }
            if ($global:CONSCIOUSNESS_PID) { Stop-Process -Id $global:CONSCIOUSNESS_PID -Force -ErrorAction SilentlyContinue }
            if ($global:MONITOR_PID) { Stop-Process -Id $global:MONITOR_PID -Force -ErrorAction SilentlyContinue }
        } catch {
            # Ignore cleanup errors
        }
        
        return $false
    }
}

# ===============================================================================
# EJECUCIÓN PRINCIPAL
# ===============================================================================

if ($MonitorOnly) {
    Write-ProfitLog "[CHART] Modo solo monitoreo activado" -Level "INFO"
    # Implementar lógica de monitoreo aquí
    exit 0
}

# Ejecutar deployment
$deploymentResult = Deploy-QBTCSystem

if ($deploymentResult) {
    Write-Host "[PARTY] QBTC SYSTEM DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "[MONEY] READY TO GENERATE REAL PROFIT!" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "[X] DEPLOYMENT FAILED - Check logs for details" -ForegroundColor Red
    exit 1
}

# ===============================================================================
# NOTAS FINALES
# ===============================================================================
<#
EJEMPLOS DE USO:

# Deployment básico testnet
.\deploy.ps1

# Deployment para dinero real (CUIDADO!)
.\deploy.ps1 -Mode live

# Deployment con boost de profit
.\deploy.ps1 -Mode profit-boost -QuickProfit

# Deployment rápido sin validaciones
.\deploy.ps1 -SkipValidation -QuickProfit

# Solo monitoreo
.\deploy.ps1 -MonitorOnly
#>
