import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Settings,
  Timeline
} from '@mui/icons-material';

// Components
import Dashboard from './components/Dashboard';
import TradingView from './components/TradingView';
import AnalysisView from './components/AnalysisView';
import SystemMonitor from './components/SystemMonitor';

// Services
import { QBTCService } from './services/qbtcService';

function App() {
  const [systemStatus, setSystemStatus] = useState('connecting');
  const [metrics, setMetrics] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize connection to QBTC backend
    const initializeConnection = async () => {
      try {
        setSystemStatus('connecting');

        // Connect to integration orchestrator
        await QBTCService.connect();

        // Get initial system status
        const status = await QBTCService.getSystemStatus();
        setSystemStatus(status.status);
        setMetrics(status.metrics);
        setIsConnected(true);

        console.log('✅ Connected to QBTC Integration System');

      } catch (error) {
        console.error('❌ Connection failed:', error);
        setSystemStatus('error');
        setIsConnected(false);
      }
    };

    initializeConnection();

    // Set up real-time updates
    const statusInterval = setInterval(async () => {
      if (isConnected) {
        try {
          const status = await QBTCService.getSystemStatus();
          setSystemStatus(status.status);
          setMetrics(status.metrics);
        } catch (error) {
          console.warn('Status update failed:', error);
        }
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, [isConnected]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'success';
      case 'connecting': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready': return 'Sistema Operativo';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Error de Conexión';
      default: return 'Desconocido';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main' }}>
            QBTC Quantum Trading System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getStatusText(systemStatus)}
              color={getStatusColor(systemStatus)}
              size="small"
              variant="outlined"
            />

            {systemStatus === 'connecting' && (
              <LinearProgress sx={{ width: 100, height: 4 }} />
            )}

            <Typography variant="body2" color="text.secondary">
              Componentes: {metrics.orchestrator?.componentsIntegrated || 0}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard metrics={metrics} isConnected={isConnected} />} />
          <Route path="/trading" element={<TradingView isConnected={isConnected} />} />
          <Route path="/analysis" element={<AnalysisView isConnected={isConnected} />} />
          <Route path="/system" element={<SystemMonitor metrics={metrics} />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;