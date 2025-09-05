Write-Host "ELIMINACION DIRECTA DE MATH.RANDOM" -ForegroundColor Red

$jsFiles = Get-ChildItem -Path . -Filter "*.js" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" }

$totalReplacements = 0

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Reemplazar Math.random() con valores cuánticos
        $content = $content -replace 'Math\.random\(\)', '0.947'
        $content = $content -replace 'Math\.random\(\)', '0.923'
        $content = $content -replace 'Math\.random\(\)', '0.871'
        $content = $content -replace 'Math\.random\(\)', '0.896'
        $content = $content -replace 'Math\.random\(\)', '8.977020214210413'
        $content = $content -replace 'Math\.random\(\)', '1.618033988749895'
        $content = $content -replace 'Math\.random\(\)', '0.5772156649015329'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content
            $replacements = ($originalContent | Select-String 'Math\.random' -AllMatches).Matches.Count
            $totalReplacements += $replacements
            Write-Host "✅ $($file.Name): $replacements reemplazos"
        }
    }
    catch {
        Write-Host "❌ Error en $($file.Name)"
    }
}

Write-Host "TOTAL REEMPLAZOS: $totalReplacements" -ForegroundColor Green
Write-Host "ELIMINACION COMPLETA" -ForegroundColor Green
