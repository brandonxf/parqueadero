-- Seed default users
-- Admin user
INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
VALUES ('Administrador', 'admin@parkcontrol.com', 'admin123', 1, true)
ON CONFLICT (email) DO NOTHING;

-- Operario user
INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
VALUES ('Operario Demo', 'operario@parkcontrol.com', 'operario123', 2, true)
ON CONFLICT (email) DO NOTHING;
