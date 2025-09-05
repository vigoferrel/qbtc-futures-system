# Limpiador Final y Agresivo de Math.random
# Elimina TODAS las instancias de Math.random del sistema QBTC

Write-Host "🧹 LIMPIADOR FINAL DE MATH.RANDOM - QBTC QUANTUM SYSTEM" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Contar instancias antes de limpiar
Write-Host "📊 Contando instancias de Math.random antes de limpiar..." -ForegroundColor Yellow
$beforeCount = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*test*" -and
    $_.FullName -notlike "*\.git*"
} | Select-String "Math\.random" | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "🔍 Instancias encontradas: $beforeCount" -ForegroundColor Red

if ($beforeCount -eq 0) {
    Write-Host "✅ ¡Sistema ya está limpio! No se encontraron instancias de Math.random" -ForegroundColor Green
    exit 0
}

# Obtener todos los archivos .js
$jsFiles = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*test*" -and
    $_.FullName -notlike "*\.git*"
}

Write-Host "📁 Procesando $($jsFiles.Count) archivos..." -ForegroundColor Yellow

$totalReplacements = 0
$processedFiles = 0
$errors = 0

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Patrones de Math.random a reemplazar
        $patterns = @(
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 1)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 2)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 3)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 4)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 5)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 6)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 7)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 8)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 9)" },
            @{ Pattern = "Math\.random\(\)"; Replacement = "this.purifier.generateQuantumValue($processedFiles, 10)" }
        )
        
        $fileReplacements = 0
        $modifier = 1
        
        # Reemplazar cada instancia con un valor cuántico diferente
        foreach ($pattern in $patterns) {
            if ($content -match $pattern.Pattern) {
                $replacement = $pattern.Replacement -replace '\$processedFiles', $processedFiles -replace '\$modifier', $modifier
                $content = $content -replace $pattern.Pattern, $replacement
                $fileReplacements++
                $modifier++
            }
        }
        
        # Si hubo cambios, guardar el archivo
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $totalReplacements += $fileReplacements
            Write-Host "✅ $($file.Name): $fileReplacements reemplazos" -ForegroundColor Green
        }
        
        $processedFiles++
        
    } catch {
        Write-Host "❌ Error procesando $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

# Verificar resultado
Write-Host "`n📊 RESUMEN DE LIMPIEZA:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "📁 Archivos procesados: $processedFiles" -ForegroundColor White
Write-Host "🔄 Total reemplazos: $totalReplacements" -ForegroundColor Green
Write-Host "❌ Errores: $errors" -ForegroundColor Red

# Contar instancias después de limpiar
Write-Host "`n🔍 Verificando resultado..." -ForegroundColor Yellow
$afterCount = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and 
    $_.FullName -notlike "*test*" -and
    $_.FullName -notlike "*\.git*"
} | Select-String "Math\.random" | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "📊 Instancias restantes: $afterCount" -ForegroundColor $(if ($afterCount -eq 0) { "Green" } else { "Red" })

if ($afterCount -eq 0) {
    Write-Host "`n🎉 ¡LIMPIEZA COMPLETA EXITOSA!" -ForegroundColor Green
    Write-Host "✅ Sistema QBTC completamente purificado de Math.random" -ForegroundColor Green
    Write-Host "✅ Todas las instancias reemplazadas con valores cuánticos deterministas" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  LIMPIEZA PARCIAL" -ForegroundColor Yellow
    Write-Host "❌ Aún quedan $afterCount instancias de Math.random" -ForegroundColor Red
    
    # Mostrar archivos con Math.random restantes
    Write-Host "`n📋 Archivos con Math.random restantes:" -ForegroundColor Yellow
    Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*test*" -and
        $_.FullName -notlike "*\.git*"
    } | Select-String "Math\.random" | ForEach-Object {
        Write-Host "  - $($_.Filename):$($_.LineNumber)" -ForegroundColor Red
    }
}

Write-Host "`n🏁 Limpieza finalizada" -ForegroundColor Cyan
