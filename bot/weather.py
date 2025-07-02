#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль для получения информации о погоде через API wttr.in
"""

import requests
import logging

logger = logging.getLogger(__name__)

# Базовый URL для API wttr.in
WTTR_BASE_URL = "https://wttr.in"

# Параметры запроса для получения краткой информации о погоде
WTTR_PARAMS = {
    'format': '3',  # Краткий формат
    'lang': 'ru',   # Русский язык
    'M': ''         # Метрическая система
}


def get_weather_info(city: str) -> str:
    """
    Получает информацию о погоде для указанного города
    
    Args:
        city (str): Название города
        
    Returns:
        str: Информация о погоде или сообщение об ошибке
    """
    if not city or not city.strip():
        return "❌ Пожалуйста, укажите название города."
    
    city = city.strip()
    
    try:
        # Формирование URL для запроса
        url = f"{WTTR_BASE_URL}/{city}"
        
        logger.info(f"Запрос погоды для города: {city}")
        
        # Выполнение HTTP запроса
        response = requests.get(
            url,
            params=WTTR_PARAMS,
            timeout=10,
            headers={'User-Agent': 'MAX Weather Bot'}
        )
        
        # Проверка статуса ответа
        if response.status_code == 200:
            weather_text = response.text.strip()
            
            # Проверка на корректность ответа
            if weather_text and not weather_text.startswith('Unknown location'):
                logger.info(f"Получена погода для {city}: {weather_text}")
                return f"🌤 Погода в городе {city}:\n{weather_text}"
            else:
                logger.warning(f"Город не найден: {city}")
                return f"❌ Город '{city}' не найден. Проверьте правильность написания."
        
        elif response.status_code == 404:
            logger.warning(f"Город не найден: {city}")
            return f"❌ Город '{city}' не найден. Проверьте правильность написания."
        
        else:
            logger.error(f"Ошибка API wttr.in: {response.status_code}")
            return "❌ Временные проблемы с сервисом погоды. Попробуйте позже."
            
    except requests.exceptions.Timeout:
        logger.error(f"Таймаут при запросе погоды для {city}")
        return "❌ Превышено время ожидания. Попробуйте позже."
        
    except requests.exceptions.ConnectionError:
        logger.error(f"Ошибка соединения при запросе погоды для {city}")
        return "❌ Проблемы с подключением к сервису погоды. Попробуйте позже."
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка запроса погоды для {city}: {e}")
        return "❌ Ошибка при получении данных о погоде. Попробуйте позже."
        
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении погоды для {city}: {e}")
        return "❌ Произошла неожиданная ошибка. Попробуйте позже."


def get_detailed_weather(city: str) -> str:
    """
    Получает подробную информацию о погоде для указанного города
    
    Args:
        city (str): Название города
        
    Returns:
        str: Подробная информация о погоде или сообщение об ошибке
    """
    if not city or not city.strip():
        return "❌ Пожалуйста, укажите название города."
    
    city = city.strip()
    
    try:
        # Параметры для подробного прогноза
        detailed_params = {
            'format': '%l:+%c+%t+%h+%w+%p+%P\n',
            'lang': 'ru',
            'M': ''
        }
        
        url = f"{WTTR_BASE_URL}/{city}"
        
        logger.info(f"Запрос подробной погоды для города: {city}")
        
        response = requests.get(
            url,
            params=detailed_params,
            timeout=10,
            headers={'User-Agent': 'MAX Weather Bot'}
        )
        
        if response.status_code == 200:
            weather_text = response.text.strip()
            
            if weather_text and not weather_text.startswith('Unknown location'):
                logger.info(f"Получена подробная погода для {city}")
                return f"🌤 Подробная погода в городе {city}:\n{weather_text}"
            else:
                return f"❌ Город '{city}' не найден. Проверьте правильность написания."
        else:
            return "❌ Временные проблемы с сервисом погоды. Попробуйте позже."
            
    except Exception as e:
        logger.error(f"Ошибка получения подробной погоды для {city}: {e}")
        return "❌ Ошибка при получении подробных данных о погоде. Попробуйте позже."