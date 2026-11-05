// src/data/searchIndex.js - Search Index Lengkap PAUDHI

const comprehensiveSearchIndex = [
  // === HALAMAN UTAMA ===
  {
    id: 'beranda',
    title: 'Beranda PAUDHI',
    url: '/',
    category: 'Halaman Utama',
    description: 'Sistem Informasi, Monitoring, dan Evaluasi PAUD Holistik Integratif',
    keywords: ['beranda', 'home', 'paud hi', 'sistem informasi', 'monitoring', 'evaluasi', 'holistik integratif'],
    content: 'Sistem terpadu yang dirancang untuk memantau dan mengevaluasi pelaksanaan layanan PAUDHI lintas sektor',
    section: 'hero'
  },

  // === LAYANAN UTAMA ===
  {
    id: 'layanan-pendidikan',
    title: 'Layanan Pendidikan PAUDHI',
    url: '/#layanan',
    category: 'Layanan',
    description: 'Menjamin akses dan kualitas pendidikan anak usia dini, serta penguatan peran pendidik dan lembaga keagamaan',
    keywords: ['pendidikan', 'paud', 'guru', 'tenaga kependidikan', 'pendidikan islam', 'katolik', 'buddha', 'hindu', 'khonghucu'],
    content: 'Program Pendidikan Anak Usia Dini, Program Guru dan Tenaga Kependidikan, Program Pendidikan Islam',
    section: 'services'
  },
  {
    id: 'layanan-kesehatan',
    title: 'Layanan Kesehatan dan Gizi',
    url: '/#layanan',
    category: 'Layanan',
    description: 'Mendukung kesehatan fisik dan gizi anak sejak dini melalui program-program strategis nasional',
    keywords: ['kesehatan', 'gizi', 'ibu', 'anak', 'kb', 'keluarga berencana', 'reproduksi', 'germas', 'penyakit'],
    content: 'Program Peningkatan Kesehatan Ibu, Anak, KB, Program Percepatan Perbaikan Gizi Masyarakat',
    section: 'services'
  },
  {
    id: 'layanan-perlindungan',
    title: 'Layanan Perlindungan, Pengasuhan dan Kesejahteraan',
    url: '/#layanan',
    category: 'Layanan',
    description: 'Memberikan perlindungan menyeluruh bagi anak serta memperkuat lingkungan pengasuhan dan kesejahteraan keluarga',
    keywords: ['perlindungan', 'pengasuhan', 'kesejahteraan', 'anak terlantar', 'miskin', 'kependudukan', 'keluarga berencana'],
    content: 'Program Kesejahteraan Sosial Anak Terlantar dan Miskin, Program Kependudukan, KB, dan Pembangunan Keluarga',
    section: 'services'
  },
  {
    id: 'layanan-tata-kelola',
    title: 'Layanan Tata Kelola PAUDHI',
    url: '/#layanan',
    category: 'Layanan',
    description: 'Menjamin tata kelola program PAUDHI yang sinergis, terukur, dan berbasis data melalui koordinasi lintas sektor',
    keywords: ['tata kelola', 'koordinasi', 'perencanaan', 'penyelenggaraan', 'pendataan', 'pemberdayaan masyarakat'],
    content: 'Koordinasi Perencanaan Program PAUDHI, Koordinasi Penyelenggaraan, Koordinasi Pendataan Anak Usia Dini',
    section: 'services'
  },

  // === BERITA & ARTIKEL ===
  {
    id: 'berita-monitoring-diy',
    title: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan Lakukan Monitoring dan Evaluasi Perlindungan Anak di DIY',
    url: '/#berita',
    category: 'Berita',
    description: 'Monitoring dan evaluasi sistem perlindungan anak di Provinsi DIY, koordinasi lintas sektor penanganan kekerasan',
    keywords: ['monitoring', 'evaluasi', 'perlindungan anak', 'diy', 'kekerasan', 'kementerian koordinator bidang pembangunan manusia dan kebudayaan', 'p2tpakk'],
    content: '575 kasus kekerasan terhadap anak di DIY, penguatan perlindungan anak di lingkungan pendidikan',
    section: 'news'
  },
  {
    id: 'berita-ecdi-2030',
    title: 'Deputi Woro Tegaskan Sinergi PAUDHI Hadapi ECDI 2030',
    url: '/#berita',
    category: 'Berita',
    description: 'Pentingnya sinergi lintas sektor dalam mendukung peluncuran Indeks Perkembangan Anak Usia Dini (ECDI) 2030',
    keywords: ['ecdi 2030', 'indeks perkembangan', 'anak usia dini', 'sinergi', 'indonesia emas 2045', 'woro srihastuti'],
    content: '87,7% anak usia 24-59 bulan berkembang sesuai tahapan sensorik, kognitif, bahasa, dan kesejahteraan',
    section: 'news'
  },
  {
    id: 'berita-strategi-baru',
    title: 'Strategi Baru PAUDHI 2025–2029 Disusun di Hotel Mercure Jakarta',
    url: '/#berita',
    category: 'Berita',
    description: 'Evaluasi RAN PAUDHI 2020–2024 dan penyusunan strategi lanjutan untuk 2025–2029',
    keywords: ['ran paud hi', 'strategi nasional', 'rpjmn', '2025-2029', 'kementerian koordinator bidang pembangunan manusia dan kebudayaan', 'evaluasi'],
    content: 'Pendekatan holistik mencakup kesehatan, gizi, pengasuhan, perlindungan, digitalisasi SISMONEV',
    section: 'news'
  },

  // === FAQ CONTENT ===
  {
    id: 'faq-apa-itu-paud-hi',
    title: 'Apa itu PAUDHI?',
    url: '/faq',
    category: 'FAQ',
    description: 'PAUDHI adalah program layanan lengkap untuk anak usia 0–6 tahun yang mencakup pendidikan, kesehatan, gizi, perlindungan, dan pengasuhan',
    keywords: ['paud hi', 'pengembangan anak usia dini', 'holistik integratif', 'definisi', 'layanan terpadu'],
    content: 'Layanan terpadu dan terkoordinasi oleh berbagai sektor, memastikan anak tumbuh optimal, imunisasi, gizi, dukungan orang tua',
    section: 'faq'
  },
  {
    id: 'faq-siapa-penyelenggara',
    title: 'Siapa yang menyelenggarakan PAUDHI?',
    url: '/faq',
    category: 'FAQ',
    description: 'PAUDHI dilaksanakan oleh satuan PAUD di daerah dengan dukungan pemerintah daerah melalui gugus tugas PAUDHI',
    keywords: ['penyelenggara', 'satuan paud', 'gugus tugas', 'pemerintah daerah', 'lintas sektor'],
    content: 'Koordinasi sektor pendidikan, kesehatan, perlindungan anak, gizi, ketahanan pangan',
    section: 'faq'
  },
  {
    id: 'faq-tujuan-paud-hi',
    title: 'Apa tujuan dari PAUDHI?',
    url: '/faq',
    category: 'FAQ',
    description: 'Memastikan setiap anak usia dini mendapatkan layanan esensial secara menyeluruh agar tumbuh optimal',
    keywords: ['tujuan', 'layanan esensial', 'tumbuh kembang', 'fisik', 'kognitif', 'emosional', 'sosial'],
    content: 'Aspek fisik: pertumbuhan, kesehatan, motorik. Kognitif: berpikir, belajar. Emosional: karakter. Sosial: interaksi',
    section: 'faq'
  },
  {
    id: 'faq-manfaat-keluarga',
    title: 'Apa manfaat PAUDHI untuk anak dan keluarga?',
    url: '/faq',
    category: 'FAQ',
    description: 'PAUDHI memberikan manfaat komprehensif dengan layanan lengkap dan pengetahuan pengasuhan',
    keywords: ['manfaat', 'anak', 'keluarga', 'layanan lengkap', 'stimulasi', 'deteksi dini', 'pengasuhan'],
    content: 'One-stop service, stimulasi tepat usia, deteksi dini masalah, dukungan komunitas pengasuhan',
    section: 'faq'
  },

  // === HALAMAN ABOUT ===
  {
    id: 'tentang-paud-hi',
    title: 'Tentang PAUDHI dan Tujuannya',
    url: '/about',
    category: 'Informasi',
    description: 'Informasi lengkap tentang Pengembangan Anak Usia Dini Holistik Integratif dan visi misinya',
    keywords: ['tentang', 'about', 'visi', 'misi', 'sejarah', 'tujuan', 'program'],
    content: 'Sejarah, visi misi, timeline perkembangan PAUDHI di Indonesia',
    section: 'about'
  },



  // === DASHBOARD ===
  {
    id: 'dashboard-indikator',
    title: 'Dashboard Capaian Indikator PAUDHI',
    url: '/dashboard',
    category: 'Data & Statistik',
    description: 'Dashboard monitoring capaian indikator PAUDHI secara nasional dan regional',
    keywords: ['dashboard', 'indikator', 'capaian', 'statistik', 'monitoring', 'data', 'nasional', 'regional'],
    content: 'Visualisasi data capaian PAUDHI, grafik perkembangan, analisis regional, trend nasional',
    section: 'dashboard'
  },

  // === PANDUAN & EDUKASI ===
  {
    id: 'panduan-buku-guru',
    title: 'Belajar dan Bermain Berbasis Buku - Buku Guru PAUD',
    url: '/#panduan',
    category: 'Panduan',
    description: 'Panduan resmi Kemdikbud untuk pembelajaran dan bermain berbasis buku di PAUD',
    keywords: ['buku guru', 'pembelajaran', 'bermain', 'berbasis buku', 'kemdikbud', 'holistik integratif'],
    content: 'Panduan resmi pembelajaran berbasis buku, integrasi bermain dan belajar, pendekatan holistik, 156 halaman',
    section: 'education'
  },
  {
    id: 'panduan-kurikulum-merdeka',
    title: 'Pembelajaran Fase Fondasi (PAUD) - Kurikulum Merdeka',
    url: '/#panduan',
    category: 'Panduan',
    description: 'Panduan implementasi Kurikulum Merdeka untuk fase fondasi PAUD',
    keywords: ['kurikulum merdeka', 'fase fondasi', 'pembelajaran bermakna', 'pancasila', 'guru', 'orang tua'],
    content: 'Pembelajaran berbasis permainan, lingkungan bermakna, nilai-nilai Pancasila, peran guru dan orang tua',
    section: 'education'
  },
  {
    id: 'panduan-peran-ayah',
    title: 'Peran Ayah dalam Pengasuhan Anak',
    url: '/#panduan',
    category: 'Panduan',
    description: 'Panduan praktis bagi para ayah dalam menjalankan peran pengasuhan yang setara dan penuh kasih',
    keywords: ['peran ayah', 'pengasuhan', 'keluarga', 'sosial emosional', 'komunikasi', 'kolaborasi'],
    content: 'Keterlibatan ayah, ikatan emosional, tumbuh kembang seimbang, komunikasi positif, 92 halaman',
    section: 'education'
  },

  // === VIDEO EDUKASI ===
  {
    id: 'video-stimulasi-bayi',
    title: 'Stimulasi Holistik untuk Bayi 0-12 Bulan',
    url: '/#video',
    category: 'Video Tutorial',
    description: 'Tutorial komprehensif stimulasi yang mengintegrasikan aspek fisik, kognitif, dan sosial-emosional untuk bayi',
    keywords: ['stimulasi', 'bayi', '0-12 bulan', 'holistik', 'fisik', 'kognitif', 'sosial emosional', 'tutorial'],
    content: 'Stimulasi motorik terintegrasi, bonding sehat, deteksi dini keterlambatan, 25 menit, 125k views',
    section: 'education'
  },
  {
    id: 'video-ran-paud-hi',
    title: 'Rencana Aksi Nasional (RAN) PAUDHI',
    url: '/#video',
    category: 'Video Tutorial',
    description: 'RAN PAUDHI sebagai pedoman koordinasi dan sinergi seluruh pemangku kepentingan anak usia dini',
    keywords: ['ran paud hi', 'rencana aksi nasional', 'koordinasi', 'sinergi', 'pemangku kepentingan'],
            content: 'Pedoman koordinasi nasional, gotong royong pemangku kepentingan, 6 menit, Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    section: 'education'
  },
  {
    id: 'video-kurikulum-kreatif',
    title: 'Kegiatan Pembelajaran Kurikulum Merdeka: Kreatif',
    url: '/#video',
    category: 'Video Tutorial',
    description: 'Kurikulum Merdeka memberikan keleluasaan pendidik mengembangkan pembelajaran sesuai karakteristik peserta didik',
    keywords: ['kurikulum merdeka', 'kreatif', 'pembelajaran', 'pendidik', 'peserta didik', 'karakteristik'],
            content: 'Keleluasaan pendidik, pembelajaran sesuai karakteristik, kreativitas, 4 menit, Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan',
    section: 'education'
  },

  // === TOOLS & ASSESSMENT ===
  {
    id: 'tool-checklist-perkembangan',
    title: 'Checklist Perkembangan Holistik 0-6 Tahun',
    url: '/#tools',
    category: 'Assessment Tool',
    description: 'Tool asesmen komprehensif untuk memantau perkembangan anak di semua aspek',
    keywords: ['checklist', 'perkembangan', 'holistik', '0-6 tahun', 'milestone', 'monitoring', 'asesmen'],
    content: 'Milestone per aspek, grafik perkembangan, rekomendasi stimulasi, alert system, PDF + Excel',
    section: 'education'
  },
  {
    id: 'tool-kesiapan-sekolah',
    title: 'Kuesioner Kesiapan Sekolah Holistik',
    url: '/#tools',
    category: 'Assessment Tool',
    description: 'Instrumen untuk mengukur kesiapan anak masuk sekolah dari berbagai aspek',
    keywords: ['kesiapan sekolah', 'kuesioner', 'asesmen', 'multi-aspek', 'prediktif', 'masuk sd'],
    content: '6 domain perkembangan, scoring otomatis, profil kekuatan, rencana intervensi, online form',
    section: 'education'
  },
  {
    id: 'tool-sosial-emosional',
    title: 'Asesmen Keterampilan Sosial Emosional',
    url: '/#tools',
    category: 'Assessment Tool',
    description: 'Tool khusus untuk mengukur perkembangan sosial emosional anak',
    keywords: ['sosial emosional', 'keterampilan', 'asesmen', 'interaksi', 'regulasi diri', 'empati'],
    content: 'Skala emosi, peer interaction, self-regulation, empathy meter, digital assessment',
    section: 'education'
  },
  {
    id: 'tool-tangki-emosi',
    title: 'Isi Tangki Emosi Orang Tua',
    url: '/#tools',
    category: 'Parenting Tool',
    description: 'Tips praktis untuk menjaga kesehatan mental orang tua agar bisa mendidik anak dengan bahagia',
    keywords: ['tangki emosi', 'orang tua', 'kesehatan mental', 'self-care', 'parenting', 'emosi'],
    content: 'Waktu untuk diri sendiri, kenali emosi, boleh curhat, ambil jeda, checklist emosi harian',
    section: 'education'
  },

  // === TOPIK KHUSUS ===
  {
    id: 'topik-gizi-anak',
    title: 'Pentingnya Gizi Seimbang untuk Anak Usia Dini',
    url: '/news/gizi-anak',
    category: 'Artikel',
    description: 'Panduan lengkap tentang nutrisi dan gizi seimbang untuk mendukung tumbuh kembang optimal anak',
    keywords: ['gizi', 'nutrisi', 'anak usia dini', 'seimbang', 'tumbuh kembang', 'makanan sehat'],
    content: 'Kebutuhan gizi per usia, menu seimbang, tips pemberian makan, deteksi malnutrisi',
    section: 'article'
  },
  {
    id: 'topik-stimulasi-dini',
    title: 'Stimulasi Dini untuk Perkembangan Optimal',
    url: '/tips/stimulasi',
    category: 'Tips',
    description: 'Cara memberikan stimulasi yang tepat untuk mengoptimalkan perkembangan anak usia dini',
    keywords: ['stimulasi', 'perkembangan', 'optimal', 'motorik', 'kognitif', 'bahasa', 'sosial'],
    content: 'Stimulasi motorik halus dan kasar, stimulasi kognitif, bahasa, sosial emosional per usia',
    section: 'tips'
  },
  {
    id: 'topik-deteksi-dini',
    title: 'Deteksi Dini Gangguan Tumbuh Kembang',
    url: '/kesehatan/deteksi-dini',
    category: 'Kesehatan',
    description: 'Mengenali tanda-tanda gangguan tumbuh kembang dan langkah-langkah intervensi dini',
    keywords: ['deteksi dini', 'gangguan', 'tumbuh kembang', 'intervensi', 'red flags', 'milestone'],
    content: 'Red flags per usia, kapan perlu khawatir, langkah intervensi, rujukan ke ahli',
    section: 'health'
  },

  // === PROGRAM PEMERINTAH ===
  {
    id: 'program-gugus-tugas',
    title: 'Gugus Tugas PAUDHI Daerah',
    url: '/program/gugus-tugas',
    category: 'Program',
    description: 'Pembentukan dan penguatan gugus tugas PAUDHI di tingkat daerah',
    keywords: ['gugus tugas', 'daerah', 'koordinasi', 'lintas sektor', 'implementasi', 'sinergi'],
    content: 'Pembentukan gugus tugas, koordinasi OPD, perencanaan daerah, monitoring evaluasi',
    section: 'program'
  }
];

