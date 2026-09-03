import axios from 'axios';

// -------------------------------------------------------
// API base URL — driven by Vite env vars.
// Set VITE_API_URL in frontend/.env.production for production.
// Falls back to localhost for local dev.
// -------------------------------------------------------
let baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  if (import.meta.env.PROD) {
    console.error('CRITICAL ERROR: VITE_API_URL is missing in production environment. API requests will fail.');
  }
  baseURL = 'http://localhost:5000/api/v1';
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------------------
// Auto-logout on 401 — clears stale/expired tokens and
// redirects the user to the login page automatically.
// -------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Only redirect if not already on an auth page and not fetching auth state
        if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/me')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;