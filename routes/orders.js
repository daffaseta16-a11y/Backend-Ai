const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrderById, getOrderByKode } = require('../controllers/orderController');

router.post('/checkout', checkout);
router.get('/', getOrders);
router.get('/kode/:kode', getOrderByKode);
router.get('/:id', getOrderById);

module.exports = router;
