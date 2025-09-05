/**
 * Motor principal de trading para QBTC Trading System
 * Coordinación central de todas las operaciones de trading
 */

import { EventEmitter } from 'events';
import { TradingError, ValidationError, BalanceError } from '../errors';
import { 
  TradingConfig, 
  TradingState, 
  OrderRequest, 
  Order, 
  Position, 
  Balance,
  TradingMetrics 
} from '../types';
import { TradingUtils } from '../utils/TradingUtils';
import { AuthenticationService } from '../services/AuthenticationService';
import { ProxyService } from '../services/ProxyService';

export class TradingEngine extends EventEmitter {
  private config: TradingConfig;
  private state: TradingState;
  private authService: AuthenticationService;
  private proxyService: ProxyService;
  private isActive: boolean = false;
  private metrics: TradingMetrics;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: TradingConfig) {
    super();
    this.config = config;
    this.state = this.initializeTradingState();
    this.metrics = this.initializeMetrics();
    
    this.authService = new AuthenticationService(config);
    this.proxyService = new ProxyService({ enabled: false }); // Proxy deshabilitado por defecto
    
    this.setupEventListeners();
  }

  /**
   * Inicializar estado de trading
   * @private
   */
  private initializeTradingState(): TradingState {
    return {
      active: false,
      balance: null,
      positions: [],
      orders: [],
      lastUpdate: Date.now(),
      status: 'idle'
    };
  }

  /**
   * Inicializar métricas de trading
   * @private
   */
  private initializeMetrics(): TradingMetrics {
    return {
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
    };
  }

  /**
   * Configurar listeners de eventos
   * @private
   */
  private setupEventListeners(): void {
    this.authService.on('authentication-success', () => {
      console.log('🔐 Autenticación exitosa, iniciando motor de trading...');
      this.startTrading();
    });

    this.authService.on('authentication-error', (data) => {
      console.error('❌ Error de autenticación:', data.error);
      this.stopTrading();
      this.emit('trading-error', { 
        type: 'authentication',
        error: data.error,
        timestamp: data.timestamp
      });
    });

    this.proxyService.on('proxy-connected', (data) => {
      console.log(`🌐 Proxy conectado: ${data.ip}`);
      this.emit('proxy-status-changed', { connected: true, ip: data.ip });
    });

    this.proxyService.on('proxy-disconnected', () => {
      console.log('🌐 Proxy desconectado');
      this.emit('proxy-status-changed', { connected: false, ip: null });
    });
  }

  /**
   * Iniciar sistema de trading
   */
  public async startTrading(): Promise<void> {
    try {
      if (this.isActive) {
        console.log('ℹ️ Motor de trading ya está activo');
        return;
      }

      console.log('🚀 Iniciando motor de trading...');

      // Autenticar primero
      const authResult = await this.authService.authenticate();
      if (!authResult.success) {
        throw new TradingError('Autenticación falló al iniciar trading');
      }

      // Conectar proxy si está habilitado
      if (this.proxyService) {
        await this.proxyService.connect();
      }

      // Inicializar estado
      await this.initializeTradingState();
      
      this.isActive = true;
      this.state.status = 'active';
      this.startUpdateInterval();
      
      console.log('✅ Motor de trading iniciado exitosamente');
      this.emit('trading-started', { timestamp: new Date() });

    } catch (error) {
      console.error('❌ Error iniciando motor de trading:', error);
      this.stopTrading();
      throw error;
    }
  }

  /**
   * Detener sistema de trading
   */
  public stopTrading(): void {
    if (!this.isActive) {
      return;
    }

    console.log('🛑 Deteniendo motor de trading...');
    
    this.isActive = false;
    this.state.status = 'paused';
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.emit('trading-stopped', { timestamp: new Date() });
    console.log('✅ Motor de trading detenido');
  }

  /**
   * Inicializar estado de trading
   * @private
   */
  private async initializeTradingState(): Promise<void> {
    try {
      // Obtener balance inicial
      await this.updateBalance();
      
      // Obtener posiciones abiertas
      await this.updatePositions();
      
      // Obtener órdenes activas
      await this.updateOrders();
      
      this.state.lastUpdate = Date.now();
      
    } catch (error) {
      console.error('⚠️ Error inicializando estado de trading:', error);
      // Continuar sin fallar completamente
    }
  }

  /**
   * Iniciar intervalo de actualización
   * @private
   */
  private startUpdateInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Actualizar cada 10 segundos
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateTradingState();
      } catch (error) {
        console.error('⚠️ Error en actualización automática:', error);
      }
    }, 10000);
  }

  /**
   * Actualizar estado completo de trading
   * @private
   */
  private async updateTradingState(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      await Promise.all([
        this.updateBalance(),
        this.updatePositions(),
        this.updateOrders()
      ]);

      this.state.lastUpdate = Date.now();
      this.updateMetrics();
      
      this.emit('state-updated', { 
        state: this.state,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Error actualizando estado de trading:', error);
      this.emit('update-error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Actualizar balance de la cuenta
   * @private
   */
  private async updateBalance(): Promise<void> {
    try {
      // En implementación real, hacer request a Binance API
      const balanceData = await this.makeAuthenticatedRequest('/fapi/v2/balance');
      
      if (balanceData && Array.isArray(balanceData)) {
        // Encontrar balance USDT
        const usdtBalance = balanceData.find((b: any) => b.asset === 'USDT');
        if (usdtBalance) {
          this.state.balance = {
            asset: usdtBalance.asset,
            free: usdtBalance.free,
            locked: usdtBalance.locked,
            total: usdtBalance.total,
            timestamp: Date.now()
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando balance:', error);
    }
  }

  /**
   * Actualizar posiciones abiertas
   * @private
   */
  private async updatePositions(): Promise<void> {
    try {
      const positionsData = await this.makeAuthenticatedRequest('/fapi/v2/positionRisk');
      
      if (positionsData && Array.isArray(positionsData)) {
        this.state.positions = positionsData
          .filter((p: any) => parseFloat(p.positionAmt) !== 0)
          .map((p: any) => ({
            symbol: p.symbol,
            side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
            size: Math.abs(parseFloat(p.positionAmt)).toString(),
            entryPrice: p.entryPrice,
            markPrice: p.markPrice,
            unrealizedPnl: p.unRealizedProfit,
            liquidationPrice: p.liquidationPrice,
            leverage: p.leverage,
            marginType: p.marginType,
            timestamp: Date.now()
          }));
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando posiciones:', error);
    }
  }

  /**
   * Actualizar órdenes activas
   * @private
   */
  private async updateOrders(): Promise<void> {
    try {
      const ordersData = await this.makeAuthenticatedRequest('/fapi/v2/openOrder');
      
      if (ordersData && Array.isArray(ordersData)) {
        this.state.orders = ordersData.map((o: any) => ({
          symbol: o.symbol,
          orderId: o.orderId,
          side: o.side,
          type: o.type,
          quantity: o.origQty,
          price: o.price,
          status: o.status,
          timeInForce: o.timeInForce,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando órdenes:', error);
    }
  }

  /**
   * Actualizar métricas de trading
   * @private
   */
  private updateMetrics(): void {
    // Calcular métricas básicas
    const totalPositions = this.state.positions.length;
    const totalOrders = this.state.orders.length;
    
    // En implementación real, calcular métricas más complejas
    this.metrics.totalTrades = totalPositions + totalOrders;
    this.metrics.timestamp = Date.now();
  }

  /**
   * Hacer request autenticado
   * @private
   */
  private async makeAuthenticatedRequest(endpoint: string): Promise<any> {
    if (!this.authService.isUserAuthenticated()) {
      throw new TradingError('No autenticado para hacer requests');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const request = {
      method: 'GET' as const,
      url,
      headers: {
        'X-MBX-APIKEY': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: this.config.timeout || 10000
    };

    if (this.proxyService && this.proxyService.isProxyConnected()) {
      const response = await this.proxyService.makeRequest(request);
      return response.data;
    } else {
      // Fallback directo
      const response = await fetch(url, {
        method: 'GET',
        headers: request.headers,
        signal: AbortSignal.timeout(request.timeout)
      });

      if (!response.ok) {
        throw new TradingError(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    }
  }

  /**
   * Obtener estado actual del trading
   */
  public getTradingState(): TradingState {
    return { ...this.state };
  }

  /**
   * Obtener métricas de trading
   */
  public getTradingMetrics(): TradingMetrics {
    return { ...this.metrics };
  }

  /**
   * Verificar si el motor está activo
   */
  public isTradingActive(): boolean {
    return this.isActive;
  }

  /**
   * Obtener estado del sistema
   */
  public getSystemStatus(): {
    trading: boolean;
    authentication: boolean;
    proxy: boolean;
    lastUpdate: number;
  } {
    return {
      trading: this.isActive,
      authentication: this.authService.isUserAuthenticated(),
      proxy: this.proxyService ? this.proxyService.isProxyConnected() : false,
      lastUpdate: this.state.lastUpdate
    };
  }

  /**
   * Destruir motor de trading
   */
  public destroy(): void {
    this.stopTrading();
    this.authService.destroy();
    this.proxyService.destroy();
    this.removeAllListeners();
  }
}
