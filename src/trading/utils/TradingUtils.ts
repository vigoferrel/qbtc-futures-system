/**
 * Utilidades para cálculos de trading y validaciones
 * Funciones matemáticas y lógicas para el sistema de trading
 */

import { ValidationError, TradingError } from '../errors';
import { OrderRequest, Position, Balance } from '../types';

export class TradingUtils {
  /**
   * Validar parámetros de orden
   * @param orderRequest - Solicitud de orden
   * @returns Resultado de validación
   */
  public static validateOrderRequest(orderRequest: OrderRequest): boolean {
    if (!orderRequest.symbol || typeof orderRequest.symbol !== 'string') {
      throw new ValidationError('Símbolo de trading es requerido y debe ser string');
    }

    if (!orderRequest.side || !['BUY', 'SELL'].includes(orderRequest.side)) {
      throw new ValidationError('Lado de la orden debe ser BUY o SELL');
    }

    if (!orderRequest.type || !['LIMIT', 'MARKET', 'STOP', 'STOP_MARKET'].includes(orderRequest.type)) {
      throw new ValidationError('Tipo de orden inválido');
    }

    if (!orderRequest.quantity || parseFloat(orderRequest.quantity) <= 0) {
      throw new ValidationError('Cantidad debe ser mayor a 0');
    }

    // Validar precio para órdenes LIMIT
    if (orderRequest.type === 'LIMIT' && (!orderRequest.price || parseFloat(orderRequest.price) <= 0)) {
      throw new ValidationError('Precio es requerido para órdenes LIMIT');
    }

    // Validar stopPrice para órdenes STOP
    if (['STOP', 'STOP_MARKET'].includes(orderRequest.type) && !orderRequest.stopPrice) {
      throw new ValidationError('Stop price es requerido para órdenes STOP');
    }

    return true;
  }

  /**
   * Calcular PnL no realizado de una posición
   * @param position - Posición actual
   * @param currentPrice - Precio actual del mercado
   * @returns PnL no realizado
   */
  public static calculateUnrealizedPnl(position: Position, currentPrice: number): number {
    const entryPrice = parseFloat(position.entryPrice);
    const size = parseFloat(position.size);
    const markPrice = parseFloat(position.markPrice);

    if (position.side === 'LONG') {
      return (currentPrice - entryPrice) * size;
    } else {
      return (entryPrice - currentPrice) * size;
    }
  }

  /**
   * Calcular margen requerido para una posición
   * @param position - Posición
   * @param leverage - Apalancamiento
   * @returns Margen requerido
   */
  public static calculateRequiredMargin(position: Position, leverage: number): number {
    const size = parseFloat(position.size);
    const markPrice = parseFloat(position.markPrice);
    
    return (size * markPrice) / leverage;
  }

  /**
   * Calcular precio de liquidación
   * @param position - Posición
   * @param leverage - Apalancamiento
   * @param marginBalance - Balance de margen
   * @returns Precio de liquidación
   */
  public static calculateLiquidationPrice(
    position: Position,
    leverage: number,
    marginBalance: number
  ): number {
    const size = parseFloat(position.size);
    const entryPrice = parseFloat(position.entryPrice);
    
    if (position.side === 'LONG') {
      return entryPrice - (marginBalance / size);
    } else {
      return entryPrice + (marginBalance / size);
    }
  }

  /**
   * Validar si hay suficiente balance para una orden
   * @param balance - Balance disponible
   * @param requiredAmount - Cantidad requerida
   * @param asset - Activo
   * @returns true si hay suficiente balance
   */
  public static hasSufficientBalance(balance: Balance, requiredAmount: number, asset: string): boolean {
    if (balance.asset !== asset) {
      return false;
    }

    const freeBalance = parseFloat(balance.free);
    return freeBalance >= requiredAmount;
  }

  /**
   * Calcular tamaño de posición basado en riesgo
   * @param accountBalance - Balance de la cuenta
   * @param riskPercentage - Porcentaje de riesgo (0-100)
   * @param entryPrice - Precio de entrada
   * @param stopLossPrice - Precio de stop loss
   * @returns Tamaño de posición
   */
  public static calculatePositionSizeByRisk(
    accountBalance: number,
    riskPercentage: number,
    entryPrice: number,
    stopLossPrice: number
  ): number {
    if (riskPercentage <= 0 || riskPercentage > 100) {
      throw new ValidationError('Porcentaje de riesgo debe estar entre 0 y 100');
    }

    if (entryPrice <= 0 || stopLossPrice <= 0) {
      throw new ValidationError('Precios deben ser mayores a 0');
    }

    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceDifference = Math.abs(entryPrice - stopLossPrice);
    
    if (priceDifference === 0) {
      throw new TradingError('Precio de entrada y stop loss no pueden ser iguales');
    }

    return riskAmount / priceDifference;
  }

  /**
   * Redondear cantidad según precisión del símbolo
   * @param quantity - Cantidad a redondear
   * @param precision - Precisión del símbolo
   * @returns Cantidad redondeada
   */
  public static roundQuantity(quantity: number, precision: number): string {
    if (precision < 0) {
      throw new ValidationError('Precisión debe ser mayor o igual a 0');
    }

    const multiplier = Math.pow(10, precision);
    const rounded = Math.floor(quantity * multiplier) / multiplier;
    
    return rounded.toFixed(precision);
  }

  /**
   * Calcular ratio de Sharpe
   * @param returns - Array de retornos
   * @param riskFreeRate - Tasa libre de riesgo (opcional)
   * @returns Ratio de Sharpe
   */
  public static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
    if (returns.length < 2) {
      return 0;
    }

    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return 0;
    }

    return (meanReturn - riskFreeRate) / stdDev;
  }

  /**
   * Calcular drawdown máximo
   * @param equity - Array de valores de equity
   * @returns Drawdown máximo como porcentaje
   */
  public static calculateMaxDrawdown(equity: number[]): number {
    if (equity.length < 2) {
      return 0;
    }

    let maxDrawdown = 0;
    let peak = equity[0];

    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      } else {
        const drawdown = (peak - equity[i]) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    return maxDrawdown * 100; // Retornar como porcentaje
  }

  /**
   * Validar símbolo de trading
   * @param symbol - Símbolo a validar
   * @returns true si el símbolo es válido
   */
  public static isValidSymbol(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string') {
      return false;
    }

    // Patrón básico para símbolos de futuros
    const symbolPattern = /^[A-Z0-9]+USDT$/;
    return symbolPattern.test(symbol);
  }
}
