const pool = require('../dbPostgres');

async function createNewsTable() {
  try {
    console.log('⏳ Creating/Recreating News Table...');

    // Drop first to fix schema if it exists with wrong type
    await pool.query('DROP TABLE IF EXISTS news');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        image TEXT,
        category VARCHAR(50) DEFAULT 'General',
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'draft',
        source VARCHAR(50) DEFAULT 'original',
        author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table "news" created successfully with author_id as TEXT');
  } catch (err) {
    console.error('❌ Error creating news table:', err);
  } finally {
    process.exit(0);
  }
}

createNewsTable();
