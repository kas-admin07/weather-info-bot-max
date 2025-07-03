/**
 * Модуль конфигурации для MAX Weather Bot
 * Обеспечивает загрузку и валидацию переменных окружения
 */

const fs = require('fs');
const path = require('path');
const { errorHandler, ERROR_TYPES } = require('../utils/errorHandler');

/**
 * Класс для управления конфигурацией приложения
 */
class Config {
    constructor() {
        this.config = {};
        this.loadEnvironment();
        this.validateConfig();
    }

    /**
     * Загружает переменные окружения из .env файла
     */
    loadEnvironment() {
        try {
            const envPath = path.join(process.cwd(), '.env');
            
            if (!fs.existsSync(envPath)) {
                throw new Error('.env файл не найден в корневой директории проекта');
            }

            const envContent = fs.readFileSync(envPath, 'utf8');
            const envLines = envContent.split('\n');

            envLines.forEach((line, index) => {
                line = line.trim();
                
                // Пропускаем пустые строки и комментарии
                if (!line || line.startsWith('#')) {
                    return;
                }

                const equalIndex = line.indexOf('=');
                if (equalIndex === -1) {
                    errorHandler.warn(`Неверный формат строки ${index + 1} в .env файле: ${line}`);
                    return;
                }

                const key = line.substring(0, equalIndex).trim();
                let value = line.substring(equalIndex + 1).trim();

                // Удаляем кавычки если они есть
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                process.env[key] = value;
            });

            errorHandler.info('Переменные окружения успешно загружены из .env файла');
        } catch (error) {
            errorHandler.handleError(
                error,
                ERROR_TYPES.CONFIG_ERROR,
                { action: 'loadEnvironment' }
            );
            throw error;
        }
    }

    /**
     * Валидирует обязательные переменные окружения
     */
    validateConfig() {
        const requiredVars = [
            'MAX_BOT_TOKEN',
            'OPENWEATHER_API_KEY'
        ];

        const missingVars = [];
        const invalidVars = [];

        requiredVars.forEach(varName => {
            const value = process.env[varName];
            
            if (!value) {
                missingVars.push(varName);
            } else if (value.trim() === '') {
                invalidVars.push(varName);
            }
        });

        // Проверяем специфичные форматы
        if (process.env.MAX_BOT_TOKEN && !this.isValidBotToken(process.env.MAX_BOT_TOKEN)) {
            invalidVars.push('MAX_BOT_TOKEN (неверный формат)');
        }

        if (process.env.OPENWEATHER_API_KEY && !this.isValidApiKey(process.env.OPENWEATHER_API_KEY)) {
            invalidVars.push('OPENWEATHER_API_KEY (неверный формат)');
        }

        if (missingVars.length > 0 || invalidVars.length > 0) {
            let errorMessage = 'Ошибки конфигурации:';
            
            if (missingVars.length > 0) {
                errorMessage += `\n- Отсутствуют переменные: ${missingVars.join(', ')}`;
            }
            
            if (invalidVars.length > 0) {
                errorMessage += `\n- Неверные переменные: ${invalidVars.join(', ')}`;
            }

            errorHandler.handleError(
                errorMessage,
                ERROR_TYPES.CONFIG_ERROR,
                { missingVars, invalidVars }
            );
            throw new Error(errorMessage);
        }

        // Сохраняем валидированную конфигурацию
        this.config = {
            maxBotToken: process.env.MAX_BOT_TOKEN,
            openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
            maxApiUrl: process.env.MAX_API_URL || 'https://api.max.ai/v1',
            openWeatherApiUrl: process.env.OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
            pollInterval: parseInt(process.env.POLL_INTERVAL) || 2000,
            requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
            maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
            logLevel: process.env.LOG_LEVEL || 'INFO'
        };

        errorHandler.info('Конфигурация успешно валидирована', {
            pollInterval: this.config.pollInterval,
            requestTimeout: this.config.requestTimeout,
            maxRetries: this.config.maxRetries,
            logLevel: this.config.logLevel
        });
    }

    /**
     * Проверяет валидность токена бота
     * @param {string} token - Токен для проверки
     * @returns {boolean} Результат проверки
     */
    isValidBotToken(token) {
        // Базовая проверка формата токена
        return typeof token === 'string' && 
               token.length > 10 && 
               !token.includes(' ') &&
               token.trim() === token;
    }

    /**
     * Проверяет валидность API ключа
     * @param {string} apiKey - API ключ для проверки
     * @returns {boolean} Результат проверки
     */
    isValidApiKey(apiKey) {
        // Базовая проверка формата API ключа
        return typeof apiKey === 'string' && 
               apiKey.length >= 16 && 
               !apiKey.includes(' ') &&
               apiKey.trim() === apiKey;
    }

    /**
     * Получает значение конфигурации
     * @param {string} key - Ключ конфигурации
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*} Значение конфигурации
     */
    get(key, defaultValue = null) {
        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }

    /**
     * Получает всю конфигурацию
     * @returns {object} Объект конфигурации
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Проверяет готовность конфигурации
     * @returns {boolean} Готовность конфигурации
     */
    isReady() {
        return Object.keys(this.config).length > 0 &&
               this.config.maxBotToken &&
               this.config.openWeatherApiKey;
    }

    /**
     * Создает пример .env файла
     */
    static createExampleEnv() {
        const exampleContent = `# MAX Weather Bot Configuration
# Скопируйте этот файл как .env и заполните своими значениями

# Токен бота MAX AI
MAX_BOT_TOKEN=your_max_bot_token_here

# API ключ OpenWeatherMap
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Дополнительные настройки (опционально)
# MAX_API_URL=https://api.max.ai/v1
# OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5
# POLL_INTERVAL=2000
# REQUEST_TIMEOUT=10000
# MAX_RETRIES=3
# LOG_LEVEL=INFO
`;

        const examplePath = path.join(process.cwd(), '.env.example');
        fs.writeFileSync(examplePath, exampleContent);
        
        return examplePath;
    }
}

// Создаем и экспортируем экземпляр конфигурации
let config;

try {
    config = new Config();
} catch (error) {
    errorHandler.error('Критическая ошибка при инициализации конфигурации', {
        error: error.message
    });
    
    // Создаем пример .env файла для помощи пользователю
    try {
        const examplePath = Config.createExampleEnv();
        errorHandler.info(`Создан пример конфигурации: ${examplePath}`);
    } catch (exampleError) {
        errorHandler.error('Не удалось создать пример .env файла', {
            error: exampleError.message
        });
    }
    
    process.exit(1);
}

module.exports = {
    Config,
    config
};