// backend/src/routes/auth.js
// Authentication routes (login)

import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { query } from '../db/connection.js';
import { generateToken, extractTokenFromHeader, blacklistToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

/**
 * POST /auth/login
 * Login with NRP and password, get JWT token
 */
router.post('/login', loginLimiter, [
  body('nrp').notEmpty().withMessage('NRP is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { nrp, password } = req.body;

  try {
    const result = await query('SELECT * FROM personnel WHERE nrp = $1', [nrp]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_active !== 1) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await query('UPDATE personnel SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({
      id: user.id,
      nrp: user.nrp,
      name: user.name,
      rank: user.rank,
      role: user.role,
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
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /auth/verify
 * Verify JWT token and return user info
 */
router.get('/verify', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * POST /auth/logout
 * Logout by blacklisting the token
 */
router.post('/logout', authMiddleware, (req, res) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (token) {
    blacklistToken(token);
  }
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
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
