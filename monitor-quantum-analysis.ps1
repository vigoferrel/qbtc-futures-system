# Script de monitoreo rÃ¡pido para Quantum Analysis Server
# Generado automÃ¡ticamente - PID: 5084

Write-Host "ðŸ“Š QBTC Quantum Analysis Server - Monitor" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar proceso
$process = Get-Process -Id 5084 -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "[CHECK] Estado: RUNNING" -ForegroundColor Green
    Write-Host "  PID: 5084" -ForegroundColor White
    Write-Host "  CPU: $($process.CPU)" -ForegroundColor White
    Write-Host "  Memory: $([math]::Round($process.WorkingSet / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "  Start Time: $($process.StartTime)" -ForegroundColor White
} else {
    Write-Host "[ERROR] Proceso NO estÃ¡ ejecutÃ¡ndose" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White

# Verificar endpoint de salud
try {
    $healthResponse = Invoke-RestMethod -Uri 'http://localhost:14107/health' -TimeoutSec 5
    Write-Host "[CHECK] Health Endpoint: OK" -ForegroundColor Green
    Write-Host "  Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "  Consciousness: $($healthResponse.consciousness_level)" -ForegroundColor White
    Write-Host "  Lunar Phase: $($healthResponse.lunar_phase)" -ForegroundColor White
    Write-Host "  Merkaba: $($healthResponse.merkaba_status)" -ForegroundColor White
} catch {
    Write-Host "[WARNING] Health Endpoint: NO RESPONDE" -ForegroundColor Yellow
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "" -ForegroundColor White
Write-Host "ðŸ“„ Ver logs:" -ForegroundColor Yellow
Write-Host "  Output: Get-Content 'logs/quantum-analysis-server_2025-08-25_22-13-01.log' -Tail 20" -ForegroundColor Cyan
Write-Host "  Errors: Get-Content 'logs/quantum-analysis-server_2025-08-25_22-13-01.error.log' -Tail 20" -ForegroundColor Cyan
