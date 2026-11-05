const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection string - sesuaikan dengan konfigurasi Anda
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';

async function updateUserToAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find user by email
    const user = await User.findOne({ 
      email: 'superadmin@paudhi.kemenko.go.id' 
    });

    if (!user) {
      console.log('❌ User not found. Please create the user first or check the email address.');
      return;
    }

    console.log('👤 Found user:', {
      email: user.email,
      fullName: user.fullName,
      currentRole: user.role,
      isActive: user.isActive
    });

    // Update user role to admin_utama
    user.role = 'admin_utama';
    user.isActive = true;
    user.klId = 'super_admin';
    user.klName = 'Super Admin';
    
    await user.save();

    console.log('✅ User role updated successfully!');
    console.log('📋 Updated user details:', {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      klId: user.klId,
      klName: user.klName
    });

    console.log('🎉 User is now admin_utama and can access all admin features!');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
updateUserToAdmin();
