const pool = require('../dbPostgres');
const fs = require('fs');
const path = require('path');

async function migrateAIHistory() {
    try {
        console.log('🚀 Memulai migrasi tabel ai_history...');
        const sql = fs.readFileSync(path.join(__dirname, 'ai_history_schema.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Tabel ai_history berhasil dibuat/diverifikasi.');
    } catch (err) {
        console.error('❌ Gagal membuat tabel ai_history:', err.message);
    } finally {
        process.exit();
    }
}

migrateAIHistory();
