const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const migrateAdminUtamaToSuperAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/paud-hi"
    );
    console.log("📁 Connected to MongoDB");

    // Find all users with admin_utama role
    const adminUtamaUsers = await User.find({ role: "admin_utama" });
    
    if (adminUtamaUsers.length === 0) {
      console.log("✅ No admin_utama users found. Migration not needed.");
      process.exit(0);
    }

    console.log(`🔄 Found ${adminUtamaUsers.length} admin_utama users to migrate`);

    // Update all admin_utama users to super_admin
    const updateResult = await User.updateMany(
      { role: "admin_utama" },
      { 
        $set: { 
          role: "super_admin",
          permissions: {
            ranPaud: { create: true, read: true, update: true, delete: true },
            news: { create: true, read: true, update: true, delete: true },
            pembelajaran: { create: true, read: true, update: true, delete: true },
            faq: { create: true, read: true, update: true, delete: true },
            users: { create: true, read: true, update: true, delete: true },
          }
        }
      }
    );

    console.log(`✅ Successfully migrated ${updateResult.modifiedCount} users from admin_utama to super_admin`);

    // Verify the migration
    const remainingAdminUtama = await User.find({ role: "admin_utama" });
    const newSuperAdmins = await User.find({ role: "super_admin" });

    console.log(`\n📊 Migration Results:`);
    console.log(`==========================================`);
    console.log(`❌ Remaining admin_utama users: ${remainingAdminUtama.length}`);
    console.log(`✅ Total super_admin users: ${newSuperAdmins.length}`);
    console.log(`==========================================`);

    if (remainingAdminUtama.length === 0) {
      console.log(`\n🎉 Migration completed successfully!`);
      console.log(`All admin_utama users have been converted to super_admin`);
    } else {
      console.log(`\n⚠️  Warning: Some admin_utama users still exist`);
      console.log(`Please check the database manually`);
    }

    // Show the new super_admin users
    console.log(`\n👥 New Super Admin Users:`);
    newSuperAdmins.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrateAdminUtamaToSuperAdmin();
}

module.exports = { migrateAdminUtamaToSuperAdmin };
