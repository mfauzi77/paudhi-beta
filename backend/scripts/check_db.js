const pool = require('../dbPostgres');

async function check() {
  try {
    const res = await pool.query('SELECT app_owner, status, error_message, created_at FROM ai_history ORDER BY created_at DESC LIMIT 5');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
