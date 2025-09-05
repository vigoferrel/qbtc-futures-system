# ===============================================================
# QBTC UNIFIED - LAUNCHER COMPLETO POWERSHELL
# ===============================================================
# Sistema de trading cuantico con conexion real a Binance
# IP Whitelisteada: 181.43.212.196
# Balance disponible: ~$200 USDT para trading
# ===============================================================

param(
    [switch]$SkipConfirmation,
    [switch]$AutoStart,
    [switch]$Verbose
)

# Configuracion de colores
$Host.UI.RawUI.ForegroundColor = 'White'
$Host.UI.RawUI.BackgroundColor = 'Black'

# Funcion para logs con colores
function Write-QuantumLog {
    param([string]$Message, [string]$Color = "White", [string]$Icon = "")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Icon $Message" -ForegroundColor $Color
}

# Banner de inicio
Clear-Host
Write-Host "`n" -NoNewline
Write-Host "[*] ================================================================" -ForegroundColor Cyan
Write-Host "[*]                   QBTC UNIFIED LAUNCHER                       " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "[*] Sistema Cuantico de Trading con Binance Real                  " -ForegroundColor Green
Write-Host "[*] IP Whitelisteada: 181.43.212.196                             " -ForegroundColor Magenta
Write-Host "[*] Balance disponible: ~$200 USDT                               " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar directorio
$currentDir = Get-Location
Write-QuantumLog "[DIR] Directorio actual: $currentDir" "Blue" "[DIR]"

if (-not (Test-Path "package.json")) {
    Write-QuantumLog "[ERROR] package.json no encontrado. Ejecuta desde el directorio del proyecto." "Red" "[ERROR]"
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-QuantumLog "[OK] Node.js version: $nodeVersion" "Green" "[OK]"
} catch {
    Write-QuantumLog "[ERROR] Node.js no esta instalado" "Red" "[ERROR]"
    exit 1
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-QuantumLog "[ERROR] Archivo .env no encontrado" "Red" "[ERROR]"
    exit 1
}

# Leer configuracion critica del .env
$envContent = Get-Content ".env" -Raw
$isMainnet = $envContent -match "USE_TESTNET=false"
$isDemoMode = $envContent -match "DEMO_MODE=false"
$isPaperTrading = $envContent -match "PAPER_TRADING=false"

# Mostrar configuracion actual
Write-Host ""
Write-QuantumLog "[CONFIG] VERIFICANDO CONFIGURACION DEL SISTEMA:" "Cyan" "[CONFIG]"
Write-QuantumLog "================================================================" "DarkGray"

if ($isMainnet) {
    Write-QuantumLog "[ALERT] BINANCE: MAINNET (PRODUCCION REAL)" "Red" "[ALERT]"
} else {
    Write-QuantumLog "[INFO] BINANCE: TESTNET (MODO DE PRUEBA)" "Yellow" "[INFO]"
}

if (-not $isDemoMode) {
    Write-QuantumLog "[ALERT] DEMO MODE: DESACTIVADO (TRADING REAL)" "Red" "[ALERT]"
} else {
    Write-QuantumLog "[OK] DEMO MODE: ACTIVADO" "Green" "[OK]"
}

if (-not $isPaperTrading) {
    Write-QuantumLog "[ALERT] PAPER TRADING: DESACTIVADO (DINERO REAL)" "Red" "[ALERT]"
} else {
    Write-QuantumLog "[OK] PAPER TRADING: ACTIVADO" "Green" "[OK]"
}

Write-QuantumLog "================================================================" "DarkGray"

# Verificar si es configuracion de produccion
$isProductionMode = $isMainnet -and (-not $isDemoMode) -and (-not $isPaperTrading)

if ($isProductionMode) {
    Write-Host ""
    Write-QuantumLog "[DANGER] ATENCION - CONFIGURACION DE PRODUCCION DETECTADA!" "Red" "[DANGER]"
    Write-QuantumLog "[MONEY] Este sistema ejecutara trades con DINERO REAL" "Red" "[MONEY]"
    Write-QuantumLog "[WARN] El balance de Binance sera usado para trading automatico" "Yellow" "[WARN]"
    Write-QuantumLog "[RISK] Los parametros de riesgo estan configurados agresivamente" "Red" "[RISK]"
    Write-Host ""
    
    if (-not $SkipConfirmation) {
        $confirmation = Read-Host "Estas ABSOLUTAMENTE SEGURO de proceder con dinero real? (escribe 'SI ESTOY SEGURO')"
        if ($confirmation -ne "SI ESTOY SEGURO") {
            Write-QuantumLog "[CANCEL] Lanzamiento cancelado por seguridad" "Yellow" "[CANCEL]"
            exit 0
        }
    }
}

Write-Host ""
Write-QuantumLog "[SETUP] INICIANDO INSTALACION Y VERIFICACION DE DEPENDENCIAS..." "Cyan" "[SETUP]"

