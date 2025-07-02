#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для локального тестирования webhook функции
"""

import json
import os
from netlify.functions.webhook import handler

# Тестовые данные для имитации запроса от MAX
test_event = {
    'httpMethod': 'POST',
    'headers': {
        'Content-Type': 'application/json',
        'X-Max-Signature': 'test_signature'
    },
    'body': json.dumps({
        'message': {
            'text': 'Москва'
        },
        'sender': {
            'user_id': 'test_user_123'
        }
    }),
    'queryStringParameters': {}
}

test_context = {}

async def test_webhook():
    """
    Тестирует webhook функцию локально
    """
    print("=== ЛОКАЛЬНЫЙ ТЕСТ WEBHOOK ===")
    print("Тестируем обработку сообщения 'Москва'...")
    
    try:
        result = await handler(test_event, test_context)
        print(f"\nРезультат:")
        print(f"Status Code: {result.get('statusCode')}")
        print(f"Body: {result.get('body')}")
        print(f"Headers: {result.get('headers')}")
        
        if result.get('statusCode') == 200:
            print("\n✅ Тест прошел успешно!")
        else:
            print("\n❌ Тест завершился с ошибкой")
            
    except Exception as e:
        print(f"\n❌ Ошибка при тестировании: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

def test_weather_function():
    """
    Тестирует функцию получения погоды
    """
    print("\n=== ТЕСТ ФУНКЦИИ ПОГОДЫ ===")
    
    from netlify.functions.webhook import get_weather_info
    
    test_cities = ['Москва', 'Санкт-Петербург', 'НесуществующийГород']
    
    for city in test_cities:
        print(f"\nТестируем город: {city}")
        result = get_weather_info(city)
        print(f"Результат: {result}")

if __name__ == '__main__':
    print("Запуск локальных тестов...")
    
    # Проверяем переменные окружения
    max_secret = os.getenv('MAX_BOT_SECRET')
    print(f"MAX_BOT_SECRET установлен: {bool(max_secret)}")
    
    if max_secret:
        print(f"MAX_BOT_SECRET (первые 10 символов): {max_secret[:10]}...")
    
    # Тест функции погоды
    test_weather_function()
    
    # Тест webhook (асинхронный)
    import asyncio
    asyncio.run(test_webhook())
    
    print("\n=== ТЕСТЫ ЗАВЕРШЕНЫ ===")