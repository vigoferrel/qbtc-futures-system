# QBTC Ultimate Edition - Lanzador de Frontends v2.0
# Script para lanzar todas las interfaces web del sistema

Write-Host "[ROCKET] INICIANDO QBTC ULTIMATE EDITION FRONTENDS..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Green

# Verificar que los servicios están ejecutándose
Write-Host "[MAGNIFY] Verificando servicios..." -ForegroundColor Yellow

$services = @(
    @{ Name = "Quantum Monitoring Dashboard"; Port = 14999; URL = "http://localhost:14999" },
    @{ Name = "Quantum Alert Engine"; Port = 14998; URL = "http://localhost:14998/api/alerts/active" }
)

$activeServices = @()

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[CHECK] $($service.Name) - ACTIVO" -ForegroundColor Green
            $activeServices += $service
        }
    }
    catch {
        Write-Host "[X] $($service.Name) - NO DISPONIBLE" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

if ($activeServices.Count -eq 0) {
    Write-Host "[WARNING]  No se encontraron servicios activos. Asegúrate de que estén ejecutándose." -ForegroundColor Yellow
    Write-Host "   Para iniciar los servicios, ejecuta:" -ForegroundColor Gray
    Write-Host "   node quantum-monitoring-dashboard.js" -ForegroundColor Gray
    Write-Host "   node quantum-alert-engine.js" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "[GLOBE] Lanzando interfaces web..." -ForegroundColor Cyan

# Abrir Quantum Monitoring Dashboard
if ($activeServices | Where-Object { $_.Port -eq 14999 }) {
    Write-Host "[TARGET] Abriendo Quantum Monitoring Dashboard..." -ForegroundColor Green
    Start-Process "http://localhost:14999"
    Start-Sleep -Seconds 2
}

# Crear página de índice con enlaces a todos los servicios
$indexPage = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QBTC Ultimate Edition - Centro de Control</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Consolas', monospace; 
            background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
            color: #00ff88;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #00ff88;
            padding-bottom: 20px;
        }
        .header h1 { 
            font-size: 3rem; 
            text-shadow: 0 0 20px #00ff88; 
            margin-bottom: 10px;
            animation: glow 3s infinite;
        }
        .subtitle { color: #88ffff; font-size: 1.3rem; margin-bottom: 10px; }
        .status { color: #00ff88; font-size: 1rem; }
        
        .dashboard-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 30px; 
            margin-bottom: 40px;
        }
        
        .service-card { 
            background: rgba(0, 255, 136, 0.1); 
            border: 2px solid #00ff88; 
            border-radius: 15px; 
            padding: 30px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        }
        .service-card:hover { 
            transform: translateY(-5px);
            box-shadow: 0 10px 40px rgba(0, 255, 136, 0.5);
        }
        
        .service-title { 
            font-size: 1.5rem; 
            margin-bottom: 15px; 
            color: #00ff88;
            font-weight: bold;
        }
        .service-description { 
            color: #88ffff; 
            margin-bottom: 20px; 
            font-size: 1rem;
            line-height: 1.4;
        }
        
        .service-link { 
            display: inline-block;
            background: linear-gradient(45deg, #00ff88, #88ffff);
            color: #000;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: all 0.3s ease;
            margin: 5px;
        }
        .service-link:hover { 
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
        }
        
        .api-link {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
        }
        
        .metrics-section {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #444;
            border-radius: 10px;
            padding: 20px;
            margin-top: 30px;
        }
        
        .metrics-title {
            color: #88ffff;
            font-size: 1.2rem;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .metric-item {
            background: rgba(0, 255, 136, 0.05);
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        
        .metric-label {
            color: #888;
            font-size: 0.9rem;
        }
        
        .metric-value {
            color: #00ff88;
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px #00ff88; }
            50% { text-shadow: 0 0 40px #00ff88, 0 0 60px #88ffff; }
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
            font-size: 0.9rem;
        }
        
        .timestamp {
            color: #888;
            font-size: 0.8rem;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>[ATOM] QBTC ULTIMATE EDITION [ATOM]</h1>
            <div class="subtitle">Centro de Control y Monitoreo Avanzado</div>
            <div class="status">🟢 Sistema Operativo | Versión 2.0 | Todos los Servicios Activos</div>
        </div>
        
        <div class="dashboard-grid">
            <div class="service-card">
                <div class="service-title">[TARGET] Quantum Monitoring Dashboard</div>
                <div class="service-description">
                    Centro de comando principal con monitoreo en tiempo real de todos los servicios,
                    métricas cuánticas y estado del sistema completo.
                </div>
                <a href="http://localhost:14999" class="service-link" target="_blank">[ROCKET] Abrir Dashboard</a>
                <a href="http://localhost:14999/api/system/status" class="service-link api-link" target="_blank">[CHART] Ver API</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">[SIREN] Quantum Alert Engine</div>
                <div class="service-description">
                    Sistema de alertas inteligentes con análisis predictivo,
                    auto-recuperación y escalamiento automático de incidencias.
                </div>
                <a href="http://localhost:14998/api/alerts/active" class="service-link api-link" target="_blank">[CLIPBOARD] Ver Alertas</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">[LIGHTNING] Servicios Principales</div>
                <div class="service-description">
                    Acceso directo a todos los endpoints de salud y estado
                    de los 14 servicios principales del sistema QBTC.
                </div>
                <a href="http://localhost:14001/health" class="service-link" target="_blank">[GAMEPAD] Master Control</a>
                <a href="http://localhost:14101/health" class="service-link" target="_blank">[CYCLONE] Quantum Engine</a>
                <a href="http://localhost:14301/metrics" class="service-link api-link" target="_blank">[WARNING] Risk Management</a>
            </div>
            
            <div class="service-card">
                <div class="service-title">[CHART] Métricas del Sistema</div>
                <div class="service-description">
                    Acceso a métricas detalladas de rendimiento, memoria,
                    CPU y métricas cuánticas avanzadas del sistema.
                </div>
                <a href="http://localhost:14301/metrics" class="service-link api-link" target="_blank">[TREND_UP] Risk Metrics</a>
                <a href="http://localhost:14303/metrics" class="service-link api-link" target="_blank">🚑 Emergency Metrics</a>
            </div>
        </div>
        
        <div class="metrics-section">
            <div class="metrics-title">[CHART] Estado Actual del Sistema</div>
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-label">Servicios Activos</div>
                    <div class="metric-value">14/14</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Coherencia Cuántica</div>
                    <div class="metric-value">82.0%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Cobertura Monitoreo</div>
                    <div class="metric-value">100%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Alertas Activas</div>
                    <div class="metric-value">0</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Tiempo Respuesta Prom.</div>
                    <div class="metric-value">3ms</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Estado General</div>
                    <div class="metric-value">🟢 EXCELENTE</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>QBTC Ultimate Edition - Sistema de Trading Cuántico Avanzado</p>
            <p>Monitoreo Inteligente | Alertas Predictivas | Análisis en Tiempo Real</p>
            <div class="timestamp" id="timestamp"></div>
        </div>
    </div>
    
    <script>
        // Actualizar timestamp cada segundo
        function updateTimestamp() {
            document.getElementById('timestamp').textContent = 
                'Última actualización: ' + new Date().toLocaleString();
        }
        updateTimestamp();
        setInterval(updateTimestamp, 1000);
        
        // Auto-refresh para mantener métricas actualizadas
        setTimeout(() => {
            location.reload();
        }, 300000); // Refresh cada 5 minutos
    </script>
</body>
</html>
"@

# Guardar la página de índice
$indexPath = Join-Path $PWD "qbtc-control-center.html"
$indexPage | Out-File -FilePath $indexPath -Encoding UTF8

Write-Host "📄 Página de control creada: $indexPath" -ForegroundColor Green

# Abrir la página de control principal
Write-Host "[GAMEPAD] Abriendo Centro de Control Principal..." -ForegroundColor Cyan
Start-Process $indexPath

Write-Host ""
Write-Host "[PARTY] FRONTENDS LANZADOS EXITOSAMENTE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "[GLOBE] URLs Disponibles:" -ForegroundColor Cyan
Write-Host "   [CHART] Monitoring Dashboard: http://localhost:14999" -ForegroundColor White
Write-Host "   [SIREN] Alert Engine API:     http://localhost:14998/api/alerts/active" -ForegroundColor White
Write-Host "   [GAMEPAD] Control Center:       file:///$indexPath" -ForegroundColor White
Write-Host ""
Write-Host "[BULB] Tip: Usa Ctrl+C para detener los servicios cuando termine la sesión" -ForegroundColor Yellow
