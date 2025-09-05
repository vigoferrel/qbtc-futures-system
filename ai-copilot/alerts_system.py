#!/usr/bin/env python3
"""
🚨 QBTC INTELLIGENT ALERTS SYSTEM
==================================

Sistema de alertas inteligentes para el QBTC Master Copilot.
Proporciona notificaciones automáticas basadas en:

Características:
- Alertas de precio (price alerts)
- Alertas técnicas (technical indicators)
- Alertas de volumen (volume alerts)
- Alertas de riesgo (risk alerts)
- Alertas personalizadas (custom alerts)
- Notificaciones en tiempo real
- Historial de alertas
"""

import asyncio
import json
import smtplib
import aiohttp
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import logging

from market_analysis import QBTCMarketAnalyzer, SignalType, TimeFrame

class AlertType(Enum):
    PRICE_ALERT = "price_alert"
    TECHNICAL_ALERT = "technical_alert"
    VOLUME_ALERT = "volume_alert"
    RISK_ALERT = "risk_alert"
    CUSTOM_ALERT = "custom_alert"

class AlertCondition(Enum):
    ABOVE = "above"
    BELOW = "below"
    CROSSES_ABOVE = "crosses_above"
    CROSSES_BELOW = "crosses_below"
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class Alert:
    """Alerta configurada por el usuario"""
    id: str
    type: AlertType
    symbol: str
    condition: AlertCondition
    target_value: Any
    severity: AlertSeverity
    message: str
    enabled: bool = True
    created_at: datetime = None
    last_triggered: Optional[datetime] = None
    trigger_count: int = 0
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AlertTrigger:
    """Registro de activación de alerta"""
    alert_id: str
    timestamp: datetime
    symbol: str
    current_value: Any
    target_value: Any
    condition: AlertCondition
    message: str
    severity: AlertSeverity

