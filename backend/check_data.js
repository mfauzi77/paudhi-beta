const pool = require('./dbPostgres');

async function check() {
    try {
        const varId = '1360';
        const period = '125';
        
        console.log(`Checking data for bps_var_id: ${varId}, period: ${period}...`);
        
        const indicators = await pool.query('SELECT * FROM ceria_bps_indicators WHERE bps_var_id = $1', [varId]);
        console.log('Indicators found:', indicators.rows);
        
        if (indicators.rows.length > 0) {
            const data = await pool.query('SELECT COUNT(*) FROM ceria_bps_data WHERE indicator_id = $1 AND period = $2', [indicators.rows[0].id, period]);
            console.log('Data count for this period:', data.rows[0].count);
            
            const sample = await pool.query('SELECT * FROM ceria_bps_data WHERE indicator_id = $1 AND period = $2 LIMIT 3', [indicators.rows[0].id, period]);
            console.log('Sample data:', sample.rows);
        } else {
            console.log('No indicator found with that ID.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
