const pool = require('../dbPostgres');

async function createAIHistoryTable() {
  try {
    console.log('⏳ Creating AI History Table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_history (
        id SERIAL PRIMARY KEY,
        app_owner VARCHAR(20) NOT NULL, -- 'CERIA' or 'SISMONEV'
        prompt_hash VARCHAR(64),
        prompt_preview TEXT,
        response TEXT,
        tokens_used INTEGER,
        model_used VARCHAR(50),
        status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'rate_limited'
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Index for strict data siloing
      CREATE INDEX IF NOT EXISTS idx_ai_history_app_owner ON ai_history(app_owner);
      CREATE INDEX IF NOT EXISTS idx_ai_history_created_at ON ai_history(created_at);
    `);
    
    console.log('✅ Table "ai_history" created successfully with app_owner index');
  } catch (err) {
    console.error('❌ Error creating ai_history table:', err);
  } finally {
    process.exit(0);
  }
}

createAIHistoryTable();
