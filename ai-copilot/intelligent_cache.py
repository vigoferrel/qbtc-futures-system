#!/usr/bin/env python3
"""
🧠 QBTC INTELLIGENT CACHE SYSTEM
=================================

Sistema de caché inteligente para optimizar la performance
del QBTC Master Copilot con datos de mercado reales.

Características:
- Caché multi-nivel (memoria, disco, redis)
- Estrategias de invalidación inteligente
- Compresión de datos
- Métricas de rendimiento
- Prefetching predictivo
- LRU con prioridades
"""

import asyncio
import json
import hashlib
import pickle
import time
import logging
from typing import Dict, Any, Optional, List, Callable, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import os
from pathlib import Path

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

@dataclass
class CacheEntry:
    """Entrada de caché estructurada"""
    key: str
    data: Any
    timestamp: datetime
    ttl: int  # Time to live in seconds
    access_count: int = 0
    last_access: datetime = None
    size_bytes: int = 0
    compression_ratio: float = 1.0
    priority: int = 1  # 1=low, 5=high
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.last_access is None:
            self.last_access = datetime.now()
        if self.metadata is None:
            self.metadata = {}
        if self.size_bytes == 0:
            self.size_bytes = len(pickle.dumps(self.data))

    def is_expired(self) -> bool:
        """Verificar si la entrada ha expirado"""
        return (datetime.now() - self.timestamp).total_seconds() > self.ttl

    def is_stale(self, max_age_seconds: int = 300) -> bool:
        """Verificar si la entrada está obsoleta"""
        return (datetime.now() - self.last_access).total_seconds() > max_age_seconds

    def calculate_score(self) -> float:
        """Calcular score para LRU con prioridades"""
        time_factor = (datetime.now() - self.last_access).total_seconds()
        access_factor = max(1, self.access_count)
        priority_factor = self.priority

        # Score más bajo = más importante para mantener
        return time_factor / (access_factor * priority_factor)

class CacheStrategy(Enum):
    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used
    SIZE_BASED = "size_based"  # Based on size
    PRIORITY_BASED = "priority_based"  # Based on priority
    HYBRID = "hybrid"  # Combination of strategies

class CompressionType(Enum):
    NONE = "none"
    GZIP = "gzip"
    LZ4 = "lz4"
    ZSTD = "zstd"

