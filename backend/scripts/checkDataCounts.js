const pool = require('../dbPostgres');

async function checkCounts() {
  try {
    const tables = ['users', 'news', 'faqs', 'pembelajaran', 'ran_paud'];
    console.log('--- Database Record Counts ---');
    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (err) {
        console.log(`${table}: ERROR - ${err.message}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();
