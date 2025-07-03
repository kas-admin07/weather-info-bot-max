/**
 * Обработчик сообщений для MAX Weather Bot
 * Обрабатывает команды и текстовые сообщения пользователей
 */

const { getWeatherInfo } = require('../weather');
const logger = require('../config/logger');

/**
 * Обработка команды /weather
 * @param {Object} bot - Экземпляр бота
 * @param {Object} message - Объект сообщения
 */
async function processWeatherCommand(bot, message) {
    try {
        logger.info(`Обработка команды /weather от пользователя ${message.user_id}`);
        
        // Извлекаем название города из команды
        const city = message.text.replace('/weather', '').trim();
        
        if (!city) {
            // Если город не указан, отправляем инструкцию
            await bot.sendMessage(message.chat_id, 
                '🌤️ Укажите название города после команды /weather\n\n' +
                'Примеры:\n' +
                '• /weather Москва\n' +
                '• /weather London\n' +
                '• /weather Санкт-Петербург'
            );
            return;
        }
        
        // Отправляем сообщение о загрузке
        const loadingMessage = await bot.sendMessage(message.chat_id, 
            `🔄 Получение погоды для города ${city}...`
        );
        
        try {
            // Получаем информацию о погоде
            const weatherInfo = await getWeatherInfo(city);
            
            // Редактируем сообщение с результатом
            await bot.editMessage(message.chat_id, loadingMessage.message_id, weatherInfo);
            
            logger.info(`Успешно отправлена погода для города ${city}`);
            
        } catch (weatherError) {
            logger.error(`Ошибка получения погоды для ${city}: ${weatherError.message}`);
            
            // Редактируем сообщение с ошибкой
            await bot.editMessage(message.chat_id, loadingMessage.message_id, 
                `❌ Не удалось получить погоду для города "${city}".\n\n` +
                'Возможные причины:\n' +
                '• Неправильное название города\n' +
                '• Временные проблемы с сервисом\n\n' +
                'Попробуйте еще раз или укажите другой город.'
            );
        }
        
    } catch (error) {
        logger.error(`Ошибка обработки команды /weather: ${error.message}`);
        
        try {
            await bot.sendMessage(message.chat_id, 
                '❌ Произошла ошибка при обработке команды. Попробуйте позже.'
            );
        } catch (sendError) {
            logger.error(`Ошибка отправки сообщения об ошибке: ${sendError.message}`);
        }
    }
}

/**
 * Обработка текстовых сообщений
 * @param {Object} bot - Экземпляр бота
 * @param {Object} message - Объект сообщения
 */
async function processTextMessage(bot, message) {
    try {
        // Проверяем валидность сообщения
        if (!message || !message.text || typeof message.text !== 'string') {
            logger.warning('Получено невалидное сообщение');
            return;
        }
        
        const text = message.text.trim();
        
        // Игнорируем пустые сообщения
        if (text.length === 0) {
            return;
        }
        
        // Игнорируем команды (они обрабатываются отдельно)
        if (text.startsWith('/')) {
            return;
        }
        
        logger.info(`Обработка текстового сообщения от пользователя ${message.user_id}: "${text}"`);
        
        // Проверяем, похоже ли сообщение на запрос погоды
        const weatherKeywords = ['погода', 'weather', 'температура', 'градус', 'дождь', 'снег', 'солнце'];
        const isWeatherQuery = weatherKeywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Если это явно запрос погоды, обрабатываем как название города
        if (isWeatherQuery || text.length <= 50) {
            // Извлекаем возможное название города
            let city = text;
            
            // Убираем общие слова из запроса
            const wordsToRemove = ['погода', 'в', 'weather', 'in', 'какая', 'как', 'дела', 'температура'];
            wordsToRemove.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                city = city.replace(regex, '').trim();
            });
            
            // Убираем лишние пробелы и знаки препинания
            city = city.replace(/[?!.]+$/, '').trim();
            
            if (city.length > 0 && city.length <= 50) {
                // Отправляем сообщение о загрузке
                const loadingMessage = await bot.sendMessage(message.chat_id, 
                    `🔄 Получение погоды для: ${city}...`
                );
                
                try {
                    // Получаем информацию о погоде
                    const weatherInfo = await getWeatherInfo(city);
                    
                    // Редактируем сообщение с результатом
                    await bot.editMessage(message.chat_id, loadingMessage.message_id, weatherInfo);
                    
                    logger.info(`Успешно отправлена погода для текстового запроса: ${city}`);
                    
                } catch (weatherError) {
                    logger.error(`Ошибка получения погоды для текстового запроса ${city}: ${weatherError.message}`);
                    
                    // Редактируем сообщение с ошибкой
                    await bot.editMessage(message.chat_id, loadingMessage.message_id, 
                        `❌ Не удалось найти город "${city}".\n\n` +
                        '💡 Попробуйте:\n' +
                        '• Использовать команду /weather Название_города\n' +
                        '• Проверить правильность написания\n' +
                        '• Указать город на английском языке'
                    );
                }
            } else {
                // Если не удалось извлечь город, отправляем справку
                await bot.sendMessage(message.chat_id, 
                    '🌤️ Для получения погоды используйте:\n\n' +
                    '• Команду: /weather Название_города\n' +
                    '• Или просто напишите название города\n\n' +
                    'Примеры:\n' +
                    '• /weather Москва\n' +
                    '• Санкт-Петербург\n' +
                    '• London'
                );
            }
        } else {
            // Для других сообщений отправляем общую справку
            await bot.sendMessage(message.chat_id, 
                '👋 Привет! Я бот для получения информации о погоде.\n\n' +
                '🌤️ Чтобы узнать погоду, используйте:\n' +
                '• /weather Название_города\n' +
                '• Или просто напишите название города\n\n' +
                'Примеры:\n' +
                '• /weather Москва\n' +
                '• Лондон\n' +
                '• New York'
            );
        }
        
    } catch (error) {
        logger.error(`Ошибка обработки текстового сообщения: ${error.message}`);
        
        try {
            await bot.sendMessage(message.chat_id, 
                '❌ Произошла ошибка при обработке сообщения. Попробуйте позже.'
            );
        } catch (sendError) {
            logger.error(`Ошибка отправки сообщения об ошибке: ${sendError.message}`);
        }
    }
}

/**
 * Обработка неизвестных команд
 * @param {Object} bot - Экземпляр бота
 * @param {Object} message - Объект сообщения
 */
async function processUnknownCommand(bot, message) {
    try {
        logger.info(`Получена неизвестная команда: ${message.text}`);
        
        await bot.sendMessage(message.chat_id, 
            '❓ Неизвестная команда.\n\n' +
            '🌤️ Доступные команды:\n' +
            '• /weather - получить погоду для города\n\n' +
            'Или просто напишите название города для получения погоды.'
        );
        
    } catch (error) {
        logger.error(`Ошибка обработки неизвестной команды: ${error.message}`);
    }
}

module.exports = {
    processWeatherCommand,
    processTextMessage,
    processUnknownCommand
};