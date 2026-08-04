import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100 font-display text-lg font-bold text-brand-900">A</span>
            <span className="font-display text-xl font-semibold text-white">Astra Threads</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-200">
            The B2B textile marketplace connecting fabric mills with the world's apparel brands.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-cream-100">Buyers</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li><Link to="/products" className="hover:text-white">Fabric Library</Link></li>
            <li><Link to="/assistant" className="hover:text-white">AI Assistant</Link></li>
            <li><Link to="/cart" className="hover:text-white">Shopping Cart</Link></li>
            <li><Link to="/login" className="hover:text-white">Create an account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-cream-100">Suppliers</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li><Link to="/login?mode=register" className="hover:text-white">List your business</Link></li>
            <li><Link to="/supplier" className="hover:text-white">Supplier Console</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-cream-100">Demo Accounts</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li>buyer@demo.com / demo1234</li>
            <li>supplier@demo.com / demo1234</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-800 py-5 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} Astra Threads · Hackathon prototype · Built with the MERN stack
      </div>
    </footer>
  );
}
