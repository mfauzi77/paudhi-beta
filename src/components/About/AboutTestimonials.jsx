import React, { useState } from 'react';

// ==================== SUB-COMPONENTS ====================

// Section Number Component
const SectionNumber = ({ number, bgColor = "bg-blue-500" }) => (
  <span className={`inline-flex items-center justify-center w-8 h-8 ${bgColor} text-white rounded-full font-bold text-sm mr-4`}>
    {number}
  </span>
);

// Visual Separator Component
const VisualSeparator = ({ icon, className = "" }) => (
  <div className={`text-center my-16 relative ${className}`}>
    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    <div className="bg-white px-6 text-blue-500 text-2xl relative">
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

// Info Callout Component
const InfoCallout = ({ icon, title, children, iconBg = "bg-blue-500" }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-6 flex items-start gap-4 max-w-2xl mx-auto">
    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-1">
      <h4 className="text-gray-900 mb-2 text-lg font-semibold">{title}</h4>
      <div className="text-blue-900 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
);

// Benefit Card Component
const BenefitCard = ({ icon, title, description, iconBg = "bg-green-500" }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`bg-white rounded-2xl p-6 md:p-8 border border-gray-100 transition-all duration-300 cursor-pointer ${
        isHovered ? 'shadow-xl transform -translate-y-2 scale-105' : 'shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-12 md:w-16 h-12 md:h-16 ${iconBg} rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl mb-6 transition-transform duration-300 ${
        isHovered ? 'scale-110 rotate-6' : ''
      }`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ photo, name, role, rating, testimonial, avatarBg = "bg-blue-500" }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`bg-white rounded-2xl p-6 md:p-8 border border-gray-100 transition-all duration-300 relative group ${
        isHovered ? 'transform -translate-y-2 scale-105 shadow-xl' : 'shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quote decoration */}
      <div className="absolute top-4 right-4 text-blue-100 text-4xl opacity-50 group-hover:opacity-70 transition-opacity duration-300">
        <i className="fas fa-quote-right"></i>
      </div>
      
      <div className="flex items-start gap-4 md:gap-6 mb-6">
        {/* Profile Image */}
        {!imageError ? (
          <img 
            src={photo} 
            alt={`Foto ${name}`}
            className="w-12 md:w-16 h-12 md:h-16 rounded-full object-cover border-3 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-12 md:w-16 h-12 md:h-16 ${avatarBg} rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold border-3 border-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
            {name.charAt(0)}
          </div>
        )}
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex gap-1 mb-2">
            {[...Array(rating)].map((_, i) => (
              <i key={i} className="fas fa-star text-yellow-500 text-sm group-hover:text-yellow-400 transition-colors duration-300"></i>
            ))}
          </div>
          <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
            {name}
          </h4>
          <p className="text-xs md:text-sm text-gray-600">{role}</p>
        </div>
      </div>
      
      {/* Testimonial Text */}
      <p className="text-gray-700 leading-relaxed italic text-sm md:text-base">
        "{testimonial}"
      </p>
      
      {/* Verified badge */}
      <div className="mt-4 flex items-center gap-2 text-green-600 text-xs">
        <i className="fas fa-check-circle"></i>
        <span>Testimoni Terverifikasi</span>
      </div>
    </div>
  );
};

// Contact Method Component
const ContactMethod = ({ icon, label, value, href, iconBg = "bg-white bg-opacity-20" }) => (
  <div className="text-center group cursor-pointer">
    <a href={href} className="block">
      <div className={`w-12 md:w-16 h-12 md:h-16 ${iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl md:text-2xl group-hover:scale-110 transition-transform duration-300`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="font-semibold mb-2 group-hover:text-blue-200 transition-colors duration-300">
        {label}
      </div>
      <div className="opacity-90 group-hover:opacity-100 transition-opacity duration-300">
        {value}
      </div>
    </a>
  </div>
);

// ==================== MAIN COMPONENT ====================

const AboutTestimonials = ({
  showSeparator = true,
  showSection8 = true,
  showSection9 = true,
  showSection10 = true,
  customBenefits = null,
  customTestimonials = null,
  customContactInfo = null,
  containerClassName = "",
  sectionClassName = "",
  onFindService = () => console.log('Find service clicked')
}) => {

  // Default Benefits Data
  const defaultBenefits = [
    {
      icon: "fa-chart-line",
      title: "Monitoring Real-time",
      description: "Pantau perkembangan anak secara real-time dengan data yang akurat dan up-to-date dari berbagai layanan.",
      iconBg: "bg-blue-500"
    },
    {
      icon: "fa-mobile-alt", 
      title: "Akses Mudah",
      description: "Akses informasi dan layanan PAUDHI kapan saja, di mana saja melalui platform digital yang user-friendly.",
      iconBg: "bg-green-500"
    },
    {
      icon: "fa-users-cog",
      title: "Koordinasi Terintegrasi",
      description: "Koordinasi yang lebih baik antar lembaga dan stakeholder untuk layanan yang komprehensif.",
      iconBg: "bg-purple-500"
    },
    {
      icon: "fa-brain",
      title: "Keputusan Berbasis Data",
      description: "Pengambilan keputusan yang lebih tepat berdasarkan data dan evidence yang komprehensif.",
      iconBg: "bg-indigo-500"
    }
  ];

  // Default Testimonials Data
  const defaultTestimonials = [
    {
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      name: "Bu Siti Nurhaliza",
      role: "Ibu Rumah Tangga – Lombok Barat",
      rating: 5,
      testimonial: "Sejak mengikuti PAUDHI, anak saya Aisyah jadi lebih aktif dan ceria. Saya juga jadi lebih paham cara mengasuh dan memberi makan yang baik. Program ini benar-benar membantu keluarga kami dalam memberikan yang terbaik untuk tumbuh kembang anak. Terima kasih PAUDHI!",
      avatarBg: "bg-blue-500"
    },
    {
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      name: "Pak Rudi Hartono",
      role: "Kepala Desa Sumberejo – Blitar",
      rating: 5,
      testimonial: "Dulu layanan Posyandu dan PAUD di desa kami belum terhubung dengan baik. Sekarang dengan sistem SIMONEV PAUDHI, kami bisa memantau pertumbuhan dan pembelajaran anak dalam satu platform. Koordinasi antar lembaga jadi lebih mudah dan efektif untuk melayani masyarakat.",
      avatarBg: "bg-green-500"
    },
    {
      photo: "https://images.unsplash.com/photo-1494790108755-2616b9b2b1ad?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      name: "Bu Maya Sari",
      role: "Guru PAUD – Bandung",
      rating: 5,
      testimonial: "Sebagai guru PAUD, sistem ini sangat membantu saya dalam melacak perkembangan setiap anak didik. Data kesehatan, gizi, dan pembelajaran terintegrasi dengan baik. Orang tua juga lebih mudah memantau progress anaknya. Aplikasi yang sangat bermanfaat!",
      avatarBg: "bg-yellow-500"
    },
    {
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      name: "Dr. Ahmad Fajar, SpA",
      role: "Dokter Spesialis Anak – Puskesmas Cimahi",
      rating: 5,
      testimonial: "Dari sisi medis, SIMONEV PAUDHI memudahkan kami dalam monitoring kesehatan anak secara komprehensif. Data imunisasi, pertumbuhan, dan deteksi dini dapat diakses dengan mudah. Ini sangat membantu dalam memberikan layanan kesehatan yang optimal untuk anak usia dini.",
      avatarBg: "bg-indigo-500"
    }
  ];

  // Default Contact Info
  const defaultContactInfo = [
    {
      icon: "fa-envelope",
      label: "Email",
      value: "info@paudhi.go.id",
      href: "mailto:info@paudhi.go.id"
    },
    {
      icon: "fa-phone",
      label: "Hotline",
      value: "0800-PAUD-HI",
      href: "tel:0800-728-344"
    },
    {
      icon: "fa-globe",
      label: "Website", 
      value: "www.paudhi.go.id",
      href: "https://www.paudhi.go.id"
    }
  ];

  const benefitsData = customBenefits || defaultBenefits;
  const testimonialsData = customTestimonials || defaultTestimonials;
  const contactData = customContactInfo || defaultContactInfo;

  return (
    <div className={`min-h-screen bg-gray-50 ${containerClassName}`}>
      {/* Separator */}
      {showSeparator && (
        <VisualSeparator icon="fa-users" />
      )}

      {/* Section 8: Benefits & Participation */}
      {showSection8 && (
        <section className={`py-16 md:py-20 bg-white ${sectionClassName}`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                <SectionNumber number="8" />
                Manfaat & Cara Berperan
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Bagaimana PAUDHI memberikan manfaat langsung bagi keluarga dan cara Anda dapat berpartisipasi aktif dalam program yang mengubah masa depan anak Indonesia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {benefitsData.map((benefit, index) => (
                <BenefitCard 
                  key={index}
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  iconBg={benefit.iconBg}
                />
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 border border-blue-100">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  🚀 Bergabunglah dengan PAUDHI
                </h3>
                <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
                  Daftarkan institusi atau komunitas Anda untuk menjadi bagian dari ekosistem PAUD Holistik Integratif dan berkontribusi dalam menciptakan generasi emas Indonesia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-3">
                    <i className="fas fa-user-plus"></i>
                    Daftar Sebagai Mitra
                  </button>
                  <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300 flex items-center justify-center gap-3">
                    <i className="fas fa-info-circle"></i>
                    Pelajari Lebih Lanjut
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 9: Testimonials */}
      {showSection9 && (
        <section className={`py-16 md:py-20 ${sectionClassName}`}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                <SectionNumber number="9" bgColor="bg-green-500" />
                Cerita Nyata dari Lapangan
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Testimoni langsung dari para pengguna yang merasakan manfaat PAUDHI dalam kehidupan sehari-hari dan transformasi positif bagi anak-anak mereka.
              </p>
            </div>

            <InfoCallout 
              icon="fa-quote-left" 
              title="Suara dari Masyarakat"
              iconBg="bg-green-500"
            >
              <p>
                Dengarkan pengalaman nyata dari keluarga dan petugas lapangan yang telah merasakan dampak positif PAUDHI.
              </p>
            </InfoCallout>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-12">
              {testimonialsData.map((testimonial, index) => (
                <TestimonialCard 
                  key={index}
                  photo={testimonial.photo}
                  name={testimonial.name}
                  role={testimonial.role}
                  rating={testimonial.rating}
                  testimonial={testimonial.testimonial}
                  avatarBg={testimonial.avatarBg}
                />
              ))}
            </div>

            {/* Testimonial Stats */}
            <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">98%</div>
                  <div className="text-gray-700">Tingkat Kepuasan</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">15K+</div>
                  <div className="text-gray-700">Keluarga Terlayani</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">500+</div>
                  <div className="text-gray-700">Institusi Partner</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">34</div>
                  <div className="text-gray-700">Provinsi</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 10: Contact */}
      {showSection10 && (
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="mb-6">
                <SectionNumber number="10" bgColor="bg-white text-blue-600" />
                <span className="text-3xl md:text-4xl font-bold">Hubungi Kami</span>
              </div>
              <p className="text-lg md:text-xl opacity-90 mb-12 leading-relaxed max-w-3xl mx-auto">
                Ingin tahu lebih lanjut tentang PAUDHI? Tim kami siap membantu Anda dengan informasi lengkap dan dukungan yang dibutuhkan untuk mengoptimalkan tumbuh kembang anak.
              </p>
              
              {/* Contact Methods */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {contactData.map((contact, index) => (
                  <ContactMethod 
                    key={index}
                    icon={contact.icon}
                    label={contact.label}
                    value={contact.value}
                    href={contact.href}
                  />
                ))}
              </div>
              
              {/* Main CTA */}
              <button 
                onClick={onFindService}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto group"
              >
                <i className="fas fa-map-marker-alt group-hover:scale-110 transition-transform duration-300"></i>
                Temukan Layanan PAUDHI Terdekat
              </button>

              {/* Social Media Links */}
              <div className="mt-12 pt-8 border-t border-white border-opacity-20">
                <p className="text-sm opacity-80 mb-4">Ikuti kami di media sosial</p>
                <div className="flex justify-center gap-4">
                  <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-300">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-300">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-300">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors duration-300">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// ==================== EXAMPLE USAGE VARIANTS ====================

const TestimonialsVariants = () => {
  // Custom benefits example
  const customBenefits = [
    {
      icon: "fa-shield-alt",
      title: "Keamanan Data",
      description: "Data anak dan keluarga terlindungi dengan enkripsi tingkat enterprise.",
      iconBg: "bg-red-500"
    }
  ];

  // Custom testimonials example
  const customTestimonials = [
    {
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      name: "Pak Budi Santoso",
      role: "Kepala Dinas Pendidikan - Jakarta",
      rating: 5,
      testimonial: "SIMONEV PAUDHI telah mengubah cara kami mengelola data dan monitoring program PAUD di Jakarta. Transparansi dan akuntabilitas meningkat drastis.",
      avatarBg: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-0">
      {/* Default Testimonials */}
      <AboutTestimonials />
      
      {/* Only Benefits */}
      <AboutTestimonials 
        showSection9={false}
        showSection10={false}
        showSeparator={false}
      />
      
      {/* Custom data */}
      <AboutTestimonials 
        customBenefits={customBenefits}
        customTestimonials={customTestimonials}
        onFindService={() => alert('Finding nearest PAUDHI services...')}
      />
      
      {/* Only contact section */}
      <AboutTestimonials 
        showSection8={false}
        showSection9={false}
        showSeparator={false}
      />
    </div>
  );
};

export default AboutTestimonials;

// Named exports
export { 
  AboutTestimonials, 
  TestimonialsVariants,
  SectionNumber,
  VisualSeparator,
  InfoCallout,
  BenefitCard,
  TestimonialCard,
  ContactMethod
};