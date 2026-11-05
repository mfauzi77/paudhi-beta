// scripts/fixSuperAdminRoles.js
// Script untuk memperbaiki role user yang sudah ada

const mongoose = require('mongoose');
const User = require('../models/User');

const fixSuperAdminRoles = async () => {
  try {
    console.log('🚀 Memulai perbaikan role user untuk SISMONEV PAUD HI...');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';
    await mongoose.connect(mongoUri);
    console.log('✅ Terhubung ke database');
    
    // Find users with wrong roles
    const usersToFix = await User.find({
      $or: [
        { role: 'admin_utama' }, // Users that should be super_admin
        { email: 'superadmin@paudhi.kemenko.go.id' } // Specific superadmin email
      ]
    });
    
    console.log(`📋 Ditemukan ${usersToFix.length} user yang perlu diperbaiki`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of usersToFix) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // Fix superadmin role
        if (user.email === 'superadmin@paudhi.kemenko.go.id' && user.role !== 'super_admin') {
          updates.role = 'super_admin';
          needsUpdate = true;
          console.log(`👑 Mengubah role user "${user.email}" dari '${user.role}' ke 'super_admin'`);
        }
        
        // Convert admin_utama to super_admin (FIXED: admin_utama becomes super_admin)
        if (user.role === 'admin_utama') {
          updates.role = 'super_admin';
          needsUpdate = true;
          console.log(`👑 Mengubah role user "${user.email}" dari 'admin_utama' ke 'super_admin'`);
        }
        
        // Update permissions for super_admin
        if (updates.role === 'super_admin') {
          updates.permissions = {
            ranPaud: { create: true, read: true, update: true, delete: true },
            news: { create: true, read: true, update: true, delete: true },
            pembelajaran: { create: true, read: true, update: true, delete: true },
            faq: { create: true, read: true, update: true, delete: true },
            users: { create: true, read: true, update: true, delete: true }
          };
          console.log(`🔐 Mengatur permissions lengkap untuk superadmin "${user.email}"`);
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await User.findByIdAndUpdate(user._id, updates);
          updatedCount++;
          console.log(`✅ User "${user.email}" berhasil diupdate`);
        } else {
          console.log(`ℹ️ User "${user.email}" tidak memerlukan update`);
        }
        
      } catch (userError) {
        console.error(`❌ Error saat update user "${user.email}":`, userError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Perbaikan role selesai!');
    console.log(`📊 Total user: ${usersToFix.length}`);
    console.log(`✅ Berhasil diupdate: ${updatedCount}`);
    console.log(`❌ Error: ${errorCount}`);
    console.log(`ℹ️ Tidak berubah: ${usersToFix.length - updatedCount - errorCount}`);
    
    // Verify results
    console.log('\n🔍 Verifikasi hasil perbaikan...');
    
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Distribusi role setelah perbaikan:');
    roleCounts.forEach(role => {
      console.log(`   ${role._id}: ${role.count}`);
    });
    
    // Check superadmin specifically
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (superAdmin) {
      console.log('\n👑 Superadmin ditemukan:');
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Active: ${superAdmin.isActive}`);
    } else {
      console.log('\n⚠️ Tidak ada superadmin ditemukan!');
    }
    
  } catch (error) {
    console.error('❌ Error dalam perbaikan role:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Terputus dari database');
  }
};

// Run migration if called directly
if (require.main === module) {
  fixSuperAdminRoles()
    .then(() => {
      console.log('✅ Perbaikan role berhasil selesai');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Perbaikan role gagal:', error);
      process.exit(1);
    });
}

module.exports = fixSuperAdminRoles;
