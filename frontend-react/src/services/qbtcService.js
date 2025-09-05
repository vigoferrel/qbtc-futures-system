import axios from 'axios';
import io from 'socket.io-client';

class QBTCService {
  constructor() {
    this.apiGatewayUrl = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:14001';
    this.messageBusUrl = process.env.REACT_APP_MESSAGE_BUS_URL || 'http://localhost:14000';
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();

    // Configure axios
    this.api = axios.create({
      baseURL: this.apiGatewayUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // ========== CONNECTION MANAGEMENT ==========

  async connect() {
    try {
      console.log('🔗 Connecting to QBTC Integration System...');

      // Test API Gateway connection
      await this.testConnection();

      // Connect WebSocket for real-time updates
      await this.connectWebSocket();

      this.isConnected = true;
      console.log('✅ Connected to QBTC Integration System');

    } catch (error) {
      console.error('❌ Connection failed:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      // If health endpoint doesn't exist, try a simple ping
      const response = await this.api.get('/');
      return response.data;
    }
  }

  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.messageBusUrl, {
          transports: ['websocket', 'polling'],
          timeout: 5000,
        });

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('🔌 WebSocket connection error:', error);
          reject(error);
        });

        // Set up event listeners
        this.setupWebSocketListeners();

      } catch (error) {
        reject(error);
      }
    });
  }

  setupWebSocketListeners() {
    if (!this.socket) return;

    // Listen for system events
    this.socket.on('orchestrator-status', (data) => {
      this.emit('system-status', data);
    });

    this.socket.on('component-registered', (data) => {
      this.emit('component-registered', data);
    });

    this.socket.on('component-unregistered', (data) => {
      this.emit('component-unregistered', data);
    });

    // Listen for trading events
    this.socket.on('trade-executed', (data) => {
      this.emit('trade-executed', data);
    });

    this.socket.on('position-updated', (data) => {
      this.emit('position-updated', data);
    });

    // Listen for analysis events
    this.socket.on('market-data', (data) => {
      this.emit('market-data', data);
    });

    this.socket.on('signal-generated', (data) => {
      this.emit('signal-generated', data);
    });
  }

  // ========== SYSTEM STATUS ==========

  async getSystemStatus() {
    try {
      const response = await this.api.get('/system/status');
      return response.data;
    } catch (error) {
      // Fallback to direct orchestrator status
      console.warn('API Gateway status failed, using fallback');
      return {
        status: this.isConnected ? 'ready' : 'error',
        timestamp: Date.now(),
        metrics: {
          orchestrator: {
            componentsIntegrated: 0,
            messagesProcessed: 0
          }
        }
      };
    }
  }

  async getHealthStatus() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // ========== TRADING OPERATIONS ==========

  async getTradingData() {
    try {
      const response = await this.api.get('/api/trading/status');
      return response.data;
    } catch (error) {
      console.warn('Trading data fetch failed:', error);
      return this.getMockTradingData();
    }
  }

  async executeTrade(tradeData) {
    try {
      const response = await this.api.post('/api/trading/execute', tradeData);
      return response.data;
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  async getPositions() {
    try {
      const response = await this.api.get('/api/trading/positions');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // ========== ANALYSIS OPERATIONS ==========

  async getMarketData(symbols = []) {
    try {
      const symbolsParam = symbols.length > 0 ? `?symbols=${symbols.join(',')}` : '';
      const response = await this.api.get(`/api/analysis/market-data${symbolsParam}`);
      return response.data;
    } catch (error) {
      console.warn('Market data fetch failed:', error);
      return this.getMockMarketData();
    }
  }

  async getAnalysisResults() {
    try {
      const response = await this.api.get('/api/analysis/results');
      return response.data;
    } catch (error) {
      return this.getMockAnalysisResults();
    }
  }

  // ========== COMPONENT MANAGEMENT ==========

  async getComponents() {
    try {
      const response = await this.api.get('/system/components');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getComponentStatus(componentId) {
    try {
      const response = await this.api.get(`/system/components/${componentId}`);
      return response.data;
    } catch (error) {
      return { status: 'unknown' };
    }
  }

  // ========== EVENT MANAGEMENT ==========

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ========== MOCK DATA FOR DEVELOPMENT ==========

  getMockTradingData() {
    return {
      activeTrades: 3,
      totalPnL: 1250.75,
      winRate: 68.5,
      dailyVolume: 45000,
      positions: [
        { symbol: 'BTCUSDT', side: 'LONG', size: 0.5, entry: 45000, current: 45250 },
        { symbol: 'ETHUSDT', side: 'SHORT', size: 5, entry: 2800, current: 2750 },
      ]
    };
  }

  getMockMarketData() {
    return {
      timestamp: Date.now(),
      symbols: [
        { symbol: 'BTCUSDT', price: 45250, change: 2.5, volume: 1250000 },
        { symbol: 'ETHUSDT', price: 2750, change: -1.2, volume: 850000 },
        { symbol: 'BNBUSDT', price: 320, change: 0.8, volume: 450000 },
      ]
    };
  }

  getMockAnalysisResults() {
    return {
      signals: [
        { symbol: 'BTCUSDT', signal: 'BUY', confidence: 0.85, strength: 'STRONG' },
        { symbol: 'ETHUSDT', signal: 'SELL', confidence: 0.72, strength: 'MODERATE' },
      ],
      predictions: [
        { symbol: 'BTCUSDT', prediction: 46500, timeframe: '4h', accuracy: 0.78 },
        { symbol: 'ETHUSDT', prediction: 2650, timeframe: '4h', accuracy: 0.82 },
      ]
    };
  }

  // ========== CLEANUP ==========

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }
}

// Export singleton instance
const qbtcServiceInstance = new QBTCService();
export { qbtcServiceInstance as QBTCService };