import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useCampaignStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────
  templates: [],
  campaigns: [],
  isLoading: false,
  isSending: false,

  // ─── Template Actions ─────────────────────────────────────

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/template');
      set({ templates: res.data.templates || [], isLoading: false });
    } catch (err) {
      toast.error('Failed to load templates');
      set({ isLoading: false });
    }
  },

  createTemplate: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/admin/template', payload);
      if (res.data.success) {
        toast.success('Template created successfully!');
        get().fetchTemplates();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create template');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTemplate: async (id, payload) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.patch(`/admin/template/${id}`, payload);
      if (res.data.success) {
        toast.success('Template updated!');
        get().fetchTemplates();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update template');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (id) => {
    try {
      await apiClient.delete(`/admin/template/${id}`);
      toast.success('Template deleted');
      set((state) => ({ templates: state.templates.filter((t) => t._id !== id) }));
    } catch (err) {
      toast.error('Failed to delete template');
    }
  },

  // ─── Campaign Actions ─────────────────────────────────────

  fetchCampaigns: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/campaign');
      set({ campaigns: res.data.campaigns || [], isLoading: false });
    } catch (err) {
      toast.error('Failed to load campaigns');
      set({ isLoading: false });
    }
  },

  createCampaign: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/admin/campaign', payload);
      if (res.data.success) {
        get().fetchCampaigns();
        return res.data.campaign._id;  // Return ID so caller can trigger send
      }
      toast.error(res.data.message || 'Failed to create campaign');
      return null;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  sendCampaign: async (id) => {
    set({ isSending: true });
    try {
      const res = await apiClient.post(`/admin/campaign/${id}/send`);
      if (res.data.success) {
        toast.success('Campaign dispatched! Emails are being sent in the background.');
        get().fetchCampaigns();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send campaign');
      return false;
    } finally {
      set({ isSending: false });
    }
  },

  deleteCampaign: async (id) => {
    try {
      await apiClient.delete(`/admin/campaign/${id}`);
      toast.success('Campaign deleted');
      set((state) => ({ campaigns: state.campaigns.filter((c) => c._id !== id) }));
      return true;
    } catch (err) {
      toast.error('Failed to delete campaign');
      return false;
    }
  },

  getRecipients: async () => {
    try {
      const res = await apiClient.get('/admin/campaign/recipients');
      return res.data;
    } catch (err) {
      toast.error('Failed to load recipients');
      return { subscribers: [], users: [] };
    }
  },
}));
