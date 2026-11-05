const pool = require('./dbPostgres');
require('dotenv').config();

async function run() {
    try {
        console.log('--- Database Migration: Dropping Not-Null Constraints ---');
        await pool.query('ALTER TABLE ceria_bps_settings ALTER COLUMN api_key DROP NOT NULL;');
        await pool.query('ALTER TABLE ceria_bps_settings ALTER COLUMN variable_id DROP NOT NULL;');
        await pool.query('ALTER TABLE ceria_bps_settings ALTER COLUMN base_url DROP NOT NULL;');
        console.log('✅ Success: Columns are now nullable.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

run();
