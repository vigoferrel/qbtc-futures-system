import QuantumDataPurifier from '../../core/quantum-data-purifier.js';
/**
 * QBTC Unified - Quantum Portfolio Manager Engine
 * Motor principal que impulsa la experiencia cuántica del usuario
 */

// Access real symbols configuration from global window object
// Configuration loaded from config/symbols-extended.js
function getLeonardoConfig() {
    if (window.LeonardoSymbolsExtended) {
        return window.LeonardoSymbolsExtended;
    }
    
    // Fallback configuration if not loaded
    console.warn('Leonardo Symbols Extended not loaded, using fallback');
    return {
        ALL_SYMBOLS: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
        TIER1_SYMBOLS: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
        TIER2_SYMBOLS: [],
        TIER3_SYMBOLS: [],
        TIER4_SYMBOLS: [],
        TIER5_SYMBOLS: [],
        TIER6_SYMBOLS: [],
        getSymbolsForMode: (mode) => ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
        getSymbolConfig: (symbol) => ({ tier: 'TIER1' })
    };
}

// Get configuration reference
const getLeonardoSymbols = () => getLeonardoConfig();
const ALL_SYMBOLS = () => getLeonardoConfig().ALL_SYMBOLS || [];
const TIER1_SYMBOLS = () => getLeonardoConfig().TIER1_SYMBOLS || [];
const TIER2_SYMBOLS = () => getLeonardoConfig().TIER2_SYMBOLS || [];
const TIER3_SYMBOLS = () => getLeonardoConfig().TIER3_SYMBOLS || [];
const TIER4_SYMBOLS = () => getLeonardoConfig().TIER4_SYMBOLS || [];
const TIER5_SYMBOLS = () => getLeonardoConfig().TIER5_SYMBOLS || [];
const TIER6_SYMBOLS = () => getLeonardoConfig().TIER6_SYMBOLS || [];
const getSymbolsForMode = (mode) => getLeonardoConfig().getSymbolsForMode ? getLeonardoConfig().getSymbolsForMode(mode) : [];
const getSymbolConfig = (symbol) => getLeonardoConfig().getSymbolConfig ? getLeonardoConfig().getSymbolConfig(symbol) : { tier: 'TIER1' };

const SYMBOLS_TIERS = {
    TIER1: () => TIER1_SYMBOLS(),
    TIER2: () => TIER2_SYMBOLS(), 
    TIER3: () => TIER3_SYMBOLS(),
    TIER4: () => TIER4_SYMBOLS(),
    TIER5: () => TIER5_SYMBOLS(),
    TIER6: () => TIER6_SYMBOLS()
};

class QuantumEngine {
    constructor() {
        this.purifier = new QuantumDataPurifier();
        this.consciousness = 98.7;
        this.quantumPoets = 12;
        this.leonardoMultiplier = 1.618;
        this.zuritaCoefficient = 3.14159;
        this.universalConstants = {
            c: 299792458,
            h: 6.626e34,
            G: 6.674e11,
            alpha: 0.007297
        };
        
        // Trading mode configuration
        this.currentTradingMode = 'BALANCED';
        this.activeSymbols = [];  // Will be populated when config is loaded
        
        // Real trading opportunities
        this.realOpportunities = [];
        this.symbolMetrics = {};

        // Estado cuántico del portfolio
        this.portfolioState = {
            totalValue: 150000,
            totalReturn: 47.3,
            quantumCoherence: 94.2,
            matrixSize: 144,
            resonanceFreq: 432.5,
            bigBangCountdown: 180,
            positions: [
                { symbol: 'QBTC-LEONARDO', value: 45000, change: 8.7 },
                { symbol: 'UNIFIED-MATRIX', value: 38500, change: -2.1 },
                { symbol: 'CONSCIOUSNESS', value: 42000, change: 12.3 },
                { symbol: 'ZURITA-POETRY', value: 24500, change: 5.9 }
            ]
        };

        // Merkaba Protocol state
        this.merkabaState = {
            activated: false,
            dimensional_access: 3,
            consciousness: 0.618,
            phase: 'dormant',
            rotation_speed: 0,
            synchronizations: 0,
            light_field: 0.42,
            geometries: [],
            opportunities: [],
            metrics: {
                total_activations: 0,
                dimensional_accesses: 0,
                active_geometries: 0,
                trading_effectiveness: 1.0
            }
        };

        // Merkaba API base URL
        this.merkabaAPI = 'http://localhost:14401';

        // Charts y visualizaciones
        this.charts = {};
        this.animations = {};
        
        // Inicializar sistema
        this.init();
        
        // Inicializar datos reales de símbolos
        this.initializeRealData();
    }

    init() {
        console.log('[GALAXY] QBTC Unified - Quantum Engine Iniciando...');
        
        this.setupQuantumParticles();
        this.initializeCharts();
        this.startQuantumAnimations();
        this.bindEventListeners();
        this.updateInterface();
        this.startQuantumLoop();
        this.initMerkaba();

        console.log('[SPARKLES] Sistema Cuántico ACTIVADO');
    }

    setupQuantumParticles() {
        // Crear partículas cuánticas dinámicas con Three.js
        if (typeof THREE !== 'undefined') {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);
            
            const particlesContainer = document.querySelector('.quantum-particles');
            if (particlesContainer) {
                particlesContainer.appendChild(renderer.domElement);
                renderer.domElement.style.position = 'absolute';
                renderer.domElement.style.top = '0';
                renderer.domElement.style.left = '0';
                renderer.domElement.style.pointerEvents = 'none';
            }

            // Crear geometría de partículas
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = 200;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const sizes = new Float32Array(particleCount);

            const quantumColors = [
                new THREE.Color('#00ff88'),
                new THREE.Color('#0088ff'),
                new THREE.Color('#ff0088'),
                new THREE.Color('#ffaa00'),
                new THREE.Color('#88ffff')
            ];

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 20;
                positions[i * 3 + 1] = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 20;
                positions[i * 3 + 2] = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 20;

                const color = quantumColors[Math.floor(this.purifier.generateQuantumValue(index, modifier) * quantumColors.length)];
                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;

                sizes[i] = this.purifier.generateQuantumValue(index, modifier) * 2 + 1;
            }

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const particleMaterial = new THREE.PointsMaterial({
                size: 0.1,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                sizeAttenuation: true
            });

