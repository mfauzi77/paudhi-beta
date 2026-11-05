import React from "react";
import pmkLogo from '../assets/kl/pmk.png';
import kemendikdasmenLogo from '../assets/kl/kemendikdasmen.png';
import kesehatanLogo from '../assets/kl/kemenkes.png';
import bkkbnLogo from '../assets/kl/bkkbn.png';
import kemensosLogo from '../assets/kl/kemensos.png';
import kemenpppaLogo from '../assets/kl/kpppa.png';
import bappenasLogo from '../assets/kl/bappenas.png';
import kemenagLogo from '../assets/kl/kemenag.png';
import kemendesaLogo from '../assets/kl/kemendespdtt.png';
import bpsLogo from '../assets/kl/bps.svg';
import kemendagriLogo from '../assets/kl/kemendagri.png';
import kemenpuLogo from '../assets/kl/kemenpu.png';

const kemenkoPMK = {
  name: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
  logo: pmkLogo,
};

const institutions = [
  {
    name: "Kementerian Pendidikan Dasar dan Menengah",
    logo: kemendikdasmenLogo,
  },
  {
    name: "Kementerian Dalam Negeri",
    logo: kemendagriLogo,
  },
  {
    name: "Badan Perencanaan Pembangunan Nasional",
    logo: bappenasLogo,
  },
  {
    name: "Kementerian Kependudukan dan Pembangunan Keluarga",
    logo: bkkbnLogo,
  },
  {
    name: "Kementerian Sosial",
    logo: kemensosLogo,
  },
  {
    name: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
    logo: kemenpppaLogo,
  },
  {
    name: "Kementerian Kesehatan",
    logo: kesehatanLogo,
  },

  {
    name: "Kementerian Agama",
    logo: kemenagLogo,
  },
  {
    name: "Kementerian Desa dan Pembangunan Daerah Tertinggal",
    logo: kemendesaLogo,
  },
  {
    name: "Badan Pusat Statistik",
    logo: bpsLogo,
  },
  {
    name: "Kementerian Pekerjaan Umum",
    logo: kemenpuLogo,
  },
  
];

const KLCard = ({ inst, isLeader = false }) => (
  <div
    className={`flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1 h-full
      ${isLeader
      ? "p-4 sm:p-6 lg:p-8"
      : "p-2 sm:p-2.5 lg:p-3"
      }`}
  >
    <div className={`flex items-center justify-center ${isLeader ? "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4" : "w-12 h-12 sm:w-16 sm:h-16 lg:w-[4.5rem] lg:h-[4.5rem] mb-3"}`}>
      <img
        src={inst.logo}
        loading="lazy"
        decoding="async"
        alt={`Logo ${inst.name}`}
        className="w-full h-full object-contain rounded"
      />
    </div>
    <h3 className={`font-bold text-gray-900 ${isLeader ? "text-sm sm:text-base lg:text-lg" : "text-[10px] sm:text-xs lg:text-sm"}`}>
      {inst.name}
    </h3>
  </div>
);

const KLSection = () => {
  return (
    <section className="py-12 sm:py-14 lg:py-16 bg-gray-50">
      <div className="text-center mb-10 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
          K/L yang Terlibat dalam PAUDHI
        </h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
          Kementerian dan Lembaga yang berkolaborasi dalam <br></br><b>Pengembangan Anak Usia Dini Holistik Integratif
          </b></p>
      </div>

      {/* Ketua */}
      <div className="flex justify-center mb-10 px-4">
        <div className="w-full max-w-sm">
          <KLCard inst={kemenkoPMK} isLeader />
        </div>
      </div>

      {/* K/L lainnya */}
      {/* K/L lainnya */}
      <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:gap-4 px-3">
        {/* Baris Pertama (6 K/L) */}
        <div 
          className="grid gap-2 sm:gap-3" 
          style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}
        >
          {institutions.slice(0, 6).map((inst, idx) => (
            <KLCard key={idx} inst={inst} />
          ))}
        </div>
        
        {/* Baris Kedua (5 K/L) */}
        <div 
          className="grid gap-2 sm:gap-3 justify-center max-w-5xl mx-auto w-full" 
          style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
        >
          {institutions.slice(6, 11).map((inst, idx) => (
            <KLCard key={idx + 6} inst={inst} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default KLSection;
