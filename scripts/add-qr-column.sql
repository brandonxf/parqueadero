-- Add qr_code_data column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
