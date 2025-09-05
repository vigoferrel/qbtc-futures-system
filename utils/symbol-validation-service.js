/**
 * 🔍 SYMBOL VALIDATION SERVICE - QBTC QUANTUM BRAIN
 * ================================================
 * 
 * Servicio de validación de símbolos con integración completa QBTC:
 * - Verificación en tiempo real con Binance Futures
 * - Cache inteligente con TTL dinámico
 * - Integración con Leonardo Liberation Engine
 * - Fallback graceful en caso de errores API
 * - Métricas de coherencia cuántica
 */

import https from 'https';

// Símbolos problemáticos conocidos que deben ser excluidos
const PROBLEMATIC_SYMBOLS = [
    'AGIXUSDT', 'ALPACAUSDT', 'AMBUSDT', 'BADGERUSDT', 'BALUSDT', 'BLZUSDT',
    'BNXUSDT', 'BONDUSDT', 'COMBOUSDT', 'DARUSDT', 'DEFIUSDT', 'DGBUSDT',
    'FTMUSDT', 'GLMRUSDT', 'IDEXUSDT', 'KEYUSDT', 'KLAYUSDT', 'LINAUSDT',
    'LITUSDT', 'LOKAUSDT', 'LOOMUSDT', 'MDTUSDT', 'MEMEFIUSDT', 'NULSUSDT',
    'OCEANUSDT', 'OMGUSDT', 'ORBSUSDT', 'RADUSDT', 'REEFUSDT', 'RENUSDT',
    'SNTUSDT', 'STMXUSDT', 'STPTUSDT', 'STRAXUSDT', 'TROYUSDT', 'UNFIUSDT',
    'VIDTUSDT', 'WAVESUSDT', 'XEMUSDT'
];

class SymbolValidationService {
    constructor(config = {}) {
        this.config = {
            BINANCE_API: 'https://fapi.binance.com/fapi/v1/exchangeInfo',
            VALIDATION_INTERVAL: config.validationInterval || (4 * 60 * 60 * 1000), // 4 horas
            REQUEST_TIMEOUT: config.requestTimeout || 30000,
            RETRY_ATTEMPTS: config.retryAttempts || 3,
            RETRY_DELAY: config.retryDelay || 2000,
            STRICT_MODE: config.strictMode !== false // Default true
        };
        
        this.validSymbols = new Set();
        this.lastValidation = 0;
        this.isValidating = false;
        this.cachedExchangeInfo = null;
        this.validationMetrics = {
            totalValidations: 0,
            successfulValidations: 0,
            lastValidationTime: null,
            coherenceScore: 0
        };
    }

