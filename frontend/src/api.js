import axios from 'axios';

const api = axios.create({
  // Added /api to match your backend route prefixes
  baseURL: 'https://society-management-system-wis5.vercel.app/api', 
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