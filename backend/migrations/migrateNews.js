// ============================================
// Migration Script: MongoDB News → PostgreSQL
// ============================================

const mongoose = require('mongoose');
const { Pool } = require('pg');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi_dev';

// PostgreSQL connection
const pgPool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'paudhi_local',
  password: process.env.PGPASSWORD || '123123',
  port: parseInt(process.env.PGPORT) || 5432,
});

// MongoDB News Schema (simplified)
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  excerpt: String,
  image: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  publishedAt: Date,
  source: String,
  category: String,
  isActive: Boolean,
  views: Number,
  likes: Number,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

async function migrateNews() {
  let mongoClient;
  let pgClient;
  
  try {
    console.log('🔄 Starting News migration from MongoDB to PostgreSQL...\n');
    
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB:', mongoURI);
    mongoClient = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected\n');
    
    // Connect to PostgreSQL
    console.log('🐘 Connecting to PostgreSQL:', process.env.PGDATABASE);
    pgClient = await pgPool.connect();
    console.log('✅ PostgreSQL connected\n');
    
    // Fetch all news from MongoDB
    console.log('📊 Fetching news from MongoDB...');
    const newsFromMongo = await News.find({}).populate('author', 'fullName klName').lean();
    console.log(`Found ${newsFromMongo.length} news items\n`);
    
    if (newsFromMongo.length === 0) {
      console.log('⚠️  No news to migrate');
      return;
    }
    
    // Migrate each news item
    let successCount = 0;
    let errorCount = 0;
    
    for (const news of newsFromMongo) {
      try {
        const insertQuery = `
          INSERT INTO news (
            title, content, excerpt, image,
            author_id, author_name, author_kl,
            status, approved_by, approved_at, published_at,
            source, category, is_active,
            views, likes,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14,
            $15, $16,
            $17, $18
          )
        `;
        
        const values = [
          news.title,
          news.content,
          news.excerpt || null,
          news.image || null,
          news.author?._id?.toString() || 'unknown',
          news.author?.fullName || 'Unknown',
          news.author?.klName || null,
          news.status || 'draft',
          news.approvedBy?.toString() || null,
          news.approvedAt || null,
          news.publishedAt || null,
          news.source || null,
          news.category || 'general',
          news.isActive !== false, // default true
          news.views || 0,
          news.likes || 0,
          news.createdAt || new Date(),
          news.updatedAt || new Date()
        ];
        
        await pgClient.query(insertQuery, values);
        successCount++;
        console.log(`✅ Migrated: "${news.title}"`);
        
      } catch (err) {
        errorCount++;
        console.error(`❌ Error migrating "${news.title}":`, err.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${newsFromMongo.length}\n`);
    
    // Verify migration
    const pgResult = await pgClient.query('SELECT COUNT(*) as count FROM news');
    console.log(`🔍 PostgreSQL verification: ${pgResult.rows[0].count} rows in news table\n`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    // Cleanup
    if (mongoClient) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
    if (pgClient) {
      pgClient.release();
      console.log('🔌 PostgreSQL connection closed');
    }
    await pgPool.end();
    process.exit();
  }
}

// Run migration
migrateNews();