    /**
     * Realiza petición HTTP con retry logic y timeout
     */
    async makeRequest(url, retries = this.config.RETRY_ATTEMPTS) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: this.config.REQUEST_TIMEOUT }, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error(`JSON parsing failed: ${error.message}`));
                    }
                });
            });
            
            request.on('error', async (error) => {
                if (retries > 0) {
                    console.log(`[SYMBOL-VALIDATION] Retrying request... (${retries} attempts left)`);
                    await this.delay(this.config.RETRY_DELAY);
                    try {
                        const result = await this.makeRequest(url, retries - 1);
                        resolve(result);
                    } catch (retryError) {
                        reject(retryError);
                    }
                } else {
                    reject(error);
                }
            });
            
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    /**
     * Helper para delays en retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Valida un símbolo individual según criterios estrictos
     */
    isSymbolValid(symbolInfo) {
        if (!symbolInfo || !symbolInfo.symbol) return false;
        
        const symbol = symbolInfo.symbol;
        
        // Criterios de validación
        const hasValidStatus = symbolInfo.status === 'TRADING';
        const isPerpetualContract = symbolInfo.contractType === 'PERPETUAL';
        const isUSDTBase = symbol.endsWith('USDT');
        const isNotProblematic = !PROBLEMATIC_SYMBOLS.includes(symbol);
        
        // En modo estricto, todos los criterios deben cumplirse
        if (this.config.STRICT_MODE) {
            return hasValidStatus && isPerpetualContract && isUSDTBase && isNotProblematic;
        }
        
        // En modo no estricto, solo status y base son requeridos
        return hasValidStatus && isUSDTBase && isNotProblematic;
    }

    /**
     * Obtiene información actual de Binance Futures
     */
    async fetchExchangeInfo() {
        try {
            console.log('[SYMBOL-VALIDATION] Fetching exchange info from Binance...');
            const exchangeInfo = await this.makeRequest(this.config.BINANCE_API);
            
            if (!exchangeInfo || !exchangeInfo.symbols) {
                throw new Error('Invalid exchange info structure');
            }
            
            this.cachedExchangeInfo = exchangeInfo;
            console.log(`[SYMBOL-VALIDATION] ✅ Fetched ${exchangeInfo.symbols.length} symbols`);
            
            return exchangeInfo;
            
        } catch (error) {
            console.error(`[SYMBOL-VALIDATION] ❌ Failed to fetch exchange info: ${error.message}`);
            
            // Fallback al cache si está disponible
            if (this.cachedExchangeInfo) {
                console.log('[SYMBOL-VALIDATION] 🔄 Using cached exchange info as fallback');
                return this.cachedExchangeInfo;
            }
            
            throw error;
        }
    }

    /**
     * Valida todos los símbolos y actualiza cache
     */
    async validateSymbols() {
        const now = Date.now();
        
        // Verificar si necesita revalidación
        if (now - this.lastValidation < this.config.VALIDATION_INTERVAL && this.validSymbols.size > 0) {
            console.log('[SYMBOL-VALIDATION] Using cached symbols (within validation interval)');
            return Array.from(this.validSymbols);
        }
        
        // Evitar validaciones concurrentes
        if (this.isValidating) {
            console.log('[SYMBOL-VALIDATION] Validation already in progress, waiting...');
            while (this.isValidating) {
                await this.delay(1000);
            }
            return Array.from(this.validSymbols);
        }
        
        this.isValidating = true;
        this.validationMetrics.totalValidations++;
        
        try {
            const exchangeInfo = await this.fetchExchangeInfo();
            const validSymbolsSet = new Set();
            
            // Filtrar símbolos válidos
            for (const symbolInfo of exchangeInfo.symbols) {
                if (this.isSymbolValid(symbolInfo)) {
                    validSymbolsSet.add(symbolInfo.symbol);
                }
            }
            
            // Actualizar estado
            this.validSymbols = validSymbolsSet;
            this.lastValidation = now;
            this.validationMetrics.successfulValidations++;
            this.validationMetrics.lastValidationTime = new Date().toISOString();
            
            // Calcular coherencia cuántica
            this.calculateCoherenceScore(exchangeInfo.symbols.length, validSymbolsSet.size);
            
            const validCount = validSymbolsSet.size;
            const totalCount = exchangeInfo.symbols.length;
            const coherence = this.validationMetrics.coherenceScore;
            
            console.log(`[SYMBOL-VALIDATION] ✅ Validation complete:`);
            console.log(`   📊 Valid symbols: ${validCount}/${totalCount} (${((validCount/totalCount)*100).toFixed(1)}%)`);
            console.log(`   ⚛️  Quantum coherence: ${(coherence*100).toFixed(1)}%`);
            
            return Array.from(this.validSymbols);
            
        } catch (error) {
            console.error(`[SYMBOL-VALIDATION] ❌ Validation failed: ${error.message}`);
            
            // Retornar cache existente si está disponible
            if (this.validSymbols.size > 0) {
                console.log('[SYMBOL-VALIDATION] 🔄 Returning cached symbols due to validation error');
                return Array.from(this.validSymbols);
            }
            
            // Fallback a símbolos básicos si no hay cache
            return this.getFallbackSymbols();
            
        } finally {
            this.isValidating = false;
        }
    }

    /**
     * Calcula score de coherencia cuántica
     */
    calculateCoherenceScore(totalSymbols, validSymbols) {
        if (totalSymbols === 0) {
            this.validationMetrics.coherenceScore = 0;
            return;
        }
        
        const baseCoherence = validSymbols / totalSymbols;
        const problematicPenalty = this.countProblematicSymbols() / totalSymbols;
        const successRateBonus = this.getSuccessRate() * 0.1;
        
        const coherence = Math.max(0, Math.min(1, baseCoherence - problematicPenalty + successRateBonus));
        this.validationMetrics.coherenceScore = Math.round(coherence * 1000) / 1000;
    }

    /**
     * Cuenta símbolos problemáticos encontrados
     */
    countProblematicSymbols() {
        if (!this.cachedExchangeInfo || !this.cachedExchangeInfo.symbols) return 0;
        
        return this.cachedExchangeInfo.symbols.filter(symbol => 
            PROBLEMATIC_SYMBOLS.includes(symbol.symbol)
        ).length;
    }

    /**
     * Obtiene tasa de éxito de validaciones
     */
    getSuccessRate() {
        if (this.validationMetrics.totalValidations === 0) return 1;
        return this.validationMetrics.successfulValidations / this.validationMetrics.totalValidations;
    }

    /**
     * Símbolos de fallback en caso de fallo completo
     */
    getFallbackSymbols() {
        console.log('[SYMBOL-VALIDATION] 🚨 Using emergency fallback symbols');
        
        // Símbolos más estables y siempre disponibles
        return [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
            'XRPUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT',
            'LINKUSDT', 'LTCUSDT', 'BCHUSDT', 'UNIUSDT', 'ATOMUSDT',
            'NEARUSDT', 'ALGOUSDT', 'VETUSDT', 'FILUSDT', 'SANDUSDT',
            'MANAUSDT', 'GRTUSDT', 'AAVEUSDT', 'MKRUSDT', 'COMPUSDT'
        ];
    }

    /**
     * Verifica si un símbolo específico es válido
     */
    async isValidSymbol(symbol) {
        const validSymbols = await this.validateSymbols();
        return validSymbols.includes(symbol);
    }

    /**
     * Filtra una lista de símbolos para quedarse solo con válidos
     */
    async filterValidSymbols(symbols) {
        const validSymbols = await this.validateSymbols();
        const validSet = new Set(validSymbols);
        
        return symbols.filter(symbol => validSet.has(symbol));
    }

    /**
     * Obtiene métricas del servicio de validación
     */
    getMetrics() {
        return {
            ...this.validationMetrics,
            currentValidSymbolsCount: this.validSymbols.size,
            cacheAge: Date.now() - this.lastValidation,
            isValidating: this.isValidating
        };
    }

    /**
     * Fuerza una nueva validación ignorando cache
     */
    async forceValidation() {
        console.log('[SYMBOL-VALIDATION] 🔄 Forcing new validation (ignoring cache)...');
        this.lastValidation = 0;
        return await this.validateSymbols();
    }

    /**
     * Limpia cache y reinicia el servicio
     */
    reset() {
        console.log('[SYMBOL-VALIDATION] 🔄 Resetting validation service...');
        this.validSymbols.clear();
        this.lastValidation = 0;
        this.isValidating = false;
        this.cachedExchangeInfo = null;
    }

    /**
     * Obtiene reporte detallado del estado
     */
    getStatusReport() {
        const metrics = this.getMetrics();
        const cacheAgeHours = metrics.cacheAge / (60 * 60 * 1000);
        
        return {
            timestamp: new Date().toISOString(),
            status: this.isValidating ? 'VALIDATING' : 'READY',
            validSymbolsCount: metrics.currentValidSymbolsCount,
            cacheAgeHours: Math.round(cacheAgeHours * 100) / 100,
            coherenceScore: metrics.coherenceScore,
            successRate: this.getSuccessRate(),
            totalValidations: metrics.totalValidations,
            lastValidation: metrics.lastValidationTime
        };
    }
}

