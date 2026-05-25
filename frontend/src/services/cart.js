import { api } from "./api";

export const cartService = {
  // Get user's cart
  getUserCart: async () => {
    try {
      const response = await api.get("/cart/user");
      return response;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post("/cart/", { productId, quantity });
      return response;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      return response;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  // Update item quantity in cart
  updateCartItem: async (productId, newQuantity) => {
    try {
      const response = await api.patch(`/cart/${productId}`, { newQuantity });
      return response;
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete("/cart/");
      return response;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },
};
