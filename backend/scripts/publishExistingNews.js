// scripts/publishExistingNews.js
// Script untuk publish berita yang sudah ada agar muncul di frontend

const mongoose = require('mongoose');
const News = require('../models/News');

const publishExistingNews = async () => {
  try {
    console.log('🚀 Memulai publish berita yang sudah ada...');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';
    await mongoose.connect(mongoUri);
    console.log('✅ Terhubung ke database');
    
    // Find all draft news
    const draftNews = await News.find({ status: 'draft' });
    console.log(`📋 Ditemukan ${draftNews.length} berita dengan status draft`);
    
    if (draftNews.length === 0) {
      console.log('ℹ️ Tidak ada berita draft yang perlu dipublish');
      return;
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const news of draftNews) {
      try {
        // Update status to publish
        await News.findByIdAndUpdate(news._id, {
          status: 'publish',
          publishedAt: new Date(),
          approvedBy: news.author, // Set author as approver
          approvedAt: new Date()
        });
        
        console.log(`✅ Berita "${news.title}" berhasil dipublish`);
        updatedCount++;
        
      } catch (newsError) {
        console.error(`❌ Error saat publish berita "${news.title}":`, newsError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Publish berita selesai!');
    console.log(`📊 Total berita draft: ${draftNews.length}`);
    console.log(`✅ Berhasil dipublish: ${updatedCount}`);
    console.log(`❌ Error: ${errorCount}`);
    
    // Verify results
    console.log('\n🔍 Verifikasi hasil...');
    
    const publishedNews = await News.find({ status: 'publish' });
    const draftNewsAfter = await News.find({ status: 'draft' });
    
    console.log(`📰 Berita published: ${publishedNews.length}`);
    console.log(`📝 Berita draft: ${draftNewsAfter.length}`);
    
    // Show published news titles
    if (publishedNews.length > 0) {
      console.log('\n📋 Daftar berita yang sudah dipublish:');
      publishedNews.forEach((news, index) => {
        console.log(`   ${index + 1}. ${news.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error dalam publish berita:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Terputus dari database');
  }
};

// Run script if called directly
if (require.main === module) {
  publishExistingNews()
    .then(() => {
      console.log('✅ Publish berita berhasil selesai');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Publish berita gagal:', error);
      process.exit(1);
    });
}

module.exports = publishExistingNews;