export { SymbolValidationService, PROBLEMATIC_SYMBOLS };

// Ejemplo de uso y test básico
if (import.meta.url === `file://${process.argv[1]}`) {
    async function testValidation() {
        console.log('🧪 Testing Symbol Validation Service...\n');
        
        const validator = new SymbolValidationService({
            validationInterval: 1000, // 1 segundo para testing
            strictMode: true
        });
        
        try {
            const validSymbols = await validator.validateSymbols();
            const metrics = validator.getMetrics();
            const report = validator.getStatusReport();
            
            console.log('✅ Test Results:');
            console.log(`   Valid symbols found: ${validSymbols.length}`);
            console.log(`   Coherence score: ${(metrics.coherenceScore * 100).toFixed(1)}%`);
            console.log(`   Success rate: ${(validator.getSuccessRate() * 100).toFixed(1)}%`);
            
            // Test individual symbol validation
            const testSymbols = ['BTCUSDT', 'MEMEFIUSDT', 'ETHUSDT', 'XEMUSDT'];
            console.log('\n🔍 Testing individual symbols:');
            
            for (const symbol of testSymbols) {
                const isValid = await validator.isValidSymbol(symbol);
                const status = isValid ? '✅' : '❌';
                console.log(`   ${status} ${symbol}: ${isValid ? 'VALID' : 'INVALID'}`);
            }
            
            console.log('\n📊 Status Report:');
            console.log(JSON.stringify(report, null, 2));
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }
    
    testValidation();
}