# Verificar e instalar dependencias
try {
    if (-not (Test-Path "node_modules")) {
        Write-QuantumLog "[NPM] Instalando dependencias..." "Yellow" "[NPM]"
        npm install --silent
    } else {
        Write-QuantumLog "[OK] Dependencias ya instaladas" "Green" "[OK]"
    }
} catch {
    Write-QuantumLog "[ERROR] ERROR instalando dependencias: $_" "Red" "[ERROR]"
    exit 1
}

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-QuantumLog "[DIR] Directorio de logs creado" "Green" "[DIR]"
}

Write-Host ""
Write-QuantumLog "[LAUNCH] LANZANDO SISTEMA QBTC UNIFIED..." "Green" "[LAUNCH]"
Write-QuantumLog "================================================================" "DarkGray"
Write-QuantumLog "[ENGINE] Motor de Analisis Cuantico: Puerto 4001" "Blue" "[ENGINE]"
Write-QuantumLog "[EXEC] Motor de Ejecucion: Puerto 4002" "Blue" "[EXEC]"
Write-QuantumLog "[MONITOR] Monitor Cuantico: Puerto 9093" "Blue" "[MONITOR]"
Write-QuantumLog "[WEB] Dashboard Principal: Puerto 8888" "Blue" "[WEB]"
Write-QuantumLog "================================================================" "DarkGray"

# Matar procesos existentes en puertos
$ports = @(4001, 4002, 8888, 9093)
foreach ($port in $ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-QuantumLog "[KILL] Proceso en puerto $port terminado" "Yellow" "[KILL]"
        }
    } catch {
        # Ignore errors - port might not be in use
    }
}

Start-Sleep -Seconds 2

# Lanzar el sistema principal
try {
    Write-QuantumLog "[START] Iniciando QBTC Unified Launcher..." "Cyan" "[START]"
    
    if ($AutoStart) {
        $env:AUTO_START_EXECUTION = "true"
    }
    
    # Ejecutar el launcher principal
    if ($Verbose) {
        node launch-qbtc-unified.js
    } else {
        node launch-qbtc-unified.js 2>&1 | ForEach-Object {
            if ($_ -match "error|Error|ERROR") {
                Write-Host $_ -ForegroundColor Red
            } elseif ($_ -match "warn|Warn|WARN") {
                Write-Host $_ -ForegroundColor Yellow
            } elseif ($_ -match "success|Success|SUCCESS|started|STARTED|running|RUNNING") {
                Write-Host $_ -ForegroundColor Green
            } else {
                Write-Host $_
            }
        }
    }
    
} catch {
    Write-QuantumLog "[ERROR] ERROR critico durante el lanzamiento: $_" "Red" "[ERROR]"
    
    # Informacion de troubleshooting
    Write-Host ""
    Write-QuantumLog "[HELP] INFORMACION DE TROUBLESHOOTING:" "Yellow" "[HELP]"
    Write-QuantumLog "1. Verifica que Node.js 16+ este instalado" "White" "[TIP]"
    Write-QuantumLog "2. Asegurate de que los puertos 4001, 4002, 8888, 9093 esten libres" "White" "[TIP]"
    Write-QuantumLog "3. Verifica la configuracion del archivo .env" "White" "[TIP]"
    Write-QuantumLog "4. Confirma que las credenciales de Binance sean validas" "White" "[TIP]"
    
    exit 1
}

# Funcion de cleanup al cerrar
$Global:Cleanup = {
    Write-Host ""
    Write-QuantumLog "[STOP] Cerrando sistema QBTC Unified..." "Yellow" "[STOP]"
    
    # Intentar cerrar procesos en puertos conocidos
    foreach ($port in $ports) {
        try {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
            if ($process) {
                Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
    
    Write-QuantumLog "[OK] Sistema cerrado exitosamente" "Green" "[OK]"
}

# Registrar cleanup
Register-EngineEvent PowerShell.Exiting -Action $Global:Cleanup | Out-Null
[Console]::TreatControlCAsInput = $false
[Console]::CancelKeyPress += {
    param($sender, $e)
    $e.Cancel = $true
    & $Global:Cleanup
    exit 0
}

# Footer de informacion
Write-Host ""
Write-QuantumLog "[INFO] INFORMACION DEL SISTEMA:" "Cyan" "[INFO]"
Write-QuantumLog "================================================================" "DarkGray"
Write-QuantumLog "[WEB] Dashboard: http://localhost:8888" "Blue" "[WEB]"
Write-QuantumLog "[API] API Analisis: http://localhost:4001/health" "Blue" "[API]"
Write-QuantumLog "[API] API Ejecucion: http://localhost:4002/health" "Blue" "[API]"
Write-QuantumLog "[API] Monitor: http://localhost:9093/health" "Blue" "[API]"
Write-QuantumLog "================================================================" "DarkGray"

if ($isProductionMode) {
    Write-Host ""
    Write-QuantumLog "[DANGER] RECORDATORIO: Sistema en MODO PRODUCCION - Dinero real en juego" "Red" "[DANGER]"
}

Write-Host ""
Write-QuantumLog "[INFO] Presiona Ctrl+C para cerrar el sistema de manera segura" "White" "[INFO]"
Write-QuantumLog "[READY] Sistema QBTC Unified completamente operacional" "Green" "[READY]"
