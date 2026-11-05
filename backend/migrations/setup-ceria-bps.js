const pool = require('../dbPostgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'ceria_bps_schema.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ CERIA BPS Tables created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error running migration:', err);
        process.exit(1);
    }
}

runMigration();
