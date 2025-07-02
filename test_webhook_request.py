#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тестирование вебхука Netlify для Weather Bot
"""

import requests
import json

def test_webhook():
    """Тестирует вебхук на Netlify"""
    # URL вебхука на Netlify (используем правильный путь)
    webhook_url = "https://6864a22983d3e600082e8a7d--max-weather-bot.netlify.app/webhook/max"
    
    # Тестовые данные для отправки
    test_data = {
        "message": {
            "text": "/weather Москва",
            "chat": {
                "id": 123456789
            },
            "from": {
                "id": 987654321,
                "first_name": "Test",
                "username": "testuser"
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "TelegramBot"
    }
    
    try:
        print(f"Отправка запроса на: {webhook_url}")
        print(f"Данные: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        response = requests.post(
            webhook_url,
            json=test_data,
            headers=headers,
            timeout=30
        )
        
        print(f"\nСтатус ответа: {response.status_code}")
        print(f"Заголовки ответа: {dict(response.headers)}")
        
        if response.text:
            print(f"Тело ответа: {response.text}")
        else:
            print("Тело ответа пустое")
            
        if response.status_code == 200:
            print("✅ Вебхук работает корректно!")
        else:
            print(f"❌ Ошибка: статус {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("❌ Таймаут запроса")
    except requests.exceptions.ConnectionError:
        print("❌ Ошибка соединения")
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")

if __name__ == "__main__":
    test_webhook()