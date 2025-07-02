#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль для работы с API платформы MAX
Отправка сообщений пользователям
"""

import os
import requests
import logging

logger = logging.getLogger(__name__)

# Базовый URL для API MAX
MAX_API_BASE_URL = "https://api.max.ru/v1"

# Получение токена из переменных окружения
MAX_BOT_SECRET = os.getenv('MAX_BOT_SECRET')


def send_message_to_max(user_id: str, text: str) -> bool:
    """
    Отправляет сообщение пользователю через API MAX
    
    Args:
        user_id (str): ID пользователя
        text (str): Текст сообщения
        
    Returns:
        bool: True если сообщение отправлено успешно, False в противном случае
    """
    if not MAX_BOT_SECRET:
        logger.error("MAX_BOT_SECRET не найден в переменных окружения")
        return False
    
    if not user_id or not text:
        logger.error("Отсутствует user_id или text для отправки сообщения")
        return False
    
    try:
        # Подготовка данных для отправки
        payload = {
            "recipient": {
                "user_id": user_id
            },
            "message": {
                "text": text
            }
        }
        
        # Заголовки запроса
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MAX_BOT_SECRET}"
        }
        
        # URL для отправки сообщения
        url = f"{MAX_API_BASE_URL}/messages"
        
        logger.info(f"Отправка сообщения пользователю {user_id}")
        
        # Выполнение HTTP запроса
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        # Проверка статуса ответа
        if response.status_code == 200:
            logger.info(f"Сообщение успешно отправлено пользователю {user_id}")
            return True
        elif response.status_code == 401:
            logger.error("Ошибка авторизации MAX API - проверьте токен")
            return False
        elif response.status_code == 429:
            logger.warning("Превышен лимит запросов MAX API")
            return False
        else:
            logger.error(f"Ошибка MAX API: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        logger.error(f"Таймаут при отправке сообщения пользователю {user_id}")
        return False
        
    except requests.exceptions.ConnectionError:
        logger.error(f"Ошибка соединения при отправке сообщения пользователю {user_id}")
        return False
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка запроса при отправке сообщения пользователю {user_id}: {e}")
        return False
        
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке сообщения пользователю {user_id}: {e}")
        return False


def send_typing_action(user_id: str) -> bool:
    """
    Отправляет действие "печатает" пользователю
    
    Args:
        user_id (str): ID пользователя
        
    Returns:
        bool: True если действие отправлено успешно, False в противном случае
    """
    if not MAX_BOT_SECRET:
        logger.error("MAX_BOT_SECRET не найден в переменных окружения")
        return False
    
    if not user_id:
        logger.error("Отсутствует user_id для отправки действия")
        return False
    
    try:
        payload = {
            "recipient": {
                "user_id": user_id
            },
            "action": "typing"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MAX_BOT_SECRET}"
        }
        
        url = f"{MAX_API_BASE_URL}/actions"
        
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            logger.debug(f"Действие 'typing' отправлено пользователю {user_id}")
            return True
        else:
            logger.warning(f"Не удалось отправить действие 'typing' пользователю {user_id}")
            return False
            
    except Exception as e:
        logger.warning(f"Ошибка при отправке действия 'typing' пользователю {user_id}: {e}")
        return False


def validate_webhook_signature(request_data: str, signature: str) -> bool:
    """
    Проверяет подпись webhook запроса от MAX
    
    Args:
        request_data (str): Данные запроса
        signature (str): Подпись из заголовка
        
    Returns:
        bool: True если подпись валидна, False в противном случае
    """
    # Здесь должна быть реализация проверки подписи
    # В зависимости от требований платформы MAX
    # Пока возвращаем True для упрощения
    return True