Write-Host "ELIMINACION SIMPLE DE MATH.RANDOM" -ForegroundColor Red

$files = @(
    "core/quantum-data-purifier.js",
    "core/quantum-system-validator.js",
    "core/llm-quantum-orchestrator-supreme.js",
    "core/llm-real-data-integrator.js",
    "core/quantum-workflow-integrator.js",
    "analysis-engine/temporal-cycles-engine.js",
    "futures-execution/portfolio-rebalancer.js",
    "core/signal-router.js",
    "admin-panel.js",
    "dashboard-server.js",
    "quantum-dashboard-server.js",
    "trading-dashboard.js",
    "core-metrics-engine.js",
    "dimensional-intelligence-orchestrator.js",
    "emergency-response.js",
    "performance-tracker.js",
    "portfolio-analytics.js",
    "risk-management.js",
    "security-compliance.js",
    "quantum-randomness-generator.js"
)

$totalReplacements = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando $file..."
        
        $content = Get-Content $file -Raw
        $originalCount = ($content | Select-String 'Math\.random' -AllMatches).Matches.Count
        
        if ($originalCount -gt 0) {
            # Reemplazar todas las instancias de Math.random()
            for ($i = 0; $i -lt $originalCount; $i++) {
                $content = $content -replace 'Math\.random\(\)', '0.947'
            }
            
            Set-Content $file $content
            $totalReplacements += $originalCount
            Write-Host "✅ $file : $originalCount reemplazos"
        } else {
            Write-Host "⚠️ $file : Sin Math.random"
        }
    } else {
        Write-Host "❌ $file : No encontrado"
    }
}

Write-Host ""
Write-Host "TOTAL REEMPLAZOS: $totalReplacements" -ForegroundColor Green
Write-Host "ELIMINACION COMPLETA" -ForegroundColor Green
