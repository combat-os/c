// backend/src/modules/qr/qrService.js
// QR Code scanning service

import { query } from '../../db/connection.js';
import { posService } from '../pos/posService.js';
import { validateGPSForPOS } from '../../utils/gpsValidator.js';

export const qrService = {
  processScan: async ({ qr_code_id, type, userId, gps_lat, gps_long, photo_url }) => {
    // Validate QR code and get POS
    const pos = await posService.getPOSByQR(qr_code_id);
    if (!pos) {
      throw new Error('Invalid QR code');
    }

    // Validate GPS if provided
    let status = 'SUCCESS';
    let gpsValidation = null;
    if (gps_lat && gps_long) {
      gpsValidation = validateGPSForPOS(gps_lat, gps_long, pos);
      if (!gpsValidation.valid) {
        status = 'GPS_INVALID';
      }
    }

    // Insert scan log
    const result = await query(
      `INSERT INTO logs (personnel_id, pos_id, type, latitude, longitude, photo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, timestamp`,
      [
        userId,
        pos.id,
        type,
        gps_lat || null,
        gps_long || null,
        photo_url || null,
        status,
      ]
    );

    return {
      logId: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      pos: {
        id: pos.id,
        name: pos.name,
      },
      gpsValidation,
      status,
    };
  },

  getScanHistory: async (userId, limit) => {
    const result = await query(
      `SELECT
        l.id,
        l.pos_id,
        p.name as pos_name,
        l.type,
        l.latitude,
        l.longitude,
        l.photo_url,
        l.status,
        l.timestamp
      FROM logs l
      JOIN pos p ON l.pos_id = p.id
      WHERE l.personnel_id = $1
      ORDER BY l.timestamp DESC
      LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  },
};