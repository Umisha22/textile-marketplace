import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import FabricIcon from '../components/FabricIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORY_LABELS, FABRIC_TYPE_LABELS } from '../utils/constants.js';

const CATEGORY_ICON = {
  cotton: 'poplin',
  silk: 'silk',
  linen: 'woven',
  wool: 'broadcloth',
  denim: 'denim',
  polyester: 'satin',
  viscose: 'crepe',
  blends: 'blends',
  lace: 'lace',
  embroidery: 'jacquard',
  technical: 'twill',
};

export default function Landing() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState({ supplierCount: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products/featured')
      .then((d) => setFeatured(d.products))
      .catch(() => {});
    api
      .get('/products/categories')
      .then((d) => {
        setCategories(d.categories);
        setStats({ supplierCount: d.supplierCount || 0 });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role !== 'buyer') {
      setRecommended([]);
      return;
    }
    api
      .get('/recommendations')
      .then((d) => setRecommended(d.recommendedProducts || []))
      .catch(() => setRecommended([]));
  }, [user]);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-cream-50">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 h-[420px] w-[420px] rounded-full bg-clay-500/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-900 px-3.5 py-1.5 text-xs font-medium text-brand-100">
              <span className="h-1.5 w-1.5 rounded-full bg-clay-400" />
              B2B Textile Marketplace · Powering apparel sourcing
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Source quality fabrics, <span className="text-clay-300">directly from the mill.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-brand-200 sm:text-lg">
              Browse verified fabric suppliers, compare materials, and place orders — all in one place.
              Let AI find the perfect fabric for your next collection.
            </p>

            <form onSubmit={submitSearch} className="mt-8 flex max-w-lg overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try “organic cotton under $5” or “silk chiffon”…"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-brand-950 outline-none placeholder:text-brand-400"
              />
              <button type="submit" className="rounded-xl bg-clay-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay-600">
                Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="rounded-xl bg-brand-100 px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-white">
                Browse Fabric Library
              </Link>
              <Link to="/assistant" className="rounded-xl border border-brand-700 px-5 py-3 text-sm font-semibold text-brand-100 transition hover:bg-brand-800">
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
                  className={`group overflow-hidden rounded-2xl border border-brand-700/60 bg-brand-900/70 backdrop-blur transition hover:-translate-y-1 ${i % 2 === 1 ? 'translate-y-6' : ''}`}
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900 text-clay-300">
                    <FabricIcon fabricType={p.fabricType || CATEGORY_ICON[p.category]} className="h-16 w-16" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="mt-1 text-xs text-brand-300">${p.price}/{p.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-brand-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-center sm:px-6 lg:grid-cols-4">
          {[
            { v: `${stats.supplierCount || 20}+`, l: 'Verified suppliers' },
            { v: `${featured.length ? '1,200+' : '1,200+'}`, l: 'Fabric listings' },
            { v: '11', l: 'Fabric categories' },
            { v: '24/7', l: 'AI sourcing assistant' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl font-bold text-brand-900">{s.v}</p>
              <p className="mt-1 text-sm text-brand-500">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Browse by category</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">Shop fabric categories</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-semibold text-brand-700 hover:text-brand-900 sm:block">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.name}
              to={`/products?category=${c.name}`}
              className="group rounded-2xl border border-brand-100 bg-white p-5 text-center shadow-soft transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-100">
                <FabricIcon fabricType={CATEGORY_ICON[c.name] || 'woven'} className="h-6 w-6" />
              </div>
              <p className="mt-3 font-display text-sm font-semibold text-brand-900">{CATEGORY_LABELS[c.name] || c.name}</p>
              <p className="mt-0.5 text-xs text-brand-400">{c.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Fabric types */}
      <section className="border-t border-brand-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">By fabric type</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">Shop by weave & construction</h2>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {Object.entries(FABRIC_TYPE_LABELS).map(([type, label]) => (
              <Link
                key={type}
                to={`/products?fabricType=${type}`}
                className="group flex items-center gap-2 rounded-full border border-brand-200 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50"
              >
                <FabricIcon fabricType={type} className="h-5 w-5 text-brand-600 transition group-hover:text-brand-800" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-brand-50/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Curated for you</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">Featured fabrics</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended for you */}
      {user?.role === 'buyer' && recommended.length > 0 && (
        <section className="border-t border-brand-100 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Personalized</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">Recommended for you</h2>
              </div>
              <Link to="/assistant" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
                Ask Weaver AI →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.slice(0, 4).map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI assistant promo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 p-8 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/50 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-300">AI Marketplace Assistant</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
                “Show me breathable linen under $6 for summer dresses.”
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-200">
                Weaver understands plain language, recommends fabrics from real inventory, compares options side-by-side,
                and answers product questions — even by voice. Traditional search stays fully available.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/assistant" className="rounded-xl bg-clay-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay-600">
                  Try the assistant
                </Link>
                <Link to="/products" className="rounded-xl border border-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                  Browse manually
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { q: 'What is the MOQ for the Banarasi silk?', a: 'MOQ is 100 meters for Banarasi Silk Jacquard.' },
                { q: 'Compare silk chiffon vs satin', a: 'Here is a side-by-side comparison…' },
                { q: 'Recommend fabrics for bridal wear', a: 'Banarasi Silk Jacquard, Embroidered Net, Chantilly Lace…' },
              ].map((ex) => (
                <div key={ex.q} className="rounded-2xl border border-brand-700/70 bg-brand-800/60 p-4 backdrop-blur">
                  <p className="text-xs font-semibold text-brand-100">You: {ex.q}</p>
                  <p className="mt-1.5 text-sm text-brand-200">Weaver: {ex.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Simple workflow</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">How the marketplace works</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: '01', t: 'Discover', d: 'Search or ask Weaver AI to find fabrics that match your spec, budget and use case.' },
            { n: '02', t: 'Order', d: 'Add to cart, review your order, and place it directly with the supplying mill.' },
            { n: '03', t: 'Track', d: 'Follow order status from pending → accepted → preparing → ready for dispatch → completed.' },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <p className="font-display text-4xl font-bold text-brand-200">{s.n}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-brand-900">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="border-t border-brand-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">For suppliers</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-900">
              Put your mill in front of thousands of buyers.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-600">
              List your inventory in minutes, manage stock, and fulfil incoming orders from a single supplier console.
            </p>
            <Link to="/login?mode=register" className="mt-6 inline-block rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
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
              <div key={s.l} className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-center">
                <p className="font-display text-2xl font-bold text-brand-900">{s.v}</p>
                <p className="mt-1 text-xs text-brand-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
