import { sanitizeHtml } from '../../utils/sanitizeHtml';
﻿import React, { useState, useEffect } from 'react';
import { useAuth } from '../../pages/contexts/AuthContext';
import { Image as ImageIcon } from 'lucide-react';
import ImageWithFallback from '../common/ImageWithFallback';

const NewsSection = ({ news }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const { user } = useAuth();

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNews(null);
  };

  const downloadPDF = () => {
    if (!selectedNews) return;

    // Create HTML content for the news
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedNews.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .meta { color: #666; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${selectedNews.title}</div>
            <div class="meta">
              <p>Oleh: ${selectedNews.author?.fullName || 'Unknown'}</p>
              <p>Tanggal: ${new Date(selectedNews.createdAt).toLocaleDateString('id-ID')}</p>
              <p>Kategori: ${selectedNews.category || 'General'}</p>
              ${selectedNews.source ? `<p>Sumber: ${selectedNews.source}</p>` : ''}
            </div>
          </div>
          <div class="content">${selectedNews.content || selectedNews.fullContent || ''}</div>
          <div class="footer">
            <p>Dokumen ini di-generate dari website PAUDHI</p>
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNews.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Function to get KL display text
  const getKLDisplay = (newsItem) => {
    if (!newsItem.author) return 'Unknown';
    
    if (newsItem.author.role === 'super_admin') {
      return 'Super Admin';
    } else if (newsItem.author.role === 'admin_kl' && newsItem.author.klName) {
      return `${newsItem.author.klName} Admin`;
    } else if (newsItem.author.role === 'admin') {
      return 'Admin';
    } else {
      return 'User';
    }
  };

  // Function to get source display
  const getSourceDisplay = (newsItem) => {
    if (newsItem.source) {
      return newsItem.source;
    } else if (newsItem.author?.klName) {
      return newsItem.author.klName;
    }
    return null;
  };

  // Filter news to only show published ones
  const publishedNews = news.filter(item => item.status === 'publish');

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Berita Terkini</h2>
          <p className="text-lg text-gray-600">Informasi terbaru seputar PAUDHI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedNews.map((item, index) => (
            <div
              key={item._id || index}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleNewsClick(item)}
            >
              {item.image && (
                <div className="h-48 overflow-hidden relative group">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    fallbackClassName="h-full"
                    fallbackText="Gambar tidak tersedia"
                    hoverEffect={true}
                  />
                </div>
              )}
              
              {/* Fallback for no image */}
              {!item.image && (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative group">
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 text-blue-300 mx-auto mb-3" />
                    <p className="text-sm text-blue-400 font-medium">Berita PAUDHI</p>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-200 rounded-full opacity-60"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-indigo-200 rounded-full opacity-60"></div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.excerpt || item.content?.substring(0, 150) || 'Tidak ada ringkasan'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                  <span className="font-medium text-blue-600">
                    {getKLDisplay(item)}
                  </span>
                </div>
                
                {/* K/L Source Display */}
                {getSourceDisplay(item) && (
                  <div className="text-sm text-blue-600 font-medium border-t border-gray-100 pt-2">
                    Sumber: {getSourceDisplay(item)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* News Detail Modal */}
        {showModal && selectedNews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedNews.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>Oleh: {selectedNews.author?.fullName || 'Unknown'}</span>
                      <span>Tanggal: {new Date(selectedNews.createdAt).toLocaleDateString('id-ID')}</span>
                      <span>Kategori: {selectedNews.category || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {getKLDisplay(selectedNews)}
                      </span>
                      {getSourceDisplay(selectedNews) && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Sumber: {getSourceDisplay(selectedNews)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 ml-4"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Image */}
                {selectedNews.image && (
                  <div className="mb-6 relative group">
                    <ImageWithFallback
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                      fallbackClassName="w-full max-h-96 rounded-lg shadow-lg"
                      fallbackText="Gambar tidak tersedia"
                      hoverEffect={true}
                    />
                    
                    {/* Image Info */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Gambar Berita
                    </div>
                  </div>
                )}
                
                {/* Fallback for no image in modal */}
                {!selectedNews.image && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
                    <ImageIcon className="w-24 h-24 text-blue-300 mx-auto mb-4" />
                    <p className="text-lg text-blue-600 font-medium">Berita PAUDHI</p>
                    <p className="text-sm text-blue-500">Informasi terbaru seputar pendidikan anak usia dini</p>
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(selectedNews.content || 'Tidak ada konten') 
                  }} />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={downloadPDF}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Unduh PDF
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;

