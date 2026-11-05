// src/components/EducationSection/VideoIntegratif.jsx - UPDATED FOR API
import React, { useRef } from 'react';

const VideoIntegratif = ({ onItemClick, data = [], loading = false, error = null, onRefresh, onItemDownload }) => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Memuat video...</span>
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
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
        <div className="text-gray-300 text-6xl mb-4">🎥</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Video</h3>
        <p className="text-gray-600 text-center">Video integratif akan ditampilkan di sini</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Swipe Indicator */}
      <div className="flex justify-center mb-4 sm:hidden">
        <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      {/* Container with Navigation */}
      <div className="relative flex items-center">
        {/* Left Navigation Button */}
        {data.length > 3 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl -translate-x-3 hidden sm:flex"
            aria-label="Scroll Left"
          >
            <i className="fas fa-chevron-left text-sm lg:text-base"></i>
          </button>
        )}

        {/* Right Navigation Button */}
        {data.length > 3 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white items-center justify-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 shadow-xl translate-x-3 hidden sm:flex"
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
            <VideoCard 
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
                className="w-2 h-2 rounded-full bg-red-300 opacity-60"
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

const VideoCard = React.memo(({ item, onItemClick, onItemDownload }) => {
  const handleClick = () => {
    onItemClick(item);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onItemClick(item);
    }
  };

  const handlePlayVideo = (event) => {
    event.stopPropagation();
    if (onItemDownload) {
      onItemDownload(item); // Track as view
    }
    // Buka video di tab baru
    window.open(`https://www.youtube.com/watch?v=${item.youtubeId}`, '_blank');
  };

  return (
    <article 
      className="group bg-white rounded-xl lg:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 lg:hover:-translate-y-2 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-red-500 min-h-[280px] sm:min-h-[320px] lg:min-h-[400px] flex flex-col flex-shrink-0 w-64 sm:w-80 lg:w-96"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Tonton video: ${item.title}`}
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="relative h-24 sm:h-32 lg:h-48 bg-gray-900 overflow-hidden flex-shrink-0">
        <img 
          src={item.thumbnail || `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayVideo}
            className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Play video ${item.title}`}
          >
            <i className="fas fa-play text-white text-xs sm:text-sm lg:text-xl ml-0.5 sm:ml-1" aria-hidden="true"></i>
          </button>
        </div>
        <div className="absolute bottom-1 sm:bottom-2 lg:bottom-4 right-1 sm:right-2 lg:right-4 bg-black/80 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold">
          {item.duration || '00:00'}
        </div>
        <div className="absolute top-1 sm:top-2 lg:top-4 left-1 sm:left-2 lg:left-4">
          <span className="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
        <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
          {item.title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 lg:mb-4 leading-relaxed line-clamp-2 lg:line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {/* Channel and Expert - Hidden on mobile for space */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 truncate">
              <i className="fas fa-play-circle" aria-hidden="true"></i>
              <span className="truncate">{item.channel || item.author}</span>
            </span>
            <span className="flex items-center gap-1 truncate hidden lg:flex">
              <i className="fas fa-user-tie" aria-hidden="true"></i>
              <span className="truncate">{item.expert || 'Expert'}</span>
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <i className="fas fa-eye" aria-hidden="true"></i>
              <span className="hidden sm:inline">{(item.views || 0).toLocaleString()}</span>
              <span className="sm:hidden">{((item.views || 0) / 1000).toFixed(0)}k</span>
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-thumbs-up" aria-hidden="true"></i>
              <span className="hidden sm:inline">{(item.likes || 0).toLocaleString()}</span>
              <span className="sm:hidden">{((item.likes || 0) / 1000).toFixed(0)}k</span>
            </span>
          </div>

          {/* Play Button */}
          <button 
            onClick={handlePlayVideo}
            className="w-full bg-red-600 text-white py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-xs sm:text-sm"
            aria-label={`Tonton video ${item.title}`}
          >
            <i className="fas fa-play" aria-hidden="true"></i>
            <span className="hidden sm:inline">Tonton Video</span>
            <span className="sm:hidden">Play</span>
          </button>
        </div>
      </div>
    </article>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoIntegratif;