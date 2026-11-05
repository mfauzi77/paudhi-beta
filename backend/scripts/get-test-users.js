const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ceria_paudhi',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

async function getUsers() {
    try {
        const roles = ['admin_utama', 'super_admin', 'admin', 'admin_daerah'];
        for (const role of roles) {
            const res = await pool.query('SELECT id, username, role FROM users WHERE role = $1 LIMIT 1', [role]);
            if (res.rows.length > 0) {
                console.log(`Found ${role}:`, res.rows[0]);
            } else {
                console.log(`No user found for role: ${role}`);
            }
        }
        await pool.end();
    } catch (e) {
        console.error(e);
    }
}
getUsers();
