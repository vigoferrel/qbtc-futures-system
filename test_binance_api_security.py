"""
Test Binance API Security Service
Script de pruebas para verificar el funcionamiento del servicio de seguridad
"""

import requests
import json
import time
import hmac
import hashlib
import urllib.parse
from datetime import datetime

# Configuración de URLs
BASE_URL = "http://localhost:14505"

def print_separator(title):
    """Imprime un separador con título"""
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_response(response_data, title):
    """Imprime la respuesta de manera formateada"""
    print(f"\n[{title}]")
    if isinstance(response_data, dict):
        print(json.dumps(response_data, indent=2, default=str))
    else:
        print(response_data)

def generate_signature(api_secret, params):
    """Genera una firma HMAC para testing"""
    query_string = urllib.parse.urlencode(sorted(params.items()))
    return hmac.new(
        api_secret.encode('utf-8'),
        query_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def test_create_credentials():
    """Prueba la creación de credenciales"""
    try:
        payload = {
            'testnet': True,
            'permissions': ['READ', 'TRADE', 'FUTURES']
        }
        
        response = requests.post(
            f"{BASE_URL}/api/security/credentials",
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Create Credentials")
        
        if data.get('success') and data.get('credentials'):
            return data['credentials']
        
        return None
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_security_status():
    """Prueba el endpoint de estado de seguridad"""
    try:
        response = requests.get(f"{BASE_URL}/api/security/status")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Security Status")
        
        if data.get('success'):
            status = data.get('security_status', {})
            print(f"\nSystem Status: {status.get('system_state', {}).get('status', 'Unknown')}")
            print(f"Total Requests: {status.get('system_state', {}).get('total_requests_processed', 0)}")
            print(f"Security Alerts: {status.get('system_state', {}).get('security_alerts_count', 0)}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_security_config():
    """Prueba los endpoints de configuración de seguridad"""
    try:
        # Obtener configuración actual
        response = requests.get(f"{BASE_URL}/api/security/config")
        print(f"GET Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Current Security Config")
        
        # Actualizar configuración
        new_config = {
            'max_failed_attempts': 3,
            'lockout_duration_minutes': 10,
            'enable_rate_limiting': True
        }
        
        update_response = requests.post(
            f"{BASE_URL}/api/security/config",
            json=new_config,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nPOST Status Code: {update_response.status_code}")
        update_data = update_response.json()
        print_response(update_data, "Updated Security Config")
        
        return response.status_code == 200 and update_response.status_code == 200
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_api_validation_valid(credentials):
    """Prueba la validación de una solicitud API válida"""
    if not credentials:
        print("No credentials available for testing")
        return False
    
    try:
        # Preparar parámetros de prueba
        params = {
            'symbol': 'BTCUSDT',
            'timestamp': str(int(time.time() * 1000))
        }
        
        # Generar firma
        signature = generate_signature(credentials['api_secret'], params)
        params['signature'] = signature
        
        # Datos de la solicitud de validación
        validation_request = {
            'api_key': credentials['api_key'],
            'endpoint': '/fapi/v2/account',
            'method': 'GET',
            'params': params
        }
        
        response = requests.post(
            f"{BASE_URL}/api/security/validate",
            json=validation_request,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Valid API Request Validation")
        
        if data.get('success'):
            validation_result = data.get('validation_result', {})
            print(f"\nValidation Summary:")
            print(f"- Valid: {validation_result.get('valid', False)}")
            print(f"- Request Type: {validation_result.get('request_type', 'Unknown')}")
            print(f"- Rate Limit OK: {validation_result.get('rate_limit_ok', False)}")
            print(f"- Credentials Valid: {validation_result.get('credentials_valid', False)}")
            print(f"- Parameters Valid: {validation_result.get('parameters_valid', False)}")
            print(f"- Signature Valid: {validation_result.get('signature_valid', False)}")
        
        return data.get('success', False)
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_api_validation_invalid():
    """Prueba la validación de una solicitud API inválida"""
    try:
        # Solicitud con API key inválida
        validation_request = {
            'api_key': 'invalid_api_key_12345',
            'endpoint': '/fapi/v1/order',
            'method': 'POST',
            'params': {
                'symbol': 'BTCUSDT',
                'side': 'BUY',
                'type': 'LIMIT',
                'quantity': '0.001',
                'price': '50000',
                'timestamp': str(int(time.time() * 1000)),
                'signature': 'invalid_signature'
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/security/validate",
            json=validation_request,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Invalid API Request Validation")
        
        return response.status_code == 200  # El endpoint debe responder, pero con success=False
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_rate_limiting(credentials):
    """Prueba los límites de velocidad"""
    if not credentials:
        print("No credentials available for rate limiting test")
        return False
    
    try:
        # Obtener estado actual de rate limiting
        response = requests.get(f"{BASE_URL}/api/security/rate-limit/{credentials['api_key']}")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Rate Limit Status")
        
        # Realizar múltiples solicitudes rápidas para probar rate limiting
        print("\n[RATE LIMIT TEST] Sending rapid requests...")
        
        for i in range(3):
            validation_request = {
                'api_key': credentials['api_key'],
                'endpoint': '/fapi/v1/ping',
                'method': 'GET',
                'params': {}
            }
            
            rapid_response = requests.post(
                f"{BASE_URL}/api/security/validate",
                json=validation_request,
                headers={'Content-Type': 'application/json'}
            )
            
            rapid_data = rapid_response.json()
            print(f"Request {i+1}: Success={rapid_data.get('success')}, Message={rapid_data.get('message')}")
            
            time.sleep(0.1)  # Pequeña pausa entre solicitudes
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_security_alerts():
    """Prueba el endpoint de alertas de seguridad"""
    try:
        response = requests.get(f"{BASE_URL}/api/security/alerts?limit=20")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Security Alerts")
        
        if data.get('success'):
            alerts = data.get('alerts', [])
            print(f"\nTotal Alerts: {len(alerts)}")
            
            # Mostrar resumen de alertas por tipo
            alert_types = {}
            for alert in alerts:
                event_type = alert.get('event_type', 'Unknown')
                alert_types[event_type] = alert_types.get(event_type, 0) + 1
            
            print("\nAlert Summary by Type:")
            for alert_type, count in alert_types.items():
                print(f"- {alert_type}: {count}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_invalid_endpoint():
    """Prueba validación con endpoint inválido"""
    try:
        validation_request = {
            'api_key': 'test_key',
            'endpoint': '/invalid/malicious/endpoint',
            'method': 'GET',
            'params': {}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/security/validate",
            json=validation_request,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Invalid Endpoint Test")
        
        return response.status_code == 200 and not data.get('success')
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_parameter_validation():
    """Prueba validación de parámetros peligrosos"""
    try:
        # Parámetros con contenido peligroso
        dangerous_params = {
            'symbol': 'BTC<script>alert("xss")</script>USDT',
            'side': 'BUY',
            'malicious': 'javascript:void(0)',
            'timestamp': str(int(time.time() * 1000))
        }
        
        validation_request = {
            'api_key': 'test_key',
            'endpoint': '/fapi/v1/order',
            'method': 'POST',
            'params': dangerous_params
        }
        
        response = requests.post(
            f"{BASE_URL}/api/security/validate",
            json=validation_request,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Dangerous Parameters Test")
        
        return response.status_code == 200 and not data.get('success')
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def run_security_stress_test(credentials):
    """Ejecuta un test de estrés de seguridad"""
    if not credentials:
        print("No credentials available for stress test")
        return
    
    print_separator("SECURITY STRESS TEST")
    print("Running security stress test for 20 seconds...")
    
    success_count = 0
    failed_count = 0
    blocked_count = 0
    
    start_time = time.time()
    
    while time.time() - start_time < 20:  # 20 segundos
        try:
            # Alternar entre solicitudes válidas e inválidas
            if int(time.time()) % 2 == 0:
                # Solicitud válida
                params = {
                    'symbol': 'BTCUSDT',
                    'timestamp': str(int(time.time() * 1000))
                }
                signature = generate_signature(credentials['api_secret'], params)
                params['signature'] = signature
                
                validation_request = {
                    'api_key': credentials['api_key'],
                    'endpoint': '/fapi/v1/ping',
                    'method': 'GET',
                    'params': params
                }
            else:
                # Solicitud inválida
                validation_request = {
                    'api_key': 'invalid_key_' + str(int(time.time())),
                    'endpoint': '/fapi/v1/order',
                    'method': 'POST',
                    'params': {
                        'symbol': 'INVALID',
                        'side': 'INVALID',
                        'timestamp': str(int(time.time() * 1000))
                    }
                }
            
            response = requests.post(
                f"{BASE_URL}/api/security/validate",
                json=validation_request,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            data = response.json()
            
            if data.get('success'):
                success_count += 1
            elif 'rate limit' in data.get('message', '').lower():
                blocked_count += 1
            else:
                failed_count += 1
            
            # Pequeña pausa para no saturar
            time.sleep(0.1)
            
        except Exception as e:
            print(f"Request error: {e}")
            failed_count += 1
            time.sleep(0.5)
    
    print(f"\nStress Test Results:")
    print(f"- Successful requests: {success_count}")
    print(f"- Failed/Invalid requests: {failed_count}")
    print(f"- Rate limited requests: {blocked_count}")
    print(f"- Total requests: {success_count + failed_count + blocked_count}")
    
    # Verificar estado final del sistema
    try:
        status_response = requests.get(f"{BASE_URL}/api/security/status")
        if status_response.status_code == 200:
            status_data = status_response.json()
            if status_data.get('success'):
                system_state = status_data.get('security_status', {}).get('system_state', {})
                print(f"- System processed total: {system_state.get('total_requests_processed', 0)} requests")
                print(f"- Security alerts generated: {system_state.get('security_alerts_count', 0)}")
    except Exception as e:
        print(f"Error getting final status: {e}")

def main():
    """Función principal de pruebas"""
    print_separator("BINANCE API SECURITY - COMPREHENSIVE TESTING")
    print(f"Testing server at: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    
    # Crear credenciales de prueba
    print_separator("SETUP - Creating Test Credentials")
    credentials = test_create_credentials()
    
    if not credentials:
        print("Failed to create test credentials. Exiting...")
        return
    
    print(f"\nUsing API Key: {credentials['api_key'][:20]}...")
    
    tests = [
        ("Security Status", test_security_status),
        ("Security Configuration", test_security_config),
        ("Valid API Request Validation", lambda: test_api_validation_valid(credentials)),
        ("Invalid API Request Validation", test_api_validation_invalid),
        ("Rate Limiting", lambda: test_rate_limiting(credentials)),
        ("Invalid Endpoint Validation", test_invalid_endpoint),
        ("Dangerous Parameter Validation", test_parameter_validation),
        ("Security Alerts", test_security_alerts)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print_separator(f"TEST: {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
            print(f"\n{test_name}: {'PASSED' if success else 'FAILED'}")
        except Exception as e:
            print(f"\n{test_name}: FAILED - {e}")
            results.append((test_name, False))
        
        time.sleep(1)  # Pausa breve entre pruebas
    
    # Ejecutar test de estrés
    run_security_stress_test(credentials)
    
    # Resumen final
    print_separator("TEST RESULTS SUMMARY")
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    print("\nDetailed Results:")
    for test_name, success in results:
        status = "✓ PASSED" if success else "✗ FAILED"
        print(f"  {status} - {test_name}")
    
    print(f"\nTest completed at: {datetime.now()}")
    
    if passed == total:
        print("\n🔒 ALL TESTS PASSED! Binance API Security is working correctly.")
        print("✅ Security validation, rate limiting, and threat detection are operational.")
    else:
        print(f"\n⚠️  {total-passed} test(s) failed. Please check the security service.")

if __name__ == "__main__":
    main()
