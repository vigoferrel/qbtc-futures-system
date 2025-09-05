#!/usr/bin/env python3
"""
📚 QBTC HISTORICAL DATA MANAGER
==============================

Sistema completo para manejo de datos históricos de mercado.
Proporciona acceso eficiente a datos históricos para análisis técnico
y estrategias de trading.

Características:
- Descarga masiva de datos históricos
- Almacenamiento optimizado en base de datos
- Indexación y búsqueda rápida
- Compresión de datos históricos
- Sincronización automática con exchanges
- Manejo de gaps en datos
- Validación de integridad de datos
"""

import asyncio
import sqlite3
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor
import gzip
import pickle

from real_data_connector import BinanceConnector, TimeFrame, MarketData
from intelligent_cache import IntelligentCache

@dataclass
class HistoricalDataRequest:
    """Solicitud de datos históricos"""
    symbol: str
    timeframe: TimeFrame
    start_date: datetime
    end_date: datetime
    limit: Optional[int] = None
    include_volume: bool = True
    include_trades: bool = False

@dataclass
class DataQualityMetrics:
    """Métricas de calidad de datos"""
    total_candles: int
    missing_candles: int
    duplicated_candles: int
    anomalous_prices: int
    quality_score: float  # 0-1

class HistoricalDataManager:
    """Gestor de datos históricos completo"""

    def __init__(self, db_path: str = "historical_data.db", cache_size_mb: int = 200):
        self.db_path = Path(db_path)
        self.cache = IntelligentCache(max_memory_mb=cache_size_mb, max_disk_mb=1000)
        self.binance = BinanceConnector()

        # Configuración de base de datos
        self.db_connection = None
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Estadísticas
        self.stats = {
            'total_symbols': 0,
            'total_candles': 0,
            'last_sync': None,
            'data_quality': {}
        }

        # Logging
        self.logger = logging.getLogger('HistoricalDataManager')
        self.logger.setLevel(logging.INFO)

        # Inicializar base de datos
        self._initialize_database()

    async def initialize(self):
        """Inicializar el gestor de datos históricos"""
        await self.binance.initialize()

        # Cargar estadísticas existentes
        await self._load_stats()

        self.logger.info(f"📚 Historical Data Manager initialized with {self.stats['total_symbols']} symbols")

    async def download_historical_data(self, request: HistoricalDataRequest,
                                     force_refresh: bool = False) -> List[MarketData]:
        """Descargar datos históricos para un símbolo"""

        # Verificar caché primero
        cache_key = f"historical_{request.symbol}_{request.timeframe.value}_{request.start_date.isoformat()}_{request.end_date.isoformat()}"

        if not force_refresh:
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                self.logger.info(f"📋 Using cached data for {request.symbol}")
                return cached_data

        # Descargar datos de Binance
        all_data = []
        current_date = request.start_date

        while current_date < request.end_date:
            # Calcular rango para esta iteración (máximo 1000 velas por request)
            days_diff = (request.end_date - current_date).days
            chunk_size = min(1000, days_diff * 24)  # Estimación de velas por día

            chunk_end = current_date + timedelta(days=chunk_size // 24)

            # Descargar chunk
            chunk_data = await self.binance.get_recent_market_data(
                request.symbol,
                request.timeframe,
                periods=chunk_size
            )

            if chunk_data:
                # Filtrar por rango de fechas
                filtered_data = [
                    data for data in chunk_data
                    if request.start_date <= data.timestamp <= request.end_date
                ]
                all_data.extend(filtered_data)

            current_date = chunk_end

            # Pequeña pausa para no sobrecargar la API
            await asyncio.sleep(0.1)

        # Validar y limpiar datos
        cleaned_data = await self._validate_and_clean_data(all_data)

        # Almacenar en base de datos
        await self._store_historical_data(request.symbol, request.timeframe, cleaned_data)

        # Cachear resultado
        await self.cache.set(cache_key, cleaned_data, ttl=3600, priority=4)  # Alta prioridad

        self.logger.info(f"📥 Downloaded {len(cleaned_data)} candles for {request.symbol}")

        return cleaned_data

    async def get_historical_data(self, request: HistoricalDataRequest) -> List[MarketData]:
        """Obtener datos históricos (de cache/DB o descargando si es necesario)"""

        # Intentar obtener de base de datos primero
        db_data = await self._get_from_database(request)

        if db_data:
            # Verificar si los datos están completos
            if self._is_data_complete(db_data, request):
                return db_data

        # Descargar datos faltantes
        self.logger.info(f"📥 Downloading missing data for {request.symbol}")
        downloaded_data = await self.download_historical_data(request)

        return downloaded_data

    async def sync_symbol_data(self, symbol: str, timeframes: List[TimeFrame],
                             days_back: int = 365) -> Dict[str, int]:
        """Sincronizar datos históricos para un símbolo"""

        sync_results = {}

        for timeframe in timeframes:
            try:
                # Calcular fechas
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days_back)

                request = HistoricalDataRequest(
                    symbol=symbol,
                    timeframe=timeframe,
                    start_date=start_date,
                    end_date=end_date
                )

                # Descargar datos
                data = await self.download_historical_data(request, force_refresh=True)

                sync_results[f"{symbol}_{timeframe.value}"] = len(data)

                self.logger.info(f"✅ Synced {len(data)} candles for {symbol} {timeframe.value}")

            except Exception as e:
                self.logger.error(f"❌ Failed to sync {symbol} {timeframe.value}: {str(e)}")
                sync_results[f"{symbol}_{timeframe.value}"] = 0

        return sync_results

    async def get_data_quality_report(self, symbol: str, timeframe: TimeFrame,
                                    days: int = 30) -> DataQualityMetrics:
        """Generar reporte de calidad de datos"""

        request = HistoricalDataRequest(
            symbol=symbol,
            timeframe=timeframe,
            start_date=datetime.now() - timedelta(days=days),
            end_date=datetime.now()
        )

        data = await self.get_historical_data(request)

        # Calcular métricas de calidad
        total_candles = len(data)
        missing_candles = self._calculate_missing_candles(data, timeframe)
        duplicated_candles = self._calculate_duplicated_candles(data)
        anomalous_prices = self._detect_anomalous_prices(data)

        # Calcular score de calidad (0-1)
        quality_score = max(0, 1 - (missing_candles + duplicated_candles + anomalous_prices) / total_candles)

        return DataQualityMetrics(
            total_candles=total_candles,
            missing_candles=missing_candles,
            duplicated_candles=duplicated_candles,
            anomalous_prices=anomalous_prices,
            quality_score=quality_score
        )

    async def cleanup_old_data(self, days_to_keep: int = 365) -> int:
        """Limpiar datos antiguos para liberar espacio"""

        cutoff_date = datetime.now() - timedelta(days=days_to_keep)

        # Ejecutar en thread pool para no bloquear
        loop = asyncio.get_event_loop()
        deleted_count = await loop.run_in_executor(
            self.executor,
            self._cleanup_database,
            cutoff_date
        )

        # Limpiar caché también
        await self.cache.clear()

        self.logger.info(f"🧹 Cleaned up {deleted_count} old candles")

        return deleted_count

    async def get_available_symbols(self) -> List[str]:
        """Obtener lista de símbolos disponibles"""

        try:
            exchange_info = await self.binance.get_exchange_info()

            if exchange_info.success and exchange_info.data:
                symbols = [
                    symbol['symbol'] for symbol in exchange_info.data.get('symbols', [])
                    if symbol['status'] == 'TRADING' and symbol['quoteAsset'] == 'USDT'
                ]
                return symbols

        except Exception as e:
            self.logger.error(f"Failed to get available symbols: {str(e)}")

        return []

    def get_storage_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de almacenamiento"""

        db_size = 0
        if self.db_path.exists():
            db_size = self.db_path.stat().st_size

        cache_stats = self.cache.get_stats()

        return {
            'database_size_mb': db_size / (1024 * 1024),
            'total_symbols': self.stats['total_symbols'],
            'total_candles': self.stats['total_candles'],
            'cache_stats': cache_stats,
            'last_sync': self.stats['last_sync']
        }

    def _initialize_database(self):
        """Inicializar base de datos SQLite"""

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Tabla principal de datos OHLCV
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS market_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    timeframe TEXT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    open REAL NOT NULL,
                    high REAL NOT NULL,
                    low REAL NOT NULL,
                    close REAL NOT NULL,
                    volume REAL NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(symbol, timeframe, timestamp)
                )
            ''')

            # Índices para consultas rápidas
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_symbol_timeframe ON market_data(symbol, timeframe)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON market_data(timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_symbol_timestamp ON market_data(symbol, timestamp)')

            # Tabla de metadatos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.commit()

    async def _store_historical_data(self, symbol: str, timeframe: TimeFrame,
                                   data: List[MarketData]):
        """Almacenar datos históricos en base de datos"""

        if not data:
            return

        # Ejecutar en thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            self.executor,
            self._store_data_sync,
            symbol,
            timeframe,
            data
        )

    def _store_data_sync(self, symbol: str, timeframe: TimeFrame, data: List[MarketData]):
        """Almacenamiento síncrono de datos"""

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Preparar datos para inserción
            values = []
            for candle in data:
                values.append((
                    symbol,
                    timeframe.value,
                    candle.timestamp.isoformat(),
                    candle.open,
                    candle.high,
                    candle.low,
                    candle.close,
                    candle.volume
                ))

            # Insertar con UPSERT (INSERT OR REPLACE)
            cursor.executemany('''
                INSERT OR REPLACE INTO market_data
                (symbol, timeframe, timestamp, open, high, low, close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', values)

            conn.commit()

            # Actualizar estadísticas
            self.stats['total_candles'] += len(data)
            if symbol not in self.stats['data_quality']:
                self.stats['data_quality'][symbol] = {}

    async def _get_from_database(self, request: HistoricalDataRequest) -> Optional[List[MarketData]]:
        """Obtener datos de la base de datos"""

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            self.executor,
            self._get_data_sync,
            request
        )

        return result

    def _get_data_sync(self, request: HistoricalDataRequest) -> Optional[List[MarketData]]:
        """Obtener datos de forma síncrona"""

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Consulta con filtros
            query = '''
                SELECT timestamp, open, high, low, close, volume
                FROM market_data
                WHERE symbol = ? AND timeframe = ?
                  AND timestamp >= ? AND timestamp <= ?
                ORDER BY timestamp
            '''

            params = (
                request.symbol,
                request.timeframe.value,
                request.start_date.isoformat(),
                request.end_date.isoformat()
            )

            if request.limit:
                query += f" LIMIT {request.limit}"

            cursor.execute(query, params)
            rows = cursor.fetchall()

            if not rows:
                return None

            # Convertir a objetos MarketData
            data = []
            for row in rows:
                timestamp = datetime.fromisoformat(row[0])
                data.append(MarketData(
                    symbol=request.symbol,
                    timestamp=timestamp,
                    open=row[1],
                    high=row[2],
                    low=row[3],
                    close=row[4],
                    volume=row[5],
                    timeframe=request.timeframe
                ))

            return data

    def _is_data_complete(self, data: List[MarketData], request: HistoricalDataRequest) -> bool:
        """Verificar si los datos están completos"""

        if not data:
            return False

        # Calcular número esperado de velas
        time_diff = request.end_date - request.start_date
        expected_candles = self._calculate_expected_candles(time_diff, request.timeframe)

        # Margen de tolerancia (95% completitud)
        return len(data) >= expected_candles * 0.95

    def _calculate_expected_candles(self, time_diff: timedelta, timeframe: TimeFrame) -> int:
        """Calcular número esperado de velas"""

        minutes_diff = time_diff.total_seconds() / 60

        if timeframe == TimeFrame.M1:
            return int(minutes_diff)
        elif timeframe == TimeFrame.M5:
            return int(minutes_diff / 5)
        elif timeframe == TimeFrame.M15:
            return int(minutes_diff / 15)
        elif timeframe == TimeFrame.M30:
            return int(minutes_diff / 30)
        elif timeframe == TimeFrame.H1:
            return int(minutes_diff / 60)
        elif timeframe == TimeFrame.H4:
            return int(minutes_diff / 240)
        elif timeframe == TimeFrame.D1:
            return int(minutes_diff / 1440)
        elif timeframe == TimeFrame.W1:
            return int(minutes_diff / 10080)
        else:
            return int(minutes_diff / 60)  # Default to H1

    async def _validate_and_clean_data(self, data: List[MarketData]) -> List[MarketData]:
        """Validar y limpiar datos"""

        if not data:
            return data

        cleaned_data = []

        for candle in data:
            # Validar precios
            if self._is_valid_candle(candle):
                cleaned_data.append(candle)

        # Remover duplicados
        cleaned_data = self._remove_duplicates(cleaned_data)

        # Ordenar por timestamp
        cleaned_data.sort(key=lambda x: x.timestamp)

        return cleaned_data

    def _is_valid_candle(self, candle: MarketData) -> bool:
        """Validar vela individual"""

        # Verificar que high >= max(open, close) y low <= min(open, close)
        if candle.high < max(candle.open, candle.close) or candle.low > min(candle.open, candle.close):
            return False

        # Verificar que los precios sean positivos
        if any(price <= 0 for price in [candle.open, candle.high, candle.low, candle.close]):
            return False

        # Verificar que volume sea no negativo
        if candle.volume < 0:
            return False

        return True

    def _remove_duplicates(self, data: List[MarketData]) -> List[MarketData]:
        """Remover velas duplicadas"""

        seen_timestamps = set()
        unique_data = []

        for candle in data:
            timestamp_str = candle.timestamp.isoformat()
            if timestamp_str not in seen_timestamps:
                seen_timestamps.add(timestamp_str)
                unique_data.append(candle)

        return unique_data

    def _calculate_missing_candles(self, data: List[MarketData], timeframe: TimeFrame) -> int:
        """Calcular número de velas faltantes"""

        if len(data) < 2:
            return 0

        # Calcular intervalo esperado en minutos
        if timeframe == TimeFrame.M1:
            interval_minutes = 1
        elif timeframe == TimeFrame.M5:
            interval_minutes = 5
        elif timeframe == TimeFrame.M15:
            interval_minutes = 15
        elif timeframe == TimeFrame.M30:
            interval_minutes = 30
        elif timeframe == TimeFrame.H1:
            interval_minutes = 60
        elif timeframe == TimeFrame.H4:
            interval_minutes = 240
        elif timeframe == TimeFrame.D1:
            interval_minutes = 1440
        else:
            interval_minutes = 60

        # Contar gaps
        missing_count = 0
        data.sort(key=lambda x: x.timestamp)

        for i in range(1, len(data)):
            time_diff = (data[i].timestamp - data[i-1].timestamp).total_seconds() / 60
            expected_diff = interval_minutes

            if time_diff > expected_diff * 1.5:  # Margen de tolerancia
                missing_count += int(time_diff / expected_diff) - 1

        return missing_count

    def _calculate_duplicated_candles(self, data: List[MarketData]) -> int:
        """Calcular número de velas duplicadas"""

        timestamps = [candle.timestamp for candle in data]
        return len(timestamps) - len(set(timestamps))

    def _detect_anomalous_prices(self, data: List[MarketData]) -> int:
        """Detectar precios anómalos"""

        if len(data) < 10:
            return 0

        anomalous_count = 0
        closes = [candle.close for candle in data]

        # Calcular media móvil simple
        window_size = min(20, len(closes))
        for i in range(window_size, len(closes)):
            window = closes[i-window_size:i]
            mean = sum(window) / len(window)
            std = (sum((x - mean) ** 2 for x in window) / len(window)) ** 0.5

            # Detectar outliers (más de 3 desviaciones estándar)
            if abs(closes[i] - mean) > 3 * std:
                anomalous_count += 1

        return anomalous_count

    def _cleanup_database(self, cutoff_date: datetime) -> int:
        """Limpiar base de datos (ejecutado en thread pool)"""

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Contar registros a eliminar
            cursor.execute(
                "SELECT COUNT(*) FROM market_data WHERE timestamp < ?",
                (cutoff_date.isoformat(),)
            )
            count_before = cursor.fetchone()[0]

            # Eliminar registros antiguos
            cursor.execute(
                "DELETE FROM market_data WHERE timestamp < ?",
                (cutoff_date.isoformat(),)
            )

            deleted_count = cursor.rowcount
            conn.commit()

            # Actualizar estadísticas
            self.stats['total_candles'] = max(0, self.stats['total_candles'] - deleted_count)

            return deleted_count

    async def _load_stats(self):
        """Cargar estadísticas de la base de datos"""

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(self.executor, self._load_stats_sync)

    def _load_stats_sync(self):
        """Cargar estadísticas de forma síncrona"""

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Contar símbolos
                cursor.execute("SELECT COUNT(DISTINCT symbol) FROM market_data")
                self.stats['total_symbols'] = cursor.fetchone()[0]

                # Contar velas totales
                cursor.execute("SELECT COUNT(*) FROM market_data")
                self.stats['total_candles'] = cursor.fetchone()[0]

                # Cargar metadatos
                cursor.execute("SELECT key, value FROM metadata")
                for key, value in cursor.fetchall():
                    if key == 'last_sync':
                        self.stats['last_sync'] = datetime.fromisoformat(value)

        except Exception as e:
            self.logger.warning(f"Could not load stats: {str(e)}")

    async def close(self):
        """Cerrar el gestor de datos históricos"""

        await self.binance.close()
        await self.cache.close()

        if self.executor:
            self.executor.shutdown(wait=True)

        self.logger.info("📚 Historical Data Manager closed")

# Función de test
async def test_historical_data_manager():
    """Test del gestor de datos históricos"""

    print("🧪 Testing Historical Data Manager")
    print("=" * 40)

    manager = HistoricalDataManager()

    try:
        # Inicializar
        print("🔗 Initializing...")
        await manager.initialize()

        # Test de descarga de datos
        print("\n📥 Testing data download...")
        request = HistoricalDataRequest(
            symbol="BTCUSDT",
            timeframe=TimeFrame.H1,
            start_date=datetime.now() - timedelta(days=7),
            end_date=datetime.now()
        )

        data = await manager.download_historical_data(request)
        print(f"✅ Downloaded {len(data)} candles for BTCUSDT")

        # Test de recuperación de datos
        print("\n📋 Testing data retrieval...")
        retrieved_data = await manager.get_historical_data(request)

        if retrieved_data:
            print(f"✅ Retrieved {len(retrieved_data)} candles from cache/DB")
        else:
            print("❌ Failed to retrieve data")

        # Test de calidad de datos
        print("\n📊 Testing data quality...")
        quality_report = await manager.get_data_quality_report("BTCUSDT", TimeFrame.H1, days=7)

        print(f"   Total candles: {quality_report.total_candles}")
        print(f"   Missing candles: {quality_report.missing_candles}")
        print(f"   Quality score: {quality_report.quality_score:.2%}")

        # Test de estadísticas
        print("\n📈 Testing storage stats...")
        stats = manager.get_storage_stats()
        print(f"   Database size: {stats['database_size_mb']:.2f} MB")
        print(f"   Total symbols: {stats['total_symbols']}")
        print(f"   Total candles: {stats['total_candles']}")

        print("\n✅ Historical Data Manager test completed!")

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

    finally:
        await manager.close()

if __name__ == "__main__":
    asyncio.run(test_historical_data_manager())

