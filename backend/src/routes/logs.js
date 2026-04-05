// backend/src/routes/logs.js
// Logs routes for fetching scan records

import express from 'express';
import { query } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/logs
 * Get all scan logs (admin only or personal)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.query.admin === 'true';

    let queryStr = `
      SELECT 
        l.id,
        l.personnel_id,
        p.nrp,
        p.name,
        p.rank,
        l.pos_id,
        pos.name as pos_name,
        l.gps_lat,
        l.gps_long,
        l.photo_url,
        l.exit_form,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
    `;

    let params = [];

    if (!isAdmin) {
      queryStr += ' WHERE l.personnel_id = $1';
      params.push(userId);
    }

    queryStr += ' ORDER BY l.timestamp DESC LIMIT 100';

    const result = await query(queryStr, params);

    return res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        exit_form: row.exit_form ? JSON.parse(row.exit_form) : {},
      })),
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message,
    });
  }
});

/**
 * GET /api/logs/:id
 * Get specific log entry
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        l.id,
        l.personnel_id,
        p.nrp,
        p.name,
        p.rank,
        p.photo_url as profile_photo,
        l.pos_id,
        pos.name as pos_name,
        l.gps_lat,
        l.gps_long,
        l.photo_url,
        l.exit_form,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
      WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    const row = result.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        ...row,
        exit_form: row.exit_form ? JSON.parse(row.exit_form) : {},
      },
    });
  } catch (error) {
    console.error('Error fetching log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch log',
      error: error.message,
    });
  }
});

export default router;
