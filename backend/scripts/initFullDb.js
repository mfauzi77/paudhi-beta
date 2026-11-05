const pool = require('../dbPostgres');

async function initDb() {
  try {
    console.log('⏳ Initializing PostgreSQL Database Tables...');

    // 1. Users Table
    // We use TEXT for id to preserve MongoDB _id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin_kl',
        kl_id VARCHAR(50),
        kl_name VARCHAR(255),
        region_name VARCHAR(100),
        province VARCHAR(100),
        city VARCHAR(100),
        permissions JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'approved'");
    console.log('✅ Table "users" ready');

    // 2. FAQs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        tags TEXT[],
        is_active BOOLEAN DEFAULT true,
        "order" INTEGER DEFAULT 0,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "faqs" ready');

    // 3. Pembelajaran Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pembelajaran (
        id TEXT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('panduan', 'video', 'tools')),
        category VARCHAR(100),
        author VARCHAR(100),
        age_group VARCHAR(50),
        aspect VARCHAR(50),
        tags TEXT[],
        stakeholder VARCHAR(100),
        thumbnail TEXT,
        
        -- Type specific fields
        pdf_url TEXT,
        youtube_id VARCHAR(50),
        duration VARCHAR(20),
        format VARCHAR(50),
        features TEXT[],
        usage TEXT,
        pages INTEGER,

        -- Stats
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 0,

        is_active BOOLEAN DEFAULT true,
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_by_fullname VARCHAR(255),
        created_by_kl VARCHAR(255),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "pembelajaran" ready');

    // 4. RAN PAUD Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ran_paud (
        id TEXT PRIMARY KEY,
        kl_id VARCHAR(50) NOT NULL,
        kl_name VARCHAR(255) NOT NULL,
        program TEXT NOT NULL,
        jumlah_ro INTEGER DEFAULT 0,
        
        -- Complex nested data stored as JSONB
        indikators JSONB DEFAULT '[]',
        
        -- Approval System
        status VARCHAR(20) DEFAULT 'draft',
        approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        submitted_at TIMESTAMP,
        
        -- Admin Daerah specific
        regulation_doc_name VARCHAR(255),
        regulation_doc_url TEXT,
        
        is_active BOOLEAN DEFAULT true,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "ran_paud" ready');

    console.log('\n🚀 All tables initialized successfully!');
  } catch (err) {
    console.error('❌ Error initializing tables:', err);
  } finally {
    // Keep pool open if running from another script, or just log done
    // process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  initDb().then(() => process.exit(0));
}

module.exports = initDb;
