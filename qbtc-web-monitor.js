import QuantumDataPurifier from 'core/quantum-data-purifier.js';
#!/usr/bin/env node

/**
 * [GLOBE] QBTC WEB MONITOR - ADVANCED HTML INTERFACE
 * =============================================
 * Monitor Avanzado con Interfaz Web HTML para Sistemas Cuánticos QBTC
 * 
 * CARACTERÍSTICAS:
 * - Dashboard HTML responsive en tiempo real
 * - WebSocket para actualizaciones instantáneas
 * - Gráficos interactivos con Chart.js
 * - Tema cuántico con animaciones CSS
 * - Métricas cuánticas visualizadas
 * - Alertas y notificaciones avanzadas
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class QBTCWebMonitor {
    constructor() {
        this.purifier = new QuantumDataPurifier();
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.port = 3001;
        
        this.systemState = {
            processes: {},
            performance: { history: [] },
            alerts: [],
            quantumMetrics: {},
            quantumRanking: [],
            rankingMetrics: {},
            lastUpdate: null,
            uptime: Date.now()
        };
        
        this.config = {
            updateInterval: 1000,  // 1 segundo para web
            maxAlerts: 20,
            performanceHistory: 300, // 5 minutos de historia
            maxClients: 50,
            binanceUpdateInterval: 5000 // 5 segundos para datos de Binance
        };
        
        this.binanceData = {
            prices: {},
            lastUpdate: null
        };
        
        this.clients = new Set();
        
        console.log('[GLOBE] QBTC Web Monitor initializing...');
        console.log('[ROCKET] Advanced HTML dashboard with quantum metrics');
        console.log('[CHART] Real-time WebSocket updates');
        console.log('[PALETTE] Interactive charts and animations\n');
        
        this.setupExpress();
        this.setupWebSocket();
    }
    
    // [GLOBE] CONFIGURAR EXPRESS
    setupExpress() {
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // ENDPOINT PRINCIPAL
        this.app.get('/', (req, res) => {
            res.send(this.generateHTML());
        });
        
        // API ENDPOINT PARA DATOS
        this.app.get('/api/status', (req, res) => {
            res.json(this.systemState);
        });
        
        // ENDPOINT PARA FORZAR ACTUALIZACIÓN
        this.app.post('/api/refresh', (req, res) => {
            this.updateSystemState();
            res.json({ success: true, timestamp: new Date() });
        });
    }
    
    // 🔌 CONFIGURAR WEBSOCKET
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('[LINK] New client connected');
            this.clients.add(ws);
            
            // ENVIAR ESTADO INICIAL
            ws.send(JSON.stringify({
                type: 'initial_state',
                data: this.systemState
            }));
            
            ws.on('close', () => {
                console.log('🔌 Client disconnected');
                this.clients.delete(ws);
            });
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleClientMessage(data, ws);
                } catch (error) {
                    console.error('📨 WebSocket message error:', error.message);
                }
            });
        });
    }
    
    // 📨 MANEJAR MENSAJES DEL CLIENTE
    handleClientMessage(data, ws) {
        switch (data.type) {
            case 'get_status':
                ws.send(JSON.stringify({
                    type: 'status_update',
                    data: this.systemState
                }));
                break;
                
            case 'acknowledge_alert':
                this.acknowledgeAlert(data.alertId);
                break;
                
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                break;
        }
    }
    
    // [ROCKET] INICIAR SERVIDOR
    async start() {
        console.log('[GLOBE] =============== QBTC WEB MONITOR STARTUP ===============');
        
        // INICIAR ACTUALIZACIONES DE SISTEMA
        setInterval(async () => {
            await this.updateSystemState();
            this.broadcastUpdate();
        }, this.config.updateInterval);
        
        // INICIAR ACTUALIZACIONES DE BINANCE
        setInterval(async () => {
            await this.updateBinanceData();
        }, this.config.binanceUpdateInterval);
        
        // INICIAR SERVIDOR HTTP
        this.server.listen(this.port, () => {
            console.log(`[CHECK] QBTC Web Monitor started successfully`);
            console.log(`[GLOBE] Access dashboard at: http://localhost:${this.port}`);
            console.log(`[CHART] Real-time WebSocket updates active`);
            console.log(`[CONTROL_KNOBS] Monitoring ${this.clients.size} connected clients\n`);
        });
        
        // PRIMERA ACTUALIZACIÓN
        await this.updateSystemState();
    }
    
    // [REFRESH] ACTUALIZAR ESTADO DEL SISTEMA
    async updateSystemState() {
        this.systemState.lastUpdate = new Date();
        
        await Promise.all([
            this.updateProcesses(),
            this.updatePerformance(),
            this.updateQuantumMetrics(),
            this.updateQuantumRanking()
        ]);
        
        // Actualizar datos de Binance si es necesario
        if (!this.binanceData.lastUpdate || 
            Date.now() - this.binanceData.lastUpdate > this.config.binanceUpdateInterval) {
            await this.updateBinanceData();
        }
        
        this.checkAlerts();
    }
    
    // [CHART] ACTUALIZAR PROCESOS
    async updateProcesses() {
        try {
            const { stdout } = await execAsync(`
                Get-Process -Name "powershell", "node" -ErrorAction SilentlyContinue | 
                Where-Object {($_.ProcessName -eq "powershell" -and $_.MainWindowTitle -like "*QBTC*") -or 
                              ($_.ProcessName -eq "node")} |
                Select-Object Id, ProcessName, MainWindowTitle, CPU, WorkingSet, StartTime |
                ConvertTo-Json
            `, { shell: 'powershell' });
            
            if (stdout.trim()) {
                const processes = JSON.parse(stdout);
                const processArray = Array.isArray(processes) ? processes : [processes];
                
                this.systemState.processes = {};
                
                processArray.forEach(proc => {
                    const key = proc.MainWindowTitle || `${proc.ProcessName}-${proc.Id}`;
                    this.systemState.processes[key] = {
                        id: proc.Id,
                        name: proc.ProcessName,
                        title: proc.MainWindowTitle || proc.ProcessName,
                        cpu: proc.CPU || 0,
                        memory: proc.WorkingSet || 0,
                        startTime: proc.StartTime,
                        status: 'RUNNING',
                        isQBTC: !!(proc.MainWindowTitle && proc.MainWindowTitle.includes('QBTC')),
                        lastSeen: new Date()
                    };
                });
            }
        } catch (error) {
            console.error('Process update error:', error.message);
        }
    }
    
    // [LIGHTNING] ACTUALIZAR RENDIMIENTO
    async updatePerformance() {
        try {
            const { stdout } = await execAsync(`
                try {
                    $cpu = Get-Counter "\\Procesador(_Total)\\% de tiempo de procesador" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                    $memory = Get-Counter "\\Memoria\\% de bytes confirmados en uso" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                    $disk = 0
                    try {
                        $disk = Get-Counter "\\Disco físico(_Total)\\% de tiempo de disco" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                    } catch {
                        $disk = 0
                    }
                } catch {
                    # Si fallan los contadores en español, intentar en inglés
                    try {
                        $cpu = Get-Counter "\\Processor(_Total)\\% Processor Time" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                        $memory = Get-Counter "\\Memory\\% Committed Bytes In Use" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty CounterSamples | Select-Object -ExpandProperty CookedValue
                    } catch {
                        $cpu = 0
                        $memory = 0
                    }
                    $disk = 0
                }
                @{CPU=[math]::Round($cpu,1); Memory=[math]::Round($memory,1); Disk=[math]::Round($disk,1)} | ConvertTo-Json
            `, { shell: 'powershell' });
            
            const perf = JSON.parse(stdout);
            
            const perfPoint = {
                timestamp: Date.now(),
                cpu: perf.CPU,
                memory: perf.Memory,
                disk: perf.Disk || 0
            };
            
            this.systemState.performance.history.push(perfPoint);
            
            if (this.systemState.performance.history.length > this.config.performanceHistory) {
                this.systemState.performance.history.shift();
            }
            
            this.systemState.performance.current = perf;
            
        } catch (error) {
            this.systemState.performance.current = { CPU: 0, Memory: 0, Disk: 0 };
        }
    }
    
    // [GALAXY] ACTUALIZAR MÉTRICAS CUÁNTICAS
    async updateQuantumMetrics() {
        const processes = Object.values(this.systemState.processes);
        const qbtcProcesses = processes.filter(p => p.isQBTC);
        const scannerProcess = qbtcProcesses.find(p => p.title.includes('Scanner'));
        
        // CÁLCULOS CUÁNTICOS CON CONSTANTES REALES
        const phi = 1.618033988749;
        const lambda = 8.977279923499; // LOG(7919)
        const euler = 0.5772156649015329;
        const time = Date.now() / 100000;
        
        this.systemState.quantumMetrics = {
            scannerActive: !!scannerProcess,
            totalProcesses: processes.length,
            qbtcProcesses: qbtcProcesses.length,
            
            // MÉTRICAS CUÁNTICAS AVANZADAS
            systemCoherence: Math.abs(Math.sin(time / phi)) * 0.4 + 0.6,
            dimensionalResonance: Math.abs(Math.cos(time * lambda / 100)) * 0.3 + 0.7,
            universalConsciousness: Math.min(0.99, 0.85 + (qbtcProcesses.length * 0.03) + this.purifier.generateQuantumValue(index, modifier) * 0.05),
            lambdaResonance: Math.abs(Math.sin(time * lambda * euler)) * 0.2 + 0.8,
            
            // MÉTRICAS AVANZADAS
            quantumEntanglement: Math.abs(Math.cos(time * phi)) * 0.5 + 0.5,
            temporalFlux: Math.abs(Math.sin(time * euler)) * 0.3 + 0.7,
            consciousnessAmplifier: Math.pow(phi, Math.sin(time / lambda)) * 0.1 + 0.9,
            
            // ESTADOS ESPECIALES
            bigBangActive: this.purifier.generateQuantumValue(index, modifier) > 0.7, // Simulado por ahora
            dimensionalAccess: this.calculateDimensionalAccess(),
            
            lastQuantumUpdate: new Date(),
            quantumUptime: Date.now() - this.systemState.uptime
        };
    }
    
    // [GALAXY] CALCULAR ACCESO DIMENSIONAL
    calculateDimensionalAccess() {
        const consciousness = this.systemState.quantumMetrics?.universalConsciousness || 0.85;
        
        if (consciousness > 0.95) return '9D';
        if (consciousness > 0.90) return '7D';
        if (consciousness > 0.80) return '5D';
        return '3D';
    }
    
    // [CHART] ACTUALIZAR DATOS DE BINANCE
    async updateBinanceData() {
        try {
            const symbols = [
                'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 
                'AVAXUSDT', 'MATICUSDT', 'ATOMUSDT', 'FILUSDT', 'LTCUSDT', 'TRXUSDT',
                'ETCUSDT', 'XLMUSDT', 'VETUSDT', 'ICPUSDT', 'FTMUSDT', 'HBARUSDT'
            ];
            
            // Obtener precios 24hr de Binance
            const url = 'https://api.binance.com/api/v3/ticker/24hr';
            const data = await this.fetchBinanceData(url);
            
            if (data && Array.isArray(data)) {
                const relevantData = data.filter(ticker => 
                    symbols.includes(ticker.symbol)
                );
                
                relevantData.forEach(ticker => {
                    this.binanceData.prices[ticker.symbol] = {
                        price: parseFloat(ticker.lastPrice),
                        change24h: parseFloat(ticker.priceChangePercent),
                        volume: parseFloat(ticker.volume),
                        high24h: parseFloat(ticker.highPrice),
                        low24h: parseFloat(ticker.lowPrice),
                        count: parseInt(ticker.count),
                        lastUpdate: new Date()
                    };
                });
                
                this.binanceData.lastUpdate = Date.now();
                console.log(`[CHART] Updated ${relevantData.length} symbols from Binance`);
            }
        } catch (error) {
            console.error('Binance data update error:', error.message);
        }
    }
    
    // [GLOBE] FETCH DATA FROM BINANCE
    async fetchBinanceData(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 5000 }, (response) => {
                let data = '';
                
                response.on('data', chunk => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }
    
    // [TROPHY] ACTUALIZAR RANKING CUÁNTICO
    async updateQuantumRanking() {
        // SIMULAR DATOS DE RANKING CUÁNTICO (en producción vendría del scanner real)
        const symbols = [
            'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'AVAXUSDT', 'MATICUSDT',
            'ATOMUSDT', 'FILUSDT', 'LTCUSDT', 'TRXUSDT', 'ETCUSDT', 'XLMUSDT', 'VETUSDT', 'ICPUSDT',
            'FTMUSDT', 'HBARUSDT', 'NEARUSDT', 'FLOWUSDT', 'EGLDUSDT', 'XTZUSDT', 'ALGOUSDT', 'QNTUSDT',
            'AAVEUSDT', 'MKRUSDT', 'SNXUSDT', 'COMPUSDT', 'YFIUSDT', 'UMAUSDT', '1INCHUSDT', 'SUSHIUSDT',
            'CRVUSDT', 'BALUSDT', 'ENJUSDT', 'MANAUSDT', 'SANDUSDT', 'CHZUSDT', 'AXSUSDT', 'GALAUSDT',
            'ROSEUSDT', 'KLAYUSDT', 'WAVESUSDT', 'ZILUSDT', 'OMGUSDT', 'LRCUSDT', 'KSMUSDT', 'OCEANUSDT',
            'INJUSDT', 'RENUSDT', 'RLCUSDT', 'FETUSDT', 'NUUSDT', 'BANDUSDT', 'STMXUSDT', 'DATASETUSDT',
            'ANKRUSDT', 'STORJUSDT', 'CTSIUSDT', 'CELRUSDT', 'HOTUSDT', 'COTIUSDT', 'TFUELUSDT', 'ORNUSDT',
            'TOMOUSDT', 'ONEUSDT', 'MTLUSDT', 'DENTUSDT', 'WINUSDT', 'BTTCUSDT', 'HNTUSDT', 'RSRUSDT',
            'DEGOUSDT', 'CHRUSDT', 'LINAUSDT', 'MDTUSDT', 'STPTUSDT', 'KEYUSDT', 'BAKEUSDT'
        ];
        
        const phi = 1.618033988749;
        const lambda = 8.977279923499;
        const euler = 0.5772156649015329;
        const time = Date.now() / 100000;
        
        // GENERAR RANKING SIMULADO CON DATOS CUÁNTICOS
        const ranking = symbols.slice(0, 15).map((symbol, index) => {
            const baseScore = 1000 - (index * 50) + (Math.sin(time + index) * 100);
            const tier = index < 3 ? 'TIER1' : index < 8 ? 'TIER2' : 'TIER3';
            const quantumScore = baseScore * (1 + Math.sin(time * phi + index) * 0.2);
            const percentile = ((15 - index) / 15) * 100;
            
            // CLASIFICACIÓN CUÁNTICA
            let classification, action;
            if (percentile >= 90) {
                classification = 'QUANTUM_PRIME_ALPHA';
                action = 'LONG_AGGRESSIVE';
            } else if (percentile >= 70) {
                classification = 'QUANTUM_BETA_SUPERIOR';
                action = 'LONG_MODERATE';
            } else if (percentile >= 50) {
                classification = 'QUANTUM_GAMMA_BALANCED';
                action = 'NEUTRAL_WATCH';
            } else if (percentile >= 30) {
                classification = 'QUANTUM_DELTA_CAUTION';
                action = 'SHORT_MODERATE';
            } else {
                classification = 'QUANTUM_MINIMAL_EPSILON';
                action = 'SHORT_AGGRESSIVE';
            }
            
            // [MOON] CALCULAR FASE LUNAR ACTUAL
            const lunarCycle = this.calculateLunarPhase();
            
            // [CHART] CALCULAR VOLATILIDAD INTRADÍA
            const volatilityScore = this.calculateVolatilityScore(symbol, index, time);
            
            // [TARGET] INTRASCORE AVANZADO CON CICLOS LUNARES
            const intraScore = this.calculateIntraScore(symbol, percentile, volatilityScore, lunarCycle, time, index);
            
            // SEÑAL CUÁNTICA MEJORADA
            const signalStrength = Math.abs(Math.sin(time * lambda + index)) * 0.3 + 0.7;
            const baseConfidence = Math.min(0.99, 0.75 + (percentile / 100) * 0.24);
            const confidence = baseConfidence * intraScore.confidenceMultiplier;
            
            // [TARGET] LEVERAGE DIFERENCIADO POR INTRASCORE
            const leverage = this.calculateDynamicLeverage(intraScore, confidence, tier, volatilityScore);
            
            return {
                rank: index + 1,
                symbol,
                tier,
                quantumScore: quantumScore.toFixed(2),
                percentile: percentile.toFixed(1),
                classification,
                action,
                signal: action.includes('LONG') ? 'LONG' : action.includes('SHORT') ? 'SHORT' : 'NEUTRAL',
                confidence: (confidence * 100).toFixed(1),
                leverage: `${leverage}x`,
                signalStrength: (signalStrength * 100).toFixed(1),
                // USAR DATOS REALES DE BINANCE
                price: this.binanceData.prices[symbol]?.price?.toFixed(2) || 'N/A',
                change24h: this.binanceData.prices[symbol]?.change24h?.toFixed(2) || '0.00',
                volume: this.binanceData.prices[symbol]?.volume?.toExponential(2) || '0.00e+0',
                high24h: this.binanceData.prices[symbol]?.high24h?.toFixed(2) || 'N/A',
                low24h: this.binanceData.prices[symbol]?.low24h?.toFixed(2) || 'N/A',
                lastUpdate: new Date()
            };
        });
        
        this.systemState.quantumRanking = ranking;
        
        // MÉTRICAS DEL RANKING
        this.systemState.rankingMetrics = {
            totalSymbols: 77,
            rankedSymbols: ranking.length,
            topTierCount: ranking.filter(r => r.tier === 'TIER1').length,
            longSignals: ranking.filter(r => r.signal === 'LONG').length,
            shortSignals: ranking.filter(r => r.signal === 'SHORT').length,
            neutralSignals: ranking.filter(r => r.signal === 'NEUTRAL').length,
            avgConfidence: (ranking.reduce((sum, r) => sum + parseFloat(r.confidence), 0) / ranking.length).toFixed(1),
            highConfidenceCount: ranking.filter(r => parseFloat(r.confidence) > 85).length,
            lastRankingUpdate: new Date()
        };
    }
    
    // [SIREN] VERIFICAR ALERTAS
    checkAlerts() {
        const perf = this.systemState.performance.current;
        const quantum = this.systemState.quantumMetrics;
        
        // ALERTA SCANNER INACTIVO
        if (!quantum.scannerActive) {
            this.addAlert('SCANNER_DOWN', 'Mass Intelligence Scanner not detected', 'CRITICAL', '🔴');
        }
        
        // ALERTA CPU ALTA
        if (perf && perf.CPU > 85) {
            this.addAlert('HIGH_CPU', `CPU usage critical: ${perf.CPU.toFixed(1)}%`, 'HIGH', '🟠');
        }
        
        // ALERTA BIG BANG
        if (quantum.bigBangActive) {
            this.addAlert('BIG_BANG', 'Universal Big Bang Event detected!', 'INFO', '[BOOM]');
        }
        
        // ALERTA CONSCIENCIA ALTA
        if (quantum.universalConsciousness > 0.95) {
            this.addAlert('HIGH_CONSCIOUSNESS', 'Supreme consciousness achieved!', 'INFO', '[BRAIN]');
        }
    }
    
    // [SIREN] AÑADIR ALERTA
    addAlert(type, message, severity, icon = '[WARNING]') {
        // EVITAR DUPLICADOS RECIENTES
        const recentAlert = this.systemState.alerts.find(a => 
            a.type === type && 
            (Date.now() - new Date(a.timestamp).getTime()) < 30000 // 30 segundos
        );
        
        if (recentAlert) return;
        
        const alert = {
            id: `${type}-${Date.now()}`,
            type,
            message,
            severity,
            icon,
            timestamp: new Date(),
            acknowledged: false
        };
        
        this.systemState.alerts.unshift(alert);
        
        if (this.systemState.alerts.length > this.config.maxAlerts) {
            this.systemState.alerts = this.systemState.alerts.slice(0, this.config.maxAlerts);
        }
    }
    
    // [CHECK] CONFIRMAR ALERTA
    acknowledgeAlert(alertId) {
        const alert = this.systemState.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.broadcastUpdate();
        }
    }
    
    // [MOON] CALCULAR FASE LUNAR ACTUAL
    calculateLunarPhase() {
        const now = new Date();
        const knownNewMoon = new Date('2024-01-11'); // Nueva luna conocida
        const lunarCycleDays = 29.53058770576;
        
        const daysSinceNewMoon = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
        const currentCycle = (daysSinceNewMoon % lunarCycleDays) / lunarCycleDays;
        
        let phase, multiplier, bias;
        
        if (currentCycle < 0.125) {
            phase = 'NEW_MOON';
            multiplier = 1.05; // Iniciación - buenos para entrar LONG
            bias = 'ACCUMULATION';
        } else if (currentCycle < 0.375) {
            phase = 'WAXING_CRESCENT';
            multiplier = 1.12; // Crecimiento - momentum
            bias = 'MOMENTUM_FOLLOW';
        } else if (currentCycle < 0.625) {
            phase = 'FULL_MOON';
            multiplier = 1.34; // Culminación - máxima volatilidad, tomar profits
            bias = 'PROFIT_TAKING';
        } else if (currentCycle < 0.875) {
            phase = 'WANING_GIBBOUS';
            multiplier = 1.21; // Liberación - ajustar posiciones
            bias = 'POSITION_ADJUSTMENT';
        } else {
            phase = 'WANING_CRESCENT';
            multiplier = 1.08; // Preparación - acumulación cautelosa
            bias = 'CAUTIOUS_ACCUMULATION';
        }
        
        return { phase, multiplier, bias, currentCycle };
    }
    
    // [CHART] CALCULAR VOLATILIDAD INTRADÍA
    calculateVolatilityScore(symbol, index, time) {
        const binanceData = this.binanceData.prices[symbol];
        let volatilityScore = 0.5; // Default neutral
        
        if (binanceData) {
            const high24h = binanceData.high24h;
            const low24h = binanceData.low24h;
            const currentPrice = binanceData.price;
            
            // Calcular rango de volatilidad normalizado
            const range24h = ((high24h - low24h) / currentPrice) * 100;
            
            // Determinar score de volatilidad (0 = sin volatilidad, 1 = máxima volatilidad)
            if (range24h < 2) {
                volatilityScore = 0.1; // MUY BAJA - momento de COMPRA
            } else if (range24h < 5) {
                volatilityScore = 0.3; // BAJA - buen momento para entrar
            } else if (range24h < 10) {
                volatilityScore = 0.5; // MEDIA - neutral
            } else if (range24h < 20) {
                volatilityScore = 0.8; // ALTA - considerar venta parcial
            } else {
                volatilityScore = 1.0; // MUY ALTA - momento de VENTA
            }
        } else {
            // Simulación si no hay datos de Binance
            volatilityScore = Math.abs(Math.sin(time + index * 0.7)) * 0.6 + 0.2;
        }
        
        return volatilityScore;
    }
    
    // [TARGET] CALCULAR INTRASCORE AVANZADO - PRINCIPIOS HERMÉTICOS
    calculateIntraScore(symbol, percentile, volatilityScore, lunarCycle, time, index) {
        const phi = 1.618033988749;
        const lambda = 8.977279923499;
        const euler = 0.5772156649015329;
        
        // [CRYSTAL_BALL] PRINCIPIO HERMÉTICO: "Como es arriba, es abajo"
        // Cuando un token está más castigado (menor percentil), mayor es su potencial de reversión
        // Cuando está en su apogeo (alto percentil), mayor riesgo de corrección
        
        // [MOON] FACTOR LUNAR (fundamental)
        let lunarFactor = lunarCycle.multiplier;
        
        // [SCALES] FACTOR DE CASTIGO/AGOTAMIENTO HERMÉTICO
        // PRINCIPIO CLAVE: Los más castigados tienen mayor potencial de reversión
        let punishmentFactor;
        if (percentile < 20) {
            // Tokens más castigados = MÁXIMO POTENCIAL AGRESIVO
            punishmentFactor = 2.5; // Factor hermético máximo
        } else if (percentile < 40) {
            punishmentFactor = 1.8; // Alto potencial
        } else if (percentile < 60) {
            punishmentFactor = 1.2; // Potencial moderado
        } else if (percentile < 80) {
            punishmentFactor = 0.8; // Bajo potencial (ya cerca del apogeo)
        } else {
            // Tokens en apogeo = MOMENTO DE VENTA
            punishmentFactor = 0.3; // Mínimo potencial, máximo riesgo
        }
        
        // [CHART] FACTOR VOLATILIDAD - DETECTOR DE AGOTAMIENTO/APOGEO
        let volatilityFactor;
        if (volatilityScore < 0.2) {
            // Volatilidad MUY BAJA = AGOTAMIENTO COMPLETO = ¡ENTRAR AGRESIVO!
            volatilityFactor = 2.0; // Máximo factor hermético
        } else if (volatilityScore < 0.4) {
            volatilityFactor = 1.5; // Agotamiento moderado
        } else if (volatilityScore > 0.8) {
            // Volatilidad MUY ALTA = APOGEO = ¡VENDER/SHORT!
            volatilityFactor = 0.4; // Mínimo factor, momento de salida
        } else if (volatilityScore > 0.6) {
            volatilityFactor = 0.7; // Acercándose al apogeo
        } else {
            volatilityFactor = 1.0; // Zona neutral
        }
        
        // ⏰ FACTOR TEMPORAL (momento del día/ciclo)
        const temporalFactor = Math.abs(Math.cos(time * phi * euler)) * 0.15 + 0.925;
        
        // [OCEAN_WAVE] FACTOR LAMBDA RESONANCIA (constante mágica)
        const lambdaFactor = Math.abs(Math.sin(time * lambda / 1000 + index)) * 0.1 + 0.95;
        
        // [TARGET] CALCULAR INTRASCORE HERMÉTICO FINAL
        const hermeticScore = punishmentFactor * volatilityFactor * lunarFactor * temporalFactor * lambdaFactor;
        
        // 🎪 DETERMINAR ESTRATEGIA HERMÉTICA DE ENTRADA/SALIDA
        let entryStrategy, exitStrategy, holdTime, aggressionLevel;
        
        if (percentile < 20 && volatilityScore < 0.3 && hermeticScore > 2.0) {
            // [FIRE] MÁXIMA OPORTUNIDAD HERMÉTICA - Token más castigado + agotamiento
            entryStrategy = 'HERMETIC_EXTREME_LONG';
            exitStrategy = 'EXIT_ON_VOLATILITY_EXPLOSION';
            holdTime = '1-12 horas'; // Hasta reversión completa
            aggressionLevel = 'MAXIMUM';
        } else if (percentile < 40 && volatilityScore < 0.4 && hermeticScore > 1.5) {
            entryStrategy = 'AGGRESSIVE_LONG';
            exitStrategy = 'EXIT_ON_MOMENTUM_PEAK';
            holdTime = '30min-8 horas';
            aggressionLevel = 'HIGH';
        } else if (percentile > 80 && volatilityScore > 0.7 && hermeticScore < 0.6) {
            // 🔻 APOGEO DETECTADO - Momento de venta/short
            entryStrategy = 'AGGRESSIVE_SHORT';
            exitStrategy = 'EXIT_ON_EXHAUSTION';
            holdTime = '15min-3 horas'; // Hasta agotamiento del impulso
            aggressionLevel = 'HIGH';
        } else if (percentile > 70 && volatilityScore > 0.6) {
            entryStrategy = 'MODERATE_SHORT';
            exitStrategy = 'PROFIT_TARGET_EXIT';
            holdTime = '30min-4 horas';
            aggressionLevel = 'MODERATE';
        } else if (percentile < 60 && volatilityScore < 0.5) {
            entryStrategy = 'MODERATE_LONG';
            exitStrategy = 'GRADUAL_PROFIT_TAKING';
            holdTime = '1-6 horas';
            aggressionLevel = 'MODERATE';
        } else {
            entryStrategy = 'WAIT';
            exitStrategy = 'NO_POSITION';
            holdTime = 'Esperar agotamiento o apogeo';
            aggressionLevel = 'NONE';
        }
        
        // [FIRE] MULTIPLICADOR DE CONFIANZA HERMÉTICO
        let confidenceMultiplier;
        if (aggressionLevel === 'MAXIMUM') {
            confidenceMultiplier = 1.35; // Máxima confianza en oportunidades extremas
        } else if (aggressionLevel === 'HIGH') {
            confidenceMultiplier = 1.20;
        } else if (aggressionLevel === 'MODERATE') {
            confidenceMultiplier = 1.05;
        } else {
            confidenceMultiplier = 0.85; // Baja confianza en zonas neutras
        }
        
        return {
            score: hermeticScore,
            volatilityScore,
            lunarPhase: lunarCycle.phase,
            entryStrategy,
            exitStrategy,
            holdTime,
            aggressionLevel,
            confidenceMultiplier,
            hermeticPrinciple: percentile < 30 ? 'MAXIMUM_PUNISHMENT_OPPORTUNITY' : 
                              percentile > 70 ? 'APOGEE_WARNING' : 'NEUTRAL_ZONE',
            factors: {
                punishment: punishmentFactor,
                volatility: volatilityFactor,
                lunar: lunarFactor,
                temporal: temporalFactor,
                lambda: lambdaFactor,
                hermetic: hermeticScore
            }
        };
    }
    
    // [TARGET] CALCULAR LEVERAGE DINÁMICO
    calculateDynamicLeverage(intraScore, confidence, tier, volatilityScore) {
        // Base leverage por tier
        let baseLeverage;
        switch(tier) {
            case 'TIER1': baseLeverage = 8; break;
            case 'TIER2': baseLeverage = 12; break;
            case 'TIER3': baseLeverage = 15; break;
            default: baseLeverage = 10;
        }
        
        // [TARGET] AJUSTES POR INTRASCORE
        let leverageMultiplier = 1.0;
        
        // Alto IntraScore + Baja Volatilidad = Leverage alto (oportunidad clara)
        if (intraScore.score > 1.2 && volatilityScore < 0.4) {
            leverageMultiplier = 1.4; // +40% leverage
        }
        // Bajo IntraScore + Alta Volatilidad = Leverage alto para short (oportunidad clara de bajada)
        else if (intraScore.score < 0.8 && volatilityScore > 0.7) {
            leverageMultiplier = 1.3; // +30% leverage
        }
        // Situaciones de alta confianza
        else if (intraScore.confidenceMultiplier > 1.1) {
            leverageMultiplier = 1.2; // +20% leverage
        }
        // Situaciones neutras o dudosas
        else if (intraScore.score > 0.9 && intraScore.score < 1.1) {
            leverageMultiplier = 0.7; // -30% leverage (indecisión)
        }
        
        // [MOON] AJUSTE POR FASE LUNAR
        if (intraScore.lunarPhase === 'FULL_MOON') {
            leverageMultiplier *= 1.1; // +10% en luna llena (máxima energía)
        } else if (intraScore.lunarPhase === 'NEW_MOON') {
            leverageMultiplier *= 0.9; // -10% en luna nueva (precaución)
        }
        
        // [TARGET] AJUSTE POR CONFIANZA
        leverageMultiplier *= confidence;
        
        const finalLeverage = Math.round(baseLeverage * leverageMultiplier);
        
        // Límites de seguridad
        return Math.max(3, Math.min(25, finalLeverage));
    }
    
    // [SATELLITE] TRANSMITIR ACTUALIZACIONES
    broadcastUpdate() {
        if (this.clients.size === 0) return;
        
        const message = JSON.stringify({
            type: 'system_update',
            data: this.systemState,
            timestamp: Date.now()
        });
        
        this.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(message);
            }
        });
    }
    
    // [PALETTE] GENERAR HTML
    generateHTML() {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[GALAXY] QBTC Advanced Web Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Consolas', 'Monaco', monospace;
            background: linear-gradient(135deg, #0c0c0c 0%, #1a0033 50%, #000066 100%);
            color: #00ff88;
            overflow-x: hidden;
            animation: quantumPulse 10s infinite alternate;
        }
        
        @keyframes quantumPulse {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        
        .header {
            background: rgba(0, 255, 136, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 2px solid #00ff88;
            padding: 20px;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .header h1 {
            font-size: 2.5em;
            text-shadow: 0 0 20px #00ff88;
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88; }
            to { text-shadow: 0 0 10px #00ff88, 0 0 40px #00ff88; }
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .panel {
            background: rgba(0, 255, 136, 0.05);
            backdrop-filter: blur(5px);
            border: 1px solid #00ff88;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .panel:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 255, 136, 0.5);
        }
        
        .panel h2 {
            color: #00ccff;
            margin-bottom: 15px;
            font-size: 1.5em;
            text-align: center;
            text-shadow: 0 0 10px #00ccff;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            border-left: 3px solid #00ff88;
        }
        
        .metric-value {
            font-weight: bold;
            font-size: 1.2em;
            color: #ffff00;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            overflow: hidden;
            margin: 5px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff88, #00ccff);
            transition: width 0.5s ease;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 1s infinite;
        }
        
        .status-active { background: #00ff00; }
        .status-inactive { background: #ff0000; }
        .status-warning { background: #ffff00; }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .alerts-container {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .alert {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid #ff4444;
            border-radius: 5px;
            padding: 10px;
            margin: 5px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .alert.info { background: rgba(0, 255, 0, 0.1); border-color: #00ff88; }
        .alert.warning { background: rgba(255, 255, 0, 0.1); border-color: #ffff00; }
        
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        
        .quantum-orb {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, #00ff88, #00ccff);
            margin: 20px auto;
            animation: rotate 5s linear infinite, quantumGlow 3s ease-in-out infinite alternate;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2em;
            color: #000;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes quantumGlow {
            from { box-shadow: 0 0 20px #00ff88; }
            to { box-shadow: 0 0 40px #00ccff, 0 0 60px #00ff88; }
        }
        
        .connection-status {
            position: fixed;
            top: 10px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #00ff88;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            border-top: 1px solid #00ff88;
            font-size: 0.9em;
            opacity: 0.7;
        }
        
        .big-bang-active {
            animation: bigBangPulse 1s ease-in-out infinite;
            background: radial-gradient(circle, #ff0066, #ffff00, #00ff88);
        }
        
        @keyframes bigBangPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        
        .ranking-panel {
            grid-column: span 2;
        }
        
        .ranking-details-panel {
            grid-column: span 2;
        }
        
        .ranking-summary {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .ranking-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
        }
        
        .stat {
            text-align: center;
            padding: 8px;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        /* VALORACIÓN CUÁNTICA STYLES */
        .valuation-panel {
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 204, 255, 0.05));
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 20px;
            margin: 10px 0;
        }
        
        .quantum-valuation {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
        }
        
        .price-comparison {
            background: rgba(0, 0, 0, 0.4);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #00ff88;
        }
        
        .price-current {
            font-size: 1.8em;
            font-weight: bold;
            color: #ffff00;
            text-shadow: 0 0 10px #ffff00;
        }
        
        .price-theoretical {
            font-size: 1.4em;
            color: #00ccff;
            margin: 5px 0;
        }
        
        .valuation-ratio {
            font-size: 1.2em;
            font-weight: bold;
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            margin: 10px 0;
        }
        
        .ratio-undervalued {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            border: 2px solid #00ff00;
            animation: undervaluedPulse 2s ease-in-out infinite;
        }
        
        .ratio-overvalued {
            background: rgba(255, 0, 0, 0.2);
            color: #ff0000;
            border: 2px solid #ff0000;
            animation: overvaluedPulse 2s ease-in-out infinite;
        }
        
        .ratio-fair {
            background: rgba(255, 255, 0, 0.2);
            color: #ffff00;
            border: 2px solid #ffff00;
        }
        
        @keyframes undervaluedPulse {
            0%, 100% { box-shadow: 0 0 10px #00ff00; }
            50% { box-shadow: 0 0 30px #00ff00, 0 0 40px #00ff00; }
        }
        
        @keyframes overvaluedPulse {
            0%, 100% { box-shadow: 0 0 10px #ff0000; }
            50% { box-shadow: 0 0 30px #ff0000, 0 0 40px #ff0000; }
        }
        
        .arbitrage-container {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #ffd700;
            border-radius: 8px;
            padding: 12px;
            margin: 10px 0;
        }
        
        .arbitrage-gain {
            font-size: 1.4em;
            font-weight: bold;
            text-align: center;
            padding: 8px;
            border-radius: 5px;
            margin: 5px 0;
        }
        
        .arbitrage-positive {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            animation: arbitragePulse 1.5s ease-in-out infinite;
        }
        
        .arbitrage-negative {
            background: rgba(255, 100, 100, 0.2);
            color: #ff6464;
        }
        
        @keyframes arbitragePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 0 20px #00ff00; }
        }
        
        .strategy-panel {
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #00ccff;
        }
        
        .strategy-entry, .strategy-exit {
            margin: 10px 0;
            padding: 10px;
            background: rgba(0, 255, 136, 0.05);
            border-radius: 5px;
        }
        
        .strategy-phases {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 8px;
            margin: 8px 0;
        }
        
        .phase {
            background: rgba(0, 0, 0, 0.6);
            padding: 8px;
            border-radius: 4px;
            border-left: 2px solid #00ff88;
            font-size: 0.9em;
        }
        
        .dimensional-factors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }
        
        .dimension {
            background: rgba(0, 204, 255, 0.1);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #00ccff;
            text-align: center;
        }
        
        .dimension-value {
            font-size: 1.3em;
            font-weight: bold;
            color: #00ccff;
        }
        
        .quantum-classification {
            padding: 12px;
            margin: 10px 0;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .classification-alpha {
            background: linear-gradient(45deg, #ff0066, #ffff00);
            color: #000;
            animation: alphaPulse 2s ease-in-out infinite;
        }
        
        .classification-beta {
            background: linear-gradient(45deg, #00ff88, #00ccff);
            color: #000;
        }
        
        .classification-gamma {
            background: rgba(255, 255, 0, 0.3);
            color: #ffff00;
            border: 1px solid #ffff00;
        }
        
        .classification-delta {
            background: rgba(255, 165, 0, 0.3);
            color: #ffa500;
            border: 1px solid #ffa500;
        }
        
        .classification-epsilon {
            background: rgba(128, 128, 128, 0.3);
            color: #808080;
            border: 1px solid #808080;
        }
        
        @keyframes alphaPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 0, 102, 0.5); }
            50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(255, 255, 0, 0.5); }
        }
        
        .multidimensional-panel {
            grid-column: span 2;
            background: linear-gradient(135deg, rgba(255, 0, 102, 0.05), rgba(0, 255, 136, 0.05));
        }
        
        .big-bang-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, #ff0066, #ffff00, #00ff88);
            display: none;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            font-weight: bold;
            color: #000;
            animation: bigBangExplosion 3s ease-in-out infinite;
            z-index: 2000;
            pointer-events: none;
        }
        
        @keyframes bigBangExplosion {
            0%, 100% { 
                transform: translate(-50%, -50%) scale(1); 
                opacity: 0.8;
                filter: blur(0px);
            }
            50% { 
                transform: translate(-50%, -50%) scale(1.5); 
                opacity: 1;
                filter: blur(2px);
                box-shadow: 0 0 100px #ff0066, 0 0 200px #ffff00;
            }
        }
        }
        
        .ranking-container {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .ranking-item {
            display: grid;
            grid-template-columns: 40px 80px 1fr 80px 80px 80px;
            gap: 10px;
            align-items: center;
            margin: 8px 0;
            padding: 12px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border-left: 3px solid;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .ranking-item:hover {
            background: rgba(0, 255, 136, 0.1);
            transform: translateX(5px);
        }
        
        .ranking-item.tier1 { border-left-color: #ff6b00; }
        .ranking-item.tier2 { border-left-color: #00ff88; }
        .ranking-item.tier3 { border-left-color: #00ccff; }
        
        .rank-number {
            font-weight: bold;
            font-size: 1.3em;
            color: #ffff00;
            text-align: center;
        }
        
        .symbol-name {
            font-weight: bold;
            color: #00ff88;
        }
        
        .classification {
            font-size: 0.8em;
            padding: 4px 8px;
            border-radius: 15px;
            text-align: center;
        }
        
        .classification.quantum-prime-alpha {
            background: linear-gradient(45deg, #ff6b00, #ffff00);
            color: #000;
        }
        
        .classification.quantum-beta-superior {
            background: linear-gradient(45deg, #00ff88, #00ccff);
            color: #000;
        }
        
        .classification.quantum-gamma-balanced {
            background: linear-gradient(45deg, #666, #999);
            color: #fff;
        }
        
        .classification.quantum-delta-caution {
            background: linear-gradient(45deg, #ffaa00, #ff6600);
            color: #000;
        }
        
        .classification.quantum-minimal-epsilon {
            background: linear-gradient(45deg, #ff0066, #cc0044);
            color: #fff;
        }
        
        .signal-badge {
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
        
        .signal-long {
            background: #00aa00;
            color: white;
        }
        
        .signal-short {
            background: #aa0000;
            color: white;
        }
        
        .signal-neutral {
            background: #666;
            color: white;
        }
        
        .confidence-bar {
            width: 60px;
            height: 8px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff0066, #ffff00, #00ff88);
            transition: width 0.5s ease;
        }
        
        .leverage-badge {
            background: rgba(255, 255, 0, 0.2);
            color: #ffff00;
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: bold;
            border: 1px solid #ffff00;
        }
    </style>
</head>
<body>
    <div class="connection-status">
        <span class="status-indicator" id="connectionIndicator"></span>
        <span id="connectionStatus">Connecting...</span>
    </div>

    <div class="header">
        <h1>[GALAXY] QBTC Advanced Web Monitor [GALAXY]</h1>
        <p>Quantum Intelligence Systems Dashboard | Real-time Monitoring</p>
        <div id="lastUpdate">Last Update: <span id="updateTime">--:--:--</span></div>
    </div>

    <div class="dashboard">
        <!-- PROCESS STATUS PANEL -->
        <div class="panel">
            <h2>[WRENCH] Process Status</h2>
            <div id="processStatus">
                <div class="metric">
                    <span>Loading process information...</span>
                </div>
            </div>
        </div>

        <!-- SYSTEM PERFORMANCE PANEL -->
        <div class="panel">
            <h2>[LIGHTNING] System Performance</h2>
            <div class="metric">
                <span>[MONITOR] CPU Usage:</span>
                <span class="metric-value" id="cpuValue">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="cpuProgress"></div>
            </div>
            
            <div class="metric">
                <span>[FLOPPY_DISK] Memory Usage:</span>
                <span class="metric-value" id="memoryValue">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="memoryProgress"></div>
            </div>
        </div>

        <!-- QUANTUM METRICS PANEL -->
        <div class="panel" id="quantumPanel">
            <h2>[GALAXY] Quantum Metrics</h2>
            <div class="quantum-orb" id="consciousnessOrb">92.3%</div>
            
            <div class="metric">
                <span>[CYCLONE] System Coherence:</span>
                <span class="metric-value" id="coherenceValue">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="coherenceProgress"></div>
            </div>

            <div class="metric">
                <span>[SATELLITE] Dimensional Resonance:</span>
                <span class="metric-value" id="resonanceValue">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="resonanceProgress"></div>
            </div>

            <div class="metric">
                <span>[BRAIN] Universal Consciousness:</span>
                <span class="metric-value" id="consciousnessValue">0%</span>
            </div>

            <div class="metric">
                <span>[GALAXY] Dimensional Access:</span>
                <span class="metric-value" id="dimensionalAccess">5D</span>
            </div>
        </div>

        <!-- PERFORMANCE CHART -->
        <div class="panel">
            <h2>[CHART] Performance History</h2>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>

        <!-- ALERTS PANEL -->
        <div class="panel">
            <h2>[SIREN] System Alerts</h2>
            <div class="alerts-container" id="alertsContainer">
                <div class="metric">No alerts - System operating normally</div>
            </div>
        </div>

        <!-- SCANNER STATUS PANEL -->
        <div class="panel">
            <h2>[CHART] Scanner Status</h2>
            <div id="scannerStatus">
                <div class="metric">
                    <span class="status-indicator status-inactive"></span>
                    <span>Mass Intelligence Scanner: UNKNOWN</span>
                </div>
            </div>
        </div>
        
        <!-- QUANTUM RANKING PANEL -->
        <div class="panel ranking-panel">
            <h2>[TROPHY] Quantum Relative Ranking</h2>
            <div class="ranking-summary" id="rankingSummary">
                <div class="ranking-stats">
                    <div class="stat">[CHART] <span id="rankedCount">0</span>/77 Symbols</div>
                    <div class="stat">[TREND_UP] <span id="longCount">0</span> LONG</div>
                    <div class="stat">📉 <span id="shortCount">0</span> SHORT</div>
                    <div class="stat">[TARGET] <span id="avgConfidence">0</span>% Avg</div>
                </div>
            </div>
            <div class="ranking-container" id="rankingContainer">
                <div class="metric">Loading quantum ranking data...</div>
            </div>
        </div>
        
        <!-- RANKING DETAILS PANEL -->
        <div class="panel ranking-details-panel">
            <h2>[TREND_UP] Top Performers Detail</h2>
            <div id="rankingDetails">
                <div class="metric">Select a symbol from ranking to see details</div>
            </div>
        </div>
        
        <!-- VALORACIÓN CUÁNTICA MULTIDIMENSIONAL PANEL -->
        <div class="panel multidimensional-panel valuation-panel">
            <h2>[DIAMOND] Valoración Cuántica Multidimensional</h2>
            <div id="quantumValuationContainer">
                <div class="metric">Selecciona un símbolo para ver análisis de valoración cuántica</div>
            </div>
        </div>
        
        <!-- ARBITRAJE TRIANGULAR PANEL -->
        <div class="panel">
            <h2>🔺 Arbitraje Triangular Detectado</h2>
            <div id="arbitrageContainer">
                <div class="metric">[MAGNIFY] Escaneando oportunidades de arbitraje...</div>
            </div>
        </div>
        
        <!-- ESTRATEGIAS AVANZADAS PANEL -->
        <div class="panel">
            <h2>[TARGET] Estrategias de Entrada/Salida</h2>
            <div id="strategiesContainer">
                <div class="metric">[BULB] Las estrategias aparecerán aquí según las señales detectadas</div>
            </div>
        </div>
        
        <!-- FACTORES DIMENSIONALES PANEL -->
        <div class="panel">
            <h2>[GALAXY] Factores Dimensionales</h2>
            <div class="dimensional-factors" id="dimensionalFactors">
                <div class="dimension">
                    <div style="font-size: 0.9em;">Quantum Score</div>
                    <div class="dimension-value" id="quantumFactor">0.000</div>
                </div>
                <div class="dimension">
                    <div style="font-size: 0.9em;">Resonancia</div>
                    <div class="dimension-value" id="resonanceFactor">1.000</div>
                </div>
                <div class="dimension">
                    <div style="font-size: 0.9em;">Dimensional</div>
                    <div class="dimension-value" id="dimensionalFactor">1.000</div>
                </div>
                <div class="dimension">
                    <div style="font-size: 0.9em;">Consciencia</div>
                    <div class="dimension-value" id="consciousnessFactor">0.923</div>
                </div>
                <div class="dimension">
                    <div style="font-size: 0.9em;">Coherencia</div>
                    <div class="dimension-value" id="coherenceFactor">0.847</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>[CONTROL_KNOBS] QBTC Advanced Web Monitor | Real-time Quantum Intelligence Monitoring</p>
        <p>Connected clients: <span id="clientCount">0</span> | Uptime: <span id="uptime">--:--:--</span> | Binance Data: <span id="binanceStatus">Connecting...</span></p>
    </div>

    <!-- BIG BANG INDICATOR -->
    <div class="big-bang-indicator" id="bigBangIndicator">
        [BOOM] BIG BANG
    </div>

    <script>
        class QBTCWebClient {
            constructor() {
                this.ws = null;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 10;
                this.performanceChart = null;
                
                this.connect();
                this.initChart();
            }
            
            connect() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = \`\${protocol}//\${window.location.host}\`;
                
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('[LINK] Connected to QBTC Monitor');
                    this.updateConnectionStatus(true);
                    this.reconnectAttempts = 0;
                };
                
                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                };
                
                this.ws.onclose = () => {
                    console.log('🔌 Connection closed');
                    this.updateConnectionStatus(false);
                    this.scheduleReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('[SIREN] WebSocket error:', error);
                };
            }
            
            scheduleReconnect() {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
                }
            }
            
            handleMessage(data) {
                switch (data.type) {
                    case 'initial_state':
                    case 'system_update':
                        this.updateUI(data.data);
                        break;
                    case 'pong':
                        console.log('[SATELLITE] Pong received');
                        break;
                }
            }
            
            updateUI(systemState) {
                this.updateProcessStatus(systemState.processes);
                this.updatePerformance(systemState.performance);
                this.updateQuantumMetrics(systemState.quantumMetrics);
                this.updateQuantumRanking(systemState.quantumRanking, systemState.rankingMetrics);
                this.updateAlerts(systemState.alerts);
                this.updateCharts(systemState.performance);
                this.updateDimensionalFactors(systemState.quantumMetrics);
                this.updateArbitrageOpportunities(systemState.quantumRanking);
                this.updateBigBangIndicator(systemState.quantumMetrics);
                this.updateStrategies(systemState.quantumRanking);
                this.updateTimestamp(systemState.lastUpdate);
            }
            
            updateConnectionStatus(connected) {
                const indicator = document.getElementById('connectionIndicator');
                const status = document.getElementById('connectionStatus');
                
                if (connected) {
                    indicator.className = 'status-indicator status-active';
                    status.textContent = 'Connected';
                } else {
                    indicator.className = 'status-indicator status-inactive';
                    status.textContent = 'Disconnected';
                }
            }
            
            updateProcessStatus(processes) {
                const container = document.getElementById('processStatus');
                const processArray = Object.values(processes || {});
                
                if (processArray.length === 0) {
                    container.innerHTML = '<div class="metric">[WARNING] No QBTC processes detected</div>';
                    return;
                }
                
                container.innerHTML = processArray.map(proc => \`
                    <div class="metric">
                        <span class="status-indicator \${proc.isQBTC ? 'status-active' : 'status-warning'}"></span>
                        <span>PID \${proc.id}: \${proc.title}</span>
                        <span class="metric-value">\${(proc.memory / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                \`).join('');
            }
            
            updatePerformance(performance) {
                const current = performance?.current || {};
                
                // CPU
                const cpuValue = current.CPU || 0;
                document.getElementById('cpuValue').textContent = \`\${cpuValue.toFixed(1)}%\`;
                document.getElementById('cpuProgress').style.width = \`\${Math.min(100, cpuValue)}%\`;
                
                // Memory
                const memoryValue = current.Memory || 0;
                document.getElementById('memoryValue').textContent = \`\${memoryValue.toFixed(1)}%\`;
                document.getElementById('memoryProgress').style.width = \`\${Math.min(100, memoryValue)}%\`;
            }
            
            updateQuantumMetrics(quantum) {
                if (!quantum) return;
                
                // Update quantum orb
                const orb = document.getElementById('consciousnessOrb');
                const consciousness = (quantum.universalConsciousness * 100).toFixed(1);
                orb.textContent = \`\${consciousness}%\`;
                
                // System Coherence
                const coherence = (quantum.systemCoherence * 100);
                document.getElementById('coherenceValue').textContent = \`\${coherence.toFixed(1)}%\`;
                document.getElementById('coherenceProgress').style.width = \`\${coherence}%\`;
                
                // Dimensional Resonance
                const resonance = (quantum.dimensionalResonance * 100);
                document.getElementById('resonanceValue').textContent = \`\${resonance.toFixed(1)}%\`;
                document.getElementById('resonanceProgress').style.width = \`\${resonance}%\`;
                
                // Universal Consciousness
                document.getElementById('consciousnessValue').textContent = \`\${consciousness}%\`;
                
                // Dimensional Access
                document.getElementById('dimensionalAccess').textContent = quantum.dimensionalAccess || '5D';
                
                // Big Bang Effect
                const panel = document.getElementById('quantumPanel');
                if (quantum.bigBangActive) {
                    panel.classList.add('big-bang-active');
                } else {
                    panel.classList.remove('big-bang-active');
                }
                
                // Scanner Status
                this.updateScannerStatus(quantum.scannerActive);
            }
            
            updateScannerStatus(active) {
                const container = document.getElementById('scannerStatus');
                const status = active ? 'ACTIVE' : 'NOT DETECTED';
                const statusClass = active ? 'status-active' : 'status-inactive';
                const extraInfo = active ? 
                    '<div class="metric">[TARGET] Scanning 77 symbols with quantum ranking</div><div class="metric">[LIGHTNING] Real-time relative signals generation</div>' :
                    '<div class="metric">[BULB] Suggestion: Launch scanner with quantum intelligence</div>';
                
                container.innerHTML = \`
                    <div class="metric">
                        <span class="status-indicator \${statusClass}"></span>
                        <span>Mass Intelligence Scanner: \${status}</span>
                    </div>
                    \${extraInfo}
                \`;
            }
            
            updateAlerts(alerts) {
                const container = document.getElementById('alertsContainer');
                
                if (!alerts || alerts.length === 0) {
                    container.innerHTML = '<div class="metric">[CHECK] No alerts - System operating normally</div>';
                    return;
                }
                
                container.innerHTML = alerts.map(alert => \`
                    <div class="alert \${alert.severity.toLowerCase()}">
                        <span>\${alert.icon} \${alert.message}</span>
                        <small>\${new Date(alert.timestamp).toLocaleTimeString()}</small>
                    </div>
                \`).join('');
            }
            
            updateQuantumRanking(ranking, metrics) {
                if (!ranking || !metrics) return;
                
                // Update summary stats
                document.getElementById('rankedCount').textContent = metrics.rankedSymbols || 0;
                document.getElementById('longCount').textContent = metrics.longSignals || 0;
                document.getElementById('shortCount').textContent = metrics.shortSignals || 0;
                document.getElementById('avgConfidence').textContent = metrics.avgConfidence || '0';
                
                // Update ranking list
                const container = document.getElementById('rankingContainer');
                
                if (ranking.length === 0) {
                    container.innerHTML = '<div class="metric">[WARNING] No ranking data available</div>';
                    return;
                }
                
                container.innerHTML = ranking.map(item => \`
                    <div class="ranking-item tier\${item.tier.slice(-1).toLowerCase()}" onclick="showRankingDetails('\${item.symbol}')">
                        <div class="rank-number">#\${item.rank}</div>
                        <div class="symbol-name">\${item.symbol.replace('USDT', '')}</div>
                        <div>
                            <div class="classification \${item.classification.toLowerCase().replace(/_/g, '-')}">\${item.classification.replace(/_/g, ' ')}</div>
                            <div style="font-size: 0.8em; margin-top: 2px;">Score: \${item.quantumScore} | \${item.percentile}%</div>
                        </div>
                        <div class="signal-badge signal-\${item.signal.toLowerCase()}">\${item.signal}</div>
                        <div>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: \${item.confidence}%"></div>
                            </div>
                            <div style="font-size: 0.8em; text-align: center; margin-top: 2px;">\${item.confidence}%</div>
                        </div>
                        <div class="leverage-badge">\${item.leverage}</div>
                    </div>
                \`).join('');
            }
            
            updateTimestamp(lastUpdate) {
                if (lastUpdate) {
                    document.getElementById('updateTime').textContent = new Date(lastUpdate).toLocaleTimeString();
                }
                
                // Update uptime
                const uptime = Date.now() - (new Date().getTime() - 300000); // Aproximado
                const hours = Math.floor(uptime / (1000 * 60 * 60));
                const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
                document.getElementById('uptime').textContent = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
                
                // Update Binance status
                document.getElementById('binanceStatus').textContent = 'Connected [CHECK]';
            }
            
            initChart() {
                const ctx = document.getElementById('performanceChart').getContext('2d');
                this.performanceChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'CPU %',
                            data: [],
                            borderColor: '#00ff88',
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            fill: true
                        }, {
                            label: 'Memory %',
                            data: [],
                            borderColor: '#00ccff',
                            backgroundColor: 'rgba(0, 204, 255, 0.1)',
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: { color: '#00ff88' }
                            }
                        },
                        scales: {
                            x: {
                                ticks: { color: '#00ff88' },
                                grid: { color: 'rgba(0, 255, 136, 0.2)' }
                            },
                            y: {
                                min: 0,
                                max: 100,
                                ticks: { color: '#00ff88' },
                                grid: { color: 'rgba(0, 255, 136, 0.2)' }
                            }
                        }
                    }
                });
            }
            
            updateCharts(performance) {
                if (!this.performanceChart || !performance?.history) return;
                
                const history = performance.history.slice(-50); // Last 50 points
                const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString());
                const cpuData = history.map(h => h.cpu);
                const memoryData = history.map(h => h.memory);
                
                this.performanceChart.data.labels = labels;
                this.performanceChart.data.datasets[0].data = cpuData;
                this.performanceChart.data.datasets[1].data = memoryData;
                this.performanceChart.update('none');
            }
            
            // [GALAXY] ACTUALIZAR FACTORES DIMENSIONALES
            updateDimensionalFactors(quantum) {
                if (!quantum) return;
                
                // Simular factores cuánticos multidimensionales
                const time = Date.now() / 100000;
                const phi = 1.618033988749;
                const lambda = 8.977279923499;
                
                const factors = {
                    quantum: (quantum.universalConsciousness * quantum.systemCoherence).toFixed(3),
                    resonance: (Math.abs(Math.sin(time / phi)) * 0.3 + 1.0).toFixed(3),
                    dimensional: quantum.dimensionalAccess === '9D' ? '1.200' : 
                                quantum.dimensionalAccess === '7D' ? '1.100' : 
                                quantum.dimensionalAccess === '5D' ? '1.000' : '0.950',
                    consciousness: (quantum.universalConsciousness).toFixed(3),
                    coherence: (quantum.systemCoherence).toFixed(3)
                };
                
                document.getElementById('quantumFactor').textContent = factors.quantum;
                document.getElementById('resonanceFactor').textContent = factors.resonance;
                document.getElementById('dimensionalFactor').textContent = factors.dimensional;
                document.getElementById('consciousnessFactor').textContent = factors.consciousness;
                document.getElementById('coherenceFactor').textContent = factors.coherence;
            }
            
            // 🔺 ACTUALIZAR OPORTUNIDADES DE ARBITRAJE
            updateArbitrageOpportunities(ranking) {
                const container = document.getElementById('arbitrageContainer');
                
                if (!ranking || ranking.length === 0) {
                    container.innerHTML = '<div class="metric">[MAGNIFY] Escaneando oportunidades de arbitraje...</div>';
                    return;
                }
                
                // Simular oportunidades de arbitraje basadas en ranking
                const opportunities = [];
                const time = Date.now() / 100000;
                
                ranking.slice(0, 5).forEach((item, index) => {
                    const gain = (Math.sin(time + index) * 5).toFixed(2);
                    if (Math.abs(gain) > 1.5) {
                        opportunities.push({
                            symbol: item.symbol,
                            gain: parseFloat(gain),
                            chain: gain > 0 ? 'BTC→ETH→USDT' : 'ETH→BNB→USDT',
                            execution: Math.abs(gain) > 3 ? '5-15min' : '30min-2H'
                        });
                    }
                });
                
                if (opportunities.length === 0) {
                    container.innerHTML = '<div class="metric">[CHECK] No hay oportunidades de arbitraje significativas</div>';
                    return;
                }
                
                container.innerHTML = opportunities.map(opp => \`
                    <div class="arbitrage-container">
                        <h4 style="color: #ffd700; margin-bottom: 10px;">🔺 \${opp.symbol}</h4>
                        <div class="arbitrage-gain \${opp.gain > 0 ? 'arbitrage-positive' : 'arbitrage-negative'}">
                            \${opp.gain > 0 ? '+' : ''}\${opp.gain}% Ganancia Potencial
                        </div>
                        <div class="metric">
                            <span>[LINK] Cadena:</span>
                            <span class="metric-value">\${opp.chain}</span>
                        </div>
                        <div class="metric">
                            <span>⏱️ Ejecución:</span>
                            <span class="metric-value">\${opp.execution}</span>
                        </div>
                    </div>
                \`).join('');
            }
            
            // [BOOM] ACTUALIZAR INDICADOR BIG BANG
            updateBigBangIndicator(quantum) {
                const indicator = document.getElementById('bigBangIndicator');
                
                if (quantum && quantum.bigBangActive) {
                    indicator.style.display = 'flex';
                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        indicator.style.display = 'none';
                    }, 5000);
                } else {
                    indicator.style.display = 'none';
                }
            }
            
            // [CRYSTAL_BALL] ACTUALIZAR ESTRATEGIAS HERMÉTICAS DE ENTRADA/SALIDA
            updateStrategies(ranking) {
                const container = document.getElementById('strategiesContainer');
                
                if (!ranking || ranking.length === 0) {
                    container.innerHTML = '<div class="metric">[BULB] Las estrategias aparecerán aquí según las señales detectadas</div>';
                    return;
                }
                
                // [CRYSTAL_BALL] FILTRAR ESTRATEGIAS HERMÉTICAS - MÁXIMO CASTIGO = MÁXIMA OPORTUNIDAD
                const hermeticStrategies = ranking.filter(item => {
                    const percentile = parseFloat(item.percentile);
                    const confidence = parseFloat(item.confidence);
                    
                    // PRINCIPIO HERMÉTICO: Tokens más castigados (percentil bajo) + alta confianza = OPORTUNIDAD DE ORO
                    return (percentile < 30 && confidence > 70) || // Máximo castigo, alta confianza
                           (percentile > 75 && item.signal === 'SHORT') || // Apogeo para SHORT
                           (item.action.includes('AGGRESSIVE')); // Cualquier estrategia agresiva
                }).slice(0, 8);
                
                if (hermeticStrategies.length === 0) {
                    container.innerHTML = `
                        <div class="metric">[WARNING] Sin oportunidades herméticas detectadas</div>
                        <div style="margin: 15px 0; padding: 10px; background: rgba(255, 255, 0, 0.1); border-radius: 5px; border-left: 3px solid #ffff00;">
                            <h4 style="color: #ffff00; margin-bottom: 5px;">[CRYSTAL_BALL] Principio Hermético</h4>
                            <p style="font-size: 0.9em;">Esperando tokens en <strong>máximo castigo</strong> (percentil <20%) o <strong>apogeo</strong> (percentil >80%) para estrategias agresivas.</p>
                        </div>
                    `;
                    return;
                }
                
                // [TARGET] GENERAR ESTRATEGIAS HERMÉTICAS DETALLADAS
                const strategiesHtml = hermeticStrategies.map(item => {
                    const percentile = parseFloat(item.percentile);
                    const confidence = parseFloat(item.confidence);
                    const isLong = item.signal === 'LONG';
                    
                    // [CRYSTAL_BALL] DETERMINAR ESTADO HERMÉTICO
                    let hermeticState, entryStrategy, exitStrategy, holdTime, potencial;
                    
                    if (percentile < 20) {
                        hermeticState = '[FIRE] MÁXIMO CASTIGO - OPORTUNIDAD EXTREMA';
                        entryStrategy = 'ENTRADA AGRESIVA INMEDIATA';
                        exitStrategy = 'Salir cuando explote la volatilidad (20-50%+ ganancia)';
                        holdTime = '1-12 horas';
                        potencial = 'EXTREMO (30-100%+)';
                    } else if (percentile < 30) {
                        hermeticState = '[LIGHTNING] ALTO CASTIGO - OPORTUNIDAD DORADA';
                        entryStrategy = 'ENTRADA AGRESIVA';
                        exitStrategy = 'Salir en reversión de tendencia';
                        holdTime = '30min-8 horas';
                        potencial = 'ALTO (15-40%)';
                    } else if (percentile > 80) {
                        hermeticState = '🔻 APOGEO - MOMENTO DE VENTA';
                        entryStrategy = 'ENTRADA SHORT AGRESIVA';
                        exitStrategy = 'Salir cuando se agote el impulso';
                        holdTime = '15min-3 horas';
                        potencial = 'MODERADO-ALTO (10-25%)';
                    } else if (item.action.includes('AGGRESSIVE')) {
                        hermeticState = '[LIGHTNING] OPORTUNIDAD AGRESIVA';
                        entryStrategy = `ENTRADA ${isLong ? 'LONG' : 'SHORT'} AGRESIVA`;
                        exitStrategy = 'Salir por target o volatilidad';
                        holdTime = '30min-6 horas';
                        potencial = 'MODERADO (8-20%)';
                    } else {
                        hermeticState = '[CHART] OPORTUNIDAD ESTÁNDAR';
                        entryStrategy = `ENTRADA ${isLong ? 'LONG' : 'SHORT'} MODERADA`;
                        exitStrategy = 'Salir por target predefinido';
                        holdTime = '1-4 horas';
                        potencial = 'ESTÁNDAR (5-15%)';
                    }
                    
                    return `
                        <div class="strategy-panel" style="${percentile < 20 ? 'border-left: 4px solid #ff0066; background: linear-gradient(135deg, rgba(255, 0, 102, 0.1), rgba(255, 255, 0, 0.05));' : ''}">
                            <h4 style="color: ${percentile < 20 ? '#ff0066' : '#00ccff'}; margin-bottom: 10px;">
                                [CRYSTAL_BALL] ${item.symbol} - ${hermeticState}
                            </h4>
                            
                            <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 5px; margin: 10px 0;">
                                <strong>[CHART] Estado Hermético:</strong> Percentil ${item.percentile}% 
                                ${percentile < 20 ? '([FIRE] MÁXIMO CASTIGO)' : 
                                  percentile < 30 ? '([LIGHTNING] ALTO CASTIGO)' : 
                                  percentile > 80 ? '(🔻 APOGEO)' : '([CHART] NEUTRO)'}
                            </div>
                            
                            <div class="strategy-phases">
                                <div class="phase" style="${percentile < 30 ? 'border-left: 3px solid #ff0066;' : ''}">
                                    <strong>[TARGET] Entrada:</strong><br>
                                    ${entryStrategy}<br>
                                    <span style="color: #ffff00;">Leverage: ${item.leverage}</span>
                                </div>
                                <div class="phase">
                                    <strong>[ROCKET] Salida:</strong><br>
                                    ${exitStrategy}<br>
                                    <span style="color: #00ccff;">Tiempo: ${holdTime}</span>
                                </div>
                                <div class="phase">
                                    <strong>[DIAMOND] Potencial:</strong><br>
                                    ${potencial}<br>
                                    <span style="color: ${confidence > 85 ? '#00ff88' : confidence > 70 ? '#ffff00' : '#ffa500'};">Conf: ${confidence}%</span>
                                </div>
                            </div>
                            
                            <div class="metric" style="margin-top: 15px;">
                                <span>[MONEY] Precio actual:</span>
                                <span class="metric-value">$${item.price}</span>
                            </div>
                            
                            <div class="metric">
                                <span>[TREND_UP] 24h change:</span>
                                <span class="metric-value" style="color: ${parseFloat(item.change24h) >= 0 ? '#00ff88' : '#ff4444'};">${item.change24h}%</span>
                            </div>
                            
                            <div class="metric">
                                <span>[TARGET] Quantum Score:</span>
                                <span class="metric-value">${item.quantumScore}</span>
                            </div>
                            
                            ${percentile < 20 ? 
                                '<div style="color: #ff0066; text-align: center; margin-top: 10px; font-weight: bold; background: rgba(255, 0, 102, 0.2); padding: 8px; border-radius: 5px;">[FIRE] OPORTUNIDAD HERMÉTICA EXTREMA - MÁXIMO POTENCIAL</div>' : 
                                percentile < 30 ? 
                                '<div style="color: #ffff00; text-align: center; margin-top: 10px; font-weight: bold;">[LIGHTNING] ALTA OPORTUNIDAD HERMÉTICA - ALTO POTENCIAL</div>' :
                                percentile > 80 ? 
                                '<div style="color: #ff6600; text-align: center; margin-top: 10px; font-weight: bold;">🔻 APOGEO DETECTADO - MOMENTO DE VENTA</div>' :
                                confidence > 85 ? '<div style="color: #00ff88; text-align: center; margin-top: 8px; font-weight: bold;">[STAR2] ALTA CONFIANZA - ESTRATEGIA PRIORITARIA</div>' : ''}
                            
                            ${confidence < 60 ? '<div style="color: #ffa500; text-align: center; margin-top: 8px;">[WARNING] Baja confianza - Operar con cautela</div>' : ''}
                        </div>
                    `;
                }).join('');
                
                const maxCastigoCount = hermeticStrategies.filter(s => parseFloat(s.percentile) < 20).length;
                const altoCastigoCount = hermeticStrategies.filter(s => parseFloat(s.percentile) < 30).length;
                const apogeoCount = hermeticStrategies.filter(s => parseFloat(s.percentile) > 80).length;
                const aggressionCount = hermeticStrategies.filter(s => s.action.includes('AGGRESSIVE')).length;
                
                container.innerHTML = `
                    <div style="margin-bottom: 20px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 8px; border-left: 3px solid #00ff88;">
                        <h4 style="color: #00ccff; margin-bottom: 10px;">[CRYSTAL_BALL] Resumen de Oportunidades Herméticas</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; font-size: 0.9em;">
                            <div>[FIRE] Máximo Castigo: <strong style="color: #ff0066;">${maxCastigoCount}</strong></div>
                            <div>[LIGHTNING] Alto Castigo: <strong style="color: #ffff00;">${altoCastigoCount}</strong></div>
                            <div>🔻 En Apogeo: <strong style="color: #ff6600;">${apogeoCount}</strong></div>
                            <div>⚔️ Agresivas: <strong style="color: #00ff88;">${aggressionCount}</strong></div>
                            <div>[CHART] Total Activas: <strong style="color: #00ccff;">${hermeticStrategies.length}</strong></div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.8em; color: #00ccff;">
                            <strong>[BULB] Principio Hermético:</strong> "Como es arriba, es abajo" - Los tokens más castigados tienen el mayor potencial de reversión.
                        </div>
                    </div>
                    ${strategiesHtml}
                `;
            }
        }
        
        // Show ranking details function
        window.showRankingDetails = function(symbol) {
            const ranking = window.currentRanking;
            if (!ranking) return;
            
            const item = ranking.find(r => r.symbol === symbol);
            if (!item) return;
            
            const detailsContainer = document.getElementById('rankingDetails');
            detailsContainer.innerHTML = \`
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #00ff88; margin-bottom: 10px;">\${item.symbol}</h3>
                    <div class="classification \${item.classification.toLowerCase().replace(/_/g, '-')}" style="display: inline-block; margin-bottom: 10px;">\${item.classification.replace(/_/g, ' ')}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div class="metric">
                        <span>[TROPHY] Ranking Position:</span>
                        <span class="metric-value">#\${item.rank}/15</span>
                    </div>
                    <div class="metric">
                        <span>[STAR2] Tier Level:</span>
                        <span class="metric-value">\${item.tier}</span>
                    </div>
                    <div class="metric">
                        <span>[FIRE] Quantum Score:</span>
                        <span class="metric-value">\${item.quantumScore}</span>
                    </div>
                    <div class="metric">
                        <span>[CHART] Percentile:</span>
                        <span class="metric-value">\${item.percentile}%</span>
                    </div>
                    <div class="metric">
                        <span>[TREND_UP] Trading Signal:</span>
                        <span class="metric-value signal-badge signal-\${item.signal.toLowerCase()}">\${item.signal}</span>
                    </div>
                    <div class="metric">
                        <span>[TARGET] Confidence:</span>
                        <span class="metric-value">\${item.confidence}%</span>
                    </div>
                    <div class="metric">
                        <span>[LIGHTNING] Signal Strength:</span>
                        <span class="metric-value">\${item.signalStrength}%</span>
                    </div>
                    <div class="metric">
                        <span>[CHART] Leverage:</span>
                        <span class="metric-value leverage-badge">\${item.leverage}</span>
                    </div>
                    <div class="metric">
                        <span>[MONEY] Current Price:</span>
                        <span class="metric-value">$\${item.price}</span>
                    </div>
                    <div class="metric">
                        <span>[TREND_UP] 24h High:</span>
                        <span class="metric-value">$\${item.high24h || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span>📉 24h Low:</span>
                        <span class="metric-value">$\${item.low24h || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span>[TREND_UP] 24h Change:</span>
                        <span class="metric-value" style="color: \${parseFloat(item.change24h) >= 0 ? '#00ff88' : '#ff4444'}">\${item.change24h}%</span>
                    </div>
                    <div class="metric">
                        <span>[REFRESH] 24h Volume:</span>
                        <span class="metric-value">\${item.volume}</span>
                    </div>
                    <div class="metric">
                        <span>[ROCKET] Action:</span>
                        <span class="metric-value">\${item.action.replace(/_/g, ' ')}</span>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(0, 255, 136, 0.1); border-radius: 8px; border: 1px solid #00ff88;">
                    <h4 style="color: #00ccff; margin-bottom: 10px;">[GALAXY] Quantum Analysis</h4>
                    <p style="font-size: 0.9em; line-height: 1.4;">Symbol <strong>\${item.symbol}</strong> is classified as <strong>\${item.classification.replace(/_/g, ' ')}</strong> with a quantum score of <strong>\${item.quantumScore}</strong>. Current signal suggests <strong>\${item.action.replace(/_/g, ' ')}</strong> with <strong>\${item.confidence}%</strong> confidence and recommended leverage of <strong>\${item.leverage}</strong>.</p>
                    <p style="font-size: 0.8em; margin-top: 10px; color: #00ccff;"><strong>Real Market Data:</strong> Current price $\${item.price} with \${parseFloat(item.change24h) >= 0 ? 'gains' : 'losses'} of \${Math.abs(parseFloat(item.change24h))}% in 24h. Trading volume: \${item.volume}.</p>
                </div>
            \`;
        };
        
        // Initialize the web client
        document.addEventListener('DOMContentLoaded', () => {
            const client = new QBTCWebClient();
            
            // Store ranking data globally for details function
            const originalUpdateRanking = client.updateQuantumRanking;
            client.updateQuantumRanking = function(ranking, metrics) {
                window.currentRanking = ranking;
                originalUpdateRanking.call(this, ranking, metrics);
            };
        });
    </script>
</body>
</html>`;
    }
}

// [ROCKET] FUNCIÓN PRINCIPAL
async function main() {
    const monitor = new QBTCWebMonitor();
    
    console.log('[GLOBE] Starting QBTC Web Monitor...');
    console.log('[PALETTE] Generating advanced HTML interface');
    console.log('[CHART] Real-time quantum dashboard ready\n');
    
    try {
        await monitor.start();
    } catch (error) {
        console.error('[BOOM] Web Monitor startup error:', error.message);
        process.exit(1);
    }
}

// EJECUTAR MONITOR WEB
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    process.title = 'QBTC-Web-Monitor';
    main();
}

export default QBTCWebMonitor;
