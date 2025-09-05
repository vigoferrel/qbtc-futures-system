# ===============================================================
# QBTC UNIFIED - LANZADOR COMPLETO POWERSHELL
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

# Leer configuración crítica del .env
$envContent = Get-Content ".env" -Raw
$isMainnet = $envContent -match "USE_TESTNET=false"
$isDemoMode = $envContent -match "DEMO_MODE=false"
$isPaperTrading = $envContent -match "PAPER_TRADING=false"

# Mostrar configuración actual
Write-Host ""
Write-QuantumLog "[MAGNIFY] VERIFICANDO CONFIGURACIÓN DEL SISTEMA:" "Cyan" "[MAGNIFY]"
Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"

if ($isMainnet) {
    Write-QuantumLog "🔴 BINANCE: MAINNET (PRODUCCIÓN REAL)" "Red" "🔴"
} else {
    Write-QuantumLog "🟡 BINANCE: TESTNET (MODO DE PRUEBA)" "Yellow" "🟡"
}

if (-not $isDemoMode) {
    Write-QuantumLog "🔴 DEMO MODE: DESACTIVADO (TRADING REAL)" "Red" "🔴"
} else {
    Write-QuantumLog "🟢 DEMO MODE: ACTIVADO" "Green" "🟢"
}

if (-not $isPaperTrading) {
    Write-QuantumLog "🔴 PAPER TRADING: DESACTIVADO (DINERO REAL)" "Red" "🔴"
} else {
    Write-QuantumLog "🟢 PAPER TRADING: ACTIVADO" "Green" "🟢"
}

Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"

# Verificar si es configuración de producción
$isProductionMode = $isMainnet -and (-not $isDemoMode) -and (-not $isPaperTrading)

if ($isProductionMode) {
    Write-Host ""
    Write-QuantumLog "[SIREN] ¡¡¡ATENCIÓN - CONFIGURACIÓN DE PRODUCCIÓN DETECTADA!!!" "Red" "[SIREN]"
    Write-QuantumLog "[MONEY] Este sistema ejecutará trades con DINERO REAL" "Red" "[MONEY]"
    Write-QuantumLog "[WARNING]  El balance de Binance será usado para trading automático" "Yellow" "[WARNING]"
    Write-QuantumLog "[FIRE] Los parámetros de riesgo están configurados agresivamente" "Red" "[FIRE]"
    Write-Host ""
    
    if (-not $SkipConfirmation) {
        $confirmation = Read-Host "¿Estás ABSOLUTAMENTE SEGURO de proceder con dinero real? (escribe 'SI ESTOY SEGURO')"
        if ($confirmation -ne "SI ESTOY SEGURO") {
            Write-QuantumLog "[X] Lanzamiento cancelado por seguridad" "Yellow" "[X]"
            exit 0
        }
    }
}

Write-Host ""
Write-QuantumLog "[WRENCH] INICIANDO INSTALACIÓN Y VERIFICACIÓN DE DEPENDENCIAS..." "Cyan" "[WRENCH]"

# Verificar e instalar dependencias
try {
    if (-not (Test-Path "node_modules")) {
        Write-QuantumLog "📦 Instalando dependencias..." "Yellow" "📦"
        npm install --silent
    } else {
        Write-QuantumLog "[CHECK] Dependencias ya instaladas" "Green" "[CHECK]"
    }
} catch {
    Write-QuantumLog "[X] ERROR instalando dependencias: $_" "Red" "[X]"
    exit 1
}

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-QuantumLog "📁 Directorio de logs creado" "Green" "📁"
}

Write-Host ""
Write-QuantumLog "[ROCKET] LANZANDO SISTEMA QBTC UNIFIED..." "Green" "[ROCKET]"
Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"
Write-QuantumLog "[BRAIN] Motor de Análisis Cuántico: Puerto 4001" "Blue" "[BRAIN]"
Write-QuantumLog "[LIGHTNING] Motor de Ejecución: Puerto 4002" "Blue" "[LIGHTNING]"
Write-QuantumLog "[GALAXY] Monitor Cuántico: Puerto 9093" "Blue" "[GALAXY]"
Write-QuantumLog "[GLOBE] Dashboard Principal: Puerto 8888" "Blue" "[GLOBE]"
Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"

# Matar procesos existentes en puertos
$ports = @(4001, 4002, 8888, 9093)
foreach ($port in $ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-QuantumLog "[STOP] Proceso en puerto $port terminado" "Yellow" "[STOP]"
        }
    } catch {
        # Ignore errors - port might not be in use
    }
}

Start-Sleep -Seconds 2

# Lanzar el sistema principal
try {
    Write-QuantumLog "[GALAXY] Iniciando QBTC Unified Launcher..." "Cyan" "[GALAXY]"
    
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
            } elseif ($_ -match "[CHECK]|success|Success|SUCCESS|started|STARTED|running|RUNNING") {
                Write-Host $_ -ForegroundColor Green
            } elseif ($_ -match "[BRAIN]|[LIGHTNING]|[GALAXY]|[GLOBE]|[WRENCH]|[CHART]") {
                Write-Host $_ -ForegroundColor Cyan
            } else {
                Write-Host $_
            }
        }
    }
    
} catch {
    Write-QuantumLog "[X] ERROR crítico durante el lanzamiento: $_" "Red" "[X]"
    
    # Información de troubleshooting
    Write-Host ""
    Write-QuantumLog "[WRENCH] INFORMACIÓN DE TROUBLESHOOTING:" "Yellow" "[WRENCH]"
    Write-QuantumLog "1. Verifica que Node.js 16+ esté instalado" "White" "📌"
    Write-QuantumLog "2. Asegúrate de que los puertos 4001, 4002, 8888, 9093 estén libres" "White" "📌"
    Write-QuantumLog "3. Verifica la configuración del archivo .env" "White" "📌"
    Write-QuantumLog "4. Confirma que las credenciales de Binance sean válidas" "White" "📌"
    
    exit 1
}

# Función de cleanup al cerrar
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
    
    Write-QuantumLog "[CHECK] Sistema cerrado exitosamente" "Green" "[CHECK]"
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

# Footer de información
Write-Host ""
Write-QuantumLog "[CLIPBOARD] INFORMACIÓN DEL SISTEMA:" "Cyan" "[CLIPBOARD]"
Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"
Write-QuantumLog "[GLOBE] Dashboard: http://localhost:8888" "Blue" "[GLOBE]"
Write-QuantumLog "[BRAIN] API Análisis: http://localhost:4001/health" "Blue" "[BRAIN]"
Write-QuantumLog "[LIGHTNING] API Ejecución: http://localhost:4002/health" "Blue" "[LIGHTNING]"
Write-QuantumLog "[GALAXY] Monitor: http://localhost:9093/health" "Blue" "[GALAXY]"
Write-QuantumLog "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"

if ($isProductionMode) {
    Write-Host ""
    Write-QuantumLog "🔴 RECORDATORIO: Sistema en MODO PRODUCCIÓN - Dinero real en juego" "Red" "🔴"
}

Write-Host ""
Write-QuantumLog "⌨️  Presiona Ctrl+C para cerrar el sistema de manera segura" "White" "⌨️"
Write-QuantumLog "[TARGET] Sistema QBTC Unified completamente operacional" "Green" "[TARGET]"
