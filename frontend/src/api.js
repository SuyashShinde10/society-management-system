import axios from 'axios';

// If we are in production (deployed), use the Live Backend URL.
// If we are in development (local), use localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 
// Note: If you used 'Create React App' instead of Vite, use process.env.REACT_APP_API_URL

const api = axios.create({
  baseURL: API_URL, 
});

// ... (Keep your interceptors for tokens as they are) ...

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;