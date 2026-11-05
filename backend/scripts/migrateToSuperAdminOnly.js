// scripts/migrateToSuperAdminOnly.js
// Script untuk migrasi ke sistem role baru: admin_kl, admin, super_admin

const mongoose = require('mongoose');
const User = require('../models/User');

const migrateToSuperAdminOnly = async () => {
  try {
    console.log('🚀 Memulai migrasi ke sistem role baru SISMONEV PAUD HI...');
    console.log('📋 Role yang akan digunakan: admin_kl, admin, super_admin');
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi';
    await mongoose.connect(mongoUri);
    console.log('✅ Terhubung ke database');
    
    // Find all users
    const allUsers = await User.find({});
    console.log(`📋 Ditemukan ${allUsers.length} user untuk dimigrasi`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // Convert admin_utama to super_admin
        if (user.role === 'admin_utama') {
          updates.role = 'super_admin';
          needsUpdate = true;
          console.log(`👑 Mengubah role user "${user.email}" dari 'admin_utama' ke 'super_admin'`);
        }
        
        // Ensure super_admin has full permissions
        if (user.role === 'super_admin' || updates.role === 'super_admin') {
          updates.permissions = {
            ranPaud: { create: true, read: true, update: true, delete: true },
            news: { create: true, read: true, update: true, delete: true },
            pembelajaran: { create: true, read: true, update: true, delete: true },
            faq: { create: true, read: true, update: true, delete: true },
            users: { create: true, read: true, update: true, delete: true }
          };
          console.log(`🔐 Mengatur permissions lengkap untuk superadmin "${user.email}"`);
        }
        
        // Ensure admin_kl has appropriate permissions
        if (user.role === 'admin_kl' && (!user.permissions || typeof user.permissions !== 'object')) {
          updates.permissions = {
            ranPaud: { create: true, read: true, update: true, delete: true },
            news: { create: true, read: true, update: true, delete: true },
            pembelajaran: { create: true, read: true, update: true, delete: true },
            faq: { create: true, read: true, update: true, delete: true },
            users: { create: false, read: false, update: false, delete: false }
          };
          console.log(`🔐 Mengatur permissions untuk admin_kl "${user.email}"`);
        }
        
        // Ensure admin has appropriate permissions
        if (user.role === 'admin' && (!user.permissions || typeof user.permissions !== 'object')) {
          updates.permissions = {
            ranPaud: { create: true, read: true, update: true, delete: true },
            news: { create: true, read: true, update: true, delete: true },
            pembelajaran: { create: true, read: true, update: true, delete: true },
            faq: { create: true, read: true, update: true, delete: true },
            users: { create: false, read: false, update: false, delete: false }
          };
          console.log(`🔐 Mengatur permissions untuk admin "${user.email}"`);
        }
        
        // Apply updates if needed
        if (needsUpdate || Object.keys(updates).length > 0) {
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
    
    console.log('\n🎉 Migrasi ke sistem role baru selesai!');
    console.log(`📊 Total user: ${allUsers.length}`);
    console.log(`✅ Berhasil diupdate: ${updatedCount}`);
    console.log(`❌ Error: ${errorCount}`);
    console.log(`ℹ️ Tidak berubah: ${allUsers.length - updatedCount - errorCount}`);
    
    // Verify results
    console.log('\n🔍 Verifikasi hasil migrasi...');
    
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Distribusi role setelah migrasi:');
    roleCounts.forEach(role => {
      console.log(`   ${role._id}: ${role.count}`);
    });
    
    // Check superadmin specifically
    const superAdmins = await User.find({ role: 'super_admin' });
    if (superAdmins.length > 0) {
      console.log('\n👑 Superadmin ditemukan:');
      superAdmins.forEach(admin => {
        console.log(`   Email: ${admin.email}, Role: ${admin.role}, Active: ${admin.isActive}`);
      });
    } else {
      console.log('\n⚠️ Tidak ada superadmin ditemukan!');
    }
    
    // Summary
    console.log('\n📋 Ringkasan sistem role baru:');
    console.log('   👑 super_admin: Akses penuh ke semua fitur (termasuk publish berita)');
    console.log('   👤 admin: Akses ke semua fitur kecuali publish berita');
    console.log('   🏛️ admin_kl: Akses terbatas sesuai K/L masing-masing');
    
  } catch (error) {
    console.error('❌ Error dalam migrasi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Terputus dari database');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateToSuperAdminOnly()
    .then(() => {
      console.log('✅ Migrasi ke sistem role baru berhasil selesai');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migrasi ke sistem role baru gagal:', error);
      process.exit(1);
    });
}

module.exports = migrateToSuperAdminOnly;


