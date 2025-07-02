# MAX Weather Bot

🌤️ MAX-бот для получения погоды

## Быстрый запуск

1. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

2. Создайте `.env` файл:
   ```
   MAX_BOT_SECRET=ваш_секрет_max_бота
   MAX_WEBHOOK_URL=https://ваш-сайт.netlify.app/.netlify/functions/webhook
   ```

3. Запустите бота:
   ```bash
   python run.py
   ```

## Деплой на Netlify

1. Загрузите проект на GitHub
2. Подключите к Netlify
3. Добавьте переменные окружения в настройках Netlify
4. Деплой произойдет автоматически

После деплоя установите webhook: `https://ваш-сайт.netlify.app/.netlify/functions/webhook`
