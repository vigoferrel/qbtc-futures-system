# 🔧 **QBTC Installation and Development Guide**

## 📋 **System Requirements**

### **Minimum Requirements**
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn v1.22.0+)
- **Git**: v2.25.0 or higher
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **Valid License Key**: Required for operation

### **Supported Operating Systems**
- Windows 10/11
- macOS 10.15+
- Ubuntu 20.04+ / Debian 11+
- Fedora 35+

---

## 🚀 **Quick Installation**

### **1. Clone Repository**
```bash
# Option 1: HTTPS (authorized users only)
git clone https://github.com/your-org/qbtc-futures-system.git

# Option 2: SSH (recommended for contributors)
git clone git@github.com:your-org/qbtc-futures-system.git

cd qbtc-futures-system
```

### **2. Verify Versions**
```bash
# Verify Node.js
node --version  # Must be v18+

# Verify npm
npm --version   # Must be v8+

# Verify Git
git --version   # Must be v2.25+
```

### **3. Install Dependencies**
```bash
# Using npm (recommended)
npm install

# Or using yarn
yarn install

# Or using pnpm (fastest)
pnpm install
```

**Estimated time**: 3-5 minutes depending on connection.

### **4. Environment Configuration**
```bash
# Copy example file
cp .env.example .env.local

# Edit with your credentials
nano .env.local  # or your preferred editor
```

**Minimum .env.local content:**
```bash
# License (Required)
LICENSE_KEY=your_valid_license_key_here

# Quantum Engine (Required)
QUANTUM_COHERENCE_THRESHOLD=0.1
MAX_LEVERAGE=125
AI_CONFIDENCE_MIN=0.3

# Exchange APIs (Optional)
BINANCE_API_KEY=your_binance_key_here
BYBIT_API_KEY=your_bybit_key_here

# Database (Optional - uses local storage by default)
MONGODB_URI=mongodb://localhost:27017/qbtc
REDIS_URL=redis://localhost:6379

# Development mode
NODE_ENV=development
```

### **5. License Verification**
```bash
# Verify license validity
npm run verify-license

# Display license information
npm run license-info
```

### **6. First Startup**
```bash
# Start development server
npm run dev

# Or with yarn
yarn dev

# Or with pnpm
pnpm dev
```

**The application will be available at:** `http://localhost:8080`

---

## 🔧 **Advanced Configuration**

### **Local Database (Optional)**
If you want to run databases locally:

#### **MongoDB Setup**
```bash
# Install MongoDB locally
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB service
mongod --config /usr/local/etc/mongod.conf
```

#### **Redis Setup**
```bash
# Install Redis locally
# Windows (using Chocolatey)
choco install redis-64

# macOS (using Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Start Redis service
redis-server
```

### **IDE Configuration**

#### **VSCode (Recommended)**
Install recommended extensions:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "ms-vscode.vscode-json"
  ]
}
```

#### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### **Strict TypeScript Configuration**
For development with maximum type safety:
```json
// tsconfig.json (strict configuration)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 🧪 **Testing Configuration**

### **Automatic Configuration**
Tests are pre-configured with Vitest. To run:
```bash
# Tests in watch mode
npm run test

# Tests run once
npm run test:run

# Tests with visual UI
npm run test:ui

# Full coverage
npm run test:coverage

# Quantum-specific tests
npm run test:quantum

# License validation tests
npm run test:license
```

### **Manual Testing Setup**
If you need to reconfigure:
```bash
# Install testing dependencies
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
```

---

## 🚀 **Development Scripts**

```bash
# Development
npm run dev                # Development server
npm run dev:host          # Server accessible from local network
npm run dev:quantum       # Development with quantum debugging

# License Management
npm run verify-license    # Verify license validity
npm run license-info      # Display license information

# Building
npm run build             # Production build
npm run build:dev         # Development build
npm run preview           # Preview build
npm run build:analyze     # Bundle analysis

# Testing
npm run test              # Tests in watch mode
npm run test:run          # Tests run once
npm run test:coverage     # Tests with coverage
npm run test:ui           # Visual UI for tests
npm run test:quantum      # Quantum engine tests
npm run test:ai           # AI system tests
npm run test:risk         # Risk management tests
npm run test:license      # License validation tests

# Code Quality
npm run lint              # ESLint
npm run lint:fix          # ESLint with auto-fix
npm run type-check        # Type verification
npm run format            # Prettier
npm run format:check      # Verify format

# System Health
npm run health-check      # Complete system health check
npm run quantum:status    # Quantum engine status
npm run risk:monitor      # Risk metrics monitoring
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. License Key Error**
```bash
# Error: Invalid or expired license
# Solution: Contact licensing team
email: license-support@qbtc-trading.com

