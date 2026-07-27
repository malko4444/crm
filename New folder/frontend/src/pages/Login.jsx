import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import crmWorkspace from '../assets/CrmWorkspace.jpg';
import useAuthStore from '../store/AuthStore';

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    const result = await login(form);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold text-brand">Mini CRM Lead Manager</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Sign in to your pipeline</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Manage leads, update statuses, and keep your sales workflow moving.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-md bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            New to Mini CRM?{' '}
            <Link to="/register" className="font-semibold text-brand hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden min-h-dvh bg-slate-950 p-4 lg:block">
        <img
          src={crmWorkspace}
          alt="Sales team reviewing customer pipeline data in a workspace"
          className="h-full w-full rounded-lg object-cover opacity-90"
        />
      </section>
    </main>
  );
}

export default Login;
