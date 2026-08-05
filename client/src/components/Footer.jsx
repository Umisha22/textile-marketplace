import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-void-600/50 bg-void-900/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-void-700 ring-1 ring-gold-500/20 font-display text-lg font-bold text-gold-400">A</span>
            <span className="font-display text-xl font-semibold text-text-primary">Astra Threads</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
            The B2B textile marketplace connecting fabric mills with the world's apparel brands.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Buyers</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link to="/products" className="transition hover:text-text-primary">Fabric Library</Link></li>
            <li><Link to="/assistant" className="transition hover:text-text-primary">AI Assistant</Link></li>
            <li><Link to="/cart" className="transition hover:text-text-primary">Shopping Cart</Link></li>
            <li><Link to="/login" className="transition hover:text-text-primary">Create an account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Suppliers</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li><Link to="/login?mode=register" className="transition hover:text-text-primary">List your business</Link></li>
            <li><Link to="/supplier" className="transition hover:text-text-primary">Supplier Console</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Demo Accounts</h4>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary font-mono text-xs">
            <li>buyer@demo.com</li>
            <li>supplier@demo.com</li>
            <li className="text-text-muted">password: demo1234</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-void-600/50 py-5 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} Astra Threads · Built with the MERN stack
      </div>
    </footer>
  );
}
