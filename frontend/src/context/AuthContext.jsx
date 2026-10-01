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
    } catch {
      console.log('Using default theme');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      // Supports both httpOnly cookies and Bearer tokens for cross-origin deployments.
      try {
        const { data } = await api.get('/auth/me');
        if (data.user) {
          setUser(data.user);
          fetchTheme();
        }
      } catch (err) {
        // If 401, try to refresh using the refresh token (from cookie or storage)
        if (err?.response?.status === 401) {
          try {
            const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            const refreshRes = await api.post('/auth/refresh', storedRefreshToken ? { refreshToken: storedRefreshToken } : {});
            if (refreshRes.data?.token && typeof window !== 'undefined') {
              localStorage.setItem('token', refreshRes.data.token);
              if (refreshRes.data.refreshToken) {
                localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
              }
            }
            const { data } = await api.get('/auth/me');
            if (data.user) {
              setUser(data.user);
              fetchTheme();
            }
          } catch {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            }
            setUser(null);
          }
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      if (data.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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