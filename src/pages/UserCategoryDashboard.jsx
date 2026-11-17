import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, HeartPulse, MapPinned, Users, GraduationCap, ShieldCheck, ClipboardList, Database, ChartNoAxesCombined, FileText, LifeBuoy, CalendarDays, MessagesSquare, Baby, Newspaper, HelpCircle, Building2 } from "lucide-react";
import Footer from "../components/Footer";

const dashboards = {
  masyarakat: {
    title: "Masyarakat Umum / Orang Tua",
    greeting: "Halo, Ayah dan Bunda! Temukan informasi dan layanan untuk mendukung tumbuh kembang anak.",
    description: "Informasi dan akses layanan untuk mendukung tumbuh kembang, kesehatan, pendidikan, pengasuhan, dan perlindungan anak usia dini.",
    menus: [
      ["Mengenal PAUDHI", "Pengertian, tujuan, prinsip, dan pentingnya penyelenggaraan PAUDHI.", BookOpen],
      ["Tumbuh Kembang Anak", "Informasi perkembangan fisik, kognitif, bahasa, motorik, dan sosial-emosional.", Baby],
      ["Kesehatan dan Gizi", "Informasi kesehatan ibu dan anak, gizi seimbang, imunisasi, dan pencegahan stunting.", HeartPulse],
      ["Pendidikan Anak Usia Dini", "Informasi pendidikan, stimulasi pembelajaran, dan layanan pendidikan.", GraduationCap],
      ["Pengasuhan dan Perlindungan Anak", "Pengasuhan positif, pemenuhan hak, dan perlindungan anak.", ShieldCheck],
      ["Direktori Layanan Anak", "Informasi fasilitas dan penyedia layanan untuk anak usia dini.", Building2],
      ["Peta Sebaran Daycare", "Struktur informasi persebaran lokasi daycare; pencarian lokasi belum tersedia.", MapPinned, true],
      ["Konsultasi dan Pengaduan", "Informasi kanal konsultasi dan pengaduan terkait kebutuhan anak.", MessagesSquare],
      ["Artikel, Berita, dan Edukasi", "Artikel dan materi edukasi mengenai PAUDHI.", Newspaper],
      ["FAQ", "Pertanyaan umum mengenai PAUDHI dan layanan terkait.", HelpCircle],
    ],
  },
  tenaga: {
    title: "Tenaga Pendidik / Kesehatan",
    greeting: "Selamat Datang, Tenaga Pendidik dan Tenaga Kesehatan. Temukan referensi dan dukungan untuk meningkatkan kualitas penyelenggaraan layanan PAUDHI.",
    description: "Referensi dan dukungan pelaksanaan layanan Pengembangan Anak Usia Dini Holistik Integratif.",
    menus: [
      ["Pedoman dan Regulasi PAUDHI", "Peraturan, kebijakan, dan pedoman penyelenggaraan PAUDHI.", FileText],
      ["Standar dan Panduan Pelayanan", "Standar dan panduan pelaksanaan layanan sesuai bidang.", ClipboardList],
      ["Modul dan Materi Edukasi", "Materi pembelajaran dan referensi pendukung layanan.", BookOpen],
      ["Instrumen Pendukung Layanan", "Instrumen dan perangkat pendukung pelaksanaan layanan PAUDHI.", ClipboardList],
      ["Pelatihan dan Bimbingan Teknis", "Informasi pelatihan, webinar, dan peningkatan kapasitas.", GraduationCap],
      ["Praktik Baik Penyelenggaraan PAUDHI", "Contoh praktik pelaksanaan PAUDHI sebagai referensi.", ShieldCheck],
      ["Forum dan Jejaring", "Ruang berbagi informasi dan pengalaman antar tenaga.", Users],
      ["Informasi Program dan Kegiatan", "Informasi program, agenda, dan kegiatan terkait PAUDHI.", CalendarDays],
      ["Pusat Bantuan", "Panduan dan bantuan penggunaan platform.", LifeBuoy],
    ],
  },
  instansi: {
    title: "Instansi Pemerintah",
    greeting: "Selamat Datang di Portal Instansi Pemerintah. Akses data, pantau capaian, dan dukung koordinasi penyelenggaraan PAUDHI.",
    description: "Data, tata kelola, koordinasi, monitoring, dan evaluasi penyelenggaraan PAUDHI.",
    menus: [
      ["Dashboard Capaian PAUDHI", "Gambaran umum capaian pelaksanaan PAUDHI.", ChartNoAxesCombined],
      ["Data dan Indikator PAUDHI", "Informasi indikator, baseline, target, realisasi, dan sumber data.", Database],
      ["Monitoring dan Evaluasi", "Pemantauan program, capaian indikator, kendala, dan tindak lanjut.", ClipboardList],
      ["Pemetaan Capaian Wilayah", "Informasi persebaran dan capaian PAUDHI berdasarkan wilayah.", MapPinned],
      ["Penginputan dan Pembaruan Data", "Struktur fasilitas pengisian dan pembaruan data sesuai kewenangan.", Database],
      ["Pelaporan dan Validasi Data", "Struktur penyampaian laporan dan proses validasi data.", FileText],
      ["Rencana Aksi Nasional PAUDHI", "Informasi dokumen, target, dan pelaksanaan RAN PAUDHI.", ClipboardList],
      ["Regulasi dan Dokumen Kebijakan", "Kumpulan regulasi, pedoman, dan dokumen pendukung.", FileText],
      ["Koordinasi Lintas Sektor", "Informasi kelembagaan, pembagian peran, dan koordinasi lintas sektor.", Users],
      ["Pusat Bantuan dan Panduan Sistem", "Panduan penggunaan SISMONEV dan bantuan teknis.", LifeBuoy],
    ],
  },
};

export default function UserCategoryDashboard() {
  const { category } = useParams();
  const dashboard = dashboards[category];

  if (!dashboard) return <main className="min-h-[60vh] px-4 pt-28 text-center"><h1 className="text-2xl font-bold text-gray-900">Kategori tidak ditemukan</h1><Link className="mt-4 inline-block text-blue-700 underline" to="/">Kembali ke Beranda</Link></main>;

  return (
    <>
      <main id="main-content" className="min-h-screen bg-white px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"><ArrowLeft size={18} /> Kembali ke Beranda</Link>
          <header className="mb-8 rounded-xl bg-blue-50 p-6 sm:p-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Portal Layanan Terpadu Satu Pintu PAUDHI</p>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{dashboard.title}</h1>
            <p className="mt-3 max-w-4xl text-base leading-relaxed text-gray-700">{dashboard.greeting}</p>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-600">{dashboard.description}</p>
          </header>
          <section aria-labelledby="dashboard-menu-title">
            <h2 id="dashboard-menu-title" className="mb-5 text-xl font-bold text-gray-900">Menu dan informasi</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.menus.map(([title, description, Icon, featured]) => (
                <div key={title} className={`flex h-full flex-col rounded-xl border p-5 ${featured ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"}`}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Icon size={21} /></span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">Segera tersedia</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500">Informasi awal <ArrowRight size={16} /></span>
                </div>
              ))}
            </div>
          </section>
          <div className="mt-8 border-t border-gray-200 pt-5 text-sm text-gray-600">Pilih kategori lain melalui <Link to="/" className="font-medium text-blue-700 hover:underline">Beranda utama</Link>.</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
