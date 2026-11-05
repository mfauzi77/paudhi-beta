const pool = require('./dbPostgres');

async function checkData() {
  try {
    const res = await pool.query('SELECT count(*) FROM ran_paud');
    console.log('Total rows:', res.rows[0].count);
    
    const sample = await pool.query('SELECT kl_name, program, status, is_active FROM ran_paud LIMIT 5');
    console.log('Sample data:', JSON.stringify(sample.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
