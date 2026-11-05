const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const News = require("../models/News");
const FAQ = require("../models/FAQ");

const seedUsers = async () => {
  // Tambah/Update Admin Utama
  const adminUtamaEmail = "adminutama@paudhi.kemenko.go.id";
  let adminUtama = await User.findOne({ email: adminUtamaEmail });
  if (!adminUtama) {
    adminUtama = new User({
      username: "adminutama",
      email: adminUtamaEmail,
      password: "adminutama123",
      fullName: "Admin Utama PAUD HI",
      role: "admin_utama",
      isActive: true,
    });
    await adminUtama.save();
    console.log("✅ Admin Utama user created");
  } else {
    let updated = false;
    if (adminUtama.role !== "admin_utama") {
      adminUtama.role = "admin_utama";
      updated = true;
    }
    if (adminUtama.password !== "adminutama123") {
      adminUtama.password = "adminutama123";
      updated = true;
    }
    if (updated) {
      await adminUtama.save();
      console.log("✅ Admin Utama user updated");
    } else {
      console.log("Admin Utama already exists");
    }
  }

  const adminExists = await User.findOne({
    email: "admin@paudhi.kemenko.go.id",
  });
  if (!adminExists) {
    await User.create({
      username: "admin",
      email: "admin@paudhi.kemenko.go.id",
      password: "admin123",
      fullName: "Administrator PAUD HI",
      role: "admin",
    });
    console.log("✅ Admin user created");
  }

  const editorExists = await User.findOne({
    email: "editor@paudhi.kemenko.go.id",
  });
  if (!editorExists) {
    await User.create({
      username: "editor",
      email: "editor@paudhi.kemenko.go.id",
      password: "editor123",
      fullName: "Editor PAUD HI",
      role: "editor",
    });
    console.log("✅ Editor user created");
  }
};

const seedFAQs = async () => {
  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    const admin = await User.findOne({ role: "admin" });

    const faqs = [
      {
        question: "Apa itu PAUD HI?",
        answer:
          "<strong>PAUD HI (Pengembangan Anak Usia Dini Holistik Integratif) adalah program layanan lengkap untuk anak usia 0–6 tahun yang mencakup pendidikan, kesehatan, gizi, perlindungan, dan pengasuhan.</strong>",
        category: "dasar",
        tags: [
          "paud hi",
          "pengembangan anak usia dini",
          "holistik integratif",
          "definisi",
        ],
        createdBy: admin._id,
        order: 1,
      },
      {
        question: "Siapa yang menyelenggarakan PAUD HI?",
        answer:
          "<strong>PAUD HI dilaksanakan oleh satuan PAUD di daerah dengan dukungan penuh dari pemerintah daerah melalui gugus tugas PAUD HI.</strong>",
        category: "dasar",
        tags: [
          "penyelenggara",
          "satuan paud",
          "gugus tugas",
          "pemerintah daerah",
        ],
        createdBy: admin._id,
        order: 2,
      },
      {
        question: "Apa tujuan dari PAUD HI?",
        answer:
          "<strong>Tujuan utama PAUD HI adalah memastikan setiap anak usia dini mendapatkan layanan esensial secara menyeluruh agar tumbuh optimal.</strong>",
        category: "dasar",
        tags: ["tujuan", "layanan esensial", "tumbuh kembang"],
        createdBy: admin._id,
        order: 3,
      },
    ];

    await FAQ.insertMany(faqs);
    console.log("✅ FAQ data seeded");
  }
};

const seedNews = async () => {
  const newsCount = await News.countDocuments();
  if (newsCount === 0) {
    const admin = await User.findOne({ role: "admin" });

    const news = [
      {
        title:
          "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan Lakukan Monitoring dan Evaluasi Perlindungan dan Pemenuhan Hak Anak di DIY",
        excerpt:
          "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan melalui Asdep dr. Nia melakukan monitoring dan evaluasi sistem perlindungan anak di Provinsi DIY.",
        fullContent:
          "<p>Yogyakarta – Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan, melalui Asisten Deputi Perlindungan dan Pemenuhan Hak Anak (PPHA), melakukan kunjungan kerja ke Provinsi Daerah Istimewa Yogyakarta (DIY) pada 24–26 Juni 2025.</p>",
        author: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
        authorId: admin._id,
        publishDate: new Date("2025-06-26"),
        readTime: "3 menit",
        icon: "fas fa-shield-alt",
        tags: ["Perlindungan Anak", "Monitoring Evaluasi", "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan"],
        status: "published",
        featured: true,
      },
      {
        title:
          "Deputi Woro Tegaskan Sinergi PAUD HI Hadapi ECDI 2030 untuk SDM Unggul",
        excerpt:
          "Deputi Bidang Koordinasi Peningkatan Kualitas Anak, Perempuan, dan Pemuda Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan menegaskan pentingnya sinergi lintas sektor.",
        fullContent:
          "<p>Badan Perencanaan Pembangunan Nasional resmi meluncurkan Indeks Perkembangan Anak Usia Dini (ECDI) 2030 sebagai bagian dari upaya strategis menyongsong generasi Indonesia Emas 2045.</p>",
        author: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
        authorId: admin._id,
        publishDate: new Date("2025-05-15"),
        readTime: "4 menit",
        icon: "fas fa-child",
        tags: ["PAUD HI", "ECDI 2030", "SDM Unggul", "Indonesia Emas 2045"],
        status: "published",
        featured: true,
      },
    ];

    await News.insertMany(news);
    console.log("✅ News data seeded");
  }
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/paud-hi"
    );
    console.log("📁 Connected to MongoDB");

    await seedUsers();
    await seedFAQs();
    await seedNews();

    console.log("\n🎉 Database seeding completed!");
    console.log("\n📧 Login Credentials:");
    console.log("Admin: admin@paudhi.kemenko.go.id / admin123");
    console.log("Editor: editor@paudhi.kemenko.go.id / editor123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
