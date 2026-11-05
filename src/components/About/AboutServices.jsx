import React, { useState, useEffect } from 'react';

// ==================== SUB-COMPONENTS ====================

// Section Number Component with enhanced animation
const SectionNumber = ({ number, bgColor = "bg-gradient-to-r from-blue-500 to-blue-600" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span 
      className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ${bgColor} text-white rounded-full font-bold text-xs sm:text-sm mr-2 sm:mr-3 shadow-lg transform transition-all duration-500 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
      } hover:scale-110 hover:shadow-xl flex-shrink-0`}
    >
      {number}
    </span>
  );
};

// Enhanced Visual Separator Component
const VisualSeparator = ({ icon, className = "", color = "text-blue-500" }) => (
  <div className={`text-center my-8 sm:my-12 lg:my-16 relative ${className}`}>
    <div className="flex items-center justify-center">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-400 animate-pulse"></div>
      <div className="mx-4 sm:mx-6 p-3 sm:p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
        <i className={`fas ${icon} text-xl sm:text-2xl ${color} group-hover:scale-125 transition-transform duration-300`}></i>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-400 via-gray-300 to-transparent animate-pulse"></div>
    </div>
  </div>
);

// Enhanced Highlight Box Component
const HighlightBox = ({ children, className = "", borderColor = "from-blue-500 to-purple-600" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 my-6 sm:my-8 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 ${className} ${
        isHovered ? 'transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-0 left-0 w-1 sm:w-2 h-full bg-gradient-to-b ${borderColor} rounded-l-xl sm:rounded-l-2xl`}></div>
      <div className={`absolute top-0 right-0 w-full h-0.5 sm:h-1 bg-gradient-to-r ${borderColor} opacity-30 rounded-t-xl sm:rounded-t-2xl`}></div>
      {children}
    </div>
  );
};

// Enhanced Vision Mission Card Component
const VisionMissionCard = ({ type, title, content, icon, bgColor = "bg-gradient-to-br from-blue-500 to-blue-600" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 group transform flex flex-col justify-between h-full ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${isHovered ? 'shadow-xl sm:shadow-2xl -translate-y-1 sm:-translate-y-3 scale-105' : 'shadow-md sm:shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${bgColor} text-white p-4 sm:p-6 lg:p-8 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <div className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
            <i className={`fas ${icon} drop-shadow-lg`}></i>
          </div>
          <div className="text-xs sm:text-sm font-semibold mb-2 opacity-90 uppercase tracking-wider">{type}</div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">{title}</h3>
        </div>
        <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-8 h-8 sm:w-16 sm:h-16 bg-white opacity-10 rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{content}</p>
      </div>
    </div>
  );
};

// Enhanced Stakeholder Card Component
const StakeholderCard = ({ icon, title, description, iconBg = "bg-gradient-to-br from-blue-500 to-blue-600" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), Math.random() * 600 + 200);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={`text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 transition-all duration-500 cursor-pointer group transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${isHovered ? 'shadow-xl sm:shadow-2xl -translate-y-1 sm:-translate-y-3 scale-105' : 'shadow-md sm:shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-2xl lg:text-3xl mx-auto mb-4 sm:mb-6 transition-all duration-500 shadow-lg ${
          isHovered ? 'scale-125 rotate-12 shadow-2xl' : ''
        }`}>
          <i className={`fas ${icon}`}></i>
        </div>
        {isHovered && (
          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <i className="fas fa-star text-white text-xs"></i>
          </div>
        )}
      </div>
      <h3 className={`text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 transition-colors duration-300 leading-tight ${
        isHovered ? 'text-blue-600' : ''
      }`}>{title}</h3>
      <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">{description}</p>
    </div>
  );
};

