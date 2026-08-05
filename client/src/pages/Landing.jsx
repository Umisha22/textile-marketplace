import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import FabricIcon from '../components/FabricIcon.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORY_LABELS, FABRIC_TYPE_LABELS } from '../utils/constants.js';

const CATEGORY_ICON = {
  cotton: 'poplin', silk: 'silk', linen: 'woven', wool: 'broadcloth',
  denim: 'denim', polyester: 'satin', viscose: 'crepe', blends: 'blends',
  lace: 'lace', embroidery: 'jacquard', technical: 'twill',
};

export default function Landing() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState({ supplierCount: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.15}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get('/products/featured').then((d) => setFeatured(d.products)).catch(() => {});
    api.get('/products/categories').then((d) => { setCategories(d.categories); setStats({ supplierCount: d.supplierCount || 0 }); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role !== 'buyer') { setRecommended([]); return; }
    api.get('/recommendations').then((d) => setRecommended(d.recommendedProducts || [])).catch(() => setRecommended([]));
  }, [user]);

  const submitSearch = (e) => { e.preventDefault(); navigate(`/products?search=${encodeURIComponent(search)}`); };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div ref={heroRef} className="parallax-layer">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gold-500/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-teal-500/6 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-void-700/50 px-3.5 py-1.5 text-xs font-medium text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              B2B Textile Marketplace · Powering apparel sourcing
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl text-glow-gold">
              Source quality fabrics, <span className="text-gold-400">directly from the mill.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
              Browse verified fabric suppliers, compare materials, and place orders — all in one place.
              Let AI find the perfect fabric for your next collection.
            </p>

            <form onSubmit={submitSearch} className="mt-8 flex max-w-lg overflow-hidden neo-raised rounded-2xl p-1.5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try organic cotton under $5 or silk chiffon..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <button type="submit" className="neo-raised-gold rounded-xl px-5 py-3 text-sm font-bold transition">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="neo-raised-gold rounded-xl px-5 py-3 text-sm font-bold transition">
                Browse Fabric Library
              </Link>
              <Link to="/assistant" className="neo-raised rounded-xl px-5 py-3 text-sm font-semibold text-text-secondary transition hover:text-text-primary">
                🧶 Meet Weaver AI
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <Link
                  key={p._id}
                  to={`/products/${p.slug}`}
                  className={`group overflow-hidden rounded-2xl neo-raised transition-all duration-400 hover:-translate-y-1 hover:shadow-[var(--shadow-neo-hover)] ${i % 2 === 1 ? 'translate-y-6' : ''}`}
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-void-600 to-void-800 text-gold-400/60">
                    <FabricIcon fabricType={p.fabricType || CATEGORY_ICON[p.category]} className="h-16 w-16" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="mt-1 font-mono text-xs text-gold-400">${p.price}/{p.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-void-600/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:px-6 lg:grid-cols-4">
          {[
            { v: `${stats.supplierCount || 20}+`, l: 'Verified suppliers' },
            { v: '1,200+', l: 'Fabric listings' },
            { v: '11', l: 'Fabric categories' },
            { v: '24/7', l: 'AI sourcing assistant' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl font-bold text-gold-400">{s.v}</p>
              <p className="mt-1 text-sm text-text-secondary">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fabric types */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Browse by fabric type</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">Shop by weave & construction</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-gold-400 hover:text-gold-300">View all →</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(FABRIC_TYPE_LABELS).map(([type, label]) => (
            <Link
              key={type}
              to={`/products?fabricType=${type}`}
              className="neo-flat flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all duration-300 hover:text-gold-400 hover:shadow-[0_0_20px_rgba(212,168,83,0.08)]"
            >
              <FabricIcon fabricType={type} className="h-3.5 w-3.5 text-text-muted transition group-hover:text-gold-400" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Curated for you</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">Featured fabrics</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Recommended */}
      {user?.role === 'buyer' && recommended.length > 0 && (
        <section className="border-y border-void-600/50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Personalized</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">Recommended for you</h2>
              </div>
              <Link to="/assistant" className="text-sm font-semibold text-gold-400 hover:text-gold-300">Ask Weaver AI →</Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.slice(0, 4).map((p) => <ProductCard key={p.id || p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Supplier CTA */}
      <section className="border-t border-void-600/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">For suppliers</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">
              Put your mill in front of thousands of buyers.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary">
              List your inventory in minutes, manage stock, and fulfil incoming orders from a single supplier console.
            </p>
            <Link to="/login?mode=register" className="neo-raised-gold mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold transition">
              Become a supplier
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: '2 min', l: 'to list a product' },
              { v: '1 console', l: 'for inventory + orders' },
              { v: '5', l: 'order status stages' },
              { v: 'AI', l: 'inventory alerting' },
            ].map((s) => (
              <div key={s.l} className="neo-flat rounded-2xl p-5 text-center">
                <p className="font-display text-2xl font-bold text-gold-400">{s.v}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