class IntelligentCache:
    """Sistema de caché inteligente multi-nivel"""

    def __init__(self, max_memory_mb: int = 100, max_disk_mb: int = 1000,
                 redis_url: Optional[str] = None, strategy: CacheStrategy = CacheStrategy.HYBRID):
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.max_disk_bytes = max_disk_mb * 1024 * 1024
        self.strategy = strategy

        # Niveles de caché
        self.memory_cache: Dict[str, CacheEntry] = {}
        self.disk_cache_path = Path("cache") / "intelligent_cache"
        self.disk_cache: Dict[str, CacheEntry] = {}

        # Redis para caché distribuida
        self.redis_client = None
        if redis_url and REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(redis_url)
                self.redis_client.ping()  # Test connection
            except Exception as e:
                logging.warning(f"Redis connection failed: {e}")
                self.redis_client = None

        # Estadísticas
        self.stats = {
            'memory_hits': 0,
            'memory_misses': 0,
            'disk_hits': 0,
            'disk_misses': 0,
            'redis_hits': 0,
            'redis_misses': 0,
            'evictions': 0,
            'compressions': 0,
            'total_requests': 0
        }

        # Configuración
        self.compression_type = CompressionType.GZIP
        self.compression_threshold = 1024  # Comprimir si > 1KB
        self.prefetch_enabled = True
        self.prefetch_patterns: Dict[str, Callable] = {}

        # Logging
        self.logger = logging.getLogger('IntelligentCache')
        self.logger.setLevel(logging.INFO)

        # Inicializar directorios
        self._initialize_cache_dirs()

        # Cargar caché de disco al iniciar
        self._load_disk_cache()

        # Iniciar limpieza automática
        self.cleanup_task = asyncio.create_task(self._auto_cleanup())

    def _initialize_cache_dirs(self):
        """Inicializar directorios de caché"""
        self.disk_cache_path.parent.mkdir(exist_ok=True)

    async def set(self, key: str, data: Any, ttl: int = 3600,
                  priority: int = 1, metadata: Optional[Dict] = None) -> bool:
        """Almacenar datos en caché"""
        try:
            # Crear entrada de caché
            entry = CacheEntry(
                key=key,
                data=data,
                timestamp=datetime.now(),
                ttl=ttl,
                priority=priority,
                metadata=metadata or {}
            )

            # Comprimir si es necesario
            if self._should_compress(entry):
                entry = await self._compress_entry(entry)

            # Intentar almacenar en memoria primero
            if self._can_fit_in_memory(entry):
                self.memory_cache[key] = entry
            else:
                # Si no cabe en memoria, intentar disco
                await self._store_to_disk(entry)

            # Almacenar en Redis si está disponible
            if self.redis_client:
                await self._store_to_redis(entry)

            # Limpiar si es necesario
            await self._cleanup_if_needed()

            return True

        except Exception as e:
            self.logger.error(f"Error storing cache entry {key}: {e}")
            return False

    async def get(self, key: str) -> Optional[Any]:
        """Obtener datos del caché"""
        self.stats['total_requests'] += 1

        # Intentar memoria primero
        if key in self.memory_cache:
            entry = self.memory_cache[key]
            if not entry.is_expired():
                entry.access_count += 1
                entry.last_access = datetime.now()
                self.stats['memory_hits'] += 1

                # Decompress if needed
                if entry.compression_ratio < 1.0:
                    return await self._decompress_data(entry.data)
                return entry.data
            else:
                # Eliminar entrada expirada
                del self.memory_cache[key]

        # Intentar disco
        disk_entry = await self._load_from_disk(key)
        if disk_entry and not disk_entry.is_expired():
            self.stats['disk_hits'] += 1

            # Mover a memoria si es posible
            if self._can_fit_in_memory(disk_entry):
                self.memory_cache[key] = disk_entry

            data = disk_entry.data
            if disk_entry.compression_ratio < 1.0:
                data = await self._decompress_data(data)

            return data

        # Intentar Redis
        if self.redis_client:
            redis_data = await self._load_from_redis(key)
            if redis_data:
                self.stats['redis_hits'] += 1
                return redis_data

        # Cache miss
        self.stats['memory_misses'] += 1
        self.stats['disk_misses'] += 1
        if self.redis_client:
            self.stats['redis_misses'] += 1

        return None

    async def delete(self, key: str) -> bool:
        """Eliminar entrada del caché"""
        deleted = False

        # Eliminar de memoria
        if key in self.memory_cache:
            del self.memory_cache[key]
            deleted = True

        # Eliminar de disco
        disk_file = self.disk_cache_path / f"{hashlib.md5(key.encode()).hexdigest()}.cache"
        if disk_file.exists():
            disk_file.unlink()
            deleted = True

        # Eliminar de Redis
        if self.redis_client:
            try:
                self.redis_client.delete(key)
                deleted = True
            except Exception:
                pass

        return deleted

    async def clear(self) -> bool:
        """Limpiar todo el caché"""
        try:
            # Limpiar memoria
            self.memory_cache.clear()

            # Limpiar disco
            if self.disk_cache_path.exists():
                for file in self.disk_cache_path.glob("*.cache"):
                    file.unlink()

            # Limpiar Redis
            if self.redis_client:
                self.redis_client.flushdb()

            self.logger.info("Cache cleared successfully")
            return True

        except Exception as e:
            self.logger.error(f"Error clearing cache: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas del caché"""
        memory_usage = sum(entry.size_bytes for entry in self.memory_cache.values())
        disk_usage = sum(entry.size_bytes for entry in self.disk_cache.values())

        hit_rate = 0
        if self.stats['total_requests'] > 0:
            total_hits = self.stats['memory_hits'] + self.stats['disk_hits'] + self.stats['redis_hits']
            hit_rate = total_hits / self.stats['total_requests']

        return {
            'memory_entries': len(self.memory_cache),
            'memory_usage_mb': memory_usage / (1024 * 1024),
            'disk_entries': len(self.disk_cache),
            'disk_usage_mb': disk_usage / (1024 * 1024),
            'redis_available': self.redis_client is not None,
            'hit_rate': hit_rate,
            'total_requests': self.stats['total_requests'],
            'evictions': self.stats['evictions'],
            'compressions': self.stats['compressions'],
            'strategy': self.strategy.value
        }

    def register_prefetch_pattern(self, pattern: str, fetcher: Callable):
        """Registrar patrón de prefetching"""
        self.prefetch_patterns[pattern] = fetcher

    async def prefetch(self, patterns: List[str]):
        """Ejecutar prefetching para patrones específicos"""
        if not self.prefetch_enabled:
            return

        for pattern in patterns:
            if pattern in self.prefetch_patterns:
                try:
                    await self.prefetch_patterns[pattern]()
                except Exception as e:
                    self.logger.error(f"Prefetch error for pattern {pattern}: {e}")

    def _can_fit_in_memory(self, entry: CacheEntry) -> bool:
        """Verificar si la entrada cabe en memoria"""
        current_usage = sum(e.size_bytes for e in self.memory_cache.values())
        return current_usage + entry.size_bytes <= self.max_memory_bytes

    def _should_compress(self, entry: CacheEntry) -> bool:
        """Determinar si se debe comprimir la entrada"""
        return entry.size_bytes > self.compression_threshold

    async def _compress_entry(self, entry: CacheEntry) -> CacheEntry:
        """Comprimir entrada de caché"""
        try:
            import gzip

            original_data = pickle.dumps(entry.data)
            compressed_data = gzip.compress(original_data)

            entry.data = compressed_data
            entry.compression_ratio = len(compressed_data) / len(original_data)
            entry.size_bytes = len(compressed_data)

            self.stats['compressions'] += 1

        except Exception as e:
            self.logger.warning(f"Compression failed: {e}")

        return entry

    async def _decompress_data(self, compressed_data: bytes) -> Any:
        """Descomprimir datos"""
        try:
            import gzip

            decompressed = gzip.decompress(compressed_data)
            return pickle.loads(decompressed)

        except Exception as e:
            self.logger.error(f"Decompression failed: {e}")
            return None

    async def _store_to_disk(self, entry: CacheEntry):
        """Almacenar entrada en disco"""
        try:
            cache_file = self.disk_cache_path / f"{hashlib.md5(entry.key.encode()).hexdigest()}.cache"

            with open(cache_file, 'wb') as f:
                pickle.dump(entry, f)

            self.disk_cache[entry.key] = entry

        except Exception as e:
            self.logger.error(f"Disk storage failed for {entry.key}: {e}")

    async def _load_from_disk(self, key: str) -> Optional[CacheEntry]:
        """Cargar entrada desde disco"""
        try:
            cache_file = self.disk_cache_path / f"{hashlib.md5(key.encode()).hexdigest()}.cache"

            if not cache_file.exists():
                return None

            with open(cache_file, 'rb') as f:
                entry = pickle.load(f)

            if entry.is_expired():
                # Eliminar archivo expirado
                cache_file.unlink()
                return None

            return entry

        except Exception as e:
            self.logger.error(f"Disk load failed for {key}: {e}")
            return None

    async def _store_to_redis(self, entry: CacheEntry):
        """Almacenar entrada en Redis"""
        if not self.redis_client:
            return

        try:
            # Serializar entrada
            entry_data = asdict(entry)
            entry_data['data'] = pickle.dumps(entry.data).decode('latin1')

            # Almacenar con TTL
            self.redis_client.setex(
                entry.key,
                entry.ttl,
                json.dumps(entry_data)
            )

        except Exception as e:
            self.logger.error(f"Redis storage failed for {entry.key}: {e}")

    async def _load_from_redis(self, key: str) -> Optional[Any]:
        """Cargar entrada desde Redis"""
        if not self.redis_client:
            return None

        try:
            data = self.redis_client.get(key)
            if not data:
                return None

            entry_data = json.loads(data)
            entry_data['data'] = pickle.loads(entry_data['data'].encode('latin1'))

            entry = CacheEntry(**entry_data)

            if entry.is_expired():
                return None

            return entry.data

        except Exception as e:
            self.logger.error(f"Redis load failed for {key}: {e}")
            return None

    async def _cleanup_if_needed(self):
        """Limpiar caché si es necesario"""
        # Limpiar memoria si excede el límite
        memory_usage = sum(entry.size_bytes for entry in self.memory_cache.values())

        if memory_usage > self.max_memory_bytes:
            await self._evict_memory_entries()

        # Limpiar entradas expiradas
        await self._cleanup_expired_entries()

    async def _evict_memory_entries(self):
        """Evacuar entradas de memoria según estrategia"""
        if self.strategy == CacheStrategy.LRU:
            # Ordenar por último acceso (más antiguo primero)
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].last_access
            )
        elif self.strategy == CacheStrategy.LFU:
            # Ordenar por conteo de accesos (menor primero)
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].access_count
            )
        elif self.strategy == CacheStrategy.SIZE_BASED:
            # Ordenar por tamaño (mayor primero)
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].size_bytes,
                reverse=True
            )
        elif self.strategy == CacheStrategy.PRIORITY_BASED:
            # Ordenar por prioridad (menor prioridad primero)
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].priority
            )
        else:  # HYBRID
            # Usar score calculado
            sorted_entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].calculate_score(),
                reverse=True
            )

        # Evacuar hasta que quepa en memoria
        memory_usage = sum(entry.size_bytes for entry in self.memory_cache.values())

        for key, entry in sorted_entries:
            if memory_usage <= self.max_memory_bytes * 0.8:  # Mantener 80% del límite
                break

            # Mover a disco si es posible
            if entry.priority >= 3:  # Alta prioridad
                await self._store_to_disk(entry)

            # Eliminar de memoria
            del self.memory_cache[key]
            memory_usage -= entry.size_bytes
            self.stats['evictions'] += 1

    async def _cleanup_expired_entries(self):
        """Limpiar entradas expiradas"""
        expired_keys = []

        # En memoria
        for key, entry in self.memory_cache.items():
            if entry.is_expired():
                expired_keys.append(key)

        for key in expired_keys:
            del self.memory_cache[key]

        # En disco
        expired_files = []
        for cache_file in self.disk_cache_path.glob("*.cache"):
            try:
                with open(cache_file, 'rb') as f:
                    entry = pickle.load(f)
                    if entry.is_expired():
                        expired_files.append(cache_file)
            except Exception:
                expired_files.append(cache_file)

        for cache_file in expired_files:
            cache_file.unlink()

    async def _auto_cleanup(self):
        """Limpieza automática periódica"""
        while True:
            try:
                await asyncio.sleep(300)  # Cada 5 minutos
                await self._cleanup_expired_entries()

                # Log stats cada hora
                if int(time.time()) % 3600 == 0:
                    stats = self.get_stats()
                    self.logger.info(f"Cache stats: {stats}")

            except Exception as e:
                self.logger.error(f"Auto cleanup error: {e}")

    def _load_disk_cache(self):
        """Cargar índice de caché de disco"""
        try:
            for cache_file in self.disk_cache_path.glob("*.cache"):
                try:
                    with open(cache_file, 'rb') as f:
                        entry = pickle.load(f)
                        if not entry.is_expired():
                            self.disk_cache[entry.key] = entry
                except Exception as e:
                    self.logger.warning(f"Failed to load cache file {cache_file}: {e}")
                    # Eliminar archivo corrupto
                    cache_file.unlink()

        except Exception as e:
            self.logger.error(f"Error loading disk cache: {e}")

    async def close(self):
        """Cerrar el sistema de caché"""
        if hasattr(self, 'cleanup_task'):
            self.cleanup_task.cancel()
            try:
                await self.cleanup_task
            except asyncio.CancelledError:
                pass

