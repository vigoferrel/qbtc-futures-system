# QBTC - Lanzador Seguro Quantum Analysis Server
# Configurado para prevenir bans de API con cache inteligente y logging completo

Write-Host "🌌 QBTC Quantum Analysis Server - Safe Launch Mode" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Crear directorio de logs si no existe
$logsDir = "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir
    Write-Host "[FOLDER] Created logs directory" -ForegroundColor Green
}

# Timestamp para logs
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/quantum-analysis-server_$timestamp.log"
$errorFile = "logs/quantum-analysis-server_$timestamp.error.log"
$metricsFile = "logs/quantum-analysis-metrics_$timestamp.json"

Write-Host "[INFO] Configuración de logging:" -ForegroundColor Yellow
Write-Host "  Output Log: $logFile" -ForegroundColor White
Write-Host "  Error Log: $errorFile" -ForegroundColor White
Write-Host "  Metrics Log: $metricsFile" -ForegroundColor White

# Verificar que Node.js está disponible
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js no encontrado en PATH" -ForegroundColor Red
    exit 1
}

# Verificar que el archivo quantum-analysis-server.js existe
$serverFile = "analysis-engine/quantum-analysis-server.js"
if (-not (Test-Path $serverFile)) {
    Write-Host "[ERROR] Archivo $serverFile no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "[CHECK] Pre-requisitos verificados" -ForegroundColor Green

# Configurar variables de entorno para logging mejorado
$env:NODE_ENV = "production"
$env:QBTC_CACHE_ENABLED = "true"
$env:QBTC_RATE_LIMIT = "150"  # Configuración conservadora
$env:QBTC_METRICS_FILE = $metricsFile

Write-Host "[GEAR] Configuraciones de entorno establecidas:" -ForegroundColor Yellow
Write-Host "  NODE_ENV: $env:NODE_ENV" -ForegroundColor White
Write-Host "  CACHE_ENABLED: $env:QBTC_CACHE_ENABLED" -ForegroundColor White
Write-Host "  RATE_LIMIT: $env:QBTC_RATE_LIMIT req/min" -ForegroundColor White

# Lanzar proceso en segundo plano con logging completo
Write-Host "[ROCKET] Iniciando Quantum Analysis Server en segundo plano..." -ForegroundColor Green

$processParams = @{
    FilePath = "node"
    ArgumentList = @($serverFile)
    RedirectStandardOutput = $logFile
    RedirectStandardError = $errorFile
    NoNewWindow = $true
    PassThru = $true
}

$process = Start-Process @processParams

if ($process -eq $null) {
    Write-Host "[ERROR] No se pudo iniciar el proceso" -ForegroundColor Red
    exit 1
}

$processId = $process.Id
Write-Host "[CHECK] Proceso iniciado exitosamente:" -ForegroundColor Green
Write-Host "  Process ID: $processId" -ForegroundColor White
Write-Host "  Timestamp: $(Get-Date)" -ForegroundColor White

# Guardar información del proceso para futuras referencias
$processInfo = @{
    ProcessId = $processId
    StartTime = Get-Date
    LogFile = $logFile
    ErrorFile = $errorFile
    MetricsFile = $metricsFile
    Command = "node $serverFile"
    SafeMode = $true
    RateLimit = $env:QBTC_RATE_LIMIT
    CacheEnabled = $env:QBTC_CACHE_ENABLED
}

$processInfoFile = "quantum-analysis-process-info.json"
$processInfo | ConvertTo-Json -Depth 2 | Out-File -FilePath $processInfoFile -Encoding UTF8

Write-Host "[FLOPPY_DISK] Información del proceso guardada en: $processInfoFile" -ForegroundColor Cyan

# Esperar un momento y verificar que el proceso sigue ejecutándose
Start-Sleep -Seconds 3

$runningProcess = Get-Process -Id $processId -ErrorAction SilentlyContinue
if ($runningProcess) {
    Write-Host "[CHECK] Proceso funcionando correctamente" -ForegroundColor Green
    Write-Host "  PID: $processId" -ForegroundColor White
    Write-Host "  Estado: Running" -ForegroundColor White
    Write-Host "  CPU: $($runningProcess.CPU)" -ForegroundColor White
    Write-Host "  Memory: $([math]::Round($runningProcess.WorkingSet / 1MB, 2)) MB" -ForegroundColor White
} else {
    Write-Host "[ERROR] El proceso no está ejecutándose" -ForegroundColor Red
    exit 1
}

Write-Host "" -ForegroundColor White
Write-Host "🎯 INSTRUCCIONES DE MONITOREO:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "1. Para ver logs en tiempo real:" -ForegroundColor White
Write-Host "   Get-Content '$logFile' -Wait" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "2. Para ver errores:" -ForegroundColor White
Write-Host "   Get-Content '$errorFile' -Wait" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "3. Para verificar el estado del proceso:" -ForegroundColor White
Write-Host "   Get-Process -Id $processId" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "4. Para detener el proceso:" -ForegroundColor White
Write-Host "   Stop-Process -Id $processId -Force" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "5. Para acceder al health endpoint:" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:14107/health'" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# Crear script de monitoreo rápido
$monitorScript = @"
# Script de monitoreo rápido para Quantum Analysis Server
# Generado automáticamente - PID: $processId

Write-Host "📊 QBTC Quantum Analysis Server - Monitor" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar proceso
`$process = Get-Process -Id $processId -ErrorAction SilentlyContinue
if (`$process) {
    Write-Host "[CHECK] Estado: RUNNING" -ForegroundColor Green
    Write-Host "  PID: $processId" -ForegroundColor White
    Write-Host "  CPU: `$(`$process.CPU)" -ForegroundColor White
    Write-Host "  Memory: `$([math]::Round(`$process.WorkingSet / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "  Start Time: `$(`$process.StartTime)" -ForegroundColor White
} else {
    Write-Host "[ERROR] Proceso NO está ejecutándose" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White

# Verificar endpoint de salud
try {
    `$healthResponse = Invoke-RestMethod -Uri 'http://localhost:14107/health' -TimeoutSec 5
    Write-Host "[CHECK] Health Endpoint: OK" -ForegroundColor Green
    Write-Host "  Status: `$(`$healthResponse.status)" -ForegroundColor White
    Write-Host "  Consciousness: `$(`$healthResponse.consciousness_level)" -ForegroundColor White
    Write-Host "  Lunar Phase: `$(`$healthResponse.lunar_phase)" -ForegroundColor White
    Write-Host "  Merkaba: `$(`$healthResponse.merkaba_status)" -ForegroundColor White
} catch {
    Write-Host "[WARNING] Health Endpoint: NO RESPONDE" -ForegroundColor Yellow
    Write-Host "  Error: `$(`$_.Exception.Message)" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White
Write-Host "📄 Ver logs:" -ForegroundColor Yellow
Write-Host "  Output: Get-Content '$logFile' -Tail 20" -ForegroundColor Cyan
Write-Host "  Errors: Get-Content '$errorFile' -Tail 20" -ForegroundColor Cyan
"@

$monitorScript | Out-File -FilePath "monitor-quantum-analysis.ps1" -Encoding UTF8
Write-Host "[GEAR] Script de monitoreo creado: monitor-quantum-analysis.ps1" -ForegroundColor Cyan

Write-Host "" -ForegroundColor White
Write-Host "✅ LANZAMIENTO COMPLETADO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "El Quantum Analysis Server está ejecutándose en modo SEGURO" -ForegroundColor White
Write-Host "- Rate limiting ultra-conservador (150 req/min máx)" -ForegroundColor White
Write-Host "- Cache inteligente habilitado" -ForegroundColor White
Write-Host "- Volume profiles deshabilitados temporalmente" -ForegroundColor White
Write-Host "- Logging completo activado" -ForegroundColor White
Write-Host "- Monitoreo de métricas configurado" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Process ID: $processId" -ForegroundColor Cyan
Write-Host "Puerto esperado: 14107" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
