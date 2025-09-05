@echo off
cls
echo ================================
echo  HERMETIC ADMIN SERVER ULTIMATE
echo ================================
echo.
echo Starting Hermetic Admin Server Ultimate in background...
start /min cmd /k "node hermetic-admin-server-ULTIMATE.js"
echo.
echo Waiting for server initialization...
timeout /t 3 /nobreak >nul
echo.
echo ================================
echo  SERVER STATUS
echo ================================
echo Dashboard:     http://localhost:8888/dashboard
echo API Status:    http://localhost:8888/api/system/status
echo WebSocket:     ws://localhost:8888
echo.
echo ================================
echo  QUICK ACTIONS
echo ================================
echo To activate Merkaba:
echo   curl -X POST http://localhost:8888/api/merkaba/activate
echo.
echo To initialize Akashic System:
echo   curl -X POST http://localhost:8888/api/akashic/initialize
echo.
echo To initialize Trader:
echo   curl -X POST http://localhost:8888/api/trader/initialize
echo.
echo ================================
echo  Hermetic Admin Server Ultimate is running!
echo  Press any key to exit this window...
echo ================================
pause >nul
