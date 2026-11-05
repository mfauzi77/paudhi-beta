// Setup PostgreSQL database dan schema untuk News
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // First connect to default 'postgres' database to create our database
  const defaultClient = new Client({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: 'postgres', // Connect to default database first
    password: process.env.PGPASSWORD || '123123',
    port: parseInt(process.env.PGPORT) || 5432,
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await defaultClient.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check if database exists
    const dbName = process.env.PGDATABASE || 'paudhi_local';
    console.log(`🔍 Checking if database "${dbName}" exists...`);
    
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await defaultClient.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      console.log(`📦 Creating database "${dbName}"...`);
      await defaultClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created successfully\n`);
    } else {
      console.log(`✅ Database "${dbName}" already exists\n`);
    }

    await defaultClient.end();

    // Now connect to the new database and run the schema
    const appClient = new Client({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: dbName,
      password: process.env.PGPASSWORD || '123123',
      port: parseInt(process.env.PGPORT) || 5432,
    });

    console.log(`🔌 Connecting to database "${dbName}"...`);
    await appClient.connect();
    console.log(`✅ Connected to "${dbName}"\n`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'news_schema.sql');
    console.log(`📄 Reading schema file: ${schemaPath}`);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`🚀 Executing schema...`);
    
    await appClient.query(schemaSql);
    console.log(`✅ Schema executed successfully\n`);

    // Verify table creation
    const tableCheck = await appClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'news'
    `);

    if (tableCheck.rows.length > 0) {
      console.log(`✅ Table "news" created successfully`);
      
      // Check row count
      const countResult = await appClient.query('SELECT COUNT(*) FROM news');
      console.log(`📊 Current rows in news table: ${countResult.rows[0].count}\n`);
    } else {
      console.log(`❌ Table "news" not found`);
    }

    await appClient.end();
    console.log('✅ Setup complete!');
    console.log('\n🎉 PostgreSQL database dan schema sudah siap!');
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Restart backend server`);
    console.log(`   2. Test dengan: node migrations/testConnection.js`);
    console.log(`   3. (Optional) Migrate data: node migrations/migrateNews.js\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

setupDatabase();
