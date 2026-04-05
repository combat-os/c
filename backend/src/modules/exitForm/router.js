// backend/src/modules/exitForm/router.js
// Exit Form Module Routes

import express from 'express';
import { query } from '../../db/connection.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/exit-form/logs
 * Get exit form logs for authenticated user or all (if admin)
 */
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user?.role === 'admin'; // Simple flag, implement proper role system

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

    queryStr += ' ORDER BY l.timestamp DESC';

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
 * POST /api/exit-form/submit
 * Submit exit form data to a specific log entry
 * Body: { log_id, tujuan, alasan_keluar, durasi, jadwal }
 */
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { log_id, tujuan, alasan_keluar, durasi, jadwal } = req.body;

    if (!log_id) {
      return res.status(400).json({
        success: false,
        message: 'Log ID is required',
      });
    }

    // Prepare exit form data
    const exitFormData = {
      tujuan: tujuan || '',
      alasan_keluar: alasan_keluar || '',
      durasi: durasi || '',
      jadwal: jadwal || '',
      submitted_at: new Date().toISOString(),
    };

    // Update the log with exit form data
    const result = await query(
      'UPDATE logs SET exit_form = $1 WHERE id = $2 RETURNING id, exit_form',
      [JSON.stringify(exitFormData), log_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Exit form submitted successfully',
      data: {
        log_id: result.rows[0].id,
        exit_form: JSON.parse(result.rows[0].exit_form),
      },
    });
  } catch (error) {
    console.error('Error submitting exit form:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit exit form',
      error: error.message,
    });
  }
});

export default router;
