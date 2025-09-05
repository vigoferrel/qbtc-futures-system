/**
 * Servicio de proxy para QBTC Trading System
 * Manejo de conexiones VPN y proxy con fallback automático
 */

import { EventEmitter } from 'events';
import { ProxyError, NetworkError } from '../errors';
import { ProxyConfig, SmartProxyConfig, NetworkRequest, NetworkResponse } from '../types';

export class ProxyService extends EventEmitter {
  private config: ProxyConfig | SmartProxyConfig;
  private isConnected: boolean = false;
  private currentIP: string | null = null;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: ProxyConfig | SmartProxyConfig) {
    super();
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validar configuración del proxy
   * @private
   */
  private validateConfig(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Proxy deshabilitado, usando conexión directa');
      return;
    }

    if (this.config.type === 'http' || this.config.type === 'https') {
      if (!this.config.host || !this.config.port) {
        throw new ProxyError('Host y puerto son requeridos para proxy HTTP/HTTPS');
      }
    }

    if (this.config.type === 'socks5') {
      if (!this.config.host || !this.config.port) {
        throw new ProxyError('Host y puerto son requeridos para proxy SOCKS5');
      }
    }
  }

  /**
   * Conectar al proxy
   * @returns true si la conexión es exitosa
   */
  public async connect(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('ℹ️ Proxy deshabilitado, saltando conexión');
      return true;
    }

    try {
      console.log(`🔗 Conectando al proxy ${this.config.type}://${this.config.host}:${this.config.port}...`);

      // Simular conexión al proxy (en implementación real usar librerías específicas)
      await this.testProxyConnection();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      this.currentIP = await this.getCurrentIP();
      
      console.log(`✅ Proxy conectado exitosamente. IP actual: ${this.currentIP}`);
      
      this.startHealthMonitoring();
      this.emit('proxy-connected', { 
        type: this.config.type,
        host: this.config.host,
        port: this.config.port,
        ip: this.currentIP,
        timestamp: new Date()
      });

      return true;

    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;
      
      console.error(`❌ Error conectando al proxy: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      this.emit('proxy-connection-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: this.connectionAttempts,
        timestamp: new Date()
      });

      // Intentar reconexión automática si es smart proxy
      if (this.isSmartProxy() && this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 Reintentando conexión en 5 segundos... (${this.connectionAttempts}/${this.maxRetries})`);
        setTimeout(() => this.connect(), 5000);
      }

      return false;
    }
  }

  /**
   * Desconectar del proxy
   */
  public disconnect(): void {
    if (!this.isConnected) {
      return;
    }

    console.log('🔌 Desconectando del proxy...');
    
    this.isConnected = false;
    this.currentIP = null;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.emit('proxy-disconnected', { timestamp: new Date() });
  }

  /**
   * Hacer request a través del proxy
   * @param request - Request a realizar
   * @returns Respuesta del request
   */
  public async makeRequest(request: NetworkRequest): Promise<NetworkResponse> {
    if (!this.config.enabled || !this.isConnected) {
      // Fallback a conexión directa
      return this.makeDirectRequest(request);
    }

    try {
      console.log(`🌐 Request vía proxy: ${request.method} ${request.url}`);
      
      // En implementación real, usar el proxy configurado
      const response = await this.makeProxiedRequest(request);
      
      this.emit('request-success', {
        url: request.url,
        method: request.method,
        status: response.status,
        timestamp: new Date()
      });

      return response;

    } catch (error) {
      console.warn(`⚠️ Request vía proxy falló, usando fallback directo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      this.emit('proxy-request-failed', {
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      // Fallback a conexión directa
      return this.makeDirectRequest(request);
    }
  }

  /**
   * Obtener IP actual
   * @returns IP actual o null si no se puede obtener
   */
  public async getCurrentIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.ip;
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ No se pudo obtener IP actual:', error);
      return null;
    }
  }

  /**
   * Verificar si el proxy está conectado
   * @returns true si está conectado
   */
  public isProxyConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Obtener estado del proxy
   */
  public getProxyStatus(): {
    enabled: boolean;
    connected: boolean;
    type: string;
    host?: string;
    port?: number;
    currentIP: string | null;
    connectionAttempts: number;
  } {
    return {
      enabled: this.config.enabled,
      connected: this.isConnected,
      type: this.config.type,
      host: this.config.host,
      port: this.config.port,
      currentIP: this.currentIP,
      connectionAttempts: this.connectionAttempts
    };
  }

  /**
   * Verificar si es un smart proxy
   * @private
   */
  private isSmartProxy(): boolean {
    return 'autoRotate' in this.config;
  }

  /**
   * Probar conexión al proxy
   * @private
   */
  private async testProxyConnection(): Promise<void> {
    // Simular test de conexión
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En implementación real, hacer ping al proxy
    if (Math.random() < 0.1) { // 10% de falla para testing
      throw new ProxyError('Test de conexión falló');
    }
  }

  /**
   * Iniciar monitoreo de salud del proxy
   * @private
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Verificar salud cada 30 segundos
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkProxyHealth();
      } catch (error) {
        console.warn('⚠️ Proxy health check falló:', error);
        this.isConnected = false;
        this.emit('proxy-health-check-failed', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }, 30000);
  }

  /**
   * Verificar salud del proxy
   * @private
   */
  private async checkProxyHealth(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const testRequest: NetworkRequest = {
        method: 'GET',
        url: 'https://httpbin.org/ip',
        timeout: 5000
      };

      await this.makeProxiedRequest(testRequest);
      
    } catch (error) {
      throw new ProxyError('Health check falló');
    }
  }

  /**
   * Hacer request a través del proxy
   * @private
   */
  private async makeProxiedRequest(request: NetworkRequest): Promise<NetworkResponse> {
    // En implementación real, usar librerías como https-proxy-agent
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.data ? JSON.stringify(request.data) : undefined,
      signal: AbortSignal.timeout(request.timeout || 10000)
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: Date.now()
    };
  }

  /**
   * Hacer request directo (fallback)
   * @private
   */
  private async makeDirectRequest(request: NetworkRequest): Promise<NetworkResponse> {
    console.log(`🌐 Request directo: ${request.method} ${request.url}`);
    
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.data ? JSON.stringify(request.data) : undefined,
      signal: AbortSignal.timeout(request.timeout || 10000)
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: Date.now()
    };
  }

  /**
   * Destruir servicio
   */
  public destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}
