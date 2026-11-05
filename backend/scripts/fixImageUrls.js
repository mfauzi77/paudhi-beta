// Script untuk memperbaiki URL gambar yang masih menggunakan localhost
const mongoose = require('mongoose');
const News = require('../models/News');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';

// Base URL untuk production
const PRODUCTION_BASE_URL = process.env.BASE_URL || 'https://paudhi.kemenkopmk.go.id';

async function fixImageUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Cari semua berita yang memiliki image URL dengan localhost
    const newsWithLocalhostImages = await News.find({
      image: { $regex: /localhost:5000/ }
    });

    console.log(`📊 Found ${newsWithLocalhostImages.length} news with localhost image URLs`);

    if (newsWithLocalhostImages.length === 0) {
      console.log('✅ No localhost image URLs found. All good!');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const news of newsWithLocalhostImages) {
      try {
        console.log(`🔧 Fixing news: ${news.title}`);
        console.log(`   Old URL: ${news.image}`);

        // Extract filename from localhost URL
        const filename = news.image.split('/').pop();
        
        // Create new URL with production base URL
        const newImageUrl = `${PRODUCTION_BASE_URL}/uploads/news/${filename}`;
        
        console.log(`   New URL: ${newImageUrl}`);

        // Update the news document
        await News.findByIdAndUpdate(news._id, {
          image: newImageUrl
        });

        fixedCount++;
        console.log(`   ✅ Fixed!`);

      } catch (error) {
        console.error(`   ❌ Error fixing news ${news._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} news`);
    console.log(`❌ Errors: ${errorCount} news`);

    // Juga periksa dan perbaiki URL di field lain yang mungkin ada
    console.log('\n🔍 Checking for other localhost URLs...');
    
    const otherLocalhostNews = await News.find({
      $or: [
        { content: { $regex: /localhost:5000/ } },
        { excerpt: { $regex: /localhost:5000/ } }
      ]
    });

    if (otherLocalhostNews.length > 0) {
      console.log(`📊 Found ${otherLocalhostNews.length} news with localhost URLs in content/excerpt`);
      
      for (const news of otherLocalhostNews) {
        try {
          let updated = false;
          const updateData = {};

          // Fix content
          if (news.content && news.content.includes('localhost:5000')) {
            updateData.content = news.content.replace(/http:\/\/localhost:5000/g, PRODUCTION_BASE_URL);
            updated = true;
          }

          // Fix excerpt
          if (news.excerpt && news.excerpt.includes('localhost:5000')) {
            updateData.excerpt = news.excerpt.replace(/http:\/\/localhost:5000/g, PRODUCTION_BASE_URL);
            updated = true;
          }

          if (updated) {
            await News.findByIdAndUpdate(news._id, updateData);
            console.log(`✅ Fixed content/excerpt for: ${news.title}`);
          }

        } catch (error) {
          console.error(`❌ Error fixing content for ${news._id}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Image URL fixing completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Jalankan script
if (require.main === module) {
  fixImageUrls();
}

module.exports = fixImageUrls;
