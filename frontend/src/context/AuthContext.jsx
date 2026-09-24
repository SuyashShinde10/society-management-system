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
      // SECURITY: We rely solely on the httpOnly cookie set by the backend.
      // Do NOT use localStorage for token storage — it is XSS-accessible.
      // The api instance has `withCredentials: true` so the cookie is sent automatically.
      try {
        const { data } = await api.get('/auth/me');
        if (data.user) {
          setUser(data.user);
          fetchTheme();
        }
      } catch {
        // 401 is handled by the response interceptor in api.js
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // SECURITY: Do NOT store token in localStorage (XSS risk).
      // The backend sets an httpOnly cookie automatically — we just read the user from the response.
      setUser(data.user);
      fetchTheme();
      return { success: true, role: data.user.role };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore if it fails — we still clear local state below
    }
    setUser(null);
    document.documentElement.style.removeProperty('--theme-accent');
    document.documentElement.style.removeProperty('--theme-bg');
  };

  /** Derived auth flag — use this instead of checking `user !== null` everywhere */
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;