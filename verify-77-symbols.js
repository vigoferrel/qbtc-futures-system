#!/usr/bin/env node

/**
 * [MAGNIFY] VERIFICADOR DE 77 SÍMBOLOS DIVINOS - SISTEMA QBTC
 * =====================================================
 * Verifica que los 77 símbolos estén correctamente configurados
 * en todos los archivos del sistema
 */

import { QUANTUM_CONSTANTS } from './config/constants.js';
import fs from 'fs';
import path from 'path';

const EXPECTED_SYMBOLS_COUNT = 77;

// Los 77 símbolos organizados por tiers
const DIVINE_77_SYMBOLS = {
    TIER1: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    
    TIER2: [
        'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 
        'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
        'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'NEARUSDT'
    ],
    
    TIER3: [
        'UNIUSDT', 'FILUSDT', 'TRXUSDT', 'ETCUSDT',
        'XLMUSDT', 'ICPUSDT', 'VETUSDT', 'FTMUSDT',
        'ALGOUSDT', 'SANDUSDT', 'MANAUSDT', 'AXSUSDT',
        'THETAUSDT', 'GRTUSDT', 'EOSUSDT', 'AAVEUSDT',
        'MKRUSDT', 'COMPUSDT', 'SNXUSDT', 'SUSHIUSDT'
    ],
    
    TIER4: [
        'APTUSDT', 'SUIUSDT', 'ARBUSDT', 'OPUSDT',
        'INJUSDT', 'STXUSDT', 'TIAUSDT', 'SEIUSDT',
        'ORDIUSDT', '1000PEPEUSDT', '1000FLOKIUSDT', 
        'WIFUSDT', 'BONKUSDT', '1000SATSUSDT'
    ],
    
    TIER5: [
        'CRVUSDT', 'LRCUSDT', 'ENJUSDT', 'CHZUSDT',
        'BATUSDT', 'ZRXUSDT', 'RENUSDT', 'STORJUSDT',
        'CTKUSDT', 'BNTUSDT', 'DYDXUSDT', 'UMAUSDT',
        'BANDUSDT', 'KAVAUSDT', 'IOTAUSDT', 'ONTUSDT'
    ],
    
    TIER6: [
        'APEUSDT', 'GALAUSDT', 'GMEUSDT', 'IMXUSDT',
        'LOOKSUSDT', 'MINAUSDT', 'FLOWUSDT', 'CHRUSDT',
        'TLMUSDT', 'ALPACAUSDT', 'YGGUSDT', 'GHSTUSDT'
    ]
};

// Combinar todos los símbolos
const ALL_77_SYMBOLS = [
    ...DIVINE_77_SYMBOLS.TIER1,
    ...DIVINE_77_SYMBOLS.TIER2,
    ...DIVINE_77_SYMBOLS.TIER3,
    ...DIVINE_77_SYMBOLS.TIER4,
    ...DIVINE_77_SYMBOLS.TIER5,
    ...DIVINE_77_SYMBOLS.TIER6
];

class SymbolVerifier {
    constructor() {
        this.results = {
            total_symbols_found: 0,
            files_checked: 0,
            errors: [],
            warnings: [],
            success: false
        };
    }
    
    printHeader() {
        console.log('\n[GALAXY] ================================================');
        console.log('[MAGNIFY] VERIFICADOR DE 77 SÍMBOLOS DIVINOS - QBTC');
        console.log('[GALAXY] ================================================');
        console.log(`[TARGET] Objetivo: Verificar ${EXPECTED_SYMBOLS_COUNT} símbolos en sistema`);
        console.log('[SPARKLES] Iniciando verificación cuántica...\n');
    }
    
    verifyConstantsFile() {
        console.log('📁 Verificando config/constants.js...');
        
        try {
            const quantumSymbols = QUANTUM_CONSTANTS.QUANTUM_SYMBOLS;
            
            if (!quantumSymbols) {
                this.results.errors.push('QUANTUM_SYMBOLS no encontrado en constants.js');
                return false;
            }
            
            const symbolsCount = quantumSymbols.length;
            console.log(`   [CHECK] Símbolos encontrados: ${symbolsCount}`);
            
            if (symbolsCount !== EXPECTED_SYMBOLS_COUNT) {
                this.results.errors.push(`Constants.js tiene ${symbolsCount} símbolos, esperados ${EXPECTED_SYMBOLS_COUNT}`);
                return false;
            }
            
            // Verificar que todos los símbolos estén presentes
            const missingSymbols = ALL_77_SYMBOLS.filter(symbol => !quantumSymbols.includes(symbol));
            const extraSymbols = quantumSymbols.filter(symbol => !ALL_77_SYMBOLS.includes(symbol));
            
            if (missingSymbols.length > 0) {
                this.results.errors.push(`Símbolos faltantes en constants.js: ${missingSymbols.join(', ')}`);
                return false;
            }
            
            if (extraSymbols.length > 0) {
                this.results.warnings.push(`Símbolos extra en constants.js: ${extraSymbols.join(', ')}`);
            }
            
            this.results.total_symbols_found = symbolsCount;
            console.log('   [CHECK] config/constants.js verificado correctamente');
            return true;
            
        } catch (error) {
            this.results.errors.push(`Error verificando constants.js: ${error.message}`);
            return false;
        }
    }
    
