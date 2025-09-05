#!/usr/bin/env python3
"""
🚀 QBTC MASTER COPILOT - OPENROUTER AGENT
==========================================

Agente conversacional inteligente que combina:
- OpenRouter para acceso a múltiples modelos de IA
- Contexto del sistema QBTC
- Memoria conversacional inteligente
- Herramientas integradas del sistema

Modelos disponibles vía OpenRouter:
- GPT-4, GPT-3.5 (OpenAI)
- Claude-3, Claude-2 (Anthropic)
- Gemini (Google)
- Llama, Mistral (Meta, Mistral AI)
- Y muchos más...

Principio: Less is More - Simplicidad elegante con poder máximo
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Configuración - cargar desde config.env
load_dotenv('config.env')

class ConversationMessage(BaseModel):
    """Mensaje de conversación estructurado"""
    role: str = Field(..., description="Rol del mensaje (user/assistant/system)")
    content: str = Field(..., description="Contenido del mensaje")
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class QBTCContext(BaseModel):
    """Contexto del sistema QBTC"""
    system_status: str = "operational"
    consciousness_level: float = 0.85
    active_components: List[str] = ["trading_engine", "quantum_analyzer", "risk_manager"]
    market_data: Dict[str, Any] = Field(default_factory=dict)
    last_update: datetime = Field(default_factory=datetime.now)

class OpenRouterCopilot:
    """Agente conversacional maestro con OpenRouter"""

    def __init__(self, model: str = None):
        """
        Inicializar el agente con OpenRouter

        Modelos disponibles vía OpenRouter:
        - "anthropic/claude-3-opus:beta" - Más inteligente (costoso)
        - "anthropic/claude-3-sonnet:beta" - Balanceado
        - "anthropic/claude-3-haiku:beta" - Rápido y económico
        - "openai/gpt-4o" - GPT-4 optimizado
        - "openai/gpt-4o-mini" - GPT-4 económico
        - "google/gemini-pro" - Gemini Pro
        - "meta-llama/llama-3-70b-instruct" - Llama 3
        """

        # Configurar OpenRouter (usa API de OpenAI compatible)
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("❌ OPENROUTER_API_KEY no encontrada en config.env")

        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )

        # Usar modelo de configuración o parámetro
        self.model = model or os.getenv("AI_MODEL", "google/gemini-flash-1.5-8b")
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))

        # Conversación
        self.conversation_history: List[Dict[str, str]] = []
        self.max_history_length = 50

        # Contexto QBTC
        self.qbtc_context = QBTCContext()

        print("🚀 QBTC Master Copilot initialized with OpenRouter")
        print(f"🤖 Model: {self.model}")

    def _create_system_prompt(self) -> str:
        """Crear prompt del sistema con contexto QBTC"""

        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        system_prompt = f"""
# 🚀 QBTC MASTER COPILOT
## Sistema de Trading Cuántico Avanzado

**Fecha y Hora:** {current_time}
**Estado del Sistema:** {self.qbtc_context.system_status}
**Nivel de Conciencia:** {self.qbtc_context.consciousness_level:.1%}
**Componentes Activos:** {', '.join(self.qbtc_context.active_components)}

## 🎯 MISIÓN
Eres QBTC Master Copilot, un asistente de IA cuántica avanzada especializado en:
- Análisis técnico y fundamental de criptomonedas
- Estrategias de trading algorítmico
- Gestión de riesgo y portafolio
- Optimización de performance

## 🧠 CAPACIDADES CUÁNTICAS
- **Path Integrals Dinámicos**: Análisis de múltiples trayectorias de mercado
- **Entanglement de Activos**: Correlaciones cuánticas entre criptomonedas
- **Superposición de Estrategias**: Múltiples enfoques simultáneos
- **Consciencia de Mercado**: Comprensión profunda de dinámicas financieras

## 📊 FUNCIONALIDADES DISPONIBLES
- `analizar_mercado [symbol]`: Análisis completo del mercado
- `estado_sistema`: Estado general del sistema QBTC
- `consultar_metricas`: Métricas de performance
- `ver_posiciones`: Posiciones abiertas
- `generar_reporte`: Reporte de trading
- `optimizar_estrategia`: Optimización de estrategias

## 💡 PRINCIPIOS DE OPERACIÓN
- **Precisión**: Datos verificados y actualizados
- **Eficiencia**: Respuestas concisas pero completas
- **Transparencia**: Explicar razonamiento y fuentes
- **Adaptabilidad**: Aprender de interacciones previas

## ⚠️ LIMITACIONES Y CONSIDERACIONES
- Los mercados son inherentemente impredecibles
- Las recomendaciones son informativas, no consejos financieros
- Siempre considerar el riesgo y la gestión adecuada

