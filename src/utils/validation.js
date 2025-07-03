/**
 * Модуль валидации для MAX Weather Bot
 * Обеспечивает проверку входных данных и безопасность
 */

const { VALIDATION, ERRORS } = require('../config/constants');
const logger = require('../config/logger');

class ValidationError extends Error {
    /**
     * Конструктор ошибки валидации
     * @param {string} message - Сообщение об ошибке
     * @param {string} code - Код ошибки
     */
    constructor(message, code = ERRORS.VALIDATION_ERROR) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
    }
}

class Validator {
    /**
     * Валидация названия города
     * @param {string} cityName - Название города для проверки
     * @returns {Object} Результат валидации
     * @throws {ValidationError} При некорректных данных
     */
    static validateCityName(cityName) {
        logger.debug('Валидация названия города', { cityName });
        
        // Проверка на существование
        if (!cityName) {
            throw new ValidationError('Название города не может быть пустым');
        }
        
        // Проверка типа данных
        if (typeof cityName !== 'string') {
            throw new ValidationError('Название города должно быть строкой');
        }
        
        // Удаление лишних пробелов
        const trimmedCity = cityName.trim();
        
        // Проверка длины
        if (trimmedCity.length < VALIDATION.MIN_CITY_LENGTH) {
            throw new ValidationError('Название города слишком короткое');
        }
        
        if (trimmedCity.length > VALIDATION.MAX_CITY_LENGTH) {
            throw new ValidationError('Название города слишком длинное');
        }
        
        // Проверка на запрещенные символы
        if (VALIDATION.FORBIDDEN_CHARS.test(trimmedCity)) {
            throw new ValidationError('Название города содержит недопустимые символы');
        }
        
        // Проверка на разрешенные символы
        if (!VALIDATION.ALLOWED_CHARS.test(trimmedCity)) {
            throw new ValidationError('Название города содержит недопустимые символы');
        }
        
        logger.debug('Валидация города успешна', { validatedCity: trimmedCity });
        
        return {
            isValid: true,
            sanitizedCity: trimmedCity,
            originalCity: cityName
        };
    }
    
    /**
     * Валидация сообщения от пользователя
     * @param {Object} message - Объект сообщения Telegram
     * @returns {Object} Результат валидации
     * @throws {ValidationError} При некорректных данных
     */
    static validateMessage(message) {
        logger.debug('Валидация сообщения', { messageId: message?.message_id });
        
        // Проверка существования сообщения
        if (!message) {
            throw new ValidationError('Сообщение не может быть пустым');
        }
        
        // Проверка наличия текста
        if (!message.text) {
            throw new ValidationError('Сообщение должно содержать текст');
        }
        
        // Проверка наличия пользователя
        if (!message.from) {
            throw new ValidationError('Сообщение должно содержать информацию об отправителе');
        }
        
        // Проверка наличия чата
        if (!message.chat) {
            throw new ValidationError('Сообщение должно содержать информацию о чате');
        }
        
        return {
            isValid: true,
            userId: message.from.id,
            chatId: message.chat.id,
            text: message.text.trim(),
            messageId: message.message_id
        };
    }
    
    /**
     * Валидация конфигурации бота
     * @param {Object} config - Конфигурация для проверки
     * @returns {Object} Результат валидации
     * @throws {ValidationError} При некорректной конфигурации
     */
    static validateBotConfig(config) {
        logger.debug('Валидация конфигурации бота');
        
        if (!config) {
            throw new ValidationError('Конфигурация не может быть пустой');
        }
        
        // Проверка токена бота
        if (!config.botToken) {
            throw new ValidationError('Токен бота обязателен');
        }
        
        if (typeof config.botToken !== 'string') {
            throw new ValidationError('Токен бота должен быть строкой');
        }
        
        // Проверка формата токена Telegram
        const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
        if (!tokenPattern.test(config.botToken)) {
            throw new ValidationError('Неверный формат токена бота');
        }
        
        // Проверка порта (если указан)
        if (config.port !== undefined) {
            const port = parseInt(config.port);
            if (isNaN(port) || port < 1 || port > 65535) {
                throw new ValidationError('Неверный номер порта');
            }
        }
        
        return {
            isValid: true,
            validatedConfig: {
                botToken: config.botToken,
                port: config.port || 3000
            }
        };
    }
    
    /**
     * Санитизация строки от потенциально опасных символов
     * @param {string} input - Входная строка
     * @returns {string} Очищенная строка
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        return input
            .trim()
            .replace(VALIDATION.FORBIDDEN_CHARS, '')
            .substring(0, VALIDATION.MAX_CITY_LENGTH);
    }
    
    /**
     * Проверка лимитов запросов
     * @param {number} requestCount - Количество запросов
     * @param {number} timeWindow - Временное окно в миллисекундах
     * @param {number} limit - Лимит запросов
     * @returns {boolean} Превышен ли лимит
     */
    static checkRateLimit(requestCount, timeWindow, limit) {
        const isLimitExceeded = requestCount > limit;
        
        if (isLimitExceeded) {
            logger.warning('Превышен лимит запросов', {
                requestCount,
                limit,
                timeWindow
            });
        }
        
        return isLimitExceeded;
    }
}

module.exports = {
    Validator,
    ValidationError
};