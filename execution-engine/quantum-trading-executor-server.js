#!/usr/bin/env node

/**
 * [GLOBE] QUANTUM TRADING EXECUTOR HTTP SERVER
 * ======================================
 * Wrapper HTTP para el Quantum Trading Executor
 */

import express from 'express';
import cors from 'cors';
import QuantumTradingExecutor from './quantum-trading-executor.js';

const app = express();
const PORT = 14207;

app.use(cors());
app.use(express.json());

// Instancia del executor
const executor = new QuantumTradingExecutor({
    max_concurrent_trades: 10,
    max_portfolio_risk: 0.15,
    dimensional_trading_enabled: true,
    merkaba_auto_activation: true
});

class QuantumTradingExecutorServer {
    constructor() {
        this.setupRoutes();
        console.log('[LIGHTNING] Quantum Trading Executor HTTP Server initialized');
    }

    setupRoutes() {
        // Health check
        app.get('/health', (req, res) => {
            res.json({
                status: 'operational',
                service: 'Quantum Trading Executor',
                port: PORT,
                version: '1.0.0',
                quantum_coherence: executor.state.quantum_coherence,
                consciousness_level: executor.state.consciousness_level,
                merkaba_active: executor.state.merkaba_active,
                dimensional_access: executor.state.dimensional_access,
                active_trades: executor.state.active_trades.size,
                timestamp: new Date().toISOString()
            });
        });

        // Get executor state
        app.get('/state', (req, res) => {
            try {
                const state = executor.getExecutorState();
                res.json({
                    success: true,
                    data: state
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Scan for opportunities
        app.post('/scan-opportunities', async (req, res) => {
            try {
                const marketData = req.body.market_data || {};
                const opportunities = await executor.scanForOpportunities(marketData);
                res.json({
                    success: true,
                    data: opportunities
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Execute trade
        app.post('/execute-trade', async (req, res) => {
            try {
                const opportunity = req.body.opportunity;
                const marketData = req.body.market_data || {};
                
                if (!opportunity) {
                    return res.status(400).json({
                        success: false,
                        error: 'Opportunity data required'
                    });
                }

                const result = await executor.executeTrade(opportunity, marketData);
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get active trades
        app.get('/trades/active', (req, res) => {
            try {
                const activeTrades = Array.from(executor.state.active_trades.values());
                res.json({
                    success: true,
                    data: activeTrades,
                    count: activeTrades.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get trade history
        app.get('/trades/history', (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 50;
                const history = executor.state.trade_history.slice(-limit);
                res.json({
                    success: true,
                    data: history,
                    count: history.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Close trade
        app.post('/trades/:tradeId/close', async (req, res) => {
            try {
                const tradeId = req.params.tradeId;
                const currentPrice = req.body.current_price;
                
                const result = await executor.closeTrade(tradeId, currentPrice);
                res.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Perform system analysis
        app.post('/analyze', async (req, res) => {
            try {
                const marketData = req.body.market_data || {};
                const analysis = await executor.performSystemAnalysis(marketData);
                res.json({
                    success: true,
                    data: analysis
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Root endpoint
        app.get('/', (req, res) => {
            res.json({
                service: 'Quantum Trading Executor HTTP Server',
                version: '1.0.0',
                description: 'HTTP wrapper for the Quantum Trading Executor engine',
                quantum_status: {
                    consciousness_level: executor.state.consciousness_level,
                    quantum_coherence: executor.state.quantum_coherence,
                    merkaba_active: executor.state.merkaba_active,
                    dimensional_access: executor.state.dimensional_access
                },
                trading_status: {
                    active_trades: executor.state.active_trades.size,
                    total_trades: executor.state.total_trades,
                    success_rate: executor.state.success_rate,
                    current_risk: executor.state.current_risk_exposure
                },
                endpoints: {
                    '/health': 'Health check',
                    '/state': 'Get executor state',
                    '/scan-opportunities': 'POST - Scan for trading opportunities',
                    '/execute-trade': 'POST - Execute a trade',
                    '/trades/active': 'Get active trades',
                    '/trades/history': 'Get trade history',
                    '/trades/:id/close': 'POST - Close a trade',
                    '/analyze': 'POST - Perform system analysis'
                }
            });
        });
    }
}

// Crear e inicializar server
const server = new QuantumTradingExecutorServer();

app.listen(PORT, () => {
    console.log('[LIGHTNING] ============================================');
    console.log('[ROCKET] QUANTUM TRADING EXECUTOR SERVER ACTIVE');
    console.log('============================================');
    console.log(`[SATELLITE] Server running on port ${PORT}`);
    console.log(`[CRYSTAL_BALL] Health check: http://localhost:${PORT}/health`);
    console.log(`[CHART] State: http://localhost:${PORT}/state`);
    console.log(`[LIGHTNING] Execute: http://localhost:${PORT}/execute-trade`);
    console.log('============================================');
    console.log(`[GALAXY] Quantum Coherence: ${executor.state.quantum_coherence.toFixed(3)}`);
    console.log(`[BRAIN] Consciousness: ${(executor.state.consciousness_level * 100).toFixed(1)}%`);
    console.log(`[CRYSTAL_BALL] Merkaba: ${executor.state.merkaba_active ? 'ACTIVE' : 'DORMANT'}`);
    console.log(`📏 Dimensional Access: ${executor.state.dimensional_access}D`);
    console.log('============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[STOP] Shutting down Quantum Trading Executor Server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[STOP] Shutting down Quantum Trading Executor Server...');
    process.exit(0);
});

export default server;
