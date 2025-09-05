/**
 * Servicio de autenticación para QBTC Trading System
 * Manejo seguro de credenciales y validación de acceso
 */

import { EventEmitter } from 'events';
import { AuthenticationError, ValidationError } from '../errors';
import { TradingConfig, AuthenticationResult } from '../types';
import { SignatureUtils } from '../utils/SignatureUtils';

export class AuthenticationService extends EventEmitter {
  private config: TradingConfig;
  private isAuthenticated: boolean = false;
  private lastAuthCheck: Date | null = null;
  private authCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: TradingConfig) {
    super();
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validar configuración de autenticación
   * @private
   */
  private validateConfig(): void {
    if (!this.config.apiKey || typeof this.config.apiKey !== 'string') {
      throw new ValidationError('API Key es requerida y debe ser string');
    }

    if (!this.config.secretKey || typeof this.config.secretKey !== 'string') {
      throw new ValidationError('Secret Key es requerida y debe ser string');
    }

    if (this.config.apiKey.length < 10) {
      throw new ValidationError('API Key debe tener al menos 10 caracteres');
    }

    if (this.config.secretKey.length < 10) {
      throw new ValidationError('Secret Key debe tener al menos 10 caracteres');
    }

    // Validar formato de API Key (debe ser hexadecimal)
    if (!/^[A-Fa-f0-9]+$/.test(this.config.apiKey)) {
      throw new ValidationError('API Key debe ser hexadecimal válido');
    }
  }

  /**
   * Autenticar con Binance API
   * @returns Resultado de autenticación
   */
  public async authenticate(): Promise<AuthenticationResult> {
    try {
      console.log('🔐 Autenticando con Binance API...');

      // Crear parámetros de autenticación
      const params = SignatureUtils.buildAuthenticatedParams({}, this.config.recvWindow || 5000);
      const queryString = SignatureUtils.buildQueryString(params);
      const signature = SignatureUtils.createSignature(queryString, this.config.secretKey);

      // Construir URL de autenticación
      const authUrl = SignatureUtils.buildAuthenticatedUrl(
        this.config.baseUrl,
        '/fapi/v2/account',
        params,
        signature
      );

      // Hacer request de autenticación
      const response = await this.makeAuthenticatedRequest(authUrl);
      
      if (response && response.feeTier !== undefined) {
        this.isAuthenticated = true;
        this.lastAuthCheck = new Date();
        this.startAuthMonitoring();
        
        console.log('✅ Autenticación exitosa con Binance API');
        this.emit('authentication-success', { timestamp: new Date() });
        
        return {
          success: true,
          user: {
            id: this.config.apiKey.substring(0, 8),
            username: `user_${this.config.apiKey.substring(0, 8)}`,
            permissions: ['trading', 'balance', 'positions']
          }
        };
      } else {
        throw new AuthenticationError('Respuesta de autenticación inválida');
      }

    } catch (error) {
      this.isAuthenticated = false;
      console.error('❌ Error de autenticación:', error);
      
      this.emit('authentication-error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de autenticación'
      };
    }
  }

  /**
   * Verificar estado de autenticación
   * @returns true si está autenticado
   */
  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Obtener configuración de autenticación
   * @returns Configuración (sin secret key)
   */
  public getAuthConfig(): Omit<TradingConfig, 'secretKey'> {
    const { secretKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Obtener secret key de forma segura
   * @returns Secret key o null si no está disponible
   */
  public getSecretKey(): string | null {
    return this.isAuthenticated ? this.config.secretKey : null;
  }

  /**
   * Hacer request autenticado
   * @param url - URL completa con parámetros
   * @returns Respuesta de la API
   */
  private async makeAuthenticatedRequest(url: string): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.config.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'QBTC-Trading-System/1.0'
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new AuthenticationError(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('Timeout en request de autenticación');
      }
      throw error;
    }
  }

  /**
   * Iniciar monitoreo de autenticación
   * @private
   */
  private startAuthMonitoring(): void {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }

    // Verificar autenticación cada 5 minutos
    this.authCheckInterval = setInterval(async () => {
      try {
        await this.validateCurrentAuth();
      } catch (error) {
        console.warn('⚠️ Validación de autenticación falló:', error);
        this.isAuthenticated = false;
        this.emit('authentication-expired', { timestamp: new Date() });
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Validar autenticación actual
   * @private
   */
  private async validateCurrentAuth(): Promise<void> {
    if (!this.isAuthenticated) {
      return;
    }

    try {
      const params = SignatureUtils.buildAuthenticatedParams({}, this.config.recvWindow || 5000);
      const queryString = SignatureUtils.buildQueryString(params);
      const signature = SignatureUtils.createSignature(queryString, this.config.secretKey);
      
      const authUrl = SignatureUtils.buildAuthenticatedUrl(
        this.config.baseUrl,
        '/fapi/v2/account',
        params,
        signature
      );

      await this.makeAuthenticatedRequest(authUrl);
      this.lastAuthCheck = new Date();
      
    } catch (error) {
      this.isAuthenticated = false;
      throw new AuthenticationError('Autenticación expirada o inválida');
    }
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    this.isAuthenticated = false;
    this.lastAuthCheck = null;
    
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
      this.authCheckInterval = null;
    }

    console.log('🔓 Sesión cerrada');
    this.emit('logout', { timestamp: new Date() });
  }

  /**
   * Obtener estado de autenticación
   */
  public getAuthStatus(): {
    isAuthenticated: boolean;
    lastCheck: Date | null;
    config: Omit<TradingConfig, 'secretKey'>;
  } {
    return {
      isAuthenticated: this.isAuthenticated,
      lastCheck: this.lastAuthCheck,
      config: this.getAuthConfig()
    };
  }

  /**
   * Destruir servicio
   */
  public destroy(): void {
    this.logout();
    this.removeAllListeners();
  }
}
