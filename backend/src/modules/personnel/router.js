// backend/src/modules/personnel/router.js
// Personnel Management Module Routes

import express from 'express';
import { query } from '../../db/connection.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/personnel
 * Get all personnel
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nrp, name, rank, photo_url, created_at FROM personnel ORDER BY name'
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personnel',
      error: error.message,
    });
  }
});

/**
 * GET /api/personnel/:id
 * Get personnel by ID
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, nrp, name, rank, photo_url, created_at FROM personnel WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personnel',
      error: error.message,
    });
  }
});

/**
 * POST /api/personnel
 * Create new personnel
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nrp, name, rank, photo_url } = req.body;

    if (!nrp || !name) {
      return res.status(400).json({
        success: false,
        message: 'NRP and name are required',
      });
    }

    const result = await query(
      'INSERT INTO personnel (nrp, name, rank, photo_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nrp, name, rank || null, photo_url || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Personnel created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating personnel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create personnel',
      error: error.message,
    });
  }
});

/**
 * PUT /api/personnel/:id
 * Update personnel
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rank, photo_url } = req.body;

    const result = await query(
      'UPDATE personnel SET name = COALESCE($1, name), rank = COALESCE($2, rank), photo_url = COALESCE($3, photo_url), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name || null, rank || null, photo_url || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Personnel updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating personnel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update personnel',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/personnel/:id
 * Delete personnel
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM personnel WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Personnel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete personnel',
      error: error.message,
    });
  }
});

export default router;
