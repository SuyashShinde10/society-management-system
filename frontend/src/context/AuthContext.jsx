import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 1. Check if user is already logged in (when page loads)
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      setUser(data.user);
      // Save token and user info to browser storage
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  // 3. Register Function
  const register = async (userData) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;