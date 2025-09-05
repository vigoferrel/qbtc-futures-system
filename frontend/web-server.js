#!/usr/bin/env node

/**
 * [GLOBE] QBTC Frontend Web Server
 * ============================
 * 
 * Servidor web para servir todas las interfaces frontend del ecosistema QBTC.
 * Proporciona acceso a múltiples dashboards y herramientas de visualización.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes para servir las diferentes interfaces
const interfaces = {
    'qbtc-unified': 'qbtc-unified-dashboard.html',
    'quantum-complete': 'quantum-complete.html',
    'quantum-dashboard': 'quantum-dashboard-ultimate.html',
    'leonardo': 'leonardo-dashboard.html',
    'multidimensional': 'multidimensional-dashboard.html',
    'quantum-market': 'quantum-market-intelligence.html',
    'unified-complete': 'quantum-unified-complete.html',
    'control-center': '../monitoring/control-center.html'
};

// Página principal con índice de interfaces
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>[GALAXY] QBTC Frontend Portal</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
                color: #e0e0e0;
                min-height: 100vh;
                padding: 2rem;
            }
            .header {
                text-align: center;
                margin-bottom: 3rem;
            }
            .header h1 {
                background: linear-gradient(45deg, #ffd700, #ffb347, #ff6347);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 3rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            .card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 15px;
                padding: 2rem;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                text-decoration: none;
                color: inherit;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
                border-color: rgba(255, 215, 0, 0.5);
            }
            .card-title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #ffd700;
                margin-bottom: 1rem;
            }
            .card-description {
                color: #b0b0b0;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .card-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            .status-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                background: #4ade80;
                color: #000;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>[GALAXY] QBTC Frontend Portal</h1>
            <p>Portal de acceso a todas las interfaces del ecosistema cuántico</p>
        </div>
        
        <div class="grid">
            <a href="/qbtc-unified" class="card">
                <div class="card-icon">[GAMEPAD]</div>
                <div class="card-title">Control Center Unificado</div>
                <div class="card-description">Dashboard principal con control total del ecosistema QBTC</div>
                <span class="status-badge">PRINCIPAL</span>
            </a>
            
            <a href="/quantum-complete" class="card">
                <div class="card-icon">[CRYSTAL_BALL]</div>
                <div class="card-title">Quantum Complete Dashboard</div>
                <div class="card-description">Interface cuántica completa con todas las métricas avanzadas</div>
                <span class="status-badge">AVANZADO</span>
            </a>
            
            <a href="/leonardo" class="card">
                <div class="card-icon">[PALETTE]</div>
                <div class="card-title">Leonardo Dashboard</div>
                <div class="card-description">Interface especializada con visualizaciones artísticas</div>
                <span class="status-badge">VISUAL</span>
            </a>
            
            <a href="/quantum-market" class="card">
                <div class="card-icon">[TREND_UP]</div>
                <div class="card-title">Market Intelligence</div>
                <div class="card-description">Análisis de mercado cuántico e inteligencia avanzada</div>
                <span class="status-badge">MERCADO</span>
            </a>
            
            <a href="/multidimensional" class="card">
                <div class="card-icon">[SCALES]</div>
                <div class="card-title">Multidimensional Analytics</div>
                <div class="card-description">Análisis multidimensional y ponderación cuántica</div>
                <span class="status-badge">ANALÍTICA</span>
            </a>
            
            <a href="/control-center" class="card">
                <div class="card-icon">[MONITOR]</div>
                <div class="card-title">Monitoring Center</div>
                <div class="card-description">Centro de monitoreo y control de todos los sistemas</div>
                <span class="status-badge">MONITOR</span>
            </a>
        </div>
        
        <div style="text-align: center; margin-top: 3rem; color: #666;">
            <p>[ROCKET] Powered by QBTC Quantum Systems | Puerto ${PORT}</p>
        </div>
        
        <script>
            // Auto-refresh status
            setTimeout(() => {
                window.location.reload();
            }, 300000); // Refresh every 5 minutes
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Routes para cada interface
Object.entries(interfaces).forEach(([route, file]) => {
    app.get(`/${route}`, (req, res) => {
        const filePath = path.join(__dirname, file);
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(404).send(`
                    <h1>Interface no encontrada</h1>
                    <p>La interface <strong>${route}</strong> no está disponible.</p>
                    <a href="/">← Volver al Portal</a>
                `);
            }
        });
    });
});

// API endpoint para obtener interfaces disponibles
app.get('/api/interfaces', (req, res) => {
    res.json({
        available_interfaces: Object.keys(interfaces),
        server_info: {
            port: PORT,
            status: 'active',
            interfaces_count: Object.keys(interfaces).length
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'QBTC Frontend Web Server',
        port: PORT,
        interfaces: Object.keys(interfaces).length,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('[GLOBE] QBTC Frontend Web Server started');
    console.log(`[PIN] Portal Principal: http://localhost:${PORT}`);
    console.log(`[GAMEPAD] Interfaces disponibles: ${Object.keys(interfaces).length}`);
    console.log('[CHECK] Server listening on port', PORT);
    
    // Log available interfaces
    console.log('\n[LINK] Interfaces disponibles:');
    Object.entries(interfaces).forEach(([route, file]) => {
        console.log(`   • ${route}: http://localhost:${PORT}/${route}`);
    });
});

export default app;
