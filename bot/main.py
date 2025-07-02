#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Главный модуль погодного бота для платформы MAX
Обрабатывает webhook запросы и отправляет информацию о погоде
"""

import os
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from .weather import get_weather_info
from .max_api import send_message_to_max

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Создание Flask приложения
app = Flask(__name__)

# Получение конфигурации из переменных окружения
MAX_BOT_SECRET = os.getenv('MAX_BOT_SECRET')
BOT_PORT = int(os.getenv('BOT_PORT', 8443))
BOT_HOST = os.getenv('BOT_HOST', '0.0.0.0')

if not MAX_BOT_SECRET:
    logger.error("MAX_BOT_SECRET не найден в переменных окружения")
    exit(1)


@app.route('/webhook/max', methods=['POST'])
def webhook_max():
    """
    Обработчик webhook для платформы MAX
    Принимает сообщения и отвечает информацией о погоде
    """
    try:
        data = request.get_json()
        logger.info(f"Получен webhook: {data}")
        
        # Проверка наличия необходимых полей
        if not data or 'message' not in data:
            logger.warning("Некорректный формат webhook")
            return jsonify({'status': 'error', 'message': 'Invalid webhook format'}), 400
        
        message = data['message']
        
        # Извлечение информации о пользователе и тексте сообщения
        user_id = message.get('from', {}).get('id')
        text = message.get('text', '').strip()
        
        if not user_id or not text:
            logger.warning("Отсутствует ID пользователя или текст сообщения")
            return jsonify({'status': 'error', 'message': 'Missing user ID or text'}), 400
        
        # Получение информации о погоде
        weather_info = get_weather_info(text)
        
        # Отправка ответа пользователю
        success = send_message_to_max(user_id, weather_info)
        
        if success:
            logger.info(f"Сообщение успешно отправлено пользователю {user_id}")
            return jsonify({'status': 'ok'}), 200
        else:
            logger.error(f"Ошибка отправки сообщения пользователю {user_id}")
            return jsonify({'status': 'error', 'message': 'Failed to send message'}), 500
            
    except Exception as e:
        logger.error(f"Ошибка обработки webhook: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Проверка состояния сервера
    """
    return jsonify({'status': 'healthy', 'service': 'MAX Weather Bot'}), 200


@app.route('/', methods=['GET'])
def index():
    """
    Главная страница
    """
    return jsonify({
        'service': 'MAX Weather Bot',
        'status': 'running',
        'webhook_url': '/webhook/max'
    }), 200


def main():
    """
    Запуск Flask сервера
    """
    logger.info(f"Запуск MAX Weather Bot на {BOT_HOST}:{BOT_PORT}")
    app.run(
        host=BOT_HOST,
        port=BOT_PORT,
        debug=False
    )


if __name__ == '__main__':
    main()