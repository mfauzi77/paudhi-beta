// migrations/create_feedback_table.js
const pool = require('../dbPostgres');

async function createFeedbackTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        screenshot_url TEXT,
        
        -- System auto-collected
        page_url TEXT,
        browser VARCHAR(300),
        device_type VARCHAR(50),
        user_agent TEXT,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
    `);

    await client.query('COMMIT');
    console.log('✅ Feedback table created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createFeedbackTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createFeedbackTable;