# Or request new license
npm run request-license
```

#### **2. Node.js Version Error**
```bash
# Error: Node.js version not supported
nvm install 18
nvm use 18
```

#### **3. Permission Errors (npm)**
```bash
# Error: EACCES permission denied
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### **4. Port Already in Use**
```bash
# Error: Port 8080 is already in use
npm run dev -- --port 3001
```

#### **5. Memory Error (Building)**
```bash
# Error: JavaScript heap out of memory
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

#### **6. Quantum Engine Not Responding**
```bash
# Error: Quantum coherence too low
npm run quantum:recalibrate

# Check quantum status
npm run quantum:status
```

### **System Health Verification**
```bash
# Verify complete installation
npm run health-check

# Or manually:
node -v && npm -v && git --version
npm list --depth=0
npm run type-check
npm run test:run
npm run verify-license
```

### **Debug Logs**
```bash
# Enable detailed logs
DEBUG=* npm run dev

# Specific Vite logs
DEBUG=vite:* npm run dev

# Quantum system logs
DEBUG=quantum:* npm run dev

# AI system logs
DEBUG=ai:* npm run dev
```

---

## 🔧 **Configuration by Environment**

### **Local Development**
```bash
# .env.development
NODE_ENV=development
DEBUG_MODE=true
API_TIMEOUT=10000
CACHE_TTL=300000
QUANTUM_DEBUG=true
```

### **Testing**
```bash
# .env.test
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/qbtc_test
REDIS_URL=redis://localhost:6379/1
MOCK_TRADING=true
```

### **Staging**
```bash
# .env.staging
NODE_ENV=staging
DEBUG_MODE=false
QUANTUM_COHERENCE_THRESHOLD=0.15
```

### **Production**
```bash
# .env.production
NODE_ENV=production
DEBUG_MODE=false
COMPRESSION=true
ANALYTICS=true
QUANTUM_OPTIMIZATION=true
```

---

## 📊 **Performance Monitoring**

### **Development Metrics**
```bash
# Bundle analyzer
npm run build:analyze

# Performance audit
npm run audit

# Lighthouse CI
npm run lighthouse

# Quantum performance metrics
npm run quantum:benchmark
```

### **Webpack Bundle Analyzer Configuration**
```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    })
  ]
})
```

---

## 🚢 **Deployment**

### **Production Build**
```bash
# Optimized build
npm run build

# Verify build
npm run preview

# Test build
npm run test:e2e  # If you have E2E tests
```

### **Docker (Optional)**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "run", "preview"]
```

```bash
# Build image
docker build -t qbtc-trading-system .

# Run container
docker run -p 8080:8080 \
  -e LICENSE_KEY=your_license_key \
  -e QUANTUM_COHERENCE_THRESHOLD=0.1 \
  qbtc-trading-system
```

---

## 🛡️ **Security Configuration**

### **Environment Security**
```bash
# Generate secure keys
npm run generate-keys

# Encrypt sensitive configuration
npm run encrypt-config

# Validate security setup
npm run security-audit
```

### **SSL/TLS Configuration**
```bash
# Generate self-signed certificates (development only)
npm run generate-certs

# Configure HTTPS for development
npm run dev:https
```

---

## 📞 **Support**

### **Support Channels**
- **Issues**: [GitHub Issues](https://github.com/your-org/qbtc-futures-system/issues) (Licensed users only)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/qbtc-futures-system/discussions)
- **Email**: support@qbtc-trading.com
- **Discord**: [Licensed users community](https://discord.gg/qbtc-trading-licensed)

### **Information for Bug Reports**
Always include:
1. Node.js version (`node -v`)
2. Operating system
3. Steps to reproduce
4. Complete error logs
5. License key status
6. Screenshot if applicable

```bash
# Script to collect system info
npm run system-info
```

---

## ⚠️ **Important Notes**

### **License Requirements**
- Valid license key is required for all operations
- License is verified on startup and periodically during operation
- Unauthorized use will result in system shutdown
- Contact licensing team for renewals or issues

### **Financial Trading Warnings**
- This software operates with real money in volatile markets
- Substantial risk of financial loss
- Only use capital you can afford to lose completely
- Past performance does not guarantee future results

### **System Requirements**
- Stable internet connection required
- Backup systems recommended for production use
- Regular system updates required for security
- Professional installation recommended for enterprise use

---

*Installation guide updated: January 2025*  
*© 2025 QBTC Technologies. All rights reserved.*  
*For licensed users only*
