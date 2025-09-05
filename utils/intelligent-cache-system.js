// QBTC Intelligent Cache System
// Sistema de cache inteligente con TTL dinámico y prefetching predictivo

import EventEmitter from 'events';

export class IntelligentCacheSystem extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // Configuración del cache
        this.maxSize = options.maxSize || 10000; // Max entries
        this.defaultTTL = options.defaultTTL || 300000; // 5 minutes default
        this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute cleanup
        this.hitRateTarget = options.hitRateTarget || 0.85; // 85% target hit rate
        
        // Estrategias de TTL dinámico
        this.ttlStrategies = {
            'market_data': { min: 1000, max: 10000, volatilityFactor: 0.8 },
            'risk_metrics': { min: 5000, max: 30000, volatilityFactor: 0.6 },
            'order_book': { min: 500, max: 2000, volatilityFactor: 0.9 },
            'position_data': { min: 10000, max: 60000, volatilityFactor: 0.4 },
            'analysis_results': { min: 15000, max: 120000, volatilityFactor: 0.3 }
        };
        
        // Cache storage
        this.cache = new Map();
        this.accessLog = new Map(); // For LRU and frequency tracking
        this.prefetchQueue = new Set();
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            prefetchHits: 0,
            evictions: 0,
            totalRequests: 0,
            bytesStored: 0,
            startTime: Date.now()
        };
        
        // Predictive patterns
        this.accessPatterns = new Map();
        this.prefetchPredictions = new Map();
        
        // Start background processes
        this.startCleanupProcess();
        this.startPrefetchProcess();
        
        console.log('[BRAIN] Intelligent Cache System initialized');
    }

    // Obtener valor del cache
    get(key, options = {}) {
        this.stats.totalRequests++;
        const now = Date.now();
        
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            
            // Check if expired
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                this.accessLog.delete(key);
                this.stats.misses++;
                return null;
            }
            
            // Update access info
            const accessInfo = this.accessLog.get(key) || { count: 0, lastAccess: 0, frequency: 0 };
            accessInfo.count++;
            accessInfo.lastAccess = now;
            accessInfo.frequency = this.calculateFrequency(accessInfo);
            this.accessLog.set(key, accessInfo);
            
            // Record access pattern
            this.recordAccessPattern(key, options);
            
            this.stats.hits++;
            
            // Check if this was a prefetch hit
            if (entry.wasPrefetched && !entry.accessed) {
                this.stats.prefetchHits++;
                entry.accessed = true;
            }
            
            this.emit('cache:hit', { key, value: entry.value, ttl: entry.expiresAt - now });
            return entry.value;
        }
        
        this.stats.misses++;
        this.emit('cache:miss', { key, options });
        
        // Trigger predictive prefetch
        this.triggerPredictivePrefetch(key, options);
        
        return null;
    }

    // Establecer valor en cache
    set(key, value, options = {}) {
        const now = Date.now();
        const category = options.category || 'default';
        const priority = options.priority || 'normal';
        
        // Calculate dynamic TTL
        const ttl = this.calculateDynamicTTL(key, value, category, options);
        const expiresAt = now + ttl;
        
        // Calculate memory usage
        const memoryUsage = this.calculateMemoryUsage(value);
        
        // Check if we need to make space
        if (this.cache.size >= this.maxSize) {
            this.evictEntries(Math.floor(this.maxSize * 0.1)); // Evict 10%
        }
        
        // Store entry
        const entry = {
            value,
            createdAt: now,
            expiresAt,
            category,
            priority,
            memoryUsage,
            accessCount: 0,
            wasPrefetched: options.isPrefetch || false,
            accessed: false
        };
        
        this.cache.set(key, entry);
        this.stats.bytesStored += memoryUsage;
        
        this.emit('cache:set', { 
            key, 
            ttl, 
            category, 
            memoryUsage,
            totalEntries: this.cache.size 
        });
        
        return true;
    }

    // Calcular TTL dinámico basado en múltiples factores
    calculateDynamicTTL(key, value, category, options) {
        const strategy = this.ttlStrategies[category];
        if (!strategy) return this.defaultTTL;
        
        let baseTTL = (strategy.min + strategy.max) / 2;
        
        // Factor de volatilidad del mercado
        const volatility = options.marketVolatility || 0.02;
        const volatilityMultiplier = 1 - (volatility * strategy.volatilityFactor);
        baseTTL *= Math.max(0.1, Math.min(2.0, volatilityMultiplier));
        
        // Factor de frecuencia de acceso
        const accessInfo = this.accessLog.get(key);
        if (accessInfo) {
            const frequencyMultiplier = Math.min(2.0, 1 + (accessInfo.frequency * 0.5));
            baseTTL *= frequencyMultiplier;
        }
        
        // Factor de importancia de datos
        const importanceMultiplier = options.importance || 1.0;
        baseTTL *= importanceMultiplier;
        
        // Factor de coherencia cuántica (para datos QBTC)
        const coherence = options.quantumCoherence || 0.7;
        const coherenceMultiplier = 0.5 + (coherence * 0.7);
        baseTTL *= coherenceMultiplier;
        
        // Aplicar límites de la estrategia
        return Math.max(strategy.min, Math.min(strategy.max, Math.round(baseTTL)));
    }

    // Calcular frecuencia de acceso
    calculateFrequency(accessInfo) {
        const now = Date.now();
        const timeSinceFirst = now - (accessInfo.firstAccess || now);
        
        if (timeSinceFirst < 60000) return 0; // Less than 1 minute
        
        const accessesPerMinute = accessInfo.count / (timeSinceFirst / 60000);
        return Math.min(10, accessesPerMinute); // Cap at 10 accesses/minute
    }

    // Calcular uso de memoria (aproximado)
    calculateMemoryUsage(value) {
        if (typeof value === 'string') return value.length * 2;
        if (typeof value === 'number') return 8;
        if (typeof value === 'boolean') return 4;
        if (value === null || value === undefined) return 0;
        
        try {
            return JSON.stringify(value).length * 2; // Rough estimation
        } catch {
            return 1024; // Default for complex objects
        }
    }

    // Registrar patrones de acceso para predicción
    recordAccessPattern(key, options) {
        const now = Date.now();
        const pattern = this.accessPatterns.get(key) || { accesses: [], relatedKeys: new Set() };
        
        pattern.accesses.push({
            timestamp: now,
            context: options.context || 'unknown',
            source: options.source || 'unknown'
        });
        
        // Keep only last 50 accesses
        if (pattern.accesses.length > 50) {
            pattern.accesses = pattern.accesses.slice(-50);
        }
        
        // Record related keys accessed in the same context
        if (options.relatedKeys) {
            options.relatedKeys.forEach(relatedKey => {
                pattern.relatedKeys.add(relatedKey);
            });
        }
        
        this.accessPatterns.set(key, pattern);
    }

    // Triggear prefetch predictivo
    triggerPredictivePrefetch(key, options) {
        const pattern = this.accessPatterns.get(key);
        if (!pattern) return;
        
        // Predict related keys that might be accessed soon
        for (const relatedKey of pattern.relatedKeys) {
            if (!this.cache.has(relatedKey) && !this.prefetchQueue.has(relatedKey)) {
                this.prefetchQueue.add({
                    key: relatedKey,
                    priority: 'low',
                    predictedBy: key,
                    context: options.context,
                    scheduledAt: Date.now()
                });
            }
        }
        
        // Predict time-based patterns
        this.predictTemporalPatterns(key, pattern);
    }

    // Predecir patrones temporales
    predictTemporalPatterns(key, pattern) {
        if (pattern.accesses.length < 5) return; // Need minimum data
        
        const recentAccesses = pattern.accesses.slice(-10);
        const intervals = [];
        
        for (let i = 1; i < recentAccesses.length; i++) {
            intervals.push(recentAccesses[i].timestamp - recentAccesses[i-1].timestamp);
        }
        
        if (intervals.length === 0) return;
        
        // Calculate average interval
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const lastAccess = recentAccesses[recentAccesses.length - 1].timestamp;
        const predictedNextAccess = lastAccess + avgInterval;
        
        // Schedule prefetch if pattern is consistent
        const intervalVariance = this.calculateVariance(intervals);
        const consistencyScore = Math.max(0, 1 - (intervalVariance / (avgInterval * avgInterval)));
        
        if (consistencyScore > 0.7 && avgInterval < 300000) { // 5 minutes max
            setTimeout(() => {
                this.schedulePrefetch(key, 'temporal_prediction', consistencyScore);
            }, Math.max(0, predictedNextAccess - Date.now() - 5000)); // 5 seconds early
        }
    }

    // Calcular varianza
    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    // Programar prefetch
    schedulePrefetch(key, reason, priority = 0.5) {
        this.prefetchQueue.add({
            key,
            reason,
            priority,
            scheduledAt: Date.now()
        });
    }

    // Proceso de prefetch
    startPrefetchProcess() {
        setInterval(() => {
            this.processPrefetchQueue();
        }, 2000); // Every 2 seconds
    }

    // Procesar cola de prefetch
    async processPrefetchQueue() {
        if (this.prefetchQueue.size === 0) return;
        
        const items = Array.from(this.prefetchQueue).sort((a, b) => b.priority - a.priority);
        const batchSize = Math.min(5, items.length); // Process max 5 at a time
        
        for (let i = 0; i < batchSize; i++) {
            const item = items[i];
            this.prefetchQueue.delete(item);
            
            try {
                await this.executePrefetch(item);
            } catch (error) {
                console.warn('Prefetch failed:', error.message);
            }
        }
    }

    // Ejecutar prefetch
    async executePrefetch(item) {
        if (this.cache.has(item.key)) return; // Already cached
        
        this.emit('cache:prefetch', { key: item.key, reason: item.reason });
        
        // This would be implemented by the specific cache user
        // For now, we just emit an event
        return true;
    }

    // Evict entries usando estrategia LRU + prioridad
    evictEntries(count) {
        const entries = Array.from(this.cache.entries());
        
        // Score entries for eviction (lower score = more likely to evict)
        const scoredEntries = entries.map(([key, entry]) => {
            const accessInfo = this.accessLog.get(key) || { count: 0, lastAccess: 0, frequency: 0 };
            const now = Date.now();
            
            let score = 0;
            
            // Age factor (older = lower score)
            const age = now - entry.createdAt;
            score += Math.max(0, 100 - (age / 60000)); // 100 points for new, 0 for 1+ minutes old
            
            // Access frequency factor
            score += accessInfo.frequency * 20;
            
            // Recent access factor
            const timeSinceAccess = now - accessInfo.lastAccess;
            score += Math.max(0, 50 - (timeSinceAccess / 30000)); // 50 points for recent access
            
            // Priority factor
            const priorityMultiplier = {
                'low': 0.5,
                'normal': 1.0,
                'high': 1.5,
                'critical': 2.0
            };
            score *= priorityMultiplier[entry.priority] || 1.0;
            
            // Category importance
            const categoryMultiplier = {
                'market_data': 1.2,
                'risk_metrics': 1.5,
                'order_book': 1.3,
                'position_data': 1.1,
                'analysis_results': 0.9
            };
            score *= categoryMultiplier[entry.category] || 1.0;
            
            return { key, entry, score };
        });
        
        // Sort by score (lowest first for eviction)
        scoredEntries.sort((a, b) => a.score - b.score);
        
        // Evict lowest scoring entries
        for (let i = 0; i < Math.min(count, scoredEntries.length); i++) {
            const { key, entry } = scoredEntries[i];
            this.cache.delete(key);
            this.accessLog.delete(key);
            this.stats.bytesStored -= entry.memoryUsage;
            this.stats.evictions++;
            
            this.emit('cache:evict', { key, reason: 'lru_priority', score: scoredEntries[i].score });
        }
    }

    // Proceso de limpieza automática
    startCleanupProcess() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    // Limpiar entradas expiradas
    cleanup() {
        const now = Date.now();
        let expiredCount = 0;
        let freedBytes = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                this.accessLog.delete(key);
                this.stats.bytesStored -= entry.memoryUsage;
                expiredCount++;
                freedBytes += entry.memoryUsage;
            }
        }
        
        if (expiredCount > 0) {
            this.emit('cache:cleanup', { 
                expiredCount, 
                freedBytes, 
                remainingEntries: this.cache.size 
            });
        }
        
        // Cleanup old access patterns
        this.cleanupAccessPatterns();
    }

    // Limpiar patrones de acceso antiguos
    cleanupAccessPatterns() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        for (const [key, pattern] of this.accessPatterns.entries()) {
            const recentAccesses = pattern.accesses.filter(
                access => now - access.timestamp < maxAge
            );
            
            if (recentAccesses.length === 0) {
                this.accessPatterns.delete(key);
            } else {
                pattern.accesses = recentAccesses;
            }
        }
    }

    // Invalidar cache por patrón
    invalidate(pattern) {
        let invalidatedCount = 0;
        
        if (typeof pattern === 'string') {
            // Exact match
            if (this.cache.has(pattern)) {
                const entry = this.cache.get(pattern);
                this.cache.delete(pattern);
                this.accessLog.delete(pattern);
                this.stats.bytesStored -= entry.memoryUsage;
                invalidatedCount = 1;
            }
        } else if (pattern instanceof RegExp) {
            // Regex pattern
            for (const key of this.cache.keys()) {
                if (pattern.test(key)) {
                    const entry = this.cache.get(key);
                    this.cache.delete(key);
                    this.accessLog.delete(key);
                    this.stats.bytesStored -= entry.memoryUsage;
                    invalidatedCount++;
                }
            }
        } else if (typeof pattern === 'function') {
            // Custom function
            for (const [key, entry] of this.cache.entries()) {
                if (pattern(key, entry)) {
                    this.cache.delete(key);
                    this.accessLog.delete(key);
                    this.stats.bytesStored -= entry.memoryUsage;
                    invalidatedCount++;
                }
            }
        }
        
        this.emit('cache:invalidate', { pattern, invalidatedCount });
        return invalidatedCount;
    }

    // Obtener estadísticas del cache
    getStats() {
        const now = Date.now();
        const uptime = now - this.stats.startTime;
        const hitRate = this.stats.totalRequests > 0 
            ? (this.stats.hits / this.stats.totalRequests) * 100 
            : 0;
        
        const prefetchHitRate = this.stats.hits > 0
            ? (this.stats.prefetchHits / this.stats.hits) * 100
            : 0;
        
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            prefetchHitRate: Math.round(prefetchHitRate * 100) / 100,
            totalEntries: this.cache.size,
            memoryUsageMB: Math.round(this.stats.bytesStored / 1024 / 1024 * 100) / 100,
            uptimeMinutes: Math.round(uptime / 60000),
            accessPatterns: this.accessPatterns.size,
            pendingPrefetch: this.prefetchQueue.size,
            averageEntrySize: this.cache.size > 0 ? Math.round(this.stats.bytesStored / this.cache.size) : 0,
            timestamp: new Date()
        };
    }

    // Obtener información de rendimiento
    getPerformanceReport() {
        const stats = this.getStats();
        const recommendations = [];
        
        // Analyze hit rate
        if (stats.hitRate < this.hitRateTarget * 100) {
            recommendations.push(`Hit rate ${stats.hitRate}% below target ${this.hitRateTarget * 100}%`);
        }
        
        // Analyze memory usage
        if (stats.memoryUsageMB > 500) {
            recommendations.push(`High memory usage: ${stats.memoryUsageMB}MB`);
        }
        
        // Analyze prefetch effectiveness
        if (stats.prefetchHitRate < 20) {
            recommendations.push(`Low prefetch hit rate: ${stats.prefetchHitRate}%`);
        }
        
        // Analyze eviction rate
        const evictionRate = stats.totalRequests > 0 ? (stats.evictions / stats.totalRequests) * 100 : 0;
        if (evictionRate > 5) {
            recommendations.push(`High eviction rate: ${evictionRate.toFixed(2)}%`);
        }
        
        return {
            stats,
            recommendations,
            healthScore: this.calculateHealthScore(stats),
            timestamp: new Date()
        };
    }

    // Calcular score de salud del cache
    calculateHealthScore(stats) {
        let score = 100;
        
        // Hit rate factor
        const hitRatePenalty = Math.max(0, (this.hitRateTarget * 100) - stats.hitRate);
        score -= hitRatePenalty * 0.5;
        
        // Memory usage factor
        if (stats.memoryUsageMB > 1000) score -= 20;
        else if (stats.memoryUsageMB > 500) score -= 10;
        
        // Eviction rate factor
        const evictionRate = stats.totalRequests > 0 ? (stats.evictions / stats.totalRequests) * 100 : 0;
        if (evictionRate > 10) score -= 15;
        else if (evictionRate > 5) score -= 5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Limpiar todo el cache
    clear() {
        const clearedEntries = this.cache.size;
        const freedBytes = this.stats.bytesStored;
        
        this.cache.clear();
        this.accessLog.clear();
        this.stats.bytesStored = 0;
        
        this.emit('cache:clear', { clearedEntries, freedBytes });
        return clearedEntries;
    }
}

export default IntelligentCacheSystem;
