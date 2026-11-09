const { Router } = require('express');

function createTransactionRoutes(controller) {
    const router = Router();
    router.get('/', controller.getAll);
    router.post('/', controller.create);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.remove);
    return router;
}

module.exports = createTransactionRoutes;
