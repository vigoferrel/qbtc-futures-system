/**
 * [MEMO] HERMETIC ADVANCED LOGGER
 * ===========================
 * Sistema de logging estructurado y avanzado para el Trading Hermético
 * - Logging por niveles (debug, info, warn, error)
 * - Contexto hermético enriquecido
 * - Rotación automática de logs
 * - Formato estructurado para análisis
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HermeticLogger {
    constructor(config = {}) {
        this.config = {
            logLevel: config.logLevel || 'info',
            logDirectory: config.logDirectory || path.join(path.dirname(__dirname), 'logs'),
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
            maxFiles: config.maxFiles || 30, // 30 archivos
            enableConsole: config.enableConsole !== false, // Por defecto habilitado
            enableFile: config.enableFile !== false, // Por defecto habilitado
            enableStructured: config.enableStructured !== false, // Por defecto habilitado
            dateFormat: config.dateFormat || 'YYYY-MM-DD',
            timeFormat: config.timeFormat || 'HH:mm:ss.SSS'
        };

        // Niveles de logging
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        // Colores para consola
        this.colors = {
            debug: '\x1b[36m',    // Cyan
            info: '\x1b[32m',     // Green
            warn: '\x1b[33m',     // Yellow
            error: '\x1b[31m',    // Red
            reset: '\x1b[0m',     // Reset
            bright: '\x1b[1m',    // Bright
            dim: '\x1b[2m'        // Dim
        };

        // Emojis para diferentes tipos de eventos
        this.emojis = {
            debug: '[MAGNIFY]',
            info: '??',
            warn: '[WARNING]',
            error: '[X]',
            trade: '[CHART_TREND]',
            transmutation: '??',
            consciousness: '[BRAIN]',
            merkaba: '[CYCLONE]',
            akashic: '[CRYSTAL_BALL]',
            phoenix: '[FIRE]',
            dimensional: '[GALAXY]',
            system: '??'
        };

        // Buffer de logs en memoria
        this.logBuffer = [];
        this.maxBufferSize = 1000;

        // Estado del sistema
        this.systemContext = {
            consciousness_level: null,
            merkaba_active: false,
            dimensional_access: null,
            alchemical_phase: null,
            trading_active: false
        };

        this.isInitialized = false;
        
        console.log('[MEMO] Hermetic Advanced Logger initialized');
    }

    /**
     * Inicializar el logger
     */
    async initialize() {
        try {
            // Crear directorio de logs si no existe
            await this.ensureLogDirectory();
            
            // Limpiar logs antiguos
            await this.cleanOldLogs();
            
            this.isInitialized = true;
            
            // Log inicial
            this.info('Hermetic Logger initialized', {
                log_level: this.config.logLevel,
                log_directory: this.config.logDirectory,
                console_enabled: this.config.enableConsole,
                file_enabled: this.config.enableFile
            });
            
            return true;
        } catch (error) {
            console.error('[X] Failed to initialize Hermetic Logger:', error);
            return false;
        }
    }

    /**
     * Asegurar que el directorio de logs existe
     */
    async ensureLogDirectory() {
        try {
            await fs.access(this.config.logDirectory);
        } catch (error) {
            await fs.mkdir(this.config.logDirectory, { recursive: true });
            console.log(`?? Created log directory: ${this.config.logDirectory}`);
        }
    }

    /**
     * Actualizar contexto del sistema
     */
    updateSystemContext(context) {
        this.systemContext = { ...this.systemContext, ...context };
    }

    /**
     * Log de nivel debug
     */
    debug(message, data = {}, category = 'system') {
        this.log('debug', message, data, category);
    }

    /**
     * Log de nivel info
     */
    info(message, data = {}, category = 'system') {
        this.log('info', message, data, category);
    }

    /**
     * Log de nivel warn
     */
    warn(message, data = {}, category = 'system') {
        this.log('warn', message, data, category);
    }

    /**
     * Log de nivel error
     */
    error(message, data = {}, category = 'system') {
        this.log('error', message, data, category);
    }

    /**
     * Logs especializados para eventos herméticos
     */
    logTrade(action, tradeData, metadata = {}) {
        this.log('info', `Trade ${action}`, {
            ...tradeData,
            ...metadata
        }, 'trade');
    }

    logTransmutation(type, transmutationData, metadata = {}) {
        this.log('info', `Transmutation ${type}`, {
            ...transmutationData,
            ...metadata
        }, 'transmutation');
    }

    logConsciousnessEvolution(evolutionData) {
        this.log('info', 'Consciousness evolution', evolutionData, 'consciousness');
    }

    logMerkabaEvent(eventType, eventData) {
        this.log('info', `Merkaba ${eventType}`, eventData, 'merkaba');
    }

    logAkashicEvent(eventType, eventData) {
        this.log('info', `Akashic ${eventType}`, eventData, 'akashic');
    }

    logPhoenixRebirth(rebirthData) {
        this.log('warn', 'Phoenix Rebirth', rebirthData, 'phoenix');
    }

    logDimensionalAscension(ascensionData) {
        this.log('info', 'Dimensional Ascension', ascensionData, 'dimensional');
    }

    /**
     * Método principal de logging
     */
    log(level, message, data = {}, category = 'system') {
        // Verificar nivel de log
        if (this.levels[level] < this.levels[this.config.logLevel]) {
            return;
        }

        const timestamp = new Date();
        const logEntry = this.createLogEntry(level, message, data, category, timestamp);

        // Añadir al buffer
        this.addToBuffer(logEntry);

        // Output a consola
        if (this.config.enableConsole) {
            this.outputToConsole(logEntry);
        }

        // Guardar a archivo
        if (this.config.enableFile && this.isInitialized) {
            this.saveToFile(logEntry).catch(error => {
                console.error('Failed to write log to file:', error);
            });
        }
    }

    /**
     * Crear entrada de log estructurada
     */
    createLogEntry(level, message, data, category, timestamp) {
        return {
            timestamp: timestamp.toISOString(),
            level: level.toUpperCase(),
            message,
            category,
            data: {
                ...data,
                system_context: this.systemContext,
                pid: process.pid,
                memory_usage: this.getMemoryUsage(),
                uptime: process.uptime()
            },
            formatted_time: this.formatTime(timestamp),
            session_id: this.getSessionId()
        };
    }

    /**
     * Obtener ID de sesión
     */
    getSessionId() {
        if (!this._sessionId) {
            this._sessionId = `hermetic_${Date.now()}_${this.purifier.generateQuantumValue(Math.floor(Date.now() / 1000) % 1000, 1).toString(36).substr(2, 8)}`;
        }
        return this._sessionId;
    }

    /**
     * Formatear tiempo
     */
    formatTime(timestamp) {
        return timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
            hour12: false
        });
    }

    /**
     * Obtener uso de memoria
     */
    getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
            external: Math.round(usage.external / 1024 / 1024 * 100) / 100 // MB
        };
    }

    /**
     * Añadir entrada al buffer
     */
    addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        
        // Limitar tamaño del buffer
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
        }
    }

    /**
     * Output a consola con formato hermético
     */
    outputToConsole(logEntry) {
        const { level, message, category, formatted_time, data } = logEntry;
        
        // Color y emoji basado en nivel
        const color = this.colors[level.toLowerCase()] || this.colors.info;
        const emoji = this.emojis[category] || this.emojis[level.toLowerCase()];
        
        // Formato principal
        let output = `${color}${emoji} [${formatted_time}] ${this.colors.bright}${level}${this.colors.reset}${color} (${category}) ${message}${this.colors.reset}`;
        
        // Añadir contexto hermético si está disponible
        if (data.system_context) {
            const ctx = data.system_context;
            let contextStr = '';
            
            if (ctx.consciousness_level !== null) {
                contextStr += `[BRAIN]${(ctx.consciousness_level * 100).toFixed(1)}% `;
            }
            
            if (ctx.merkaba_active) {
                contextStr += `[CYCLONE]ON `;
            }
            
            if (ctx.dimensional_access && ctx.dimensional_access !== '3d_normal_market') {
                contextStr += `[GALAXY]${ctx.dimensional_access.replace('d_', 'D ')} `;
            }
            
            if (ctx.alchemical_phase && ctx.alchemical_phase !== 'nigredo') {
                contextStr += `??${ctx.alchemical_phase} `;
            }
            
            if (contextStr) {
                output += ` ${this.colors.dim}[${contextStr.trim()}]${this.colors.reset}`;
            }
        }
        
        console.log(output);
        
        // Mostrar datos adicionales si existen (excepto para debug muy verboso)
        if (Object.keys(data).length > 1 && level !== 'DEBUG') {
            const relevantData = { ...data };
            delete relevantData.system_context;
            delete relevantData.pid;
            delete relevantData.memory_usage;
            delete relevantData.uptime;
            
            if (Object.keys(relevantData).length > 0) {
                console.log(`${this.colors.dim}   ${JSON.stringify(relevantData, null, 2)}${this.colors.reset}`);
            }
        }
    }

    /**
     * Guardar entrada a archivo
     */
    async saveToFile(logEntry) {
        try {
            const filename = this.getLogFilename(logEntry.timestamp);
            const filepath = path.join(this.config.logDirectory, filename);
            
            // Formato JSON Lines para fácil procesamiento
            const logLine = JSON.stringify(logEntry) + '\n';
            
            await fs.appendFile(filepath, logLine, 'utf8');
            
            // Verificar tamaño del archivo y rotar si es necesario
            await this.checkAndRotateLog(filepath);
            
        } catch (error) {
            console.error('Failed to save log entry:', error);
        }
    }

    /**
     * Obtener nombre del archivo de log
     */
    getLogFilename(timestamp) {
        const date = new Date(timestamp);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return `hermetic-${dateStr}.log`;
    }

    /**
     * Verificar y rotar log si es necesario
     */
    async checkAndRotateLog(filepath) {
        try {
            const stats = await fs.stat(filepath);
            
            if (stats.size > this.config.maxFileSize) {
                // Rotar el archivo
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedPath = filepath.replace('.log', `_${timestamp}.log`);
                
                await fs.rename(filepath, rotatedPath);
                
                console.log(`?? Log file rotated: ${path.basename(rotatedPath)}`);
            }
        } catch (error) {
            // Archivo puede no existir, ignorar
        }
    }

    /**
     * Limpiar logs antiguos
     */
    async cleanOldLogs() {
        try {
            const files = await fs.readdir(this.config.logDirectory);
            const logFiles = files
                .filter(file => file.startsWith('hermetic-') && file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.config.logDirectory, file),
                    birthtime: null
                }));

            // Obtener fechas de creación
            for (const file of logFiles) {
                try {
                    const stats = await fs.stat(file.path);
                    file.birthtime = stats.birthtime;
                } catch (error) {
                    // Continuar si no se puede leer el archivo
                }
            }

            // Ordenar por fecha y eliminar los más antiguos
            logFiles.sort((a, b) => (a.birthtime || 0) - (b.birthtime || 0));
            
            if (logFiles.length > this.config.maxFiles) {
                const filesToDelete = logFiles.slice(0, logFiles.length - this.config.maxFiles);
                
                for (const file of filesToDelete) {
                    try {
                        await fs.unlink(file.path);
                        console.log(`??? Deleted old log file: ${file.name}`);
                    } catch (error) {
                        console.error(`Failed to delete log file ${file.name}:`, error);
                    }
                }
            }
            
        } catch (error) {
            console.error('Failed to clean old logs:', error);
        }
    }

    /**
     * Obtener logs del buffer
     */
    getBufferedLogs(filter = {}) {
        let logs = [...this.logBuffer];
        
        // Aplicar filtros
        if (filter.level) {
            logs = logs.filter(log => log.level === filter.level.toUpperCase());
        }
        
        if (filter.category) {
            logs = logs.filter(log => log.category === filter.category);
        }
        
        if (filter.since) {
            const sinceTime = new Date(filter.since);
            logs = logs.filter(log => new Date(log.timestamp) >= sinceTime);
        }
        
        if (filter.limit) {
            logs = logs.slice(-filter.limit);
        }
        
        return logs;
    }

    /**
     * Obtener estadísticas de logging
     */
    getStats() {
        const levelCounts = {};
        const categoryCounts = {};
        
        for (const log of this.logBuffer) {
            levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
            categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
        }
        
        return {
            total_logs: this.logBuffer.length,
            level_counts: levelCounts,
            category_counts: categoryCounts,
            buffer_size: this.maxBufferSize,
            session_id: this.getSessionId(),
            uptime: process.uptime(),
            memory_usage: this.getMemoryUsage()
        };
    }

    /**
     * Cerrar el logger
     */
    async close() {
        this.info('Hermetic Logger closing', { 
            total_logs_processed: this.logBuffer.length 
        });
        
        // Limpiar buffer
        this.logBuffer = [];
        
        console.log('[MEMO] Hermetic Logger closed');
    }
}

// Crear instancia singleton del logger
let loggerInstance = null;

export function getLogger(config = {}) {
    if (!loggerInstance) {
        loggerInstance = new HermeticLogger(config);
    }
    return loggerInstance;
}

export function createLogger(config = {}) {
    return new HermeticLogger(config);
}

export default HermeticLogger;

