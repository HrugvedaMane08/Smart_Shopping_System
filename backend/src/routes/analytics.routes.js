import express from 'express';
import {
  getDashboardStats,
  getRevenueChart,
  getBestSellers,
  getCategorySales,
  getInventoryStatus,
  getRecentTransactions,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes are Manager-only
router.use(protect, authorize('MANAGER'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueChart);
router.get('/best-sellers', getBestSellers);
router.get('/category-sales', getCategorySales);
router.get('/inventory-status', getInventoryStatus);
router.get('/recent-transactions', getRecentTransactions);

export default router;