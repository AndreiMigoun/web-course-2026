const { ValidationError } = require('./errors');

const TYPES = ['income', 'expense'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
    if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
    const d = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isPositiveInt(value) {
    return Number.isInteger(value) && value > 0;
}

function parseId(raw) {
    const id = Number(raw);
    if (!isPositiveInt(id)) throw new ValidationError('id должен быть положительным целым числом');
    return id;
}

function validateCategory(body = {}) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) throw new ValidationError('name обязателен и не может быть пустым');
    if (!TYPES.includes(body.type)) throw new ValidationError("type должен быть 'income' или 'expense'");
    return { name, type: body.type };
}

function validateTransaction(body = {}) {
    if (!Number.isFinite(body.amount) || body.amount <= 0) {
        throw new ValidationError('amount должен быть числом больше 0');
    }

    if (!isPositiveInt(body.category_id)) {
        throw new ValidationError('category_id должен быть положительным целым числом');
    }

    if (!isRealDate(body.date)) {
        throw new ValidationError('date должна быть корректной датой в формате YYYY-MM-DD');
    }

    if (body.comment != null && typeof body.comment !== 'string') {
        throw new ValidationError('comment должен быть строкой');
    }

    return {
        amount: body.amount,
        category_id: body.category_id,
        date: body.date,
        comment: body.comment ?? null
    };
}

function parseTransactionFilters(query) {
    const filters = {};

    if (query.category_id !== undefined) {
        const id = Number(query.category_id);
        if (!isPositiveInt(id)) throw new ValidationError('category_id в запросе должен быть целым числом');
        filters.categoryId = id;
    }

    if (query.type !== undefined) {
        if (!TYPES.includes(query.type)) throw new ValidationError("type в запросе должен быть 'income' или 'expense'");
        filters.type = query.type;
    }

    for (const key of ['from', 'to']) {
        if (query[key] === undefined) continue;
        if (!isRealDate(query[key])) throw new ValidationError(`${key} должна быть датой в формате YYYY-MM-DD`);
        filters[key] = query[key];
    }

    if (filters.from && filters.to && filters.from > filters.to) {
        throw new ValidationError('from не может быть позже to');
    }

    return filters;
}

module.exports = { parseId, validateCategory, validateTransaction, parseTransactionFilters };