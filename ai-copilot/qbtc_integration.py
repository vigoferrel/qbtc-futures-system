#!/usr/bin/env python3
"""
🔗 QBTC SYSTEM INTEGRATION
==========================

Módulo de integración que conecta el Master Copilot
con los componentes reales del sistema QBTC.

Honra el trabajo previo: aprovecha las correcciones ya implementadas
y conecta con los sistemas existentes de manera elegante.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from openrouter_agent import OpenRouterCopilot, QBTCContext
from qbtc_commands import QBTCCommands, CommandResult

class QBTCSystemIntegrator:
    """Integrador del sistema QBTC con el Master Copilot"""

    def __init__(self, copilot: OpenRouterCopilot):
        self.copilot = copilot
        self.session = None
        self.system_endpoints = {
            # Endpoints de los componentes ya corregidos
            'master_control': 'http://localhost:14001',
            'trading_metrics': 'http://localhost:8080',
            'quantum_analysis': 'http://localhost:14100',
            'akashic_system': 'http://localhost:14200',  # Futuro
        }

        # Estado de los componentes
        self.component_status = {}
        self.last_sync = None

        # Configurar logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('QBTC_Integrator')

    async def initialize(self):
        """Inicializar conexiones con el sistema QBTC"""
        self.session = aiohttp.ClientSession()
        self.logger.info("🔗 Inicializando integración con sistema QBTC")

        # Verificar conectividad con componentes
        await self.check_system_connectivity()

        # Sincronizar estado inicial
        await self.sync_system_state()

        self.logger.info("✅ Integración QBTC inicializada correctamente")

    async def check_system_connectivity(self):
        """Verificar conectividad con todos los componentes QBTC"""
        self.logger.info("🌐 Verificando conectividad con componentes QBTC...")

        connectivity_results = {}

        for component_name, endpoint in self.system_endpoints.items():
            try:
                health_url = f"{endpoint}/health"
                async with self.session.get(health_url, timeout=5) as response:
                    if response.status == 200:
                        data = await response.json()
                        connectivity_results[component_name] = {
                            'status': 'online',
                            'health': data
                        }
                        self.logger.info(f"✅ {component_name}: Conectado")
                    else:
                        connectivity_results[component_name] = {
                            'status': 'error',
                            'error': f'HTTP {response.status}'
                        }
                        self.logger.warning(f"⚠️ {component_name}: Error HTTP {response.status}")

            except asyncio.TimeoutError:
                connectivity_results[component_name] = {
                    'status': 'timeout',
                    'error': 'Timeout after 5s'
                }
                self.logger.warning(f"⏰ {component_name}: Timeout")

            except Exception as e:
                connectivity_results[component_name] = {
                    'status': 'offline',
                    'error': str(e)
                }
                self.logger.warning(f"❌ {component_name}: {str(e)}")

        self.component_status = connectivity_results
        return connectivity_results

    async def sync_system_state(self):
        """Sincronizar estado del sistema QBTC"""
        self.logger.info("🔄 Sincronizando estado del sistema QBTC...")

        # Obtener métricas de trading si disponible
        trading_metrics = await self.get_trading_metrics()

        # Obtener estado del quantum analysis
        quantum_status = await self.get_quantum_analysis_status()

        # Actualizar contexto del copilot
        updated_context = QBTCContext(
            system_status=self._calculate_overall_status(),
            consciousness_level=await self._get_consciousness_level(),
            active_components=self._get_active_components(),
            market_data=await self._get_market_data(),
            last_update=datetime.now()
        )

        self.copilot.qbtc_context = updated_context
        self.last_sync = datetime.now()

        self.logger.info("✅ Estado del sistema sincronizado")

    async def get_trading_metrics(self) -> Optional[Dict[str, Any]]:
        """Obtener métricas de trading del sistema"""
        if self.component_status.get('trading_metrics', {}).get('status') != 'online':
            return None

        try:
            url = f"{self.system_endpoints['trading_metrics']}/api/metrics/performance"
            async with self.session.get(url, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            self.logger.warning(f"Error obteniendo métricas de trading: {e}")

        return None

    async def get_quantum_analysis_status(self) -> Optional[Dict[str, Any]]:
        """Obtener estado del análisis cuántico"""
        if self.component_status.get('quantum_analysis', {}).get('status') != 'online':
            return None

        try:
            url = f"{self.system_endpoints['quantum_analysis']}/health"
            async with self.session.get(url, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            self.logger.warning(f"Error obteniendo estado del quantum analysis: {e}")

        return None

    def _calculate_overall_status(self) -> str:
        """Calcular estado general del sistema"""
        online_components = sum(1 for comp in self.component_status.values()
                               if comp.get('status') == 'online')

        total_components = len(self.component_status)

        if online_components == total_components:
            return "operational"
        elif online_components >= total_components * 0.7:
            return "degraded"
        else:
            return "critical"

    async def _get_consciousness_level(self) -> float:
        """Obtener nivel de consciencia del sistema"""
        # Por ahora simulado, en producción conectaría con el sistema real
        base_level = 0.85

        # Ajustar basado en estado de componentes
        if self._calculate_overall_status() == "operational":
            return min(0.95, base_level + 0.05)
        elif self._calculate_overall_status() == "degraded":
            return max(0.70, base_level - 0.10)
        else:
            return max(0.60, base_level - 0.20)

    def _get_active_components(self) -> list:
        """Obtener lista de componentes activos"""
        active = []
        for component_name, status in self.component_status.items():
            if status.get('status') == 'online':
                active.append(component_name.replace('_', '_'))

        # Asegurar componentes básicos
        base_components = ["trading_engine", "quantum_analyzer", "risk_manager"]
        return list(set(active + base_components))

    async def _get_market_data(self) -> Dict[str, Any]:
        """Obtener datos de mercado actuales"""
        # Simulación - en producción conectaría con APIs reales
        return {
            "btc_price": 45000.50,
            "eth_price": 2450.75,
            "market_volatility": 0.15,
            "fear_greed_index": 65,
            "last_update": datetime.now().isoformat()
        }

    async def execute_system_command(self, command: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Ejecutar comando en el sistema QBTC"""
        self.logger.info(f"🎯 Ejecutando comando del sistema: {command}")

        # Mapeo de comandos a endpoints
        command_mapping = {
            'restart_quantum_analysis': {
                'endpoint': 'quantum_analysis',
                'method': 'POST',
                'path': '/api/system/restart'
            },
            'get_trading_metrics': {
                'endpoint': 'trading_metrics',
                'method': 'GET',
                'path': '/api/metrics/performance'
            },
            'sync_akashic_data': {
                'endpoint': 'akashic_system',
                'method': 'POST',
                'path': '/api/akashic/sync'
            },
            'system_health_check': {
                'endpoint': 'master_control',
                'method': 'GET',
                'path': '/api/system/health'
            }
        }

        if command not in command_mapping:
            return {
                'success': False,
                'error': f'Comando no reconocido: {command}',
                'available_commands': list(command_mapping.keys())
            }

        cmd_config = command_mapping[command]
        endpoint_info = self.component_status.get(cmd_config['endpoint'])

        if not endpoint_info or endpoint_info.get('status') != 'online':
            return {
                'success': False,
                'error': f'Componente {cmd_config["endpoint"]} no disponible',
                'component_status': endpoint_info
            }

        try:
            url = f"{self.system_endpoints[cmd_config['endpoint']]}{cmd_config['path']}"

            if cmd_config['method'] == 'GET':
                async with self.session.get(url, timeout=30) as response:
                    result = await response.json()
            elif cmd_config['method'] == 'POST':
                async with self.session.post(url, json=params or {}, timeout=30) as response:
                    result = await response.json()
            else:
                return {
                    'success': False,
                    'error': f'Método HTTP no soportado: {cmd_config["method"]}'
                }

            return {
                'success': True,
                'command': command,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Error ejecutando comando {command}: {e}")
            return {
                'success': False,
                'error': str(e),
                'command': command
            }

    async def get_real_time_insights(self) -> Dict[str, Any]:
        """Obtener insights en tiempo real del sistema QBTC"""
        insights = {
            'timestamp': datetime.now().isoformat(),
            'system_health': self._calculate_overall_status(),
            'active_components': len(self._get_active_components()),
            'consciousness_level': await self._get_consciousness_level(),
            'trading_performance': await self.get_trading_metrics(),
            'quantum_coherence': await self._get_quantum_coherence(),
            'recommendations': []
        }

        # Generar recomendaciones basadas en el estado
        if insights['system_health'] == 'critical':
            insights['recommendations'].append('🚨 Sistema en estado crítico - revisar componentes fallidos')
        elif insights['system_health'] == 'degraded':
            insights['recommendations'].append('⚠️ Sistema degradado - optimizar componentes')
        else:
            insights['recommendations'].append('✅ Sistema operativo - monitoreo continuo')

        if insights['consciousness_level'] < 0.8:
            insights['recommendations'].append('🧠 Nivel de consciencia bajo - considerar reinicio de componentes')

        return insights

    async def _get_quantum_coherence(self) -> float:
        """Obtener coherencia cuántica del sistema"""
        # Simulación - en producción calcularía basado en métricas reales
        base_coherence = 0.90

        # Ajustar basado en estado de componentes
        online_count = sum(1 for comp in self.component_status.values()
                          if comp.get('status') == 'online')
        total_count = len(self.component_status)

        if total_count > 0:
            health_factor = online_count / total_count
            return base_coherence * health_factor
        else:
            return base_coherence

    async def cleanup(self):
        """Limpiar recursos"""
        if self.session:
            await self.session.close()
        self.logger.info("🧹 Recursos de integración QBTC limpiados")

    async def periodic_sync(self, interval_seconds: int = 60):
        """Sincronización periódica con el sistema QBTC"""
        while True:
            try:
                await self.sync_system_state()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                self.logger.error(f"Error en sincronización periódica: {e}")
                await asyncio.sleep(interval_seconds)


# Extensión del OpenRouterCopilot con integración QBTC
class QBTCEnhancedCopilot(OpenRouterCopilot):
    """Gemini Copilot mejorado con integración completa QBTC"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.system_integrator = None
        self.command_system = QBTCCommands()

    async def initialize_with_qbtc(self):
        """Inicialización completa con integración QBTC"""
        # Inicializar copilot base
        await self.chat("Hola, inicializando QBTC Master Copilot")  # Dummy para inicializar

        # Inicializar integrador del sistema
        self.system_integrator = QBTCSystemIntegrator(self)
        await self.system_integrator.initialize()

        print("🎉 QBTC Master Copilot completamente inicializado con integración del sistema")

    async def enhanced_chat(self, user_message: str) -> str:
        """Chat mejorado con contexto QBTC real"""
        # Sincronizar estado del sistema antes de responder
        if self.system_integrator:
            await self.system_integrator.sync_system_state()

        # Obtener insights en tiempo real
        real_time_insights = await self.system_integrator.get_real_time_insights()

        # Enriquecer el mensaje con contexto real
        enhanced_message = f"""
Mensaje del usuario: {user_message}

CONTEXTO QBTC REAL-TIME:
- Estado del sistema: {real_time_insights['system_health']}
- Nivel de consciencia: {real_time_insights['consciousness_level']:.2%}
- Componentes activos: {real_time_insights['active_components']}
- Coherencia cuántica: {real_time_insights.get('quantum_coherence', 0):.2%}

INFORMACIÓN ADICIONAL:
Basado en las recomendaciones del sistema: {', '.join(real_time_insights.get('recommendations', []))}
"""

        # Procesar con Gemini
        response = await self.chat(enhanced_message)

        # Verificar si hay comandos del sistema en la respuesta
        if self._contains_system_commands(response):
            command_result = await self._execute_detected_commands(response)
            if command_result:
                response += f"\n\n📊 Resultado de comando del sistema:\n{command_result}"

        return response

    def _contains_system_commands(self, response: str) -> bool:
        """Verificar si la respuesta contiene comandos del sistema QBTC"""
        # Comandos avanzados del sistema QBTC
        advanced_commands = self.command_system.get_available_commands()
        command_keywords = [
            'reiniciar', 'restart', 'sincronizar', 'sync',
            'obtener métricas', 'get metrics', 'analizar', 'analyze',
            'verificar estado', 'check status', 'estado sistema', 'system status',
            'optimizar estrategia', 'optimize strategy', 'ejecutar orden', 'execute order',
            'ver posiciones', 'view positions', 'analizar riesgo', 'risk analysis',
            'generar reporte', 'generate report', 'monitorear alertas', 'monitor alerts'
        ] + advanced_commands

        response_lower = response.lower()
        return any(keyword in response_lower for keyword in command_keywords)

    async def _execute_detected_commands(self, response: str) -> Optional[str]:
        """Ejecutar comandos detectados en la respuesta usando el sistema avanzado de comandos QBTC"""
        response_lower = response.lower()

        # Mapeo de comandos avanzados QBTC
        command_mapping = {
            'estado_sistema': 'estado_sistema',
            'system_status': 'estado_sistema',
            'analizar_mercado': 'analizar_mercado',
            'consultar_metricas': 'consultar_metricas',
            'get_metrics': 'consultar_metricas',
            'optimizar_estrategia': 'optimizar_estrategia',
            'optimize_strategy': 'optimizar_estrategia',
            'ejecutar_orden': 'ejecutar_orden',
            'execute_order': 'ejecutar_orden',
            'ver_posiciones': 'ver_posiciones',
            'view_positions': 'ver_posiciones',
            'analizar_riesgo': 'analizar_riesgo',
            'risk_analysis': 'analizar_riesgo',
            'generar_reporte': 'generar_reporte',
            'generate_report': 'generar_reporte',
            'monitorear_alertas': 'monitorear_alertas',
            'monitor_alerts': 'monitorear_alertas'
        }

        # Detectar comando específico
        detected_command = None
        command_params = {}

        for keyword, command in command_mapping.items():
            if keyword in response_lower:
                detected_command = command
                break

        # Extraer parámetros si es necesario
        if 'btc' in response_lower or 'bitcoin' in response_lower:
            command_params['symbol'] = 'BTCUSDT'
        elif 'eth' in response_lower or 'ethereum' in response_lower:
            command_params['symbol'] = 'ETHUSDT'

        if '24h' in response_lower or 'diario' in response_lower:
            command_params['timeframe'] = '24h'
        elif '1h' in response_lower:
            command_params['timeframe'] = '1h'

        # Ejecutar comando si fue detectado
        if detected_command:
            try:
                result = await self.command_system.execute_command(detected_command, command_params)

                if result.success:
                    return f"✅ Comando '{detected_command}' ejecutado exitosamente:\n{json.dumps(result.result, indent=2, ensure_ascii=False)}"
                else:
                    return f"❌ Error en comando '{detected_command}': {result.message}"

            except Exception as e:
                return f"❌ Error ejecutando comando '{detected_command}': {str(e)}"

        # Comandos legacy del sistema integrador
        if 'reiniciar' in response_lower and 'quantum' in response_lower:
            result = await self.system_integrator.execute_system_command('restart_quantum_analysis')
            return f"🔄 Comando legacy ejecutado: {json.dumps(result, indent=2)}"

        elif 'métricas' in response_lower or 'metrics' in response_lower:
            result = await self.system_integrator.execute_system_command('get_trading_metrics')
            return f"📊 Métricas obtenidas: {json.dumps(result, indent=2)}"

        return None


async def demo_enhanced_copilot():
    """Demostración del copilot mejorado con QBTC"""
    print("🚀 QBTC Enhanced Master Copilot Demo")
    print("=" * 50)

    # Inicializar copilot mejorado
    copilot = QBTCEnhancedCopilot()
    await copilot.initialize_with_qbtc()

    print("\n🤖 Copilot listo para conversar sobre el sistema QBTC")
    print("Ejemplos de comandos:")
    print("- '¿Cómo está el sistema?'")
    print("- 'Reinicia el análisis cuántico'")
    print("- 'Obtén métricas de trading'")
    print("- 'salir' para terminar\n")

    while True:
        try:
            user_input = input("👤 Tú: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("\n👋 ¡Hasta luego! Guardando conversación...")
                copilot.save_conversation()
                if copilot.system_integrator:
                    await copilot.system_integrator.cleanup()
                break

            print("🤔 Analizando con contexto QBTC real...")
            response = await copilot.enhanced_chat(user_input)

            print(f"\n🤖 QBTC Copilot: {response}\n")

        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            if copilot.system_integrator:
                await copilot.system_integrator.cleanup()
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            continue


if __name__ == "__main__":
    # Ejecutar demo del copilot mejorado
    asyncio.run(demo_enhanced_copilot())
