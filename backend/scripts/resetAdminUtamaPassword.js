const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/paudhi";

async function resetAdminUtamaPassword() {
  await mongoose.connect(MONGO_URI);
  const email = "adminutama@paudhi.kemenko.go.id";
  const password = "adminutama123";

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ User admin utama tidak ditemukan");
    process.exit(1);
  }
  user.password = password;
  await user.save();
  console.log("✅ Password admin utama berhasil direset!");
  process.exit(0);
}

resetAdminUtamaPassword();
