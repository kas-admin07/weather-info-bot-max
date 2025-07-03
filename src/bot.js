/**
 * Главный модуль погодного бота для платформы MAX
 * Использует официальную библиотеку @maxhub/max-bot-api
 */

require('dotenv').config();
const { Bot } = require('@maxhub/max-bot-api');
const { getWeatherInfo } = require('./weather');

// Настройка логирования
const logger = {
    info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
    warning: (msg) => console.warn(`[WARNING] ${new Date().toISOString()} - ${msg}`),
    debug: (msg) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`)
};

// Получение токена из переменных окружения
const BOT_TOKEN = process.env.MAX_BOT_TOKEN;

if (!BOT_TOKEN) {
    logger.error('MAX_BOT_TOKEN не найден в переменных окружения');
    process.exit(1);
}

// Создание экземпляра бота
const bot = new Bot(BOT_TOKEN);

/**
 * Настройка команд бота
 */
async function setupCommands() {
    try {
        await bot.api.setMyCommands([
            {
                name: 'start',
                description: 'Начать работу с ботом'
            },
            {
                name: 'weather',
                description: 'Получить информацию о погоде в городе'
            }
        ]);
        logger.info('Команды бота успешно настроены');
    } catch (error) {
        logger.error(`Ошибка настройки команд: ${error.message}`);
    }
}

/**
 * Обработчик события запуска бота
 */
bot.on('bot_started', (ctx) => {
    console.log('🤖 Бот запущен и готов к работе!');
    ctx.reply('🌤 Привет! Я погодный бот.\n\nОтправьте мне название города, и я покажу текущую погоду.\n\nПример: "Москва" или "/weather Санкт-Петербург"');
});

/**
 * Обработчик команды /start
 */
bot.command('start', (ctx) => {
    const welcomeMessage = `👋 Добро пожаловать в Weather Bot!\n\n` +
        `🌤 Просто отправьте название города, и я покажу текущую погоду.\n\n` +
        `Примеры:\n` +
        `• Москва\n` +
        `• Санкт-Петербург\n` +
        `• London\n` +
        `• New York\n\n` +
        `Или используйте команду: /weather Название_города`;
    
    ctx.reply(welcomeMessage);
});

/**
 * Обработчик команды /weather
 */
bot.command('weather', async (ctx) => {
    const commandText = ctx.message.body.text;
    const city = commandText.replace('/weather', '').trim();
    
    if (!city) {
        return ctx.reply('❌ Пожалуйста, укажите название города после команды.\n\nПример: /weather Москва');
    }
    
    try {
        const weatherInfo = await getWeatherInfo(city);
        ctx.reply(weatherInfo);
    } catch (error) {
        console.error(`Ошибка получения погоды для ${city}:`, error.message);
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

/**
 * Обработчик всех текстовых сообщений
 */
bot.on('message_created', async (ctx) => {
    // Пропускаем команды, они обрабатываются отдельно
    if (ctx.message.body.text.startsWith('/')) {
        return;
    }
    
    const city = ctx.message.body.text.trim();
    
    if (!city) {
        return ctx.reply('❌ Пожалуйста, отправьте название города.');
    }
    
    try {
        const weatherInfo = await getWeatherInfo(city);
        ctx.reply(weatherInfo);
    } catch (error) {
        console.error(`Ошибка получения погоды для ${city}:`, error.message);
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

/**
 * Обработчик ошибок
 */
bot.catch((error) => {
    logger.error(`Необработанная ошибка бота: ${error.message}`);
    logger.error(error.stack);
});

/**
 * Запуск бота
 */
async function startBot() {
    console.log('🤖 Запуск бота...');
    console.log('Токен найден:', !!process.env.MAX_BOT_TOKEN);
    
    // Устанавливаем таймаут на запуск
    const startTimeout = setTimeout(() => {
        console.log('⏰ Таймаут запуска бота (15 секунд). Возможно проблема с подключением к MAX API.');
        process.exit(1);
    }, 15000);
    
    try {
        console.log('Попытка подключения к MAX API...');
        await bot.start();
        clearTimeout(startTimeout);
        console.log('✅ Бот успешно запущен!');
        
        console.log('Настройка команд...');
        await setupCommands();
        console.log('✅ Команды настроены. Бот готов к работе!');
        
        // Добавляем обработчик для предотвращения завершения процесса
        process.on('SIGINT', () => {
            logger.info('Получен сигнал SIGINT, завершение работы бота...');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            logger.info('Получен сигнал SIGTERM, завершение работы бота...');
            process.exit(0);
        });
        
    } catch (error) {
        clearTimeout(startTimeout);
        console.error('❌ Ошибка при запуске бота:', error.message);
        console.error('Детали ошибки:', error);
        console.log('🔄 Попытка перезапуска через 5 секунд...');
        setTimeout(startBot, 5000);
    }
}

// Запуск бота если файл запущен напрямую
if (require.main === module) {
    startBot();
}

module.exports = { bot, startBot };