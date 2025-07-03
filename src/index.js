/**
 * MAX Weather Bot - Официальная реализация с @maxhub/max-bot-api
 * Поддерживает команды и получение погоды по названию города
 * Автор: MAX Bot Team
 */

const { Bot } = require('@maxhub/max-bot-api');
const https = require('https');
const { errorHandler, withRetry, ERROR_TYPES } = require('./utils/errorHandler');
const { config } = require('./config/config');

// Проверяем готовность конфигурации
if (!config.isReady()) {
    errorHandler.error('Конфигурация не готова к работе');
    process.exit(1);
}

const WEATHER_API_KEY = config.get('openWeatherApiKey');
const BOT_TOKEN = config.get('maxBotToken');

// Создание экземпляра бота
const bot = new Bot(BOT_TOKEN);

/**
 * Выполняет HTTP запрос для получения погоды
 * @param {string} url - URL для запроса
 * @returns {Promise<object>} Данные о погоде
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error(`Ошибка парсинга JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Получает информацию о погоде для указанного города
 * @param {string} city - Название города
 * @returns {Promise<string>} Информация о погоде
 */
async function getWeather(city) {
    try {
        if (!WEATHER_API_KEY) {
            throw new Error('WEATHER_API_KEY не найден в конфигурации');
        }
        
        const baseUrl = config.get('openWeatherApiUrl', 'https://api.openweathermap.org/data/2.5');
        const url = `${baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=ru`;
        
        errorHandler.info(`Запрашиваю погоду для города: ${city}`);
        
        const weatherData = await makeRequest(url);
        
        if (weatherData.cod && weatherData.cod !== 200) {
            if (weatherData.cod === '404') {
                errorHandler.warn(`Город не найден: ${city}`);
                return `❌ Город "${city}" не найден. Проверьте правильность написания.`;
            }
            throw new Error(`Ошибка API погоды (${weatherData.cod}): ${weatherData.message}`);
        }
        
        const temp = Math.round(weatherData.main.temp);
        const feelsLike = Math.round(weatherData.main.feels_like);
        const description = weatherData.weather[0].description;
        const humidity = weatherData.main.humidity;
        const pressure = weatherData.main.pressure;
        const windSpeed = weatherData.wind?.speed || 0;
        
        const weatherInfo = `🌍 Погода в городе ${weatherData.name}:\n` +
                          `🌡️ Температура: ${temp}°C (ощущается как ${feelsLike}°C)\n` +
                          `☁️ Описание: ${description}\n` +
                          `💧 Влажность: ${humidity}%\n` +
                          `🔽 Давление: ${pressure} гПа\n` +
                          `💨 Скорость ветра: ${windSpeed} м/с`;
        
        errorHandler.info(`Погода успешно получена для города: ${city}`);
        return weatherInfo;
        
    } catch (error) {
        errorHandler.handleError(
            error,
            ERROR_TYPES.WEATHER_API_ERROR,
            { city, action: 'getWeather' }
        );
        
        if (error.message.includes('city not found') || error.message.includes('404')) {
            return `❌ Город "${city}" не найден. Проверьте правильность написания.`;
        }
        
        if (error.message.includes('timeout') || error.message.includes('ENOTFOUND')) {
            return `❌ Проблемы с подключением к сервису погоды. Попробуйте позже.`;
        }
        
        return `❌ Не удалось получить информацию о погоде для города "${city}". Попробуйте позже.`;
    }
}

/**
 * Обработчик команды /start
 * Отправляет приветственное сообщение с инструкциями
 */
async function start_handler(context) {
    const welcomeText = `👋 Добро пожаловать в Weather Bot!\n\n` +
        `🌤 Просто отправьте название города, и я покажу текущую погоду.\n\n` +
        `Примеры:\n` +
        `• Москва\n` +
        `• Санкт-Петербург\n` +
        `• London\n` +
        `• New York\n\n` +
        `Также доступна команда /weather <город> для быстрого запроса.`;
    
    await context.reply(welcomeText);
    errorHandler.info('Команда /start выполнена', { userId: context.from?.id });
}
bot.command('start', start_handler);

/**
 * Обработчик команды /weather
 * Получает погоду для указанного города
 */
async function weather_handler(context) {
    const args = context.text.split(' ').slice(1); // Убираем /weather
    const city = args.join(' ').trim();
    
    if (!city) {
        await context.reply('❌ Укажите название города. Например: /weather Москва');
        return;
    }
    
    errorHandler.info(`Команда /weather для города: ${city}`, { userId: context.from?.id });
    
    const weatherInfo = await getWeather(city);
    await context.reply(weatherInfo);
}
bot.command('weather', weather_handler);

/**
 * Обработчик текстовых сообщений
 * Обрабатывает названия городов как запросы погоды
 */
