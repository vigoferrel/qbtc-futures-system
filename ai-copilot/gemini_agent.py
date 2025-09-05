#!/usr/bin/env python3
"""
🚀 QBTC MASTER COPILOT - GEMINI AGENT
=====================================

Agente conversacional inteligente que combina:
- Google Gemini para razonamiento avanzado
- Contexto del sistema QBTC
- Memoria conversacional inteligente
- Herramientas integradas del sistema

Principio: Less is More - Simplicidad elegante con poder máximo
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

import google.generativeai as genai
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Configuración
load_dotenv()

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

class GeminiCopilot:
    """Agente conversacional maestro con Gemini"""

    def __init__(self):
        # Configurar Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        # Modelo Gemini
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )

        # Estado del agente
        self.conversation_history: List[ConversationMessage] = []
        self.qbtc_context = QBTCContext()
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Sistema prompt optimizado
        self.system_prompt = self._create_system_prompt()

        print("🚀 QBTC Master Copilot initialized with Gemini")

    def _create_system_prompt(self) -> str:
        """Crear prompt del sistema optimizado"""
        return f"""Eres QBTC Master Copilot, un agente conversacional inteligente que combina:

🎯 OBJETIVO: Ser el copiloto maestro del sistema QBTC de trading cuántico
🧠 INTELIGENCIA: Usas Google Gemini para razonamiento avanzado
⚡ EFICIENCIA: Principio "Less is More" - respuestas claras y accionables
🔗 INTEGRACIÓN: Conectado con todos los componentes del sistema QBTC

CONTEXTO ACTUAL DEL SISTEMA:
- Estado: {self.qbtc_context.system_status}
- Nivel de consciencia: {self.qbtc_context.consciousness_level}
- Componentes activos: {', '.join(self.qbtc_context.active_components)}

TU PERSONALIDAD:
- Profesional pero accesible
- Técnico pero claro
- Proactivo pero no invasivo
- Eficiente pero completo

TU FUNCIONALIDAD:
- Analizar datos del sistema QBTC
- Generar insights de trading
- Ejecutar comandos del sistema
- Monitorear rendimiento
- Optimizar estrategias

