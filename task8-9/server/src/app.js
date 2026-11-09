const express = require('express');
const cors = require('cors');
const { HttpError } = require('./errors');
const createCategoryRoutes = require('./routes/categoryRoutes');
const createTransactionRoutes = require('./routes/transactionRoutes');

function createApp({ categoryController, transactionController }) {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/categories', createCategoryRoutes(categoryController));
    app.use('/transactions', createTransactionRoutes(transactionController));

    app.use((req, res) => {
        res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не найден` });
    });

    app.use((err, req, res, next) => {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ error: err.message });
        }
        if (err.type === 'entity.parse.failed') {
            return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
        }
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    });

    return app;
}

module.exports = { createApp };