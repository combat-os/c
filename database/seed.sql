-- COMBAT OS Database Seed Data

-- COMBAT OS Database Seed Data
-- SQLite compatible

-- Insert sample personnel
INSERT INTO personnel (nrp, name, rank, photo_url) VALUES
('P001', 'Kapten Budi Santoso', 'Kapten', 'https://via.placeholder.com/150?text=P001'),
('P002', 'Sersan Ahmad Wijaya', 'Sersan', 'https://via.placeholder.com/150?text=P002'),
('P003', 'Kopral Rini Kusuma', 'Kopral', 'https://via.placeholder.com/150?text=P003'),
('P004', 'Prajurit Eko Saputra', 'Prajurit', 'https://via.placeholder.com/150?text=P004');

-- Insert sample POS (Checkpoints)
INSERT INTO pos (name, location, qr_code_id, latitude, longitude, radius_meters) VALUES
('POS 1 - Gate A', 'South Gate', 'QR-POS-001-GATE-A', -6.2088, 106.8456, 100),
('POS 2 - Barracks', 'Central Barracks', 'QR-POS-002-BARRACKS', -6.2095, 106.8465, 150),
('POS 3 - Admin Building', 'Administration', 'QR-POS-003-ADMIN', -6.2105, 106.8475, 80);
