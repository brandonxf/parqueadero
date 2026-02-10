-- Parking Management System - Database Schema
-- Neon (PostgreSQL)

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT REFERENCES roles(id),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tipos de vehiculo
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  categoria VARCHAR(10) NOT NULL DEFAULT 'AUTO'
);

-- Espacios
CREATE TABLE IF NOT EXISTS espacios (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id),
  categoria VARCHAR(10) NOT NULL DEFAULT 'AUTO',
  disponible BOOLEAN DEFAULT true
);

-- Tarifas
CREATE TABLE IF NOT EXISTS tarifas (
  id SERIAL PRIMARY KEY,
  tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id),
  nombre VARCHAR(100) NOT NULL,
  tipo_cobro VARCHAR(20) CHECK (tipo_cobro IN ('POR_MINUTO', 'POR_HORA', 'POR_DIA', 'FRACCION')) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  activo BOOLEAN DEFAULT true,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE
);

-- Registros
CREATE TABLE IF NOT EXISTS registros (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) NOT NULL,
  tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id),
  espacio_id INT REFERENCES espacios(id),
  fecha_hora_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_hora_salida TIMESTAMP,
  minutos_totales INT,
  tarifa_id INT REFERENCES tarifas(id),
  valor_calculado DECIMAL(10,2),
  descuento DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2),
  estado VARCHAR(20) CHECK (estado IN ('EN_CURSO', 'FINALIZADO')) DEFAULT 'EN_CURSO',
  usuario_entrada_id INT REFERENCES usuarios(id),
  usuario_salida_id INT REFERENCES usuarios(id)
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  registro_id INT REFERENCES registros(id),
  codigo_ticket VARCHAR(50) UNIQUE NOT NULL,
  email_cliente VARCHAR(100),
  enviado_email BOOLEAN DEFAULT false,
  fecha_emision TIMESTAMP DEFAULT NOW()
);

-- Seed roles
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Configurar tarifas, gestionar usuarios, ver reportes'),
  ('Operario', 'Registrar entradas y salidas, generar tickets')
ON CONFLICT (nombre) DO NOTHING;

-- Seed vehicle types
INSERT INTO tipos_vehiculo (nombre, descripcion, categoria) VALUES
  ('Sedan', 'Vehiculo tipo sedan', 'AUTO'),
  ('Camioneta', 'Vehiculo tipo camioneta', 'AUTO'),
  ('Moto', 'Motocicleta', 'MOTO')
ON CONFLICT (nombre) DO NOTHING;

-- Seed 30 auto spaces (A-01 to A-30)
INSERT INTO espacios (codigo, tipo_vehiculo_id, categoria, disponible)
SELECT
  'A-' || LPAD(s::text, 2, '0'),
  NULL,
  'AUTO',
  true
FROM generate_series(1, 30) AS s
ON CONFLICT (codigo) DO NOTHING;

-- Seed 15 moto spaces (M-01 to M-15)
INSERT INTO espacios (codigo, tipo_vehiculo_id, categoria, disponible)
SELECT
  'M-' || LPAD(s::text, 2, '0'),
  NULL,
  'MOTO',
  true
FROM generate_series(1, 15) AS s
ON CONFLICT (codigo) DO NOTHING;

-- Seed default tariffs
INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, activo, fecha_inicio)
SELECT tv.id, 'Tarifa Hora ' || tv.nombre, 'POR_HORA',
  CASE
    WHEN tv.nombre = 'Sedan' THEN 5000.00
    WHEN tv.nombre = 'Camioneta' THEN 7000.00
    WHEN tv.nombre = 'Moto' THEN 3000.00
  END,
  true,
  CURRENT_DATE
FROM tipos_vehiculo tv
WHERE NOT EXISTS (SELECT 1 FROM tarifas WHERE tipo_vehiculo_id = tv.id AND activo = true);