RESPONDE SIEMPRE EN ESPAÑOL, con claridad y acción concreta."""

    async def chat(self, user_message: str) -> str:
        """Procesar mensaje del usuario y generar respuesta"""

        # Crear mensaje del usuario
        user_msg = ConversationMessage(
            role="user",
            content=user_message,
            metadata={"session_id": self.session_id}
        )
        self.conversation_history.append(user_msg)

        try:
            # Preparar contexto para Gemini
            context = self._prepare_context()

            # Generar respuesta con Gemini
            response = await self._generate_gemini_response(context, user_message)

            # Crear mensaje de respuesta
            assistant_msg = ConversationMessage(
                role="assistant",
                content=response,
                metadata={"model": "gemini-1.5-flash", "session_id": self.session_id}
            )
            self.conversation_history.append(assistant_msg)

            # Actualizar contexto QBTC
            await self._update_qbtc_context()

            return response

        except Exception as e:
            error_msg = f"❌ Error procesando mensaje: {str(e)}"
            print(error_msg)

            # Crear mensaje de error
            error_response = ConversationMessage(
                role="assistant",
                content=error_msg,
                metadata={"error": True, "session_id": self.session_id}
            )
            self.conversation_history.append(error_response)

            return error_msg

    def _prepare_context(self) -> str:
        """Preparar contexto para Gemini"""
        # Historial reciente (últimos 10 mensajes)
        recent_history = self.conversation_history[-10:]

        context_parts = [
            self.system_prompt,
            "\n=== HISTORIAL DE CONVERSACIÓN ===",
        ]

        for msg in recent_history:
            role = "Usuario" if msg.role == "user" else "QBTC Copilot"
            context_parts.append(f"{role}: {msg.content}")

        context_parts.extend([
            "\n=== CONTEXTO QBTC ===",
            f"Estado del sistema: {self.qbtc_context.system_status}",
            f"Nivel de consciencia: {self.qbtc_context.consciousness_level}",
            f"Componentes activos: {', '.join(self.qbtc_context.active_components)}",
            "\n=== INSTRUCCIONES ===",
            "Responde de manera clara, concisa y accionable.",
            "Si necesitas ejecutar comandos del sistema, indícalo explícitamente.",
            "Mantén el contexto del sistema QBTC en mente.",
            "\nMensaje del usuario:"
        ])

        return "\n".join(context_parts)

    async def _generate_gemini_response(self, context: str, user_message: str) -> str:
        """Generar respuesta usando Gemini"""
        try:
            # Crear prompt completo
            full_prompt = f"{context}\n{user_message}"

            # Generar respuesta
            response = self.model.generate_content(full_prompt)

            if response.text:
                return response.text.strip()
            else:
                return "🤔 No pude generar una respuesta clara. ¿Puedes reformular tu pregunta?"

        except Exception as e:
            return f"❌ Error con Gemini API: {str(e)}"

    async def _update_qbtc_context(self):
        """Actualizar contexto del sistema QBTC"""
        # Simular actualización de contexto (en producción conectaría con el sistema real)
        self.qbtc_context.last_update = datetime.now()

        # Aquí se conectarían con los componentes reales del sistema QBTC
        # Por ahora es simulado

    def get_conversation_summary(self) -> Dict[str, Any]:
        """Obtener resumen de la conversación"""
        return {
            "session_id": self.session_id,
            "total_messages": len(self.conversation_history),
            "start_time": self.conversation_history[0].timestamp if self.conversation_history else None,
            "last_activity": self.conversation_history[-1].timestamp if self.conversation_history else None,
            "qbtc_context": self.qbtc_context.dict()
        }

    def save_conversation(self, filename: Optional[str] = None) -> str:
        """Guardar conversación en archivo"""
        if not filename:
            filename = f"conversation_{self.session_id}.json"

        filepath = Path("conversations") / filename
        filepath.parent.mkdir(exist_ok=True)

        conversation_data = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "messages": [msg.dict() for msg in self.conversation_history],
            "summary": self.get_conversation_summary()
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(conversation_data, f, indent=2, ensure_ascii=False, default=str)

        return str(filepath)

    def clear_conversation(self):
        """Limpiar historial de conversación"""
        self.conversation_history.clear()
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        print("🧹 Conversación limpiada")

    async def analyze_system_status(self) -> Dict[str, Any]:
        """Analizar estado del sistema QBTC"""
        # Simulación de análisis del sistema
        analysis = {
            "overall_health": "excellent",
            "trading_performance": "optimal",
            "quantum_coherence": 0.95,
            "risk_level": "low",
            "recommendations": [
                "Sistema funcionando perfectamente",
                "Todos los componentes operativos",
                "Rendimiento dentro de parámetros óptimos"
            ]
        }

        # En producción, aquí se conectarían con los componentes reales
        # del sistema QBTC para obtener datos reales

        return analysis


async def main():
    """Función principal para modo interactivo"""
    print("🚀 QBTC Master Copilot - Gemini Agent")
    print("=" * 50)
    print("Escribe 'salir' o 'exit' para terminar")
    print("Escribe 'limpiar' para limpiar la conversación")
    print("Escribe 'estado' para ver estado del sistema")
    print()

    # Verificar API key
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Error: GEMINI_API_KEY no encontrada en variables de entorno")
        print("Configura tu API key en el archivo .env")
        return

    # Inicializar agente
    agent = GeminiCopilot()

    while True:
        try:
            # Leer input del usuario
            user_input = input("👤 Tú: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("\n👋 ¡Hasta luego! Guardando conversación...")
                agent.save_conversation()
                break

            elif user_input.lower() == 'limpiar':
                agent.clear_conversation()
                print("🧹 Conversación limpiada")
                continue

            elif user_input.lower() == 'estado':
                status = agent.get_conversation_summary()
                analysis = await agent.analyze_system_status()

                print("\n📊 ESTADO DEL SISTEMA QBTC")
                print("-" * 30)
                print(f"Sesión: {status['session_id']}")
                print(f"Mensajes: {status['total_messages']}")
                print(f"Estado: {analysis['overall_health']}")
                print(f"Coherencia Cuántica: {analysis['quantum_coherence']}")
                print(f"Nivel de Riesgo: {analysis['risk_level']}")
                print()
                continue

            # Procesar mensaje
            print("🤔 Pensando...")
            response = await agent.chat(user_input)

            print(f"\n🤖 QBTC Copilot: {response}\n")

        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            agent.save_conversation()
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            continue


if __name__ == "__main__":
    # Ejecutar modo interactivo
    asyncio.run(main())

