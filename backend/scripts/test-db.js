const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('--- PostgreSQL Connection Test ---');
console.log('Environment Variables Loaded:');
console.log(`PGUSER: ${process.env.PGUSER}`);
console.log(`PGHOST: ${process.env.PGHOST}`);
console.log(`PGDATABASE: ${process.env.PGDATABASE}`);
console.log(`PGPORT: ${process.env.PGPORT}`);
console.log(`PGPASSWORD: ${process.env.PGPASSWORD ? '****' : '(not set)'}`);

const client = new Client({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'paudhi_local',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

async function testConnection() {
  try {
    console.log('\nConnecting...');
    await client.connect();
    console.log('✅ Connection SUCCESSFUL!');
    
    const res = await client.query('SELECT NOW(), current_database()');
    console.log('Query Result:', res.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('\n❌ Connection FAILED:', err);
    if (err.code === '28P01') {
        console.error('Hint: Password authentication failed for user.');
    } else if (err.code === '3D000') {
        console.error('Hint: Database does not exist.');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('Hint: Is PostgreSQL running? Check if port 5432 is open.');
    }
  }
}

testConnection();
