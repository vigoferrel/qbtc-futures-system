# [GALAXY] QBTC Quantum Futures System - Guía de Lanzadores

## [CLIPBOARD] Descripción General

El sistema QBTC incluye múltiples scripts de lanzamiento para gestionar de manera orquestada y eficiente todos los componentes del sistema cuántico de trading:

- **Mass Intelligence Scanner** - Ranking cuántico en tiempo real
- **Web Dashboard Monitor** - Panel de control con interfaz HTML avanzada
- **Trading Engine** - Motor de trading con estrategias herméticas
- **System Monitor** - Monitoreo del estado del sistema

## [ROCKET] Scripts Disponibles

### 1. [CONTROL_KNOBS] **qbtc-launcher.ps1** - Orquestador Principal

El script más completo y avanzado para gestión total del sistema.

```powershell
# Modo interactivo (menú)
.\qbtc-launcher.ps1

# Iniciar sistema completo
.\qbtc-launcher.ps1 -Mode full

# Iniciar solo scanner
.\qbtc-launcher.ps1 -Mode scanner

# Iniciar solo monitor web
.\qbtc-launcher.ps1 -Mode web

# Iniciar solo trading
.\qbtc-launcher.ps1 -Mode trading

# Ver estado del sistema
.\qbtc-launcher.ps1 -Mode status

# Detener todo el sistema
.\qbtc-launcher.ps1 -Mode stop

# Con logs en tiempo real
.\qbtc-launcher.ps1 -Mode full -ShowLogs

# Modo silencioso (sin interacción)
.\qbtc-launcher.ps1 -Mode full -Silent

# Reiniciar procesos existentes
.\qbtc-launcher.ps1 -Mode full -Restart

# Puerto personalizado para web monitor
.\qbtc-launcher.ps1 -Mode web -WebPort 3002

# Configuración de trading específica
.\qbtc-launcher.ps1 -Mode trading -TradingConfig aggressive
```

#### Características del Orquestador:
- [CHECK] **Gestión de dependencias** entre procesos
- [CHECK] **Health checks** automáticos
- [CHECK] **Reintentos** automáticos en caso de fallo
- [CHECK] **Logging** avanzado con colores
- [CHECK] **Estado en tiempo real** con tabla detallada
- [CHECK] **Menú interactivo** para control manual
- [CHECK] **Detección automática** de procesos QBTC

### 2. [LIGHTNING] **start-qbtc.ps1** - Lanzador Rápido

Script simplificado para inicio rápido del sistema básico.

```powershell
# Inicio básico
.\start-qbtc.ps1

# Con puerto personalizado
.\start-qbtc.ps1 -WebPort 3002

# Con logs en tiempo real
.\start-qbtc.ps1 -ShowLogs

# Reiniciar procesos existentes
.\start-qbtc.ps1 -RestartExisting
```

#### Características del Quick Start:
- [LIGHTNING] **Inicio rápido** sin menús complejos
- [CHECK] **Verificación** de entorno Node.js
- [CHECK] **Resumen** claro de procesos iniciados/fallados
- [CHECK] **Logs opcionales** en tiempo real

## [TARGET] Casos de Uso Recomendados

### 🏁 Primera vez / Desarrollo
```powershell
# Usar el orquestador completo con menú interactivo
.\qbtc-launcher.ps1
```

### [LIGHTNING] Uso diario / Producción
```powershell
# Inicio rápido y directo
.\start-qbtc.ps1

# O sistema completo silencioso
.\qbtc-launcher.ps1 -Mode full -Silent
```

### [WRENCH] Desarrollo / Testing
```powershell
# Solo el scanner para pruebas
.\qbtc-launcher.ps1 -Mode scanner

# Solo el monitor web
.\qbtc-launcher.ps1 -Mode web -WebPort 3002
```

### [CHART] Monitoreo
```powershell
# Ver estado detallado
.\qbtc-launcher.ps1 -Mode status

# Logs en tiempo real
.\qbtc-launcher.ps1 -ShowLogs
```

### [REFRESH] Mantenimiento
```powershell
# Reiniciar sistema completo
.\qbtc-launcher.ps1 -Mode full -Restart

# Detener todo
.\qbtc-launcher.ps1 -Mode stop
```

## 📁 Estructura de Archivos

