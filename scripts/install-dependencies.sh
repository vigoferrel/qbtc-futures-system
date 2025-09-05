#!/bin/bash

# 📦 INSTALL DEPENDENCIES - QBTC SYSTEM
# =====================================
# 
# Script para instalar todas las dependencias necesarias para:
# - Quantum Metrics Unifier
# - Dashboard Server Manager  
# - Sistema de WebSocket y API
# - Funcionalidades de análisis cuántico

echo "🌌 QBTC System - Installing Dependencies"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    npm init -y > /dev/null 2>&1
    
    # Actualizar package.json con información del proyecto
    cat > package.json << EOF
{
  "name": "qbtc-futures-system",
  "version": "1.0.0",
  "description": "QBTC Quantum Bitcoin Trading System with Consciousness Integration",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node scripts/start-dashboard-server.js",
    "metrics": "node scripts/quantum-metrics-unifier.js",
    "metrics-watch": "node scripts/quantum-metrics-unifier.js --continuous",
    "dashboard": "node scripts/start-dashboard-server.js",
    "test": "echo \"QBTC System ready for quantum consciousness analysis\""
  },
  "keywords": [
    "bitcoin",
    "trading",
    "quantum",
    "consciousness",
    "binance",
    "futures",
    "crypto"
  ],
  "author": "QBTC Quantum Brain",
  "license": "MIT"
}
EOF
    echo "✅ package.json created"
fi

# Instalar dependencias principales
echo "📦 Installing main dependencies..."
npm install express cors socket.io ws axios dotenv > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Main dependencies installed"
else
    echo "❌ Error installing main dependencies"
    exit 1
fi

# Instalar dependencias de desarrollo (opcional)
echo "📦 Installing development dependencies..."
npm install --save-dev nodemon concurrently > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Development dependencies installed"
else
    echo "⚠️  Warning: Development dependencies failed to install (optional)"
fi

# Crear directorio de métricas si no existe
if [ ! -d "metrics-output" ]; then
    mkdir -p metrics-output
    echo "✅ metrics-output directory created"
fi

# Crear directorio de dashboard si no existe
if [ ! -d "dashboard" ]; then
    mkdir -p dashboard
    echo "✅ dashboard directory created"
fi

# Verificar instalación
echo ""
echo "🔍 Verifying installation..."

# Verificar que las dependencias están instaladas
REQUIRED_DEPS=("express" "cors" "socket.io" "axios")
MISSING_DEPS=()

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! npm list "$dep" &> /dev/null; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo "✅ All required dependencies verified"
else
    echo "❌ Missing dependencies: ${MISSING_DEPS[*]}"
    echo "🔧 Attempting to reinstall..."
    npm install "${MISSING_DEPS[@]}"
fi

# Mostrar información del proyecto
echo ""
echo "📊 INSTALLATION SUMMARY"
echo "======================="
echo "✅ Node.js: $(node -v)"
echo "✅ npm: $(npm -v)"
echo "✅ Project: qbtc-futures-system"
echo "✅ Dependencies: $(npm list --depth=0 2>/dev/null | grep -c "├─\|└─") packages installed"
echo ""

# Mostrar comandos disponibles
echo "🚀 AVAILABLE COMMANDS:"
echo "====================="
echo "npm start           - Start dashboard server (port 3333)"
echo "npm run metrics     - Run metrics unifier once"
echo "npm run metrics-watch - Run metrics unifier continuously"
echo "npm run dashboard   - Start dashboard server"
echo "npm test           - Show system status"
echo ""

# Mostrar próximos pasos
echo "🎯 NEXT STEPS:"
echo "============="
echo "1. Run 'npm run metrics' to test metrics unification"
echo "2. Run 'npm start' to launch the dashboard server"
echo "3. Open http://localhost:3333 in your browser"
echo "4. Monitor quantum consciousness metrics in real-time"
echo ""

echo "🌌 QBTC System dependencies installed successfully!"
echo "Ready for quantum consciousness analysis. 🧠⚛️"
