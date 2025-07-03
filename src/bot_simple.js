/**
 * Упрощенная версия погодного бота для платформы MAX
 * Следует лучшим практикам из официальной документации @maxhub/max-bot-api
 */

require('dotenv').config();
const { Bot } = require('@maxhub/max-bot-api');
const { getWeatherInfo } = require('./weather');

console.log('🔧 Загрузка переменных окружения...');
console.log('Токен найден:', !!process.env.MAX_BOT_TOKEN);
console.log('OpenWeather API ключ найден:', !!process.env.OPENWEATHER_API_KEY);

if (!process.env.MAX_BOT_TOKEN) {
    console.error('❌ MAX_BOT_TOKEN не найден в переменных окружения');
    process.exit(1);
}

console.log('🤖 Создание экземпляра бота...');
// Создание экземпляра бота
const bot = new Bot(process.env.MAX_BOT_TOKEN);
console.log('✅ Экземпляр бота создан успешно');

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

// Обработчик события запуска бота
bot.on('bot_started', (ctx) => {
    console.log('🤖 Бот запущен и готов к работе!');
    const welcomeMessage = `🌤 Добро пожаловать в Weather Bot!\n\n` +
        `📋 ИНСТРУКЦИЯ:\n` +
        `• Отправьте название города для получения погоды\n` +
        `• Используйте команду /start для справки\n` +
        `• Используйте команду /weather [город] для прямого запроса\n\n` +
        `🌍 Примеры:\n` +
        `• Москва\n` +
        `• Санкт-Петербург\n` +
        `• London\n` +
        `• New York\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💼 Здесь может быть ваша реклама`;
    ctx.reply(welcomeMessage);
});

// Логирование всех входящих сообщений для отладки
bot.on('message', (ctx) => {
    console.log('📨 Получено сообщение:', {
        text: ctx.message?.body?.text || 'нет текста',
        from: ctx.message?.from?.username || 'неизвестный пользователь',
        timestamp: new Date().toLocaleString('ru-RU')
    });
});

// Обработчик команды /start
bot.command('start', (ctx) => {
    console.log('🚀 Команда /start вызвана');
    const welcomeMessage = `🌤️ Добро пожаловать в Weather Bot для MAX! 👋\n\n📍 Как пользоваться ботом:\n• Отправьте название города для получения прогноза погоды\n• Используйте команду /weather для справки\n• Поддерживаются города на русском и английском языках\n\n🌍 Примеры запросов:\n• "Москва"\n• "London"\n• "Санкт-Петербург"\n• "New York"\n\n🚀 Просто напишите название города и получите актуальную информацию о погоде!\n\n---\n📢 Здесь может быть ваша реклама`;
    
    ctx.reply(welcomeMessage);
});

// Обработчик команды /weather
bot.command('weather', async (ctx) => {
    console.log('🌤 Команда /weather вызвана');
    const commandText = ctx.message.body.text;
    const city = commandText.replace('/weather', '').trim();
    console.log('🏙️ Запрос погоды для города:', city);
    
    if (!city) {
        return ctx.reply('❌ Пожалуйста, укажите название города после команды.\n\nПример: /weather Москва');
    }
    
    try {
        const weatherInfo = await getWeatherInfo(city);
        console.log('✅ Погода получена успешно для:', city);
        ctx.reply(weatherInfo);
    } catch (error) {
        console.error(`❌ Ошибка получения погоды для ${city}:`, error.message);
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

// Обработчик для сообщения с текстом 'hello'
bot.hears('hello', (ctx) => {
    console.log('👋 Получено сообщение "hello"');
    ctx.reply('world');
});

// Обработчик для всех остальных входящих сообщений
bot.on('message_created', async (ctx) => {
    console.log('💬 Обработка сообщения в message_created');
    
    // Пропускаем команды
    if (ctx.message.body.text.startsWith('/')) {
        console.log('⏭️ Пропускаем команду:', ctx.message.body.text);
        return;
    }
    
    const city = ctx.message.body.text.trim();
    console.log('🏙️ Обработка города из сообщения:', city);
    
    if (!city) {
        console.log('❌ Пустое сообщение');
        return ctx.reply('❌ Пожалуйста, отправьте название города.');
    }
    
    try {
        console.log('🔍 Получение погоды для:', city);
        const weatherInfo = await getWeatherInfo(city);
        console.log('✅ Погода получена, отправляем ответ');
        ctx.reply(weatherInfo);
    } catch (error) {
        console.error(`❌ Ошибка получения погоды для ${city}:`, error.message);
        ctx.reply('❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.');
    }
});

// Обработчик ошибок
bot.catch((error) => {
    console.error('Ошибка бота:', error.message);
    console.error(error.stack);
});

// Добавляем логирование поллинга
bot.on('polling_start', () => {
    console.log('🔄 Поллинг запущен');
});

bot.on('polling_stop', () => {
    console.log('⏹️ Поллинг остановлен');
});

bot.on('polling_error', (error) => {
    console.error('❌ Ошибка поллинга:', error.message);
});

// Логирование каждого запроса поллинга
const originalFetch = global.fetch;
if (originalFetch) {
    global.fetch = async (...args) => {
        const url = args[0];
        if (typeof url === 'string' && url.includes('/messages')) {
            console.log('🔍 Поллинг запрос:', new Date().toLocaleTimeString('ru-RU'));
        }
        const response = await originalFetch(...args);
        if (typeof url === 'string' && url.includes('/messages')) {
            console.log('📥 Поллинг ответ:', response.status, 'в', new Date().toLocaleTimeString('ru-RU'));
        }
        return response;
    };
}

// Запуск бота
console.log('🚀 Запуск бота...');
try {
    bot.start();
    console.log('✅ Бот запущен успешно!');
    
    // Дополнительное логирование состояния
    setInterval(() => {
        console.log('⏰ Бот работает:', new Date().toLocaleTimeString('ru-RU'));
    }, 30000); // каждые 30 секунд
    
} catch (error) {
    console.error('❌ Ошибка запуска бота:', error.message);
    console.error(error.stack);
    process.exit(1);
}

module.exports = { bot };