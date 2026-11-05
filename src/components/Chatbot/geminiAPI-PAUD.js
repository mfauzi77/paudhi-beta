// geminiAPI-PAUD.js - Protected API Integration untuk SISMONEV PAUDHI via Backend Proxy
// REFACTORED: Uses Shared AI Service

import { generateContent } from '@services/ai/geminiClient';

const SUPPORT_PHONE = import.meta.env.VITE_REACT_APP_SUPPORT_PHONE || "0811-1234-5678";

// FAQ Data untuk fallback dan context
const faqData = [
  {
    id: 1,
    question: "Apa itu PAUDHI?",
    answer:
      "PAUDHI (Pengembangan Anak Usia Dini Holistik Integratif) adalah pendekatan layanan pengembangan anak usia dini yang mencakup kebutuhan esensial anak usia 0-6 tahun secara menyeluruh dan terpadu. Kebutuhan tersebut meliputi kesehatan, gizi, pengasuhan, pendidikan, dan perlindungan, melalui keterlibatan lintas sektor.",
    keywords: ["paud hi", "pengembangan anak", "holistik integratif", "usia dini"],
  },
  {
    id: 2,
    question: "Apa tujuan utama PAUDHI?",
    answer:
      "Tujuan PAUDHI adalah memastikan setiap anak usia dini tumbuh dan berkembang secara optimal melalui layanan yang terpadu, berkualitas, dan mudah diakses oleh keluarga dan masyarakat.",
    keywords: ["tujuan", "optimal", "berkembang", "layanan terpadu"],
  },
  {
    id: 3,
    question: "Apa itu SISMONEV PAUDHI?",
    answer:
      "SISMONEV PAUDHI adalah Sistem Informasi, Monitoring, dan Evaluasi nasional yang menyediakan platform digital terintegrasi untuk memantau pelaksanaan program PAUDHI lintas sektor secara efektif dan real time.",
    keywords: ["sismonev", "sistem informasi", "monitoring", "evaluasi", "platform digital"],
  },
  {
    id: 4,
    question: "Kementerian/Lembaga mana saja yang terlibat dalam PAUDHI?",
    answer:
      "PAUDHI melibatkan berbagai Kementerian/Lembaga, antara lain: Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan (koordinasi), Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, Kementerian Kesehatan, Kementerian Pemberdayaan Perempuan dan Perlindungan Anak, Kementerian Sosial, Kementerian Agama, Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi, Kementerian PUPR, Kementerian Dalam Negeri, Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional, BPOM, Badan Perencanaan Pembangunan Nasional, dll.",
    keywords: ["kementerian", "lembaga", "kementerian koordinator bidang pembangunan manusia dan kebudayaan", "kementerian pendidikan kebudayaan riset dan teknologi", "kementerian kesehatan"],
  },
  {
    id: 5,
    question: "Apa saja indikator utama dalam PAUDHI?",
    answer:
      "Indikator PAUDHI mencakup: Akses anak terhadap layanan PAUD, Status gizi dan kesehatan anak, Akses terhadap sanitasi dan air bersih, Layanan pengasuhan dan perlindungan anak, Partisipasi keluarga dan masyarakat.",
    keywords: ["indikator", "akses", "gizi", "kesehatan", "sanitasi", "pengasuhan", "partisipasi"],
  },
  {
    id: 6,
    question: "Bagaimana cara menggunakan SISMONEV PAUDHI?",
    answer:
      "SISMONEV dapat diakses oleh K/L, pemerintah daerah, dan mitra lainnya melalui akun login masing-masing. Melalui dashboard admin, pengguna bisa: Menginput berita kegiatan PAUDHI, Memasukkan data statistik, Memantau indikator lintas sektor, Melihat laporan dan grafik perkembangan.",
    keywords: ["cara menggunakan", "akses", "login", "dashboard", "input data"],
  },
  {
    id: 7,
    question: "Apa manfaat SISMONEV PAUDHI bagi pemerintah dan masyarakat?",
    answer:
      "Manfaat SISMONEV PAUDHI: Menyediakan data real-time dan terintegrasi, Meningkatkan koordinasi lintas sektor, Membantu perencanaan program berbasis data, Mendukung kebijakan pembangunan anak usia dini.",
    keywords: ["manfaat", "real-time", "koordinasi", "perencanaan", "kebijakan"],
  },
  {
    id: 8,
    question: "Apakah ada inovasi dalam implementasi PAUDHI?",
    answer:
      "Ya. PAUDHI terus dikembangkan melalui: Sistem Early Warning System (EWS), Integrasi dengan Google Sheets dan WhatsApp untuk monitoring lapangan, Dashboard analisis data yang user-friendly, Pendekatan berbasis budaya lokal.",
    keywords: ["inovasi", "early warning", "google sheets", "whatsapp", "dashboard", "budaya lokal"],
  },
  {
    id: 9,
    question: "Bagaimana strategi pembiayaan PAUDHI?",
    answer:
      "Pembiayaan PAUDHI berasal dari APBN, APBD, serta sumber dana lain yang sah. K/L and daerah juga diharapkan mengalokasikan anggaran untuk program PAUDHI sesuai kewenangannya.",
    keywords: ["pembiayaan", "apbn", "apbd", "anggaran", "alokasi"],
  },
  {
    id: 10,
    question: "Bagaimana cara mendukung program PAUDHI di daerah?",
    answer:
      "Cara mendukung program PAUDHI di daerah: Mengintegrasikan layanan PAUDHI dalam RPJMD dan Renstra Daerah, Memperkuat koordinasi lintas sektor daerah, Melibatkan masyarakat dan kader dalam implementasi, Menggunakan data SISMONEV untuk intervensi yang tepat sasaran.",
    keywords: ["dukung program", "daerah", "rpjmd", "koordinasi", "masyarakat", "kader", "intervensi"],
  },
];

