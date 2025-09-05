"""
Account Balance Monitor
Monitor de Balance de Cuenta en Tiempo Real para QBTC System

Este servicio monitorea en tiempo real:
- Balance de cuenta y margen disponible
- PnL actual y histórico
- Límites de exposición y apalancamiento
- Alertas de riesgo basadas en balance
- Métricas de performance de cuenta
"""

import asyncio
import logging
import time
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import hmac
import hashlib
import urllib.parse
from flask import Flask, request, jsonify
import threading
import queue
from collections import deque
import statistics
import requests

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('account_balance_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('AccountBalanceMonitor')

class AlertLevel(Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CAUTION = "CAUTION"
    EMERGENCY = "EMERGENCY"

class PositionSide(Enum):
    BOTH = "BOTH"
    LONG = "LONG"
    SHORT = "SHORT"

@dataclass
class AccountBalance:
    """Balance de cuenta"""
    total_wallet_balance: float
    total_unrealized_pnl: float
    total_margin_balance: float
    total_initial_margin: float
    total_maintenance_margin: float
    available_balance: float
    max_withdraw_amount: float
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)

@dataclass
class Position:
    """Posición de trading"""
    symbol: str
    position_amt: float
    entry_price: float
    mark_price: float
    unrealized_pnl: float
    leverage: int
    position_side: PositionSide
    margin_type: str
    isolated_wallet: float
    update_time: datetime = None
    
    def __post_init__(self):
        if self.update_time is None:
            self.update_time = datetime.now(timezone.utc)

@dataclass
class RiskAlert:
    """Alerta de riesgo"""
    alert_id: str
    level: AlertLevel
    message: str
    details: Dict[str, Any]
    timestamp: datetime = None
    resolved: bool = False
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)
        if not self.alert_id:
            self.alert_id = str(uuid.uuid4())

