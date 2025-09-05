@echo off
echo Starting Hermetic Admin Server Ultimate...
echo.
start /min cmd /k "node server/hermetic-admin-server.js"
echo Hermetic Admin Server launched in background
echo Dashboard disponible en: http://localhost:8888
timeout /t 3 >nul
exit
