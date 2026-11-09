const { validateCategory } = require('../validators');

class CategoryController {
    constructor(categoryModel) {
        this.categoryModel = categoryModel;
    }

    getAll = (req, res) => {
        res.json(this.categoryModel.findAll());
    };

    create = (req, res) => {
        const data = validateCategory(req.body);
        res.status(201).json(this.categoryModel.create(data));
    };
}

module.exports = CategoryController;