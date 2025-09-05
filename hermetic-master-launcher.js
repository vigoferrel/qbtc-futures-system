#!/usr/bin/env node

/**
 * [GALAXY] HERMETIC MASTER LAUNCHER
 * ===========================
 * Lanzador maestro del Sistema de Trading Hermético Integrado
 * 
 * Este script inicializa todos los sistemas en el orden correcto:
 * 1. Sistema de Logging Avanzado
 * 2. Sistema de Persistencia de Datos
 * 3. Servidor de Administración Web
 * 4. Trader Hermético con todos los subsistemas
 * 
 * Uso:
 * node hermetic-master-launcher.js [options]
 * 
 * Opciones:
 * --dev            Modo desarrollo (más logs, sin persistencia automática)
 * --no-server      No iniciar servidor web
 * --no-persistence No iniciar sistema de persistencia
 * --log-level      Nivel de logging (debug, info, warn, error)
 * --port           Puerto del servidor (defecto: 8888)
 */

import { program } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

// Imports del sistema hermético
import { getLogger } from './utils/hermetic-logger.js';
import HermeticDataPersistence from './data/hermetic-data-persistence.js';
import HermeticAdminServer from './server/hermetic-admin-server.js';
import HermeticAutoTrader from './trading/hermetic-auto-trader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HermeticMasterSystem {
    constructor(options = {}) {
        this.options = {
            dev: options.dev || false,
            enableServer: options.enableServer !== false,
            enablePersistence: options.enablePersistence !== false,
            logLevel: options.logLevel || (options.dev ? 'debug' : 'info'),
            serverPort: options.serverPort || 8888,
            autoStartTrading: options.autoStartTrading || false,
            ...options
        };
        
        // Componentes del sistema
        this.logger = null;
        this.dataPersistence = null;
        this.adminServer = null;
        this.hermeticTrader = null;
        
        // Estado del sistema
        this.systemState = {
            initialized: false,
            startTime: Date.now(),
            components: {
                logger: 'not_initialized',
                persistence: 'not_initialized',
                server: 'not_initialized',
                trader: 'not_initialized'
            }
        };
        
        // Manejo de señales para shutdown graceful
        this.setupSignalHandlers();
    }
    
    /**
     * Inicializar el sistema completo
     */
    async initialize() {
        try {
            console.log('[GALAXY] ========================================');
            console.log('[GALAXY] HERMETIC MASTER SYSTEM INITIALIZING');
            console.log('[GALAXY] ========================================');
            console.log(`[WRENCH] Mode: ${this.options.dev ? 'DEVELOPMENT' : 'PRODUCTION'}`);
            console.log(`[CHART] Log Level: ${this.options.logLevel.toUpperCase()}`);
            console.log(`[GLOBE] Server: ${this.options.enableServer ? 'ENABLED' : 'DISABLED'}`);
            console.log(`[FLOPPY_DISK] Persistence: ${this.options.enablePersistence ? 'ENABLED' : 'DISABLED'}`);
            console.log('[GALAXY] ========================================');
            
            // 1. Inicializar Logger
            await this.initializeLogger();
            
            // 2. Inicializar Persistencia de Datos
            if (this.options.enablePersistence) {
                await this.initializePersistence();
            }
            
            // 3. Inicializar Servidor de Administración
            if (this.options.enableServer) {
                await this.initializeServer();
            }
            
            // 4. Inicializar Trader Hermético
            await this.initializeTrader();
            
            // 5. Configurar integración entre componentes
            await this.setupIntegrations();
            
            this.systemState.initialized = true;
            this.logger.info('Hermetic Master System fully initialized', {
                initialization_time_ms: Date.now() - this.systemState.startTime,
                components: this.systemState.components,
                options: this.options
            });
            
            // Mostrar información de acceso
            this.displayAccessInfo();
            
            return true;
            
        } catch (error) {
            console.error('[X] Failed to initialize Hermetic Master System:', error);
            process.exit(1);
        }
    }
    
    /**
     * Inicializar sistema de logging
     */
    async initializeLogger() {
        console.log('[MEMO] Initializing Hermetic Logger...');
        
        this.logger = getLogger({
            logLevel: this.options.logLevel,
            enableConsole: true,
            enableFile: !this.options.dev, // En dev, solo consola
            logDirectory: path.join(__dirname, 'logs'),
            maxFileSize: 50 * 1024 * 1024, // 50MB
            maxFiles: this.options.dev ? 3 : 30
        });
        
        const initialized = await this.logger.initialize();
        
        if (initialized) {
            this.systemState.components.logger = 'initialized';
            this.logger.info('Hermetic Logger initialized successfully');
        } else {
            throw new Error('Failed to initialize logger');
        }
    }
    
    /**
     * Inicializar sistema de persistencia
     */
    async initializePersistence() {
        this.logger.info('[FLOPPY_DISK] Initializing Data Persistence System...');
        
        this.dataPersistence = new HermeticDataPersistence(
            path.join(__dirname, 'data', 'hermetic_storage')
        );
        
        const initialized = await this.dataPersistence.initialize();
        
        if (initialized) {
            this.systemState.components.persistence = 'initialized';
            this.logger.info('Data Persistence System initialized successfully');
        } else {
            throw new Error('Failed to initialize data persistence');
        }
    }
    
    /**
     * Inicializar servidor de administración
     */
    async initializeServer() {
        this.logger.info('[GLOBE] Initializing Admin Server...', {
            port: this.options.serverPort
        });
        
        this.adminServer = new HermeticAdminServer();
        this.adminServer.port = this.options.serverPort;
        
        await this.adminServer.start();
        
        this.systemState.components.server = 'initialized';
        this.logger.info('Admin Server initialized successfully');
    }
    
    /**
     * Inicializar trader hermético
     */
    async initializeTrader() {
        this.logger.info('[WIZARD] Initializing Hermetic Auto-Trader...');
        
        this.hermeticTrader = new HermeticAutoTrader();
        
        // Configurar el trader en el servidor si existe
        if (this.adminServer) {
            this.adminServer.hermeticTrader = this.hermeticTrader;
            this.adminServer.setupTraderEventListeners();
        }
        
        this.systemState.components.trader = 'initialized';
        this.logger.info('Hermetic Auto-Trader initialized successfully');
        
        // Auto-iniciar trading si está configurado
        if (this.options.autoStartTrading) {
            setTimeout(async () => {
                this.logger.info('[ROCKET] Auto-starting hermetic trading...');
                await this.hermeticTrader.startHermeticTrading();
            }, 5000); // Delay de 5 segundos
        }
    }
    
    /**
     * Configurar integración entre componentes
     */
    async setupIntegrations() {
        this.logger.info('[LINK] Setting up system integrations...');
        
        // Integrar logger con trader
        if (this.hermeticTrader) {
            this.setupTraderLogging();
        }
        
        // Integrar persistencia con trader
        if (this.hermeticTrader && this.dataPersistence) {
            this.setupTraderPersistence();
        }
        
        // Configurar contexto del logger
        this.updateLoggerContext();
        
        this.logger.info('System integrations configured successfully');
    }
    
    /**
     * Configurar logging del trader
     */
    setupTraderLogging() {
        // Event listeners para logging automático
        this.hermeticTrader.on('hermetic-trading-started', () => {
            this.logger.info('Hermetic trading system activated');
            this.updateLoggerContext();
        });
        
        this.hermeticTrader.on('hermetic-trading-stopped', () => {
            this.logger.info('Hermetic trading system stopped');
            this.updateLoggerContext();
        });
        
        this.hermeticTrader.on('hermetic-trade-executed', (trade) => {
            this.logger.logTrade('executed', {
                symbol: trade.symbol,
                direction: trade.direction,
                size: trade.size,
                type: trade.type,
                confidence: trade.confidence,
                dimensional_level: trade.dimensional_level
            });
        });
        
        this.hermeticTrader.on('hermetic-position-closed', (data) => {
            const { position, pnl, reason } = data;
            this.logger.logTrade('closed', {
                symbol: position.symbol,
                pnl: pnl,
                reason: reason,
                duration_minutes: (Date.now() - position.entry_time) / 60000
            });
        });
        
        this.hermeticTrader.on('merkaba-activated', () => {
            this.logger.logMerkabaEvent('activated', {
                consciousness_level: this.hermeticTrader.hermeticState.consciousness_level
            });
            this.updateLoggerContext();
        });
        
        this.hermeticTrader.on('hermetic-evolution', (data) => {
            this.logger.logConsciousnessEvolution(data);
            this.updateLoggerContext();
        });
        
        this.hermeticTrader.on('phoenix-rebirth', (rebirth) => {
            this.logger.logPhoenixRebirth(rebirth);
        });
        
        this.hermeticTrader.on('dimensional-ascension', (data) => {
            this.logger.logDimensionalAscension(data);
            this.updateLoggerContext();
        });
        
        this.hermeticTrader.on('transmutation-engine-activated', () => {
            this.logger.logTransmutation('engine_activated', {
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * Configurar persistencia del trader
     */
    setupTraderPersistence() {
        // Event listeners para persistencia automática
        this.hermeticTrader.on('hermetic-trade-executed', (trade) => {
            this.dataPersistence.saveTrade({
                ...trade,
                action: 'executed'
            }).catch(error => {
                this.logger.error('Failed to save trade data', { error: error.message });
            });
        });
        
        this.hermeticTrader.on('hermetic-position-closed', (data) => {
            const { position, pnl, reason } = data;
            this.dataPersistence.saveTrade({
                ...position,
                pnl,
                reason,
                action: 'closed',
                close_time: Date.now()
            }).catch(error => {
                this.logger.error('Failed to save trade close data', { error: error.message });
            });
        });
        
        this.hermeticTrader.on('hermetic-evolution', (data) => {
            this.dataPersistence.saveConsciousnessEvolution(data).catch(error => {
                this.logger.error('Failed to save consciousness evolution', { error: error.message });
            });
        });
        
        this.hermeticTrader.on('phoenix-rebirth', (rebirth) => {
            this.dataPersistence.savePhoenixRebirth(rebirth).catch(error => {
                this.logger.error('Failed to save phoenix rebirth', { error: error.message });
            });
        });
        
        this.hermeticTrader.on('dimensional-ascension', (data) => {
            this.dataPersistence.saveDimensionalAscension(data).catch(error => {
                this.logger.error('Failed to save dimensional ascension', { error: error.message });
            });
        });
        
        // Guardar performance periódicamente
        setInterval(() => {
            if (this.hermeticTrader && this.hermeticTrader.isTrading) {
                const performance = this.hermeticTrader.getHermeticPerformance();
                this.dataPersistence.savePerformanceData(performance).catch(error => {
                    this.logger.error('Failed to save performance data', { error: error.message });
                });
            }
        }, 300000); // Cada 5 minutos
    }
    
    /**
     * Actualizar contexto del logger
     */
    updateLoggerContext() {
        if (this.hermeticTrader && this.logger) {
            this.logger.updateSystemContext({
                consciousness_level: this.hermeticTrader.hermeticState.consciousness_level,
                merkaba_active: this.hermeticTrader.hermeticState.merkaba_active,
                dimensional_access: this.hermeticTrader.hermeticState.dimensional_access,
                alchemical_phase: this.hermeticTrader.hermeticState.alchemical_phase,
                trading_active: this.hermeticTrader.isTrading
            });
        }
    }
    
    /**
     * Mostrar información de acceso
     */
    displayAccessInfo() {
        console.log('\n[GALAXY] ========================================');
        console.log('[GALAXY] HERMETIC MASTER SYSTEM READY');
        console.log('[GALAXY] ========================================');
        
        if (this.adminServer) {
            console.log(`[GLOBE] Web Dashboard: http://localhost:${this.options.serverPort}`);
            console.log(`[SATELLITE] API Endpoint: http://localhost:${this.options.serverPort}/api`);
            console.log(`🔌 WebSocket: ws://localhost:${this.options.serverPort}`);
        }
        
        if (this.dataPersistence) {
            console.log(`[FLOPPY_DISK] Data Storage: ${this.dataPersistence.dataDir}`);
        }
        
        if (this.logger) {
            console.log(`[MEMO] Log Directory: ${this.logger.config.logDirectory}`);
        }
        
        console.log('\n[TARGET] Quick Start Commands:');
        console.log('   1. Open web dashboard to initialize trader');
        console.log('   2. Click "Initialize Trader" button');
        console.log('   3. Click "Start Trading" to begin automated trading');
        console.log('   4. Monitor real-time activity in dashboard');
        
        console.log('\n🛡️  System will shutdown gracefully on Ctrl+C');
        console.log('[GALAXY] ========================================\n');
    }
    
    /**
     * Configurar manejo de señales
     */
    setupSignalHandlers() {
        const handleShutdown = async (signal) => {
            console.log(`\n🌑 Received ${signal}, shutting down Hermetic Master System...`);
            await this.shutdown();
            process.exit(0);
        };
        
        process.on('SIGINT', handleShutdown);
        process.on('SIGTERM', handleShutdown);
        process.on('SIGQUIT', handleShutdown);
    }
    
    /**
     * Shutdown graceful del sistema
     */
    async shutdown() {
        if (this.logger) {
            this.logger.info('Hermetic Master System shutting down...');
        }
        
        try {
            // Parar trader si está activo
            if (this.hermeticTrader && this.hermeticTrader.isTrading) {
                this.hermeticTrader.stopHermeticTrading();
                if (this.logger) this.logger.info('Hermetic trader stopped');
            }
            
            // Parar servidor
            if (this.adminServer) {
                await this.adminServer.stop();
                if (this.logger) this.logger.info('Admin server stopped');
            }
            
            // Cerrar persistencia
            if (this.dataPersistence) {
                await this.dataPersistence.close();
                if (this.logger) this.logger.info('Data persistence closed');
            }
            
            // Cerrar logger (último)
            if (this.logger) {
                this.logger.info('Hermetic Master System shutdown complete');
                await this.logger.close();
            }
            
            console.log('🌑 Hermetic Master System shutdown complete');
            
        } catch (error) {
            console.error('[X] Error during shutdown:', error);
        }
    }
    
    /**
     * Obtener estado del sistema
     */
    getSystemStatus() {
        const status = {
            initialized: this.systemState.initialized,
            uptime: Date.now() - this.systemState.startTime,
            components: this.systemState.components,
            options: this.options
        };
        
        if (this.hermeticTrader) {
            status.trader_state = {
                is_trading: this.hermeticTrader.isTrading,
                consciousness_level: this.hermeticTrader.hermeticState.consciousness_level,
                merkaba_active: this.hermeticTrader.hermeticState.merkaba_active,
                current_positions: this.hermeticTrader.hermeticState.current_positions.size
            };
        }
        
        return status;
    }
}

// Configurar CLI
program
    .name('hermetic-master-launcher')
    .description('Lanzador maestro del Sistema de Trading Hermético Integrado')
    .version('1.0.0')
    .option('--dev', 'Modo desarrollo (más logs, sin persistencia automática)')
    .option('--no-server', 'No iniciar servidor web')
    .option('--no-persistence', 'No iniciar sistema de persistencia')
    .option('--log-level <level>', 'Nivel de logging (debug, info, warn, error)', 'info')
    .option('--port <port>', 'Puerto del servidor web', '8888')
    .option('--auto-start', 'Auto-iniciar trading después de la inicialización');

// Función principal
async function main() {
    program.parse(process.argv);
    const options = program.opts();
    
    // Configurar opciones
    const systemOptions = {
        dev: options.dev,
        enableServer: !options.noServer,
        enablePersistence: !options.noPersistence,
        logLevel: options.logLevel,
        serverPort: parseInt(options.port),
        autoStartTrading: options.autoStart
    };
    
    // Crear e inicializar sistema
    const masterSystem = new HermeticMasterSystem(systemOptions);
    await masterSystem.initialize();
    
    // Mantener el proceso activo
    process.stdin.resume();
}

// Ejecutar si se llama directamente
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
    main().catch(error => {
        console.error('[X] Hermetic Master System failed to start:', error);
        process.exit(1);
    });
}

export default HermeticMasterSystem;
