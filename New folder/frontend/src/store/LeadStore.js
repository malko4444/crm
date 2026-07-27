import { create } from 'zustand';
import api from '../api/Axios';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const useLeadStore = create((set, get) => ({
  leads: [],
  totalLeads: 0,
  statusCounts: { new: 0, contacted: 0, converted: 0 },
  totalPages: 1,
  currentPage: 1,
  search: '',
  statusFilter: '',
  loading: false,
  error: '',

  fetchLeads: async () => {
    const { currentPage, search, statusFilter } = get();
    set({ loading: true, error: '' });

    try {
      const { data } = await api.get(`/api/leads/page/${currentPage}`, {
        params: {
          limit: 10,
          search,
          status: statusFilter
        }
      });

      set({
        leads: data.leads,
        totalLeads: data.totalLeads,
        statusCounts: data.statusCounts || { new: 0, contacted: 0, converted: 0 },
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage,
        loading: false
      });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, 'Unable to load leads') });
    }
  },

  addLead: async (payload) => {
    set({ loading: true, error: '' });

    try {
      await api.post('/api/leads', payload);
      await get().fetchLeads();
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to add lead');
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  bulkUploadLeads: async (leads) => {
    set({ loading: true, error: '' });

    try {
      const { data } = await api.post('/api/leads/bulk', { leads });
      await get().fetchLeads();
      return { success: true, ...data };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to upload leads');
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  updateLeadStatus: async (leadId, status) => {
    try {
      const { data } = await api.patch(`/api/leads/${leadId}/status`, { status });
      set((state) => ({
        leads: state.leads.map((lead) =>
          lead._id === leadId ? data.lead : lead
        )
      }));
      await get().fetchLeads();
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to update lead');
      set({ error: message });
      return { success: false, message };
    }
  },

  deleteLead: async (leadId) => {
    set({ error: '' });

    try {
      await api.delete(`/api/leads/${leadId}`);
      await get().fetchLeads();
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to delete lead');
      set({ error: message });
      return { success: false, message };
    }
  },

  setSearch: (search) => set({ search, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setPage: (currentPage) => set({ currentPage })
}));

export default useLeadStore;
