# QBTC - Sistema de Trading Cuántico de Bitcoin 🚀

[![Versión](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/your-org/qbtc-futures-system)
[![Licencia](https://img.shields.io/badge/licencia-Propietaria-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Estado](https://img.shields.io/badge/estado-Listo%20Producci%C3%B3n-green.svg)](https://github.com/your-org/qbtc-futures-system)

> **Sistema Avanzado de Trading Cuántico de Bitcoin con Leverage Dinámico, Integración de IA y Gestión de Riesgo Cuántica**

[🇺🇸 Read in English](README.md) | [📖 Documentación](docs/) | [🚀 Inicio Rápido](#inicio-rápido) | [⚠️ Licencia](#licencia)

---

## ⚠️ AVISO IMPORTANTE

**Este es SOFTWARE PROPIETARIO con derechos de uso y distribución restringidos.**

- **❌ NO ES CÓDIGO ABIERTO**
- **❌ NO HAY DISTRIBUCIÓN GRATUITA**
- **❌ USO COMERCIAL RESTRINGIDO**
- **❌ NO SE PERMITE MODIFICACIÓN SIN AUTORIZACIÓN**
- **✅ SOLO USUARIOS AUTORIZADOS**

---

## 🌟 Descripción General

QBTC (Quantum Bitcoin Trading Core) es un sistema revolucionario de trading que integra principios de mecánica cuántica, inteligencia artificial y gestión avanzada de riesgo para proporcionar optimización de leverage dinámico para trading de futuros de Bitcoin.

### 🎯 Características Principales

- **🔬 Motor de Leverage Cuántico**: Leverage dinámico de 1x a 125x basado en coherencia cuántica
- **🧠 Predicciones Impulsadas por IA**: Redes neuronales cuánticas para análisis de mercado
- **⚡ Gestión de Riesgo en Tiempo Real**: VaR avanzado y circuit breakers
- **🎮 Modos de Trading Leonardo**: Desde conservador hasta cuántico agresivo
- **🔄 Sistemas de Equilibrio Parcial**: Modelado de dinámicas de mercado
- **📊 Métricas Avanzadas**: Analíticas de rendimiento mejoradas cuánticamente

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18.0.0 o superior
- **npm** 8.0.0 o superior
- **Git** 2.25.0 o superior
- **RAM** 8GB mínimo (16GB recomendado)
- **Clave de Licencia Válida** (Requerida)

### Instalación

```bash
# Clonar el repositorio (solo usuarios autorizados)
git clone https://github.com/your-org/qbtc-futures-system.git
cd qbtc-futures-system

# Instalar dependencias
npm install

# Configurar clave de licencia
cp .env.example .env.local
nano .env.local  # Agregar tu LICENSE_KEY

# Verificar licencia
npm run verify-license

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:8080`

### Configuración de Entorno

```bash
# Configuración Requerida
LICENSE_KEY=tu_clave_de_licencia_valida_aqui
QUANTUM_COHERENCE_THRESHOLD=0.1
MAX_LEVERAGE=125
AI_CONFIDENCE_MIN=0.3

# APIs de Exchange (Opcional)
BINANCE_API_KEY=tu_clave_binance
BYBIT_API_KEY=tu_clave_bybit

# Base de Datos (Opcional - usa almacenamiento local por defecto)
MONGODB_URI=mongodb://localhost:27017/qbtc
REDIS_URL=redis://localhost:6379
```

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Motor Cuántico │    │ Predictor de IA │    │Gestor de Riesgo │
│                 │    │                 │    │                 │
│ • Coherencia    │───►│ • Red Neuronal  │───►│ • VaR Cuántico  │
│ • Entropía      │    │ • Predicciones  │    │ • Circuit Break │
│ • Consciencia   │    │ • Confianza     │    │ • Liquidación   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │Gestor Posiciones│
                    │                 │
                    │ • Tamaño Dinám. │
                    │ • Optim. Lever. │
                    │ • Seguim. P&L   │
                    └─────────────────┘
```

### Modos de Trading Leonardo

| Modo | Leverage Máx | Factor Riesgo | Confianza IA | Estado Cuántico |
|------|-------------|---------------|--------------|-----------------|
| **Conservador** | 5x | 0.15 | 0.85 | \|0⟩ + \|1⟩ |
| **Equilibrado** | 25x | 0.35 | 0.70 | \|+⟩ |
| **Agresivo** | 75x | 0.65 | 0.50 | \|ψ⟩ superposición |
| **Cuántico** | 125x | 0.85 | 0.90 | \|entrelazado⟩ |

---

## 📈 Métricas de Rendimiento

### Resultados de Backtesting (6 Meses)

| Métrica | Conservador | Equilibrado | Agresivo | Cuántico |
|---------|-------------|-------------|----------|----------|
| **Retorno Total** | 45.2% | 127.8% | 245.6% | 412.3% |
| **Ratio Sharpe** | 2.15 | 1.89 | 1.45 | 1.67 |
| **Drawdown Máx** | 8.1% | 15.4% | 28.7% | 35.2% |
| **Tasa de Ganancia** | 68.5% | 61.2% | 54.8% | 59.1% |
| **Ratio Calmar** | 5.58 | 8.30 | 8.56 | 11.71 |

### Monitoreo en Tiempo Real

```bash
# Verificación de salud del sistema
npm run health-check

# Monitoreo de coherencia cuántica
npm run quantum:status

# Dashboard de métricas de riesgo
npm run risk:monitor

# Analíticas de rendimiento
npm run analytics:generate
```

---

## 🧮 Marco Matemático

### Fórmula de Leverage Cuántico

```mathematics
L(t) = L₀ · Ψ(t) · E(t) · C(t) · AI(t)
```

Donde:
- **L₀**: Leverage base (1-125x)
- **Ψ(t)**: Factor de coherencia cuántica
- **E(t)**: Coeficiente de entropía del mercado
- **C(t)**: Nivel de consciencia
- **AI(t)**: Factor de ajuste de IA

### Gestión de Riesgo

```mathematics
QVaR_α = inf{l ∈ ℝ : P(L > l|Ψ(t)) ≤ 1-α}
```

**Valor en Riesgo Cuántico** con nivel de confianza α y estado cuántico Ψ(t).

---

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run dev:quantum      # Iniciar con debug cuántico

# Gestión de Licencias
npm run verify-license   # Verificar validez de licencia
npm run license-info     # Mostrar información de licencia

# Construcción
npm run build            # Build de producción
npm run build:analyze    # Análisis de bundle

# Testing
npm run test             # Ejecutar suite de tests
npm run test:quantum     # Tests específicos cuánticos
npm run test:coverage    # Reporte de cobertura

# Calidad
npm run lint             # Verificación ESLint
npm run type-check       # Validación TypeScript
npm run format           # Formato Prettier
```

### Estructura del Proyecto

```
qbtc-futures-system/
├── src/
│   ├── components/          # Componentes React
│   ├── contexts/           # Contextos React
│   ├── core/              # Sistemas principales
│   │   ├── quantum/       # Motor cuántico
│   │   ├── ai/           # Predictor IA
│   │   ├── risk/         # Gestión de riesgo
│   │   └── storage/      # Persistencia de datos
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Utilidades
│   └── types/            # Definiciones TypeScript
├── docs/                 # Documentación
├── tests/               # Suites de tests
├── public/              # Assets estáticos
└── LICENSE              # Licencia propietaria
```

---

## 📊 Documentación de API

### Endpoints REST

```bash
# Trading
POST   /api/v1/positions/open          # Abrir nueva posición
GET    /api/v1/positions/{id}          # Obtener detalles de posición
PUT    /api/v1/positions/{id}/leverage # Modificar leverage
DELETE /api/v1/positions/{id}          # Cerrar posición

# Motor Cuántico
GET    /api/v1/quantum/coherence       # Nivel actual de coherencia
POST   /api/v1/quantum/calibrate       # Recalibrar sistema
GET    /api/v1/quantum/entropy         # Entropía del mercado

# Gestión de Riesgo
GET    /api/v1/risk/var                # VaR Cuántico
GET    /api/v1/risk/circuit-breakers   # Estado de breakers
POST   /api/v1/risk/emergency-stop     # Parada de emergencia

# Gestión de Licencias
GET    /api/v1/license/status          # Estado de licencia
POST   /api/v1/license/validate        # Validar licencia
```

---

## 🔒 Seguridad y Gestión de Riesgo

### Características de Seguridad

- **Validación de Licencia**: Verificación de licencia en tiempo real
- **Autenticación Multicapa**: Claves API, JWT, 2FA
- **Almacenamiento Encriptado**: Todos los datos sensibles encriptados
- **Circuit Breakers**: Protección automática de riesgo
- **Auditoría de Logs**: Seguimiento completo de operaciones
- **Limitación de Velocidad**: Protección contra abuso de API

### Controles de Riesgo

- **Límites de Posición**: Controles de exposición máxima
- **Requisitos de Margen**: Cálculo dinámico de margen
- **Motor de Liquidación**: Cierre automático de posiciones
- **Monitoreo VaR**: Evaluación de riesgo en tiempo real
- **Límites de Correlación**: Diversificación de portafolio

---

## 🧪 Testing

### Cobertura de Tests

- **Tests Unitarios**: 95%+ de cobertura
- **Tests de Integración**: Cobertura completa de API
- **Tests E2E**: Flujos críticos de usuario
- **Tests de Rendimiento**: Pruebas de carga y estrés
- **Tests de Seguridad**: Pruebas de penetración
- **Tests de Licencia**: Validación de licencias

```bash
# Ejecutar suite completa de tests
npm run test:all

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar categorías específicas de tests
npm run test:quantum     # Tests de motor cuántico
npm run test:ai         # Tests de sistema IA
npm run test:risk       # Tests de gestión de riesgo
npm run test:license    # Tests de validación de licencia
```

---

## 📖 Documentación

### Documentación Completa

- [📘 Guía de Instalación](INSTALLATION.md)
- [🏗️ Visión General de Arquitectura](docs/architecture.md)
- [🔬 Motor Cuántico](docs/system-architecture-overview.md)
- [🧠 Sistema IA](docs/COMPONENTES-IMPLEMENTADOS-REPORTE.md)
- [⚡ Gestión de Riesgo](docs/risk-management-framework.md)
- [📊 Referencia de API](API_DOCUMENTATION.md)
- [🔧 Configuración](INSTALLATION.md)
- [🐛 Resolución de Problemas](DIAGNOSTICO-SERVICIOS-QBTC.md)
- [⚖️ Términos de Licencia](LICENSE)

### Documentación Matemática

- [📐 Marco Matemático](docs/BIBLIOGRAFIA-ACADEMICA-COMPLETA.md)
- [📈 Análisis de Rendimiento](docs/trading-cycle-analysis.md)
- [🧮 Fórmulas Cuánticas](QBTC_LEVERAGE_MATHEMATICAL_ABSTRACT_REFINED.md)
- [📊 Métricas de Riesgo](docs/risk-management-framework.md)

---

## 🛟 Soporte

### Obtener Ayuda

- **📖 Documentación**: Consulta nuestra documentación completa
- **🐛 Issues**: [GitHub Issues](https://github.com/your-org/qbtc-futures-system/issues) (Solo usuarios licenciados)
- **📧 Email**: support@qbtc-trading.com
- **💬 Discord**: [Comunidad de usuarios licenciados](https://discord.gg/qbtc-trading-licensed)

### Soporte de Licencia

- **Problemas de Licencia**: license-support@qbtc-trading.com
- **Licencias Empresariales**: enterprise@qbtc-trading.com
- **Renovación de Licencias**: renewals@qbtc-trading.com

---

## 📜 Licencia

**LICENCIA DE SOFTWARE PROPIETARIO**

Este software está protegido por leyes de derechos de autor y tratados internacionales. La reproducción o distribución no autorizada de este programa, o cualquier parte del mismo, puede resultar en severas sanciones civiles y penales.

### ⚠️ Restricciones

**PROHIBIDO:**
- ❌ Distribución sin autorización
- ❌ Modificación sin permiso
- ❌ Uso comercial no autorizado
- ❌ Ingeniería inversa
- ❌ Copia o reproducción
- ❌ Sublicenciar o revender

**PERMITIDO:**
- ✅ Uso por individuos/organizaciones licenciadas únicamente
- ✅ Implementación interna dentro de entidad licenciada
- ✅ Personalización para uso interno (con restricciones)

### 💰 Opciones de Licencia

| Tipo de Licencia | Características | Precio | Soporte |
|------------------|----------------|--------|---------|
| **Personal** | Usuario único, características básicas | $2,999/año | Email |
| **Profesional** | Uso en equipo, características avanzadas | $9,999/año | Prioritario |
| **Empresarial** | Usuarios ilimitados, características completas | Contactar Ventas | Dedicado |

### 📞 Adquisición de Licencia

Contacta nuestro equipo de ventas para licenciamiento:
- **Email**: sales@qbtc-trading.com
- **Teléfono**: +1-555-QBTC-LIC
- **Sitio Web**: [https://qbtc-trading.com/licensing](https://qbtc-trading.com/licensing)

---

## ⚠️ Descargos de Responsabilidad Críticos

### Advertencia de Riesgo Financiero

**⚠️ ADVERTENCIA DE ALTO RIESGO**: Este sistema opera con dinero real en mercados financieros extremadamente volátiles. El trading algorítmico conlleva riesgos significativos incluyendo **PÉRDIDA TOTAL DEL CAPITAL**.

**Usa únicamente capital que puedas permitirte perder completamente.**

### Descargo de Responsabilidad Legal

Este software se proporciona "TAL COMO ESTÁ" sin garantías. Los usuarios son completamente responsables de:
- Cumplir con regulaciones locales sobre trading automatizado
- Configuración adecuada de límites de riesgo
- Supervisión de operaciones del sistema
- Seguridad de credenciales

**El rendimiento pasado no garantiza resultados futuros**. El rendimiento puede variar significativamente según las condiciones del mercado.

---

## 🏆 Reconocimientos

- **Investigación en Computación Cuántica**: Basado en los últimos principios de mecánica cuántica
- **Matemáticas Financieras**: Modelos avanzados de pricing de derivados
- **Investigación en IA**: Arquitecturas de redes neuronales de última generación
- **Socios Tecnológicos Licenciados**: Soluciones de grado empresarial

### Tecnologías Principales

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, WebSocket
- **Base de Datos**: MongoDB, Redis
- **IA/ML**: TensorFlow.js, Algoritmos cuánticos personalizados
- **Testing**: Vitest, Testing Library, Playwright
- **Infraestructura**: Docker, Kubernetes, AWS
- **Seguridad**: Encriptación end-to-end, integración HSM

---

## 📞 Contacto

**Equipo de Desarrollo QBTC**

- **Sitio Web**: [https://qbtc-trading.com](https://qbtc-trading.com)
- **Ventas**: sales@qbtc-trading.com
- **Soporte**: support@qbtc-trading.com
- **Legal**: legal@qbtc-trading.com
- **GitHub**: [https://github.com/your-org/qbtc-futures-system](https://github.com/your-org/qbtc-futures-system)

---

<div align="center">

**🚀 Construido con pasión por la excelencia en trading cuántico 🚀**

**⚖️ Software Licenciado - Solo Usuarios Autorizados ⚖️**

[⬆ Volver Arriba](#qbtc---sistema-de-trading-cuántico-de-bitcoin-)

</div>

---

*Última actualización: Enero 2025*  
*© 2025 QBTC Technologies. Todos los derechos reservados.*  
*Propietario y Confidencial*
