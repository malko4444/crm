import { useMemo, useState } from 'react';
import useLeadStore from '../store/LeadStore';
import useToastStore from '../store/ToastStore';

const emptySummary = {
  inserted: 0,
  skipped: [],
  total: 0
};

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseLeadsCsv = (content) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    return headers.reduce((lead, header, index) => {
      const value = values[index]?.trim() || '';

      if (header === 'assignedto' || header === 'assigned to') {
        return { ...lead, assignedTo: value };
      }

      return { ...lead, [header]: value };
    }, {});
  });
};

function BulkUploadModal({ open, onClose }) {
  const bulkUploadLeads = useLeadStore((state) => state.bulkUploadLeads);
  const loading = useLeadStore((state) => state.loading);
  const showToast = useToastStore((state) => state.showToast);
  const [fileName, setFileName] = useState('');
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(emptySummary);

  const previewText = useMemo(() => {
    if (!leads.length) {
      return 'No file selected';
    }

    return `${leads.length} lead${leads.length === 1 ? '' : 's'} ready`;
  }, [leads.length]);

  if (!open) {
    return null;
  }

  const resetState = () => {
    setFileName('');
    setLeads([]);
    setError('');
    setSummary(emptySummary);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setError('');
    setSummary(emptySummary);

    if (!file) {
      setFileName('');
      setLeads([]);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileName('');
      setLeads([]);
      setError('Please choose a CSV file.');
      return;
    }

    const content = await file.text();
    const parsedLeads = parseLeadsCsv(content);

    setFileName(file.name);
    setLeads(parsedLeads);

    if (!parsedLeads.length) {
      setError('No leads were found in this file.');
    }
  };

  const handleDownloadTemplate = () => {
    const csv = 'name,email,phone,status,assignedTo\nJane Cooper,jane@example.com,555-0123,new,Alex Morgan';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lead-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSummary(emptySummary);

    if (!leads.length) {
      setError('Choose a CSV file before uploading.');
      return;
    }

    const result = await bulkUploadLeads(leads);

    if (!result.success) {
      setError(result.message);
      showToast({ message: result.message, type: 'error' });
      return;
    }

    const nextSummary = {
      inserted: result.inserted || 0,
      skipped: result.skipped || [],
      total: result.total || leads.length
    };

    setSummary(nextSummary);
    showToast({
      message: `Imported ${nextSummary.inserted} lead${nextSummary.inserted === 1 ? '' : 's'}${
        nextSummary.skipped.length ? `, skipped ${nextSummary.skipped.length}` : ''
      }`
    });

    if (!nextSummary.skipped.length) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-soft">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">Import leads</h2>
          <p className="mt-1 text-sm text-muted">{fileName || previewText}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          {!!summary.skipped.length && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <p className="font-semibold">
                Imported {summary.inserted} of {summary.total}
              </p>
              <ul className="mt-2 max-h-28 space-y-1 overflow-auto">
                {summary.skipped.slice(0, 5).map((item) => (
                  <li key={`${item.row}-${item.email || item.reason}`}>
                    Row {item.row}: {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Download template
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-11 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Uploading...' : 'Upload leads'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkUploadModal;
