import axios from 'axios';

const api = axios.create({
  // Ensure this matches your Vercel Backend exactly
  baseURL: 'https://mental-wellbeing-app-sandy.vercel.app/api',
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json'
  }
});

// REQUEST: Attach Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: Catch the REAL error message from the backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for the developer to see in the console
    console.error("// NETWORK_TRACE:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;