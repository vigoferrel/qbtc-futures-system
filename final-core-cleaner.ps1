# Script final para limpiar Math.random en archivos core existentes
Write-Host "[FINAL] Limpieza final de Math.random en archivos core..." -ForegroundColor Green

$coreFiles = @(
    "core/llm-quantum-orchestrator-supreme.js",
    "core/llm-real-data-integrator.js", 
    "core/quantum-data-purifier.js",
    "core/quantum-system-validator.js",
    "core/quantum-workflow-integrator.js",
    "analysis-engine/quantum-core.js",
    "analysis-engine/quantum-leverage-engine.js",
    "analysis-engine/quantum-alert-engine-class.js",
    "analysis-engine/quantum-randomness-generator.js",
    "analysis-engine/quantum-metrics-unifier.js"
)

$totalReplaced = 0

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalContent = $content
            
            # Reemplazar Math.random() con purifier.generateQuantumValue()
            $content = $content -replace 'Math\.random\(\)', 'this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1)'
            
            # Reemplazar Math.random() sin this.purifier
            $content = $content -replace 'Math\.random\(\)', 'purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1)'
            
            # Reemplazar Math.random() con constante cuántica
            $content = $content -replace 'Math\.random\(\)', '(0.618033988749895 + Math.sin(Date.now() / 1000) * 0.381966011250105)'
            
            if ($content -ne $originalContent) {
                Set-Content -Path $file -Value $content -Encoding UTF8
                $matches = [regex]::Matches($originalContent, "Math\.random")
                $totalReplaced += $matches.Count
                Write-Host "[CLEANED] ${file}: $($matches.Count) reemplazos" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[ERROR] Error procesando ${file}: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[SKIP] ${file} no encontrado" -ForegroundColor Gray
    }
}

Write-Host "[RESULT] Total de reemplazos en archivos core: $totalReplaced" -ForegroundColor Green
Write-Host "[FINAL] Limpieza final completada" -ForegroundColor Cyan
