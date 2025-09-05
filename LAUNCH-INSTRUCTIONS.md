# [ROCKET] QBTC System Launch Instructions
## Complete Guide to Start the Quantum Trading System

### [STAR] **QUICK START**

#### **Option 1: Simple Double-Click Launch** 
```
📁 Double-click: start-qbtc.bat
```
This will automatically launch the entire system with default settings.

#### **Option 2: PowerShell Advanced Launch**
```powershell
# Basic launch (Balanced mode)
.\launch-qbtc-system.ps1

# Advanced options
.\launch-qbtc-system.ps1 -Mode AGGRESSIVE -LogLevel DEBUG

# Dry run (test without starting services)
.\launch-qbtc-system.ps1 -DryRun
```

---

## [WRENCH] **LAUNCH OPTIONS**

### **Trading Modes**
```powershell
# Conservative mode (15 symbols, low risk)
.\launch-qbtc-system.ps1 -Mode CONSERVATIVE

# Balanced mode (35 symbols, medium risk) - DEFAULT
.\launch-qbtc-system.ps1 -Mode BALANCED

# Aggressive mode (49 symbols, high risk)
.\launch-qbtc-system.ps1 -Mode AGGRESSIVE

# Extreme mode (77 symbols, maximum risk)
.\launch-qbtc-system.ps1 -Mode EXTREME
```

### **Additional Parameters**
```powershell
# Skip prerequisites check
.\launch-qbtc-system.ps1 -SkipHealthChecks

# Custom log level
.\launch-qbtc-system.ps1 -LogLevel DEBUG

# Custom startup delay between services
.\launch-qbtc-system.ps1 -StartupDelay 5

# Dry run to see what would start
.\launch-qbtc-system.ps1 -DryRun
```

---

## 🛡️ **PORT ALLOCATION (Anti-Conflict)**

The system uses **port range 14000-14999** to avoid conflicts:

### **Service Blocks**
```
[STAR] Core Services:        14001-14004
[BRAIN] Analysis Engines:     14101-14106  
[TARGET] Execution Engines:    14201-14206
🛡️ Management Systems:   14301-14306
[MONITOR] Dashboard Interfaces: 14401-14406
[GLOBE] API Gateways:         14501-14505
[CHART] Monitoring & Logs:    14601-14606
🛠️ Development/Testing:  14801-14805
```

### **Primary Access Points**
```
[STAR] Master Dashboard:     http://localhost:14401
[CHART] Quantum Analysis:     http://localhost:14402  
[TARGET] Trading Dashboard:    http://localhost:14403
🛡️ Risk Management:      http://localhost:14404
[WRENCH] Admin Panel:          http://localhost:14406
```

---

## [CHECK] **PREREQUISITES**

