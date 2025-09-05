# 🔐 QBTC CREDENTIALS MANAGER - ROBUST SYSTEM

## 📋 Overview

El **QBTC Credentials Manager** es un sistema robusto y seguro para la gestión de credenciales de Binance que incluye:

- ✅ **Encriptación automática** de datos sensibles
- ✅ **Validación automática** de formato y conectividad
- ✅ **Sistema de respaldo** con failover automático
- ✅ **Monitoreo continuo** de estado de credenciales
- ✅ **Rotación automática** en caso de problemas
- ✅ **Alertas y reportes** en tiempo real

## 🚀 Quick Start

### 1. Configuración Inicial

```bash
# Ejecutar configuración asistida
node core/credentials-setup-robust.js
```

### 2. Probar el Sistema

```bash
# Ejecutar pruebas exhaustivas
node core/credentials-test-robust.js
```

### 3. Iniciar Monitoreo

```bash
# Monitoreo cada 5 minutos (por defecto)
node core/credentials-monitor.js

# Monitoreo personalizado (ej: cada 10 minutos)
node core/credentials-monitor.js 10
```

## 📁 Archivos del Sistema

```
core/
├── credentials-manager.js      # 🎯 Núcleo del sistema
├── credentials-setup-robust.js # ⚙️ Configuración asistida
├── credentials-test-robust.js  # 🧪 Suite de pruebas
├── credentials-monitor.js      # 👀 Monitoreo continuo
└── CREDENTIALS-README.md       # 📖 Esta documentación
```

## 🔧 Uso Programático

### Importar el Manager

```javascript
import QBTCCredentialsManager from './core/credentials-manager.js';

// Obtener instancia (singleton)
const manager = QBTCCredentialsManager;
```

### Configurar Credenciales

```javascript
try {
    const result = await manager.setupCredentials(
        'TU_API_KEY_64_CHARS',
        'TU_SECRET_KEY_64_CHARS',
        false  // false = mainnet, true = testnet
    );

    console.log('✅ Configurado:', result);
} catch (error) {
    console.error('❌ Error:', error.message);
}
```

### Obtener Credenciales Activas

```javascript
try {
    const credentials = manager.getActiveCredentials();
    console.log('🔑 Credenciales activas:', credentials.source);
    console.log('🌐 Testnet:', credentials.testnet);
} catch (error) {
    console.error('❌ No hay credenciales válidas');
}
```

### Probar Conectividad

```javascript
const credentials = manager.getActiveCredentials();
const result = await manager.testConnectivity(credentials, credentials.testnet);

if (result.success) {
    console.log('✅ Conectividad OK');
    console.log('💰 Balance:', result.balance);
} else {
    console.log('❌ Error:', result.message);
}
```

## 🔒 Características de Seguridad

### Encriptación AES-256

```javascript
// Los datos sensibles se encriptan automáticamente
const encrypted = manager.encrypt('sensitive_data');
const decrypted = manager.decrypt(encrypted);
```

### Archivos Seguros

- `.binance-config-primary-encrypted.json` - Credenciales principales encriptadas
- `.binance-config-backup-encrypted.json` - Credenciales de respaldo encriptadas
- `.binance-config-primary.json` - Credenciales sin encriptar (desarrollo)

### Validación Robusta

```javascript
const validation = manager.validateCredentials(apiKey, secretKey);
if (!validation.valid) {
    console.log('Errores:', validation.errors);
}
```

## 📊 Monitoreo y Alertas

### Estado de Salud

```javascript
const health = manager.getHealthStatus();
console.log('Primary:', health.primary);      // HEALTHY/UNHEALTHY
console.log('Backup:', health.backup);        // HEALTHY/UNHEALTHY
console.log('Connectivity:', health.connectivity); // true/false
```

### Alertas Automáticas

El sistema genera alertas para:
- 🔌 Problemas de conectividad
- 💥 Excepciones en el código
- ✅ Recuperaciones exitosas
- ❌ Fallos en recuperación

## 🔄 Sistema de Respaldo

### Configuración Automática

```javascript
// Al configurar credenciales, se crean automáticamente:
// 1. Credenciales principales
// 2. Credenciales de respaldo
// 3. Versiones encriptadas de ambas
```

### Failover Automático

```javascript
// Si las credenciales principales fallan:
// 1. Se intenta con credenciales de respaldo
// 2. Se genera alerta automática
// 3. Se registra el cambio en logs
```

## 🧪 Testing Suite

