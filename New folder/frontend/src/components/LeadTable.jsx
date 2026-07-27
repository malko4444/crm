import StatusDropdown from './StatusDropdown';
import useLeadStore from '../store/LeadStore';
import useToastStore from '../store/ToastStore';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));

function LeadTable() {
  const leads = useLeadStore((state) => state.leads);
  const loading = useLeadStore((state) => state.loading);
  const deleteLead = useLeadStore((state) => state.deleteLead);
  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = async (leadId) => {
    const result = await deleteLead(leadId);

    if (!result.success) {
      showToast({ message: result.message, type: 'error' });
      return;
    }

    showToast({ message: 'Lead deleted successfully' });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted shadow-sm">
        Loading leads...
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h3 className="text-base font-semibold text-ink">No leads found</h3>
        <p className="mt-1 text-sm text-muted">Add a lead or adjust the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Email', 'Phone', 'Status', 'Assigned To', 'Created', ''].map((heading) => (
                <th
                  key={heading || 'actions'}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {leads.map((lead) => (
              <tr key={lead._id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-ink">{lead.name}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{lead.email}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{lead.phone || '-'}</td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusDropdown lead={lead} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{lead.assignedTo || '-'}</td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(lead.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(lead._id)}
                    className="min-h-10 rounded-md px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadTable;
