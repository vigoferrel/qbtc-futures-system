"""
Script de Prueba para Real Order Execution Engine
Prueba las funcionalidades básicas del motor de ejecución de órdenes
"""

import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:14503"

def test_api_call(endpoint, method="GET", data=None):
    """Realiza una llamada API y muestra el resultado"""
    url = f"{BASE_URL}{endpoint}"
    try:
        print(f"\n{'='*60}")
        print(f"TESTING: {method} {endpoint}")
        print('='*60)
        
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            result = response.json()
            print("Response:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("Response (text):")
            print(response.text)
        
        return response.status_code == 200, response.json() if response.headers.get('content-type', '').startswith('application/json') else None
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {url}")
        return False, None
    except requests.exceptions.Timeout:
        print(f"❌ Timeout Error: Request to {url} timed out")
        return False, None
    except Exception as e:
        print(f"❌ Error: {e}")
        return False, None

def run_tests():
    """Ejecuta todas las pruebas"""
    print("🚀 Starting Real Order Execution Engine Tests")
    print(f"Testing API at: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Test 1: Verificar estado del sistema
    success, status_data = test_api_call("/api/status")
    if not success:
        print("❌ Could not connect to Order Execution Engine. Make sure it's running on port 14503.")
        return
    
    # Test 2: Obtener métricas
    test_api_call("/api/metrics")
    
    # Test 3: Enviar una orden de prueba
    order_data = {
        "symbol": "BTCUSDT",
        "side": "BUY",
        "order_type": "MARKET",
        "quantity": 0.001,
        "quantum_consciousness_level": 0.791,
        "risk_adjustment": 1.0
    }
    
    success, submit_response = test_api_call("/api/order/submit", method="POST", data=order_data)
    
    if success and submit_response and submit_response.get('success'):
        execution_id = submit_response.get('execution_id')
        print(f"\n✅ Order submitted successfully! Execution ID: {execution_id}")
        
        # Test 4: Verificar estado de la orden
        time.sleep(2)  # Esperar un poco para el procesamiento
        test_api_call(f"/api/order/status/{execution_id}")
        
        # Test 5: Intentar cancelar la orden (puede que ya esté ejecutada)
        test_api_call(f"/api/order/cancel/{execution_id}", method="POST")
    
    # Test 6: Deshabilitar trading
    test_api_call("/api/trading/disable", method="POST")
    
    # Test 7: Habilitar trading nuevamente
    test_api_call("/api/trading/enable", method="POST")
    
    # Test 8: Verificar métricas actualizadas
    test_api_call("/api/metrics")
    
    print(f"\n{'='*60}")
    print("✅ All tests completed!")
    print('='*60)

if __name__ == "__main__":
    run_tests()
