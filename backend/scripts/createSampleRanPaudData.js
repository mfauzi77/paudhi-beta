const mongoose = require('mongoose');
const RanPaud = require('../models/RanPaud');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleData = [
  {
    klId: "KEMENKO_PMK",
    klName: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
    program: "Program PAUD Holistik Integratif 2025",
    indikators: [
      {
        indikator: "Jumlah lembaga PAUD yang terakreditasi",
        targetSatuan: "Lembaga",
        jumlahRO: 5,
        catatan: "Target akreditasi lembaga PAUD",
        tahunData: [
          { tahun: 2020, target: 100, realisasi: 95, anggaran: "500000000", persentase: 95, kategori: "TERCAPAI" },
          { tahun: 2021, target: 120, realisasi: 118, anggaran: "600000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2022, target: 150, realisasi: 145, anggaran: "750000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2023, target: 180, realisasi: 175, anggaran: "900000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2024, target: 200, realisasi: 195, anggaran: "1000000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2025, target: 250, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2026, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2027, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2028, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2029, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
        ]
      },
      {
        indikator: "Jumlah guru PAUD yang tersertifikasi",
        targetSatuan: "Orang",
        jumlahRO: 3,
        catatan: "Sertifikasi kompetensi guru PAUD",
        tahunData: [
          { tahun: 2020, target: 500, realisasi: 480, anggaran: "250000000", persentase: 96, kategori: "TERCAPAI" },
          { tahun: 2021, target: 600, realisasi: 590, anggaran: "300000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2022, target: 700, realisasi: 680, anggaran: "350000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2023, target: 800, realisasi: 785, anggaran: "400000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2024, target: 900, realisasi: 890, anggaran: "450000000", persentase: 99, kategori: "TERCAPAI" },
          { tahun: 2025, target: 1000, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2026, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2027, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2028, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2029, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
        ]
      }
    ],
    status: "approved",
    createdBy: "507f1f77bcf86cd799439011", // Sample user ID
    updatedBy: "507f1f77bcf86cd799439011",
  },
  {
    klId: "KEMENDIKDASMEN",
    klName: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    program: "Pengembangan Kurikulum PAUD Nasional",
    indikators: [
      {
        indikator: "Jumlah kurikulum PAUD yang dikembangkan",
        targetSatuan: "Kurikulum",
        jumlahRO: 2,
        catatan: "Pengembangan kurikulum berbasis kompetensi",
        tahunData: [
          { tahun: 2020, target: 10, realisasi: 8, anggaran: "200000000", persentase: 80, kategori: "TIDAK TERCAPAI" },
          { tahun: 2021, target: 15, realisasi: 14, anggaran: "300000000", persentase: 93, kategori: "TERCAPAI" },
          { tahun: 2022, target: 20, realisasi: 19, anggaran: "400000000", persentase: 95, kategori: "TERCAPAI" },
          { tahun: 2023, target: 25, realisasi: 24, anggaran: "500000000", persentase: 96, kategori: "TERCAPAI" },
          { tahun: 2024, target: 30, realisasi: 28, anggaran: "600000000", persentase: 93, kategori: "TERCAPAI" },
          { tahun: 2025, target: 35, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2026, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2027, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2028, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2029, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
        ]
      }
    ],
    status: "submitted",
    createdBy: "507f1f77bcf86cd799439011",
    updatedBy: "507f1f77bcf86cd799439011",
  },
  {
    klId: "KEMENKES",
    klName: "Kementerian Kesehatan",
    program: "Program Kesehatan Anak Usia Dini",
    indikators: [
      {
        indikator: "Jumlah anak yang mendapat imunisasi lengkap",
        targetSatuan: "Anak",
        jumlahRO: 4,
        catatan: "Imunisasi dasar lengkap untuk anak PAUD",
        tahunData: [
          { tahun: 2020, target: 10000, realisasi: 9500, anggaran: "1000000000", persentase: 95, kategori: "TERCAPAI" },
          { tahun: 2021, target: 12000, realisasi: 11500, anggaran: "1200000000", persentase: 96, kategori: "TERCAPAI" },
          { tahun: 2022, target: 15000, realisasi: 14200, anggaran: "1500000000", persentase: 95, kategori: "TERCAPAI" },
          { tahun: 2023, target: 18000, realisasi: 17500, anggaran: "1800000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2024, target: 20000, realisasi: 19500, anggaran: "2000000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2025, target: 25000, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2026, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2027, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2028, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2029, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
        ]
      }
    ],
    status: "draft",
    createdBy: "507f1f77bcf86cd799439011",
    updatedBy: "507f1f77bcf86cd799439011",
  },
  {
    klId: "KEMENSOS",
    klName: "Kementerian Sosial",
    program: "Program Perlindungan Sosial Anak",
    indikators: [
      {
        indikator: "Jumlah anak yang mendapat bantuan sosial",
        targetSatuan: "Anak",
        jumlahRO: 3,
        catatan: "Bantuan sosial untuk anak dari keluarga miskin",
        tahunData: [
          { tahun: 2020, target: 5000, realisasi: 4800, anggaran: "500000000", persentase: 96, kategori: "TERCAPAI" },
          { tahun: 2021, target: 6000, realisasi: 5800, anggaran: "600000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2022, target: 7000, realisasi: 6800, anggaran: "700000000", persentase: 97, kategori: "TERCAPAI" },
          { tahun: 2023, target: 8000, realisasi: 7800, anggaran: "800000000", persentase: 98, kategori: "TERCAPAI" },
          { tahun: 2024, target: 9000, realisasi: 8900, anggaran: "900000000", persentase: 99, kategori: "TERCAPAI" },
          { tahun: 2025, target: 10000, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2026, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2027, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2028, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
          { tahun: 2029, target: null, realisasi: null, anggaran: "[ISI DISINI]", persentase: 0, kategori: "BELUM LAPORAN" },
        ]
      }
    ],
    status: "approved",
    createdBy: "507f1f77bcf86cd799439011",
    updatedBy: "507f1f77bcf86cd799439011",
  }
];

async function createSampleData() {
  try {
    console.log('🗑️  Clearing existing data...');
    await RanPaud.deleteMany({});
    
    console.log('📝 Creating sample RAN PAUD data...');
    const result = await RanPaud.insertMany(sampleData);
    
    console.log(`✅ Successfully created ${result.length} sample records`);
    
    // Test summary stats
    const summary = await RanPaud.getSummaryByKL();
    console.log('📊 Summary stats:', summary);
    
    const totalCount = await RanPaud.countDocuments();
    console.log(`📈 Total documents in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createSampleData(); 