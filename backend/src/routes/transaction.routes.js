import express from 'express';
import {
  getReceipt,
  getMyTransactions,
  getAllTransactions,
} from '../controllers/transaction.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my-history', protect, authorize('CUSTOMER'), getMyTransactions);
router.get('/', protect, authorize('MANAGER'), getAllTransactions);
router.get('/:transactionId/receipt', protect, getReceipt);

export default router;