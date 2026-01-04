import axios from 'axios';

const api = axios.create({
  // Use your backend URL confirmed by the heartbeat test
  baseURL: 'https://society-management-system-wis5.vercel.app', 
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