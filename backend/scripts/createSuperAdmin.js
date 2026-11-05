const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection string - sesuaikan dengan konfigurasi Anda
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';

async function createSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: 'superadmin@paudhi.kemenko.go.id' 
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Superadmin already exists, updating role...');
      
      // Update existing user to super_admin (FIXED for SISMONEV PAUD HI)
      existingSuperAdmin.role = 'super_admin';
      existingSuperAdmin.isActive = true;
      await existingSuperAdmin.save();
      
      console.log('✅ Existing superadmin role updated to super_admin');
      console.log('📋 User details:', {
        email: existingSuperAdmin.email,
        fullName: existingSuperAdmin.fullName,
        role: existingSuperAdmin.role,
        isActive: existingSuperAdmin.isActive
      });
    } else {
      console.log('🆕 Creating new superadmin user...');
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('superadmin123', saltRounds);
      
      // Create new superadmin user with correct role
      const superAdmin = new User({
        email: 'superadmin@paudhi.kemenko.go.id',
        password: hashedPassword,
        username: 'superadmin',
        fullName: 'Super Administrator PAUD HI',
        role: 'super_admin', // FIXED: Use super_admin role
        isActive: true,
        emailVerified: true,
        lastLogin: new Date(),
        // Set default permissions for super_admin
        permissions: {
          ranPaud: { create: true, read: true, update: true, delete: true },
          news: { create: true, read: true, update: true, delete: true },
          pembelajaran: { create: true, read: true, update: true, delete: true },
          faq: { create: true, read: true, update: true, delete: true },
          users: { create: true, read: true, update: true, delete: true }
        }
      });
      
      await superAdmin.save();
      
      console.log('✅ New superadmin user created successfully');
      console.log('📋 User details:', {
        email: superAdmin.email,
        fullName: superAdmin.fullName,
        role: superAdmin.role,
        isActive: superAdmin.isActive
      });
    }

    console.log('🎉 Superadmin setup completed successfully!');
    console.log('🔑 Login credentials:');
    console.log('   Email: superadmin@paudhi.kemenko.go.id');
    console.log('   Password: superadmin123');
    console.log('   Role: super_admin (FIXED for SISMONEV PAUD HI)');

  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
createSuperAdmin();
