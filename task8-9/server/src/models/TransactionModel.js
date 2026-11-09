const SELECT_WITH_CATEGORY = `
  SELECT t.id, t.amount, t.category_id, t.date, t.comment,
         c.name AS category_name, c.type AS category_type
  FROM transactions t
  JOIN categories c ON c.id = t.category_id`;

class TransactionModel {
    constructor(db) {
        this.db = db;
    }

    // Фильтрация целиком в SQL: условия собираются в WHERE, значения передаются параметрами.
    findAll({ categoryId, type, from, to } = {}) {
        const conditions = [];
        const params = [];

        if (categoryId !== undefined) { conditions.push('t.category_id = ?'); params.push(categoryId); }
        if (type !== undefined)       { conditions.push('c.type = ?');        params.push(type); }
        if (from !== undefined)       { conditions.push('t.date >= ?');       params.push(from); }
        if (to !== undefined)         { conditions.push('t.date <= ?');       params.push(to); }

        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
        const sql = `${SELECT_WITH_CATEGORY}${where} ORDER BY t.date DESC, t.id DESC`;
        return this.db.prepare(sql).all(...params);
    }

    findById(id) {
        return this.db.prepare(`${SELECT_WITH_CATEGORY} WHERE t.id = ?`).get(id);
    }

    create({ amount, category_id, date, comment }) {
        const info = this.db
            .prepare('INSERT INTO transactions (amount, category_id, date, comment) VALUES (?, ?, ?, ?)')
            .run(amount, category_id, date, comment);
        return this.findById(info.lastInsertRowid);
    }

    update(id, { amount, category_id, date, comment }) {
        this.db
            .prepare('UPDATE transactions SET amount = ?, category_id = ?, date = ?, comment = ? WHERE id = ?')
            .run(amount, category_id, date, comment, id);
        return this.findById(id);
    }

    remove(id) {
        return this.db.prepare('DELETE FROM transactions WHERE id = ?').run(id).changes > 0;
    }
}

module.exports = TransactionModel;
