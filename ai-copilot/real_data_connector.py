#!/usr/bin/env python3
"""
🌐 QBTC REAL DATA CONNECTOR
============================

Conector de datos reales para el QBTC Master Copilot.
Conecta con APIs de exchanges para obtener datos de mercado reales.

Características:
- Conexión con Binance Futures API
- Manejo de datos históricos y en tiempo real
- Sistema de caché inteligente
- Validación de datos
- Manejo de errores y reconexiones
- Rate limiting inteligente
"""

import asyncio
import aiohttp
import json
import hashlib
import hmac
import time
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import base64

from market_analysis import MarketData, TimeFrame

@dataclass
class APIResponse:
    """Respuesta estructurada de API"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    timestamp: datetime = None
    request_time: float = 0.0

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class BinanceCredentials:
    """Credenciales de Binance"""
    api_key: str
    secret_key: str
    testnet: bool = True

class RateLimiter:
    """Limitador de tasa inteligente para APIs"""

    def __init__(self, requests_per_minute: int = 1200):
        self.requests_per_minute = requests_per_minute
        self.requests = []
        self.lock = asyncio.Lock()

    async def wait_if_needed(self):
        """Esperar si es necesario para respetar límites de tasa"""
        async with self.lock:
            now = time.time()

            # Limpiar requests antiguos (más de 1 minuto)
            self.requests = [req_time for req_time in self.requests
                           if now - req_time < 60]

            if len(self.requests) >= self.requests_per_minute:
                # Calcular tiempo de espera
                oldest_request = min(self.requests)
                wait_time = 60 - (now - oldest_request)

                if wait_time > 0:
                    await asyncio.sleep(wait_time)

            self.requests.append(now)

class BinanceConnector:
    """Conector principal con Binance Futures API"""

    def __init__(self, credentials: Optional[BinanceCredentials] = None):
        self.credentials = credentials
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limiter = RateLimiter()
        self.base_url = "https://testnet.binancefuture.com" if credentials and credentials.testnet else "https://fapi.binance.com"

        # Configurar logging
        self.logger = logging.getLogger('BinanceConnector')
        self.logger.setLevel(logging.INFO)

        # Cache para datos recientes
        self.price_cache = {}
        self.cache_ttl = 60  # 60 segundos

    async def initialize(self):
        """Inicializar conexión"""
        if not self.session:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'QBTC-Master-Copilot/2.0'
                }
            )

        self.logger.info(f"🔗 Initialized Binance connector (Testnet: {self.credentials.testnet if self.credentials else 'No credentials'})")

    async def close(self):
        """Cerrar conexión"""
        if self.session:
            await self.session.close()
            self.session = None

    async def _make_request(self, endpoint: str, method: str = 'GET',
                          params: Dict[str, Any] = None,
                          signed: bool = False) -> APIResponse:
        """Hacer request a la API de Binance"""

        if not self.session:
            await self.initialize()

        await self.rate_limiter.wait_if_needed()

        start_time = time.time()

        try:
            url = f"{self.base_url}{endpoint}"

            request_params = params or {}

            # Agregar timestamp para requests firmados
            if signed and self.credentials:
                request_params['timestamp'] = str(int(time.time() * 1000))
                request_params['signature'] = self._create_signature(request_params)

                headers = {
                    'X-MBX-APIKEY': self.credentials.api_key
                }
            else:
                headers = {}

            # Hacer request
            if method == 'GET':
                async with self.session.get(url, params=request_params, headers=headers) as response:
                    return await self._process_response(response, start_time)
            elif method == 'POST':
                async with self.session.post(url, json=request_params, headers=headers) as response:
                    return await self._process_response(response, start_time)

        except Exception as e:
            request_time = time.time() - start_time
            self.logger.error(f"Request failed: {str(e)}")
            return APIResponse(
                success=False,
                error=str(e),
                request_time=request_time
            )

    async def _process_response(self, response: aiohttp.ClientResponse, start_time: float) -> APIResponse:
        """Procesar respuesta de la API"""
        request_time = time.time() - start_time

        try:
            if response.status == 200:
                data = await response.json()
                return APIResponse(
                    success=True,
                    data=data,
                    request_time=request_time
                )
            else:
                error_text = await response.text()
                self.logger.warning(f"API Error {response.status}: {error_text}")
                return APIResponse(
                    success=False,
                    error=f"HTTP {response.status}: {error_text}",
                    request_time=request_time
                )

        except Exception as e:
            return APIResponse(
                success=False,
                error=f"Response processing error: {str(e)}",
                request_time=request_time
            )

    def _create_signature(self, params: Dict[str, Any]) -> str:
        """Crear firma HMAC-SHA256 para autenticación"""
        if not self.credentials:
            return ""

        query_string = '&'.join([f"{key}={value}" for key, value in sorted(params.items())])

        signature = hmac.new(
            self.credentials.secret_key.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return signature

    async def get_klines(self, symbol: str, interval: str = '1h',
                        limit: int = 500, start_time: Optional[int] = None) -> APIResponse:
        """Obtener datos de velas (klines)"""

        endpoint = "/fapi/v1/klines"
        params = {
            'symbol': symbol.upper(),
            'interval': interval,
            'limit': min(limit, 1000)  # Máximo 1000
        }

        if start_time:
            params['startTime'] = start_time

        return await self._make_request(endpoint, params=params)

    async def get_ticker_price(self, symbol: str) -> APIResponse:
        """Obtener precio actual de un símbolo"""

        # Verificar cache primero
        cache_key = f"price_{symbol}"
        if cache_key in self.price_cache:
            cached_data, cache_time = self.price_cache[cache_key]
            if time.time() - cache_time < self.cache_ttl:
                return APIResponse(
                    success=True,
                    data=cached_data,
                    request_time=0.0
                )

        endpoint = "/fapi/v1/ticker/price"
        params = {'symbol': symbol.upper()}

        response = await self._make_request(endpoint, params=params)

        # Cachear resultado exitoso
        if response.success:
            self.price_cache[cache_key] = (response.data, time.time())

        return response

    async def get_24hr_ticker_stats(self, symbol: str) -> APIResponse:
        """Obtener estadísticas 24h de un símbolo"""

        endpoint = "/fapi/v1/ticker/24hr"
        params = {'symbol': symbol.upper()}

        return await self._make_request(endpoint, params=params)

    async def get_exchange_info(self) -> APIResponse:
        """Obtener información del exchange"""

        endpoint = "/fapi/v1/exchangeInfo"
        return await self._make_request(endpoint)

    async def get_open_interest(self, symbol: str) -> APIResponse:
        """Obtener interés abierto"""

        endpoint = "/fapi/v1/openInterest"
        params = {'symbol': symbol.upper()}

        return await self._make_request(endpoint, params=params)

    async def get_funding_rate(self, symbol: str, limit: int = 100) -> APIResponse:
        """Obtener tasa de financiación"""

        endpoint = "/fapi/v1/fundingRate"
        params = {
            'symbol': symbol.upper(),
            'limit': min(limit, 1000)
        }

        return await self._make_request(endpoint, params=params)

    def convert_klines_to_market_data(self, klines_data: List[List], symbol: str,
                                    timeframe: TimeFrame) -> List[MarketData]:
        """Convertir datos de klines de Binance a objetos MarketData"""

        market_data = []

        for kline in klines_data:
            # Formato de kline de Binance:
            # [timestamp, open, high, low, close, volume, close_time, ...]
            timestamp = datetime.fromtimestamp(kline[0] / 1000)
            open_price = float(kline[1])
            high = float(kline[2])
            low = float(kline[3])
            close = float(kline[4])
            volume = float(kline[5])

            market_data.append(MarketData(
                symbol=symbol,
                timestamp=timestamp,
                open=open_price,
                high=high,
                low=low,
                close=close,
                volume=volume,
                timeframe=timeframe
            ))

        return market_data

    async def get_recent_market_data(self, symbol: str, timeframe: TimeFrame,
                                   periods: int = 100) -> List[MarketData]:
        """Obtener datos de mercado recientes"""

        # Mapear TimeFrame a intervalos de Binance
        interval_map = {
            TimeFrame.M1: '1m',
            TimeFrame.M5: '5m',
            TimeFrame.M15: '15m',
            TimeFrame.M30: '30m',
            TimeFrame.H1: '1h',
            TimeFrame.H4: '4h',
            TimeFrame.D1: '1d',
            TimeFrame.W1: '1w'
        }

        interval = interval_map.get(timeframe, '1h')

        # Obtener klines
        klines_response = await self.get_klines(symbol, interval, periods)

        if not klines_response.success:
            self.logger.error(f"Failed to get klines for {symbol}: {klines_response.error}")
            return []

        # Convertir a MarketData
        market_data = self.convert_klines_to_market_data(
            klines_response.data, symbol, timeframe
        )

        self.logger.info(f"📊 Retrieved {len(market_data)} data points for {symbol} ({timeframe.value})")
        return market_data

    async def get_current_price(self, symbol: str) -> Optional[float]:
        """Obtener precio actual de un símbolo"""

        price_response = await self.get_ticker_price(symbol)

        if price_response.success and price_response.data:
            return float(price_response.data['price'])

        return None

    async def get_multiple_prices(self, symbols: List[str]) -> Dict[str, float]:
        """Obtener precios de múltiples símbolos"""

        prices = {}

        # Hacer requests en paralelo para mejor performance
        tasks = [self.get_current_price(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for symbol, result in zip(symbols, results):
            if isinstance(result, float):
                prices[symbol] = result
            else:
                self.logger.warning(f"Failed to get price for {symbol}: {result}")

        return prices

    async def health_check(self) -> bool:
        """Verificar salud de la conexión"""

        try:
            # Intentar obtener información del exchange
            response = await self.get_exchange_info()
            return response.success

        except Exception as e:
            self.logger.error(f"Health check failed: {str(e)}")
            return False

# Función de utilidad para testing
async def test_binance_connection():
    """Test de conexión con Binance"""

    print("🧪 Testing Binance Real Data Connection")
    print("=" * 50)

    # Crear conector (sin credenciales para datos públicos)
    connector = BinanceConnector()

    try:
        # Inicializar
        print("🔗 Initializing connection...")
        await connector.initialize()

        # Health check
        print("🏥 Health check...")
        healthy = await connector.health_check()
        print(f"   Health status: {'✅ OK' if healthy else '❌ Failed'}")

        if not healthy:
            print("❌ Cannot connect to Binance API")
            return

        # Obtener información del exchange
        print("\n📊 Getting exchange info...")
        exchange_response = await connector.get_exchange_info()

        if exchange_response.success:
            print(f"   ✅ Exchange: {exchange_response.data.get('exchangeFilters', 'Unknown')}")
            print(f"   ✅ Rate limits: {len(exchange_response.data.get('rateLimits', []))}")
        else:
            print(f"   ❌ Exchange info failed: {exchange_response.error}")

        # Obtener precio de BTC
        print("\n💰 Getting BTC price...")
        btc_price = await connector.get_current_price("BTCUSDT")

        if btc_price:
            print(f"   ✅ BTC Price: ${btc_price:.2f}")
        else:
            print("   ❌ Failed to get BTC price")

        # Obtener datos históricos
        print("\n📈 Getting historical data...")
        market_data = await connector.get_recent_market_data("BTCUSDT", TimeFrame.H1, 10)

        if market_data:
            print(f"   ✅ Retrieved {len(market_data)} data points")
            if len(market_data) > 0:
                latest = market_data[-1]
                print(f"   📊 Latest: {latest.close:.2f} at {latest.timestamp}")
        else:
            print("   ❌ Failed to get historical data")

        # Obtener múltiples precios
        print("\n📊 Getting multiple prices...")
        symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]
        prices = await connector.get_multiple_prices(symbols)

        for symbol, price in prices.items():
            print(f"   {symbol}: ${price:.2f}")

        print("\n✅ Binance connection test completed!")

    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

    finally:
        await connector.close()

if __name__ == "__main__":
    asyncio.run(test_binance_connection())
