import { sanitizeHtml } from '../utils/sanitizeHtml';
﻿import Footer from './Footer';
import React, { useState } from 'react';

const FAQApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState(null);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'dasar', label: 'Info Dasar' },
    { id: 'daftar', label: 'Cara Daftar' },
    { id: 'praktis', label: 'Tips Praktis' },
    { id: 'masalah', label: 'Solusi Masalah' },
    { id: 'teknis', label: 'Bantuan Website' },
    { id: 'pemerintah', label: 'Untuk Penyelenggara' }
  ];

  const generalFAQs = [
    {
      id: 'paud-hi-explanation',
      category: 'dasar',
      question: 'Apa itu PAUDHI?',
      answer: (
        <div>
          <strong>PAUDHI (Pengembangan Anak Usia Dini Holistik Integratif) adalah program layanan lengkap untuk anak usia 0–6 tahun yang mencakup pendidikan, kesehatan, gizi, perlindungan, dan pengasuhan.</strong>
          <br />
          <br />
          <strong>Karakteristik PAUDHI:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Layanan dilakukan secara <strong>terpadu dan terkoordinasi</strong> oleh berbagai sektor</li>
            <li>Memastikan setiap anak bisa tumbuh dan berkembang secara optimal</li>
            <li>Tidak hanya fokus pada kegiatan belajar di sekolah</li>
            <li>Memastikan anak mendapatkan imunisasi, cek kesehatan, asupan gizi yang cukup</li>
            <li>Memberikan dukungan bagi orang tua dalam mengasuh anak</li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg ">
            <strong>💡 Singkatnya:</strong> PAUDHI adalah layanan "paket komplit" yang dilakukan melalui kerjasama antara pemerintah daerah, satuan PAUD, dan lembaga terkait lainnya.
          </div>
        </div>
      )
    },
    {
      id: 'who-organizes',
      category: 'dasar',
      question: 'Siapa yang menyelenggarakan PAUDHI?',
      answer: (
        <div>
          <strong>PAUDHI dilaksanakan oleh satuan PAUD di daerah dengan dukungan penuh dari pemerintah daerah melalui gugus tugas PAUDHI.</strong>
          <br />
          <br />
          <strong>Koordinasi melibatkan banyak sektor:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>✅ Sektor Pendidikan</li>
            <li>✅ Sektor Kesehatan</li>
            <li>✅ Sektor Perlindungan Anak</li>
            <li>✅ Sektor Gizi dan Ketahanan Pangan</li>
            <li>✅ Sektor lainnya yang terkait</li>
          </ul>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
            <strong>🤝 Kerjasama Lintas Sektor:</strong>
            <br />
            Semua pihak bekerja sama untuk memastikan layanan PAUDHI berjalan efektif dan terintegrasi di setiap daerah.
          </div>
        </div>
      )
    },
    {
      id: 'paud-hi-goals',
      category: 'dasar',
      question: 'Apa tujuan dari PAUDHI?',
      answer: (
        <div>
          <strong>Tujuan utama PAUDHI adalah memastikan setiap anak usia dini mendapatkan layanan esensial secara menyeluruh agar tumbuh optimal.</strong>
          <br />
          <br />
          <strong>🎯 Aspek perkembangan yang ditargetkan:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li><strong>Fisik:</strong> Pertumbuhan badan, kesehatan, dan motorik</li>
            <li><strong>Kognitif:</strong> Kemampuan berpikir dan belajar</li>
            <li><strong>Emosional:</strong> Pengelolaan perasaan dan karakter</li>
            <li><strong>Sosial:</strong> Kemampuan berinteraksi dengan orang lain</li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
            <strong>🚀 Komitmen Pemerintah:</strong>
            <br />
            Pemerintah mendorong daerah untuk meningkatkan layanan ini agar lebih berkualitas dan terintegrasi di seluruh Indonesia.
          </div>
        </div>
      )
    },
    {
      id: 'benefits-for-families',
      category: 'praktis',
      question: 'Apa manfaat PAUDHI untuk anak dan keluarga?',
      answer: (
        <div>
          <strong>PAUDHI memberikan manfaat komprehensif untuk anak dan keluarga:</strong>
          <br />
          <br />
          <strong>🧒 Manfaat untuk Anak:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Mendapatkan layanan lengkap yang mendukung tumbuh kembang optimal</li>
            <li>Akses ke pendidikan, kesehatan, gizi, dan perlindungan dalam satu sistem</li>
            <li>Stimulasi yang tepat sesuai usia dan kebutuhan</li>
            <li>Deteksi dini masalah tumbuh kembang</li>
          </ul>
          
          <strong>👨‍👩‍👧‍👦 Manfaat untuk Keluarga:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Orang tua dibekali pengetahuan pengasuhan yang tepat</li>
            <li>Kemudahan mengakses layanan kesehatan, gizi, dan perlindungan anak</li>
            <li>Semua layanan tersedia di satu tempat (one-stop service)</li>
            <li>Dukungan komunitas dalam pengasuhan anak</li>
          </ul>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
            <strong>💡 Keunggulan Utama:</strong>
            <br />
            Layanan terintegrasi memudahkan keluarga dan memastikan tidak ada aspek penting yang terlewat dalam tumbuh kembang anak.
          </div>
        </div>
      )
    },
    {
      id: 'central-government-role',
      category: 'pemerintah',
      question: 'Bagaimana pemerintah pusat berperan?',
      answer: (
        <div>
          <strong>Kemendikdasmen melalui Direktorat PAUD bekerja sama dengan dinas pendidikan kabupaten/kota untuk mendorong pelaksanaan PAUDHI di daerah.</strong>
          <br />
          <br />
          <strong>🏛️ Peran Pemerintah Pusat:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Memberikan panduan dan kebijakan PAUDHI nasional</li>
            <li>Melakukan pembinaan kepada satuan PAUD</li>
            <li>Memfasilitasi koordinasi lintas sektor</li>
            <li>Menyediakan dukungan teknis dan capacity building</li>
            <li>Monitoring dan evaluasi implementasi di daerah</li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
            <strong>🎯 Fokus Utama:</strong>
            <br />
            Memastikan layanan PAUDHI bisa berjalan efektif dan berkualitas di seluruh Indonesia melalui kerjasama yang solid antara pusat dan daerah.
          </div>
        </div>
      )
    },
    {
      id: 'success-indicators',
      category: 'pemerintah',
      question: 'Apa indikator keberhasilan program PAUDHI?',
      answer: (
        <div>
          <strong>Program PAUDHI dianggap berhasil jika memenuhi indikator-indikator berikut:</strong>
          <br />
          <br />
          <strong>📊 Indikator Cakupan Layanan:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Semua anak usia dini mendapatkan layanan dasar (pendidikan, gizi, kesehatan, perlindungan)</li>
            <li>Layanan dilakukan secara terintegrasi, tidak terpisah-pisah</li>
            <li>Akses layanan mudah dijangkau oleh seluruh keluarga</li>
          </ul>
          
          <strong>🤝 Indikator Koordinasi:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Pelaksanaan dikoordinasikan dengan baik lintas sektor</li>
            <li>Gugus tugas PAUDHI berfungsi optimal</li>
            <li>Sinkronisasi program antar instansi terkait</li>
          </ul>
          
          <strong>📈 Indikator Kualitas:</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Terjadi peningkatan kualitas layanan PAUD di daerah</li>
            <li>SDM terlatih dan kompeten</li>
            <li>Sarana prasarana memadai</li>
            <li>Kepuasan masyarakat terhadap layanan</li>
          </ul>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
            <strong>🏆 Hasil Akhir yang Diharapkan:</strong>
            <br />
            Anak-anak Indonesia tumbuh sehat, cerdas, dan berkarakter melalui layanan PAUDHI yang berkualitas dan terintegrasi.
          </div>
        </div>
      )
    }
  ];

  const governmentFAQs = [
    {
      id: 'implementation-steps',
      category: 'pemerintah',
      question: 'Bagaimana langkah implementasi PAUDHI di daerah?',
      answer: (
        <div>
          <strong>Implementasi PAUDHI di daerah dilakukan melalui tahapan sistematis:</strong>
          <br />
          <br />
          <strong>🏛️ Tahap 1: Pembentukan Gugus Tugas</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Membentuk gugus tugas PAUDHI tingkat daerah</li>
            <li>Melibatkan OPD terkait (Pendidikan, Kesehatan, Sosial, dll)</li>
            <li>Menetapkan koordinator dan sekretariat</li>
          </ul>
          
          <strong>📋 Tahap 2: Pemetaan dan Perencanaan</strong>
          <ul className="list-disc ml-5 mt-4 mb-4">
            <li>Pemetaan kondisi anak usia dini di daerah</li>
            <li>Inventarisasi layanan yang sudah ada</li>
            <li>Identifikasi gap dan kebutuhan</li>
            <li>Penyusunan rencana aksi daerah</li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
            <strong>🎯 Dukungan dari Pusat:</strong>
            <br />
            Kemendikdasmen menyediakan panduan, pelatihan, dan pendampingan teknis untuk membantu daerah mengimplementasikan PAUDHI.
          </div>
        </div>
      )
    }
  ];

  const contactMethods = [
    {
      href: "tel:1500-7283",
      icon: "fas fa-phone",
      label: "Telepon Gratis",
      type: "phone"
    },
    {
      href: "https://wa.me/6281115007283",
      icon: "fab fa-whatsapp", 
      label: "WhatsApp",
      type: "whatsapp"
    },
    {
      href: "mailto:help@simonevpaud.kemenko.go.id",
      icon: "fas fa-envelope",
      label: "Email", 
      type: "email"
    },
    {
      href: "#",
      icon: "fas fa-comments",
      label: "Chat Online",
      type: "chat"
    }
  ];

  const handleContactClick = (e, contact) => {
    if (contact.type === 'chat') {
      e.preventDefault();
      alert('Fitur chat online akan segera tersedia!');
    }
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const isVisible = (faq) => {
    if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
    
    if (searchTerm) {
      const questionText = faq.question.toLowerCase();
      return questionText.includes(searchTerm.toLowerCase());
    }
    
    return true;
  };

  const visibleGeneralFAQs = generalFAQs.filter(isVisible);
  const visibleGovFAQs = governmentFAQs.filter(isVisible);
  const hasResults = visibleGeneralFAQs.length > 0 || visibleGovFAQs.length > 0;

  const toggleFAQ = (faqId) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const FAQItem = ({ faq, isGovernment = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = openFAQ === faq.id || isHovered;

    return (
      <div 
        className={`border rounded-2xl mb-6 overflow-hidden transition-all duration-500 ${isGovernment ? 'border-purple-200' : 'border-gray-200'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`p-6 cursor-pointer flex justify-between items-center font-semibold transition-all duration-300 ${
            isExpanded 
              ? isGovernment 
                ? 'bg-purple-50 text-purple-700' 
                : 'bg-blue-50 text-blue-700'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => toggleFAQ(faq.id)}
        >
          <span 
            className="text-lg"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(highlightText(faq.question, searchTerm)) 
            }}
          />
          <i className={`fas fa-chevron-down transition-transform duration-300 text-xl ${
            isExpanded ? 'rotate-180' : ''
          } ${
            isExpanded 
              ? isGovernment ? 'text-purple-700' : 'text-blue-700'
              : 'text-gray-400'
          }`}></i>
        </div>
        <div className={`transition-all duration-400 ease-out overflow-hidden ${
          isExpanded ? 'max-h-screen p-8' : 'max-h-0 p-0'
        }`}>
          <div className={`text-gray-600 leading-relaxed text-base transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}>
            {faq.answer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
        
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
      
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        rel="stylesheet" 
      />
      
      {/* Floating shapes background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-orange-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <div className="max-w-6xl mx-auto p-5 pt-27 relative z-10">
        <div className="bg-gradient-to-br  text-white p-12 text-center mb-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/25">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
          <div className="relative z-10">
          
            <div className="text-center mb-16 animate-bounce">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Tanya Jawab <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">PAUDHI</span>
          </h2>
        
        </div>
            
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-6xl mx-auto px-5 relative z-10">
        {/* FAQ Section Umum */}
        {(activeCategory === 'all' || activeCategory !== 'pemerintah') && visibleGeneralFAQs.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-12 border border-white/20 hover:shadow-3xl transition-all duration-500 hover:bg-white/95" id="faq-umum">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-8 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <i className="fas fa-baby text-3xl animate-bounce relative z-10"></i>
              <h2 className="text-3xl font-bold relative z-10">Pertanyaan yang Sering Ditanyakan</h2>
            </div>
            <div className="p-10">
              {visibleGeneralFAQs.map((faq, index) => (
                <div 
                  key={faq.id}
                  style={{ animationDelay: `${index * 700}ms` }}
                  className="animate-fade-in-up"
                >
                  <FAQItem faq={faq} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Section */}
      {/* <div className="max-w-6xl mx-auto px-5 mb-10">
        <div className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white p-10 rounded-2xl text-center" id="bantuan">
          <h3 className="text-3xl font-bold mb-4">
            <i className="fas fa-headset mr-3"></i>
            Masih Ada Pertanyaan?
          </h3>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {contactMethods.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                onClick={(e) => handleContactClick(e, contact)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-600 border-none rounded-lg font-semibold no-underline transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-2xl"
                target={contact.type === 'whatsapp' ? '_blank' : undefined}
                rel={contact.type === 'whatsapp' ? 'noopener noreferrer' : undefined}
              >
                <i className={contact.icon}></i>
                {contact.label}
              </a>
            ))}
          </div>
          
       
        </div>
      </div> */}
      < Footer />
    </div>
  );
};

export default FAQApp;
