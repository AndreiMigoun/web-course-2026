const Database = require('better-sqlite3');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  comment TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
`;

const DEFAULT_CATEGORIES = [
    { name: 'Еда', type: 'expense' },
    { name: 'Транспорт', type: 'expense' },
    { name: 'Зарплата', type: 'income' }
];

function seedCategories(db) {
    const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get();
    if (count > 0) return;

    const insert = db.prepare('INSERT INTO categories (name, type) VALUES (@name, @type)');
    const insertMany = db.transaction((categories) => {
        for (const category of categories) {
            insert.run(category);
        }
    });

    insertMany(DEFAULT_CATEGORIES);
}

function createDatabase(filename) {
    const db = new Database(filename);
    db.exec(SCHEMA);
    seedCategories(db);
    return db;
}

module.exports = { createDatabase };