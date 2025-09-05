#!/usr/bin/env python3
"""
🛟 QBTC FALLBACK & ERROR RECOVERY SYSTEM
=========================================

Sistema completo de respaldo y recuperación de errores para el
QBTC Master Copilot.

Características:
- Health monitoring en tiempo real
- Circuit breaker pattern
- Failover automático
- Estrategias de recuperación
- Redundancia de datos
- Monitoreo de resiliencia
- Gestión de contingencias
"""

import asyncio
import time
from typing import Dict, List, Any, Optional, Callable, Awaitable
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field
import logging
import statistics
from concurrent.futures import ThreadPoolExecutor

from real_data_connector import BinanceConnector
from websocket_streamer import BinanceWebSocketStreamer
from intelligent_cache import IntelligentCache
from data_validator import RealTimeDataValidator

class SystemStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    FAILED = "failed"
    RECOVERING = "recovering"

class ComponentStatus(Enum):
    ACTIVE = "active"
    STANDBY = "standby"
    FAILED = "failed"
    RECOVERING = "recovering"
    MAINTENANCE = "maintenance"

class FailureType(Enum):
    NETWORK_ERROR = "network_error"
    API_ERROR = "api_error"
    DATA_CORRUPTION = "data_corruption"
    TIMEOUT = "timeout"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    CONFIGURATION_ERROR = "configuration_error"
    UNKNOWN = "unknown"

@dataclass
class HealthMetrics:
    """Métricas de salud del sistema"""
    response_time: float = 0.0
    error_rate: float = 0.0
    success_rate: float = 1.0
    uptime_percentage: float = 100.0
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    consecutive_failures: int = 0
    total_requests: int = 0
    successful_requests: int = 0

@dataclass
class ComponentState:
    """Estado de un componente del sistema"""
    name: str
    status: ComponentStatus
    health_metrics: HealthMetrics = field(default_factory=HealthMetrics)
    last_check: Optional[datetime] = None
    failover_count: int = 0
    recovery_attempts: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FailureEvent:
    """Evento de fallo del sistema"""
    component: str
    failure_type: FailureType
    timestamp: datetime
    error_message: str
    severity: str
    recovery_action: Optional[str] = None
    resolved: bool = False
    resolution_time: Optional[datetime] = None

class CircuitBreakerState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Circuit is open, failing fast
    HALF_OPEN = "half_open"  # Testing if service recovered

