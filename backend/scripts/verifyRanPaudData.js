const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ceria_paudhi',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

async function verify() {
  try {
    const res = await pool.query('SELECT status, count(*) FROM ran_paud GROUP BY status');
    console.log('RAN PAUD Status Counts:', res.rows);
    
    const sample = await pool.query('SELECT id, status, program FROM ran_paud LIMIT 3');
    console.log('Sample Records:', sample.rows);
    
    // If none are published, report it
    const hasPublished = res.rows.some(r => r.status === 'publish');
    if (!hasPublished && res.rows.length > 0) {
      console.log('WARNING: No records are in "publish" status. Public dashboard will be empty.');
    }
  } catch (err) {
    console.error('Error verifying RAN PAUD data:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
