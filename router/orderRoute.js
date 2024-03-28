const express = require('express');
const { createOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth')
const router = express.Router()

router.post('/order/new', isAuthenticatedUser, createOrder)
router.get('/order/:id', isAuthenticatedUser, getSingleOrder)
router.get('/my/orders', isAuthenticatedUser, myOrders)
router.get('/admin/orders', isAuthenticatedUser, authorizeRoles("admin"), getAllOrders)
router.put('/admin/order/:id', isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
router.delete('/admin/order/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteOrder)

module.exports = router;