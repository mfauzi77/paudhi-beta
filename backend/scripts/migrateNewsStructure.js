// scripts/migrateNewsStructure.js
// Script untuk migrasi struktur berita ke SISMONEV PAUD HI

const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');

const migrateNewsStructure = async () => {
  try {
    console.log('🚀 Memulai migrasi struktur berita ke SISMONEV PAUD HI...');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';
    await mongoose.connect(mongoUri);
    console.log('✅ Terhubung ke database');
    
    // Get all news
    const allNews = await News.find({});
    console.log(`📰 Ditemukan ${allNews.length} berita untuk dimigrasi`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const news of allNews) {
      try {
        const updates = {};
        let hasChanges = false;
        
        // Update status: 'approved' -> 'publish'
        if (news.status === 'approved') {
          updates.status = 'publish';
          hasChanges = true;
          console.log(`📝 Mengubah status berita "${news.title}" dari 'approved' ke 'publish'`);
        }
        
        // Update status: 'rejected' -> 'draft'
        if (news.status === 'rejected') {
          updates.status = 'draft';
          hasChanges = true;
          console.log(`📝 Mengubah status berita "${news.title}" dari 'rejected' ke 'draft'`);
        }
        
        // Remove old fields
        if (news.rejectionReason !== undefined) {
          updates.$unset = { rejectionReason: 1 };
          hasChanges = true;
          console.log(`🗑️ Menghapus field rejectionReason dari berita "${news.title}"`);
        }
        
        if (news.submittedAt !== undefined) {
          updates.$unset = { submittedAt: 1 };
          hasChanges = true;
          console.log(`🗑️ Menghapus field submittedAt dari berita "${news.title}"`);
        }
        
        // Update publishedAt if status is publish
        if (updates.status === 'publish' && !news.publishedAt) {
          updates.publishedAt = news.approvedAt || new Date();
          hasChanges = true;
          console.log(`📅 Mengatur publishedAt untuk berita "${news.title}"`);
        }
        
        // Update source field if not exists
        if (!news.source && news.author) {
          try {
            const authorUser = await User.findById(news.author).select('klName role');
            if (authorUser && authorUser.role === 'admin_kl' && authorUser.klName) {
              updates.source = authorUser.klName;
              hasChanges = true;
              console.log(`🏛️ Mengatur source "${authorUser.klName}" untuk berita "${news.title}"`);
            }
          } catch (userError) {
            console.log(`⚠️ Tidak dapat mengambil data user untuk berita "${news.title}":`, userError.message);
          }
        }
        
        // Apply updates if there are changes
        if (hasChanges) {
          await News.findByIdAndUpdate(news._id, updates);
          updatedCount++;
          console.log(`✅ Berita "${news.title}" berhasil diupdate`);
        } else {
          console.log(`ℹ️ Berita "${news.title}" tidak memerlukan update`);
        }
        
      } catch (newsError) {
        console.error(`❌ Error saat migrasi berita "${news.title}":`, newsError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Migrasi selesai!');
    console.log(`📊 Total berita: ${allNews.length}`);
    console.log(`✅ Berhasil diupdate: ${updatedCount}`);
    console.log(`❌ Error: ${errorCount}`);
    console.log(`ℹ️ Tidak berubah: ${allNews.length - updatedCount - errorCount}`);
    
    // Verify migration results
    console.log('\n🔍 Verifikasi hasil migrasi...');
    
    const statusCounts = await News.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Status berita setelah migrasi:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });
    
    const sourceCounts = await News.aggregate([
      { $match: { source: { $exists: true, $ne: null } } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    
    console.log('\n🏛️ Sumber berita setelah migrasi:');
    sourceCounts.forEach(source => {
      console.log(`   ${source._id}: ${source.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error dalam migrasi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Terputus dari database');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateNewsStructure()
    .then(() => {
      console.log('✅ Migrasi berhasil selesai');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migrasi gagal:', error);
      process.exit(1);
    });
}

module.exports = migrateNewsStructure;


