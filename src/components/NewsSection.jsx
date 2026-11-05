import { sanitizeHtml } from '../utils/sanitizeHtml';
// NewsSection.jsx - SIMPLE FIX untuk menampilkan gambar dari backend
import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../hooks/useApi';
import { Download, X, Eye, Calendar, User, Tag } from 'lucide-react';
import NewsImage from '../components/common/NewsImage';
import apiService from '../utils/apiService';

const NewsSection = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { news: apiNews, loading: apiLoading, error: apiError, pagination } = useNews({ 
    status: 'published',
    limit: 10,
    search: searchTerm
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching news...');
      // Selalu batasi beranda ke status publish
      const response = await apiService.getNews({ status: 'publish' });
      console.log('📡 News API response:', response);
      
      if (response.success) {
        const newsData = response.data || [];
        console.log('📰 News data received:', {
          count: newsData.length,
          sample: newsData.slice(0, 2).map(n => ({
            id: n._id,
            title: n.title,
            image: n.image,
            imageType: typeof n.image
          }))
        });
        
        setNews(newsData);
      } else {
        setError(response.message || 'Gagal memuat berita');
        console.log('❌ News API error:', response.message);
      }
    } catch (err) {
      setError('Gagal memuat berita');
      console.error('❌ Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNews(null);
  };

  const downloadPDF = async (newsItem) => {
    try {
      // Get image URL for the news item
      const imageUrl = getImageUrl(newsItem);
      
      // Create complete HTML content with image
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${newsItem.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: #ffffff;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 3px solid #3b82f6;
            }
            
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 20px;
              line-height: 1.3;
            }
            
            .meta {
              display: flex;
              justify-content: center;
              gap: 20px;
              flex-wrap: wrap;
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 20px;
            }
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            
            .meta-icon {
              width: 16px;
              height: 16px;
              fill: currentColor;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-draft {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-approved {
              background: #d1fae5;
              color: #065f46;
            }
            
            .status-rejected {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .image-container {
              margin: 30px 0;
              text-align: center;
            }
            
            .news-image {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .content {
              margin: 30px 0;
              text-align: justify;
            }
            
            .excerpt {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 30px;
              padding: 20px;
              background: #f9fafb;
              border-left: 4px solid #3b82f6;
              border-radius: 0 8px 8px 0;
            }
            
            .full-content {
              font-size: 16px;
              line-height: 1.8;
              color: #374151;
            }
            
            .tags {
              margin: 30px 0;
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .tag {
              background: #eff6ff;
              color: #1d4ed8;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 14px;
            }
            
            .footer-logo {
              font-size: 18px;
              font-weight: 600;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              color: rgba(59, 130, 246, 0.1);
              font-weight: 700;
              pointer-events: none;
              z-index: -1;
            }
            
            @media print {
              body { padding: 20px; }
              .watermark { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">PAUDHI</div>
          
          <div class="header">
            <div class="logo">PAUDHI</div>
            <h1 class="title">${newsItem.title}</h1>
            <div class="meta">
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>${newsItem.author?.klName || newsItem.author?.fullName || newsItem.author?.email || 'Kemenko PMK'}</span>
              </div>
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                <span>${new Date(newsItem.newsDate || newsItem.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
                <span>${newsItem.category || 'Umum'}</span>
              </div>
            </div>
            <div class="status-badge status-${newsItem.status}">${newsItem.status}</div>
          </div>
          
          ${imageUrl ? `
          <div class="image-container">
            <img src="${imageUrl}" alt="${newsItem.title}" class="news-image" />
          </div>
          ` : ''}
          
          <div class="content">
            ${newsItem.excerpt ? `
            <div class="excerpt">
              <strong>Ringkasan:</strong> ${newsItem.excerpt}
            </div>
            ` : ''}
            
            <div class="full-content">
              ${newsItem.content || 'Konten tidak tersedia'}
            </div>
          </div>
          
          ${newsItem.tags && newsItem.tags.length > 0 ? `
          <div class="tags">
            <strong>Tags:</strong>
            ${newsItem.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-logo">PAUDHI - ${newsItem.author?.klName || 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan'}</div>
            <p>Dokumen ini dibuat otomatis dari sistem Pengembangan Anak Usia Dini Holistik Integratif</p>
            <p>© ${new Date().getFullYear()} ${newsItem.author?.klName || 'Kemenko PMK'}</p>
            <p>Dibuat pada: ${new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${newsItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_paud_hi.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert('Dokumen berhasil diunduh! File HTML dapat dibuka di browser dan dicetak sebagai PDF.');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh dokumen. Silakan coba lagi.');
    }
  };

  // ✅ Enhanced image URL resolver - consistent with NewsImage component
  const getImageUrl = (article) => {
    // Handle null/undefined image gracefully - don't log error for articles without images
    if (!article || !article.image) {
      return null; // Return null silently - no error logging for articles without images
    }

    const rawSrc = article.image;
    
    // Get backend origin - handle both development and production
    let backendOrigin;
    try {
      const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
        ? import.meta.env.VITE_API_URL
        : (window && window.PAUDHI_API_BASE) || '/api';
      
      // If API base is absolute URL, extract origin
      if (/^https?:\/\//i.test(apiBase)) {
        backendOrigin = apiBase.replace(/\/+$/, '').replace(/\/api\/?$/, '');
      } else {
        // Relative path - use current origin
        backendOrigin = window.location.origin;
      }
    } catch (e) {
      backendOrigin = window.location.origin;
    }

    // Debug logging
    console.log('🔍 NewsSection getImageUrl:', {
      articleId: article._id,
      rawSrc: typeof rawSrc === 'string' ? rawSrc.substring(0, 100) : rawSrc,
      rawSrcType: typeof rawSrc,
      backendOrigin: backendOrigin
    });

    // Handle string URL (most common case)
    if (typeof rawSrc === 'string') {
      // Already absolute URL - normalize if needed
      if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
        try {
          const url = new URL(rawSrc);
          // If it's an uploads path and origin doesn't match, use backend origin
          if (url.pathname.startsWith('/uploads/')) {
            // Check if we should normalize (different origin or localhost)
            const needsNormalization = 
              url.origin !== backendOrigin || 
              /localhost|127\.0\.0\.1/.test(url.hostname);
            
            if (needsNormalization) {
              const normalized = `${backendOrigin}${url.pathname}`;
              console.log('✅ NewsSection: Normalized absolute URL:', normalized);
              return normalized;
            }
          }
          console.log('✅ NewsSection: Using absolute URL as-is:', rawSrc);
          return rawSrc;
        } catch (e) {
          console.warn('⚠️ NewsSection: Invalid URL format, treating as relative:', rawSrc);
        }
      }
      
      // Relative path starting with /uploads/
      if (rawSrc.startsWith('/uploads/')) {
        const imageUrl = `${backendOrigin}${rawSrc}`;
        console.log('✅ NewsSection: Constructed from /uploads/ path:', imageUrl);
        return imageUrl;
      }
      
      // Relative path starting with uploads/ (no leading slash)
      if (rawSrc.startsWith('uploads/')) {
        const imageUrl = `${backendOrigin}/${rawSrc}`;
        console.log('✅ NewsSection: Constructed from uploads/ path:', imageUrl);
        return imageUrl;
      }
      
      // Just filename - assume it's in news folder
      if (!rawSrc.includes('/') && !rawSrc.startsWith('http')) {
        const imageUrl = `${backendOrigin}/uploads/news/${rawSrc}`;
        console.log('✅ NewsSection: Constructed from filename:', imageUrl);
        return imageUrl;
      }
      
      // Try to construct from any other relative path
      const imageUrl = rawSrc.startsWith('/') 
        ? `${backendOrigin}${rawSrc}`
        : `${backendOrigin}/${rawSrc}`;
      console.log('✅ NewsSection: Constructed from relative path:', imageUrl);
      return imageUrl;
    }

    // Handle object format (from upload response)
    if (typeof rawSrc === 'object' && rawSrc !== null) {
      console.log('⚠️ NewsSection: Image is object, extracting URL:', rawSrc);
      
      // Try url property first
      if (rawSrc.url && typeof rawSrc.url === 'string') {
        return getImageUrl({ ...article, image: rawSrc.url }); // Recursively process
      }
      
      // Try relativePath property
      if (rawSrc.relativePath && typeof rawSrc.relativePath === 'string') {
        return getImageUrl({ ...article, image: rawSrc.relativePath }); // Recursively process
      }
      
      // Try filename property
      if (rawSrc.filename && typeof rawSrc.filename === 'string') {
        return getImageUrl({ ...article, image: rawSrc.filename }); // Recursively process
      }
    }

    console.error('❌ NewsSection: Could not resolve image URL for:', rawSrc);
    return null;
  };

  const filteredArticles = news.filter(article => {
    if (!searchTerm) return true;
    
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const openPopup = (article) => {
    setSelectedNews(article);
    setIsPopupOpen(true);
    setTimeout(() => setIsPopupVisible(true), 10);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setTimeout(() => {
      setIsPopupOpen(false);
      setSelectedNews(null);
      document.body.style.overflow = 'unset';
    }, 300);
  };

  const shareToSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(selectedNews?.title || '');
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title} - ${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      default:
        break;
    }
    window.open(shareUrl, '_blank');
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0].offsetWidth;
      const gap = window.innerWidth >= 640 ? 24 : 16;
      container.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0].offsetWidth;
      const gap = window.innerWidth >= 640 ? 24 : 16;
      container.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50" id="berita">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
              Berita & Informasi <span className="text-blue-600">PAUDHI</span>
            </h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Memuat berita...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50" id="berita">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Gagal memuat berita</h3>
            <p className="text-sm sm:text-base text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-emerald-50" id="berita">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <i className="fas fa-newspaper"></i>
            <span>Berita Terkini</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
            Berita & Informasi <span className="text-blue-600">PAUDHI</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Update terbaru seputar program Pengembangan Anak Usia Dini Holistik Integratif
          </p>
          
          {pagination.total && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {pagination.total} artikel tersedia
            </p>
          )}
        </div>

        <div className="mb-6 sm:mb-8 max-w-md mx-auto px-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Cari artikel berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white shadow-sm text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
              </button>
            )}
          </div>
        </div>

        {filteredArticles.length > 0 && (
          <div className="relative flex items-center">
            {filteredArticles.length > 3 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl -translate-x-3 hidden sm:flex"
                  aria-label="Scroll Left"
                >
                  <i className="fas fa-chevron-left text-sm lg:text-base"></i>
                </button>

                <button
                  onClick={scrollRight}
                  className="absolute right-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl translate-x-3 hidden sm:flex"
                  aria-label="Scroll Right"
                >
                  <i className="fas fa-chevron-right text-sm lg:text-base"></i>
                </button>
              </>
            )}

            <div
              ref={scrollContainerRef}
              className={`flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-1 ${
                filteredArticles.length > 3 ? 'sm:mx-16 lg:mx-20' : ''
              }`}
              style={{
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                scrollPaddingLeft: '16px',
                scrollPaddingRight: '16px'
              }}
            >
              {filteredArticles.map((article) => {
                return (
                  <div
                    key={article._id}
                    onClick={() => openPopup(article)}
                    className="group cursor-pointer bg-white shadow-md hover:shadow-xl border border-gray-200/50 rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0 w-64 sm:w-72 lg:w-80"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    {/* ✅ IMAGE SECTION */}
                    <div className="relative h-32 sm:h-36 lg:h-40 overflow-hidden bg-gray-100">
                      {article.image ? (
                        <NewsImage
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          fallbackClassName="w-full h-full"
                          hoverEffect={false}
                        />
                      ) : (
                        // Placeholder sederhana
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                          <div className="text-center">
                            <i className="fas fa-newspaper text-2xl mb-2"></i>
                            <div className="text-sm">PAUDHI</div>
                          </div>
                        </div>
                      )}

                      {/* Badge icon */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-md">
                        <i className={`${article.icon || 'fas fa-newspaper'} text-blue-600 text-xs sm:text-sm`}></i>
                      </div>

                      {/* Date overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-white">
                          <span className="flex items-center gap-1">
                            <i className="fas fa-calendar text-xs"></i>
                            <span className="hidden sm:inline">
                              {new Date(article.newsDate || article.createdAt).toLocaleDateString('id-ID')}
                            </span>
                            <span className="sm:hidden">
                              {new Date(article.newsDate || article.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 hidden sm:flex">
                            <i className="fas fa-clock text-xs"></i>
                            {article.readTime || '3 menit'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Article Content */}
                    <div className="p-3 sm:p-4 lg:p-5">
                      <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Tags section */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex flex-wrap gap-1">
                          {article.tags && article.tags.length > 0 && article.tags.slice(0, 1).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags && article.tags.length > 1 && (
                            <span className="text-xs text-gray-500">+{article.tags.length - 1}</span>
                          )}
                        </div>
                        <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                          <i className="fas fa-chevron-right text-xs sm:text-sm"></i>
                        </div>
                      </div>

                      {/* Author section */}
                      <div className="pt-2 sm:pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <i className="fas fa-user-circle"></i>
                          <span className="truncate hidden sm:inline">
                            {article.author?.klName || article.author?.fullName || article.author?.email || 'Kemenko PMK'}
                          </span>
                          <span className="truncate sm:hidden">{article.author?.klName || 'PMK'}</span>
                          {article.views > 0 && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="flex items-center gap-1">
                                <i className="fas fa-eye text-xs"></i>
                                {article.views}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <i className="fas fa-search text-gray-400 text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Artikel tidak ditemukan' : 'Belum ada artikel'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Artikel akan muncul di sini'}
            </p>
          </div>
        )}
      </div>

      {/* Popup Modal - Image fix */}
      {isPopupOpen && selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div
            className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col transform transition-all duration-300 ${
              isPopupVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-5'
            }`}
          >
            <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 text-white flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm opacity-90 mb-2 sm:mb-3">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-user"></i>
                        <span className="hidden sm:inline">
                          {selectedNews.author?.klName || selectedNews.author?.fullName || selectedNews.author?.email || 'Kemenko PMK'}
                        </span>
                        <span className="sm:hidden">{selectedNews.author?.klName || 'PMK'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-calendar"></i>
                        <span className="hidden sm:inline">
                          {new Date(selectedNews.newsDate || selectedNews.createdAt).toLocaleDateString('id-ID')}
                        </span>
                        <span className="sm:hidden">
                          {new Date(selectedNews.newsDate || selectedNews.createdAt).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <i className="fas fa-clock"></i>
                        {selectedNews.readTime || '3 menit'}
                      </span>
                      {selectedNews.views > 0 && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-eye"></i>
                          {selectedNews.views} views
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight pr-2 sm:pr-4">
                      {selectedNews.title}
                    </h2>
                  </div>
                  <button 
                    onClick={closePopup} 
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition flex-shrink-0"
                  >
                    <i className="fas fa-times text-lg sm:text-xl"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* ✅ POPUP IMAGE - COMPLETELY FIXED WITH DEBUG */}
                {(() => {
                  const imageUrl = getImageUrl(selectedNews);
                  if (imageUrl) {
                    return (
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt={selectedNews.title}
                          className="rounded-xl lg:rounded-2xl object-cover w-full h-40 sm:h-48 md:h-64 lg:h-80 shadow-lg"
                          onError={(e) => {
                            console.log('❌ Popup image failed to load:', {
                              articleId: selectedNews._id,
                              imageUrl: imageUrl,
                              error: e
                            });
                          }}
                          onLoad={() => {
                            console.log('✅ Popup image loaded successfully:', {
                              articleId: selectedNews._id,
                              imageUrl: imageUrl
                            });
                          }}
                        />
                        {selectedNews.image?.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-3 sm:p-4 lg:p-6 rounded-b-xl lg:rounded-b-2xl">
                            <p className="text-xs sm:text-sm font-medium">
                              {selectedNews.image.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  // No image available - silently return null (no error logging)
                  return null;
                })()}

                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                  <div
                    className="text-gray-800 leading-relaxed text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHtml(selectedNews.content || 'Konten tidak tersedia') 
                    }}
                  ></div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 sm:pt-6 border-t border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 mr-2">Tags:</span>
                  {selectedNews.tags && selectedNews.tags.length > 0 && selectedNews.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Download PDF Button */}
                <div className="pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    onClick={() => downloadPDF(selectedNews)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <i className="fas fa-download mr-1"></i>
                    <span>Unduh PDF Lengkap</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 mr-1 sm:mr-2 flex items-center whitespace-nowrap">
                    <i className="fas fa-share-alt mr-1"></i>
                    <span className="hidden sm:inline">Bagikan:</span>
                    <span className="sm:hidden">Share:</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareToSocial('whatsapp')}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <i className="fab fa-whatsapp" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={closePopup}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <i className="fas fa-check" />
                    <span>Selesai Membaca</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      {showModal && selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedNews.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-blue-100">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{selectedNews.author?.fullName || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedNews.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{selectedNews.category || 'Umum'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {(() => {
                if (selectedNews.image) {
                  return (
                    <div className="mb-6">
                      <NewsImage
                        src={selectedNews.image}
                        alt={selectedNews.title}
                        className="w-full h-64 object-cover rounded-lg"
                        fallbackClassName="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  );
                }
                return null;
              })()}

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedNews.content || 'Konten tidak tersedia'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => downloadPDF(selectedNews)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default NewsSection;