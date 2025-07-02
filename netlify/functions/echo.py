import json
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):
    """
    Простая эхо-функция для тестирования
    """
    try:
        logger.info(f"Echo запрос: {event.get('httpMethod', 'UNKNOWN')}")
        
        # Простой ответ с основной информацией
        response_data = {
            'status': 'ok',
            'message': 'Echo работает!',
            'method': event.get('httpMethod', 'UNKNOWN'),
            'body': event.get('body', ''),
            'timestamp': context.aws_request_id if hasattr(context, 'aws_request_id') else 'unknown'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"Ошибка echo: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }