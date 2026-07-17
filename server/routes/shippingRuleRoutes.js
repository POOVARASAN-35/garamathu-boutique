import express from 'express';
import {
  getShippingRules,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule
} from '../controllers/shippingRuleController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

// Public route to retrieve shipping details on checkout or product views
router.get('/', getShippingRules);

// Protected routes to manage rules from Admin Control Panel
router.post('/', verifyAdmin, createShippingRule);
router.put('/:id', verifyAdmin, updateShippingRule);
router.delete('/:id', verifyAdmin, deleteShippingRule);

export default router;
