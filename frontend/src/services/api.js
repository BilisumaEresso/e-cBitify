// src/services/api.js
import axios from "axios";

// Base URL - change this to match your backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Create axios instance

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      logout();
    }
    return Promise.reject(error);
  }
);

/* -------------------- Auth Helpers -------------------- */

// Safely set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// Safely set user data
// src/services/api.js

export const setUserData = (user) => {
  if (!user) {
    localStorage.removeItem("user");
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt:user.createdAt
    })
  );
};


// Safely get user data
export const getUserData = () => {
  const user = localStorage.getItem("user");
  if (!user || user === "undefined") return null;

  try {
    return JSON.parse(user);
  } catch (e) {
    console.error("Failed to parse user data from localStorage:", e);
    localStorage.removeItem("user"); // cleanup
    return null;
  }
};

// Get auth token
export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
};

// Logout helper (clear everything and redirect)
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Export axios instance
export default api;
