#!/usr/bin/env python3
"""
🚀 QBTC MASTER COPILOT - SETUP SCRIPT
===================================

Script de configuración automática para el agente QBTC Master Copilot
"""

import os
import sys
import subprocess
from pathlib import Path

def print_banner():
    """Mostrar banner del setup"""
    print("🚀 QBTC MASTER COPILOT - SETUP")
    print("=" * 50)
    print("🤖 Instalación automática del agente conversacional")
    print()

def check_python_version():
    """Verificar versión de Python"""
    print("🐍 Verificando versión de Python...")
    version = sys.version_info

    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python {version.major}.{version.minor} no es compatible")
        print("💡 Se requiere Python 3.8 o superior")
        return False

    print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
    return True

def install_dependencies():
    """Instalar dependencias"""
    print("\n📦 Instalando dependencias...")

    try:
        # Instalar dependencias desde requirements.txt
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True)

        if result.returncode == 0:
            print("✅ Dependencias instaladas correctamente")
            return True
        else:
            print("❌ Error instalando dependencias:")
            print(result.stderr)
            return False

    except Exception as e:
        print(f"❌ Error ejecutando pip: {e}")
        return False

def setup_environment():
    """Configurar variables de entorno"""
    print("\n🔧 Configurando entorno...")

    env_file = Path(".env")

    if env_file.exists():
        print("⚠️  Archivo .env ya existe")
        overwrite = input("¿Sobreescribir? (y/N): ").strip().lower()
        if overwrite != 'y':
            print("⏭️  Saltando configuración de entorno")
            return True

    # Crear archivo .env básico
    env_content = """# QBTC Master Copilot - Environment Configuration
# ===============================================

# Google Gemini API Configuration
# Obtén tu API key desde: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# QBTC System Integration (opcional)
QBTC_SYSTEM_URL=http://localhost:14001
QBTC_API_KEY=

# Agent Configuration
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=2048

# Conversation Settings
CONVERSATION_HISTORY_LIMIT=50
CONVERSATION_SAVE_PATH=./conversations
"""

    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)

        print("✅ Archivo .env creado")
        print("⚠️  IMPORTANTE: Configura tu GEMINI_API_KEY en el archivo .env")

        return True

    except Exception as e:
        print(f"❌ Error creando archivo .env: {e}")
        return False

def create_directories():
    """Crear directorios necesarios"""
    print("\n📁 Creando directorios...")

    directories = [
        "conversations",
        "logs",
        "data"
    ]

    for dir_name in directories:
        try:
            Path(dir_name).mkdir(exist_ok=True)
            print(f"✅ Directorio creado: {dir_name}")
        except Exception as e:
            print(f"❌ Error creando directorio {dir_name}: {e}")
            return False

    return True

def test_installation():
    """Probar instalación"""
    print("\n🧪 Probando instalación...")

    try:
        # Intentar importar módulos principales
        import pydantic
        print("✅ Pydantic instalado correctamente")

        import google.generativeai as genai
        print("✅ Google Generative AI instalado correctamente")

        # Intentar importar módulos del proyecto
        from gemini_agent import GeminiCopilot
        print("✅ Gemini Agent importado correctamente")

        from qbtc_integration import QBTCSystemIntegrator
        print("✅ QBTC Integration importado correctamente")

        return True

    except ImportError as e:
        print(f"❌ Error importando módulos: {e}")
        return False
    except Exception as e:
        print(f"❌ Error en prueba de instalación: {e}")
        return False

def show_usage_instructions():
    """Mostrar instrucciones de uso"""
    print("\n🎯 INSTALACIÓN COMPLETADA")
    print("=" * 50)
    print("\n🚀 Para usar el QBTC Master Copilot:")
    print()
    print("1. 📝 Configurar API Key:")
    print("   - Edita el archivo .env")
    print("   - Agrega tu GEMINI_API_KEY")
    print("   - Obtén la key en: https://makersuite.google.com/app/apikey")
    print()
    print("2. 🎮 Ejecutar el agente:")
    print("   python run_copilot.py")
    print()
    print("3. 💡 Comandos disponibles:")
    print("   - Modo Básico: Solo Gemini AI")
    print("   - Modo QBTC: Integración completa con el sistema")
    print()
    print("4. 📚 Comandos en chat:")
    print("   'estado' - Ver estado del sistema")
    print("   'limpiar' - Limpiar conversación")
    print("   'salir' - Terminar sesión")
    print()
    print("🤖 ¡Tu QBTC Master Copilot está listo!")
    print()

def main():
    """Función principal del setup"""
    print_banner()

    # Verificar versión de Python
    if not check_python_version():
        sys.exit(1)

    # Instalar dependencias
    if not install_dependencies():
        print("❌ Falló instalación de dependencias")
        sys.exit(1)

    # Configurar entorno
    if not setup_environment():
        print("❌ Falló configuración del entorno")
        sys.exit(1)

    # Crear directorios
    if not create_directories():
        print("❌ Falló creación de directorios")
        sys.exit(1)

    # Probar instalación
    if not test_installation():
        print("❌ Falló prueba de instalación")
        sys.exit(1)

    # Mostrar instrucciones
    show_usage_instructions()

    print("🎉 ¡Setup completado exitosamente!")
    print("🚀 Ejecuta: python run_copilot.py")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Setup interrumpido por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error fatal durante setup: {e}")
        sys.exit(1)

