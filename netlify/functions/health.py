import json
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handler(event, context):
    """
    Функция проверки работоспособности сервиса
    """
    try:
        logger.info("Health check запрос")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'healthy',
                'service': 'Weather Bot Webhook',
                'timestamp': context.aws_request_id if hasattr(context, 'aws_request_id') else 'unknown'
            })
        }
        
    except Exception as e:
        logger.error(f"Ошибка в health check: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'status': 'error',
                'message': str(e)
            })
        }