import express from 'express';
import { getAlerts, markAlertRead, resolveAlert } from '../controllers/alert.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, authorize('MANAGER'));

router.get('/', getAlerts);
router.patch('/:id/read', markAlertRead);
router.patch('/:id/resolve', resolveAlert);

export default router;