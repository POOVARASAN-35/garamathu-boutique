import express from 'express';
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.get('/id/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);
router.post('/', verifyAdmin, createProduct);
router.put('/:id', verifyAdmin, updateProduct);
router.delete('/:id', verifyAdmin, deleteProduct);

export default router;
