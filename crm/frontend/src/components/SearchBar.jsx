import { useEffect, useState } from 'react';
import useLeadStore from '../store/LeadStore';

function SearchBar() {
  const search = useLeadStore((state) => state.search);
  const setSearch = useLeadStore((state) => state.setSearch);
  const [value, setValue] = useState(search);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(value.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [value, setSearch]);

  return (
    <label className="block w-full sm:max-w-sm">
      <span className="mb-2 block text-sm font-medium text-slate-700">Search leads</span>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Name or email"
        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink shadow-sm transition placeholder:text-slate-400 hover:border-slate-300"
      />
    </label>
  );
}

export default SearchBar;
