// backend/src/modules/photoUpload/router.js
// Photo Upload Module Routes

import express from 'express';
import { query } from '../../db/connection.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/photo-upload/attach
 * Attach photo URL to a log entry
 * Body: { log_id, photo_url }
 */
router.post('/attach', authMiddleware, async (req, res) => {
  try {
    const { log_id, photo_url } = req.body;

    if (!log_id || !photo_url) {
      return res.status(400).json({
        success: false,
        message: 'Log ID and photo URL are required',
      });
    }

    // Update the log with photo URL
    const result = await query(
      'UPDATE logs SET photo_url = $1 WHERE id = $2 RETURNING id, photo_url, timestamp',
      [photo_url, log_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Photo attached successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error attaching photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to attach photo',
      error: error.message,
    });
  }
});

/**
 * GET /api/photo-upload/:log_id
 * Get photo for a log entry
 */
router.get('/:log_id', authMiddleware, async (req, res) => {
  try {
    const { log_id } = req.params;

    const result = await query(
      'SELECT id, photo_url, timestamp FROM logs WHERE id = $1',
      [log_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch photo',
      error: error.message,
    });
  }
});

export default router;
