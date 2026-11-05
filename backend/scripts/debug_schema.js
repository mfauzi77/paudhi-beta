const pool = require('../dbPostgres');

async function debugSchema() {
  try {
    console.log('--- Connecting to DB ---');
    const client = await pool.connect();
    console.log('Connected.');

    // 1. Inspect News Table
    console.log('\n--- News Table Schema ---');
    const newsSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'news';
    `);
    console.table(newsSchema.rows);

    // 2. Inspect Users Table
    console.log('\n--- Users Table Schema ---');
    const usersSchema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    console.table(usersSchema.rows);

    // 3. Check for Constraints
    console.log('\n--- News Constraints ---');
    const constraints = await client.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'news'::regclass;
    `);
    constraints.rows.forEach(r => console.log(`${r.conname}: ${r.pg_get_constraintdef}`));

    // 4. Try Dummy Insert (Dry Run within Transaction)
    console.log('\n--- Test Insert ---');
    await client.query('BEGIN');
    
    // Fetch a valid user ID first
    const user = await client.query('SELECT id FROM users LIMIT 1');
    if (user.rows.length === 0) {
        console.log('❌ No users found to test insert.');
    } else {
        const userId = user.rows[0].id;
        console.log('Using User ID:', userId);
        
        try {
            const queryText = `
              INSERT INTO news 
              (title, content, excerpt, image, category, status, source, author_id) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
              RETURNING *`;
            
            const values = [
              'Debug Title', 'Debug Content', 'Debug Excerpt', null, 
              'General', 'draft', 'DebugSource', userId
            ];
            
            const res = await client.query(queryText, values);
            console.log('✅ Insert Successful! ID:', res.rows[0].id);
        } catch (err) {
            console.error('❌ Insert Failed:', err.message);
        }
    }

    await client.query('ROLLBACK'); // Rollback so we don't dirty the DB
    console.log('Transaction Rolled Back.');

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  }
}

debugSchema();
