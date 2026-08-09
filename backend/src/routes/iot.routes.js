import express from 'express';
import { handleRfidScan, handleProductReturn } from '../controllers/iot.controller.js';

const router = express.Router();

router.post('/rfid', handleRfidScan);
router.post('/product-return', handleProductReturn);

export default router;