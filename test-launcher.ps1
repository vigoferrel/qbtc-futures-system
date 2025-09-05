# Test QBTC Launcher
param([switch]$DryRun)

# Simple service config for testing
$ServiceConfig = @{
    CoreServices = @{
        Configuration = @{
            Name = "Configuration Service"
            Port = 14003
            Script = "core/config-service.js"
        }
        MasterControl = @{
            Name = "Master Control Hub"
            Port = 14001
            Script = "core/master-control-hub.js"
        }
    }
}

$RunningProcesses = @{}

function Start-TestService {
    param(
        [hashtable]$Service,
        [string]$ServiceName
    )
    
    Write-Host "Starting service: $ServiceName"
    Write-Host "Service object: $($Service | Out-String)"
    
    if (-not $Service) {
        Write-Host "ERROR: Service is null"
        return $false
    }
    
    if (-not $Service.Name) {
        Write-Host "ERROR: Service.Name is null"
        return $false
    }
    
    if ($DryRun) {
        Write-Host "[DRY RUN] Would start: $($Service.Name) on port $($Service.Port)"
        $global:RunningProcesses[$ServiceName] = @{
            Service = $Service
            DryRun = $true
        }
        return $true
    }
    
    Write-Host "Would continue with actual startup..."
    return $true
}

Write-Host "Testing service configuration..."
Write-Host "ServiceConfig.CoreServices: $($ServiceConfig.CoreServices | Out-String)"

foreach ($serviceName in $ServiceConfig.CoreServices.Keys) {
    Write-Host "Processing service: $serviceName"
    $service = $ServiceConfig.CoreServices[$serviceName]
    Write-Host "Service details: $($service | Out-String)"
    Start-TestService -Service $service -ServiceName $serviceName
}

Write-Host "Test completed. Running processes: $($RunningProcesses.Count)"
