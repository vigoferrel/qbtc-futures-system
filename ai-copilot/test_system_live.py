#!/usr/bin/env python3
"""
Test del sistema QBTC Master Copilot en funcionamiento
"""

import asyncio
import aiohttp
from openrouter_agent import OpenRouterCopilot

async def test_live_system():
    """Probar el sistema QBTC Master Copilot en funcionamiento"""

    print("🧪 Probando QBTC Master Copilot - Sistema en Vivo")
    print("=" * 55)

    try:
        # Probar el agente OpenRouter directamente
        print("\n🤖 Probando agente OpenRouter...")
        agent = OpenRouterCopilot()

        # Probar conversación básica
        response1 = await agent.chat("¿Cuál es tu función principal como QBTC Master Copilot?")
        print(f"✅ Respuesta 1: {response1[:100]}...")

        # Probar análisis de mercado
        response2 = await agent.chat("analizar_mercado BTCUSDT")
        print(f"✅ Respuesta 2: {response2[:100]}...")

        # Probar estado del sistema
        response3 = await agent.chat("estado_sistema")
        print(f"✅ Respuesta 3: {response3[:100]}...")

        # Mostrar estadísticas
        stats = agent.get_conversation_summary()
        print(f"\n📊 Estadísticas de conversación:")
        print(f"   Total mensajes: {stats['total_messages']}")
        print(f"   Modelo: {stats['model']}")

        await agent.close()

        print("\n🎉 ¡Sistema QBTC Master Copilot funcionando perfectamente!")
        print("🚀 El sistema está listo para análisis cuántico de mercados")

    except Exception as e:
        print(f"❌ Error en el sistema: {str(e)}")
        print("💡 Verifica que el sistema esté ejecutándose correctamente")

if __name__ == "__main__":
    asyncio.run(test_live_system())

