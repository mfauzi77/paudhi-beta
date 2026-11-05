import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trees, 
  MapPin, 
  Heart, 
  ChevronRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Clock,
  LayoutGrid,
  Info
} from 'lucide-react';
import Footer from '../../components/Footer';

const PAUDHIServicePage = () => {
  const taraLocations = [
    { id: 1, name: 'TARA Jakarta Pusat', address: 'Jl. Merdeka No. 1, Gambir', status: 'Aktif' },
    { id: 2, name: 'TARA Surabaya', address: 'Jl. Pahlawan No. 10, Bubutan', status: 'Aktif' },
    { id: 3, name: 'TARA Bandung', address: 'Jl. Asia Afrika No. 65, Sumur Bandung', status: 'Pemeliharaan' },
    { id: 4, name: 'TARA Medan', address: 'Jl. Sisingamangaraja No. 20, Medan Kota', status: 'Aktif' },
  ];

  const tamasyaLocations = [
    { id: 1, name: 'TAMASYA Yogyakarta', address: 'Jl. Malioboro No. 5, Danurejan', type: 'Pusat Layanan' },
    { id: 2, name: 'TAMASYA Semarang', address: 'Jl. Pemuda No. 142, Semarang Tengah', type: 'Pusat Layanan' },
    { id: 3, name: 'TAMASYA Makassar', address: 'Jl. Penghibur No. 10, Makassar', type: 'Sentra Terpadu' },
    { id: 4, name: 'TAMASYA Denpasar', address: 'Jl. Gajah Mada No. 1, Denpasar Barat', type: 'Sentra Terpadu' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-700 to-emerald-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-overlay blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Layanan Terpadu PAUDHI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              TARA & TAMASYA
            </h1>
            <p className="text-lg md:text-xl text-blue-50/90 max-w-2xl mx-auto leading-relaxed">
              Mewujudkan lingkungan yang ramah, aman, dan edukatif bagi pertumbuhan optimal anak-anak Indonesia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Cards */}
      <section className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TARA Intro */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Trees className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">TARA</h2>
              <p className="text-sm font-medium text-emerald-600 mb-4 tracking-widest uppercase">Taman Ramah Anak</p>
              <p className="text-gray-600 leading-relaxed">
                Ruang terbuka publik yang dirancang khusus untuk memberikan keamanan, kenyamanan, dan stimulasi motorik bagi anak-anak melalui fasilitas bermain yang terstandarisasi.
              </p>
            </motion.div>

            {/* TAMASYA Intro */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">TAMASYA</h2>
              <p className="text-sm font-medium text-indigo-600 mb-4 tracking-widest uppercase">Tempat Layanan Menarik Anak & Sayang Anak</p>
              <p className="text-gray-600 leading-relaxed">
                Sentral layanan holistik integratif yang menggabungkan aspek kesehatan, pendidikan, dan perlindungan anak dalam satu lokasi yang menyenangkan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sebaran Layanan</h2>
              <p className="text-gray-500">Daftar lokasi percontohan program TARA dan TAMASYA di seluruh Indonesia.</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                <LayoutGrid className="w-3 h-3 mr-1" />
                Daftar Grid
              </span>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* TARA List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Trees className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Model TARA</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {taraLocations.map((loc) => (
                  <motion.div 
                    key={loc.id}
                    variants={itemVariants}
                    className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-gray-50 group-hover:bg-emerald-50 rounded-lg transition-colors">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        loc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {loc.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{loc.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{loc.address}</p>
                    <button className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:gap-1.5 transition-all">
                      Detail Lokasi <ChevronRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* TAMASYA List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Model TAMASYA</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tamasyaLocations.map((loc) => (
                  <motion.div 
                    key={loc.id}
                    variants={itemVariants}
                    className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-gray-50 group-hover:bg-indigo-50 rounded-lg transition-colors">
                        <Users className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-100 text-indigo-700">
                        {loc.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{loc.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{loc.address}</p>
                    <button className="mt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:gap-1.5 transition-all">
                      Lihat Fasilitas <ChevronRight className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Standar Layanan</h2>
            <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold mb-3">Keamanan Terjamin</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Setiap lokasi telah diverifikasi menggunakan indikator keamanan anak yang ketat sesuai regulasi PAUDHI.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold mb-3">Aksesibilitas 24/7</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ruang publik (TARA) dirancang untuk dapat diakses dengan mudah oleh keluarga kapanpun dibutuhkan.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                <Info className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold mb-3">Informasi Terpusat</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Setiap sentra TAMASYA menyediakan pusat informasi edukasi bagi orang tua terkait tumbuh kembang anak.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PAUDHIServicePage;
