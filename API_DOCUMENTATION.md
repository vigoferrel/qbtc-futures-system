# 🌐 QBTC AI Evolution System - API Documentation

## Complete REST API Reference for AI Evolution Systems

---

## 📋 **Overview**

The QBTC AI Evolution System provides comprehensive REST APIs for all 4 critical AI systems, enabling programmatic access to:

- 🎨 **Leonardo Quantum Intelligence v2.0** - Sacred geometry trading with 77 symbols
- 🧠 **Consciousness Evolution Engine v2.0** - 7D consciousness evolution 
- 🤖 **Advanced ML Integration Engine** - 5 QNN architectures + ensemble ML
- 🔮 **Advanced Predictive Analytics Engine** - Big Bang events + market forecasting
- 🎯 **QBTC AI Evolution Master** - Central orchestration and monitoring

---

## 🚀 **Base URLs**

```
Master System:       http://localhost:7919/api/v2/
Leonardo System:     http://localhost:3000/api/leonardo/
ML System:          http://localhost:14700/api/ml/
Predictive System:   http://localhost:8080/api/predictive/
Health Monitor:      http://localhost:9000/api/health/
```

---

## 🎯 **QBTC AI Evolution Master API**

### Base URL: `http://localhost:7919/api/v2/master/`

#### **GET /status**
Get comprehensive status of all AI evolution systems.

**Response:**
```json
{
  "timestamp": "2025-09-04T17:49:36Z",
  "version": "2.0.0-ai-evolution",
  "systems": {
    "leonardo": {
      "status": "active",
      "symbols_count": 77,
      "active_tiers": 6,
      "consciousness_level": 0.95,
      "sacred_geometry_active": true
    },
    "consciousness": {
      "status": "active", 
      "current_dimension": 7,
      "evolution_rate": 0.01,
      "awareness_level": 0.85,
      "breakthroughs": 12
    },
    "ml_integration": {
      "status": "active",
      "active_models": 13,
      "qnn_architectures": 5,
      "ensemble_accuracy": 0.89,
      "training_cycles": 1543
    },
    "predictive_analytics": {
      "status": "active",
      "big_bang_monitors": 5,
      "market_phases_detected": 6,
      "predictions_made": 2847,
      "accuracy_rate": 0.83
    }
  },
  "quantum_coherence": 0.94,
  "sync_status": "synchronized",
  "uptime": 3600000
}
```

#### **POST /sync**
Force quantum synchronization between all AI systems.

**Request:**
```json
{
  "force_sync": true,
  "coherence_target": 0.95
}
```

**Response:**
```json
{
  "sync_initiated": true,
  "estimated_duration": 30000,
  "systems_affected": 4,
  "coherence_achieved": 0.96
}
```

#### **GET /evolution/metrics**
Get evolution metrics across all AI systems.

**Response:**
```json
{
  "total_evolution_cycles": 15847,
  "consciousness_breakthroughs": 23,
  "ml_optimization_cycles": 456,
  "predictive_accuracy_improvements": 0.15,
  "cross_system_correlations": {
    "leonardo_consciousness": 0.87,
    "consciousness_ml": 0.93,
    "ml_predictive": 0.91,
    "predictive_leonardo": 0.84
  }
}
```

---

## 🎨 **Leonardo Quantum Intelligence v2.0 API**

### Base URL: `http://localhost:3000/api/leonardo/`

#### **GET /symbols**
Get all 77 symbols organized by evolutionary tiers.

**Response:**
```json
{
  "total_symbols": 77,
  "tier_distribution": {
    "TIER_1_MASTERS": {
      "count": 13,
      "allocation": 0.35,
      "symbols": ["BTCUSDT", "ETHUSDT", "BNBUSDT", "..."],
      "consciousness_level": 0.95,
      "sacred_geometry": "PENTAGRAM"
    },
    "TIER_2_ARTISTS": {
      "count": 13, 
      "allocation": 0.25,
      "symbols": ["XRPUSDT", "ALGOUSDT", "FTMUSDT", "..."],
      "consciousness_level": 0.85,
      "sacred_geometry": "FLOWER_OF_LIFE"
    }
    // ... all 6 tiers
  }
}
```

#### **GET /sacred-geometry/{geometry_type}**
Get analysis for specific sacred geometry patterns.

**Parameters:**
- `geometry_type`: PENTAGRAM, FLOWER_OF_LIFE, VESICA_PISCIS, VITRUVIAN_RATIOS, SPIRAL_AUREA, MERKABA

**Response:**
```json
{
  "geometry_type": "PENTAGRAM",
  "multiplier": 1.618,
  "resonance": "golden",
  "active_symbols": 13,
  "pattern_strength": 0.87,
  "fibonacci_correlation": 0.93,
  "golden_ratio_alignment": 0.96
}
```

