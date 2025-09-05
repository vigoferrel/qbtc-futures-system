#!/usr/bin/env python3
"""
📡 QBTC WEBSOCKET STREAMER
==========================

Sistema de streaming en tiempo real para el QBTC Master Copilot.
Conecta con WebSockets de exchanges para datos de mercado en tiempo real.

Características:
- Conexión WebSocket con Binance
- Streaming de precios en tiempo real
- Manejo de reconexiones automáticas
- Filtrado y procesamiento de datos
- Distribución de datos a múltiples suscriptores
- Monitoreo de latencia y calidad de conexión
"""

import asyncio
import websockets
import json
import logging
import gzip
import time
from typing import Dict, List, Any, Optional, Callable, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import threading

@dataclass
class StreamMessage:
    """Mensaje de streaming estructurado"""
    stream: str
    symbol: str
    data: Dict[str, Any]
    timestamp: datetime
    received_at: datetime

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.received_at is None:
            self.received_at = datetime.now()

@dataclass
class StreamSubscription:
    """Suscripción a un stream específico"""
    id: str
    stream_type: str
    symbol: str
    callback: Callable[[StreamMessage], None]
    active: bool = True
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class StreamQuality(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    DISCONNECTED = "disconnected"

class BinanceWebSocketStreamer:
    """Streamer WebSocket para datos de Binance en tiempo real"""

    def __init__(self, testnet: bool = True):
        self.testnet = testnet
        self.base_url = "wss://stream.binancefuture.com" if not testnet else "wss://stream.binancefuture.com"

        # Estado de conexión
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.is_connected = False
        self.connection_quality = StreamQuality.DISCONNECTED
        self.last_message_time = None
        self.latency_ms = 0

        # Suscripciones
        self.subscriptions: Dict[str, StreamSubscription] = {}
        self.active_streams: Set[str] = set()

        # Configuración
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        self.reconnect_delay = 1
        self.heartbeat_interval = 30

        # Callbacks
        self.on_connect: Optional[Callable] = None
        self.on_disconnect: Optional[Callable] = None
        self.on_message: Optional[Callable[[StreamMessage], None]] = None

        # Logging
        self.logger = logging.getLogger('BinanceStreamer')
        self.logger.setLevel(logging.INFO)

        # Estadísticas
        self.stats = {
            'messages_received': 0,
            'messages_processed': 0,
            'connection_attempts': 0,
            'reconnect_count': 0,
            'uptime_start': None,
            'total_downtime': 0
        }

    async def connect(self) -> bool:
        """Establecer conexión WebSocket"""
        try:
            self.logger.info("🔌 Connecting to Binance WebSocket...")

            # Crear URI con streams activos
            if self.active_streams:
                streams_param = '/'.join(self.active_streams)
                uri = f"{self.base_url}/stream?streams={streams_param}"
            else:
                uri = f"{self.base_url}/ws/!ticker@arr"  # Stream por defecto

            self.stats['connection_attempts'] += 1

            # Conectar
            self.websocket = await websockets.connect(
                uri,
                user_agent_header='QBTC-Master-Copilot/2.0',
                compression=None,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=5
            )

            self.is_connected = True
            self.connection_quality = StreamQuality.EXCELLENT
            self.stats['uptime_start'] = datetime.now()
            self.logger.info("✅ Connected to Binance WebSocket")

            # Notificar conexión
            if self.on_connect:
                if asyncio.iscoroutinefunction(self.on_connect):
                    await self.on_connect()
                else:
                    self.on_connect()

            return True

        except Exception as e:
            self.logger.error(f"❌ Failed to connect: {str(e)}")
            self.is_connected = False
            self.connection_quality = StreamQuality.DISCONNECTED
            return False

    async def disconnect(self):
        """Desconectar del WebSocket"""
        if self.websocket:
            try:
                await self.websocket.close()
                self.logger.info("🔌 Disconnected from Binance WebSocket")
            except Exception as e:
                self.logger.error(f"Error disconnecting: {str(e)}")

        self.is_connected = False
        self.connection_quality = StreamQuality.DISCONNECTED

        # Notificar desconexión
        if self.on_disconnect:
            if asyncio.iscoroutinefunction(self.on_disconnect):
                await self.on_disconnect()
            else:
                self.on_disconnect()

    async def subscribe(self, stream_type: str, symbol: str,
                       callback: Callable[[StreamMessage], None]) -> str:
        """Suscribirse a un stream específico"""

        subscription_id = f"{stream_type}_{symbol}_{int(time.time())}"

        # Crear suscripción
        subscription = StreamSubscription(
            id=subscription_id,
            stream_type=stream_type,
            symbol=symbol,
            callback=callback
        )

        self.subscriptions[subscription_id] = subscription

        # Agregar stream a la lista activa
        stream_name = self._create_stream_name(stream_type, symbol)
        if stream_name not in self.active_streams:
            self.active_streams.add(stream_name)

            # Si ya estamos conectados, necesitamos reconectar con el nuevo stream
            if self.is_connected:
                self.logger.info(f"📡 New stream added: {stream_name}, reconnecting...")
                await self.disconnect()
                await asyncio.sleep(0.5)
                await self.connect()

        self.logger.info(f"📡 Subscribed to {stream_type} for {symbol}")
        return subscription_id

    async def unsubscribe(self, subscription_id: str) -> bool:
        """Cancelar suscripción"""

        if subscription_id not in self.subscriptions:
            return False

        subscription = self.subscriptions[subscription_id]

        # Remover suscripción
        del self.subscriptions[subscription_id]

        # Verificar si aún necesitamos este stream
        stream_name = self._create_stream_name(subscription.stream_type, subscription.symbol)
        stream_still_needed = any(
            sub.stream_type == subscription.stream_type and sub.symbol == subscription.symbol
            for sub in self.subscriptions.values()
        )

        if not stream_still_needed:
            self.active_streams.discard(stream_name)

            # Reconectar si estamos conectados
            if self.is_connected:
                await self.disconnect()
                await asyncio.sleep(0.5)
                await self.connect()

        self.logger.info(f"🚫 Unsubscribed from {subscription.stream_type} for {subscription.symbol}")
        return True

    def _create_stream_name(self, stream_type: str, symbol: str) -> str:
        """Crear nombre de stream para Binance"""
        symbol_lower = symbol.lower()

        if stream_type == "ticker":
            return f"{symbol_lower}@ticker"
        elif stream_type == "trade":
            return f"{symbol_lower}@trade"
        elif stream_type == "kline":
            return f"{symbol_lower}@kline_1m"
        elif stream_type == "depth":
            return f"{symbol_lower}@depth5"
        else:
            return f"{symbol_lower}@{stream_type}"

    async def start_streaming(self):
        """Iniciar el streaming de datos"""
        self.logger.info("🚀 Starting WebSocket streaming...")

        while True:
            try:
                # Conectar si no estamos conectados
                if not self.is_connected:
                    if not await self.connect():
                        await self._handle_reconnect()
                        continue

                # Iniciar heartbeat
                heartbeat_task = asyncio.create_task(self._heartbeat_loop())

                # Procesar mensajes
                await self._message_loop()

                # Limpiar heartbeat
                heartbeat_task.cancel()
                try:
                    await heartbeat_task
                except asyncio.CancelledError:
                    pass

            except Exception as e:
                self.logger.error(f"Streaming error: {str(e)}")
                await self._handle_reconnect()

    async def _message_loop(self):
        """Loop principal para procesar mensajes"""
        try:
            async for message in self.websocket:
                try:
                    # Descomprimir si es necesario
                    if isinstance(message, bytes):
                        message = gzip.decompress(message).decode('utf-8')

                    # Parsear JSON
                    data = json.loads(message)

                    # Actualizar estadísticas
                    self.stats['messages_received'] += 1
                    self.last_message_time = datetime.now()

                    # Procesar mensaje
                    await self._process_message(data)

                except json.JSONDecodeError as e:
                    self.logger.warning(f"Failed to parse message: {str(e)}")
                except Exception as e:
                    self.logger.error(f"Error processing message: {str(e)}")

        except websockets.exceptions.ConnectionClosed:
            self.logger.warning("WebSocket connection closed")
            self.is_connected = False
        except Exception as e:
            self.logger.error(f"Message loop error: {str(e)}")
            self.is_connected = False

    async def _process_message(self, data: Dict[str, Any]):
        """Procesar mensaje recibido"""

        # Extraer información del stream
        stream_name = data.get('stream', '')
        if not stream_name:
            return

        # Parsear stream name
        parts = stream_name.split('@')
        if len(parts) != 2:
            return

        symbol = parts[0].upper()
        stream_type = parts[1].split('_')[0]  # Remover sufijos como _1m

        # Crear mensaje estructurado
        message = StreamMessage(
            stream=stream_name,
            symbol=symbol,
            data=data.get('data', {}),
            timestamp=self._parse_timestamp(data),
            received_at=datetime.now()
        )

        # Calcular latencia
        if message.timestamp:
            self.latency_ms = (datetime.now() - message.timestamp).total_seconds() * 1000

        # Actualizar calidad de conexión
        self._update_connection_quality()

        # Notificar mensaje general
        if self.on_message:
            try:
                if asyncio.iscoroutinefunction(self.on_message):
                    await self.on_message(message)
                else:
                    self.on_message(message)
            except Exception as e:
                self.logger.error(f"Error in message callback: {str(e)}")

        # Distribuir a suscriptores específicos
        await self._distribute_to_subscribers(message)

        self.stats['messages_processed'] += 1

    async def _distribute_to_subscribers(self, message: StreamMessage):
        """Distribuir mensaje a suscriptores relevantes"""

        for subscription in self.subscriptions.values():
            if not subscription.active:
                continue

            # Verificar si el mensaje es relevante para esta suscripción
            if subscription.symbol.upper() == message.symbol:
                try:
                    # Ejecutar callback en una nueva task para no bloquear
                    asyncio.create_task(subscription.callback(message))
                except Exception as e:
                    self.logger.error(f"Error in subscription callback: {str(e)}")

    def _parse_timestamp(self, data: Dict[str, Any]) -> Optional[datetime]:
        """Parsear timestamp del mensaje"""

        # Intentar diferentes campos de timestamp
        timestamp_fields = ['timestamp', 'T', 'eventTime', 'E']

        for field in timestamp_fields:
            if field in data:
                try:
                    # Binance usa timestamps en milisegundos
                    return datetime.fromtimestamp(data[field] / 1000)
                except (ValueError, TypeError):
                    continue

        return None

    def _update_connection_quality(self):
        """Actualizar calidad de conexión basada en latencia"""

        if not self.last_message_time:
            self.connection_quality = StreamQuality.DISCONNECTED
            return

        time_since_last_message = (datetime.now() - self.last_message_time).total_seconds()

        if time_since_last_message > 60:  # Más de 1 minuto sin mensajes
            self.connection_quality = StreamQuality.DISCONNECTED
        elif self.latency_ms < 100:  # Menos de 100ms
            self.connection_quality = StreamQuality.EXCELLENT
        elif self.latency_ms < 500:  # Menos de 500ms
            self.connection_quality = StreamQuality.GOOD
        elif self.latency_ms < 2000:  # Menos de 2s
            self.connection_quality = StreamQuality.FAIR
        else:
            self.connection_quality = StreamQuality.POOR

    async def _heartbeat_loop(self):
        """Loop de heartbeat para mantener conexión viva"""

        while self.is_connected:
            try:
                # Enviar ping si WebSocket lo soporta
                if hasattr(self.websocket, 'ping'):
                    await self.websocket.ping()

                await asyncio.sleep(self.heartbeat_interval)

            except Exception as e:
                self.logger.error(f"Heartbeat error: {str(e)}")
                break

    async def _handle_reconnect(self):
        """Manejar reconexión"""

        if self.reconnect_attempts >= self.max_reconnect_attempts:
            self.logger.error("Max reconnection attempts reached")
            return

        self.reconnect_attempts += 1
        delay = self.reconnect_delay * (2 ** (self.reconnect_attempts - 1))  # Exponential backoff

        self.logger.info(f"🔄 Reconnecting in {delay}s (attempt {self.reconnect_attempts}/{self.max_reconnect_attempts})")

        # Registrar downtime
        if self.stats['uptime_start']:
            downtime = datetime.now() - self.stats['uptime_start']
            self.stats['total_downtime'] += downtime.total_seconds()

        await asyncio.sleep(delay)

    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del streamer"""

        uptime = 0
        if self.stats['uptime_start']:
            uptime = (datetime.now() - self.stats['uptime_start']).total_seconds()

        return {
            'is_connected': self.is_connected,
            'connection_quality': self.connection_quality.value,
            'latency_ms': self.latency_ms,
            'active_streams': len(self.active_streams),
            'active_subscriptions': len([s for s in self.subscriptions.values() if s.active]),
            'messages_received': self.stats['messages_received'],
            'messages_processed': self.stats['messages_processed'],
            'connection_attempts': self.stats['connection_attempts'],
            'reconnect_count': self.reconnect_attempts,
            'uptime_seconds': uptime,
            'total_downtime_seconds': self.stats['total_downtime'],
            'last_message_time': self.last_message_time.isoformat() if self.last_message_time else None
        }

# Ejemplo de uso y callbacks
async def price_update_callback(message: StreamMessage):
    """Callback para actualizaciones de precio"""
    if message.data.get('e') == '24hrTicker':
        symbol = message.data.get('s', 'UNKNOWN')
        price = float(message.data.get('c', 0))
        volume = float(message.data.get('v', 0))

        print(f"📈 {symbol}: ${price:.2f} | Vol: {volume:.2f}")

async def trade_callback(message: StreamMessage):
    """Callback para trades individuales"""
    if message.data.get('e') == 'trade':
        symbol = message.data.get('s', 'UNKNOWN')
        price = float(message.data.get('p', 0))
        quantity = float(message.data.get('q', 0))
        is_buyer_maker = message.data.get('m', False)

        side = "SELL" if is_buyer_maker else "BUY"
        print(f"💰 {symbol} {side}: {quantity:.6f} @ ${price:.2f}")

# Función de test
async def test_websocket_streaming():
    """Test del sistema de streaming WebSocket"""

    print("🧪 Testing WebSocket Streaming")
    print("=" * 40)

    streamer = BinanceWebSocketStreamer(testnet=True)

    # Configurar callbacks (no async para evitar complicaciones)
    def on_connect():
        print("🔗 Connected to Binance WebSocket")

    def on_disconnect():
        print("🔌 Disconnected from Binance WebSocket")

    def on_message(msg):
        print(f"📨 Message from {msg.symbol}: {len(str(msg.data))} bytes")

    streamer.on_connect = on_connect
    streamer.on_disconnect = on_disconnect
    streamer.on_message = on_message

    try:
        # Suscribirse a algunos streams
        print("\n📡 Setting up subscriptions...")

        # Ticker de BTC
        await streamer.subscribe("ticker", "btcusdt", price_update_callback)

        # Trades de ETH
        await streamer.subscribe("trade", "ethusdt", trade_callback)

        # Kline de 1m para ADA
        await streamer.subscribe("kline", "adausdt", lambda msg: print(f"📊 {msg.symbol} Kline update"))

        print(f"✅ Subscribed to {len(streamer.subscriptions)} streams")

        # Iniciar streaming por 30 segundos
        print("\n🚀 Starting streaming for 30 seconds...")

        streaming_task = asyncio.create_task(streamer.start_streaming())

        # Esperar 30 segundos
        await asyncio.sleep(30)

        # Detener streaming
        print("\n⏹️ Stopping streaming...")
        streaming_task.cancel()

        try:
            await streaming_task
        except asyncio.CancelledError:
            pass

        # Mostrar estadísticas finales
        stats = streamer.get_stats()
        print("\n📊 Final Statistics:")
        print(f"   Messages received: {stats['messages_received']}")
        print(f"   Messages processed: {stats['messages_processed']}")
        print(f"   Connection quality: {stats['connection_quality']}")
        print(f"   Latency: {stats['latency_ms']:.2f}ms")
        print(f"   Uptime: {stats['uptime_seconds']:.2f}s")
        print("✅ WebSocket streaming test completed!")

    except KeyboardInterrupt:
        print("\n⏹️ Test interrupted by user")

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

    finally:
        await streamer.disconnect()

if __name__ == "__main__":
    asyncio.run(test_websocket_streaming())
