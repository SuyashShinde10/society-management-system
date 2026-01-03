import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Automatically add the Token to every request (if it exists)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;