export async function callGeminiAPI(userPrompt) {
  // System prompt yang fokus pada PAUDHI dan pengasuhan anak
  const systemPrompt = `
    Kamu adalah chatbot pakar dalam bidang Pengasuhan dan Pengembangan Anak Usia Dini (PAUD) yang dirancang untuk mendampingi orang tua, guru PAUD, kader posyandu, dan pengambil kebijakan dalam memberikan perawatan dan stimulasi terbaik bagi anak usia 0–6 tahun. Jawabanmu harus berbasis bukti ilmiah terkini dan dapat dipertanggungjawabkan secara akademik dan praktis.
    
    - Untuk jawaban cari dulu ke link /About, /faq
    - untuk peraturan paud hi, cari dalam dokumen 'https://jdih.kemenpppa.go.id/peraturan/perpres_no.60-2013.pdf'
    
    Tugas dan prinsip utama kamu:
    - Memberikan jawaban akurat dan berdasarkan penelitian ilmiah atau panduan dari lembaga terpercaya seperti WHO, UNICEF, CDC, Ikatan Dokter Anak Indonesia (IDAI), dan Kementerian Kesehatan RI.
    - Menyampaikan informasi dengan bahasa yang mudah dipahami, empatik, dan tidak menghakimi.
    - Selalu memberikan disclaimer jika pertanyaan menyentuh ranah medis, psikologis, atau gizi klinis — sarankan untuk berkonsultasi dengan profesional berlisensi.
    - Memahami konteks sosial, budaya, dan kebijakan nasional Indonesia terkait PAUD, seperti Standar Nasional PAUD, Buku KIA, Bina Keluarga Balita, Posyandu, dan Kurikulum Merdeka.
    - Mampu menyesuaikan jawaban berdasarkan usia anak (0–6 tahun), tahapan tumbuh kembang, dan kebutuhan spesifik.

    Saat menjawab, gunakan pendekatan ilmiah namun komunikatif. Jika ada perbedaan panduan antar negara, prioritaskan pendekatan yang relevan dengan konteks Indonesia. Jangan membuat asumsi tanpa dasar ilmiah.

    Contoh sub-bidang yang kamu kuasai:
    - Perkembangan anak: motorik kasar & halus, kognitif, bahasa, sosial-emosi
    - Gizi dan MP-ASI: rekomendasi WHO & IDAI, panduan lokal Indonesia
    - Imunisasi, tumbuh kembang, dan deteksi dini masalah kesehatan
    - Strategi stimulasi dini berbasis bermain dan cinta kasih
    - Pendidikan anak usia dini dan transisi PAUD ke SD
    - Pengasuhan positif dan perlindungan anak dari kekerasan

    - jangan memberikan jawaban spekulatif atau mitos. Fokuslah pada edukasi berbasis bukti (*evidence-based parenting*).
    -Fokuskan seluruh jawaban hanya pada topik, Abaikan dan tolak hal-hal di luar topik pengasuhan dengan sopan.

    FOKUS UTAMA:
    - Berikan jawaban yang ramah, informatif, dan mudah dipahami
    - Gunakan bahasa Indonesia yang sesuai dengan konteks keluarga Indonesia
    - Selalu berikan saran praktis dan dapat diterapkan
    - Integrasikan informasi PAUDHI dalam konteks pengasuhan sehari-hari
    -Jawab dengan ramah and profesional dalam bahasa Indonesia. jika pertanyaan tidak relevan dengan PAUDHI atau pengasuhan, tolak dengan sopan.
    -Jangan pakai kalimat yang terlalu panjang, gunakan kalimat singkat dan jelas.
    
    **MODE STANDBY KETAT**:
    - Sistem ini berisi banyak data sektoral (JSON). Dilarang keras menganalisis seluruh file secara otomatis.
    - Hanya proses data yang secara spesifik ditanyakan oleh user.
    - Jika tidak ada pertanyaan spesifik, tetaplah dalam mode 'standby' tanpa memberikan analisis analisis panjang. Cukup tanyakan apa yang bisa dibantu.

  - Aturan penulisan:
    Jangan gunakan tanda bintang (*) (**) atau underscore (_) untuk membuat teks tebal atau miring.
    Jangan gunakan format Markdown seperti judul (#), teks tebal, teks miring, atau blok kode.
    Gunakan teks polos sepenuhnya.
    Pastikan paragraf tertata rapi: setiap ide utama ditulis dalam paragraf baru (pisahkan dengan satu baris kosong).
    Gunakan tanda titik, koma, dan kapitalisasi dengan baik agar teks terlihat profesional.

    DATABASE PENGETAHUAN PAUDHI:
    ${faqData.map((faq) => `${faq.question}: ${faq.answer}`).join("\n")}
  `;

  try {
    const text = await generateContent({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        appSource: 'CHATBOT'
    });
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);

    // Fallback ke FAQ jika API gagal
    const relevantFAQ = searchFAQ(userPrompt);
    if (relevantFAQ.length > 0) {
      const bestMatch = relevantFAQ[0];
      return `📋 Berdasarkan FAQ PAUDHI:\n\n${bestMatch.question}\n\n${bestMatch.answer}\n\n💡 Catatan: Layanan AI sedang sibuk atau gangguan, jawaban diambil dari database FAQ.`;
    }

    return `❌ Maaf, AI sedang mengalami gangguan dan saya tidak menemukan informasi spesifik di FAQ.\n\n💡 Silakan:\n• Hubungi staf via WhatsApp: ${SUPPORT_PHONE}\n• Isi form kontak untuk bantuan lebih lanjut\n• Coba pertanyaan dengan kata kunci yang berbeda`;
  }
}

// Fungsi untuk mencari FAQ yang relevan
function searchFAQ(query) {
  const queryLower = query.toLowerCase();
  return faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(queryLower) ||
      faq.answer.toLowerCase().includes(queryLower) ||
      faq.keywords.some((keyword) => queryLower.includes(keyword.toLowerCase()))
  );
}

// Export FAQ data untuk digunakan di komponen lain
export { faqData, searchFAQ };
