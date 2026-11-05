const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'paudhi_local',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ PostgreSQL connected:', process.env.PGDATABASE);
    release();
  }
});

module.exports = pool;
