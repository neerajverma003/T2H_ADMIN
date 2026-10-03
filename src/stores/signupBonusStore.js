import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useSignupBonusStore = create((set, get) => ({
  stats: {
    totalLinksShared: 0,
    linksThisMonth: 0,
    monthlyGrowthPercentage: 18.4,
    successfulReferrals: 0,
    distributedCashBonus: 0,
    activeRewardUsers: 0,
    isProgramActive: true,
    welcomeBonus: 500,
  },
  ledger: [],
  total: 0,
  page: 1,
  limit: 50,
  isLoadingStats: false,
  isLoadingLedger: false,
  isSubmittingUser: false,
  isTogglingProgram: false,
  searchQuery: '',
  statusFilter: 'all',

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().fetchLedger();
  },

  // Fetch KPI Stats
  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const res = await apiClient.get('/admin/signup-bonus/stats');
      if (res.data?.success && res.data?.data) {
        set({ stats: res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch signup bonus stats:', err);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  // Fetch Ledger History
  fetchLedger: async () => {
    const { searchQuery, statusFilter, page, limit } = get();
    set({ isLoadingLedger: true });
    try {
      const params = new URLSearchParams({
        search: searchQuery || '',
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await apiClient.get(`/admin/signup-bonus/history?${params.toString()}`);
      if (res.data?.success) {
        set({
          ledger: res.data.ledger || [],
          total: res.data.total || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch signup bonus history:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch signup bonus history');
    } finally {
      set({ isLoadingLedger: false });
    }
  },

  // Toggle Program Status (Active / Inactive)
  toggleProgramStatus: async () => {
    const { stats } = get();
    const newStatus = !stats.isProgramActive;
    set({ isTogglingProgram: true });
    try {
      const res = await apiClient.put('/admin/registration-links/bonus-rules', {
        isReferralActive: newStatus,
        welcomeBonus: stats.welcomeBonus,
      });

      if (res.data?.success) {
        set((state) => ({
          stats: { ...state.stats, isProgramActive: newStatus },
        }));
        toast.success(`Program status set to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
      }
    } catch (err) {
      toast.error('Failed to update program status');
    } finally {
      set({ isTogglingProgram: false });
    }
  },

  // Manually Add a User (+ Add User)
  manualAddUser: async (formData) => {
    set({ isSubmittingUser: true });
    try {
      const res = await apiClient.post('/admin/signup-bonus/manual-add', formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'User added successfully!');
        get().fetchStats();
        get().fetchLedger();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add user');
      return false;
    } finally {
      set({ isSubmittingUser: false });
    }
  },
}));
