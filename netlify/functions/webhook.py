import json
import os
import requests
import logging
import hmac
import hashlib

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получение переменных окружения
MAX_BOT_SECRET = os.getenv('MAX_BOT_SECRET')

def get_weather_info(city: str) -> str:
    """
    Получает информацию о погоде для указанного города
    """
    if not city or not city.strip():
        return "❌ Пожалуйста, укажите название города."
    
    city = city.strip()
    
    try:
        # Формирование URL для запроса к wttr.in
        url = f"https://wttr.in/{city}"
        params = {
            'format': '3',  # Краткий формат
            'lang': 'ru',   # Русский язык
            'M': ''         # Метрическая система
        }
        
        logger.info(f"Запрос погоды для города: {city}")
        
        response = requests.get(
            url,
            params=params,
            timeout=10,
            headers={'User-Agent': 'MAX Weather Bot'}
        )
        
        if response.status_code == 200:
            weather_text = response.text.strip()
            
            if weather_text and not weather_text.startswith('Unknown location'):
                logger.info(f"Получена погода для {city}: {weather_text}")
                return f"🌤 Погода в городе {city}:\n{weather_text}"
            else:
                return f"❌ Город '{city}' не найден. Проверьте правильность написания."
        else:
            return "❌ Временные проблемы с сервисом погоды. Попробуйте позже."
            
    except Exception as e:
        logger.error(f"Ошибка получения погоды для {city}: {e}")
        return "❌ Ошибка при получении данных о погоде. Попробуйте позже."

def send_message_to_max(user_id: str, text: str) -> bool:
    """
    Отправляет сообщение пользователю через API MAX
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
        url = "https://api.max.ru/v1/messages"
        
        logger.info(f"Отправка сообщения пользователю {user_id}")
        
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            logger.info(f"Сообщение успешно отправлено пользователю {user_id}")
            return True
        else:
            logger.error(f"Ошибка MAX API: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Ошибка при отправке сообщения пользователю {user_id}: {e}")
        return False

async def handler(event, context):
    """
    Обработчик webhook от MAX API
    """
    try:
        # Подробное логирование для диагностики
        print(f"=== WEBHOOK DEBUG START ===")
        print(f"HTTP Method: {event.get('httpMethod', 'UNKNOWN')}")
        print(f"Headers: {event.get('headers', {})}")
        print(f"Body: {event.get('body', '')}")
        print(f"Query params: {event.get('queryStringParameters', {})}")
        print(f"MAX_BOT_SECRET exists: {bool(MAX_BOT_SECRET)}")
        
        logger.info(f"Webhook запрос: {event.get('httpMethod', 'UNKNOWN')}")
        
        # Проверка метода
        if event.get('httpMethod') != 'POST':
            print("ERROR: Method not POST")
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # Получение тела запроса
        body = event.get('body', '')
        if not body:
            print("ERROR: Empty body")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Empty body'})
            }
        
        # Проверка заголовка X-Max-Signature (если есть)
        headers = event.get('headers', {})
        received_sig = headers.get('X-Max-Signature') or headers.get('x-max-signature', '')
        
        if MAX_BOT_SECRET and received_sig:
            expected_sig = hmac.new(
                MAX_BOT_SECRET.encode(), 
                body.encode() if isinstance(body, str) else body, 
                hashlib.sha256
            ).hexdigest()
            
            print(f"Signature check - received: {received_sig}, expected: {expected_sig}")
            
            if not hmac.compare_digest(received_sig, expected_sig):
                print("ERROR: Invalid signature")
                return {'statusCode': 403, 'body': json.dumps({'error': 'Invalid signature'})}
        else:
            print("WARNING: Signature verification skipped")
        
        # Парсинг JSON
        try:
            data = json.loads(body)
            print(f"Parsed data: {data}")
        except json.JSONDecodeError as e:
            print(f"ERROR: JSON decode error: {e}")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid JSON'})
            }
        
        # Извлечение данных
        message_data = data.get('message', {})
        user_data = data.get('sender', {})
        user_id = user_data.get('user_id')
        message_text = message_data.get('text', '').strip()
        
        print(f"Extracted - user_id: {user_id}, message: {message_text}")
        
        if not user_id or not message_text:
            print("ERROR: Missing user_id or message_text")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing data'})
            }
        
        logger.info(f"Сообщение от {user_id}: {message_text}")
        
        # Обработка команд
        if message_text.lower() in ['/start', 'старт']:
            response_text = "🌤 Погодный бот готов! Напишите название города."
        elif message_text.lower() in ['/help', 'помощь']:
            response_text = "🆘 Напишите название города для получения погоды."
        else:
            # Получение погоды
            response_text = get_weather_info(message_text)
        
        print(f"Response text: {response_text}")
        
        # Отправка ответа
        success = send_message_to_max(user_id, response_text)
        
        print(f"Send success: {success}")
        print(f"=== WEBHOOK DEBUG END ===")
        
        if success:
            # Обязательный формат ответа для Макса
            return {
                'statusCode': 200,
                'body': json.dumps({'status': 'ok'}),
                'headers': {'Content-Type': 'application/json'}
            }
        else:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Send failed'})
            }
    
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        logger.error(f"Ошибка webhook: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Server error'})
        }