/**
 * Минимальная версия погодного бота для платформы MAX
 * Упрощенная версия без избыточного логирования
 */

require('dotenv').config();
const { Bot } = require('@maxhub/max-bot-api');
const { getWeatherInfo } = require('./src/weather');

// Проверка наличия токена
if (!process.env.MAX_BOT_TOKEN) {
    console.error('❌ MAX_BOT_TOKEN не найден в переменных окружения');
    process.exit(1);
}

// Создание экземпляра бота
const bot = new Bot(process.env.MAX_BOT_TOKEN);

// Установка команд бота
bot.api.setMyCommands([
    {
        name: 'start',
        description: 'Начать работу с ботом'
    },
    {
        name: 'weather',
        description: 'Получить информацию о погоде в городе'
    }
]);

// Обработчик команды /start
bot.command('start', (ctx) => {
    const welcomeMessage = `🌤️ Добро пожаловать в Weather Bot! 👋\n\n` +
        `📍 Как пользоваться:\n` +
        `• Отправьте название города для получения прогноза погоды\n` +
        `• Используйте команду /weather [город] для прямого запроса\n\n` +
        `🌍 Примеры:\n` +
        `• Москва\n` +
        `• London\n` +
        `• Санкт-Петербург\n\n` +
        `🚀 Просто напишите название города!`;
    
    ctx.reply(welcomeMessage);
});

// Обработчик команды /weather
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
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

// Обработчик для всех остальных сообщений (названия городов)
bot.on('message_created', async (ctx) => {
    // Пропускаем команды
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
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

// Обработчик ошибок
bot.catch((error) => {
    console.error('Ошибка бота:', error.message);
});

// Запуск бота
console.log('🚀 Запуск погодного бота...');
try {
    bot.start();
    console.log('✅ Бот запущен успешно!');
} catch (error) {
    console.error('❌ Ошибка запуска бота:', error.message);
    process.exit(1);
}

module.exports = { bot };