import { useState } from 'react';
import useLeadStore from '../store/LeadStore';
import useToastStore from '../store/ToastStore';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  assignedTo: ''
};

function LeadFormModal({ open, onClose }) {
  const addLead = useLeadStore((state) => state.addLead);
  const loading = useLeadStore((state) => state.loading);
  const showToast = useToastStore((state) => state.showToast);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  if (!open) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    const result = await addLead(form);

    if (!result.success) {
      setError(result.message);
      showToast({ message: result.message, type: 'error' });
      return;
    }

    setForm(initialForm);
    showToast({ message: 'Lead added successfully' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-soft">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Add lead</h2>
          <p className="mt-1 text-sm text-muted">Create a qualified sales opportunity for your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Name *</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Assigned to</span>
              <input
                type="text"
                value={form.assignedTo}
                onChange={(event) => updateField('assignedTo', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Add lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadFormModal;