# Funciones de utilidad para testing
async def test_intelligent_cache():
    """Test del sistema de caché inteligente"""
    print("🧪 Testing Intelligent Cache System")
    print("=" * 40)

    cache = IntelligentCache(max_memory_mb=10, max_disk_mb=50)

    try:
        # Test básico de almacenamiento y recuperación
        print("\n💾 Testing basic operations...")

        # Almacenar datos
        await cache.set("test_key", {"data": "test_value"}, ttl=60, priority=3)
        print("✅ Data stored successfully")

        # Recuperar datos
        retrieved = await cache.get("test_key")
        if retrieved and retrieved["data"] == "test_value":
            print("✅ Data retrieved successfully")
        else:
            print("❌ Data retrieval failed")

        # Test con expiración
        print("\n⏰ Testing expiration...")
        await cache.set("expire_key", "expires soon", ttl=1, priority=1)
        await asyncio.sleep(2)
        expired = await cache.get("expire_key")
        if expired is None:
            print("✅ Expiration working correctly")
        else:
            print("❌ Expiration not working")

        # Test de compresión
        print("\n🗜️ Testing compression...")
        large_data = {"data": "x" * 5000}  # 5KB de datos
        await cache.set("large_key", large_data, ttl=60, priority=2)
        retrieved_large = await cache.get("large_key")
        if retrieved_large and retrieved_large["data"] == "x" * 5000:
            print("✅ Compression working correctly")
        else:
            print("❌ Compression failed")

        # Test de estadísticas
        print("\n📊 Testing statistics...")
        stats = cache.get_stats()
        print(f"   Memory entries: {stats['memory_entries']}")
        print(f"   Memory usage: {stats['memory_usage_mb']:.2f} MB")
        print(f"   Disk usage: {stats['disk_usage_mb']:.2f} MB")
        print(f"   Hit rate: {stats['hit_rate']:.2%}")

        # Test de limpieza
        print("\n🧹 Testing cleanup...")
        for i in range(20):
            await cache.set(f"bulk_key_{i}", f"bulk_data_{i}", ttl=60, priority=1)

        await cache._cleanup_if_needed()
        stats_after = cache.get_stats()
        print(f"   Entries after cleanup: {stats_after['memory_entries']}")

        print("\n✅ Intelligent cache test completed!")

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

    finally:
        await cache.close()

if __name__ == "__main__":
    asyncio.run(test_intelligent_cache())
