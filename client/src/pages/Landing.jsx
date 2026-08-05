import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import FabricSwatch, { LIGHTING_PRESETS } from '../components/design-system/FabricSwatch.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import WaveformVisualizer from '../components/design-system/WaveformVisualizer.jsx';
import FabricIcon from '../components/FabricIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

const FABRIC_TYPES = ['cotton', 'silk', 'linen', 'wool', 'denim', 'velvet', 'chiffon', 'satin'];

export default function Landing() {
  useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [fabricType, setFabricType] = useState('cotton');
  const [lighting, setLighting] = useState('studio');
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    api.get('/products?limit=4&sort=-createdAt').then((d) => setFeatured(d.products || [])).catch(() => {});
    api.get('/products?limit=4&sort=-views').then((d) => setTrending(d.products || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${encodeURIComponent(search.trim())}`);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) { setSearch(transcript); navigate(`/products?q=${encodeURIComponent(transcript)}`); }
      setVoiceActive(false);
    };
    rec.onerror = () => setVoiceActive(false);
    rec.onend = () => setVoiceActive(false);
    setVoiceActive(true);
    rec.start();
  };

  return (
    <div>
      {/* ── HERO: Full-Viewport Immersive ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-void-950 via-void-900 to-void-950" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gold-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-500/5 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 border border-gold-500/20">
            The Future of Fabric Sourcing
          </span>

          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-text-primary text-glow-gold sm:text-7xl lg:text-8xl">
            Source Quality Fabrics,
            <br />
            <span className="text-gold-400">Directly from the Mill</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            AI-powered sourcing. Real-time inventory. Zero middlemen.
          </p>

          {/* 3D Fabric Swatch Viewer */}
          <div className="mx-auto mt-10 max-w-2xl">
            <GlassPanel className="overflow-hidden">
              <div className="relative h-[340px] sm:h-[400px]">
                <FabricSwatch
                  fabricType={fabricType}
                  lighting={lighting}
                  className="h-full w-full"
                />
                {/* Lighting toggle pills */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {Object.keys(LIGHTING_PRESETS).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setLighting(preset)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                        lighting === preset
                          ? 'bg-gold-500 text-void-950 shadow-lg'
                          : 'glass text-text-secondary hover:text-gold-400'
                      }`}
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
                {/* Fabric type selector */}
                <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                  {FABRIC_TYPES.slice(0, 5).map((ft) => (
                    <button
                      key={ft}
                      onClick={() => setFabricType(ft)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all duration-300 ${
                        fabricType === ft
                          ? 'bg-teal-500 text-void-950'
                          : 'glass text-text-muted hover:text-teal-400'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
                <div className="absolute top-4 left-4 text-[10px] text-text-muted font-mono">
                  Drag to rotate · Scroll to zoom
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Voice-Activated AI Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
            <div className="neo-raised flex items-center gap-3 rounded-2xl px-5 py-3">
              <button
                type="button"
                onClick={startVoice}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  voiceActive
                    ? 'bg-coral-500 text-white animate-glow-pulse'
                    : 'bg-void-600 text-gold-400 hover:bg-void-500'
                }`}
              >
                {voiceActive ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="4" height="12" rx="1" /><rect x="14" y="6" width="4" height="12" rx="1" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" /></svg>
                )}
              </button>
              {voiceActive && (
                <div className="h-8 w-32 shrink-0"><WaveformVisualizer active className="h-full" /></div>
              )}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Describe what you're making... (e.g., 'Breathable linen under $6 for summer dresses')"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none font-mono"
              />
              <NeoButton type="submit" size="sm" className="shrink-0">
                Search
              </NeoButton>
            </div>
          </form>

          {/* Quick fabric type pills */}
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap justify-center gap-2">
            {['cotton', 'silk', 'linen', 'denim', 'wool', 'chiffon'].map((ft) => (
              <Link
                key={ft}
                to={`/products?fabricType=${ft}`}
                className="flex items-center gap-1.5 rounded-full border border-void-600/50 bg-void-700/50 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-gold-500/30 hover:text-gold-400"
              >
                <FabricIcon fabricType={ft} className="h-3.5 w-3.5" />
                {ft}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to explore</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="relative z-10 border-y border-void-600/30 bg-void-800/50 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {[['5,000+', 'Fabrics Listed'], ['120+', 'Verified Mills'], ['98%', 'On-time Delivery'], ['24h', 'AI Response Time']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-3xl font-bold text-gold-400 text-glow-gold">{v}</p>
              <p className="mt-1 text-xs text-text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED FABRICS ── */}
      {featured.length > 0 && (
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">New Arrivals</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">Fresh from the mill</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-gold-400 hover:text-gold-300">View all →</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── AI PROMO ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <GlassPanel className="p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 border border-gold-500/20">
                AI-Powered
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-text-primary text-glow-gold">
                Meet Weaver
              </h2>
              <p className="mt-3 text-text-secondary">
                Your AI sourcing assistant. Describe what you need in plain English — Weaver finds, compares, and recommends fabrics from thousands of verified mills.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                {['Natural language search', 'Photo-based color matching', 'Smart recommendations', 'Real-time MOQ & pricing'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/assistant">
                <NeoButton className="mt-8">Try Weaver AI</NeoButton>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-64 w-64">
                <div className="absolute inset-0 rounded-full bg-gold-500/10 animate-breathe" />
                <div className="absolute inset-4 rounded-full bg-gold-500/5 animate-glow-pulse flex items-center justify-center">
                  <span className="font-display text-5xl text-gold-400 text-glow-gold">W</span>
                </div>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gold-500/10"
                    style={{
                      animation: `spin ${6 + i * 2}s linear infinite`,
                      transform: `rotate(${i * 60}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-400 text-center">Browse by Category</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-text-primary text-center">Find your fabric</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(CATEGORY_LABELS).slice(0, 8).map(([key, label]) => (
            <Link
              key={key}
              to={`/products?category=${key}`}
              className="neo-raised group flex flex-col items-center gap-3 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-1 thread-border"
            >
              <FabricIcon fabricType={key} className="h-10 w-10 text-text-muted group-hover:text-gold-400 transition-colors" />
              <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