```
qbtc-futures-system/
├── 📜 qbtc-launcher.ps1        # Orquestador principal
├── [LIGHTNING] start-qbtc.ps1           # Lanzador rápido
├── [CHART] qbtc-mass-scanner.js     # Scanner inteligencia masiva
├── [GLOBE] qbtc-web-monitor.js      # Monitor web dashboard
├── [CHART_TREND] qbtc-trading-engine.js   # Motor de trading (futuro)
├── [WRENCH] qbtc-system-monitor.js   # Monitor de sistema (futuro)
├── 📁 logs/                    # Directorio de logs
└── 📁 config/                  # Configuraciones
```

## [PALETTE] Colores y Símbolos del Sistema

| Elemento | Color | Símbolo | Significado |
|----------|-------|---------|-------------|
| Header | Cyan | [GALAXY] | Títulos y cabeceras |
| Success | Green | [CHECK] | Operaciones exitosas |
| Warning | Yellow | [WARNING] | Advertencias |
| Error | Red | [X] | Errores críticos |
| Info | Blue | ℹ️ | Información general |
| Process | Magenta | [WRENCH] | Gestión de procesos |
| Quantum | DarkCyan | [CYCLONE] | Operaciones cuánticas |

## [MAGNIFY] Resolución de Problemas

### [X] "Node.js no encontrado"
```powershell
# Instalar Node.js desde https://nodejs.org
# Verificar instalación:
node --version
```

### [X] "Scripts faltantes"
```powershell
# Verificar que todos los archivos .js estén presentes
Get-ChildItem -Filter "qbtc-*.js"
```

### [X] "Puerto en uso"
```powershell
# Cambiar puerto del monitor web
.\qbtc-launcher.ps1 -Mode web -WebPort 3002
```

### [X] "Proceso no responde"
```powershell
# Forzar reinicio
.\qbtc-launcher.ps1 -Mode full -Restart

# O detener manualmente
Get-Process -Name "node" | Where-Object { $_.MainWindowTitle -like "*QBTC*" } | Stop-Process -Force
```

## [CHART] Estado de Salud del Sistema

El orquestador muestra una tabla detallada con:

- 🟢 **RUNNING** - Proceso ejecutándose correctamente
- 🔴 **STOPPED*** - Proceso crítico detenido (requiere atención)  
- 🟡 **STOPPED** - Proceso no crítico detenido
- 💚 **SALUDABLE** - Sistema operando correctamente
- 💔 **REQUIERE ATENCIÓN** - Algún componente crítico falló

## [GLOBE] Acceso al Dashboard

Una vez iniciado el monitor web:
- **URL:** http://localhost:3001 (o puerto personalizado)
- **Características:**
  - [CHART] Ranking cuántico en tiempo real
  - [TARGET] Estrategias herméticas de entrada/salida
  - [TREND_UP] Gráficos interactivos
  - [GALAXY] Métricas cuánticas avanzadas
  - [DIAMOND] Análisis de valoración multidimensional

## [CRYSTAL_BALL] Principios Herméticos Implementados

El sistema incorpora principios herméticos avanzados:

- **"Como es arriba, es abajo"** - Los tokens más castigados tienen mayor potencial
- **Máximo Castigo = Máxima Oportunidad** - Entrar en agotamiento
- **Apogeo = Momento de Venta** - Salir en picos de volatilidad
- **Leverage Hermético** - Dinámico según nivel de castigo/oportunidad

## [MEMO] Logs y Debugging

Los logs se almacenan en `./logs/`:
- `qbtc-orchestrator.log` - Log principal del orquestador
- `Scanner.log` - Log del scanner de inteligencia
- `WebMonitor.log` - Log del monitor web
- `TradingEngine.log` - Log del motor de trading

```powershell
# Ver logs en tiempo real
Get-Content -Path ".\logs\qbtc-orchestrator.log" -Tail 20 -Wait
```

## [ROCKET] Inicio Automático (Opcional)

Para configurar inicio automático del sistema:

```powershell
# Crear tarea programada (ejecutar como administrador)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\ruta\al\start-qbtc.ps1 -Silent"
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "QBTC-AutoStart" -Action $action -Trigger $trigger -Settings $settings
```

## [GALAXY] Soporte y Contribuciones

Para reportar problemas o sugerir mejoras:
1. Revisar logs detallados
2. Usar `.\qbtc-launcher.ps1 -Mode status` para diagnóstico
3. Incluir información del entorno (Node.js version, PowerShell version)

---

**[STAR] ¡Disfruta operando con el sistema cuántico QBTC más avanzado!** [STAR]
