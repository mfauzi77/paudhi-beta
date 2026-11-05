const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoCounts() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi_dev';
    console.log('Connecting to MongoDB:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Connected.');

    const collections = ['users', 'news', 'faqs', 'pembelajarans', 'ranpauds'];
    console.log('--- MongoDB Record Counts ---');
    for (const collName of collections) {
      const count = await mongoose.connection.db.collection(collName).countDocuments();
      console.log(`${collName}: ${count}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMongoCounts();
