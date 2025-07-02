import json
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):
    """
    Простая функция эхо для тестирования
    Возвращает полученные данные обратно
    """
    try:
        logger.info(f"Echo запрос: {event.get('httpMethod')}")
        logger.info(f"Тело запроса: {event.get('body', '')}")
        
        # Получаем данные из запроса
        body = event.get('body', '{}')
        method = event.get('httpMethod', 'UNKNOWN')
        headers = event.get('headers', {})
        
        # Парсим JSON если возможно
        try:
            parsed_body = json.loads(body) if body else {}
        except json.JSONDecodeError:
            parsed_body = {'raw_body': body}
        
        response_data = {
            'status': 'success',
            'echo': {
                'method': method,
                'received_body': parsed_body,
                'headers': dict(headers),
                'message': 'Эхо функция работает корректно!'
            }
        }
        
        logger.info(f"Отправляем ответ: {response_data}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(response_data, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"Ошибка в echo функции: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json; charset=utf-8'
            },
            'body': json.dumps({
                'status': 'error',
                'message': f'Ошибка: {str(e)}'
            }, ensure_ascii=False)
        }