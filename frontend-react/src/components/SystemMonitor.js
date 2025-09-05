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
  ListItemIcon,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Memory,
  Storage,
  NetworkCheck,
  Settings,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';

import { QBTCService } from '../services/qbtcService';

function SystemMonitor({ metrics }) {
  const [components, setComponents] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      const [componentsData, healthData] = await Promise.all([
        QBTCService.getComponents(),
        QBTCService.getHealthStatus()
      ]);

      setComponents(componentsData);
      setSystemHealth(healthData);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading system data:', error);
      setIsConnected(false);
    }
  };

  const getComponentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ready': return 'success';
      case 'initializing':
      case 'connecting': return 'warning';
      case 'error':
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getComponentStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ready': return <CheckCircle color="success" />;
      case 'initializing':
      case 'connecting': return <Warning color="warning" />;
      case 'error':
      case 'inactive': return <Error color="error" />;
      default: return <Settings />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
        Monitor del Sistema QBTC
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No se puede conectar al sistema de monitoreo
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* System Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Estado General del Sistema
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Estado del Sistema
              </Typography>
              <Chip
                label={systemHealth.status || 'Desconocido'}
                color={getComponentStatusColor(systemHealth.status)}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Componentes Registrados
              </Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                {components.length}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tiempo de Actividad
              </Typography>
              <Typography variant="h5" sx={{ color: 'secondary.main' }}>
                {formatUptime(metrics.orchestrator?.uptime || 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Métricas de Rendimiento
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Mensajes Procesados
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main' }}>
                  {metrics.orchestrator?.messagesProcessed || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((metrics.orchestrator?.messagesProcessed || 0) / 1000 * 100, 100)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Componentes Activos
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  {components.filter(c => c.status === 'active').length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={components.length > 0 ? (components.filter(c => c.status === 'active').length / components.length) * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
                color="success"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Memoria del Sistema
                </Typography>
                <Typography variant="body2" sx={{ color: 'info.main' }}>
                  {formatBytes(process.memoryUsage().heapUsed)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100, 100)}
                sx={{ height: 8, borderRadius: 4 }}
                color="info"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Component List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Componentes del Sistema
            </Typography>

            <List>
              {components.map((component, index) => (
                <ListItem key={index} sx={{ border: '1px solid #333', borderRadius: 1, mb: 1 }}>
                  <ListItemIcon>
                    {getComponentStatusIcon(component.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{component.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={component.type}
                            size="small"
                            variant="outlined"
                            sx={{ color: 'primary.main' }}
                          />
                          <Chip
                            label={component.status}
                            color={getComponentStatusColor(component.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          ID: {component.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Versión: {component.version} | Último ping: {new Date(component.lastHeartbeat || Date.now()).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}

              {components.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Settings sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay componentes registrados
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Los componentes se registrarán automáticamente cuando se conecten
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SystemMonitor;