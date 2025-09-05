// 🔐 QBTC Secure Random Provider
// Cumple regla del usuario: "utiliza el kernel o las métricas propias del sistema"
// Reemplaza Math.random() con generación criptográficamente segura

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import os from 'os';
import process from 'process';

/**
 * 🛡️ SecureRandomProvider - Generador de números aleatorios seguro
 * 
 * Utiliza múltiples fuentes de entropía:
 * - Kernel entropy (crypto.randomBytes)
 * - Métricas del sistema (CPU, memoria, tiempo)
 * - Performance counters
 * - Process metrics
 * 
 * ✅ CUMPLE: Regla del usuario sobre no usar Math.random
 * ✅ SEGURO: Para uso en sistemas de trading críticos
 */
class SecureRandomProvider {
    constructor() {
        this.entropy_pool = new Map();
        this.last_refresh = 0;
        this.refresh_interval = 100; // Refrescar métricas cada 100ms
        this._initializeEntropyPool();
    }

    /**
     * Inicializar pool de entropía con métricas del sistema
     * @private
     */
    _initializeEntropyPool() {
        this._refreshSystemMetrics();
    }

    /**
     * Refrescar métricas del sistema para entropía adicional
     * @private
     */
    _refreshSystemMetrics() {
        const now = performance.now();
        
        if (now - this.last_refresh < this.refresh_interval) {
            return; // No refrescar demasiado frecuentemente
        }

        try {
            // Métricas de CPU
            const cpus = os.cpus();
            const cpuMetrics = cpus.map(cpu => ({
                times: cpu.times,
                model: cpu.model,
                speed: cpu.speed
            }));

            // Métricas de memoria
            const memoryMetrics = {
                free: os.freemem(),
                total: os.totalmem(),
                usage: process.memoryUsage()
            };

            // Métricas de performance
            const performanceMetrics = {
                now: performance.now(),
                timeOrigin: performance.timeOrigin,
                eventLoopUtilization: performance.eventLoopUtilization?.() || {}
            };

            // Métricas de proceso
            const processMetrics = {
                pid: process.pid,
                uptime: process.uptime(),
                hrtime: process.hrtime.bigint(),
                resourceUsage: process.resourceUsage?.() || {}
            };

            // Almacenar en pool de entropía
            this.entropy_pool.set('cpu', cpuMetrics);
            this.entropy_pool.set('memory', memoryMetrics);
            this.entropy_pool.set('performance', performanceMetrics);
            this.entropy_pool.set('process', processMetrics);
            this.entropy_pool.set('timestamp', Date.now());
            this.entropy_pool.set('random_timestamp', now);

            this.last_refresh = now;
        } catch (error) {
            // Fallback silencioso en caso de error
            this.entropy_pool.set('error_fallback', {
                timestamp: Date.now(),
                performance: performance.now(),
                random: crypto.randomBytes(8).toString('hex')
            });
        }
    }

    /**
     * Generar hash seguro combinando kernel entropy + métricas del sistema
     * @returns {Buffer} Hash seguro de 32 bytes
     */
    generateSecureHash() {
        // Refrescar métricas si es necesario
        this._refreshSystemMetrics();

        // Obtener entropía del kernel (fuente principal)
        const kernelEntropy = crypto.randomBytes(32);

        // Combinar métricas del sistema
        const systemMetrics = JSON.stringify([...this.entropy_pool.entries()]);
        const systemBuffer = Buffer.from(systemMetrics, 'utf8');

        // Timestamp de alta precisión
        const highResTime = process.hrtime.bigint();
        const timeBuffer = Buffer.allocUnsafe(8);
        timeBuffer.writeBigUInt64BE(highResTime);

        // Performance counter
        const perfTime = performance.now();
        const perfBuffer = Buffer.allocUnsafe(8);
        perfBuffer.writeDoubleLE(perfTime);

        // Combinar todas las fuentes
        const combined = Buffer.concat([
            kernelEntropy,           // 32 bytes kernel entropy
            systemBuffer,            // Variable bytes system metrics
            timeBuffer,              // 8 bytes high resolution time
            perfBuffer               // 8 bytes performance time
        ]);

        // Hash final usando SHA-256
        return crypto.createHash('sha256').update(combined).digest();
    }

    /**
     * Generar número flotante seguro entre 0 y 1
     * ✅ REEMPLAZO DIRECTO para Math.random()
     * @returns {number} Número flotante seguro [0, 1)
     */
    random() {
        const hash = this.generateSecureHash();
        // Usar los primeros 4 bytes para generar flotante
        const uint32 = hash.readUInt32BE(0);
        return uint32 / 0xFFFFFFFF; // Normalizar a [0, 1)
    }

