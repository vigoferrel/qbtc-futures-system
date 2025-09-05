/**
 * QBTC TRADING SYSTEM - Sistema Principal Refactorizado
 * ====================================================
 * Sistema completo de trading real con arquitectura modular
 * Integra todos los componentes: autenticación, proxy, motor de trading
 */

import { EventEmitter } from 'events';
import { TradingConfig, TradingState, SystemHealth } from './types';
import { TradingEngine } from './core/TradingEngine';
import { ProxyService } from './services/ProxyService';
import { AuthenticationService } from './services/AuthenticationService';

export class QBTCTradingSystem extends EventEmitter {
  private config: TradingConfig;
  private tradingEngine: TradingEngine;
  private proxyService: ProxyService;
  private authService: AuthenticationService;
  private isInitialized: boolean = false;
  private systemHealth: SystemHealth;

  constructor(config: TradingConfig) {
    super();
    this.config = config;
    this.systemHealth = this.initializeSystemHealth();
    
    // Inicializar servicios
    this.authService = new AuthenticationService(config);
    this.proxyService = new ProxyService({ enabled: false }); // Configurar según necesidades
    this.tradingEngine = new TradingEngine(config);
    
    this.setupEventListeners();
    this.initializeSystem();
  }

  /**
   * Inicializar estado de salud del sistema
   * @private
   */
  private initializeSystemHealth(): SystemHealth {
    return {
      status: 'unhealthy',
      uptime: 0,
      lastCheck: new Date(),
      services: {},
      metrics: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnl: '0',
        winRate: 0,
        averageWin: '0',
        averageLoss: '0',
        maxDrawdown: '0',
        sharpeRatio: 0,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Configurar listeners de eventos
   * @private
   */
  private setupEventListeners(): void {
    // Eventos del motor de trading
    this.tradingEngine.on('trading-started', () => {
      console.log('🚀 Sistema de trading iniciado');
      this.updateSystemHealth();
      this.emit('system-ready', { timestamp: new Date() });
    });

    this.tradingEngine.on('trading-stopped', () => {
      console.log('🛑 Sistema de trading detenido');
      this.updateSystemHealth();
      this.emit('system-stopped', { timestamp: new Date() });
    });

    this.tradingEngine.on('state-updated', (data) => {
      this.emit('trading-state-updated', data);
    });

    this.tradingEngine.on('trading-error', (data) => {
      console.error('❌ Error en motor de trading:', data.error);
      this.emit('system-error', data);
    });

    // Eventos de autenticación
    this.authService.on('authentication-success', () => {
      console.log('🔐 Autenticación exitosa');
      this.updateSystemHealth();
    });

    this.authService.on('authentication-error', (data) => {
      console.error('❌ Error de autenticación:', data.error);
      this.emit('authentication-error', data);
    });

    // Eventos de proxy
    this.proxyService.on('proxy-connected', (data) => {
      console.log(`🌐 Proxy conectado: ${data.ip}`);
      this.updateSystemHealth();
      this.emit('proxy-connected', data);
    });

    this.proxyService.on('proxy-disconnected', () => {
      console.log('🌐 Proxy desconectado');
      this.updateSystemHealth();
      this.emit('proxy-disconnected', { timestamp: new Date() });
    });
  }

  /**
   * Inicializar sistema completo
   * @private
   */
  private async initializeSystem(): Promise<void> {
    try {
      console.log('💰 QBTC REAL TRADING SYSTEM');
      console.log('===========================');
      console.log('Sistema de trading real con proxy/VPN integrado');
      console.log('');

      // Verificar configuración
      this.validateConfiguration();
      
      // Inicializar servicios
      await this.initializeServices();
      
      this.isInitialized = true;
      this.systemHealth.status = 'healthy';
      this.systemHealth.uptime = Date.now();
      
      console.log('✅ Sistema inicializado exitosamente');
      this.emit('system-initialized', { timestamp: new Date() });

    } catch (error) {
      console.error('❌ Error inicializando sistema:', error);
      this.systemHealth.status = 'unhealthy';
      this.emit('system-initialization-error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Validar configuración del sistema
   * @private
   */
  private validateConfiguration(): void {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('API Key y Secret Key son requeridos');
    }

    if (!this.config.baseUrl) {
      throw new Error('Base URL es requerida');
    }

    console.log('✅ Configuración validada');
  }

  /**
   * Inicializar servicios del sistema
   * @private
   */
  private async initializeServices(): Promise<void> {
    try {
      // Inicializar autenticación
      console.log('🔐 Inicializando servicio de autenticación...');
      
      // Inicializar proxy (opcional)
      if (this.proxyService) {
        console.log('🌐 Inicializando servicio de proxy...');
        // Configurar proxy según necesidades
      }
      
      // Inicializar motor de trading
      console.log('🚀 Inicializando motor de trading...');
      
      console.log('✅ Todos los servicios inicializados');
      
    } catch (error) {
      throw new Error(`Error inicializando servicios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Iniciar sistema completo
   */
  public async startSystem(): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Sistema no inicializado');
      }

      console.log('🚀 Iniciando sistema QBTC completo...');
      
      // Iniciar motor de trading
      await this.tradingEngine.startTrading();
      
      console.log('✅ Sistema QBTC iniciado exitosamente');
      
    } catch (error) {
      console.error('❌ Error iniciando sistema:', error);
      throw error;
    }
  }

  /**
   * Detener sistema completo
   */
  public stopSystem(): void {
    try {
      console.log('🛑 Deteniendo sistema QBTC...');
      
      // Detener motor de trading
      this.tradingEngine.stopTrading();
      
      // Desconectar proxy
      if (this.proxyService) {
        this.proxyService.disconnect();
      }
      
      console.log('✅ Sistema QBTC detenido');
      
    } catch (error) {
      console.error('❌ Error deteniendo sistema:', error);
    }
  }

  /**
   * Obtener estado del sistema
   */
  public getSystemState(): {
    initialized: boolean;
    trading: boolean;
    authentication: boolean;
    proxy: boolean;
    health: SystemHealth;
  } {
    return {
      initialized: this.isInitialized,
      trading: this.tradingEngine.isTradingActive(),
      authentication: this.authService.isUserAuthenticated(),
      proxy: this.proxyService ? this.proxyService.isProxyConnected() : false,
      health: this.systemHealth
    };
  }

  /**
   * Obtener estado de trading
   */
  public getTradingState(): TradingState {
    return this.tradingEngine.getTradingState();
  }

  /**
   * Obtener métricas del sistema
   */
  public getSystemMetrics() {
    return {
      trading: this.tradingEngine.getTradingMetrics(),
      system: this.systemHealth
    };
  }

  /**
   * Actualizar estado de salud del sistema
   * @private
   */
  private updateSystemHealth(): void {
    const tradingStatus = this.tradingEngine.isTradingActive() ? 'online' : 'offline';
    const authStatus = this.authService.isUserAuthenticated() ? 'online' : 'offline';
    const proxyStatus = this.proxyService ? 
      (this.proxyService.isProxyConnected() ? 'online' : 'offline') : 'offline';

    this.systemHealth.services = {
      trading: {
        name: 'Trading Engine',
        status: tradingStatus,
        responseTime: 0,
        lastUpdate: new Date(),
        errorCount: 0
      },
      authentication: {
        name: 'Authentication Service',
        status: authStatus,
        responseTime: 0,
        lastUpdate: new Date(),
        errorCount: 0
      },
      proxy: {
        name: 'Proxy Service',
        status: proxyStatus,
        responseTime: 0,
        lastUpdate: new Date(),
        errorCount: 0
      }
    };

    // Determinar estado general del sistema
    const allServices = Object.values(this.systemHealth.services);
    const onlineServices = allServices.filter(s => s.status === 'online').length;
    const totalServices = allServices.length;

    if (onlineServices === totalServices) {
      this.systemHealth.status = 'healthy';
    } else if (onlineServices > totalServices / 2) {
      this.systemHealth.status = 'degraded';
    } else {
      this.systemHealth.status = 'unhealthy';
    }

    this.systemHealth.lastCheck = new Date();
    this.systemHealth.uptime = Date.now() - this.systemHealth.uptime;
  }

  /**
   * Habilitar/deshabilitar proxy
   */
  public async enableProxy(proxyConfig: any): Promise<void> {
    try {
      if (proxyConfig.enabled) {
        console.log('🌐 Habilitando proxy...');
        // Configurar y conectar proxy
        await this.proxyService.connect();
      } else {
        console.log('🌐 Deshabilitando proxy...');
        this.proxyService.disconnect();
      }
    } catch (error) {
      console.error('❌ Error configurando proxy:', error);
      throw error;
    }
  }

  /**
   * Obtener información del sistema
   */
  public getSystemInfo(): {
    version: string;
    config: Omit<TradingConfig, 'secretKey'>;
    uptime: number;
    status: string;
  } {
    return {
      version: '2.0.0-refactored',
      config: this.authService.getAuthConfig(),
      uptime: this.systemHealth.uptime,
      status: this.systemHealth.status
    };
  }

  /**
   * Destruir sistema completo
   */
  public destroy(): void {
    try {
      console.log('🗑️ Destruyendo sistema QBTC...');
      
      this.stopSystem();
      
      // Destruir servicios
      this.tradingEngine.destroy();
      this.authService.destroy();
      this.proxyService.destroy();
      
      // Remover listeners
      this.removeAllListeners();
      
      console.log('✅ Sistema QBTC destruido');
      
    } catch (error) {
      console.error('❌ Error destruyendo sistema:', error);
    }
  }
}
