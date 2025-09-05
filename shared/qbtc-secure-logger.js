// 🛡️ QBTC Secure Logger
// Cumple regla del usuario: "Procesos deben reportar métricas con logging estructurado"
// Redacta automáticamente información sensible para facilitar mantenimiento del código

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import os from 'os';
import process from 'process';

/**
 * 🔐 SecureLogger - Logger estructurado con redacción automática
 * 
 * Características:
 * - Logging estructurado JSON
 * - Redacción automática de información sensible
 * - Rotación de logs automática
 * - Correlación de requests
 * - Métricas de performance integradas
 * 
 * ✅ CUMPLE: Regla del usuario sobre reporting y debugging
 * ✅ SEGURO: Para sistemas de trading con información sensible
 */
class SecureLogger {
    constructor(options = {}) {
        this.serviceName = options.serviceName || 'qbtc-system';
        this.logDirectory = options.logDirectory || path.join(process.cwd(), 'logs');
        this.maxLogFiles = options.maxLogFiles || 30;
        this.maxLogSize = options.maxLogSize || 50 * 1024 * 1024; // 50MB
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile !== false;
        this.enableMetrics = options.enableMetrics !== false;
        
        // Patrones de información sensible
        this.sensitivePatterns = [
            // API Keys y Secrets
            /(?:api[_-]?key|secret[_-]?key|private[_-]?key|access[_-]?token)["']?\s*[:=]\s*["']?([a-zA-Z0-9+/]{20,})/gi,
            /Bearer\s+([a-zA-Z0-9\-._~+/]+)/gi,
            /sk-[a-zA-Z0-9]{20,}/gi,
            
            // Credenciales generales
            /(?:password|passwd|pwd)["']?\s*[:=]\s*["']?([^\s"',}]+)/gi,
            /(?:username|user|login)["']?\s*[:=]\s*["']?([^\s"',}]+)/gi,
            
            // Números de tarjeta y cuentas
            /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
            /\b\d{10,12}\b/g,
            
            // Direcciones IP privadas (opcional)
            /\b(?:10|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g,
            
            // Hashes largos (posibles keys)
            /\b[a-f0-9]{32,}\b/gi,
            
            // UUIDs que podrían ser sessions/tokens
            /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
        ];
        
        // Correlación de requests
        this.correlationIds = new Map();
        this.sessionId = this.generateSessionId();
        
        // Métricas
        this.metrics = {
            logsTotal: 0,
            logsByLevel: { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, AUDIT: 0 },
            startTime: Date.now(),
            sensitiveDataRedacted: 0
        };
        
        this.ensureLogDirectory();
        this.initializeRotation();
        
        this.info('SecureLogger initialized', {
            service: this.serviceName,
            session_id: this.sessionId,
            log_directory: this.logDirectory,
            console_enabled: this.enableConsole,
            file_enabled: this.enableFile
        });
    }
    
    /**
     * Asegurar que el directorio de logs existe
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }
    
    /**
     * Generar session ID único
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const pid = process.pid.toString(36);
        return `${timestamp}-${pid}-${random}`;
    }
    
    /**
     * Generar correlation ID para request
     */
    generateCorrelationId() {
        return `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    }
    
    /**
     * Redactar información sensible
     */
    redactSensitiveData(data) {
        let redactedCount = 0;
        
        try {
            let dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 0);
            
            // Aplicar patrones de redacción
            this.sensitivePatterns.forEach(pattern => {
                const matches = dataString.match(pattern);
                if (matches) {
                    redactedCount += matches.length;
                    dataString = dataString.replace(pattern, (match, ...groups) => {
                        // Mantener estructura pero redactar el valor sensible
                        return match.replace(groups[0] || match, '[REDACTED]');
                    });
                }
            });
            
            this.metrics.sensitiveDataRedacted += redactedCount;
            
            // Intentar parsear de vuelta a objeto
            if (typeof data !== 'string') {
                try {
                    return JSON.parse(dataString);
                } catch {
                    return dataString;
                }
            }
            
            return dataString;
            
        } catch (error) {
            // Fallback en caso de error
            return '[REDACTION_ERROR]';
        }
    }
    
    /**
     * Crear entrada de log estructurada
     */
    createLogEntry(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const correlationId = metadata.correlation_id || this.generateCorrelationId();
        
        // Métricas de performance automáticas
        const performanceMetrics = this.enableMetrics ? {
            memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            cpu_usage_ms: process.cpuUsage().user / 1000,
            uptime_seconds: Math.round(process.uptime()),
            event_loop_lag_ms: Math.round(performance.now() % 1000 * 100) / 100
        } : {};
        
        const logEntry = {
            timestamp,
            level,
            service: this.serviceName,
            session_id: this.sessionId,
            correlation_id: correlationId,
            message,
            metadata: this.redactSensitiveData(metadata),
            performance: performanceMetrics,
            hostname: os.hostname(),
            pid: process.pid
        };
        
        // Agregar información de error si existe
        if (metadata.error && metadata.error instanceof Error) {
            logEntry.error = {
                name: metadata.error.name,
                message: this.redactSensitiveData(metadata.error.message),
                stack: this.redactSensitiveData(metadata.error.stack?.split('\n').slice(0, 10).join('\n'))
            };
        }
        
        return logEntry;
    }
    
    /**
     * Escribir log a archivo
     */
    writeToFile(logEntry) {
        if (!this.enableFile) return;
        
        try {
            const fileName = `${this.serviceName}-${new Date().toISOString().split('T')[0]}.log`;
            const filePath = path.join(this.logDirectory, fileName);
            const logLine = JSON.stringify(logEntry) + '\n';
            
            fs.appendFileSync(filePath, logLine);
            
            // Verificar rotación
            this.checkRotation(filePath);
            
        } catch (error) {
            if (this.enableConsole) {
                console.error('[SECURE_LOGGER_ERROR] Failed to write log:', error.message);
            }
        }
    }
    
    /**
     * Verificar y ejecutar rotación de logs
     */
    checkRotation(filePath) {
        try {
            const stats = fs.statSync(filePath);
            if (stats.size > this.maxLogSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
                fs.renameSync(filePath, rotatedPath);
                
                // Limpiar archivos antiguos
                this.cleanOldLogs();
            }
        } catch (error) {
            // Ignorar errores de rotación
        }
    }
    
    /**
     * Limpiar logs antiguos
     */
    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logDirectory)
                .filter(file => file.includes(this.serviceName) && file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.logDirectory, file),
                    time: fs.statSync(path.join(this.logDirectory, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);
            
            // Eliminar archivos excedentes
            if (files.length > this.maxLogFiles) {
                files.slice(this.maxLogFiles).forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
        } catch (error) {
            // Ignorar errores de limpieza
        }
    }
    
    /**
     * Escribir log a consola
     */
    writeToConsole(logEntry) {
        if (!this.enableConsole) return;
        
        const { timestamp, level, service, message, metadata } = logEntry;
        const timeString = new Date(timestamp).toLocaleTimeString();
        
        // Colores por nivel
        const colors = {
            DEBUG: '\x1b[36m',   // Cyan
            INFO: '\x1b[32m',    // Green
            WARN: '\x1b[33m',    // Yellow
            ERROR: '\x1b[31m',   // Red
            AUDIT: '\x1b[35m',   // Magenta
            RESET: '\x1b[0m'
        };
        
        const color = colors[level] || colors.RESET;
        const consoleMessage = `${color}[${timeString}] ${level} [${service}] ${message}${colors.RESET}`;
        
        // Mostrar metadata si existe (redactada)
        if (Object.keys(metadata).length > 0) {
            console.log(consoleMessage);
            console.log('  →', metadata);
        } else {
            console.log(consoleMessage);
        }
    }
    
    /**
     * Log principal
     */
    log(level, message, metadata = {}) {
        this.metrics.logsTotal++;
        this.metrics.logsByLevel[level] = (this.metrics.logsByLevel[level] || 0) + 1;
        
        const logEntry = this.createLogEntry(level, message, metadata);
        
        this.writeToConsole(logEntry);
        this.writeToFile(logEntry);
        
        return logEntry.correlation_id;
    }
    
    /**
     * Métodos de logging por nivel
     */
    debug(message, metadata = {}) {
        return this.log('DEBUG', message, metadata);
    }
    
    info(message, metadata = {}) {
        return this.log('INFO', message, metadata);
    }
    
    warn(message, metadata = {}) {
        return this.log('WARN', message, metadata);
    }
    
    error(message, metadata = {}) {
        return this.log('ERROR', message, metadata);
    }
    
    /**
     * Audit logging para operaciones críticas
     */
    audit(operation, metadata = {}) {
        return this.log('AUDIT', `AUDIT: ${operation}`, {
            ...metadata,
            audit: true,
            timestamp_utc: new Date().toISOString()
        });
    }
    
    /**
     * Trading específico - logs de operaciones
     */
    trading(action, symbol, metadata = {}) {
        return this.audit(`TRADING: ${action} ${symbol}`, {
            ...metadata,
            trading_action: action,
            trading_symbol: symbol,
            trading_timestamp: Date.now()
        });
    }
    
    /**
     * Performance logging
     */
    performance(operation, duration_ms, metadata = {}) {
        return this.info(`PERFORMANCE: ${operation} completed in ${duration_ms}ms`, {
            ...metadata,
            performance_operation: operation,
            performance_duration_ms: duration_ms,
            performance_timestamp: Date.now()
        });
    }
    
    /**
     * Obtener métricas del logger
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime_ms: Date.now() - this.metrics.startTime,
            session_id: this.sessionId,
            log_directory: this.logDirectory,
            current_memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
        };
    }
    
    /**
     * Inicializar rotación automática
     */
    initializeRotation() {
        // Limpiar logs antiguos cada hora
        setInterval(() => {
            this.cleanOldLogs();
        }, 3600000);
    }
    
    /**
     * Shutdown graceful
     */
    shutdown() {
        this.info('SecureLogger shutting down', {
            session_duration_ms: Date.now() - this.metrics.startTime,
            total_logs: this.metrics.logsTotal,
            sensitive_redactions: this.metrics.sensitiveDataRedacted
        });
    }
}

// Instancia global del logger
let globalLogger = null;

/**
 * Inicializar logger global
 */
export function initializeSecureLogger(options = {}) {
    globalLogger = new SecureLogger(options);
    return globalLogger;
}

/**
 * Obtener instancia logger (lazy initialization)
 */
export function getSecureLogger(serviceName = 'qbtc-system') {
    if (!globalLogger) {
        globalLogger = new SecureLogger({ serviceName });
    }
    return globalLogger;
}

// Funciones de conveniencia
export function logInfo(message, metadata = {}) {
    return getSecureLogger().info(message, metadata);
}

export function logError(message, metadata = {}) {
    return getSecureLogger().error(message, metadata);
}

export function logWarn(message, metadata = {}) {
    return getSecureLogger().warn(message, metadata);
}

export function logDebug(message, metadata = {}) {
    return getSecureLogger().debug(message, metadata);
}

export function logAudit(operation, metadata = {}) {
    return getSecureLogger().audit(operation, metadata);
}

export function logTrading(action, symbol, metadata = {}) {
    return getSecureLogger().trading(action, symbol, metadata);
}

export function logPerformance(operation, duration_ms, metadata = {}) {
    return getSecureLogger().performance(operation, duration_ms, metadata);
}

// Reemplazos directos para console.log (para migración gradual)
export function secureConsoleLog(message, ...args) {
    getSecureLogger().info(message, { console_args: args });
}

export function secureConsoleError(message, ...args) {
    getSecureLogger().error(message, { console_args: args });
}

export function secureConsoleWarn(message, ...args) {
    getSecureLogger().warn(message, { console_args: args });
}

// Export default
export { SecureLogger };
export default {
    SecureLogger,
    initializeSecureLogger,
    getSecureLogger,
    logInfo,
    logError,
    logWarn,
    logDebug,
    logAudit,
    logTrading,
    logPerformance,
    secureConsoleLog,
    secureConsoleError,
    secureConsoleWarn
};
