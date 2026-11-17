import React from 'react';
import pmklogo from '../assets/kl/pmk.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
<<<<<<< HEAD
    <footer className="bg-gradient-to-r from-sky-200 to-white text-slate-800 py-5" role="contentinfo">
=======
    <footer className="bg-yellow-400 text-gray-900 py-5" role="contentinfo">
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
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
<<<<<<< HEAD
              <span className="text-slate-800 text-base">Makna Logo PAUDHI</span>
=======
              <span className="text-gray-900 text-base">Makna Logo PAUDHI</span>
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
            </a>
          </div>

          {/* Navigasi */}
          <div>
<<<<<<< HEAD
            <h3 className="text-slate-800 text-lg font-semibold mb-6">
=======
            <h3 className="text-gray-900 text-lg font-semibold mb-6">
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
              Navigasi
            </h3>
            <nav>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://asiksupport-stg.dto.kemkes.go.id/"
<<<<<<< HEAD
                    className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
=======
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Layanan Kesehatan
                  </a>
                </li>
                <li>
                  <a 
                    href="https://api.whatsapp.com/send?phone=628111129129"
<<<<<<< HEAD
                    className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
=======
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
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
<<<<<<< HEAD
            <h3 className="text-slate-800 text-lg font-semibold mb-6">
=======
            <h3 className="text-gray-900 text-lg font-semibold mb-6">
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
              Profil
            </h3>
            <nav>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="/about"
<<<<<<< HEAD
                    className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
=======
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
                  >
                    Tentang
                  </a>
                </li>
                <li>
                  <a 
                    href="/faq"
<<<<<<< HEAD
                    className="text-slate-600 hover:text-slate-900 transition-colors duration-200"
=======
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
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
<<<<<<< HEAD
              <div className="text-slate-800 font-semibold text-base mb-1">
                Kementerian Koordinator Bidang
              </div>
              <div className="text-slate-800 font-semibold text-base mb-4">
                Pembangunan Manusia dan Kebudayaan
              </div>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed">
=======
              <div className="text-gray-900 font-semibold text-base mb-1">
                Kementerian Koordinator Bidang
              </div>
              <div className="text-gray-900 font-semibold text-base mb-4">
                Pembangunan Manusia dan Kebudayaan
              </div>
            </div>
            <div className="text-gray-700 text-sm leading-relaxed">
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
              <p>Jl. Medan Merdeka Barat No.3</p>
              <p>RT.2/RW.3, Gambir, Kota Jakarta Pusat</p>
              <p>Daerah Khusus Ibukota Jakarta 10110</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
          <div className="text-center">
<<<<<<< HEAD
            <p className="text-slate-500 text-sm">
=======
            <p className="text-gray-700 text-sm">
>>>>>>> 53e3c5bbf45d3a42ad651593db2586a84017c9ee
              © {currentYear} SISMONEV PAUDHI. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
