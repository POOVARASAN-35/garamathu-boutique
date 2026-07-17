import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', verifyAdmin, updateSettings);

export default router;
