// backend/src/routes/auth.js
// Authentication routes (login)

import express from 'express';
import { query } from '../db/connection.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * POST /auth/login
 * Login with NRP (military ID) and get JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { nrp, password } = req.body;

    // Validate input
    if (!nrp) {
      return res.status(400).json({
        success: false,
        message: 'NRP is required',
      });
    }

    // Find personnel by NRP
    const result = await query('SELECT * FROM personnel WHERE nrp = $1', [nrp]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      nrp: user.nrp,
      name: user.name,
      rank: user.rank,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        nrp: user.nrp,
        name: user.name,
        rank: user.rank,
        photoUrl: user.photo_url,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * GET /auth/verify
 * Verify that a token is still valid
 */
router.get('/verify', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No authenticated user',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

export default router;
