import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "",
  showFallback = true,
  fallbackText = "Gambar tidak tersedia",
  fallbackIcon = true,
  hoverEffect = false,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Resolve src robustly
  const resolveSrc = (raw) => {
   const apiBase =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : `${window.location.origin}/api`;
// Ambil origin backend (tanpa /api)
const backendOrigin = apiBase.replace(/\/api$/, "");
    if (!raw) return null;
    let value = raw;
    if (typeof value === 'object' && value.url) value = value.url;
    if (typeof value !== 'string') return null;
    if (value.startsWith('http')) return value;
    if (value.startsWith('/uploads/')) return `${backendOrigin}${value}`;
    if (value.startsWith('uploads/')) return `${backendOrigin}/${value}`;
    if (value.startsWith('/')) return value; // other absolute path on same origin
    if (value.includes('/uploads/')) return `${backendOrigin}/${value.replace(/^\//,'')}`; // relative stored path
    // fallback: assume filename
    return `${backendOrigin}/uploads/news/${value}`;
  };

  const buildCandidates = (raw) => {
    const candidates = [];
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
      ? import.meta.env.VITE_API_URL
      : (window && window.PAUDHI_API_BASE) || import.meta.env.VITE_API_URL || '/api';
    const backendOrigin = apiBase.replace(/\/$/, '').replace(/\/api$/, '');
    if (!raw) return candidates;
    let value = raw;
    if (typeof value === 'object' && value.url) value = value.url;
    if (typeof value !== 'string') return candidates;
    // Full URL first, tapi cek localhost
    if (value.startsWith('http')) {
      // Jika localhost, ganti dengan production URL
      if (value.includes('localhost:5000')) {
        const filename = value.split('/').pop();
        const productionUrl = `${backendOrigin}/uploads/news/${filename}`;
        console.log('🔄 ImageWithFallback: Converting localhost to production URL:', productionUrl);
        candidates.push(productionUrl);
      } else {
        candidates.push(value);
      }
    }
    // Relative /uploads
    if (value.startsWith('/uploads/')) candidates.push(`${backendOrigin}${value}`);
    // uploads/... path
    if (value.startsWith('uploads/')) candidates.push(`${backendOrigin}/${value}`);
    // Bare filename fallback
    candidates.push(`${backendOrigin}/uploads/news/${value.replace(/^\//,'')}`);
    // Same-origin fallbacks (in case backend is reverse-proxied)
    if (value.startsWith('/uploads/')) candidates.push(value);
    if (value.startsWith('uploads/')) candidates.push(`/${value}`);
    return Array.from(new Set(candidates));
  };

  const candidates = buildCandidates(src);

  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setCurrentSrc(candidates[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(candidates)]);

  const shouldShowImage = !!currentSrc && !imageError;

  return (
    <div className={`relative ${hoverEffect ? 'group' : ''}`}>
      {(!src || imageError || !shouldShowImage) ? (
        showFallback ? (
          <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName}`}>
            <div className="text-center">
              {fallbackIcon && <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />}
              <p className="text-xs text-gray-500">{fallbackText}</p>
            </div>
          </div>
        ) : null
      ) : (
        <>
          <img
            src={currentSrc}
            alt={alt}
            className={`${className} ${hoverEffect ? 'transition-transform duration-300 group-hover:scale-105' : ''}`}
            onError={(e) => {
              // Try next candidate if exists
              const idx = candidates.indexOf(currentSrc);
              const next = candidates[idx + 1];
              if (next) {
                setCurrentSrc(next);
                return;
              }
              handleImageError();
            }}
            onLoad={handleImageLoad}
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

export default ImageWithFallback;

