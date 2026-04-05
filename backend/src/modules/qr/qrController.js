// backend/src/modules/qr/qrController.js
// QR Code scanning controller

import { qrService } from './qrService.js';

export const scanQR = async (req, res) => {
  try {
    const { qr_code_id, type, gps_lat, gps_long, photo_url } = req.body;
    const userId = req.user.id;

    const result = await qrService.processScan({
      qr_code_id,
      type: type || 'ENTRY',
      userId,
      gps_lat,
      gps_long,
      photo_url,
    });

    // If GPS validation failed, return warning but still record the scan
    if (result.status === 'GPS_INVALID') {
      return res.status(201).json({
        success: true,
        message: 'Scan recorded with GPS validation warning',
        warning: result.gpsValidation.message,
        data: result,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Scan recorded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error processing scan:', error);

    // Return appropriate error based on error type
    if (error.message.includes('Invalid QR code')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process scan',
    });
  }
};

export const getScanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const scans = await qrService.getScanHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: scans,
      count: scans.length,
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history',
    });
  }
};