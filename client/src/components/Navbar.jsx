import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Brand from './Brand.jsx';
import CurrencySwitcher from './CurrencySwitcher.jsx';

const navLink = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-100 text-brand-900' : 'text-brand-700 hover:bg-cream-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isSupplier = user?.role === 'supplier';

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={isSupplier ? '/supplier' : '/'} className="flex items-center gap-2.5">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!isSupplier ? (
            <>
              <NavLink to="/" className={navLink} end>Home</NavLink>
              <NavLink to="/products" className={navLink}>Fabric Library</NavLink>
              <NavLink to="/assistant" className={navLink}>AI Assistant</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/supplier" className={navLink} end>Dashboard</NavLink>
              <NavLink to="/supplier/products" className={navLink}>Inventory</NavLink>
              <NavLink to="/supplier/orders" className={navLink}>Orders</NavLink>
              <NavLink to="/supplier/profile" className={navLink}>Profile</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CurrencySwitcher />
          {!isSupplier && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 text-brand-800 transition hover:border-brand-400 hover:bg-white"
              title="Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.4" />
                <circle cx="19" cy="21" r="1.4" />
                <path d="M2.5 3h2l2.6 12.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.6L21.5 8H6.1" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={isSupplier ? '/supplier' : '/account'}
                className="hidden items-center gap-2 rounded-xl bg-brand-800 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 sm:flex"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-100 text-xs font-bold text-brand-900">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                {user.name?.split(' ')[0]}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:border-clay-300 hover:text-clay-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-brand-800 transition hover:bg-cream-100"
              >
                Log in
              </Link>
              <Link
                to="/login?mode=register"
                className="rounded-xl bg-clay-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-clay-600"
              >
                Join now
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-200 text-brand-800 md:hidden"
            aria-label="Menu"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brand-100 bg-cream-50 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {!isSupplier ? (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Home</Link>
                <Link to="/products" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Fabric Library</Link>
                <Link to="/assistant" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">AI Assistant</Link>
                <Link to="/cart" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Cart ({count})</Link>
              </>
            ) : (
              <>
                <Link to="/supplier" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Dashboard</Link>
                <Link to="/supplier/products" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Inventory</Link>
                <Link to="/supplier/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Orders</Link>
                <Link to="/supplier/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-brand-800 hover:bg-cream-100">Profile</Link>
              </>
            )}
            {!user && (
              <div className="mt-2 flex gap-2 border-t border-brand-100 pt-3">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-brand-300 px-3 py-2 text-center text-sm font-semibold text-brand-800">Log in</Link>
                <Link to="/login?mode=register" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-clay-500 px-3 py-2 text-center text-sm font-semibold text-white">Join now</Link>
              </div>
            )}
            {user && (
              <button type="button" onClick={handleLogout} className="mt-2 rounded-lg border border-brand-200 px-3 py-2 text-left text-sm font-semibold text-clay-600">
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
