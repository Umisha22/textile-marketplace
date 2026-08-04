import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const link = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-800 text-white' : 'text-brand-200 hover:bg-brand-800/60 hover:text-white'
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-brand-950 p-5 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 font-display text-lg font-bold text-brand-900">A</span>
          <span className="font-display text-lg font-semibold text-white">Astra Threads</span>
        </Link>

        <div className="mt-6 rounded-xl bg-brand-800/70 p-4">
          <p className="text-xs text-brand-300">Supplier console</p>
          <p className="mt-1 text-sm font-semibold text-white">
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

        <div className="space-y-2 border-t border-brand-800 pt-4">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-brand-200 hover:bg-brand-800/60 hover:text-white">
            🌐 View marketplace
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm text-brand-200 hover:bg-brand-800/60 hover:text-white"
          >
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-100 bg-cream-50/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/supplier" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900 font-display text-sm font-bold text-cream-100">A</span>
            <span className="font-display font-semibold text-brand-900">Supplier Console</span>
          </Link>
          <button type="button" onClick={handleLogout} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700">
            Logout
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-brand-100 bg-white px-2 py-2 lg:hidden">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-800 text-white' : 'text-brand-700'}`
              }
            >
              {ICONS[it.key]} {it.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 bg-cream-50 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