async function message_handler(context) {
    const messageText = context.text?.trim();
    
    if (!messageText) {
        return;
    }
    
    // Игнорируем команды - они обрабатываются отдельно
    if (messageText.startsWith('/')) {
        return;
    }
    
    const userName = context.from?.name || context.from?.username || 'Неизвестный';
    errorHandler.info(`Получено сообщение от ${userName}: ${messageText}`);
    
    // Расширенный список городов с различными вариантами написания
    const cityPatterns = {
        'москва': ['москва', 'moscow', 'мск'],
        'санкт-петербург': ['спб', 'санкт-петербург', 'петербург', 'питер', 'saint petersburg', 'st petersburg'],
        'екатеринбург': ['екатеринбург', 'екб', 'yekaterinburg'],
        'новосибирск': ['новосибирск', 'новосиб', 'novosibirsk'],
        'казань': ['казань', 'kazan'],
        'нижний новгород': ['нижний новгород', 'нижний', 'nizhny novgorod'],
        'челябинск': ['челябинск', 'челяба', 'chelyabinsk'],
        'самара': ['самара', 'samara'],
        'омск': ['омск', 'omsk'],
        'ростов-на-дону': ['ростов-на-дону', 'ростов', 'rostov'],
        'уфа': ['уфа', 'ufa'],
        'красноярск': ['красноярск', 'krasnoyarsk'],
        'воронеж': ['воронеж', 'voronezh'],
        'пермь': ['пермь', 'perm']
    };
    
    const normalizedText = messageText.toLowerCase();
    let cityFound = null;
    
    // Ищем совпадения с городами
    for (const [standardName, patterns] of Object.entries(cityPatterns)) {
        for (const pattern of patterns) {
            if (normalizedText.includes(pattern)) {
                cityFound = standardName;
                break;
            }
        }
        if (cityFound) break;
    }
    
    if (cityFound) {
        errorHandler.info(`Обрабатываю запрос погоды для города: ${cityFound}`);
        const weatherInfo = await getWeather(cityFound);
        await context.reply(weatherInfo);
    } else {
        // Если город не найден в списке, пробуем использовать весь текст как название города
        errorHandler.info(`Пробую запросить погоду для: ${messageText}`);
        const weatherInfo = await getWeather(messageText);
        
        // Если запрос не удался, отправляем справочное сообщение
        if (weatherInfo.includes('❌')) {
            const helpMessage = `👋 Привет! Я бот для получения информации о погоде.\n\n` +
                              `Просто напишите название города, и я расскажу вам о текущей погоде.\n\n` +
                              `Например: "Москва", "Санкт-Петербург", "Екатеринбург"\n\n` +
                              `🌤️ Поддерживаемые города: Москва, СПб, Екатеринбург, Новосибирск, Казань и многие другие!\n\n` +
                              `Также можете использовать команды:\n` +
                              `• /start - показать это сообщение\n` +
                              `• /weather <город> - получить погоду`;
            
            await context.reply(helpMessage);
        } else {
            await context.reply(weatherInfo);
        }
    }
}
bot.on('message_created', message_handler);

/**
 * Обработчик события запуска бота
 * Отправляет уведомление о готовности
 */
async function bot_started_handler(ctx) {
    errorHandler.info('MAX Weather Bot запущен и готов к работе');
    console.log('🔄 Бот запущен и ожидает сообщения...');
    console.log('💡 Отправьте боту название города для получения погоды');
    console.log('⏹  Нажмите Ctrl+C для остановки\n');
}
bot.on('bot_started', bot_started_handler);

/**
 * Запускает бота
 */
async function startBot() {
    try {
        errorHandler.info('Запуск MAX Weather Bot');
        console.log('═'.repeat(40));
        console.log('🔧 Запуск MAX Weather Bot');
        
        // Проверяем токен
        console.log('🔑 Проверка токена...');
        if (!BOT_TOKEN) {
            throw new Error('Токен бота не найден!');
        }
        console.log('✅ Токен найден:', BOT_TOKEN.substring(0, 10) + '...');
        
        // Настраиваем обработчики сигналов
        process.on('SIGINT', () => {
            console.log('\n🛑 Получен сигнал остановки...');
            console.log('✅ Бот остановлен');
            process.exit(0);
        });
        
        console.log('🚀 Инициализация бота...');
        // Запускаем бота
        await bot.start();
        console.log('✅ Бот успешно запущен!');
        
    } catch (error) {
        errorHandler.handleError(
            error,
            ERROR_TYPES.BOT_STARTUP_ERROR,
            { action: 'startBot' }
        );
        console.error('💥 Критическая ошибка:', error);
        process.exit(1);
    }
}

// Запускаем бота
startBot().catch(error => {
    console.error('Критическая ошибка при запуске:', error);
    process.exit(1);
});

module.exports = {
    startBot,
    getWeather
};