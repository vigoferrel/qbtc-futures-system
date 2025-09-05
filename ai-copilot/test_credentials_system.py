#!/usr/bin/env python3
"""
Test del sistema de credenciales QBTC
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

def test_credentials_system():
    """Probar el sistema de credenciales"""

    print("🔐 Probando Sistema de Credenciales QBTC")
    print("=" * 50)

    # Agregar directorio raíz al path para cargar credenciales
    root_dir = Path(__file__).parent.parent
    sys.path.insert(0, str(root_dir))

    # Intentar cargar desde diferentes archivos
    credentials_files = [
        "credentials.env",  # Nuevo archivo en raíz
        "ai-copilot/config.env",  # Configuración existente
        "ai-copilot/binance_credentials.env",  # Credenciales específicas
    ]

    loaded_files = []

    for cred_file in credentials_files:
        cred_path = root_dir / cred_file
        if cred_path.exists():
            load_dotenv(cred_path)
            loaded_files.append(cred_file)
            print(f"✅ Archivo cargado: {cred_file}")

    if not loaded_files:
        print("❌ No se encontraron archivos de credenciales")
        return

    print(f"\n📋 Archivos de credenciales cargados: {len(loaded_files)}")

    # Verificar credenciales disponibles
    print("\n🔍 Estado de Credenciales:")
    print("-" * 30)

    # OpenRouter
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key and openrouter_key != "sk-or-v1-your-openrouter-api-key-here":
        print("✅ OPENROUTER_API_KEY: Configurada")
    else:
        print("❌ OPENROUTER_API_KEY: No configurada")

    # Binance Mainnet
    binance_key = os.getenv("BINANCE_API_KEY")
    binance_secret = os.getenv("BINANCE_API_SECRET")

    if binance_key and binance_key != "your_real_binance_api_key_here":
        print("✅ BINANCE_API_KEY: Configurada (Mainnet)")
    else:
        print("❌ BINANCE_API_KEY: No configurada (Mainnet)")

    if binance_secret and binance_secret != "your_real_binance_api_secret_here":
        print("✅ BINANCE_API_SECRET: Configurada (Mainnet)")
    else:
        print("❌ BINANCE_API_SECRET: No configurada (Mainnet)")

    # Binance Testnet
    testnet_key = os.getenv("BINANCE_TESTNET_API_KEY")
    testnet_secret = os.getenv("BINANCE_TESTNET_API_SECRET")

    if testnet_key and testnet_key != "your_testnet_api_key_here":
        print("✅ BINANCE_TESTNET_API_KEY: Configurada")
    else:
        print("❌ BINANCE_TESTNET_API_KEY: No configurada")

    if testnet_secret and testnet_secret != "your_testnet_api_secret_here":
        print("✅ BINANCE_TESTNET_API_SECRET: Configurada")
    else:
        print("❌ BINANCE_TESTNET_API_SECRET: No configurada")

    # Configuración del entorno
    use_testnet = os.getenv("USE_TESTNET", "true").lower() == "true"
    print(f"🎯 Modo de operación: {'TESTNET' if use_testnet else 'MAINNET'}")

    # Verificar configuración del sistema
    print("\n⚙️ Configuración del Sistema:")
    print("-" * 30)

    system_vars = [
        ("LOG_LEVEL", "info"),
        ("MAX_TOKENS", "2000"),
        ("TEMPERATURE", "0.7"),
        ("MAX_POSITION_SIZE", "1000"),
        ("STOP_LOSS_PERCENT", "0.02"),
        ("TAKE_PROFIT_PERCENT", "0.05"),
    ]

    for var_name, default_value in system_vars:
        value = os.getenv(var_name, default_value)
        print(f"✅ {var_name}: {value}")

    # Recomendaciones
    print("\n💡 Recomendaciones:")
    print("-" * 20)

    if not (testnet_key and testnet_secret):
        print("⚠️  Configura credenciales de TESTNET para pruebas seguras")
        print("   URL: https://testnet.binance.vision/")

    if not (binance_key and binance_secret):
        print("⚠️  Configura credenciales de MAINNET cuando estés listo")
        print("   URL: https://www.binance.com/en/my/settings/api-management")

    if not openrouter_key or openrouter_key == "sk-or-v1-your-openrouter-api-key-here":
        print("⚠️  Verifica configuración de OpenRouter")

    if use_testnet:
        print("✅ Sistema configurado para TESTNET (modo seguro)")
    else:
        print("⚠️  Sistema configurado para MAINNET (usa con precaución)")

    print("\n🎯 Estado General:")
    if (testnet_key and testnet_secret) or (binance_key and binance_secret):
        print("✅ Credenciales disponibles - listo para trading")
    else:
        print("❌ Credenciales faltantes - configura antes de usar")

if __name__ == "__main__":
    test_credentials_system()
