import useLeadStore from '../store/LeadStore';
import useToastStore from '../store/ToastStore';

const statusClasses = {
  new: 'border-blue-200 bg-blue-50 text-blue-700',
  contacted: 'border-amber-200 bg-amber-50 text-amber-700',
  converted: 'border-emerald-200 bg-emerald-50 text-emerald-700'
};

function StatusDropdown({ lead }) {
  const updateLeadStatus = useLeadStore((state) => state.updateLeadStatus);
  const showToast = useToastStore((state) => state.showToast);

  const handleStatusChange = async (event) => {
    const result = await updateLeadStatus(lead._id, event.target.value);

    if (!result.success) {
      showToast({ message: result.message, type: 'error' });
      return;
    }

    showToast({ message: 'Lead status updated' });
  };

  return (
    <select
      value={lead.status}
      onChange={handleStatusChange}
      className={`h-9 rounded-md border px-2 text-sm font-medium capitalize ${statusClasses[lead.status]}`}
      aria-label={`Change status for ${lead.name}`}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="converted">Converted</option>
    </select>
  );
}

export default StatusDropdown;
