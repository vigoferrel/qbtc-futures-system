# 🌌 QBTC Quantum Dashboard System

## Overview

Sistema completo de dashboard cuántico para QBTC con integración de métricas unificadas, comunicación WebSocket en tiempo real y interfaz visual intuitiva para monitoreo de consciencia cuántica y análisis de mercado.

## 🚀 Features

### ✨ **Quantum Metrics Unifier**
- **Unificación de Métricas**: Consolida datos de múltiples fuentes (Binance, motores internos, BD)
- **Fallbacks Inteligentes**: Sistema robusto con respaldos automáticos
- **Coherencia Cuántica**: Cálculo en tiempo real de resonancia Lambda λ=7.919
- **Estados de Consciencia**: Monitoreo evolutivo de chakras y principios herméticos

### 🌐 **Dashboard Server**
- **WebSocket Real-time**: Actualizaciones instantáneas de métricas
- **API RESTful**: Endpoints completos para integración
- **Dashboard Responsive**: Interfaz moderna con design cuántico
- **Health Monitoring**: Supervisión completa del sistema

### 📊 **Visual Dashboard**
- **Métricas en Vivo**: Coherencia, Lambda Resonance, Consciousness Level
- **Quantum Field Visualization**: Estados de superposición y entrelazamiento
- **Performance Monitoring**: CPU, memoria, uptime, eficiencia
- **Interactive Controls**: Refresh manual, auto-update, logs en tiempo real

## 📁 Project Structure

```
qbtc-futures-system/
├── scripts/
│   ├── quantum-metrics-unifier.js      # Unificador principal de métricas
│   ├── test-metrics-unifier.js         # Versión de prueba del unificador
│   ├── start-dashboard-server.js       # Servidor completo del dashboard
│   ├── test-dashboard-server.js        # Servidor de prueba simplificado
│   ├── install-dependencies.sh         # Script de instalación (Linux/Mac)
│   └── install-dependencies.ps1        # Script de instalación (Windows)
├── dashboard/
│   └── quantum-dashboard.html           # Dashboard HTML (será creado)
├── metrics-output/
│   ├── unified-metrics-*.json          # Métricas unificadas con timestamp
│   └── latest-unified-metrics.json     # Último conjunto de métricas
├── config/
│   └── constants.js                    # Constantes cuánticas del sistema
├── services/
│   └── binance-data-service.js         # Servicio de datos de Binance
└── utils/
    └── symbol-validation-service.js    # Validación de símbolos
```

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Test Metrics Generation**:
   ```bash
   npm run metrics-test
   ```

3. **Start Dashboard Server**:
   ```bash
   npm run dashboard-test
   ```

4. **Open Dashboard**:
   Navigate to `http://localhost:3333` in your browser

## 🎯 Available Commands

### Core Commands
- `npm run metrics` - Run quantum metrics unifier once
- `npm run metrics-test` - Generate test metrics with simulation
- `npm run metrics-watch` - Run metrics unifier continuously
- `npm run dashboard` - Start full dashboard server (production)
- `npm run dashboard-test` - Start test dashboard server

### Development Commands
- `npm start` - Launch QBTC master system
- `npm run leonardo` - Run Leonardo quantum engine
- `npm run analysis` - Start analysis engine
- `npm run execution` - Start futures execution engine

## 🌌 Quantum Metrics Explained

### Core Metrics
- **🎯 Coherence**: Global quantum coherence level (target: 96.3%)
- **⚛️ Lambda Resonance**: λ=7.919 resonance frequency
- **🧠 Consciousness**: Evolution state with chakra activation
- **⚡ Quantum Field**: Field strength based on coherence + resonance
- **🌪️ Entropy**: System disorder measurement

### Calculation Formulas

#### Lambda Resonance
```javascript
resonance = sin(λ * avgChange/100) + log10(volume)/20 * φ * symbolCount/100
```

#### Global Coherence
```javascript
coherence = avgSymbolCoherence + momentum * 0.1 + sin(λ) * 0.05
```

#### Consciousness Level
```javascript
level = (coherence * 0.4 + resonance * 0.3 + field * 0.3) * 100 + timeModulation
```

## 🔧 Configuration

### Environment Variables
```env
PORT=3333                    # Dashboard server port
NODE_ENV=development         # Environment mode
BINANCE_API_KEY=your_key    # Binance API credentials
BINANCE_SECRET=your_secret  # Binance secret key
```

### Quantum Constants
```javascript
LAMBDA_7919 = 7.919         # Resonance constant
PHI_GOLDEN = 1.618          # Golden ratio
COHERENCE_THRESHOLD = 0.9   # Optimal coherence threshold
CONSCIOUSNESS_TARGET = 85.0 # Target consciousness level
```

