import axios from 'axios';

const api = axios.create({
  // This must match the URL provided by Vercel for your BACKEND project
  baseURL: 'https://society-management-system-wis5.vercel.app', 
  withCredentials: true, // Important for CORS if using cookies/sessions
  timeout: 10000, 
});

// Request Interceptor to add Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor (Optional but recommended for debugging 404/500 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;