class CircuitBreaker:
    """Implementación del patrón Circuit Breaker"""

    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60,
                 success_threshold: int = 3):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold

        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

    async def call(self, func: Callable[[], Awaitable[Any]], *args, **kwargs) -> Any:
        """Ejecutar función con protección de circuit breaker"""

        if self.state == CircuitBreakerState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitBreakerState.HALF_OPEN
                self.success_count = 0
            else:
                raise Exception("Circuit breaker is OPEN")

        try:
            result = await func(*args, **kwargs)

            if self.state == CircuitBreakerState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self._reset()
            else:
                self.failure_count = 0

            return result

        except Exception as e:
            self._record_failure()
            raise e

    def _record_failure(self):
        """Registrar un fallo"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitBreakerState.OPEN

    def _should_attempt_reset(self) -> bool:
        """Verificar si debe intentar resetear"""
        if self.last_failure_time is None:
            return True

        time_since_failure = (datetime.now() - self.last_failure_time).total_seconds()
        return time_since_failure >= self.recovery_timeout

    def _reset(self):
        """Resetear el circuit breaker"""
        self.state = CircuitBreakerState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

    def get_status(self) -> Dict[str, Any]:
        """Obtener estado del circuit breaker"""
        return {
            'state': self.state.value,
            'failure_count': self.failure_count,
            'success_count': self.success_count,
            'last_failure': self.last_failure_time.isoformat() if self.last_failure_time else None
        }

class FallbackSystem:
    """Sistema de respaldo y recuperación de errores"""

    def __init__(self):
        self.components: Dict[str, ComponentState] = {}
        self.failure_history: List[FailureEvent] = []
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}

        # Configuración de respaldo
        self.health_check_interval = 30  # segundos
        self.max_recovery_attempts = 3
        self.failover_timeout = 60  # segundos
        self.backup_data_sources = []

        # Logging
        self.logger = logging.getLogger('FallbackSystem')
        self.logger.setLevel(logging.INFO)

        # Callbacks
        self.on_failure: Optional[Callable[[FailureEvent], None]] = None
        self.on_recovery: Optional[Callable[[str], None]] = None
        self.on_failover: Optional[Callable[[str, str], None]] = None

        # Inicializar componentes críticos
        self._initialize_critical_components()

    def _initialize_critical_components(self):
        """Inicializar componentes críticos del sistema"""

        critical_components = [
            "binance_api",
            "websocket_stream",
            "data_cache",
            "data_validator",
            "historical_data",
            "market_analyzer",
            "alerts_system"
        ]

        for component in critical_components:
            self.components[component] = ComponentState(
                name=component,
                status=ComponentStatus.STANDBY
            )

            # Crear circuit breaker para cada componente
            self.circuit_breakers[component] = CircuitBreaker()

    async def initialize(self):
        """Inicializar el sistema de respaldo"""
        self.logger.info("🛟 Initializing Fallback System")

        # Iniciar monitoreo de salud
        asyncio.create_task(self._health_monitoring_loop())

        # Configurar handlers de respaldo
        await self._setup_backup_handlers()

        self.logger.info("🛟 Fallback System initialized")

    async def register_component(self, name: str, health_check_func: Optional[Callable] = None,
                               recovery_func: Optional[Callable] = None):
        """Registrar un componente en el sistema de respaldo"""

        if name not in self.components:
            self.components[name] = ComponentState(
                name=name,
                status=ComponentStatus.STANDBY
            )
            self.circuit_breakers[name] = CircuitBreaker()

        if health_check_func:
            self.components[name].metadata['health_check'] = health_check_func

        if recovery_func:
            self.components[name].metadata['recovery_func'] = recovery_func

    async def report_component_failure(self, component_name: str, failure_type: FailureType,
                                     error_message: str, severity: str = "error"):
        """Reportar fallo de un componente"""

        failure_event = FailureEvent(
            component=component_name,
            failure_type=failure_type,
            timestamp=datetime.now(),
            error_message=error_message,
            severity=severity
        )

        self.failure_history.append(failure_event)

        # Actualizar estado del componente
        if component_name in self.components:
            component = self.components[component_name]
            component.status = ComponentStatus.FAILED
            component.health_metrics.consecutive_failures += 1
            component.health_metrics.last_failure = failure_event.timestamp

            # Intentar recuperación automática
            asyncio.create_task(self._attempt_recovery(component_name))

        # Notificar callback
        if self.on_failure:
            try:
                await self.on_failure(failure_event)
            except Exception as e:
                self.logger.error(f"Error in failure callback: {str(e)}")

        self.logger.error(f"❌ Component {component_name} failed: {error_message}")

    async def report_component_recovery(self, component_name: str):
        """Reportar recuperación de un componente"""

        if component_name in self.components:
            component = self.components[component_name]
            component.status = ComponentStatus.ACTIVE
            component.health_metrics.consecutive_failures = 0
            component.health_metrics.last_success = datetime.now()

            # Actualizar eventos de fallo pendientes
            for failure in self.failure_history:
                if failure.component == component_name and not failure.resolved:
                    failure.resolved = True
                    failure.resolution_time = datetime.now()
                    break

        # Notificar callback
        if self.on_recovery:
            try:
                await self.on_recovery(component_name)
            except Exception as e:
                self.logger.error(f"Error in recovery callback: {str(e)}")

        self.logger.info(f"✅ Component {component_name} recovered")

    async def execute_with_fallback(self, primary_func: Callable[[], Awaitable[Any]],
                                  fallback_funcs: List[Callable[[], Awaitable[Any]]],
                                  component_name: str) -> Any:
        """Ejecutar función con respaldo automático"""

        # Intentar función primaria con circuit breaker
        if component_name in self.circuit_breakers:
            circuit_breaker = self.circuit_breakers[component_name]

            try:
                result = await circuit_breaker.call(primary_func)
                await self._update_component_health(component_name, success=True)
                return result

            except Exception as e:
                self.logger.warning(f"Primary function failed for {component_name}: {str(e)}")

                # Intentar funciones de respaldo
                for i, fallback_func in enumerate(fallback_funcs):
                    try:
                        self.logger.info(f"Trying fallback {i+1} for {component_name}")
                        result = await fallback_func()
                        await self._update_component_health(component_name, success=True)
                        return result
                    except Exception as fallback_error:
                        self.logger.warning(f"Fallback {i+1} failed: {str(fallback_error)}")

                # Todas las funciones fallaron
                await self.report_component_failure(
                    component_name,
                    FailureType.UNKNOWN,
                    f"All functions failed: {str(e)}"
                )
                raise e
        else:
            # Sin circuit breaker, ejecutar directamente
            return await primary_func()

    async def get_system_health(self) -> Dict[str, Any]:
        """Obtener estado de salud general del sistema"""

        total_components = len(self.components)
        failed_components = sum(1 for c in self.components.values() if c.status == ComponentStatus.FAILED)
        active_components = sum(1 for c in self.components.values() if c.status == ComponentStatus.ACTIVE)

        # Calcular overall health score
        health_score = (active_components / total_components) * 100 if total_components > 0 else 0

        # Determinar estado general
        if failed_components == 0:
            overall_status = SystemStatus.HEALTHY
        elif failed_components / total_components > 0.5:
            overall_status = SystemStatus.CRITICAL
        elif failed_components > 0:
            overall_status = SystemStatus.DEGRADED
        else:
            overall_status = SystemStatus.HEALTHY

        # Estadísticas de fallos recientes
        recent_failures = [
            f for f in self.failure_history
            if (datetime.now() - f.timestamp).total_seconds() < 3600  # Última hora
        ]

        return {
            'overall_status': overall_status.value,
            'health_score': health_score,
            'total_components': total_components,
            'active_components': active_components,
            'failed_components': failed_components,
            'recent_failures': len(recent_failures),
            'uptime_percentage': self._calculate_uptime_percentage(),
            'component_details': {
                name: {
                    'status': comp.status.value,
                    'health_score': self._calculate_component_health_score(comp),
                    'last_check': comp.last_check.isoformat() if comp.last_check else None,
                    'failover_count': comp.failover_count
                }
                for name, comp in self.components.items()
            }
        }

    async def trigger_failover(self, component_name: str, target_component: Optional[str] = None):
        """Disparar failover manual"""

        if component_name not in self.components:
            raise ValueError(f"Component {component_name} not registered")

        component = self.components[component_name]

        if component.status == ComponentStatus.ACTIVE:
            component.status = ComponentStatus.STANDBY
            component.failover_count += 1

            # Notificar failover
            if self.on_failover:
                try:
                    await self.on_failover(component_name, target_component or "backup")
                except Exception as e:
                    self.logger.error(f"Error in failover callback: {str(e)}")

            self.logger.info(f"🔄 Failover triggered for {component_name}")

    async def _health_monitoring_loop(self):
        """Loop de monitoreo de salud continuo"""

        while True:
            try:
                # Verificar salud de todos los componentes
                for component_name, component in self.components.items():
                    if 'health_check' in component.metadata:
                        health_check_func = component.metadata['health_check']

                        try:
                            is_healthy = await health_check_func()
                            component.last_check = datetime.now()

                            if is_healthy and component.status == ComponentStatus.FAILED:
                                await self.report_component_recovery(component_name)
                            elif not is_healthy and component.status == ComponentStatus.ACTIVE:
                                await self.report_component_failure(
                                    component_name,
                                    FailureType.UNKNOWN,
                                    "Health check failed",
                                    "warning"
                                )

                        except Exception as e:
                            self.logger.error(f"Health check failed for {component_name}: {str(e)}")

                await asyncio.sleep(self.health_check_interval)

            except Exception as e:
                self.logger.error(f"Error in health monitoring: {str(e)}")
                await asyncio.sleep(self.health_check_interval)

    async def _attempt_recovery(self, component_name: str):
        """Intentar recuperación automática de un componente"""

        component = self.components[component_name]
        component.recovery_attempts += 1

        if component.recovery_attempts > self.max_recovery_attempts:
            self.logger.warning(f"Max recovery attempts reached for {component_name}")
            return

        if 'recovery_func' in component.metadata:
            recovery_func = component.metadata['recovery_func']

            try:
                self.logger.info(f"Attempting recovery for {component_name} (attempt {component.recovery_attempts})")
                component.status = ComponentStatus.RECOVERING

                success = await recovery_func()

                if success:
                    await self.report_component_recovery(component_name)
                    component.recovery_attempts = 0
                else:
                    # Reintentar después de un delay
                    await asyncio.sleep(self.failover_timeout)
                    asyncio.create_task(self._attempt_recovery(component_name))

            except Exception as e:
                self.logger.error(f"Recovery failed for {component_name}: {str(e)}")

                # Reintentar después de un delay
                await asyncio.sleep(self.failover_timeout)
                asyncio.create_task(self._attempt_recovery(component_name))

    async def _update_component_health(self, component_name: str, success: bool):
        """Actualizar métricas de salud de un componente"""

        if component_name not in self.components:
            return

        component = self.components[component_name]
        metrics = component.health_metrics

        metrics.total_requests += 1

        if success:
            metrics.successful_requests += 1
            metrics.last_success = datetime.now()
            metrics.consecutive_failures = 0
        else:
            metrics.last_failure = datetime.now()
            metrics.consecutive_failures += 1

        # Calcular métricas derivadas
        if metrics.total_requests > 0:
            metrics.success_rate = metrics.successful_requests / metrics.total_requests
            metrics.error_rate = 1 - metrics.success_rate

    async def _setup_backup_handlers(self):
        """Configurar handlers de respaldo para componentes críticos"""

        # Configurar respaldo para API de Binance
        await self.register_component(
            "binance_api",
            health_check_func=self._check_binance_health,
            recovery_func=self._recover_binance_connection
        )

        # Configurar respaldo para WebSocket
        await self.register_component(
            "websocket_stream",
            health_check_func=self._check_websocket_health,
            recovery_func=self._recover_websocket_connection
        )

        # Configurar respaldo para caché
        await self.register_component(
            "data_cache",
            health_check_func=self._check_cache_health,
            recovery_func=self._recover_cache
        )

    async def _check_binance_health(self) -> bool:
        """Verificar salud de la conexión Binance"""
        try:
            connector = BinanceConnector()
            await connector.initialize()

            # Intentar una llamada simple
            result = await connector.get_ticker_price("BTCUSDT")

            await connector.close()
            return result.success

        except Exception as e:
            self.logger.error(f"Binance health check failed: {str(e)}")
            return False

    async def _recover_binance_connection(self) -> bool:
        """Recuperar conexión Binance"""
        try:
            # Intentar reinicializar
            connector = BinanceConnector()
            await connector.initialize()

            # Verificar que funciona
            result = await connector.get_ticker_price("BTCUSDT")
            success = result.success

            await connector.close()
            return success

        except Exception as e:
            self.logger.error(f"Binance recovery failed: {str(e)}")
            return False

    async def _check_websocket_health(self) -> bool:
        """Verificar salud del WebSocket"""
        # Implementación simplificada - en producción verificar conexiones activas
        return True

    async def _recover_websocket_connection(self) -> bool:
        """Recuperar conexión WebSocket"""
        # Implementación simplificada - en producción reconectar streams
        return True

    async def _check_cache_health(self) -> bool:
        """Verificar salud del caché"""
        try:
            cache = IntelligentCache(max_memory_mb=10)
            await cache.set("health_test", "test_value", ttl=60)
            result = await cache.get("health_test")
            await cache.close()
            return result == "test_value"
        except Exception as e:
            self.logger.error(f"Cache health check failed: {str(e)}")
            return False

    async def _recover_cache(self) -> bool:
        """Recuperar caché"""
        try:
            cache = IntelligentCache(max_memory_mb=10)
            await cache.clear()
            await cache.close()
            return True
        except Exception as e:
            self.logger.error(f"Cache recovery failed: {str(e)}")
            return False

    def _calculate_uptime_percentage(self) -> float:
        """Calcular porcentaje de uptime del sistema"""

        if not self.failure_history:
            return 100.0

        # Calcular tiempo total desde el primer evento
        first_event = min(f.timestamp for f in self.failure_history)
        total_time = (datetime.now() - first_event).total_seconds()

        if total_time <= 0:
            return 100.0

        # Calcular tiempo de downtime (tiempo entre fallos no resueltos)
        downtime = 0
        current_downtime_start = None

        for failure in sorted(self.failure_history, key=lambda x: x.timestamp):
            if not failure.resolved and current_downtime_start is None:
                current_downtime_start = failure.timestamp
            elif failure.resolved and current_downtime_start:
                downtime += (failure.resolution_time - current_downtime_start).total_seconds()
                current_downtime_start = None

        # Calcular uptime percentage
        uptime_percentage = ((total_time - downtime) / total_time) * 100
        return max(0, min(100, uptime_percentage))

    def _calculate_component_health_score(self, component: ComponentState) -> float:
        """Calcular score de salud de un componente"""

        metrics = component.health_metrics

        if metrics.total_requests == 0:
            return 100.0 if component.status == ComponentStatus.ACTIVE else 0.0

        # Puntuación basada en success rate
        health_score = metrics.success_rate * 100

        # Penalizar por fallos consecutivos
        if metrics.consecutive_failures > 0:
            health_score -= min(metrics.consecutive_failures * 10, 50)

        # Penalizar por tiempo desde último éxito
        if metrics.last_success:
            time_since_success = (datetime.now() - metrics.last_success).total_seconds()
            if time_since_success > 300:  # 5 minutos
                health_score -= min(time_since_success / 60, 20)  # Máximo 20 puntos

        return max(0, min(100, health_score))

    def get_failure_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generar reporte de fallos"""

        cutoff_time = datetime.now() - timedelta(hours=hours)

        recent_failures = [
            f for f in self.failure_history
            if f.timestamp >= cutoff_time
        ]

        failure_by_type = {}
        failure_by_component = {}

        for failure in recent_failures:
            # Por tipo
            ftype = failure.failure_type.value
            if ftype not in failure_by_type:
                failure_by_type[ftype] = 0
            failure_by_type[ftype] += 1

            # Por componente
            if failure.component not in failure_by_component:
                failure_by_component[failure.component] = 0
            failure_by_component[failure.component] += 1

        return {
            'total_failures': len(recent_failures),
            'failures_by_type': failure_by_type,
            'failures_by_component': failure_by_component,
            'unresolved_failures': sum(1 for f in recent_failures if not f.resolved),
            'average_resolution_time': self._calculate_average_resolution_time(recent_failures)
        }

    def _calculate_average_resolution_time(self, failures: List[FailureEvent]) -> Optional[float]:
        """Calcular tiempo promedio de resolución"""

        resolved_failures = [f for f in failures if f.resolved and f.resolution_time]

        if not resolved_failures:
            return None

        resolution_times = [
            (f.resolution_time - f.timestamp).total_seconds()
            for f in resolved_failures
        ]

        return statistics.mean(resolution_times) if resolution_times else None

    async def close(self):
        """Cerrar el sistema de respaldo"""
        self.logger.info("🛟 Fallback System closed")

