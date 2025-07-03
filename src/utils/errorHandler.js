/**
 * Централизованная система обработки ошибок для MAX Weather Bot
 * Обеспечивает единообразную обработку ошибок и логирование
 */

const fs = require('fs');
const path = require('path');

/**
 * Типы ошибок в системе
 */
const ERROR_TYPES = {
    API_ERROR: 'API_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    CONFIG_ERROR: 'CONFIG_ERROR',
    WEATHER_API_ERROR: 'WEATHER_API_ERROR',
    BOT_API_ERROR: 'BOT_API_ERROR'
};

/**
 * Уровни логирования
 */
const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

/**
 * Класс для централизованной обработки ошибок
 */
class ErrorHandler {
    constructor() {
        this.logFile = path.join(process.cwd(), 'logs', 'bot.log');
        this.errorFile = path.join(process.cwd(), 'logs', 'errors.log');
        this.ensureLogDirectory();
    }

    /**
     * Создает директорию для логов если она не существует
     */
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    /**
     * Форматирует сообщение для логирования
     * @param {string} level - Уровень логирования
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     * @returns {string} Отформатированное сообщение
     */
    formatLogMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaStr = Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
    }

    /**
     * Записывает лог в файл
     * @param {string} level - Уровень логирования
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     * @param {boolean} isError - Является ли это ошибкой
     */
    writeLog(level, message, meta = {}, isError = false) {
        const logMessage = this.formatLogMessage(level, message, meta);
        
        // Записываем в основной лог
        fs.appendFileSync(this.logFile, logMessage);
        
        // Если это ошибка, записываем также в файл ошибок
        if (isError) {
            fs.appendFileSync(this.errorFile, logMessage);
        }
        
        // Выводим в консоль с цветовой индикацией
        this.consoleLog(level, message, meta);
    }

    /**
     * Выводит лог в консоль с цветовой индикацией
     * @param {string} level - Уровень логирования
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     */
    consoleLog(level, message, meta) {
        const timestamp = new Date().toLocaleString('ru-RU');
        const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
        
        switch (level) {
            case LOG_LEVELS.ERROR:
                console.error(`❌ [${timestamp}] ${message}${metaStr}`);
                break;
            case LOG_LEVELS.WARN:
                console.warn(`⚠️  [${timestamp}] ${message}${metaStr}`);
                break;
            case LOG_LEVELS.INFO:
                console.log(`ℹ️  [${timestamp}] ${message}${metaStr}`);
                break;
            case LOG_LEVELS.DEBUG:
                console.log(`🔍 [${timestamp}] ${message}${metaStr}`);
                break;
            default:
                console.log(`📝 [${timestamp}] ${message}${metaStr}`);
        }
    }

    /**
     * Обрабатывает ошибку и логирует её
     * @param {Error|string} error - Ошибка или сообщение об ошибке
     * @param {string} type - Тип ошибки
     * @param {object} context - Контекст ошибки
     * @returns {object} Стандартизированный объект ошибки
     */
    handleError(error, type = ERROR_TYPES.API_ERROR, context = {}) {
        const errorObj = {
            type,
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : null,
            context,
            timestamp: new Date().toISOString()
        };

        this.writeLog(
            LOG_LEVELS.ERROR,
            `${type}: ${errorObj.message}`,
            { context, stack: errorObj.stack },
            true
        );

        return errorObj;
    }

    /**
     * Логирует информационное сообщение
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     */
    info(message, meta = {}) {
        this.writeLog(LOG_LEVELS.INFO, message, meta);
    }

    /**
     * Логирует предупреждение
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     */
    warn(message, meta = {}) {
        this.writeLog(LOG_LEVELS.WARN, message, meta);
    }

    /**
     * Логирует отладочную информацию
     * @param {string} message - Сообщение
     * @param {object} meta - Дополнительные данные
     */
    debug(message, meta = {}) {
        this.writeLog(LOG_LEVELS.DEBUG, message, meta);
    }

    /**
     * Логирует ошибку
     * @param {Error|string} error - Ошибка
     * @param {object} meta - Дополнительные данные
     */
    error(error, meta = {}) {
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : null;
        this.writeLog(LOG_LEVELS.ERROR, message, { ...meta, stack }, true);
    }
}

/**
 * Создает retry механизм для функций
 * @param {Function} fn - Функция для выполнения
 * @param {number} maxRetries - Максимальное количество попыток
 * @param {number} delay - Задержка между попытками (мс)
 * @param {ErrorHandler} errorHandler - Обработчик ошибок
 * @returns {Function} Функция с retry механизмом
 */
function withRetry(fn, maxRetries = 3, delay = 1000, errorHandler = null) {
    return async function(...args) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                lastError = error;
                
                if (errorHandler) {
                    errorHandler.warn(`Попытка ${attempt}/${maxRetries} неудачна`, {
                        error: error.message,
                        function: fn.name
                    });
                }
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                } else {
                    if (errorHandler) {
                        errorHandler.handleError(
                            `Все ${maxRetries} попыток исчерпаны: ${error.message}`,
                            ERROR_TYPES.API_ERROR,
                            { function: fn.name, attempts: maxRetries }
                        );
                    }
                    throw lastError;
                }
            }
        }
    };
}

// Создаем глобальный экземпляр обработчика ошибок
const errorHandler = new ErrorHandler();

module.exports = {
    ErrorHandler,
    errorHandler,
    withRetry,
    ERROR_TYPES,
    LOG_LEVELS
};