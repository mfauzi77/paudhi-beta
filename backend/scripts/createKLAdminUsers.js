// scripts/createKLAdminUsers.js - Script untuk membuat user admin K/L
const mongoose = require("mongoose");
const User = require("../models/User");

const klUsers = [
  {
    username: "admin_bps",
    email: "admin.bps@paudhi.kemenko.go.id",
    password: "bps123",
            fullName: "Administrator Badan Pusat Statistik",
    role: "admin_kl",
    klId: "BPS",
    klName: "Badan Pusat Statistik",
    isActive: true,
  },
  {
    username: "admin_kemenkes",
    email: "admin.kemenkes@paudhi.kemenko.go.id",
    password: "kemenkes123",
            fullName: "Administrator Kementerian Kesehatan",
    role: "admin_kl",
    klId: "KEMENKES",
            klName: "Kementerian Kesehatan",
    isActive: true,
  },
  {
            username: "admin_kemendikbudristek",
        email: "admin.kemendikbudristek@paudhi.kemenko.go.id",
        password: "kemendikbudristek123",
        fullName: "Administrator Kemendikdasmen",
        role: "admin_kl",
        klId: "KEMENDIKDASMEN",
        klName: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    isActive: true,
  },
  {
    username: "admin_kemenag",
    email: "admin.kemenag@paudhi.kemenko.go.id",
    password: "kemenag123",
            fullName: "Administrator Kementerian Agama",
    role: "admin_kl",
    klId: "KEMENAG",
            klName: "Kementerian Agama",
    isActive: true,
  },
  {
            username: "admin_kemendes_pdtt",
        email: "admin.kemendes@paudhi.kemenko.go.id",
        password: "kemendes123",
        fullName: "Administrator Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi",
        role: "admin_kl",
        klId: "KEMENDES_PDTT",
        klName: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi",
    isActive: true,
  },
  {
            username: "admin_kemendukbangga",
        email: "admin.kemendukbangga@paudhi.kemenko.go.id",
        password: "kemendukbangga123",
        fullName: "Administrator Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional",
        role: "admin_kl",
        klId: "KEMENDUKBANGGA",
        klName: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional",
    isActive: true,
  },
  {
    username: "admin_kemensos",
    email: "admin.kemensos@paudhi.kemenko.go.id",
    password: "kemensos123",
            fullName: "Administrator Kementerian Sosial",
    role: "admin_kl",
    klId: "KEMENSOS",
            klName: "Kementerian Sosial",
    isActive: true,
  },
  {
            username: "admin_kemenpppa",
        email: "admin.kemenpppa@paudhi.kemenko.go.id",
        password: "kemenpppa123",
        fullName: "Administrator Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
        role: "admin_kl",
        klId: "KEMENPPPA",
        klName: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
    isActive: true,
  },
  {
    username: "admin_kemendagri",
    email: "admin.kemendagri@paudhi.kemenko.go.id",
    password: "kemendagri123",
    fullName: "Administrator Kemendagri",
    role: "admin_kl",
    klId: "KEMENDAGRI",
    klName: "Kemendagri",
    isActive: true,
  },
  {
    username: "admin_bappenas",
    email: "admin.bappenas@paudhi.kemenko.go.id",
    password: "bappenas123",
            fullName: "Administrator Badan Perencanaan Pembangunan Nasional",
    role: "admin_kl",
    klId: "BAPPENAS",
            klName: "Badan Perencanaan Pembangunan Nasional",
    isActive: true,
  },
];

async function createKLAdminUsers() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/paudhi", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    console.log("📝 Creating K/L admin users...");

    for (const userData of klUsers) {
      // Cek apakah user sudah ada
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        console.log(`⚠️ User ${userData.username} sudah ada, skip...`);
        continue;
      }

      // Buat user baru
      const user = new User(userData);
      await user.save();

      console.log(`✅ Created user: ${userData.username} (${userData.klName})`);
    }

    console.log("\n🎉 K/L admin users creation completed!");
    console.log("\n📧 Login Credentials:");
    console.log("BPS: admin.bps@paudhi.kemenko.go.id / bps123");
    console.log("Kementerian Kesehatan: admin.kemenkes@paudhi.kemenko.go.id / kemenkes123");
    console.log("Kemendikdasmen: admin.kemendikbudristek@paudhi.kemenko.go.id / kemendikbudristek123");
    console.log("Kementerian Agama: admin.kemenag@paudhi.kemenko.go.id / kemenag123");
    console.log("Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi: admin.kemendes@paudhi.kemenko.go.id / kemendes123");
    console.log("Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional: admin.kemendukbangga@paudhi.kemenko.go.id / kemendukbangga123");
    console.log("Kementerian Sosial: admin.kemensos@paudhi.kemenko.go.id / kemensos123");
    console.log("Kementerian Pemberdayaan Perempuan dan Perlindungan Anak: admin.kemenpppa@paudhi.kemenko.go.id / kemenpppa123");
    console.log("Kemendagri: admin.kemendagri@paudhi.kemenko.go.id / kemendagri123");
    console.log("Badan Perencanaan Pembangunan Nasional: admin.bappenas@paudhi.kemenko.go.id / bappenas123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating K/L admin users:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  createKLAdminUsers();
} 