# Función de test
async def test_fallback_system():
    """Test del sistema de respaldo"""

    print("🧪 Testing Fallback System")
    print("=" * 40)

    system = FallbackSystem()

    try:
        # Inicializar
        print("🔗 Initializing...")
        await system.initialize()

        # Registrar componente de prueba
        async def mock_health_check():
            return True

        async def mock_recovery():
            return True

        await system.register_component(
            "test_component",
            health_check_func=mock_health_check,
            recovery_func=mock_recovery
        )

        # Simular fallo
        print("\n❌ Simulating component failure...")
        await system.report_component_failure(
            "test_component",
            FailureType.NETWORK_ERROR,
            "Simulated network error"
        )

        # Esperar recuperación
        await asyncio.sleep(2)

        # Simular recuperación
        print("✅ Simulating component recovery...")
        await system.report_component_recovery("test_component")

        # Obtener estado de salud
        print("\n📊 Getting system health...")
        health = await system.get_system_health()

        print(f"   Overall status: {health['overall_status']}")
        print(f"   Health score: {health['health_score']:.1f}%")
        print(f"   Active components: {health['active_components']}/{health['total_components']}")

        # Obtener reporte de fallos
        print("\n📋 Getting failure report...")
        report = system.get_failure_report(hours=1)

        print(f"   Total failures: {report['total_failures']}")
        print(f"   Unresolved failures: {report['unresolved_failures']}")

        # Test circuit breaker
        print("\n🔌 Testing circuit breaker...")

        breaker = CircuitBreaker(failure_threshold=2, recovery_timeout=5)

        # Función que falla
        async def failing_func():
            raise Exception("Test failure")

        # Función que funciona
        async def working_func():
            return "success"

        # Probar fallos
        try:
            await breaker.call(failing_func)
        except:
            pass

        try:
            await breaker.call(failing_func)
        except:
            pass

        print(f"   Circuit breaker state: {breaker.get_status()['state']}")

        # Esperar recuperación
        await asyncio.sleep(6)

        # Probar recuperación
        result = await breaker.call(working_func)
        print(f"   Recovery successful: {result}")
        print(f"   Circuit breaker state: {breaker.get_status()['state']}")

        print("\n✅ Fallback System test completed!")

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

    finally:
        await system.close()

if __name__ == "__main__":
    asyncio.run(test_fallback_system())

