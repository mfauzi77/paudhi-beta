// src/components/EducationSection/Modal.jsx - FIXED FOR API DATA
import React, { useCallback } from 'react';

const Modal = React.memo(({ item, activeTab, onClose, onDownload }) => {
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const renderModalContent = () => {
    switch (activeTab) {
      case 'panduan':
        return (
          <div className="space-y-6">
            {item.pdfUrl ? (
              // PDF Viewer
              <div className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden border">
                <iframe
                  src={`${item.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  title={item.title}
                  className="w-full h-full"
                  frameBorder="0"
                  loading="lazy"
                />
              </div>
            ) : (
              // Image thumbnail for non-PDF guides
              <div className="flex items-start gap-6">
                <img 
                  src={item.thumbnail || item.thumbnailUrl || `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/400/300`} 
                  alt=""
                  className="w-32 h-40 object-cover rounded-xl shadow-lg flex-shrink-0"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-1">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                {item.category || 'Panduan'}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-star text-amber-500" aria-hidden="true"></i>
                  <span>{item.rating || '4.5'}/5.0</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-download" aria-hidden="true"></i>
                  <span>{(item.downloads || 0).toLocaleString()} downloads</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-user" aria-hidden="true"></i>
                  <span>{item.author || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-calendar" aria-hidden="true"></i>
                  <span>{item.publishDate ? (typeof item.publishDate === 'string' ? item.publishDate : new Date(item.publishDate).getFullYear()) : '2025'}</span>
                </div>
              </div>
              
              {item.pages && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <i className="fas fa-file-alt" aria-hidden="true"></i>
                  <span>{item.pages} halaman</span>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fas fa-lightbulb text-amber-500" aria-hidden="true"></i>
                Tentang Panduan Ini:
              </h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                Panduan ini dirancang untuk mendukung implementasi PAUD Holistik Integratif yang mencakup 6 aspek perkembangan anak usia dini.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">🎯 Tujuan Pembelajaran:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                      Memahami konsep PAUD Holistik Integratif
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                      Menerapkan pendekatan multi-aspek dalam pembelajaran
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                      Mengintegrasikan 6 aspek perkembangan anak
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">👥 Target Pengguna:</h5>
                  <p className="text-sm text-gray-600 mb-3">{item.stakeholder || 'Guru PAUD, Orang Tua, Pemerhati Anak'}</p>
                  <h5 className="font-semibold text-gray-800 mb-2">📚 Level:</h5>
                  <p className="text-sm text-gray-600">Pemula - Menengah</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(item.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                title={item.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            
            <div>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                {item.category || 'Video'}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.duration || '00:00'}</div>
                  <div className="text-sm text-gray-600">Durasi</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{(item.views || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{(item.likes || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">
                    {(item.channel || item.author || 'Channel').split(' ')[0]}
                  </div>
                  <div className="text-sm text-gray-600">Channel</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-graduation-cap text-red-500" aria-hidden="true"></i>
                  Tentang Video Ini:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                    Video edukatif tentang PAUD Holistik Integratif
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                    Materi berkualitas dari expert terpercaya
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                    Dapat digunakan untuk pembelajaran mandiri
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Channel:</span> {item.channel || item.author || 'Unknown Channel'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Target:</span> {item.stakeholder || 'Guru & Orang Tua'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(item.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <img 
                src={item.thumbnail || item.thumbnailUrl || `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/api/placeholder/400/300`} 
                alt=""
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>
            
            <div>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                {item.category || 'Tool'}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{(item.downloads || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Downloads</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{item.rating || '4.5'}/5.0</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900">
                    {(item.format || 'Tool').split(' ')[0]}
                  </div>
                  <div className="text-sm text-gray-600">Format</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fas fa-tools text-emerald-500" aria-hidden="true"></i>
                  Tentang Tool Ini:
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">🛠️ Fitur Utama:</h5>
                    <ul className="space-y-2">
                      {(item.features || ['Tool assessment komprehensif', 'Mudah digunakan dan dipahami', 'Berbasis standar PAUDHI']).slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <i className="fas fa-check-circle text-emerald-500 mt-0.5" aria-hidden="true"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">📋 Informasi Tool:</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-semibold">Format:</span> {item.format || 'Alat Digital'}</p>
                      <p><span className="font-semibold">Penggunaan:</span> {item.usage || 'Assessment & Evaluasi'}</p>
                      <p><span className="font-semibold">Target User:</span> {item.stakeholder || 'Guru & Orang Tua'}</p>
                      <p><span className="font-semibold">Author:</span> {item.author || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(item.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalButtonColor = () => {
    const colors = {
      panduan: 'bg-blue-600 hover:bg-blue-700',
      video: 'bg-red-600 hover:bg-red-700',
      tools: 'bg-emerald-600 hover:bg-emerald-700',
      kasus: 'bg-amber-600 hover:bg-amber-700',
      digital: 'bg-purple-600 hover:bg-purple-700'
    };
    return colors[activeTab] || colors.panduan;
  };

  const getModalButtonText = () => {
    const texts = {
      panduan: 'Buka PDF Penuh',
      video: 'Tonton di YouTube',
      tools: 'Download Tool',
      kasus: 'Lihat Studi Kasus',
      digital: 'Akses Resource'
    };
    return texts[activeTab] || texts.panduan;
  };

  const getModalButtonIcon = () => {
    const icons = {
      panduan: 'fas fa-download',
      video: 'fab fa-youtube',
      tools: 'fas fa-download',
      kasus: 'fas fa-external-link-alt',
      digital: 'fas fa-mobile-alt'
    };
    return icons[activeTab] || icons.panduan;
  };

  const handleActionClick = () => {
    if (onDownload) {
      onDownload(item);
    }
    
    if (activeTab === 'video' && item.youtubeId) {
      window.open(`https://www.youtube.com/watch?v=${item.youtubeId}`, '_blank');
    } else if (activeTab === 'panduan' && item.pdfUrl) {
      window.open(item.pdfUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100 my-8">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">Pusat Sumber Edukasi PAUDHI</h2>
              <p className="text-sm text-gray-600">Detail Konten Holistik Integratif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <i className="fas fa-times text-gray-600" aria-hidden="true"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {renderModalContent()}
        </div>

        <div className="flex gap-4 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Tutup
          </button>
          <button
            onClick={handleActionClick}
            className={`flex-1 ${getModalButtonColor()} text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2`}
            aria-label={getModalButtonText()}
          >
            <i className={getModalButtonIcon()} aria-hidden="true"></i>
            {getModalButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;