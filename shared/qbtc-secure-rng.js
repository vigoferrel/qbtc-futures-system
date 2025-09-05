/**
 * 🎲 QBTC Secure RNG - Kernel & Metrics-Based Random Number Generation
 * =====================================================================
 * 
 * Sistema de generación de números aleatorios seguro que CUMPLE con las reglas:
 * ✅ NO usa Math.random()
 * ✅ Basado en kernel del sistema (crypto.randomBytes)
 * ✅ Mezcla entropía de métricas propias del sistema
 * ✅ Soporte para modo determinista en backtesting
 * ✅ Reporta métricas desde segundo plano
 * 
 * @author QBTC Team
 * @version 1.0.0
 * @compliance SECURE_RNG_RULES
 */

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import os from 'os';

class QBTCSecureRNG {
    constructor(options = {}) {
        this.isBacktesting = options.isBacktesting || false;
        this.backtestingSeed = options.backtestingSeed || null;
        this.enableMetricsReporting = options.enableMetricsReporting !== false;
        
        // Pool de entropía basado en métricas del sistema
        this.entropyPool = {
            systemMetrics: [],
            networkJitter: [],
            processMetrics: [],
            timestamps: []
        };
        
        // Estado para modo determinista
        this.deterministicState = {
            counter: 0,
            seedHash: null
        };
        
        if (this.isBacktesting && this.backtestingSeed) {
            this.initializeDeterministicMode();
        }
        
        // Iniciar recolección de métricas en segundo plano
        if (this.enableMetricsReporting) {
            this.startBackgroundMetricsCollection();
        }
        
        console.log(`🎲 QBTC SecureRNG initialized - Mode: ${this.isBacktesting ? 'DETERMINISTIC' : 'SECURE'}`);
    }
    
    /**
     * Inicializar modo determinista para backtesting
     */
    initializeDeterministicMode() {
        // Hash del seed para consistencia
        this.deterministicState.seedHash = crypto
            .createHash('sha256')
            .update(this.backtestingSeed.toString())
            .digest();
        
        console.log(`🧪 Deterministic mode initialized with seed: ${this.backtestingSeed}`);
    }
    
    /**
     * Recolectar entropía del sistema en segundo plano
     */
    startBackgroundMetricsCollection() {
        setInterval(() => {
            this.collectSystemEntropy();
            this.reportMetrics();
        }, 5000); // Cada 5 segundos
    }
    
    /**
     * Recolectar entropía de métricas del sistema
     */
    collectSystemEntropy() {
        const now = performance.now();
        
        // Métricas del sistema
        const systemMetrics = {
            timestamp: now,
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: process.cpuUsage(),
            pid: process.pid,
            uptime: process.uptime(),
            loadAvg: os.loadavg(),
            freeMem: os.freemem()
        };
        
        // Jitter de red (basado en timing de operaciones)
        const networkJitter = now % 1000000;
        
        // Agregar a pools con límite
        this.entropyPool.systemMetrics.push(systemMetrics);
        this.entropyPool.networkJitter.push(networkJitter);
        this.entropyPool.timestamps.push(now);
        
        // Mantener solo las últimas 100 entradas
        if (this.entropyPool.systemMetrics.length > 100) {
            this.entropyPool.systemMetrics = this.entropyPool.systemMetrics.slice(-50);
            this.entropyPool.networkJitter = this.entropyPool.networkJitter.slice(-50);
            this.entropyPool.timestamps = this.entropyPool.timestamps.slice(-50);
        }
    }
    
