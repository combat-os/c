// backend/src/middleware/auth.js
// JWT authentication middleware

import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js';

/**
 * Middleware to verify JWT token from Authorization header
 * Adds decoded user info to req.user
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please include Authorization header with "Bearer <token>".',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token, just sets req.user if valid
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    console.log('Optional auth failed, continuing without user context');
  }

  next();
};

export default { authMiddleware, optionalAuthMiddleware };
