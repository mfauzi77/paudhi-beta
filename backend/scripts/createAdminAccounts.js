const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const createAdminAccounts = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/paud-hi"
    );
    console.log("📁 Connected to MongoDB");

    // Create Super Admin
    const superAdminEmail = "superadmin@paudhi.kemenko.go.id";
    let superAdmin = await User.findOne({ email: superAdminEmail });

    if (!superAdmin) {
      superAdmin = new User({
        username: "superadmin",
        email: superAdminEmail,
        password: "superadmin123",
        fullName: "Super Administrator PAUD HI",
        role: "super_admin",
        isActive: true,
      });
      await superAdmin.save();
      console.log("✅ Super Admin created successfully");
    } else {
      // Update existing super admin
      superAdmin.role = "super_admin";
      superAdmin.password = "superadmin123";
      superAdmin.fullName = "Super Administrator PAUD HI";
      await superAdmin.save();
      console.log("✅ Super Admin updated successfully");
    }

    console.log("\n🎉 Admin account created/updated successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("==========================================");
    console.log("🔐 SUPER ADMIN:");
    console.log("Email: superadmin@paudhi.kemenko.go.id");
    console.log("Password: superadmin123");
    console.log("Role: super_admin");
    console.log("==========================================");
    console.log(
      "\n💡 Note: Passwords will be hashed automatically by the system"
    );
    console.log(
      "\n📝 Note: admin_utama role has been deprecated. Use super_admin instead."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  createAdminAccounts();
}

module.exports = { createAdminAccounts };
