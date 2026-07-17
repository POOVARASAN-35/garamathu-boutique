import express from 'express';
import { 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} from '../controllers/bannerController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/', getAllBanners);
router.post('/', verifyAdmin, createBanner);
router.put('/:id', verifyAdmin, updateBanner);
router.delete('/:id', verifyAdmin, deleteBanner);

export default router;
