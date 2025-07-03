# MAX Bot API - Документация

## 📋 Обзор

MAX Bot API предоставляет интерфейс для создания ботов в мессенджере MAX. API использует REST архитектуру с JSON форматом данных.

**Базовый URL:** `https://botapi.max.ru`

## 🔐 Авторизация

Все запросы к API требуют авторизации через Bearer токен в заголовке:

```http
Authorization: Bearer YOUR_BOT_TOKEN
```

## 📡 Эндпоинты API

### 1. GET /me

**Описание:** Получение информации о боте

**URL:** `https://botapi.max.ru/me`

**Метод:** `GET`

**Заголовки:**
```http
Authorization: Bearer YOUR_BOT_TOKEN
```

**Пример запроса:**
```javascript
const options = {
    hostname: 'botapi.max.ru',
    port: 443,
    path: '/me',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`
    }
};
```

**Успешный ответ (200):**
```json
{
    "user_id": "123456789",
    "username": "weather_bot",
    "description": "Бот для получения погоды"
}
```

**Ошибка авторизации (401):**
```
Invalid access_token: Bearer YOUR_TOKEN
```

### 2. GET /messages

**Описание:** Получение новых сообщений

**URL:** `https://botapi.max.ru/messages`

**Метод:** `GET`

**Заголовки:**
```http
Authorization: Bearer YOUR_BOT_TOKEN
```

**Пример запроса:**
```javascript
const options = {
    hostname: 'botapi.max.ru',
    port: 443,
    path: '/messages',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`
    }
};
```

**Успешный ответ (200):**
```json
{
    "messages": [
        {
            "message_id": "msg_123",
            "chat_id": "chat_456",
            "user_id": "user_789",
            "text": "Привет, бот!",
            "timestamp": "2024-01-15T10:30:00Z"
        }
    ]
}
```

**Пустой ответ (200):**
```json
{
    "messages": []
}
```

### 3. POST /messages

**Описание:** Отправка сообщения

**URL:** `https://botapi.max.ru/messages`

**Метод:** `POST`

**Заголовки:**
```http
Authorization: Bearer YOUR_BOT_TOKEN
Content-Type: application/json
```

**Тело запроса:**
```json
{
    "chat_id": "chat_456",
    "text": "Привет! Это сообщение от бота."
}
```

**Пример запроса:**
```javascript
const messageData = {
    chat_id: 'chat_456',
    text: 'Привет! Это сообщение от бота.'
};

const options = {
    hostname: 'botapi.max.ru',
    port: 443,
    path: '/messages',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

// Отправка данных
req.write(JSON.stringify(messageData));
```

**Успешный ответ (200):**
```json
{
    "message_id": "msg_124",
    "status": "sent",
    "timestamp": "2024-01-15T10:31:00Z"
}
```

## 🔄 Примеры использования

### Полный пример бота

```javascript
const https = require('https');
const fs = require('fs');

// Загрузка токена из .env
function loadEnvFile() {
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key] = valueParts.join('=');
                }
            }
        });
        return envVars;
    } catch (error) {
        return {};
    }
}

const envVars = loadEnvFile();
const BOT_TOKEN = envVars.BOT_TOKEN;

// Функция для HTTP запросов
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Получение информации о боте
async function getBotInfo() {
    const options = {
        hostname: 'botapi.max.ru',
        port: 443,
        path: '/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${BOT_TOKEN}`
        }
    };

    const response = await makeRequest(options);
    return JSON.parse(response.data);
}

// Получение новых сообщений
async function getMessages() {
    const options = {
        hostname: 'botapi.max.ru',
        port: 443,
        path: '/messages',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${BOT_TOKEN}`
        }
    };

    const response = await makeRequest(options);
    return JSON.parse(response.data);
}

// Отправка сообщения
async function sendMessage(chatId, text) {
    const messageData = {
        chat_id: chatId,
        text: text
    };

    const options = {
        hostname: 'botapi.max.ru',
        port: 443,
        path: '/messages',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${BOT_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    const response = await makeRequest(options, JSON.stringify(messageData));
    return JSON.parse(response.data);
}
```

## ❌ Коды ошибок

| Код | Описание | Причина |
|-----|----------|----------|
| 200 | OK | Запрос выполнен успешно |
| 400 | Bad Request | Неверные параметры запроса |
| 401 | Unauthorized | Неверный или отсутствующий токен |
| 403 | Forbidden | Недостаточно прав |
| 404 | Not Found | Эндпоинт не найден |
| 429 | Too Many Requests | Превышен лимит запросов |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

## 🔒 Безопасность

### Рекомендации:

1. **Храните токен в безопасности:**
   - Используйте переменные окружения
   - Не коммитьте токены в Git
   - Регулярно обновляйте токены

2. **Валидация данных:**
   - Проверяйте входящие сообщения
   - Ограничивайте длину текста
   - Фильтруйте вредоносный контент

3. **Обработка ошибок:**
   - Логируйте все запросы
   - Обрабатывайте таймауты
   - Реализуйте повторные попытки

## 📊 Лимиты и ограничения

- **Максимальная длина сообщения:** 4096 символов
- **Частота запросов:** Рекомендуется не более 30 запросов в минуту
- **Таймаут запроса:** 10 секунд
- **Размер JSON:** Максимум 1 МБ

## 🧪 Тестирование

Для тестирования API используйте предоставленные скрипты:

```bash
# Тест всех эндпоинтов
node test-correct-max-endpoints.js

# Тест отправки сообщений
node test-send-message.js

# Простой пример бота
node simple-max-bot.js
```

## 📝 Примечания

- Все времена указаны в UTC
- API поддерживает только HTTPS
- Ответы всегда в формате JSON (кроме ошибок авторизации)
- Polling рекомендуется выполнять каждые 1-2 секунды

## 🔄 Changelog

### v1.0 (Текущая версия)
- Базовые эндпоинты: `/me`, `/messages`
- Поддержка GET и POST запросов
- Bearer авторизация
- JSON формат данных