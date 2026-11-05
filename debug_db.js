const pool = require('./backend/dbPostgres');

async function debugDatabase() {
    try {
        console.log('--- Checking ceria_bps_settings schema ---');
        const schema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ceria_bps_settings'
        `);
        console.table(schema.rows);

        console.log('--- Checking ceria_bps_settings data ---');
        const res = await pool.query('SELECT id, name, api_key, variable_id, base_url FROM ceria_bps_settings');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Database error:', err);
        process.exit(1);
    }
}

debugDatabase();