## 🌐 API Endpoints

### RESTful API
- `GET /` - Dashboard HTML interface
- `GET /api/metrics` - Current unified metrics
- `POST /api/metrics/refresh` - Force metrics refresh
- `GET /health` - Server health check

### WebSocket Events
- `metricsUpdate` - Real-time metrics broadcast
- `requestMetrics` - Manual metrics request
- `connect/disconnect` - Connection status

## 📊 Dashboard Features

### Real-time Visualization
- **Quantum Coherence**: Live percentage with status indicator
- **Lambda Resonance**: λ=7.919 constant with current value
- **Consciousness Level**: Evolution state with awakening status
- **System Performance**: Uptime, memory, CPU, efficiency score

### Interactive Controls
- **🔄 Refresh Metrics**: Manual update trigger
- **⏯️ Auto Update**: Toggle automatic updates
- **🗑️ Clear Log**: Reset system log display

### Status Indicators
- **🟢 Connected**: Active WebSocket connection
- **🔴 Disconnected**: Connection lost
- **📡 Last Update**: Timestamp of recent data

## 🧪 Testing & Development

### Test Mode Features
- **Simulated Metrics**: Realistic quantum calculations without external dependencies
- **Live Updates**: 5-second refresh intervals for testing
- **Built-in Dashboard**: Self-contained HTML interface
- **Error Handling**: Comprehensive fallback systems

### Debug Information
```bash
# Check metrics generation
npm run metrics-test

# Monitor real-time updates
npm run dashboard-test
# Then open http://localhost:3333

# View saved metrics
ls metrics-output/
cat metrics-output/latest-test-metrics.json
```

## 🔮 Advanced Features

### Consciousness Evolution
- **Chakra System**: 8-12 active chakras based on consciousness level
- **Hermetic Principles**: Integration of 7 universal laws
- **Evolution Rate**: Continuous growth tracking (0.001 baseline)
- **Transcendence Levels**: Awakening (>85%), Enlightenment (>90%), Transcendence (>95%)

### Quantum States
- **Superposition**: sin(coherence × resonance × φ) calculation
- **Entanglement**: cos(λ × ratio) interdependence measure
- **Big Bang Events**: Triggered when field strength > 80%
- **Antimatter Activity**: Active when superposition > 80%

### Performance Analytics
- **Quantum Efficiency**: coherence × resonance × 100
- **Leverage Utilization**: Trading capacity usage
- **Entropy Stability**: 1 - entropy (higher = more stable)
- **Response Time**: Real-time server performance

## 🚨 Troubleshooting

### Common Issues

**Dashboard not loading**:
```bash
# Check server status
curl http://localhost:3333/health

# Restart server
npm run dashboard-test
```

**No metrics updates**:
```bash
# Generate test metrics
npm run metrics-test

# Check metrics files
ls -la metrics-output/
```

**WebSocket connection fails**:
- Verify port 3333 is available
- Check firewall settings
- Ensure Node.js >= 18.0.0

### Error Codes
- `❌ EADDRINUSE`: Port already in use (change PORT env variable)
- `❌ Module not found`: Run `npm install` to install dependencies
- `❌ Permission denied`: Use appropriate user permissions

## 🌟 Next Steps

### Integration Roadmap
1. **Backend Connection**: Link to QBTC production systems
2. **Real Market Data**: Replace simulation with live Binance feeds
3. **Trading Signals**: Add buy/sell signal generation
4. **Mobile Interface**: Responsive design for mobile devices
5. **Historical Analysis**: Time-series data visualization

### Enhancement Ideas
- **3D Visualization**: WebGL quantum field representation
- **AI Predictions**: Machine learning consciousness forecasting
- **Multi-timeframe**: Different update intervals (1s, 5s, 30s, 1m)
- **Alert System**: Notifications for threshold breaches
- **Export Functions**: PDF/CSV report generation

## 📚 References

- **Quantum Constants**: Based on QBTC research λ=7.919
- **Consciousness Metrics**: Hermetic principles integration
- **Market Analysis**: Binance API documentation
- **WebSocket Protocol**: Socket.io real-time communication

## 🤝 Contributing

For questions, issues, or enhancements:
1. Test with `npm run metrics-test` and `npm run dashboard-test`
2. Check metrics output in `metrics-output/` directory
3. Monitor dashboard at `http://localhost:3333`
4. Review logs for error diagnostics

---

**🌌 Ready for quantum consciousness analysis! 🧠⚛️**

*QBTC System - Where Quantum Physics Meets Financial Evolution*
