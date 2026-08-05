import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Spinner } from '../components/ui.jsx';
import Brand from '../components/Brand.jsx';

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

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="glass-strong rounded-3xl p-8">
        <div className="text-center">
          <Brand className="mx-auto justify-center" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {mode === 'register' ? 'Join Astra Threads as a buyer or supplier.' : 'Log in to continue sourcing.'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-void-700 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-lg py-2 transition-all duration-300 ${mode === 'login' ? 'neo-pressed text-gold-400' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-lg py-2 transition-all duration-300 ${mode === 'register' ? 'neo-pressed text-gold-400' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Register
          </button>
        </div>

        {mode === 'register' && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">I am joining as</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  role === 'buyer'
                    ? 'neo-pressed border-gold-500/30 text-gold-400'
                    : 'neo-flat border-void-600 text-text-secondary hover:border-gold-500/20'
                }`}
              >
                🛍️ Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('supplier')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  role === 'supplier'
                    ? 'neo-pressed border-gold-500/30 text-gold-400'
                    : 'neo-flat border-void-600 text-text-secondary hover:border-gold-500/20'
                }`}
              >
                🏭 Supplier
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-text-secondary">{role === 'supplier' ? 'Business / contact name' : 'Full name'}</label>
              <input value={form.name} onChange={set('name')} required placeholder="Your name" className="mt-1.5 w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="you@company.com" className="mt-1.5 w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <input type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="••••••••" className="mt-1.5 w-full rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20" />
          </div>

          {error && <p className="rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-sm text-coral-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 text-sm font-bold text-void-950 transition-all duration-300 hover:bg-gold-400 neo-raised disabled:opacity-60"
          >
            {loading && <Spinner className="h-4 w-4" />}
            {mode === 'register' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-secondary">
          {mode === 'register' ? 'Already have an account?' : "New to Astra Threads?"}{' '}
          <button type="button" onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="font-semibold text-gold-400 hover:text-gold-300">
            {mode === 'register' ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        By continuing you agree to the prototype terms. Payments & logistics are out of scope.
      </p>
    </div>
  );
}
