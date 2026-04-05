// backend/src/modules/alerts/alertController.js
// Alert controller

import { alertService } from './alertService.js';

export const alertController = {
  // Get active alerts
  getActiveAlerts: async (req, res) => {
    try {
      const alerts = await alertService.getActiveAlerts();

      res.status(200).json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      console.error('Error getting active alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active alerts',
        error: error.message,
      });
    }
  },

  // Get alert history with filters
  getAlertHistory: async (req, res) => {
    try {
      const { type, severity, acknowledged, page = 1, limit = 50 } = req.query;

      const filters = {};
      if (type) filters.type = type;
      if (severity) filters.severity = severity;
      if (acknowledged !== undefined) filters.acknowledged = acknowledged === 'true';

      const pagination = {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      const alerts = await alertService.getAlertHistory(filters, pagination);

      res.status(200).json({
        success: true,
        data: alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Error getting alert history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get alert history',
        error: error.message,
      });
    }
  },

  // Acknowledge alert
  acknowledgeAlert: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id; // From JWT middleware

      const result = await alertService.acknowledgeAlert(id, adminId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Alert acknowledged successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert',
        error: error.message,
      });
    }
  },

  // Create manual alert (admin only)
  createAlert: async (req, res) => {
    try {
      const { type, severity, pos_id, personnel_id, message, data } = req.body;

      const alert = {
        type,
        severity,
        pos_id,
        personnel_id,
        message,
        data: data || {},
        timestamp: new Date(),
      };

      const result = await alertService.createAlertLog(alert);

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create alert',
        error: error.message,
      });
    }
  },
};