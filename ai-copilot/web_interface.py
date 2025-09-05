#!/usr/bin/env python3
"""
🌐 QBTC MASTER COPILOT - WEB INTERFACE
=====================================

Interfaz web moderna para el QBTC Master Copilot
con diseño responsive y funcionalidades avanzadas.

Características:
- Chat conversacional en tiempo real
- Visualización de métricas del sistema
- Ejecución de comandos QBTC
- Dashboard de estado del sistema
- Tema oscuro/claro
"""

import asyncio
import json
import os
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

from qbtc_integration import QBTCEnhancedCopilot
from qbtc_commands import QBTCCommands

# Configuración de FastAPI
app = FastAPI(
    title="QBTC Master Copilot",
    description="Interfaz web para el sistema de trading cuántico QBTC",
    version="2.0.0"
)

# Configurar directorios
BASE_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
static_dir = BASE_DIR / "static"

# Crear directorios si no existen
static_dir.mkdir(exist_ok=True)
templates_dir = BASE_DIR / "templates"
templates_dir.mkdir(exist_ok=True)

# Modelo de datos para mensajes del chat
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class CommandRequest(BaseModel):
    command: str
    parameters: Dict[str, Any] = {}

# Instancia global del copilot (se inicializa en startup)
copilot_instance: Optional[QBTCEnhancedCopilot] = None
command_system = QBTCCommands()

@app.on_event("startup")
async def startup_event():
    """Inicializar el sistema al iniciar la aplicación"""
    global copilot_instance
    print("🚀 Inicializando QBTC Master Copilot Web Interface...")

    try:
        copilot_instance = QBTCEnhancedCopilot()
        await copilot_instance.initialize_with_qbtc()
        print("✅ QBTC Master Copilot inicializado correctamente")
    except Exception as e:
        print(f"❌ Error inicializando copilot: {e}")
        # Crear instancia básica si falla la inicialización avanzada
        copilot_instance = QBTCEnhancedCopilot()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Página principal del dashboard"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "QBTC Master Copilot",
        "version": "2.0.0"
    })

@app.get("/chat", response_class=HTMLResponse)
async def chat_interface(request: Request):
    """Interfaz de chat conversacional"""
    return templates.TemplateResponse("chat.html", {
        "request": request,
        "title": "QBTC Chat Interface"
    })

@app.get("/dashboard", response_class=HTMLResponse)
async def system_dashboard(request: Request):
    """Dashboard del sistema QBTC"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "title": "QBTC System Dashboard"
    })

@app.post("/api/chat")
async def chat_endpoint(chat_request: ChatMessage):
    """Endpoint para chat con el copilot"""
    try:
        if not copilot_instance:
            return JSONResponse({
                "error": "Copilot no inicializado",
                "message": "El sistema está iniciándose, por favor espere..."
            }, status_code=503)

        # Procesar mensaje con el copilot
        response = await copilot_instance.enhanced_chat(chat_request.message)

        return {
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "session_id": chat_request.session_id
        }

    except Exception as e:
        return JSONResponse({
            "error": f"Error procesando mensaje: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status_code=500)

@app.post("/api/command")
async def execute_command(command_request: CommandRequest):
    """Endpoint para ejecutar comandos del sistema QBTC"""
    try:
        result = await command_system.execute_command(
            command_request.command,
            command_request.parameters
        )

        return {
            "success": result.success,
            "command": result.command,
            "result": result.result,
            "message": result.message,
            "execution_time": result.execution_time,
            "timestamp": result.timestamp.isoformat()
        }

    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": f"Error ejecutando comando: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status_code=500)

@app.get("/api/commands")
async def get_available_commands():
    """Obtener lista de comandos disponibles"""
    commands = command_system.get_available_commands()
    command_help = {}

    for cmd in commands:
        help_text = command_system.get_command_help(cmd)
        command_help[cmd] = help_text or "Sin descripción disponible"

    return {
        "commands": commands,
        "help": command_help,
        "total": len(commands)
    }

@app.get("/api/system/status")
async def get_system_status():
    """Obtener estado del sistema QBTC"""
    try:
        if command_system:
            status_result = await command_system.execute_command("estado_sistema")
            if status_result.success:
                return status_result.result

        return {
            "overall_status": "unknown",
            "message": "Estado del sistema no disponible",
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        return JSONResponse({
            "error": f"Error obteniendo estado del sistema: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status_code=500)

@app.get("/api/metrics")
async def get_system_metrics():
    """Obtener métricas del sistema"""
    try:
        if command_system:
            metrics_result = await command_system.execute_command("consultar_metricas")
            if metrics_result.success:
                return metrics_result.result

        return {
            "error": "Métricas no disponibles",
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        return JSONResponse({
            "error": f"Error obteniendo métricas: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status_code=500)

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket para chat en tiempo real"""
    await websocket.accept()

    try:
        while True:
            # Recibir mensaje del cliente
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Procesar con el copilot
            if copilot_instance:
                response = await copilot_instance.enhanced_chat(message_data["message"])

                # Enviar respuesta
                await websocket.send_json({
                    "response": response,
                    "timestamp": datetime.now().isoformat(),
                    "type": "chat_response"
                })
            else:
                await websocket.send_json({
                    "error": "Copilot no disponible",
                    "timestamp": datetime.now().isoformat(),
                    "type": "error"
                })

    except WebSocketDisconnect:
        print("Cliente desconectado")
    except Exception as e:
        await websocket.send_json({
            "error": f"Error en WebSocket: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "type": "error"
        })

