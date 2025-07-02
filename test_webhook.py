#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тестирование webhook функции локально
"""

import json
import sys
import os
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from netlify.functions.webhook import handler

def test_webhook():
    """
    Тестирование webhook с примером данных от MAX API
    """
    # Пример данных от MAX API
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'message': {
                'from': {
                    'id': 'test_user_123'
                },
                'text': 'Москва'
            }
        })
    }
    
    test_context = {}
    
    print("Тестирование webhook...")
    print(f"Тестовые данные: {test_event}")
    
    try:
        result = handler(test_event, test_context)
        print(f"Результат: {result}")
        return result
    except Exception as e:
        print(f"Ошибка при тестировании: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    test_webhook()