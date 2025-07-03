/**
 * Модуль для получения информации о погоде через API wttr.in
 */

const axios = require('axios');

// Базовый URL для API wttr.in
const WTTR_BASE_URL = 'https://wttr.in';

// Параметры запроса для получения краткой информации о погоде
const WTTR_PARAMS = {
    format: '3',  // Краткий формат
    lang: 'ru',   // Русский язык
    M: ''         // Метрическая система
};

/**
 * Получает информацию о погоде для указанного города
 * 
 * @param {string} city - Название города
 * @returns {Promise<string>} Информация о погоде или сообщение об ошибке
 */
async function getWeatherInfo(city) {
    if (!city || !city.trim()) {
        return '❌ Пожалуйста, укажите название города.';
    }
    
    city = city.trim();
    
    try {
        // Формирование URL для запроса
        const url = `${WTTR_BASE_URL}/${city}`;
        
        console.log(`Запрос погоды для города: ${city}`);
        
        // Выполнение HTTP запроса
        const response = await axios.get(url, {
            params: WTTR_PARAMS,
            timeout: 10000,
            headers: { 'User-Agent': 'MAX Weather Bot' }
        });
        
        // Проверка статуса ответа
        if (response.status === 200) {
            const weatherText = response.data.trim();
            
            // Проверка на корректность ответа
            if (weatherText && !weatherText.startsWith('Unknown location')) {
                console.log(`Получена погода для ${city}: ${weatherText}`);
                return `🌤 Погода в городе ${city}:\n${weatherText}`;
            } else {
                console.warn(`Город не найден: ${city}`);
                return `❌ Город '${city}' не найден. Проверьте правильность написания.`;
            }
        } else {
            console.error(`Ошибка API wttr.in: ${response.status}`);
            return '❌ Временные проблемы с сервисом погоды. Попробуйте позже.';
        }
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`Таймаут при запросе погоды для ${city}`);
            return '❌ Превышено время ожидания. Попробуйте позже.';
        }
        
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error(`Ошибка соединения при запросе погоды для ${city}`);
            return '❌ Проблемы с подключением к сервису погоды. Попробуйте позже.';
        }
        
        if (error.response && error.response.status === 404) {
            console.warn(`Город не найден: ${city}`);
            return `❌ Город '${city}' не найден. Проверьте правильность написания.`;
        }
        
        console.error(`Ошибка запроса погоды для ${city}:`, error.message);
        return '❌ Ошибка при получении данных о погоде. Попробуйте позже.';
    }
}

/**
 * Получает подробную информацию о погоде для указанного города
 * 
 * @param {string} city - Название города
 * @returns {Promise<string>} Подробная информация о погоде или сообщение об ошибке
 */
async function getDetailedWeather(city) {
    if (!city || !city.trim()) {
        return '❌ Пожалуйста, укажите название города.';
    }
    
    city = city.trim();
    
    try {
        // Параметры для подробного прогноза
        const detailedParams = {
            format: '%l:+%c+%t+%h+%w+%p+%P\n',
            lang: 'ru',
            M: ''
        };
        
        const url = `${WTTR_BASE_URL}/${city}`;
        
        console.log(`Запрос подробной погоды для города: ${city}`);
        
        const response = await axios.get(url, {
            params: detailedParams,
            timeout: 10000,
            headers: { 'User-Agent': 'MAX Weather Bot' }
        });
        
        if (response.status === 200) {
            const weatherText = response.data.trim();
            
            if (weatherText && !weatherText.startsWith('Unknown location')) {
                console.log(`Получена подробная погода для ${city}`);
                return `🌤 Подробная погода в городе ${city}:\n${weatherText}`;
            } else {
                return `❌ Город '${city}' не найден. Проверьте правильность написания.`;
            }
        } else {
            return '❌ Временные проблемы с сервисом погоды. Попробуйте позже.';
        }
        
    } catch (error) {
        console.error(`Ошибка получения подробной погоды для ${city}:`, error.message);
        return '❌ Ошибка при получении подробных данных о погоде. Попробуйте позже.';
    }
}

module.exports = {
    getWeatherInfo,
    getDetailedWeather
};