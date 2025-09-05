#!/usr/bin/env python3
"""
🛡️ QBTC DATA VALIDATOR & CLEANER
=================================

Sistema de validación y limpieza de datos en tiempo real
para el QBTC Master Copilot.

Características:
- Validación de datos en tiempo real
- Detección de anomalías y outliers
- Limpieza automática de datos corruptos
- Normalización de datos
- Verificación de integridad
- Alertas de calidad de datos
- Estadísticas de validación
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import logging
import statistics

from market_analysis import MarketData, TimeFrame
from real_data_connector import BinanceConnector

class ValidationSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class DataQualityIssue(Enum):
    MISSING_DATA = "missing_data"
    DUPLICATE_DATA = "duplicate_data"
    OUTLIER_PRICE = "outlier_price"
    INVALID_OHLC = "invalid_ohlc"
    NEGATIVE_VOLUME = "negative_volume"
    STALE_DATA = "stale_data"
    INCONSISTENT_DATA = "inconsistent_data"
    API_ERROR = "api_error"

@dataclass
class ValidationResult:
    """Resultado de validación de datos"""
    is_valid: bool
    issues: List[DataQualityIssue] = field(default_factory=list)
    severity: ValidationSeverity = ValidationSeverity.INFO
    confidence_score: float = 1.0
    cleaned_data: Any = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class DataValidationStats:
    """Estadísticas de validación de datos"""
    total_validated: int = 0
    total_cleaned: int = 0
    issues_found: Dict[DataQualityIssue, int] = field(default_factory=dict)
    quality_score: float = 1.0
    last_validation: Optional[datetime] = None

class RealTimeDataValidator:
    """Validador de datos en tiempo real"""

    def __init__(self):
        self.binance = BinanceConnector()

        # Configuración de validación
        self.price_tolerance = 0.1  # 10% tolerance for price jumps
        self.volume_tolerance = 2.0  # 2x tolerance for volume spikes
        self.outlier_threshold = 3.0  # Standard deviations for outliers
        self.max_stale_seconds = 300  # 5 minutes max staleness

        # Estadísticas
        self.stats: Dict[str, DataValidationStats] = {}
        self.validation_rules: Dict[str, Callable] = {}

        # Logging
        self.logger = logging.getLogger('DataValidator')
        self.logger.setLevel(logging.INFO)

        # Callbacks
        self.on_validation_issue: Optional[Callable[[ValidationResult], None]] = None
        self.on_data_cleaned: Optional[Callable[[Any, Any], None]] = None

        # Inicializar reglas de validación
        self._initialize_validation_rules()

    async def initialize(self):
        """Inicializar el validador"""
        await self.binance.initialize()
        self.logger.info("🛡️ Real-Time Data Validator initialized")

    async def validate_market_data(self, data: MarketData,
                                 context: Optional[Dict[str, Any]] = None) -> ValidationResult:
        """Validar datos de mercado individuales"""

        issues = []
        confidence = 1.0

        # Ejecutar todas las reglas de validación
        for rule_name, rule_func in self.validation_rules.items():
            try:
                rule_result = await rule_func(data, context)
                if not rule_result['valid']:
                    issues.extend(rule_result['issues'])
                    confidence *= rule_result['confidence']
            except Exception as e:
                self.logger.error(f"Error in validation rule {rule_name}: {str(e)}")
                issues.append(DataQualityIssue.API_ERROR)
                confidence *= 0.5

        # Determinar severidad
        severity = self._calculate_severity(issues)

        # Limpiar datos si hay issues corregibles
        cleaned_data = await self._clean_data(data, issues) if issues else data

        # Actualizar estadísticas
        await self._update_stats(data.symbol, issues, severity)

        result = ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            severity=severity,
            confidence_score=confidence,
            cleaned_data=cleaned_data,
            metadata={
                'symbol': data.symbol,
                'timestamp': data.timestamp.isoformat(),
                'issues_count': len(issues),
                'validation_time': datetime.now().isoformat()
            }
        )

        # Notificar callbacks
        if issues and self.on_validation_issue:
            try:
                await self.on_validation_issue(result)
            except Exception as e:
                self.logger.error(f"Error in validation callback: {str(e)}")

        if cleaned_data != data and self.on_data_cleaned:
            try:
                await self.on_data_cleaned(data, cleaned_data)
            except Exception as e:
                self.logger.error(f"Error in cleaning callback: {str(e)}")

        return result

    async def validate_batch_data(self, data_batch: List[MarketData],
                                context: Optional[Dict[str, Any]] = None) -> List[ValidationResult]:
        """Validar lote de datos de mercado"""

        tasks = [self.validate_market_data(data, context) for data in data_batch]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filtrar excepciones y convertir a resultados de error
        validated_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                error_result = ValidationResult(
                    is_valid=False,
                    issues=[DataQualityIssue.API_ERROR],
                    severity=ValidationSeverity.ERROR,
                    confidence_score=0.0,
                    metadata={'error': str(result)}
                )
                validated_results.append(error_result)
            else:
                validated_results.append(result)

        return validated_results

    async def validate_stream_data(self, stream_data: Dict[str, Any],
                                 data_type: str = "ticker") -> ValidationResult:
        """Validar datos de streaming en tiempo real"""

        try:
            # Convertir datos de stream a MarketData
            if data_type == "ticker":
                market_data = self._convert_ticker_to_market_data(stream_data)
            elif data_type == "trade":
                market_data = self._convert_trade_to_market_data(stream_data)
            elif data_type == "kline":
                market_data = self._convert_kline_to_market_data(stream_data)
            else:
                return ValidationResult(
                    is_valid=False,
                    issues=[DataQualityIssue.INVALID_OHLC],
                    severity=ValidationSeverity.ERROR,
                    confidence_score=0.0
                )

            # Validar datos convertidos
            return await self.validate_market_data(market_data, {'source': 'stream'})

        except Exception as e:
            return ValidationResult(
                is_valid=False,
                issues=[DataQualityIssue.API_ERROR],
                severity=ValidationSeverity.ERROR,
                confidence_score=0.0,
                metadata={'conversion_error': str(e)}
            )

    def _initialize_validation_rules(self):
        """Inicializar reglas de validación"""

        self.validation_rules = {
            'price_validation': self._validate_prices,
            'volume_validation': self._validate_volume,
            'ohlc_consistency': self._validate_ohlc_consistency,
            'staleness_check': self._validate_staleness,
            'outlier_detection': self._detect_outliers,
            'duplicate_check': self._check_duplicates,
            'market_hours': self._validate_market_hours
        }

    async def _validate_prices(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Validar precios"""

        issues = []
        confidence = 1.0

        # Verificar precios positivos
        if any(price <= 0 for price in [data.open, data.high, data.low, data.close]):
            issues.append(DataQualityIssue.INVALID_OHLC)
            confidence *= 0.1

        # Verificar lógica OHLC
        if data.high < max(data.open, data.close) or data.low > min(data.open, data.close):
            issues.append(DataQualityIssue.INVALID_OHLC)
            confidence *= 0.5

        # Verificar volatilidad extrema
        if data.high / data.low > 1.1:  # Más del 10% de rango
            price_range = abs(data.high - data.low)
            if price_range / data.close > 0.05:  # Más del 5% del precio de cierre
                issues.append(DataQualityIssue.OUTLIER_PRICE)
                confidence *= 0.8

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _validate_volume(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Validar volumen"""

        issues = []
        confidence = 1.0

        # Verificar volumen no negativo
        if data.volume < 0:
            issues.append(DataQualityIssue.NEGATIVE_VOLUME)
            confidence *= 0.1

        # Verificar volumen cero (posiblemente datos faltantes)
        if data.volume == 0:
            issues.append(DataQualityIssue.MISSING_DATA)
            confidence *= 0.9

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _validate_ohlc_consistency(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Validar consistencia OHLC"""

        issues = []
        confidence = 1.0

        # Verificar que high es el máximo
        max_price = max(data.open, data.close)
        if data.high < max_price:
            issues.append(DataQualityIssue.INVALID_OHLC)
            confidence *= 0.5

        # Verificar que low es el mínimo
        min_price = min(data.open, data.close)
        if data.low > min_price:
            issues.append(DataQualityIssue.INVALID_OHLC)
            confidence *= 0.5

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _validate_staleness(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Validar frescura de datos"""

        issues = []
        confidence = 1.0

        time_diff = (datetime.now() - data.timestamp).total_seconds()

        if time_diff > self.max_stale_seconds:
            issues.append(DataQualityIssue.STALE_DATA)
            # Reducir confianza basada en cuán obsoletos están los datos
            staleness_factor = min(time_diff / (self.max_stale_seconds * 2), 1.0)
            confidence *= (1.0 - staleness_factor * 0.5)

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _detect_outliers(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Detectar outliers usando estadísticas"""

        issues = []
        confidence = 1.0

        # Para detectar outliers necesitamos contexto histórico
        if context and 'historical_data' in context:
            historical_prices = [d.close for d in context['historical_data'][-50:]]  # Últimas 50 velas

            if len(historical_prices) >= 10:
                try:
                    mean_price = statistics.mean(historical_prices)
                    stdev_price = statistics.stdev(historical_prices)

                    # Detectar outlier en precio de cierre
                    z_score = abs(data.close - mean_price) / stdev_price if stdev_price > 0 else 0

                    if z_score > self.outlier_threshold:
                        issues.append(DataQualityIssue.OUTLIER_PRICE)
                        confidence *= 0.7

                except Exception as e:
                    self.logger.warning(f"Error detecting outliers: {str(e)}")

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _check_duplicates(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Verificar datos duplicados"""

        issues = []
        confidence = 1.0

        # Para detectar duplicados necesitamos contexto
        if context and 'recent_data' in context:
            recent_timestamps = [d.timestamp for d in context['recent_data'][-10:]]  # Últimas 10 velas

            if data.timestamp in recent_timestamps:
                issues.append(DataQualityIssue.DUPLICATE_DATA)
                confidence *= 0.8

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    async def _validate_market_hours(self, data: MarketData, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Validar horas de mercado"""

        issues = []
        confidence = 1.0

        # Para criptomonedas, el mercado está abierto 24/7
        # pero podemos verificar días de la semana
        if data.timestamp.weekday() >= 5:  # Sábado = 5, Domingo = 6
            # Datos de fin de semana pueden ser menos confiables
            confidence *= 0.95

        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': confidence
        }

    def _calculate_severity(self, issues: List[DataQualityIssue]) -> ValidationSeverity:
        """Calcular severidad basada en issues encontrados"""

        if any(issue in [DataQualityIssue.API_ERROR, DataQualityIssue.INVALID_OHLC,
                        DataQualityIssue.NEGATIVE_VOLUME] for issue in issues):
            return ValidationSeverity.CRITICAL

        if any(issue in [DataQualityIssue.STALE_DATA, DataQualityIssue.OUTLIER_PRICE]
               for issue in issues):
            return ValidationSeverity.ERROR

        if any(issue in [DataQualityIssue.MISSING_DATA, DataQualityIssue.DUPLICATE_DATA]
               for issue in issues):
            return ValidationSeverity.WARNING

        return ValidationSeverity.INFO

    async def _clean_data(self, data: MarketData, issues: List[DataQualityIssue]) -> MarketData:
        """Limpiar datos con issues corregibles"""

        cleaned_data = MarketData(
            symbol=data.symbol,
            timestamp=data.timestamp,
            open=data.open,
            high=data.high,
            low=data.low,
            close=data.close,
            volume=data.volume,
            timeframe=data.timeframe
        )

        # Corregir precios negativos
        if DataQualityIssue.INVALID_OHLC in issues:
            # Usar el precio de cierre como base para correcciones
            if cleaned_data.open <= 0:
                cleaned_data.open = cleaned_data.close
            if cleaned_data.high <= 0:
                cleaned_data.high = max(cleaned_data.open, cleaned_data.close)
            if cleaned_data.low <= 0:
                cleaned_data.low = min(cleaned_data.open, cleaned_data.close)

        # Corregir volumen negativo
        if DataQualityIssue.NEGATIVE_VOLUME in issues:
            cleaned_data.volume = abs(cleaned_data.volume)

        return cleaned_data

    def _convert_ticker_to_market_data(self, ticker_data: Dict[str, Any]) -> MarketData:
        """Convertir datos de ticker a MarketData"""

        symbol = ticker_data.get('s', 'UNKNOWN')
        price = float(ticker_data.get('c', 0))
        timestamp = datetime.fromtimestamp(ticker_data.get('E', 0) / 1000)

        # Crear vela sintética con el precio actual
        return MarketData(
            symbol=symbol,
            timestamp=timestamp,
            open=price,
            high=price,
            low=price,
            close=price,
            volume=float(ticker_data.get('v', 0)),
            timeframe=TimeFrame.M1
        )

    def _convert_trade_to_market_data(self, trade_data: Dict[str, Any]) -> MarketData:
        """Convertir datos de trade a MarketData"""

        symbol = trade_data.get('s', 'UNKNOWN')
        price = float(trade_data.get('p', 0))
        quantity = float(trade_data.get('q', 0))
        timestamp = datetime.fromtimestamp(trade_data.get('T', 0) / 1000)

        return MarketData(
            symbol=symbol,
            timestamp=timestamp,
            open=price,
            high=price,
            low=price,
            close=price,
            volume=quantity,
            timeframe=TimeFrame.M1
        )

    def _convert_kline_to_market_data(self, kline_data: Dict[str, Any]) -> MarketData:
        """Convertir datos de kline a MarketData"""

        symbol = kline_data.get('s', 'UNKNOWN')
        kline = kline_data.get('k', {})

        return MarketData(
            symbol=symbol,
            timestamp=datetime.fromtimestamp(kline.get('t', 0) / 1000),
            open=float(kline.get('o', 0)),
            high=float(kline.get('h', 0)),
            low=float(kline.get('l', 0)),
            close=float(kline.get('c', 0)),
            volume=float(kline.get('v', 0)),
            timeframe=TimeFrame.M1  # Asumir 1m, ajustar según necesidad
        )

    async def _update_stats(self, symbol: str, issues: List[DataQualityIssue],
                          severity: ValidationSeverity):
        """Actualizar estadísticas de validación"""

        if symbol not in self.stats:
            self.stats[symbol] = DataValidationStats()

        stats = self.stats[symbol]
        stats.total_validated += 1
        stats.last_validation = datetime.now()

        if issues:
            stats.total_cleaned += 1

        for issue in issues:
            if issue not in stats.issues_found:
                stats.issues_found[issue] = 0
            stats.issues_found[issue] += 1

        # Calcular quality score
        if stats.total_validated > 0:
            clean_percentage = (stats.total_validated - stats.total_cleaned) / stats.total_validated
            stats.quality_score = clean_percentage

    def get_validation_stats(self, symbol: Optional[str] = None) -> Dict[str, Any]:
        """Obtener estadísticas de validación"""

        if symbol:
            return asdict(self.stats.get(symbol, DataValidationStats()))

        # Estadísticas globales
        total_validated = sum(stats.total_validated for stats in self.stats.values())
        total_cleaned = sum(stats.total_cleaned for stats in self.stats.values())

        global_quality = 0
        if total_validated > 0:
            global_quality = (total_validated - total_cleaned) / total_validated

        return {
            'total_symbols': len(self.stats),
            'total_validated': total_validated,
            'total_cleaned': total_cleaned,
            'global_quality_score': global_quality,
            'symbol_stats': {symbol: asdict(stats) for symbol, stats in self.stats.items()}
        }

    async def close(self):
        """Cerrar el validador"""
        await self.binance.close()
        self.logger.info("🛡️ Data Validator closed")

# Función de test
async def test_data_validator():
    """Test del validador de datos"""

    print("🧪 Testing Real-Time Data Validator")
    print("=" * 40)

    validator = RealTimeDataValidator()

    try:
        # Inicializar
        print("🔗 Initializing...")
        await validator.initialize()

        # Crear datos de prueba
        print("\n📊 Testing data validation...")

        # Datos válidos
        valid_data = MarketData(
            symbol="BTCUSDT",
            timestamp=datetime.now(),
            open=45000,
            high=45100,
            low=44900,
            close=45050,
            volume=100,
            timeframe=TimeFrame.H1
        )

        valid_result = await validator.validate_market_data(valid_data)
        print(f"✅ Valid data: {valid_result.is_valid} (confidence: {valid_result.confidence_score:.2%})")

        # Datos con issues
        invalid_data = MarketData(
            symbol="BTCUSDT",
            timestamp=datetime.now() - timedelta(hours=2),  # Datos obsoletos
            open=-1000,  # Precio negativo
            high=45100,
            low=44900,
            close=45050,
            volume=-50,  # Volumen negativo
            timeframe=TimeFrame.H1
        )

        invalid_result = await validator.validate_market_data(invalid_data)
        print(f"❌ Invalid data: {invalid_result.is_valid} (issues: {len(invalid_result.issues)})")
        print(f"   Issues found: {[issue.value for issue in invalid_result.issues]}")

        # Test de datos limpios
        if invalid_result.cleaned_data:
            print(f"✅ Data cleaned: {invalid_result.cleaned_data.open} -> {invalid_result.cleaned_data.volume}")

        # Test de lote de datos
        print("\n📦 Testing batch validation...")
        batch_data = [valid_data, invalid_data, valid_data]
        batch_results = await validator.validate_batch_data(batch_data)

        valid_count = sum(1 for r in batch_results if r.is_valid)
        print(f"✅ Batch validation: {valid_count}/{len(batch_results)} valid")

        # Test de estadísticas
        print("\n📈 Testing statistics...")
        stats = validator.get_validation_stats()
        print(f"   Total validated: {stats['total_validated']}")
        print(f"   Total cleaned: {stats['total_cleaned']}")
        print(f"   Quality score: {stats['global_quality_score']:.2%}")

        print("\n✅ Data Validator test completed!")

    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

    finally:
        await validator.close()

if __name__ == "__main__":
    asyncio.run(test_data_validator())
