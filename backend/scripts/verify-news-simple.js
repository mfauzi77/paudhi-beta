const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const BASE_URL = 'http://localhost:5000/api/news';
const JWT_SECRET = process.env.JWT_SECRET || 'paud-hi-super-secret-jwt-key-2025-kemenko-pmk';

// Mock Users
const adminDaerah = {
    userId: 'test-admin-daerah',
    role: 'admin_daerah',
    // other fields required by verifyToken logic in auth.js if it checks DB? 
    // auth.js checks DB! So we can't just forge a random ID unless we insert it or mock the DB lookup.
    // However, verifyToken fetches from DB. If user not found, it errors.
    // We should try to use an EXISTING user or skip DB check?
    // The middleware calls `jwt.verify` THEN `pool.query`.
    // So we need a real user ID.
    // Let's use a public fetch first to see if server is up.
};

async function test() {
    console.log('--- News Access Verification ---');
    try {
        // 1. Test Public Access (No Token)
        console.log('\nTesting Public Access (GET /)...');
        try {
            const res = await axios.get(BASE_URL);
            console.log(`✅ Success. Count: ${res.data.data.length}`);
            // Check if any are drafts
            const drafts = res.data.data.filter(n => n.status !== 'publish');
            if (drafts.length > 0) console.error('❌ FAILURE: Public saw drafts!');
            else console.log('✅ Verified: No drafts visible to public.');
        } catch (e) {
            console.error('❌ Failed to fetch public news:', e.message);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

test();
