// src/services/apiHelpers.js
import axios from "axios";
import api from "./api";
import { getAuthToken } from "./api"; // adjust path if needed

/* =========================
   AUTH ENDPOINTS
   NOTE: Token is attached via Axios interceptor
========================= */
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),

  signup: (userData) => api.post("/auth/signup", userData),

  updateProfile: (profileData) => api.put("/auth/update", profileData),

  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),

  // Protected endpoint: returns authenticated user's profile
  getProfile: () => api.get("/auth"),
};

/* =========================
   PRODUCT ENDPOINTS
========================= */
export const productAPI = {
  getAll: () => api.get("/product"),

  add: (productData) => api.post("/product", productData),

  getById: (id) => api.get(`/product/${id}`),

  getByCategory: (categoryId) => api.get(`/product/category/${categoryId}`),

  aiSearch: (query) => api.get(`/product/ai-search?q=${query}`),

  search: (query) => api.get(`/product?q=${encodeURIComponent(query)}`),

  update: (id, data) => api.put(`/product/${id}`, data),

  delete: (id) => api.delete(`/product/${id}`),

  addReview: (productId, reviewData) =>
    api.post(`/product/${productId}/review`, reviewData),

  getReview: (productId) => api.get(`/product/${productId}/reviews`),

  getUserReview: (productId) => api.get(`/product/${productId}/review`),

  deleteReview: (productId) => api.delete(`/product/${productId}/review`),

  // Upload images to existing product
  uploadImages: async (productId, formData, config = {}) => {
    const token = getAuthToken();

    return api.post(`/product/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...config,
    });
  },

  // Delete photo from product
  deletePhoto: (productId, photoId) => api.delete(`/product/${productId}/images/${photoId}`),
};

/* =========================
   CATEGORY ENDPOINTS
========================= */
export const categoryAPI = {
  getAll: () => api.get("/category"),

  delete: (categoryId) => api.delete(`/category/${categoryId}`),

  update: (categoryId, categoryData) =>
    api.put(`/category/${categoryId}`, categoryData),

  add: (categoryData) => api.post("/category", categoryData),
};

/* =========================
   AI ENDPOINTS
   GET  -> read trends
   POST -> regenerate trends
========================= */
export const aiAPI = {
  getRecommendations: () => api.get("/ai/recommend"),

  getTrends: () => api.get("/ai/trends"),

  generateTrends: () => api.post("/ai/trends"),
};

/* =========================
   CART ENDPOINTS
   item = { productId, quantity }
========================= */
export const cartAPI = {
  getCart: () => api.get("/cart/user"),

  addToCart: (item) => api.post("/cart", item),

  updateCartItem: (itemId, quantity) =>
    api.patch(`/cart/${itemId}`, { newQuantity: quantity }),

  removeFromCart: (itemId) => api.delete(`/cart/product/${itemId}`),

  clearCart: () => api.delete("/cart"),
};

/* =========================
   ORDER ENDPOINTS
========================= */
// existing orderAPI block — replace the whole export with this:
export const orderAPI = {
  getAll: () => api.get("/order"),

  getById: (id) => api.get(`/order/${id}`),

  getSellerOrders: () => api.get("/order/seller/all"),

  create: (orderData) => api.post("/order", orderData),

  cancel: (orderId) => api.patch(`/order/cancel/${orderId}`),

  updateStatus: (orderId, status) => api.patch(`/order/status/${orderId}`, { status }),

  // Chapa
  initiateChapa: (orderId) => api.post("/order/payment/chapa/initialize", { id: orderId }),

  verifyChapa: (txRef) => api.get(`/order/payment/chapa/verify/${txRef}`),
};

/* =========================
   ADMIN ENDPOINTS (role 3)
========================= */
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),

  getAnalytics: () => api.get("/admin/analytics"),

  getUsers: () => api.get("/admin/users"),

  getAdmins: () => api.get("/admin/admins"),

  getOrders: () => api.get("/admin/orders"),

  createAdmin: (data) => api.post("/admin/add-admin", data),

  banUser: (userId, banned) => api.post(`/admin/users/${userId}/ban`, { banned }),

  changeRole: (userId, role) => api.post(`/admin/users/${userId}/role`, { role }),

  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  getSettings: () => api.get("/admin/settings"),

  updateSettings: (data) => api.put("/admin/settings", data),
};
