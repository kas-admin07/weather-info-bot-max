import json
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):
    """
    Функция проверки здоровья сервиса
    """
    try:
        logger.info("Health check запрос")
        
        response_data = {
            'status': 'healthy',
            'service': 'Weather Bot',
            'version': '1.0.0',
            'timestamp': context.aws_request_id if hasattr(context, 'aws_request_id') else 'unknown'
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        logger.error(f"Ошибка health check: {e}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'status': 'unhealthy', 'error': str(e)})
        }