    /**
     * Reportar métricas desde segundo plano (cumple regla de background reporting)
     */
    reportMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            entropyPoolSize: this.entropyPool.systemMetrics.length,
            mode: this.isBacktesting ? 'deterministic' : 'secure',
            totalRequests: this.deterministicState.counter,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
            pid: process.pid
        };
        
        // Log métricas cada minuto
        if (metrics.totalRequests % 12 === 0) {
            console.log(`🎲 RNG Metrics [PID:${metrics.pid}]:`, metrics);
        }
    }
    
    /**
     * Mezclar entropía del sistema con kernel crypto
     */
    mixSystemEntropy() {
        if (this.entropyPool.systemMetrics.length === 0) {
            // Fallback: recolectar entropía inmediata
            this.collectSystemEntropy();
        }
        
        // Combinar múltiples fuentes de entropía
        const entropyData = Buffer.concat([
            Buffer.from(JSON.stringify(this.entropyPool.systemMetrics.slice(-5))),
            Buffer.from(this.entropyPool.networkJitter.slice(-10)),
            Buffer.from(this.entropyPool.timestamps.slice(-10).map(t => t.toString()).join(''))
        ]);
        
        // Hash la entropía del sistema
        const systemHash = crypto.createHash('sha256').update(entropyData).digest();
        
        // Mezclar con randomBytes del kernel
        const kernelBytes = crypto.randomBytes(32);
        
        // XOR para mezclar ambas fuentes
        const mixedEntropy = Buffer.alloc(32);
        for (let i = 0; i < 32; i++) {
            mixedEntropy[i] = systemHash[i] ^ kernelBytes[i];
        }
        
        return mixedEntropy;
    }
    
    /**
     * Generar entero aleatorio seguro
     * @param {number} min - Valor mínimo (inclusivo)
     * @param {number} max - Valor máximo (exclusivo)
     * @returns {number} Entero aleatorio
     */
    rngInt(min = 0, max = 100) {
        if (this.isBacktesting && this.backtestingSeed) {
            return this.deterministicInt(min, max);
        }
        
        const range = max - min;
        if (range <= 0) return min;
        
        // Usar crypto.randomInt con entropía del sistema
        const mixedEntropy = this.mixSystemEntropy();
        const seed = mixedEntropy.readUInt32BE(0);
        
        // Combinar con crypto.randomInt para máxima seguridad
        const secureRandom = crypto.randomInt(0, range);
        const entropyRandom = (seed % range);
        
        this.deterministicState.counter++;
        
        return min + ((secureRandom + entropyRandom) % range);
    }
    
    /**
     * Generar número decimal aleatorio seguro
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Decimal aleatorio
     */
    rngFloat(min = 0.0, max = 1.0) {
        if (this.isBacktesting && this.backtestingSeed) {
            return this.deterministicFloat(min, max);
        }
        
        // Generar 8 bytes seguros
        const mixedEntropy = this.mixSystemEntropy();
        const randomValue = mixedEntropy.readDoubleLE(0);
        
        // Normalizar a rango [0,1)
        const normalized = Math.abs(randomValue) % 1.0;
        
        this.deterministicState.counter++;
        
        return min + (normalized * (max - min));
    }
    
    /**
     * Generar bytes aleatorios seguros
     * @param {number} length - Número de bytes
     * @returns {Buffer} Buffer con bytes aleatorios
     */
    rngBytes(length = 32) {
        if (this.isBacktesting && this.backtestingSeed) {
            return this.deterministicBytes(length);
        }
        
        // Combinar kernel crypto con entropía del sistema
        const kernelBytes = crypto.randomBytes(length);
        const systemEntropy = this.mixSystemEntropy();
        
        // XOR con entropía del sistema (ciclar si es necesario)
        for (let i = 0; i < length; i++) {
            kernelBytes[i] ^= systemEntropy[i % systemEntropy.length];
        }
        
        this.deterministicState.counter++;
        
        return kernelBytes;
    }
    
    /**
     * Modo determinista para backtesting
     */
    deterministicInt(min, max) {
        const range = max - min;
        if (range <= 0) return min;
        
        // Hash del seed + counter para reproducibilidad
        const hash = crypto.createHash('sha256')
            .update(this.deterministicState.seedHash)
            .update(Buffer.from(this.deterministicState.counter.toString()))
            .digest();
        
        const value = hash.readUInt32BE(0) % range;
        this.deterministicState.counter++;
        
        return min + value;
    }
    
    deterministicFloat(min, max) {
        const hash = crypto.createHash('sha256')
            .update(this.deterministicState.seedHash)
            .update(Buffer.from(this.deterministicState.counter.toString()))
            .digest();
        
        const normalized = (hash.readUInt32BE(0) / 0xFFFFFFFF);
        this.deterministicState.counter++;
        
        return min + (normalized * (max - min));
    }
    
    deterministicBytes(length) {
        const result = Buffer.alloc(length);
        
        for (let i = 0; i < length; i += 32) {
            const hash = crypto.createHash('sha256')
                .update(this.deterministicState.seedHash)
                .update(Buffer.from(this.deterministicState.counter.toString()))
                .digest();
            
            const copyLength = Math.min(32, length - i);
            hash.copy(result, i, 0, copyLength);
            this.deterministicState.counter++;
        }
        
        return result;
    }
    
    /**
     * Obtener estado actual del RNG
     */
    getMetrics() {
        return {
            mode: this.isBacktesting ? 'deterministic' : 'secure',
            totalRequests: this.deterministicState.counter,
            entropyPoolSize: this.entropyPool.systemMetrics.length,
            pid: process.pid,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
        };
    }
}

// Instancia global del RNG seguro
let globalRNG = null;

/**
 * Inicializar RNG global
 * @param {Object} options - Opciones de configuración
 */
export function initializeSecureRNG(options = {}) {
    globalRNG = new QBTCSecureRNG(options);
    return globalRNG;
}

/**
 * Obtener instancia RNG (lazy initialization)
 */
export function getSecureRNG() {
    if (!globalRNG) {
        globalRNG = new QBTCSecureRNG();
    }
    return globalRNG;
}

// Funciones de conveniencia que cumplen las reglas
export function secureRandomInt(min = 0, max = 100) {
    return getSecureRNG().rngInt(min, max);
}

export function secureRandomFloat(min = 0.0, max = 1.0) {
    return getSecureRNG().rngFloat(min, max);
}

export function secureRandomBytes(length = 32) {
    return getSecureRNG().rngBytes(length);
}

/**
 * REEMPLAZO DIRECTO PARA Math.random()
 * Esta función NUNCA debe usar Math.random()
 */
export function secureRandom() {
    return getSecureRNG().rngFloat(0.0, 1.0);
}

// Export default para facilitar importación
export default {
    QBTCSecureRNG,
    initializeSecureRNG,
    getSecureRNG,
    secureRandomInt,
    secureRandomFloat,
    secureRandomBytes,
    secureRandom
};
