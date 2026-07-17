import express from 'express';
import { submitContactMessage, getContactMessages } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContactMessage);
router.get('/', protect, admin, getContactMessages);

export default router;
