class CategoryModel {
    constructor(db) {
        this.db = db;
    }

    findAll() {
        return this.db.prepare('SELECT id, name, type FROM categories ORDER BY id').all();
    }

    findById(id) {
        return this.db.prepare('SELECT id, name, type FROM categories WHERE id = ?').get(id);
    }

    create({ name, type }) {
        const info = this.db
            .prepare('INSERT INTO categories (name, type) VALUES (?, ?)')
            .run(name, type);
        return this.findById(info.lastInsertRowid);
    }
}

module.exports = CategoryModel;
