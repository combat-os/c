// backend/src/modules/alerts/alertService.js
// Alert service for monitoring and notifications

import { query } from '../../db/connection.js';

export const alertService = {
  // Check for alerts based on POS activity
  checkPOSAlerts: async () => {
    const alerts = [];

    // Check for offline POS (no activity in last 30 minutes)
    const offlinePOS = await query(`
      SELECT
        p.id,
        p.name,
        MAX(l.timestamp) as last_activity
      FROM pos p
      LEFT JOIN logs l ON p.id = l.pos_id
      GROUP BY p.id, p.name
      HAVING MAX(l.timestamp) < NOW() - INTERVAL '30 minutes'
         OR MAX(l.timestamp) IS NULL
    `);

    offlinePOS.rows.forEach(pos => {
      alerts.push({
        type: 'POS_OFFLINE',
        severity: 'HIGH',
        pos_id: pos.id,
        pos_name: pos.name,
        message: `POS ${pos.name} tidak aktif selama lebih dari 30 menit`,
        timestamp: new Date(),
      });
    });

    // Check for unusual activity patterns
    const unusualActivity = await query(`
      SELECT
        p.id,
        p.name,
        COUNT(l.id) as activity_count,
        MAX(l.timestamp) as last_activity
      FROM pos p
      LEFT JOIN logs l ON p.id = l.pos_id
        AND l.timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY p.id, p.name
      HAVING COUNT(l.id) > 20  -- More than 20 activities per hour
    `);

    unusualActivity.rows.forEach(pos => {
      alerts.push({
        type: 'HIGH_ACTIVITY',
        severity: 'MEDIUM',
        pos_id: pos.id,
        pos_name: pos.name,
        message: `POS ${pos.name} memiliki aktivitas tinggi (${pos.activity_count} aktivitas/jam)`,
        timestamp: new Date(),
      });
    });

    return alerts;
  },

  // Check for personnel alerts
  checkPersonnelAlerts: async () => {
    const alerts = [];

    // Check for personnel not reporting (no activity in last 2 hours)
    const inactivePersonnel = await query(`
      SELECT
        p.id,
        p.nrp,
        p.name,
        MAX(l.timestamp) as last_activity
      FROM personnel p
      LEFT JOIN logs l ON p.id = l.personnel_id
      GROUP BY p.id, p.nrp, p.name
      HAVING MAX(l.timestamp) < NOW() - INTERVAL '2 hours'
         OR MAX(l.timestamp) IS NULL
    `);

    inactivePersonnel.rows.forEach(personnel => {
      alerts.push({
        type: 'PERSONNEL_INACTIVE',
        severity: 'MEDIUM',
        personnel_id: personnel.id,
        personnel_nrp: personnel.nrp,
        personnel_name: personnel.name,
        message: `Personel ${personnel.nrp} - ${personnel.name} tidak aktif selama lebih dari 2 jam`,
        timestamp: new Date(),
      });
    });

    // Check for GPS validation failures
    const gpsFailures = await query(`
      SELECT
        l.id,
        p.nrp,
        p.name,
        pos.name as pos_name,
        l.latitude,
        l.longitude,
        l.timestamp
      FROM logs l
      JOIN personnel p ON l.personnel_id = p.id
      JOIN pos ON l.pos_id = pos.id
      WHERE l.status = 'GPS_INVALID'
        AND l.timestamp > NOW() - INTERVAL '1 hour'
    `);

    gpsFailures.rows.forEach(log => {
      alerts.push({
        type: 'GPS_VALIDATION_FAILED',
        severity: 'HIGH',
        log_id: log.id,
        personnel_nrp: log.nrp,
        personnel_name: log.name,
        pos_name: log.pos_name,
        message: `Validasi GPS gagal untuk ${log.nrp} di POS ${log.pos_name}`,
        timestamp: new Date(),
      });
    });

    return alerts;
  },

  // Get all active alerts
  getActiveAlerts: async () => {
    const posAlerts = await this.checkPOSAlerts();
    const personnelAlerts = await this.checkPersonnelAlerts();

    return [...posAlerts, ...personnelAlerts].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Create alert log entry
  createAlertLog: async (alert) => {
    const result = await query(`
      INSERT INTO alerts (type, severity, pos_id, personnel_id, message, data, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      alert.type,
      alert.severity,
      alert.pos_id || null,
      alert.personnel_id || null,
      alert.message,
      JSON.stringify(alert),
      alert.timestamp,
    ]);

    return result.rows[0];
  },

  // Get alert history
  getAlertHistory: async (filters = {}, pagination = { limit: 50, offset: 0 }) => {
    let queryStr = `
      SELECT
        a.id,
        a.type,
        a.severity,
        a.pos_id,
        p.name as pos_name,
        a.personnel_id,
        pers.nrp,
        pers.name as personnel_name,
        a.message,
        a.data,
        a.timestamp,
        a.acknowledged
      FROM alerts a
      LEFT JOIN pos p ON a.pos_id = p.id
      LEFT JOIN personnel pers ON a.personnel_id = pers.id
    `;

    const params = [];
    const conditions = [];

    if (filters.type) {
      conditions.push('a.type = $' + (params.length + 1));
      params.push(filters.type);
    }

    if (filters.severity) {
      conditions.push('a.severity = $' + (params.length + 1));
      params.push(filters.severity);
    }

    if (filters.acknowledged !== undefined) {
      conditions.push('a.acknowledged = $' + (params.length + 1));
      params.push(filters.acknowledged);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    queryStr += ' ORDER BY a.timestamp DESC';
    queryStr += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pagination.limit, pagination.offset);

    const result = await query(queryStr, params);
    return result.rows;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId, adminId) => {
    const result = await query(`
      UPDATE alerts
      SET acknowledged = true, acknowledged_by = $2, acknowledged_at = NOW()
      WHERE id = $1
      RETURNING id, acknowledged, acknowledged_at
    `, [alertId, adminId]);

    return result.rows[0] || null;
  },
};