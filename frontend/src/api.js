import axios from 'axios';

const api = axios.create({
  // 1. UPDATED: Points to your confirmed active Vercel domain
  baseURL: 'https://society-management-system-wis5.vercel.app', 
  
  // 2. Vercel standard timeout
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