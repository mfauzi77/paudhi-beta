const pool = require('../dbPostgres');

async function fixSchema() {
  try {
    console.log('⏳ Adding missing columns to "news" table...');

    // Add published_at column
    await pool.query(`
      ALTER TABLE news 
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
    `);
    
    console.log('✅ Column "published_at" added or already exists.');
    
    // Also verify image type (some scripts used VARCHAR(500), others TEXT)
    // Let's ensure it's TEXT to be safe for long URLs
    await pool.query(`
      ALTER TABLE news 
      ALTER COLUMN image TYPE TEXT;
    `);
    console.log('✅ Column "image" ensured as TEXT type.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing news schema:', err);
    process.exit(1);
  }
}

fixSchema();