    verifySymbolsExtendedFile() {
        console.log('\n📁 Verificando config/symbols-extended.js...');
        
        try {
            const filePath = './config/symbols-extended.js';
            
            if (!fs.existsSync(filePath)) {
                this.results.warnings.push('symbols-extended.js no encontrado');
                return true; // No es crítico
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar que contenga referencia a 77 símbolos
            if (content.includes('77') && content.includes('ALL_SYMBOLS')) {
                console.log('   [CHECK] symbols-extended.js contiene configuración de 77 símbolos');
                return true;
            } else {
                this.results.warnings.push('symbols-extended.js puede no estar actualizado');
                return true;
            }
            
        } catch (error) {
            this.results.warnings.push(`Error verificando symbols-extended.js: ${error.message}`);
            return true;
        }
    }
    
    verifyTierDistribution() {
        console.log('\n[TARGET] Verificando distribución por tiers...');
        
        const expectedDistribution = {
            TIER1: 3,   // Bitcoin, Ethereum, BNB
            TIER2: 12,  // Major altcoins
            TIER3: 20,  // Popular altcoins
            TIER4: 14,  // Emerging tokens
            TIER5: 16,  // DeFi & Specialized
            TIER6: 12   // Metaverse & Gaming
        };
        
        let distributionCorrect = true;
        
        for (const [tier, expectedCount] of Object.entries(expectedDistribution)) {
            const actualCount = DIVINE_77_SYMBOLS[tier].length;
            
            console.log(`   ${tier}: ${actualCount} símbolos (esperados: ${expectedCount})`);
            
            if (actualCount !== expectedCount) {
                this.results.errors.push(`${tier} tiene ${actualCount} símbolos, esperados ${expectedCount}`);
                distributionCorrect = false;
            }
        }
        
        const totalFromTiers = Object.values(expectedDistribution).reduce((a, b) => a + b, 0);
        console.log(`   Total calculado: ${totalFromTiers} símbolos`);
        
        if (totalFromTiers !== EXPECTED_SYMBOLS_COUNT) {
            this.results.errors.push(`Distribución incorrecta: total ${totalFromTiers}, esperados ${EXPECTED_SYMBOLS_COUNT}`);
            distributionCorrect = false;
        }
        
        if (distributionCorrect) {
            console.log('   [CHECK] Distribución por tiers correcta');
        }
        
        return distributionCorrect;
    }
    
    verifySymbolUniqueness() {
        console.log('\n[MAGNIFY] Verificando unicidad de símbolos...');
        
        const symbolCounts = {};
        const duplicates = [];
        
        // Contar ocurrencias de cada símbolo
        ALL_77_SYMBOLS.forEach(symbol => {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
            if (symbolCounts[symbol] > 1 && !duplicates.includes(symbol)) {
                duplicates.push(symbol);
            }
        });
        
        if (duplicates.length > 0) {
            this.results.errors.push(`Símbolos duplicados encontrados: ${duplicates.join(', ')}`);
            return false;
        }
        
        console.log(`   [CHECK] Todos los ${ALL_77_SYMBOLS.length} símbolos son únicos`);
        return true;
    }
    
    verifySymbolFormat() {
        console.log('\n📏 Verificando formato de símbolos...');
        
        const invalidSymbols = [];
        const symbolPattern = /^[A-Z0-9]+USDT$/;
        
        ALL_77_SYMBOLS.forEach(symbol => {
            if (!symbolPattern.test(symbol)) {
                invalidSymbols.push(symbol);
            }
        });
        
        if (invalidSymbols.length > 0) {
            this.results.errors.push(`Símbolos con formato inválido: ${invalidSymbols.join(', ')}`);
            return false;
        }
        
        console.log('   [CHECK] Todos los símbolos tienen formato válido (xxxUSDT)');
        return true;
    }
    
    verifyBinanceCompatibility() {
        console.log('\n[LINK] Verificando compatibilidad con Binance...');
        
        // Símbolos conocidos que pueden tener problemas en Binance
        const potentialIssues = [];
        
        // Verificar símbolos con prefijos especiales
        const specialPrefixSymbols = ALL_77_SYMBOLS.filter(symbol => 
            symbol.startsWith('1000') || 
            symbol.includes('USD') && !symbol.endsWith('USDT')
        );
        
        if (specialPrefixSymbols.length > 0) {
            console.log(`   [WARNING]  Símbolos con prefijos especiales: ${specialPrefixSymbols.join(', ')}`);
            console.log('   [MEMO] Nota: Verificar disponibilidad en Binance Futures');
        }
        
        // Símbolos que requieren verificación manual
        const manualVerificationNeeded = ['GMEUSDT', 'ALPACAUSDT'];
        const needsVerification = ALL_77_SYMBOLS.filter(symbol => 
            manualVerificationNeeded.includes(symbol)
        );
        
        if (needsVerification.length > 0) {
            this.results.warnings.push(`Símbolos que requieren verificación manual: ${needsVerification.join(', ')}`);
        }
        
        console.log('   [CHECK] Verificación de compatibilidad completada');
        return true;
    }
    
    generateSymbolsReport() {
        console.log('\n[CHART] REPORTE DETALLADO DE SÍMBOLOS:');
        console.log('================================');
        
        Object.entries(DIVINE_77_SYMBOLS).forEach(([tier, symbols]) => {
            console.log(`\n${tier} (${symbols.length} símbolos):`);
            symbols.forEach((symbol, index) => {
                console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${symbol}`);
            });
        });
        
        console.log(`\n[TREND_UP] TOTAL: ${ALL_77_SYMBOLS.length} símbolos divinos configurados`);
    }
    
    generateConfigurationFile() {
        const configContent = `// Configuración automática de 77 símbolos divinos - ${new Date().toISOString()}
export const VERIFIED_77_SYMBOLS = ${JSON.stringify(ALL_77_SYMBOLS, null, 2)};

export const SYMBOLS_BY_TIER = ${JSON.stringify(DIVINE_77_SYMBOLS, null, 2)};

export const SYMBOL_COUNT = ${ALL_77_SYMBOLS.length};
export const VERIFICATION_DATE = '${new Date().toISOString()}';
export const VERIFICATION_SUCCESS = true;
`;
        
        try {
            fs.writeFileSync('./config/verified-symbols-config.js', configContent);
            console.log('\n[FLOPPY_DISK] Archivo de configuración verificada generado: config/verified-symbols-config.js');
        } catch (error) {
            console.log(`\n[WARNING] Error generando archivo de configuración: ${error.message}`);
        }
    }
    
    printResults() {
        console.log('\n[GALAXY] ================================================');
        console.log('[CLIPBOARD] RESULTADOS DE VERIFICACIÓN');
        console.log('[GALAXY] ================================================');
        
        console.log(`\n[CHECK] Símbolos verificados: ${this.results.total_symbols_found}/${EXPECTED_SYMBOLS_COUNT}`);
        console.log(`📁 Archivos verificados: ${this.results.files_checked}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n[X] ERRORES ENCONTRADOS:');
            this.results.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (this.results.warnings.length > 0) {
            console.log('\n[WARNING]  ADVERTENCIAS:');
            this.results.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        const allChecksPass = this.results.errors.length === 0 && 
                             this.results.total_symbols_found === EXPECTED_SYMBOLS_COUNT;
        
        if (allChecksPass) {
            console.log('\n[PARTY] ¡VERIFICACIÓN EXITOSA!');
            console.log('[SPARKLES] Los 77 símbolos divinos están correctamente configurados');
            console.log('[ROCKET] El sistema QBTC está listo para la recolección multidimensional');
            this.results.success = true;
        } else {
            console.log('\n[X] VERIFICACIÓN FALLIDA');
            console.log('[WRENCH] Revisa los errores anteriores y corrige la configuración');
            this.results.success = false;
        }
        
        console.log('\n[GALAXY] ================================================');
    }
    
    async runFullVerification() {
        this.printHeader();
        
        // Ejecutar todas las verificaciones
        const checks = [
            () => this.verifyConstantsFile(),
            () => this.verifySymbolsExtendedFile(),
            () => this.verifyTierDistribution(),
            () => this.verifySymbolUniqueness(),
            () => this.verifySymbolFormat(),
            () => this.verifyBinanceCompatibility()
        ];
        
        let allChecksPassed = true;
        
        for (const check of checks) {
            const result = check();
            if (!result) {
                allChecksPassed = false;
            }
            this.results.files_checked++;
        }
        
        // Generar reporte detallado
        this.generateSymbolsReport();
        
        // Generar archivo de configuración si todo está correcto
        if (allChecksPassed && this.results.errors.length === 0) {
            this.generateConfigurationFile();
        }
        
        // Mostrar resultados finales
        this.printResults();
        
        return this.results.success;
    }
}

// Ejecutar verificación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const verifier = new SymbolVerifier();
    
    verifier.runFullVerification().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('[X] Error durante la verificación:', error);
        process.exit(1);
    });
}

export default SymbolVerifier;
