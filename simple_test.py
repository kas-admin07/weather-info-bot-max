#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой тест для проверки работы Python и requests
"""

import sys
print("Python работает!")
print(f"Версия Python: {sys.version}")

try:
    import requests
    print("Модуль requests доступен")
    
    # Простой GET запрос
    response = requests.get("https://httpbin.org/get", timeout=10)
    print(f"Статус запроса: {response.status_code}")
    print("Интернет соединение работает")
    
except ImportError:
    print("Модуль requests не установлен")
except Exception as e:
    print(f"Ошибка: {e}")

print("Тест завершен")