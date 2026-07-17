import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  trackOrderByCustomId,
  cancelOrder,
  returnOrder,
  downloadInvoice,
  createOrderReview
} from '../controllers/orderController.js';
import { verifyUser } from '../middleware/verifyUser.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post('/', verifyUser, createOrder);
router.get('/my-orders', verifyUser, getMyOrders);
router.get('/', verifyUser, getAllOrders);
router.get('/track/:orderId', trackOrderByCustomId);
router.post('/cancel', verifyUser, cancelOrder);
router.post('/return', verifyUser, returnOrder);
router.post('/review', verifyUser, createOrderReview);
router.get('/invoice/:id', verifyUser, downloadInvoice);
router.get('/:id', verifyUser, getOrderById);
router.put('/:id/status', verifyAdmin, updateOrderStatus);

export default router;