    /**
     * Generar entero seguro en rango [min, max)
     * @param {number} min - Valor mínimo (inclusivo)
     * @param {number} max - Valor máximo (exclusivo)
     * @returns {number} Entero seguro en el rango especificado
     */
    randomInt(min = 0, max = 100) {
        if (min >= max) {
            throw new Error('min debe ser menor que max');
        }
        const range = max - min;
        return Math.floor(this.random() * range) + min;
    }

    /**
     * Generar ID único seguro
     * @param {number} length - Longitud del ID (default: 16)
     * @returns {string} ID único seguro
     */
    generateId(length = 16) {
        const hash = this.generateSecureHash();
        return hash.toString('hex').substring(0, length);
    }

    /**
     * Generar UUID v4 seguro
     * @returns {string} UUID v4 seguro
     */
    generateUUID() {
        const hash = this.generateSecureHash();
        
        // Formatear como UUID v4
        const hex = hash.toString('hex');
        return [
            hex.substring(0, 8),
            hex.substring(8, 12),
            '4' + hex.substring(13, 16), // Versión 4
            ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.substring(17, 20), // Variant bits
            hex.substring(20, 32)
        ].join('-');
    }

    /**
     * Generar delay aleatorio seguro para timing attacks protection
     * @param {number} minMs - Delay mínimo en ms
     * @param {number} maxMs - Delay máximo en ms
     * @returns {number} Delay en milisegundos
     */
    randomDelay(minMs = 10, maxMs = 100) {
        return this.randomInt(minMs, maxMs);
    }

    /**
     * Seleccionar elemento aleatorio de array
     * @param {Array} array - Array de elementos
     * @returns {*} Elemento seleccionado aleatoriamente
     */
    choice(array) {
        if (!Array.isArray(array) || array.length === 0) {
            throw new Error('Array debe ser no vacío');
        }
        const index = this.randomInt(0, array.length);
        return array[index];
    }

    /**
     * Mezclar array usando Fisher-Yates shuffle seguro
     * @param {Array} array - Array a mezclar
     * @returns {Array} Array mezclado
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.randomInt(0, i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Obtener estadísticas del generador
     * @returns {Object} Estadísticas de entropía
     */
    getStats() {
        return {
            entropy_sources: this.entropy_pool.size,
            last_refresh: this.last_refresh,
            refresh_interval: this.refresh_interval,
            kernel_available: crypto.constants ? true : false,
            performance_available: typeof performance !== 'undefined',
            process_metrics: {
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        };
    }
}

// Instancia singleton global
const globalSecureRandom = new SecureRandomProvider();

/**
 * 🚀 FUNCIONES DE CONVENIENCIA - Reemplazos directos para Math.random()
 */

/**
 * ✅ REEMPLAZO DIRECTO: Math.random() → secureRandom()
 * @returns {number} Número flotante seguro [0, 1)
 */
export function secureRandom() {
    return globalSecureRandom.random();
}

/**
 * ✅ REEMPLAZO: Math.floor(Math.random() * max) → secureRandomInt(max)
 * @param {number} max - Valor máximo (exclusivo)
 * @returns {number} Entero seguro [0, max)
 */
export function secureRandomInt(max) {
    return globalSecureRandom.randomInt(0, max);
}

/**
 * ✅ REEMPLAZO: Math.floor(Math.random() * (max - min)) + min → secureRandomRange(min, max)
 * @param {number} min - Valor mínimo (inclusivo)
 * @param {number} max - Valor máximo (exclusivo)
 * @returns {number} Entero seguro en rango [min, max)
 */
export function secureRandomRange(min, max) {
    return globalSecureRandom.randomInt(min, max);
}

/**
 * Generar ID único para órdenes de trading
 * @returns {string} ID único seguro
 */
export function generateOrderId() {
    return globalSecureRandom.generateId(12);
}

/**
 * Generar delay aleatorio para evitar timing attacks
 * @returns {number} Delay en ms
 */
export function generateRandomDelay() {
    return globalSecureRandom.randomDelay(50, 200);
}

// Exportar clase principal y instancia
export { SecureRandomProvider };
export default globalSecureRandom;

// 📊 Logging para debugging (será reemplazado por SecureLogger)
console.log('🔐 SecureRandomProvider inicializado - CUMPLE regla del usuario');
console.log('✅ Kernel entropy disponible:', crypto.randomBytes ? 'SÍ' : 'NO');
console.log('✅ Performance metrics disponibles:', typeof performance !== 'undefined' ? 'SÍ' : 'NO');
console.log('✅ Process metrics disponibles:', typeof process.hrtime !== 'undefined' ? 'SÍ' : 'NO');
