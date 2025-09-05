#!/usr/bin/env python3
"""
🚀 QBTC MASTER COPILOT - QUICK START
==================================

Script de inicio rápido para el agente conversacional QBTC Master Copilot
"""

import asyncio
import sys
import os
from pathlib import Path

# Agregar directorio actual al path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    from openrouter_agent import OpenRouterCopilot
    from qbtc_integration import QBTCEnhancedCopilot

    async def main():
        """Función principal"""
        print("🚀 QBTC Master Copilot")
        print("=" * 50)
        print("🤖 Agente conversacional con Gemini + QBTC")
        print()

        # Verificar configuración
        if not os.getenv("GEMINI_API_KEY"):
            print("⚠️  Configuración requerida:")
            print("   1. Crea un archivo .env en la carpeta ai-copilot/")
            print("   2. Agrega: GEMINI_API_KEY=tu_api_key_aqui")
            print("   3. Obtén tu API key en: https://makersuite.google.com/app/apikey")
            print()
            return

        # Preguntar tipo de inicialización
        print("Selecciona modo de operación:")
        print("1. 🤖 Copilot Básico (solo Gemini)")
        print("2. 🚀 Copilot QBTC Mejorado (con integración completa)")
        print()

        while True:
            try:
                choice = input("Elige opción (1-2): ").strip()

                if choice == "1":
                    print("\n🤖 Iniciando QBTC Master Copilot (modo básico)...")
                    agent = OpenRouterCopilot()
                    await run_basic_copilot(agent)
                    break

                elif choice == "2":
                    print("\n🚀 Iniciando QBTC Master Copilot (modo QBTC)...")
                    agent = QBTCEnhancedCopilot()
                    await run_enhanced_copilot(agent)
                    break

                else:
                    print("❌ Opción no válida. Elige 1 o 2.")

            except KeyboardInterrupt:
                print("\n👋 ¡Hasta luego!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                break

    async def run_basic_copilot(agent: OpenRouterCopilot):
        """Ejecutar copilot básico"""
        print("✅ Copilot inicializado correctamente")
        print("\n💡 Comandos disponibles:")
        print("   'estado' - Ver estado del sistema")
        print("   'limpiar' - Limpiar conversación")
        print("   'salir' - Terminar sesión")
        print()

        while True:
            try:
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
                    print(f"\n📊 Sesión: {status['session_id']}")
                    print(f"📝 Mensajes: {status['total_messages']}")
                    print()
                    continue

                print("🤔 Pensando...")
                response = await agent.chat(user_input)
                print(f"\n🤖 QBTC Copilot: {response}\n")

            except KeyboardInterrupt:
                print("\n👋 ¡Hasta luego!")
                agent.save_conversation()
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                continue

    async def run_enhanced_copilot(agent: QBTCEnhancedCopilot):
        """Ejecutar copilot mejorado con QBTC"""
        try:
            await agent.initialize_with_qbtc()
            print("✅ Copilot QBTC completamente inicializado")
            print("\n💡 Comandos disponibles:")
            print("   'estado' - Ver estado completo del sistema QBTC")
            print("   'reinicia quantum' - Reiniciar análisis cuántico")
            print("   'obtén métricas' - Obtener métricas de trading")
            print("   'limpiar' - Limpiar conversación")
            print("   'salir' - Terminar sesión")
            print()

            while True:
                try:
                    user_input = input("👤 Tú: ").strip()

                    if not user_input:
                        continue

                    if user_input.lower() in ['salir', 'exit', 'quit']:
                        print("\n👋 ¡Hasta luego! Guardando conversación...")
                        agent.save_conversation()
                        if agent.system_integrator:
                            await agent.system_integrator.cleanup()
                        break

                    print("🤔 Analizando con contexto QBTC real...")
                    response = await agent.enhanced_chat(user_input)
                    print(f"\n🤖 QBTC Copilot: {response}\n")

                except KeyboardInterrupt:
                    print("\n👋 ¡Hasta luego!")
                    if agent.system_integrator:
                        await agent.system_integrator.cleanup()
                    break
                except Exception as e:
                    print(f"❌ Error: {e}")
                    continue

        except Exception as e:
            print(f"❌ Error inicializando copilot QBTC: {e}")
            print("💡 Revirtiendo a modo básico...")

            # Fallback a modo básico
            basic_agent = OpenRouterCopilot()
            await run_basic_copilot(basic_agent)

    if __name__ == "__main__":
        # Ejecutar aplicación principal
        asyncio.run(main())

except ImportError as e:
    print("❌ Error de importación:")
    print(f"   {e}")
    print("\n🔧 Solución:")
    print("   1. Instala las dependencias: pip install -r requirements.txt")
    print("   2. Asegúrate de tener Python 3.8+")
    print("   3. Verifica que estés en el directorio correcto")
    sys.exit(1)

except KeyboardInterrupt:
    print("\n👋 ¡Hasta luego!")
    sys.exit(0)

except Exception as e:
    print(f"❌ Error fatal: {e}")
    sys.exit(1)
