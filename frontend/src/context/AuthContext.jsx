import { createContext, useState, useEffect } from "react";
import api from "../api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const { data } = await api.get('/theme');
      if (data.themeConfig) {
        document.documentElement.style.setProperty('--theme-accent', data.themeConfig.accentColor);
        document.documentElement.style.setProperty('--theme-bg', data.themeConfig.bg);
      }
    } catch (err) {
      console.log('Using default theme');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (data.user) {
          setUser(data.user);
          fetchTheme();
        }
      } catch (e) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setUser(data.user);
      
      fetchTheme();

      return { success: true, role: data.user.role };
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      console.error("Register Error:", error);
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore if it fails, we still want to log out locally
    }
    localStorage.removeItem('token');
    setUser(null);
    document.documentElement.style.removeProperty('--theme-accent');
    document.documentElement.style.removeProperty('--theme-bg');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;