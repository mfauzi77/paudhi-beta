const mongoose = require('mongoose');
const RanPaud = require('../models/RanPaud');

// Sample data untuk dashboard publik
const sampleKLData = [
  {
    klId: 'kemenko-pmk',
    klName: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    program: 'Program Koordinasi PAUD HI',
    indikators: [
      {
        indikator: 'Jumlah provinsi yang melaksanakan PAUD HI',
        targetSatuan: 'Provinsi',
        tahunData: [
          { tahun: 2029, target: 34, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 34, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 34, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 34, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 34, realisasi: 30, persentase: 88.2, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 34, realisasi: 28, persentase: 82.4, kategori: 'TERCAPAI' },
          { tahun: 2023, target: 34, realisasi: 25, persentase: 73.5, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 2
      },
      {
        indikator: 'Jumlah kabupaten/kota yang melaksanakan PAUD HI',
        targetSatuan: 'Kabupaten/Kota',
        tahunData: [
          { tahun: 2029, target: 514, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 514, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 514, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 514, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 514, realisasi: 450, persentase: 87.5, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 514, realisasi: 420, persentase: 81.7, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2023, target: 514, realisasi: 380, persentase: 73.9, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 3
      }
    ]
  },
  {
    klId: 'kemendikbudristek',
    klName: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
    program: 'Program Pendidikan Anak Usia Dini',
    indikators: [
      {
        indikator: 'APK PAUD',
        targetSatuan: 'Persen',
        tahunData: [
          { tahun: 2029, target: 85, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 85, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 85, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 85, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 85, realisasi: 82, persentase: 96.5, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 85, realisasi: 80, persentase: 94.1, kategori: 'TERCAPAI' },
          { tahun: 2023, target: 85, realisasi: 78, persentase: 91.8, kategori: 'TERCAPAI' }
        ],
        jumlahRO: 1
      },
      {
        indikator: 'Jumlah guru PAUD yang dilatih',
        targetSatuan: 'Orang',
        tahunData: [
          { tahun: 2029, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 50000, realisasi: 48000, persentase: 96.0, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 50000, realisasi: 45000, persentase: 90.0, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2023, target: 50000, realisasi: 42000, persentase: 84.0, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 2
      }
    ]
  },
  {
    klId: 'kemenkes',
    klName: 'Kementerian Kesehatan',
    program: 'Program Kesehatan Ibu dan Anak',
    indikators: [
      {
        indikator: 'Cakupan imunisasi dasar lengkap',
        targetSatuan: 'Persen',
        tahunData: [
          { tahun: 2029, target: 95, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 95, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 95, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 95, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 95, realisasi: 92, persentase: 96.8, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 95, realisasi: 90, persentase: 94.7, kategori: 'TERCAPAI' },
          { tahun: 2023, target: 95, realisasi: 88, persentase: 92.6, kategori: 'TERCAPAI' }
        ],
        jumlahRO: 1
      },
      {
        indikator: 'Cakupan pemberian makanan tambahan',
        targetSatuan: 'Persen',
        tahunData: [
          { tahun: 2029, target: 80, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 80, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 80, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 80, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 80, realisasi: 75, persentase: 93.8, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2024, target: 80, realisasi: 70, persentase: 87.5, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2023, target: 80, realisasi: 65, persentase: 81.3, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 2
      }
    ]
  },
  {
    klId: 'kemendukbangga',
    klName: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional',
    program: 'Program Keluarga Berencana',
    indikators: [
      {
        indikator: 'Jumlah keluarga yang mendapat bimbingan pengasuhan',
        targetSatuan: 'Keluarga',
        tahunData: [
          { tahun: 2029, target: 1000000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 1000000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 1000000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 1000000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 1000000, realisasi: 950000, persentase: 95.0, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 1000000, realisasi: 900000, persentase: 90.0, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2023, target: 1000000, realisasi: 850000, persentase: 85.0, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 1
      }
    ]
  },
  {
    klId: 'kemensos',
    klName: 'Kementerian Sosial',
    program: 'Program Kesejahteraan Sosial',
    indikators: [
      {
        indikator: 'Jumlah anak terlantar yang mendapat layanan',
        targetSatuan: 'Anak',
        tahunData: [
          { tahun: 2029, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2028, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2027, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2026, target: 50000, realisasi: 0, persentase: 0, kategori: 'BELUM LAPORAN' },
          { tahun: 2025, target: 50000, realisasi: 48000, persentase: 96.0, kategori: 'TERCAPAI' },
          { tahun: 2024, target: 50000, realisasi: 45000, persentase: 90.0, kategori: 'TIDAK TERCAPAI' },
          { tahun: 2023, target: 50000, realisasi: 42000, persentase: 84.0, kategori: 'TIDAK TERCAPAI' }
        ],
        jumlahRO: 1
      }
    ]
  }
];

async function createSamplePublicData() {
  try {
    console.log('🚀 Creating sample public data for RAN PAUD dashboard...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing sample data
    await RanPaud.deleteMany({ 
      klId: { $in: sampleKLData.map(kl => kl.klId) },
      isActive: true 
    });
    console.log('🧹 Cleared existing sample data');
    
    // Create sample data
    const createdData = [];
    for (const klData of sampleKLData) {
      const ranPaudDoc = new RanPaud({
        klId: klData.klId,
        klName: klData.klName,
        program: klData.program,
        indikators: klData.indikators,
        isActive: true,
        status: 'approved',
        createdBy: 'system',
        updatedBy: 'system'
      });
      
      const saved = await ranPaudDoc.save();
      createdData.push(saved);
      console.log(`✅ Created data for ${klData.klName}`);
    }
    
    console.log(`\n🎉 Successfully created ${createdData.length} sample records`);
    console.log('📊 Sample data is now available for public dashboard');
    
    // Test the summary
    console.log('\n📈 Testing summary data...');
    const allData = await RanPaud.find({ isActive: true });
    console.log(`Total active records: ${allData.length}`);
    
    // Manual calculation test
    let totalTercapai = 0;
    let totalProgress = 0;
    let totalBelum = 0;
    
    allData.forEach((item) => {
      if (item.indikators && item.indikators.length > 0) {
        item.indikators.forEach((indikator) => {
          if (indikator.tahunData && indikator.tahunData.length > 0) {
            indikator.tahunData.forEach((tahunData) => {
              if (tahunData.kategori === "TERCAPAI") {
                totalTercapai++;
              } else if (tahunData.kategori === "TIDAK TERCAPAI") {
                totalProgress++;
              } else {
                totalBelum++;
              }
            });
          }
        });
      }
    });
    
    console.log('📊 Manual calculation results:');
    console.log(`- Tercapai: ${totalTercapai}`);
    console.log(`- Tidak Tercapai: ${totalProgress}`);
    console.log(`- Belum Lapor: ${totalBelum}`);
    console.log(`- Total: ${totalTercapai + totalProgress + totalBelum}`);
    
  } catch (error) {
    console.error('❌ Error creating sample public data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createSamplePublicData();
}

module.exports = createSamplePublicData;
