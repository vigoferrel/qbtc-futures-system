#!/usr/bin/env python3
"""
Verificación de balance con Binance para trading real
"""

import asyncio
import os
from real_data_connector import BinanceConnector

async def check_binance_balance():
    """Verificar balance de cuenta Binance"""

    print("💰 Verificando Balance con Binance")
    print("=" * 40)

    try:
        # Inicializar conector Binance
        connector = BinanceConnector()
        await connector.initialize()

        print("🔗 Conectando con Binance...")

        # Verificar conexión básica
        print("\n📊 Verificando conexión...")
        health_check = await connector.health_check()
        print(f"   Estado de conexión: {'✅ OK' if health_check else '❌ Falló'}")

        if not health_check:
            print("\n❌ No se pudo conectar con Binance")
            print("💡 Verifica tus credenciales de API")
            return

        # Intentar obtener balance de cuenta
        print("\n💰 Obteniendo balance de cuenta...")

        # Para obtener balance necesitamos usar las APIs de spot/futures
        # Primero intentamos con información de cuenta básica
        try:
            # Verificar precio actual como prueba de conexión
            btc_price = await connector.get_current_price("BTCUSDT")
            if btc_price:
                print(f"   💰 Precio BTC actual: ${btc_price:.2f}")
            else:
                print("   ❌ No se pudo obtener precio BTC")

            # Intentar obtener información de exchange
            exchange_info = await connector.get_exchange_info()
            if exchange_info.success:
                print("   ✅ Información de exchange obtenida")
                symbols_count = len(exchange_info.data.get('symbols', []))
                print(f"   📈 Símbolos disponibles: {symbols_count}")
            else:
                print("   ❌ No se pudo obtener información de exchange")

        except Exception as e:
            print(f"   ❌ Error al obtener datos: {str(e)}")

        # Información sobre credenciales
        print("\n🔐 Estado de credenciales:")
        api_key = os.getenv("BINANCE_API_KEY", "")
        api_secret = os.getenv("BINANCE_API_SECRET", "")

        if api_key and api_secret:
            print("   ✅ Credenciales API configuradas")
            print("   🔑 API Key: " + "*" * 8 + api_key[-4:])  # Mostrar últimos 4 caracteres
            print("   🔐 API Secret: " + "*" * 8 + api_secret[-4:])
        else:
            print("   ❌ Credenciales API no configuradas")
            print("\n📋 Para configurar credenciales:")
            print("   1. Ve a: https://www.binance.com/en/my/settings/api-management")
            print("   2. Crea una nueva API Key")
            print("   3. Configura las variables de entorno:")
            print("      BINANCE_API_KEY=tu_api_key")
            print("      BINANCE_API_SECRET=tu_api_secret")
            print("   4. Para testnet: https://testnet.binance.vision/")

        # Recomendaciones finales
        print("\n🎯 Recomendaciones para trading real:")
        print("   • Usa testnet primero para pruebas")
        print("   • Configura stop-loss siempre")
        print("   • Empieza con posiciones pequeñas")
        print("   • Monitorea el rendimiento constantemente")

        await connector.close()

    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        print("💡 Asegúrate de tener las dependencias instaladas:")
        print("   pip install -r requirements.txt")

if __name__ == "__main__":
    asyncio.run(check_binance_balance())
