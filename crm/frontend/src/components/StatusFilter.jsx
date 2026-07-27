import useLeadStore from '../store/LeadStore';

function StatusFilter() {
  const statusFilter = useLeadStore((state) => state.statusFilter);
  const setStatusFilter = useLeadStore((state) => state.setStatusFilter);

  return (
    <label className="block w-full sm:w-52">
      <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink shadow-sm transition hover:border-slate-300"
      >
        <option value="">All statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="converted">Converted</option>
      </select>
    </label>
  );
}

export default StatusFilter;
