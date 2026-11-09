# Zen-Money — server

Backend на Express + SQLite (better-sqlite3). Порт: **3001**.

## Установка и запуск

```bash
cd task8-9/server
npm install
npm start        # или: node server.js
```

При первом запуске создаётся файл `zen-money.db` и стартовые категории (Еда, Транспорт, Зарплата).

## Структура (MVC + DI)

```
server.js                      — composition root: создаёт и связывает объекты
src/db.js                      — подключение к SQLite, схема, стартовые данные
src/models/                    — Model: SQL-запросы (получают db через конструктор)
src/controllers/               — Controller: валидация + логика (получают модели через конструктор)
src/routes/                    — Routes: URL -> метод контроллера
src/validators.js, errors.js   — валидация и классы ошибок (400 / 404 / 500)
src/app.js                     — сборка express-приложения
```

## API

| Метод  | Роут                | Описание |
|--------|---------------------|----------|
| GET    | /categories         | все категории |
| POST   | /categories         | `{ "name": "...", "type": "income" \| "expense" }` |
| GET    | /transactions       | все операции; фильтры `?category_id=` `?type=` `?from=&to=` (SQL WHERE) |
| POST   | /transactions       | `{ "amount": 100, "category_id": 1, "date": "2025-01-31", "comment": "..." }` |
| PUT    | /transactions/:id   | обновить операцию |
| DELETE | /transactions/:id   | удалить операцию |

Ошибки: `400` (невалидные данные), `404` (нет такого id), `500` — тело всегда `{ "error": "..." }`.

## Проверка через curl

```bash
curl http://localhost:3001/categories
curl -X POST http://localhost:3001/categories -H "Content-Type: application/json" -d '{"name":"Кафе","type":"expense"}'
curl "http://localhost:3001/transactions?type=expense&from=2025-01-01&to=2025-12-31"
curl -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d '{"amount":250.5,"category_id":1,"date":"2025-01-31","comment":"Обед"}'
curl -X PUT http://localhost:3001/transactions/1 -H "Content-Type: application/json" -d '{"amount":300,"category_id":1,"date":"2025-01-31","comment":"Обед+кофе"}'
curl -X DELETE http://localhost:3001/transactions/1
curl -X DELETE http://localhost:3001/transactions/999   # 404
curl -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d '{"amount":-5,"category_id":1,"date":"2025-01-31"}'   # 400
```

## Логи успешных запросов

_Вставьте сюда вывод curl / скриншоты Postman для GET, POST, PUT, DELETE после запуска у себя._
