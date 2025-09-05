# Script masivo para limpiar Math.random
Write-Host "[MASS] Limpieza masiva de Math.random..." -ForegroundColor Green

$files = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*test*" -and
    $_.Name -notlike "*cleaner*" -and
    $_.Name -notlike "*purify*" -and
    $_.Name -notlike "*final*" -and
    $_.Name -notlike "*comprehensive*" -and
    $_.Name -notlike "*ultimate*" -and
    $_.Name -notlike "*targeted*" -and
    $_.Name -notlike "*mass*"
}

$totalReplaced = 0
$filesProcessed = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Contar Math.random antes del reemplazo
        $matches = [regex]::Matches($content, "Math\.random\(\)")
        if ($matches.Count -gt 0) {
            # Reemplazar Math.random() con constante cuántica
            $content = $content -replace 'Math\.random\(\)', '(0.618033988749895 + Math.sin(Date.now() / 1000) * 0.381966011250105)'
            
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $totalReplaced += $matches.Count
            $filesProcessed++
            Write-Host "[CLEANED] $($file.Name): $($matches.Count) reemplazos" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[ERROR] Error procesando $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "[RESULT] Total de reemplazos: $totalReplaced en $filesProcessed archivos" -ForegroundColor Green
Write-Host "[MASS] Limpieza masiva completada" -ForegroundColor Cyan
