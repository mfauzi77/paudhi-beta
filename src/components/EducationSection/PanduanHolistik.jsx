// src/components/EducationSection/PanduanHolistik.jsx - UPDATED FOR API
import React, { useRef } from 'react';
import ImageWithFallback from '../common/ImageWithFallback';

const PanduanHolistik = ({ onItemClick, data = [], loading = false, error = null, onRefresh, onItemDownload }) => {
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.offsetWidth || 300;
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
      const cardWidth = container.children[0]?.offsetWidth || 300;
      const gap = window.innerWidth >= 640 ? 24 : 16;
      container.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Memuat panduan...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Coba Lagi
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-300 text-6xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Panduan</h3>
        <p className="text-gray-600 text-center">Panduan holistik akan ditampilkan di sini</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Swipe Indicator */}
      <div className="flex justify-center mb-4 sm:hidden">
        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      {/* Container with Navigation */}
      <div className="relative flex items-center">
        {/* Left Navigation Button */}
        {data.length > 3 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl -translate-x-3 hidden sm:flex"
            aria-label="Scroll Left"
          >
            <i className="fas fa-chevron-left text-sm lg:text-base"></i>
          </button>
        )}

        {/* Right Navigation Button */}
        {data.length > 3 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl translate-x-3 hidden sm:flex"
            aria-label="Scroll Right"
          >
            <i className="fas fa-chevron-right text-sm lg:text-base"></i>
          </button>
        )}

        {/* Cards Container - Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-1 ${
            data.length > 3 ? 'sm:mx-16 lg:mx-20' : ''
          }`}
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollPaddingLeft: '16px',
            scrollPaddingRight: '16px'
          }}
        >
          {data.map((item) => (
            <PanduanCard 
              key={item._id || item.id} 
              item={item} 
              onItemClick={onItemClick}
              onItemDownload={onItemDownload}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicators */}
      {data.length > 3 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: Math.max(1, data.length - 2) }, (_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-300 opacity-60"
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 640px) {
          .scrollbar-hide {
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

const PanduanCard = React.memo(({ item, onItemClick, onItemDownload }) => {
  const handleClick = () => {
    onItemClick(item);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onItemClick(item);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (onItemDownload) {
      onItemDownload(item);
    }
    if (item.pdfUrl) {
      window.open(item.pdfUrl, '_blank');
    }
  };

  return (
    <article 
      className="group bg-white rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 lg:hover:-translate-y-2 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] flex flex-col flex-shrink-0 w-64 sm:w-80 lg:w-96"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Buka detail panduan: ${item.title}`}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative h-24 sm:h-32 lg:h-48 overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={item.thumbnail || item.thumbnailUrl}
          alt={item.title || "Panduan Holistik"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          hoverEffect={true}
        />
        <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4">
          <span className="bg-blue-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
            {item.category}
          </span>
        </div>
        <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1">
          <div className="flex items-center gap-1 text-amber-500">
            <i className="fas fa-star text-xs sm:text-sm" aria-hidden="true"></i>
            <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.rating || '4.5'}</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
        <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 leading-relaxed line-clamp-2 lg:line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {/* Author and Date - Hidden on mobile for space */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 truncate">
              <i className="fas fa-user" aria-hidden="true"></i>
              <span className="truncate">{item.author}</span>
            </span>
            <span className="flex items-center gap-1 hidden lg:flex">
              <i className="fas fa-calendar" aria-hidden="true"></i>
              {item.publishDate ? new Date(item.publishDate).getFullYear() : '2025'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <i className="fas fa-file-alt" aria-hidden="true"></i>
              <span className="hidden sm:inline">{item.pages || 'N/A'} hal</span>
              <span className="sm:hidden">{item.pages || 'N/A'}</span>
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-download" aria-hidden="true"></i>
              <span className="hidden sm:inline">{(item.downloads || 0).toLocaleString()}</span>
              <span className="sm:hidden">{((item.downloads || 0) / 1000).toFixed(0)}k</span>
            </span>
          </div>

          {/* Download Button */}
          <button 
            onClick={handleDownload}
            className="w-full bg-blue-600 text-white py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs sm:text-sm"
            aria-label={`Download panduan ${item.title}`}
          >
            <i className="fas fa-download" aria-hidden="true"></i>
            <span className="hidden sm:inline">{item.pdfUrl ? 'Buka PDF' : 'Download'}</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </article>
  );
});

PanduanCard.displayName = 'PanduanCard';

export default PanduanHolistik;