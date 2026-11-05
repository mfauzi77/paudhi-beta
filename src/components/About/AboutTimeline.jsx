import React, { useState, useEffect } from 'react';

// ==================== SUB-COMPONENTS ====================

const SectionNumber = ({ number, bgColor = "bg-blue-600" }) => (
  <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${bgColor} text-white rounded-full font-bold text-xs sm:text-sm mr-2 sm:mr-4 shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl flex-shrink-0`}>
    {number}
  </span>
);

const VisualSeparator = ({ icon, className = "" }) => (
  <div className={`text-center my-8 sm:my-12 lg:my-16 relative ${className}`}>
    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-60"></div>
    <div className="bg-white px-4 sm:px-6 text-blue-600 text-lg sm:text-2xl relative shadow-lg rounded-full w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center mx-auto">
      <i className={`fas ${icon} animate-pulse`}></i>
    </div>
  </div>
);

const FloatingParticles = () => {
  const particles = Array.from({ length: 6 }, (_, i) => i); // Reduced for mobile
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle}
          className={`absolute w-1 h-1 sm:w-2 sm:h-2 bg-blue-400 rounded-full opacity-20 animate-float hidden sm:block`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );
};

const TimelineItem = ({ year, title, description, isLast = false, dotColor = "border-blue-600", index, isVisible, details }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const colorMap = {
    "border-amber-600": { bg: "bg-amber-600", text: "text-amber-700", glow: "shadow-amber-500/50" },
    "border-blue-600": { bg: "bg-blue-600", text: "text-blue-600", glow: "shadow-blue-500/50" },
    "border-emerald-500": { bg: "bg-emerald-500", text: "text-emerald-600", glow: "shadow-emerald-500/50" },
    "border-yellow-500": { bg: "bg-yellow-500", text: "text-yellow-600", glow: "shadow-yellow-500/50" },
    "border-red-500": { bg: "bg-red-500", text: "text-red-600", glow: "shadow-red-500/50" }
  };

  const colors = colorMap[dotColor] || colorMap["border-amber-600"];

  return (
    <div className={`relative flex items-start mb-6 sm:mb-8 lg:mb-12 group transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`} style={{ transitionDelay: `${index * 200}ms` }}>
      
      {/* Timeline Line - Mobile optimized */}
      {!isLast && (
        <div className="absolute left-3 sm:left-4 lg:left-6 top-12 sm:top-14 lg:top-16 w-0.5 h-full bg-gradient-to-b from-blue-300 via-purple-300 to-emerald-300 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-emerald-500 transition-all duration-500"></div>
      )}
      
      {/* Enhanced Timeline Dot */}
      <div className="relative z-10 flex flex-col items-center flex-shrink-0">
        <div 
          className={`relative w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white border-2 sm:border-3 lg:border-4 ${dotColor} rounded-full transition-all duration-500 mt-2 sm:mt-3 cursor-pointer ${
            isHovered ? `transform scale-125 sm:scale-150 ${colors.bg} shadow-lg ${colors.glow}` : 'hover:scale-110 sm:hover:scale-125'
          } ${showDetails ? 'animate-pulse' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setShowDetails(!showDetails)}
        >
          {isHovered && (
            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
          )}
        </div>
        
        {/* Year Badge - Mobile responsive */}
        <div className={`mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 ${colors.bg} text-white text-xs sm:text-xs lg:text-sm font-bold rounded-full shadow-md transform transition-all duration-300 ${
          isHovered ? 'scale-105 sm:scale-110 shadow-lg' : ''
        } text-center`}>
          <span className="block sm:hidden">{year.split(' ')[0]}</span>
          <span className="hidden sm:block">{year}</span>
        </div>
      </div>

      {/* Enhanced Content Card - Mobile optimized */}
      <div className={`ml-4 sm:ml-6 lg:ml-8 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/50 shadow-lg sm:shadow-xl flex-1 transition-all duration-500 group-hover:shadow-xl sm:group-hover:shadow-2xl hover:-translate-y-1 sm:group-hover:-translate-y-2 group-hover:bg-white/90 ${
        showDetails ? 'ring-1 sm:ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}>
        
        {/* Title Section */}
        <div className={`${colors.text} font-bold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 flex items-start sm:items-center gap-2`}>
          <span className="text-sm sm:text-base flex-shrink-0">
            {year.includes('2000') ? '🟤' : year.includes('2005') ? '🟤' : year.includes('2011') ? '🟤' : year.includes('2013') ? '🔵' : year.includes('2014') ? '🟢' : year.includes('2020') ? '🟡' : '🔴'}
          </span>
          <span className="flex-1 leading-tight">{title}</span>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1 rounded-full transition-colors duration-200 flex-shrink-0 touch-manipulation"
          >
            {showDetails ? '−' : '+'}
          </button>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors duration-300 text-xs sm:text-sm lg:text-base">
          {description}
        </p>

        {/* Expandable Details - Mobile optimized */}
        <div className={`overflow-hidden transition-all duration-500 ${
          showDetails ? 'max-h-32 sm:max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Timeline</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">Detail</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {details || "Tahap penting dalam pengembangan PAUDHI yang memberikan dampak signifikan bagi perkembangan anak usia dini di Indonesia."}
            </p>
          </div>
        </div>

        {/* Interactive Elements - Mobile friendly */}
        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex space-x-1 sm:space-x-2">
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors duration-200 touch-manipulation">
              <span className="text-blue-600 text-xs sm:text-sm">ℹ️</span>
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors duration-200 touch-manipulation">
              <span className="text-emerald-600 text-xs sm:text-sm">📊</span>
            </button>
          </div>
          <div className="text-xs text-gray-400">
            <span className="hidden sm:inline">Step </span>{index + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const TimelinePaudhi = () => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [currentHighlight, setCurrentHighlight] = useState(0);

  const timelineData = [
    {
      year: "2000-an Awal",
      title: "Kesadaran Investasi Usia Dini",
      description: "Munculnya kesadaran pentingnya investasi pada usia dini sebagai fondasi kualitas SDM. Indonesia mulai merujuk pada pendekatan Holistik-Integratif dari rekomendasi global (UNICEF, UNESCO).",
      dotColor: "border-amber-600",
      details: "Fase ini menandai perubahan paradigma dalam memandang pentingnya masa emas anak usia dini sebagai investasi jangka panjang bagi kualitas SDM Indonesia."
    },
    {
      year: "2005–2010",
      title: "Pengembangan Model Integrasi",
      description: "Kementerian terkait mulai mengembangkan model integrasi layanan PAUD dengan kesehatan, gizi, dan perlindungan anak. Uji coba beberapa model layanan integratif dilakukan secara terbatas di daerah.",
      dotColor: "border-amber-600",
      details: "Periode eksperimen dan pembelajaran untuk menemukan formula terbaik dalam mengintegrasikan berbagai layanan untuk anak usia dini."
    },
    {
      year: "2011",
      title: "Konsep PAUDHI Terstruktur",
      description: "Pemerintah merumuskan konsep PAUDHI secara lebih terstruktur. Terbentuknya Tim Nasional PAUDHI lintas sektor untuk menyusun regulasi dan strategi nasional.",
      dotColor: "border-amber-600",
      details: "Tahun penting dimana konsep PAUDHI mulai dikembangkan secara sistematis dengan melibatkan berbagai sektor terkait."
    },
    {
      year: "28 Agustus 2013",
      title: "Landasan Hukum Nasional",
      description: "Terbit Peraturan Presiden Nomor 60 Tahun 2013 tentang Pengembangan Anak Usia Dini Holistik-Integratif, sebagai landasan hukum nasional. Mewajibkan keterlibatan lintas sektor: pendidikan, kesehatan, gizi, perlindungan, dan kesejahteraan anak.",
      dotColor: "border-blue-600",
      details: "Milestone penting dengan terbitnya regulasi resmi yang memberikan payung hukum bagi implementasi PAUDHI di seluruh Indonesia."
    },
    {
      year: "2014–2019",
      title: "Sosialisasi dan Implementasi",
      description: "Penyusunan dan sosialisasi pedoman teknis PAUDHI ke daerah-daerah. Pembentukan Gugus Tugas PAUDHI nasional dan daerah (provinsi/kabupaten/kota). Integrasi layanan PAUDHI ke dalam RPJMN dan Renstra K/L.",
      dotColor: "border-emerald-500",
      details: "Fase implementasi aktif dengan pembentukan struktur organisasi dan sosialisasi ke seluruh daerah di Indonesia."
    },
    {
      year: "2020–2024",
      title: "Program Prioritas Nasional",
      description: "PAUDHI menjadi bagian dari RPJMN 2020–2024 dan program prioritas pembangunan SDM. Integrasi PAUD, Posyandu, layanan gizi, dan perlindungan menjadi layanan satu pintu di beberapa daerah.",
      dotColor: "border-yellow-500",
      details: "PAUDHI menjadi program strategis nasional dengan integrasi layanan yang semakin komprehensif dan terkoordinasi."
    },
    {
      year: "2025 dan seterusnya",
      title: "Era Digital dan Keberlanjutan",
      description: "Digitalisasi layanan PAUDHI melalui dashboard monev dan sistem informasi terintegrasi. Penguatan kolaborasi lintas sektor dan partisipasi masyarakat. Fokus pada early warning system, pemetaan sasaran, dan keberlanjutan program di tingkat akar rumput.",
      dotColor: "border-red-500",
      details: "Visi masa depan dengan pemanfaatan teknologi digital untuk monitoring, evaluasi, dan peningkatan kualitas layanan PAUDHI."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleItems(prev => new Set([...prev, index]));
            setCurrentHighlight(index);
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = document.querySelectorAll('[data-timeline-item]');
    items.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-rose-100 overflow-hidden">
      <FloatingParticles />
      
      {/* Animated Background Elements - Mobile optimized */}
      <div className="absolute top-16 sm:top-20 right-4 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-200 rounded-full opacity-20 animate-bounce hidden sm:block" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-emerald-200 rounded-full opacity-20 animate-bounce hidden sm:block" style={{ animationDelay: '2s' }}></div>
      
      <section className="py-8 sm:py-12 lg:py-16 xl:py-24 max-w-screen-lg mx-auto px-4 sm:px-6 relative z-10">
        <div className="container mx-auto">
          {/* Enhanced Header - Mobile responsive */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-0">
              <SectionNumber number="2" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent leading-tight text-center sm:text-left">
                Perjalanan PAUDHI
              </h2>
            </div>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Tahapan perjalanan dan perkembangan program PAUD Holistik Integratif dari tahun ke tahun menuju masa depan yang lebih baik.
            </p>
            
            {/* Interactive Stats - Mobile grid */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 px-4 sm:px-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">25+</div>
                <div className="text-xs sm:text-sm text-gray-600">Tahun</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">7</div>
                <div className="text-xs sm:text-sm text-gray-600">Fase</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">2013</div>
                <div className="text-xs sm:text-sm text-gray-600">Hukum</div>
              </div>
            </div>
          </div>

          {/* Enhanced Timeline - Mobile optimized */}
          <div className="max-w-4xl mx-auto">
            {timelineData.map((item, index) => (
              <div
                key={index}
                data-index={index}
                data-timeline-item
              >
                <TimelineItem
                  year={item.year}
                  title={item.title}
                  description={item.description}
                  isLast={index === timelineData.length - 1}
                  dotColor={item.dotColor}
                  index={index}
                  isVisible={visibleItems.has(index)}
                  details={item.details}
                />
              </div>
            ))}
          </div>

          {/* Call to Action - Mobile responsive */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base touch-manipulation">
              <span className="hidden sm:inline">Pelajari Lebih Lanjut</span>
              <span className="sm:hidden">Pelajari Lebih Lanjut</span>
            </button>
          </div>
        </div>
      </section>

      {/* Custom styles - Mobile optimized */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(45deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
          75% { transform: translateY(-5px) rotate(135deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Mobile touch optimization */
        @media (max-width: 640px) {
          .touch-manipulation:active {
            transform: scale(0.95);
          }
        }
        
        /* Ensure readability on small screens */
        @media (max-width: 480px) {
          .leading-tight {
            line-height: 1.2;
          }
        }
      `}</style>
    </div>
  );
};

export default TimelinePaudhi;