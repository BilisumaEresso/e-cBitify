// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { setUserData } from "../../services/api";
import { authAPI } from "../../services/apiHelpers";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      if (!res.data.status) return { success: false, message: res.data.message };

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      setUserData(user);
      setIsAuthenticated(true);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    try {
      setLoading(true);
      const res = await authAPI.signup(formData);
      if (!res.data.status) return { success: false, message: res.data.message };

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      setUserData(user);
      setIsAuthenticated(true);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  // Update name / email
  const updateProfile = async ({ name, email }) => {
    try {
      const res = await authAPI.updateProfile({ name, email });
      if (!res.data.status) return { success: false, message: res.data.message };
      // backend returns a new token; re-fetch profile to get fresh user object
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Update failed" };
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await authAPI.changePassword({ oldPassword, newPassword });
      if (!res.data.status) return { success: false, message: res.data.message };
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Password change failed" };
    }
  };

  // Refresh user object from server
  const fetchUserProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.data.user) {
        setUser(res.data.user);
        setUserData(res.data.user);
      }
    } catch {
      // silent — token may have expired; interceptor handles 401
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        // role helpers used in Navbar
        isSeller: user?.role === 2,
        isAdmin: user?.role === 3,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
