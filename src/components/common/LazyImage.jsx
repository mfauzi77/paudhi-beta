import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "",
  showFallback = true,
  fallbackText = "Gambar tidak tersedia",
  fallbackIcon = true,
  hoverEffect = false,
  loading = "lazy",
  placeholder = "blur",
  quality = 75,
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
        console.log('👁️ LazyImage intersection observer:', {
          isIntersecting: entry.isIntersecting,
          src: src,
          element: entry.target
        });
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
      console.log('👁️ LazyImage: Starting to observe element for:', src);
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  // Generate WebP dan fallback URLs - menggunakan logic yang sama dengan getImageUrl
  const generateImageUrls = (rawSrc) => {
    if (!rawSrc) return { webp: null, fallback: null };
    
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      ? import.meta.env.VITE_API_URL
      : (window && window.PAUDHI_API_BASE) || import.meta.env.VITE_API_URL || '/api';
    const backendOrigin = apiBase.replace(/\/$/, '').replace(/\/api$/, '');
    
    let value = rawSrc;
    if (typeof value === 'object' && value.url) value = value.url;
    if (typeof value !== 'string') return { webp: null, fallback: null };

    // Debug logging
    console.log('🔍 LazyImage generateImageUrls called with:', {
      rawSrc: rawSrc,
      value: value,
      backendOrigin: backendOrigin
    });

    // Resolve base URL - menggunakan logic yang sama dengan getImageUrl
    let baseUrl;
    if (value.startsWith('http')) {
      // Jika localhost, ganti dengan production URL
      if (value.includes('localhost:5000')) {
        const filename = value.split('/').pop();
        baseUrl = `${backendOrigin}/uploads/news/${filename}`;
        console.log('🔄 LazyImage: Converting localhost to production URL:', baseUrl);
      } else {
        baseUrl = value;
        console.log('✅ LazyImage: Full URL image:', baseUrl);
      }
    } else if (value.startsWith('/uploads/')) {
      baseUrl = `${backendOrigin}${value}`;
      console.log('✅ LazyImage: Constructed image URL (relative /uploads):', baseUrl);
    } else if (value.startsWith('uploads/')) {
      baseUrl = `${backendOrigin}/${value}`;
      console.log('✅ LazyImage: Constructed image URL (uploads/):', baseUrl);
    } else if (value.startsWith('/')) {
      baseUrl = value;
      console.log('✅ LazyImage: Same-origin path:', baseUrl);
    } else {
      baseUrl = `${backendOrigin}/uploads/news/${value}`;
      console.log('✅ LazyImage: Constructed image URL (filename):', baseUrl);
    }

    // Generate WebP URL (jika backend support)
    const webpUrl = baseUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    return {
      webp: webpUrl,
      fallback: baseUrl
    };
  };

  const imageUrls = generateImageUrls(src);

  // Handle image error dengan fallback
  const handleImageError = () => {
    console.log('❌ LazyImage error:', {
      currentSrc: currentSrc,
      webpUrl: imageUrls.webp,
      fallbackUrl: imageUrls.fallback,
      src: src
    });
    
    if (currentSrc === imageUrls.webp && imageUrls.fallback) {
      // Coba fallback URL
      console.log('🔄 LazyImage: Trying fallback URL:', imageUrls.fallback);
      setCurrentSrc(imageUrls.fallback);
    } else {
      console.log('❌ LazyImage: All URLs failed, showing fallback');
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log('✅ LazyImage loaded successfully:', {
      currentSrc: currentSrc,
      src: src
    });
    setImageLoaded(true);
  };

  // Set initial src ketika component masuk viewport
  useEffect(() => {
    if (isInView && !currentSrc) {
      // Coba WebP dulu, fallback ke original
      const initialSrc = imageUrls.webp || imageUrls.fallback || "";
      console.log('🔄 LazyImage: Setting initial src:', {
        isInView: isInView,
        currentSrc: currentSrc,
        webpUrl: imageUrls.webp,
        fallbackUrl: imageUrls.fallback,
        initialSrc: initialSrc
      });
      setCurrentSrc(initialSrc);
    }
  }, [isInView, imageUrls.webp, imageUrls.fallback, currentSrc]);

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
          <picture>
            {/* WebP source dengan fallback */}
            {imageUrls.webp && (
              <source 
                srcSet={imageUrls.webp} 
                type="image/webp"
                onError={() => {
                  // Jika WebP gagal, gunakan fallback
                  setCurrentSrc(imageUrls.fallback);
                }}
              />
            )}
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
          </picture>
          
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

export default LazyImage;
