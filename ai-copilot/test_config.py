#!/usr/bin/env python3
"""
Test de configuración OpenRouter
"""

import os
from dotenv import load_dotenv

def test_configuration():
    """Verificar configuración OpenRouter"""

    # Cargar configuración
    load_dotenv('config.env')

    print('🔧 Verificando configuración OpenRouter...')
    print('=' * 50)

    # Verificar API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if api_key and api_key != "sk-or-v1-your-openrouter-api-key-here":
        print('📋 OPENROUTER_API_KEY: ✅ Configurada correctamente')
    else:
        print('📋 OPENROUTER_API_KEY: ❌ No configurada o es placeholder')
        print('   💡 Obtén tu clave en: https://openrouter.ai/keys')

    # Verificar otras configuraciones
    print(f'🤖 AI_MODEL: {os.getenv("AI_MODEL", "anthropic/claude-3-haiku:beta")}')
    print(f'🌡️ TEMPERATURE: {os.getenv("TEMPERATURE", "0.7")}')
    print(f'📊 MAX_TOKENS: {os.getenv("MAX_TOKENS", "2000")}')

    return api_key and api_key != "sk-or-v1-your-openrouter-api-key-here"

if __name__ == "__main__":
    config_ok = test_configuration()

    if config_ok:
        print('\n✅ Configuración correcta - listo para usar OpenRouter')
    else:
        print('\n❌ Configuración incompleta - actualiza config.env')

