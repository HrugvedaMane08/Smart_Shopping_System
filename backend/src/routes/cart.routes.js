import express from 'express';
import {
  createCart,
  getMyCart,
  getMyCartHistory,
  getCartById,
  getActiveCarts,
  getAllCarts,
} from '../controllers/cart.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { checkout } from '../controllers/transaction.controller.js';

const router = express.Router();

// Customer routes
router.post('/', protect, authorize('CUSTOMER'), createCart);
router.get('/my-cart', protect, authorize('CUSTOMER'), getMyCart);
router.get('/history', protect, authorize('CUSTOMER'), getMyCartHistory);
router.post('/:cartId/checkout', protect, authorize('CUSTOMER'), checkout);

// Manager routes
router.get('/active', protect, authorize('MANAGER'), getActiveCarts);
router.get('/all', protect, authorize('MANAGER'), getAllCarts);



// Shared (manager or owning customer) — must come after specific routes
router.get('/:cartId', protect, getCartById);

export default router;