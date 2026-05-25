import { api } from "./api";

export const profileService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get("/auth/");
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/auth/update", profileData);
      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressData) => {
    try {
      const response = await api.put("/auth/address", addressData);
      return response;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },
};
