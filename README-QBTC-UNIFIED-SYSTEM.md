# 🚀 QBTC UNIFIED SYSTEM
## Sistema Unificado de Coordinación IP - VPN + Proxy + Monitoreo

### 📋 Descripción General

El **QBTC Unified System** es una plataforma integral que combina múltiples tecnologías para garantizar una conexión segura y coordinada con las APIs de trading de Binance. El sistema integra:

- 🔗 **VPN Automática** para cambio de IP seguro
- 🌐 **Proxy Seguro** con autenticación JWT
- 🎛️ **Coordinador IP** con failover automático
- 📊 **Dashboard de Monitoreo** en tiempo real
- 🔄 **Sistema de Backup** y recuperación

### 🎯 Características Principales

#### 🔐 Seguridad Avanzada
- Autenticación JWT en todos los endpoints
- Rate limiting inteligente
- Encriptación de datos sensibles
- Validación de IPs en tiempo real

#### 🔄 Failover Automático
- Detección automática de fallos
- Cambio automático entre VPN y Proxy
- Recuperación automática de conexiones
- Logging detallado de eventos

#### 📊 Monitoreo en Tiempo Real
- Dashboard web interactivo
- WebSocket para actualizaciones live
- Métricas detalladas del sistema
- Alertas automáticas

#### 🎛️ Coordinación Inteligente
- Verificación automática de IP objetivo
- Múltiples estrategias de conexión
- Optimización automática de rutas
- Balanceo de carga inteligente

### 🏗️ Arquitectura del Sistema

```
[QBTC Unified Launcher]
    ├── 🔗 VPN Connector
    │   ├── OpenVPN Integration
    │   ├── Auto-reconnection
    │   └── IP Verification
    │
    ├── 🌐 Secure Proxy Server
    │   ├── JWT Authentication
    │   ├── Rate Limiting
    │   └── Request Forwarding
    │
    ├── 🎛️ IP Coordinator
    │   ├── Failover Management
    │   ├── Mode Switching
    │   └── Health Monitoring
    │
    └── 📊 Monitoring Dashboard
        ├── Real-time Updates
        ├── System Metrics
        └── Control Interface
```

### 🚀 Inicio Rápido

#### Prerrequisitos
- Node.js 18+
- OpenVPN instalado
- Archivos de configuración VPN (ver sección de configuración)

#### Instalación
```bash
# Clonar o descargar los archivos del sistema
# Asegurarse de que todos los archivos .js estén en el mismo directorio

# Instalar dependencias si es necesario
npm install jsonwebtoken express express-rate-limit socket.io
```

#### Configuración Inicial
```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 2. Configurar VPN (si usas VPN)
# Copiar archivos de configuración a QBTC-UNIFIED/
# - qbtc-openvpn-config.ovpn
# - qbtc-credentials.txt

# 3. Verificar configuración
node qbtc-unified-launcher.js status
```

#### Inicio del Sistema
```bash
# Opción 1: Inicio completo automático
node qbtc-unified-launcher.js start

# Opción 2: Inicio con componentes específicos
node qbtc-unified-launcher.js start --no-vpn  # Sin VPN
node qbtc-unified-launcher.js start --test    # Modo prueba
```

### 📊 Acceso a Interfaces

Una vez iniciado el sistema, tendrás acceso a:

- **🌐 Proxy Seguro**: `http://localhost:8443`
- **📊 Dashboard**: `http://localhost:8080`
- **🎛️ API Coordinator**: `http://localhost:3000` (si habilitado)

### 🔧 Configuración Detallada

#### Variables de Entorno (.env)
```bash
# API Keys de Binance
BINANCE_API_KEY=your_api_key_here
BINANCE_SECRET_KEY=your_secret_key_here
USE_TESTNET=false

# Configuración del Sistema
JWT_SECRET=your_jwt_secret_here
ADMIN_PASSWORD=your_admin_password
PROXY_PORT=8443
DASHBOARD_PORT=8080

# Configuración VPN
TARGET_IP=181.43.212.196
VPN_CONFIG_PATH=../QBTC-UNIFIED/qbtc-openvpn-config.ovpn
VPN_CREDENTIALS_PATH=../QBTC-UNIFIED/qbtc-credentials.txt
```

#### Archivos de Configuración VPN
```
QBTC-UNIFIED/
├── qbtc-openvpn-config.ovpn    # Configuración OpenVPN
├── qbtc-credentials.txt        # Credenciales VPN
├── connect-qbtc-openvpn.bat    # Script de conexión
└── activate-qbtc-ip.bat        # Activador automático
```

### 🎮 Uso del Sistema

#### Dashboard de Monitoreo
1. Abrir `http://localhost:8080` en el navegador
2. Ver estado en tiempo real de todos los componentes
3. Controlar VPN y coordinador desde la interfaz
4. Monitorear métricas y logs del sistema

#### API del Proxy Seguro
```bash
# Autenticación
curl -X POST http://localhost:8443/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"qbtc_admin","password":"your_password"}'

# Usar API con token
curl http://localhost:8443/api/binance/v2/account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Control por Línea de Comandos
```bash
# Estado del sistema
node qbtc-unified-launcher.js status

# Reiniciar sistema
node qbtc-unified-launcher.js restart

# Detener sistema
node qbtc-unified-launcher.js stop

# Modo prueba (VPN/Coordinator deshabilitados)
node qbtc-unified-launcher.js test
```

### 🔧 Componentes Individuales

#### 1. VPN Connector (`qbtc-vpn-connector.js`)
```bash
# Conectar VPN
node qbtc-vpn-connector.js connect

