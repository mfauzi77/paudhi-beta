import React, { useState } from 'react';
import makna1 from '../images/makna1.png';
import makna2 from '../images/makna2.png';
import makna3 from '../images/makna3.png';
import logo from '../images/logo.png'; // Ganti dengan path logo yang sesuai

// Footer placeholder component
import Footer from './Footer';

// Gambar yang akan digunakan - ganti dengan import image yang benar
const logoImages = {
  main: logo,        // Logo utama PAUDHI
  piece1: makna1,      // Potongan puzzle 1 - Anak yang ceria
  piece2: makna2,      // Potongan puzzle 2 - Tunas daun & hati
  piece3: makna3,      // Potongan puzzle 3 - Tangan & bintang
  colors: makna3,      // Makna warna
  font: makna3         // Tipografi
};

const LogoSection = ({ image, title, description, isReversed = false, bgColor = "bg-gray-50" }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${bgColor} py-6 sm:py-8 lg:py-12 xl:py-16`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto`}>
          
          {/* Image Column */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 lg:p-6">
                {!imageError ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <div className="text-center">
                      <i className="fas fa-image text-2xl sm:text-3xl lg:text-4xl text-blue-500 mb-2"></i>
                      <p className="text-blue-600 text-xs sm:text-sm">Logo Image</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Decorative elements - responsive */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>

          {/* Description Column */}
          <div className="w-full lg:w-1/2">
            <div className="text-center lg:text-left px-2 sm:px-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight">
                {title}
              </h3>
              <div className="prose prose-sm sm:prose md:prose-lg lg:prose-xl max-w-none">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Puzzle Card Component untuk layout 1x3 dengan alternating layout
const MobilePuzzleCard = ({ image, emoji, title, subtitle, description, bgColor, textColor, isReversed = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`${bgColor} rounded-xl p-4 shadow-md border border-opacity-20 hover:shadow-lg transition-all duration-300`}>
      <div className={`flex ${isReversed ? 'flex-row-reverse' : 'flex-row'} gap-4 items-center`}>
        {/* Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-lg shadow-sm p-2 flex-shrink-0">
          {!imageError ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded">
              <i className="fas fa-puzzle-piece text-gray-400 text-lg"></i>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 ${isReversed ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 mb-2 ${isReversed ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
            <div className="text-2xl">{emoji}</div>
            <div>
              <h4 className={`text-lg font-bold ${textColor} leading-tight`}>{title}</h4>
              <p className={`${textColor.replace('800', '600')} font-medium text-sm`}>{subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const LogoDescriptionComponent = () => {
  const puzzlePieces = [
    {
      image: logoImages.piece1,
      emoji: "👶",
      title: "Anak yang Ceria",
      subtitle: "Nilai Holistik",
      description: "Potongan puzzle pertama berbentuk anak yang ceria, menggambarkan komitmen PAUDHI untuk memberikan pelayanan terbaik sehingga anak dapat mengeksplorasi dirinya dengan penuh keceriaan.",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800"
    },
    {
      image: logoImages.piece3,
      emoji: "🤝⭐",
      title: "Tangan & Bintang", 
      subtitle: "Nilai Kolaboratif",
      description: "Potongan puzzle kedua berbentuk tangan yang merangkul dan bintang yang menegaskan bahwa untuk mewujudkan visi dan misi PAUDHI, diperlukan kerja sama antara berbagai elemen.",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800"
    },
    {
      image: logoImages.piece2,
      emoji: "🌱💝",
      title: "Tunas Daun & Hati/Cinta",
      subtitle: "Nilai Integratif", 
      description: "Potongan puzzle ketiga berbentuk tunas daun dan hati/cinta yang mencerminkan pentingnya penggabungan berbagai aspek dalam proses tumbuh kembang anak.",
      bgColor: "bg-pink-50",
      textColor: "text-pink-800"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
         
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Logo PAUDHI
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Memahami filosofi dan makna mendalam di balik setiap elemen dalam logo 
            Pengembangan Anak Usia Dini Holistik Integratif
          </p>
        </div>
      </div>

      {/* Main Logo Section */}
      <LogoSection
        image={logoImages.main}
        title="Logo PAUDHI"
        description={
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              Logo PAUDHI dirancang dengan bentuk yang <strong>menarik, sederhana, dan mudah dikenali</strong>. 
              Desain utama logo ini <strong>terinspirasi dari mainan anak-anak, yaitu puzzle</strong>.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              Lingkaran dalam puzzle melambangkan pendekatan PAUDHI yang melihat pertumbuhan dan 
              perkembangan anak secara menyeluruh, tidak terbatas pada satu aspek saja <strong>(nilai holistik)</strong>.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              Di dalam lingkaran puzzle terdapat beberapa elemen, yaitu tunas daun dan hati/cinta 
              <strong>(nilai integratif)</strong>, anak yang ceria, serta tangan yang merangkul dan bintang 
              <strong>(nilai kolaboratif)</strong>.
            </p>
            
            {/* Core Values - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                <div className="font-bold text-blue-800 text-xs sm:text-sm lg:text-base mb-1">Holistik</div>
                <div className="text-xs sm:text-sm text-blue-600">Menyeluruh</div>
              </div>
               <div className="text-center p-2 sm:p-3 lg:p-4 bg-yellow-50 rounded-lg sm:rounded-xl">
                <div className="font-bold text-yellow-800 text-xs sm:text-sm lg:text-base mb-1">Kolaboratif</div>
                <div className="text-xs sm:text-sm text-yellow-600">Kerjasama</div>
              </div>
              <div className="text-center p-2 sm:p-3 lg:p-4 bg-pink-50 rounded-lg sm:rounded-xl">
                <div className="font-bold text-pink-800 text-xs sm:text-sm lg:text-base mb-1">Integratif</div>
                <div className="text-xs sm:text-sm text-pink-600">Terpadu</div>
              </div>
            </div>
          </div>
        }
        bgColor="bg-white"
      />

      {/* Mobile 1x3 Puzzle Pieces Section */}
      <div className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-gray-50 to-white lg:hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Tiga Potongan Puzzle
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              Setiap potongan memiliki makna mendalam dalam filosofi PAUDHI
            </p>
          </div>
          
          {/* 1x3 Layout untuk Mobile dengan alternating layout */}
          <div className="space-y-4">
            {puzzlePieces.map((piece, index) => (
              <MobilePuzzleCard
                key={index}
                image={piece.image}
                emoji={piece.emoji}
                title={piece.title}
                subtitle={piece.subtitle}
                description={piece.description}
                bgColor={piece.bgColor}
                textColor={piece.textColor}
                isReversed={index % 2 === 1} // Alternating: false, true, false
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Individual Puzzle Sections (Hidden on Mobile) - Ratakan Kanan Kiri */}
      <div className="hidden lg:block">
        {/* Puzzle Piece 1 - Logo Kanan, Deskripsi Kiri */}
        <LogoSection
          image={logoImages.piece1}
          title="Potongan Puzzle Pertama"
          description={
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">👶</div>
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 leading-tight">Anak yang Ceria</h4>
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Nilai Holistik</p>
                </div>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Potongan puzzle pertama berbentuk <strong>anak yang ceria</strong>, menggambarkan 
                komitmen PAUDHI untuk memberikan pelayanan terbaik sehingga anak dapat 
                mengeksplorasi dirinya dengan penuh keceriaan.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Anak-anak juga merasa <strong>dihargai dan bahagia</strong> saat belajar dan 
                berkembang di lingkungannya.
              </p>
            </div>
          }
          isReversed={true}
          bgColor="bg-blue-50"
        />

        {/* Puzzle Piece 2 - Logo Kiri, Deskripsi Kanan */}
        <LogoSection
          image={logoImages.piece3}
          title="Potongan Puzzle Kedua"
          description={
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">🤝⭐</div>
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-800 leading-tight">Tangan & Bintang</h4>
                  <p className="text-yellow-600 font-medium text-sm sm:text-base">Nilai Kolaboratif</p>
                </div>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Potongan puzzle kedua berbentuk <strong>tangan yang merangkul dan bintang</strong> 
                yang menegaskan bahwa untuk mewujudkan visi dan misi PAUDHI, diperlukan kerja sama 
                antara berbagai elemen.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Kolaborasi melibatkan <strong>pemerintah, masyarakat, dan keluarga</strong> dalam 
                satu kesatuan yang solid.
              </p>
            </div>
          }
          isReversed={false}
          bgColor="bg-yellow-50"
        />

        {/* Puzzle Piece 3 - Logo Kanan, Deskripsi Kiri */}
        <LogoSection
          image={logoImages.piece2}
          title="Potongan Puzzle Ketiga"
          description={
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl">🌱💝</div>
                <div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-800 leading-tight">Tunas Daun & Hati/Cinta</h4>
                  <p className="text-pink-600 font-medium text-sm sm:text-base">Nilai Integratif</p>
                </div>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Potongan puzzle ketiga berbentuk <strong>tunas daun dan hati/cinta</strong> yang 
                mencerminkan pentingnya penggabungan berbagai aspek dalam proses tumbuh kembang anak.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                Elemen ini menegaskan bahwa semua aspek dilakukan <strong>dengan sepenuh hati</strong> 
                untuk meraih hasil yang optimal.
              </p>
            </div>
          }
          isReversed={true}
          bgColor="bg-pink-50"
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default LogoDescriptionComponent;