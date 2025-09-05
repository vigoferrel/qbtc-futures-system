import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { TrendingUp, TrendingDown, Add } from '@mui/icons-material';

import { QBTCService } from '../services/qbtcService';

function TradingView({ isConnected }) {
  const [positions, setPositions] = useState([]);
  const [tradingData, setTradingData] = useState({});

  useEffect(() => {
    if (isConnected) {
      loadTradingData();
      setupRealTimeUpdates();
    }
  }, [isConnected]);

  const loadTradingData = async () => {
    try {
      const [positionsData, tradingStats] = await Promise.all([
        QBTCService.getPositions(),
        QBTCService.getTradingData()
      ]);

      setPositions(positionsData);
      setTradingData(tradingStats);
    } catch (error) {
      console.error('Error loading trading data:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    QBTCService.on('trade-executed', () => {
      loadTradingData();
    });

    QBTCService.on('position-updated', () => {
      loadTradingData();
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
        <Typography variant="h6" color="text.secondary">
          Conectando al sistema de trading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          Vista de Trading
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ bgcolor: 'primary.main' }}
        >
          Nueva Operación
        </Button>
      </Box>

      {/* Trading Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">P&L Total</Typography>
              <Typography variant="h4" sx={{
                color: (tradingData.totalPnL || 0) >= 0 ? 'success.main' : 'error.main'
              }}>
                {formatCurrency(tradingData.totalPnL || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Win Rate</Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {tradingData.winRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Trades Activos</Typography>
              <Typography variant="h4" sx={{ color: 'secondary.main' }}>
                {tradingData.activeTrades || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Volumen Diario</Typography>
              <Typography variant="h4" sx={{ color: 'info.main' }}>
                {formatCurrency(tradingData.dailyVolume || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Positions Table */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
          Posiciones Activas
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Símbolo</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Lado</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Tamaño</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Precio Entrada</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Precio Actual</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>P&L</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((position, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {position.symbol}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={position.side}
                      color={position.side === 'LONG' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {position.size}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {formatCurrency(position.entry)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {formatCurrency(position.current)}
                  </TableCell>
                  <TableCell sx={{
                    color: (position.current - position.entry) >= 0 ? 'success.main' : 'error.main'
                  }}>
                    {formatCurrency((position.current - position.entry) * position.size)}
                  </TableCell>
                  <TableCell>
                    <Chip label="ACTIVA" color="primary" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {positions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay posiciones activas
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default TradingView;