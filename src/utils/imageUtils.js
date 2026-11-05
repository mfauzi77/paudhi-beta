// utils/imageUtils.js - Helper untuk handle image URLs
import { API_BASE_URL } from './api'; // import dari utils/api.js

/**
 * Dapatkan origin backend dari API_BASE_URL atau window.location.origin jika relative
 */
const getBackendOrigin = () => {
  try {
    if (API_BASE_URL && /^https?:\/\//i.test(API_BASE_URL)) {
      return API_BASE_URL.replace(/\/$/, '').replace(/\/api$/, '');
    }
    // Relative '/api' → gunakan origin situs saat ini
    return window.location.origin;
  } catch (e) {
    return window.location.origin;
  }
};

/**
 * Normalisasi URL absolut: jika origin berbeda (localhost/127.0.0.1) dan path /uploads,
 * ganti ke origin backend agar sesuai CSP (https)
 */
const normalizeAbsoluteUploadsUrl = (absUrl) => {
  try {
    const backendOrigin = getBackendOrigin();
    const u = new URL(absUrl);
    const isLocal = /localhost|127\.0\.0\.1/.test(u.hostname) || u.protocol === 'http:';
    const isUploads = u.pathname.startsWith('/uploads');
    if (isUploads && (isLocal || u.origin !== backendOrigin)) {
      return `${backendOrigin}${u.pathname}`;
    }
    return absUrl;
  } catch (e) {
    return absUrl;
  }
};

/**
 * Convert relative image URL to absolute URL
 * @param {string} imageUrl - Relative or absolute image URL
 * @returns {string|null} - Absolute image URL atau null jika kosong
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Jika data URL (base64)
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Jika sudah absolute URL (http/https), normalisasi bila perlu
  if (/^https?:\/\//i.test(imageUrl)) {
    return normalizeAbsoluteUploadsUrl(imageUrl);
  }

  const backendOrigin = getBackendOrigin();

  // Jika relative URL mulai dengan /uploads/
  if (imageUrl.startsWith('/uploads/')) {
    return `${backendOrigin}${imageUrl}`;
  }

  // Default: anggap relative path, tambahkan base URL origin
  return `${backendOrigin}/${imageUrl.replace(/^\/+/, '')}`;
};

/**
 * Check if image URL is valid and accessible
 * @param {string} imageUrl - Image URL to check
 * @returns {Promise<boolean>} - True jika image accessible
 */
export const checkImageExists = async (imageUrl) => {
  if (!imageUrl) return false;

  try {
    const response = await fetch(getImageUrl(imageUrl), { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image check failed:', imageUrl, error);
    return false;
  }
};

/**
 * Get image with fallback
 * @param {string} imageUrl - Primary image URL
 * @param {string|null} fallbackUrl - Fallback image URL
 * @returns {string|null} - Image URL yang valid
 */
export const getImageWithFallback = (imageUrl, fallbackUrl = null) => {
  const primaryUrl = getImageUrl(imageUrl);

  if (primaryUrl) return primaryUrl;
  if (fallbackUrl) return getImageUrl(fallbackUrl);

  return null;
};
