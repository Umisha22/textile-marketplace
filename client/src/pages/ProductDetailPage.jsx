import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import GlassPanel from '../components/design-system/GlassPanel.jsx';
import NeoButton from '../components/design-system/NeoButton.jsx';
import FabricSwatch, { LIGHTING_PRESETS } from '../components/design-system/FabricSwatch.jsx';
import { Spinner } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../api/client.js';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

function DrapeSimulation({ fabricType }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 200;
    const h = canvas.height = 160;
    let time = 0;

    const stiffness = fabricType === 'silk' ? 0.02 : fabricType === 'denim' ? 0.08 : 0.04;
    const gravity = fabricType === 'velvet' ? 0.6 : 0.4;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(212, 168, 83, 0.3)';
      ctx.lineWidth = 1.5;

      for (let strand = 0; strand < 5; strand++) {
        ctx.beginPath();
        const startX = 30 + strand * 30;
        ctx.moveTo(startX, 10);
        for (let y = 10; y < h; y += 2) {
          const wave = Math.sin(y * 0.05 + time + strand * 0.5) * (15 + strand * 3) * stiffness * 10;
          const drape = Math.pow(y / h, 1.5) * gravity * 40;
          ctx.lineTo(startX + wave + drape * Math.sin(time * 0.5 + strand), y);
        }
        ctx.stroke();
      }
      time += 0.03;
      requestAnimationFrame(draw);
    };
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [fabricType]);

  return <canvas ref={canvasRef} className="rounded-xl border border-void-600/30 bg-void-800/50" />;
}

