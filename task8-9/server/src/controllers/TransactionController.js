const { NotFoundError, ValidationError } = require('../errors');
const { parseId, validateTransaction, parseTransactionFilters } = require('../validators');

class TransactionController {
    constructor(transactionModel, categoryModel) {
        this.transactionModel = transactionModel;
        this.categoryModel = categoryModel;
    }

    getAll = (req, res) => {
        const filters = parseTransactionFilters(req.query);
        res.json(this.transactionModel.findAll(filters));
    };

    create = (req, res) => {
        const data = this.#validatedBody(req.body);
        res.status(201).json(this.transactionModel.create(data));
    };

    update = (req, res) => {
        const id = parseId(req.params.id);
        this.#ensureExists(id);
        const data = this.#validatedBody(req.body);
        res.json(this.transactionModel.update(id, data));
    };

    remove = (req, res) => {
        const id = parseId(req.params.id);
        if (!this.transactionModel.remove(id)) {
            throw new NotFoundError(`Операция с id=${id} не найдена`);
        }
        res.json({ deleted: id });
    };

    #validatedBody(body) {
        const data = validateTransaction(body);
        if (!this.categoryModel.findById(data.category_id)) {
            throw new ValidationError(`Категория с id=${data.category_id} не существует`);
        }
        return data;
    }

    #ensureExists(id) {
        if (!this.transactionModel.findById(id)) {
            throw new NotFoundError(`Операция с id=${id} не найдена`);
        }
    }
}

module.exports = TransactionController;