### Pruebas Exhaustivas

```bash
node core/credentials-test-robust.js
```

**Pruebas Incluidas:**
- ✅ Validación de formato de credenciales
- ✅ Conectividad con Binance API
- ✅ Sistema de respaldo
- ✅ Características de seguridad
- ✅ Performance y tiempos de respuesta

### Resultados Esperados

```
🧪 QBTC CREDENTIALS ROBUST TEST SUITE
====================================

1️⃣ TESTING CREDENTIAL VALIDATION
✅ Valid credentials: PASSED
❌ Invalid API Key length: PASSED

2️⃣ TESTING CONNECTIVITY
✅ CONNECTIVITY TEST PASSED
💰 Balance: $10,000.00

3️⃣ TESTING BACKUP SYSTEM
✅ BACKUP SYSTEM FULLY OPERATIONAL

📊 FINAL TEST REPORT
Tests Passed: 15/15
Success Rate: 100.0%
Status: ✅ EXCELLENT
```

## 📈 Monitoreo Continuo

### Iniciar Monitoreo

```bash
# Monitoreo cada 5 minutos
node core/credentials-monitor.js

# Monitoreo cada 10 minutos
node core/credentials-monitor.js 10
```

### Reportes de Salud

Cada hora se genera un reporte automático:

```
🏥 Health Report
Primary: HEALTHY
Backup: HEALTHY
Connectivity: ✅
Credentials loaded: ✅
Backup available: ✅
```

## 🚨 Manejo de Errores

### Tipos de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `IP_RESTRICTION` | IP no whitelisted | Configurar IP en Binance |
| `API_ERROR` | Credenciales inválidas | Verificar API Key/Secret |
| `TIMEOUT` | Problemas de red | Reintentar más tarde |
| `PARSE_ERROR` | Respuesta malformada | Verificar conectividad |

### Recuperación Automática

```javascript
// El sistema intenta recuperación automática:
// 1. Verificar credenciales de respaldo
// 2. Rotar a credenciales funcionales
// 3. Generar alertas apropiadas
```

## 📋 Mejores Prácticas

### 🔐 Seguridad

1. **Nunca compartir** credenciales en texto plano
2. **Usar testnet** para desarrollo y pruebas
3. **Configurar IP whitelist** en producción
4. **Activar 2FA** en la cuenta de Binance
5. **Monitorear logs** regularmente

### ⚡ Performance

1. **Usar monitoreo continuo** en producción
2. **Configurar alertas** para problemas críticos
3. **Mantener credenciales de respaldo** actualizadas
4. **Revisar reportes de salud** diariamente

### 🔄 Mantenimiento

1. **Rotar credenciales** periódicamente
2. **Actualizar IP whitelist** cuando cambie la IP
3. **Monitorear uso de API** para evitar límites
4. **Mantener versiones de respaldo** actualizadas

## 🎯 Casos de Uso

### Desarrollo Local

```bash
# 1. Configurar testnet
node core/credentials-setup-robust.js

# 2. Probar sistema
node core/credentials-test-robust.js

# 3. Desarrollar con confianza
```

### Producción

```bash
# 1. Configurar mainnet con IP whitelist
node core/credentials-setup-robust.js

# 2. Iniciar monitoreo continuo
node core/credentials-monitor.js

# 3. Monitorear logs y alertas
```

### Troubleshooting

```bash
# Verificar estado actual
node core/credentials-test-robust.js

# Revisar logs de monitoreo
tail -f logs/credentials-monitor.log

# Verificar archivos de configuración
ls -la .binance-config*.json
```

## 📞 Soporte

### Logs y Debugging

```bash
# Habilitar logs detallados
export DEBUG=qbtc:credentials:*

# Ver logs del monitor
tail -f logs/credentials-monitor.log

# Ver estado actual
node -e "import('./core/credentials-manager.js').then(m => console.log(m.default.getHealthStatus()))"
```

### Reportes de Problemas

Si encuentras problemas:

1. Ejecuta las pruebas: `node core/credentials-test-robust.js`
2. Revisa los logs del monitor
3. Verifica la conectividad de red
4. Confirma que las credenciales sean válidas en Binance

---

## 🎊 Conclusión

El **QBTC Credentials Manager** proporciona un sistema robusto y seguro para la gestión de credenciales de Binance, con características avanzadas de seguridad, monitoreo y recuperación automática.

**🚀 ¡Listo para producción con máxima confiabilidad!**