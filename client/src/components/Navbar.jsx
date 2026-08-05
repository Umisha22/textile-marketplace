import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Brand from './Brand.jsx';
import CurrencySwitcher from './CurrencySwitcher.jsx';

const navLink = ({ isActive }) =>
  `relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive
      ? 'neo-pressed text-gold-400'
      : 'text-text-secondary hover:text-text-primary hover:bg-void-600/50'
  }`;

const navLinkActive = `after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-gold-500 after:transition-all after:duration-300 hover:after:w-4/5`;

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
    <header className="sticky top-0 z-40 mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6">
      <nav className="glass-strong flex h-14 items-center justify-between gap-4 rounded-2xl px-4 sm:px-6">
        <Link to={isSupplier ? '/supplier' : '/'} className="flex items-center gap-2.5">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {!isSupplier ? (
            <>
              <NavLink to="/" className={(d) => `${navLink(d)} ${navLinkActive}`} end>Home</NavLink>
              <NavLink to="/products" className={(d) => `${navLink(d)} ${navLinkActive}`}>Fabric Library</NavLink>
              <NavLink to="/#how-it-works" className={(d) => `${navLink(d)} ${navLinkActive}`}>How it works</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/supplier" className={(d) => `${navLink(d)} ${navLinkActive}`} end>Dashboard</NavLink>
              <NavLink to="/supplier/products" className={(d) => `${navLink(d)} ${navLinkActive}`}>Inventory</NavLink>
              <NavLink to="/supplier/orders" className={(d) => `${navLink(d)} ${navLinkActive}`}>Orders</NavLink>
              <NavLink to="/supplier/profile" className={(d) => `${navLink(d)} ${navLinkActive}`}>Profile</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CurrencySwitcher />
          {!isSupplier && (
            <Link
              to="/cart"
              className="neo-flat relative flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition-all duration-300 hover:text-gold-400 hover:shadow-[0_0_20px_rgba(212,168,83,0.1)]"
              title="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.4" />
                <circle cx="19" cy="21" r="1.4" />
                <path d="M2.5 3h2l2.6 12.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.6L21.5 8H6.1" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-void-950">
                  {count}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={isSupplier ? '/supplier' : '/account'}
                className="neo-flat hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-primary transition-all duration-300 hover:text-gold-400 sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-400">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                {user.name?.split(' ')[0]}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:text-coral-400"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="neo-raised-gold rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300"
              >
                Log in
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="neo-flat flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary md:hidden"
            aria-label="Menu"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            )}
          </button>
        </div>
      </nav>

      {open && (
        <nav className="glass-strong mt-2 rounded-2xl px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {!isSupplier ? (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Home</Link>
                <Link to="/products" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Fabric Library</Link>
                <Link to="/#how-it-works" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">How it works</Link>
                <Link to="/cart" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Cart ({count})</Link>
              </>
            ) : (
              <>
                <Link to="/supplier" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Dashboard</Link>
                <Link to="/supplier/products" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Inventory</Link>
                <Link to="/supplier/orders" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Orders</Link>
                <Link to="/supplier/profile" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50">Profile</Link>
              </>
            )}
            {!user && (
                <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-xl neo-raised-gold px-3 py-2.5 text-center text-sm font-bold">Log in</Link>
            )}
            {user && (
              <button type="button" onClick={handleLogout} className="mt-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-coral-400">
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
