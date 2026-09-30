/**
 * Centralized API Configuration
 * Supports:
 * 1. Production deployments on Vercel connecting to Render (via VITE_API_URL / VITE_API_BASE_URL)
 * 2. Local Docker container setup (reverse proxied via Nginx /api)
 * 3. Local direct development (defaulting to http://localhost:8000)
 */

export const getApiBaseUrl = (): string => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
  const envUrl = metaEnv?.VITE_API_URL || metaEnv?.VITE_API_BASE_URL;
  
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // If on localhost development directly on Vite dev server (port 3000 / 5173)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (window.location.port === '3000' || window.location.port === '5173') {
        return 'http://localhost:8000';
      }
      // Nginx docker container serving frontend on port 80 or similar
      return '';
    }
  }

  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
};
