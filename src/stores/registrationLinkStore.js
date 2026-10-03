import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useRegistrationLinkStore = create((set, get) => ({
  links: [],
  bonusRules: {
    welcomeBonus: 500,
    referrerBonus: 1000,
    isReferralActive: true,
  },
  isLoading: false,
  isGenerating: false,
  isUpdatingRules: false,

  // Fetch bonus rules configuration
  fetchBonusRules: async () => {
    try {
      const res = await apiClient.get('/admin/registration-links/bonus-rules');
      if (res.data?.success && res.data?.data) {
        set({ bonusRules: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch bonus rules:', err);
    }
  },

  // Update bonus rules configuration
  updateBonusRules: async (payload) => {
    set({ isUpdatingRules: true });
    try {
      const res = await apiClient.put('/admin/registration-links/bonus-rules', payload);
      if (res.data?.success) {
        set({ bonusRules: res.data.data });
        toast.success(res.data.message || 'Bonus rules updated successfully!');
        get().fetchLinks();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bonus rules');
      return false;
    } finally {
      set({ isUpdatingRules: false });
    }
  },

  // Fetch all generated registration links
  fetchLinks: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/registration-links');
      if (res.data?.success) {
        set({ links: res.data.data || [], isLoading: false });
      }
    } catch (err) {
      console.error('Failed to fetch registration links:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch registration links');
      set({ isLoading: false });
    }
  },

  // Generate a new user registration link
  generateUserLink: async () => {
    set({ isGenerating: true });
    try {
      const res = await apiClient.post('/admin/registration-links/generate', {});
      if (res.data?.success) {
        toast.success('Registration link generated successfully!');
        const newLink = res.data.data;
        set(state => ({
          links: [newLink, ...state.links]
        }));
        return newLink;
      }
      return null;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate link');
      return null;
    } finally {
      set({ isGenerating: false });
    }
  },

  // Toggle active/inactive status of a link
  toggleLinkStatus: async (id) => {
    try {
      const res = await apiClient.patch(`/admin/registration-links/${id}/toggle-status`);
      if (res.data?.success) {
        const updated = res.data.data;
        set(state => ({
          links: state.links.map(l => l._id === id ? updated : l)
        }));
        toast.success(res.data.message || 'Status updated');
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
      return false;
    }
  },

  // Delete a link
  deleteLink: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/registration-links/${id}`);
      if (res.data?.success) {
        set(state => ({
          links: state.links.filter(l => l._id !== id)
        }));
        toast.success('Registration link deleted successfully');
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete link');
      return false;
    }
  },
}));
