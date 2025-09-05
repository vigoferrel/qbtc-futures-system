@echo off
title QBTC System Launcher
color 0B

echo.
echo 🌌══════════════════════════════════════════════════════════════
echo   QBTC QUANTUM BITCOIN TRADING COMPUTER - Quick Launch
echo 🌌══════════════════════════════════════════════════════════════
echo.

REM Check if PowerShell script exists
if not exist "launch-qbtc-system.ps1" (
    echo ❌ ERROR: launch-qbtc-system.ps1 not found!
    echo Please ensure you're in the correct directory.
    pause
    exit /b 1
)

echo 🚀 Starting QBTC System with PowerShell launcher...
echo ⚡ This will launch all services on ports 14000-14999
echo.

REM Execute PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "launch-qbtc-system.ps1"

echo.
echo 📴 QBTC System has been stopped.
pause
