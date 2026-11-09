const { Router } = require('express');

function createCategoryRoutes(controller) {
    const router = Router();
    router.get('/', controller.getAll);
    router.post('/', controller.create);
    return router;
}

module.exports = createCategoryRoutes;
