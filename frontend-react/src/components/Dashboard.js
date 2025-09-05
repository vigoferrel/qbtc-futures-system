import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { QBTCService } from '../services/qbtcService';

const COLORS = ['#00ff88', '#ff4081', '#2196f3', '#ff9800'];

function Dashboard({ metrics, isConnected }) {
  const [marketData, setMarketData] = useState([]);
  const [tradingData, setTradingData] = useState({});
  const [analysisData, setAnalysisData] = useState({});
  const [systemHealth, setSystemHealth] = useState({});

  useEffect(() => {
    if (isConnected) {
      loadDashboardData();
      setupRealTimeUpdates();
    }
  }, [isConnected]);

  const loadDashboardData = async () => {
    try {
      // Load market data
      const market = await QBTCService.getMarketData();
      setMarketData(market.symbols || []);

      // Load trading data
      const trading = await QBTCService.getTradingData();
      setTradingData(trading);

      // Load analysis data
      const analysis = await QBTCService.getAnalysisResults();
      setAnalysisData(analysis);

      // Load system health
      const health = await QBTCService.getHealthStatus();
      setSystemHealth(health);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    // Listen for real-time market data
    QBTCService.on('market-data', (data) => {
      setMarketData(data.symbols || []);
    });

    // Listen for trading updates
    QBTCService.on('trade-executed', (data) => {
      loadDashboardData(); // Reload trading data
    });

    // Listen for analysis updates
    QBTCService.on('signal-generated', (data) => {
      loadDashboardData(); // Reload analysis data
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Conectando al sistema QBTC Quantum...
        </Alert>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        QBTC Quantum Dashboard
      </Typography>

      {/* System Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Estado del Sistema</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                Operativo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Componentes Integrados: {metrics.orchestrator?.componentsIntegrated || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Mensajes Procesados</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {metrics.orchestrator?.messagesProcessed || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En tiempo real
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6">Tiempo de Actividad</Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'secondary.main' }}>
                {Math.floor((metrics.orchestrator?.uptime || 0) / 1000 / 60)}m
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema estable
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Market Data */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Datos de Mercado en Tiempo Real
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="symbol" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#00ff88"
                    strokeWidth={2}
                    dot={{ fill: '#00ff88' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Trading and Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Estado de Trading
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                P&L Total
              </Typography>
              <Typography variant="h5" sx={{
                color: (tradingData.totalPnL || 0) >= 0 ? 'success.main' : 'error.main'
              }}>
                {formatCurrency(tradingData.totalPnL || 0)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Win Rate
              </Typography>
              <Typography variant="h5" sx={{ color: 'primary.main' }}>
                {tradingData.winRate || 0}%
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Trades Activos
              </Typography>
              <Typography variant="h5" sx={{ color: 'secondary.main' }}>
                {tradingData.activeTrades || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Señales de Análisis
            </Typography>

            {analysisData.signals?.map((signal, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #333', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{signal.symbol}</Typography>
                  <Chip
                    label={signal.signal}
                    color={signal.signal === 'BUY' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Confianza: {(signal.confidence * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fuerza: {signal.strength}
                  </Typography>
                </Box>
              </Box>
            )) || (
              <Typography variant="body2" color="text.secondary">
                No hay señales activas
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;