function ColorSwatch3D({ color, active, onClick }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -20, y: x * 20 });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={`h-10 w-10 rounded-lg transition-all duration-200 ${active ? 'ring-2 ring-gold-500 ring-offset-2 ring-offset-void-900' : ''}`}
      style={{
        background: color,
        transform: `perspective(200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        boxShadow: `2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.05)`,
      }}
    />
  );
}

function SustainabilityRing({ score }) {
  if (!score || score <= 0) return null;
  const r = 28, c = 2 * Math.PI * r, off = c - (score / 10) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(0,212,170,0.15)" strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke="#00D4AA" strokeWidth="5" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 34 34)" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
        <text x="34" y="34" textAnchor="middle" dominantBaseline="central" className="fill-teal-400 text-sm font-bold font-mono">{score}</text>
      </svg>
      <div>
        <p className="text-sm font-semibold text-teal-400">Eco Score</p>
        <p className="text-xs text-text-muted">{score >= 7 ? 'Excellent' : score >= 4 ? 'Good' : 'Fair'} sustainability</p>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  useCurrency();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [lighting, setLighting] = useState('studio');
  const [qty, setQty] = useState(1);
  const [specsOpen, setSpecsOpen] = useState(false);
  const { add } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.get(`/products?slug=${slug}`)
      .then((d) => { const p = d.products?.[0]; setProduct(p); if (p?.colors?.length) setSelectedColor(p.colors[0].name); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    try {
      await add(product._id || product.id, qty);
      toast('Added to cart');
    } catch { toast('Could not add', 'error'); }
  };

  if (loading) return <div className="flex justify-center py-32"><Spinner className="h-10 w-10 text-gold-400" /></div>;
  if (!product) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-xl font-bold text-text-primary">Product not found</h1><Link to="/products" className="mt-3 inline-block text-gold-400 underline">Browse fabrics</Link></div>;

  const p = product;
  const eco = p.sustainability?.score;
  const colors = p.colors || [];
  const specs = p.specifications || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[55%_1fr]">
        {/* LEFT: 3D Viewer + Drape */}
        <div className="space-y-4">
          <GlassPanel className="overflow-hidden">
            <div className="relative h-[400px] sm:h-[480px]">
              <FabricSwatch
                fabricType={p.fabricType || 'cotton'}
                color={selectedColor ? undefined : undefined}
                lighting={lighting}
                className="h-full w-full"
              />
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {Object.keys(LIGHTING_PRESETS).map((l) => (
                  <button key={l} onClick={() => setLighting(l)} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${lighting === l ? 'bg-gold-500 text-void-950' : 'glass text-text-muted hover:text-gold-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="absolute top-4 left-4 text-[10px] text-text-muted font-mono">Drag to rotate · Scroll to zoom</div>
            </div>
          </GlassPanel>

          {/* Drape Simulation */}
          <GlassPanel className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Drape Simulation</p>
            <DrapeSimulation fabricType={p.fabricType || 'cotton'} />
          </GlassPanel>

          {/* Fallback 2D image */}
          <GlassPanel className="overflow-hidden p-2">
            <ProductImage product={p} className="rounded-xl" />
          </GlassPanel>
        </div>

        {/* RIGHT: Info Panel */}
        <div className="space-y-4">
          <GlassPanel className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{CATEGORY_LABELS[p.category] || p.category} · {p.fabricType || 'woven'}</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-text-primary text-glow-gold">{p.name}</h1>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-gold-400">{formatPrice(p.price)}</span>
              <span className="text-sm text-text-muted">/{p.unit}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">MOQ: {p.moq || 100} {p.unit}s · Stock: {p.stock?.toLocaleString()}</p>
          </GlassPanel>

          {/* Color swatches — 3D tilting */}
          {colors.length > 0 && (
            <GlassPanel className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Colors</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <ColorSwatch3D key={c.name} color={c.hex || '#888'} active={selectedColor === c.name} onClick={() => setSelectedColor(c.name)} />
                ))}
              </div>
              {selectedColor && <p className="mt-2 text-xs text-text-secondary">Selected: {selectedColor}</p>}
            </GlassPanel>
          )}

          {/* Specs accordion */}
          <GlassPanel className="p-4">
            <button onClick={() => setSpecsOpen(!specsOpen)} className="flex w-full items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Specifications</p>
              <span className="text-text-muted text-xs">{specsOpen ? '▲' : '▼'}</span>
            </button>
            {specsOpen && (
              <div className="mt-3 space-y-2 animate-fade-up">
                {Object.entries(specs).filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-void-600/30 pb-1.5">
                    <span className="text-text-muted capitalize">{k}</span>
                    <span className="font-mono text-text-primary">{v}</span>
                  </div>
                ))}
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {p.tags.map((t) => <span key={t} className="rounded-full bg-void-600/50 px-2 py-0.5 text-[10px] text-text-muted">{t}</span>)}
                  </div>
                )}
              </div>
            )}
          </GlassPanel>

          {/* Sustainability */}
          {eco > 0 && (
            <GlassPanel className="p-4"><SustainabilityRing score={eco} /></GlassPanel>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <NeoButton onClick={handleAdd} className="w-full text-base py-4">Add to Cart</NeoButton>
            <Link to="/assistant" className="block">
              <button className="w-full rounded-xl border border-teal-500/30 px-6 py-3.5 text-sm font-semibold text-teal-400 transition hover:bg-teal-500/10 hover:border-teal-500/50 active:scale-[0.97]">
                Request Sample
              </button>
            </Link>
          </div>

          {/* Supplier Card */}
          {p.supplier && (
            <GlassPanel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Supplier</p>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-sm font-bold text-gold-400">
                  {p.supplier.name?.[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">{p.supplier.supplierProfile?.businessName || p.supplier.name}</p>
                  <p className="text-xs text-text-muted">{p.supplier.supplierProfile?.businessType || 'Verified Supplier'}</p>
                </div>
                <Link to={`/supplier/${p.supplier._id}`} className="rounded-lg border border-gold-500/20 px-3 py-1.5 text-[11px] font-semibold text-gold-400 hover:bg-gold-500/10 transition">
                  View Mill
                </Link>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