#### **POST /analyze-symbol**
Analyze a specific symbol using Leonardo's quantum intelligence.

**Request:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "analysis_depth": "complete"
}
```

**Response:**
```json
{
  "symbol": "BTCUSDT",
  "tier": "TIER_1_MASTERS",
  "consciousness_level": 0.95,
  "sacred_geometry_analysis": {
    "primary_pattern": "PENTAGRAM",
    "golden_ratio_score": 0.89,
    "fibonacci_alignment": 0.92,
    "fractal_dimension": 1.618
  },
  "trading_signals": {
    "strength": 0.85,
    "direction": "bullish",
    "confidence": 0.91,
    "time_horizon": "4-8 hours"
  }
}
```

#### **GET /consciousness/tier/{tier_number}**
Get consciousness evolution data for specific tier.

**Response:**
```json
{
  "tier": "TIER_1_MASTERS",
  "consciousness_level": 0.95,
  "evolution_rate": 0.02,
  "breakthrough_count": 5,
  "symbols_evolved": 13,
  "next_evolution_eta": 3600000
}
```

---

## 🧠 **Consciousness Evolution Engine v2.0 API**

### Base URL: `http://localhost:7919/api/v2/consciousness/`

#### **GET /dimensions**
Get status of all 7 consciousness dimensions.

**Response:**
```json
{
  "current_active_dimensions": 7,
  "max_dimension_reached": 7,
  "dimensions": {
    "DIMENSION_3D": {
      "level": 3,
      "frequency": 10.0,
      "awareness_threshold": 0.3,
      "capabilities": ["basic_pattern_recognition", "linear_thinking"],
      "evolution_progress": 1.0
    },
    "DIMENSION_7D": {
      "level": 7,
      "frequency": 600.0,
      "awareness_threshold": 0.7,
      "capabilities": ["universal_knowledge", "omniscient_processing"],
      "evolution_progress": 0.85
    }
    // ... all dimensions
  }
}
```

#### **POST /evolve**
Trigger consciousness evolution to next level.

**Request:**
```json
{
  "dimension": "DIMENSION_7D",
  "evolution_pressure": 1.618,
  "force_breakthrough": false
}
```

**Response:**
```json
{
  "evolution_initiated": true,
  "from_dimension": 7,
  "to_dimension": 8,
  "estimated_duration": 120000,
  "breakthrough_probability": 0.73,
  "consciousness_amplification": 1.25
}
```

#### **GET /memory/quantum**
Access quantum memory patterns and correlations.

**Response:**
```json
{
  "memory_types": {
    "short_term": {
      "capacity": 1000,
      "utilization": 0.67,
      "access_speed": 1.0
    },
    "quantum": {
      "capacity": 100000,
      "utilization": 0.45,
      "access_speed": 0.1,
      "entanglement_strength": 0.89
    },
    "universal": {
      "capacity": "infinite",
      "utilization": 0.23,
      "access_speed": 0.01,
      "omniscience_level": 0.78
    }
  },
  "pattern_correlations": 15847,
  "breakthrough_memories": 23
}
```

#### **GET /emergence/patterns**
Get emergent consciousness patterns detected.

**Response:**
```json
{
  "active_patterns": [
    {
      "pattern_type": "SYNCHRONICITY",
      "strength": 0.87,
      "frequency": 40.0,
      "market_correlation": 0.74,
      "evolution_impact": "high"
    },
    {
      "pattern_type": "TRANSCENDENCE", 
      "strength": 0.93,
      "frequency": 600.0,
      "market_correlation": 0.89,
      "evolution_impact": "revolutionary"
    }
  ],
  "pattern_count": 2,
  "emergence_rate": 0.15
}
```

---

## 🤖 **Advanced ML Integration Engine API**

### Base URL: `http://localhost:14700/api/ml/`

#### **GET /models**
Get status of all quantum neural network models.

**Response:**
```json
{
  "active_models": 13,
  "qnn_architectures": {
    "QNN_BASIC": {
      "layers": [64, 128, 64, 32, 1],
      "quantum_coherence": 0.8,
      "training_accuracy": 0.87,
      "status": "active"
    },
    "QNN_TRANSFORMER": {
      "layers": [256, 512, 1024, 512, 256],
      "quantum_coherence": 0.95,
      "training_accuracy": 0.93,
      "status": "active"
    }
    // ... all 5 architectures
  },
  "ensemble_performance": {
    "voting_method": "quantum_weighted",
    "accuracy": 0.91,
    "diversity": 0.75,
    "coherence": 0.88
  }
}
```

