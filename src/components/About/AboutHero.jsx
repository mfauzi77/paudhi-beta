import React, { useState, useEffect } from "react";

const AboutHero = ({
  title = "Apa itu PAUDHI?",
  subtitle = "PAUDHI adalah Upaya pengembangan anak usia dini yang dilakukan untuk memenuhi kebutuhan esensial anak yang beragam dan saling terkait secara simultan, sistematis, dan terintegrasi.",
  showButtons = true,
  onWatchVideo = () => console.log("Tonton video"),
  onDownloadGuide = () => console.log("Unduh panduan"),
  customButtons = null,
  bgGradient = "from-blue-50 via-emerald-50 to-white",
  textColor = "text-gray-800",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative bg-gradient-to-br ${bgGradient} ${textColor} ${className}`}
    >
      <div className="container mx-auto px-6 py-24 text-center">
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Judul */}
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-wide">
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subjudul */}
          <p className="text-md md:text-xl max-w-3xl mx-auto mb-10 font-medium leading-relaxed text-gray-700">
            {subtitle}
          </p>

          {/* Tombol */}
          {showButtons && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {customButtons ? (
                customButtons
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/maknalogo'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 transition-all duration-300"
                  >
                    Makna Logo PAUDHI
                  </button>
                  <a href="/logo.png" download
  className="inline-block bg-white border border-emerald-600 text-emerald-700 px-6 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-all duration-300"
>
  📥 Unduh Logo
</a>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dekorasi Latar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-20 left-1/4 w-3 h-3 bg-blue-400 opacity-40 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-1/4 w-4 h-4 bg-emerald-400 opacity-30 rounded-full animate-ping delay-1000"></div>
      </div>
    </div>
  );
};

export default AboutHero;
export { AboutHero };
