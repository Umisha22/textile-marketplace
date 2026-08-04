import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { EmptyState } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

export default function CartPage() {
  useCurrency();
  const { items, count, subtotal, updateQty, remove, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= 10000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shipping;

  if (loading) {
    return <div className="py-24 text-center text-sm text-brand-500">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Explore the fabric library or ask Weaver AI to find the perfect fabric."
          action={
            <div className="flex gap-3">
              <Link to="/products" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">Browse fabrics</Link>
              <Link to="/assistant" className="rounded-xl border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700">Ask Weaver</Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-brand-900">Shopping cart</h1>
      <p className="mt-1 text-sm text-brand-500">{count} {count === 1 ? 'item' : 'items'} in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((it) => {
            const p = it.product;
            const productId = p._id || p.id;
            return (
              <div key={productId} className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft sm:flex-row">
                <Link to={`/products/${p.slug}`} className="block h-28 w-full shrink-0 sm:w-28">
                  <ProductImage product={p} className="aspect-[4/3] h-full w-full" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                        {CATEGORY_LABELS[p.category] || p.category}
                      </p>
                      <Link to={`/products/${p.slug}`} className="font-display text-lg font-semibold text-brand-950 hover:text-brand-700">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-brand-500">
                        {formatPrice(p.price)}/{p.unit}{it.color ? ` · ${it.color}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(productId)}
                      className="rounded-lg p-2 text-brand-400 transition hover:bg-clay-50 hover:text-clay-600"
                      title="Remove"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center overflow-hidden rounded-xl border border-brand-200 bg-cream-50">
                      <button type="button" onClick={() => updateQty(productId, it.quantity - 1)} className="px-3 py-1.5 text-brand-700 hover:bg-brand-50">−</button>
                      <span className="w-10 text-center text-sm font-semibold">{it.quantity}</span>
                      <button type="button" onClick={() => updateQty(productId, it.quantity + 1)} className="px-3 py-1.5 text-brand-700 hover:bg-brand-50">+</button>
                    </div>
                    <p className="text-lg font-bold text-brand-900">{formatPrice(p.price * it.quantity)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
          <h2 className="font-display text-xl font-bold text-brand-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-brand-600"><span>Tax (18%)</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between text-brand-600"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between border-t border-brand-100 pt-3 text-base font-bold text-brand-900">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          {!user && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Log in as a buyer to place this order.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate(user?.role === 'buyer' ? '/checkout' : '/login')}
            className="mt-5 w-full rounded-xl bg-clay-500 py-3 text-sm font-bold text-white transition hover:bg-clay-600"
          >
            {user?.role === 'buyer' ? 'Proceed to checkout' : 'Log in to checkout'}
          </button>
          <Link to="/products" className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
