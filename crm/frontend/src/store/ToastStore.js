import { create } from 'zustand';

let nextToastId = 1;

const useToastStore = create((set) => ({
  toasts: [],

  showToast: ({ message, type = 'success' }) => {
    const id = nextToastId;
    nextToastId += 1;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      }));
    }, 3500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));

export default useToastStore;
