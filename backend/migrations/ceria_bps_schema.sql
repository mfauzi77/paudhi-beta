-- Create BPS Settings table
CREATE TABLE IF NOT EXISTS ceria_bps_settings (
    id SERIAL PRIMARY KEY,
    api_key TEXT NOT NULL,
    base_url TEXT DEFAULT 'https://webapi.bps.go.id/v1/api',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default or empty row if not exists
INSERT INTO ceria_bps_settings (api_key) 
SELECT '' WHERE NOT EXISTS (SELECT 1 FROM ceria_bps_settings);

-- Create BPS Indicators table
CREATE TABLE IF NOT EXISTS ceria_bps_indicators (
    id SERIAL PRIMARY KEY,
    bps_var_id INTEGER UNIQUE NOT NULL,
    label TEXT NOT NULL,
    unit TEXT,
    description TEXT,
    last_sync TIMESTAMP
);

-- Create BPS Data table
CREATE TABLE IF NOT EXISTS ceria_bps_data (
    id SERIAL PRIMARY KEY,
    indicator_id INTEGER REFERENCES ceria_bps_indicators(id) ON DELETE CASCADE,
    region_id INTEGER NOT NULL,
    region_name TEXT NOT NULL,
    value NUMERIC(10, 2),
    period TEXT NOT NULL,
    period_year TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(indicator_id, region_id, period)
);

-- Add sample or initial indicator for IPM if needed, or leave it for the sync process
