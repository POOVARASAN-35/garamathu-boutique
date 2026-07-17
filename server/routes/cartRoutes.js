import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  moveToWishlist
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Define routes in order of specificity to avoid parameter conflicts
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.delete('/clear', protect, clearCart);
router.post('/apply-coupon', protect, applyCoupon);
router.post('/move-to-wishlist', protect, moveToWishlist);

router.put('/:productId', protect, updateCartItemQuantity);
router.delete('/:productId', protect, removeFromCart);

export default router;
