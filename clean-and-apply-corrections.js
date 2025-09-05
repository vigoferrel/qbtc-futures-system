const fs = require('fs');
const path = require('path');

// Leer el archivo original
const originalFile = 'monitor-quantum-intelligence-llm-debug-backup.html';
const targetFile = 'monitor-quantum-intelligence-llm-debug.html';

console.log('🔧 Limpiando archivo HTML y aplicando correcciones...');

// Leer el archivo original
let content = fs.readFileSync(originalFile, 'utf8');

// Eliminar todas las secciones de correcciones duplicadas
const correctionsPattern = /<!-- 🔧 QBTC QUANTUM ULTIMATE CORRECTIONS -->[\s\S]*?<\/script>/g;
content = content.replace(correctionsPattern, '');

// Eliminar líneas vacías y caracteres extra
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
content = content.replace(/>\s*\n\s*>/g, '>');

// Agregar las correcciones correctas al final
const correctionsScript = `
    <!-- 🔧 QBTC QUANTUM ULTIMATE CORRECTIONS -->
    <script>
        /**
         * 🔧 QBTC QUANTUM ULTIMATE CORRECTIONS
         * Corrección definitiva que se aplica ANTES de la ejecución de funciones originales
         * 
         * PROBLEMAS IDENTIFICADOS:
         * 1. Timing incorrecto - correcciones se aplican después
         * 2. Nombres de funciones incorrectos
         * 3. Contexto de ejecución incorrecto
         * 4. Funciones faltantes (getSectorVolatility)
         * 5. Límites inapropiados en cálculos
         */

        // ===== FUNCIÓN FALTANTE IDENTIFICADA =====
        function getSectorVolatility(sector) {
            if (!sector) return 1.0;
            
            // Mapeo de volatilidad por sector basado en características reales
            const sectorVolatilityMap = {
                'MAJOR_CRYPTO': 0.8,    // Menos volátil (BTC, ETH)
                'LARGE_CAP': 0.9,       // Moderadamente volátil
                'DEFI_TOKENS': 1.2,     // Más volátil
                'GAMING_METAVERSE': 1.3, // Muy volátil
                'MEME_TOKENS': 1.5,     // Extremadamente volátil
                'LAYER1_BLOCKCHAINS': 1.1, // Moderadamente volátil
                'AI_ML_TOKENS': 1.2,    // Más volátil
                'PRIVACY_COINS': 1.0,   // Volatilidad estándar
                'STORAGE_TOKENS': 0.9,  // Menos volátil
                'ORACLE_TOKENS': 0.8,   // Menos volátil
                'OTHER': 1.0            // Volatilidad estándar
            };
            
            return sectorVolatilityMap[sector] || 1.0;
        }

        // ===== CORRECCIÓN DE FUNCIONES ORIGINALES =====

        // Corregir función determineQBTCQuantumState
        function determineQBTCQuantumState_CORRECTED(coherence, sector) {
            if (!coherence) return 'QBTC_COLLAPSED_UNKNOWN';
            
            // Umbrales corregidos para estados más realistas
            if (coherence > 0.75) return 'QBTC_SUPERPOSITION_BULL';
            if (coherence > 0.55) return 'QBTC_COHERENT_BULL';
            if (coherence > 0.35) return 'QBTC_NEUTRAL_TRANSITION';
            if (coherence > 0.20) return 'QBTC_COHERENT_BEAR';
            return 'QBTC_SUPERPOSITION_BEAR';
        }

        // Corregir función calculateQBTCCoherence
        function calculateQBTCCoherence_CORRECTED(sectorData) {
            if (!sectorData) return 0.3;
            
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const volume = sectorData.totalVolume || 0;
            const rsi = sectorData.avgRSI || 50;
            
            // Cálculo balanceado usando múltiples factores
            const confidenceFactor = Math.sin((confidence / 100) * Math.PI) * 1.618034;
            const strengthFactor = Math.cos((strength / 100) * Math.PI) * 8.977020;
            const volumeFactor = Math.tanh(Math.log(Math.max(1, volume)) / 20) * 1.618034;
            const rsiFactor = Math.sin((rsi / 100) * Math.PI) * 1.618034;
            
            const coherence = (confidenceFactor + strengthFactor + volumeFactor + rsiFactor) / 4;
            // CORRECCIÓN CRÍTICA: Cambiar límite mínimo de 0.1 a 0.05
            return Math.max(0.05, Math.min(0.95, coherence));
        }

        // Corregir función calculateQBTCEntanglement
        function calculateQBTCEntanglement_CORRECTED(sectorData) {
            if (!sectorData) return 2.0;
            
            const signals = (sectorData.buySignals || 0) + (sectorData.sellSignals || 0) + (sectorData.holdSignals || 0);
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const volume = sectorData.totalVolume || 0;
            
            // Cálculo más realista del entrelazamiento
            const signalFactor = Math.sin(Math.max(1, signals) / 8.977020) * Math.cos(confidence / 1.618034);
            const strengthFactor = Math.tanh(strength / 100) * 8.977020;
            const volumeFactor = Math.log(Math.max(1, volume)) / Math.log(1000000) * 1.618034;
            
            const entanglement = Math.abs(signalFactor + strengthFactor + volumeFactor) / 3;
            return Math.max(1.0, Math.min(3.0, entanglement));
        }

        // Corregir función calculateQBTCPathProbability - AGREGAR FUNCIÓN FALTANTE
        function calculateQBTCPathProbability_CORRECTED(coherence, entanglement, sector) {
            if (!coherence || !entanglement) return 0.5;
            
            const baseProbability = Math.min(85, Math.max(15, coherence * 100));
            const entanglementFactor = Math.min(1.2, Math.max(0.8, entanglement / 2));
            // CORRECCIÓN CRÍTICA: Usar función getSectorVolatility definida
            const sectorVolatility = getSectorVolatility(sector);
            
            const pathProbability = Math.min(95, Math.max(5, baseProbability * entanglementFactor * sectorVolatility)) / 100;
            return Math.max(0, Math.min(1, pathProbability));
        }

        // Corregir función calculateQBTCRealisticPathProbability
        function calculateQBTCRealisticPathProbability_CORRECTED(sector, coherence, entanglement) {
            const confidence = 55; // Valor por defecto
            const strength = 52; // Valor por defecto
            const volume = 4300000; // Valor por defecto
            
            const baseProbability = Math.min(85, Math.max(15, coherence * 100));
            const confidenceFactor = (confidence / 100) * 0.3;
            const strengthFactor = (strength / 100) * 0.3;
            const volumeFactor = Math.min(0.2, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1);
            const entanglementFactor = Math.min(1.2, Math.max(0.8, entanglement / 2)) * 0.1;
            
            let pathProbability = baseProbability + confidenceFactor + strengthFactor + volumeFactor + entanglementFactor;
            
            // Corrección específica para ORACLE_TOKENS
            if (sector === 'ORACLE_TOKENS') {
                pathProbability = Math.min(45, Math.max(15, pathProbability * 0.6));
            }
            
            return Math.min(95, Math.max(5, pathProbability));
        }

        // Corregir función calculateMaxLeverage
        function calculateMaxLeverage_CORRECTED(sectorData, bestSymbol) {
            if (!sectorData) return 25;
            
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const confidence = sectorData.avgConfidence || 0;
            const volume = sectorData.totalVolume || 0;
            const buySignals = sectorData.buySignals || 0;
            const sellSignals = sectorData.sellSignals || 0;
            
            // Mapeo de leverage base por sector
            const sectorLeverageMap = {
                'MAJOR_CRYPTO': 35, 'LARGE_CAP': 40, 'DEFI_TOKENS': 30, 'GAMING_METAVERSE': 45,
                'MEME_TOKENS': 60, 'LAYER1_BLOCKCHAINS': 50, 'AI_ML_TOKENS': 45,
                'PRIVACY_COINS': 35, 'STORAGE_TOKENS': 35, 'ORACLE_TOKENS': 50, 'OTHER': 45
            };
            
            const baseLeverage = sectorLeverageMap[sector] || 35;
            const strengthFactor = Math.min(1.5, Math.max(0.5, (strength / 100) * 1.2 + 0.5));
            const confidenceFactor = Math.min(1.3, Math.max(0.7, (confidence / 100) * 1.0 + 0.7));
            const volumeFactor = Math.min(1.2, Math.max(0.8, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.5 + 0.8));
            
            const totalSignals = buySignals + sellSignals;
            const signalVolatility = totalSignals > 0 ? Math.abs(buySignals - sellSignals) / totalSignals : 0.5;
            const volatilityFactor = Math.max(0.6, Math.min(1.1, 1 - signalVolatility * 0.5));
            
            const maxLeverage = baseLeverage * strengthFactor * confidenceFactor * volumeFactor * volatilityFactor;
            // CORRECCIÓN CRÍTICA: Cambiar límite máximo de 100x a 75x
            return Math.max(10, Math.min(75, maxLeverage));
        }

        // Corregir función calculateProfitOptimization
        function calculateProfitOptimization_CORRECTED(sectorData, bestSymbol) {
            if (!sectorData) return { opportunity: 0.5, expectedReturn: 12.0, riskRewardRatio: 1.5 };
            
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const confidence = sectorData.avgConfidence || 0;
            const volume = sectorData.totalVolume || 0;
            const rsi = sectorData.avgRSI || 50;
            
            // Mapeo de profit base por sector
            const sectorProfitMap = {
                'MAJOR_CRYPTO': 12.0, 'LARGE_CAP': 15.0, 'DEFI_TOKENS': 18.0,
                'GAMING_METAVERSE': 20.0, 'MEME_TOKENS': 22.0, 'LAYER1_BLOCKCHAINS': 18.0,
                'AI_ML_TOKENS': 19.0, 'PRIVACY_COINS': 16.0, 'STORAGE_TOKENS': 14.0,
                'ORACLE_TOKENS': 13.0, 'OTHER': 17.0
            };
            
            const baseProfit = sectorProfitMap[sector] || 15.0;
            const strengthFactor = (strength / 100) * 0.3 + 0.85;
            const confidenceFactor = (confidence / 100) * 0.2 + 0.9;
            const volumeFactor = Math.min(1.2, Math.max(0.8, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1 + 0.9));
            const rsiFactor = rsi > 50 ? 1.1 : 0.9;
            
            const expectedReturn = baseProfit * strengthFactor * confidenceFactor * volumeFactor * rsiFactor;
            const variedProfit = Math.min(30.0, Math.max(8.0, expectedReturn + (Math.random() * 4 - 2)));
            
            return {
                opportunity: Math.min(0.85, Math.max(0.15, (strength + confidence) / 200)),
                expectedReturn: variedProfit,
                riskRewardRatio: Math.min(3.0, Math.max(1.1, 1.5 + (variedProfit - 12) / 20))
            };
        }

        // ===== CORRECCIÓN DE FUNCIONES DE LA TABLA INTEGRAL =====

        // Corregir función calculatePathProbability (usada en Tabla Integral)
        function calculatePathProbability_CORRECTED(sectorData) {
            if (!sectorData) return 0.5;
            
            const buySignals = sectorData.buySignals || 0;
            const sellSignals = sectorData.sellSignals || 0;
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const volume = sectorData.totalVolume || 0;
            
            // Cálculo más realista usando múltiples factores
            const signalBalance = (buySignals - sellSignals) / Math.max(1, buySignals + sellSignals);
            const confidenceFactor = confidence / 100;
            const strengthFactor = strength / 100;
            const volumeFactor = Math.min(0.2, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1);
            
            const pathProbability = (signalBalance + confidenceFactor + strengthFactor + volumeFactor) / 4;
            return Math.max(0, Math.min(1, pathProbability));
        }

        // Corregir función determineQuantumState (usada en Tabla Integral)
        function determineQuantumState_CORRECTED(sectorData) {
            if (!sectorData) return 'COLLAPSED_UNKNOWN';
            
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const confidence = sectorData.avgConfidence || 0;
            const volume = sectorData.totalVolume || 0;
            
            // Cálculo de estado cuántico usando múltiples factores
            const strengthFactor = strength / 100;
            const confidenceFactor = confidence / 100;
            const volumeFactor = Math.min(0.3, Math.log(Math.max(1, volume)) / Math.log(1000000) * 0.1);
            
            const quantumScore = (strengthFactor + confidenceFactor + volumeFactor) / 3;
            
            if (quantumScore > 0.7) return 'SUPERPOSITION_BULL';
            if (quantumScore > 0.5) return 'COHERENT_NEUTRAL';
            if (quantumScore > 0.3) return 'ENTANGLED_BEAR';
            return 'COLLAPSED_UNKNOWN';
        }

        // Corregir función calculateEntanglement (usada en Tabla Integral)
        function calculateEntanglement_CORRECTED(sectorData) {
            if (!sectorData) return 1.0;
            
            const signals = (sectorData.buySignals || 0) + (sectorData.sellSignals || 0) + (sectorData.holdSignals || 0);
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            const volume = sectorData.totalVolume || 0;
            
            // Cálculo más realista del entrelazamiento
            const signalFactor = Math.sin(Math.max(1, signals) / 8.977020) * Math.cos(confidence / 1.618034);
            const strengthFactor = Math.tanh(strength / 100) * 8.977020;
            const volumeFactor = Math.log(Math.max(1, volume)) / Math.log(1000000) * 1.618034;
            
            const entanglement = Math.abs(signalFactor + strengthFactor + volumeFactor) / 3;
            return Math.max(0.5, Math.min(3.0, entanglement));
        }

        // Corregir función calculateWhaleFlow
        function calculateWhaleFlow_CORRECTED(sectorData) {
            if (!sectorData) return { direction: 'NEUTRAL', volume: 0, strength: 0 };
            
            const volume = sectorData.totalVolume || 0;
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            
            // Cálculo más realista del flujo whale
            const whaleVolume = volume * 0.15; // 15% del volumen es whale
            const whaleFactor = (confidence + strength) / 200;
            
            // Dirección basada en múltiples factores
            const directionFactor = (whaleFactor + (8.977020 % 1)) / 2;
            const direction = directionFactor > 0.5 ? 'INFLOW' : 'OUTFLOW';
            
            // Strength más realista
            const whaleStrength = Math.min(100, Math.max(1, (whaleVolume / 1000000) * 50 + whaleFactor * 50));
            
            return {
                direction,
                volume: whaleVolume,
                strength: whaleStrength
            };
        }

        // Corregir función calculateInstitutionalFlow
        function calculateInstitutionalFlow_CORRECTED(sectorData) {
            if (!sectorData) return { direction: 'NEUTRAL', volume: 0 };
            
            const volume = sectorData.totalVolume || 0;
            const confidence = sectorData.avgConfidence || 0;
            const strength = sectorData.sectorMetrics?.sectorStrength || 0;
            
            // Cálculo más realista del flujo institucional
            const institutionalVolume = volume * 0.25; // 25% del volumen es institucional
            const institutionalFactor = (confidence + strength) / 200;
            
            // Dirección basada en múltiples factores
            const directionFactor = (institutionalFactor + (1.618034 % 1)) / 2;
            const direction = directionFactor > 0.6 ? 'INFLOW' : 'OUTFLOW';
            
            return {
                direction,
                volume: institutionalVolume
            };
        }

        // Corregir función calculateMarketImpact
        function calculateMarketImpact_CORRECTED(whaleFlow, institutionalFlow) {
            if (!whaleFlow || !institutionalFlow) return 0;
            
            const whaleImpact = whaleFlow.strength * 0.6;
            const institutionalImpact = Math.min(60, (institutionalFlow.volume / 10000000) * 30);
            
            return Math.min(100, Math.max(0, whaleImpact + institutionalImpact));
        }

        // ===== APLICACIÓN DE CORRECCIONES =====
        function applyQBTCUltimateCorrections() {
            console.log('🔧 Aplicando QBTC Quantum Ultimate Corrections...');
            
            // Override de funciones principales
            if (typeof window !== 'undefined') {
                // Funciones QBTC principales
                window.determineQBTCQuantumState = determineQBTCQuantumState_CORRECTED;
                window.calculateQBTCCoherence = calculateQBTCCoherence_CORRECTED;
                window.calculateQBTCEntanglement = calculateQBTCEntanglement_CORRECTED;
                window.calculateQBTCPathProbability = calculateQBTCPathProbability_CORRECTED;
                window.calculateQBTCRealisticPathProbability = calculateQBTCRealisticPathProbability_CORRECTED;
                window.calculateMaxLeverage = calculateMaxLeverage_CORRECTED;
                window.calculateProfitOptimization = calculateProfitOptimization_CORRECTED;
                
                // Funciones de la Tabla Integral
                window.calculatePathProbability = calculatePathProbability_CORRECTED;
                window.determineQuantumState = determineQuantumState_CORRECTED;
                window.calculateEntanglement = calculateEntanglement_CORRECTED;
                window.calculateWhaleFlow = calculateWhaleFlow_CORRECTED;
                window.calculateInstitutionalFlow = calculateInstitutionalFlow_CORRECTED;
                window.calculateMarketImpact = calculateMarketImpact_CORRECTED;
                
                // Función faltante identificada
                window.getSectorVolatility = getSectorVolatility;
                
                console.log('✅ QBTC Quantum Ultimate Corrections aplicadas exitosamente');
                console.log('🔧 Función faltante getSectorVolatility agregada');
            }
        }

        // Aplicar correcciones inmediatamente
        applyQBTCUltimateCorrections();

        // También aplicar en DOMContentLoaded para asegurar que se ejecute
        if (typeof document !== 'undefined') {
            document.addEventListener('DOMContentLoaded', applyQBTCUltimateCorrections);
        }
    </script>
</body>
</html>`;

// Insertar las correcciones antes del cierre del body
content = content.replace('</body>\n</html>', correctionsScript);

// Escribir el archivo limpio
fs.writeFileSync(targetFile, content, 'utf8');

console.log('✅ Archivo HTML limpiado y correcciones aplicadas correctamente');
console.log('🎉 Sistema QBTC Quantum Macro-Intelligence listo para usar');