// Enhanced Service Card Component
const ServiceCard = ({ icon, title, description, features, iconBg = "bg-gradient-to-br from-blue-500 to-blue-600", index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 200 + 300);
    return () => clearTimeout(timer);
  }, [index]);
  
  return (
    <div 
      className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 group transform h-full flex flex-col ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } ${isHovered ? 'shadow-xl sm:shadow-2xl -translate-y-1 sm:-translate-y-3 scale-105' : 'shadow-md sm:shadow-lg'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        {/* Service Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4 transition-all duration-500 shadow-lg ${
              isHovered ? 'scale-125 rotate-12 shadow-2xl' : ''
            }`}>
              <i className={`fas ${icon}`}></i>
            </div>
            {isHovered && (
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-sparkles text-white text-xs sm:text-sm"></i>
              </div>
            )}
          </div>
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 leading-tight ${
            isHovered ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {title}
          </h3>
        </div>
        
        {/* Service Description */}
        <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base text-center flex-shrink-0">{description}</p>
        
        {/* Service Features */}
        <div className={`overflow-hidden transition-all duration-500 flex-1 ${isExpanded ? 'max-h-96' : 'max-h-24 sm:max-h-32'}`}>
          <div className="space-y-2 sm:space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className={`flex items-start gap-2 sm:gap-3 text-gray-700 transition-all duration-300 ${
                isExpanded || idx < 3 ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4'
              }`}>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-1.5 sm:mt-2"></div>
                <span className="text-xs sm:text-sm lg:text-base leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Expand/Collapse Button */}
        {features.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
          >
            {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const AboutServices = ({
  showSeparator1 = true,
  showSeparator2 = true,
  showSection5 = true,
  showSection6 = true,
  showSection7 = true,
  customVisionMission = null,
  customStakeholders = null,
  customServices = null,
  containerClassName = "",
  sectionClassName = ""
}) => {

  // Default Vision Mission Data
  const defaultVisionMission = [
    {
      type: "VISI",
      title: "Visi SISMONEV PAUDHI",
      content: "Mendukung layanan PAUDHI yang lebih baik melalui sistem informasi yang terpadu, mudah diakses, dan berbasis data untuk mewujudkan generasi emas Indonesia.",
      icon: "fa-eye",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      type: "MISI",
      title: "Misi SISMONEV PAUDHI", 
      content: "Menyediakan sistem informasi terpadu yang memudahkan pemantauan, evaluasi, dan pengambilan kebijakan layanan PAUDHI. Dengan data yang akurat dan akses yang mudah, kami mendorong kolaborasi lintas sektor demi layanan PAUDHI yang berkualitas dan merata.",
      icon: "fa-rocket",
      bgColor: "bg-gradient-to-br from-green-500 to-green-700"
    }
  ];

  // Default Stakeholders Data
  const defaultStakeholders = [
    {
      icon: "fa-building",
      title: "Pemerintah",
      description: "Kementerian, dinas, dan pemerintah daerah sebagai penanggung jawab kebijakan dan implementasi program PAUDHI dengan komitmen tinggi.",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      icon: "fa-graduation-cap",
      title: "Lembaga Pendidikan",
      description: "PAUD formal dan non-formal, KB, TPA, dan SPS yang menyediakan layanan pendidikan anak usia dini berkualitas dan inovatif.",
      iconBg: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      icon: "fa-hospital",
      title: "Fasilitas Kesehatan",
      description: "Puskesmas, posyandu, dan fasilitas kesehatan lainnya yang melayani kesehatan anak dan ibu dengan standar pelayanan terbaik.",
      iconBg: "bg-gradient-to-br from-red-500 to-red-700"
    },
    {
      icon: "fa-users",
      title: "Keluarga & Masyarakat",
      description: "Orang tua, keluarga, dan komunitas masyarakat sebagai lingkungan terdekat anak dalam membentuk karakter dan kepribadian.",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-700"
    },
    {
      icon: "fa-handshake",
      title: "Mitra & LSM",
      description: "Organisasi masyarakat sipil, LSM, dan mitra pembangunan yang mendukung program PAUDHI dengan dedikasi tinggi.",
      iconBg: "bg-gradient-to-br from-yellow-500 to-orange-600"
    },
    {
      icon: "fa-briefcase",
      title: "Sektor Swasta",
      description: "Perusahaan dan sektor swasta yang berkontribusi dalam CSR dan dukungan program PAUDHI untuk kemajuan bangsa.",
      iconBg: "bg-gradient-to-br from-gray-500 to-gray-700"
    }
  ];

  // Updated Services Data - 3 Pilar
  const defaultServices = [
    {
      icon: "fa-heartbeat",
      title: "Kesehatan & Gizi",
      description: "Memastikan anak usia dini tumbuh sehat dan bergizi optimal melalui layanan kesehatan komprehensif dan program gizi terintegrasi sejak dalam kandungan hingga usia 6 tahun.",
      features: [
        "Imunisasi lengkap dan berkala sesuai jadwal nasional",
        "Pemantauan tumbuh kembang dan status gizi berkala",
        "Deteksi dini gangguan kesehatan dan stunting",
        "Pemberian makanan tambahan (PMT) bergizi seimbang",
        "Layanan kesehatan ibu & anak terintegrasi",
        "Program ASI eksklusif dan konseling gizi keluarga",
        "Rujukan ke fasilitas kesehatan spesialis",
        "Edukasi perilaku hidup bersih & sehat"
      ],
      iconBg: "bg-gradient-to-br from-red-500 to-orange-600"
    },
    {
      icon: "fa-graduation-cap",
      title: "Pendidikan",
      description: "Memberikan stimulasi dan rangsangan pendidikan yang sesuai dengan tahap perkembangan anak untuk membentuk kecerdasan, kreativitas, karakter, dan kesiapan bersekolah yang kuat.",
      features: [
       "Belajar bermain & eksplorasi di PAUD Pra SD",
      "Kurikulum holistik, integratif & adaptif",
      "Asesmen tumbuh kembang & kemampuan anak",
      "Pelatihan guru PAUD berkelanjutan & berkualitas",
      "Literasi & numerasi untuk kesiapan SD",
      "Media belajar interaktif & edukatif",
      "Program kesiapan masuk sekolah dasar",
      "Layanan inklusif untuk anak berkebutuhan khusus (ABK)",
      "Angka Partisipasi Kasar (APK)"
      ],
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    {
      icon: "fa-shield-heart",
      title: "Perlindungan, Pengasuhan & Kesejahteraan Anak",
      description: "Menjamin setiap anak mendapatkan kasih sayang, rasa aman, perlindungan dari segala bentuk kekerasan, serta dukungan kesejahteraan dalam lingkungan yang kondusif dan ramah anak.",
      features: [
        "Pelatihan pola asuh positif dan responsif",
        "Sistem pelaporan dan penanganan kasus anak",
        "Pendampingan keluarga rentan dan bermasalah",
        "Program bantuan sosial untuk anak dan keluarga",
        "Kampanye perlindungan anak dari kekerasan",
        "Lingkungan ramah anak",
        "Layanan rehabilitasi dan reintegrasi sosial"
      ],
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600"
    }
  ];

  const visionMissionData = customVisionMission || defaultVisionMission;
  const stakeholdersData = customStakeholders || defaultStakeholders;
  const servicesData = customServices || defaultServices;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 ${containerClassName}`}>
      {/* Separator 1 */}
      {showSeparator1 && (
        <VisualSeparator icon="fa-bullseye" color="text-blue-600" />
      )}

      {/* Section 5: Vision Mission - 2x1 Layout */}
      {showSection5 && (
        <section className={`py-8 sm:py-12 lg:py-16 xl:py-20 ${sectionClassName}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <SectionNumber number="3" bgColor="bg-gradient-to-r from-blue-500 to-purple-600" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Visi & Misi
                </h2>
              </div>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
                Komitmen kami dalam mewujudkan layanan PAUDHI yang berkualitas untuk seluruh anak Indonesia dengan pendekatan yang terukur dan berkelanjutan.
              </p>
            </div>

            {/* 2x1 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto">
              {visionMissionData.map((item, index) => (
                <VisionMissionCard
                  key={index}
                  type={item.type}
                  title={item.title}
                  content={item.content}
                  icon={item.icon}
                  bgColor={item.bgColor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Separator 2 */}
      {showSeparator2 && (
        <VisualSeparator icon="fa-users" color="text-green-600" />
      )}

      {/* Section 6: Stakeholders - 2x3 Layout */}
      {showSection6 && (
        <section className={`py-8 sm:py-12 lg:py-16 xl:py-20 bg-white ${sectionClassName}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <SectionNumber number="4" bgColor="bg-gradient-to-r from-green-500 to-blue-600" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Ekosistem & Kolaborasi
                </h2>
              </div>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
                PAUDHI melibatkan berbagai pihak dalam satu ekosistem yang terintegrasi untuk memberikan layanan terbaik bagi anak Indonesia dengan pendekatan multi-stakeholder yang sinergis.
              </p>
            </div>

            {/* 2x3 Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {stakeholdersData.map((stakeholder, index) => (
                <StakeholderCard 
                  key={index}
                  icon={stakeholder.icon}
                  title={stakeholder.title}
                  description={stakeholder.description}
                  iconBg={stakeholder.iconBg}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Service Scope - 3x1 Layout */}
      {showSection7 && (
        <section className={`py-8 sm:py-12 lg:py-16 xl:py-20 ${sectionClassName}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <SectionNumber number="5" bgColor="bg-gradient-to-r from-purple-500 to-pink-600" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Tiga Pilar Layanan PAUDHI
                </h2>
              </div>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
                Layanan komprehensif yang mencakup seluruh kebutuhan tumbuh kembang anak usia dini dengan pendekatan holistik dan terintegrasi melalui tiga pilar utama untuk masa depan yang cerah.
              </p>
            </div>

            <HighlightBox className="text-center mb-8 sm:mb-12">
              <div className="mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🌟</span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold mb-3 sm:mb-4 leading-tight">
                Pendekatan Holistik untuk Tumbuh Kembang Optimal
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                Setiap anak berhak mendapatkan layanan yang lengkap dan berkualitas dalam tiga pilar penting kehidupan untuk menjamin masa depan yang gemilang dan berkelanjutan.
              </p>
            </HighlightBox>

            {/* 3x1 Grid Layout - Horizontal scroll on mobile */}
            <div className="max-w-7xl mx-auto">
              {/* Mobile: Horizontal scroll */}
              <div className="lg:hidden">
                <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {servicesData.map((service, index) => (
                    <div key={index} className="flex-shrink-0 w-72 sm:w-80">
                      <ServiceCard
                        icon={service.icon}
                        title={service.title}
                        description={service.description}
                        features={service.features}
                        iconBg={service.iconBg}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: 3x1 Grid */}
              <div className="hidden lg:grid grid-cols-3 gap-8">
                {servicesData.map((service, index) => (
                  <ServiceCard
                    key={index}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    features={service.features}
                    iconBg={service.iconBg}
                    index={index}
                  />
                ))}
              </div>

              {/* Mobile scroll hint */}
              <div className="text-center mt-4 lg:hidden">
                <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-xs text-blue-600">Geser untuk melihat pilar lainnya</span>
                  <i className="fas fa-arrow-right text-blue-500 text-xs animate-pulse"></i>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Custom styles */}
      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile touch optimization */
        @media (max-width: 1024px) {
          .touch-manipulation:active {
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutServices;