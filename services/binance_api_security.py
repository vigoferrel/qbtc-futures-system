"""
Binance API Security Service
Servicio de Seguridad y Autenticación para APIs de Binance en QBTC System

Este servicio proporciona:
- Gestión segura de claves API de Binance
- Rate limiting y control de velocidad
- Validación y sanitización de solicitudes
- Monitoreo de actividad sospechosa
- Rotación automática de credenciales
- Logs de seguridad detallados
"""

import asyncio
import logging
import time
import json
import hashlib
import hmac
import urllib.parse
import base64
import secrets
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
from flask import Flask, request, jsonify
import threading
import sqlite3
from collections import defaultdict, deque
import ipaddress
import re

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('binance_api_security.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('BinanceAPISecurity')

class SecurityLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RequestType(Enum):
    READ_ONLY = "READ_ONLY"
    TRADE = "TRADE"
    ACCOUNT = "ACCOUNT"
    FUTURES = "FUTURES"

class SecurityEvent(Enum):
    API_KEY_ROTATION = "API_KEY_ROTATION"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    INVALID_REQUEST = "INVALID_REQUEST"
    AUTHENTICATION_FAILURE = "AUTHENTICATION_FAILURE"
    SECURITY_BREACH_ATTEMPT = "SECURITY_BREACH_ATTEMPT"

@dataclass
class APICredentials:
    """Credenciales API de Binance"""
    api_key: str
    api_secret: str
    testnet: bool
    permissions: List[str]
    created_at: datetime
    last_used: Optional[datetime] = None
    usage_count: int = 0
    is_active: bool = True
    
    def __post_init__(self):
        if isinstance(self.created_at, str):
            self.created_at = datetime.fromisoformat(self.created_at.replace('Z', '+00:00'))
        if isinstance(self.last_used, str) and self.last_used:
            self.last_used = datetime.fromisoformat(self.last_used.replace('Z', '+00:00'))

@dataclass
class RateLimitRule:
    """Regla de límite de velocidad"""
    endpoint_pattern: str
    requests_per_minute: int
    requests_per_second: int
    weight_per_request: int
    max_daily_requests: int

@dataclass
class SecurityAlert:
    """Alerta de seguridad"""
    alert_id: str
    event_type: SecurityEvent
    severity: SecurityLevel
    message: str
    details: Dict[str, Any]
    source_ip: Optional[str]
    timestamp: datetime
    resolved: bool = False

class BinanceAPIValidator:
    """Validador de solicitudes API de Binance"""
    
    def __init__(self):
        # Patrones de endpoints válidos de Binance
        self.valid_endpoints = {
            # Binance Spot API
            '/api/v3/ping': RequestType.READ_ONLY,
            '/api/v3/time': RequestType.READ_ONLY,
            '/api/v3/exchangeInfo': RequestType.READ_ONLY,
            '/api/v3/depth': RequestType.READ_ONLY,
            '/api/v3/trades': RequestType.READ_ONLY,
            '/api/v3/historicalTrades': RequestType.READ_ONLY,
            '/api/v3/aggTrades': RequestType.READ_ONLY,
            '/api/v3/klines': RequestType.READ_ONLY,
            '/api/v3/ticker/24hr': RequestType.READ_ONLY,
            '/api/v3/ticker/price': RequestType.READ_ONLY,
            '/api/v3/ticker/bookTicker': RequestType.READ_ONLY,
            '/api/v3/account': RequestType.ACCOUNT,
            '/api/v3/myTrades': RequestType.ACCOUNT,
            '/api/v3/order': RequestType.TRADE,
            '/api/v3/order/test': RequestType.TRADE,
            '/api/v3/openOrders': RequestType.ACCOUNT,
            '/api/v3/allOrders': RequestType.ACCOUNT,
            
            # Binance Futures API
            '/fapi/v1/ping': RequestType.READ_ONLY,
            '/fapi/v1/time': RequestType.READ_ONLY,
            '/fapi/v1/exchangeInfo': RequestType.READ_ONLY,
            '/fapi/v1/depth': RequestType.READ_ONLY,
            '/fapi/v1/trades': RequestType.READ_ONLY,
            '/fapi/v1/historicalTrades': RequestType.READ_ONLY,
            '/fapi/v1/aggTrades': RequestType.READ_ONLY,
            '/fapi/v1/klines': RequestType.READ_ONLY,
            '/fapi/v1/continuousKlines': RequestType.READ_ONLY,
            '/fapi/v1/indexPriceKlines': RequestType.READ_ONLY,
            '/fapi/v1/markPriceKlines': RequestType.READ_ONLY,
            '/fapi/v1/premiumIndex': RequestType.READ_ONLY,
            '/fapi/v1/fundingRate': RequestType.READ_ONLY,
            '/fapi/v1/ticker/24hr': RequestType.READ_ONLY,
            '/fapi/v1/ticker/price': RequestType.READ_ONLY,
            '/fapi/v1/ticker/bookTicker': RequestType.READ_ONLY,
            '/fapi/v1/openInterest': RequestType.READ_ONLY,
            '/fapi/v2/account': RequestType.ACCOUNT,
            '/fapi/v2/balance': RequestType.ACCOUNT,
            '/fapi/v2/positionRisk': RequestType.ACCOUNT,
            '/fapi/v1/userTrades': RequestType.ACCOUNT,
            '/fapi/v1/order': RequestType.FUTURES,
            '/fapi/v1/batchOrders': RequestType.FUTURES,
            '/fapi/v1/openOrders': RequestType.ACCOUNT,
            '/fapi/v1/allOrders': RequestType.ACCOUNT,
            '/fapi/v1/leverage': RequestType.FUTURES,
            '/fapi/v1/marginType': RequestType.FUTURES,
            '/fapi/v1/positionMargin': RequestType.FUTURES,
        }
        
        # Patrones de parámetros peligrosos
        self.dangerous_patterns = [
            r'<script.*?>',
            r'javascript:',
            r'on\w+\s*=',
            r'\beval\s*\(',
            r'\bexec\s*\(',
            r'\.\./',
            r'\x00',
            r'\xFF',
        ]
        
        # Límites de tamaño de parámetros
        self.param_limits = {
            'symbol': 20,
            'side': 4,
            'type': 20,
            'timeInForce': 10,
            'quantity': 50,
            'price': 50,
            'stopPrice': 50,
            'recvWindow': 10,
            'timestamp': 15,
            'signature': 128,
        }
    
    def validate_endpoint(self, endpoint: str) -> Tuple[bool, RequestType, str]:
        """Valida si el endpoint es válido y seguro"""
        # Limpiar endpoint
        clean_endpoint = endpoint.split('?')[0].rstrip('/')
        
        # Verificar si el endpoint está en la lista de permitidos
        if clean_endpoint in self.valid_endpoints:
            return True, self.valid_endpoints[clean_endpoint], "Valid endpoint"
        
        # Buscar patrones similares
        for valid_endpoint, req_type in self.valid_endpoints.items():
            if valid_endpoint.endswith('*') and clean_endpoint.startswith(valid_endpoint[:-1]):
                return True, req_type, "Pattern match"
        
        return False, RequestType.READ_ONLY, f"Unknown endpoint: {clean_endpoint}"
    
    def validate_parameters(self, params: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Valida parámetros de la solicitud"""
        issues = []
        
        for key, value in params.items():
            str_value = str(value)
            
            # Verificar límites de tamaño
            if key in self.param_limits:
                max_length = self.param_limits[key]
                if len(str_value) > max_length:
                    issues.append(f"Parameter '{key}' exceeds maximum length ({max_length})")
            
            # Verificar patrones peligrosos
            for pattern in self.dangerous_patterns:
                if re.search(pattern, str_value, re.IGNORECASE):
                    issues.append(f"Parameter '{key}' contains dangerous pattern: {pattern}")
            
            # Validaciones específicas por parámetro
            if key == 'symbol' and not re.match(r'^[A-Z0-9]{1,20}$', str_value):
                issues.append(f"Invalid symbol format: {str_value}")
            elif key == 'side' and str_value not in ['BUY', 'SELL']:
                issues.append(f"Invalid side value: {str_value}")
            elif key == 'type' and str_value not in ['LIMIT', 'MARKET', 'STOP', 'STOP_MARKET', 'TAKE_PROFIT', 'TAKE_PROFIT_MARKET']:
                issues.append(f"Invalid order type: {str_value}")
        
        return len(issues) == 0, issues
    
    def validate_signature(self, api_secret: str, params: Dict[str, Any], provided_signature: str) -> bool:
        """Valida la firma HMAC"""
        try:
            # Crear query string
            query_string = urllib.parse.urlencode(sorted(params.items()))
            
            # Calcular firma esperada
            expected_signature = hmac.new(
                api_secret.encode('utf-8'),
                query_string.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, provided_signature)
        except Exception as e:
            logger.error(f"Signature validation error: {e}")
            return False

class RateLimitManager:
    """Gestor de límites de velocidad"""
    
    def __init__(self):
        self.request_counts = defaultdict(lambda: defaultdict(int))
        self.request_times = defaultdict(lambda: deque(maxlen=1000))
        self.daily_counts = defaultdict(int)
        self.last_reset = datetime.now(timezone.utc)
        
        # Reglas de rate limiting por defecto
        self.rules = {
            'default': RateLimitRule(
                endpoint_pattern='*',
                requests_per_minute=1200,
                requests_per_second=10,
                weight_per_request=1,
                max_daily_requests=100000
            ),
            'order': RateLimitRule(
                endpoint_pattern='/fapi/v1/order',
                requests_per_minute=100,
                requests_per_second=5,
                weight_per_request=5,
                max_daily_requests=10000
            ),
            'account': RateLimitRule(
                endpoint_pattern='/fapi/v2/account',
                requests_per_minute=600,
                requests_per_second=5,
                weight_per_request=10,
                max_daily_requests=50000
            )
        }
    
    def check_rate_limit(self, client_id: str, endpoint: str) -> Tuple[bool, str]:
        """Verifica si la solicitud está dentro de los límites"""
        current_time = datetime.now(timezone.utc)
        
        # Resetear contadores diarios
        if (current_time - self.last_reset).days >= 1:
            self.daily_counts.clear()
            self.last_reset = current_time
        
        # Encontrar regla aplicable
        rule = self._find_applicable_rule(endpoint)
        
        # Verificar límite diario
        daily_key = f"{client_id}:{endpoint}"
        if self.daily_counts[daily_key] >= rule.max_daily_requests:
            return False, f"Daily limit exceeded ({rule.max_daily_requests} requests/day)"
        
        # Verificar límite por minuto
        minute_key = current_time.strftime('%Y-%m-%d-%H-%M')
        client_minute_key = f"{client_id}:{minute_key}"
        
        if self.request_counts[client_minute_key][endpoint] >= rule.requests_per_minute:
            return False, f"Minute limit exceeded ({rule.requests_per_minute} requests/minute)"
        
        # Verificar límite por segundo
        recent_requests = self.request_times[client_id]
        second_ago = current_time - timedelta(seconds=1)
        recent_count = sum(1 for req_time in recent_requests if req_time > second_ago)
        
        if recent_count >= rule.requests_per_second:
            return False, f"Second limit exceeded ({rule.requests_per_second} requests/second)"
        
        # Registrar solicitud
        self.request_counts[client_minute_key][endpoint] += 1
        self.request_times[client_id].append(current_time)
        self.daily_counts[daily_key] += 1
        
        return True, "Rate limit OK"
    
    def _find_applicable_rule(self, endpoint: str) -> RateLimitRule:
        """Encuentra la regla de rate limiting aplicable"""
        for rule_name, rule in self.rules.items():
            if rule_name == 'default':
                continue
            if endpoint.startswith(rule.endpoint_pattern.replace('*', '')):
                return rule
        return self.rules['default']
    
    def get_rate_limit_status(self, client_id: str) -> Dict[str, Any]:
        """Obtiene el estado actual de rate limiting para un cliente"""
        current_time = datetime.now(timezone.utc)
        minute_key = current_time.strftime('%Y-%m-%d-%H-%M')
        client_minute_key = f"{client_id}:{minute_key}"
        
        # Contar solicitudes recientes
        recent_requests = self.request_times[client_id]
        second_ago = current_time - timedelta(seconds=1)
        requests_last_second = sum(1 for req_time in recent_requests if req_time > second_ago)
        
        minute_ago = current_time - timedelta(minutes=1)
        requests_last_minute = sum(1 for req_time in recent_requests if req_time > minute_ago)
        
        return {
            'client_id': client_id,
            'requests_last_second': requests_last_second,
            'requests_last_minute': requests_last_minute,
            'daily_requests': sum(self.daily_counts[key] for key in self.daily_counts.keys() if key.startswith(client_id + ':')),
            'minute_limits': dict(self.request_counts[client_minute_key]),
            'timestamp': current_time.isoformat()
        }

class SecurityDatabase:
    """Base de datos de seguridad"""
    
    def __init__(self, db_path: str = 'binance_security.db'):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Inicializa la base de datos"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS api_credentials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    api_key TEXT UNIQUE NOT NULL,
                    api_secret TEXT NOT NULL,
                    testnet BOOLEAN NOT NULL DEFAULT 1,
                    permissions TEXT NOT NULL DEFAULT '[]',
                    created_at TEXT NOT NULL,
                    last_used TEXT,
                    usage_count INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS security_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alert_id TEXT UNIQUE NOT NULL,
                    event_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    details TEXT NOT NULL,
                    source_ip TEXT,
                    timestamp TEXT NOT NULL,
                    resolved BOOLEAN DEFAULT 0
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS api_requests_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    api_key TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    method TEXT NOT NULL,
                    params TEXT,
                    response_code INTEGER,
                    source_ip TEXT,
                    timestamp TEXT NOT NULL,
                    success BOOLEAN NOT NULL
                )
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_security_events_timestamp 
                ON security_events(timestamp)
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_api_requests_timestamp 
                ON api_requests_log(timestamp)
            ''')
    
    def store_credentials(self, credentials: APICredentials) -> bool:
        """Almacena credenciales API de forma segura"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT OR REPLACE INTO api_credentials 
                    (api_key, api_secret, testnet, permissions, created_at, last_used, usage_count, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    credentials.api_key,
                    credentials.api_secret,  # En producción debería estar encriptado
                    credentials.testnet,
                    json.dumps(credentials.permissions),
                    credentials.created_at.isoformat(),
                    credentials.last_used.isoformat() if credentials.last_used else None,
                    credentials.usage_count,
                    credentials.is_active
                ))
            return True
        except Exception as e:
            logger.error(f"Error storing credentials: {e}")
            return False
    
    def get_credentials(self, api_key: str) -> Optional[APICredentials]:
        """Obtiene credenciales por API key"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    SELECT api_key, api_secret, testnet, permissions, created_at, last_used, usage_count, is_active
                    FROM api_credentials WHERE api_key = ? AND is_active = 1
                ''', (api_key,))
                
                row = cursor.fetchone()
                if row:
                    return APICredentials(
                        api_key=row[0],
                        api_secret=row[1],
                        testnet=bool(row[2]),
                        permissions=json.loads(row[3]) if row[3] else [],
                        created_at=datetime.fromisoformat(row[4]),
                        last_used=datetime.fromisoformat(row[5]) if row[5] else None,
                        usage_count=row[6],
                        is_active=bool(row[7])
                    )
            return None
        except Exception as e:
            logger.error(f"Error retrieving credentials: {e}")
            return None
    
    def log_security_event(self, alert: SecurityAlert) -> bool:
        """Registra un evento de seguridad"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO security_events 
                    (alert_id, event_type, severity, message, details, source_ip, timestamp, resolved)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert.alert_id,
                    alert.event_type.value,
                    alert.severity.value,
                    alert.message,
                    json.dumps(alert.details),
                    alert.source_ip,
                    alert.timestamp.isoformat(),
                    alert.resolved
                ))
            return True
        except Exception as e:
            logger.error(f"Error logging security event: {e}")
            return False
    
    def log_api_request(self, api_key: str, endpoint: str, method: str, 
                       params: Dict[str, Any], response_code: int, 
                       source_ip: str, success: bool) -> bool:
        """Registra una solicitud API"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO api_requests_log 
                    (api_key, endpoint, method, params, response_code, source_ip, timestamp, success)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    api_key[:10] + '...',  # Solo guardar parte de la clave por seguridad
                    endpoint,
                    method,
                    json.dumps(params, default=str),
                    response_code,
                    source_ip,
                    datetime.now(timezone.utc).isoformat(),
                    success
                ))
            return True
        except Exception as e:
            logger.error(f"Error logging API request: {e}")
            return False

class BinanceAPISecurity:
    """Servicio principal de seguridad de API de Binance"""
    
    def __init__(self):
        self.validator = BinanceAPIValidator()
        self.rate_limiter = RateLimitManager()
        self.database = SecurityDatabase()
        self.security_alerts = deque(maxlen=1000)
        
        # Configuración de seguridad
        self.security_config = {
            'enable_ip_whitelist': False,
            'allowed_ips': [],
            'enable_request_signing': True,
            'enable_rate_limiting': True,
            'enable_request_validation': True,
            'alert_on_suspicious_activity': True,
            'auto_disable_suspicious_keys': True,
            'max_failed_attempts': 5,
            'lockout_duration_minutes': 15
        }
        
        # Contadores de intentos fallidos
        self.failed_attempts = defaultdict(int)
        self.lockout_times = defaultdict(lambda: None)
        
        # Estado del sistema
        self.system_state = {
            'status': 'initializing',
            'active_sessions': 0,
            'total_requests_processed': 0,
            'security_alerts_count': 0,
            'blocked_requests_count': 0,
            'last_security_scan': datetime.now(timezone.utc).isoformat(),
            'uptime_start': datetime.now(timezone.utc).isoformat()
        }
    
    def validate_api_request(self, api_key: str, endpoint: str, method: str, 
                           params: Dict[str, Any], source_ip: str = None) -> Tuple[bool, str, Dict[str, Any]]:
        """Valida una solicitud completa de API"""
        validation_result = {
            'valid': False,
            'request_type': RequestType.READ_ONLY.value,
            'rate_limit_ok': False,
            'credentials_valid': False,
            'parameters_valid': False,
            'signature_valid': False,
            'ip_allowed': True,
            'alerts': []
        }
        
        try:
            # Verificar si la API key está bloqueada
            if self._is_api_key_locked(api_key):
                self._create_security_alert(
                    SecurityEvent.AUTHENTICATION_FAILURE,
                    SecurityLevel.HIGH,
                    f"Blocked API key attempted access: {api_key[:10]}...",
                    {'api_key': api_key[:10] + '...', 'endpoint': endpoint},
                    source_ip
                )
                return False, "API key is temporarily locked", validation_result
            
            # 1. Validar endpoint
            endpoint_valid, request_type, endpoint_msg = self.validator.validate_endpoint(endpoint)
            validation_result['request_type'] = request_type.value
            
            if not endpoint_valid:
                self._create_security_alert(
                    SecurityEvent.INVALID_REQUEST,
                    SecurityLevel.MEDIUM,
                    f"Invalid endpoint accessed: {endpoint}",
                    {'endpoint': endpoint, 'api_key': api_key[:10] + '...'},
                    source_ip
                )
                return False, endpoint_msg, validation_result
            
            # 2. Verificar credenciales
            credentials = self.database.get_credentials(api_key)
            if not credentials or not credentials.is_active:
                self._increment_failed_attempts(api_key)
                self._create_security_alert(
                    SecurityEvent.AUTHENTICATION_FAILURE,
                    SecurityLevel.HIGH,
                    f"Invalid API key used: {api_key[:10]}...",
                    {'api_key': api_key[:10] + '...', 'endpoint': endpoint},
                    source_ip
                )
                return False, "Invalid or inactive API key", validation_result
            
            validation_result['credentials_valid'] = True
            
            # 3. Verificar IP si está habilitado
            if self.security_config['enable_ip_whitelist'] and source_ip:
                if not self._is_ip_allowed(source_ip):
                    validation_result['ip_allowed'] = False
                    self._create_security_alert(
                        SecurityEvent.SECURITY_BREACH_ATTEMPT,
                        SecurityLevel.CRITICAL,
                        f"Unauthorized IP access attempt: {source_ip}",
                        {'source_ip': source_ip, 'api_key': api_key[:10] + '...'},
                        source_ip
                    )
                    return False, f"IP not allowed: {source_ip}", validation_result
            
            # 4. Verificar rate limiting
            if self.security_config['enable_rate_limiting']:
                rate_ok, rate_msg = self.rate_limiter.check_rate_limit(api_key, endpoint)
                validation_result['rate_limit_ok'] = rate_ok
                
                if not rate_ok:
                    self._create_security_alert(
                        SecurityEvent.RATE_LIMIT_EXCEEDED,
                        SecurityLevel.MEDIUM,
                        f"Rate limit exceeded for {api_key[:10]}...",
                        {'api_key': api_key[:10] + '...', 'endpoint': endpoint, 'limit_msg': rate_msg},
                        source_ip
                    )
                    return False, rate_msg, validation_result
            else:
                validation_result['rate_limit_ok'] = True
            
            # 5. Validar parámetros
            if self.security_config['enable_request_validation']:
                params_valid, param_issues = self.validator.validate_parameters(params)
                validation_result['parameters_valid'] = params_valid
                
                if not params_valid:
                    self._create_security_alert(
                        SecurityEvent.INVALID_REQUEST,
                        SecurityLevel.MEDIUM,
                        "Invalid request parameters",
                        {'api_key': api_key[:10] + '...', 'issues': param_issues},
                        source_ip
                    )
                    return False, f"Parameter validation failed: {'; '.join(param_issues)}", validation_result
            else:
                validation_result['parameters_valid'] = True
            
            # 6. Verificar firma si es requerida
            if self.security_config['enable_request_signing'] and 'signature' in params:
                signature_valid = self.validator.validate_signature(
                    credentials.api_secret,
                    {k: v for k, v in params.items() if k != 'signature'},
                    params['signature']
                )
                validation_result['signature_valid'] = signature_valid
                
                if not signature_valid:
                    self._increment_failed_attempts(api_key)
                    self._create_security_alert(
                        SecurityEvent.AUTHENTICATION_FAILURE,
                        SecurityLevel.HIGH,
                        "Invalid request signature",
                        {'api_key': api_key[:10] + '...', 'endpoint': endpoint},
                        source_ip
                    )
                    return False, "Invalid signature", validation_result
            else:
                validation_result['signature_valid'] = True
            
            # Actualizar estadísticas de uso
            self._update_credentials_usage(credentials)
            self._reset_failed_attempts(api_key)
            
            # Registrar solicitud exitosa
            self.database.log_api_request(
                api_key, endpoint, method, params, 200, source_ip or 'unknown', True
            )
            
            self.system_state['total_requests_processed'] += 1
            validation_result['valid'] = True
            
            return True, "Request validated successfully", validation_result
            
        except Exception as e:
            logger.error(f"Error validating API request: {e}")
            self.database.log_api_request(
                api_key, endpoint, method, params, 500, source_ip or 'unknown', False
            )
            return False, f"Validation error: {str(e)}", validation_result
    
    def _is_api_key_locked(self, api_key: str) -> bool:
        """Verifica si una API key está bloqueada"""
        if api_key not in self.lockout_times:
            return False
        
        lockout_time = self.lockout_times[api_key]
        if lockout_time is None:
            return False
        
        # Verificar si el tiempo de bloqueo ha expirado
        lockout_duration = timedelta(minutes=self.security_config['lockout_duration_minutes'])
        if datetime.now(timezone.utc) > lockout_time + lockout_duration:
            # Desbloquear
            self.lockout_times[api_key] = None
            self.failed_attempts[api_key] = 0
            return False
        
        return True
    
    def _increment_failed_attempts(self, api_key: str):
        """Incrementa el contador de intentos fallidos"""
        self.failed_attempts[api_key] += 1
        
        if self.failed_attempts[api_key] >= self.security_config['max_failed_attempts']:
            self.lockout_times[api_key] = datetime.now(timezone.utc)
            self._create_security_alert(
                SecurityEvent.SECURITY_BREACH_ATTEMPT,
                SecurityLevel.CRITICAL,
                f"API key locked due to multiple failed attempts: {api_key[:10]}...",
                {
                    'api_key': api_key[:10] + '...',
                    'failed_attempts': self.failed_attempts[api_key],
                    'lockout_until': (datetime.now(timezone.utc) + 
                                    timedelta(minutes=self.security_config['lockout_duration_minutes'])).isoformat()
                },
                None
            )
    
    def _reset_failed_attempts(self, api_key: str):
        """Resetea el contador de intentos fallidos"""
        if api_key in self.failed_attempts:
            self.failed_attempts[api_key] = 0
    
    def _is_ip_allowed(self, ip: str) -> bool:
        """Verifica si una IP está permitida"""
        if not self.security_config['allowed_ips']:
            return True
        
        try:
            client_ip = ipaddress.ip_address(ip)
            for allowed_ip in self.security_config['allowed_ips']:
                if '/' in allowed_ip:  # CIDR notation
                    if client_ip in ipaddress.ip_network(allowed_ip):
                        return True
                else:  # Single IP
                    if client_ip == ipaddress.ip_address(allowed_ip):
                        return True
            return False
        except Exception as e:
            logger.error(f"IP validation error: {e}")
            return False
    
    def _create_security_alert(self, event_type: SecurityEvent, severity: SecurityLevel, 
                              message: str, details: Dict[str, Any], source_ip: str = None):
        """Crea una alerta de seguridad"""
        alert = SecurityAlert(
            alert_id=secrets.token_urlsafe(16),
            event_type=event_type,
            severity=severity,
            message=message,
            details=details,
            source_ip=source_ip,
            timestamp=datetime.now(timezone.utc)
        )
        
        self.security_alerts.append(alert)
        self.database.log_security_event(alert)
        self.system_state['security_alerts_count'] += 1
        
        logger.warning(f"[SECURITY ALERT] {severity.value}: {message}")
    
    def _update_credentials_usage(self, credentials: APICredentials):
        """Actualiza estadísticas de uso de credenciales"""
        credentials.last_used = datetime.now(timezone.utc)
        credentials.usage_count += 1
        self.database.store_credentials(credentials)
    
    def create_api_credentials(self, testnet: bool = True, permissions: List[str] = None) -> APICredentials:
        """Crea nuevas credenciales API simuladas"""
        if permissions is None:
            permissions = ['READ', 'TRADE'] if not testnet else ['READ', 'TRADE', 'FUTURES']
        
        # Generar claves simuladas
        api_key = 'qbtc_' + secrets.token_urlsafe(32)
        api_secret = secrets.token_urlsafe(64)
        
        credentials = APICredentials(
            api_key=api_key,
            api_secret=api_secret,
            testnet=testnet,
            permissions=permissions,
            created_at=datetime.now(timezone.utc)
        )
        
        self.database.store_credentials(credentials)
        
        self._create_security_alert(
            SecurityEvent.API_KEY_ROTATION,
            SecurityLevel.LOW,
            "New API credentials created",
            {'api_key': api_key[:10] + '...', 'permissions': permissions, 'testnet': testnet},
            None
        )
        
        return credentials
    
    def get_security_status(self) -> Dict[str, Any]:
        """Obtiene el estado de seguridad del sistema"""
        recent_alerts = [
            {
                'alert_id': alert.alert_id,
                'event_type': alert.event_type.value,
                'severity': alert.severity.value,
                'message': alert.message,
                'timestamp': alert.timestamp.isoformat(),
                'resolved': alert.resolved
            }
            for alert in list(self.security_alerts)[-10:]  # Últimas 10 alertas
        ]
        
        return {
            'system_state': self.system_state,
            'security_config': self.security_config,
            'recent_alerts': recent_alerts,
            'active_lockouts': len([k for k, v in self.lockout_times.items() if v is not None]),
            'rate_limit_status': 'active' if self.security_config['enable_rate_limiting'] else 'disabled',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def update_security_config(self, new_config: Dict[str, Any]) -> bool:
        """Actualiza la configuración de seguridad"""
        try:
            for key, value in new_config.items():
                if key in self.security_config:
                    self.security_config[key] = value
            
            self._create_security_alert(
                SecurityEvent.API_KEY_ROTATION,
                SecurityLevel.LOW,
                "Security configuration updated",
                {'updated_keys': list(new_config.keys())},
                None
            )
            
            logger.info(f"Security configuration updated: {new_config}")
            return True
        except Exception as e:
            logger.error(f"Error updating security config: {e}")
            return False

# Instancia global del servicio de seguridad
security_service = BinanceAPISecurity()

# Flask API
app = Flask(__name__)

@app.route('/api/security/validate', methods=['POST'])
def validate_request():
    """Endpoint para validar solicitudes API"""
    try:
        data = request.get_json()
        
        api_key = data.get('api_key', '')
        endpoint = data.get('endpoint', '')
        method = data.get('method', 'GET')
        params = data.get('params', {})
        source_ip = request.remote_addr
        
        is_valid, message, validation_result = security_service.validate_api_request(
            api_key, endpoint, method, params, source_ip
        )
        
        return jsonify({
            'success': is_valid,
            'message': message,
            'validation_result': validation_result,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in validate_request endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/credentials', methods=['POST'])
def create_credentials():
    """Endpoint para crear nuevas credenciales"""
    try:
        data = request.get_json() or {}
        
        testnet = data.get('testnet', True)
        permissions = data.get('permissions', ['READ', 'TRADE'])
        
        credentials = security_service.create_api_credentials(testnet, permissions)
        
        return jsonify({
            'success': True,
            'credentials': {
                'api_key': credentials.api_key,
                'api_secret': credentials.api_secret,
                'testnet': credentials.testnet,
                'permissions': credentials.permissions,
                'created_at': credentials.created_at.isoformat()
            },
            'message': 'API credentials created successfully',
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error creating credentials: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/status', methods=['GET'])
def get_security_status():
    """Endpoint para obtener estado de seguridad"""
    try:
        status = security_service.get_security_status()
        
        return jsonify({
            'success': True,
            'security_status': status,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting security status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/config', methods=['GET'])
def get_security_config():
    """Endpoint para obtener configuración de seguridad"""
    try:
        return jsonify({
            'success': True,
            'security_config': security_service.security_config,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting security config: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/config', methods=['POST'])
def update_security_config():
    """Endpoint para actualizar configuración de seguridad"""
    try:
        data = request.get_json()
        
        success = security_service.update_security_config(data)
        
        return jsonify({
            'success': success,
            'updated_config': security_service.security_config,
            'message': 'Security configuration updated' if success else 'Failed to update configuration',
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error updating security config: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/rate-limit/<api_key>', methods=['GET'])
def get_rate_limit_status(api_key):
    """Endpoint para obtener estado de rate limiting"""
    try:
        status = security_service.rate_limiter.get_rate_limit_status(api_key)
        
        return jsonify({
            'success': True,
            'rate_limit_status': status,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting rate limit status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/security/alerts', methods=['GET'])
def get_security_alerts():
    """Endpoint para obtener alertas de seguridad"""
    try:
        limit = int(request.args.get('limit', 50))
        alerts = list(security_service.security_alerts)[-limit:]
        
        formatted_alerts = [
            {
                'alert_id': alert.alert_id,
                'event_type': alert.event_type.value,
                'severity': alert.severity.value,
                'message': alert.message,
                'details': alert.details,
                'source_ip': alert.source_ip,
                'timestamp': alert.timestamp.isoformat(),
                'resolved': alert.resolved
            }
            for alert in alerts
        ]
        
        return jsonify({
            'success': True,
            'alerts': formatted_alerts,
            'count': len(formatted_alerts),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting security alerts: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("[START] Starting Binance API Security Service...")
    
    # Crear credenciales de ejemplo
    logger.info("[INIT] Creating default test credentials...")
    default_credentials = security_service.create_api_credentials(
        testnet=True, 
        permissions=['READ', 'TRADE', 'FUTURES']
    )
    logger.info(f"[CREDENTIALS] Test API Key: {default_credentials.api_key}")
    
    # Inicializar sistema
    security_service.system_state['status'] = 'active'
    
    try:
        logger.info("[SERVER] Starting Flask API server on port 14505...")
        app.run(host='0.0.0.0', port=14505, debug=False, threaded=True)
    except KeyboardInterrupt:
        logger.info("[SHUTDOWN] Shutting down...")
        security_service.system_state['status'] = 'stopped'
    except Exception as e:
        logger.error(f"[ERROR] Server error: {e}")
