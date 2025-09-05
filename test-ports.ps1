# Script para probar puertos del LLM Orchestrator
$ports = @(52127, 52463, 59257, 51997, 58375, 58255, 58256, 56544, 56545)

Write-Host "[TEST] Probando puertos del LLM Orchestrator..." -ForegroundColor Green

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -Method GET -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "[SUCCESS] Puerto $port está activo!" -ForegroundColor Green
            Write-Host "[INFO] Response: $($response.Content)" -ForegroundColor Yellow
            break
        }
    } catch {
        Write-Host "[FAIL] Puerto $port no responde" -ForegroundColor Red
    }
}

Write-Host "[TEST] Prueba de puertos completada" -ForegroundColor Cyan
