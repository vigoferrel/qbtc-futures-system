/**
 * Sistema de manejo de errores personalizado para QBTC Trading System
 * Jerarquía de errores con códigos específicos y contexto
 */

export class QBTCError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'QBTCError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();
    
    // Mantener stack trace en Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QBTCError);
    }
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

export class TradingError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'TRADING_ERROR', 400, context);
    this.name = 'TradingError';
  }
}

export class AuthenticationError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class ServiceError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SERVICE_ERROR', 503, context);
    this.name = 'ServiceError';
  }
}

export class NetworkError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 503, context);
    this.name = 'NetworkError';
  }
}

export class BalanceError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'BALANCE_ERROR', 400, context);
    this.name = 'BalanceError';
  }
}

export class OrderError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'ORDER_ERROR', 400, context);
    this.name = 'OrderError';
  }
}

export class PositionError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'POSITION_ERROR', 400, context);
    this.name = 'PositionError';
  }
}

export class ProxyError extends QBTCError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PROXY_ERROR', 503, context);
    this.name = 'ProxyError';
  }
}
