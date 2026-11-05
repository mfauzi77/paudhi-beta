// Prefer relative "/api" in development too (proxied by Vite),
// but allow overriding with VITE_API_URL when needed (e.g., testing on devices)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || 
  "/api";
