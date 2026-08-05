import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import FabricIcon from './FabricIcon.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function ProductCard({ product, onCompareToggle, compareActive }) {
  useCurrency();
  const out = product.stock <= 0;
  const eco = product.sustainability?.score;

  return (
    <div className="group relative flex flex-col overflow-hidden neo-raised rounded-3xl transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[var(--shadow-neo-hover)]">
      <Link to={`/products/${product.slug}`} data-fabric-image className="relative block aspect-[4/3] overflow-hidden rounded-t-3xl">
        <ProductImage product={product} alt={product.name} className="transition duration-500 group-hover:scale-105" />
        {out && (
          <span className="absolute inset-0 flex items-center justify-center bg-void-950/70 text-sm font-semibold uppercase tracking-wide text-text-primary backdrop-blur-sm">
            Out of stock
          </span>
        )}
        {product.featured && !out && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-void-950 shadow-lg">
            Featured
          </span>
        )}
        {eco > 0 && (
          <span className="absolute left-3 bottom-3 rounded-full bg-teal-500/90 px-2.5 py-1 text-[11px] font-bold text-void-950 shadow-lg backdrop-blur-sm" title="Eco score">
            🌿 {eco}
          </span>
        )}
        {compareActive && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-void-950 shadow-lg">
            ✓
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          <span>{CATEGORY_LABELS[product.category] || product.category}</span>
          {product.fabricType && <span className="text-void-600">•</span>}
          {product.fabricType && (
            <span className="inline-flex items-center gap-1 text-text-secondary">
              <FabricIcon fabricType={product.fabricType} className="h-3 w-3" />
              {product.fabricType}
            </span>
          )}
        </div>
        <Link to={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-text-primary transition-colors duration-300 hover:text-gold-400">
          {product.name}
        </Link>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-lg font-bold text-gold-400">{formatPrice(product.price)}</span>
            <span className="text-xs text-text-muted">/{product.unit}</span>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${product.stock <= 300 ? 'text-coral-400' : 'text-teal-400'}`}>
              {product.stock > 0 ? `${product.stock.toLocaleString()} ${product.unit}s` : '—'}
            </p>
            <p className="font-mono text-[11px] text-text-muted">MOQ {product.moq || 100}</p>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <Link to={`/products/${product.slug}`}
            className="neo-raised-gold flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,168,83,0.15)]">
            View
          </Link>
          {onCompareToggle && (
            <button type="button" onClick={() => onCompareToggle(product)}
              className={`neo-flat rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 ${compareActive ? 'neo-pressed text-gold-400' : 'text-text-secondary hover:text-text-primary'}`}
              title="Add to compare">
              ⚖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
