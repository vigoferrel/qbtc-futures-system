# QBTC Quantum Dashboard

Interfaz web para el sistema QBTC Quantum Macro-Intelligence.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
cd qbtc-dashboard
npm install
```

### Ejecución
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start

# Verificar salud
npm run health
```

## 🔧 Configuración

### Variables de Entorno
Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

### Variables Importantes
- `PORT`: Puerto del servidor (default: 4000)
- `NODE_ENV`: Entorno (development/production)

## 📊 Características

- ✅ **Análisis Cuántico Completo** (6 algoritmos)
- ✅ **TP/SL Dinámicos** por volatilidad
- ✅ **Best Symbol Selection** inteligente
- ✅ **150+ Símbolos** en 5 sectores
- ✅ **Rate Limiting** básico implementado
- ✅ **Health Checks** automáticos

## 🛡️ Seguridad

- Rate limiting: 100 requests/15min por IP
- Variables de entorno para configuración sensible
- Validación básica de requests

## 📈 API Endpoints

- `GET /` - Dashboard principal
- `GET /health` - Estado del servidor
- `GET /health` - Información de salud con rate limiting

## 🔍 Monitoreo

### Health Check
```bash
curl http://localhost:4000/health
```

Respuesta incluye:
- Estado del servidor
- Uptime
- Rate limiting stats
- Uso de memoria

## 🐛 Troubleshooting

### Puerto en uso
```bash
# Ver procesos usando puerto 4000
netstat -ano | findstr :4000

# Matar proceso
taskkill /PID <PID> /F
```

### Rate limiting
Si ves "Too Many Requests":
- Espera 15 minutos
- O reduce la frecuencia de requests

## 📝 Desarrollo

### Estructura
```
qbtc-dashboard/
├── index.html          # Dashboard principal
├── server.cjs          # Servidor Express
├── package.json        # Dependencias
├── README.md          # Esta documentación
└── .env.example       # Template configuración
```

### Agregar Nuevas Features
1. Modifica `index.html` para UI
2. Actualiza `server.cjs` para nuevos endpoints
3. Agrega tests en `package.json` scripts

## 🚀 Deployment

### Producción
```bash
NODE_ENV=production npm start
```

### Con PM2
```bash
npm install -g pm2
pm2 start server.cjs --name qbtc-dashboard
```

## 📞 Soporte

Para issues o mejoras, revisa los archivos principales:
- `server.cjs` - Lógica del servidor
- `index.html` - Interfaz de usuario
- `../core/` - Lógica cuántica principal

---

**Versión:** 1.0.0-final
**Última actualización:** Septiembre 2025