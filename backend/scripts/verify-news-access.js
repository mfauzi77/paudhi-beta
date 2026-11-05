const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api/news';
const JWT_SECRET = process.env.JWT_SECRET;
const pool = require('../dbPostgres'); // Need DB access

async function getRealUser(role) {
    const res = await pool.query("SELECT id FROM users WHERE role = $1 LIMIT 1", [role]);
    if (res.rows.length === 0) {
        throw new Error(`No user found with role: ${role}`);
    }
    return res.rows[0].id;
}

// Generates a token for a user object { userId, role }
function generateToken(user) {
    return jwt.sign({ userId: user.userId, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

async function createDummyNews(authorId, title) {
    const res = await pool.query(
        "INSERT INTO news (title, content, status, author_id) VALUES ($1, 'Content', 'publish', $2) RETURNING id", 
        [title, authorId]
    );
    return res.rows[0].id;
}

async function test() {
    console.log('--- News Permission Verification ---');
    
    let otherNewsId = null;
    let ownNewsId = null;
    let adminUtamaId = null;
    let adminDaerahId = null;

    try {
        // 1. Fetch Real Users
        try {
            adminUtamaId = await getRealUser('super_admin');
            adminDaerahId = await getRealUser('admin_daerah');
            console.log(`Using SuperAdmin ID: ${adminUtamaId}`);
            console.log(`Using AdminDaerah ID: ${adminDaerahId}`);
        } catch (e) {
            console.error('Skipping test: ' + e.message);
            return;
        }

        const adminDaerahUser = { userId: adminDaerahId, role: 'admin_daerah' };
        const tokenDaerah = generateToken(adminDaerahUser);

        // 2. Setup News Data
        // Create news owned by "Super Admin"
        otherNewsId = await createDummyNews(adminUtamaId, 'News by SuperAdmin');
        // Create news owned by "Admin Daerah"
        ownNewsId = await createDummyNews(adminDaerahId, 'News by Admin Daerah');
        
        console.log(`Created Other News ID: ${otherNewsId}`);
        console.log(`Created Own News ID: ${ownNewsId}`);

        // 2. Test EDIT Permission
        console.log('\n2. Testing EDIT Permission...');
        
        // A. Edit Other's News (Should FAIL)
        try {
            const res = await fetch(`${BASE_URL}/${otherNewsId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${tokenDaerah}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'Hacked Title' })
            });
            const data = await res.json();
            if (res.status === 403) {
                console.log('✅ Verified: Cannot edit others news (403 Forbidden).');
            } else {
                console.error(`❌ FAILURE: Expected 403, got ${res.status}. Msg: ${data.message}`);
            }
        } catch (e) { console.error('❌ Request Failed:', e.message); }

        // B. Edit Own News (Should PASS)
        try {
            const res = await fetch(`${BASE_URL}/${ownNewsId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${tokenDaerah}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'Updated Title' })
            });
            const data = await res.json();
            if (res.ok) {
                console.log('✅ Verified: Can edit own news.');
            } else {
                console.error(`❌ FAILURE: Expected 200, got ${res.status}. Msg: ${data.message}`);
            }
        } catch (e) { console.error('❌ Request Failed:', e.message); }


        // 3. Test DELETE Permission
        console.log('\n3. Testing DELETE Permission...');

        // A. Delete Other's News (Should FAIL)
        try {
            const res = await fetch(`${BASE_URL}/${otherNewsId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokenDaerah}` }
            });
            const data = await res.json();
            if (res.status === 403) {
                console.log('✅ Verified: Cannot delete others news (403 Forbidden).');
            } else {
                console.error(`❌ FAILURE: Expected 403, got ${res.status}. Msg: ${data.message}`);
            }
        } catch (e) { console.error('❌ Request Failed:', e.message); }

        // B. Delete Own News (Should PASS)
        try {
            const res = await fetch(`${BASE_URL}/${ownNewsId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${tokenDaerah}` }
            });
            const data = await res.json();
            if (res.ok) {
                console.log('✅ Verified: Can delete own news.');
            } else {
                console.error(`❌ FAILURE: Expected 200, got ${res.status}. Msg: ${data.message}`);
            }
        } catch (e) { console.error('❌ Request Failed:', e.message); }


    } catch (err) {
        console.error('Unexpected setup error:', err);
    } finally {
        // Cleanup remaining dummy data
        if (otherNewsId) await pool.query("DELETE FROM news WHERE id = $1", [otherNewsId]);
        // Own news should be deleted by test, but cleanup just in case
        if (ownNewsId) await pool.query("DELETE FROM news WHERE id = $1", [ownNewsId]);
        await pool.end();
    }
}

test();
