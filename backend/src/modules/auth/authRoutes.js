// backend/src/modules/auth/authRoutes.js
// Authentication routes

import express from 'express';
import { login, verify } from './authController.js';

const router = express.Router();

/**
 * POST /auth/login
 * Login with NRP and get JWT token
 */
router.post('/login', login);

/**
 * GET /auth/verify
 * Verify that a token is still valid
 */
router.get('/verify', verify);

export default router;