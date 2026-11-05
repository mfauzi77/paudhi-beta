import React, { useState } from 'react';

// ==================== SUB-COMPONENTS ====================

const SectionNumber = ({ number, bgColor = "bg-blue-600" }) => (
  <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ${bgColor} text-white rounded-full font-bold text-xs sm:text-sm mr-2 sm:mr-4 flex-shrink-0`}>
    {number}
  </span>
);

const HighlightBox = ({ children, className = "", borderColor = "from-blue-600 to-emerald-600" }) => (
  <div className={`bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 my-6 sm:my-8 relative overflow-hidden ${className}`}>
    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${borderColor}`}></div>
    {children}
  </div>
);

const InfoCallout = ({ icon, title, children, iconBg = "bg-blue-600" }) => (
  <div className="bg-blue-50 sm:bg-blue-100 border border-blue-200 sm:border-blue-300 rounded-lg sm:rounded-xl p-4 sm:p-6 my-4 sm:my-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 animate-fade-in shadow-md sm:shadow-lg">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center text-white text-lg sm:text-xl flex-shrink-0 shadow-md`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1 w-full sm:w-auto">
      <h4 className="text-blue-700 sm:text-blue-800 mb-2 text-lg sm:text-xl font-bold tracking-wide">{title}</h4>
      <div className="text-blue-800 sm:text-blue-900 text-sm sm:text-base leading-relaxed font-medium">{children}</div>
    </div>
  </div>
);

const StatItem = ({ number, label, description, numberColor = "text-blue-600" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 transition-all duration-300 cursor-pointer ${
        isHovered ? 'transform -translate-y-1 sm:-translate-y-2 scale-105 shadow-lg sm:shadow-xl' : 'shadow-sm sm:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${numberColor} mb-2`}>{number}</div>
      <div className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">{label}</div>
      <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, iconBg = "bg-emerald-600" }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 group">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <i className={`fas ${icon} text-sm sm:text-base`}></i>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">{title}</h3>
    </div>
    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{description}</p>
  </div>
);

// ==================== MAIN COMPONENT ====================

const AboutOverview = ({
  showSection1 = true,
  showSection2 = true,
  customStats = null,
  customFeatures = null,
  containerClassName = "",
  sectionClassName = ""
}) => {
  const defaultStats = [
    {
      number: "90%",
      label: "Efektivitas Intervensi Dini",
      description: "Lebih efektif dibanding usia lanjut",
      numberColor: "text-blue-600"
    },
    {
      number: "1000",
      label: "Hari Pertama Kehidupan",
      description: "Periode kritis pembentukan otak",
      numberColor: "text-emerald-600"
    },
    {
      number: "6",
      label: "Tahun Periode Emas",
      description: "Masa golden age anak",
      numberColor: "text-teal-500"
    }
  ];

  const defaultFeatures = [
    {
      icon: "fa-link",
      title: "Layanan Terpadu",
      description: "Menyediakan akses layanan terpadu untuk anak dan keluarga dalam satu sistem yang terkoordinasi dan mudah diakses oleh seluruh masyarakat.",
      iconBg: "bg-blue-600"
    },
    {
      icon: "fa-shield-alt",
      title: "Pencegahan Masalah",
      description: "Mencegah stunting, kekerasan anak, dan keterlambatan tumbuh kembang melalui intervensi dini yang tepat sasaran dan berbasis bukti.",
      iconBg: "bg-emerald-600"
    },
    {
      icon: "fa-handshake",
      title: "Koordinasi Lintas Sektor",
      description: "Membangun koordinasi antarsektor untuk layanan yang merata dan berkualitas di seluruh wilayah Indonesia.",
      iconBg: "bg-blue-500"
    }
  ];

  const statsData = customStats || defaultStats;
  const featuresData = customFeatures || defaultFeatures;

  return (
    <div className={`relative bg-gradient-to-br from-yellow-50 via-blue-50 to-rose-100 ${containerClassName}`}>
      {showSection1 && (
        <section className={`py-8 sm:py-12 lg:py-16 xl:py-20 ${sectionClassName}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 lg:p-12 shadow-lg sm:shadow-2xl border-l-4 sm:border-l-8 border-blue-600 max-w-6xl mx-auto animate-fade-in-up">
              <InfoCallout 
                icon="fa-gavel" 
                title="Landasan Hukum Perpres 60 tahun 2013 Tentang PAUDHI"
                iconBg="bg-blue-600"
              >
                <p className="text-sm sm:text-base">
                  <strong>Bahwa untuk menjamin pemenuhan hak tumbuh kembang anak usia dini, diperlukan upaya peningkatan kesehatan, gizi, perawatan, pengasuhan, perlindungan, kesejahteraan, dan rangsangan pendidikan yang dilakukan secara simultan, sistematis, menyeluruh, terintegrasi, dan berkesinambungan.</strong>
                </p>
              </InfoCallout>
            </div>
          </div>
        </section>
      )}

      {showSection2 && (
        <section className={`py-8 sm:py-12 lg:py-16 xl:py-20 bg-white ${sectionClassName}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
                <SectionNumber number="1" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Mengapa PAUDHI Penting?
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto px-2">
                Masa usia dini adalah fondasi utama kehidupan. Intervensi yang tepat di periode ini akan menentukan kualitas kesehatan, kecerdasan, dan karakter anak di masa depan.
              </p>
            </div>

            {/* Highlight Box */}
            <HighlightBox className="text-center mb-8 sm:mb-12">
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🧠</span>
              </div>
              <h3 className="text-blue-600 text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 leading-tight">
                Golden Age: Periode Emas Perkembangan Otak
              </h3>
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                90% perkembangan otak terjadi pada 6 tahun pertama kehidupan. Inilah mengapa investasi di masa ini memberikan dampak yang luar biasa.
              </p>
            </HighlightBox>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
              {statsData.map((stat, index) => (
                <StatItem 
                  key={index}
                  number={stat.number} 
                  label={stat.label} 
                  description={stat.description}
                  numberColor={stat.numberColor}
                />
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuresData.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  iconBg={feature.iconBg}
                />
              ))}
            </div>

            {/* Mobile CTA Section */}
            <div className="mt-8 sm:mt-12 text-center sm:hidden">
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Pelajari Lebih Lanjut</h4>
                <p className="text-xs text-gray-600">Scroll ke bawah untuk informasi detail tentang implementasi PAUDHI</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Background Decorations - Responsive sizing */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 sm:-top-24 lg:-top-32 -right-16 sm:-right-24 lg:-right-32 w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 sm:-bottom-24 lg:-bottom-32 -left-16 sm:-left-24 lg:-left-32 w-40 h-40 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-16 sm:top-20 left-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-amber-300 opacity-40 rounded-full animate-ping"></div>
        <div className="absolute bottom-16 sm:bottom-20 right-1/4 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-blue-300 opacity-30 rounded-full animate-ping delay-1000"></div>
      </div>

      {/* Custom styles for animations */}
      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        /* Mobile touch optimization */
        @media (max-width: 640px) {
          .group:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutOverview;

export { 
  AboutOverview, 
  SectionNumber,
  HighlightBox,
  InfoCallout,
  StatItem,
  FeatureCard
};