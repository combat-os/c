// backend/src/modules/logs/logsController.js
// Logs controller

import { logsService } from './logsService.js';

export const getLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role || 'prajurit';
    const { admin, pos_id, type, limit = 100, offset = 0 } = req.query;

    const isAdmin = admin === 'true' && userRole === 'admin';

    const logs = await logsService.getLogs({
      userId,
      isAdmin,
      filters: { pos_id, type },
      pagination: { limit: parseInt(limit), offset: parseInt(offset) },
    });

    return res.status(200).json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
    });
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role || 'prajurit';

    const log = await logsService.getLogById(id, userId, userRole);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch log',
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role || 'prajurit';

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const stats = await logsService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
};