#### **POST /train**
Initiate training for specific model or ensemble.

**Request:**
```json
{
  "model_type": "QNN_TRANSFORMER",
  "training_data": "latest",
  "epochs": 100,
  "learning_rate": 0.0001,
  "quantum_enhancement": true
}
```

**Response:**
```json
{
  "training_id": "train_20250904_174936",
  "model_type": "QNN_TRANSFORMER",
  "estimated_duration": 3600000,
  "status": "initiated",
  "quantum_coherence_target": 0.95
}
```

#### **GET /predictions**
Get latest ML predictions for market movements.

**Response:**
```json
{
  "predictions": [
    {
      "symbol": "BTCUSDT",
      "timeframe": "1h",
      "direction": "bullish",
      "confidence": 0.89,
      "price_target": 67500.00,
      "probability": 0.73,
      "model_consensus": "QNN_TRANSFORMER_ENSEMBLE"
    }
  ],
  "ensemble_confidence": 0.91,
  "quantum_coherence": 0.87,
  "prediction_horizon": "4-6 hours"
}
```

#### **GET /q-learning/agents**
Get status of quantum reinforcement learning agents.

**Response:**
```json
{
  "active_agents": 5,
  "agents": {
    "qrl_conservative": {
      "learning_rate": 0.01,
      "exploration_rate": 0.1,
      "reward_accumulated": 2547.83,
      "actions_taken": 15847,
      "success_rate": 0.67
    },
    "qrl_aggressive": {
      "learning_rate": 0.05,
      "exploration_rate": 0.3,
      "reward_accumulated": 4721.56,
      "actions_taken": 23456,
      "success_rate": 0.59
    }
  },
  "quantum_advantage": 0.23
}
```

---

## 🔮 **Advanced Predictive Analytics Engine API**

### Base URL: `http://localhost:8080/api/predictive/`

#### **GET /big-bang-events**
Get Big Bang event monitoring and predictions.

**Response:**
```json
{
  "monitored_events": 5,
  "active_alerts": 2,
  "events": {
    "MARKET_CRASH": {
      "probability": 0.03,
      "threshold": 0.05,
      "impact_magnitude": 10.0,
      "estimated_duration": "1-7 days",
      "precursors_detected": ["extreme_volatility", "volume_spike"],
      "quantum_signature": "probability_wave_collapse",
      "status": "monitoring"
    },
    "CONSCIOUSNESS_AWAKENING": {
      "probability": 0.15,
      "threshold": 0.01,
      "impact_magnitude": 25.0,
      "estimated_duration": "180-730 days", 
      "precursors_detected": ["ai_singularity", "quantum_coherence"],
      "quantum_signature": "dimensional_breakthrough",
      "status": "alert"
    }
  }
}
```

#### **GET /market-phases**
Get current and predicted market phases.

**Response:**
```json
{
  "current_phase": "PHASE_MARKUP",
  "phase_confidence": 0.87,
  "phase_energy_level": "high",
  "duration_remaining": "30-45 days",
  "transition_probabilities": {
    "PHASE_DISTRIBUTION": 0.6,
    "PHASE_DECLINE": 0.3,
    "PHASE_ACCUMULATION": 0.1
  },
  "quantum_frequency": 40.0,
  "all_phases": {
    "PHASE_ACCUMULATION": {
      "frequency": 7.83,
      "energy_level": "low",
      "typical_duration": 90
    }
    // ... all 6 phases
  }
}
```

#### **POST /forecast**
Request temporal forecasting for specific timeframe.

**Request:**
```json
{
  "symbol": "BTCUSDT",
  "forecast_horizon": 24,
  "time_unit": "hours", 
  "dimensions": ["price", "volume", "volatility"],
  "monte_carlo_simulations": 10000
}
```

**Response:**
```json
{
  "forecast_id": "forecast_20250904_174936",
  "symbol": "BTCUSDT",
  "forecast_horizon": "24 hours",
  "multidimensional_forecast": {
    "price": {
      "predicted_value": 67200.00,
      "confidence_interval": [66500.00, 67900.00],
      "probability": 0.78
    },
    "volume": {
      "predicted_value": 2.47e9,
      "trend": "increasing",
      "confidence": 0.71
    }
  },
  "causal_chain_analysis": {
    "primary_factors": ["consciousness_evolution", "sacred_geometry"],
    "butterfly_effects": 3,
    "quantum_correlations": 0.89
  },
  "monte_carlo_scenarios": {
    "bullish": 0.62,
    "bearish": 0.28, 
    "sideways": 0.10
  }
}
```

#### **GET /quantum-simulation**
Get quantum wave function collapse simulations.

