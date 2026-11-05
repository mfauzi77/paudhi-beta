const pool = require('../dbPostgres');

async function debug() {
  try {
    const res = await pool.query('SELECT * FROM news LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debug();
