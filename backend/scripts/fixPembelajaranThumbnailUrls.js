// scripts/fixPembelajaranThumbnailUrls.js
// Perbaiki URL thumbnail Pembelajaran yang masih menunjuk ke localhost
const mongoose = require('mongoose');
const Pembelajaran = require('../models/Pembelajaran');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';

// Base URL untuk production (tanpa trailing slash)
const PRODUCTION_BASE_URL = (process.env.BASE_URL || 'https://paudhi.kemenkopmk.go.id').replace(/\/$/, '');

async function fixPembelajaranThumbnails() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Cari semua pembelajaran dengan thumbnail yang berisi localhost/127.0.0.1 atau http
    const query = {
      thumbnail: {
        $regex: /(http:\/\/localhost|localhost:5000|127\.0\.0\.1:5000)/
      }
    };

    const items = await Pembelajaran.find(query);
    console.log(`📊 Found ${items.length} pembelajaran with localhost thumbnail URLs`);

    if (items.length === 0) {
      console.log('✅ No localhost thumbnails found. All good!');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        const oldUrl = item.thumbnail;
        if (!oldUrl) continue;

        console.log(`\n🔧 Fixing: ${item.title}`);
        console.log(`   Old URL: ${oldUrl}`);

        // Gunakan path dari URL lama, contoh: /uploads/news/filename.jpg
        let pathname = null;
        try {
          const u = new URL(oldUrl);
          pathname = u.pathname; // e.g., /uploads/news/xxx.jpg
        } catch (e) {
          // Jika bukan URL valid, lewati
          console.warn('   ⚠️ Invalid URL, skipping:', oldUrl);
          errorCount++;
          continue;
        }

        // Bangun URL baru dengan origin production dan path yang sama
        const newUrl = `${PRODUCTION_BASE_URL}${pathname}`;
        console.log(`   New URL: ${newUrl}`);

        item.thumbnail = newUrl;
        await item.save();
        console.log('   ✅ Fixed!');
        fixedCount++;
      } catch (err) {
        console.error('   ❌ Error fixing item:', item._id, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} pembelajaran`);
    console.log(`❌ Errors: ${errorCount} pembelajaran`);
    console.log('\n🎉 Pembelajaran thumbnail URL fixing completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Jalankan script jika dijalankan langsung
if (require.main === module) {
  fixPembelajaranThumbnails();
}

module.exports = fixPembelajaranThumbnails;