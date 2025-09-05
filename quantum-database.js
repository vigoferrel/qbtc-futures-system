#!/usr/bin/env node

/**
 * 🗃️ QBTC QUANTUM DATABASE - MÓDULO UNIFICADO
 * ==========================================
 * Interfaz híbrida SQLite + JSON para el almacenamiento
 * de todos los estados del sistema cuántico QBTC.
 * 
 * CARACTERÍSTICAS:
 * - SQLite para datos estructurados y consultas rápidas
 * - JSON para estados complejos y dinámicos
 * - Cache en memoria para datos de tiempo real
 * - Backup automático y recuperación
 * - Hot-reload de configuración
 * - Optimizaciones de rendimiento
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';

class QuantumDatabase {
    constructor(options = {}) {
        this.options = {
            dbPath: options.dbPath || './data/quantum-brain.db',
            schemaPath: options.schemaPath || './quantum-database-schema.sql',
            backupEnabled: options.backupEnabled !== false,
            backupInterval: options.backupInterval || 3600000, // 1 hora
            cacheEnabled: options.cacheEnabled !== false,
            cacheSize: options.cacheSize || 1000,
            ...options
        };
        
        this.db = null;
        this.cache = new Map();
        this.backupTimer = null;
        this.isInitialized = false;
        
        // Estados en caché para acceso rápido
        this.realtimeCache = {
            latestQuantumState: null,
            activeConfiguration: new Map(),
            marketData: new Map(),
            lastUpdate: null
        };
        
        console.log('🗃️ Quantum Database module initialized');
    }
    
    // 🚀 INICIALIZAR BASE DE DATOS
    async initialize() {
        try {
            console.log('🚀 Initializing Quantum Database...');
            
            // Crear directorio de datos si no existe
            const dataDir = path.dirname(this.options.dbPath);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Abrir conexión SQLite
            this.db = await open({
                filename: this.options.dbPath,
                driver: sqlite3.Database
            });
            
            // Configurar SQLite para mejor rendimiento
            await this.db.exec(`
                PRAGMA journal_mode = WAL;
                PRAGMA synchronous = NORMAL;
                PRAGMA cache_size = 10000;
                PRAGMA temp_store = MEMORY;
                PRAGMA mmap_size = 268435456;
            `);
            
            // Cargar y ejecutar schema
            await this.loadSchema();
            
            // Cargar configuración inicial
            await this.loadConfiguration();
            
            // Inicializar cache de datos en tiempo real
            await this.initializeRealtimeCache();
            
            // Configurar backup automático
            if (this.options.backupEnabled) {
                this.setupAutoBackup();
            }
            
            this.isInitialized = true;
            console.log('✅ Quantum Database initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Quantum Database:', error.message);
            throw error;
        }
    }
    
    // 📋 CARGAR SCHEMA DE BASE DE DATOS
    async loadSchema() {
        try {
            console.log('📋 Loading database schema...');
            
            const schemaSQL = await fs.readFile(this.options.schemaPath, 'utf8');
            await this.db.exec(schemaSQL);
            
            console.log('✅ Database schema loaded');
            
        } catch (error) {
            console.error('❌ Error loading schema:', error.message);
            throw error;
        }
    }
    
    // ⚙️ CARGAR CONFIGURACIÓN INICIAL
    async loadConfiguration() {
        try {
            console.log('⚙️ Loading quantum configuration...');
            
            const configs = await this.db.all(
                'SELECT config_key, config_value, config_type FROM active_configuration'
            );
            
            for (const config of configs) {
                let value = config.config_value;
                
                // Convertir tipos
                switch (config.config_type) {
                    case 'NUMBER':
                        value = parseFloat(value);
                        break;
                    case 'BOOLEAN':
                        value = value.toLowerCase() === 'true';
                        break;
                    case 'JSON':
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.warn(`Invalid JSON for config ${config.config_key}`);
                        }
                        break;
                }
                
                this.realtimeCache.activeConfiguration.set(config.config_key, value);
            }
            
            console.log(`✅ Loaded ${configs.length} configuration items`);
            
        } catch (error) {
            console.error('❌ Error loading configuration:', error.message);
        }
    }
    
    // 🔄 INICIALIZAR CACHE EN TIEMPO REAL
    async initializeRealtimeCache() {
        try {
            console.log('🔄 Initializing realtime cache...');
            
            // Cargar último estado cuántico
            const latestState = await this.db.get(
                'SELECT * FROM latest_quantum_state'
            );
            
            if (latestState) {
                this.realtimeCache.latestQuantumState = this.parseQuantumState(latestState);
            }
            
            // Cargar datos de mercado frescos
            const marketData = await this.db.all(
                'SELECT * FROM fresh_market_data'
            );
            
            for (const data of marketData) {
                this.realtimeCache.marketData.set(data.symbol, data);
            }
            
            this.realtimeCache.lastUpdate = Date.now();
            
            console.log('✅ Realtime cache initialized');
            
        } catch (error) {
            console.error('❌ Error initializing cache:', error.message);
        }
    }
    
    // 💾 CONFIGURAR BACKUP AUTOMÁTICO
    setupAutoBackup() {
        console.log('💾 Setting up auto-backup...');
        
        this.backupTimer = setInterval(async () => {
            try {
                await this.createBackup();
            } catch (error) {
                console.error('❌ Auto-backup failed:', error.message);
            }
        }, this.options.backupInterval);
        
        console.log(`✅ Auto-backup scheduled every ${this.options.backupInterval/1000/60} minutes`);
    }
    
    // 📦 CREAR BACKUP
    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `./data/backups/quantum-brain-${timestamp}.db`;
            
            // Crear directorio de backups
            await fs.mkdir('./data/backups', { recursive: true });
            
            // Crear backup usando SQLite backup API
            await this.db.exec(`VACUUM INTO '${backupPath}'`);
            
            console.log(`💾 Backup created: ${backupPath}`);
            
            // Limpiar backups antiguos (mantener solo los últimos 10)
            await this.cleanOldBackups();
            
        } catch (error) {
            console.error('❌ Backup creation failed:', error.message);
        }
    }
    
    // 🧹 LIMPIAR BACKUPS ANTIGUOS
    async cleanOldBackups() {
        try {
            const backupDir = './data/backups';
            const files = await fs.readdir(backupDir);
            
            const backupFiles = files
                .filter(f => f.startsWith('quantum-brain-') && f.endsWith('.db'))
                .map(f => ({
                    name: f,
                    path: path.join(backupDir, f)
                }))
                .sort((a, b) => b.name.localeCompare(a.name)); // Más reciente primero
            
            // Eliminar backups antiguos si hay más de 10
            if (backupFiles.length > 10) {
                const filesToDelete = backupFiles.slice(10);
                for (const file of filesToDelete) {
                    await fs.unlink(file.path);
                    console.log(`🗑️ Deleted old backup: ${file.name}`);
                }
            }
            
        } catch (error) {
            console.error('❌ Error cleaning old backups:', error.message);
        }
    }
    
    // ================================
    // MÉTODOS PARA ESTADOS CUÁNTICOS
    // ================================
    
    // 💾 GUARDAR ESTADO CUÁNTICO COMPLETO
    async saveQuantumState(quantumState) {
        try {
            const result = await this.db.run(`
                INSERT INTO quantum_states (
                    consciousness_level,
                    quantum_field_strength,
                    quantum_entanglement,
                    quantum_superposition,
                    quantum_uncertainty,
                    quantum_coherence,
                    temporal_state,
                    weighting_state,
                    ranking_state,
                    trading_state,
                    system_state
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                quantumState.consciousness.level,
                quantumState.quantum.fieldStrength,
                quantumState.quantum.entanglement,
                quantumState.quantum.superposition,
                quantumState.quantum.uncertainty,
                quantumState.consciousness.quantumCoherence,
                JSON.stringify(quantumState.temporal),
                JSON.stringify(quantumState.weighting),
                JSON.stringify(quantumState.ranking),
                JSON.stringify(quantumState.trading),
                JSON.stringify(quantumState.system)
            ]);
            
            // Actualizar cache
            this.realtimeCache.latestQuantumState = quantumState;
            
            return result.lastID;
            
        } catch (error) {
            console.error('❌ Error saving quantum state:', error.message);
            throw error;
        }
    }
    
    // 🔍 OBTENER ÚLTIMO ESTADO CUÁNTICO
    async getLatestQuantumState() {
        // Usar cache si está disponible
        if (this.realtimeCache.latestQuantumState) {
            return this.realtimeCache.latestQuantumState;
        }
        
        try {
            const row = await this.db.get('SELECT * FROM latest_quantum_state');
            if (row) {
                const state = this.parseQuantumState(row);
                this.realtimeCache.latestQuantumState = state;
                return state;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Error getting latest quantum state:', error.message);
            throw error;
        }
    }
    
    // 📊 OBTENER HISTORIAL DE ESTADOS CUÁNTICOS
    async getQuantumStateHistory(limit = 100) {
        try {
            const rows = await this.db.all(`
                SELECT * FROM quantum_states 
                ORDER BY timestamp DESC 
                LIMIT ?
            `, [limit]);
            
            return rows.map(row => this.parseQuantumState(row));
            
        } catch (error) {
            console.error('❌ Error getting quantum state history:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS PARA EVOLUCIÓN DE CONCIENCIA
    // ================================
    
    // 🧠 REGISTRAR EVOLUCIÓN DE CONCIENCIA
    async recordConsciousnessEvolution(evolutionData) {
        try {
            const result = await this.db.run(`
                INSERT INTO consciousness_evolution (
                    old_level,
                    new_level,
                    evolution_factor,
                    awakening_event,
                    system_activity,
                    quantum_coherence,
                    client_connections,
                    context_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                evolutionData.old_level,
                evolutionData.new_level,
                evolutionData.evolution_factor,
                evolutionData.awakening_event || false,
                evolutionData.system_activity || 0,
                evolutionData.quantum_coherence || 0,
                evolutionData.client_connections || 0,
                JSON.stringify(evolutionData.context || {})
            ]);
            
            return result.lastID;
            
        } catch (error) {
            console.error('❌ Error recording consciousness evolution:', error.message);
            throw error;
        }
    }
    
    // 📈 OBTENER EVOLUCIÓN DE CONCIENCIA RECIENTE
    async getRecentConsciousnessEvolution(hours = 24) {
        try {
            return await this.db.all(`
                SELECT * FROM consciousness_evolution 
                WHERE timestamp >= datetime('now', '-${hours} hours')
                ORDER BY timestamp DESC
            `);
            
        } catch (error) {
            console.error('❌ Error getting consciousness evolution:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS PARA RANKINGS CUÁNTICOS
    // ================================
    
    // 🏆 GUARDAR RANKING CUÁNTICO
    async saveQuantumRanking(rankingData) {
        try {
            const result = await this.db.run(`
                INSERT INTO quantum_rankings (
                    ranking_type,
                    precision_score,
                    correlation_score,
                    stability_index,
                    confidence_interval_low,
                    confidence_interval_high,
                    rankings_data,
                    symbols_analyzed,
                    total_symbols,
                    generation_time_ms,
                    validation_passed,
                    backtest_accuracy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                rankingData.ranking_type || 'QUANTUM_VALIDATED',
                rankingData.precision_score || 0,
                rankingData.correlation_score || 0,
                rankingData.stability_index || 0,
                rankingData.confidence_interval?.[0] || 0,
                rankingData.confidence_interval?.[1] || 0,
                JSON.stringify(rankingData.rankings || []),
                rankingData.symbols_analyzed || 0,
                rankingData.total_symbols || 0,
                rankingData.generation_time || 0,
                rankingData.validation_passed !== false,
                rankingData.backtest_accuracy || 0
            ]);
            
            return result.lastID;
            
        } catch (error) {
            console.error('❌ Error saving quantum ranking:', error.message);
            throw error;
        }
    }
    
    // 📋 OBTENER RANKINGS RECIENTES
    async getLatestRankings(limit = 10) {
        try {
            const rows = await this.db.all(`
                SELECT * FROM latest_rankings 
                LIMIT ?
            `, [limit]);
            
            return rows.map(row => ({
                ...row,
                rankings_data: JSON.parse(row.rankings_data || '[]')
            }));
            
        } catch (error) {
            console.error('❌ Error getting latest rankings:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS PARA DATOS DE MERCADO
    // ================================
    
    // 💹 ACTUALIZAR DATOS DE MERCADO
    async updateMarketData(symbol, marketData) {
        try {
            await this.db.run(`
                INSERT INTO market_data (
                    symbol,
                    price,
                    change_24h,
                    volume_24h,
                    high_24h,
                    low_24h,
                    market_condition,
                    volatility
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                symbol,
                marketData.price,
                marketData.change_24h || 0,
                marketData.volume_24h || 0,
                marketData.high_24h || 0,
                marketData.low_24h || 0,
                marketData.market_condition || 'NEUTRAL',
                marketData.volatility || 0
            ]);
            
            // Actualizar cache
            this.realtimeCache.marketData.set(symbol, {
                symbol,
                ...marketData,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('❌ Error updating market data:', error.message);
            throw error;
        }
    }
    
    // 📊 OBTENER DATOS DE MERCADO FRESCOS
    async getFreshMarketData() {
        // Usar cache si está disponible
        if (this.realtimeCache.marketData.size > 0) {
            return Array.from(this.realtimeCache.marketData.values());
        }
        
        try {
            return await this.db.all('SELECT * FROM fresh_market_data');
            
        } catch (error) {
            console.error('❌ Error getting fresh market data:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS PARA EVENTOS CUÁNTICOS
    // ================================
    
    // ⚡ REGISTRAR EVENTO CUÁNTICO
    async recordQuantumEvent(eventData) {
        try {
            const result = await this.db.run(`
                INSERT INTO quantum_events (
                    event_type,
                    event_severity,
                    title,
                    description,
                    consciousness_level,
                    quantum_field_strength,
                    quantum_coherence,
                    event_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                eventData.event_type,
                eventData.event_severity || 'MEDIUM',
                eventData.title,
                eventData.description,
                eventData.consciousness_level || 0,
                eventData.quantum_field_strength || 0,
                eventData.quantum_coherence || 0,
                JSON.stringify(eventData.event_data || {})
            ]);
            
            return result.lastID;
            
        } catch (error) {
            console.error('❌ Error recording quantum event:', error.message);
            throw error;
        }
    }
    
    // 📅 OBTENER EVENTOS CUÁNTICOS PENDIENTES
    async getPendingQuantumEvents() {
        try {
            const rows = await this.db.all('SELECT * FROM pending_quantum_events');
            return rows.map(row => ({
                ...row,
                event_data: JSON.parse(row.event_data || '{}')
            }));
            
        } catch (error) {
            console.error('❌ Error getting pending quantum events:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS PARA CONFIGURACIÓN
    // ================================
    
    // ⚙️ OBTENER CONFIGURACIÓN
    getConfiguration(key) {
        return this.realtimeCache.activeConfiguration.get(key);
    }
    
    // ⚙️ ACTUALIZAR CONFIGURACIÓN
    async updateConfiguration(key, value, type = 'STRING') {
        try {
            await this.db.run(`
                INSERT OR REPLACE INTO configuration (
                    config_key, 
                    config_value, 
                    config_type,
                    updated_at
                ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `, [key, String(value), type]);
            
            // Convertir valor según tipo
            let parsedValue = value;
            switch (type) {
                case 'NUMBER':
                    parsedValue = parseFloat(value);
                    break;
                case 'BOOLEAN':
                    parsedValue = String(value).toLowerCase() === 'true';
                    break;
                case 'JSON':
                    parsedValue = JSON.parse(value);
                    break;
            }
            
            // Actualizar cache
            this.realtimeCache.activeConfiguration.set(key, parsedValue);
            
            console.log(`⚙️ Configuration updated: ${key} = ${value}`);
            
        } catch (error) {
            console.error('❌ Error updating configuration:', error.message);
            throw error;
        }
    }
    
    // ================================
    // MÉTODOS DE UTILIDAD
    // ================================
    
    // 🔄 PARSEAR ESTADO CUÁNTICO DESDE BD
    parseQuantumState(row) {
        return {
            id: row.id,
            timestamp: row.timestamp,
            consciousness: {
                level: row.consciousness_level,
                quantumCoherence: row.quantum_coherence
            },
            quantum: {
                fieldStrength: row.quantum_field_strength,
                entanglement: row.quantum_entanglement,
                superposition: row.quantum_superposition,
                uncertainty: row.quantum_uncertainty
            },
            temporal: JSON.parse(row.temporal_state || '{}'),
            weighting: JSON.parse(row.weighting_state || '{}'),
            ranking: JSON.parse(row.ranking_state || '{}'),
            trading: JSON.parse(row.trading_state || '{}'),
            system: JSON.parse(row.system_state || '{}')
        };
    }
    
    // 📊 OBTENER ESTADÍSTICAS DE LA BASE DE DATOS
    async getDatabaseStats() {
        try {
            const stats = {};
            
            const tables = [
                'quantum_states',
                'consciousness_evolution',
                'quantum_rankings',
                'temporal_cycles',
                'market_data',
                'quantum_events',
                'configuration'
            ];
            
            for (const table of tables) {
                const result = await this.db.get(`SELECT COUNT(*) as count FROM ${table}`);
                stats[table] = result.count;
            }
            
            // Tamaño de la base de datos
            const dbStats = await fs.stat(this.options.dbPath);
            stats.database_size_mb = (dbStats.size / (1024 * 1024)).toFixed(2);
            
            // Estado del cache
            stats.cache = {
                active_config_items: this.realtimeCache.activeConfiguration.size,
                market_data_symbols: this.realtimeCache.marketData.size,
                has_latest_quantum_state: !!this.realtimeCache.latestQuantumState,
                last_update: this.realtimeCache.lastUpdate
            };
            
            return stats;
            
        } catch (error) {
            console.error('❌ Error getting database stats:', error.message);
            throw error;
        }
    }
    
    // 🧹 LIMPIAR DATOS ANTIGUOS
    async cleanupOldData(daysToKeep = 30) {
        try {
            console.log(`🧹 Cleaning up data older than ${daysToKeep} days...`);
            
            const tables = [
                'quantum_states',
                'consciousness_evolution',
                'temporal_cycles',
                'market_data',
                'system_performance'
            ];
            
            let totalDeleted = 0;
            
            for (const table of tables) {
                const result = await this.db.run(`
                    DELETE FROM ${table} 
                    WHERE timestamp < datetime('now', '-${daysToKeep} days')
                `);
                
                if (result.changes > 0) {
                    console.log(`   - ${table}: ${result.changes} rows deleted`);
                    totalDeleted += result.changes;
                }
            }
            
            // Optimizar base de datos después de la limpieza
            await this.db.exec('VACUUM');
            
            console.log(`✅ Cleanup completed: ${totalDeleted} rows deleted`);
            
            return totalDeleted;
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error.message);
            throw error;
        }
    }
    
    // 🔒 CERRAR BASE DE DATOS
    async close() {
        try {
            console.log('🔒 Closing Quantum Database...');
            
            // Detener backup automático
            if (this.backupTimer) {
                clearInterval(this.backupTimer);
            }
            
            // Cerrar conexión
            if (this.db) {
                await this.db.close();
            }
            
            // Limpiar cache
            this.cache.clear();
            this.realtimeCache.activeConfiguration.clear();
            this.realtimeCache.marketData.clear();
            
            this.isInitialized = false;
            
            console.log('✅ Quantum Database closed');
            
        } catch (error) {
            console.error('❌ Error closing database:', error.message);
            throw error;
        }
    }
}

export default QuantumDatabase;
