# [GLOBE] QBTC System Status Monitor
Write-Host "[GALAXY] =============== QBTC SYSTEM STATUS ===============" -ForegroundColor Cyan
Write-Host "[CALENDAR] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host ""

# 1. PowerShell Jobs
Write-Host "[CONTROL_KNOBS] PowerShell Jobs:" -ForegroundColor Yellow
$jobs = Get-Job -ErrorAction SilentlyContinue
if ($jobs) {
    $jobs | Format-Table Id, Name, State -AutoSize
    $running = ($jobs | Where-Object { $_.State -eq "Running" }).Count
    $completed = ($jobs | Where-Object { $_.State -eq "Completed" }).Count
    Write-Host "[CHECK] Running: $running | Completed: $completed" -ForegroundColor Green
} else {
    Write-Host "[X] No QBTC jobs found" -ForegroundColor Red
}

Write-Host ""

# 2. QBTC Ports
Write-Host "[GLOBE] QBTC Ports:" -ForegroundColor Yellow

$port14401 = netstat -ano | Select-String ":14401.*LISTENING"
if ($port14401) {
    Write-Host "[CHECK] Port 14401 (Unified Monitor): ACTIVE" -ForegroundColor Green
} else {
    Write-Host "[X] Port 14401 (Unified Monitor): INACTIVE" -ForegroundColor Red
}

$port14105 = netstat -ano | Select-String ":14105.*LISTENING"
if ($port14105) {
    Write-Host "[CHECK] Port 14105 (Quantum Core): ACTIVE" -ForegroundColor Green
} else {
    Write-Host "[X] Port 14105 (Quantum Core): INACTIVE" -ForegroundColor Red
}

Write-Host ""

# 3. Node.js Processes
Write-Host "[ATOM] Node.js Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
        Write-Host "[CHECK] PID $($_.Id): ${memoryMB}MB" -ForegroundColor Green
    }
    Write-Host "[CHART] Total processes: $($nodeProcesses.Count)" -ForegroundColor Cyan
} else {
    Write-Host "[X] No Node.js processes" -ForegroundColor Red
}

Write-Host ""

# 4. Test Connectivity
Write-Host "[EARTH] Connectivity Tests:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:14401" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "[CHECK] Dashboard: http://localhost:14401" -ForegroundColor Green
} catch {
    Write-Host "[X] Dashboard: http://localhost:14401" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:14105/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "[CHECK] Quantum Core: http://localhost:14105/health" -ForegroundColor Green
} catch {
    Write-Host "[X] Quantum Core: http://localhost:14105/health" -ForegroundColor Red
}

Write-Host ""
Write-Host "[STAR] QBTC System Status Complete" -ForegroundColor Magenta
Write-Host "[LINK] Main Dashboard: http://localhost:14401" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
