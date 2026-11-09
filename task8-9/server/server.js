const { createDatabase } = require('./src/db');
const { createApp } = require('./src/app');
const CategoryModel = require('./src/models/CategoryModel');
const TransactionModel = require('./src/models/TransactionModel');
const CategoryController = require('./src/controllers/CategoryController');
const TransactionController = require('./src/controllers/TransactionController');

const PORT = 3001;

const db = createDatabase('zen-money.db');

const categoryModel = new CategoryModel(db);
const transactionModel = new TransactionModel(db);

const categoryController = new CategoryController(categoryModel);
const transactionController = new TransactionController(transactionModel, categoryModel);

const app = createApp({ categoryController, transactionController });

app.listen(PORT, () => {
    console.log(`Zen-Money server: http://localhost:${PORT}`);
});