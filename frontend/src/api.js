import axios from 'axios';

const api = axios.create({
  // REPLACE this with your actual Render URL (e.g., https://your-app.onrender.com/api)
  baseURL: 'https://society-backend-api-w7dz.onrender.com', 
  timeout: 30000, // Render "Free Tier" takes 30+ seconds to wake up
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;