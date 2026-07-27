import { create } from 'zustand';
import api from '../api/Axios';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: '',

  login: async (credentials) => {
    set({ loading: true, error: '' });

    try {
      const { data } = await api.post('/api/auth/login', credentials);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to sign in');
      set({ user: null, isAuthenticated: false, loading: false, error: message });
      return { success: false, message };
    }
  },

  register: async (payload) => {
    set({ loading: true, error: '' });

    try {
      const { data } = await api.post('/api/auth/register', payload);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create account');
      set({ user: null, isAuthenticated: false, loading: false, error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    set({ loading: true, error: '' });

    try {
      await api.post('/api/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  checkAuth: async () => {
    set({ loading: true });

    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user, isAuthenticated: true, loading: false, error: '' });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));

export default useAuthStore;
