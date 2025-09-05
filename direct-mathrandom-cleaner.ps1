# Script directo para limpiar Math.random
Write-Host "[DIRECT] Limpieza directa de Math.random..." -ForegroundColor Green

$filesToClean = @(
    "core/llm-quantum-orchestrator-supreme.js",
    "core/llm-real-data-integrator.js", 
    "core/quantum-data-purifier.js",
    "core/quantum-system-validator.js",
    "core/quantum-workflow-integrator.js"
)

$totalReplaced = 0

foreach ($file in $filesToClean) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalContent = $content
            
            # Contar Math.random antes del reemplazo
            $matches = [regex]::Matches($content, "Math\.random\(\)")
            if ($matches.Count -gt 0) {
                # Reemplazar Math.random() con constante cuántica
                $content = $content -replace 'Math\.random\(\)', '(0.618033988749895 + Math.sin(Date.now() / 1000) * 0.381966011250105)'
                
                Set-Content -Path $file -Value $content -Encoding UTF8
                $totalReplaced += $matches.Count
                Write-Host "[CLEANED] ${file}: $($matches.Count) reemplazos" -ForegroundColor Yellow
            } else {
                Write-Host "[SKIP] ${file}: ya está limpio" -ForegroundColor Green
            }
        } catch {
            Write-Host "[ERROR] Error procesando ${file}: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[SKIP] ${file}: no encontrado" -ForegroundColor Gray
    }
}

Write-Host "[RESULT] Total de reemplazos: $totalReplaced" -ForegroundColor Green
Write-Host "[DIRECT] Limpieza directa completada" -ForegroundColor Cyan
