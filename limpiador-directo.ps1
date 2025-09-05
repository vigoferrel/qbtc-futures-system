Write-Host "LIMPIADOR DIRECTO DE MATH.RANDOM" -ForegroundColor Cyan

# Contar antes
$before = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*test*" 
} | Select-String "Math\.random" | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "Instancias encontradas: $before" -ForegroundColor Red

if ($before -eq 0) {
    Write-Host "Sistema ya limpio!" -ForegroundColor Green
    exit 0
}

# Obtener archivos
$files = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*test*" 
}

$replaced = 0
$counter = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $original = $content
        
        # Reemplazar Math.random() con valores cuanticos
        $content = $content -replace "Math\.random\(\)", "this.purifier.generateQuantumValue($counter, 1)"
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content
            $replaced++
            Write-Host "Modificado: $($file.Name)" -ForegroundColor Green
        }
        
        $counter++
    } catch {
        Write-Host "Error en $($file.Name)" -ForegroundColor Red
    }
}

# Verificar despues
$after = Get-ChildItem -Recurse -Include "*.js" | Where-Object { 
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*test*" 
} | Select-String "Math\.random" | Measure-Object | Select-Object -ExpandProperty Count

Write-Host ""
Write-Host "RESULTADO:" -ForegroundColor Cyan
Write-Host "Antes: $before" -ForegroundColor Red
Write-Host "Despues: $after" -ForegroundColor $(if ($after -eq 0) { "Green" } else { "Red" })
Write-Host "Archivos modificados: $replaced" -ForegroundColor Yellow

if ($after -eq 0) {
    Write-Host "LIMPIEZA COMPLETA!" -ForegroundColor Green
} else {
    Write-Host "Aun quedan $after instancias" -ForegroundColor Red
}
