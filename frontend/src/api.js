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
// NOTE: No request interceptor needed for token attachment.
// The httpOnly cookie is automatically sent by the browser
// on every request because `withCredentials: true` is set.
// Adding a manual Authorization header here would duplicate
// the token and re-introduce XSS risk via localStorage.
// -------------------------------------------------------

// -------------------------------------------------------
// Auto-logout on 401 — clears stale/expired sessions and
// redirects the user to the login page automatically.
// -------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Only redirect if not already on an auth page and not fetching initial auth state
        if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/me')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;