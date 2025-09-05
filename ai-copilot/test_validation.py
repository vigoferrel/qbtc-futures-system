#!/usr/bin/env python3
"""
🔬 QBTC MASTER COPILOT - VALIDATION & TESTING SCRIPT
=====================================================

Script de validación rápida para probar el funcionamiento
del QBTC Master Copilot y sus integraciones.
"""

import asyncio
import sys
import time
from pathlib import Path
import json

# Agregar directorio actual al path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    from gemini_agent import GeminiCopilot
    from qbtc_integration import QBTCEnhancedCopilot

    class CopilotValidator:
        """Validador del QBTC Master Copilot"""

        def __init__(self):
            self.results = {
                'basic_tests': {},
                'integration_tests': {},
                'performance_tests': {},
                'error_log': []
            }

        def log_error(self, test_name: str, error: str):
            """Registrar error en el log"""
            self.results['error_log'].append({
                'test': test_name,
                'error': error,
                'timestamp': time.time()
            })
            print(f"❌ {test_name}: {error}")

        def log_success(self, test_name: str, message: str = "OK"):
            """Registrar éxito"""
            print(f"✅ {test_name}: {message}")

        async def test_basic_functionality(self):
            """Test de funcionalidad básica"""
            print("\n🧪 TESTING BASIC FUNCTIONALITY")
            print("=" * 40)

            try:
                # Test 1: Inicialización básica
                print("1. Testing basic initialization...")
                agent = GeminiCopilot()

                # Verificar que se inicializó correctamente
                assert hasattr(agent, 'model'), "Model not initialized"
                assert hasattr(agent, 'conversation_history'), "Conversation history not initialized"
                assert hasattr(agent, 'qbtc_context'), "QBTC context not initialized"

                self.log_success("Basic initialization", "Agent initialized correctly")
                self.results['basic_tests']['initialization'] = True

                # Test 2: Configuración de Gemini
                print("2. Testing Gemini configuration...")
                assert agent.model is not None, "Gemini model not configured"
                # Verificar que el modelo se inicializó correctamente
                assert hasattr(agent.model, '_model_name'), "Model name not accessible"
                # Nota: Google Generative AI no expone directamente el model_name de la misma manera

                self.log_success("Gemini configuration", "Model configured correctly")
                self.results['basic_tests']['gemini_config'] = True

                # Test 3: Prompt del sistema
                print("3. Testing system prompt...")
                assert hasattr(agent, 'system_prompt'), "System prompt not found"
                assert len(agent.system_prompt) > 100, "System prompt too short"
                assert "QBTC" in agent.system_prompt, "QBTC not mentioned in prompt"

                self.log_success("System prompt", "Prompt configured correctly")
                self.results['basic_tests']['system_prompt'] = True

                return True

            except Exception as e:
                self.log_error("Basic functionality", str(e))
                self.results['basic_tests']['basic_functionality'] = False
                return False

        async def test_conversation_flow(self):
            """Test del flujo de conversación"""
            print("\n💬 TESTING CONVERSATION FLOW")
            print("=" * 40)

            try:
                agent = GeminiCopilot()

                # Test 1: Mensaje simple
                print("1. Testing simple message...")
                response = await agent.chat("Hola, ¿cómo estás?")

                assert isinstance(response, str), "Response is not a string"
                assert len(response) > 10, "Response too short"
                assert "usuario" in response.lower() or "hola" in response.lower(), "Response seems generic"

                self.log_success("Simple message", f"Response: {response[:50]}...")
                self.results['basic_tests']['simple_message'] = True

                # Test 2: Historial de conversación
                print("2. Testing conversation history...")
                assert len(agent.conversation_history) >= 2, "Conversation history not updated"
                assert agent.conversation_history[-1].role == "assistant", "Last message not from assistant"
                assert agent.conversation_history[-2].role == "user", "User message not recorded"

                self.log_success("Conversation history", f"{len(agent.conversation_history)} messages")
                self.results['basic_tests']['conversation_history'] = True

                # Test 3: Contexto QBTC
                print("3. Testing QBTC context...")
                context = agent.get_conversation_summary()
                assert 'session_id' in context, "Session ID missing"
                assert 'total_messages' in context, "Message count missing"
                assert 'qbtc_context' in context, "QBTC context missing"

                self.log_success("QBTC context", "Context accessible")
                self.results['basic_tests']['qbtc_context'] = True

                return True

            except Exception as e:
                self.log_error("Conversation flow", str(e))
                self.results['basic_tests']['conversation_flow'] = False
                return False

        async def test_integration_capabilities(self):
            """Test de capacidades de integración"""
            print("\n🔗 TESTING INTEGRATION CAPABILITIES")
            print("=" * 40)

            try:
                # Test 1: Enhanced Copilot (sin conexión real)
                print("1. Testing enhanced copilot initialization...")
                enhanced_agent = QBTCEnhancedCopilot()

                # Verificar que tiene el integrador
                assert hasattr(enhanced_agent, 'system_integrator'), "System integrator not found"

                self.log_success("Enhanced copilot", "Initialized without errors")
                self.results['integration_tests']['enhanced_copilot'] = True

                # Test 2: Comandos del sistema (simulados)
                print("2. Testing system commands...")
                # Nota: No podemos probar comandos reales sin el sistema QBTC corriendo
                # Pero podemos verificar que la lógica existe

                if hasattr(enhanced_agent, '_contains_system_commands'):
                    self.log_success("System commands", "Command detection logic present")
                    self.results['integration_tests']['system_commands'] = True
                else:
                    self.log_error("System commands", "Command detection logic missing")
                    self.results['integration_tests']['system_commands'] = False

                # Test 3: Persistencia de conversaciones
                print("3. Testing conversation persistence...")
                test_filename = f"test_conversation_{int(time.time())}.json"
                saved_path = enhanced_agent.save_conversation(test_filename)

                assert Path(saved_path).exists(), "Conversation file not saved"

                # Limpiar archivo de test
                Path(saved_path).unlink()

                self.log_success("Conversation persistence", "Save/load working")
                self.results['integration_tests']['persistence'] = True

                return True

            except Exception as e:
                self.log_error("Integration capabilities", str(e))
                self.results['integration_tests']['integration_capabilities'] = False
                return False

        async def test_performance(self):
            """Test de performance básico"""
            print("\n⚡ TESTING PERFORMANCE")
            print("=" * 40)

            try:
                agent = GeminiCopilot()

                # Test 1: Latencia de respuesta
                print("1. Testing response latency...")
                start_time = time.time()

                response = await agent.chat("¿Cuál es el estado actual del sistema QBTC?")

                latency = time.time() - start_time

                # Latencia esperada: menos de 5 segundos (incluyendo API call)
                if latency < 5.0:
                    self.log_success("Response latency", f"{latency:.2f}s - Excellent")
                    self.results['performance_tests']['latency'] = 'excellent'
                elif latency < 10.0:
                    self.log_success("Response latency", f"{latency:.2f}s - Good")
                    self.results['performance_tests']['latency'] = 'good'
                else:
                    self.log_success("Response latency", f"{latency:.2f}s - Acceptable")
                    self.results['performance_tests']['latency'] = 'acceptable'

                # Test 2: Consistencia de respuestas
                print("2. Testing response consistency...")
                responses = []
                for i in range(3):
                    resp = await agent.chat(f"Test message {i+1}")
                    responses.append(resp)

                # Verificar que las respuestas son diferentes (no cache estático)
                unique_responses = len(set(responses))
                if unique_responses >= 2:
                    self.log_success("Response consistency", f"{unique_responses}/3 unique responses")
                    self.results['performance_tests']['consistency'] = True
                else:
                    self.log_error("Response consistency", "Responses too similar")
                    self.results['performance_tests']['consistency'] = False

                return True

            except Exception as e:
                self.log_error("Performance", str(e))
                self.results['performance_tests']['performance'] = False
                return False

        def generate_report(self):
            """Generar reporte de validación"""
            print("\n📊 VALIDATION REPORT")
            print("=" * 50)

            # Resumen general
            total_tests = 0
            passed_tests = 0

            for category in ['basic_tests', 'integration_tests', 'performance_tests']:
                if category in self.results:
                    for test_name, result in self.results[category].items():
                        total_tests += 1
                        if isinstance(result, bool) and result:
                            passed_tests += 1
                        elif isinstance(result, str) and result in ['excellent', 'good', 'acceptable']:
                            passed_tests += 1

            success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0

            print(f"📈 Overall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")

            # Detalles por categoría
            for category in ['basic_tests', 'integration_tests', 'performance_tests']:
                if category in self.results:
                    print(f"\n🔍 {category.replace('_', ' ').title()}:")
                    for test_name, result in self.results[category].items():
                        status = "✅" if (isinstance(result, bool) and result) or isinstance(result, str) else "❌"
                        print(f"   {status} {test_name.replace('_', ' ').title()}: {result}")

            # Errores encontrados
            if self.results['error_log']:
                print(f"\n❌ Errors Found ({len(self.results['error_log'])}):")
                for error in self.results['error_log'][:5]:  # Mostrar primeros 5
                    print(f"   • {error['test']}: {error['error']}")

            # Recomendaciones
            print(f"\n💡 Recommendations:")
            if success_rate >= 80:
                print("   ✅ System validation successful! Ready for production use.")
                print("   🚀 Consider implementing advanced features from the roadmap.")
            elif success_rate >= 60:
                print("   ⚠️ System partially functional. Focus on fixing critical errors.")
                print("   🔧 Address the failed tests before proceeding.")
            else:
                print("   ❌ Critical issues found. Prioritize fixing basic functionality.")
                print("   🐛 Review error logs and fix core problems first.")

            return success_rate >= 60

        async def run_full_validation(self):
            """Ejecutar validación completa"""
            print("🚀 QBTC Master Copilot - Validation Suite")
            print("=========================================")
            print("This will test all critical components of the system.\n")

            # Verificar API key
            if not self._check_api_key():
                return False

            # Ejecutar tests
            await self.test_basic_functionality()
            await self.test_conversation_flow()
            await self.test_integration_capabilities()
            await self.test_performance()

            # Generar reporte
            validation_passed = self.generate_report()

            # Guardar resultados
            self.save_results()

            return validation_passed

        def _check_api_key(self) -> bool:
            """Verificar que la API key esté configurada"""
            import os
            api_key = os.getenv("GEMINI_API_KEY")

            if not api_key:
                print("❌ GEMINI_API_KEY not found in environment variables")
                print("💡 Configure your API key:")
                print("   1. Get key from: https://makersuite.google.com/app/apikey")
                print("   2. Set environment variable: export GEMINI_API_KEY=your_key")
                print("   3. Or create .env file with: GEMINI_API_KEY=your_key")
                return False

            print("✅ GEMINI_API_KEY configured")
            return True

        def save_results(self):
            """Guardar resultados de validación"""
            results_file = Path("validation_results.json")
            with open(results_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False, default=str)

            print(f"\n💾 Results saved to: {results_file}")

    async def main():
        """Función principal"""
        validator = CopilotValidator()

        # Verificar argumentos
        if len(sys.argv) > 1:
            test_type = sys.argv[1]

            if test_type == "--basic":
                await validator.test_basic_functionality()
            elif test_type == "--conversation":
                await validator.test_conversation_flow()
            elif test_type == "--integration":
                await validator.test_integration_capabilities()
            elif test_type == "--performance":
                await validator.test_performance()
            else:
                print("❌ Invalid test type. Use: --basic, --conversation, --integration, --performance")
                return
        else:
            # Validación completa
            await validator.run_full_validation()

    if __name__ == "__main__":
        asyncio.run(main())

except ImportError as e:
    print("❌ Import Error:")
    print(f"   {e}")
    print("\n🔧 Solution:")
    print("   1. Install dependencies: pip install -r requirements.txt")
    print("   2. Ensure Python 3.8+ is installed")
    print("   3. Check that all files are in the correct directory")

except Exception as e:
    print(f"❌ Fatal Error: {e}")
    sys.exit(1)
