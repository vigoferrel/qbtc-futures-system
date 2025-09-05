# QBTC Ultimate Edition - Lanzador Simple v2.0

Write-Host "[ROCKET] INICIANDO FRONTENDS QBTC ULTIMATE EDITION..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Green

# Verificar servicios
Write-Host "[MAGNIFY] Verificando servicios..." -ForegroundColor Yellow

$dashboardOK = $false
$alertEngineOK = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:14999" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[CHECK] Quantum Monitoring Dashboard - ACTIVO" -ForegroundColor Green
        $dashboardOK = $true
    }
}
catch {
    Write-Host "[X] Quantum Monitoring Dashboard - NO DISPONIBLE" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:14998/api/alerts/active" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[CHECK] Quantum Alert Engine - ACTIVO" -ForegroundColor Green  
        $alertEngineOK = $true
    }
}
catch {
    Write-Host "[X] Quantum Alert Engine - NO DISPONIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "[GLOBE] Lanzando interfaces web..." -ForegroundColor Cyan

if ($dashboardOK) {
    Write-Host "[TARGET] Abriendo Quantum Monitoring Dashboard..." -ForegroundColor Green
    Start-Process "http://localhost:14999"
    Start-Sleep -Seconds 1
}

# Crear y abrir página de enlaces rápidos
$quickLinksPage = @'
<!DOCTYPE html>
<html><head><title>QBTC Control Center</title>
<style>body{font-family:Consolas;background:#0a0a0a;color:#00ff88;padding:20px;text-align:center;}
h1{color:#00ff88;text-shadow:0 0 10px #00ff88;margin-bottom:30px;}
.link{display:inline-block;background:#00ff88;color:#000;padding:15px 30px;margin:10px;text-decoration:none;border-radius:5px;font-weight:bold;}
.link:hover{background:#88ffff;}</style></head>
<body><h1>[ATOM] QBTC ULTIMATE EDITION [ATOM]</h1>
<div><a href="http://localhost:14999" target="_blank" class="link">[TARGET] Dashboard Principal</a></div>
<div><a href="http://localhost:14999/api/system/status" target="_blank" class="link">[CHART] API Status</a></div>
<div><a href="http://localhost:14998/api/alerts/active" target="_blank" class="link">[SIREN] Alertas</a></div>
<div><a href="http://localhost:14001/health" target="_blank" class="link">[GAMEPAD] Master Control</a></div>
<div><a href="http://localhost:14101/health" target="_blank" class="link">[CYCLONE] Quantum Engine</a></div>
<div><a href="http://localhost:14301/metrics" target="_blank" class="link">[WARNING] Risk Metrics</a></div>
<p style="margin-top:40px;color:#666;">Sistema Operativo - Versión 2.0</p></body></html>
'@

$quickLinksPath = Join-Path $PWD "qbtc-quick-links.html"
$quickLinksPage | Out-File -FilePath $quickLinksPath -Encoding UTF8

Write-Host "[GAMEPAD] Abriendo Centro de Control..." -ForegroundColor Cyan
Start-Process $quickLinksPath

Write-Host ""
Write-Host "[PARTY] FRONTENDS LANZADOS!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""
Write-Host "[GLOBE] URLs Disponibles:" -ForegroundColor Cyan
if ($dashboardOK) {
    Write-Host "   [CHART] Dashboard: http://localhost:14999" -ForegroundColor White
}
if ($alertEngineOK) {
    Write-Host "   [SIREN] Alertas:   http://localhost:14998/api/alerts/active" -ForegroundColor White  
}
Write-Host "   [GAMEPAD] Enlaces:   file:///$quickLinksPath" -ForegroundColor White
Write-Host ""