class QBTCAlertsSystem:
    """Sistema de alertas inteligentes para QBTC"""

    def __init__(self):
        self.alerts: Dict[str, Alert] = {}
        self.active_alerts: Dict[str, List[Alert]] = {}  # Por símbolo
        self.trigger_history: List[AlertTrigger] = []
        self.market_analyzer = QBTCMarketAnalyzer()

        # Configuración de notificaciones
        self.notification_channels = {
            'console': self._notify_console,
            'email': self._notify_email,
            'webhook': self._notify_webhook,
            'file': self._notify_file
        }

        # Configuración de logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger('QBTC_Alerts')

        # Estado del sistema
        self.is_monitoring = False
        self.monitoring_task: Optional[asyncio.Task] = None

    async def create_price_alert(self, symbol: str, target_price: float,
                               condition: AlertCondition, severity: AlertSeverity = AlertSeverity.MEDIUM,
                               message: Optional[str] = None) -> str:
        """Crear alerta de precio"""

        alert_id = f"price_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        if message is None:
            condition_text = {
                AlertCondition.ABOVE: f"sube por encima de ${target_price}",
                AlertCondition.BELOW: f"baja por debajo de ${target_price}",
                AlertCondition.CROSSES_ABOVE: f"cruza por encima de ${target_price}",
                AlertCondition.CROSSES_BELOW: f"cruza por debajo de ${target_price}"
            }.get(condition, f"alcanza ${target_price}")

            message = f"🚨 {symbol} {condition_text}"

        alert = Alert(
            id=alert_id,
            type=AlertType.PRICE_ALERT,
            symbol=symbol,
            condition=condition,
            target_value=target_price,
            severity=severity,
            message=message,
            metadata={'alert_type': 'price', 'target_price': target_price}
        )

        self.alerts[alert_id] = alert
        self._add_to_active_alerts(alert)

        self.logger.info(f"📈 Created price alert: {alert_id} for {symbol}")
        return alert_id

    async def create_technical_alert(self, symbol: str, indicator: str,
                                   condition: AlertCondition, target_value: Any,
                                   severity: AlertSeverity = AlertSeverity.MEDIUM,
                                   message: Optional[str] = None) -> str:
        """Crear alerta técnica"""

        alert_id = f"tech_{symbol}_{indicator}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        if message is None:
            message = f"🎯 {symbol} {indicator} {condition.value} {target_value}"

        alert = Alert(
            id=alert_id,
            type=AlertType.TECHNICAL_ALERT,
            symbol=symbol,
            condition=condition,
            target_value=target_value,
            severity=severity,
            message=message,
            metadata={'alert_type': 'technical', 'indicator': indicator}
        )

        self.alerts[alert_id] = alert
        self._add_to_active_alerts(alert)

        self.logger.info(f"📊 Created technical alert: {alert_id} for {symbol}")
        return alert_id

    async def create_volume_alert(self, symbol: str, target_volume: float,
                                condition: AlertCondition, severity: AlertSeverity = AlertSeverity.MEDIUM,
                                message: Optional[str] = None) -> str:
        """Crear alerta de volumen"""

        alert_id = f"vol_{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        if message is None:
            condition_text = "supera" if condition == AlertCondition.ABOVE else "baja de"
            message = f"📊 Volumen de {symbol} {condition_text} {target_volume:.0f}"

        alert = Alert(
            id=alert_id,
            type=AlertType.VOLUME_ALERT,
            symbol=symbol,
            condition=condition,
            target_value=target_volume,
            severity=severity,
            message=message,
            metadata={'alert_type': 'volume', 'target_volume': target_volume}
        )

        self.alerts[alert_id] = alert
        self._add_to_active_alerts(alert)

        self.logger.info(f"📈 Created volume alert: {alert_id} for {symbol}")
        return alert_id

    async def create_risk_alert(self, symbol: str, risk_metric: str,
                              threshold: float, severity: AlertSeverity = AlertSeverity.HIGH,
                              message: Optional[str] = None) -> str:
        """Crear alerta de riesgo"""

        alert_id = f"risk_{symbol}_{risk_metric}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        if message is None:
            message = f"⚠️ ALERTA DE RIESGO: {symbol} {risk_metric} supera {threshold}"

        alert = Alert(
            id=alert_id,
            type=AlertType.RISK_ALERT,
            symbol=symbol,
            condition=AlertCondition.ABOVE,
            target_value=threshold,
            severity=severity,
            message=message,
            metadata={'alert_type': 'risk', 'risk_metric': risk_metric}
        )

        self.alerts[alert_id] = alert
        self._add_to_active_alerts(alert)

        self.logger.info(f"🚨 Created risk alert: {alert_id} for {symbol}")
        return alert_id

    def _add_to_active_alerts(self, alert: Alert):
        """Agregar alerta a la lista de alertas activas por símbolo"""
        if alert.symbol not in self.active_alerts:
            self.active_alerts[alert.symbol] = []

        self.active_alerts[alert.symbol].append(alert)

    def remove_alert(self, alert_id: str) -> bool:
        """Remover alerta"""
        if alert_id in self.alerts:
            alert = self.alerts[alert_id]

            # Remover de alertas activas
            if alert.symbol in self.active_alerts:
                self.active_alerts[alert.symbol] = [
                    a for a in self.active_alerts[alert.symbol] if a.id != alert_id
                ]

            # Remover de alertas principales
            del self.alerts[alert_id]

            self.logger.info(f"🗑️ Removed alert: {alert_id}")
            return True

        return False

    def get_alerts_by_symbol(self, symbol: str) -> List[Alert]:
        """Obtener alertas activas para un símbolo"""
        return self.active_alerts.get(symbol, [])

    def get_all_alerts(self) -> List[Alert]:
        """Obtener todas las alertas"""
        return list(self.alerts.values())

    def get_trigger_history(self, limit: int = 50) -> List[AlertTrigger]:
        """Obtener historial de activaciones"""
        return self.trigger_history[-limit:]

    async def start_monitoring(self, interval_seconds: int = 60):
        """Iniciar monitoreo de alertas"""
        if self.is_monitoring:
            self.logger.warning("Monitoring already running")
            return

        self.is_monitoring = True
        self.logger.info(f"🚀 Starting alerts monitoring (interval: {interval_seconds}s)")

        self.monitoring_task = asyncio.create_task(self._monitoring_loop(interval_seconds))

    async def stop_monitoring(self):
        """Detener monitoreo de alertas"""
        if not self.is_monitoring:
            return

        self.is_monitoring = False
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass

        self.logger.info("⏹️ Stopped alerts monitoring")

    async def _monitoring_loop(self, interval_seconds: int):
        """Loop principal de monitoreo"""
        while self.is_monitoring:
            try:
                await self._check_all_alerts()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(interval_seconds)

    async def _check_all_alerts(self):
        """Verificar todas las alertas activas"""
        for symbol, alerts in self.active_alerts.items():
            await self._check_symbol_alerts(symbol, alerts)

    async def _check_symbol_alerts(self, symbol: str, alerts: List[Alert]):
        """Verificar alertas para un símbolo específico"""
        try:
            # Obtener datos actuales del mercado
            market_data = await self.market_analyzer.analyze_symbol(symbol, TimeFrame.M5, 20)

            if not market_data or not market_data.indicators:
                return

            # Extraer valores actuales
            current_price = market_data.indicators[0].description.split(',')[0].split(':')[1].strip()
            current_price = float(current_price) if current_price.replace('.', '').isdigit() else 0

            # Verificar cada alerta
            for alert in alerts:
                if not alert.enabled:
                    continue

                triggered = False

                if alert.type == AlertType.PRICE_ALERT:
                    triggered = self._check_price_condition(current_price, alert)
                elif alert.type == AlertType.TECHNICAL_ALERT:
                    triggered = self._check_technical_condition(market_data.indicators, alert)
                elif alert.type == AlertType.VOLUME_ALERT:
                    triggered = self._check_volume_condition(market_data, alert)
                elif alert.type == AlertType.RISK_ALERT:
                    triggered = self._check_risk_condition(market_data, alert)

                if triggered:
                    await self._trigger_alert(alert, current_price)

        except Exception as e:
            self.logger.error(f"Error checking alerts for {symbol}: {e}")

    def _check_price_condition(self, current_price: float, alert: Alert) -> bool:
        """Verificar condición de precio"""
        target_price = float(alert.target_value)

        if alert.condition == AlertCondition.ABOVE:
            return current_price > target_price
        elif alert.condition == AlertCondition.BELOW:
            return current_price < target_price
        elif alert.condition == AlertCondition.CROSSES_ABOVE:
            # Para cruce necesitaríamos precio anterior, por simplicidad usamos ABOVE
            return current_price > target_price
        elif alert.condition == AlertCondition.CROSSES_BELOW:
            return current_price < target_price

        return False

    def _check_technical_condition(self, indicators: List, alert: Alert) -> bool:
        """Verificar condición técnica"""
        # Buscar el indicador específico
        target_indicator = None
        for indicator in indicators:
            if alert.metadata.get('indicator', '').lower() in indicator.name.lower():
                target_indicator = indicator
                break

        if not target_indicator:
            return False

        target_value = float(alert.target_value) if isinstance(alert.target_value, (int, float, str)) and str(alert.target_value).replace('.', '').isdigit() else 0

        if alert.condition == AlertCondition.ABOVE:
            return target_indicator.value > target_value
        elif alert.condition == AlertCondition.BELOW:
            return target_indicator.value < target_value

        return False

    def _check_volume_condition(self, market_data, alert: Alert) -> bool:
        """Verificar condición de volumen"""
        # Esta es una simplificación - en producción usaríamos datos reales de volumen
        return False

    def _check_risk_condition(self, market_data, alert: Alert) -> bool:
        """Verificar condición de riesgo"""
        # Simplificación - verificar drawdown o volatilidad
        return False

    async def _trigger_alert(self, alert: Alert, current_value: Any):
        """Activar alerta y enviar notificaciones"""
        # Crear registro de activación
        trigger = AlertTrigger(
            alert_id=alert.id,
            timestamp=datetime.now(),
            symbol=alert.symbol,
            current_value=current_value,
            target_value=alert.target_value,
            condition=alert.condition,
            message=alert.message,
            severity=alert.severity
        )

        # Agregar al historial
        self.trigger_history.append(trigger)

        # Actualizar estadísticas de la alerta
        alert.last_triggered = trigger.timestamp
        alert.trigger_count += 1

        # Enviar notificaciones
        await self._send_notifications(trigger)

        self.logger.warning(f"🚨 ALERT TRIGGERED: {alert.message}")

    async def _send_notifications(self, trigger: AlertTrigger):
        """Enviar notificaciones por todos los canales configurados"""
        notification_data = {
            'alert_id': trigger.alert_id,
            'symbol': trigger.symbol,
            'message': trigger.message,
            'severity': trigger.severity.value,
            'timestamp': trigger.timestamp.isoformat(),
            'current_value': trigger.current_value,
            'target_value': trigger.target_value
        }

        # Enviar por consola (siempre)
        await self.notification_channels['console'](notification_data)

        # Enviar por archivo (siempre)
        await self.notification_channels['file'](notification_data)

        # Aquí se podrían agregar otros canales como email, webhook, etc.

    async def _notify_console(self, data: Dict[str, Any]):
        """Notificar por consola"""
        severity_emoji = {
            'low': 'ℹ️',
            'medium': '⚠️',
            'high': '🚨',
            'critical': '🔴'
        }

        emoji = severity_emoji.get(data['severity'], '📢')
        print(f"{emoji} ALERT: {data['message']} ({data['symbol']})")

    async def _notify_file(self, data: Dict[str, Any]):
        """Notificar guardando en archivo"""
        try:
            with open('alerts_history.jsonl', 'a', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, default=str)
                f.write('\n')
        except Exception as e:
            self.logger.error(f"Error writing to alerts file: {e}")

    async def _notify_email(self, data: Dict[str, Any]):
        """Notificar por email (placeholder)"""
        # Implementación de email aquí
        pass

    async def _notify_webhook(self, data: Dict[str, Any]):
        """Notificar por webhook (placeholder)"""
        # Implementación de webhook aquí
        pass

    def save_alerts_config(self, filename: str = "alerts_config.json"):
        """Guardar configuración de alertas"""
        alerts_data = {}
        for alert_id, alert in self.alerts.items():
            alerts_data[alert_id] = asdict(alert)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(alerts_data, f, indent=2, ensure_ascii=False, default=str)

        self.logger.info(f"💾 Saved alerts configuration to {filename}")

    def load_alerts_config(self, filename: str = "alerts_config.json"):
        """Cargar configuración de alertas"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                alerts_data = json.load(f)

            for alert_id, alert_data in alerts_data.items():
                # Convertir strings de fecha a datetime
                if 'created_at' in alert_data and alert_data['created_at']:
                    alert_data['created_at'] = datetime.fromisoformat(alert_data['created_at'])
                if 'last_triggered' in alert_data and alert_data['last_triggered']:
                    alert_data['last_triggered'] = datetime.fromisoformat(alert_data['last_triggered'])

                # Crear objeto Alert
                alert = Alert(**alert_data)
                self.alerts[alert_id] = alert
                self._add_to_active_alerts(alert)

            self.logger.info(f"📂 Loaded alerts configuration from {filename}")

        except FileNotFoundError:
            self.logger.info(f"No alerts configuration file found: {filename}")
        except Exception as e:
            self.logger.error(f"Error loading alerts configuration: {e}")

# Función de utilidad para testing
async def test_alerts_system():
    """Test del sistema de alertas"""
    print("🧪 Testing QBTC Alerts System")
    print("=" * 40)

    alerts_system = QBTCAlertsSystem()

    # Crear algunas alertas de prueba
    print("\n📝 Creating test alerts...")

    # Alerta de precio para BTC
    alert1 = await alerts_system.create_price_alert(
        symbol="BTCUSDT",
        target_price=45000,
        condition=AlertCondition.ABOVE,
        severity=AlertSeverity.HIGH,
        message="🚀 BTC superó los $45,000!"
    )
    print(f"✅ Created alert: {alert1}")

    # Alerta técnica para RSI
    alert2 = await alerts_system.create_technical_alert(
        symbol="ETHUSDT",
        indicator="RSI",
        condition=AlertCondition.ABOVE,
        target_value=70,
        severity=AlertSeverity.MEDIUM,
        message="📈 ETH RSI sobrecomprado (>70)"
    )
    print(f"✅ Created alert: {alert2}")

    # Mostrar alertas activas
    print("\n📋 Active alerts:")
    all_alerts = alerts_system.get_all_alerts()
    for alert in all_alerts:
        print(f"   • {alert.id}: {alert.symbol} - {alert.message}")

    # Simular monitoreo por unos segundos
    print("\n🚀 Starting monitoring for 5 seconds...")
    await alerts_system.start_monitoring(interval_seconds=2)

    await asyncio.sleep(5)

    await alerts_system.stop_monitoring()

    # Mostrar historial
    history = alerts_system.get_trigger_history()
    print(f"\n📊 Trigger history: {len(history)} events")

    # Guardar configuración
    alerts_system.save_alerts_config()

    print("\n✅ Alerts system test completed!")

if __name__ == "__main__":
    asyncio.run(test_alerts_system())