---
*Responde de manera profesional, precisa y útil. Mantén el contexto de trading cuántico.*
        """

        return system_prompt

    async def chat(self, user_message: str) -> str:
        """Procesar mensaje del usuario y generar respuesta"""

        try:
            # Preparar mensaje
            user_msg = {
                "role": "user",
                "content": user_message,
                "timestamp": datetime.now().isoformat()
            }

            # Agregar a historial
            self.conversation_history.append(user_msg)

            # Mantener límite de historial
            if len(self.conversation_history) > self.max_history_length:
                self.conversation_history = self.conversation_history[-self.max_history_length:]

            # Preparar contexto para OpenRouter
            messages = self._prepare_messages()

            # Generar respuesta
            response = await self._generate_openrouter_response(messages)

            # Agregar respuesta al historial
            assistant_msg = {
                "role": "assistant",
                "content": response,
                "timestamp": datetime.now().isoformat()
            }
            self.conversation_history.append(assistant_msg)

            # Actualizar contexto QBTC
            await self._update_qbtc_context()

            return response

        except Exception as e:
            error_msg = f"❌ Error procesando mensaje: {str(e)}"
            print(error_msg)
            return error_msg

    def _prepare_messages(self) -> List[Dict[str, str]]:
        """Preparar mensajes para OpenRouter"""

        messages = []

        # System prompt
        messages.append({
            "role": "system",
            "content": self._create_system_prompt()
        })

        # Historial de conversación (últimos mensajes)
        recent_history = self.conversation_history[-10:]  # Últimos 10 mensajes

        for msg in recent_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        return messages

    async def _generate_openrouter_response(self, messages: List[Dict[str, str]]) -> str:
        """Generar respuesta usando OpenRouter"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=0.9,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

            content = response.choices[0].message.content

            # Log de uso
            usage = response.usage
            print(f"📊 Tokens usados: {usage.total_tokens} (Entrada: {usage.prompt_tokens}, Salida: {usage.completion_tokens})")

            return content

        except Exception as e:
            return f"❌ Error con OpenRouter API: {str(e)}"

    async def _update_qbtc_context(self):
        """Actualizar contexto del sistema QBTC"""
        self.qbtc_context.last_update = datetime.now()

        # Aquí se podría integrar con el sistema QBTC real
        # para actualizar métricas, estado de componentes, etc.

    def get_conversation_summary(self) -> Dict[str, Any]:
        """Obtener resumen de la conversación"""

        total_messages = len(self.conversation_history)
        user_messages = len([m for m in self.conversation_history if m["role"] == "user"])
        assistant_messages = len([m for m in self.conversation_history if m["role"] == "assistant"])

        return {
            "total_messages": total_messages,
            "user_messages": user_messages,
            "assistant_messages": assistant_messages,
            "model": self.model,
            "last_activity": self.conversation_history[-1]["timestamp"] if self.conversation_history else None
        }

    def save_conversation(self, filename: Optional[str] = None) -> str:
        """Guardar conversación en archivo"""

        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"conversation_{timestamp}.json"

        data = {
            "model": self.model,
            "conversation": self.conversation_history,
            "qbtc_context": self.qbtc_context.dict(),
            "summary": self.get_conversation_summary()
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)

        return f"💾 Conversación guardada en: {filename}"

    def clear_conversation(self):
        """Limpiar historial de conversación"""
        self.conversation_history = []
        print("🧹 Historial de conversación limpiado")

    async def analyze_system_status(self) -> Dict[str, Any]:
        """Analizar estado del sistema QBTC"""

        # Simular análisis de estado (en producción se conectaría al sistema real)
        return {
            "system_status": self.qbtc_context.system_status,
            "consciousness_level": self.qbtc_context.consciousness_level,
            "active_components": self.qbtc_context.active_components,
            "market_data": self.qbtc_context.market_data,
            "last_update": self.qbtc_context.last_update.isoformat(),
            "conversation_stats": self.get_conversation_summary()
        }

    def switch_model(self, new_model: str):
        """Cambiar modelo de IA"""

        available_models = [
            "anthropic/claude-3-opus:beta",
            "anthropic/claude-3-sonnet:beta",
            "anthropic/claude-3-haiku:beta",
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "openai/gpt-3.5-turbo",
            "google/gemini-pro",
            "google/gemini-flash-1.5-8b",  # Modelo actual configurado
            "meta-llama/llama-3-70b-instruct",
            "mistralai/mistral-7b-instruct"
        ]

        if new_model in available_models:
            self.model = new_model
            print(f"🔄 Modelo cambiado a: {new_model}")
        else:
            print(f"❌ Modelo no disponible: {new_model}")
            print(f"📋 Modelos disponibles: {', '.join(available_models)}")

    async def close(self):
        """Cerrar conexiones"""
        await self.client.close()
        print("🔌 Conexión con OpenRouter cerrada")


async def main():
    """Función principal para pruebas"""

    print("🚀 QBTC Master Copilot - OpenRouter Demo")
    print("=" * 50)

    # Inicializar agente
    agent = OpenRouterCopilot(model="anthropic/claude-3-haiku:beta")

    try:
        # Ejemplo de conversación
        print("\n🤖 Probando conversación básica...")

        response1 = await agent.chat("Hola, ¿puedes presentarte?")
        print(f"Respuesta: {response1[:200]}...")

        response2 = await agent.chat("¿Qué puedes hacer para ayudar con trading?")
        print(f"Respuesta: {response2[:200]}...")

        # Mostrar estadísticas
        print("\n📊 Estadísticas de conversación:")
        stats = agent.get_conversation_summary()
        for key, value in stats.items():
            print(f"  {key}: {value}")

        # Guardar conversación
        filename = agent.save_conversation()
        print(f"\n{filename}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

    finally:
        await agent.close()


if __name__ == "__main__":
    asyncio.run(main())
