@echo off
echo ===============================================
echo 🌌 QBTC QUANTUM SYSTEM ULTIMATE LAUNCHER
echo ===============================================
echo.
echo Iniciando sistema cuántico completo...
echo - Quantum Leverage Entropy Engine
echo - Consciousness Evolution Integration  
echo - Real-Time Dashboard
echo - Management Services Integration
echo.

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo [1/3] 🚀 Iniciando Quantum Engine Integration Service...
start "QBTC-Quantum-Integration" cmd /k "node management/quantum-engine-integration-service.js"

timeout /t 3

echo [2/3] 🎯 Iniciando Management Services...
start "QBTC-Risk-Management" cmd /k "node management/risk-management.js"

timeout /t 2

start "QBTC-Emergency-Response" cmd /k "node management/emergency-response.js"

timeout /t 2

start "QBTC-Performance-Tracker" cmd /k "node management/performance-tracker.js"

timeout /t 2

echo [3/3] 📊 Abriendo Quantum Dashboard...
timeout /t 5
start "QBTC-Quantum-Dashboard" "frontend/quantum-dashboard-ultimate.html"

echo.
echo ✅ SISTEMA CUÁNTICO ACTIVADO!
echo.
echo 📡 Servicios disponibles:
echo    - Quantum Integration: http://localhost:14401
echo    - Risk Management: http://localhost:14301  
echo    - Emergency Response: http://localhost:14303
echo    - Performance Tracker: http://localhost:14302
echo.
echo 🌌 Dashboard: quantum-dashboard-ultimate.html
echo 💥 Big Bang System: ARMED
echo 💫 Antimateria Field: MONITORING
echo 🧠 Consciousness Evolution: ACTIVE
echo ⚛️ λ₇₉₁₉ Resonance: CALIBRATED
echo.
echo ⚠️  IMPORTANTE: Ejecutar solo en Paper Trading hasta validación completa
echo.
echo Presiona cualquier tecla para ver el estado del sistema...
pause

REM Mostrar estado de los puertos
echo.
echo 🔍 Verificando puertos activos...
netstat -an | findstr ":14401"
netstat -an | findstr ":14301" 
netstat -an | findstr ":14303"
netstat -an | findstr ":14302"

echo.
echo 🎯 Sistema cuántico operacional. Mantén esta ventana abierta.
echo.
pause
