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
  // SECURITY: withCredentials is required for the httpOnly auth cookie to be
  // sent on cross-origin requests. Do NOT store the JWT in localStorage.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -------------------------------------------------------
// Request interceptor: Attach JWT token if available.
// This supports cross-origin deployments where third-party
// cookies may be blocked by modern browser privacy policies.
// -------------------------------------------------------
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
// Auto-logout on 401 — clears stale/expired sessions and
// redirects the user to the login page automatically.
// -------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear token on 401 unless on login or checking initial auth status
        if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/me')) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;