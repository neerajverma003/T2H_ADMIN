// stores/userStore.js
import { create } from "zustand";
import { toast } from "react-toastify";
import { apiClient } from "./authStores"; // Assuming authStore is in the same directory

export const useUserStore = create((set, get) => ({
  users: [],
  isLoadingUsers: false,
  isSubmitting: false,
  isDeleting: false,

  // Fetch all usersa
  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await apiClient.get("/admin/get-admin-user");
      set({ users: res.data?.adminUser || [] });
    } catch (err) {
      toast.error("Failed to fetch users.");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  // Add user
  addUser: async (formData) => {
    if (!formData.username || !formData.password) {
      toast.error("Please fill in both username and password.");
      return;
    }
    set({ isSubmitting: true });
    try {
      const res = await apiClient.post("/admin/add-user", formData);
      // console.log(res.data);
      toast.success(res.data?.msg || "User added successfully!");
      await get().fetchUsers(); // Refresh user list
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.msg || "Error adding user.";
      toast.error(msg);
      throw err; // Re-throw error to handle it in the component if needed
    } finally {
      set({ isSubmitting: false });
    }
  },

  // Delete user
  deleteUser: async (userId, username) => {
    set({ isDeleting: true });
    try {
      const res = await apiClient.delete(`/admin/delete-user/${userId}`);
      console.log(res.data);
      toast.success(res.data?.msg || `User "${username}" deleted successfully!`);
      await get().fetchUsers();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Failed to delete user.";
      toast.error(msg);
      throw err; // if you want the calling component to know about the failure
    } finally {
      set({ isDeleting: false });
    }
  }

}));