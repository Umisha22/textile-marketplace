import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function ProductCard({ product, onCompareToggle, compareActive }) {
  useCurrency();
  const out = product.stock <= 0;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <ProductImage product={product} alt={product.name} className="transition duration-500 group-hover:scale-105" />
        {out && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
        {product.featured && !out && (
          <span className="absolute left-3 top-3 rounded-full bg-clay-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow">
            Featured
          </span>
        )}
        {compareActive && (
          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm text-white shadow">
            ✓
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-500">
          <span>{CATEGORY_LABELS[product.category] || product.category}</span>
          {product.fabricType && <span className="text-brand-200">•</span>}
          {product.fabricType && <span>{product.fabricType}</span>}
        </div>
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-brand-950 hover:text-brand-700"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-brand-900">{formatPrice(product.price)}</span>
            <span className="text-xs text-brand-500">/{product.unit}</span>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${product.stock <= 300 ? 'text-clay-600' : 'text-emerald-600'}`}>
              {product.stock > 0 ? `${product.stock.toLocaleString()} ${product.unit}s` : '—'}
            </p>
            <p className="text-[11px] text-brand-400">MOQ {product.moq || 100}</p>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="flex-1 rounded-lg bg-brand-800 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            View
          </Link>
          {onCompareToggle && (
            <button
              type="button"
              onClick={() => onCompareToggle(product)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                compareActive
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 text-brand-700 hover:border-brand-400'
              }`}
              title="Add to compare"
            >
              ⚖
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
