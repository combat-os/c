// backend/src/modules/auth/authService.js
// Authentication service

import { query } from '../../db/connection.js';
import { generateToken } from '../../utils/jwt.js';

export const authService = {
  login: async (nrp) => {
    // Find personnel by NRP
    const result = await query('SELECT * FROM personnel WHERE nrp = $1', [nrp]);

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      nrp: user.nrp,
      name: user.name,
      rank: user.rank,
      role: user.role || 'prajurit', // Default role
    });

    return {
      token,
      user: {
        id: user.id,
        nrp: user.nrp,
        name: user.name,
        rank: user.rank,
        role: user.role || 'prajurit',
        photoUrl: user.photo_url,
      },
    };
  },
};