#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой тест для проверки функций бота на Netlify
"""

import requests
import json

# ВАЖНО: Замените на ваш реальный URL Netlify
BASE_URL = "https://your-netlify-app.netlify.app"  # Замените на ваш URL

def test_health():
    """
    Тестирует эндпоинт /health
    """
    print("\n=== Тест Health ===")
    try:
        url = f"{BASE_URL}/health"
        print(f"Запрос к: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"Статус: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Health check успешно")
            return True
        else:
            print("❌ Health check не прошел")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка health: {e}")
        return False

def test_echo():
    """
    Тестирует эндпоинт /echo
    """
    print("\n=== Тест Echo ===")
    try:
        url = f"{BASE_URL}/echo"
        print(f"Запрос к: {url}")
        
        test_data = {"test": "hello"}
        
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Статус: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Echo тест успешно")
            return True
        else:
            print("❌ Echo тест не прошел")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка echo: {e}")
        return False

def test_webhook():
    """
    Тестирует эндпоинт /webhook/max
    """
    print("\n=== Тест Webhook ===")
    try:
        url = f"{BASE_URL}/webhook/max"
        print(f"Запрос к: {url}")
        
        # Простой тест webhook
        test_data = {
            "message": {"text": "Москва"},
            "sender": {"user_id": "test_123"}
        }
        
        response = requests.post(
            url,
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        print(f"Статус: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code in [200, 500]:  # 500 ожидаем без API ключа
            print("✅ Webhook отвечает")
            return True
        else:
            print("❌ Webhook не отвечает")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка webhook: {e}")
        return False

def main():
    """
    Запускает все тесты
    """
    print("🚀 Тестирование погодного бота")
    print(f"URL: {BASE_URL}")
    
    if BASE_URL == "https://your-netlify-app.netlify.app":
        print("\n⚠️  Замените BASE_URL на ваш Netlify URL!")
        return
    
    results = []
    results.append(test_health())
    results.append(test_echo())
    results.append(test_webhook())
    
    print("\n" + "="*30)
    print("📊 РЕЗУЛЬТАТЫ")
    print("="*30)
    
    passed = sum(results)
    total = len(results)
    print(f"Пройдено: {passed}/{total}")
    
    if passed == total:
        print("🎉 Все тесты прошли!")
    else:
        print("⚠️  Есть проблемы")

if __name__ == "__main__":
    main()