### **Required Software**
- [CHECK] **Node.js** v16+ (Download from [nodejs.org](https://nodejs.org))
- [CHECK] **npm** packages installed (`npm install`)
- [CHECK] **PowerShell** 5.1+ (Usually pre-installed on Windows)

### **Optional but Recommended**
- [WRENCH] **Git** for version control
- [CHART] **VS Code** for configuration editing
- [GLOBE] **Modern browser** (Chrome, Firefox, Edge)

### **System Requirements**
- [FLOPPY_DISK] **RAM:** 4GB minimum, 8GB+ recommended
- 💿 **Storage:** 2GB free space
- [GLOBE] **Network:** Stable internet for market data
- 🔌 **Ports:** 14000-14999 range available

---

## [MAGNIFY] **TROUBLESHOOTING**

### **Common Issues**

#### **"Node.js not found"**
```bash
# Install Node.js from nodejs.org, then verify:
node --version
npm --version
```

#### **"Port conflicts detected"**
```powershell
# Check what's using the ports:
netstat -ano | findstr :14001

# Kill conflicting process:
taskkill /PID <process_id> /F
```

#### **"npm packages not found"**
```bash
# Install dependencies:
npm install

# If issues persist:
npm install --force
```

#### **"PowerShell execution policy"**
```powershell
# Allow script execution (run as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or use bypass for one-time execution:
powershell -ExecutionPolicy Bypass -File launch-qbtc-system.ps1
```

#### **"Services not starting"**
1. [MAGNIFY] Check logs in `logs/` directory
2. [WARNING] Verify Node.js version compatibility
3. [WRENCH] Try starting in dry-run mode first
4. 🛡️ Check Windows Firewall settings
5. [CHART] Ensure sufficient system resources

---

## [CHART] **MONITORING SYSTEM STATUS**

### **During Startup**
The launcher provides real-time status updates:
```
[STAR] Starting Core Services...
[CHECK] Started successfully: Master Control Hub (PID: 12345)
[CHECK] Started successfully: Message Bus & Event Hub (PID: 12346)
...

[HOSPITAL] Performing health checks...
[CHECK] Healthy: Master Control Hub
[CHECK] Healthy: Quantum Analysis Server
...
```

### **Access Health Endpoints**
```
http://localhost:14001/health      # Master Control
http://localhost:14101/quantum/health  # Quantum Analysis
http://localhost:14201/trading/health  # Trading Engine
http://localhost:14301/risk/health     # Risk Management
```

### **View System Status**
The launcher displays a real-time status dashboard:
```
[CHART] QBTC SYSTEM STATUS
═══════════════════════════════════════════════════════
🔹 Master Control Hub | Port: 14001 | [CHECK] RUNNING | Uptime: 00:05:32
🔹 Quantum Analysis Server | Port: 14101 | [CHECK] RUNNING | Uptime: 00:05:28
...
```

---

## [STOP] **GRACEFUL SHUTDOWN**

### **Normal Shutdown**
- Press `Ctrl+C` in the PowerShell window
- The system will gracefully shutdown all services
- Wait for confirmation message: "🏁 QBTC System shutdown complete"

### **Emergency Shutdown**
If normal shutdown doesn't work:
```powershell
# Find QBTC processes:
Get-Process node | Where-Object {$_.MainWindowTitle -like "*QBTC*"}

# Kill specific process:
Stop-Process -Id <process_id> -Force

# Kill all Node.js processes (nuclear option):
Get-Process node | Stop-Process -Force
```

---

## [MEMO] **LOG FILES**

### **Log Locations**
```
logs/
├── qbtc-startup-YYYYMMDD-HHMMSS.log    # Startup log
├── MasterControl-output.log             # Service outputs
├── MasterControl-error.log              # Service errors
├── QuantumAnalysis-output.log
├── QuantumAnalysis-error.log
└── ...
```

### **Log Levels**
- 🔴 **ERROR**: Critical issues requiring attention
- 🟡 **WARN**: Warnings and recoverable issues  
- 🔵 **INFO**: General information and status
- 🟣 **DEBUG**: Detailed debugging information

---

## [WRENCH] **CONFIGURATION**

### **Environment Variables**
The launcher sets these automatically:
```
QBTC_SERVICE_NAME=<service_name>
QBTC_SERVICE_PORT=<port_number>
QBTC_MODE=<trading_mode>
QBTC_LOG_LEVEL=<log_level>
```

### **Custom Configuration**
Edit service scripts in their respective directories:
- [STAR] Core services: `core/`
- [BRAIN] Analysis engines: `analysis-engine/`
- [TARGET] Execution engines: `execution-engine/`
- 🛡️ Management systems: `management/`
- [MONITOR] Frontend dashboards: `frontend/`

---

## [TARGET] **SUCCESS INDICATORS**

### **System Started Successfully When:**
- [CHECK] All services show "[CHECK] RUNNING" status
- [CHECK] Health checks return "healthy" status
- [CHECK] Dashboard URLs are accessible
- [CHECK] No error messages in startup log
- [CHECK] Process IDs are assigned to all services

### **Ready for Trading When:**
- [STAR] Master Dashboard loads at http://localhost:14401
- [CHART] Quantum matrix updates visible
- [TARGET] Trading signals being generated
- 🛡️ Risk management active
- [MONEY] Portfolio tracking operational

---

## 🆘 **SUPPORT**

### **If Issues Persist:**
1. [CLIPBOARD] Check all prerequisites are met
2. [MEMO] Review startup logs for specific errors
3. [REFRESH] Try restarting with `-DryRun` first
4. [BROOM] Clear logs directory and restart
5. [COMPUTER] Restart computer if port conflicts persist
6. [WRENCH] Verify system meets minimum requirements

### **Advanced Diagnostics**
```powershell
# Test port availability:
Test-NetConnection -Port 14001 -ComputerName localhost

# Check Node.js modules:
npm list --depth=0

# Verify system resources:
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
```

---

## 🎊 **ENJOY TRADING WITH QBTC!**

Once the system is running, you'll have access to:
- [BRAIN] **Quantum Analysis** with λ₇₉₁₉ resonance
- [TARGET] **Automated Trading** across 77 symbols
- 🛡️ **Advanced Risk Management** with multiple protection layers
- [CHART] **Real-time Performance Tracking**
- [GALAXY] **Consciousness-based Trading** evolution

*May your trades be profitable and your consciousness expand! [ROCKET][COMET]*
