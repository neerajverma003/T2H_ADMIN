import { create } from 'zustand';
import { apiClient } from './authStores';
import { toast } from 'react-toastify';

export const useCustomerStore = create((set, get) => ({
  customers: [],
  isLoadingCustomers: false,

  customer: null,
  isLoadingCustomer: false,

  tabData: {
    bookings: { data: [], loading: false, fetched: false },
    wishlist: { data: [], loading: false, fetched: false },
    reviews: { data: [], loading: false, fetched: false },
    giftcards: { data: { purchased: [], received: [] }, loading: false, fetched: false },
    enquiries: { data: [], loading: false, fetched: false },
  },

  isDeleting: false,

  // Fetch the full registered-customers list (site users, not admin staff)
  fetchCustomers: async () => {
    set({ isLoadingCustomers: true });
    try {
      const res = await apiClient.get('/admin/customers');
      set({ customers: res.data.success ? res.data.customers : [] });
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error('Failed to load registered users.');
    } finally {
      set({ isLoadingCustomers: false });
    }
  },

  // Fetch one customer's base profile for the detail page
  fetchCustomerById: async (id) => {
    set({ isLoadingCustomer: true, customer: null });
    try {
      const res = await apiClient.get(`/admin/customers/${id}`);
      set({ customer: res.data.success ? res.data.user : null });
    } catch (err) {
      console.error('Error fetching customer:', err);
      toast.error('Failed to load customer profile.');
    } finally {
      set({ isLoadingCustomer: false });
    }
  },

  // Lazy per-tab fetch — only hits the API the first time a tab is opened
  fetchTabData: async (id, tabKey, force = false) => {
    const current = get().tabData[tabKey];
    if (!force && (current.fetched || current.loading)) return;

    set((state) => ({
      tabData: { ...state.tabData, [tabKey]: { ...state.tabData[tabKey], loading: true } },
    }));

    try {
      const res = await apiClient.get(`/admin/customers/${id}/${tabKey}`);
      const dataKey =
        tabKey === 'giftcards' ? 'giftCards' : tabKey; // backend returns `giftCards` (capital C)
      set((state) => ({
        tabData: {
          ...state.tabData,
          [tabKey]: { data: res.data[dataKey] ?? current.data, loading: false, fetched: true },
        },
      }));
    } catch (err) {
      console.error(`Error fetching ${tabKey}:`, err);
      toast.error(`Could not load ${tabKey}.`);
      set((state) => ({
        tabData: { ...state.tabData, [tabKey]: { ...state.tabData[tabKey], loading: false, fetched: true } },
      }));
    }
  },

  resetTabData: () =>
    set({
      tabData: {
        bookings: { data: [], loading: false, fetched: false },
        wishlist: { data: [], loading: false, fetched: false },
        reviews: { data: [], loading: false, fetched: false },
        giftcards: { data: { purchased: [], received: [] }, loading: false, fetched: false },
        enquiries: { data: [], loading: false, fetched: false },
      },
    }),

  deleteCustomer: async (id) => {
    set({ isDeleting: true });
    try {
      await apiClient.delete(`/admin/customers/${id}`);
      toast.success('Customer deleted successfully.');
      set((state) => ({ customers: state.customers.filter((c) => c._id !== id) }));
      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error(err.response?.data?.msg || 'Failed to delete customer.');
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },

  manageUserWallet: async (userId, { type, amount, description }) => {
    try {
      const res = await apiClient.post(`/admin/customers/${userId}/wallet`, { type, amount, description });
      if (res.data.success) {
        toast.success(res.data.msg || `Wallet ${type === 'credit' ? 'credited' : 'debited'} successfully!`);
        set((state) => ({
          customers: state.customers.map((c) =>
            c._id === userId ? { ...c, wallet_balance: res.data.new_balance } : c
          ),
          customer: state.customer && state.customer._id === userId
            ? { ...state.customer, wallet_balance: res.data.new_balance }
            : state.customer
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error managing user wallet:', err);
      toast.error(err.response?.data?.msg || 'Failed to update wallet balance.');
      return false;
    }
  },
}));

export default useCustomerStore;
