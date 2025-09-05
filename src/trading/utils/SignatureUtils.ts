/**
 * Utilidades para firma y autenticación con Binance API
 * Manejo seguro de HMAC-SHA256 y validación de parámetros
 */

import crypto from 'crypto';
import { ValidationError } from '../errors';

export class SignatureUtils {
  /**
   * Crear firma HMAC-SHA256 para Binance API
   * @param queryString - String de consulta ordenado
   * @param secretKey - Clave secreta de la API
   * @returns Firma hexadecimal
   */
  public static createSignature(queryString: string, secretKey: string): string {
    if (!queryString || !secretKey) {
      throw new ValidationError('Query string y secret key son requeridos');
    }

    try {
      return crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');
    } catch (error) {
      throw new ValidationError(`Error creando firma: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Construir string de consulta ordenado para firma
   * @param params - Parámetros de la consulta
   * @returns String de consulta ordenado
   */
  public static buildQueryString(params: Record<string, any>): string {
    if (!params || typeof params !== 'object') {
      throw new ValidationError('Parámetros inválidos para query string');
    }

    try {
      // Filtrar valores undefined/null y ordenar por clave
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .sort(([a], [b]) => a.localeCompare(b));

      return filteredParams
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
    } catch (error) {
      throw new ValidationError(`Error construyendo query string: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validar firma recibida
   * @param receivedSignature - Firma recibida
   * @param expectedSignature - Firma esperada
   * @returns true si la firma es válida
   */
  public static validateSignature(receivedSignature: string, expectedSignature: string): boolean {
    if (!receivedSignature || !expectedSignature) {
      return false;
    }

    // Comparación segura de strings
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generar timestamp para consultas
   * @returns Timestamp en milisegundos
   */
  public static generateTimestamp(): number {
    return Date.now();
  }

  /**
   * Construir parámetros completos para consulta autenticada
   * @param params - Parámetros base
   * @param recvWindow - Ventana de recepción (opcional)
   * @returns Parámetros con timestamp y firma
   */
  public static buildAuthenticatedParams(
    params: Record<string, any>,
    recvWindow: number = 5000
  ): Record<string, any> {
    const timestamp = this.generateTimestamp();
    
    return {
      ...params,
      timestamp,
      recvWindow,
    };
  }

  /**
   * Crear URL completa con parámetros autenticados
   * @param baseUrl - URL base
   * @param endpoint - Endpoint de la API
   * @param params - Parámetros
   * @param signature - Firma
   * @returns URL completa
   */
  public static buildAuthenticatedUrl(
    baseUrl: string,
    endpoint: string,
    params: Record<string, any>,
    signature: string
  ): string {
    const queryString = this.buildQueryString(params);
    const fullQuery = `${queryString}&signature=${signature}`;
    
    return `${baseUrl}${endpoint}?${fullQuery}`;
  }
}
