import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useTeamStore = create((set, get) => ({
  team: [],
  memberToEdit: null,
  isLoading: false,
  isFetchingDetails: false,

  fetchTeam: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/admin/team');
      set({ team: res.data.success ? res.data.data : [], isLoading: false });
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team members.');
      set({ isLoading: false });
    }
  },

  fetchMemberById: async (id) => {
    set({ isFetchingDetails: true, memberToEdit: null });
    try {
      if (get().team.length === 0) {
        await get().fetchTeam();
      }
      const member = get().team.find((m) => m._id === id);
      set({ memberToEdit: member || null, isFetchingDetails: false });
    } catch (error) {
      console.error('Error fetching team member:', error);
      toast.error('Failed to load member details.');
      set({ isFetchingDetails: false });
    }
  },

  addTeamMember: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/admin/team', payload);
      if (res.data.success) get().fetchTeam();
      return res.data;
    } catch (error) {
      console.error('Error adding team member:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add team member.' };
    } finally {
      set({ isLoading: false });
    }
  },

  updateTeamMember: async (id, payload) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.patch(`/admin/team/${id}`, payload);
      if (res.data.success) get().fetchTeam();
      return res.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update team member.' };
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTeamMember: async (id) => {
    try {
      await apiClient.delete(`/admin/team/${id}`);
      toast.success('Team member removed.');
      set((state) => ({ team: state.team.filter((m) => m._id !== id) }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error(error.response?.data?.message || 'Failed to delete team member.');
      return { success: false };
    }
  },

  clearMemberToEdit: () => set({ memberToEdit: null }),
}));

export default useTeamStore;