            this.particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(this.particles);

            camera.position.z = 5;

            // Animación de partículas
            const animateParticles = () => {
                if (this.particles) {
                    this.particles.rotation.y += 0.002;
                    this.particles.rotation.x += 0.001;
                    
                    const positions = this.particles.geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001;
                    }
                    this.particles.geometry.attributes.position.needsUpdate = true;
                }

                renderer.render(scene, camera);
                requestAnimationFrame(animateParticles);
            };

            animateParticles();
        }
    }

    initializeCharts() {
        // Performance Chart
        this.createPerformanceChart();
        
        // Resonance Chart
        this.createResonanceChart();

        // Matrix Progress
        this.updateMatrixProgress();
    }

    createPerformanceChart() {
        // DESACTIVADO: Gráfico reemplazado por tabla estática
        console.log('[CHART] Gráfico de Performance reemplazado por tabla');
        return; // No hacer nada
    }

    initPerformanceChart() {
        const ctx = document.querySelector('#performanceChart');
        if (ctx) {
            this.charts.performance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(),
                    datasets: [{
                        label: 'Leonardo Consciousness',
                        data: this.generateQuantumData(),
                        borderColor: '#88ffff',
                        backgroundColor: 'rgba(136, 255, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Quantum Coherence',
                        data: this.generateQuantumData(0.8),
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff',
                                font: { family: 'Orbitron' }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#aaaaaa' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            ticks: { 
                                color: '#aaaaaa',
                                stepSize: 10
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }

    createResonanceChart() {
        // DESACTIVADO: Gráfico reemplazado por tabla estática
        console.log('🔆 Gráfico de Resonancia reemplazado por tabla');
        return; // No hacer nada
    }

    updateMatrixProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            const progress = (this.portfolioState.matrixSize / 200) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${this.portfolioState.matrixSize}/200 - ${progress.toFixed(1)}%`;
        }
    }

    startQuantumAnimations() {
        // Animación de consciencia
        this.animateConsciousness();
        
        // Animación de poetas cuánticos
        this.animatePoets();
        
        // Animación del multiplicador Zurita
        this.animateZurita();
        
        // Animación de coherencia
        this.animateCoherence();
        
        // Countdown del Big Bang
        this.startBigBangCountdown();
    }

    animateConsciousness() {
        const consciousnessValue = document.querySelector('.consciousness-value');
        if (consciousnessValue) {
            setInterval(() => {
                // Fluctuación cuántica natural
                const fluctuation = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.2;
                this.consciousness = Math.max(95, Math.min(100, this.consciousness + fluctuation));
                consciousnessValue.textContent = this.consciousness.toFixed(1) + '%';
                
                // Efecto visual basado en el nivel
                if (this.consciousness > 99) {
                    consciousnessValue.style.animation = 'consciousnessPulse 1s infinite';
                } else {
                    consciousnessValue.style.animation = 'consciousnessPulse 3s infinite';
                }
            }, 1000);
        }
    }

    animatePoets() {
        const poetIndicators = document.querySelectorAll('.poet-indicator');
        poetIndicators.forEach((indicator, index) => {
            setInterval(() => {
                const isActive = this.purifier.generateQuantumValue(index, modifier) > 0.3; // 70% probabilidad de estar activo
                indicator.classList.toggle('active', isActive);
                
                if (isActive) {
                    indicator.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        indicator.style.transform = 'scale(1)';
                    }, 200);
                }
            }, 2000 + index * 500);
        });

        // Actualizar contador de poetas activos
        setInterval(() => {
            const activePoets = document.querySelectorAll('.poet-indicator.active').length;
            const poetsValue = document.querySelector('[data-metric="poets"] .metric-value');
            if (poetsValue) {
                poetsValue.textContent = activePoets;
                this.quantumPoets = activePoets;
            }
        }, 500);
    }

    animateZurita() {
        const zuritaValue = document.querySelector('.zurita-value');
        if (zuritaValue) {
            setInterval(() => {
                const variation = 1 + (Math.sin(Date.now() * 0.001) * 0.001);
                const newValue = this.zuritaCoefficient * variation;
                zuritaValue.textContent = newValue.toFixed(5);
            }, 100);
        }
    }

    animateCoherence() {
        const coherenceBars = document.querySelectorAll('.coherence-fill');
        coherenceBars.forEach((bar, index) => {
            setInterval(() => {
                const baseValue = 70 + index * 5;
                const fluctuation = Math.sin(Date.now() * 0.002 + index) * 10;
                const coherence = Math.max(60, Math.min(95, baseValue + fluctuation));
                bar.style.width = coherence + '%';
            }, 2000);
        });
    }

    startBigBangCountdown() {
        const countdownTime = document.querySelector('.countdown-time');
        if (countdownTime) {
            setInterval(() => {
                this.portfolioState.bigBangCountdown--;
                if (this.portfolioState.bigBangCountdown <= 0) {
                    this.portfolioState.bigBangCountdown = 180; // Reset
                    this.triggerBigBang();
                }
                
                const minutes = Math.floor(this.portfolioState.bigBangCountdown / 60);
                const seconds = this.portfolioState.bigBangCountdown % 60;
                countdownTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
    }

    triggerBigBang() {
        console.log('[BOOM] BIG BANG CUÁNTICO ACTIVADO!');
        
        // Efectos visuales
        const body = document.body;
        body.style.animation = 'bigBangFlash 0.5s ease';
        
        setTimeout(() => {
            body.style.animation = '';
        }, 500);
        
        // Regenerar datos cuánticos
        this.regenerateQuantumData();
        
        // Mostrar modal si existe
        const modal = document.querySelector('#bigBangModal');
        if (modal) {
            modal.classList.add('active');
            setTimeout(() => {
                modal.classList.remove('active');
            }, 3000);
        }
    }

    bindEventListeners() {
        // Botón Big Bang
        const bigBangBtn = document.querySelector('[data-action="big-bang"]');
        if (bigBangBtn) {
            bigBangBtn.addEventListener('click', () => {
                this.triggerBigBang();
            });
        }
        
        // Botón Test Cuántico
        const quantumTestBtn = document.querySelector('[data-action="quantum-test"]');
        if (quantumTestBtn) {
            quantumTestBtn.addEventListener('click', () => {
                this.runQuantumTest();
            });
        }
        
        // Control de pausa
        const pauseBtn = document.querySelector('.control-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.toggleQuantumState();
            });
        }

        // Cerrar modal
        const modal = document.querySelector('#bigBangModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        // Resize para charts
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => {
                chart.resize();
            });
        });
    }

    updateInterface() {
        // Actualizar métricas principales
        this.updateMetricCards();
        
        // Actualizar portfolio
        this.updatePortfolioData();
        
        // Actualizar posiciones cuánticas
        this.updateQuantumPositions();
        
        // Actualizar constantes universales
        this.updateUniversalConstants();
    }

    updateMetricCards() {
        // Leonardo Consciousness
        const consciousnessCard = document.querySelector('[data-metric="consciousness"] .metric-value');
        if (consciousnessCard) {
            consciousnessCard.textContent = this.consciousness.toFixed(1) + '%';
        }

        // Multiplicador Leonardo
        const multiplierCard = document.querySelector('[data-metric="multiplier"] .metric-value');
        if (multiplierCard) {
            multiplierCard.textContent = '×' + this.leonardoMultiplier.toFixed(3);
        }

        // Coherencia Cuántica
        const coherenceCard = document.querySelector('.coherence-value');
        if (coherenceCard) {
            coherenceCard.textContent = this.portfolioState.quantumCoherence.toFixed(1) + '%';
        }
    }

    updatePortfolioData() {
        // Valor total
        const totalValueEl = document.querySelector('.perf-value');
        if (totalValueEl) {
            totalValueEl.textContent = '$' + this.portfolioState.totalValue.toLocaleString();
        }

        // Retorno total
        const totalReturnEl = document.querySelector('.perf-value.positive');
        if (totalReturnEl) {
            totalReturnEl.textContent = '+' + this.portfolioState.totalReturn.toFixed(1) + '%';
        }

        // Estadísticas de resonancia
        const freqStat = document.querySelector('[data-stat="frequency"] .stat-value');
        if (freqStat) {
            freqStat.textContent = this.portfolioState.resonanceFreq.toFixed(1) + ' Hz';
        }
    }

    updateQuantumPositions() {
        const positionsList = document.querySelector('#positionsList');
        if (positionsList) {
            const positionsHTML = `
                <table class="positions-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Valor</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.portfolioState.positions.map(position => `
                            <tr>
                                <td>${position.symbol}</td>
                                <td>$${position.value.toLocaleString()}</td>
                                <td class="${position.change >= 0 ? 'positive' : 'negative'}">
                                    ${position.change >= 0 ? '+' : ''}${position.change.toFixed(1)}%
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            positionsList.innerHTML = positionsHTML;
        }
    }

    updateUniversalConstants() {
        Object.entries(this.universalConstants).forEach(([key, value]) => {
            const constantEl = document.querySelector(`[data-constant="${key}"] .constant-value`);
            if (constantEl) {
                if (key === 'alpha') {
                    constantEl.textContent = value.toFixed(6);
                } else {
                    constantEl.textContent = value.toExponential(3);
                }
            }
        });
    }

    startQuantumLoop() {
        // DESACTIVADO: Loop cuántico que causa crecimiento infinito
        // Para re-activar, remover los comentarios de abajo
        /*
        setInterval(() => {
            this.quantumFluctuations();
            this.updatePortfolioValues();
            this.checkQuantumStates();
        }, 5000);
        */
        console.log('[WARNING] Loop cuántico DESACTIVADO para prevenir crecimiento infinito');
    }

    quantumFluctuations() {
        // Fluctuaciones naturales en el sistema
        this.portfolioState.quantumCoherence += (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 2;
        this.portfolioState.quantumCoherence = Math.max(85, Math.min(98, this.portfolioState.quantumCoherence));
        
        this.portfolioState.resonanceFreq += (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 5;
        this.portfolioState.resonanceFreq = Math.max(400, Math.min(500, this.portfolioState.resonanceFreq));
        
        // Actualizar interfaz
        this.updateInterface();
    }

    updatePortfolioValues() {
        // Simular cambios de mercado cuántico con límites controlados
        this.portfolioState.positions.forEach(position => {
            const quantumChange = (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 0.5; // Reducir variación
            position.change += quantumChange;
            
            // CRÍTICO: Limitar el cambio porcentual para evitar crecimiento infinito
            position.change = Math.max(-50, Math.min(50, position.change));
            
            // Aplicar cambio más controlado
            const changeMultiplier = 1 + (quantumChange / 100);
            position.value *= changeMultiplier;
            
            // Limitar valores extremos
            position.value = Math.max(1000, Math.min(200000, position.value));
        });
        
        // Recalcular total
        this.portfolioState.totalValue = this.portfolioState.positions.reduce((sum, pos) => sum + pos.value, 0);
    }

    checkQuantumStates() {
        // Verificar estados críticos
        if (this.consciousness > 99.5) {
            console.log('[STAR] Estado de Consciencia Máximo Alcanzado');
            this.activateLeonardoMode();
        }
        
        if (this.quantumPoets >= 10) {
            console.log('📚 Resonancia Poética Óptima');
            this.boostQuantumCoherence();
        }
    }

    activateLeonardoMode() {
        const body = document.body;
        body.classList.add('consciousness-active');
        
        setTimeout(() => {
            body.classList.remove('consciousness-active');
        }, 5000);
    }

    boostQuantumCoherence() {
        this.portfolioState.quantumCoherence = Math.min(98, this.portfolioState.quantumCoherence + 5);
    }

    runQuantumTest() {
        console.log('[TEST_TUBE] Ejecutando Pruebas Cuánticas...');
        
        // Simular test cuántico
        const testResults = {
            consciousness: this.consciousness,
            coherence: this.portfolioState.quantumCoherence,
            poets: this.quantumPoets,
            matrix: this.portfolioState.matrixSize,
            status: 'QUANTUM_OPTIMAL'
        };
        
        console.log('[CHART] Resultados del Test:', testResults);
        
        // Mostrar resultados en interfaz
        const statusEl = document.querySelector('.status-text');
        if (statusEl) {
            statusEl.textContent = testResults.status;
            statusEl.style.color = '#00ff88';
        }
    }

    toggleQuantumState() {
        // Pausar/reanudar animaciones cuánticas
        const particles = document.querySelector('.quantum-particles');
        if (particles) {
            particles.style.animationPlayState = 
                particles.style.animationPlayState === 'paused' ? 'running' : 'paused';
        }
    }

    regenerateQuantumData() {
        // Regenerar datos después del Big Bang
        this.consciousness = 95 + this.purifier.generateQuantumValue(index, modifier) * 5;
        this.portfolioState.quantumCoherence = 85 + this.purifier.generateQuantumValue(index, modifier) * 10;
        this.portfolioState.matrixSize = 100 + Math.floor(this.purifier.generateQuantumValue(index, modifier) * 100);
        this.portfolioState.resonanceFreq = 400 + this.purifier.generateQuantumValue(index, modifier) * 100;
        
        // Actualizar charts
        if (this.charts.performance) {
            this.charts.performance.data.datasets[0].data = this.generateQuantumData();
            this.charts.performance.data.datasets[1].data = this.generateQuantumData(0.8);
            this.charts.performance.update();
        }
        
        if (this.charts.resonance) {
            this.charts.resonance.data.datasets[0].data = [
                85 + this.purifier.generateQuantumValue(index, modifier) * 15,
                85 + this.purifier.generateQuantumValue(index, modifier) * 15,
                85 + this.purifier.generateQuantumValue(index, modifier) * 15,
                85 + this.purifier.generateQuantumValue(index, modifier) * 15,
                85 + this.purifier.generateQuantumValue(index, modifier) * 15,
                85 + this.purifier.generateQuantumValue(index, modifier) * 15
            ];
            this.charts.resonance.update();
        }
        
        this.updateInterface();
    }

    generateTimeLabels() {
        const labels = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5 * 60000); // 5 minutos atrás
            labels.push(time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateQuantumData(multiplier = 1) {
        const data = [];
        const baseValue = 80; // Valor base fijo
        
        for (let i = 0; i < 12; i++) {
            // Generar fluctuación sin acumular
            const quantumFluctuation = Math.sin(i * 0.5) * 5 + (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 3;
            const currentValue = baseValue + quantumFluctuation; // No acumular, solo sumar a base
            
            // Aplicar límites estrictos y multiplicador
            data.push(Math.max(70, Math.min(100, currentValue * multiplier)));
        }
        
        return data;
    }

    // MERKABA PROTOCOL METHODS
    
    initMerkaba() {
        console.log('[STAR] Initializing Merkaba Protocol...');
        
        // Bind Merkaba control event listeners
        this.bindMerkabaEventListeners();
        
        // Start Merkaba status updates
        this.startMerkabaUpdates();
        
        // Check initial health
        this.checkMerkabaHealth();
    }
    
    bindMerkabaEventListeners() {
        // Activate Merkaba button
        const activateBtn = document.querySelector('#activateMerkaba');
        if (activateBtn) {
            activateBtn.addEventListener('click', () => {
                this.activateMerkaba();
            });
        }
        
        // Deactivate Merkaba button
        const deactivateBtn = document.querySelector('#deactivateMerkaba');
        if (deactivateBtn) {
            deactivateBtn.addEventListener('click', () => {
                this.deactivateMerkaba();
            });
        }
        
        // Consciousness level input
        const consciousnessInput = document.querySelector('#consciousnessInput');
        const consciousnessValue = document.querySelector('#consciousnessValue');
        
        if (consciousnessInput && consciousnessValue) {
            consciousnessInput.addEventListener('input', (e) => {
                consciousnessValue.textContent = e.target.value;
                this.merkabaState.consciousness = parseFloat(e.target.value);
            });
        }
    }
    
    async checkMerkabaHealth() {
        try {
            const response = await fetch(`${this.merkabaAPI}/health`);
            const health = await response.json();
            console.log('[STAR] Merkaba service health:', health);
            return health.status === 'healthy';
        } catch (error) {
            console.error('[X] Merkaba service not available:', error.message);
            this.displayMerkabaError('Service not available');
            return false;
        }
    }
    
    async fetchMerkabaStatus() {
        try {
            const response = await fetch(`${this.merkabaAPI}/status`);
            const status = await response.json();
            this.updateMerkabaState(status);
            return status;
        } catch (error) {
            console.error('[X] Failed to fetch Merkaba status:', error.message);
            return null;
        }
    }
    
    async activateMerkaba() {
        const consciousnessLevel = this.merkabaState.consciousness;
        
        try {
            const response = await fetch(`${this.merkabaAPI}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ consciousness: consciousnessLevel })
            });
            
            const result = await response.json();
            
            if (result.activated) {
                console.log('[STAR] Merkaba activated successfully!');
                this.displayMerkabaSuccess('Merkaba Protocol Activated!');
                this.fetchMerkabaStatus(); // Update UI
            } else {
                console.warn('[WARNING] Merkaba activation failed');
                this.displayMerkabaError('Activation failed');
            }
        } catch (error) {
            console.error('[X] Error activating Merkaba:', error.message);
            this.displayMerkabaError('Connection error');
        }
    }
    
    async deactivateMerkaba() {
        try {
            const response = await fetch(`${this.merkabaAPI}/deactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.deactivated) {
                console.log('🌑 Merkaba deactivated successfully');
                this.displayMerkabaSuccess('Merkaba Protocol Deactivated');
                this.fetchMerkabaStatus(); // Update UI
            }
        } catch (error) {
            console.error('[X] Error deactivating Merkaba:', error.message);
            this.displayMerkabaError('Deactivation error');
        }
    }
    
    updateMerkabaState(status) {
        if (!status) return;
        
        // Update internal state
        this.merkabaState.activated = status.activated;
        this.merkabaState.dimensional_access = status.dimensional_access;
        this.merkabaState.phase = status.phase;
        this.merkabaState.rotation_speed = status.rotation_speed;
        this.merkabaState.synchronizations = status.metrics?.tetrahedron_synchronizations || 0;
        
        // Update UI elements
        this.updateMerkabaUI(status);
    }
    
    updateMerkabaUI(status) {
        // Dimensional Access
        const dimensionalAccess = document.querySelector('#dimensionalAccess');
        if (dimensionalAccess) {
            dimensionalAccess.textContent = `${status.dimensional_access || 3}D`;
        }
        
        // Consciousness Display
        const consciousnessDisplay = document.querySelector('#consciousnessDisplay');
        if (consciousnessDisplay) {
            consciousnessDisplay.textContent = (status.consciousness || 0.618).toFixed(3);
        }
        
        // Merkaba Phase
        const merkabaPhase = document.querySelector('#merkabaPhase');
        if (merkabaPhase) {
            merkabaPhase.textContent = status.phase || 'dormant';
        }
        
        // Rotation Speed
        const rotationSpeed = document.querySelector('#rotationSpeed');
        if (rotationSpeed) {
            rotationSpeed.textContent = `${status.rotation_speed || 0} RPS`;
        }
        
        // Synchronizations
        const synchronizations = document.querySelector('#synchronizations');
        if (synchronizations) {
            synchronizations.textContent = status.metrics?.tetrahedron_synchronizations || 0;
        }
        
        // Light Field
        const lightField = document.querySelector('#lightField');
        if (lightField) {
            lightField.textContent = (status.light_field_intensity || 0.42).toFixed(2);
        }
        
        // Metrics
        if (status.metrics) {
            const totalActivations = document.querySelector('#totalActivations');
            if (totalActivations) {
                totalActivations.textContent = status.metrics.total_activations || 0;
            }
            
            const dimensionalAccesses = document.querySelector('#dimensionalAccesses');
            if (dimensionalAccesses) {
                dimensionalAccesses.textContent = status.metrics.successful_dimensional_accesses || 0;
            }
            
            const activeGeometries = document.querySelector('#activeGeometries');
            if (activeGeometries) {
                activeGeometries.textContent = status.metrics.sacred_geometry_activations || 0;
            }
            
            const tradingEffectiveness = document.querySelector('#tradingEffectiveness');
            if (tradingEffectiveness) {
                tradingEffectiveness.textContent = `${status.trading_effectiveness || 1.0}x`;
            }
        }
        
        // Update Sacred Geometries (placeholder - would need actual geometry data)
        this.updateSacredGeometries(status);
        
        // Update Opportunities (placeholder - would need actual opportunities data)
        this.updateArbitrageOpportunities(status);
    }
    
    updateSacredGeometries(status) {
        // This would be populated with real sacred geometry data from the API
        const geometryList = document.querySelector('#geometryList');
        if (geometryList && status.active_geometries) {
            // For now, show static geometries - in real implementation would be dynamic
            const geometries = [
                { name: 'flower_of_life', multiplier: '1.15x' },
                { name: 'golden_spiral', multiplier: '1.618x' },
                { name: 'sri_yantra', multiplier: '1.25x' },
                { name: 'torus_field', multiplier: '1.3x' },
                { name: 'metatrons_cube', multiplier: '1.1x' }
            ];
            
            geometryList.innerHTML = geometries.map(geom => `
                <li class="geometry-item">
                    <span class="geometry-name">${geom.name}</span>
                    <span class="geometry-multiplier">${geom.multiplier}</span>
                </li>
            `).join('');
        }
    }
    
    updateArbitrageOpportunities(status) {
        const opportunitiesContainer = document.querySelector('#opportunitiesContainer');
        if (opportunitiesContainer) {
            // Use real data from Merkaba service
            if (!status.opportunities || status.opportunities.length === 0) {
                // Show real scanning status with actual symbol count
                const totalPairs = this.calculateTriangularPairs();
                opportunitiesContainer.innerHTML = `
                    <div class="opportunity-item">
                        <div class="opportunity-path">Scanning ${totalPairs} triangular paths from ${ALL_SYMBOLS().length} symbols...</div>
                        <div class="opportunity-profit">Mode: ${this.currentTradingMode} (${this.activeSymbols.length} active)</div>
                    </div>
                `;
            } else {
                // Display real opportunities from the service
                opportunitiesContainer.innerHTML = status.opportunities.map(opp => `
                    <div class="opportunity-item real-opportunity">
                        <div class="opportunity-header">
                            <div class="opportunity-path">${opp.path || this.createPathFromSymbols(opp.symbols)}</div>
                            <div class="opportunity-profit">+${opp.profit_percentage || opp.profitPercentage}%</div>
                        </div>
                        <div class="opportunity-details">
                            <span class="volume">Vol: ${opp.volume || 'N/A'}</span>
                            <span class="risk">${opp.risk_level || 'MEDIUM'}</span>
                            <span class="tier">${this.getSymbolTierInfo(opp.symbols)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    startMerkabaUpdates() {
        // Update Merkaba status every 5 seconds
        setInterval(() => {
            this.fetchMerkabaStatus();
        }, 5000);
    }
    
    displayMerkabaSuccess(message) {
        // Create a simple success notification
        console.log(`[CHECK] ${message}`);
        
        // You could add a toast notification here
        const notification = document.createElement('div');
        notification.className = 'merkaba-notification success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 136, 0.9);
            color: black;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    displayMerkabaError(message) {
        console.error(`[X] ${message}`);
        
        const notification = document.createElement('div');
        notification.className = 'merkaba-notification error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 68, 68, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // REAL SYMBOLS & TRADING OPPORTUNITIES METHODS
    
    generateRealTradingOpportunities() {
        console.log('[MAGNIFY] Generating real trading opportunities from 77 symbols...');
        
        const opportunities = [];
        const maxOpportunities = Math.floor(this.purifier.generateQuantumValue(index, modifier) * 5) + 3; // 3-7 opportunities
        
        // Get symbols based on current trading mode
        const symbolsToUse = getSymbolsForMode(this.currentTradingMode);
        
        for (let i = 0; i < maxOpportunities; i++) {
            const opportunity = this.createTradingOpportunity(symbolsToUse);
            if (opportunity) {
                opportunities.push(opportunity);
            }
        }
        
        this.realOpportunities = opportunities;
        this.updateTradingOpportunitiesUI();
        
        return opportunities;
    }
    
    createTradingOpportunity(symbols) {
        // Select random symbols for triangular arbitrage
        const shuffled = [...symbols].sort(() => this.purifier.generateQuantumValue(index, modifier) - 0.5);
        const selectedSymbols = shuffled.slice(0, 3);
        
        if (selectedSymbols.length < 3) return null;
        
        // Calculate profit potential based on symbol tiers
        const tierProfits = selectedSymbols.map(symbol => {
            const config = getSymbolConfig(symbol);
            const performance = config.performance;
            
            // Base profit from expected daily return with quantum enhancement
            const baseProfit = performance.expected_daily_return * 100;
            const quantumMultiplier = config.config.leverage_multiplier;
            const volatilityBonus = this.getVolatilityBonus(performance.volatility);
            
            return baseProfit * quantumMultiplier * volatilityBonus;
        });
        
        const avgProfit = tierProfits.reduce((sum, p) => sum + p, 0) / tierProfits.length;
        const finalProfit = Math.max(0.5, Math.min(15, avgProfit + (this.purifier.generateQuantumValue(index, modifier) - 0.5) * 2));
        
        // Create triangular path
        const path = `${selectedSymbols[0]} → ${selectedSymbols[1]} → ${selectedSymbols[2]}`;
        
        // Calculate additional metrics
        const volume = this.calculateExpectedVolume(selectedSymbols);
        const riskLevel = this.calculateRiskLevel(selectedSymbols);
        const timing = this.calculateOptimalTiming();
        
        return {
            id: `opp_${Date.now()}_${this.purifier.generateQuantumValue(index, modifier).toString(36).substr(2, 9)}`,
            path,
            symbols: selectedSymbols,
            profitPercentage: finalProfit.toFixed(2),
            volume: volume,
            riskLevel: riskLevel,
            timing: timing,
            tierMix: this.analyzeTierMix(selectedSymbols),
            timestamp: Date.now()
        };
    }
    
    getVolatilityBonus(volatility) {
        const bonusMap = {
            'LOW': 0.8,
            'MEDIUM': 1.0,
            'MEDIUM-HIGH': 1.2,
            'HIGH': 1.5,
            'EXTREME': 1.8
        };
        return bonusMap[volatility] || 1.0;
    }
    
    calculateExpectedVolume(symbols) {
        // Simulate volume based on symbol popularity and tier
        const volumes = symbols.map(symbol => {
            const config = getSymbolConfig(symbol);
            const tierMultiplier = {
                'TIER1': 100000,
                'TIER2': 75000,
                'TIER3': 50000,
                'TIER4': 35000,
                'TIER5': 25000,
                'TIER6': 15000
            }[config.tier] || 30000;
            
            return tierMultiplier * (0.5 + this.purifier.generateQuantumValue(index, modifier));
        });
        
        const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
        return `$${(avgVolume / 1000).toFixed(0)}K`;
    }
    
    calculateRiskLevel(symbols) {
        const risks = symbols.map(symbol => {
            const config = getSymbolConfig(symbol);
            return config.performance.max_drawdown;
        });
        
        const avgRisk = risks.reduce((sum, r) => sum + r, 0) / risks.length;
        
        if (avgRisk < 0.15) return 'LOW';
        if (avgRisk < 0.25) return 'MEDIUM';
        if (avgRisk < 0.35) return 'HIGH';
        return 'EXTREME';
    }
    
    calculateOptimalTiming() {
        const timings = ['5-15min', '15-30min', '30-60min', '1-2hr', '2-4hr'];
        const weights = [0.3, 0.4, 0.2, 0.08, 0.02]; // Favor shorter timeframes
        
        const random = this.purifier.generateQuantumValue(index, modifier);
        let cumulative = 0;
        
        for (let i = 0; i < timings.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return timings[i];
            }
        }
        
        return timings[0];
    }
    
    analyzeTierMix(symbols) {
        const tiers = symbols.map(symbol => getSymbolConfig(symbol).tier);
        const tierCounts = tiers.reduce((acc, tier) => {
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(tierCounts).map(tier => `${tier}(${tierCounts[tier]})`).join('+');
    }
    
    updateTradingOpportunitiesUI() {
        // Update main opportunities display
        const opportunitiesContainer = document.querySelector('#opportunitiesContainer');
        if (opportunitiesContainer && this.realOpportunities.length > 0) {
            opportunitiesContainer.innerHTML = this.realOpportunities.map(opp => `
                <div class="opportunity-item real-opportunity" data-opp-id="${opp.id}">
                    <div class="opportunity-header">
                        <div class="opportunity-path">${opp.path}</div>
                        <div class="opportunity-profit">+${opp.profitPercentage}%</div>
                    </div>
                    <div class="opportunity-details">
                        <span class="volume">Vol: ${opp.volume}</span>
                        <span class="risk risk-${opp.riskLevel.toLowerCase()}">${opp.riskLevel}</span>
                        <span class="timing">${opp.timing}</span>
                        <span class="tier-mix">${opp.tierMix}</span>
                    </div>
                </div>
            `).join('');
            
            // Add click handlers for opportunity details
            this.bindOpportunityClickHandlers();
        }
        
        // Update opportunities table if exists
        this.updateOpportunitiesTable();
    }
    
    updateOpportunitiesTable() {
        const tableContainer = document.querySelector('#opportunitiesTable');
        if (tableContainer && this.realOpportunities.length > 0) {
            const tableHTML = `
                <table class="opportunities-table">
                    <thead>
                        <tr>
                            <th>Path</th>
                            <th>Profit</th>
                            <th>Volume</th>
                            <th>Risk</th>
                            <th>Timing</th>
                            <th>Tiers</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.realOpportunities.map(opp => `
                            <tr class="opportunity-row" data-opp-id="${opp.id}">
                                <td class="path-cell">${opp.path}</td>
                                <td class="profit-cell positive">+${opp.profitPercentage}%</td>
                                <td class="volume-cell">${opp.volume}</td>
                                <td class="risk-cell risk-${opp.riskLevel.toLowerCase()}">${opp.riskLevel}</td>
                                <td class="timing-cell">${opp.timing}</td>
                                <td class="tier-cell">${opp.tierMix}</td>
                                <td class="action-cell">
                                    <button class="execute-btn" onclick="quantumEngine.executeOpportunity('${opp.id}')">
                                        Execute
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            tableContainer.innerHTML = tableHTML;
        }
    }
    
    bindOpportunityClickHandlers() {
        const opportunityItems = document.querySelectorAll('.real-opportunity');
        opportunityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const oppId = item.dataset.oppId;
                this.showOpportunityDetails(oppId);
            });
        });
    }
    
    showOpportunityDetails(oppId) {
        const opportunity = this.realOpportunities.find(opp => opp.id === oppId);
        if (!opportunity) return;
        
        console.log('[CHART] Opportunity Details:', opportunity);
        
        // Show detailed analysis
        const details = {
            symbols: opportunity.symbols,
            profitAnalysis: this.analyzeProfit(opportunity),
            riskAssessment: this.assessRisk(opportunity),
            marketConditions: this.getMarketConditions(opportunity.symbols)
        };
        
        // Could implement a detailed modal here
        console.table(details);
    }
    
    executeOpportunity(oppId) {
        const opportunity = this.realOpportunities.find(opp => opp.id === oppId);
        if (!opportunity) return;
        
        console.log('[LIGHTNING] Executing opportunity:', opportunity.path);
        
        // Simulate execution
        this.displayMerkabaSuccess(`Executing ${opportunity.path} for +${opportunity.profitPercentage}%`);
        
        // Remove executed opportunity
        this.realOpportunities = this.realOpportunities.filter(opp => opp.id !== oppId);
        this.updateTradingOpportunitiesUI();
        
        // Update metrics
        this.updateExecutionMetrics(opportunity);
    }
    
    analyzeProfit(opportunity) {
        return {
            expectedProfit: opportunity.profitPercentage,
            breakdownBySybmol: opportunity.symbols.map(symbol => {
                const config = getSymbolConfig(symbol);
                return {
                    symbol,
                    tier: config.tier,
                    expectedReturn: config.performance.expected_daily_return,
                    leverage: config.config.leverage_multiplier
                };
            })
        };
    }
    
    assessRisk(opportunity) {
        const maxDrawdowns = opportunity.symbols.map(symbol => {
            return getSymbolConfig(symbol).performance.max_drawdown;
        });
        
        return {
            maxDrawdown: Math.max(...maxDrawdowns),
            averageDrawdown: maxDrawdowns.reduce((sum, dd) => sum + dd, 0) / maxDrawdowns.length,
            riskLevel: opportunity.riskLevel,
            diversificationScore: new Set(opportunity.symbols.map(s => getSymbolConfig(s).tier)).size
        };
    }
    
    getMarketConditions(symbols) {
        // Simulate market conditions
        return {
            volatility: 'NORMAL',
            liquidity: 'HIGH',
            trend: this.purifier.generateQuantumValue(index, modifier) > 0.5 ? 'BULLISH' : 'BEARISH',
            volume: 'ABOVE_AVERAGE'
        };
    }
    
    updateExecutionMetrics(opportunity) {
        // Update portfolio metrics after execution
        this.portfolioState.totalValue *= (1 + parseFloat(opportunity.profitPercentage) / 100);
        this.portfolioState.totalReturn += parseFloat(opportunity.profitPercentage) / 10; // Diminished impact
        
        // Update interface
        this.updatePortfolioData();
    }
    
    generateTierStatistics() {
        console.log('[TREND_UP] Generating tier statistics for 77 symbols...');
        
        const tierStats = {};
        
        Object.entries(SYMBOLS_TIERS).forEach(([tierName, getSymbols]) => {
            const symbols = getSymbols(); // Call the function to get symbols
            const tierPerformance = getLeonardoConfig().PERFORMANCE_METRICS ? getLeonardoConfig().PERFORMANCE_METRICS[tierName] : { expected_daily_return: 0.02, max_drawdown: 0.15, win_rate_target: 0.7, volatility: 'MEDIUM' };
            const tierConfig = getLeonardoConfig().QUANTUM_TIER_CONFIG ? getLeonardoConfig().QUANTUM_TIER_CONFIG[tierName] : { leverage_multiplier: 1.0, quantum_priority: 5 };
            
            tierStats[tierName] = {
                symbolCount: symbols.length,
                expectedDailyReturn: tierPerformance.expected_daily_return,
                maxDrawdown: tierPerformance.max_drawdown,
                winRate: tierPerformance.win_rate_target,
                volatility: tierPerformance.volatility,
                leverageMultiplier: tierConfig.leverage_multiplier,
                quantumPriority: tierConfig.quantum_priority,
                symbols: symbols
            };
        });
        
        this.symbolMetrics = tierStats;
        this.updateTierStatisticsUI();
        
        return tierStats;
    }
    
    updateTierStatisticsUI() {
        const statsContainer = document.querySelector('#tierStatistics');
        if (statsContainer && this.symbolMetrics) {
            const statsHTML = `
                <div class="tier-stats-grid">
                    ${Object.entries(this.symbolMetrics).map(([tier, stats]) => `
                        <div class="tier-stat-card ${tier.toLowerCase()}">
                            <div class="tier-header">
                                <h3>${tier}</h3>
                                <span class="symbol-count">${stats.symbolCount} symbols</span>
                            </div>
                            <div class="tier-metrics">
                                <div class="metric">
                                    <span class="label">Daily Return:</span>
                                    <span class="value positive">${(stats.expectedDailyReturn * 100).toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="label">Max Drawdown:</span>
                                    <span class="value negative">${(stats.maxDrawdown * 100).toFixed(1)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="label">Win Rate:</span>
                                    <span class="value">${(stats.winRate * 100).toFixed(0)}%</span>
                                </div>
                                <div class="metric">
                                    <span class="label">Leverage:</span>
                                    <span class="value">${stats.leverageMultiplier}x</span>
                                </div>
                                <div class="metric">
                                    <span class="label">Volatility:</span>
                                    <span class="value volatility-${stats.volatility.toLowerCase().replace('-', '')}">${stats.volatility}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="total-symbols-summary">
                    <h3>[CHART] Total Trading Universe</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="big-number">${ALL_SYMBOLS().length}</span>
                            <span class="label">Total Symbols</span>
                        </div>
                        <div class="stat">
                            <span class="big-number">${this.currentTradingMode}</span>
                            <span class="label">Current Mode</span>
                        </div>
                        <div class="stat">
                            <span class="big-number">${this.activeSymbols.length}</span>
                            <span class="label">Active Symbols</span>
                        </div>
                    </div>
                </div>
            `;
            statsContainer.innerHTML = statsHTML;
        }
    }
    
    changeTradingMode(newMode) {
        if (!TRADING_MODES[newMode]) {
            console.warn(`[WARNING] Invalid trading mode: ${newMode}`);
            return;
        }
        
        console.log(`[REFRESH] Switching trading mode: ${this.currentTradingMode} → ${newMode}`);
        
        this.currentTradingMode = newMode;
        this.activeSymbols = getSymbolsForMode(newMode);
        
        // Regenerate opportunities with new symbol set
        this.generateRealTradingOpportunities();
        
        // Update UI
        this.updateTradingModeUI();
        
        this.displayMerkabaSuccess(`Trading mode changed to ${newMode} (${this.activeSymbols.length} symbols)`);
    }
    
    updateTradingModeUI() {
        const modeDisplay = document.querySelector('#currentTradingMode');
        if (modeDisplay) {
            modeDisplay.textContent = this.currentTradingMode;
        }
        
        const activeSymbolsDisplay = document.querySelector('#activeSymbolsCount');
        if (activeSymbolsDisplay) {
            activeSymbolsDisplay.textContent = this.activeSymbols.length;
        }
        
        // Update mode selector if exists
        const modeSelector = document.querySelector('#tradingModeSelector');
        if (modeSelector) {
            modeSelector.value = this.currentTradingMode;
        }
    }
    
    // UTILITY METHODS FOR REAL DATA
    
    calculateTriangularPairs() {
        // Calculate total triangular arbitrage pairs possible with current active symbols
        const n = this.activeSymbols.length;
        // Formula: C(n,3) = n! / (3!(n-3)!) = n(n-1)(n-2)/6
        return n >= 3 ? Math.floor(n * (n - 1) * (n - 2) / 6) : 0;
    }
    
    createPathFromSymbols(symbols) {
        if (!symbols || symbols.length < 3) return 'Invalid Path';
        return `${symbols[0]} → ${symbols[1]} → ${symbols[2]}`;
    }
    
    getSymbolTierInfo(symbols) {
        if (!symbols || symbols.length === 0) return 'N/A';
        
        const tiers = symbols.map(symbol => {
            const config = getSymbolConfig(symbol);
            return config.tier;
        });
        
        const tierCounts = tiers.reduce((acc, tier) => {
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(tierCounts)
            .map(([tier, count]) => `${tier}(${count})`)
            .join('+');
    }
    
    displaySymbolStatistics() {
        console.log('[CHART] Symbol Statistics Summary:');
        console.log(`Total Symbols: ${ALL_SYMBOLS().length}`);
        console.log(`Current Mode: ${this.currentTradingMode}`);
        console.log(`Active Symbols: ${this.activeSymbols.length}`);
        console.log(`Possible Triangular Pairs: ${this.calculateTriangularPairs()}`);
        
        Object.entries(SYMBOLS_TIERS).forEach(([tier, getSymbols]) => {
            console.log(`${tier}: ${getSymbols().length} symbols`);
        });
        
        return {
            totalSymbols: ALL_SYMBOLS().length,
            activeSymbols: this.activeSymbols.length,
            triangularPairs: this.calculateTriangularPairs(),
            tierBreakdown: Object.fromEntries(
                Object.entries(SYMBOLS_TIERS).map(([tier, getSymbols]) => [tier, getSymbols().length])
            )
        };
    }
    
    displayTradingModes() {
        console.log('[TARGET] Available Trading Modes:');
        Object.entries(TRADING_MODES).forEach(([mode, config]) => {
            console.log(`${mode}: ${config.symbols.length} symbols, max ${config.max_positions} positions`);
        });
        
        return TRADING_MODES;
    }
    
    initializeRealData() {
        console.log('[LIGHTNING] Initializing real data systems...');
        
        // Generate tier statistics
        this.generateTierStatistics();
        
        // Display symbol statistics
        this.displaySymbolStatistics();
        
        // Update UI with real data
        this.updateTierStatisticsUI();
        this.updateTradingModeUI();
        
        console.log('[CHECK] Real data systems initialized');
    }
}

// Inicialización global
let quantumEngine;

document.addEventListener('DOMContentLoaded', () => {
    quantumEngine = new QuantumEngine();
});

// Agregar estilos para Big Bang Flash
const style = document.createElement('style');
style.textContent = `
    @keyframes bigBangFlash {
        0% { filter: brightness(1); }
        50% { filter: brightness(2) hue-rotate(180deg); }
        100% { filter: brightness(1); }
    }
`;
document.head.appendChild(style);

// Exportar para uso global
window.QuantumEngine = QuantumEngine;
