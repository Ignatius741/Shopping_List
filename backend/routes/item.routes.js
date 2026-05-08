const express = require('express');
const ItemController = require('../controllers/item.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware); // All item routes require authentication

router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post('/', ItemController.createItem);
router.patch('/:id', ItemController.updateItem);
router.delete('/:id', ItemController.deleteItem);

module.exports = router;