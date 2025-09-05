/**
 * Tipos y interfaces TypeScript para QBTC Trading System
 * Definiciones centralizadas de todas las estructuras de datos
 */

export interface TradingConfig {
  apiKey: string;
  secretKey: string;
  testnet: boolean;
  baseUrl: string;
  recvWindow?: number;
  timeout?: number;
}

export interface TradingState {
  active: boolean;
  balance: Balance | null;
  positions: Position[];
  orders: Order[];
  lastUpdate: number;
  status: 'idle' | 'active' | 'paused' | 'error';
}

export interface Balance {
  asset: string;
  free: string;
  locked: string;
  total: string;
  timestamp: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  liquidationPrice: string;
  leverage: string;
  marginType: 'isolated' | 'cross';
  timestamp: number;
}

export interface Order {
  symbol: string;
  orderId: number;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET';
  quantity: string;
  price: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'REJECTED';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  timestamp: number;
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_MARKET';
  quantity: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  stopPrice?: string;
  reduceOnly?: boolean;
}

export interface ProxyConfig {
  enabled: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks5';
}

export interface SmartProxyConfig extends ProxyConfig {
  autoRotate: boolean;
  rotationInterval: number;
  maxFailures: number;
  healthCheckUrl: string;
}

export interface TradingMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: string;
  winRate: number;
  averageWin: string;
  averageLoss: string;
  maxDrawdown: string;
  sharpeRatio: number;
  timestamp: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  services: Record<string, ServiceStatus>;
  metrics: TradingMetrics;
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  lastUpdate: Date;
  errorCount: number;
}

export interface NetworkRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface NetworkResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timestamp: number;
}

export interface AuthenticationResult {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  user?: {
    id: string;
    username: string;
    permissions: string[];
  };
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

export interface EventData {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

export interface ConfigurationUpdate {
  key: string;
  value: any;
  timestamp: Date;
  source: string;
}
