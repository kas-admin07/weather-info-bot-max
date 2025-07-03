/**
 * Константы приложения MAX Weather Bot
 * Централизованное хранение всех констант проекта
 */

module.exports = {
    // Настройки API погоды
    WEATHER: {
        API_URL: 'https://wttr.in',
        TIMEOUT: 10000, // 10 секунд
        CACHE_TTL: 300000, // 5 минут в миллисекундах
        MAX_CITY_LENGTH: 100,
        DEFAULT_PARAMS: {
            format: '3',
            lang: 'ru',
            M: '' // Метрическая система
        },
        USER_AGENT: 'MAX Weather Bot v1.0'
    },
    
    // Настройки бота
    BOT: {
        MAX_MESSAGE_LENGTH: 4096,
        TYPING_DELAY: 1000, // 1 секунда
        MAX_RETRIES: 3,
        RETRY_DELAY: 2000 // 2 секунды
    },
    
    // Коды ошибок
    ERRORS: {
        CITY_NOT_FOUND: 'CITY_NOT_FOUND',
        API_TIMEOUT: 'API_TIMEOUT',
        NETWORK_ERROR: 'NETWORK_ERROR',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        RATE_LIMIT: 'RATE_LIMIT',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    },
    
    // Сообщения для пользователей
    MESSAGES: {
        WELCOME: '👋 Привет! Я бот погоды. Отправь мне название города, и я расскажу о погоде.',
        HELP: '🌤️ Просто отправь мне название города, например: "Москва" или "London"',
        CITY_NOT_FOUND: '❌ Город не найден. Проверьте правильность написания.',
        TIMEOUT: '❌ Превышено время ожидания. Попробуйте позже.',
        NETWORK_ERROR: '❌ Проблемы с подключением к сервису погоды. Попробуйте позже.',
        VALIDATION_ERROR: '❌ Некорректное название города.',
        GENERAL_ERROR: '❌ Ошибка при получении данных о погоде. Попробуйте позже.',
        TYPING: '⌨️ Получаю данные о погоде...'
    },
    
    // Настройки кэширования
    CACHE: {
        DEFAULT_TTL: 300000, // 5 минут
        MAX_ENTRIES: 1000,
        CLEANUP_INTERVAL: 600000 // 10 минут
    },
    
    // Настройки валидации
    VALIDATION: {
        MIN_CITY_LENGTH: 1,
        MAX_CITY_LENGTH: 100,
        FORBIDDEN_CHARS: /[<>"'&]/g,
        ALLOWED_CHARS: /^[a-zA-Zа-яА-Я0-9\s\-.,]+$/
    },
    
    // HTTP статус коды
    HTTP_STATUS: {
        OK: 200,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        TIMEOUT: 408,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },
    
    // Эмодзи для погодных условий
    WEATHER_EMOJI: {
        SUNNY: '☀️',
        CLOUDY: '☁️',
        RAINY: '🌧️',
        SNOWY: '❄️',
        STORMY: '⛈️',
        FOGGY: '🌫️',
        WINDY: '💨',
        HOT: '🔥',
        COLD: '🧊'
    },
    
    // Настройки окружения
    ENV: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    },
    
    // Лимиты производительности
    PERFORMANCE: {
        MAX_CONCURRENT_REQUESTS: 10,
        REQUEST_QUEUE_SIZE: 100,
        MEMORY_LIMIT_MB: 512
    }
};