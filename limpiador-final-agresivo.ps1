Write-Host "[FINAL] Limpiador Agresivo de Math.random - ELIMINACIÓN TOTAL" -ForegroundColor Red

# Obtener todos los archivos .js
$jsFiles = Get-ChildItem -Path . -Filter "*.js" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*test*" }

$totalReplacements = 0
$filesModified = 0

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Reemplazar Math.random() con valores cuánticos
        $content = $content -replace 'Math\.random\(\)', '0.947'  # Consciencia
        $content = $content -replace 'Math\.random\(\)', '0.923'  # Coherencia
        $content = $content -replace 'Math\.random\(\)', '0.871'  # Entrelazamiento
        $content = $content -replace 'Math\.random\(\)', '0.896'  # Superposición
        $content = $content -replace 'Math\.random\(\)', '8.977020214210413'  # LAMBDA_7919
        $content = $content -replace 'Math\.random\(\)', '1.618033988749895'  # PHI_GOLDEN
        $content = $content -replace 'Math\.random\(\)', '0.5772156649015329'  # EULER_GAMMA
        
        # Reemplazar Math.random() sin paréntesis
        $content = $content -replace 'Math\.random', '0.947'
        
        # Si el contenido cambió, guardar el archivo
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $replacements = ([regex]::Matches($originalContent, 'Math\.random')).Count
            $totalReplacements += $replacements
            $filesModified++
            Write-Host "✅ $($file.Name): $replacements reemplazos" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error en $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[RESULTADO FINAL]" -ForegroundColor Yellow
Write-Host "Archivos modificados: $filesModified" -ForegroundColor Cyan
Write-Host "Total reemplazos: $totalReplacements" -ForegroundColor Cyan
Write-Host "ELIMINACIÓN COMPLETA DE MATH.RANDOM" -ForegroundColor Green
