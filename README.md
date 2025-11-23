# MeetShow Landing

Статическая лендинг-страница, вдохновлённая платформой meetshow.org и адаптированная под собственный бренд. Проект написан на чистом HTML, CSS и JavaScript.

## Запуск

### Быстрый просмотр

Откройте `index.html` напрямую в браузере. Если файловая схема блокируется (как в WebStorm Live Edit), запустите локальный сервер:

```bash
python -m http.server 8000
```

Страница будет доступна по адресу http://localhost:8000.

### Node/JetBrains запуск

Для стабильной выдачи без 404 в JetBrains IDE используйте встроенный Node-сервер:

```bash
npm install
npm start
```

По умолчанию сервер поднимется на http://localhost:8080 и отдаст `index.html`, `styles.css` и `script.js` из корня проекта.