class OrderExecutionIntegration:
    """Integración con el Real Order Execution Engine"""
    
    def __init__(self, order_engine_url: str = "http://localhost:14503"):
        self.order_engine_url = order_engine_url
        self.session_timeout = 5.0
    
    def get_active_orders(self) -> List[Dict[str, Any]]:
        """Obtiene órdenes activas del Order Execution Engine"""
        try:
            response = requests.get(
                f"{self.order_engine_url}/api/orders/status",
                timeout=self.session_timeout
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data.get('orders', [])
            return []
        except Exception as e:
            logger.debug(f"[ORDER_ENGINE] Could not connect: {e}")
            return []
    
    def get_execution_metrics(self) -> Dict[str, Any]:
        """Obtiene métricas del Order Execution Engine"""
        try:
            response = requests.get(
                f"{self.order_engine_url}/api/metrics",
                timeout=self.session_timeout
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data.get('metrics', {})
            return {}
        except Exception as e:
            logger.debug(f"[ORDER_ENGINE] Could not get metrics: {e}")
            return {}
    
    def is_trading_enabled(self) -> bool:
        """Verifica si el trading está habilitado"""
        try:
            response = requests.get(
                f"{self.order_engine_url}/api/status",
                timeout=self.session_timeout
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    engine_state = data.get('engine_state', {})
                    return engine_state.get('trading_enabled', False)
            return False
        except Exception as e:
            logger.debug(f"[ORDER_ENGINE] Could not check trading status: {e}")
            return False
    
    def convert_orders_to_positions(self, orders: List[Dict[str, Any]]) -> List[Position]:
        """Convierte órdenes activas en posiciones para el análisis"""
        positions = []
        symbol_positions = {}
        
        # Agrupar órdenes por símbolo y calcular posición neta
        for order in orders:
            if order.get('status') not in ['FILLED', 'PARTIALLY_FILLED']:
                continue
                
            symbol = order.get('symbol', '')
            side = order.get('side', '')
            quantity = float(order.get('original_quantity', 0))
            filled_qty = float(order.get('executed_quantity', 0))
            avg_price = float(order.get('average_price', 0))
            
            if symbol not in symbol_positions:
                symbol_positions[symbol] = {
                    'total_qty': 0.0,
                    'weighted_price': 0.0,
                    'total_cost': 0.0,
                    'last_price': avg_price
                }
            
            # Calcular cantidad neta (positiva para long, negativa para short)
            net_qty = filled_qty if side == 'BUY' else -filled_qty
            cost = filled_qty * avg_price
            
            # Actualizar posición
            pos = symbol_positions[symbol]
            pos['total_cost'] += cost if side == 'BUY' else -cost
            pos['total_qty'] += net_qty
            pos['last_price'] = avg_price
        
        # Convertir a objetos Position
        for symbol, pos_data in symbol_positions.items():
            if abs(pos_data['total_qty']) > 0.0001:  # Solo posiciones significativas
                avg_entry_price = abs(pos_data['total_cost'] / pos_data['total_qty']) if pos_data['total_qty'] != 0 else pos_data['last_price']
                
                # Simular precio de mercado actual (en producción vendría de API)
                current_price = pos_data['last_price'] * (1 + (time.time() % 10 - 5) / 1000)  # ±0.5% variación
                
                # Calcular PnL no realizado
                unrealized_pnl = pos_data['total_qty'] * (current_price - avg_entry_price)
                
                position = Position(
                    symbol=symbol,
                    position_amt=pos_data['total_qty'],
                    entry_price=avg_entry_price,
                    mark_price=current_price,
                    unrealized_pnl=unrealized_pnl,
                    leverage=10,  # Valor por defecto
                    position_side=PositionSide.LONG if pos_data['total_qty'] > 0 else PositionSide.SHORT,
                    margin_type="cross",
                    isolated_wallet=0.0
                )
                positions.append(position)
        
        return positions

class BinanceAccountClient:
    """Cliente para consultas de cuenta de Binance"""
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.base_url = (
            "https://testnet.binancefuture.com" if testnet 
            else "https://fapi.binance.com"
        )
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def _generate_signature(self, params: Dict[str, Any]) -> str:
        """Genera la firma HMAC SHA256 para la API de Binance"""
        query_string = urllib.parse.urlencode(params)
        return hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Realiza una solicitud HTTP a la API de Binance"""
        if params is None:
            params = {}
            
        params['timestamp'] = int(time.time() * 1000)
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.api_key,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with self.session.get(url, params=params, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    logger.error(f"API Error {response.status}: {error_text}")
                    return None
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return None

    async def get_account_balance(self) -> Optional[AccountBalance]:
        """Obtiene el balance de la cuenta"""
        if self.testnet:
            return self._simulate_account_balance()
        
        data = await self._make_request('/fapi/v2/balance')
        if not data:
            return None
            
        # Procesar respuesta real de Binance
        total_balance = sum(float(item['balance']) for item in data)
        total_pnl = sum(float(item['crossUnPnl']) for item in data)
        
        return AccountBalance(
            total_wallet_balance=total_balance,
            total_unrealized_pnl=total_pnl,
            total_margin_balance=total_balance + total_pnl,
            total_initial_margin=0.0,  # Se obtendría de /fapi/v2/account
            total_maintenance_margin=0.0,
            available_balance=total_balance * 0.8,  # Estimación conservadora
            max_withdraw_amount=total_balance * 0.7
        )

    async def get_positions(self) -> List[Position]:
        """Obtiene las posiciones actuales"""
        if self.testnet:
            return self._simulate_positions()
        
        data = await self._make_request('/fapi/v2/positionRisk')
        if not data:
            return []
        
        positions = []
        for pos_data in data:
            if float(pos_data['positionAmt']) != 0:  # Solo posiciones activas
                position = Position(
                    symbol=pos_data['symbol'],
                    position_amt=float(pos_data['positionAmt']),
                    entry_price=float(pos_data['entryPrice']),
                    mark_price=float(pos_data['markPrice']),
                    unrealized_pnl=float(pos_data['unRealizedProfit']),
                    leverage=int(pos_data['leverage']),
                    position_side=PositionSide(pos_data['positionSide']),
                    margin_type=pos_data['marginType'],
                    isolated_wallet=float(pos_data['isolatedWallet'])
                )
                positions.append(position)
        
        return positions

    def _simulate_account_balance(self) -> AccountBalance:
        """Simula balance de cuenta para testing"""
        base_balance = 10000.0  # $10,000 USDT base
        
        # Simular variaciones realistas
        variation = (time.time() % 100) / 100 * 200 - 100  # ±100 USDT
        pnl_variation = (time.time() % 50) / 50 * 500 - 250  # ±250 USDT PnL
        
        total_balance = base_balance + variation
        unrealized_pnl = pnl_variation
        margin_balance = total_balance + unrealized_pnl
        
        return AccountBalance(
            total_wallet_balance=total_balance,
            total_unrealized_pnl=unrealized_pnl,
            total_margin_balance=margin_balance,
            total_initial_margin=margin_balance * 0.1,
            total_maintenance_margin=margin_balance * 0.05,
            available_balance=margin_balance * 0.7,
            max_withdraw_amount=total_balance * 0.6
        )

    def _simulate_positions(self) -> List[Position]:
        """Simula posiciones para testing"""
        positions = []
        
        # Simular posición en BTCUSDT
        btc_price = 50000.0 + (time.time() % 1000 - 500)  # Variación de precio
        btc_position = Position(
            symbol="BTCUSDT",
            position_amt=0.1,  # 0.1 BTC long
            entry_price=49500.0,
            mark_price=btc_price,
            unrealized_pnl=(btc_price - 49500.0) * 0.1,
            leverage=10,
            position_side=PositionSide.LONG,
            margin_type="cross",
            isolated_wallet=0.0
        )
        positions.append(btc_position)
        
        # Simular posición en ETHUSDT ocasionalmente
        if int(time.time()) % 3 == 0:  # Cada 3 segundos
            eth_price = 3000.0 + (time.time() % 200 - 100)
            eth_position = Position(
                symbol="ETHUSDT",
                position_amt=-2.0,  # 2 ETH short
                entry_price=3050.0,
                mark_price=eth_price,
                unrealized_pnl=(3050.0 - eth_price) * 2.0,
                leverage=5,
                position_side=PositionSide.SHORT,
                margin_type="cross",
                isolated_wallet=0.0
            )
            positions.append(eth_position)
        
        return positions

class AccountBalanceMonitor:
    """Monitor de Balance de Cuenta"""
    
    def __init__(self, api_key: str = "test_api_key", api_secret: str = "test_api_secret", 
                 testnet: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.client = None
        self.running = False
        
        # Integración con Order Execution Engine
        self.order_integration = OrderExecutionIntegration()
        self.use_order_engine_positions = True  # Priorizar posiciones del engine
        
        # Datos de monitoreo
        self.current_balance: Optional[AccountBalance] = None
        self.current_positions: List[Position] = []
        self.balance_history: deque = deque(maxlen=1000)  # Últimos 1000 registros
        self.pnl_history: deque = deque(maxlen=1000)
        
        # Alertas y configuración de riesgo
        self.active_alerts: Dict[str, RiskAlert] = {}
        self.alert_history: deque = deque(maxlen=500)
        
        # Configuración de límites de riesgo
        self.risk_limits = {
            'max_drawdown_percent': 15.0,  # 15% máximo drawdown
            'min_available_balance': 1000.0,  # Mínimo $1000 disponible
            'max_total_exposure': 50000.0,  # Máximo $50k exposición total
            'margin_call_threshold': 0.8,  # 80% del margen de mantenimiento
            'emergency_threshold': 0.9  # 90% del margen de mantenimiento
        }
        
        # Métricas de performance
        self.performance_metrics = {
            'total_pnl_24h': 0.0,
            'max_balance_24h': 0.0,
            'min_balance_24h': 0.0,
            'total_trades': 0,
            'win_rate': 0.0,
            'sharpe_ratio': 0.0,
            'max_drawdown': 0.0,
            'roi_percent': 0.0
        }
        
        # Estado del sistema
        self.system_state = {
            'status': 'initializing',
            'last_update': datetime.now(timezone.utc).isoformat(),
            'monitoring_active': False,
            'alert_count': 0,
            'positions_count': 0,
            'account_health': 'unknown'
        }

    async def initialize(self):
        """Inicializa el monitor de balance"""
        logger.info("[INIT] Initializing Account Balance Monitor...")
        
        try:
            self.client = BinanceAccountClient(
                self.api_key, 
                self.api_secret, 
                self.testnet
            )
            
            # Realizar primera consulta
            async with self.client:
                await self._update_account_data()
            
            self.system_state['status'] = 'active'
            self.system_state['monitoring_active'] = True
            self.running = True
            
            # Iniciar tareas asíncronas
            asyncio.create_task(self._monitoring_loop())
            asyncio.create_task(self._risk_analysis_loop())
            asyncio.create_task(self._performance_calculation_loop())
            asyncio.create_task(self._alert_management_loop())
            
            logger.info("[SUCCESS] Account Balance Monitor initialized successfully")
            
        except Exception as e:
            logger.error(f"[ERROR] Failed to initialize balance monitor: {e}")
            self.system_state['status'] = 'error'
            raise

    async def _monitoring_loop(self):
        """Loop principal de monitoreo"""
        logger.info("[MONITOR] Starting account monitoring loop...")
        
        while self.running:
            try:
                async with self.client:
                    await self._update_account_data()
                
                # Actualizar métricas de estado
                self.system_state['last_update'] = datetime.now(timezone.utc).isoformat()
                self.system_state['positions_count'] = len(self.current_positions)
                self.system_state['account_health'] = self._calculate_account_health()
                
                await asyncio.sleep(5)  # Actualizar cada 5 segundos
                
            except Exception as e:
                logger.error(f"[ERROR] Error in monitoring loop: {e}")
                await asyncio.sleep(10)  # Esperar más tiempo en caso de error

    async def _update_account_data(self):
        """Actualiza los datos de cuenta"""
        try:
            # Obtener balance
            new_balance = await self.client.get_account_balance()
            if new_balance:
                self.current_balance = new_balance
                self.balance_history.append(new_balance)
                
                # Registrar PnL histórico
                pnl_record = {
                    'timestamp': new_balance.timestamp,
                    'unrealized_pnl': new_balance.total_unrealized_pnl,
                    'total_balance': new_balance.total_wallet_balance
                }
                self.pnl_history.append(pnl_record)
            
            # Obtener posiciones - priorizar Order Execution Engine si está disponible
            new_positions = []
            
            if self.use_order_engine_positions:
                try:
                    # Intentar obtener órdenes del Order Execution Engine
                    active_orders = self.order_integration.get_active_orders()
                    if active_orders:
                        engine_positions = self.order_integration.convert_orders_to_positions(active_orders)
                        if engine_positions:
                            new_positions = engine_positions
                            logger.debug(f"[ORDER_ENGINE] Using {len(new_positions)} positions from Order Execution Engine")
                        else:
                            logger.debug("[ORDER_ENGINE] No positions found in Order Execution Engine")
                    else:
                        logger.debug("[ORDER_ENGINE] No active orders from Order Execution Engine")
                except Exception as e:
                    logger.debug(f"[ORDER_ENGINE] Could not get positions from engine: {e}")
            
            # Fallback a Binance API o simulación si no hay posiciones del engine
            if not new_positions:
                new_positions = await self.client.get_positions()
                logger.debug(f"[BINANCE] Using {len(new_positions)} positions from Binance API/simulation")
            
            self.current_positions = new_positions
            
            # Actualizar métricas de trading si hay integración activa
            if self.use_order_engine_positions:
                try:
                    trading_enabled = self.order_integration.is_trading_enabled()
                    execution_metrics = self.order_integration.get_execution_metrics()
                    
                    # Actualizar performance metrics con datos del engine
                    if execution_metrics:
                        self.performance_metrics['total_trades'] = execution_metrics.get('total_orders', 0)
                        if 'successful_orders' in execution_metrics and 'total_orders' in execution_metrics:
                            total = execution_metrics['total_orders']
                            successful = execution_metrics['successful_orders']
                            self.performance_metrics['win_rate'] = (successful / total * 100) if total > 0 else 0.0
                    
                    self.system_state['order_engine_connected'] = True
                    self.system_state['trading_enabled'] = trading_enabled
                except Exception as e:
                    logger.debug(f"[ORDER_ENGINE] Could not get engine metrics: {e}")
                    self.system_state['order_engine_connected'] = False
            
            logger.debug(f"[UPDATE] Balance: ${new_balance.total_margin_balance:.2f}, Positions: {len(new_positions)}")
            
        except Exception as e:
            logger.error(f"[ERROR] Failed to update account data: {e}")

    async def _risk_analysis_loop(self):
        """Loop de análisis de riesgo"""
        logger.info("[RISK] Starting risk analysis loop...")
        
        while self.running:
            try:
                if self.current_balance:
                    await self._analyze_account_risks()
                
                await asyncio.sleep(10)  # Análisis cada 10 segundos
                
            except Exception as e:
                logger.error(f"[ERROR] Error in risk analysis: {e}")
                await asyncio.sleep(15)

    async def _analyze_account_risks(self):
        """Analiza los riesgos de la cuenta"""
        alerts_triggered = []
        
        # 1. Verificar balance mínimo disponible
        if self.current_balance.available_balance < self.risk_limits['min_available_balance']:
            alert = RiskAlert(
                alert_id="",
                level=AlertLevel.WARNING,
                message="Low Available Balance",
                details={
                    'current_balance': self.current_balance.available_balance,
                    'minimum_required': self.risk_limits['min_available_balance'],
                    'recommendation': 'Consider reducing position sizes or adding funds'
                }
            )
            alerts_triggered.append(alert)
        
        # 2. Verificar margen de mantenimiento
        if (self.current_balance.total_maintenance_margin > 0 and 
            self.current_balance.total_margin_balance > 0):
            
            margin_ratio = (self.current_balance.total_maintenance_margin / 
                          self.current_balance.total_margin_balance)
            
            if margin_ratio > self.risk_limits['emergency_threshold']:
                alert = RiskAlert(
                    alert_id="",
                    level=AlertLevel.EMERGENCY,
                    message="Critical Margin Level",
                    details={
                        'margin_ratio': margin_ratio,
                        'threshold': self.risk_limits['emergency_threshold'],
                        'recommendation': 'Immediate action required - Close positions or add margin'
                    }
                )
                alerts_triggered.append(alert)
            elif margin_ratio > self.risk_limits['margin_call_threshold']:
                alert = RiskAlert(
                    alert_id="",
                    level=AlertLevel.CAUTION,
                    message="Margin Call Warning",
                    details={
                        'margin_ratio': margin_ratio,
                        'threshold': self.risk_limits['margin_call_threshold'],
                        'recommendation': 'Consider reducing leverage or closing positions'
                    }
                )
                alerts_triggered.append(alert)
        
        # 3. Verificar exposición total
        total_exposure = sum(
            abs(pos.position_amt * pos.mark_price) 
            for pos in self.current_positions
        )
        
        if total_exposure > self.risk_limits['max_total_exposure']:
            alert = RiskAlert(
                alert_id="",
                level=AlertLevel.CAUTION,
                message="High Total Exposure",
                details={
                    'current_exposure': total_exposure,
                    'max_allowed': self.risk_limits['max_total_exposure'],
                    'recommendation': 'Consider reducing position sizes'
                }
            )
            alerts_triggered.append(alert)
        
        # 4. Verificar drawdown
        if len(self.balance_history) > 10:
            max_balance_recent = max(b.total_margin_balance for b in list(self.balance_history)[-100:])
            current_balance = self.current_balance.total_margin_balance
            drawdown_percent = ((max_balance_recent - current_balance) / max_balance_recent) * 100
            
            if drawdown_percent > self.risk_limits['max_drawdown_percent']:
                alert = RiskAlert(
                    alert_id="",
                    level=AlertLevel.WARNING,
                    message="High Drawdown Detected",
                    details={
                        'current_drawdown': drawdown_percent,
                        'max_allowed': self.risk_limits['max_drawdown_percent'],
                        'recommendation': 'Review trading strategy and risk management'
                    }
                )
                alerts_triggered.append(alert)
        
        # Procesar alertas
        for alert in alerts_triggered:
            await self._process_alert(alert)

    async def _process_alert(self, alert: RiskAlert):
        """Procesa una alerta de riesgo"""
        # Verificar si ya existe una alerta similar activa
        similar_alert_exists = any(
            existing_alert.message == alert.message and not existing_alert.resolved
            for existing_alert in self.active_alerts.values()
        )
        
        if not similar_alert_exists:
            self.active_alerts[alert.alert_id] = alert
            self.alert_history.append(alert)
            self.system_state['alert_count'] = len([a for a in self.active_alerts.values() if not a.resolved])
            
            logger.warning(f"[ALERT] {alert.level.value}: {alert.message}")
            
            # En modo de emergencia, notificar sistemas críticos
            if alert.level == AlertLevel.EMERGENCY:
                await self._trigger_emergency_protocols(alert)

    async def _trigger_emergency_protocols(self, alert: RiskAlert):
        """Activa protocolos de emergencia"""
        logger.critical(f"[EMERGENCY] Triggering emergency protocols: {alert.message}")
        
        # Notificar a otros sistemas (Circuit Breakers, Order Execution)
        emergency_data = {
            'alert_id': alert.alert_id,
            'level': alert.level.value,
            'message': alert.message,
            'details': alert.details,
            'timestamp': alert.timestamp.isoformat()
        }
        
        # Aquí se podrían hacer llamadas a otros servicios
        # Por ejemplo: requests.post('http://localhost:14502/api/emergency/activate')

    async def _performance_calculation_loop(self):
        """Loop de cálculo de métricas de performance"""
        logger.info("[PERF] Starting performance calculation loop...")
        
        while self.running:
            try:
                if len(self.balance_history) > 50:  # Suficientes datos
                    self._calculate_performance_metrics()
                
                await asyncio.sleep(30)  # Calcular cada 30 segundos
                
            except Exception as e:
                logger.error(f"[ERROR] Error calculating performance: {e}")
                await asyncio.sleep(60)

    def _calculate_performance_metrics(self):
        """Calcula métricas de performance"""
        if not self.balance_history:
            return
        
        balances = list(self.balance_history)
        current_time = datetime.now(timezone.utc)
        
        # PnL de 24 horas
        day_ago = current_time - timedelta(hours=24)
        recent_balances = [b for b in balances if b.timestamp >= day_ago]
        
        if recent_balances:
            start_balance = recent_balances[0].total_margin_balance
            end_balance = recent_balances[-1].total_margin_balance
            self.performance_metrics['total_pnl_24h'] = end_balance - start_balance
            
            # Máximo y mínimo balance 24h
            self.performance_metrics['max_balance_24h'] = max(b.total_margin_balance for b in recent_balances)
            self.performance_metrics['min_balance_24h'] = min(b.total_margin_balance for b in recent_balances)
        
        # ROI total
        if len(balances) > 100:
            initial_balance = balances[0].total_margin_balance
            current_balance = balances[-1].total_margin_balance
            self.performance_metrics['roi_percent'] = ((current_balance - initial_balance) / initial_balance) * 100
        
        # Máximo drawdown
        max_balance = 0
        max_dd = 0
        for balance in balances:
            if balance.total_margin_balance > max_balance:
                max_balance = balance.total_margin_balance
            
            current_dd = (max_balance - balance.total_margin_balance) / max_balance * 100
            if current_dd > max_dd:
                max_dd = current_dd
        
        self.performance_metrics['max_drawdown'] = max_dd
        
        # Ratio de Sharpe simplificado (basado en returns diarios)
        if len(recent_balances) > 10:
            daily_returns = []
            for i in range(1, len(recent_balances)):
                prev_balance = recent_balances[i-1].total_margin_balance
                curr_balance = recent_balances[i].total_margin_balance
                daily_return = (curr_balance - prev_balance) / prev_balance
                daily_returns.append(daily_return)
            
            if daily_returns and len(daily_returns) > 1:
                avg_return = statistics.mean(daily_returns)
                return_std = statistics.stdev(daily_returns) if len(daily_returns) > 1 else 0.0001
                self.performance_metrics['sharpe_ratio'] = avg_return / return_std if return_std > 0 else 0.0

    async def _alert_management_loop(self):
        """Loop de gestión de alertas"""
        while self.running:
            try:
                # Resolver alertas obsoletas
                current_time = datetime.now(timezone.utc)
                
                for alert_id, alert in list(self.active_alerts.items()):
                    if not alert.resolved:
                        # Auto-resolver alertas informativas después de 5 minutos
                        if (alert.level == AlertLevel.INFO and 
                            (current_time - alert.timestamp).seconds > 300):
                            alert.resolved = True
                        
                        # Auto-resolver alertas de advertencia después de 15 minutos sin nuevas ocurrencias
                        elif (alert.level == AlertLevel.WARNING and 
                              (current_time - alert.timestamp).seconds > 900):
                            alert.resolved = True
                
                # Actualizar conteo de alertas activas
                self.system_state['alert_count'] = len([
                    a for a in self.active_alerts.values() if not a.resolved
                ])
                
                await asyncio.sleep(60)  # Verificar cada minuto
                
            except Exception as e:
                logger.error(f"[ERROR] Error in alert management: {e}")
                await asyncio.sleep(60)

    def _calculate_account_health(self) -> str:
        """Calcula la salud general de la cuenta"""
        if not self.current_balance:
            return 'unknown'
        
        health_score = 100
        
        # Penalizar por alertas activas
        active_alerts = [a for a in self.active_alerts.values() if not a.resolved]
        emergency_alerts = sum(1 for a in active_alerts if a.level == AlertLevel.EMERGENCY)
        warning_alerts = sum(1 for a in active_alerts if a.level == AlertLevel.WARNING)
        
        health_score -= emergency_alerts * 30
        health_score -= warning_alerts * 10
        
        # Penalizar por bajo balance disponible
        if self.current_balance.available_balance < self.risk_limits['min_available_balance']:
            health_score -= 20
        
        # Penalizar por alto margen usado
        if (self.current_balance.total_maintenance_margin > 0 and 
            self.current_balance.total_margin_balance > 0):
            margin_ratio = (self.current_balance.total_maintenance_margin / 
                          self.current_balance.total_margin_balance)
            if margin_ratio > 0.7:
                health_score -= 25
        
        # Clasificar salud
        if health_score >= 80:
            return 'excellent'
        elif health_score >= 60:
            return 'good'
        elif health_score >= 40:
            return 'fair'
        elif health_score >= 20:
            return 'poor'
        else:
            return 'critical'

    def _serialize_position(self, position: Position) -> Dict[str, Any]:
        """Serializa una posición para JSON"""
        pos_dict = asdict(position)
        # Convertir enums a strings
        pos_dict['position_side'] = position.position_side.value
        pos_dict['update_time'] = position.update_time.isoformat() if position.update_time else None
        return pos_dict
    
    def _serialize_alert(self, alert: RiskAlert) -> Dict[str, Any]:
        """Serializa una alerta para JSON"""
        alert_dict = asdict(alert)
        alert_dict['level'] = alert.level.value
        alert_dict['timestamp'] = alert.timestamp.isoformat() if alert.timestamp else None
        return alert_dict

    def get_account_summary(self) -> Dict[str, Any]:
        """Obtiene resumen completo de la cuenta"""
        if not self.current_balance:
            return {'error': 'No account data available'}
        
        # Calcular exposición total
        total_exposure = sum(
            abs(pos.position_amt * pos.mark_price) 
            for pos in self.current_positions
        )
        
        # Obtener alertas activas serializadas
        active_alerts = [
            self._serialize_alert(alert) for alert in self.active_alerts.values() 
            if not alert.resolved
        ]
        
        # Serializar balance
        balance_dict = asdict(self.current_balance)
        balance_dict['timestamp'] = self.current_balance.timestamp.isoformat() if self.current_balance.timestamp else None
        
        return {
            'account_balance': balance_dict,
            'positions': [self._serialize_position(pos) for pos in self.current_positions],
            'total_exposure': total_exposure,
            'performance_metrics': self.performance_metrics,
            'active_alerts': active_alerts,
            'risk_limits': self.risk_limits,
            'system_state': self.system_state
        }

    def get_balance_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtiene historial de balance"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        history = [
            {
                'timestamp': balance.timestamp.isoformat(),
                'total_balance': balance.total_wallet_balance,
                'margin_balance': balance.total_margin_balance,
                'unrealized_pnl': balance.total_unrealized_pnl,
                'available_balance': balance.available_balance
            }
            for balance in self.balance_history
            if balance.timestamp >= cutoff_time
        ]
        
        return history

    def get_alert_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Obtiene historial de alertas"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        history = [
            self._serialize_alert(alert) for alert in self.alert_history
            if alert.timestamp >= cutoff_time
        ]
        
        return history

    def update_risk_limits(self, new_limits: Dict[str, float]) -> bool:
        """Actualiza los límites de riesgo"""
        try:
            for key, value in new_limits.items():
                if key in self.risk_limits:
                    self.risk_limits[key] = float(value)
            
            logger.info(f"[CONFIG] Risk limits updated: {new_limits}")
            return True
        except Exception as e:
            logger.error(f"[ERROR] Failed to update risk limits: {e}")
            return False

    async def shutdown(self):
        """Cierra el monitor de balance"""
        logger.info("[SHUTDOWN] Shutting down Account Balance Monitor...")
        self.running = False
        self.system_state['status'] = 'shutting_down'
        self.system_state['monitoring_active'] = False
        
        # Resolver todas las alertas activas
        for alert in self.active_alerts.values():
            alert.resolved = True
        
        self.system_state['status'] = 'stopped'
        logger.info("[STOPPED] Account Balance Monitor stopped")

# Instancia global del monitor
balance_monitor = AccountBalanceMonitor()

# Flask API
app = Flask(__name__)

@app.route('/api/account/summary', methods=['GET'])
def get_account_summary():
    """Endpoint para obtener resumen completo de cuenta"""
    try:
        summary = balance_monitor.get_account_summary()
        return jsonify({
            'success': True,
            'account_summary': summary,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_account_summary endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/account/balance', methods=['GET'])
def get_current_balance():
    """Endpoint para obtener balance actual"""
    try:
        if balance_monitor.current_balance:
            # Serializar balance correctamente
            balance_dict = asdict(balance_monitor.current_balance)
            balance_dict['timestamp'] = balance_monitor.current_balance.timestamp.isoformat() if balance_monitor.current_balance.timestamp else None
            
            return jsonify({
                'success': True,
                'balance': balance_dict,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No balance data available'
            }), 404
            
    except Exception as e:
        logger.error(f"[ERROR] Error in get_current_balance endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/account/positions', methods=['GET'])
def get_current_positions():
    """Endpoint para obtener posiciones actuales"""
    try:
        positions = [balance_monitor._serialize_position(pos) for pos in balance_monitor.current_positions]
        
        return jsonify({
            'success': True,
            'positions': positions,
            'count': len(positions),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_current_positions endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/account/history', methods=['GET'])
def get_balance_history():
    """Endpoint para obtener historial de balance"""
    try:
        hours = int(request.args.get('hours', 24))
        history = balance_monitor.get_balance_history(hours)
        
        return jsonify({
            'success': True,
            'history': history,
            'hours': hours,
            'count': len(history),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_balance_history endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/alerts/active', methods=['GET'])
def get_active_alerts():
    """Endpoint para obtener alertas activas"""
    try:
        active_alerts = [
            balance_monitor._serialize_alert(alert) for alert in balance_monitor.active_alerts.values()
            if not alert.resolved
        ]
        
        return jsonify({
            'success': True,
            'alerts': active_alerts,
            'count': len(active_alerts),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_active_alerts endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/alerts/history', methods=['GET'])
def get_alert_history():
    """Endpoint para obtener historial de alertas"""
    try:
        hours = int(request.args.get('hours', 24))
        history = balance_monitor.get_alert_history(hours)
        
        return jsonify({
            'success': True,
            'alert_history': history,
            'hours': hours,
            'count': len(history),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_alert_history endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/risk/limits', methods=['GET'])
def get_risk_limits():
    """Endpoint para obtener límites de riesgo"""
    try:
        return jsonify({
            'success': True,
            'risk_limits': balance_monitor.risk_limits,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_risk_limits endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/risk/limits', methods=['POST'])
def update_risk_limits():
    """Endpoint para actualizar límites de riesgo"""
    try:
        data = request.get_json()
        success = balance_monitor.update_risk_limits(data)
        
        return jsonify({
            'success': success,
            'updated_limits': balance_monitor.risk_limits,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in update_risk_limits endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/performance/metrics', methods=['GET'])
def get_performance_metrics():
    """Endpoint para obtener métricas de performance"""
    try:
        return jsonify({
            'success': True,
            'performance_metrics': balance_monitor.performance_metrics,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_performance_metrics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def get_system_status():
    """Endpoint para obtener estado del sistema"""
    try:
        return jsonify({
            'success': True,
            'system_state': balance_monitor.system_state,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"[ERROR] Error in get_system_status endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def run_async_initialization():
    """Ejecuta la inicialización asíncrona"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(balance_monitor.initialize())
    except Exception as e:
        logger.error(f"[ERROR] Failed to initialize balance monitor: {e}")
    finally:
        # Mantener el loop corriendo para las tareas asíncronas
        def run_forever():
            loop.run_forever()
        
        thread = threading.Thread(target=run_forever, daemon=True)
        thread.start()

if __name__ == '__main__':
    logger.info("[START] Starting Account Balance Monitor...")
    
    # Inicializar monitor en thread separado
    init_thread = threading.Thread(target=run_async_initialization, daemon=True)
    init_thread.start()
    
    # Esperar un momento para la inicialización
    time.sleep(2)
    
    # Iniciar servidor Flask
    try:
        logger.info("[SERVER] Starting Flask API server on port 14504...")
        app.run(host='0.0.0.0', port=14504, debug=False, threaded=True)
    except KeyboardInterrupt:
        logger.info("[SHUTDOWN] Shutting down...")
        # Ejecutar shutdown
        shutdown_loop = asyncio.new_event_loop()
        shutdown_loop.run_until_complete(balance_monitor.shutdown())
        shutdown_loop.close()
    except Exception as e:
        logger.error(f"[ERROR] Server error: {e}")
