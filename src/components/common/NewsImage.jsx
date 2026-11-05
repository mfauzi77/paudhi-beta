import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const NewsImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "",
  showFallback = true,
  fallbackText = "Gambar tidak tersedia",
  fallbackIcon = true,
  hoverEffect = false,
  loading = "lazy",
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const imgRef = useRef(null);

  // Intersection Observer untuk lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Enhanced image URL resolver with better error handling
  const getImageUrl = (rawSrc) => {
    if (!rawSrc) {
      console.log('❌ NewsImage: No image source provided');
      return null;
    }
    
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
    console.log('🔍 NewsImage getImageUrl:', {
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
              console.log('✅ NewsImage: Normalized absolute URL:', normalized);
              return normalized;
            }
          }
          console.log('✅ NewsImage: Using absolute URL as-is:', rawSrc);
          return rawSrc;
        } catch (e) {
          console.warn('⚠️ NewsImage: Invalid URL format, treating as relative:', rawSrc);
        }
      }
      
      // Relative path starting with /uploads/
      if (rawSrc.startsWith('/uploads/')) {
        const imageUrl = `${backendOrigin}${rawSrc}`;
        console.log('✅ NewsImage: Constructed from /uploads/ path:', imageUrl);
        return imageUrl;
      }
      
      // Relative path starting with uploads/ (no leading slash)
      if (rawSrc.startsWith('uploads/')) {
        const imageUrl = `${backendOrigin}/${rawSrc}`;
        console.log('✅ NewsImage: Constructed from uploads/ path:', imageUrl);
        return imageUrl;
      }
      
      // Just filename - assume it's in news folder
      if (!rawSrc.includes('/') && !rawSrc.startsWith('http')) {
        const imageUrl = `${backendOrigin}/uploads/news/${rawSrc}`;
        console.log('✅ NewsImage: Constructed from filename:', imageUrl);
        return imageUrl;
      }
      
      // Try to construct from any other relative path
      const imageUrl = rawSrc.startsWith('/') 
        ? `${backendOrigin}${rawSrc}`
        : `${backendOrigin}/${rawSrc}`;
      console.log('✅ NewsImage: Constructed from relative path:', imageUrl);
      return imageUrl;
    }

    // Handle object format (from upload response)
    if (typeof rawSrc === 'object' && rawSrc !== null) {
      console.log('⚠️ NewsImage: Image is object, extracting URL:', rawSrc);
      
      // Try url property first
      if (rawSrc.url && typeof rawSrc.url === 'string') {
        return getImageUrl(rawSrc.url); // Recursively process the URL
      }
      
      // Try relativePath property
      if (rawSrc.relativePath && typeof rawSrc.relativePath === 'string') {
        return getImageUrl(rawSrc.relativePath); // Recursively process
      }
      
      // Try filename property
      if (rawSrc.filename && typeof rawSrc.filename === 'string') {
        return getImageUrl(rawSrc.filename); // Recursively process
      }
    }

    console.error('❌ NewsImage: Could not resolve image URL for:', rawSrc);
    return null;
  };

  // Set initial src ketika component masuk viewport
  useEffect(() => {
    if (isInView && !currentSrc) {
      const imageUrl = getImageUrl(src);
      console.log('🔄 NewsImage: Setting initial src:', {
        isInView: isInView,
        src: src,
        imageUrl: imageUrl
      });
      setCurrentSrc(imageUrl || "");
    }
  }, [isInView, src, currentSrc]);

  // Handle image error
  const handleImageError = () => {
    console.log('❌ NewsImage error:', {
      currentSrc: currentSrc,
      src: src
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ NewsImage loaded successfully:', {
      currentSrc: currentSrc,
      src: src
    });
    setImageLoaded(true);
  };

  const shouldShowImage = !!currentSrc && !imageError && isInView;

  return (
    <div 
      ref={imgRef}
      className={`relative ${hoverEffect ? 'group' : ''}`}
    >
      {(!src || imageError || !shouldShowImage) ? (
        showFallback ? (
          <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName}`}>
            <div className="text-center">
              {fallbackIcon && <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />}
              <p className="text-xs text-gray-500">{fallbackText}</p>
            </div>
          </div>
        ) : (
          // Placeholder saat belum masuk viewport
          <div className={`bg-gray-100 animate-pulse ${className}`}>
            <div className="w-full h-full bg-gray-200 rounded"></div>
          </div>
        )
      ) : (
        <>
          <img
            src={currentSrc}
            alt={alt}
            className={`${className} ${hoverEffect ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading={loading}
            decoding="async"
            {...props}
          />
          
          {/* Loading state */}
          {!imageLoaded && !imageError && currentSrc ? (
            <div className="absolute inset-0 bg-gray-100/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            </div>
          ) : null}
          
          {/* Hover overlay */}
          {hoverEffect && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <ImageIcon className="w-4 h-4 text-gray-700" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsImage;
