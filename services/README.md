# [ROCKET] QBTC Futures System - Servicios HTTP

Este directorio contiene todos los servicios HTTP que exponen los motores principales del sistema QBTC Futures como APIs REST y WebSocket.

## [CLIPBOARD] Servicios Disponibles

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| 14101 | [MONITOR] Unified System Monitor | Monitor unificado de todo el sistema |
| 14102 | [MOON] Temporal Cycles Engine | Motor de análisis de ciclos temporales y fases lunares |
| 14103 | [DIAMOND] Multidimensional Weighting Engine | Motor de ponderación multidimensional adaptativa |
| 14104 | [TARGET] Tier Strategy Generator | Generador de estrategias por tiers |
| 14105 | [REFRESH] Consolidated Opportunities API | API consolidada de oportunidades de trading |

## 🛠️ Instalación

```bash
# Navegar al directorio de servicios
cd services/

# Instalar dependencias
npm install
```

## [ROCKET] Inicio Rápido

### Iniciar Todos los Servicios

```bash
# Método 1: Script NPM
npm start

# Método 2: Node directo
node start-all-services.js
```

### Iniciar Servicios Específicos

```bash
# Solo motores principales (sin monitor)
npm run start:engines

# Solo servicios core (temporal, weighting, strategy)
npm run start:core

# Solo la API consolidada
npm run start:api

# Servicio individual
npm run start:temporal
npm run start:weighting
npm run start:strategy
npm run start:opportunities
```

### Opciones de Configuración

```bash
# Excluir servicios específicos
node start-all-services.js --exclude=14101,14102

# Solo servicios específicos
node start-all-services.js --only=14103,14104,14105

# Retraso personalizado entre inicios
node start-all-services.js --delay=3000

# Modo verbose (mostrar logs detallados)
node start-all-services.js --verbose

# Modo producción (sin monitor)
npm run start:prod
```

## [HOSPITAL] Monitoreo y Health Checks

### Health Check Básico

```bash
# Verificar todos los servicios
npm run health

# Health check detallado
node health-check.js --detailed

# Solo servicios con problemas
node health-check.js --alert

# Servicio específico
node health-check.js --port=14102
```

### Monitoreo Continuo

```bash
# Monitoreo cada 5 segundos
node health-check.js --continuous

# Intervalo personalizado
node health-check.js --continuous --interval=10000

# Formato JSON
node health-check.js --json
```

## [SATELLITE] APIs Disponibles

### [MOON] Temporal Cycles Engine (Puerto 14102)

```bash
# Health check
GET http://localhost:14102/health

# Estado del motor
GET http://localhost:14102/status

# Fase lunar actual
GET http://localhost:14102/api/lunar-phase

# Análisis de ciclos
GET http://localhost:14102/api/cycle-analysis

# Análisis temporal para símbolo
GET http://localhost:14102/api/temporal-analysis/BTCUSDT

# Predicciones
GET http://localhost:14102/api/predictions?timeframe=24h

# WebSocket
ws://localhost:14102/ws
```

### [DIAMOND] Multidimensional Weighting Engine (Puerto 14103)

```bash
# Health check
GET http://localhost:14103/health

# Pesos actuales
GET http://localhost:14103/api/weights

# Métricas dimensionales
GET http://localhost:14103/api/dimensional-metrics

# Análisis sectorial
GET http://localhost:14103/api/sector-analysis

# Pesos para aplicación específica
POST http://localhost:14103/api/weights-for-app
Content-Type: application/json
{
  "application": "RANKING",
  "context": {"symbol_tier": "TIER1"}
}

# WebSocket
ws://localhost:14103/ws
```

### [TARGET] Tier Strategy Generator (Puerto 14104)

```bash
# Health check
GET http://localhost:14104/health

# Todas las estrategias
GET http://localhost:14104/api/strategies

# Estrategias por tier
GET http://localhost:14104/api/strategies/tier/TIER1

# Performance por tiers
GET http://localhost:14104/api/tier-performance

# Generar nueva estrategia
POST http://localhost:14104/api/generate-strategy
Content-Type: application/json
{
  "symbol": "BTCUSDT",
  "tier": "TIER1",
  "strategy_type": "ADAPTIVE"
}

# WebSocket
ws://localhost:14104/ws
```

### [REFRESH] Consolidated Opportunities API (Puerto 14105)

