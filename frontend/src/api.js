import axios from 'axios';

// ✅ FIX: Ensure this ends with '/api'
const PRODUCTION_URL = 'https://society-management-system-flame.vercel.app/api'; 

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: IS_LOCAL ? 'http://localhost:5000/api' : PRODUCTION_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;