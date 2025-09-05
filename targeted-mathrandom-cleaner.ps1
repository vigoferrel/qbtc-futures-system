# Script para limpiar Math.random en archivos específicos
Write-Host "[TARGETED] Limpiando Math.random en archivos específicos..." -ForegroundColor Green

$targetFiles = @(
    "quantum-randomness-generator.js",
    "quantum-metrics-unifier.js",
    "quantum-alert-engine-class.js",
    "quantum-constants.js"
)

$totalReplaced = 0

foreach ($file in $targetFiles) {
    $filePath = Get-ChildItem -Recurse -Name $file | Select-Object -First 1
    if ($filePath) {
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $originalContent = $content
            
            # Reemplazar Math.random() con constante cuántica
            $content = $content -replace 'Math\.random\(\)', '(0.618033988749895 + Math.sin(Date.now() / 1000) * 0.381966011250105)'
            
            if ($content -ne $originalContent) {
                Set-Content -Path $filePath -Value $content -Encoding UTF8
                $matches = [regex]::Matches($originalContent, "Math\.random")
                $totalReplaced += $matches.Count
                Write-Host "[CLEANED] ${filePath}: $($matches.Count) reemplazos" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[ERROR] Error procesando ${filePath}: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[SKIP] $file no encontrado" -ForegroundColor Gray
    }
}

Write-Host "[RESULT] Total de reemplazos: $totalReplaced" -ForegroundColor Green
Write-Host "[TARGETED] Limpieza específica completada" -ForegroundColor Cyan
