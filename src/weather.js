/**
 * Модуль для получения информации о погоде
 * Использует OpenWeatherMap API для получения данных о погоде
 */

const axios = require('axios');

/**
 * Получение информации о погоде для указанного города
 * @param {string} city - Название города
 * @returns {Promise<string>} Форматированная информация о погоде
 */
async function getWeatherInfo(city) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENWEATHER_API_KEY не найден в переменных окружения');
        }

        // Получение текущей погоды
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
        const currentResponse = await axios.get(currentWeatherUrl, { timeout: 10000 });
        const current = currentResponse.data;

        // Получение прогноза на 5 дней
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
        const forecastResponse = await axios.get(forecastUrl, { timeout: 10000 });
        const forecast = forecastResponse.data;

        return formatWeatherMessage(current, forecast);
    } catch (error) {
        console.error('Ошибка получения погоды:', error.message);
        
        if (error.response?.status === 404) {
            return `❌ Город "${city}" не найден. Проверьте правильность написания.`;
        }
        
        if (error.response?.status === 401) {
            return '❌ Ошибка авторизации API. Проверьте ключ OpenWeatherMap.';
        }
        
        if (error.code === 'ECONNABORTED') {
            return '❌ Превышено время ожидания. Попробуйте позже.';
        }
        
        return '❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.';
    }
}

/**
 * Форматирование сообщения с информацией о погоде
 * @param {Object} current - Текущая погода
 * @param {Object} forecast - Прогноз погоды
 * @returns {string} Форматированное сообщение
 */
function formatWeatherMessage(current, forecast) {
    const cityName = current.name;
    const country = current.sys.country;
    const temp = Math.round(current.main.temp);
    const feelsLike = Math.round(current.main.feels_like);
    const description = current.weather[0].description;
    const humidity = current.main.humidity;
    const pressure = current.main.pressure;
    const windSpeed = current.wind.speed;
    const windDirection = getWindDirection(current.wind.deg);
    const visibility = current.visibility ? Math.round(current.visibility / 1000) : 'н/д';
    const cloudiness = current.clouds.all;
    
    // Определение иконки погоды
    const weatherIcon = getWeatherIcon(current.weather[0].icon);
    
    // Время восхода и заката
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
    });
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Moscow'
    });

    // Прогноз на ближайшие дни
    const dailyForecast = getDailyForecast(forecast.list);
    
    let message = `${weatherIcon} **Погода в ${cityName}, ${country}**\n\n`;
    message += `🌡️ **Температура:** ${temp}°C (ощущается как ${feelsLike}°C)\n`;
    message += `☁️ **Описание:** ${description}\n`;
    message += `💧 **Влажность:** ${humidity}%\n`;
    message += `🌪️ **Давление:** ${pressure} гПа\n`;
    message += `💨 **Ветер:** ${windSpeed} м/с, ${windDirection}\n`;
    message += `👁️ **Видимость:** ${visibility} км\n`;
    message += `☁️ **Облачность:** ${cloudiness}%\n`;
    message += `🌅 **Восход:** ${sunrise}\n`;
    message += `🌇 **Закат:** ${sunset}\n\n`;
    
    message += `📅 **Прогноз на ближайшие дни:**\n${dailyForecast}\n`;
    message += `\n📱 Здесь может быть ваша реклама t․me/kas_admin`;
    
    return message;
}

/**
 * Получение детальной информации о погоде
 * @param {string} city - Название города
 * @returns {Promise<string>} Детальная информация о погоде
 */
async function getDetailedWeather(city) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENWEATHER_API_KEY не найден в переменных окружения');
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ru`;
        const response = await axios.get(url, { timeout: 10000 });
        const data = response.data;

        const cityName = data.name;
        const country = data.sys.country;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const pressure = data.main.pressure;
        const windSpeed = data.wind.speed;
        const windDirection = getWindDirection(data.wind.deg);
        const weatherIcon = getWeatherIcon(data.weather[0].icon);
        
        let message = `${weatherIcon} **Погода в ${cityName}, ${country}**\n\n`;
        message += `🌡️ **Температура:** ${temp}°C\n`;
        message += `🤔 **Ощущается как:** ${feelsLike}°C\n`;
        message += `☁️ **Описание:** ${description}\n`;
        message += `💧 **Влажность:** ${humidity}%\n`;
        message += `🌪️ **Давление:** ${pressure} гПа\n`;
        message += `💨 **Ветер:** ${windSpeed} м/с ${windDirection}\n\n`;
        message += `📱 Здесь может быть ваша реклама t․me/kas_admin`;
        
        return message;
    } catch (error) {
        console.error('Ошибка получения детальной погоды:', error.message);
        
        if (error.response?.status === 404) {
            return `❌ Город "${city}" не найден. Проверьте правильность написания.`;
        }
        
        return '❌ Произошла ошибка при получении данных о погоде. Попробуйте позже.';
    }
}

/**
 * Получение иконки погоды по коду
 * @param {string} iconCode - Код иконки от OpenWeatherMap
 * @returns {string} Эмодзи иконка
 */
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
}

/**
 * Получение направления ветра по градусам
 * @param {number} degrees - Градусы направления ветра
 * @returns {string} Направление ветра
 */
function getWindDirection(degrees) {
    if (!degrees) return 'н/д';
    
    const directions = [
        'С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ',
        'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

/**
 * Получение прогноза на ближайшие дни
 * @param {Array} forecastList - Список прогнозов
 * @returns {string} Форматированный прогноз
 */
function getDailyForecast(forecastList) {
    const dailyData = {};
    
    // Группировка по дням
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString('ru-RU');
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                temps: [],
                weather: item.weather[0],
                date: date
            };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
    });
    
    // Формирование прогноза
    let forecast = '';
    const dates = Object.keys(dailyData).slice(0, 3); // Первые 3 дня
    
    dates.forEach(dateKey => {
        const data = dailyData[dateKey];
        const minTemp = Math.round(Math.min(...data.temps));
        const maxTemp = Math.round(Math.max(...data.temps));
        const icon = getWeatherIcon(data.weather.icon);
        const dayName = data.date.toLocaleDateString('ru-RU', { weekday: 'short' });
        
        forecast += `${icon} **${dayName}:** ${minTemp}°...${maxTemp}°C\n`;
    });
    
    return forecast;
}

module.exports = {
    getWeatherInfo,
    getDetailedWeather
};