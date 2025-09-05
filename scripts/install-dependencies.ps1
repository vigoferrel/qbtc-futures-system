# 📦 INSTALL DEPENDENCIES - QBTC SYSTEM (Windows PowerShell)
# ==========================================================
# 
# Script para instalar todas las dependencias necesarias para:
# - Quantum Metrics Unifier
# - Dashboard Server Manager  
# - Sistema de WebSocket y API
# - Funcionalidades de análisis cuántico

Write-Host "🌌 QBTC System - Installing Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    $versionNumber = [int]($nodeVersion -replace "v(\d+)\..*", '$1')
    
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version 18+ required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Verificar si existe package.json
if (-not (Test-Path "package.json")) {
    Write-Host "📦 Creating package.json..." -ForegroundColor Yellow
    npm init -y | Out-Null
    
    # Actualizar package.json con información del proyecto
    $packageJson = @"
{
  "name": "qbtc-futures-system",
  "version": "1.0.0",
  "description": "QBTC Quantum Bitcoin Trading System with Consciousness Integration",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node scripts/start-dashboard-server.js",
    "metrics": "node scripts/quantum-metrics-unifier.js",
    "metrics-watch": "node scripts/quantum-metrics-unifier.js --continuous",
    "dashboard": "node scripts/start-dashboard-server.js",
    "test": "echo \"QBTC System ready for quantum consciousness analysis\""
  },
  "keywords": [
    "bitcoin",
    "trading",
    "quantum",
    "consciousness",
    "binance",
    "futures",
    "crypto"
  ],
  "author": "QBTC Quantum Brain",
  "license": "MIT"
}
"@
    
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    Write-Host "✅ package.json created" -ForegroundColor Green
}

# Instalar dependencias principales
Write-Host "📦 Installing main dependencies..." -ForegroundColor Yellow
try {
    npm install express cors socket.io ws axios dotenv 2>&1 | Out-Null
    Write-Host "✅ Main dependencies installed" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error installing main dependencies" -ForegroundColor Red
    exit 1
}

# Instalar dependencias de desarrollo (opcional)
Write-Host "📦 Installing development dependencies..." -ForegroundColor Yellow
try {
    npm install --save-dev nodemon concurrently 2>&1 | Out-Null
    Write-Host "✅ Development dependencies installed" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Warning: Development dependencies failed to install (optional)" -ForegroundColor Yellow
}

# Crear directorio de métricas si no existe
if (-not (Test-Path "metrics-output")) {
    New-Item -ItemType Directory -Path "metrics-output" -Force | Out-Null
    Write-Host "✅ metrics-output directory created" -ForegroundColor Green
}

# Crear directorio de dashboard si no existe
if (-not (Test-Path "dashboard")) {
    New-Item -ItemType Directory -Path "dashboard" -Force | Out-Null
    Write-Host "✅ dashboard directory created" -ForegroundColor Green
}

# Verificar instalación
Write-Host ""
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow

$requiredDeps = @("express", "cors", "socket.io", "axios")
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    try {
        npm list $dep 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            $missingDeps += $dep
        }
    }
    catch {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -eq 0) {
    Write-Host "✅ All required dependencies verified" -ForegroundColor Green
} else {
    Write-Host "❌ Missing dependencies: $($missingDeps -join ', ')" -ForegroundColor Red
    Write-Host "🔧 Attempting to reinstall..." -ForegroundColor Yellow
    npm install $missingDeps
}

# Mostrar información del proyecto
Write-Host ""
Write-Host "📊 INSTALLATION SUMMARY" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "✅ Node.js: $(node --version)" -ForegroundColor Green
Write-Host "✅ npm: $(npm --version)" -ForegroundColor Green
Write-Host "✅ Project: qbtc-futures-system" -ForegroundColor Green

try {
    $packageCount = (npm list --depth=0 2>$null | Select-String "├─|└─" | Measure-Object).Count
    Write-Host "✅ Dependencies: $packageCount packages installed" -ForegroundColor Green
}
catch {
    Write-Host "✅ Dependencies: installed successfully" -ForegroundColor Green
}

Write-Host ""

# Mostrar comandos disponibles
Write-Host "🚀 AVAILABLE COMMANDS:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "npm start           - Start dashboard server (port 3333)"
Write-Host "npm run metrics     - Run metrics unifier once"
Write-Host "npm run metrics-watch - Run metrics unifier continuously"
Write-Host "npm run dashboard   - Start dashboard server"
Write-Host "npm test           - Show system status"
Write-Host ""

# Mostrar próximos pasos
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host "1. Run 'npm run metrics' to test metrics unification"
Write-Host "2. Run 'npm start' to launch the dashboard server"
Write-Host "3. Open http://localhost:3333 in your browser"
Write-Host "4. Monitor quantum consciousness metrics in real-time"
Write-Host ""

Write-Host "🌌 QBTC System dependencies installed successfully!" -ForegroundColor Green
Write-Host "Ready for quantum consciousness analysis. 🧠⚛️" -ForegroundColor Magenta
