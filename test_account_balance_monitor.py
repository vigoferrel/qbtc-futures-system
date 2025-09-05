"""
Test Account Balance Monitor
Script de pruebas para verificar el funcionamiento del Account Balance Monitor
"""

import requests
import json
import time
from datetime import datetime

# Configuración de URLs
BASE_URL = "http://localhost:14504"

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

def test_system_status():
    """Prueba el endpoint de estado del sistema"""
    try:
        response = requests.get(f"{BASE_URL}/api/status")
        print(f"Status Code: {response.status_code}")
        print_response(response.json(), "System Status")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_account_summary():
    """Prueba el endpoint de resumen de cuenta"""
    try:
        response = requests.get(f"{BASE_URL}/api/account/summary")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Account Summary")
        
        # Verificar estructura de datos
        if data.get('success'):
            summary = data.get('account_summary', {})
            print(f"\nAccount Health: {summary.get('system_state', {}).get('account_health', 'N/A')}")
            
            balance = summary.get('account_balance', {})
            if balance:
                print(f"Total Balance: ${balance.get('total_margin_balance', 0):.2f}")
                print(f"Available Balance: ${balance.get('available_balance', 0):.2f}")
                print(f"Unrealized PnL: ${balance.get('total_unrealized_pnl', 0):.2f}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_current_balance():
    """Prueba el endpoint de balance actual"""
    try:
        response = requests.get(f"{BASE_URL}/api/account/balance")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Current Balance")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_current_positions():
    """Prueba el endpoint de posiciones actuales"""
    try:
        response = requests.get(f"{BASE_URL}/api/account/positions")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Current Positions")
        
        if data.get('success'):
            positions = data.get('positions', [])
            print(f"\nTotal Positions: {len(positions)}")
            
            for pos in positions:
                print(f"- {pos.get('symbol')}: {pos.get('position_amt')} @ ${pos.get('mark_price'):.2f}")
                print(f"  PnL: ${pos.get('unrealized_pnl', 0):.2f}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_balance_history():
    """Prueba el endpoint de historial de balance"""
    try:
        response = requests.get(f"{BASE_URL}/api/account/history?hours=1")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Balance History (1 hour)")
        
        if data.get('success'):
            history = data.get('history', [])
            print(f"\nHistory Records: {len(history)}")
            
            if history:
                latest = history[-1]
                print(f"Latest Balance: ${latest.get('margin_balance', 0):.2f}")
                print(f"Latest PnL: ${latest.get('unrealized_pnl', 0):.2f}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_active_alerts():
    """Prueba el endpoint de alertas activas"""
    try:
        response = requests.get(f"{BASE_URL}/api/alerts/active")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Active Alerts")
        
        if data.get('success'):
            alerts = data.get('alerts', [])
            print(f"\nActive Alerts: {len(alerts)}")
            
            for alert in alerts:
                print(f"- [{alert.get('level')}] {alert.get('message')}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_alert_history():
    """Prueba el endpoint de historial de alertas"""
    try:
        response = requests.get(f"{BASE_URL}/api/alerts/history?hours=24")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Alert History (24 hours)")
        
        if data.get('success'):
            alerts = data.get('alert_history', [])
            print(f"\nAlert History Records: {len(alerts)}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_risk_limits():
    """Prueba los endpoints de límites de riesgo"""
    try:
        # Obtener límites actuales
        response = requests.get(f"{BASE_URL}/api/risk/limits")
        print(f"GET Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Current Risk Limits")
        
        # Actualizar un límite
        if data.get('success'):
            original_limits = data.get('risk_limits', {})
            
            # Modificar límite de balance mínimo
            new_limits = {
                'min_available_balance': 1500.0  # Cambiar de 1000 a 1500
            }
            
            update_response = requests.post(
                f"{BASE_URL}/api/risk/limits",
                json=new_limits,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"\nPOST Status Code: {update_response.status_code}")
            update_data = update_response.json()
            print_response(update_data, "Updated Risk Limits")
            
            # Verificar el cambio
            if update_data.get('success'):
                updated_limits = update_data.get('updated_limits', {})
                print(f"\nBalance limit updated: ${updated_limits.get('min_available_balance', 0):.2f}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_performance_metrics():
    """Prueba el endpoint de métricas de performance"""
    try:
        response = requests.get(f"{BASE_URL}/api/performance/metrics")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print_response(data, "Performance Metrics")
        
        if data.get('success'):
            metrics = data.get('performance_metrics', {})
            print(f"\n24h PnL: ${metrics.get('total_pnl_24h', 0):.2f}")
            print(f"Max Drawdown: {metrics.get('max_drawdown', 0):.2f}%")
            print(f"ROI: {metrics.get('roi_percent', 0):.2f}%")
            print(f"Sharpe Ratio: {metrics.get('sharpe_ratio', 0):.4f}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def run_monitoring_test():
    """Ejecuta una prueba de monitoreo continuo"""
    print_separator("CONTINUOUS MONITORING TEST")
    print("Monitoring for 30 seconds...")
    
    for i in range(6):  # 6 iteraciones cada 5 segundos = 30 segundos
        print(f"\n--- Iteration {i+1}/6 ---")
        
        # Obtener resumen rápido
        try:
            response = requests.get(f"{BASE_URL}/api/account/summary")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    summary = data.get('account_summary', {})
                    balance = summary.get('account_balance', {})
                    positions = summary.get('positions', [])
                    alerts = summary.get('active_alerts', [])
                    health = summary.get('system_state', {}).get('account_health', 'unknown')
                    
                    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
                    print(f"Health: {health}")
                    print(f"Balance: ${balance.get('total_margin_balance', 0):.2f}")
                    print(f"PnL: ${balance.get('total_unrealized_pnl', 0):.2f}")
                    print(f"Positions: {len(positions)}")
                    print(f"Alerts: {len(alerts)}")
                    
                    if alerts:
                        for alert in alerts:
                            print(f"  - [{alert.get('level')}] {alert.get('message')}")
                else:
                    print("Error in API response")
            else:
                print(f"API Error: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        
        if i < 5:  # No esperar en la última iteración
            time.sleep(5)

def main():
    """Función principal de pruebas"""
    print_separator("ACCOUNT BALANCE MONITOR - COMPREHENSIVE TESTING")
    print(f"Testing server at: {BASE_URL}")
    print(f"Test started at: {datetime.now()}")
    
    tests = [
        ("System Status", test_system_status),
        ("Account Summary", test_account_summary),
        ("Current Balance", test_current_balance),
        ("Current Positions", test_current_positions),
        ("Balance History", test_balance_history),
        ("Active Alerts", test_active_alerts),
        ("Alert History", test_alert_history),
        ("Risk Limits", test_risk_limits),
        ("Performance Metrics", test_performance_metrics)
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
    
    # Prueba de monitoreo continuo
    run_monitoring_test()
    
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
        print("\n🎉 ALL TESTS PASSED! Account Balance Monitor is working correctly.")
    else:
        print(f"\n⚠️  {total-passed} test(s) failed. Please check the service.")

if __name__ == "__main__":
    main()
