import { useEffect, useState } from 'react';
import BulkUploadModal from '../components/BulkUploadModal';
import LeadFormModal from '../components/LeadFormModal';
import LeadTable from '../components/LeadTable';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import useLeadStore from '../store/LeadStore';

const analyticsConfig = [
  { key: 'new', label: 'New leads', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  { key: 'contacted', label: 'Contacted', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  { key: 'converted', label: 'Converted', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
];

function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const totalLeads = useLeadStore((state) => state.totalLeads);
  const statusCounts = useLeadStore((state) => state.statusCounts);
  const currentPage = useLeadStore((state) => state.currentPage);
  const search = useLeadStore((state) => state.search);
  const statusFilter = useLeadStore((state) => state.statusFilter);
  const error = useLeadStore((state) => state.error);
  const fetchLeads = useLeadStore((state) => state.fetchLeads);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, currentPage, search, statusFilter]);

  return (
    <div className="min-h-dvh bg-surface">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">Pipeline overview</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-ink">Lead dashboard</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setBulkModalOpen(true)}
              className="min-h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Import CSV
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="min-h-11 rounded-md bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Add Lead
            </button>
          </div>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Total leads</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{totalLeads}</p>
          </article>

          {analyticsConfig.map((item) => (
            <article key={item.key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-muted">{item.label}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-3xl font-semibold text-ink">{statusCounts[item.key] || 0}</p>
                <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${item.className}`}>
                  {item.key}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row">
              <SearchBar />
              <StatusFilter />
            </div>
          </div>
        </section>

        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <section className="mt-5 space-y-5">
          <LeadTable />
          <Pagination />
        </section>
      </main>

      <LeadFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <BulkUploadModal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
    </div>
  );
}

export default Dashboard;
