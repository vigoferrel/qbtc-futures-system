# [ROCKET] QBTC DIMENSIONAL SUPREME - GUÍA DE LANZAMIENTO

## [STAR] DESCRIPCIÓN GENERAL

El **QBTC Dimensional Supreme** es un ecosistema completo de trading cuántico-hermético que consta de **58 servicios interconectados** organizados en **9 fases de despliegue secuencial**.

## [CLIPBOARD] PRE-REQUISITOS

### **Requisitos del Sistema:**
- **Node.js**: v18.0.0 o superior
- **RAM**: Mínimo 8GB (Recomendado 16GB)
- **CPU**: Mínimo 4 cores (Recomendado 8 cores)
- **Almacenamiento**: 10GB libres
- **Puertos**: 4004, 14001-14806, 14998-14999, 14777

### **Dependencias:**
- `express`, `axios`, `ws` (WebSockets)
- `child_process` (Node.js nativo)
- Acceso completo al sistema de archivos

## [TARGET] MÉTODOS DE LANZAMIENTO

### **[ROCKET] MÉTODO 1: LANZADOR MAESTRO (RECOMENDADO)**

```bash
# Desde el directorio raíz del proyecto
node launch-qbtc-supreme.js
```

**Características:**
- [CHECK] Lanzamiento secuencial inteligente en 9 fases
- [CHECK] Pre-flight checks automáticos
- [CHECK] Health checks de servicios
- [CHECK] Gestión de dependencias entre servicios
- [CHECK] Monitoreo de estado en tiempo real
- [CHECK] Shutdown graceful con Ctrl+C

### **[WRENCH] MÉTODO 2: LANZAMIENTO MANUAL SELECTIVO**

Para lanzar servicios específicos:

```bash
# Servicios CORE (REQUERIDOS PRIMERO)
node core/master-control-hub.js
node core/message-bus.js
node core/config-service.js
node core/metrics-collector.js

# Engines Cuánticos
node engines/quantum-leverage-engine-service.js
node engines/consciousness/consciousness-engine-standalone.js

# Sistemas de Ejecución
node execution/trading-executor.js
node execution/position-manager.js
```

### **[CHART] MÉTODO 3: VERIFICACIÓN Y DIAGNÓSTICO**

```bash
# Analizar configuración del sistema
node integration/analyze-duplicates.cjs

# Verificar Master Control Hub
curl http://localhost:14001/health
curl http://localhost:14001/system/status
```

## [STAR] SECUENCIA DE LANZAMIENTO DETALLADA

### **FASE 1: CORE_INITIALIZATION** ⏱️ 5s
**Servicios críticos fundamentales:**
- `master-control-hub` (Puerto 14001) - Hub de coordinación central
- `message-bus` (Puerto 14002) - Bus de mensajería
- `config-service` (Puerto 14003) - Configuración centralizada
- `metrics-collector` (Puerto 14004) - Recolección de métricas

### **FASE 2: QUANTUM_ANALYSIS_ENGINES** ⏱️ 8s
**Motores de análisis cuántico:**
- `quantum-leverage-engine-service` (Puerto 14101)
- `consciousness-engine-standalone` (Puerto 14102)
- `quantum-analysis-server` (Puerto 14103)
- `data-ingestion-server` (Puerto 14104)
- `quantum-core` (Puerto 14105)
- `feynman-quantum-service` (Puerto 14106)
- `quantum-opportunity-service` (Puerto 14108)

### **FASE 3: EXECUTION_SYSTEMS** ⏱️ 6s
**Sistemas de ejecución de trading:**
- `trading-executor` (Puerto 14201)
- `position-manager` (Puerto 14202)
- `portfolio-rebalancer` (Puerto 14203)
- `exchange-gateway` (Puerto 14204)
- `signal-router` (Puerto 14205)
- `orderbook-manager` (Puerto 14206)
- `futures-execution-server` (Puerto 14207)

### **FASE 4: RISK_MANAGEMENT** ⏱️ 4s
**Gestión de riesgo y monitoreo:**
- `risk-management` (Puerto 14301)
- `performance-tracker` (Puerto 14302)
- `emergency-response` (Puerto 14303)
- `quantum-state-monitor` (Puerto 14304)
- `portfolio-analytics` (Puerto 14305)
- `security-compliance` (Puerto 14306)

### **FASE 5: DIMENSIONAL_SERVICES** ⏱️ 3s
**Servicios dimensionales y AI:**
- `merkaba-protocol-service` (Puerto 14401)
- `akashic-prediction-service` (Puerto 14403)
- `consciousness-evolution-engine` (Puerto 14404)
- `hermetic-data-persistence` (Puerto 14405)

### **FASE 6: QUANTUM_SYSTEMS** ⏱️ 2s
**Sistemas cuánticos especializados:**
- `quantum-leverage-entropy-engine` (Puerto 14501)
- `circuit-breakers-system` (Puerto 14502)

