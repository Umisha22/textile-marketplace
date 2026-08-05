import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import NeoButton from './design-system/NeoButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

function SustainabilityRing({ score }) {
  if (!score || score <= 0) return null;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
      <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(0,212,170,0.15)" strokeWidth="3" />
      <circle
        cx="18" cy="18" r={radius} fill="none" stroke="#00D4AA" strokeWidth="3"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central" className="fill-teal-400 text-[9px] font-bold font-mono">
        {score}
      </text>
    </svg>
  );
}

export default function ProductCard({ product }) {
  useCurrency();
  const { add } = useCart();
  const { toast } = useToast();
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imgZoom, setImgZoom] = useState(false);
  const cardRef = useRef(null);
  const [addedAnim, setAddedAnim] = useState(false);

  const p = product;
  const productId = p._id || p.id;
  const eco = p.sustainability?.score;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    setImgZoom(true);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await add(productId, 1);
      setAddedAnim(true);
      toast('Added to cart');
      setTimeout(() => setAddedAnim(false), 600);
    } catch { toast('Could not add to cart', 'error'); }
  };

  return (
    <Link
      ref={cardRef}
      to={`/products/${p.slug}`}
      className="group relative flex flex-col overflow-hidden transition-all duration-400 ease-out hover:-translate-y-1"
      style={{
        borderRadius: '12px 4px 12px 4px',
        background: 'var(--color-void-700)',
        boxShadow: hovered
          ? '12px 12px 24px rgba(0,0,0,0.7), -6px -6px 16px rgba(255,255,255,0.06)'
          : '8px 8px 16px rgba(0,0,0,0.6), -4px -4px 12px rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setImgZoom(false); }}
      onMouseMove={handleMouseMove}
    >
      {/* Thread border on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        style={{
          border: '1px solid transparent',
          background: 'linear-gradient(135deg, rgba(212,168,83,0.3), transparent 50%, rgba(0,212,170,0.2)) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Image area — top 60% with magnifying glass zoom */}
      <div className="relative h-48 overflow-hidden sm:h-56">
        <div
          className="h-full w-full transition-transform duration-500 ease-out"
          style={{
            transform: imgZoom
              ? `scale(1.15) translate(${(mousePos.x - 0.5) * -12}px, ${(mousePos.y - 0.5) * -12}px)`
              : 'scale(1) translate(0, 0)',
          }}
        >
          <ProductImage product={p} className="h-full w-full" />
        </div>
        {/* Zoom magnifier indicator */}
        {imgZoom && (
          <div
            className="pointer-events-none absolute z-20 h-20 w-20 rounded-full border-2 border-gold-500/40 bg-gold-500/5"
            style={{
              left: `calc(${mousePos.x * 100}% - 40px)`,
              top: `calc(${mousePos.y * 100}% - 40px)`,
              backdropFilter: 'blur(1px)',
            }}
          />
        )}
        {/* Low stock badge */}
        {p.stock <= 300 && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-coral-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
            Low Stock
          </span>
        )}
        {/* Added to cart flash */}
        {addedAnim && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-teal-500/20 animate-fade-scale">
            <span className="text-lg font-bold text-teal-400">Added!</span>
          </div>
        )}
      </div>

      {/* Metadata area — bottom 40% glassmorphic */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {CATEGORY_LABELS[p.category] || p.category}
            </p>
            <p className="mt-0.5 line-clamp-1 font-display text-sm font-semibold text-text-primary group-hover:text-gold-400 transition-colors">
              {p.name}
            </p>
          </div>
          <SustainabilityRing score={eco} />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-gold-400">
            {formatPrice(p.price)}
          </span>
          <span className="text-xs text-text-muted">/{p.unit}</span>
        </div>

        {/* MOQ woven label tag */}
        <div className="self-start">
          <span
            className="inline-block rounded-sm border border-dashed border-void-500 bg-void-600/50 px-2 py-0.5 text-[10px] font-mono font-semibold text-text-muted"
            style={{ transform: 'rotate(-2deg)' }}
          >
            MOQ {p.moq || 100} {p.unit}s
          </span>
        </div>

        {/* Action buttons — fade in on hover with spring-like transition */}
        <div className={`mt-auto flex gap-2 transition-all duration-500 ease-out ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <button
            onClick={handleAddToCart}
            className="flex-1 rounded-xl bg-gold-500 px-3 py-2 text-xs font-bold text-void-950 transition-all duration-200 hover:bg-gold-400 active:scale-[0.97] shadow-md hover:shadow-lg"
          >
            Add to Cart
          </button>
          <Link
            to={`/products/${p.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded-xl border border-teal-500/30 px-3 py-2 text-center text-xs font-semibold text-teal-400 transition-all duration-200 hover:bg-teal-500/10 hover:border-teal-500/50 active:scale-[0.97]"
          >
            View Details
          </Link>
        </div>
      </div>
    </Link>
  );
}
