const pool = require('../dbPostgres');
const bcrypt = require('bcryptjs');

async function seedUser() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const userId = 'admin-initial-id';
    
    // Check if user exists
    const check = await pool.query('SELECT id FROM users WHERE email = $1', ['superadmin@paud.id']);
    if (check.rows.length > 0) {
      console.log('✅ Super Admin already exists.');
      return;
    }

    await pool.query(`
      INSERT INTO users (id, username, email, password, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      'superadmin',
      'superadmin@paud.id',
      passwordHash,
      'Super Administrator',
      'super_admin',
      true
    ]);

    console.log('✅ Super Admin created successfully.');
    console.log('Email: superadmin@paud.id');
    console.log('Password: admin123');

  } catch (err) {
    console.error('❌ Error seeding user:', err);
  } finally {
    pool.end();
  }
}

seedUser();