# Desconectar VPN
node qbtc-vpn-connector.js disconnect

# Verificar estado
node qbtc-vpn-connector.js status

# Modo monitoreo
node qbtc-vpn-connector.js monitor
```

#### 2. Secure Proxy Server (`qbtc-secure-proxy-server.js`)
- Puerto: 8443
- Autenticación JWT requerida
- Rate limiting: 100 req/15min
- Forwarding automático a Binance

#### 3. IP Coordinator (`qbtc-ip-coordinator.js`)
```bash
# Iniciar coordinador
node qbtc-ip-coordinator.js start

# Con API REST
node qbtc-ip-coordinator.js start --api
```

#### 4. Monitoring Dashboard (`qbtc-monitoring-dashboard.js`)
- Puerto: 8080
- WebSocket para actualizaciones live
- Control completo del sistema
- Métricas en tiempo real

### 🔄 Estrategias de Failover

#### Modos de Operación
1. **VPN Mode**: Conexión VPN directa
2. **Proxy Mode**: Proxy HTTP con spoofing de IP
3. **Direct Mode**: Conexión directa (si IP ya es correcta)
4. **Hybrid Mode**: Combinación automática de estrategias

#### Lógica de Failover
```
Verificar IP actual
    ↓
¿IP = Objetivo?
    ├── SÍ → Modo Direct
    └── NO → Intentar VPN
                ↓
            ¿VPN OK?
                ├── SÍ → Modo VPN
                └── NO → Modo Proxy
```

### 📊 Monitoreo y Logs

#### Logs del Sistema
- Todos los componentes generan logs detallados
- Eventos de failover registrados automáticamente
- Métricas de rendimiento en tiempo real
- Alertas automáticas por email/console

#### Dashboard en Tiempo Real
- Estado de conexión VPN
- IP actual vs objetivo
- Modo de operación actual
- Historial de eventos
- Controles interactivos

### 🛠️ Solución de Problemas

#### Problema: VPN no conecta
```bash
# Verificar archivos de configuración
ls QBTC-UNIFIED/
# Deberías ver: qbtc-openvpn-config.ovpn, qbtc-credentials.txt

# Verificar OpenVPN
openvpn --version

# Probar conexión manual
cd QBTC-UNIFIED
openvpn qbtc-openvpn-config.ovpn
```

#### Problema: Proxy no responde
```bash
# Verificar puerto
netstat -an | grep 8443

# Verificar logs
tail -f logs/proxy.log

# Reiniciar componente
node qbtc-secure-proxy-server.js
```

#### Problema: Dashboard no carga
```bash
# Verificar puerto 8080
netstat -an | grep 8080

# Verificar archivos estáticos
ls public/

# Reiniciar dashboard
node qbtc-monitoring-dashboard.js start
```

### 🔒 Seguridad

#### Autenticación
- JWT tokens con expiración
- Passwords hasheadas
- Rate limiting por IP
- CORS configurado restrictivamente

#### Encriptación
- Credenciales en variables de entorno
- Comunicación HTTPS
- Logs sanitizados
- Datos sensibles encriptados

#### Validación
- IPs verificadas automáticamente
- Certificados SSL validados
- Headers de seguridad
- Input sanitization

### 📈 Rendimiento

#### Optimizaciones
- Conexiones persistentes
- Cache inteligente
- Compresión de respuestas
- Load balancing automático

#### Métricas
- Latencia de respuesta
- Tasa de éxito de requests
- Uso de CPU/Memoria
- Eventos de failover

### 🚀 Despliegue en Producción

#### Configuración del Servidor
```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar OpenVPN
sudo apt-get install openvpn

# Configurar firewall
sudo ufw allow 8443
sudo ufw allow 8080
sudo ufw allow 1194/udp  # Para VPN
```

#### Configuración SSL
```bash
# Generar certificados SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Configurar HTTPS en proxy
# Editar qbtc-secure-proxy-server.js para usar HTTPS
```

#### Monitoreo Continuo
```bash
# Configurar PM2 para gestión de procesos
npm install -g pm2
pm2 start qbtc-unified-launcher.js --name qbtc-unified
pm2 save
pm2 startup
```

### 📚 API Reference

#### Endpoints del Proxy Seguro
- `POST /auth/login` - Autenticación
- `GET /api/binance/*` - Proxy a Binance API
- `GET /health` - Health check

#### Endpoints del Dashboard
- `GET /api/status` - Estado completo del sistema
- `POST /api/vpn/connect` - Conectar VPN
- `POST /api/vpn/disconnect` - Desconectar VPN
- `GET /api/metrics` - Métricas del sistema

#### Endpoints del Coordinator
- `GET /status` - Estado del coordinador
- `POST /mode/:mode` - Cambiar modo de operación
- `GET /ip/check` - Verificar IP actual

### 🤝 Contribución

#### Desarrollo
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

#### Convenciones de Código
- ESLint para JavaScript
- Documentación JSDoc
- Tests unitarios obligatorios
- Commits semánticos

### 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

### 📞 Soporte

#### Canales de Soporte
- 📧 Email: support@qbtc-system.com
- 💬 Discord: [QBTC Community](https://discord.gg/qbtc)
- 📖 Documentación: [Wiki](https://github.com/qbtc/qbtc-unified/wiki)

#### Reportar Issues
- Usar GitHub Issues para bugs
- Incluir logs completos
- Describir pasos para reproducir
- Indicar versión del sistema

---

**🎯 QBTC Unified System - La solución completa para trading seguro y coordinado**