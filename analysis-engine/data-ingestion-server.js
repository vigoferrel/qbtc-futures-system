// QBTC Data Ingestion Server
// Wrapper server for the BinanceDataIngestion class

import express from 'express';
import { BinanceDataIngestion } from './data-ingestion.js';

const app = express();
const PORT = process.env.QBTC_SERVICE_PORT || 14104;

app.use(express.json());

// Initialize data ingestion engine
const dataIngestion = new BinanceDataIngestion();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Binance Data Ingestion',
        port: PORT,
        timestamp: new Date().toISOString(),
        connectionStats: dataIngestion.getConnectionStats()
    });
});

// Get all market data
app.get('/market-data', async (req, res) => {
    try {
        const marketData = await dataIngestion.getAllMarketData();
        res.json({
            success: true,
            data: marketData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get real-time data for specific symbol
app.get('/realtime/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const data = dataIngestion.getRealTimeData(symbol);
    
    res.json({
        success: !!data,
        symbol: symbol,
        data: data,
        timestamp: new Date().toISOString()
    });
});

// Get historical data
app.get('/historical/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const interval = req.query.interval || '1h';
    const limit = parseInt(req.query.limit) || 100;
    
    try {
        const data = await dataIngestion.getHistoricalData(symbol, interval, limit);
        res.json({
            success: true,
            symbol: symbol,
            interval: interval,
            data: data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Start/stop real-time streams
app.post('/streams/start', async (req, res) => {
    try {
        await dataIngestion.startRealTimeStreams();
        res.json({
            success: true,
            message: 'Real-time streams started',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/streams/stop', (req, res) => {
    try {
        dataIngestion.disconnect();
        res.json({
            success: true,
            message: 'Real-time streams stopped',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        service: 'Binance Data Ingestion',
        status: 'running',
        port: PORT,
        uptime: process.uptime(),
        connectionStats: dataIngestion.getConnectionStats(),
        timestamp: new Date().toISOString()
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        service: 'QBTC Binance Data Ingestion',
        version: '1.0.0',
        port: PORT,
        endpoints: ['/health', '/market-data', '/realtime/:symbol', '/historical/:symbol', '/streams/start', '/streams/stop', '/status'],
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`[SATELLITE] Binance Data Ingestion server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Market data: http://localhost:${PORT}/market-data`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Graceful shutdown initiated...');
    dataIngestion.disconnect();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    dataIngestion.disconnect();
    process.exit(0);
});
