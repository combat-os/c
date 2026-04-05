// backend/src/modules/alerts/alertRoutes.js
// Alert routes

import express from 'express';
import { alertController } from './alertController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get active alerts (admin only)
router.get(
  '/active',
  requireRole('admin'),
  alertController.getActiveAlerts
);

// Get alert history with filters
router.get(
  '/history',
  requireRole('admin'),
  [
    query('type').optional().isIn(['POS_OFFLINE', 'HIGH_ACTIVITY', 'PERSONNEL_INACTIVE', 'GPS_VALIDATION_FAILED']).withMessage('Invalid alert type'),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid severity'),
    query('acknowledged').optional().isBoolean().withMessage('acknowledged must be boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  ],
  alertController.getAlertHistory
);

// Acknowledge alert
router.patch(
  '/:id/acknowledge',
  requireRole('admin'),
  [
    param('id').isInt().withMessage('ID must be an integer'),
  ],
  alertController.acknowledgeAlert
);

// Create manual alert (admin only)
router.post(
  '/',
  requireRole('admin'),
  [
    body('type').isIn(['POS_OFFLINE', 'HIGH_ACTIVITY', 'PERSONNEL_INACTIVE', 'GPS_VALIDATION_FAILED', 'MANUAL']).withMessage('Invalid alert type'),
    body('severity').isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid severity'),
    body('message').isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 characters'),
    body('pos_id').optional().isInt().withMessage('pos_id must be an integer'),
    body('personnel_id').optional().isInt().withMessage('personnel_id must be an integer'),
  ],
  alertController.createAlert
);

export { router as alertRoutes };