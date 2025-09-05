#!/usr/bin/env python3
"""
📊 QBTC MARKET ANALYSIS ENGINE
==============================

Motor de análisis técnico y fundamental para el QBTC Master Copilot.
Proporciona indicadores técnicos, análisis de mercado y señales de trading.

Características:
- Indicadores técnicos avanzados
- Análisis de velas japonesas
- Señales de compra/venta
- Análisis de volumen
- Soporte y resistencia
- Patrones de precio
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

class SignalType(Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"
    STRONG_BUY = "STRONG_BUY"
    STRONG_SELL = "STRONG_SELL"

class TimeFrame(Enum):
    M1 = "1m"
    M5 = "5m"
    M15 = "15m"
    M30 = "30m"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"
    W1 = "1w"

@dataclass
class MarketData:
    """Datos de mercado estructurados"""
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    timeframe: TimeFrame

@dataclass
class TechnicalIndicator:
    """Indicador técnico con valor y señal"""
    name: str
    value: float
    signal: SignalType
    strength: float  # 0-1
    description: str

@dataclass
class AnalysisResult:
    """Resultado completo del análisis"""
    symbol: str
    timeframe: TimeFrame
    timestamp: datetime
    overall_signal: SignalType
    confidence: float
    indicators: List[TechnicalIndicator]
    support_levels: List[float]
    resistance_levels: List[float]
    recommendations: List[str]

class QBTCMarketAnalyzer:
    """Analizador de mercado avanzado para QBTC"""

    def __init__(self):
        self.indicators = {}
        self.market_data_cache = {}
        self.analysis_cache = {}

    async def analyze_symbol(self, symbol: str, timeframe: TimeFrame = TimeFrame.H1,
                           periods: int = 100) -> AnalysisResult:
        """Analizar símbolo con indicadores técnicos completos"""

        # Obtener datos de mercado (simulados para demo)
        market_data = await self._get_market_data(symbol, timeframe, periods)

        # Calcular indicadores técnicos
        indicators = await self._calculate_technical_indicators(market_data)

        # Generar señales
        overall_signal, confidence = self._generate_overall_signal(indicators)

        # Identificar niveles de soporte y resistencia
        support_levels, resistance_levels = self._find_support_resistance(market_data)

        # Generar recomendaciones
        recommendations = self._generate_recommendations(indicators, overall_signal)

        return AnalysisResult(
            symbol=symbol,
            timeframe=timeframe,
            timestamp=datetime.now(),
            overall_signal=overall_signal,
            confidence=confidence,
            indicators=indicators,
            support_levels=support_levels,
            resistance_levels=resistance_levels,
            recommendations=recommendations
        )

    async def _get_market_data(self, symbol: str, timeframe: TimeFrame,
                              periods: int) -> List[MarketData]:
        """Obtener datos de mercado (simulados para demo)"""

        # Generar datos sintéticos realistas
        np.random.seed(42)  # Para reproducibilidad

        data = []
        base_price = 45000 if 'BTC' in symbol else 2800 if 'ETH' in symbol else 100

        for i in range(periods):
            timestamp = datetime.now() - timedelta(hours=periods-i)

            # Generar precios con tendencia ligeramente alcista
            trend = 0.0001 * i  # Tendencia positiva
            volatility = 0.02  # 2% volatilidad

            # Precio base con ruido
            close = base_price * (1 + trend + np.random.normal(0, volatility))

            # Generar OHLC
            high = close * (1 + abs(np.random.normal(0, volatility/2)))
            low = close * (1 - abs(np.random.normal(0, volatility/2)))
            open_price = (data[-1].close if data else close) * (1 + np.random.normal(0, volatility/4))

            # Asegurar que OHLC sean consistentes
            high = max(high, open_price, close)
            low = min(low, open_price, close)

            # Volumen
            volume = np.random.lognormal(10, 1) * 1000

            data.append(MarketData(
                symbol=symbol,
                timestamp=timestamp,
                open=open_price,
                high=high,
                low=low,
                close=close,
                volume=volume,
                timeframe=timeframe
            ))

        return data

    async def _calculate_technical_indicators(self, market_data: List[MarketData]) -> List[TechnicalIndicator]:
        """Calcular indicadores técnicos avanzados"""

        if len(market_data) < 20:
            return []

        # Extraer precios
        closes = [d.close for d in market_data]
        highs = [d.high for d in market_data]
        lows = [d.low for d in market_data]
        volumes = [d.volume for d in market_data]

        indicators = []

        # RSI (Relative Strength Index)
        rsi = self._calculate_rsi(closes, 14)
        rsi_signal = self._rsi_signal(rsi)
        indicators.append(TechnicalIndicator(
            name="RSI",
            value=rsi,
            signal=rsi_signal,
            strength=abs(50 - rsi) / 50,  # Más lejos de 50, más fuerte la señal
            description=f"RSI(14): {rsi:.2f} - {rsi_signal.value}"
        ))

        # MACD
        macd, signal_line, histogram = self._calculate_macd(closes)
        macd_signal = SignalType.BUY if macd > signal_line else SignalType.SELL
        indicators.append(TechnicalIndicator(
            name="MACD",
            value=macd - signal_line,
            signal=macd_signal,
            strength=abs(histogram) / abs(macd) if macd != 0 else 0,
            description=f"MACD: {macd:.4f} vs Signal: {signal_line:.4f}"
        ))

        # Bollinger Bands
        upper_bb, middle_bb, lower_bb = self._calculate_bollinger_bands(closes, 20, 2)
        current_price = closes[-1]

        if current_price > upper_bb:
            bb_signal = SignalType.SELL
            bb_strength = (current_price - upper_bb) / upper_bb
        elif current_price < lower_bb:
            bb_signal = SignalType.BUY
            bb_strength = (lower_bb - current_price) / lower_bb
        else:
            bb_signal = SignalType.HOLD
            bb_strength = 0

        indicators.append(TechnicalIndicator(
            name="Bollinger Bands",
            value=(current_price - middle_bb) / middle_bb,
            signal=bb_signal,
            strength=bb_strength,
            description=f"Price: {current_price:.2f}, BB Upper: {upper_bb:.2f}, Lower: {lower_bb:.2f}"
        ))

        # Moving Averages
        sma_20 = np.mean(closes[-20:])
        sma_50 = np.mean(closes[-50:]) if len(closes) >= 50 else sma_20

        ma_signal = SignalType.BUY if sma_20 > sma_50 else SignalType.SELL
        ma_strength = abs(sma_20 - sma_50) / sma_50

        indicators.append(TechnicalIndicator(
            name="Moving Averages",
            value=sma_20 - sma_50,
            signal=ma_signal,
            strength=ma_strength,
            description=f"SMA20: {sma_20:.2f}, SMA50: {sma_50:.2f}"
        ))

        # Volume Analysis
        avg_volume = np.mean(volumes[-20:])
        current_volume = volumes[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1

        volume_signal = SignalType.BUY if volume_ratio > 1.5 else SignalType.SELL if volume_ratio < 0.7 else SignalType.HOLD
        volume_strength = min(abs(volume_ratio - 1), 1)  # Máximo 1

        indicators.append(TechnicalIndicator(
            name="Volume Analysis",
            value=volume_ratio,
            signal=volume_signal,
            strength=volume_strength,
            description=f"Current Volume: {current_volume:.0f}, Avg Volume: {avg_volume:.0f}, Ratio: {volume_ratio:.2f}"
        ))

        # Stochastic Oscillator
        k_value, d_value = self._calculate_stochastic(highs, lows, closes, 14, 3)
        stoch_signal = SignalType.BUY if k_value < 20 else SignalType.SELL if k_value > 80 else SignalType.HOLD
        stoch_strength = abs(50 - k_value) / 50

        indicators.append(TechnicalIndicator(
            name="Stochastic",
            value=k_value,
            signal=stoch_signal,
            strength=stoch_strength,
            description=f"%K: {k_value:.2f}, %D: {d_value:.2f}"
        ))

        return indicators

    def _calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calcular RSI"""
        if len(prices) < period + 1:
            return 50.0

        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])

        if avg_loss == 0:
            return 100.0

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        return rsi

    def _rsi_signal(self, rsi: float) -> SignalType:
        """Generar señal basada en RSI"""
        if rsi > 70:
            return SignalType.SELL
        elif rsi < 30:
            return SignalType.BUY
        else:
            return SignalType.HOLD

    def _calculate_macd(self, prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[float, float, float]:
        """Calcular MACD"""
        if len(prices) < slow:
            return 0, 0, 0

        # EMA rápida
        ema_fast = self._calculate_ema(prices, fast)

        # EMA lenta
        ema_slow = self._calculate_ema(prices, slow)

        # MACD line
        macd_line = ema_fast - ema_slow

        # Signal line (EMA del MACD)
        macd_values = [self._calculate_ema(prices[:i+1], fast) - self._calculate_ema(prices[:i+1], slow)
                      for i in range(slow-1, len(prices))]
        signal_line = self._calculate_ema(macd_values, signal) if len(macd_values) >= signal else 0

        # Histogram
        histogram = macd_line - signal_line

        return macd_line, signal_line, histogram

    def _calculate_ema(self, prices: List[float], period: int) -> float:
        """Calcular EMA"""
        if len(prices) < period:
            return np.mean(prices)

        ema = np.mean(prices[:period])
        multiplier = 2 / (period + 1)

        for price in prices[period:]:
            ema = (price - ema) * multiplier + ema

        return ema

    def _calculate_bollinger_bands(self, prices: List[float], period: int = 20, std_dev: int = 2) -> Tuple[float, float, float]:
        """Calcular Bandas de Bollinger"""
        if len(prices) < period:
            return prices[-1], prices[-1], prices[-1]

        sma = np.mean(prices[-period:])
        std = np.std(prices[-period:])

        upper_band = sma + (std_dev * std)
        lower_band = sma - (std_dev * std)

        return upper_band, sma, lower_band

    def _calculate_stochastic(self, highs: List[float], lows: List[float], closes: List[float],
                            k_period: int = 14, d_period: int = 3) -> Tuple[float, float]:
        """Calcular Stochastic Oscillator"""
        if len(closes) < k_period:
            return 50.0, 50.0

        # %K calculation
        highest_high = max(highs[-k_period:])
        lowest_low = min(lows[-k_period:])
        current_close = closes[-1]

        if highest_high == lowest_low:
            k_value = 50.0
        else:
            k_value = ((current_close - lowest_low) / (highest_high - lowest_low)) * 100

        # %D calculation (SMA of %K)
        k_values = []
        for i in range(min(d_period, len(closes) - k_period + 1)):
            start_idx = -(k_period + i)
            end_idx = -i if i > 0 else None
            hh = max(highs[start_idx:end_idx])
            ll = min(lows[start_idx:end_idx])
            cc = closes[start_idx + k_period - 1] if start_idx + k_period - 1 < 0 else closes[-1]
            if hh == ll:
                k_values.append(50.0)
            else:
                k_values.append(((cc - ll) / (hh - ll)) * 100)

        d_value = np.mean(k_values) if k_values else 50.0

        return k_value, d_value

    def _generate_overall_signal(self, indicators: List[TechnicalIndicator]) -> Tuple[SignalType, float]:
        """Generar señal general basada en todos los indicadores"""

        buy_signals = 0
        sell_signals = 0
        total_strength = 0

        for indicator in indicators:
            total_strength += indicator.strength

            if indicator.signal in [SignalType.BUY, SignalType.STRONG_BUY]:
                buy_signals += 1
            elif indicator.signal in [SignalType.SELL, SignalType.STRONG_SELL]:
                sell_signals += 1

        # Calcular confianza
        total_signals = len(indicators)
        signal_ratio = max(buy_signals, sell_signals) / total_signals if total_signals > 0 else 0
        avg_strength = total_strength / total_signals if total_signals > 0 else 0
        confidence = (signal_ratio + avg_strength) / 2

        # Determinar señal general
        if buy_signals > sell_signals:
            return SignalType.BUY, confidence
        elif sell_signals > buy_signals:
            return SignalType.SELL, confidence
        else:
            return SignalType.HOLD, confidence

    def _find_support_resistance(self, market_data: List[MarketData], lookback: int = 20) -> Tuple[List[float], List[float]]:
        """Encontrar niveles de soporte y resistencia"""

        if len(market_data) < lookback:
            return [], []

        highs = [d.high for d in market_data[-lookback:]]
        lows = [d.low for d in market_data[-lookback:]]

        # Encontrar picos (resistencias) y valles (soportes)
        resistance_levels = []
        support_levels = []

        for i in range(2, len(highs) - 2):
            # Pico local
            if highs[i] > highs[i-1] and highs[i] > highs[i-2] and highs[i] > highs[i+1] and highs[i] > highs[i+2]:
                resistance_levels.append(highs[i])

            # Valle local
            if lows[i] < lows[i-1] and lows[i] < lows[i-2] and lows[i] < lows[i+1] and lows[i] < lows[i+2]:
                support_levels.append(lows[i])

        # Limitar a los 3 niveles más relevantes
        resistance_levels = sorted(resistance_levels, reverse=True)[:3]
        support_levels = sorted(support_levels)[:3]

        return support_levels, resistance_levels

    def _generate_recommendations(self, indicators: List[TechnicalIndicator],
                                overall_signal: SignalType) -> List[str]:
        """Generar recomendaciones basadas en el análisis"""

        recommendations = []

        # Análisis general
        if overall_signal == SignalType.BUY:
            recommendations.append("🟢 SEÑAL DE COMPRA: La mayoría de indicadores apuntan a una oportunidad de compra")
        elif overall_signal == SignalType.SELL:
            recommendations.append("🔴 SEÑAL DE VENTA: La mayoría de indicadores sugieren vender")
        else:
            recommendations.append("🟡 MANTENER POSICIÓN: Los indicadores muestran señales mixtas")

        # Recomendaciones específicas por indicador
        rsi_indicator = next((i for i in indicators if i.name == "RSI"), None)
        if rsi_indicator:
            if rsi_indicator.value > 70:
                recommendations.append("⚠️ RSI sobrecomprado: Considerar vender o tomar ganancias")
            elif rsi_indicator.value < 30:
                recommendations.append("💪 RSI sobrevendido: Posible oportunidad de compra")

        macd_indicator = next((i for i in indicators if i.name == "MACD"), None)
        if macd_indicator and macd_indicator.signal == SignalType.BUY:
            recommendations.append("📈 MACD positivo: Momentum alcista confirmado")

        bb_indicator = next((i for i in indicators if i.name == "Bollinger Bands"), None)
        if bb_indicator:
            if bb_indicator.signal == SignalType.BUY:
                recommendations.append("📉 Precio cerca de banda inferior: Posible rebote")
            elif bb_indicator.signal == SignalType.SELL:
                recommendations.append("📈 Precio cerca de banda superior: Posible corrección")

        volume_indicator = next((i for i in indicators if i.name == "Volume Analysis"), None)
        if volume_indicator and volume_indicator.signal == SignalType.BUY:
            recommendations.append("📊 Volumen alto: Confirma la fuerza de la señal")

        return recommendations

# Funciones de utilidad para testing
async def test_market_analysis():
    """Test del análisis de mercado"""
    analyzer = QBTCMarketAnalyzer()

    print("🧪 Testing QBTC Market Analysis")
    print("=" * 40)

    symbols = ["BTCUSDT", "ETHUSDT"]

    for symbol in symbols:
        print(f"\n📊 Analyzing {symbol}...")

        try:
            analysis = await analyzer.analyze_symbol(symbol, TimeFrame.H1, 50)

            print(f"🎯 Overall Signal: {analysis.overall_signal.value}")
            print(f"📈 Confidence: {analysis.confidence:.2%}")

            print("📋 Technical Indicators:")
            for indicator in analysis.indicators[:3]:  # Mostrar primeros 3
                print(f"   • {indicator.name}: {indicator.signal.value} ({indicator.strength:.2%})")

            if analysis.support_levels:
                print(f"🛡️ Support Levels: {[f'{level:.2f}' for level in analysis.support_levels]}")

            if analysis.resistance_levels:
                print(f"🎯 Resistance Levels: {[f'{level:.2f}' for level in analysis.resistance_levels]}")

            print("💡 Recommendations:")
            for rec in analysis.recommendations[:2]:  # Mostrar primeras 2
                print(f"   • {rec}")

        except Exception as e:
            print(f"❌ Error analyzing {symbol}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_market_analysis())
