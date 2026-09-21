import { create } from "zustand";
import { toast } from "react-toastify";
import { apiClient } from "./authStores";

export const useActivityStore = create((set, get) => ({
  activities: [],
  currentActivity: null,
  isLoading: false,
  isSaving: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  filters: {
    search: "",
    destination_type: "",
    selected_destination: "",
    activity_type: "",
    status: "",
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        search: "",
        destination_type: "",
        selected_destination: "",
        activity_type: "",
        status: "",
      },
    });
  },

  // FETCH ALL ACTIVITIES (Admin with filters)
  fetchActivities: async (page = 1, customLimit = null, customSort = null) => {
    set({ isLoading: true });
    try {
      const { search, destination_type, selected_destination, activity_type, status } = get().filters;
      const currentLimit = customLimit || get().pagination?.limit || 10;
      const params = new URLSearchParams({ page: String(page), limit: String(currentLimit) });

      if (customSort) params.append("sortOrder", customSort);
      if (search) params.append("search", search);
      if (destination_type) params.append("destination_type", destination_type);
      if (selected_destination) params.append("selected_destination", selected_destination);
      if (activity_type) params.append("activity_type", activity_type);
      if (status) params.append("status", status);

      const res = await apiClient.get(`/admin/activities?${params.toString()}`);
      if (res.data?.success) {
        set({
          activities: res.data.data || [],
          pagination: res.data.pagination || { total: 0, page: 1, limit: currentLimit, totalPages: 1 },
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error(error.response?.data?.message || "Failed to load activities");
      set({ activities: [], isLoading: false });
    }
  },

  // FETCH SINGLE ACTIVITY
  fetchActivityById: async (id) => {
    set({ isLoading: true, currentActivity: null });
    try {
      const res = await apiClient.get(`/admin/activities/${id}`);
      if (res.data?.success) {
        set({ currentActivity: res.data.data, isLoading: false });
        return res.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
      toast.error(error.response?.data?.message || "Failed to load activity details");
      set({ isLoading: false });
      return null;
    }
  },

  // CREATE ACTIVITY
  createActivity: async (activityData) => {
    set({ isSaving: true });
    try {
      const res = await apiClient.post("/admin/activities", activityData);
      if (res.data?.success) {
        toast.success("Activity created successfully!");
        set({ isSaving: false });
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      console.error("Failed to create activity:", error);
      const msg = error.response?.data?.message || "Failed to create activity";
      toast.error(msg);
      set({ isSaving: false });
      return { success: false, message: msg };
    }
  },

  // UPDATE ACTIVITY
  updateActivity: async (id, activityData) => {
    set({ isSaving: true });
    try {
      const res = await apiClient.put(`/admin/activities/${id}`, activityData);
      if (res.data?.success) {
        toast.success("Activity updated successfully!");
        set({ isSaving: false });
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
      const msg = error.response?.data?.message || "Failed to update activity";
      toast.error(msg);
      set({ isSaving: false });
      return { success: false, message: msg };
    }
  },

  // DELETE ACTIVITY
  deleteActivity: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/activities/${id}`);
      if (res.data?.success) {
        toast.success("Activity deleted successfully!");
        set((state) => ({
          activities: state.activities.filter((a) => a._id !== id),
          pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) },
        }));
        return { success: true };
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
      toast.error(error.response?.data?.message || "Failed to delete activity");
      return { success: false };
    }
  },

  // TOGGLE STATUS
  toggleStatus: async (id) => {
    try {
      const res = await apiClient.patch(`/admin/activities/${id}/status`);
      if (res.data?.success) {
        toast.success(res.data.message || "Status updated");
        set((state) => ({
          activities: state.activities.map((a) =>
            a._id === id ? { ...a, status: res.data.data.status } : a
          ),
        }));
        return { success: true };
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Failed to toggle status");
      return { success: false };
    }
  },
}));
