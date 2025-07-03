/**
 * Централизованная система логирования для MAX Weather Bot
 * Обеспечивает структурированное логирование с различными уровнями
 */

class Logger {
    /**
     * Конструктор логгера
     * Инициализирует уровень логирования из переменных окружения
     */
    constructor() {
        this.level = process.env.LOG_LEVEL || 'info';
        this.levels = {
            debug: 0,
            info: 1,
            warning: 2,
            error: 3
        };
    }
    
    /**
     * Логирование информационных сообщений
     * @param {string} message - Сообщение для логирования
     * @param {Object} meta - Дополнительные метаданные
     */
    info(message, meta = {}) {
        this._log('info', message, meta);
    }
    
    /**
     * Логирование ошибок
     * @param {string} message - Сообщение об ошибке
     * @param {Object} meta - Дополнительные метаданные
     */
    error(message, meta = {}) {
        this._log('error', message, meta);
    }
    
    /**
     * Логирование предупреждений
     * @param {string} message - Предупреждающее сообщение
     * @param {Object} meta - Дополнительные метаданные
     */
    warning(message, meta = {}) {
        this._log('warning', message, meta);
    }
    
    /**
     * Логирование отладочной информации
     * @param {string} message - Отладочное сообщение
     * @param {Object} meta - Дополнительные метаданные
     */
    debug(message, meta = {}) {
        if (this._shouldLog('debug')) {
            this._log('debug', message, meta);
        }
    }
    
    /**
     * Проверяет, нужно ли логировать сообщение данного уровня
     * @param {string} level - Уровень логирования
     * @returns {boolean} Нужно ли логировать
     */
    _shouldLog(level) {
        return this.levels[level] >= this.levels[this.level];
    }
    
    /**
     * Внутренний метод для записи лога
     * @param {string} level - Уровень логирования
     * @param {string} message - Сообщение
     * @param {Object} meta - Метаданные
     */
    _log(level, message, meta) {
        if (!this._shouldLog(level)) {
            return;
        }
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        };
        
        // Форматированный вывод в консоль
        const metaStr = Object.keys(meta).length > 0 ? 
            ` ${JSON.stringify(meta)}` : '';
        
        console.log(`[${logEntry.level}] ${timestamp} - ${message}${metaStr}`);
    }
    
    /**
     * Устанавливает новый уровень логирования
     * @param {string} level - Новый уровень (debug, info, warning, error)
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.level = level;
            this.info('Уровень логирования изменен', { newLevel: level });
        } else {
            this.warning('Неизвестный уровень логирования', { level });
        }
    }
    
    /**
     * Получает текущий уровень логирования
     * @returns {string} Текущий уровень
     */
    getLevel() {
        return this.level;
    }
}

// Экспортируем единственный экземпляр логгера (Singleton)
module.exports = new Logger();