```bash
# Health check
GET http://localhost:14105/health

# Todas las oportunidades
GET http://localhost:14105/api/opportunities

# Oportunidades por tier
GET http://localhost:14105/api/opportunities/tier/TIER1

# Vista general del mercado
GET http://localhost:14105/api/market-overview

# Métricas de performance
GET http://localhost:14105/api/performance-metrics

# Análisis de riesgo
GET http://localhost:14105/api/risk-analysis

# Filtros avanzados
POST http://localhost:14105/api/opportunities/filter
Content-Type: application/json
{
  "advanced_filters": {
    "min_confidence": 0.8,
    "priority": "HIGH"
  }
}

# WebSocket
ws://localhost:14105/ws
```

## 🔌 Conexión WebSocket

Todos los servicios soportan WebSocket para actualizaciones en tiempo real:

```javascript
// Ejemplo de conexión WebSocket
const ws = new WebSocket('ws://localhost:14102/ws');

ws.on('open', () => {
    console.log('Conectado al Temporal Cycles Engine');
    
    // Solicitar estado actual
    ws.send(JSON.stringify({
        type: 'get_status'
    }));
});

ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Recibido:', message);
});

// Ping para mantener conexión
setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);
```

## [WRENCH] Scripts de Utilidad

### Gestión de Servicios

```bash
# Detener todos los servicios
npm run stop

# Reiniciar servicios
npm run restart

# Ver logs (requiere configuración de logs)
npm run logs
```

### Testing y Validación

```bash
# Test de servicios
npm run test:services

# Validar sistema completo
npm run validate
```

## [CHART] Configuración de Entorno

### Variables de Entorno

```bash
# .env
NODE_ENV=development
LOG_LEVEL=info
SERVICE_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000

# Configuración específica por servicio
TEMPORAL_CYCLES_PORT=14102
MULTIDIMENSIONAL_WEIGHTING_PORT=14103
TIER_STRATEGY_PORT=14104
CONSOLIDATED_OPPORTUNITIES_PORT=14105
```

### Configuración de Desarrollo

```bash
# Iniciar en modo desarrollo con logs detallados
npm run start:dev

# Monitoreo continuo durante desarrollo
node health-check.js --continuous --detailed
```

## 🐳 Docker Support (Opcional)

Si usas Docker, puedes crear un docker-compose.yml:

```yaml
version: '3.8'
services:
  temporal-cycles:
    build: .
    command: node temporal-cycles-service.js
    ports:
      - "14102:14102"
    
  multidimensional-weighting:
    build: .
    command: node multidimensional-weighting-service.js
    ports:
      - "14103:14103"
    
  tier-strategy:
    build: .
    command: node tier-strategy-service.js
    ports:
      - "14104:14104"
    
  consolidated-opportunities:
    build: .
    command: node consolidated-opportunities-service.js
    ports:
      - "14105:14105"
```

## [SIREN] Troubleshooting

### Problemas Comunes

1. **Puerto en uso**
   ```bash
   # Verificar qué proceso usa el puerto
   lsof -i :14102
   # o en Windows:
   netstat -ano | findstr :14102
   ```

2. **Servicio no responde**
   ```bash
   # Health check específico
   node health-check.js --port=14102 --timeout=10000
   ```

3. **Memoria insuficiente**
   ```bash
   # Iniciar con más memoria
   node --max-old-space-size=4096 start-all-services.js
   ```

### Logs y Debugging

```bash
# Modo verbose para debugging
node start-all-services.js --verbose

# Health check con detalles completos
node health-check.js --detailed --continuous
```

## [TREND_UP] Performance y Escalabilidad

### Recomendaciones

1. **Producción**: Usar PM2 o similar para gestión de procesos
2. **Load Balancing**: Nginx o HAProxy para múltiples instancias
3. **Monitoreo**: Integrar con Prometheus/Grafana
4. **Caching**: Redis para cachear respuestas frecuentes

### Clustering (Avanzado)

```javascript
// cluster.js - Ejemplo para clustering
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // Iniciar servicios en worker
    import('./start-all-services.js');
}
```

## 🔐 Seguridad

### Recomendaciones Básicas

1. Usar HTTPS en producción
2. Implementar rate limiting
3. Validar todas las entradas
4. Configurar CORS apropiadamente
5. Usar authentication tokens

### Ejemplo de Middleware de Seguridad

```javascript
import rateLimit from 'express-rate-limit';

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## [MEMO] Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico:
- Crear issue en GitHub
- Revisar logs con `npm run logs`
- Ejecutar health check: `npm run health`

---

**¡Sistema QBTC Futures listo para trading inteligente! [ROCKET][DIAMOND][TREND_UP]**
