import React, { useState } from 'react';
import { motion } from 'framer-motion';

const services = [
  {
    id: 'education',
    title: 'Layanan Pendidikan',
    subtitle:
      'Menjamin akses dan kualitas pendidikan anak usia dini, serta penguatan peran pendidik dan lembaga keagamaan',
    icon: 'fas fa-graduation-cap',
    gradient: 'from-blue-100 to-blue-400',
    features: [
      'Program Pendidikan Anak Usia Dini Pendidikan Dasar dan Pendidikan Menengah',
      'Program Guru dan Tenaga Kependidikan',
      'Program Pendidikan Islam',
      'Program Bimbingan Masyarakat Katolik',
      'Program Bimbingan Masyarakat Buddha',
      'Program Bimbingan Masyarakat Hindu',
      'Program Bimbingan Masyarakat Khonghucu',
    ],
    button: {
      text: 'Jelajahi',
      link: 'https://api.whatsapp.com/send/?phone=62812202050',
      style: 'bg-white text-blue-700 border-3 border-blue-100 hover:bg-white',
      styleMobile: 'bg-white text-blue-700 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300',
    },
  },
  {
    id: 'health',
    title: 'Layanan Kesehatan dan Gizi',
    subtitle:
      'Mendukung kesehatan fisik dan gizi anak sejak dini melalui program-program strategis nasional',
    icon: 'fas fa-heartbeat',
    gradient: 'from-emerald-100 to-emerald-400',
    features: [
      'Program Peningkatan Kesehatan Ibu, Anak, Keluarga Berencana (KB), dan Kesehatan Reproduksi',
      'Program Percepatan Perbaikan Gizi Masyarakat',
      'Peningkatan Pengendalian Penyakit',
      'Penguatan Gerakan Masyarakat Hidup Sehat (GERMAS)',
      'Penguatan Pelayanan Kesehatan Dasar dan Rujukan',
    ],
    button: {
      text: 'Akses',
      link: 'https://asiksupport-stg.dto.kemkes.go.id',
      style: 'bg-white text-emerald-700 border-3 border-emerald-100 hover:bg-white',
      styleMobile: 'bg-white text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300',
    },
  },
  {
    id: 'parenting',
    title: 'Layanan Perlindungan, Pengasuhan dan Kesejahteraan',
    subtitle:
      'Memberikan perlindungan menyeluruh bagi anak serta memperkuat lingkungan pengasuhan dan kesejahteraan keluarga',
    icon: 'fas fa-users',
    gradient: 'from-amber-100 to-amber-400',
    features: [
      'Program Kesejahteraan Sosial Anak Terlantar dan Miskin',
      'Program Kependudukan, Keluarga Berencana, dan Pembangunan Keluarga',
      'Program Pendidikan Anak Usia Dini dan Pendidikan Masyarakat',
      'Program Perlindungan Anak',
      'Program Pendidikan Islam',
    ],
    button: {
      text: 'Hubungi',
      link: 'https://api.whatsapp.com/send?phone=628111129129',
      style: 'bg-white text-amber-700 border-3 border-amber-100 hover:bg-white',
      styleMobile: 'bg-white text-amber-700 border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300',
    },
  },
  {
    id: 'protection',
    title: 'Layanan Tata Kelola',
    subtitle:
      'Menjamin tata kelola program PAUDHI yang sinergis, terukur, dan berbasis data melalui koordinasi lintas sektor',
    icon: 'fas fa-shield-alt',
    gradient: 'from-purple-100 to-purple-400',
    features: [
      'Koordinasi Perencanaan Program PAUDHI',
      'Koordinasi Penyelenggaraan Program PAUDHI',
      'Koordinasi Pendataan Anak Usia Dini',
      'Program Pembangunan dan Pemberdayaan Masyarakat Desa',
    ],
    button: {
      text: 'Hubungi',
      link: '/',
      style: 'bg-white text-purple-700 border-3 border-purple-100 hover:bg-white',
      styleMobile: 'bg-white text-purple-700 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300',
    },
  },
];

