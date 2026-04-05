// backend/src/modules/pos/posService.js
// POS (Guard Post) service

import { query } from '../../db/connection.js';

export const posService = {
  getAllPOS: async () => {
    const result = await query(
      'SELECT id, name, latitude, longitude, radius, qr_code FROM pos ORDER BY name'
    );
    return result.rows;
  },

  getPOSById: async (id) => {
    const result = await query(
      'SELECT id, name, latitude, longitude, radius, qr_code FROM pos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  getPOSByQR: async (qrCode) => {
    const result = await query(
      'SELECT id, name, latitude, longitude, radius, qr_code FROM pos WHERE qr_code = $1',
      [qrCode]
    );
    return result.rows[0] || null;
  },

  createPOS: async (posData) => {
    const { name, latitude, longitude, radius, qr_code } = posData;

    const result = await query(
      `INSERT INTO pos (name, latitude, longitude, radius, qr_code)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, latitude, longitude, radius, qr_code`,
      [name, latitude, longitude, radius, qr_code]
    );

    return result.rows[0];
  },

  updatePOS: async (id, posData) => {
    const { name, latitude, longitude, radius, qr_code } = posData;

    const result = await query(
      `UPDATE pos SET name = $1, latitude = $2, longitude = $3, radius = $4, qr_code = $5
       WHERE id = $6
       RETURNING id, name, latitude, longitude, radius, qr_code`,
      [name, latitude, longitude, radius, qr_code, id]
    );

    return result.rows[0] || null;
  },

  deletePOS: async (id) => {
    const result = await query('DELETE FROM pos WHERE id = $1', [id]);
    return result.rowCount > 0;
  },
};