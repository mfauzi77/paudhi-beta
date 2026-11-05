// scripts/createUploadDirs.js - Create upload directories
const fs = require('fs');
const path = require('path');

const createUploadDirectories = () => {
  const baseDir = path.join(__dirname, '..');
  const uploadDirs = [
    'uploads',
    'uploads/news',
    'uploads/faq',
    'uploads/images',
    'uploads/pembelajaran'
  ];

  console.log('🔧 Creating upload directories...');

  uploadDirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${dir}:`, error.message);
      }
    } else {
      console.log(`ℹ️ Directory already exists: ${dir}`);
    }
  });

  console.log('✅ Upload directories setup complete!');
};

// Run if called directly
if (require.main === module) {
  createUploadDirectories();
}

module.exports = createUploadDirectories;
