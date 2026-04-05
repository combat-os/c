// backend/src/modules/logs/logsRoutes.js
// Logs routes

import express from 'express';
import { logsController } from './logsController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get logs with filters and pagination
router.get(
  '/',
  [
    query('pos_id').optional().isInt().withMessage('pos_id must be an integer'),
    query('type').optional().isIn(['ENTRY', 'EXIT', 'PATROL', 'ALERT']).withMessage('Invalid type'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  ],
  logsController.getLogs
);

// Get specific log by ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
  ],
  logsController.getLogById
);

// Admin-only: Get dashboard statistics
router.get(
  '/admin/dashboard',
  requireRole('admin'),
  logsController.getDashboardStats
);

export { router as logsRoutes };