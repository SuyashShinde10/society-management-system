import axios from 'axios';

const api = axios.create({
  // 1. UPDATE THIS to your new Vercel Backend URL
  // Ensure it includes '/api' at the end if your routes require it
  baseURL: 'https://society-management-system-wis5-backend.vercel.app/api', 
  
  // 2. Vercel is much faster than Render's free tier, 
  // but a 10s timeout is a safe industrial standard.
  timeout: 10000, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;