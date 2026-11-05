const pool = require('./dbPostgres');
async function check() {
  try {
    const res = await pool.query('SELECT DISTINCT kl_id, kl_name FROM ran_paud WHERE is_active = true LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
