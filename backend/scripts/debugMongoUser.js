const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoUser() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi_dev';
    console.log('Connecting to MongoDB:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('Connected.');

    const userId = '6895804625fecf8ed63cb421';
    const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if (user) {
      console.log('✅ User found in MongoDB:', user.email, user.fullName);
    } else {
      console.log('❌ User NOT found in MongoDB.');
      const allUsers = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log('Total users in MongoDB:', allUsers.length);
      console.log('Sample IDs:', allUsers.slice(0, 5).map(u => u._id.toString()));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMongoUser();
