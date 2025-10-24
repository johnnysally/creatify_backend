const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.listOrders);
router.get('/:id', authenticateToken, orderController.getOrder);
router.patch('/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;
