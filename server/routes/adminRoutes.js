import express from 'express';
import { getAdminProfile } from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/profile', verifyAdmin, getAdminProfile);

export default router;