# Crear archivos HTML básicos
def create_html_templates():
    """Crear templates HTML básicos"""

    # Template principal
    index_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .hero-section { padding: 100px 0; color: white; text-align: center; }
        .feature-card { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; margin: 20px 0; backdrop-filter: blur(10px); }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">
                <i class="fas fa-brain"></i> QBTC Master Copilot
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="/chat"><i class="fas fa-comments"></i> Chat</a>
                <a class="nav-link" href="/dashboard"><i class="fas fa-chart-line"></i> Dashboard</a>
            </div>
        </div>
    </nav>

    <div class="hero-section">
        <div class="container">
            <h1 class="display-4"><i class="fas fa-rocket"></i> QBTC Master Copilot</h1>
            <p class="lead">Sistema de IA conversacional avanzado para trading cuántico</p>

            <div class="row mt-5">
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-brain fa-3x mb-3"></i>
                        <h4>IA Avanzada</h4>
                        <p>Google Gemini con contexto QBTC real</p>
                        <a href="/chat" class="btn btn-light">Comenzar Chat</a>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-chart-line fa-3x mb-3"></i>
                        <h4>Análisis Cuántico</h4>
                        <p>Algoritmos cuánticos y métricas en tiempo real</p>
                        <a href="/dashboard" class="btn btn-light">Ver Dashboard</a>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-terminal fa-3x mb-3"></i>
                        <h4>Comandos Avanzados</h4>
                        <p>Control completo del sistema QBTC</p>
                        <a href="/api/commands" class="btn btn-light">Ver Comandos</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"""

    # Template de chat
    chat_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .chat-container { max-width: 800px; margin: 50px auto; }
        .chat-messages { height: 500px; overflow-y: auto; padding: 20px; background: white; border-radius: 10px; }
        .message { margin: 10px 0; padding: 10px 15px; border-radius: 10px; }
        .user-message { background: #007bff; color: white; margin-left: 100px; }
        .assistant-message { background: #f1f3f4; margin-right: 100px; }
        .input-group { margin-top: 20px; }
        .btn-send { background: linear-gradient(45deg, #667eea, #764ba2); border: none; }
    </style>
</head>
<body>
    <div class="container chat-container">
        <div class="text-center mb-4">
            <h2><i class="fas fa-comments"></i> QBTC Master Copilot Chat</h2>
            <p class="text-muted">Conversación inteligente con el sistema QBTC</p>
        </div>

        <div class="chat-messages" id="chatMessages">
            <div class="message assistant-message">
                <strong>QBTC Copilot:</strong> ¡Hola! Soy tu asistente inteligente para el sistema QBTC.
                Puedo ayudarte con análisis de mercado, ejecución de comandos, métricas del sistema y más.
                ¿En qué puedo ayudarte hoy?
            </div>
        </div>

        <div class="input-group">
            <input type="text" class="form-control" id="messageInput" placeholder="Escribe tu mensaje aquí...">
            <button class="btn btn-send" id="sendButton">
                <i class="fas fa-paper-plane"></i> Enviar
            </button>
        </div>

        <div class="mt-3">
            <small class="text-muted">
                <strong>Comandos disponibles:</strong> estado_sistema, analizar_mercado, consultar_metricas, optimizar_estrategia, etc.
            </small>
        </div>
    </div>

    <script>
        const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;

            const sender = isUser ? 'Tú:' : 'QBTC Copilot:';
            messageDiv.innerHTML = `<strong>${sender}</strong> ${content}`;

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage(message) {
            addMessage(message, true);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });

                const data = await response.json();

                if (data.error) {
                    addMessage(`Error: ${data.error}`, false);
                } else {
                    addMessage(data.response, false);
                }
            } catch (error) {
                addMessage(`Error de conexión: ${error.message}`, false);
            }
        }

        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                sendMessage(message);
                messageInput.value = '';
            }
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });

        // Mensaje inicial
        messageInput.focus();
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"""

    # Template de dashboard
    dashboard_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; }
        .metric-card { background: white; border-radius: 10px; padding: 20px; margin: 10px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status-online { color: #28a745; }
        .status-offline { color: #dc3545; }
        .progress-bar { background: linear-gradient(45deg, #667eea, #764ba2); }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="fas fa-brain"></i> QBTC Dashboard
            </a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="/chat">Chat</a>
                <a class="nav-link active" href="/dashboard">Dashboard</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row">
            <div class="col-md-12">
                <h2><i class="fas fa-chart-line"></i> QBTC System Dashboard</h2>
                <p class="text-muted">Estado en tiempo real del sistema de trading cuántico</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="metric-card">
                    <h5><i class="fas fa-server"></i> Estado del Sistema</h5>
                    <div id="systemStatus">Cargando...</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="metric-card">
                    <h5><i class="fas fa-chart-bar"></i> Métricas de Trading</h5>
                    <div id="tradingMetrics">Cargando...</div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="metric-card">
                    <h5><i class="fas fa-terminal"></i> Comandos Disponibles</h5>
                    <div id="availableCommands">Cargando...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function loadSystemStatus() {
            try {
                const response = await fetch('/api/system/status');
                const data = await response.json();

                const statusDiv = document.getElementById('systemStatus');
                statusDiv.innerHTML = `
                    <div class="mb-2">
                        <strong>Estado General:</strong>
                        <span class="${data.overall_status === 'operational' ? 'status-online' : 'status-offline'}">
                            ${data.overall_status}
                        </span>
                    </div>
                    <div class="mb-2"><strong>Uptime:</strong> ${data.uptime}</div>
                    <div class="mb-2"><strong>Conexiones:</strong> ${data.active_connections}</div>
                    <div class="mb-2"><strong>Memoria:</strong> ${data.memory_usage}</div>
                    <div class="mb-2"><strong>CPU:</strong> ${data.cpu_usage}</div>
                `;
            } catch (error) {
                document.getElementById('systemStatus').innerHTML = 'Error cargando estado del sistema';
            }
        }

        async function loadTradingMetrics() {
            try {
                const response = await fetch('/api/metrics');
                const data = await response.json();

                const metricsDiv = document.getElementById('tradingMetrics');
                if (data.trading_metrics) {
                    metricsDiv.innerHTML = `
                        <div class="row">
                            <div class="col-6">
                                <div class="mb-2"><strong>Trades:</strong> ${data.trading_metrics.total_trades}</div>
                                <div class="mb-2"><strong>Win Rate:</strong> ${(data.trading_metrics.win_rate * 100).toFixed(1)}%</div>
                            </div>
                            <div class="col-6">
                                <div class="mb-2"><strong>Profit Factor:</strong> ${data.trading_metrics.profit_factor}</div>
                                <div class="mb-2"><strong>P&L Total:</strong> ${data.trading_metrics.total_pnl}</div>
                            </div>
                        </div>
                        <div class="progress mt-3">
                            <div class="progress-bar" style="width: ${(data.trading_metrics.win_rate * 100)}%">
                                Win Rate: ${(data.trading_metrics.win_rate * 100).toFixed(1)}%
                            </div>
                        </div>
                    `;
                } else {
                    metricsDiv.innerHTML = 'Métricas no disponibles';
                }
            } catch (error) {
                document.getElementById('tradingMetrics').innerHTML = 'Error cargando métricas';
            }
        }

        async function loadAvailableCommands() {
            try {
                const response = await fetch('/api/commands');
                const data = await response.json();

                const commandsDiv = document.getElementById('availableCommands');
                let html = '<div class="row">';

                data.commands.forEach((cmd, index) => {
                    if (index % 3 === 0 && index > 0) html += '</div><div class="row">';
                    html += `
                        <div class="col-md-4 mb-2">
                            <code class="d-block">${cmd}</code>
                            <small class="text-muted">${data.help[cmd]}</small>
                        </div>
                    `;
                });

                html += '</div>';
                commandsDiv.innerHTML = html;
            } catch (error) {
                document.getElementById('availableCommands').innerHTML = 'Error cargando comandos';
            }
        }

        // Cargar datos al iniciar
        loadSystemStatus();
        loadTradingMetrics();
        loadAvailableCommands();

        // Actualizar cada 30 segundos
        setInterval(() => {
            loadSystemStatus();
            loadTradingMetrics();
        }, 30000);
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"""

    # Escribir archivos
    with open(templates_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)

    with open(templates_dir / "chat.html", "w", encoding="utf-8") as f:
        f.write(chat_html)

    with open(templates_dir / "dashboard.html", "w", encoding="utf-8") as f:
        f.write(dashboard_html)

# Crear templates HTML
create_html_templates()

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "copilot_status": "initialized" if copilot_instance else "not_initialized"
    }

if __name__ == "__main__":
    print("🌐 Iniciando QBTC Master Copilot Web Interface...")
    print("📍 Dashboard: http://localhost:8000")
    print("💬 Chat: http://localhost:8000/chat")
    print("📊 System: http://localhost:8000/dashboard")
    print("🔗 API Docs: http://localhost:8000/docs")

    uvicorn.run(
        "web_interface:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