const ServicesSection = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (serviceId) => {
    setExpandedCard(expandedCard === serviceId ? null : serviceId);
  };

  return (
    <section id="layanan" className="pt-8 pb-12 sm:pt-12 lg:pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Layanan Unggulan PAUDHI
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
            Beragam program dan kegiatan lintas sektor disinergikan untuk memastikan pemenuhan hak dasar anak secara menyeluruh, mulai dari aspek kesehatan, gizi, pendidikan, pengasuhan, hingga tata kelola yang mendukung tumbuh kembang optimal.
          </p>
        </div>

        {/* Services Cards - Mobile 2x2, Tablet 2x2, Desktop 4x1 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative rounded-xl lg:rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br ${service.gradient} text-gray-800 transition-all duration-300 
                ${expandedCard === service.id ? 'min-h-[400px] sm:min-h-[450px] md:min-h-[420px] lg:h-[540px]' : 'min-h-[180px] sm:min-h-[220px] md:min-h-[420px] lg:h-[540px]'} 
                flex flex-col cursor-pointer md:cursor-default`}
              onClick={(e) => {
                // Only allow click on mobile/tablet (below md breakpoint)
                if (window.innerWidth < 768) {
                  toggleCard(service.id);
                }
              }}
            >
              {/* Main Content */}
              <div className="p-3 sm:p-4 lg:p-6 relative z-10 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 flex items-center justify-center bg-white bg-opacity-30 rounded-lg lg:rounded-xl mb-2 sm:mb-3 lg:mb-4">
                  <i className={`${service.icon} text-sm sm:text-base lg:text-2xl`}></i>
                </div>
                <h3 className="text-xs sm:text-sm lg:text-lg font-bold mb-1 sm:mb-2 leading-tight">{service.title}</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{service.subtitle}</p>
                
                {/* Mobile Expand Indicator */}
                <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-between md:hidden">
                  <span className="text-xs text-gray-600 font-medium">
                    {expandedCard === service.id ? 'Tutup' : 'Detail'}
                  </span>
                  <i className={`fas ${expandedCard === service.id ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs text-gray-600 transition-transform duration-300`}></i>
                </div>
              </div>

              {/* Always Visible Button on Mobile/Tablet */}
              <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 z-10 md:hidden">
                <a
                  href={service.button.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${service.button.styleMobile} touch-manipulation`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.button.text}
                </a>
              </div>

              {/* Always Visible Button on Desktop */}
              <div className="px-6 pb-6 z-10 hidden md:block">
                <a
                  href={service.button.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center w-full px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${service.button.style}`}
                >
                  {service.button.text}
                </a>
              </div>

              {/* Mobile Expanded Content */}
              <div className={`absolute inset-0 bg-white text-gray-800 transition-all duration-300 p-3 sm:p-4 z-20 flex flex-col justify-between md:hidden
                ${expandedCard === service.id ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 rounded-lg mb-2 sm:mb-3">
                    <i className={`${service.icon} text-sm sm:text-base text-gray-600`}></i>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold mb-2 leading-tight">{service.title}</h3>
                  <p className="text-xs font-semibold mb-2 text-gray-800">Program Utama:</p>
                  <ul className="space-y-1 text-xs mb-3 max-h-48 sm:max-h-60 overflow-y-auto">
                    {service.features.map((item, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <i className="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0 text-xs"></i>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button in Mobile Expanded State */}
                <a
                  href={service.button.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${service.button.styleMobile} touch-manipulation`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {service.button.text}
                </a>
              </div>

              {/* Desktop Hover Content */}
              <div className="absolute inset-0 bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 z-20 flex-col justify-between hidden md:flex">
                <div>
                  <p className="text-sm font-semibold mb-2">Program Utama:</p>
                  <ul className="space-y-2 text-sm mb-4">
                    {service.features.map((item, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button in Desktop Hover State */}
                <a
                  href={service.button.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center w-full px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${service.button.style}`}
                >
                  {service.button.text}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="text-3xl sm:text-4xl flex-shrink-0">🚀</div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Butuh bantuan memilih layanan yang tepat?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-0">
                  Tim ahli kami siap membantu Anda menemukan solusi terbaik untuk kebutuhan anak Anda
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 touch-manipulation text-sm sm:text-base"
              >
                <i className="fas fa-robot mr-2"></i>
                Konsultasi Gratis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for line-clamp */}
      <style jsx="true">{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .line-clamp-3 {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;
