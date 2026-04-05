// backend/src/modules/logs/logsService.js
// Logs service

import { query } from '../../db/connection.js';

export const logsService = {
  getLogs: async ({ userId, isAdmin, filters, pagination }) => {
    let queryStr = `
      SELECT
        l.id,
        l.personnel_id,
        p.nrp,
        p.name,
        p.rank,
        l.pos_id,
        pos.name as pos_name,
        l.type,
        l.latitude,
        l.longitude,
        l.photo_url,
        l.status,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
    `;

    const params = [];
    const conditions = [];

    if (!isAdmin) {
      conditions.push('l.personnel_id = $1');
      params.push(userId);
    }

    if (filters.pos_id) {
      conditions.push('l.pos_id = $' + (params.length + 1));
      params.push(filters.pos_id);
    }

    if (filters.type) {
      conditions.push('l.type = $' + (params.length + 1));
      params.push(filters.type);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY l.timestamp DESC';
    queryStr += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pagination.limit, pagination.offset);

    const result = await query(queryStr, params);
    return result.rows;
  },

  getLogById: async (id, userId, userRole) => {
    let queryStr = `
      SELECT
        l.id,
        l.personnel_id,
        p.nrp,
        p.name,
        p.rank,
        p.photo_url as profile_photo,
        l.pos_id,
        pos.name as pos_name,
        l.type,
        l.latitude,
        l.longitude,
        l.photo_url,
        l.status,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
      WHERE l.id = $1
    `;

    const params = [id];

    if (userRole !== 'admin') {
      queryStr += ' AND l.personnel_id = $2';
      params.push(userId);
    }

    const result = await query(queryStr, params);
    return result.rows[0] || null;
  },

  getDashboardStats: async () => {
    // Get POS status (active/inactive based on recent activity)
    const posStats = await query(`
      SELECT
        p.id,
        p.name,
        MAX(l.timestamp) as last_activity,
        CASE
          WHEN MAX(l.timestamp) > NOW() - INTERVAL '5 minutes' THEN 'ACTIVE'
          WHEN MAX(l.timestamp) > NOW() - INTERVAL '15 minutes' THEN 'DELAY'
          ELSE 'OFFLINE'
        END as status
      FROM pos p
      LEFT JOIN logs l ON p.id = l.pos_id
      GROUP BY p.id, p.name
      ORDER BY last_activity DESC NULLS LAST
    `);

    // Get personnel activity
    const personnelStats = await query(`
      SELECT
        p.id,
        p.nrp,
        p.name,
        p.rank,
        MAX(l.timestamp) as last_seen,
        pos.name as last_pos
      FROM personnel p
      LEFT JOIN logs l ON p.id = l.personnel_id
      LEFT JOIN pos ON l.pos_id = pos.id
      GROUP BY p.id, p.nrp, p.name, p.rank, pos.name
      ORDER BY last_seen DESC NULLS LAST
      LIMIT 20
    `);

    // Get recent logs
    const recentLogs = await query(`
      SELECT
        l.id,
        p.nrp,
        p.name,
        pos.name as pos_name,
        l.type,
        l.status,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
      ORDER BY l.timestamp DESC
      LIMIT 10
    `);

    return {
      posStats: posStats.rows,
      personnelStats: personnelStats.rows,
      recentLogs: recentLogs.rows,
    };
  },
};