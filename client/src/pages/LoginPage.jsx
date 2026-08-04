import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Spinner } from '../components/ui.jsx';

export default function LoginPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user =
        mode === 'register'
          ? await register({ ...form, role })
          : await login(form.email, form.password);

      toast(mode === 'register' ? 'Account created — welcome!' : 'Welcome back!');
      if (mode === 'register') {
        navigate('/onboarding');
      } else {
        navigate(user.role === 'supplier' ? '/supplier' : user.onboarded ? '/' : '/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (roleType) => {
    if (mode !== 'login') setMode('login');
    setRole(roleType);
    setForm({ name: '', email: roleType === 'supplier' ? 'supplier@demo.com' : 'buyer@demo.com', password: 'demo1234' });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-lift">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 font-display text-xl font-bold text-cream-100">A</span>
          <h1 className="mt-4 font-display text-2xl font-bold text-brand-900">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-brand-500">
            {mode === 'register' ? 'Join Astra Threads as a buyer or supplier.' : 'Log in to continue sourcing.'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-brand-50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-lg py-2 transition ${mode === 'login' ? 'bg-white text-brand-900 shadow-soft' : 'text-brand-500'}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-lg py-2 transition ${mode === 'register' ? 'bg-white text-brand-900 shadow-soft' : 'text-brand-500'}`}
          >
            Register
          </button>
        </div>

        {mode === 'register' && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">I am joining as</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${role === 'buyer' ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-200 text-brand-700 hover:border-brand-400'}`}
              >
                🛍️ Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('supplier')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${role === 'supplier' ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-200 text-brand-700 hover:border-brand-400'}`}
              >
                🏭 Supplier
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-brand-800">{role === 'supplier' ? 'Business / contact name' : 'Full name'}</label>
              <input value={form.name} onChange={set('name')} required placeholder="Your name" className="mt-1.5 w-full rounded-xl border border-brand-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-brand-800">Email</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="you@company.com" className="mt-1.5 w-full rounded-xl border border-brand-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-800">Password</label>
            <input type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="••••••••" className="mt-1.5 w-full rounded-xl border border-brand-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>

          {error && <p className="rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay-500 py-3 text-sm font-bold text-white transition hover:bg-clay-600 disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            {mode === 'register' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-brand-500">Try the demo accounts</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => fillDemo('buyer')} className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 hover:border-brand-400">
              Buyer demo
            </button>
            <button type="button" onClick={() => fillDemo('supplier')} className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 hover:border-brand-400">
              Supplier demo
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-brand-500">
          {mode === 'register' ? 'Already have an account?' : "New to Astra Threads?"}{' '}
          <button type="button" onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="font-semibold text-brand-700 hover:underline">
            {mode === 'register' ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-brand-400">
        By continuing you agree to the prototype terms. Payments & logistics are out of scope for this hackathon demo.
      </p>
    </div>
  );
}
