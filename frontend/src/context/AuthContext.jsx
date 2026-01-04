import { createContext, useState, useEffect } from "react";
// 1. CHANGE: Import the central 'api' instance instead of 'axios' directly
import api from "../api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. REMOVED: const API_BASE_URL = "https://mental-wellbeing-app-sandy.vercel.app/api"; 
  // We don't need this anymore because 'api.js' already knows the URL.

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo && userInfo !== "undefined") {
      try {
        setUser(JSON.parse(userInfo));
      } catch (e) {
        localStorage.removeItem("userInfo");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 3. CHANGE: Use 'api.post' and remove the full URL prefix
      const { data } = await api.post('/auth/login', { email, password });
      
      setUser(data.user);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error); // Added for debugging
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const register = async (userData) => {
    try {
      // 4. CHANGE: Use 'api.post' here too
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      console.error("Register Error:", error); // Added for debugging
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
    // Optional: Reload page to clear any memory states
    // window.location.reload(); 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;