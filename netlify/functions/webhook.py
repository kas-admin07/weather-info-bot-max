import json
import os
import sys
import requests
import logging

# Добавляем корневую директорию в путь для импорта модулей
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from bot.weather import get_weather_info
    from bot.max_api import send_message_to_max
except ImportError as e:
    logging.error(f"Ошибка импорта: {e}")
    # Заглушки для функций, если импорт не удался
    def get_weather_info(city):
        return f"Информация о погоде для {city} временно недоступна"
    
    def send_message_to_max(user_id, message):
        logging.info(f"Отправка сообщения {user_id}: {message}")
        return True

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):
    """
    Обработка webhook от MAX API
    """
    try:
        logger.info(f"Получен запрос: {event.get('httpMethod')}")
        logger.info(f"Тело запроса: {event.get('body', '')}")
        
        if event.get('httpMethod') != 'POST':
            logger.info("Не POST запрос, возвращаем OK")
            return {
                'statusCode': 200,
                'body': json.dumps({'status': 'ok'})
            }
        
        # Получаем данные от MAX
        body = json.loads(event.get('body', '{}'))
        logger.info(f"Распарсенное тело: {body}")
        
        if 'message' not in body:
            logger.info("Нет поля 'message' в теле запроса")
            return {'statusCode': 200, 'body': 'ok'}
        
        message = body['message']
        user_id = message.get('from', {}).get('id')
        text = message.get('text', '').strip()
        
        logger.info(f"User ID: {user_id}, Text: {text}")
        
        if not user_id or not text:
            logger.info("Отсутствует user_id или text")
            return {'statusCode': 200, 'body': 'ok'}
        
        # Получаем информацию о погоде
        logger.info(f"Получаем погоду для: {text}")
        weather_info = get_weather_info(text)
        logger.info(f"Информация о погоде: {weather_info}")
        
        # Отправляем ответ через MAX API
        logger.info(f"Отправляем сообщение пользователю {user_id}")
        success = send_message_to_max(user_id, weather_info)
        logger.info(f"Результат отправки: {success}")
        
        return {
            'statusCode': 200 if success else 500,
            'body': json.dumps({'status': 'ok' if success else 'error'})
        }
        
    except Exception as e:
        logger.error(f"Ошибка в webhook: {e}")
        print(f"Error: {e}")
        return {
            'statusCode': 200,
            'body': json.dumps({'status': 'error', 'message': str(e)})
        }