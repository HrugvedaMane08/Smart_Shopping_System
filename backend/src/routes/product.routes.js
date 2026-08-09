import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductByRfid,
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Both roles can view products
router.get('/', protect, getProducts);
router.get('/low-stock', protect, authorize('MANAGER'), getLowStockProducts);
router.get('/rfid/:rfidUid', protect, authorize('MANAGER'), getProductByRfid);
router.get('/:id', protect, getProductById);

// Manager only
router.post('/', protect, authorize('MANAGER'), createProduct);
router.put('/:id', protect, authorize('MANAGER'), updateProduct);
router.delete('/:id', protect, authorize('MANAGER'), deleteProduct);

export default router;