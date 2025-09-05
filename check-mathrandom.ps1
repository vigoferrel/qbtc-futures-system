# Script para verificar instancias de Math.random
Write-Host "[CHECK] Verificando instancias de Math.random..." -ForegroundColor Green

$files = Get-ChildItem -Recurse -Include "*.js" | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*test*" }
$mathRandomCount = 0
$filesWithMathRandom = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, "Math\.random")
    if ($matches.Count -gt 0) {
        $mathRandomCount += $matches.Count
        $filesWithMathRandom += @{
            File = $file.Name
            Path = $file.FullName
            Count = $matches.Count
        }
    }
}

Write-Host "[RESULT] Total de instancias Math.random encontradas: $mathRandomCount" -ForegroundColor Yellow

if ($filesWithMathRandom.Count -gt 0) {
    Write-Host "[FILES] Archivos con Math.random:" -ForegroundColor Red
    foreach ($file in $filesWithMathRandom) {
        Write-Host "  - $($file.File): $($file.Count) instancias" -ForegroundColor Red
    }
} else {
    Write-Host "[SUCCESS] ¡No se encontraron instancias de Math.random!" -ForegroundColor Green
}

Write-Host "[CHECK] Verificación completada" -ForegroundColor Cyan
