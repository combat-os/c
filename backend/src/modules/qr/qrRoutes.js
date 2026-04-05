// backend/src/modules/qr/qrRoutes.js
// QR Code scanning routes

import express from 'express';
import { scanQR, getScanHistory } from './qrController.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * POST /qr/scan
 * Process QR code scan with GPS validation
 */
router.post('/scan', authMiddleware, scanQR);

/**
 * GET /qr/history
 * Get scan history for authenticated user
 */
router.get('/history', authMiddleware, getScanHistory);

export default router;