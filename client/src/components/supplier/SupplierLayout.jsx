import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const link = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
    isActive ? 'neo-pressed text-gold-400' : 'text-text-secondary hover:text-text-primary hover:bg-void-600/50'
  }`;

const ICONS = {
  dashboard: '📊',
  inventory: '🧶',
  orders: '📦',
  profile: '🏭',
};

export default function SupplierLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: '/supplier', label: 'Dashboard', key: 'dashboard', end: true },
    { to: '/supplier/products', label: 'Inventory', key: 'inventory' },
    { to: '/supplier/orders', label: 'Orders', key: 'orders' },
    { to: '/supplier/profile', label: 'Profile', key: 'profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-void-950">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-void-600/50 bg-void-900/80 p-5 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-void-700 ring-1 ring-gold-500/20 font-display text-lg font-bold text-gold-400">A</span>
          <span className="font-display text-lg font-semibold text-text-primary">Astra Threads</span>
        </Link>

        <div className="mt-6 neo-flat rounded-xl p-4">
          <p className="text-xs text-text-muted">Supplier console</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {user?.supplierProfile?.businessName || user?.name}
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {items.map((it) => (
            <NavLink key={it.key} to={it.to} end={it.end} className={link}>
              <span>{ICONS[it.key]}</span> {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-void-600/50 pt-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-text-secondary transition hover:text-text-primary hover:bg-void-600/50">
            🌐 View marketplace
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm text-text-secondary transition hover:text-coral-400 hover:bg-void-600/50"
          >
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 glass-strong flex items-center justify-between border-b border-void-600/50 px-4 py-3 lg:hidden">
          <Link to="/supplier" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-void-700 ring-1 ring-gold-500/20 font-display text-sm font-bold text-gold-400">A</span>
            <span className="font-display font-semibold text-text-primary">Supplier Console</span>
          </Link>
          <button type="button" onClick={handleLogout} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-coral-400">
            Logout
          </button>
        </div>
        <div className="glass-strong flex gap-1 overflow-x-auto border-b border-void-600/50 px-2 py-2 lg:hidden">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'neo-pressed text-gold-400' : 'text-text-secondary'}`
              }
            >
              {ICONS[it.key]} {it.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 bg-void-950 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
