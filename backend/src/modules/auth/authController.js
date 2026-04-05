// backend/src/modules/auth/authController.js
// Authentication controller

import { authService } from './authService.js';

export const login = async (req, res) => {
  try {
    const { nrp } = req.body;

    if (!nrp) {
      return res.status(400).json({
        success: false,
        message: 'NRP is required',
      });
    }

    const result = await authService.login(nrp);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
};

export const verify = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};