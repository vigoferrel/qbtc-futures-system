import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Assessment, TrendingUp, Timeline } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { QBTCService } from '../services/qbtcService';

function AnalysisView({ isConnected }) {
  const [analysisData, setAnalysisData] = useState({});
  const [marketData, setMarketData] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (isConnected) {
      loadAnalysisData();
      setupRealTimeUpdates();
    }
  }, [isConnected]);

  const loadAnalysisData = async () => {
    try {
      const [analysis, market] = await Promise.all([
        QBTCService.getAnalysisResults(),
        QBTCService.getMarketData()
      ]);

      setAnalysisData(analysis);
      setMarketData(market.symbols || []);
      setPredictions(analysis.predictions || []);
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    QBTCService.on('market-data', (data) => {
      setMarketData(data.symbols || []);
    });

    QBTCService.on('signal-generated', (data) => {
      loadAnalysisData();
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getSignalColor = (signal) => {
    switch (signal.toUpperCase()) {
      case 'BUY': return 'success';
      case 'SELL': return 'error';
      default: return 'default';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength.toUpperCase()) {
      case 'STRONG': return 'success';
      case 'MODERATE': return 'warning';
      case 'WEAK': return 'error';
      default: return 'default';
    }
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Conectando al sistema de análisis...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        Vista de Análisis Cuántico
      </Typography>

      <Grid container spacing={3}>
        {/* Market Analysis Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Análisis de Mercado en Tiempo Real
            </Typography>
            <Box sx={{ height: 400 }}>
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
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#2196f3"
                    strokeWidth={1}
                    yAxisId="volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Trading Signals */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Señales de Trading
            </Typography>

            <List>
              {analysisData.signals?.map((signal, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{signal.symbol}</Typography>
                          <Chip
                            label={signal.signal}
                            color={getSignalColor(signal.signal)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Confianza: {(signal.confidence * 100).toFixed(1)}%
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={signal.strength}
                              color={getStrengthColor(signal.strength)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < (analysisData.signals?.length || 0) - 1 && <Divider />}
                </React.Fragment>
              )) || (
                <ListItem>
                  <ListItemText
                    primary="No hay señales activas"
                    secondary="El sistema está analizando el mercado..."
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Predictions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Predicciones Cuánticas
            </Typography>

            <Grid container spacing={2}>
              {predictions.map((prediction, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Timeline sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6">{prediction.symbol}</Typography>
                      </Box>

                      <Typography variant="h5" sx={{ color: 'secondary.main', mb: 1 }}>
                        {formatCurrency(prediction.prediction)}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Timeframe: {prediction.timeframe}
                        </Typography>
                        <Chip
                          label={`${(prediction.accuracy * 100).toFixed(1)}%`}
                          color={prediction.accuracy > 0.8 ? 'success' : prediction.accuracy > 0.6 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {predictions.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Generando predicciones cuánticas...
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalysisView;