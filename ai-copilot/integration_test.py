#!/usr/bin/env python3
"""
🧪 QBTC SYSTEM INTEGRATION TESTS
================================

Script para validar la integración del QBTC Master Copilot
con los componentes existentes del sistema QBTC.
"""

import asyncio
import aiohttp
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path

from qbtc_integration import QBTCSystemIntegrator, QBTCEnhancedCopilot

class QBTCIntegrationTester:
    """Probador de integración con componentes QBTC"""

    def __init__(self):
        self.test_results = {
            'connectivity_tests': {},
            'component_tests': {},
            'api_tests': {},
            'performance_tests': {}
        }

        # Componentes QBTC a probar
        self.qbtc_components = {
            'master_control': {
                'url': 'http://localhost:14001',
                'name': 'Master Control',
                'critical': True
            },
            'trading_metrics': {
                'url': 'http://localhost:8080',
                'name': 'Trading Metrics',
                'critical': False
            },
            'quantum_analysis': {
                'url': 'http://localhost:14100',
                'name': 'Quantum Analysis',
                'critical': True
            },
            'akashic_system': {
                'url': 'http://localhost:14200',
                'name': 'Akashic Records',
                'critical': False
            },
            'proxy_server': {
                'url': 'http://localhost:8443',
                'name': 'Secure Proxy',
                'critical': True
            }
        }

    async def run_full_integration_test(self) -> Dict[str, Any]:
        """Ejecutar pruebas completas de integración"""
        print("🔗 INICIANDO PRUEBAS DE INTEGRACIÓN QBTC")
        print("=" * 50)

        # Prueba 1: Conectividad básica
        await self.test_basic_connectivity()

        # Prueba 2: Componentes individuales
        await self.test_individual_components()

        # Prueba 3: APIs disponibles
        await self.test_api_endpoints()

        # Prueba 4: Integración completa
        await self.test_full_integration()

        # Prueba 5: Performance
        await self.test_integration_performance()

        # Generar reporte
        return self.generate_integration_report()

    async def test_basic_connectivity(self):
        """Probar conectividad básica con componentes QBTC"""
        print("\n🌐 TESTING BASIC CONNECTIVITY")

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            for component_id, component_info in self.qbtc_components.items():
                try:
                    print(f"   Testing {component_info['name']}...")

                    # Intentar conexión básica
                    async with session.get(f"{component_info['url']}/health") as response:
                        if response.status == 200:
                            data = await response.json()
                            self.test_results['connectivity_tests'][component_id] = {
                                'status': 'success',
                                'response_time': response.headers.get('X-Response-Time', 'unknown'),
                                'data': data
                            }
                            print(f"   ✅ {component_info['name']}: Connected")
                        else:
                            self.test_results['connectivity_tests'][component_id] = {
                                'status': 'error',
                                'error': f'HTTP {response.status}',
                                'critical': component_info['critical']
                            }
                            print(f"   ❌ {component_info['name']}: HTTP {response.status}")

                except aiohttp.ClientError as e:
                    self.test_results['connectivity_tests'][component_id] = {
                        'status': 'error',
                        'error': str(e),
                        'critical': component_info['critical']
                    }
                    print(f"   ❌ {component_info['name']}: {str(e)}")

                except Exception as e:
                    self.test_results['connectivity_tests'][component_id] = {
                        'status': 'error',
                        'error': f'Unexpected error: {str(e)}',
                        'critical': component_info['critical']
                    }
                    print(f"   ❌ {component_info['name']}: Unexpected error")

    async def test_individual_components(self):
        """Probar componentes individuales QBTC"""
        print("\n🔧 TESTING INDIVIDUAL COMPONENTS")

        # Intentar importar y probar componentes locales
        components_to_test = [
            'qbtc-secure-proxy-server.js',
            'akashic/akashic-prediction-system.js',
            'analysis-engine/quantum-analysis-server.js',
            'metrics/trading-metrics-system.js'
        ]

        for component in components_to_test:
            component_path = Path('../') / component
            print(f"   Testing {component}...")

            if component_path.exists():
                try:
                    # Verificar que el archivo es accesible
                    with open(component_path, 'r', encoding='utf-8') as f:
                        content = f.read(1000)  # Leer primeros 1000 caracteres

                    # Verificar sintaxis básica
                    if 'SyntaxError' not in content and 'Error' not in content[:200]:
                        self.test_results['component_tests'][component] = {
                            'status': 'success',
                            'file_size': len(content),
                            'readable': True
                        }
                        print(f"   ✅ {component}: Accessible")
                    else:
                        self.test_results['component_tests'][component] = {
                            'status': 'warning',
                            'message': 'Possible syntax issues detected'
                        }
                        print(f"   ⚠️  {component}: Possible syntax issues")

                except Exception as e:
                    self.test_results['component_tests'][component] = {
                        'status': 'error',
                        'error': str(e)
                    }
                    print(f"   ❌ {component}: {str(e)}")
            else:
                self.test_results['component_tests'][component] = {
                    'status': 'not_found'
                }
                print(f"   ❌ {component}: File not found")

    async def test_api_endpoints(self):
        """Probar endpoints de API disponibles"""
        print("\n🔌 TESTING API ENDPOINTS")

        api_endpoints = [
            {'url': 'http://localhost:3000/api/status', 'name': 'Main API Status'},
            {'url': 'http://localhost:8080/metrics', 'name': 'Metrics API'},
            {'url': 'http://localhost:8443/api/system', 'name': 'Proxy API'},
            {'url': 'http://localhost:14100/analysis', 'name': 'Quantum Analysis API'}
        ]

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
            for endpoint in api_endpoints:
                try:
                    print(f"   Testing {endpoint['name']}...")

                    async with session.get(endpoint['url']) as response:
                        if response.status in [200, 201, 202]:
                            self.test_results['api_tests'][endpoint['name']] = {
                                'status': 'success',
                                'status_code': response.status,
                                'content_type': response.headers.get('content-type', 'unknown')
                            }
                            print(f"   ✅ {endpoint['name']}: {response.status}")
                        else:
                            self.test_results['api_tests'][endpoint['name']] = {
                                'status': 'warning',
                                'status_code': response.status,
                                'message': f'Unexpected status code'
                            }
                            print(f"   ⚠️  {endpoint['name']}: {response.status}")

                except Exception as e:
                    self.test_results['api_tests'][endpoint['name']] = {
                        'status': 'error',
                        'error': str(e)
                    }
                    print(f"   ❌ {endpoint['name']}: {str(e)}")

    async def test_full_integration(self):
        """Probar integración completa del Master Copilot"""
        print("\n🔄 TESTING FULL INTEGRATION")

        try:
            print("   Testing QBTC Enhanced Copilot...")

            # Crear instancia del copilot
            copilot = QBTCEnhancedCopilot()

            # Probar inicialización
            await copilot.initialize_with_qbtc()

            # Probar comando básico
            test_message = "estado del sistema"
            response = await copilot.enhanced_chat(test_message)

            if response and len(response) > 10:
                self.test_results['component_tests']['enhanced_copilot'] = {
                    'status': 'success',
                    'response_length': len(response),
                    'test_message': test_message
                }
                print("   ✅ QBTC Enhanced Copilot: Functional")
            else:
                self.test_results['component_tests']['enhanced_copilot'] = {
                    'status': 'warning',
                    'message': 'Response too short or empty'
                }
                print("   ⚠️  QBTC Enhanced Copilot: Weak response")

        except Exception as e:
            self.test_results['component_tests']['enhanced_copilot'] = {
                'status': 'error',
                'error': str(e)
            }
            print(f"   ❌ QBTC Enhanced Copilot: {str(e)}")

    async def test_integration_performance(self):
        """Probar performance de la integración"""
        print("\n⚡ TESTING INTEGRATION PERFORMANCE")

        try:
            print("   Testing command execution performance...")

            # Medir tiempo de ejecución de comandos
            import time
            from qbtc_commands import QBTCCommands

            command_system = QBTCCommands()

            # Ejecutar varios comandos y medir tiempos
            commands_to_test = ['estado_sistema', 'consultar_metricas', 'analizar_mercado']
            execution_times = []

            for cmd in commands_to_test:
                start_time = time.time()
                result = await command_system.execute_command(cmd)
                end_time = time.time()

                execution_time = end_time - start_time
                execution_times.append(execution_time)

                if result.success:
                    print(f"   ✅ {cmd}: {execution_time:.3f}s")
                else:
                    print(f"   ❌ {cmd}: {execution_time:.3f}s (failed)")
            # Calcular métricas de performance
            avg_time = sum(execution_times) / len(execution_times)
            max_time = max(execution_times)
            min_time = min(execution_times)

            self.test_results['performance_tests'] = {
                'status': 'success',
                'average_execution_time': avg_time,
                'max_execution_time': max_time,
                'min_execution_time': min_time,
                'commands_tested': len(commands_to_test)
            }

            print(f"   📊 Average execution time: {avg_time:.3f}s")
        except Exception as e:
            self.test_results['performance_tests'] = {
                'status': 'error',
                'error': str(e)
            }
            print(f"   ❌ Performance test failed: {str(e)}")

    def generate_integration_report(self) -> Dict[str, Any]:
        """Generar reporte completo de integración"""
        print("\n📊 INTEGRATION TEST REPORT")
        print("=" * 50)

        # Calcular estadísticas generales
        total_tests = 0
        successful_tests = 0
        critical_failures = 0

        # Analizar resultados de conectividad
        connectivity_success = 0
        connectivity_total = len(self.test_results['connectivity_tests'])

        for component_id, result in self.test_results['connectivity_tests'].items():
            if result['status'] == 'success':
                connectivity_success += 1
                successful_tests += 1
            elif result.get('critical', False):
                critical_failures += 1

        total_tests += connectivity_total

        # Analizar resultados de componentes
        component_success = 0
        component_total = len(self.test_results['component_tests'])

        for component, result in self.test_results['component_tests'].items():
            if result['status'] == 'success':
                component_success += 1
                successful_tests += 1

        total_tests += component_total

        # Calcular porcentaje de éxito
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0

        # Generar recomendaciones
        recommendations = []

        if critical_failures > 0:
            recommendations.append("🔴 CRÍTICO: Revisar componentes críticos que fallaron")
        elif success_rate < 70:
            recommendations.append("🟡 ATENCIÓN: Menos del 70% de pruebas exitosas")
        else:
            recommendations.append("🟢 BUENO: Integración funcionando correctamente")

        if connectivity_success < connectivity_total:
            recommendations.append("📡 Mejorar conectividad con componentes QBTC")
        if component_success < component_total:
            recommendations.append("🔧 Revisar componentes locales QBTC")

        # Reporte final
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_tests': total_tests,
                'successful_tests': successful_tests,
                'success_rate': round(success_rate, 1),
                'critical_failures': critical_failures,
                'connectivity_score': f"{connectivity_success}/{connectivity_total}",
                'component_score': f"{component_success}/{component_total}"
            },
            'detailed_results': self.test_results,
            'recommendations': recommendations,
            'overall_status': 'healthy' if success_rate >= 80 and critical_failures == 0 else 'warning' if success_rate >= 60 else 'critical'
        }

        # Mostrar resumen
        print(f"📈 Success Rate: {success_rate:.1f}% ({successful_tests}/{total_tests})")
        print(f"🌐 Connectivity: {connectivity_success}/{connectivity_total}")
        print(f"🔧 Components: {component_success}/{component_total}")
        print(f"🚨 Critical Failures: {critical_failures}")

        print("\n💡 Recommendations:")
        for rec in recommendations:
            print(f"   • {rec}")

        print(f"\n🎯 Overall Status: {report['overall_status'].upper()}")

        return report

async def main():
    """Función principal"""
    print("🚀 QBTC System Integration Tester")
    print("=" * 40)

    tester = QBTCIntegrationTester()

    # Ejecutar pruebas completas
    report = await tester.run_full_integration_test()

    # Guardar reporte
    report_file = Path("integration_test_report.json")
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False, default=str)

    print(f"\n💾 Report saved to: {report_file}")

    # Evaluar si la integración está lista
    if report['overall_status'] == 'healthy':
        print("✅ INTEGRATION READY: El sistema está listo para uso en producción")
    elif report['overall_status'] == 'warning':
        print("⚠️  INTEGRATION NEEDS ATTENTION: Revisar recomendaciones antes de producción")
    else:
        print("❌ INTEGRATION CRITICAL: Solucionar problemas críticos antes de continuar")

if __name__ == "__main__":
    asyncio.run(main())
