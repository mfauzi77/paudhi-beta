import React from 'react';
import pmklogo from '../assets/kl/pmk.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-yellow-400 text-gray-900 py-5" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <a href="/maknalogo" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12">
                <img
                  src="/logo.png"
                  alt="Logo PAUDHI"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-gray-900 text-base">Makna Logo PAUDHI</span>
            </a>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-6">
              Navigasi
            </h3>
            <nav>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://asiksupport-stg.dto.kemkes.go.id/"
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Layanan Kesehatan
                  </a>
                </li>
                <li>
                  <a 
                    href="https://api.whatsapp.com/send?phone=628111129129"
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Konseling Keluarga
                  </a>
                </li>
                <li>
                
                </li>
              </ul>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 text-lg font-semibold mb-6">
              Profil
            </h3>
            <nav>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/about"
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Tentang
                  </a>
                </li>
                <li>
                  <a 
                    href="/faq"
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Tanya Jawab PAUDHI
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan Info */}
          <div>
            <div className="mb-4">
              <img
                src={pmklogo}
                alt="Logo Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan"
                className="h-12 w-auto mb-4"
              />
              <div className="text-gray-900 font-semibold text-base mb-1">
                Kementerian Koordinator Bidang
              </div>
              <div className="text-gray-900 font-semibold text-base mb-4">
                Pembangunan Manusia dan Kebudayaan
              </div>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed">
              <p>Jl. Medan Merdeka Barat No.3</p>
              <p>RT.2/RW.3, Gambir, Kota Jakarta Pusat</p>
              <p>Daerah Khusus Ibukota Jakarta 10110</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-700 text-sm">
              © {currentYear} SISMONEV PAUDHI. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
