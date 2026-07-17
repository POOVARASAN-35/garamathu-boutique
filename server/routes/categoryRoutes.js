import express from 'express';
import { 
  getAllCategories, 
  getCategoryById, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);
router.get('/id/:id', getCategoryById);
router.post('/', verifyAdmin, createCategory);
router.put('/:id', verifyAdmin, updateCategory);
router.delete('/:id', verifyAdmin, deleteCategory);

export default router;
