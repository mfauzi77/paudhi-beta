const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ceria_paudhi',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

async function publishAll() {
  try {
    console.log('Publishing all RAN PAUD records...');
    const res = await pool.query("UPDATE ran_paud SET status = 'publish' WHERE is_active = true RETURNING id");
    console.log(`✅ Successfully published ${res.rowCount} records.`);
  } catch (err) {
    console.error('Error publishing RAN PAUD data:', err.message);
  } finally {
    await pool.end();
  }
}

publishAll();