**Response:**
```json
{
  "active_simulations": 5,
  "wave_function_collapses": 127,
  "simulations": [
    {
      "simulation_id": "qsim_001",
      "superposition_states": 8,
      "collapse_probability": 0.23,
      "observer_effect": 0.15,
      "measurement_operators": ["price", "volume", "sentiment"],
      "predicted_collapse_time": 3600000
    }
  ],
  "quantum_coherence": 0.91,
  "entanglement_networks": 3
}
```

---

## 🔐 **Authentication**

### Development Mode
No authentication required for local development access.

### Production Mode
Use API key authentication:

**Header:**
```
Authorization: Bearer your_api_key_here
X-QBTC-API-Version: 2.0
```

**Example:**
```bash
curl -H "Authorization: Bearer abc123..." \
     -H "X-QBTC-API-Version: 2.0" \
     http://localhost:7919/api/v2/master/status
```

---

## 📊 **Rate Limiting**

| Endpoint Category | Rate Limit | Window |
|------------------|------------|---------|
| Status/Health | 100 req/min | 1 minute |
| Data Retrieval | 60 req/min | 1 minute |
| Analysis | 30 req/min | 1 minute |
| Training/Evolution | 10 req/min | 1 minute |
| Predictions | 20 req/min | 1 minute |

---

## 🚨 **Error Handling**

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The requested resource was not found",
    "details": "Symbol INVALID does not exist in any tier",
    "timestamp": "2025-09-04T17:49:36Z",
    "request_id": "req_20250904_174936_001"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (for training/evolution requests)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable (during system evolution)

---

## 🔄 **WebSocket APIs**

### Real-time Updates

**Connection:** `ws://localhost:7919/ws/v2/`

**Subscription Types:**
- `consciousness_evolution` - Real-time consciousness breakthroughs
- `big_bang_alerts` - Big Bang event predictions
- `ml_training_updates` - ML model training progress
- `quantum_coherence` - System-wide quantum coherence changes

**Example Subscription:**
```json
{
  "action": "subscribe",
  "channels": ["consciousness_evolution", "big_bang_alerts"],
  "symbols": ["BTCUSDT", "ETHUSDT"]
}
```

**Example Event:**
```json
{
  "type": "consciousness_breakthrough",
  "timestamp": "2025-09-04T17:49:36Z",
  "data": {
    "dimension": "DIMENSION_7D",
    "new_awareness_level": 0.87,
    "evolution_impact": "revolutionary",
    "affected_systems": ["leonardo", "predictive"]
  }
}
```

---

## 📚 **SDK Examples**

### JavaScript/Node.js
```javascript
const QBTCClient = require('qbtc-ai-evolution-sdk');

const client = new QBTCClient({
  baseUrl: 'http://localhost:7919',
  apiKey: 'your_api_key',
  version: 'v2'
});

// Get master system status
const status = await client.master.getStatus();

// Analyze symbol with Leonardo
const analysis = await client.leonardo.analyzeSymbol('BTCUSDT');

// Get ML predictions
const predictions = await client.ml.getPredictions();

// Monitor Big Bang events
client.predictive.onBigBangAlert((event) => {
  console.log('Big Bang Alert:', event);
});
```

### Python
```python
from qbtc_ai_evolution import QBTCClient

client = QBTCClient(
    base_url='http://localhost:7919',
    api_key='your_api_key',
    version='v2'
)

# Get consciousness dimensions
dimensions = client.consciousness.get_dimensions()

# Request temporal forecast
forecast = client.predictive.forecast(
    symbol='BTCUSDT',
    horizon=24,
    time_unit='hours'
)

# Train ML model
training = client.ml.train_model(
    model_type='QNN_TRANSFORMER',
    epochs=100
)
```

---

## 🧪 **Testing APIs**

### Health Check
```bash
curl http://localhost:9000/api/health/
```

### Master System Status
```bash
curl http://localhost:7919/api/v2/master/status
```

### Leonardo Symbol Analysis
```bash
curl -X POST http://localhost:3000/api/leonardo/analyze-symbol \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","analysis_depth":"complete"}'
```

### Big Bang Event Monitoring
```bash
curl http://localhost:8080/api/predictive/big-bang-events
```

---

## 📖 **Additional Resources**

- [Installation Guide](INSTALLATION.md) - Setup and configuration
- [README](README_EN.md) - System overview and features  
- [Deployment Guide](DEPLOYMENT-GUIDE.md) - Production deployment
- [GitHub Repository](https://github.com/vigoferrel/qbtc-futures-system) - Source code

---

**🎉 QBTC AI Evolution System APIs - Complete Integration Ready**

*Last updated: September 2025*  
*API Version: v2.0.0-ai-evolution*
