// Test PostgreSQL connection
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'paudhi_local',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

async function testConnection() {
  try {
    console.log('🔌 Testing PostgreSQL connection...\n');
    console.log('Config:');
    console.log(`   Host: ${process.env.PGHOST || 'localhost'}`);
    console.log(`   Database: ${process.env.PGDATABASE || 'paudhi_local'}`);
    console.log(`   User: ${process.env.PGUSER || 'postgres'}`);
    console.log(`   Port: ${process.env.PGPORT || '5432'}\n`);

    const client = await pool.connect();
    console.log('✅ PostgreSQL connection successful!\n');

    // Test query
    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('📊 Database Info:');
    console.log(`   Current Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);

    // Check news table
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count FROM news
    `);
    console.log(`📰 News table: ${tableCheck.rows[0].count} rows\n`);

    client.release();
    await pool.end();
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