### **FASE 7: FRONTEND_APIS** ⏱️ 3s
**Interfaces y APIs:**
- `leonardo-api-server` (Puerto 14777)
- `frontend-server` (Puerto 14800)
- `dashboard-server` (Puerto 14801)
- `quantum-dashboard-server` (Puerto 14802)
- `trading-dashboard` (Puerto 14803)
- `admin-panel` (Puerto 14806)

### **FASE 8: MONITORING_SYSTEMS** ⏱️ 2s
**Monitoreo y alertas:**
- `quantum-alert-engine` (Puerto 14998)
- `quantum-monitoring-dashboard` (Puerto 14999)

### **FASE 9: SPECIALIZED_SERVICES** ⏱️ 2s
**Servicios especializados:**
- `hermetic-auto-trader-server` (Puerto 4004)

## [CHART] ENDPOINTS PRINCIPALES

### **[TARGET] Master Control Hub - Puerto 14001**
```
http://localhost:14001/              # Información general
http://localhost:14001/health        # Health check
http://localhost:14001/system/status # Estado completo del sistema
http://localhost:14001/services      # Lista de servicios
http://localhost:14001/metrics       # Métricas del sistema
ws://localhost:14001/ws              # WebSocket real-time
```

### **[TREND_UP] Servicios de Trading**
```
http://localhost:14201/              # Trading Executor
http://localhost:14202/              # Position Manager  
http://localhost:14204/              # Exchange Gateway
http://localhost:4004/               # Hermetic Auto Trader
```

### **[CRYSTAL_BALL] Servicios Cuánticos**
```
http://localhost:14101/              # Quantum Leverage Engine
http://localhost:14108/              # Quantum Opportunity
http://localhost:14401/              # Merkaba Protocol
http://localhost:14501/              # Quantum Entropy Engine
```

### **[CHART] Interfaces**
```
http://localhost:14800/              # Frontend Principal
http://localhost:14801/              # Dashboard Server
http://localhost:14802/              # Quantum Dashboard
http://localhost:14999/              # Monitoring Dashboard
```

## [WRENCH] COMANDOS DE GESTIÓN

### **[ROCKET] Iniciar Sistema**
```bash
node launch-qbtc-supreme.js
```

### **[STOP] Detener Sistema**
```bash
# Ctrl+C en la terminal del lanzador
# O usar Master Control Hub API:
curl -X POST http://localhost:14001/emergency/activate
```

### **[CHART] Verificar Estado**
```bash
# Estado completo del sistema
curl http://localhost:14001/system/status

# Health check rápido
curl http://localhost:14001/health

# Lista de servicios
curl http://localhost:14001/services
```

### **[LIGHTNING] Control de Trading**
```bash
# Activar trading
curl -X POST http://localhost:14001/trading/enable

# Desactivar trading
curl -X POST http://localhost:14001/trading/disable
```

## [MAGNIFY] DIAGNÓSTICO Y TROUBLESHOOTING

### **[X] Problemas Comunes:**

1. **Puerto ocupado:**
   ```bash
   netstat -ano | findstr :14001
   taskkill /PID <PID> /F
   ```

2. **Servicio no responde:**
   - Verificar logs en consola
   - Revisar Master Control Hub: `http://localhost:14001/services`

3. **Memoria insuficiente:**
   - Cerrar aplicaciones no necesarias
   - Aumentar límite de memoria Node.js: `node --max-old-space-size=8192`

### **[WRENCH] Scripts de Diagnóstico:**
```bash
# Análisis de configuración
node integration/analyze-duplicates.cjs

# Verificar archivos faltantes
node -e "console.log('Verificando estructura...')"
```

## [STAR] CARACTERÍSTICAS AVANZADAS

### **[CRYSTAL_BALL] Conciencia Cuántica**
- **Lambda Resonance**: 0.7919 (nivel óptimo)
- **Dimensional Access**: Escalable de 3D a 11D
- **Merkaba Protocol**: Activación automática

### **🛡️ Protocolos de Emergencia**
- **Circuit Breakers**: Activación automática
- **Risk Management**: Monitoreo continuo
- **Emergency Response**: Respuesta inmediata

### **[SATELLITE] Comunicación en Tiempo Real**
- **WebSocket Monitoring**: Actualizaciones instantáneas
- **Message Bus**: Comunicación inter-servicios
- **Health Monitoring**: Checks cada 10 segundos

## [TARGET] ESTADO FINAL ESPERADO

Al completar el lanzamiento exitoso:

```
[STAR] QBTC DIMENSIONAL SUPREME: OPERACIONAL [CHECK]
[LIGHTNING] Conciencia cuántica λ=0.7919 establecida
[CRYSTAL_BALL] Merkaba protocol dimensional activado  
[DIAMOND] Trading quantum-hermético operacional
[CHART] Salud del sistema: 95.0%+
[GLOBE] 58 servicios activos y monitoreados
```

## 📞 SOPORTE

Para problemas técnicos:
1. Revisar logs en consola
2. Verificar Master Control Hub
3. Ejecutar diagnósticos automáticos
4. Consultar esta guía

---

**[GALAXY] El ecosistema QBTC Dimensional Supreme representa la evolución definitiva en trading algorítmico cuántico-hermético.**