// Fungsi pencarian
export const searchContent = (query, filters = {}) => {
  if (!query || query.length < 2) return [];
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
  
  return comprehensiveSearchIndex.filter(item => {
    // Filter berdasarkan kategori jika ada
    if (filters.category && item.category !== filters.category) return false;
    if (filters.section && item.section !== filters.section) return false;
    
    // Pencarian di semua field
    const searchableText = [
      item.title,
      item.description,
      item.content,
      ...item.keywords
    ].join(' ').toLowerCase();
    
    // Item harus mengandung semua search terms (AND logic)
    return searchTerms.every(term => searchableText.includes(term));
  }).map(item => ({
    ...item,
    // Hitung relevance score
    relevanceScore: calculateRelevance(item, searchTerms)
  })).slice().sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Fungsi untuk menghitung skor relevansi
const calculateRelevance = (item, searchTerms) => {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  
  searchTerms.forEach(term => {
    // Exact match di title = skor tinggi
    if (titleLower.includes(term)) score += 10;
    // Exact match di description = skor sedang
    if (descLower.includes(term)) score += 5;
    // Match di keywords = skor rendah
    if (item.keywords.some(keyword => keyword.includes(term))) score += 3;
  });
  
  return score;
};

// Fungsi untuk mendapatkan kategori yang tersedia
export const getAvailableCategories = () => {
  const categories = [...new Set(comprehensiveSearchIndex.map(item => item.category))];
  return [...categories].sort();
};

// Fungsi untuk mendapatkan saran pencarian
export const getSearchSuggestions = (query) => {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set();
  const queryLower = query.toLowerCase();
  
  comprehensiveSearchIndex.forEach(item => {
    // Tambahkan keywords yang mengandung query
    item.keywords.forEach(keyword => {
      if (keyword.includes(queryLower) && !suggestions.has(keyword)) {
        suggestions.add(keyword);
      }
    });
    
    // Tambahkan judul yang mengandung query
    if (item.title.toLowerCase().includes(queryLower)) {
      suggestions.add(item.title);
    }
  });
  
  return Array.from(suggestions).slice(0, 5);
};

export default comprehensiveSearchIndex;