import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllCustomers,
  getCustomerById,
  updateWishlist,
  addAddress,
  deleteAddress,
  addToCart
} from '../controllers/userController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyUser, getUserProfile);
router.get('/', verifyAdmin, getAllCustomers);
router.get('/:id', verifyAdmin, getCustomerById);
router.post('/wishlist', verifyUser, updateWishlist);
router.post('/cart', verifyUser, addToCart);
router.post('/address', verifyUser, addAddress);
router.delete('/address/:id', verifyUser, deleteAddress);

export default router;
