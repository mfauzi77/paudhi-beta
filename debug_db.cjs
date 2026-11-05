const pool = require('./backend/dbPostgres');

async function debugDatabase() {
    try {
        console.log('--- Checking ceria_bps_data for indicator_id 27 ---');
        const data = await pool.query("SELECT * FROM ceria_bps_data WHERE indicator_id = 27 LIMIT 10");
        console.table(data.rows);
        
        const count = await pool.query("SELECT COUNT(*) FROM ceria_bps_data WHERE indicator_id = 27");
        console.log('Total rows for indicator_id 27:', count.rows[0].count);
        process.exit(0);
    } catch (err) {
        console.error('Database error:', err);
        process.exit(1);
    }
}

debugDatabase();
