const pool = require('../dbPostgres');

async function checkKoneksi() {
  try {
    console.log('⏳ Mencoba koneksi ke PostgreSQL...');
    
    // Query untuk menghitung jumlah berita di tabel news
    const res = await pool.query('SELECT COUNT(*) FROM news');
    
    console.log('✅ KONEKSI BERHASIL!');
    console.log(`📊 Jumlah berita di tabel news: ${res.rows[0].count}`);
    
    // Ambil 1 judul berita terbaru sebagai bukti
    const news = await pool.query('SELECT title FROM news ORDER BY created_at DESC LIMIT 1');
    if (news.rows.length > 0) {
        console.log(`📰 Berita terbaru: "${news.rows[0].title}"`);
    }

  } catch (err) {
    console.error('❌ KONEKSI GAGAL!');
    console.error('Pesan Error:', err.message);
    console.log('\nTips Perbaikan:');
    console.log('1. Pastikan password di .env sudah benar.');
    console.log('2. Pastikan database "paudhi" sudah ada di pgAdmin.');
  } finally {
    process.exit();
  }
}

checkKoneksi();