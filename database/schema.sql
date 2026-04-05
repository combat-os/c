-- COMBAT OS Database Schema
-- SQLite compatible

-- Personnel Table
CREATE TABLE personnel (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        nrp TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
            rank TEXT,
              role TEXT NOT NULL DEFAULT 'personel' CHECK(role IN ('admin', 'personel')),
                password_hash TEXT NOT NULL,
                  photo_url TEXT,
                    is_active INTEGER NOT NULL DEFAULT 1,
                      last_login DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pos (Checkpoint) Table
CREATE TABLE pos (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT NOT NULL,
  location TEXT,
  qr_code_id TEXT UNIQUE NOT NULL,
  latitude REAL,
  longitude REAL,
  radius_meters INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Logs Table (Scan Records)
CREATE TABLE logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  personnel_id TEXT NOT NULL,
  pos_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ENTRY' CHECK (type IN ('ENTRY', 'EXIT', 'PATROL', 'ALERT')),
  latitude REAL,
  longitude REAL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'GPS_INVALID', 'QR_INVALID', 'ERROR')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personnel_id) REFERENCES personnel(id),
  FOREIGN KEY (pos_id) REFERENCES pos(id)
);

-- Index for faster queries
CREATE INDEX idx_logs_personnel_id ON logs(personnel_id);
CREATE INDEX idx_logs_pos_id ON logs(pos_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_type ON logs(type);
CREATE INDEX idx_logs_status ON logs(status);
CREATE INDEX idx_personnel_nrp ON personnel(nrp);

-- Alerts Table (Monitoring and Notifications)
CREATE TABLE alerts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  type TEXT NOT NULL CHECK (type IN ('POS_OFFLINE', 'HIGH_ACTIVITY', 'PERSONNEL_INACTIVE', 'GPS_VALIDATION_FAILED', 'MANUAL')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  pos_id TEXT,
  personnel_id TEXT,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',
  acknowledged INTEGER DEFAULT 0,
  acknowledged_by TEXT,
  acknowledged_at DATETIME,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pos_id) REFERENCES pos(id),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id),
  FOREIGN KEY (acknowledged_by) REFERENCES personnel(id)
);

-- Index for alerts
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- Modules Metadata Table (for future extensibility)
CREATE TABLE modules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  name TEXT UNIQUE NOT NULL,
  enabled INTEGER DEFAULT 0,
  config TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert core modules
INSERT INTO modules (name, enabled, config) VALUES
('personnel', 1, '{"description": "Personnel management core module"}'),
('qr_scan', 1, '{"description": "QR code scanning module"}'),
('exit_form', 1, '{"description": "Exit form module"}'),
('photo_upload', 1, '{"description": "Photo capture and upload module"}'),
('logistics', 0, '{"description": "Logistics management module"}'),
('security', 0, '{"description": "Security tools module"}'),
('training', 0, '{"description": "Training management module"}');
