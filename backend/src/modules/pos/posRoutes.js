// backend/src/modules/pos/posRoutes.js
// POS (Guard Post) routes

import express from 'express';
import { getAllPOS, getPOSById, createPOS, updatePOS, deletePOS } from './posController.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * GET /pos
 * Get all POS (admin only)
 */
router.get('/', authMiddleware, getAllPOS);

/**
 * GET /pos/:id
 * Get POS by ID (admin only)
 */
router.get('/:id', authMiddleware, getPOSById);

/**
 * POST /pos
 * Create new POS (admin only)
 */
router.post('/', authMiddleware, createPOS);

/**
 * PUT /pos/:id
 * Update POS (admin only)
 */
router.put('/:id', authMiddleware, updatePOS);

/**
 * DELETE /pos/:id
 * Delete POS (admin only)
 */
router.delete('/:id', authMiddleware, deletePOS);

export default router;