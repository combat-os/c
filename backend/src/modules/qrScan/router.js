// backend/src/modules/qrScan/router.js
// QR Code Scanning Module Routes

import express from 'express';
import { query } from '../../db/connection.js';
import { authMiddleware } from '../../middleware/auth.js';
import { isValidGPS, isWithinRadius } from '../../utils/gps.js';

const router = express.Router();

/**
 * GET /api/qr-scan/pos
 * Get all POS (checkpoints) with QR code info
 */
router.get('/pos', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, location, qr_code_id, latitude, longitude, radius_meters FROM pos ORDER BY name'
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch POS',
      error: error.message,
    });
  }
});

/**
 * POST /api/qr-scan/scan
 * Scan QR code with GPS validation
 * Body: { qr_code_id, gps_lat, gps_long, exit_form, photo_url }
 */
router.post('/scan', authMiddleware, async (req, res) => {
  try {
    const { qr_code_id, gps_lat, gps_long, exit_form, photo_url } = req.body;
    const userId = req.user.id;

    // Validate QR code exists
    if (!qr_code_id) {
      return res.status(400).json({
        success: false,
        message: 'QR code ID is required',
      });
    }

    const posResult = await query(
      'SELECT id, latitude, longitude, radius_meters FROM pos WHERE qr_code_id = $1',
      [qr_code_id]
    );

    if (posResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code',
      });
    }

    const pos = posResult.rows[0];

    // Validate GPS if enabled
    if (process.env.GPS_VALIDATION_ENABLED === 'true') {
      if (!gps_lat || !gps_long) {
        return res.status(400).json({
          success: false,
          message: 'GPS coordinates are required',
        });
      }

      if (!isValidGPS(gps_lat, gps_long)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GPS coordinates',
        });
      }

      if (!isWithinRadius(gps_lat, gps_long, pos.latitude, pos.longitude, pos.radius_meters)) {
        return res.status(400).json({
          success: false,
          message: 'GPS location out of valid range',
        });
      }
    }

    // Insert scan log
    const logResult = await query(
      `INSERT INTO logs (personnel_id, pos_id, gps_lat, gps_long, photo_url, exit_form)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, timestamp`,
      [userId, pos.id, gps_lat || null, gps_long || null, photo_url || null, JSON.stringify(exit_form || {})]
    );

    return res.status(201).json({
      success: true,
      message: 'Scan recorded successfully',
      data: {
        logId: logResult.rows[0].id,
        timestamp: logResult.rows[0].timestamp,
      },
    });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process scan',
      error: error.message,
    });
  }
});

export default router;
