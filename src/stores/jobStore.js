import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useJobStore = create((set, get) => ({
  jobs: [],
  currentJob: null,
  applications: [],
  isLoading: false,
  isSaving: false,
  isFetchingSingle: false,
  totalJobs: 0,
  totalApplications: 0,

  // Fetch all jobs for admin list
  fetchJobs: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/jobs', { params });
      if (res.data.success) {
        set({ jobs: res.data.data, totalJobs: res.data.total || res.data.data.length });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch single job by ID (for edit)
  fetchJobById: async (id) => {
    set({ isFetchingSingle: true, currentJob: null });
    try {
      const res = await apiClient.get(`/admin/jobs/${id}`);
      if (res.data.success) {
        set({ currentJob: res.data.data });
        return res.data.data;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error(error.response?.data?.message || 'Failed to load job details');
    } finally {
      set({ isFetchingSingle: false });
    }
    return null;
  },

  // Create new job position
  createJob: async (payload) => {
    set({ isSaving: true });
    try {
      const res = await apiClient.post('/admin/jobs', payload);
      if (res.data.success) {
        toast.success('Job position created successfully!');
        get().fetchJobs();
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      console.error('Error creating job:', error);
      const msg = error.response?.data?.message || 'Failed to create job';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      set({ isSaving: false });
    }
  },

  // Update existing job
  updateJob: async (id, payload) => {
    set({ isSaving: true });
    try {
      const res = await apiClient.put(`/admin/jobs/${id}`, payload);
      if (res.data.success) {
        toast.success('Job position updated successfully!');
        get().fetchJobs();
        return { success: true, data: res.data.data };
      }
    } catch (error) {
      console.error('Error updating job:', error);
      const msg = error.response?.data?.message || 'Failed to update job';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      set({ isSaving: false });
    }
  },

  // Toggle active / closed status
  toggleJobStatus: async (id) => {
    try {
      const res = await apiClient.patch(`/admin/jobs/${id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        set((state) => ({
          jobs: state.jobs.map((j) => (j._id === id ? { ...j, status: res.data.data.status } : j)),
        }));
        return { success: true, status: res.data.data.status };
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle job status');
      return { success: false };
    }
  },

  // Delete job
  deleteJob: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/jobs/${id}`);
      if (res.data.success) {
        toast.success('Job position deleted');
        set((state) => ({
          jobs: state.jobs.filter((j) => j._id !== id),
          totalJobs: Math.max(0, state.totalJobs - 1),
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
      return { success: false };
    }
  },

  // Fetch job applications
  fetchApplications: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/jobs/applications/all', { params });
      if (res.data.success) {
        set({
          applications: res.data.data,
          totalApplications: res.data.total || res.data.data.length,
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      set({ isLoading: false });
    }
  },

  // Update application status (Pending, Reviewed, Shortlisted, Rejected, Hired)
  updateApplicationStatus: async (id, status, adminNotes) => {
    try {
      const res = await apiClient.patch(`/admin/jobs/applications/${id}/status`, {
        status,
        adminNotes,
      });
      if (res.data.success) {
        toast.success(`Application updated to ${status}`);
        set((state) => ({
          applications: state.applications.map((app) =>
            app._id === id ? { ...app, status, adminNotes: adminNotes ?? app.adminNotes } : app
          ),
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.message || 'Failed to update application');
      return { success: false };
    }
  },

  // Delete application
  deleteApplication: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/jobs/applications/${id}`);
      if (res.data.success) {
        toast.success('Application removed');
        set((state) => ({
          applications: state.applications.filter((a) => a._id !== id),
          totalApplications: Math.max(0, state.totalApplications - 1),
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error(error.response?.data?.message || 'Failed to delete application');
      return { success: false };
    }
  },

  clearCurrentJob: () => set({ currentJob: null }),
}));

export default useJobStore;
