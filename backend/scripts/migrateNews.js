const mongoose = require('mongoose');
const pool = require('../dbPostgres'); 
require('dotenv').config();

const NewsSchema = new mongoose.Schema({
    title: String,
    content: String,
    excerpt: String,
    image: String,
    category: String,
    status: String,
    source: String,
    author_id: mongoose.Schema.Types.ObjectId,
    createdAt: Date
}, { strict: false });

const MongoNews = mongoose.model('News_Migration', NewsSchema, 'news');

async function migrate() {
    try {
        console.log('⏳ Memulai migrasi data dari MongoDB ke Postgres...');
        
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        console.log('✅ Terhubung ke MongoDB');

        const newsFromMongo = await MongoNews.find({}).lean();
        console.log(`📦 Ditemukan ${newsFromMongo.length} berita di MongoDB`);

        if (newsFromMongo.length === 0) {
            console.log('ℹ️ Tidak ada data untuk dimigrasi.');
            return;
        }

        console.log('🚀 Memasukkan data ke PostgreSQL...');

        for (const item of newsFromMongo) {
            const query = `
                INSERT INTO news 
                (title, content, excerpt, image, category, status, source, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            const values = [
                item.title || 'Untitled',
                item.content || '',
                item.excerpt || null,
                item.image || null,
                item.category || 'General',
                item.status || 'published',
                item.source || 'original',
                item.createdAt || new Date()
            ];

            try {
                await pool.query(query, values);
                console.log(`✅ Berhasil: ${item.title}`);
            } catch (insertErr) {
                console.error(`❌ Gagal insert [${item.title}]:`, insertErr.message);
            }
        }

        console.log('\n🚀 ================================');
        console.log('🚀 Migrasi Selesai!');
        console.log('🚀 ================================\n');

    } catch (err) {
        console.error('❌ Error fatal:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();