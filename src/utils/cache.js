/**
 * Модуль кэширования для MAX Weather Bot
 * Обеспечивает быстрое получение данных о погоде
 */

const { CACHE } = require('../config/constants');
const logger = require('../config/logger');

class Cache {
    /**
     * Конструктор кэша
     * Инициализирует внутреннее хранилище и настройки
     */
    constructor() {
        this.storage = new Map();
        this.defaultTTL = CACHE.DEFAULT_TTL;
        this.maxEntries = CACHE.MAX_ENTRIES;
        this.cleanupInterval = CACHE.CLEANUP_INTERVAL;
        
        // Запуск автоматической очистки
        this.startCleanupTimer();
        
        logger.info('Кэш инициализирован', {
            defaultTTL: this.defaultTTL,
            maxEntries: this.maxEntries
        });
    }
    
    /**
     * Сохранение данных в кэш
     * @param {string} key - Ключ для сохранения
     * @param {*} value - Значение для сохранения
     * @param {number} ttl - Время жизни в миллисекундах (опционально)
     */
    set(key, value, ttl = this.defaultTTL) {
        if (!key || typeof key !== 'string') {
            logger.warning('Некорректный ключ для кэша', { key });
            return false;
        }
        
        // Проверка лимита записей
        if (this.storage.size >= this.maxEntries && !this.storage.has(key)) {
            this.evictOldest();
        }
        
        const expiresAt = Date.now() + ttl;
        const cacheEntry = {
            value,
            expiresAt,
            createdAt: Date.now(),
            accessCount: 0
        };
        
        this.storage.set(key, cacheEntry);
        
        logger.debug('Данные сохранены в кэш', {
            key,
            ttl,
            expiresAt: new Date(expiresAt).toISOString()
        });
        
        return true;
    }
    
    /**
     * Получение данных из кэша
     * @param {string} key - Ключ для поиска
     * @returns {*} Значение из кэша или null если не найдено/истекло
     */
    get(key) {
        if (!key || typeof key !== 'string') {
            return null;
        }
        
        const entry = this.storage.get(key);
        
        if (!entry) {
            logger.debug('Ключ не найден в кэше', { key });
            return null;
        }
        
        // Проверка истечения времени жизни
        if (Date.now() > entry.expiresAt) {
            this.storage.delete(key);
            logger.debug('Запись в кэше истекла', { key });
            return null;
        }
        
        // Увеличение счетчика обращений
        entry.accessCount++;
        
        logger.debug('Данные получены из кэша', {
            key,
            accessCount: entry.accessCount
        });
        
        return entry.value;
    }
    
    /**
     * Проверка существования ключа в кэше
     * @param {string} key - Ключ для проверки
     * @returns {boolean} Существует ли ключ
     */
    has(key) {
        if (!key || typeof key !== 'string') {
            return false;
        }
        
        const entry = this.storage.get(key);
        
        if (!entry) {
            return false;
        }
        
        // Проверка истечения времени
        if (Date.now() > entry.expiresAt) {
            this.storage.delete(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Удаление записи из кэша
     * @param {string} key - Ключ для удаления
     * @returns {boolean} Успешно ли удалено
     */
    delete(key) {
        const deleted = this.storage.delete(key);
        
        if (deleted) {
            logger.debug('Запись удалена из кэша', { key });
        }
        
        return deleted;
    }
    
    /**
     * Очистка всего кэша
     */
    clear() {
        const size = this.storage.size;
        this.storage.clear();
        
        logger.info('Кэш полностью очищен', { deletedEntries: size });
    }
    
    /**
     * Получение статистики кэша
     * @returns {Object} Статистика использования кэша
     */
    getStats() {
        const entries = Array.from(this.storage.values());
        const now = Date.now();
        
        const stats = {
            totalEntries: this.storage.size,
            maxEntries: this.maxEntries,
            expiredEntries: 0,
            totalAccessCount: 0,
            averageAge: 0
        };
        
        let totalAge = 0;
        
        entries.forEach(entry => {
            if (now > entry.expiresAt) {
                stats.expiredEntries++;
            }
            stats.totalAccessCount += entry.accessCount;
            totalAge += (now - entry.createdAt);
        });
        
        if (entries.length > 0) {
            stats.averageAge = Math.round(totalAge / entries.length);
        }
        
        return stats;
    }
    
    /**
     * Удаление самой старой записи (LRU)
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, entry] of this.storage.entries()) {
            if (entry.createdAt < oldestTime) {
                oldestTime = entry.createdAt;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.storage.delete(oldestKey);
            logger.debug('Удалена самая старая запись из кэша', { key: oldestKey });
        }
    }
    
    /**
     * Очистка истекших записей
     */
    cleanup() {
        const now = Date.now();
        let deletedCount = 0;
        
        for (const [key, entry] of this.storage.entries()) {
            if (now > entry.expiresAt) {
                this.storage.delete(key);
                deletedCount++;
            }
        }
        
        if (deletedCount > 0) {
            logger.info('Очистка истекших записей кэша', { deletedCount });
        }
        
        return deletedCount;
    }
    
    /**
     * Запуск таймера автоматической очистки
     */
    startCleanupTimer() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
        
        logger.debug('Таймер очистки кэша запущен', {
            interval: this.cleanupInterval
        });
    }
    
    /**
     * Генерация ключа кэша для города
     * @param {string} cityName - Название города
     * @returns {string} Ключ кэша
     */
    static generateCityKey(cityName) {
        return `weather:${cityName.toLowerCase().trim()}`;
    }
}

// Экспортируем единственный экземпляр кэша (Singleton)
module.exports = new Cache();