-- COMBAT OS Database Seed Data

-- COMBAT OS Database Seed Data
-- SQLite compatible

-- Insert sample personnel
-- Replace these hashes in production with actual bcrypt hashes for 'password123'
INSERT INTO personnel (nrp, name, rank, role, password_hash, photo_url, is_active) VALUES
('P001', 'Kapten Budi Santoso', 'Kapten', 'admin', '$2a$12$example.hash', 'https://via.placeholder.com/150?text=P001', 1),
('P002', 'Sersan Ahmad Wijaya', 'Sersan', 'personel', '$2a$12$example.hash', 'https://via.placeholder.com/150?text=P002', 1),
('P003', 'Kopral Rini Kusuma', 'Kopral', 'personel', '$2a$12$example.hash', 'https://via.placeholder.com/150?text=P003', 1),
('P004', 'Prajurit Eko Saputra', 'Prajurit', 'personel', '$2a$12$example.hash', 'https://via.placeholder.com/150?text=P004', 1);

-- Insert sample POS (Checkpoints)
INSERT INTO pos (name, location, qr_code_id, latitude, longitude, radius_meters) VALUES
('POS 1 - Gate A', 'South Gate', 'QR-POS-001-GATE-A', -6.2088, 106.8456, 100),
('POS 2 - Barracks', 'Central Barracks', 'QR-POS-002-BARRACKS', -6.2095, 106.8465, 150),
('POS 3 - Admin Building', 'Administration', 'QR-POS-003-ADMIN', -6.2105, 106.8475, 80);

-- Insert sample logs
INSERT INTO logs (personnel_id, pos_id, type, latitude, longitude, photo_url, status, timestamp) VALUES
((SELECT id FROM personnel WHERE nrp = 'P001'), (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-001-GATE-A'), 'ENTRY', -6.2088, 106.8456, 'https://via.placeholder.com/300?text=Entry+Photo', 'SUCCESS', datetime('now', '-2 hours')),
((SELECT id FROM personnel WHERE nrp = 'P002'), (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-002-BARRACKS'), 'ENTRY', -6.2095, 106.8465, 'https://via.placeholder.com/300?text=Entry+Photo', 'SUCCESS', datetime('now', '-1 hour')),
((SELECT id FROM personnel WHERE nrp = 'P003'), (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-003-ADMIN'), 'ENTRY', -6.2105, 106.8475, 'https://via.placeholder.com/300?text=Entry+Photo', 'SUCCESS', datetime('now', '-30 minutes')),
((SELECT id FROM personnel WHERE nrp = 'P001'), (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-001-GATE-A'), 'EXIT', -6.2088, 106.8456, 'https://via.placeholder.com/300?text=Exit+Photo', 'SUCCESS', datetime('now', '-10 minutes'));

-- Insert sample alerts
INSERT INTO alerts (type, severity, pos_id, personnel_id, message, data, timestamp) VALUES
('POS_OFFLINE', 'HIGH', (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-001-GATE-A'), NULL, 'POS Gate A tidak aktif selama lebih dari 30 menit', '{"last_activity": "2024-01-01T10:00:00Z"}', datetime('now', '-45 minutes')),
('GPS_VALIDATION_FAILED', 'HIGH', (SELECT id FROM pos WHERE qr_code_id = 'QR-POS-002-BARRACKS'), (SELECT id FROM personnel WHERE nrp = 'P004'), 'Validasi GPS gagal untuk P004 di POS Barracks', '{"latitude": -6.2090, "longitude": 106.8460}', datetime('now', '-15 minutes'));
